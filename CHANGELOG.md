# Changelog

Yeti LAB için tüm önemli değişiklikler bu dosyada belgelenir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına uygundur.

---

## [1.2.0] - 2026-01-11

### 🧪 Ödev Sistemi - Test & Optimizasyon (Faz 8)

#### Unit Test Coverage

- **assignmentService.test.js**: AssignmentService için 35 kapsamlı test
    - Validasyon testleri (required fields, assignment types, status values)
    - Filtreleme testleri (classroom, course, status, upcoming)
    - Sıralama testleri (due_date ascending, created_at descending)
    - Due date hesaplamaları (overdue, due today, days until due)
    - Geç gönderim ceza hesaplamaları
    - Status geçiş validasyonları
    - Max attempts kontrolü

- **submissionService.test.js**: StudentSubmissionService için 34 kapsamlı test
    - Dosya validasyonu (allowed types, max file size, extension extraction)
    - Status geçişleri (draft → submitted → graded, resubmit flows)
    - Deneme sayısı kontrolü (max attempts, unlimited attempts)
    - Geç gönderim tespiti ve süre hesabı
    - Puan hesaplamaları ve geç ceza uygulaması
    - Feedback ve içerik yönetimi
    - Timestamp takibi

#### E2E Test Suite

- **assignment-flow.spec.js**: Playwright ile uçtan uca ödev akışı testleri
    - Öğretmen ödev oluşturma ve listeleme
    - Öğretmen notlandırma akışı
    - Öğrenci ödev görüntüleme ve gönderim
    - Bildirim sistemi testleri

#### Performans Optimizasyonları

- **lazyLoader.js**: Lazy loading ve pagination yardımcıları
    - IntersectionObserver tabanlı lazy loading
    - Infinite scroll desteği
    - Görüntü lazy loading (placeholder ile)
    - Pagination state yönetimi ve UI render
    - CSS stilleri dahil

- **imageOptimizer.js**: Görüntü optimizasyon servisi
    - WebP/AVIF format desteği kontrolü
    - Responsive srcset oluşturma
    - Blur-up efekti ile progressive loading
    - Thumbnail ve resize işlemleri
    - Dominant renk çıkarma

- **bundleAnalyzer.js**: Bundle analiz ve optimizasyon önerileri
    - Modül kataloglama ve boyut analizi
    - Lazy load adayları tespiti
    - Vite konfigürasyon önerileri
    - Performans bütçesi kontrolü
    - Detaylı analiz raporu oluşturma

#### Yeni UI Bileşenleri

- **StudentSubmissionModal**: Öğrenci ödev detay ve gönderim modalı
- **StudentAssignmentsSection**: Öğrenci ödev listesi ve filtreleme
- **StudentCoursesSection**: Kayıtlı kurslar görünümü
- **AssignmentModals**: Öğretmen ödev CRUD modalları
- **AssignmentsSection**: Öğretmen ödev yönetim paneli
- **AnalyticsSection**: Kapsamlı analytics dashboard
- **CoursesSection**: Kurs atama yönetimi

---

## [1.1.0] - 2026-01-11

### 🎨 Tasarım Sistemi Güncellemesi

#### Global CSS Değişken Sistemi

- **CSS Variables**: Tüm sayfalarda tutarlılık için kapsamlı `:root` değişken sistemi eklendi
    - `--cta-start` / `--cta-end`: Turuncu-kırmızı gradient (#FF8C00 → #FF4500)
    - `--lab-bg-dark`: Deep navy background (#0F172A) tüm sayfalarda varsayılan
    - `--glass-bg`, `--glass-blur`: Glassmorphism efektleri için değişkenler
    - Responsive typography: `clamp()` ile dinamik heading boyutları
- **Progress Bars**: Tüm ilerleme çubukları artık CTA gradient kullanıyor
- **Active States**: Tüm aktif durumlar (tabs, nav items) unified turuncu accent
- **Z-index Scale**: Bileşenler arası katmanlama için sistematik ölçek

#### Research Lab Teması - Lesson Page

- **Dark Glassmorphic Panel**: İçerik alanı #0F172A bazlı 85% opacity glassmorphism
- **Tab Navigation**:
    - Her sekme için tutarlı ikonlar (🎯 Mission, 🔧 Materials, ⚡ Circuit, etc.)
    - Aktif sekmede glowing turuncu underline + box-shadow efekti
    - Hover states ile subtle background highlight
- **Virtual Lab Container**:
    - Pulsing "CANLI" badge with red animation (`@keyframes live-pulse`)
    - Entegre fullscreen toggle butonu (SVG icon)
    - `UI.toggleFullscreen()` fonksiyonu eklendi
- **Navigation Buttons**: Brand gradient ile stilize edilmiş Geri/Ders Listesi butonları
- **Accessibility**: Tüm metinler white/light-gray, kod blokları dark inset background

#### Dashboard Glassmorphism Redesign

- **Lesson Cards**: Solid white yerine dark glassmorphic containers
    - `rgba(30, 41, 59, 0.75)` arka plan + `backdrop-filter: blur(10px)`
    - Hover: border-color turuncu glow efekti
- **Mini Progress Bars**: Her kartın altında turuncu-kırmızı gradient ilerleme
- **Phase Headers**:
    - Glowing icons with `@keyframes icon-glow` animation
    - Gradient underline (60% width)
- **Locked States**:
    - Blur overlay + lock icon guests için
    - Login olmayan kullanıcılar intro dışındaki dersleri kilidi görür
- **Sidebar**: Dark mode glassmorphism + orange accent colors

### 🤖 AI Asistan İyileştirmeleri

- **Global Positioning**: BANA SOR artık tüm sayfalarda görünür (Homepage, Dashboard, Lesson)
- **Consistent Placement**:
    - Mobil: `bottom: 6rem` (bottom nav üzerinde)
    - Desktop: `bottom: 1.5rem, right: 1.5rem`
- **Z-index**: `var(--z-assistant)` ile proper layering

### 📱 Mobile & Responsive

- **Bottom Navigation**: Glassmorphic bar with backdrop blur
- **Active Indicators**: Turuncu gradient bottom border on active nav items
- **Course Grid**: 2-column layout on mobile with proper spacing

### 🔧 Teknik İyileştirmeler

- **Tailwind v4**: Theme değişkenleri `@theme` bloğunda konsolide edildi
- **Component Layer**: `.lesson-card`, `.lesson-tab`, `.virtual-lab-container` etc.
- **Animation System**: Standardize edilmiş keyframe animasyonları
- **Typography Scale**: Consistent h1-h4 sizing across all pages

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
