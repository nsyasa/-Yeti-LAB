-- =============================================
-- KURS YÖNETİMİ İÇİN VERİTABANI GÜNCELLEMESİ
-- =============================================

-- 1. courses tablosuna position sütunu ekle
ALTER TABLE courses ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- 2. Mevcut kursların sırasını ayarla (oluşturulma tarihine göre)
WITH ordered_courses AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 as new_position
  FROM courses
)
UPDATE courses 
SET position = ordered_courses.new_position
FROM ordered_courses
WHERE courses.id = ordered_courses.id;

-- 3. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_courses_position ON courses(position);

-- =============================================
-- BU SQL'İ SUPABASE SQL EDITOR'DE ÇALIŞTIRIN
-- =============================================
