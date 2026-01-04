-- DİKKAT: Bu script sadece ana 5 dersi tutar, diğer (minecraft vb.) tüm ekli kursları SİLER.
-- Ve sıralamayı düzeltir.

DELETE FROM courses 
WHERE slug NOT IN ('arduino', 'microbit', 'scratch', 'mblock', 'appinventor');

-- Sıralamayı Resetle
UPDATE courses SET position = 0 WHERE slug = 'arduino';
UPDATE courses SET position = 1 WHERE slug = 'microbit';
UPDATE courses SET position = 2 WHERE slug = 'scratch';
UPDATE courses SET position = 3 WHERE slug = 'mblock';
UPDATE courses SET position = 4 WHERE slug = 'appinventor';

-- Son Durumu Göster
SELECT slug, title, position FROM courses ORDER BY position;
