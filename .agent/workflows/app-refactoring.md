---
description: app.js Modüler Refactoring - 1162 satırlık dosyayı küçük modüllere bölme planı
---

# app.js Modüler Refactoring Planı

## 📊 Mevcut Durum Analizi

**Dosya:** `app.js` - 1162 satır, ~45KB

### Tespit Edilen Fonksiyon Grupları:

| Grup                 | Satır Aralığı    | Satır Sayısı | Açıklama                                   |
| -------------------- | ---------------- | ------------ | ------------------------------------------ |
| State Proxy          | 1-67             | ~67          | Store ile senkronizasyon                   |
| Simulation           | 69-86, 1079-1148 | ~90          | simLoop, runSimLoop, setupSimulation       |
| Progress Delegation  | 88-98            | ~10          | Progress modülüne delege                   |
| Init & Auth          | 100-224          | ~125         | Uygulama başlatma, auth işlemleri          |
| localStorage Restore | 225-325          | ~100         | XSS korumalı veri restore                  |
| Theme & UI           | 327-355          | ~30          | Tema, dil değiştirme                       |
| Route Handler        | 357-481          | ~125         | SPA routing (handleRouteChange)            |
| View Loaders         | 483-810          | ~330         | Admin/Teacher/Profile/Student view loaders |
| Course Selection     | 812-892          | ~80          | renderCourseSelection, selectCourse        |
| Dashboard & Project  | 894-970          | ~75          | renderDashboard, loadProject               |
| Explorer & Hotspots  | 972-1006         | ~35          | setupExplorer, hotspot işlemleri           |
| Quiz & Tips          | 1008-1077        | ~70          | getPracticalTip, checkAnswer, renderTabs   |
| Sidebar              | 1150-1162        | ~12          | toggleSidebar, renderSidebar               |

---

## 🎯 Refactoring Stratejisi

### Temel Prensipler:

1. **Sıfır Risk**: Her adımdan sonra uygulama çalışır durumda olmalı
2. **Geriye Uyumluluk**: `app.xxx()` şeklindeki tüm çağrılar çalışmaya devam etmeli
3. **Aşamalı Geçiş**: Bir modül bir seferde, test edilip commit edilerek
4. **Bağımlılık Takibi**: Modüller arasındaki bağımlılıklar net olmalı

### Önerilen Modüller:

```
modules/
├── core/
│   ├── stateProxy.js      # State proxy mantığı (67 satır)
│   ├── init.js            # App init ve auth (~100 satır)
│   └── localStorage.js    # restoreFromLocalStorage (~100 satır)
├── routing/
│   └── viewLoader.js      # loadAdminView, loadTeacherView, etc. (~330 satır)
├── simulation/
│   └── simController.js   # setupSimulation, runSimLoop (~90 satır)
├── course/
│   └── courseUI.js        # selectCourse, renderCourseSelection (~80 satır)
└── project/
    └── projectUI.js       # loadProject, renderDashboard, renderTabs (~145 satır)
```

---

## 📋 Adım Adım Uygulama Planı

### FAZ 1: En Bağımsız Modülden Başla (Düşük Risk) ⭐

**Hedef:** `stateProxy.js` - En az bağımlılığa sahip, izole edilmiş kod

#### 1.1 stateProxy.js Oluştur

```javascript
// modules/core/stateProxy.js
// createStateProxy fonksiyonunu buraya taşı
window.StateProxy = {
    create: createStateProxy,
};
```

#### 1.2 app.js'te Import Et

```javascript
// app.js başında
// const createStateProxy = ... KALDIR
// Bunun yerine:
const createStateProxy = window.StateProxy?.create || (() => ({}));
```

#### 1.3 Test Et

- `npm run lint`
- `npm run test`
- Manuel test: Ana sayfa yüklenmeli, kurs seçimi çalışmalı

---

### FAZ 2: localStorage Modülü (Düşük Risk) ⭐

**Hedef:** `restoreFromLocalStorage` fonksiyonunu ayır

#### 2.1 localStorage.js Oluştur

```javascript
// modules/core/localStorage.js
window.LocalStorageManager = {
    restoreFromLocalStorage: () => { ... }
};
```

#### 2.2 app.js'te Delegate Et

```javascript
restoreFromLocalStorage: () => {
    if (window.LocalStorageManager?.restoreFromLocalStorage) {
        return window.LocalStorageManager.restoreFromLocalStorage();
    }
    // Fallback: eski kod buraya (silme, sadece fallback olarak tut)
};
```

#### 2.3 Test Et

- localStorage'dan veri yükleme test edilmeli
- Admin paneli açılmalı

---

### FAZ 3: View Loader Modülü (Orta Risk) ⭐⭐

**Hedef:** En büyük chunk - View loader fonksiyonlarını ayır

