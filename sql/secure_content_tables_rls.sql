-- ============================================================================
-- Supabase RLS Security Patch - Content Tables (PRODUCTION)
-- ============================================================================
-- Purpose: Extend RLS security to phases, projects, course_components
-- Date: 2026-01-16
-- Security Level: HARDENED (uses existing is_content_admin() function)
-- ============================================================================

-- NOTE: is_content_admin() function already exists from courses patch
-- If not, uncomment and run the following:

/*
CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.content_admins
    WHERE user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_content_admin() TO authenticated;
*/

-- ============================================================================
-- PHASES TABLE
-- ============================================================================

-- Drop old policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.phases;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.phases;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.phases;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.phases;
DROP POLICY IF EXISTS "phases_select_public" ON public.phases;
DROP POLICY IF EXISTS "phases_insert_admin" ON public.phases;
DROP POLICY IF EXISTS "phases_update_admin" ON public.phases;
DROP POLICY IF EXISTS "phases_delete_admin" ON public.phases;

-- Enable RLS
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;

-- SELECT: Public read (anyone can view phases)
CREATE POLICY "phases_select_public"
ON public.phases
FOR SELECT
USING (true);

-- INSERT: Content admins only
CREATE POLICY "phases_insert_admin"
ON public.phases
FOR INSERT
TO authenticated
WITH CHECK (public.is_content_admin());

-- UPDATE: Content admins only
CREATE POLICY "phases_update_admin"
ON public.phases
FOR UPDATE
TO authenticated
USING (public.is_content_admin());

-- DELETE: Content admins only
CREATE POLICY "phases_delete_admin"
ON public.phases
FOR DELETE
TO authenticated
USING (public.is_content_admin());

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

-- Drop old policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.projects;
DROP POLICY IF EXISTS "projects_select_public" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_admin" ON public.projects;
DROP POLICY IF EXISTS "projects_update_admin" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_admin" ON public.projects;

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Public read (anyone can view projects)
CREATE POLICY "projects_select_public"
ON public.projects
FOR SELECT
USING (true);

-- INSERT: Content admins only
CREATE POLICY "projects_insert_admin"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (public.is_content_admin());

-- UPDATE: Content admins only
CREATE POLICY "projects_update_admin"
ON public.projects
FOR UPDATE
TO authenticated
USING (public.is_content_admin());

-- DELETE: Content admins only
CREATE POLICY "projects_delete_admin"
ON public.projects
FOR DELETE
TO authenticated
USING (public.is_content_admin());

-- ============================================================================
-- COURSE_COMPONENTS TABLE
-- ============================================================================

-- Drop old policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.course_components;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.course_components;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.course_components;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.course_components;
DROP POLICY IF EXISTS "components_select_authenticated" ON public.course_components;
DROP POLICY IF EXISTS "components_insert_admin" ON public.course_components;
DROP POLICY IF EXISTS "components_update_admin" ON public.course_components;
DROP POLICY IF EXISTS "components_delete_admin" ON public.course_components;

-- Enable RLS
ALTER TABLE public.course_components ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users only (components contain sensitive data)
CREATE POLICY "components_select_authenticated"
ON public.course_components
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Content admins only
CREATE POLICY "components_insert_admin"
ON public.course_components
FOR INSERT
TO authenticated
WITH CHECK (public.is_content_admin());

-- UPDATE: Content admins only
CREATE POLICY "components_update_admin"
ON public.course_components
FOR UPDATE
TO authenticated
USING (public.is_content_admin());

-- DELETE: Content admins only
CREATE POLICY "components_delete_admin"
ON public.course_components
FOR DELETE
TO authenticated
USING (public.is_content_admin());

-- ============================================================================
-- Verification Query (run after patch)
-- ============================================================================

-- Check all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('phases', 'projects', 'course_components')
ORDER BY tablename, policyname;

-- Expected output:
-- PHASES:
--   phases_delete_admin  | DELETE | {authenticated} | is_content_admin()
--   phases_insert_admin  | INSERT | {authenticated} | is_content_admin()
--   phases_select_public | SELECT | {public}        | true
--   phases_update_admin  | UPDATE | {authenticated} | is_content_admin()
--
-- PROJECTS:
--   projects_delete_admin  | DELETE | {authenticated} | is_content_admin()
--   projects_insert_admin  | INSERT | {authenticated} | is_content_admin()
--   projects_select_public | SELECT | {public}        | true
--   projects_update_admin  | UPDATE | {authenticated} | is_content_admin()
--
-- COURSE_COMPONENTS:
--   components_delete_admin          | DELETE | {authenticated} | is_content_admin()
--   components_insert_admin          | INSERT | {authenticated} | is_content_admin()
--   components_select_authenticated  | SELECT | {authenticated} | true
--   components_update_admin          | UPDATE | {authenticated} | is_content_admin()

-- ============================================================================
-- End of patch
-- ============================================================================
