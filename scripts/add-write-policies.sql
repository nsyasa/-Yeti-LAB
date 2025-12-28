-- =====================================================
-- ADMIN YAZMA İZİNLERİ - Supabase'e kaydetme için
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- =====================================================

-- Adminler courses tablosunu düzenleyebilir
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
CREATE POLICY "Admins can update courses" ON courses
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
CREATE POLICY "Admins can insert courses" ON courses
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

-- Adminler phases tablosunu düzenleyebilir
DROP POLICY IF EXISTS "Admins can update phases" ON phases;
CREATE POLICY "Admins can update phases" ON phases
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert phases" ON phases;
CREATE POLICY "Admins can insert phases" ON phases
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete phases" ON phases;
CREATE POLICY "Admins can delete phases" ON phases
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

-- Adminler projects tablosunu düzenleyebilir
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
CREATE POLICY "Admins can update projects" ON projects
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
CREATE POLICY "Admins can insert projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete projects" ON projects;
CREATE POLICY "Admins can delete projects" ON projects
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

-- Adminler course_components tablosunu düzenleyebilir
DROP POLICY IF EXISTS "Admins can update components" ON course_components;
CREATE POLICY "Admins can update components" ON course_components
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert components" ON course_components;
CREATE POLICY "Admins can insert components" ON course_components
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete components" ON course_components;
CREATE POLICY "Admins can delete components" ON course_components
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM content_admins WHERE user_id = auth.uid()));

-- =====================================================
-- BAŞARILI! Artık admin panelinden Supabase'e kayıt yapılabilir.
-- =====================================================
