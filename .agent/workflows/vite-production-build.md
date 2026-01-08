---
description: Vite Production Build - Minik Adımlarla Güvenli Geçiş Planı
---

# 🚀 Vite Production Build Roadmap

**Tarih:** 8 Ocak 2026  
**Hedef:** Script tag'lerini birleştir, Tailwind CSS purge et, production-ready bundle oluştur  
**Risk Seviyesi:** Orta - Her adımda test gerekli

---

## 📊 Mevcut Durum Analizi

### Sorunlar:

1. **30+ ayrı `<script>` tag** - Her biri ayrı HTTP isteği
2. **83KB output.css** - Purge edilmemiş Tailwind
3. **Global namespace** - `window.X = X` pattern yaygın
4. **CDN bağımlılıkları** - Supabase, Chart.js external

### Mevcut Yapı:

```
index.html
├── <script src="modules/utils.js" defer>
├── <script src="modules/validators.js" defer>
├── <script src="modules/cache.js" defer>
├── ... (30+ script)
└── <script src="app.js" defer>
```

### Hedef Yapı:

```
index.html
├── <script src="assets/vendor-[hash].js"> (Supabase, Chart.js)
├── <script src="assets/app-[hash].js">    (Tüm modüller birleşik)
└── <link href="assets/style-[hash].css">  (Purge edilmiş ~15KB)
```

---

## ✅ FAZ 1: Test ve Doğrulama [ŞİMDİ]

**Risk:** Düşük | **Süre:** 15 dk

### Adım 1.1: Dev Server Test

```bash
npm run dev
```

- [ ] Site açılıyor mu?
- [ ] Console hatası var mı?
- [ ] Temel fonksiyonlar çalışıyor mu?

### Adım 1.2: Mevcut Build Test

```bash
npm run build
```

- [ ] Build başarılı mı?
- [ ] `dist/` klasörü oluştu mu?
- [ ] Hangi dosyalar oluşturuldu?

### Adım 1.3: Preview Test

```bash
npm run preview
```

- [ ] Production build çalışıyor mu?
- [ ] Console hatası var mı?

---

## ✅ FAZ 2: Tailwind CSS Optimizasyonu [ÖNCE]

**Risk:** Düşük | **Süre:** 30 dk

### Adım 2.1: Tailwind Config Güncelle

`tailwind.config.js` dosyasına views klasörünü ekle:

```javascript
content: [
    './*.html',
    './views/**/*.js',  // YENİ
    './modules/**/*.js',
    './data/*.js'
],
```

### Adım 2.2: CSS Input Dosyasını Güncelle

`styles/input.css` oluştur:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS imports */
@import './tokens.css';
@import './main.css';
@import './components.css';
```

### Adım 2.3: Build Script Test

```bash
npm run build:css
```

- [ ] output.css boyutu küçüldü mü? (Hedef: <20KB)

---

## ✅ FAZ 3: Vite Config Güncelleme [SONRA]

**Risk:** Orta | **Süre:** 1 saat

### Adım 3.1: External Dependencies Tanımla

CDN'den yüklenen kütüphaneleri external olarak işaretle:

```javascript
// vite.config.mjs
build: {
    rollupOptions: {
        external: ['@supabase/supabase-js'],
        output: {
            globals: {
                '@supabase/supabase-js': 'supabase'
            }
        }
    }
}
```

### Adım 3.2: Asset İsimlendirme

```javascript
build: {
    rollupOptions: {
        output: {
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
        }
    }
}
```

### Adım 3.3: Minification Ayarları

```javascript
build: {
    minify: 'terser',
    terserOptions: {
        compress: {
            drop_console: false, // Console.log'ları koru (debug için)
        }
    }
}
```

---

## ✅ FAZ 4: Global Namespace Koruma [KRİTİK]

**Risk:** Yüksek | **Süre:** 2 saat

### Sorun:

Mevcut kod `window.X = X` pattern kullanıyor. Vite bundle'lar modülleri izole edebilir.

### Çözüm 4.1: Entry Point Oluştur

`src/main.js` dosyası oluştur:

```javascript
// Global namespace'e modülleri ekle
import '../modules/utils.js';
import '../modules/validators.js';
// ... diğerleri
import '../app.js';

// Export globals for legacy compatibility
window.app = app;
```

### Çözüm 4.2: IIFE Wrapper Kullan

Her modülün sonundaki `window.X = X` kalıplarını koru.

### Test:

- [ ] `window.UI` mevcut mu?
- [ ] `window.Router` çalışıyor mu?
- [ ] `window.Store` state tutuyor mu?

---

## ✅ FAZ 5: HTML Script Tag Değişimi [SON]

**Risk:** Orta | **Süre:** 30 dk

### Adım 5.1: index.html'i Güncelle

Tüm script tag'lerini kaldır, tek entry point ekle:

```html
<!-- ÖNCE: 30+ script -->
<!-- SONRA: -->
<script type="module" src="/src/main.js"></script>
```

### Adım 5.2: Diğer HTML Dosyaları

- auth.html
- teacher.html
- profile.html
- admin.html
- student-dashboard.html

Her biri için aynı işlemi yap.

---

## ✅ FAZ 6: Production Deploy [TEST]

**Risk:** Düşük | **Süre:** 15 dk

### Adım 6.1: Final Build

```bash
npm run build
```

### Adım 6.2: Preview Test

```bash
npm run preview
```

### Adım 6.3: GitHub Pages Deploy

```bash
# dist klasörünü gh-pages branch'ine push et
```

---

## 📋 Kontrol Listesi

Her fazdan sonra kontrol et:

- [ ] Site yükleniyor
- [ ] Kurs seçimi çalışıyor
- [ ] Ders detayları açılıyor
- [ ] Simülasyonlar çalışıyor
- [ ] Login/logout çalışıyor
- [ ] Admin panel çalışıyor
- [ ] Console'da kritik hata yok

---

## 🚨 Rollback Planı

Eğer bir şey kırılırsa:

1. **Git ile geri al:**

    ```bash
    git checkout -- .
    ```

2. **Veya son commit'e dön:**

    ```bash
    git reset --hard HEAD~1
    ```

3. **Production'da sorun varsa:**
    - GitHub Pages'den eski build'i deploy et

---

## 📝 Notlar

- Her adımdan sonra `git commit` yap
- Production build'i test etmeden deploy etme
- Global namespace koruması kritik - atla!
