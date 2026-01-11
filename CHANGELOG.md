# Changelog

Yeti LAB için tüm önemli değişiklikler bu dosyada belgelenir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına uygundur.

---

## [1.0.1] - 2026-01-11

### 🔧 İyileştirmeler & Düzeltmeler

- **Güvenlik**: `supabaseClient.js` içindeki hardcoded API anahtarları temizlendi.
- **Mimari**: 17 adet dağınık workflow dosyası 3 ana dosyada birleştirildi (`active_roadmap.md`, `SPA_MIGRATION_ARCHIVE.md`, `REFACTORING_ROADMAP.md`).
- **Görsel**: Kurs kartlarındaki kayıp renk stilleri (CSS safelist hatası) düzeltildi.
- **Performans**: Admin Paneli kayıt işlemlerine `debounce` mekanizması eklendi.
- **SPA**: View yönetimi için `ViewManager` entegrasyonu tamamlandı.

## [1.0.0] - 2026-01-01

### 🚀 Eklenen

- **5 Farklı Kurs**: Arduino, Micro:bit, Scratch, mBlock, App Inventor
- **65 İnteraktif Ders**: Her kurs için aşamalı eğitim içeriği
- **20+ Simülasyon**: Gerçek zamanlı devre simülasyonları
- **Öğretmen Paneli**: Sınıf yönetimi ve ilerleme takibi
- **Öğrenci Girişi**: Sınıf kodu ile güvenli giriş
- **Yeti Asistan**: AI destekli öğrenme yardımcısı
- **Çoklu Dil**: Türkçe ve İngilizce desteği
- **Karanlık Mod**: Göz dostu tema seçeneği

### 🔒 Güvenlik

- Server-side şifre doğrulama (RPC fonksiyonları)
- Row Level Security (RLS) ile veri izolasyonu
- Environment variable ile credential yönetimi

### 🛠️ Teknik

- Supabase entegrasyonu (Auth, Database, Storage)
- Modüler JavaScript mimarisi
- Tailwind CSS ile responsive tasarım
- GitHub Pages üzerinde hosting

---

## [0.9.0] - 2024-12-28

### Eklenen

- Başlangıç beta sürümü
- Arduino ve Micro:bit kursları
- Temel simülasyonlar

---

_Bu proje aktif geliştirme aşamasındadır._
