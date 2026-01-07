---
description: Profile ve Student-Dashboard SPA Migration - Detaylı Plan
---

# 🎯 Seçenek B: Profile + Student-Dashboard SPA Migration

**Hedef:** `profile.html` ve `student-dashboard.html` dosyalarını SPA yapısına entegre etmek
**Tahmini Süre:** 3-4 saat
**Risk Seviyesi:** 🟢 DÜŞÜK
**Tarih:** 7 Ocak 2026

---

## 📋 Ön Koşullar (Migration Öncesi)

- [x] Admin ve Teacher panelleri SPA'da çalışıyor
- [x] `Navbar.navigateSPA()` helper mevcut
- [x] 130 unit test geçiyor
- [ ] Git clean state (commit yapılmış)

---

## 🗺️ ROADMAP

### FAZ 1: Profile.html SPA Migration (2 saat)

#### 1.1 Hazırlık (15 dk)

- [ ] `profile.html` dosyasını analiz et (880 satır)
- [ ] Mevcut fonksiyonları listele:
    - Wizard (ilk kurulum): 3 adım
    - Settings (profil düzenleme): kişisel bilgiler, güvenlik, tercihler
    - Stats: XP, rozetler, aktivite heatmap
- [ ] Bağımlılıkları belirle: `Profile.js`, `badges.js`, `cities.js`

#### 1.2 Klasör Yapısı (5 dk)

```
views/
└── profile/
    ├── ProfileView.js          # Ana view controller
    ├── ProfileLayout.js        # Header, layout template
    ├── sections/
    │   ├── WizardSection.js    # İlk kurulum wizard'ı
    │   ├── SettingsSection.js  # Profil ayarları
    │   └── StatsSection.js     # İstatistikler, rozetler
    └── modals/
        └── AvatarModal.js      # Avatar seçici popup
```

// turbo

- [ ] Klasör yapısını oluştur

#### 1.3 CSS Ayrıştırma (10 dk)

- [ ] `profile.html` içindeki `<style>` tag'ini çıkar
- [ ] `styles/profile.css` dosyası oluştur
- [ ] `index.html`'e CSS linkini ekle (satır ~89, admin.css yanına)

#### 1.4 ProfileView.js Oluşturma (30 dk)

```javascript
const ProfileView = {
    isLoaded: false,
    currentView: 'settings', // 'wizard' veya 'settings'
    scriptsLoaded: false,

    template() {
        /* Layout HTML */
    },

    async mount(container) {
        // 1. Auth kontrolü
        // 2. Script'leri lazy load et
        // 3. Template render
        // 4. Wizard mı Settings mi belirle
    },

    unmount() {
        // Cleanup
    },

    checkAuth() {
        /* Auth guard */
    },
    loadDependencies() {
        /* Lazy load scripts */
    },
    showWizard() {
        /* İlk kurulum */
    },
    showSettings() {
        /* Normal profil */
    },
};
```

- [ ] `ProfileView.js` oluştur
- [ ] `checkAuth()` - giriş kontrolü
- [ ] `loadDependencies()` - script'leri lazy yükle
- [ ] `mount()` / `unmount()` metodları

#### 1.5 ProfileLayout.js (15 dk)

- [ ] Header template (Navbar yerine basit header)
- [ ] Hero section (avatar, isim, XP bar)
- [ ] Stats grid template

#### 1.6 Section Bileşenleri (30 dk)

**WizardSection.js:**

- [ ] Step 1: Rol seçimi (öğretmen/öğrenci)
- [ ] Step 2: Bilgi formu (isim, okul, il/ilçe)
- [ ] Step 3: Avatar seçimi
- [ ] Progress dots
- [ ] `Wizard.nextStep()`, `Wizard.prevStep()`, `Wizard.complete()`

**SettingsSection.js:**

- [ ] Kişisel bilgiler kartı (düzenleme modu)
- [ ] Güvenlik kartı (şifre değiştirme)
- [ ] Tercihler kartı (tema)
- [ ] `ProfileEditor.toggleEdit()`, `ProfileEditor.save*()`

**StatsSection.js:**

- [ ] Stats grid (dersler, rozetler, seri, quiz)
- [ ] Aktivite heatmap
- [ ] Rozet galerisi

#### 1.7 Router Entegrasyonu (10 dk)

- [ ] `router.js`'e route ekle:
    ```javascript
    'profile': 'profile',
    'profile/wizard': 'profile-wizard',
    ```
- [ ] `app.js`'e `loadProfileView()` fonksiyonu ekle
- [ ] `handleRouteChange()`'e profile case ekle

#### 1.8 profile.html Redirect (5 dk)

- [ ] `profile.html`'i minimal redirect sayfasına dönüştür:
    ```html
    <script>
        window.location.replace('index.html#/profile');
    </script>
    ```

#### 1.9 Test (15 dk)

- [ ] `/profile` route'u açılıyor mu?
- [ ] Wizard doğru çalışıyor mu?
- [ ] Settings düzenleme çalışıyor mu?
- [ ] Avatar değiştirme çalışıyor mu?
- [ ] Şifre değiştirme çalışıyor mu?
- [ ] Console'da hata var mı?

---

### FAZ 2: Student-Dashboard SPA Migration (1 saat)

#### 2.1 Hazırlık (10 dk)

- [ ] `student-dashboard.html` dosyasını analiz et
- [ ] Mevcut fonksiyonları listele:
    - Sınıf bilgisi
    - Kurs ilerlemesi
    - Son aktiviteler
- [ ] Bağımlılıkları belirle

#### 2.2 Klasör Yapısı (5 dk)

```
views/
└── student/
    ├── StudentDashboardView.js  # Ana view
    └── sections/
        ├── ClassInfoSection.js   # Sınıf bilgisi
        └── ProgressSection.js    # İlerleme
```

