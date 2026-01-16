-- ============================================================================
-- Supabase RLS Security - Content Admin Policies (PRODUCTION)
-- ============================================================================
-- Purpose: Secure RLS policies for all content tables
-- Date: 2026-01-16
-- Security Level: HARDENED (SECURITY DEFINER + search_path protection)
-- 
-- This script consolidates all RLS security patches:
--   - courses table
--   - phases table
--   - projects table
--   - course_components table
--
-- All write operations (INSERT/UPDATE/DELETE) restricted to content_admins only.
-- Read operations: public for courses/phases/projects, authenticated for components.
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Helper Function
-- ============================================================================

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

COMMENT ON FUNCTION public.is_content_admin() IS 
  'Returns true if current user exists in content_admins table. SECURITY DEFINER with search_path protection.';

-- ============================================================================
-- STEP 2: COURSES TABLE
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "courses_select_public" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_update_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_admin" ON public.courses;

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create secure policies
CREATE POLICY "courses_select_public" ON public.courses FOR SELECT USING (true);
CREATE POLICY "courses_insert_admin" ON public.courses FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());
CREATE POLICY "courses_update_admin" ON public.courses FOR UPDATE TO authenticated USING (public.is_content_admin());
CREATE POLICY "courses_delete_admin" ON public.courses FOR DELETE TO authenticated USING (public.is_content_admin());

-- ============================================================================
-- STEP 3: PHASES TABLE
-- ============================================================================

-- Drop old policies
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

-- Create secure policies
CREATE POLICY "phases_select_public" ON public.phases FOR SELECT USING (true);
CREATE POLICY "phases_insert_admin" ON public.phases FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());
CREATE POLICY "phases_update_admin" ON public.phases FOR UPDATE TO authenticated USING (public.is_content_admin());
CREATE POLICY "phases_delete_admin" ON public.phases FOR DELETE TO authenticated USING (public.is_content_admin());

-- ============================================================================
-- STEP 4: PROJECTS TABLE
-- ============================================================================

-- Drop old policies
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

-- Create secure policies
CREATE POLICY "projects_select_public" ON public.projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_admin" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());
CREATE POLICY "projects_update_admin" ON public.projects FOR UPDATE TO authenticated USING (public.is_content_admin());
CREATE POLICY "projects_delete_admin" ON public.projects FOR DELETE TO authenticated USING (public.is_content_admin());

-- ============================================================================
-- STEP 5: COURSE_COMPONENTS TABLE
-- ============================================================================

-- Drop old policies
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

-- Create secure policies (authenticated-only read for sensitive data)
CREATE POLICY "components_select_authenticated" ON public.course_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "components_insert_admin" ON public.course_components FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());
CREATE POLICY "components_update_admin" ON public.course_components FOR UPDATE TO authenticated USING (public.is_content_admin());
CREATE POLICY "components_delete_admin" ON public.course_components FOR DELETE TO authenticated USING (public.is_content_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all policies
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('courses', 'phases', 'projects', 'course_components')
ORDER BY tablename, policyname;

-- Expected: 16 policies total (4 per table)
-- All write operations should have is_content_admin() check
-- Read operations: public for courses/phases/projects, authenticated for components

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
