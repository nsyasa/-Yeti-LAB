# Changelog

Yeti LAB için tüm önemli değişiklikler bu dosyada belgelenir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına uygundur.

---

## [1.3.0] - 2026-01-15

### 🌙 Dark Mode & UI Overhaul (Major Update)

#### Visual Refinements

- **Strict Default Dark Mode**: Uygulama artık varsayılan olarak optimize edilmiş koyu modda açılıyor.
- **Enhanced Course Cards**:
    - Kart arka planları `bg-slate-900/60` ile daha okunabilir yapıldı.
    - Emoji ikonları için "beyaz kutu" sorunu giderildi (`bg-slate-800`).
    - Metin renkleri koyu zemin üzerinde maksimum okunabilirlik için `gray-100` ve `gray-400` olarak güncellendi.
- **Lesson Cards**: Dashboard ders kartlarına border ve belirgin arka plan eklendi.

#### 📱 Mobile Experience

- **Layout Fixes**: Mobil görünümde kurs kartlarının üst üste binme sorunu (`aspect-square` çakışması) giderildi.
- **Rocket Icon**: Karşılama ekranındaki roket ikonu mobilde daha görünür hale getirildi (5x büyütüldü).

### 🐛 Düzeltmeler

- `themes.js`: Eksik olan `dark` renk varyasyonları tüm kurslar için tanımlandı.
- `ui.js`: Sabit `bg-white` sınıfları `dark:` varyasyonları ile değiştirildi.
- Tailwind dark mode utility sınıflarının düzgün çalışması için `style.css` override kuralları eklendi.

---

## [1.2.2] - 2026-01-13

### 🎨 Teacher Panel UX Overhaul

#### Modal-Free Fluid UX

- **Tüm modallar kaldırıldı**: Artık hiçbir pop-up yok, tüm işlemler inline gerçekleşiyor
- **Accordion Row Layout**: Sınıf listesi kart gridinden yatay satır görünümüne geçti
- **Inline Forms**: Öğrenci ekleme, toplu ekleme ve ayarlar artık satır altında açılıyor

#### Yeni Özellikler

- **Top-Inline New Classroom Form**: Yeni sınıf oluşturma formu listenin tepesinde açılıyor
- **Settings Inline Form**: Sınıf ayarları (ad, açıklama, aktif durumu) inline düzenlenebilir
- **Real-time Student Count**: Öğrenci eklerken sayı anında güncelleniyor
- **Copy to Clipboard**: Sınıf kodu tıklanarak kopyalanıyor (Toast feedback)

#### Text-Based Action Buttons

| Buton          | Renk       | İşlem                      |
| -------------- | ---------- | -------------------------- |
| + Öğrenci Ekle | 🟢 Yeşil   | Tek öğrenci inline form    |
| Toplu Ekle     | 🟣 Mor     | Textarea ile çoklu ekleme  |
| Ayarlar        | 🔵 Mavi    | Inline ayar formu          |
| Sil            | 🔴 Kırmızı | Onay dialogu sonrası silme |

#### Focus Mode

- Bir panel açıldığında diğer tüm paneller otomatik kapanıyor
- Tek bir işleme odaklanmayı kolaylaştırıyor

### 🐛 Bug Fixes

- **courseEnrollmentService.js**: `students.name` → `students.display_name` kolon hatası düzeltildi
- **Dropdown Z-Index**: Dropdown menüler artık kart altında kalmıyor (z-50)
- **Menu Overlap**: Aynı anda sadece 1 menü açık olabiliyor

### 🛠️ Technical Changes

- `ClassroomManager.renderList()` tamamen yeniden yazıldı
- Yeni fonksiyonlar: `togglePanel`, `closeAllPanels`, `showNewClassroomForm`, `createNewClassroom`, `saveSettings`
- CSS: `.classroom-row`, `.classroom-accordion`, `.classroom-panel` stilleri eklendi

---

## [1.2.1] - 2026-01-12

### 🐛 Bug Fixes

#### Modal Visibility Bug (Tailwind CSS v4 Uyumluluk)

- **Sorun**: Teacher panel modalları sayfa yüklendiğinde görünür olarak kalıyordu
- **Kök Neden**: Tailwind CSS v4'ün `@layer` sistemi, custom CSS'deki `display: none` kuralını override ediyordu
- **Çözüm**: Tüm modal-overlay elementlerine Tailwind'in `hidden` class'ı eklendi
- **Etkilenen Dosyalar**:
    - `views/teacher/modals/TeacherModals.js` - 7 modal güncellendi
    - `views/teacher/modals/AssignmentModals.js` - 4 modal güncellendi
    - `modules/teacher-manager.js` - Modal açma/kapama fonksiyonları güncellendi
    - `views/teacher/TeacherView.js` - Section değişiminde modal kapatma güncellendi

#### Teacher Panel Section Display Fix

- **Sorun**: Sınıflar, Öğrenciler vb. bölümler görünmüyordu (height: 0)
- **Çözüm**: Parent container'lara `h-full` class'ı eklendi

#### Supabase Query Fixes

- **analyticsService.js**: Nested relation filtering `!inner` yerine classroomIds pattern'ine çevrildi
- **assignmentService.js**: Var olmayan `rubrics` tablo referansı kaldırıldı
- **courseEnrollmentService.js**: Supabase proxy objesi eklendi

#### Router & Navigation Fixes

- `router.js`: Eksik teacher route'ları eklendi (teacher-assignments, teacher-courses, teacher-analytics)
- `viewLoader.js`: Tüm 5 teacher section'ı için handler eklendi

#### Auth Race Condition Fix

- `app.js`: `app.initAuth()` async/await ile düzgün bekletildi

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
