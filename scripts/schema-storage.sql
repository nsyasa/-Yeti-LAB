-- =====================================================
-- Yeti LAB - Supabase Storage Politikaları
-- Faz 1: Dosya Upload Altyapısı
-- Tarih: 11 Ocak 2026
-- =====================================================

-- NOT: Önce Supabase Dashboard'dan "submissions" bucket'ı oluşturun:
-- 1. Storage → New Bucket
-- 2. Name: submissions
-- 3. Public: OFF
-- 4. File size limit: 5242880 (5MB)
-- 5. Allowed MIME types: (aşağıda listelenmiş)

-- =====================================================
-- STORAGE RLS POLİTİKALARI
-- =====================================================

-- Öğrenciler kendi klasörlerine dosya yükleyebilir
-- Path format: {student_id}/{assignment_id}/{filename}
CREATE POLICY "Students can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'submissions' AND
    auth.uid() IS NOT NULL AND
    (
        -- OAuth kullanıcıları: user_id üzerinden kontrol
        (storage.foldername(name))[1] IN (
            SELECT id::text FROM students WHERE user_id = auth.uid()
        )
        OR
        -- Direkt student_id kontrolü (session-based auth için)
        (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- Öğrenciler kendi dosyalarını görebilir
CREATE POLICY "Students can view own files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'submissions' AND
    auth.uid() IS NOT NULL AND
    (
        (storage.foldername(name))[1] IN (
            SELECT id::text FROM students WHERE user_id = auth.uid()
        )
        OR
        (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- Öğrenciler kendi dosyalarını silebilir
CREATE POLICY "Students can delete own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'submissions' AND
    auth.uid() IS NOT NULL AND
    (
        (storage.foldername(name))[1] IN (
            SELECT id::text FROM students WHERE user_id = auth.uid()
        )
        OR
        (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- Öğrenciler kendi dosyalarını güncelleyebilir (üzerine yazma)
CREATE POLICY "Students can update own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'submissions' AND
    auth.uid() IS NOT NULL AND
    (
        (storage.foldername(name))[1] IN (
            SELECT id::text FROM students WHERE user_id = auth.uid()
        )
        OR
        (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- Öğretmenler kendi sınıflarındaki öğrencilerin dosyalarını görebilir
CREATE POLICY "Teachers can view classroom submissions"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'submissions' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM classrooms c
        JOIN students s ON s.classroom_id = c.id
        WHERE c.teacher_id = auth.uid()
        AND (storage.foldername(name))[1] = s.id::text
    )
);

-- Adminler tüm dosyalara erişebilir
CREATE POLICY "Admins can access all files"
ON storage.objects FOR ALL
USING (
    bucket_id = 'submissions' AND
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
