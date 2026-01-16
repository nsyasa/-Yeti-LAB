-- ============================================================================
-- ROLLBACK SCRIPT - Restore Original INSECURE Policies (Content Tables)
-- ============================================================================
-- ⚠️ WARNING: This restores INSECURE policies where any authenticated user
--             can INSERT/UPDATE/DELETE. Use only in emergency.
-- ============================================================================

-- ============================================================================
-- PHASES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "phases_select_public" ON public.phases;
DROP POLICY IF EXISTS "phases_insert_admin" ON public.phases;
DROP POLICY IF EXISTS "phases_update_admin" ON public.phases;
DROP POLICY IF EXISTS "phases_delete_admin" ON public.phases;

-- Restore INSECURE policies
CREATE POLICY "Enable read access for all users" 
ON public.phases
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.phases
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" 
ON public.phases
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" 
ON public.phases
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "projects_select_public" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_admin" ON public.projects;
DROP POLICY IF EXISTS "projects_update_admin" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_admin" ON public.projects;

-- Restore INSECURE policies
CREATE POLICY "Enable read access for all users" 
ON public.projects
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.projects
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" 
ON public.projects
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" 
ON public.projects
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ============================================================================
-- COURSE_COMPONENTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "components_select_authenticated" ON public.course_components;
DROP POLICY IF EXISTS "components_insert_admin" ON public.course_components;
DROP POLICY IF EXISTS "components_update_admin" ON public.course_components;
DROP POLICY IF EXISTS "components_delete_admin" ON public.course_components;

-- Restore INSECURE policies
CREATE POLICY "Enable read access for all users" 
ON public.course_components
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.course_components
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" 
ON public.course_components
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" 
ON public.course_components
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ============================================================================
-- Verification
-- ============================================================================

SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('phases', 'projects', 'course_components')
ORDER BY tablename, policyname;

-- ============================================================================
-- ⚠️ SECURITY WARNING
-- ============================================================================
-- After rollback, ANY authenticated user can INSERT/UPDATE/DELETE.
-- This is a CRITICAL security vulnerability.
-- Re-apply secure patch as soon as issue is resolved.
-- ============================================================================
