-- =====================================================
-- Yeti LAB - OAuth Kullanıcıları İçin RLS Politikaları
-- Tarih: 2 Ocak 2026
-- 
-- Bu script, OAuth ile giriş yapan kullanıcıların
-- kendi ilerlemelerini kaydetmesine izin verir.
-- 
-- NOT: Önce fix-oauth-progress.sql'i çalıştırın (FK kaldırma)
-- =====================================================

-- 1. Mevcut INSERT politikasını kaldır
DROP POLICY IF EXISTS "Anyone can insert progress" ON student_progress;

-- 2. Giriş yapmış herkes ilerleme kaydedebilsin
CREATE POLICY "Authenticated users can insert progress"
    ON student_progress FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. Mevcut SELECT politikalarını temizle
DROP POLICY IF EXISTS "Anyone can read progress" ON student_progress;
DROP POLICY IF EXISTS "Teachers can view classroom progress" ON student_progress;

-- 4. Giriş yapmış herkes kendi ilerlemesini okuyabilsin
CREATE POLICY "Authenticated users can read own progress"
    ON student_progress FOR SELECT
    TO authenticated
    USING (student_id = auth.uid());

-- 5. Öğretmenler sınıflarındaki ilerlemeyi görebilsin (ekleme)
CREATE POLICY "Teachers can view classroom progress"
    ON student_progress FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN classrooms c ON s.classroom_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- 6. Mevcut DELETE politikasını kaldır
DROP POLICY IF EXISTS "Students can delete own progress" ON student_progress;

-- 7. Giriş yapmış herkes kendi ilerlemesini silebilsin
CREATE POLICY "Authenticated users can delete own progress"
    ON student_progress FOR DELETE
    TO authenticated
    USING (student_id = auth.uid());

-- =====================================================
-- Bu SQL'i Supabase SQL Editor'da çalıştırın!
-- =====================================================
