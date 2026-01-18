-- ============================================
-- RLS Student Storage Phase - SQL Migration
-- Secure file operations for session-token students
-- ============================================

-- ============================================
-- 1. REVOKE DIRECT ACCESS TO submission_files FROM anon
-- ============================================

-- Block anon direct access (session-token students must use RPCs)
REVOKE ALL ON TABLE public.submission_files FROM anon;

-- Ensure authenticated users (OAuth/teachers) can still access
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.submission_files TO authenticated;

-- ============================================
-- 2. RPC: List submission files for session-token student
-- ============================================

DROP FUNCTION IF EXISTS public.student_list_submission_files(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.student_list_submission_files(
    p_session_token TEXT,
    p_submission_id UUID
)
RETURNS TABLE (
    id UUID,
    submission_id UUID,
    file_name TEXT,
    file_path TEXT,
    file_url TEXT,
    file_size BIGINT,
    file_type TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_classroom_id UUID;
    v_submission_student_id UUID;
BEGIN
    -- Validate session token format (64 hex chars)
    IF p_session_token IS NULL OR p_session_token !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid session token format';
    END IF;

    -- Get student from session token
    SELECT s.id, s.classroom_id INTO v_student_id, v_classroom_id
    FROM public.students s
    WHERE s.session_token = p_session_token
      AND s.classroom_id IS NOT NULL;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;

    -- Verify submission ownership
    SELECT sub.student_id INTO v_submission_student_id
    FROM public.submissions sub
    WHERE sub.id = p_submission_id;

    IF v_submission_student_id IS NULL THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;

    IF v_submission_student_id <> v_student_id THEN
        RAISE EXCEPTION 'Access denied: You do not own this submission';
    END IF;

    -- Return files for this submission
    RETURN QUERY
    SELECT 
        sf.id,
        sf.submission_id,
        sf.file_name::TEXT,
        sf.file_path::TEXT,
        sf.file_url::TEXT,
        sf.file_size,
        sf.file_type::TEXT,
        sf.created_at
    FROM public.submission_files sf
    WHERE sf.submission_id = p_submission_id
    ORDER BY sf.created_at DESC;
END;
$$;

-- ============================================
-- 3. RPC: Add submission file record for session-token student
-- ============================================

DROP FUNCTION IF EXISTS public.student_add_submission_file(TEXT, UUID, TEXT, TEXT, TEXT, BIGINT, TEXT);

CREATE OR REPLACE FUNCTION public.student_add_submission_file(
    p_session_token TEXT,
    p_submission_id UUID,
    p_file_name TEXT,
    p_file_path TEXT,
    p_file_url TEXT,
    p_file_size BIGINT,
    p_file_type TEXT
)
RETURNS TABLE (
    id UUID,
    submission_id UUID,
    file_name TEXT,
    file_path TEXT,
    file_url TEXT,
    file_size BIGINT,
    file_type TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_classroom_id UUID;
    v_submission_student_id UUID;
    v_new_file_id UUID;
BEGIN
    -- Validate session token format (64 hex chars)
    IF p_session_token IS NULL OR p_session_token !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid session token format';
    END IF;

    -- Validate required fields
    IF p_file_name IS NULL OR p_file_path IS NULL THEN
        RAISE EXCEPTION 'Missing required fields: file_name, file_path';
    END IF;

    -- Get student from session token
    SELECT s.id, s.classroom_id INTO v_student_id, v_classroom_id
    FROM public.students s
    WHERE s.session_token = p_session_token
      AND s.classroom_id IS NOT NULL;

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;

    -- Verify submission ownership
    SELECT sub.student_id INTO v_submission_student_id
    FROM public.submissions sub
    WHERE sub.id = p_submission_id;

    IF v_submission_student_id IS NULL THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;

    IF v_submission_student_id <> v_student_id THEN
        RAISE EXCEPTION 'Access denied: You do not own this submission';
    END IF;

    -- Insert file record
    INSERT INTO public.submission_files (
        submission_id,
        file_name,
        file_path,
        file_url,
        file_size,
        file_type
    ) VALUES (
        p_submission_id,
        p_file_name,
        p_file_path,
        p_file_url,
        p_file_size,
        p_file_type
    )
    RETURNING submission_files.id INTO v_new_file_id;

    -- Return the newly created file record
    RETURN QUERY
    SELECT 
        sf.id,
        sf.submission_id,
        sf.file_name::TEXT,
        sf.file_path::TEXT,
        sf.file_url::TEXT,
        sf.file_size,
        sf.file_type::TEXT,
        sf.created_at
    FROM public.submission_files sf
    WHERE sf.id = v_new_file_id;
END;
$$;

-- ============================================
-- 4. Permission Management
-- ============================================

-- Revoke execute from public, grant to anon and authenticated
REVOKE ALL ON FUNCTION public.student_list_submission_files(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_list_submission_files(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.student_list_submission_files(TEXT, UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.student_add_submission_file(TEXT, UUID, TEXT, TEXT, TEXT, BIGINT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_add_submission_file(TEXT, UUID, TEXT, TEXT, TEXT, BIGINT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.student_add_submission_file(TEXT, UUID, TEXT, TEXT, TEXT, BIGINT, TEXT) TO authenticated;

-- ============================================
-- 5. Verification Queries (Run after apply)
-- ============================================

/*
-- Check anon cannot select from submission_files directly
-- (Should fail with permission denied)
SET ROLE anon;
SELECT * FROM public.submission_files LIMIT 1;
RESET ROLE;

-- Check RPC functions exist and are executable
SELECT 
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('student_list_submission_files', 'student_add_submission_file');

-- Check grants
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name IN ('student_list_submission_files', 'student_add_submission_file');
*/

-- ============================================
-- Migration Complete
-- ============================================
COMMENT ON FUNCTION public.student_list_submission_files IS 'List files for a submission (session-token student only)';
COMMENT ON FUNCTION public.student_add_submission_file IS 'Add file record to submission (session-token student only)';
