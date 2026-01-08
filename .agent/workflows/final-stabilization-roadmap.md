---
description: Yeti LAB Projesi Final Stabilizasyon ve Optimizasyon Planı
---

# 🚀 Yeti LAB Final Stabilizasyon Planı

Projenin temel Vite geçişi tamamlandı. Bu plan, uygulamanın performansını maksimize etmek, gereksiz yükleri kaldırmak ve kod tabanını "mükemmel" hale getirmek için adımları içerir.

## 🎯 Hedefler

1.  **Code Splitting:** Admin ve Teacher panellerini sadece ihtiyaç duyulduğunda yükle (Lazy Loading).
2.  **Config Sadeleştirme:** `vite.config.mjs` içindeki gereksiz entry pointleri analiz et.
3.  **Son Kullanıcı Performansı:** İlk yükleme (FCP) süresini düşür.

---

## ✅ FAZ 1: Lazy Loading (Code Splitting) Entegrasyonu

Normal kullanıcılar (öğrenciler) için Admin panel kodlarının yüklenmesi gereksizdir. Bu fazda, panel view'larını dinamik import'a çevireceğiz.

- [ ] **Router Güncellemesi:** `modules/router.js` veya view yükleme mantığında statik importlar yerine `import()` fonksiyonu kullan.
    - Örnek: `const AdminView = await import('../views/admin/AdminView.js');`
- [ ] **Chunk Analizi:** Build alıp (`npm run build`) `dist/assets` klasöründe yeni JS parçalarının oluştuğunu doğrula (örn: `AdminView-XyZ.js`).

## 🧹 FAZ 2: Config ve Dosya Temizliği

Mevcut `admin.html`, `teacher.html` vb. sadece redirect yapıyor. Bunları Vite build sürecinden safe mode'a alabiliriz.

- [ ] **Vite Config:** `vite.config.mjs` içindeki `input` listesini gözden geçir. Redirect dosyalarının build edilmesine gerek var mı? (GitHub Pages için evet, ama optimize edilebilir).
- [ ] **Kullanılmayan Dosyalar:** Projede atıl durumda olan eski JS dosyalarını (`scripts/` vb.) tespit et ve arşivle/sil.

## 🧪 FAZ 3: Kapsamlı E2E Test (Simülasyon)

Uygulamanın "sorunsuz" olduğundan emin olmak için kritik senaryoları test et.

- [ ] **Senaryo 1 (Misafir):** Ana sayfa -> Ders Detayı -> Simülasyon Çalışıyor mu?
- [ ] **Senaryo 2 (Admin):** `/admin` rotasına git -> Login -> (Lazy Load çalışmalı) -> Admin Paneli Yüklendi mi?
- [ ] **Senaryo 3 (Performans):** Lighthouse skoru kontrolü.

---

## Kullanım

Bu planı başlatmak için:

1. `FAZ 1` ile başla: Router'ı dinamik import'a çevir.
2. Build alıp sonucu kontrol et.
