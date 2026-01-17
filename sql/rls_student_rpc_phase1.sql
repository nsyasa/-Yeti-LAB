-- ============================================================================
-- Yeti LAB - Student RPC Security Layer (Phase 1) - HARDENED v2
-- ============================================================================
-- Purpose: Replace direct table access for session_token-based students
--          with SECURITY DEFINER RPC functions
-- Date: 2026-01-17 (Hardened v2: 2026-01-17)
-- Security Model: Model B (session_token, no Supabase Auth for students)
-- ============================================================================

-- ============================================================================
-- SECTION 0: ENSURE RLS IS ENABLED + REVOKE DIRECT TABLE ACCESS
-- ============================================================================

-- Enable RLS on target tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Revoke ALL direct table access from anon role
-- Session-token students MUST use RPC functions only
REVOKE ALL ON TABLE public.students FROM anon;
REVOKE ALL ON TABLE public.submissions FROM anon;
REVOKE ALL ON TABLE public.student_progress FROM anon;

-- ============================================================================
-- SECTION 1: HELPER FUNCTIONS
-- ============================================================================

-- 1.1 Session Token Validation (Internal Helper)
-- Returns student record if token is valid, NULL otherwise
-- HARDENED: Token format guard + update by student_id
CREATE OR REPLACE FUNCTION internal_validate_student_session(p_session_token TEXT)
RETURNS TABLE (
    student_id UUID,
    classroom_id UUID,
    display_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- GUARD: Validate token format (64 hex characters)
    IF p_session_token IS NULL 
       OR p_session_token !~ '^[0-9a-f]{64}$' THEN
        RETURN;  -- Return empty, no exception (silent fail for invalid format)
    END IF;

    -- Validate session token exists and return student info
    RETURN QUERY
    SELECT 
        s.id,
        s.classroom_id,
        s.display_name::TEXT
    FROM students s
    WHERE s.session_token = p_session_token
      AND s.classroom_id IS NOT NULL;  -- Only classroom-based students
    
    -- Get student_id for update (avoid second lookup in UPDATE)
    SELECT s.id INTO v_student_id
    FROM students s
    WHERE s.session_token = p_session_token
      AND s.classroom_id IS NOT NULL;
    
    -- Update last_active_at by student_id (more efficient)
    IF v_student_id IS NOT NULL THEN
        UPDATE students 
        SET last_active_at = now() 
        WHERE id = v_student_id;
    END IF;
END;
$$;

-- HARDENED: Explicit permission model for internal function
REVOKE ALL ON FUNCTION internal_validate_student_session(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION internal_validate_student_session(TEXT) FROM anon;
REVOKE ALL ON FUNCTION internal_validate_student_session(TEXT) FROM authenticated;
-- No grants - only callable from other SECURITY DEFINER functions

-- ============================================================================
-- SECTION 2: PUBLIC RPC FUNCTIONS FOR STUDENTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 student_get_profile(session_token)
-- Returns student's own profile information
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_get_profile(p_session_token TEXT)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    avatar_emoji TEXT,
    classroom_id UUID,
    classroom_name TEXT,
    teacher_name TEXT,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Validate session
    SELECT vs.student_id INTO v_student_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Return profile with classroom info
    RETURN QUERY
    SELECT 
        s.id,
        s.display_name::TEXT,
        s.avatar_emoji::TEXT,
        s.classroom_id,
        c.name::TEXT AS classroom_name,
        up.full_name::TEXT AS teacher_name,
        s.last_active_at,
        s.created_at
    FROM students s
    LEFT JOIN classrooms c ON s.classroom_id = c.id
    LEFT JOIN user_profiles up ON c.teacher_id = up.id
    WHERE s.id = v_student_id;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_get_profile(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_get_profile(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION student_get_profile(TEXT) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2.2 student_get_classroom(session_token)
-- Returns classroom information (public fields only)
-- HARDENED: Removed classroom code from return
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_get_classroom(p_session_token TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    teacher_name TEXT,
    is_active BOOLEAN,
    student_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_classroom_id UUID;
BEGIN
    -- Validate session
    SELECT vs.student_id, vs.classroom_id 
    INTO v_student_id, v_classroom_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Return classroom info (NO CODE - security)
    RETURN QUERY
    SELECT 
        c.id,
        c.name::TEXT,
        c.description::TEXT,
        up.full_name::TEXT AS teacher_name,
        c.is_active,
        (SELECT COUNT(*) FROM students WHERE classroom_id = c.id)::BIGINT AS student_count
    FROM classrooms c
    LEFT JOIN user_profiles up ON c.teacher_id = up.id
    WHERE c.id = v_classroom_id;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_get_classroom(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_get_classroom(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION student_get_classroom(TEXT) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2.3 student_list_assignments(session_token)
-- Returns assignments for student's classroom
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_list_assignments(p_session_token TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    due_date TIMESTAMPTZ,
    max_score INTEGER,
    late_submission_allowed BOOLEAN,
    course_id UUID,
    course_title TEXT,
    created_at TIMESTAMPTZ,
    my_submission_id UUID,
    my_submission_status TEXT,
    my_submission_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_classroom_id UUID;
BEGIN
    -- Validate session
    SELECT vs.student_id, vs.classroom_id 
    INTO v_student_id, v_classroom_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Return assignments for this classroom with student's submission status
    RETURN QUERY
    SELECT 
        a.id,
        a.title::TEXT,
        a.description::TEXT,
        a.status::TEXT,
        a.due_date,
        a.max_score,
        a.late_submission_allowed,
        a.course_id,
        co.title::TEXT AS course_title,
        a.created_at,
        sub.id AS my_submission_id,
        sub.status::TEXT AS my_submission_status,
        sub.score AS my_submission_score
    FROM assignments a
    LEFT JOIN courses co ON a.course_id = co.id
    LEFT JOIN submissions sub ON sub.assignment_id = a.id AND sub.student_id = v_student_id
    WHERE a.classroom_id = v_classroom_id
      AND a.status IN ('published', 'closed')  -- Only visible assignments (published, not draft)
    ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_list_assignments(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_list_assignments(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION student_list_assignments(TEXT) TO authenticated;


-- ----------------------------------------------------------------------------
-- 2.4 student_list_submissions(session_token)
-- Returns student's own submissions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_list_submissions(p_session_token TEXT)
RETURNS TABLE (
    id UUID,
    assignment_id UUID,
    assignment_title TEXT,
    status TEXT,
    content TEXT,
    score INTEGER,
    feedback TEXT,
    attempt_number INTEGER,
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Validate session
    SELECT vs.student_id INTO v_student_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Return student's submissions
    RETURN QUERY
    SELECT 
        s.id,
        s.assignment_id,
        a.title::TEXT AS assignment_title,
        s.status::TEXT,
        s.content::TEXT,
        s.score,
        s.feedback::TEXT,
        s.attempt_number,
        s.submitted_at,
        s.graded_at,
        s.created_at
    FROM submissions s
    LEFT JOIN assignments a ON s.assignment_id = a.id
    WHERE s.student_id = v_student_id
    ORDER BY s.created_at DESC;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_list_submissions(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_list_submissions(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION student_list_submissions(TEXT) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2.5 student_upsert_submission(session_token, assignment_id, content, status)
-- Creates or updates a submission for the student
-- Status can be: 'draft' or 'submitted'
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_upsert_submission(
    p_session_token TEXT,
    p_assignment_id UUID,
    p_content TEXT DEFAULT '',
    p_status TEXT DEFAULT 'draft'
)
RETURNS TABLE (
    id UUID,
    assignment_id UUID,
    status TEXT,
    attempt_number INTEGER,
    submitted_at TIMESTAMPTZ,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_classroom_id UUID;
    v_assignment_classroom_id UUID;
    v_assignment_status TEXT;
    v_existing_submission_id UUID;
    v_existing_status TEXT;
    v_attempt_number INTEGER;
    v_result_id UUID;
    v_result_status TEXT;
    v_result_attempt INTEGER;
    v_result_submitted_at TIMESTAMPTZ;
    v_message TEXT;
BEGIN
    -- 1. Validate session
    SELECT vs.student_id, vs.classroom_id 
    INTO v_student_id, v_classroom_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- 2. Validate status parameter
    IF p_status NOT IN ('draft', 'submitted') THEN
        RAISE EXCEPTION 'Invalid status. Must be "draft" or "submitted"';
    END IF;
    
    -- 3. Validate assignment exists and belongs to student's classroom
    SELECT a.classroom_id, a.status
    INTO v_assignment_classroom_id, v_assignment_status
    FROM assignments a
    WHERE a.id = p_assignment_id;
    
    IF v_assignment_classroom_id IS NULL THEN
        RAISE EXCEPTION 'Assignment not found';
    END IF;
    
    IF v_assignment_classroom_id != v_classroom_id THEN
        RAISE EXCEPTION 'Assignment does not belong to your classroom';
    END IF;
    
    IF v_assignment_status NOT IN ('active', 'closed') THEN
        RAISE EXCEPTION 'Assignment is not available for submission';
    END IF;
    
    -- 4. Check existing submission
    SELECT s.id, s.status, s.attempt_number
    INTO v_existing_submission_id, v_existing_status, v_attempt_number
    FROM submissions s
    WHERE s.assignment_id = p_assignment_id 
      AND s.student_id = v_student_id
    ORDER BY s.attempt_number DESC
    LIMIT 1;
    
    -- 5. Handle submission logic
    IF v_existing_submission_id IS NOT NULL THEN
        -- Existing submission found
        IF v_existing_status IN ('graded', 'submitted') AND p_status = 'submitted' THEN
            -- Already submitted/graded, cannot resubmit (unless revision requested)
            IF v_existing_status != 'revision_requested' THEN
                RAISE EXCEPTION 'Cannot modify a submitted or graded assignment';
            END IF;
        END IF;
        
        IF v_existing_status = 'draft' THEN
            -- Update existing draft
            UPDATE submissions
            SET 
                content = p_content,
                status = p_status,
                submitted_at = CASE WHEN p_status = 'submitted' THEN now() ELSE submitted_at END,
                updated_at = now()
            WHERE id = v_existing_submission_id
            RETURNING submissions.id, submissions.status::TEXT, submissions.attempt_number, submissions.submitted_at
            INTO v_result_id, v_result_status, v_result_attempt, v_result_submitted_at;
            
            v_message := 'Draft updated successfully';
            IF p_status = 'submitted' THEN
                v_message := 'Assignment submitted successfully';
            END IF;
        ELSIF v_existing_status = 'revision_requested' THEN
            -- Create new attempt for revision
            INSERT INTO submissions (
                assignment_id, student_id, content, status, attempt_number, submitted_at
            ) VALUES (
                p_assignment_id, 
                v_student_id, 
                p_content, 
                p_status,
                COALESCE(v_attempt_number, 0) + 1,
                CASE WHEN p_status = 'submitted' THEN now() ELSE NULL END
            )
            RETURNING submissions.id, submissions.status::TEXT, submissions.attempt_number, submissions.submitted_at
            INTO v_result_id, v_result_status, v_result_attempt, v_result_submitted_at;
            
            v_message := 'Revision submission created';
        ELSE
            -- Cannot modify non-draft submission
            RAISE EXCEPTION 'Cannot modify submission with status: %', v_existing_status;
        END IF;
    ELSE
        -- No existing submission, create new
        INSERT INTO submissions (
            assignment_id, student_id, content, status, attempt_number, submitted_at
        ) VALUES (
            p_assignment_id, 
            v_student_id, 
            p_content, 
            p_status,
            1,
            CASE WHEN p_status = 'submitted' THEN now() ELSE NULL END
        )
        RETURNING submissions.id, submissions.status::TEXT, submissions.attempt_number, submissions.submitted_at
        INTO v_result_id, v_result_status, v_result_attempt, v_result_submitted_at;
        
        v_message := 'New submission created';
        IF p_status = 'submitted' THEN
            v_message := 'Assignment submitted successfully';
        END IF;
    END IF;
    
    -- Return result
    RETURN QUERY SELECT 
        v_result_id,
        p_assignment_id,
        v_result_status,
        v_result_attempt,
        v_result_submitted_at,
        v_message;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_upsert_submission(TEXT, UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_upsert_submission(TEXT, UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION student_upsert_submission(TEXT, UUID, TEXT, TEXT) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2.6 student_get_progress(session_token)
-- Returns student's course progress
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_get_progress(p_session_token TEXT)
RETURNS TABLE (
    id UUID,
    course_id TEXT,
    project_id TEXT,
    completed_at TIMESTAMPTZ,
    quiz_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Validate session
    SELECT vs.student_id INTO v_student_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Return progress
    RETURN QUERY
    SELECT 
        sp.id,
        sp.course_id::TEXT,
        sp.project_id::TEXT,
        sp.completed_at,
        sp.quiz_score
    FROM student_progress sp
    WHERE sp.student_id = v_student_id
    ORDER BY sp.completed_at DESC;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_get_progress(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_get_progress(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION student_get_progress(TEXT) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2.7 student_upsert_progress(session_token, course_id, project_id, quiz_score)
-- Creates or updates progress for a project
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_upsert_progress(
    p_session_token TEXT,
    p_course_id TEXT,
    p_project_id TEXT,
    p_quiz_score INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    course_id TEXT,
    project_id TEXT,
    completed_at TIMESTAMPTZ,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_result_id UUID;
    v_result_completed_at TIMESTAMPTZ;
    v_message TEXT;
BEGIN
    -- Validate session
    SELECT vs.student_id INTO v_student_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Upsert progress
    INSERT INTO student_progress (student_id, course_id, project_id, completed_at, quiz_score)
    VALUES (v_student_id, p_course_id, p_project_id, now(), p_quiz_score)
    ON CONFLICT (student_id, project_id) 
    DO UPDATE SET 
        quiz_score = COALESCE(EXCLUDED.quiz_score, student_progress.quiz_score),
        completed_at = COALESCE(student_progress.completed_at, now())
    RETURNING student_progress.id, student_progress.completed_at
    INTO v_result_id, v_result_completed_at;
    
    v_message := 'Progress saved successfully';
    
    RETURN QUERY SELECT 
        v_result_id,
        p_course_id,
        p_project_id,
        v_result_completed_at,
        v_message;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_upsert_progress(TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_upsert_progress(TEXT, TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION student_upsert_progress(TEXT, TEXT, TEXT, INTEGER) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2.8 student_delete_progress(session_token, project_id)
-- Deletes progress for a specific project
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION student_delete_progress(
    p_session_token TEXT,
    p_project_id TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_deleted_count INTEGER;
BEGIN
    -- Validate session
    SELECT vs.student_id INTO v_student_id
    FROM internal_validate_student_session(p_session_token) vs;
    
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;
    
    -- Delete progress
    DELETE FROM student_progress
    WHERE student_id = v_student_id AND project_id = p_project_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    IF v_deleted_count > 0 THEN
        RETURN QUERY SELECT true, 'Progress deleted successfully'::TEXT;
    ELSE
        RETURN QUERY SELECT false, 'No progress found to delete'::TEXT;
    END IF;
END;
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION student_delete_progress(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION student_delete_progress(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION student_delete_progress(TEXT, TEXT) TO authenticated;

-- ============================================================================
-- SECTION 3: HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- 3.1 Helper function: Check if current user is a teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    );
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION is_teacher() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_teacher() TO authenticated;

-- 3.2 Helper function: Check if teacher owns classroom
CREATE OR REPLACE FUNCTION owns_classroom(p_classroom_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM classrooms 
        WHERE id = p_classroom_id AND teacher_id = auth.uid()
    );
$$;

-- HARDENED: Explicit permission model
REVOKE ALL ON FUNCTION owns_classroom(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION owns_classroom(UUID) TO authenticated;

-- ============================================================================
-- SECTION 4: RLS POLICIES FOR STUDENT TABLES (Block Direct Access)
-- ============================================================================

-- 4.1 STUDENTS TABLE RLS
-- Drop existing permissive policies that allow broad access
DROP POLICY IF EXISTS "Anyone can create student with classroom code" ON students;
DROP POLICY IF EXISTS "Students can update own profile" ON students;
DROP POLICY IF EXISTS "OAuth students can view own profile" ON students;
DROP POLICY IF EXISTS "Teachers can view classroom students" ON students;

-- Teachers can view their classroom students
DROP POLICY IF EXISTS "teachers_view_own_students" ON students;
CREATE POLICY "teachers_view_own_students" ON students
FOR SELECT TO authenticated
USING (
    classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
    OR user_id = auth.uid()  -- OAuth students can see themselves
);

-- Teachers can insert students to their classrooms
DROP POLICY IF EXISTS "teachers_insert_own_students" ON students;
CREATE POLICY "teachers_insert_own_students" ON students
FOR INSERT TO authenticated
WITH CHECK (
    classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
);

-- Teachers can update students in their classrooms
DROP POLICY IF EXISTS "teachers_update_own_students" ON students;
CREATE POLICY "teachers_update_own_students" ON students
FOR UPDATE TO authenticated
USING (
    classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
    OR user_id = auth.uid()  -- OAuth students can update themselves
);

-- Teachers can delete students from their classrooms
DROP POLICY IF EXISTS "teachers_delete_own_students" ON students;
CREATE POLICY "teachers_delete_own_students" ON students
FOR DELETE TO authenticated
USING (
    classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
);

-- 4.2 SUBMISSIONS TABLE RLS
DROP POLICY IF EXISTS "Students can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can insert own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can update draft submissions" ON submissions;

-- Teachers can view submissions for their assignments
DROP POLICY IF EXISTS "teachers_view_submissions" ON submissions;
CREATE POLICY "teachers_view_submissions" ON submissions
FOR SELECT TO authenticated
USING (
    assignment_id IN (
        SELECT id FROM assignments WHERE created_by = auth.uid()
    )
    OR student_id = auth.uid()  -- OAuth students
    OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

-- Teachers can update (grade) submissions for their assignments
DROP POLICY IF EXISTS "teachers_update_submissions" ON submissions;
CREATE POLICY "teachers_update_submissions" ON submissions
FOR UPDATE TO authenticated
USING (
    assignment_id IN (
        SELECT id FROM assignments WHERE created_by = auth.uid()
    )
);

-- OAuth students can manage their own submissions
DROP POLICY IF EXISTS "oauth_students_manage_submissions" ON submissions;
CREATE POLICY "oauth_students_manage_submissions" ON submissions
FOR ALL TO authenticated
USING (
    student_id = auth.uid() 
    OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
)
WITH CHECK (
    student_id = auth.uid()
    OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

-- 4.3 STUDENT_PROGRESS TABLE RLS
DROP POLICY IF EXISTS "Students can insert own progress" ON student_progress;
DROP POLICY IF EXISTS "progress_insert" ON student_progress;
DROP POLICY IF EXISTS "progress_update" ON student_progress;
DROP POLICY IF EXISTS "progress_delete" ON student_progress;

-- Teachers view classroom progress (keep existing if any)
DROP POLICY IF EXISTS "Teachers can view classroom progress" ON student_progress;
CREATE POLICY "teachers_view_classroom_progress" ON student_progress
FOR SELECT TO authenticated
USING (
    student_id IN (
        SELECT s.id FROM students s
        JOIN classrooms c ON s.classroom_id = c.id
        WHERE c.teacher_id = auth.uid()
    )
);

-- OAuth students manage their own progress
DROP POLICY IF EXISTS "oauth_students_manage_progress" ON student_progress;
CREATE POLICY "oauth_students_manage_progress" ON student_progress
FOR ALL TO authenticated
USING (
    student_id = auth.uid()
    OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
)
WITH CHECK (
    student_id = auth.uid()
    OR student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

-- ============================================================================
-- SECTION 5: VERIFICATION QUERIES
-- ============================================================================

-- 5.1 Verify anon CANNOT directly access tables (should return 0 rows or error)
/*
-- Run as anon role (e.g., via Supabase client without auth):
SET ROLE anon;
SELECT * FROM students LIMIT 1;  -- Expected: permission denied OR 0 rows
SELECT * FROM submissions LIMIT 1;  -- Expected: permission denied OR 0 rows
SELECT * FROM student_progress LIMIT 1;  -- Expected: permission denied OR 0 rows
RESET ROLE;
*/

-- 5.2 Verify table privileges for anon (should show NO privileges)
/*
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('students', 'submissions', 'student_progress')
  AND grantee = 'anon';
-- Expected: 0 rows (no privileges)
*/

-- 5.3 Check RLS is enabled on tables
/*
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('students', 'submissions', 'student_progress')
ORDER BY tablename;
-- Expected: rowsecurity = true for all
*/

-- 5.4 Check function execute privileges
/*
SELECT 
    p.proname AS function_name,
    CASE WHEN has_function_privilege('public', p.oid, 'execute') THEN 'YES' ELSE 'NO' END AS public_execute,
    CASE WHEN has_function_privilege('anon', p.oid, 'execute') THEN 'YES' ELSE 'NO' END AS anon_execute,
    CASE WHEN has_function_privilege('authenticated', p.oid, 'execute') THEN 'YES' ELSE 'NO' END AS auth_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND (p.proname LIKE 'student_%' 
       OR p.proname = 'internal_validate_student_session'
       OR p.proname IN ('is_teacher', 'owns_classroom'))
ORDER BY p.proname;

-- Expected results:
-- ┌─────────────────────────────────────┬────────────────┬──────────────┬──────────────┐
-- │ function_name                       │ public_execute │ anon_execute │ auth_execute │
-- ├─────────────────────────────────────┼────────────────┼──────────────┼──────────────┤
-- │ internal_validate_student_session   │ NO             │ NO           │ NO           │
-- │ is_teacher                          │ NO             │ NO           │ YES          │
-- │ owns_classroom                      │ NO             │ NO           │ YES          │
-- │ student_delete_progress             │ NO             │ YES          │ YES          │
-- │ student_get_classroom               │ NO             │ YES          │ YES          │
-- │ student_get_profile                 │ NO             │ YES          │ YES          │
-- │ student_get_progress                │ NO             │ YES          │ YES          │
-- │ student_list_assignments            │ NO             │ YES          │ YES          │
-- │ student_list_submissions            │ NO             │ YES          │ YES          │
-- │ student_upsert_progress             │ NO             │ YES          │ YES          │
-- │ student_upsert_submission           │ NO             │ YES          │ YES          │
-- └─────────────────────────────────────┴────────────────┴──────────────┴──────────────┘
*/

-- 5.5 Check RLS policies exist
/*
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('students', 'submissions', 'student_progress')
ORDER BY tablename, policyname;
*/

-- ============================================================================
-- SECTION 6: SECURITY SCENARIO CHECKLIST (IDOR Prevention)
-- ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│ IDOR SECURITY CHECKLIST                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Student A cannot view Student B's profile                                │
│    - Test: Call student_get_profile with Student A's token                  │
│    - Verify: Returns ONLY Student A's data                                  │
│    - Mitigation: internal_validate_student_session scopes to token owner    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Student A cannot submit to another classroom's assignment                │
│    - Test: Call student_upsert_submission with assignment from Class B      │
│    - Verify: Exception "Assignment does not belong to your classroom"       │
│    - Mitigation: v_assignment_classroom_id != v_classroom_id check          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. Anon cannot directly query student tables                                │
│    - Test: Direct table query .from('students').select() as anon            │
│    - Verify: permission denied (REVOKE ALL FROM anon)                       │
│    - Mitigation: REVOKE ALL ON TABLE ... FROM anon + RLS enabled            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. Forged/malformed session token is rejected                               │
│    - Test: Call any RPC with 'abc123' or SQL injection attempt              │
│    - Verify: Exception "Invalid or expired session token"                   │
│    - Mitigation: Token format guard (^[0-9a-f]{64}$) + DB lookup            │
└─────────────────────────────────────────────────────────────────────────────┘
*/

-- ============================================================================
-- SECTION 7: EXAMPLE API CALLS (for frontend reference)
-- ============================================================================

/*
-- Get student profile
const { data, error } = await supabase.rpc('student_get_profile', {
    p_session_token: Auth.currentStudent.sessionToken
});

-- Get classroom info (NO CODE returned)
const { data, error } = await supabase.rpc('student_get_classroom', {
    p_session_token: Auth.currentStudent.sessionToken
});

-- List assignments
const { data, error } = await supabase.rpc('student_list_assignments', {
    p_session_token: Auth.currentStudent.sessionToken
});

-- List submissions
const { data, error } = await supabase.rpc('student_list_submissions', {
    p_session_token: Auth.currentStudent.sessionToken
});

-- Submit assignment (draft)
const { data, error } = await supabase.rpc('student_upsert_submission', {
    p_session_token: Auth.currentStudent.sessionToken,
    p_assignment_id: 'uuid-here',
    p_content: 'My submission content...',
    p_status: 'draft'
});

-- Submit assignment (final)
const { data, error } = await supabase.rpc('student_upsert_submission', {
    p_session_token: Auth.currentStudent.sessionToken,
    p_assignment_id: 'uuid-here',
    p_content: 'My final submission...',
    p_status: 'submitted'
});

-- Get progress
const { data, error } = await supabase.rpc('student_get_progress', {
    p_session_token: Auth.currentStudent.sessionToken
});

-- Save progress
const { data, error } = await supabase.rpc('student_upsert_progress', {
    p_session_token: Auth.currentStudent.sessionToken,
    p_course_id: 'arduino',
    p_project_id: 'project-1',
    p_quiz_score: 85
});

-- Delete progress
const { data, error } = await supabase.rpc('student_delete_progress', {
    p_session_token: Auth.currentStudent.sessionToken,
    p_project_id: 'project-1'
});
*/

-- ============================================================================
-- SECTION 8: ROLLBACK SCRIPT
-- ============================================================================

/*
-- To rollback this migration, run:

-- Restore table privileges for anon (if needed)
-- GRANT SELECT ON TABLE public.students TO anon;
-- GRANT SELECT ON TABLE public.submissions TO anon;
-- GRANT SELECT ON TABLE public.student_progress TO anon;

-- Drop RPC functions
DROP FUNCTION IF EXISTS student_get_profile(TEXT);
DROP FUNCTION IF EXISTS student_get_classroom(TEXT);
DROP FUNCTION IF EXISTS student_list_assignments(TEXT);
DROP FUNCTION IF EXISTS student_list_submissions(TEXT);
DROP FUNCTION IF EXISTS student_upsert_submission(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS student_get_progress(TEXT);
DROP FUNCTION IF EXISTS student_upsert_progress(TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS student_delete_progress(TEXT, TEXT);
DROP FUNCTION IF EXISTS internal_validate_student_session(TEXT);
DROP FUNCTION IF EXISTS is_teacher();
DROP FUNCTION IF EXISTS owns_classroom(UUID);

-- Drop new policies
DROP POLICY IF EXISTS "teachers_view_own_students" ON students;
DROP POLICY IF EXISTS "teachers_insert_own_students" ON students;
DROP POLICY IF EXISTS "teachers_update_own_students" ON students;
DROP POLICY IF EXISTS "teachers_delete_own_students" ON students;
DROP POLICY IF EXISTS "teachers_view_submissions" ON submissions;
DROP POLICY IF EXISTS "teachers_update_submissions" ON submissions;
DROP POLICY IF EXISTS "oauth_students_manage_submissions" ON submissions;
DROP POLICY IF EXISTS "teachers_view_classroom_progress" ON student_progress;
DROP POLICY IF EXISTS "oauth_students_manage_progress" ON student_progress;

-- Restore old permissive policies (from user-schema.sql)
-- (Re-run relevant parts of scripts/user-schema.sql if needed)
*/

-- ============================================================================
-- END OF MIGRATION (HARDENED v2)
-- ============================================================================
