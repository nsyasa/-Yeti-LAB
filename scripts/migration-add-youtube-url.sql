-- =====================================================
-- Migration: YouTube URL Desteği Ekleme
-- Tarih: 2024-01-10
-- Açıklama: Projects tablosuna youtube_url sütunu ekler
-- =====================================================

-- YouTube URL sütunu ekle
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Index ekle (opsiyonel - arama performansı için)
CREATE INDEX IF NOT EXISTS idx_projects_youtube ON projects(youtube_url) 
WHERE youtube_url IS NOT NULL;

-- Migration başarılı mesajı
DO $$ 
BEGIN 
    RAISE NOTICE 'YouTube URL sütunu başarıyla eklendi!';
END $$;
