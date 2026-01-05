---
description: SPA/MPA Hibrit Mimariden Gerçek SPA'ya Geçiş Planı
---

# 🚀 SPA Migration Roadmap

## 📊 Mevcut Durum Analizi

### ✅ Yapılanlar (Zaten Tamamlanmış)

1. **Router Modülü** (`modules/router.js`) - URL query string yönetimi ✓
2. **Store Modülü** (`modules/store/store.js`) - Basit state management ✓
3. **MainLayout Sistemi** - Navbar/Footer dinamik render ✓
4. **Component Ayrımı** - Navbar.js, Footer.js modülleri ✓
5. **View Switching** - UI.switchView() ile görünüm değiştirme ✓

### ❌ Yapılmamışlar (Bu Roadmap)

1. Hash-based veya History API routing YOK
2. Sayfalar arası `window.location.href` ile hard redirect var (20+ yerde)
3. Her HTML sayfası kendi script'lerini ayrı yüklüyor
4. Ortak shell/layout yok - her sayfa bağımsız
5. Route guards / middleware sistemi yok

---

## 🎯 FAZLAR

---

## FAZ 1: Router Güçlendirme ✅ TAMAMLANDI

**Durum:** ✅ Tamamlandı  
**Başlangıç:** 2026-01-05  
**Bitiş:** 2026-01-05

### Adım 1.1: Router Konfigürasyon Sabitleri Ekle ✅ TAMAMLANDI

- [x] `mode` property ekle (hash/history)
- [x] `routes` objesi ekle (path → view mapping)
- [x] `currentRoute` state ekle

**Dosya:** `modules/router.js`  
**Kod Değişikliği:**

```javascript
const Router = {
    // YENİ: Konfigürasyon
    mode: 'hash', // 'hash' veya 'history'
    currentRoute: null,

    // YENİ: Route tanımları
    routes: {
        '': 'home',
        'course/:key': 'course',
        'course/:key/project/:id': 'project',
    },

    // ... mevcut kod
};
```

---

### Adım 1.2: Hash Parse Fonksiyonu Ekle ✅ TAMAMLANDI

- [x] `parseHash()` fonksiyonu ekle
- [x] Hash'ten path ve params çıkar

**Dosya:** `modules/router.js`  
**Kod Değişikliği:**

```javascript
// YENİ: Hash URL'yi parse et
// Örn: #/course/arduino → { path: 'course/arduino', segments: ['course', 'arduino'] }
parseHash() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.startsWith('/') ? hash.slice(1) : hash;
    const segments = path.split('/').filter(Boolean);
    return { path, segments };
},
```

---

### Adım 1.3: Route Matching Fonksiyonu Ekle ✅ TAMAMLANDI

- [x] `matchRoute()` fonksiyonu ekle
- [x] Dynamic params desteği (`:key`, `:id`)
- [x] Match sonucu: { route, params }

**Dosya:** `modules/router.js`  
**Kod Değişikliği:**

```javascript
// YENİ: Route eşleştir
// Örn: path='course/arduino' → { route: 'course', params: { key: 'arduino' } }
matchRoute(path) {
    const segments = path.split('/').filter(Boolean);

    for (const [pattern, routeName] of Object.entries(this.routes)) {
        const patternSegments = pattern.split('/').filter(Boolean);

        if (patternSegments.length !== segments.length) continue;

        const params = {};
        let match = true;

        for (let i = 0; i < patternSegments.length; i++) {
            if (patternSegments[i].startsWith(':')) {
                // Dynamic param
                const paramName = patternSegments[i].slice(1);
                params[paramName] = segments[i];
            } else if (patternSegments[i] !== segments[i]) {
                match = false;
                break;
            }
        }

        if (match) {
            return { route: routeName, params };
        }
    }

    return { route: 'home', params: {} };
},
```

---

### Adım 1.4: navigate() Fonksiyonu Ekle ✅ TAMAMLANDI

- [x] `navigate(path)` fonksiyonu ekle
- [x] Hash veya History API kullan
- [x] Store event emit et

**Dosya:** `modules/router.js`  
**Kod Değişikliği:**

```javascript
// YENİ: Programatik navigasyon
// Örn: Router.navigate('/course/arduino')
navigate(path) {
    if (this.mode === 'hash') {
        window.location.hash = path.startsWith('/') ? path : '/' + path;
    } else {
        window.history.pushState({}, '', path);
        this.handleRouteChange();
    }
},
```

---

