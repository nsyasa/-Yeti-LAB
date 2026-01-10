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
- ⚡ **Lazy Loading & Code Splitting**: Yüksek performanslı ve optimize edilmiş yükleme süreleri.
- 🤖 **Kapsamlı Müfredat**: 6+ farklı kurs modülü (Arduino, Micro:bit, App Inventor vb.).
- 🏫 **Öğretmen Paneli**: Sınıf yönetimi, öğrenci ekleme, ilerleme takibi ve detaylı analizler.
- 👨‍💼 **Admin Paneli**: Kurs içeriği, proje ve faz yönetimi için güçlü araçlar.
- 🏆 **Oyunlaştırma**: Rozetler, puan sistemi ve interaktif quizler.
- 🧪 **Test Odaklı Geliştirme**: Kapsamlı E2E (Playwright) ve Entegrasyon (Vitest) testleri.

---

## 🛠️ Teknolojiler

| Kategori       | Teknolojiler                                        |
| -------------- | --------------------------------------------------- |
| **Frontend**   | Vanilla JS (ES6+), HTML5, CSS3                      |
| **Build Tool** | **Vite** (Production Optimization)                  |
| **Styling**    | **Tailwind CSS**                                    |
| **Backend**    | **Supabase** (Auth, Postgres DB, Realtime)          |
| **Testing**    | **Playwright** (E2E), **Vitest** (Unit/Integration) |
| **CI/CD**      | **GitHub Actions** (Automated Testing & Deployment) |

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
├── modules/            # Uygulama mantığı ve modüller
│   ├── admin/          # Admin paneli modülleri
│   ├── teacher/        # Öğretmen paneli modülleri
│   ├── routing/        # Router ve ViewLoader
│   ├── database/       # Supabase ve veri işlemleri
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
└── index.html          # SPA giriş noktası
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
