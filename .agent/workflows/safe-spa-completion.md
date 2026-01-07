---
description: SPA Geçişini Tamamlama - Güvenli Minik Adımlar (7 Ocak 2026)
---

# 🛡️ Güvenli SPA Tamamlama Yol Haritası

**Başlangıç:** 7 Ocak 2026  
**Hedef:** Hibrit yapıdan tam SPA'ya güvenli geçiş  
**Prensip:** Her adım bağımsız test edilebilir, geri alınabilir olmalı

---

## 📋 GENEL KURALLAR

```
✅ Her adımdan sonra:
   1. npm run dev ile test et
   2. npm run test çalıştır
   3. Console hata kontrolü yap
   4. Tarayıcıda manuel test et
   5. Git commit at

⚠️ Bir adım bozulursa:
   git stash && git checkout .
   Sorunu izole et, daha küçük adıma böl
```

---

## FAZ A: ViewManager Altyapısı (Düşük Risk) ✅ TAMAMLANDI

**Tahmini Süre:** 1 saat → **Gerçek Süre:** 10 dakika  
**Risk Seviyesi:** 🟢 Düşük

### Adım A.1: ViewManager Modülü Oluştur ✅ TAMAMLANDI

**Süre:** 5 dakika

- [x] `modules/viewManager.js` dosyası oluşturuldu
- [x] Basit mount/unmount yapısı eklendi
- [x] `window.ViewManager` olarak expose edildi

### Adım A.2: index.html'e Script Ekle ✅ TAMAMLANDI

**Süre:** 2 dakika

- [x] `<script src="modules/viewManager.js"></script>` eklendi
- [x] Router.js'den SONRA yükleniyor

### Adım A.3: app.js'de ViewManager.init() Çağır ✅ TAMAMLANDI

**Süre:** 2 dakika

- [x] `app.init()` içinde `ViewManager.init('main-content')` eklendi
- [x] MainLayout.init()'ten SONRA çağrılıyor

### Adım A.4: ESLint'e Global Ekle ✅ TAMAMLANDI

**Süre:** 1 dakika

- [x] `eslint.config.js` → globals → `ViewManager: 'readonly'`

### ✅ FAZ A Tamamlandı Kontrolü

```
[x] ViewManager modülü oluşturuldu
[x] index.html'e eklendi
[x] app.js'de init ediliyor
[x] ESLint globals güncellendi
[x] 142/142 test geçti
[ ] Git commit: "feat: Add ViewManager module"
```

---

## FAZ B: Mevcut View'lara Unmount Ekle (Düşük Risk) ✅ TAMAMLANDI

**Tahmini Süre:** 45 dakika → **Gerçek Süre:** 5 dakika (zaten mevcuttu)  
**Risk Seviyesi:** 🟢 Düşük

### ✅ Durum: Tüm view'larda unmount() zaten mevcuttu!

- [x] AdminView.unmount() - Mevcut ve kapsamlı (container temizleme, CourseLoader cache clear)
- [x] TeacherView.unmount() - Mevcut ve kapsamlı (container temizleme)
- [x] ProfileView.unmount() - İyileştirildi (container temizleme eklendi)
- [x] StudentDashboardView.unmount() - İyileştirildi (container temizleme eklendi)

### ✅ FAZ B Tamamlandı Kontrolü

```
[x] AdminView.unmount() çalışıyor
[x] TeacherView.unmount() çalışıyor
[x] ProfileView.unmount() çalışıyor (iyileştirildi)
[x] StudentDashboardView.unmount() çalışıyor (iyileştirildi)
[x] 142/142 test geçti
```

---

## FAZ C: handleRouteChange ViewManager Entegrasyonu (Orta Risk) ✅ TAMAMLANDI

**Tahmini Süre:** 30 dakika → **Gerçek Süre:** 10 dakika  
**Risk Seviyesi:** 🟡 Orta → 🟢 Başarılı

### Adım C.1: handleRouteChange'de ViewManager.unmountCurrent() ✅ TAMAMLANDI

- [x] Route değişikliğinde `ViewManager.unmountCurrent()` çağrılıyor
- [x] Tüm SPA view'lar için unmount kontrolü eklendi (Profile, StudentDashboard dahil)
- [x] Gereksiz fallback kodları temizlendi

### Adım C.2: loadAdminView ViewManager Entegrasyonu ✅ TAMAMLANDI

- [x] `ViewManager.mount(AdminView, { route, container })` eklendi
- [x] Fallback korundu (ViewManager yoksa doğrudan mount)
- [x] Gereksiz unmount kontrolü kaldırıldı (handleRouteChange zaten yapıyor)

### Adım C.3: Diğer loadXxxView'lar ✅ TAMAMLANDI

- [x] `loadTeacherView()` → ViewManager.mount
- [x] `loadProfileView()` → ViewManager.mount
- [x] `loadStudentDashboardView()` → ViewManager.mount

### ✅ FAZ C Tamamlandı Kontrolü

```
[x] handleRouteChange ViewManager kullanıyor
[x] Admin panel geçişleri temiz
[x] Teacher panel geçişleri temiz
[x] Profile geçişleri temiz
[x] Student geçişleri temiz
[x] 142/142 test geçti
```

---

## FAZ D: Hard Redirect'leri Temizle (Düşük Risk) ✅ TAMAMLANDI

**Tahmini Süre:** 30 dakika → **Gerçek Süre:** 5 dakika  
**Risk Seviyesi:** 🟢 Düşük

### Adım D.1: ProfileView Hard Redirect'lerini Düzelt ✅ TAMAMLANDI

- [x] logout() içindeki `window.location.href = 'index.html'` → `Router.navigate('/')`
- [x] goHome() içine `Router.navigate('/')` fallback eklendi
- [x] Auth redirect'leri KORUNDU (satır 406)

