---
description: Yeti LAB projesini bozmadan modern, esnek, bakımı kolay, güvenli ve temiz hale getirmek için teknik refactoring yol haritası.
---

# 🔧 Teknik Refactoring Yol Haritası

**Son Güncelleme:** 2026-01-06 19:00  
**Durum:** ✅ İlk Faz Tamamlandı - Proje çalışıyor, tüm testler geçiyor

---

## 📊 Mevcut Durum (Güncellenmiş)

| Bileşen          | Durum            | Notlar                                    |
| ---------------- | ---------------- | ----------------------------------------- |
| Vite Dev Server  | ✅ Çalışıyor     | `npm run dev` → localhost:3000            |
| Store (State)    | ✅ Mevcut        | `modules/store/store.js`                  |
| Router           | ✅ Mevcut        | Hash-based SPA routing                    |
| Supabase         | ✅ Çalışıyor     | 7 kurs, Singleton pattern                 |
| Auth             | ✅ İyi           | Kapsamlı modül, UX iyileştirmesi yapıldı  |
| ThemeManager     | ✅ Temiz         | `app.js`'den ayrıştırıldı                 |
| Constants        | ✅ Birleştirildi | `constants/index.js` merkezi              |
| Unit Tests       | ✅ 76/76 geçiyor | Validators, Auth, Progress, UI, Utils     |
| Env Variables    | ⚠️ Hazır         | `.env.example` var, FAZ 5'te aktif olacak |
| Global Namespace | ⚠️ Aktif         | FAZ 5'te ES6 modules ile değiştirilecek   |

---

## ✅ TAMAMLANAN ADIMLAR (2026-01-06)

### FAZ 1: Güvenlik ve Temel Temizlik

| Adım                    | Durum | Yapılanlar                                             |
| ----------------------- | ----- | ------------------------------------------------------ |
| 1.1 Env Variables       | ✅    | `.env.example` güncellendi, VITE\_ prefix'leri eklendi |
| 1.2 ESLint Sıkılaştırma | ✅    | `prefer-const: error`, `eqeqeq`, `no-shadow` kuralları |

### FAZ 2: Modül Modernizasyonu

| Adım           | Durum | Yapılanlar                                      |
| -------------- | ----- | ----------------------------------------------- |
| 2.1 Utils      | ✅    | Global fallback korundu (ES6 export FAZ 5'te)   |
| 2.2 Constants  | ✅    | `constants/index.js` oluşturuldu, merkezi dosya |
| 2.3 Validators | ✅    | Test dosyası güncellendi, 14 test geçiyor       |

### FAZ 4: app.js Dekompozisyonu

| Adım              | Durum | Yapılanlar                                          |
| ----------------- | ----- | --------------------------------------------------- |
| 4.1 State → Store | ✅    | `app.state` artık Proxy ile Store'a senkronize      |
| 4.3 ThemeManager  | ✅    | `app.theme` state kaldırıldı, ThemeManager'a delege |
| 4.4 Auth          | ✅    | İncelendi - zaten iyi yapılandırılmış               |

### Bonus Düzeltmeler

| Düzeltme                 | Açıklama                                                |
| ------------------------ | ------------------------------------------------------- |
| SupabaseClient Singleton | `Multiple GoTrueClient instances` uyarısı giderildi     |
| ES6 Export Hatası        | Admin panelindeki `export` syntax error düzeltildi      |
| Script Duplicate Loading | `CourseLoader`, `TabConfig` için akıllı kontrol eklendi |
| Auth Kayıt UX            | Kayıt sonrası panel kapanıyor, mesaj hemen görünüyor    |

---

## ⏳ BEKLEYEN ADIMLAR

### FAZ 4: app.js Dekompozisyonu (Devam)

| #   | Adım                 | Risk      | Süre    | Durum        | Not                              |
| --- | -------------------- | --------- | ------- | ------------ | -------------------------------- |
| 4.1 | State → Store Taşıma | 🟡 Orta   | 3 saat  | ⏳           | `app.state` → `Store.setState()` |
| 4.2 | Simulation Engine    | 🔴 Yüksek | 3+ saat | ⏸️ Ertelendi | Çok fazla bağımlılık             |

### FAZ 5: Script Loading Modernizasyonu

| #   | Adım            | Risk      | Süre   | Durum | Not                         |
| --- | --------------- | --------- | ------ | ----- | --------------------------- |
| 5.1 | Tek Entry Point | 🔴 Yüksek | 1 gün  | ⏳    | `src/main.js` + ES6 modules |
| 5.2 | Code Splitting  | 🟡 Orta   | 3 saat | ⏳    | Dynamic imports             |

### FAZ 6: Test ve Dokümantasyon

| #   | Adım              | Risk     | Süre    | Durum | Not                   |
| --- | ----------------- | -------- | ------- | ----- | --------------------- |
| 6.1 | Test Coverage     | 🟢 Düşük | Sürekli | ⏳    | Hedef: %60            |
| 6.2 | README Güncelleme | 🟢 Düşük | 1 saat  | ⏳    | Mimari dokümantasyonu |

### Ertelenen / İptal Edilen

| Adım                       | Durum        | Sebep                                           |
| -------------------------- | ------------ | ----------------------------------------------- |
| 3.3 Legacy Format Kaldırma | ❌ Ertelendi | Tüm UI bileşenlerini etkiler, büyük refactoring |
| 4.2 Simulation Engine      | ⏸️ Ertelendi | `app.simState` çok fazla yerde kullanılıyor     |

---

## 📈 İLERLEME ÖZETİ

```
Tamamlanan Adımlar: 8/14 (+ 4 bonus düzeltme)
Bekleyen Adımlar: 6
Ertelenen Adımlar: 2

Test Durumu: 76/76 geçiyor ✅
Console Hataları: 0 ✅
Admin Paneli: Çalışıyor ✅
Teacher Paneli: Çalışıyor ✅
```

---

## 🎯 SONRAKİ OTURUM İÇİN ÖNERİLEN ADIMLAR

### Seçenek A: FAZ 5.1 - Tek Entry Point (Büyük)

- Tüm script tag'lerini kaldır
- `src/main.js` oluştur
- ES6 modules geçişi
- **Risk:** Yüksek, **Süre:** ~1 gün

### Seçenek B: FAZ 4.1 - State → Store (Güvenli)

- `app.state` kullanımlarını `Store`'a taşı
- Adım adım, düşük riskli
- **Risk:** Orta, **Süre:** ~3 saat

### Seçenek C: FAZ 6.2 - README Güncelleme (Hızlı)

- Proje mimarisini dokümante et
- Yeni geliştirici rehberi
- **Risk:** Düşük, **Süre:** ~1 saat

---

## 📋 KONTROL LİSTESİ (Her Commit İçin)

```
[ ] npm run dev ile test edildi
[ ] Sayfa yenilendi, hata yok
[ ] Console'da yeni hata yok
[ ] npm run test geçti
[ ] npm run lint geçti
[ ] Git commit yapıldı
```

---

## 🆘 ACİL DURUM PLANI

Eğer bir adım projeyi bozarsa:

```bash
git stash        # Değişiklikleri sakla
git checkout .   # Son çalışan duruma dön
```

Sorunu izole et ve daha küçük adımlarla tekrar dene.
