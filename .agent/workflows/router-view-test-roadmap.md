---
description: Router ve ViewManager Integration Test Roadmap - Güvenli Minik Adımlar (8 Ocak 2026)
---

# 🧭 Router & ViewManager Test Roadmap

> **HEDEF:** SPA'nın omurgasını oluşturan Router ve ViewManager modüllerini integration testleri ile test altına almak.

---

## 🚦 RİSK YÖNETİMİ

1.  **Checkpoint:** Her fazdan önce temiz commit.
2.  **İzolasyon:** Testler `jsdom` üzerinde çalışacak, gerçek tarayıcıya gerek yok.
3.  **Geri Dönüş:** Testler fail olursa `git checkout .` ile geri al.

---

## 📋 PLAN ÖZETİ

| Faz | Tahmini Süre | Modül           | Hedef                                             |
| --- | ------------ | --------------- | ------------------------------------------------- |
| 0   | 2 dk         | -               | Hazırlık & Checkpoint                             |
| 1   | 15 dk        | **ViewManager** | View yükleme/kaldırma, DOM manipülasyonu testleri |
| 2   | 20 dk        | **Router**      | URL parse, navigasyon, guard kontrolü testleri    |
| 3   | 5 dk         | -               | Final Kontrol & Raporlama                         |

---

## FAZ 0: HAZIRLIK ✅

### Adım 0.1: Mevcut durumu garantiye al

```bash
git status
# Temizse devam et, değilse commit at
```

### Adım 0.2: Test ortamını doğrula

```bash
// turbo
npm run test
```

---

## FAZ 1: VIEW MANAGER INTEGRATION TEST 🖼️

> **Neden Önce ViewManager?** Router, sayfaları yönetmek için ViewManager'ı kullanır. Önce "yönetilen" parçanın sağlam olduğunu kanıtlayalım.

Dosya: `tests/integration/viewManager.integration.test.js`

Test Kapsamı:

- `mount()`: View'in DOM'a yerleşmesi
- `unmount()`: View'in temizlenmesi
- `showLoading()` / `hideLoading()`: Yükleme ekranı kontrolü
- `updateActiveLink()`: Menü aktiflik durumu

### Adım 1.1: Test dosyasını oluştur

### Adım 1.2: Testleri çalıştır (`npm run test`)

### Adım 1.3: Coverage kontrol et

### Adım 1.4: Commit at

---

## FAZ 2: ROUTER INTEGRATION TEST 🧭

> **Kritik:** Router uygulamanın beynidir. URL değişimlerini doğru algılayıp ViewManager'ı tetiklemelidir.

Dosya: `tests/integration/router.integration.test.js`

Test Kapsamı:

- Route tanımlama (`init`)
- URL değişimini algılama (`hashchange`)
- Parametre ayrıştırma (örn: `#project/123` -> `id: 123`)
- Route guard (Giriş yapmamış kullanıcıyı yönlendirme)
- 404 yönetimi

### Adım 2.1: Test dosyasını oluştur

### Adım 2.2: Testleri çalıştır (`npm run test`)

### Adım 2.3: Coverage kontrol et

### Adım 2.4: Commit at

---

## FAZ 3: FİNAL 🏁

### Adım 3.1: Tüm testleri koş

```bash
// turbo
npm run test:coverage
```

### Adım 3.2: Final Commit

```bash
git log --oneline -n 5
```
