---
description: Kullanıcı kayıt ve giriş sistemi geliştirme adımları
---

# 🎓 YETİ LAB - KULLANICI SİSTEMİ WORKFLOW

## 📋 SİSTEM ÖZETİ

### Kullanıcı Tipleri ve Giriş Yöntemleri

| Tip | Giriş Yöntemi | Açıklama |
|-----|---------------|----------|
| **Öğretmen** | Google/GitHub OAuth | Tam yetki, sınıf oluşturma |
| **Öğrenci (Küçük)** | 5 Harfli Sınıf Kodu + İsim | Basit giriş, OAuth gerektirmez |
| **Öğrenci (Büyük)** | E-posta/Şifre veya OAuth | İsteğe bağlı tam hesap |
| **Admin** | E-posta/Şifre | İçerik yönetimi (mevcut sistem) |

### Sınıf Kodu Formatı
- **5 karakter** (kolay hatırlanır)
- Sadece büyük harf + rakam
- Karışıklığa neden olan karakterler hariç (O/0, I/1, L)
- Örnek: `YETAB`, `K7M2N`, `3PQRS`

---

## 📅 GELİŞTİRME ADIMLARI

### ✅ ADIM 1: SQL Şeması Oluştur
// turbo
```powershell
# scripts/user-schema.sql dosyasını oluştur
```

### ⏳ ADIM 2: Supabase'de Tabloları Oluştur
- Supabase Dashboard > SQL Editor'a git
- user-schema.sql içeriğini yapıştır ve çalıştır

### ⏳ ADIM 3: Auth Modülü (`modules/auth.js`)
- Google OAuth setup
- GitHub OAuth setup  
- E-posta/şifre auth
- Öğrenci session yönetimi

### ⏳ ADIM 4: Giriş Sayfası (`auth.html`)
- Öğrenci/Öğretmen sekmesi
- Öğrenci: Kod + İsim formu
- Öğretmen: OAuth butonları
- Modern, responsive tasarım

### ⏳ ADIM 5: Öğretmen Paneli (`teacher.html`)
- Sınıf oluştur
- Sınıf kodunu göster/kopyala
- Öğrenci listesi
- İlerleme takibi

### ⏳ ADIM 6: Profil Sayfası (`profile.html`)
- Kullanıcı bilgileri
- İlerleme özeti
- Rozet görüntüleme

### ⏳ ADIM 7: Ana Uygulamaya Entegrasyon
- Header'a kullanıcı menüsü
- İlerleme kaydetmeyi Supabase'e bağla
- Oturum kontrolü

---

## 🗄️ VERİTABANI TABLOLARI

1. `user_profiles` - Öğretmen/Admin profilleri (OAuth)
2. `classrooms` - Sınıflar (5 harfli kod)
3. `students` - Öğrenciler (kod+isim veya OAuth)
4. `student_progress` - İlerleme kayıtları

---

## 📁 YENİ DOSYALAR

```
modules/
├── auth.js            # OAuth ve session yönetimi
├── studentSession.js  # Öğrenci oturum (kod+isim)
├── classroom.js       # Sınıf CRUD işlemleri
└── studentProgress.js # Supabase ilerleme takibi

pages/
├── auth.html         # Giriş sayfası
├── profile.html      # Profil sayfası
└── teacher.html      # Öğretmen paneli

scripts/
└── user-schema.sql   # Veritabanı şeması
```
