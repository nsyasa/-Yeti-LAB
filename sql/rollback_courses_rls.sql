-- ============================================================================
-- ROLLBACK SCRIPT - Restore Original INSECURE Policies
-- ============================================================================
-- ⚠️ WARNING: This restores INSECURE policies where any authenticated user
--             can INSERT/UPDATE/DELETE courses. Use only in emergency.
-- ============================================================================

-- Drop secure policies
DROP POLICY IF EXISTS "courses_select_public" ON public.courses;
DROP POLICY IF EXISTS "courses_insert_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_update_admin" ON public.courses;
DROP POLICY IF EXISTS "courses_delete_admin" ON public.courses;

-- Drop helper function
DROP FUNCTION IF EXISTS public.is_content_admin();

-- Restore original INSECURE policies
-- ⚠️ INSECURE: Any authenticated user can write
CREATE POLICY "Enable read access for all users" 
ON public.courses
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.courses
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" 
ON public.courses
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" 
ON public.courses
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ============================================================================
-- Verification Query
-- ============================================================================

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'courses'
ORDER BY policyname;

-- ============================================================================
-- ⚠️ SECURITY WARNING
-- ============================================================================
-- After rollback, ANY authenticated user can INSERT/UPDATE/DELETE courses.
-- This is a CRITICAL security vulnerability.
-- Re-apply secure patch as soon as issue is resolved.
-- ============================================================================
