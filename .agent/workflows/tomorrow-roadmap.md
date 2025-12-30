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

---

## 📋 Yarın Yapılacaklar (31 Aralık 2024)

### Faz 1: Veritabanı Değişiklikleri (30 dk)
```sql
ALTER TABLE classrooms ADD COLUMN requires_password BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN password TEXT;
ALTER TABLE students ADD COLUMN added_by_teacher BOOLEAN DEFAULT false;
```

### Faz 2: Toplu Öğrenci Ekleme (1 saat)
- [ ] "Toplu Öğrenci Ekle" butonu (teacher.html)
- [ ] Modal: Textarea (her satıra bir isim)
- [ ] Checkbox: "Şifre oluştur"
- [ ] Önizleme tablosu (isim + şifre)
- [ ] Listeyi export (kopyala/indir)

### Faz 3: Yeni Giriş Ekranı (1.5 saat)
- [ ] Birleşik giriş ekranı tasarımı
- [ ] Email kayıt/giriş akışı
- [ ] Google/GitHub OAuth (mevcut)
- [ ] "Sınıf koduyla gir" butonu

### Faz 4: Kod ile Giriş Akışı (1 saat)
- [ ] Kod gir → Sınıf kontrol
- [ ] Şifreli sınıf: şifre iste
- [ ] Şifresiz sınıf: listeden isim seç

### Faz 5: Öğrenci İlerleme Sayfası (1 saat)
- [ ] Profil sayfasında tamamlanan dersler
- [ ] Quiz puanları listesi
- [ ] Kurs kartlarında ilerleme göstergesi

### Faz 6: Öğretmen Paneli İlerleme (30 dk)
- [ ] Öğrenci detay modalı
- [ ] Ders bazlı ilerleme

---

## 🎯 Öncelik Sırası

1. **Faz 1** - Veritabanı (SQL Editor'da)
2. **Faz 2** - Toplu öğrenci ekleme
3. **Faz 3** - Yeni giriş ekranı
4. **Faz 4** - Kod ile giriş akışı
5. **Faz 5** - Öğrenci ilerleme sayfası
6. **Faz 6** - Öğretmen paneli ilerleme

---

## 🔗 Önemli Linkler

- **GitHub Pages:** https://nsyasa.github.io/-Yeti-LAB/
- **Öğretmen Paneli:** https://nsyasa.github.io/-Yeti-LAB/teacher.html
- **Auth Sayfası:** https://nsyasa.github.io/-Yeti-LAB/auth.html
- **Supabase Dashboard:** https://supabase.com/dashboard/project/zuezvfojutlefdvqrica