### Adım 1.5: handleRouteChange() Fonksiyonu Ekle ✅ TAMAMLANDI

- [x] Mevcut URL'yi parse et
- [x] Route'u eşleştir
- [x] Store event emit et
- [x] Gerekli view'ı yükle

**Dosya:** `modules/router.js`  
**Kod Değişikliği:**

```javascript
// YENİ: Route değişikliğini işle
handleRouteChange() {
    const { path } = this.parseHash();
    const { route, params } = this.matchRoute(path);

    this.currentRoute = { route, params, path };

    console.log(`[Router] Route: ${route}`, params);

    // Store event sistemi varsa kullan
    if (window.Store && Store.emit) {
        Store.emit('route:change', this.currentRoute);
    }
},
```

---

### Adım 1.6: Hashchange Listener Ekle ✅ TAMAMLANDI

- [x] `hashchange` event listener ekle
- [x] init() fonksiyonunu güncelle

**Dosya:** `modules/router.js`  
**Kod Değişikliği:**

```javascript
// init() içine EKLENDİ:
if (Router.mode === 'hash') {
    window.addEventListener('hashchange', () => Router.handleRouteChange());
}
```

---

### Adım 1.7: Backward Compatibility - Query String Desteği Koru ✅ TAMAMLANDI

- [x] Eski URL formatını kontrol et (`?course=arduino`)
- [x] Hash yoksa query string'den oku
- [x] Otomatik hash'e dönüştür (opsiyonel)

**Dosya:** `modules/router.js`  
**Kod Değişikliği:**

```javascript
// YENİ: Eski format kontrolü
checkLegacyParams() {
    const params = new URLSearchParams(window.location.search);
    const course = params.get('course');
    const project = params.get('project');

    if (course) {
        // Eski format tespit edildi, hash'e çevir
        let newPath = `/course/${course}`;
        if (project) {
            newPath += `/project/${project}`;
        }
        // Query params'ı temizle ve hash'e yönlendir
        window.history.replaceState({}, '', window.location.pathname);
        this.navigate(newPath);
        return true;
    }
    return false;
},
```

---

### Adım 1.8: Test Et ✅ TAMAMLANDI (2026-01-05)

- [x] Tarayıcıda `/#/course/arduino` gir → ✅ Çalışıyor
- [x] Konsola `[Router] Route: course { key: 'arduino' }` yazdırılmalı → ✅ Yazdırılıyor
- [x] Router.navigate() çalışmalı → ✅ Hash doğru güncelleniyor
- [x] Tüm yeni metodlar mevcut → ✅ parseHash, matchRoute, navigate, handleRouteChange, checkLegacyParams

---

### ✅ Faz 1 Tamamlandı!

- Hash-based routing çalışır
- Route parametreleri parse edilir
- Store'a event emit edilir
- Eski URL formatı korunur

### Adım 1.1: Hash Router Desteği Ekle

**Dosya:** `modules/router.js`

Mevcut router sadece query string (`?course=arduino`) kullanıyor.
Hash routing (`#/course/arduino`) veya path routing (`/course/arduino`) ekle.

```javascript
// EKLENECEK: Hash-based routing desteği
const Router = {
    mode: 'hash', // 'hash' | 'history'

    routes: {
        '/': 'home',
        '/course/:key': 'course',
        '/course/:key/project/:id': 'project',
        '/auth': 'auth',
        '/profile': 'profile',
        '/teacher': 'teacher',
        '/admin': 'admin',
    },

    navigate(path) {
        if (this.mode === 'hash') {
            window.location.hash = path;
        } else {
            history.pushState({}, '', path);
        }
        this.handleRoute();
    },

    handleRoute() {
        const path = this.mode === 'hash' ? window.location.hash.slice(1) || '/' : window.location.pathname;

        // Route matching ve view rendering
        Store.emit('route:change', { path });
    },
};
```

### Adım 1.2: Route Change Event Listener

**Dosya:** `modules/router.js`

```javascript
// EKLENECEK: Global route listener
init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('popstate', () => this.handleRoute());

    // İlk yükleme
    this.handleRoute();
}
```

---

## FAZ 2: Hard Redirect'leri Kaldır 🟡 DEVAM EDİYOR

