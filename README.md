# ❄️ Yeti LAB

**İnteraktif Robotik ve Kodlama Eğitim Platformu**

![Yeti LAB Banner](public/logo.png)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://nsyasa.github.io/-Yeti-LAB/)
[![Build Status](https://github.com/nsyasa/-Yeti-LAB/actions/workflows/ci.yml/badge.svg)](https://github.com/nsyasa/-Yeti-LAB/actions)
[![Playwright Tests](https://github.com/nsyasa/-Yeti-LAB/actions/workflows/playwright.yml/badge.svg)](https://github.com/nsyasa/-Yeti-LAB/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 Proje Hakkında

Yeti LAB, öğrencilere **Arduino**, **Micro:bit**, **Scratch**, **mBlock** ve **Minecraft Education** gibi platformları öğreten modern, interaktif bir eğitim platformudur. Single Page Application (SPA) mimarisi üzerine kurulu olan bu proje, öğretmenler için detaylı bir yönetim paneli, öğrenciler için oyunlaştırılmış bir öğrenme deneyimi sunar.

### ✨ Temel Özellikler

- 🚀 **Modern SPA Mimarisi**: Hızlı, akıcı ve dinamik sayfa geçişleri.
- 🌙 **Optimize Edilmiş Dark Mode**: Göz yormayan, yüksek kontrastlı ve estetik "Dark Mode First" deneyimi.
- 🎨 **Research Lab Teması**: Dark mode glassmorphism tasarım, neon aksan renkleri ile profesyonel görünüm.
- 🎯 **Global Design System**: Tutarlı CSS değişkenleri ile tüm sayfalarda unified tasarım.
- ⚡ **Lazy Loading & Code Splitting**: Yüksek performanslı ve optimize edilmiş yükleme süreleri.
- 🤖 **Kapsamlı Müfredat**: 6+ farklı kurs modülü (Arduino, Micro:bit, App Inventor vb.).
- 🏫 **Öğretmen Paneli**: Modal-free inline UX, accordion sınıf yönetimi, gerçek zamanlı öğrenci sayısı güncelleme.
- 👨‍💼 **Admin Paneli**: Kurs içeriği, proje ve faz yönetimi için güçlü araçlar.
- 🏆 **Oyunlaştırma**: Rozetler, puan sistemi ve interaktif quizler.
- 🤖 **AI Yardımcı (BANA SOR)**: Yeti maskotu ile kontekst-duyarlı öğrenme desteği.
- 🧪 **Test Odaklı Geliştirme**: Kapsamlı E2E (Playwright) ve Entegrasyon (Vitest) testleri.
- 📋 **Ödev Sistemi**: Öğretmen ödev oluşturma, öğrenci gönderim, notlandırma ve analytics.
- 📊 **Analytics Dashboard**: Gerçek zamanlı performans metrikleri ve raporlama.

---

## 🛠️ Teknolojiler

| Kategori       | Teknolojiler                                        |
| -------------- | --------------------------------------------------- |
| **Frontend**   | Vanilla JS (ES6+), HTML5, CSS3                      |
| **Build Tool** | **Vite 7 (v7.3.1)** (Production Optimization)       |
| **Styling**    | **Tailwind CSS v4** (Custom Theme) ⚠️               |
| **Backend**    | **Supabase** (Auth, Postgres DB, Realtime)          |
| **Testing**    | **Playwright** (E2E), **Vitest** (Unit/Integration) |
| **CI/CD**      | **GitHub Actions** (Automated Testing & Deployment) |

> ⚠️ **Tailwind CSS v4 Uyarısı**: Tailwind v4'ün `@layer` sistemi custom CSS kurallarını override edebilir. Element visibility için **her zaman Tailwind utility class'larını kullanın** (`hidden`, `block`, `flex` vb.). Custom CSS'de `display: none` yetersiz kalabilir. Detaylar için `src/input.css` içindeki modal bölümüne bakın.

---

## 🎨 Tasarım Sistemi

### Global CSS Değişkenleri

Yeti LAB, tüm sayfalarda tutarlılık sağlayan kapsamlı bir CSS değişken sistemi kullanır:

```css
/* CTA Gradient - Tüm primary aksiyonlar için */
--cta-start: #ff8c00;
--cta-end: #ff4500;
--cta-gradient: linear-gradient(135deg, #ff8c00, #ff4500);

/* Deep Navy Background - Tüm sayfalarda */
--lab-bg-dark: #0f172a;
--lab-surface: #1e293b;

/* Glassmorphism */
--glass-bg: rgba(30, 41, 59, 0.75);
--glass-blur: 12px;

/* Responsive Typography */
--heading-h1: clamp(2rem, 5vw, 3rem);
--heading-h2: clamp(1.5rem, 4vw, 2.25rem);
```

### Tasarım Özellikleri

- **Glassmorphism Cards**: Yarı saydam arka planlar, blur efektleri
- **Neon Accents**: Turuncu-kırmızı gradient (#FF8C00 → #FF4500)
- **Glowing Effects**: Progress barlar, aktif sekmeler, hover states
- **Consistent Spacing**: Responsive clamp() ile dinamik boyutlandırma
- **Dark Mode First**: Varsayılan koyu tema, isteğe bağlı light mode

---

## 📦 Kurulum ve Çalıştırma

### Gereksinimler

- Node.js 18+
- npm

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/nsyasa/-Yeti-LAB.git
cd -Yeti-LAB
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Çevresel Değişkenleri Ayarlayın

Kök dizinde `.env` dosyası oluşturun ve Supabase bilgilerinizi ekleyin:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` (veya terminalde belirtilen port) adresine gidin.

> ⚠️ **Dev Server Güvenliği**: `npm run dev` sadece localhost'ta çalışır.
>
> - `--host` flag'i ile LAN'a expose etmeyin
> - Güvenilmeyen ağlarda dev server çalıştırmayın
> - Production için mutlaka `npm run build` kullanın

### 5. Supabase RLS Güvenliğini Uygulayın

**⚠️ ÖNEMLİ: Production ortamında mutlaka güvenli RLS politikalarını kullanın!**

#### Production İçin (ÖNERİLEN):

```bash
# Supabase SQL Editor'da çalıştırın:
sql/rls_content_admin.sql
```

Bu script:

- ✅ `courses`, `phases`, `projects`, `course_components` tablolarını güvenli hale getirir
- ✅ Sadece `content_admins` tablosundaki kullanıcılar write yapabilir
- ✅ Public read (courses/phases/projects), authenticated read (components)

#### ❌ KULLANMAYIN:

```bash
# Bu script DEPRECATED ve GÜVENSİZDİR:
sql/fix_permissions_INSECURE_DO_NOT_USE.sql
```

**Neden güvensiz?**

- Tüm authenticated kullanıcılar (öğrenciler dahil) kurs ekleyebilir/silebilir
- `auth.role() = 'authenticated'` → Herkes yazabilir
- Production'da CRITICAL güvenlik açığı yaratır

---

## 🧪 Testler

Proje, yazılım kalitesini korumak için kapsamlı test altyapısına sahiptir.

### Birim ve Entegrasyon Testleri (Vitest)

```bash
npm run test
```

### Uçtan Uca Testler (Playwright)

```bash
# Testleri çalıştır (Headless)
npx playwright test

# Test UI arayüzünü aç
npx playwright test --ui
```

---

## 📁 Proje Yapısı

```
-Yeti-LAB/
├── public/             # Statik dosyalar (Görseller, favicon vb.)
├── src/                # Ana giriş noktaları ve build kaynakları
│   ├── main.js         # Uygulama başlangıç noktası
│   ├── input.css       # Global CSS değişkenleri ve animasyonlar
│   └── style.css       # Tailwind v4 tema ve component layer
├── modules/            # Uygulama mantığı ve modüller
│   ├── admin/          # Admin paneli modülleri
│   ├── teacher/        # Öğretmen paneli modülleri
│   ├── routing/        # Router ve ViewLoader
│   ├── database/       # Supabase ve veri işlemleri
│   ├── assistant.js    # BANA SOR AI yardımcısı
│   ├── ui.js           # UI rendering (cards, tabs, dashboard)
│   └── ...
├── views/              # UI Bileşenleri ve Sayfa Tasarımları
│   ├── admin/          # Admin arayüz bileşenleri
│   ├── teacher/        # Öğretmen arayüz bileşenleri
│   ├── student/        # Öğrenci arayüz bileşenleri
│   └── profile/        # Profil sayfası
├── tests/              # Test dosyaları
│   ├── e2e/            # Playwright E2E testleri
│   ├── integration/    # Vitest entegrasyon testleri
│   └── unit/           # Birim testleri
├── data/               # Statik kurs verileri (Fallback)
│   ├── base.js         # Arduino projeleri
│   ├── microbit.js     # Micro:bit projeleri
│   ├── scratch.js      # Scratch projeleri
│   └── quiz.js         # Quiz veritabanı
└── index.html          # SPA giriş noktası
```

---

## 🎨 UI/UX Özellikleri

### Ana Sayfa

- **Hero Section**: Floating Yeti maskotu, responsive grid (mobilde 2 kolon)
- **Course Cards**: Glassmorphism efektli kart tasarımı, hover animasyonları
- **Level Badges**: Tooltip destekli seviye göstergeleri
- **Load More**: Dinamik içerik yükleme sistemi

### Dashboard (Ders Listesi)

- **Glassmorphic Lesson Cards**: Karanlık yarı saydam kartlar
- **Mini Progress Bars**: Her kartta turuncu-kırmızı gradient ilerleme
- **Phase Headers**: Parlayan ikonlar, gradient alt çizgi
- **Locked States**: Blur efekti ve kilit ikonu overlay

### Lesson Page (Research Lab)

- **Dark Content Panel**: #0F172A bazlı glassmorphism
- **Tab Navigation**: Glowing turuncu underline, ikon destekli sekmeler
- **Virtual Lab**: Pulsing "CANLI" badge, fullscreen toggle butonu
- **Navigation Buttons**: Brand gradient ile stilize edilmiş butonlar

### Mobile Bottom Navigation

- **Context-Aware Visibility**: Butonlar mevcut görünüme göre dinamik olarak gösterilir/gizlenir
    - Index'te: Sadece 🔍 (Ara) butonu
    - Kurs içinde: 🔍 + 📖 (Ders Listesi) butonları
- **Glassmorphic Bar**: Backdrop blur efekti (`bg-slate-900/95 backdrop-blur-xl`)
- **Active States**: Turuncu gradient indicator

---

## 🤖 AI Asistan (BANA SOR)

Yeti LAB, öğrencilere yardımcı olmak için kontekst-duyarlı bir AI asistan içerir:

### Özellikler

- 💬 **Kontekst-duyarlı Yanıtlar**: Hangi derste olduğunuza göre özel yardım
- 🎯 **Guided Mode**: Adım adım yönlendirme
- 📚 **Materyal Açıklamaları**: Devre elemanları hakkında detaylı bilgi
- 💡 **İpuçları**: Projeye özel pratik öneriler
- 🔬 **Kod Açıklamaları**: Anlık kod analizi

### Pozisyon

- Tüm sayfalarda (Ana Sayfa, Dashboard, Lesson) görünür
- Sağ alt köşede sabit pozisyon
- Mobilde bottom nav üzerinde (`bottom: 6rem`)
- Masaüstünde (`bottom: 1.5rem, right: 1.5rem`)

---

## 🧪 Simülasyon Geliştirme

Yeti LAB, her proje için özel interaktif simülasyonlar içerir. Yeni bir simülasyon eklemek için:

1.  **Tanımlama**: `data/course-*.js` içindeki manifest dosyasında projenizin `simType` (örn: `p5`, `canvas`) özelliğini belirtin.
2.  **Logic**: `modules/simulations/` altında yeni bir JS dosyası oluşturun (örn: `arduino-led-blink.js`).
3.  **Çizim**: `draw()` ve `setup()` fonksiyonlarını export edin.
4.  **Entegrasyon**: `SimManager.js` dosyasına yeni simülasyonunuzu kaydedin.

```javascript
// Örnek Simülasyon Yapısı
export const simulation = {
    setup(p) {
        p.createCanvas(400, 400);
    },
    draw(p) {
        p.background(220);
        // Simülasyon mantığı
    },
};
```

---

## 🎯 Stil Rehberi

### CSS Değişkenlerini Kullanma

```css
/* CTA Butonları */
.my-button {
    background: var(--cta-gradient);
    box-shadow: var(--shadow-cta);
}

/* Progress Bar */
.my-progress {
    background: var(--cta-gradient);
}

/* Glassmorphism Card */
.my-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
}

/* Responsive Heading */
h1 {
    font-size: var(--heading-h1);
}
```

### Tailwind Utilities

```html
<!-- Dark background -->
<div class="bg-[var(--lab-bg-dark)]"></div>

<!-- CTA Button -->
<button class="btn-cta-primary">Click Me</button>

<!-- Glassmorphic Container -->
<div class="lesson-content-panel">Content</div>

<!-- Level Badge -->
<span class="level-badge-enhanced" data-tooltip="Beginner">🌟 Seviye 1</span>
```

---

## 👥 Kullanıcı Rehberi

### 👨‍🎓 Öğrenci Girişi

1. Öğretmeninizden aldığınız **Sınıf Kodu** ile giriş yapın.
2. Adınızı girin ve avatarınızı seçin.
3. Size atanan rotaları takip ederek dersleri tamamlayın.

### 👩‍🏫 Öğretmen Girişi

1. E-posta veya GitHub ile giriş yapın.
2. **Kontrol Paneli** üzerinden yeni sınıflar oluşturun.
3. Öğrencilerinizi tek tek veya toplu liste olarak ekleyin.
4. "İlerleme Takibi" sekmesinden sınıfınızın durumunu canlı izleyin.

### 🛡️ Admin Girişi

1. Yetkili hesap ile giriş yapın.
2. **Admin Paneli** üzerinden yeni kurslar, projeler ve testler ekleyin.
3. Sistem genelindeki istatistikleri görüntüleyin.

---

## 🤝 Katkıda Bulunma

1. Forklayın
2. Feature branch oluşturun (`git checkout -b feature/yenilik`)
3. Commit leyin (`git commit -m 'Yeni özellik: X eklendi'`)
4. Pushlayın (`git push origin feature/yenilik`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

---

<p align="center">
  Made with ❄️ by Yeti LAB Team
</p>
