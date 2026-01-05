---
description: Yeti LAB projesini parçalı HTML yapısından modern, bileşen tabanlı (Component-Based) bir mimariye taşıma planı.
---

# 🏔️ Yeti LAB Modernizasyon Planı

Amacımız: Projeyi bozmadan, tekrar eden kodları (Code Duplication) azaltmak ve yönetilebilirliği artırmak.

## FAZ 1: Görsel Birleştirme (Componentization)

Bu fazda HTML içinde kopyala-yapıştır yapılmış UI parçalarını JavaScript bileşenlerine dönüştüreceğiz.

- [x] **Adım 1: Navbar (Üst Menü) Modülü**
    - `modules/components/Navbar.js` oluşturulacak.
    - Tüm sayfalardaki `<nav>` etiketi silinip, JS ile render edilecek.
    - Menü değişiklikleri tek dosyadan yönetilecek.
- [x] **Adım 2: Footer (Alt Bilgi) Modülü**
    - `modules/components/Footer.js` oluşturulacak.
    - Telif hakkı yılı ve linkler merkezi olacak.
- [x] **Adım 3: Layout Wrapper**
    - `modules/layout/MainLayout.js` oluşturulacak.
    - Tüm sayfalar bu layout modülünü kullanarak header/footer yükleyecek.
    - Sayfa içi scriptlerdeki `Navbar.init()` çağrıları kaldırılacak.

### ✅ Tamamlanan Ara Görevler (Bug Fixes & UI - 04.01.2026)

- [x] **Navbar Logo & User Menu:** Logo SVG olarak güncellendi, User Menu render hatası giderildi.
- [x] **Footer Fix:** Footer konumu, sayfa altına sabitleme ve Dark mode rengi düzeltildi.
- [x] **Teacher Panel Fix:** Script çakışmaları ve `TeacherManager` başlatma hatası giderildi.
- [x] **Profile Page:** Footer eklendi, istatistik gösterim hataları (NaN%) düzeltildi.

## FAZ 2: Mantıksal Birleştirme (State Management)

Bu fazda veri akışını merkezileştireceğiz.

- [x] **Adım 4: Merkezi Veri Deposu (Store)**
    - `modules/store/store.js` oluşturulacak.
    - Kullanıcı bilgisi (`currentUser`), Seçili Ders (`currentCourse`) burada tutulacak.
    - `window.Auth` yerine `Store.auth` kullanılacak.
- [x] **Adım 5: Event Bus (Olay Yöneticisi)**
    - `Store` modülüne `on`, `off`, `emit` yetenekleri eklendi.
    - Bileşenlerin birbiriyle konuşması için altyapı hazır.

## FAZ 3: SPA Dönüşümü (Single Page Application)

Bu fazda sayfa yenilemelerini kaldıracağız.

- [x] **Adım 6: Gelişmiş Router**
    - `modules/router.js`, `popstate` olayını dinleyerek sayfa yenilemeden durum yönetimi yapacak.
    - URL parametreleri (`?course=arduino`) değiştiğinde ilgili görünüm otomatik yüklenecek.
- [x] **Adım 7: Görsel Mükemmellik (Visual Polish)**
    - `index.html` tasarımı güçlendirilecek (Hero section, Fontlar).
    - Skeleton Loading eklenerek açılış hissiyatı iyileştirilecek.
    - `modules/ui.js` içinde animasyonlar kontrol edilecek.
- [x] **Adım 8: Son Kontroller ve Optimizasyon**
    - Gereksiz dosyaların temizlenmesi.
    - `console.log` temizliği yapıldı.
    - Kodlar üretim kalitesine (Production Ready) getirildi.

## Kurallar

1. **Asla Bozma:** Her adımda proje çalışır durumda olmalı.
2. **Küçük Adımlar:** Bir seferde sadece bir bileşen değiştirilecek.
3. **Geriye Uyumluluk:** Eski kodlar yeni yapıya uyana kadar çalışmaya devam edecek.