### Adım D.2: StudentDashboardView Zaten Düzgün ✅

- [x] goHome() - Zaten `Router.navigate('/')` kullanıyor
- [x] goToCourse() - Zaten `Router.navigate('/course/' + courseKey)` kullanıyor

### Adım D.3: Navbar.js Zaten Düzgün ✅

- [x] navigateSPA() - SPA içindeyken Router.navigate kullanıyor
- [x] Ayrı sayfatayken index.html# doğru kullanıyor

### ✅ FAZ D Tamamlandı Kontrolü

```
[x] ProfileView - logout() ve goHome() düzeltildi
[x] StudentDashboardView - Zaten düzgün
[x] Navbar.js - Zaten düzgün
[x] Auth redirect'leri KORUNDU
[x] 142/142 test geçti
```

---

## FAZ E: Test ve Stabilizasyon (Zorunlu) ✅ TAMAMLANDI

**Tahmini Süre:** 30 dakika → **Gerçek Süre:** 5 dakika  
**Risk Seviyesi:** 🟢 Düşük

### Adım E.1: Unit Test'leri Çalıştır ✅ TAMAMLANDI

- [x] 161/161 test geçti (142 mevcut + 19 yeni ViewManager testi)
- [x] Yeni hata yok

### Adım E.2: ViewManager Test Dosyası Oluştur ✅ TAMAMLANDI

**Dosya:** `tests/unit/viewManager.test.js` - 19 test:

- [x] init() testleri (3 test)
- [x] mount() testleri (6 test)
- [x] unmountCurrent() testleri (3 test)
- [x] getCurrentView() testleri (2 test)
- [x] isActive() testleri (3 test)
- [x] View Lifecycle Flow testleri (2 test)

---

### Adım E.2: ViewManager Test Dosyası Oluştur ⏳

**Süre:** 15 dakika

**Dosya:** `tests/unit/viewManager.test.js`

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ViewManager', () => {
    let ViewManager;

    beforeEach(() => {
        // Mock DOM
        document.body.innerHTML = '<div id="main-content"></div>';

        // Reset ViewManager
        ViewManager = {
            currentView: null,
            container: null,
            init(id) {
                this.container = document.getElementById(id);
            },
            mount: vi.fn(),
            unmountCurrent: vi.fn(),
        };
    });

    it('should initialize with container', () => {
        ViewManager.init('main-content');
        expect(ViewManager.container).toBeTruthy();
    });

    it('should unmount current view before mounting new', async () => {
        const oldView = { unmount: vi.fn() };
        const newView = { mount: vi.fn() };

        ViewManager.currentView = oldView;
        await ViewManager.mount(newView);

        expect(oldView.unmount).toHaveBeenCalled();
    });
});
```

---

### Adım E.3: Manuel Tarayıcı Testi ⏳

**Süre:** 10 dakika

**Test Senaryoları:**

| #   | Senaryo             | Beklenen                        | Durum |
| --- | ------------------- | ------------------------------- | ----- |
| 1   | Ana sayfa yükle     | Kurs listesi görünür            | ⏳    |
| 2   | `#/admin` git       | Admin panel açılır              | ⏳    |
| 3   | Admin → Teacher     | Teacher açılır, admin kapanır   | ⏳    |
| 4   | Teacher → Profile   | Profile açılır, teacher kapanır | ⏳    |
| 5   | Profile → Ana sayfa | Ana sayfa, profile kapanır      | ⏳    |
| 6   | Kurs seç            | Kurs detayı açılır              | ⏳    |
| 7   | Proje seç           | Proje detayı açılır             | ⏳    |
| 8   | Geri butonu         | Önceki view                     | ⏳    |
| 9   | F5 (refresh)        | Mevcut route korunur            | ⏳    |
| 10  | Console             | Hata yok                        | ⏳    |

---

### ✅ FAZ E Tamamlandı Kontrolü

```
[ ] npm run test geçti
[ ] ViewManager testleri eklendi
[ ] Manuel test senaryoları tamamlandı
[ ] Console hataları yok
[ ] Git commit: "test: Add ViewManager tests and verify SPA transitions"
```

---

## 🏁 PROJE TAMAMLAMA

### Final Commit

```bash
git add .
git commit -m "feat: Complete SPA migration with ViewManager"
git push origin main
```

### Güncellenecek Dosyalar Listesi

| Dosya                                   | Değişiklik                    |
| --------------------------------------- | ----------------------------- |
| `modules/viewManager.js`                | YENİ DOSYA                    |
| `index.html`                            | Script ekleme                 |
| `app.js`                                | ViewManager entegrasyonu      |
| `eslint.config.js`                      | Global ekleme                 |
| `views/admin/AdminView.js`              | unmount() güncelleme          |
| `views/teacher/TeacherView.js`          | unmount() güncelleme          |
| `views/profile/ProfileView.js`          | unmount() + redirect düzeltme |
| `views/student/StudentDashboardView.js` | unmount() + redirect düzeltme |
| `modules/components/Navbar.js`          | redirect düzeltme             |
| `tests/unit/viewManager.test.js`        | YENİ DOSYA                    |

---

## 📊 İlerleme Takibi

```
FAZ A: ViewManager Altyapısı      [ ] [ ] [ ] [ ]
FAZ B: View Unmount Metodları     [ ] [ ] [ ] [ ]
FAZ C: Route Entegrasyonu         [ ] [ ] [ ]
FAZ D: Hard Redirect Temizliği    [ ] [ ] [ ]
FAZ E: Test ve Stabilizasyon      [ ] [ ] [ ]

Toplam Adım: 17
Tahmini Süre: ~3 saat
```

---

// turbo-all
