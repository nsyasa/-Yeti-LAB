-- Supabase'deki kurs isimlerini (slug) yerel dosya isimleri ile eşleştirme
-- Bu scripti çalıştırarak '404 Failed to load resource' hatalarını düzeltebilirsiniz.

UPDATE courses SET slug = 'arduino' WHERE slug = 'arduino-egitimi';
UPDATE courses SET slug = 'microbit' WHERE slug = 'microbit-ile-kodlama';
UPDATE courses SET slug = 'scratch' WHERE slug = 'scratch-ile-oyun-tasarm';
UPDATE courses SET slug = 'mblock' WHERE slug = 'mblock-robotik';
UPDATE courses SET slug = 'appinventor' WHERE slug = 'mit-app-inventor';

-- Kontrol
SELECT slug, title FROM courses;