Bu faz en kritik çünkü ~330 satır taşınacak. Dikkatli olmalıyız.

#### 3.1 viewLoader.js Oluştur

```javascript
// modules/routing/viewLoader.js
window.ViewLoader = {
    loadAdminView: async (route) => { ... },
    loadAdminScripts: async () => { ... },
    loadTeacherView: async (route) => { ... },
    loadTeacherScripts: async () => { ... },
    loadProfileView: async (route) => { ... },
    loadProfileScripts: async () => { ... },
    loadStudentDashboardView: async () => { ... },
    loadStudentDashboardScripts: async () => { ... },
    loadScript: (src) => { ... },
    _loadedScripts: new Set()
};
```

#### 3.2 app.js'te Delegate Et

```javascript
loadAdminView: async (route) => {
    return window.ViewLoader?.loadAdminView(route);
},
// ... diğer fonksiyonlar
```

#### 3.3 Test Et

- Admin panele git
- Teacher panele git
- Profile sayfasına git
- Student dashboard'a git

---

### FAZ 4: Simulation Controller (Orta Risk) ⭐⭐

**Hedef:** Simülasyon mantığını ayır

#### 4.1 simController.js Oluştur

```javascript
// modules/simulation/simController.js
window.SimController = {
    state: { val1: 0, val2: 0, active: false, ... },
    loop: null,
    chartInstance: null,
    lastFrameTime: 0,
    targetFPS: 30,

    stop: () => { ... },
    setup: (type) => { ... },
    runLoop: (ctx, type) => { ... }
};
```

#### 4.2 app.js'te Delegate Et

```javascript
simState: window.SimController?.state || { val1: 0, ... },
stopSimulation: () => window.SimController?.stop?.(),
setupSimulation: (type) => window.SimController?.setup?.(type),
runSimLoop: (ctx, type) => window.SimController?.runLoop?.(ctx, type)
```

#### 4.3 Test Et

- Herhangi bir proje aç
- Simülasyon çalışmalı
- Canvas animasyonu düzgün olmalı

---

### FAZ 5: Course UI (Düşük Risk) ⭐

**Hedef:** Kurs seçim UI fonksiyonlarını ayır

#### 5.1 courseUI.js Oluştur veya mevcut courseLoader.js'i genişlet

Bu şu anda courseLoader.js var, ona eklemek daha mantıklı olabilir.

```javascript
// modules/courseLoader.js'e ekle
CourseLoader.renderSelection = (updateHistory) => { ... };
CourseLoader.select = async (key, event, updateHistory) => { ... };
```

#### 5.2 Test Et

- Ana sayfa kurs kartları görünmeli
- Kurs seçimi çalışmalı

---

### FAZ 6: Project UI (Düşük Risk) ⭐

**Hedef:** Proje UI fonksiyonlarını ayır

#### 6.1 projectUI.js Oluştur

```javascript
// modules/project/projectUI.js
window.ProjectUI = {
    load: (id, updateHistory) => { ... },
    renderDashboard: () => { ... },
    renderTabs: (project) => { ... },
    getPracticalTip: (project) => { ... },
    checkAnswer: (qIndex, optIndex, trueIndex, btn) => { ... }
};
```

#### 6.2 Test Et

- Proje açma çalışmalı
- Tablar görünmeli
- Quiz cevaplama çalışmalı

---

## 🔍 Bağımlılık Haritası

```
app.js
├── StateProxy (bağımsız)
├── LocalStorageManager (Validators, courseData)
├── ViewLoader (UI, ViewManager, Store)
├── SimController (Chart.js, Simulations)
├── CourseLoader (mevcut, UI)
└── ProjectUI (UI, Progress, componentInfo)
```

---

## ✅ Her Faz Sonrası Kontrol Listesi

- [ ] `npm run lint` - Lint hataları yok
- [ ] `npm run test` - Testler geçiyor
- [ ] Manuel Test: Ana sayfa yükleniyor
- [ ] Manuel Test: Kurs seçimi çalışıyor
- [ ] Manuel Test: Proje açılıyor
- [ ] Manuel Test: Admin panel çalışıyor
- [ ] Git Commit: Faz tamamlandı

---

## 🚀 Önerilen Başlangıç

**FAZ 1 ile başlayalım:** `stateProxy.js`

Bu en güvenli seçenek çünkü:

1. İzole kod (dışarıya bağımlılığı yok)
2. Küçük (67 satır)
3. Hata durumunda fallback var
4. Test etmesi kolay

Devam etmemi ister misiniz?

---

## 📝 Notlar

- Her faz sonrası commit atılmalı
- Modüller `window.xxx` şeklinde global scope'a eklenmeli (mevcut yapıya uyum için)
- İleride ES Modules'e geçiş planlanabilir ama şimdilik geriye uyumluluk önemli
- Test coverage artırılmalı (mevcut testlere ek olarak)
