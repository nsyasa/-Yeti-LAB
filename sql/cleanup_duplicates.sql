-- Yanlış isimlendirilmiş ve dosya hatası veren (404) fazlalık kayıtları sil
DELETE FROM courses WHERE slug IN (
    'arduino-egitimi', 
    'microbit-ile-kodlama', 
    'scratch-ile-oyun-tasarm', 
    'mblock-robotik', 
    'mit-app-inventor'
);

-- Silme işleminden sonra kalan (doğru) kayıtları kontrol et
SELECT slug, title, position FROM courses;
