-- ============================================================================
-- Supabase RLS Security Patch - Courses Table (PRODUCTION)
-- ============================================================================
-- Purpose: Restrict INSERT/UPDATE/DELETE to content_admins only
-- Date: 2026-01-16
-- Security Level: HARDENED (SECURITY DEFINER + search_path protection)
-- ============================================================================

-- Step 1: Create hardened helper function
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

-- Grant execute permission to authenticated users
REVOKE ALL ON FUNCTION public.is_content_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_content_admin() TO authenticated;

COMMENT ON FUNCTION public.is_content_admin() IS 
  'Returns true if current user exists in content_admins table. SECURITY DEFINER with search_path protection.';

-- Step 2: Drop old insecure policies
-- ============================================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.courses;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.courses;

-- Drop Turkish-named policies (if any)
DROP POLICY IF EXISTS "Geniş Okuma İzni" ON public.courses;
DROP POLICY IF EXISTS "Yönetici Ekleme İzni" ON public.courses;
DROP POLICY IF EXISTS "Yönetici Güncelleme İzni" ON public.courses;
DROP POLICY IF EXISTS "Yönetici Silme İzni" ON public.courses;

-- Step 3: Create new secure policies
-- ============================================================================

-- SELECT: Public read access (anyone can view courses)
-- Rationale: Marketing funnel - anonymous visitors should see course catalog
CREATE POLICY "courses_select_public"
ON public.courses
FOR SELECT
USING (true);

-- INSERT: Content admins only
CREATE POLICY "courses_insert_admin"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (public.is_content_admin());

-- UPDATE: Content admins only
CREATE POLICY "courses_update_admin"
ON public.courses
FOR UPDATE
TO authenticated
USING (public.is_content_admin());

-- DELETE: Content admins only
CREATE POLICY "courses_delete_admin"
ON public.courses
FOR DELETE
TO authenticated
USING (public.is_content_admin());

-- ============================================================================
-- Verification Query (run after patch)
-- ============================================================================

-- Check policies are created correctly
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
WHERE tablename = 'courses'
ORDER BY policyname;

-- Expected output:
-- courses_delete_admin | DELETE | {authenticated} | public.is_content_admin()
-- courses_insert_admin | INSERT | {authenticated} | public.is_content_admin()
-- courses_select_public | SELECT | {public} | true
-- courses_update_admin | UPDATE | {authenticated} | public.is_content_admin()

-- ============================================================================
-- End of patch
-- ============================================================================
