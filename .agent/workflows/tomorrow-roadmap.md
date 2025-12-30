---
description: Yarınki geliştirme planı - 30 Aralık 2024
---

# 🗓️ Yeti LAB - Yarınki Geliştirme Planı

## ✅ Bugün Tamamlananlar (29 Aralık 2024)

| Görev | Durum |
|-------|-------|
| Google OAuth kurulumu | ✅ Tamamlandı |
| GitHub OAuth kurulumu | ✅ Tamamlandı |
| `auth.html` giriş sayfası | ✅ Tamamlandı |
| `profile.html` profil tamamlama | ✅ Tamamlandı |
| Veritabanı şeması (user_profiles, classrooms, students) | ✅ Tamamlandı |
| Header'a Giriş/Kullanıcı menüsü | ✅ Tamamlandı |
| Profil tamamlama akışı (giriş → profil → ana sayfa) | ✅ Tamamlandı |
| Trigger düzeltmeleri | ✅ Tamamlandı |

---

## 📋 Yarın Yapılacaklar (30 Aralık 2024)

### 1. Öğretmen Paneli (`teacher.html`) - ⏱️ ~1.5 saat
- [ ] Dashboard görünümü (sınıflar, öğrenci sayısı)
- [ ] Sınıf oluşturma formu
- [ ] Sınıf kodu görüntüleme ve kopyalama
- [ ] Öğrenci listesi görüntüleme
- [ ] Sınıfı silme/düzenleme

### 2. Öğrenci Giriş Sistemi Testi - ⏱️ ~30 dk
- [ ] Sınıf kodu ile giriş testi
- [ ] Google ile öğrenci girişi testi
- [ ] `auth.html` öğrenci sekmesine GitHub ekle

### 3. İlerleme Takibi Senkronizasyonu - ⏱️ ~1 saat
- [ ] `progress.js` modülünü Supabase'e bağla
- [ ] Öğrenci ilerlemesini `student_progress` tablosuna kaydet
- [ ] Öğretmen panelinde ilerleme görüntüle

### 4. Son Dokunuşlar - ⏱️ ~30 dk
- [ ] Auth sayfası öğrenci sekmesine GitHub ekle
- [ ] Profil görüntüleme sayfası (basit)
- [ ] Çıkış sonrası yönlendirme düzeltmeleri

---

## 🎯 Öncelik Sırası

```
1. teacher.html (EN ÖNCELİKLİ - 404 hatası var!)
2. Öğrenci giriş testi
3. İlerleme takibi
4. Son dokunuşlar
```

---

## 📁 Oluşturulacak Dosyalar

- `teacher.html` - Öğretmen paneli
- `modules/classroom.js` - Sınıf yönetimi modülü (opsiyonel)

---

## 💡 Notlar

- Profil kaydedildikten sonra öğretmenler `teacher.html`'e yönlendiriliyor
- Öğrenciler `index.html`'e yönlendiriliyor
- Mevcut kullanıcıların profilleri `is_profile_complete = true` olarak güncellendi

---

## 🔗 Önemli Linkler

- **GitHub Pages:** https://nsyasa.github.io/-Yeti-LAB/
- **Auth Sayfası:** https://nsyasa.github.io/-Yeti-LAB/auth.html
- **Supabase Dashboard:** https://supabase.com/dashboard/project/zuezvfojutlefdvqrica
