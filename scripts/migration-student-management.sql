-- =============================================
-- Faz 1: Öğrenci Yönetimi Veritabanı Değişiklikleri
-- Yeti LAB - 31 Aralık 2024
-- =============================================

-- 1. Sınıflar tablosuna şifre gereksinimi alanı ekle
-- Bu alan öğretmenin sınıfa girişte şifre isteyip istemediğini belirler
ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS requires_password BOOLEAN DEFAULT false;

-- 2. Öğrenciler tablosuna şifre alanı ekle
-- Öğrenci girişi için kullanılacak (hash'lenmiş olarak saklanmalı)
ALTER TABLE students ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. Öğrenciler tablosuna öğretmen tarafından eklendi alanı ekle
-- Bu alan öğrencinin öğretmen tarafından mı yoksa kendi mi katıldığını belirler
ALTER TABLE students ADD COLUMN IF NOT EXISTS added_by_teacher BOOLEAN DEFAULT false;

-- =============================================
-- Ek güvenlik: RLS politikaları güncelleme
-- =============================================

-- Öğretmenlerin kendi sınıflarındaki öğrencileri güncelleyebilmesi
CREATE POLICY IF NOT EXISTS "Teachers can update students in their classrooms"
ON students
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM classrooms c
        WHERE c.id = students.classroom_id
        AND c.teacher_id = auth.uid()
    )
);

-- Öğretmenlerin kendi sınıflarına öğrenci ekleyebilmesi
CREATE POLICY IF NOT EXISTS "Teachers can insert students to their classrooms"
ON students
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM classrooms c
        WHERE c.id = classroom_id
        AND c.teacher_id = auth.uid()
    )
);

-- =============================================
-- İndeksler (performans için)
-- =============================================

-- Şifre kontrolü için indeks
CREATE INDEX IF NOT EXISTS idx_students_classroom_password 
ON students(classroom_id, display_name) 
WHERE password IS NOT NULL;

-- =============================================
-- Doğrulama sorguları
-- =============================================

-- Değişikliklerin uygulandığını kontrol et
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'classrooms' AND column_name = 'requires_password';

SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' AND column_name IN ('password', 'added_by_teacher');
