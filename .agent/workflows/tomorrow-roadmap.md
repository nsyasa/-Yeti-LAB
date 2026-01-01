---
description: Yarınki geliştirme planı - 1 Ocak 2025
---

# 📅 Yarınki Yol Haritası (1 Ocak 2025)

Projenin güvenliğini sağlamak ve veri tutarlılığını düzeltmek için "Bebek Adımları" (Baby Steps) stratejisi. Hiçbir şeyi bozmadan, adım adım ilerleyeceğiz.

## 1. 🛡️ Güvenlik Kalkanı (Sabah)
Öncelik: **Çok Yüksek** - *Güvenlik açığını kapatıyoruz.*

- [ ] **Adım 1.1:** Supabase SQL Editöründe `student_login_secure` adında, şifre parametresi alan ve doğrulama yapan yeni bir fonksiyon hazırlanacak.
- [ ] **Adım 1.2:** `modules/auth.js` dosyası, bu yeni güvenli fonksiyonu kullanacak şekilde güncellenecek.
- [ ] **Adım 1.3:** Test: Yanlış şifre ile giriş yapılamadığı, doğru şifre ile yapılabildiği teyit edilecek.

## 2. 🗄️ Veri Kaynağını Düzeltme (Öğle)
Öncelik: **Yüksek** - *JSON ve Veritabanı uyumsuzluğunu gideriyoruz.*

- [ ] **Adım 2.1:** Veritabanında `projects` (veya `lessons`) tablosunun schema yapısı kontrol edilecek.
- [ ] **Adım 2.2:** `data.json` içindeki ders verilerini (Başlık, ID, Kategori) veritabanına aktarmak için tek kullanımlık bir script (`migration.js`) yazılacak.
- [ ] **Adım 2.3:** Veriler Supabase'e güvenli bir şekilde aktarılacak.

## 3. 🔗 Öğretmen Paneli Entegrasyonu (Öğleden Sonra)
Öncelik: **Orta** - *Hayalet verileri gerçek verilerle değiştiriyoruz.*

- [ ] **Adım 3.1:** `modules/teacher-manager.js` içindeki "elle yazılmış" proje listesi (hardcoded list) silinecek.
- [ ] **Adım 3.2:** Bunun yerine projeleri veritabanından çeken (`loadProjects`) dinamik bir yapı kurulacak.
- [ ] **Adım 3.3:** Öğrenci detay modalı, artık veritabanındaki gerçek proje isimlerini ve ID'lerini kullanacak.

## 4. 🧹 Temizlik ve Test (Akşam)
Öncelik: **Düşük** - *Günü temiz kapatıyoruz.*

- [ ] **Adım 4.1:** Kullanılmayan eski kod blokları temizlenecek.
- [ ] **Adım 4.2:** Genel sistem testi (Öğrenci giriş yapar -> Ders tamamlar -> Öğretmen panelinde görünür) yapılacak.

> **Not:** Bu plan, mevcut çalışan sistemi bozmadan, yanına daha sağlam bir yapı inşa edip geçiş yapmayı hedefler.