// turbo

- [ ] Klasör yapısını oluştur

#### 2.3 CSS Ayrıştırma (5 dk)

- [ ] Inline CSS'leri `styles/student.css`'e taşı
- [ ] `index.html`'e CSS linkini ekle

#### 2.4 StudentDashboardView.js (20 dk)

- [ ] View controller oluştur
- [ ] Auth kontrolü (öğrenci mi?)
- [ ] `mount()` / `unmount()`
- [ ] Section render

#### 2.5 Router Entegrasyonu (5 dk)

- [ ] `router.js`'e route ekle: `'student-dashboard': 'student-dashboard'`
- [ ] `app.js`'e `loadStudentDashboardView()` ekle

#### 2.6 student-dashboard.html Redirect (5 dk)

- [ ] Minimal redirect sayfasına dönüştür

#### 2.7 Test (10 dk)

- [ ] Route çalışıyor mu?
- [ ] Sınıf bilgisi görünüyor mu?
- [ ] İlerleme doğru mu?

---

### FAZ 3: Finalizasyon (30 dk)

#### 3.1 Navbar Güncellemesi (10 dk)

- [ ] Profil linkini güncelle: `href="profile.html"` → `Navbar.navigateSPA('/profile')`
- [ ] Student dashboard linki varsa güncelle

#### 3.2 Cross-Page Link Güncellemesi (10 dk)

- [ ] Tüm dosyalarda `profile.html` referanslarını bul
- [ ] SPA linkleri ile değiştir veya redirect'e güven

#### 3.3 Unit Testler (10 dk)

- [ ] `tests/unit/profileView.test.js` oluştur
- [ ] Temel mount/unmount testleri
- [ ] Testleri çalıştır

---

## ⚠️ Risk Azaltma Stratejileri

### Risk 1: Wizard Akışı Bozulabilir

**Önlem:**

- Her wizard adımını ayrı test et
- `sessionStorage` ile adım state'i koru
- Fallback: Eski profile.html'i `profile-legacy.html` olarak sakla

### Risk 2: Avatar/Şifre İşlemleri Çalışmayabilir

**Önlem:**

- `ProfileEditor` objesini aynen koru
- Supabase çağrılarını değiştirme
- Her işlemi ayrı test et

### Risk 3: Auth State Kaybı

**Önlem:**

- `checkAuth()` fonksiyonunda `Auth.waitForInit()` kullan
- Loading state göster
- Redirect loop kontrolü

### Risk 4: CSS Çakışması

**Önlem:**

- Profile CSS'e prefix ekle (`.profile-view`)
- Scoped styles kullan
- Dark mode testleri

---

## 🧪 Test Kontrol Listesi

### Profile View

- [ ] Giriş yapmadan erişim → auth.html'e yönlendir
- [ ] İlk kez giriş → Wizard göster
- [ ] Mevcut kullanıcı → Settings göster
- [ ] Avatar değiştir → Supabase güncelle
- [ ] İsim değiştir → Supabase güncelle
- [ ] Şifre değiştir → Supabase auth güncelle
- [ ] Tema değiştir → localStorage + UI güncelle
- [ ] Çıkış yap → Ana sayfaya dön

### Student Dashboard View

- [ ] Öğrenci girişi → Dashboard göster
- [ ] Öğretmen girişi → Erişim reddet veya teacher'a yönlendir
- [ ] Sınıf bilgisi doğru
- [ ] İlerleme yüzdesi doğru

### Navigation

- [ ] Navbar'dan Profile tıkla → Profile açılsın
- [ ] Profile'dan Logo tıkla → Ana sayfa
- [ ] URL'e #/profile yaz → Profile açılsın
- [ ] Sayfa yenile → Aynı view kalsın

---

## 📊 Başarı Kriterleri

| Kriter                          | Hedef                       |
| ------------------------------- | --------------------------- |
| Profile fonksiyonları           | %100 çalışıyor              |
| Student dashboard fonksiyonları | %100 çalışıyor              |
| Console hataları                | 0                           |
| Unit test coverage              | +10 test                    |
| Dosya boyutu azalması           | profile.html 880 → 58 satır |

---

## 🔄 Rollback Planı

Eğer migration başarısız olursa:

1. **Git reset:**

    ```bash
    git reset --hard HEAD~1
    ```

2. **Alternatif:** Legacy dosyaları geri yükle
    - `profile-legacy.html` → `profile.html`
    - `student-dashboard-legacy.html` → `student-dashboard.html`

3. **Router'dan route'ları kaldır**

---

## 📅 Uygulama Sırası

```
1. [ ] Git commit yap (clean state)
2. [ ] FAZ 1.1-1.3: Hazırlık ve CSS
3. [ ] FAZ 1.4-1.6: View ve Section'lar
4. [ ] FAZ 1.7-1.8: Router ve Redirect
5. [ ] FAZ 1.9: Profile Test
6. [ ] Git commit: "feat(spa): Profile migration"
7. [ ] FAZ 2: Student Dashboard
8. [ ] Git commit: "feat(spa): Student dashboard migration"
9. [ ] FAZ 3: Finalizasyon
10. [ ] Git commit: "feat(spa): Complete profile+student migration"
11. [ ] Final test
12. [ ] Git push

```

---

## 📈 Migration Sonrası Durum

| Sayfa                    | Önceki            | Sonraki             |
| ------------------------ | ----------------- | ------------------- |
| `profile.html`           | 880 satır (ayrı)  | 58 satır (redirect) |
| `student-dashboard.html` | ~500 satır (ayrı) | 58 satır (redirect) |
| **SPA Tamamlanma**       | %90               | **%95**             |

---

// turbo-all
