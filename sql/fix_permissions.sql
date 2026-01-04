-- Supabase İzinlerini (RLS) Tamir Etme Scripti
-- Bu script, 'courses' tablosu üzerinde ekleme, silme ve güncelleme yapabilmeniz için gerekli izinleri açar.

-- 1. Güvenlik kilidini aktif et (zaten açıktır ama emin olalım)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 2. Eski izinleri temizle (hata vermemesi için)
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON courses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON courses;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON courses;

-- Gelişmiş temizlik (Türkçe isimli politikalar varsa)
DROP POLICY IF EXISTS "Geniş Okuma İzni" ON courses;
DROP POLICY IF EXISTS "Yönetici Ekleme İzni" ON courses;
DROP POLICY IF EXISTS "Yönetici Güncelleme İzni" ON courses;
DROP POLICY IF EXISTS "Yönetici Silme İzni" ON courses;

-- 3. YENİ İZİNLERİ TANIMLA

-- OKUMA: Herkes kursları görebilir (Giriş yapmayanlar dahil)
CREATE POLICY "Enable read access for all users" ON "public"."courses"
FOR SELECT USING (true);

-- EKLEME: Sadece giriş yapmış kullanıcılar kurs ekleyebilir
CREATE POLICY "Enable insert for authenticated users only" ON "public"."courses"
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- GÜNCELLEME: Sadece giriş yapmış kullanıcılar kurs güncelleyebilir (Sıralama, İsim vb.)
CREATE POLICY "Enable update for authenticated users only" ON "public"."courses"
FOR UPDATE USING (auth.role() = 'authenticated');

-- SİLME: Sadece giriş yapmış kullanıcılar kurs silebilir
CREATE POLICY "Enable delete for authenticated users only" ON "public"."courses"
FOR DELETE USING (auth.role() = 'authenticated');
