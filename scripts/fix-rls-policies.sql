-- =====================================================
-- RLS FIX: Kullanıcıların kendi admin durumunu kontrol etmesine izin ver
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- =====================================================

-- Mevcut politikaları temizle (hata verirse sorun değil)
DROP POLICY IF EXISTS "Users can check own admin status" ON content_admins;

-- Kullanıcılar kendi kayıtlarını görebilir
CREATE POLICY "Users can check own admin status" ON content_admins
    FOR SELECT USING (user_id = auth.uid());

-- Tüm authenticated kullanıcılar courses'ı okuyabilir (admin paneli için)
DROP POLICY IF EXISTS "Authenticated can read all courses" ON courses;
CREATE POLICY "Authenticated can read all courses" ON courses
    FOR SELECT TO authenticated USING (true);

-- Tüm authenticated kullanıcılar phases'ı okuyabilir
DROP POLICY IF EXISTS "Authenticated can read all phases" ON phases;
CREATE POLICY "Authenticated can read all phases" ON phases
    FOR SELECT TO authenticated USING (true);

-- Tüm authenticated kullanıcılar projects'ı okuyabilir
DROP POLICY IF EXISTS "Authenticated can read all projects" ON projects;
CREATE POLICY "Authenticated can read all projects" ON projects
    FOR SELECT TO authenticated USING (true);

-- Tüm authenticated kullanıcılar components'ı okuyabilir
DROP POLICY IF EXISTS "Authenticated can read all components" ON course_components;
CREATE POLICY "Authenticated can read all components" ON course_components
    FOR SELECT TO authenticated USING (true);

-- =====================================================
-- BAŞARILI! Şimdi admin.html'i yenileyin ve tekrar giriş yapın
-- =====================================================
