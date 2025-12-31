# ⚠️ Önemli: Öğrenci Listesinin Görünmesi İçin Yapılması Gereken Ayar

Giriş ekranında "Sınıf Bulundu" dedikten sonra "Sınıfta Kimse Yok" veya "Öğrenci Listesi Alınamadı" hatası alıyorsanız, veritabanı okuma izinleri (RLS) eksik demektir.

Lütfen aşağıdaki adımları Supabase panelinde uygulayın:

1.  **Supabase Paneline** gidin ve projenizi açın.
2.  Sol menüden **SQL Editor** kısmına tıklayın.
3.  Sayfanın üstündeki **+ New query** butonuna basın.
4.  Aşağıdaki SQL kodunu olduğu gibi yapıştırın:

```sql
-- Öğrencilerin listelenmesine izin ver (Select izni)
DROP POLICY IF EXISTS "Public students read access" ON "public"."students";

CREATE POLICY "Public students read access"
ON "public"."students"
FOR SELECT
TO public
USING (true);

-- Tablonun RLS özelliğini aktifleştir (Güvenlik için)
ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;
```

5.  Sağ alttaki **Run** butonuna basın.
6.  "Success" mesajını gördükten sonra uygulamanın giriş sayfasına dönüp tekrar deneyin.

**Neden Gerekli?**
Öğretmen panelinde giriş yapmış olduğunuz için öğrencileri görebiliyorsunuz. Ancak giriş ekranında (auth.html) henüz giriş yapmamış (anonim) kullanıcılar olduğu için veritabanı güvenlik gereği listeyi gizliyor. Bu ayar ile öğrenci listesinin herkese (sınıf kodunu bilenlere) görünür olmasını sağlıyoruz.