**Durum:** 🟡 Devam Ediyor (Module dosyaları tamamlandı, inline script'ler beklemede)  
**Başlangıç:** 2026-01-05

### Adım 2.1: redirectTo() Fonksiyonu Ekle ✅ TAMAMLANDI

- [x] `redirectTo(page)` fonksiyonu router.js'e ekle
- [x] HTML dosya → hash route mapping tanımla
- [x] Fallback olarak eski davranışı koru

**Dosya:** `modules/router.js`

---

### Adım 2.2: app.js İçindeki Redirect'leri Değiştir ✅ TAMAMLANDI

- [x] Satır 134: `window.location.href = 'profile.html'` → `Router.redirectTo('profile.html')`
- [x] Satır 173: `window.location.href = 'profile.html'` → `Router.redirectTo('profile.html')`
- [x] Satır 281: `window.location.href = 'auth.html'` → `Router.redirectTo('auth.html')`

**Dosya:** `app.js`

---

### Adım 2.3: profile.js İçindeki Redirect'leri Değiştir ✅ TAMAMLANDI

- [x] Satır 23: `window.location.href = 'auth.html'`
- [x] Satır 67: `window.location.href = 'index.html'`
- [x] Satır 164: `window.location.href = 'index.html'`
- [x] Satır 556: `window.location.href = 'auth.html'`

**Dosya:** `modules/profile.js`

---

### Adım 2.4: progress.js İçindeki Redirect'leri Değiştir ✅ TAMAMLANDI

- [x] Satır 198: `window.location.href = 'auth.html'`

**Dosya:** `modules/progress.js`

---

### Adım 2.5: ui.js İçindeki Redirect'leri Değiştir ✅ TAMAMLANDI

- [x] Satır 344: `window.location.href = 'auth.html'`

**Dosya:** `modules/ui.js`

---

### Adım 2.6: teacher-manager.js İçindeki Redirect'leri Değiştir ✅ TAMAMLANDI

- [x] Satır 36: `window.location.href = 'auth.html'`
- [x] Satır 44: `window.location.href = 'index.html'`

**Dosya:** `modules/teacher-manager.js`

---

### Adım 2.7: Navbar.js İçindeki Redirect'leri Değiştir ✅ TAMAMLANDI

- [x] Satır 18: `onclick="window.location.href='index.html'"` → `onclick="Router.redirectTo('index.html')"`

**Dosya:** `modules/components/Navbar.js`

---

### Adım 2.8: auth.html İçindeki Inline Script Redirect'leri ⏳ BEKLEMEDE

- [ ] Satır 734, 743, 749, 1090, 1112: `window.location.href = 'index.html'`

**NOT:** Bu adım inline script olduğu için karmaşık. Faz 5'te ele alınacak.

---

### Adım 2.9: student-dashboard.html İçindeki Redirect'leri ⏳ BEKLEMEDE

- [ ] Satır 173: `window.location.href = 'auth.html'`
- [ ] Satır 197: `window.location.href = 'index.html'`

**NOT:** Bu adım inline script olduğu için karmaşık. Faz 5'te ele alınacak.

---

### Adım 2.10: Test Et ✅ TAMAMLANDI (2026-01-05)

- [x] Router.redirectTo('auth.html') → hash: `#/auth` ✅
- [x] Router.navigate('/course/arduino') → hash: `#/course/arduino` ✅
- [x] Konsol hatası yok ✅

**Test Detayları:**

- `typeof Router.redirectTo === 'function'` → TRUE
- `Router.redirectTo('auth.html')` → Eski format `auth.html` başarıyla `#/auth`'a dönüştürüldü
- `Router.navigate('/course/arduino')` → Hash doğru güncellendi

---

## FAZ 3: View Container Sistemi ✅ TAMAMLANDI

**Durum:** ✅ Tamamlandı  
**Başlangıç:** 2026-01-05  
**Bitiş:** 2026-01-05

### Adım 3.1: Route Event Handler'ı app.js'e Entegre Et ✅ TAMAMLANDI

- [x] Store.on('route:change') listener eklendi - app.init() içinde
- [x] Route'a göre mevcut view'ları göster/gizle
- [x] Mevcut UI.switchView() fonksiyonunu kullanıyor

**Dosya:** `app.js`

---

### Adım 3.2: Hash Route'ları Mevcut View'lara Bağla ✅ TAMAMLANDI

- [x] `#/` → course-selection-view (renderCourseSelection)
- [x] `#/course/:key` → selectCourse() çağırıyor
- [x] `#/course/:key/project/:id` → loadProject() çağırıyor

**Dosya:** `app.js` - handleRouteChange() fonksiyonu eklendi

---

### Adım 3.3: Test Et ✅ TAMAMLANDI (2026-01-05)

- [x] `/#/course/arduino` girince kurs açılıyor ✅
- [x] `/#/course/arduino/project/0` girince proje açılıyor ✅
- [x] `/#/` girince ana sayfa açılıyor ✅
- [x] Console logları doğru: `[App] Route change: course {key: 'arduino'}` ✅

---

### Adım 3.2: View Templates Oluştur

**Yeni klasör:** `views/`

```
views/
├── home.js          # Kurs seçim ekranı
├── course.js        # Dashboard (proje listesi)
├── project.js       # Proje detay
├── auth.js          # Giriş/Kayıt
├── profile.js       # Profil ayarları
├── teacher.js       # Öğretmen paneli
└── admin.js         # Admin paneli
```

**Örnek view yapısı:**

```javascript
// views/home.js
export const HomeView = {
    template: () => `
        <div id="course-selection-view" class="fade-in pb-10">
            <div class="text-center...">
                <h2>İçindeki Yeti'yi Keşfet</h2>
            </div>
            <div id="course-list" class="grid..."></div>
        </div>
    `,

    mount(container) {
        container.innerHTML = this.template();
        this.loadCourses();
    },

    async loadCourses() {
        // Kurs yükleme mantığı
    },

    unmount() {
        // Cleanup
    },
};
```

### Adım 3.3: View Manager Oluştur

**Dosya:** `modules/viewManager.js`

```javascript
const ViewManager = {
    currentView: null,
    container: null,

    init() {
        this.container = document.getElementById('app-content');

        // Route değişikliklerini dinle
        Store.on('route:change', ({ path }) => {
            this.renderView(path);
        });
    },

    async renderView(path) {
        // Mevcut view'ı temizle
        if (this.currentView?.unmount) {
            this.currentView.unmount();
        }

        // Yeni view'ı yükle
        const view = await this.resolveView(path);

        // Transition animasyonu
        this.container.classList.add('fade-out');
        await this.wait(150);

        view.mount(this.container);

        this.container.classList.remove('fade-out');
        this.container.classList.add('fade-in');

        this.currentView = view;
    },

    async resolveView(path) {
        // Route → View mapping
        const routes = {
            '/': () => import('../views/home.js'),
            '/course/:key': () => import('../views/course.js'),
            '/auth': () => import('../views/auth.js'),
            // ...
        };

        // Path matching mantığı
    },

    wait(ms) {
        return new Promise((r) => setTimeout(r, ms));
    },
};
```

---

## FAZ 4: Auth/Profile Entegrasyonu ✅ TAMAMLANDI

**Durum:** ✅ Tamamlandı  
**Başlangıç:** 2026-01-05  
**Bitiş:** 2026-01-05

> ⚠️ **ÖNEMLİ:** `admin.html` ve `teacher.html` ayrı HTML sayfaları olarak KALDI!
> SPA hash routing sadece index.html içindeki view'lar için kullanılıyor.

### Adım 4.1: Router'a Route Tanımları Güncellendi ✅ TAMAMLANDI

- [x] `separatePages` array'i eklendi - ayrı HTML sayfaları listesi
- [x] `spaRoutes` objesi eklendi - sadece index.html içindeki view'lar

**Dosya:** `modules/router.js`

---

### Adım 4.2: redirectTo() Fonksiyonu Güncellendi ✅ TAMAMLANDI

- [x] auth.html → Hard redirect (ayrı sayfa)
- [x] profile.html → Hard redirect (ayrı sayfa)
- [x] teacher.html → Hard redirect (ayrı sayfa)
- [x] admin.html → Hard redirect (ayrı sayfa)
- [x] index.html → SPA hash routing

**Dosya:** `modules/router.js`

---

### Adım 4.3: Test Et ✅ TAMAMLANDI (2026-01-05)

- [x] `Router.redirectTo('auth.html')` → Hard redirect gerçekleşti ✅
- [x] Console log: `[Router] Separate page redirect: auth.html` ✅
- [x] admin.html, teacher.html, profile.html bağımsız çalışıyor ✅

---

## FAZ 5: Inline Script'leri Taşı (3-4 saat)

### Adım 5.1: auth.html İçindeki Script'leri Modüle Taşı

**Mevcut:** `auth.html` içinde 500+ satır inline JavaScript

**Hedef:**

- `views/auth.js` - View template ve lifecycle
- `modules/authForm.js` - Form validation ve submit logic

### Adım 5.2: student-dashboard.html İçindeki Script'leri Taşı

**Mevcut:** `student-dashboard.html` içinde inline script

**Hedef:**

- `views/studentDashboard.js` - View olarak

### Adım 5.3: teacher.html İçindeki Script'leri Taşı

Zaten `teacher-manager.js` var ama inline script'ler de mevcut.

### Adım 5.4: admin.html İçindeki Script'leri Taşı

`admin.js` ve alt modüller var ama HTML'de de script var.

---

## FAZ 6: Single Entry Point (2-3 saat)

### Adım 6.1: app.js'i Entry Point Yap

**Dosya:** `app.js`

```javascript
// GÜNCELLENECEK: Tek başlangıç noktası
const App = {
    async init() {
        // 1. Core modülleri başlat
        await Store.init();
        await Auth.init();

        // 2. Layout'u render et
        MainLayout.init();

        // 3. Router'ı başlat (bu view'ı yükleyecek)
        Router.init();

        // 4. Global event listeners
        this.setupGlobalListeners();
    },

    setupGlobalListeners() {
        // Theme, language, keyboard shortcuts...
    },
};

// DOM hazır olunca başlat
document.addEventListener('DOMContentLoaded', () => App.init());
```

### Adım 6.2: HTML Dosyalarını Sadeleştir

**index.html** tek entry point olacak. Diğer HTML'ler:

- `auth.html` → `/#/auth` route'una
- `profile.html` → `/#/profile` route'una
- `teacher.html` → `/#/teacher` route'una (veya ayrı kalabilir - complexity)
- `admin.html` → `/#/admin` route'una (veya ayrı kalabilir - complexity)

**NOT:** Teacher ve Admin panelleri çok büyük (60-80KB HTML).
Bunları SPA'ya taşımak yerine ayrı "mini-app" olarak bırakmak daha mantıklı olabilir.

---

## FAZ 7: Code Splitting & Lazy Loading (2-3 saat)

### Adım 7.1: Vite Dynamic Import Kullan

```javascript
// Kurs verisi lazy load
const loadCourseData = async (key) => {
    const module = await import(`./data/${key}.js`);
    return module.default;
};
```

### Adım 7.2: Route-based Code Splitting

```javascript
const routes = {
    '/': () => import('./views/home.js'),
    '/auth': () => import('./views/auth.js'),
    '/profile': () => import('./views/profile.js'),
    // Admin ve Teacher büyük olduğu için ayrı chunk
    '/teacher': () => import(/* webpackChunkName: "teacher" */ './views/teacher.js'),
    '/admin': () => import(/* webpackChunkName: "admin" */ './views/admin.js'),
};
```

---

## 📋 ÖZET TAKVİM

| Faz                         | Süre     | Öncelik   | Bağımlılık |
| --------------------------- | -------- | --------- | ---------- |
| Faz 1: Router Güçlendirme   | 1-2 saat | 🔴 Kritik | -          |
| Faz 2: Hard Redirect Kaldır | 2-3 saat | 🔴 Kritik | Faz 1      |
| Faz 3: View Container       | 3-4 saat | 🟡 Yüksek | Faz 1, 2   |
| Faz 4: Auth Entegrasyon     | 2-3 saat | 🟡 Yüksek | Faz 1, 3   |
| Faz 5: Inline Script Taşı   | 3-4 saat | 🟢 Orta   | Faz 3      |
| Faz 6: Single Entry         | 2-3 saat | 🟢 Orta   | Faz 3, 5   |
| Faz 7: Code Splitting       | 2-3 saat | 🔵 Düşük  | Faz 6      |

**Toplam Tahmini Süre:** 15-22 saat

---

## 🎯 MVP Hedefi (İlk 2 Faz)

Sadece Faz 1 ve Faz 2 tamamlandığında:

- ✅ Hash-based URL'ler çalışır (`/#/course/arduino`)
- ✅ Geri/ileri butonları düzgün çalışır
- ✅ Hard redirect'ler kaldırılmış olur
- ✅ Mevcut işlevsellik korunur

Bu MVP sonrası kalan fazlar aşamalı yapılabilir.

---

## ⚠️ Dikkat Edilecekler

1. **Backward Compatibility:** Eski URL'ler (`?course=arduino`) çalışmaya devam etmeli
2. **SEO:** Hash routing SEO için iyi değil ama bu bir eğitim uygulaması, kritik değil
3. **Teacher/Admin:** Bu paneller büyük, SPA'ya taşımak riskli - ayrı tutulabilir
4. **Test:** Her fazdan sonra manuel test şart

---

// turbo-all
