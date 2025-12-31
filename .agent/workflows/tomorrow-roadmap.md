---
description: Yarınki geliştirme planı - 31 Aralık 2024
---

# 🗓️ Yeti LAB - Yarınki Geliştirme Planı

## ✅ Bugün Tamamlananlar (30 Aralık 2024)

| Görev | Durum |
|-------|-------|
| Öğretmen Paneli (teacher.html) | ✅ Tamamlandı |
| OAuth yönlendirme düzeltmesi | ✅ Tamamlandı |
| Supabase progress entegrasyonu | ✅ Tamamlandı |
| Öğrenci ders tamamlama sistemi | ✅ Tamamlandı |
| İlerleme takibi (öğretmen paneli) | ✅ Tamamlandı |
| Console.log temizliği | ✅ Tamamlandı |
| README.md profesyonelleştirme | ✅ Tamamlandı |

---

## 📋 Yarın Yapılacaklar (31 Aralık 2024)

### 🔴 Öncelikli: Kritik Düzeltmeler

#### Bug Fix 1: Eksik Görseller (30 dk)
- [ ] `devre1.jpg`, `devre2.jpg` vb. simülasyon görsellerini ekle
- [ ] Canvas 404 hatalarını düzelt
- [ ] Simülasyon görsel yükleyemezse fallback ekle

#### Bug Fix 2: Loading States (45 dk)
- [ ] Butonlara loading spinner ekle
- [ ] Ders yüklenirken skeleton loader
- [ ] Çift tıklama koruması

#### Bug Fix 3: Error Handling (1 saat)
- [ ] Kullanıcıya görünür hata mesajları (toast notifications)
- [ ] Network hatalarında retry mekanizması
- [ ] Supabase bağlantı hatalarını yakala

---

### 🟡 Orta Öncelik: Yeni Özellikler

#### Faz 1: Veritabanı Değişiklikleri (30 dk)
```sql
ALTER TABLE classrooms ADD COLUMN requires_password BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN password TEXT;
ALTER TABLE students ADD COLUMN added_by_teacher BOOLEAN DEFAULT false;
```

#### Faz 2: Toplu Öğrenci Ekleme (1 saat)
- [ ] "Toplu Öğrenci Ekle" butonu (teacher.html)
- [ ] Modal: Textarea (her satıra bir isim)
- [ ] Checkbox: "Şifre oluştur"
- [ ] Önizleme tablosu (isim + şifre)
- [ ] Listeyi export (kopyala/indir)

#### Faz 3: Yeni Giriş Ekranı (1.5 saat)
- [ ] Birleşik giriş ekranı tasarımı
- [ ] Email kayıt/giriş akışı
- [ ] Google/GitHub OAuth (mevcut)
- [ ] "Sınıf koduyla gir" butonu

#### Faz 4: Kod ile Giriş Akışı (1 saat)
- [ ] Kod gir → Sınıf kontrol
- [ ] Şifreli sınıf: şifre iste
- [ ] Şifresiz sınıf: listeden isim seç

#### Faz 5: Öğrenci İlerleme Sayfası (1 saat)
- [ ] Profil sayfasında tamamlanan dersler
- [ ] Quiz puanları listesi
- [ ] Kurs kartlarında ilerleme göstergesi

#### Faz 6: Öğretmen Paneli İlerleme (30 dk)
- [ ] Öğrenci detay modalı
- [ ] Ders bazlı ilerleme

---

### 🟢 Düşük Öncelik: Teknik Borç

#### Tailwind Production Build (1 saat)
- [ ] `npm run build` ile Tailwind CSS üret
- [ ] CDN yerine local CSS dosyası kullan
- [ ] Sayfa yükleme hızını optimize et

#### Kod Modülerliği (2 saat)
- [ ] teacher.html inline JS'i ayrı dosyaya taşı
- [ ] Duplicate fonksiyonları birleştir
- [ ] Tutarlı modül yapısı oluştur

#### Güvenlik İyileştirmeleri (1 saat)
- [ ] Öğrenci şifrelerini hash'le (bcrypt benzeri)
- [ ] RLS politikalarını sıkılaştır
- [ ] Rate limiting ekle

---

## 🎯 Öncelik Sırası

| Sıra | Görev | Süre | Öncelik |
|------|-------|------|---------|
| 1 | Eksik görseller | 30 dk | 🔴 Kritik |
| 2 | Loading states | 45 dk | 🔴 Kritik |
| 3 | Error handling | 1 saat | 🔴 Kritik |
| 4 | Faz 1: Veritabanı | 30 dk | 🟡 Orta |
| 5 | Faz 2: Toplu öğrenci | 1 saat | 🟡 Orta |
| 6 | Faz 3-6: Giriş sistemi | 4 saat | 🟡 Orta |
| 7 | Tailwind build | 1 saat | 🟢 Düşük |
| 8 | Kod modülerliği | 2 saat | 🟢 Düşük |
| 9 | Güvenlik | 1 saat | 🟢 Düşük |

---

## 🔗 Önemli Linkler

- **GitHub Pages:** https://nsyasa.github.io/-Yeti-LAB/
- **Öğretmen Paneli:** https://nsyasa.github.io/-Yeti-LAB/teacher.html
- **Auth Sayfası:** https://nsyasa.github.io/-Yeti-LAB/auth.html
- **Supabase Dashboard:** https://supabase.com/dashboard/project/zuezvfojutlefdvqrica

---

## 📝 Gelecekte Yapılacaklar (Backlog)

- [ ] Birim testler yazma
- [ ] E2E testler (Playwright/Cypress)
- [ ] PWA desteği (offline çalışma)
- [ ] Performans optimizasyonu
- [ ] Accessibility (a11y) iyileştirmeleri
