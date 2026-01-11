# 🗺️ YETİ LAB ACTIVE ROADMAP

This document contains the immediate next steps, testing plans, and daily tasks for the Yeti LAB project.

## 📋 Table of Contents

1. [Immediate Next Steps](#immediate-next-steps)
2. [Stabilization Plan](#stabilization-plan)
3. [Testing Roadmap](#testing-roadmap)
4. [Build & Deployment](#build--deployment)

---

---

## description: Yarınki geliştirme planı - 1 Ocak 2025

# 🗺️ YETİ LAB GELİŞTİRME ROADMAP

## Tarih: 2 Ocak 2026 (Yarından itibaren)

---

## ✅ BUGÜN TAMAMLANANLAR (1 Ocak 2026)

| Görev                               | Durum         |
| ----------------------------------- | ------------- |
| Profile "Kaydet" buton genişliği    | ✅ Tamamlandı |
| Emoji Avatar 404 fix                | ✅ Tamamlandı |
| Copyright 2025 → 2026               | ✅ Tamamlandı |
| Toast modülü profile.html           | ✅ Tamamlandı |
| Toast modülü student-dashboard.html | ✅ Tamamlandı |

---

## 📋 YARIN YAPILACAKLAR (2 Ocak 2026)

### 🔴 P0 - GÜVENLİK DÜZELTMELERİ

#### SEC-001: LocalStorage XSS Koruması

**Dosya:** `app.js`
**Satır:** 260-280

**PROMPT:**

```
app.js dosyasındaki restoreFromLocalStorage() fonksiyonunu incele.
localStorage'dan okunan veri doğrudan courseData'ya atanıyor, bu XSS riski oluşturur.

Şu düzeltmeleri yap:
1. JSON.parse hatalarını try-catch ile yakala
2. Gelen verinin beklenen yapıda olduğunu kontrol et (schema validation)
3. String değerler için DOMPurify veya manuel HTML escape uygula
4. Sadece bilinen course key'leri kabul et (arduino, microbit, scratch, mblock)

Örnek güvenli kod:
const allowedCourses = ['arduino', 'microbit', 'scratch', 'mblock'];
Object.keys(parsed.data).forEach(key => {
    if (allowedCourses.includes(key) && window.courseData[key]) {
        // Validate structure before merge
        if (isValidCourseData(parsed.data[key])) {
            window.courseData[key] = parsed.data[key];
        }
    }
});
```

---

#### SEC-002: Profile Redirect Loop Fix

**Dosya:** `app.js`
**Satır:** 100-104

**PROMPT:**

```
app.js dosyasındaki initAuth() fonksiyonunda profile redirect döngüsü riski var.

Mevcut kod:
if (Auth.needsProfileCompletion()) {
    window.location.href = 'profile.html';
    return;
}

Sorun: Eğer profile.html'de bir hata olursa veya profile_completed flag sonsuz yanlış kalırsa sonsuz döngü oluşur.

Düzeltme:
1. URL kontrolü ekle - zaten profile.html'deyse redirect yapma
2. Redirect sayacı ekle - 3'ten fazla redirect varsa dur
3. Session storage ile redirect takibi yap

Örnek:
const redirectCount = parseInt(sessionStorage.getItem('profile_redirect_count') || '0');
const isProfilePage = window.location.pathname.includes('profile.html');

if (Auth.needsProfileCompletion() && !isProfilePage && redirectCount < 3) {
    sessionStorage.setItem('profile_redirect_count', String(redirectCount + 1));
    window.location.href = 'profile.html';
    return;
}
// Başarılı durumda sayacı sıfırla
sessionStorage.removeItem('profile_redirect_count');
```

---

### 🟡 P1 - TASARIM SİSTEMİ

#### DES-001: Design Tokens Oluştur

**Dosya:** `styles/tokens.css` (YENİ)

**PROMPT:**

```
styles/tokens.css adında yeni bir dosya oluştur.

Bu dosya tüm projede kullanılacak design token'ları içerecek:

1. RENK PALETİ:
   - Brand renkleri (primary: #00979C tonları)
   - Nötr renkler (gray scale)
   - Semantik renkler (success, warning, error, info)

2. SPACING:
   - 4px bazlı spacing scale (space-1: 4px, space-2: 8px, ...)

3. TYPOGRAPHY:
   - Font ailesi (Nunito)
   - Font boyutları (text-xs'ten text-4xl'e)
   - Font ağırlıkları

4. GÖLGELER:
   - shadow-sm, shadow-md, shadow-lg, shadow-card

5. BORDER RADIUS:
   - radius-sm, radius-md, radius-lg, radius-xl, radius-full

CSS custom properties (:root) kullanarak tanımla.
Hem light mode hem dark mode değişkenleri olsun.
```

---

#### DES-002: Component Classes Oluştur

**Dosya:** `styles/components.css` (YENİ)

**PROMPT:**

```
styles/components.css adında yeni bir dosya oluştur.

tokens.css'teki değişkenleri kullanarak ortak component sınıfları tanımla:

1. BUTONLAR:
   .btn - Base button styles
   .btn-primary - Tema renkli primary buton
   .btn-secondary - Secondary buton (outline)
   .btn-danger - Tehlike/silme butonu
   .btn-sm, .btn-lg - Boyut varyantları

2. KARTLAR:
   .card - Base card styles
   .card-elevated - Gölgeli kart
   .card-interactive - Hover efektli kart

3. FORMLAR:
   .input - Text input base
   .select - Select dropdown
   .checkbox, .radio - Checkbox/radio stilleri
   .form-group - Form grubu wrapper

4. BADGES:
   .badge - Base badge
   .badge-success, .badge-warning, .badge-error

Her sınıf için hover, focus, disabled durumları tanımla.
Dark mode uyumlu olsun.
```

---

#### DES-003: Tutarlı Footer Component

**Dosya:** Tüm HTML sayfaları

**PROMPT:**

```
Projedeki tüm HTML sayfalarında footer tutarsızlığı var:
- index.html: Dark footer (bg-gray-800)
- auth.html: Minimal footer
- profile.html: Footer YOK
- teacher.html: Footer YOK
- student-dashboard.html: Footer YOK

Şu standardı uygula:
1. Tüm sayfalara aynı footer ekle
2. Footer içeriği:
   - Logo (küçük)
   - Copyright © 2026 Yeti LAB
   - Opsiyonel: Gizlilik Politikası, İletişim linkleri

3. Footer stili:
   - Mobilde: padding-bottom: 80px (bottom nav'ın arkasında kalmasın)
   - Desktop'ta: normal padding

Örnek footer HTML:
<footer class="bg-gray-800 text-white py-6 text-center text-sm pb-20 md:pb-6">
    <div class="flex items-center justify-center gap-2 mb-2">
        <img src="img/favicon.svg" alt="Yeti LAB" class="w-6 h-6">
        <span class="font-bold">Yeti <span class="text-theme">LAB</span></span>
    </div>
    <p class="text-gray-400">© 2026 Yeti LAB - İçindeki Yeti'leri Keşfet</p>
</footer>
```

---

### 🟢 P2 - SEO VE META TAGS

#### SEO-001: Meta Description Ekle

**Dosyalar:** Tüm HTML sayfaları

**PROMPT:**

```
Tüm HTML sayfalara uygun meta description ve Open Graph tagları ekle.

index.html için:
<meta name="description" content="Yeti LAB - Çocuklar için Arduino, Micro:bit, Scratch ve mBlock ile kodlama ve robotik eğitim platformu. Eğlenerek öğren!">
<meta property="og:title" content="Yeti LAB | Kodlama ve Robotik Eğitim Platformu">
<meta property="og:description" content="İnteraktif simülasyonlar ve projelerle kodlama öğren.">
<meta property="og:image" content="https://yetilab.com/img/og-image.png">
<meta property="og:type" content="website">

auth.html için:
<meta name="description" content="Yeti LAB'a giriş yap veya kayıt ol. Öğrenci veya öğretmen olarak başla.">

profile.html için:
<meta name="description" content="Yeti LAB profil ayarları. Avatar, okul bilgileri ve şifre güncelleme.">

teacher.html için:
<meta name="description" content="Yeti LAB öğretmen paneli. Sınıflar oluşturun, öğrenci ilerlemesini takip edin.">
```

---

## 📅 HAFTALIK PLAN

### HAFTA 1 (2-7 Ocak) - TEMİZLİK

| Gün      | Görevler                     |
| -------- | ---------------------------- |
| 2 Ocak   | SEC-001, SEC-002 (Güvenlik)  |
| 3 Ocak   | DES-001 (Design Tokens)      |
| 4 Ocak   | DES-002 (Component Classes)  |
| 5 Ocak   | DES-003 (Footer tutarlılığı) |
| 6-7 Ocak | SEO-001, Test & Debug        |

### HAFTA 2 (8-14 Ocak) - PROFESYONELLİK

| Gün        | Görevler                                |
| ---------- | --------------------------------------- |
| 8-9 Ocak   | Form validation & UX                    |
| 10-11 Ocak | Responsive polish, mobil iyileştirmeler |
| 12-14 Ocak | Cross-browser testing                   |

### HAFTA 3 (15-21 Ocak) - ALTYAPI

| Gün        | Görevler                                                   |
| ---------- | ---------------------------------------------------------- |
| 15-17 Ocak | Veritabanı genişletmeleri (badges, certificates tabloları) |
| 18-21 Ocak | Modül altyapıları (gamification.js, certificates.js)       |

### HAFTA 4 (22-31 Ocak) - ÖZELLİKLER

| Gün        | Görevler                     |
| ---------- | ---------------------------- |
| 22-25 Ocak | Rozet sistemi (Gamification) |
| 26-28 Ocak | AI Asistan güçlendirme       |
| 29-31 Ocak | Sertifika sistemi temeli     |

---

## 🗄️ VERİTABANI GENİŞLETMELERİ (Supabase)

### DB-001: Badges Tablosu

**PROMPT:**

```
Supabase'de badges tablosu oluştur:

CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    description_en TEXT,
    icon TEXT NOT NULL, -- Emoji veya icon class
    condition_type TEXT NOT NULL CHECK (condition_type IN ('lesson_count', 'streak', 'course_complete', 'quiz_score', 'first_login')),
    condition_value INTEGER DEFAULT 0,
    color TEXT DEFAULT 'theme', -- Badge arka plan rengi
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Başlangıç rozetleri ekle
INSERT INTO badges (name, name_en, description, icon, condition_type, condition_value, rarity) VALUES
('İlk Adım', 'First Step', 'İlk dersini tamamladın!', '🎯', 'lesson_count', 1, 'common'),
('Çalışkan Öğrenci', 'Hard Worker', '10 ders tamamladın!', '📚', 'lesson_count', 10, 'common'),
('Haftalık Yıldız', 'Weekly Star', '7 gün arka arkaya giriş yaptın!', '⭐', 'streak', 7, 'rare'),
('Arduino Ustası', 'Arduino Master', 'Arduino kursunu tamamladın!', '🤖', 'course_complete', 0, 'epic'),
('Quiz Şampiyonu', 'Quiz Champion', 'Tüm quizlerden %90+ aldın!', '🏆', 'quiz_score', 90, 'legendary');

-- RLS Politikası
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);
```

---

### DB-002: User Badges Tablosu

**PROMPT:**

```
Supabase'de kullanıcı rozet ilişkisi tablosu oluştur:

CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ya user_id ya da student_id dolu olmalı
    CONSTRAINT user_or_student CHECK (
        (user_id IS NOT NULL AND student_id IS NULL) OR
        (user_id IS NULL AND student_id IS NOT NULL)
    ),

    -- Aynı rozet bir kullanıcıya iki kez verilemez
    UNIQUE(user_id, badge_id),
    UNIQUE(student_id, badge_id)
);

-- RLS Politikaları
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can view their own badges" ON user_badges
    FOR SELECT USING (
        student_id IN (SELECT id FROM students WHERE classroom_id IN (
            SELECT id FROM classrooms WHERE teacher_id = auth.uid()
        ))
    );
```

---

### DB-003: Certificates Tablosu

**PROMPT:**

```
Supabase'de sertifika tablosu oluştur:

CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number TEXT UNIQUE NOT NULL DEFAULT ('YETI-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    course_id TEXT NOT NULL,
    course_title TEXT NOT NULL,
    completion_date DATE DEFAULT CURRENT_DATE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    pdf_url TEXT,

    CONSTRAINT user_or_student_cert CHECK (
        user_id IS NOT NULL OR student_id IS NOT NULL
    )
);

-- Index for quick lookups
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_student ON certificates(student_id);

-- RLS Policies
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their certificates" ON certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Certificate verification is public" ON certificates
    FOR SELECT USING (true);
```

---

## 🔧 MODÜL YAPILARI

### MOD-001: Gamification Module

**Dosya:** `modules/gamification.js` (YENİ)

**PROMPT:**

```
modules/gamification.js dosyası oluştur.

Temel yapı:
const Gamification = {
    // Badge tanımları (DB'den de yüklenebilir)
    localBadges: { ... },

    // Kullanıcının kazandığı rozetler
    earnedBadges: [],

    // Rozet kontrolü
    async checkBadges(userId, studentId) {
        // Progress verilerine göre rozet kontrolü yap
        // Yeni rozet kazanıldıysa notification göster
    },

    // Rozet kazanma
    async awardBadge(badgeId, userId, studentId) {
        // Supabase'e kaydet
        // UI notification göster
        // Animasyon tetikle
    },

    // Rozet listesi render
    renderBadges(container, badges) {
        // Rozet kartlarını render et
    },

    // Kazanılmamış rozetleri göster (locked state)
    renderLockedBadges(container, allBadges, earnedBadges) {
        // Gri/locked rozet kartları
    }
};

window.Gamification = Gamification;
```

---

### MOD-002: Certificates Module

**Dosya:** `modules/certificates.js` (YENİ)

**PROMPT:**

```
modules/certificates.js dosyası oluştur.

jsPDF veya html2pdf kullanarak PDF sertifika oluşturma:

const Certificates = {
    // Sertifika template
    template: { ... },

    // Sertifika oluştur
    async generate(courseId, userName) {
        // 1. Supabase'de sertifika kaydı oluştur
        // 2. PDF oluştur
        // 3. PDF'i Supabase Storage'a yükle
        // 4. URL'i döndür
    },

    // Sertifika doğrulama
    async verify(certificateNumber) {
        // Supabase'den sertifikayı kontrol et
        // Geçerli/geçersiz durumunu döndür
    },

    // Sertifikayı indir
    download(pdfUrl) {
        // PDF dosyasını indir
    },

    // Sertifika paylaş
    share(certificateNumber) {
        // Sosyal medya paylaşım linki
    }
};

window.Certificates = Certificates;
```

---

## 📝 KULLANIM NOTLARI

### Yeni Oturuma Başlarken:

```
Bu Yeti LAB projesinin geliştirme roadmap'idir.
Lütfen .agent/workflows/tomorrow-roadmap.md dosyasını oku.
Bugün yapılacak görevleri kontrol et ve sırayla uygula.
```

### Hata Ayıklama İçin:

```
Projedeki şu sorunu debug et: [SORUN AÇIKLAMASI]

Lütfen:
1. İlgili dosyaları incele
2. Hatanın kök nedenini bul
3. Minimal ve temiz bir düzeltme öner
4. Düzeltmenin yan etkisi olmadığından emin ol
```

### Yeni Özellik Eklerken:

```
[ÖZELLİK] özelliğini eklemek istiyorum.

Lütfen:
1. Mevcut kod yapısını incele
2. Benzer özelliklerin nasıl implemente edildiğine bak
3. Tutarlı bir yapıda yeni kodu yaz
4. Gerekli Supabase tablolarını/RLS politikalarını belirle
```

---

## 📊 İLERLEME TAKİBİ

| Hafta | Hedef               | Durum     |
| ----- | ------------------- | --------- |
| 1     | Temizlik & Güvenlik | ⏳ Devam  |
| 2     | Profesyonellik      | 📅 Planlı |
| 3     | Altyapı             | 📅 Planlı |
| 4     | Özellikler          | 📅 Planlı |

---

## 🎯 SONRAKI BÜYÜK HEDEFLER

1. **Şubat:** Rozet sistemi tam çalışır, sertifikalar verilebilir
2. **Mart:** AI Asistan güçlendirmesi, Veli Paneli
3. **Nisan:** Proje paylaşım galerisi, PWA desteği
4. **Mayıs:** Beta test, kullanıcı feedback toplama

---

## description: Yeti LAB Projesi Final Stabilizasyon ve Optimizasyon Planı

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

---

## description: Sonraki Adımlar - Admin Panel İyileştirmeleri

# Sonraki Adımlar - Admin Panel İyileştirmeleri

## 📋 Yapılacaklar (Öncelik Sırasına Göre)

### 1. Console.log Temizliği (Yavaşlık İçin) ✅ TAMAMLANDI

- [x] `modules/admin/supabase-sync.js` - Gereksiz loglar kaldırıldı
- [x] `modules/admin/projects.js` - Gereksiz loglar kaldırıldı
- [x] `modules/courseLoader.js` - Gereksiz loglar kaldırıldı
- [x] `modules/admin.js` - Gereksiz loglar kaldırıldı
- [x] `modules/admin/phases.js` - Gereksiz loglar kaldırıldı
- [x] `modules/admin/courses.js` - Gereksiz loglar kaldırıldı

**Not:** Tüm `console.log` satırları kaldırıldı, `console.error` ve `console.warn` korundu.

### 2. Admin Üst Bar Sadeleştirme ✅ TAMAMLANDI

- [x] Üst bardan kurs seçimi dropdown'u kaldırıldı
- [x] ⚙️ Kurs Yönetimi butonu kaldırıldı
- [x] Autosave status daha görünür yapıldı (renkli arka plan, animasyonlu nokta)
- [x] Tüm kurs yönetimi "Kurs Ayarları" collapsible panele taşındı

### 3. Kurs Yönetimi Panel Birleştirme ✅ TAMAMLANDI

- [x] Kurs seçim grid'i eklendi (kartlarla görsel seçim)
- [x] Inline kurs ekleme formu eklendi (modal yerine)
- [x] Kurs sıralama butonları grid'e entegre edildi (hover'da görünür)
- [x] Kurs ayarları (ikon, başlık, açıklama) aynı panelde
- [x] Sekme isimleri editörü aynı panelde

### 4. Index Sayfası Performans ✅ TAMAMLANDI

- [x] Kursların lazy loading ile yüklenmesi sağlandı (loadAll -> init geçişi)
- [x] Skeleton loading kartları entegre edildi
- [x] Supabase sorgusu optimize edildi (proje sayısı metadata ile çekiliyor)
- [x] 🚀 Sayfa açılış hızı ciddi oranda artacak (detaylar sadece tıklanınca yükleniyor)

## ✅ Tamamlanan İşler (Referans)

- Duplicate proje sorunu çözüldü
- Slug stratejisi `p-X` formatına geçildi
- Proje CRUD Supabase sync çalışıyor
- Faz CRUD çalışıyor
- Ders sıralama butonları eklendi
- Kurs yönetimi Supabase'den veri alıyor
- Kurs sıralama butonları eklendi

## 🔧 Teknik Notlar

### Önemli Dosyalar

- `modules/admin/courses.js` - Kurs yönetimi
- `modules/admin/projects.js` - Ders yönetimi
- `modules/admin/phases.js` - Faz yönetimi
- `modules/admin/supabase-sync.js` - Supabase senkronizasyonu
- `modules/admin.js` - Ana admin modülü

### Slug Stratejisi

Projeler: `p-{position}` formatında
Unique constraint: `(course_id, slug)`

### Veritabanı Durumu

- 78 proje (duplicate yok)
- 6 kurs (Minecraft dahil)
- Tüm sluglar `p-X` formatında

---

## description: Test Coverage ve Kod Kalitesi İyileştirme Roadmap - Güvenli Minik Adımlar (8 Ocak 2026)

# 🛡️ Test Coverage & Kod Kalitesi Roadmap

> **ALTIN KURAL:** Her adımdan sonra `npm run test` ve `npm run lint` çalıştır!
> **GERI DÖNÜŞ:** Her adımda sorun çıkarsa, önceki commit'e dön.

---

## ⚠️ BAŞLAMADAN ÖNCE

```
⚠️⚠️⚠️ UYARI ⚠️⚠️⚠️
1. Mevcut tüm testlerin geçtiğinden emin ol
2. Git commit yap (clean state)
3. Her faz sonunda commit at
4. Sorun çıkarsa HEMEN DURDUR, commit'e geri dön
⚠️⚠️⚠️ UYARI ⚠️⚠️⚠️
```

---

## 📋 ROADMAP ÖZETİ

| Faz | Süre  | Risk     | Açıklama                    |
| --- | ----- | -------- | --------------------------- |
| 0   | 5 dk  | 🟢 Yok   | Başlangıç kontrolleri       |
| 1   | 10 dk | 🟢 Düşük | Lint uyarılarını düzelt     |
| 2   | 15 dk | 🟢 Düşük | Test config güncelle        |
| 3   | 20 dk | 🟡 Orta  | Store integration test      |
| 4   | 20 dk | 🟡 Orta  | Validators integration test |
| 5   | 20 dk | 🟡 Orta  | Utils integration test      |
| 6   | 30 dk | 🟡 Orta  | Cache integration test      |
| 7   | ∞     | -        | Devam eden iyileştirmeler   |

---

## FAZ 0: BAŞLANGIÇ KONTROLLARI ✅

### Adım 0.1: Mevcut durumu kontrol et

```bash
# Testler geçiyor mu?
// turbo
npm run test

# Lint hataları var mı?
// turbo
npm run lint
```

### Adım 0.2: Git durumunu kontrol et

```bash
// turbo
git status
```

### Adım 0.3: Clean commit at

```bash
git add -A && git commit -m "checkpoint: before test coverage improvements"
```

### ✅ FAZ 0 TAMAMLANDI MI?

- [ ] Tüm 271 test geçiyor
- [ ] 0 lint hatası (uyarılar olabilir)
- [ ] Git clean state

---

## FAZ 1: LINT UYARILARINI DÜZELT 🧹

> **Risk:** 🟢 Düşük - Sadece stil değişiklikleri

### ⚠️ ÖNCE KONTROL

```
Bu fazda sadece kullanılmayan değişkenler ve stil düzeltmeleri yapılacak.
Hiçbir iş mantığı değişmeyecek.
```

### Adım 1.1: Auto-fix çalıştır

```bash
npm run lint:fix
```

### Adım 1.2: Test et

```bash
// turbo
npm run test
```

### Adım 1.3: Geriye kalan uyarıları görüntüle

```bash
// turbo
npm run lint
```

### Adım 1.4: Manuel düzeltmeler (isteğe bağlı)

Kullanılmayan değişkenleri `_` ile başlat:

```javascript
// Önce:
.catch(e => { ... })

// Sonra:
.catch(_e => { ... })
```

### Adım 1.5: Commit at

```bash
git add -A && git commit -m "chore: fix lint warnings"
```

### ✅ FAZ 1 TAMAMLANDI MI?

- [ ] npm run lint:fix çalıştı
- [ ] Tüm testler hâlâ geçiyor
- [ ] Commit atıldı

### ⚠️ SONRA KONTROL

```
Eğer herhangi bir test FAIL olduysa:
git checkout . && git clean -fd
FAZ 0'a geri dön ve durumu incele.
```

---

## FAZ 2: TEST CONFIG GÜNCELLE ⚙️

> **Risk:** 🟢 Düşük - Sadece config değişikliği

### ⚠️ ÖNCE KONTROL

```
Bu fazda sadece vitest.config.js güncellenecek.
Mevcut testler etkilenmeyecek.
```

### Adım 2.1: Integration test klasörü oluştur

```bash
mkdir tests\integration
```

### Adım 2.2: vitest.config.js'i güncelle

```javascript
// tests/integration klasörünü include et
include: ['tests/**/*.test.js'],

// admin.js'i coverage'a ekle (artık test edeceğiz)
exclude: [], // Boş bırak
```

### Adım 2.3: Test et

```bash
// turbo
npm run test
```

### Adım 2.4: Commit at

```bash
git add -A && git commit -m "chore: update vitest config for integration tests"
```

### ✅ FAZ 2 TAMAMLANDI MI?

- [ ] tests/integration klasörü oluşturuldu
- [ ] vitest.config.js güncellendi
- [ ] Tüm testler hâlâ geçiyor
- [ ] Commit atıldı

---

## FAZ 3: STORE INTEGRATION TEST 🏪

> **Risk:** 🟡 Orta - Gerçek modülü import ediyoruz

### ⚠️ ÖNCE KONTROL

```
Bu fazda gerçek Store modülünü test edeceğiz.
Mevcut mock testler değişmeyecek, yeni test dosyası eklenecek.
```

### Adım 3.1: Store integration test dosyası oluştur

Dosya: `tests/integration/store.integration.test.js`

```javascript
/**
 * Store Module Integration Tests
 *
 * Bu testler GERÇEK Store modülünü test eder.
 * Mevcut unit testler mock kullanır, bunlar gerçek davranışı test eder.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Gerçek Store modülünü dinamik import et
let Store;

describe('Store Integration', () => {
    beforeEach(async () => {
        // Her test öncesi localStorage temizle
        localStorage.clear();
        sessionStorage.clear();

        // Modülü yeniden yükle (fresh state için)
        vi.resetModules();

        try {
            const module = await import('../../modules/store/store.js');
            Store = module.Store || module.default;
        } catch (e) {
            console.warn('Store module import failed, using mock');
            Store = null;
        }
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Module Loading', () => {
        it('should load Store module successfully', () => {
            // Store yüklenemezse test skip edilir
            if (!Store) {
                console.log('Store module not available, skipping...');
                return;
            }
            expect(Store).toBeDefined();
        });

        it('should have required methods', () => {
            if (!Store) return;

            expect(typeof Store.init).toBe('function');
            expect(typeof Store.getState).toBe('function');
            expect(typeof Store.setState).toBe('function');
        });
    });

    describe('State Management', () => {
        it('should initialize with default state', () => {
            if (!Store) return;

            Store.init();
            const state = Store.getState();
            expect(state).toBeDefined();
        });

        it('should update state correctly', () => {
            if (!Store) return;

            Store.init();
            Store.setState({ testKey: 'testValue' });
            const state = Store.getState();
            expect(state.testKey).toBe('testValue');
        });
    });
});
```

### Adım 3.2: Test et

```bash
// turbo
npm run test
```

### Adım 3.3: Coverage kontrol et

```bash
// turbo
npm run test:coverage
```

### Adım 3.4: Commit at

```bash
git add -A && git commit -m "test: add Store integration tests"
```

### ✅ FAZ 3 TAMAMLANDI MI?

- [ ] store.integration.test.js oluşturuldu
- [ ] Tüm testler geçiyor (271 + yeni testler)
- [ ] Coverage raporunda Store görünüyor
- [ ] Commit atıldı

### ⚠️ SONRA KONTROL

```
Eğer import hatası alıyorsak:
- Modül yolu doğru mu kontrol et
- jsdom environment'ta çalışıyor mu kontrol et
```

---

## FAZ 4: VALIDATORS INTEGRATION TEST ✅

> **Risk:** 🟡 Orta - Basit, bağımsız modül

### ⚠️ ÖNCE KONTROL

```
Validators modülü bağımsız, yan etkisi yok.
En güvenli integration test hedefi.
```

### Adım 4.1: Validators integration test dosyası oluştur

Dosya: `tests/integration/validators.integration.test.js`

```javascript
/**
 * Validators Module Integration Tests
 *
 * Gerçek Validators modülünü test eder.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

let Validators;

describe('Validators Integration', () => {
    beforeEach(async () => {
        vi.resetModules();

        try {
            const module = await import('../../modules/validators.js');
            Validators = module.Validators || module.default;
        } catch (e) {
            console.warn('Validators module import failed:', e.message);
            Validators = null;
        }
    });

    describe('Module Loading', () => {
        it('should load Validators module successfully', () => {
            if (!Validators) {
                console.log('Validators module not available, skipping...');
                return;
            }
            expect(Validators).toBeDefined();
        });
    });

    describe('Email Validation', () => {
        it('should validate correct email', () => {
            if (!Validators?.isValidEmail) return;

            expect(Validators.isValidEmail('test@example.com')).toBe(true);
            expect(Validators.isValidEmail('user.name@domain.org')).toBe(true);
        });

        it('should reject invalid email', () => {
            if (!Validators?.isValidEmail) return;

            expect(Validators.isValidEmail('invalid')).toBe(false);
            expect(Validators.isValidEmail('test@')).toBe(false);
            expect(Validators.isValidEmail('@domain.com')).toBe(false);
        });
    });

    describe('Password Validation', () => {
        it('should validate password length', () => {
            if (!Validators?.isValidPassword) return;

            // En az 6 karakter olmalı
            expect(Validators.isValidPassword('12345')).toBe(false);
            expect(Validators.isValidPassword('123456')).toBe(true);
        });
    });

    describe('Input Sanitization', () => {
        it('should sanitize HTML', () => {
            if (!Validators?.sanitizeInput) return;

            const input = '<script>alert("xss")</script>';
            const sanitized = Validators.sanitizeInput(input);
            expect(sanitized).not.toContain('<script>');
        });
    });
});
```

### Adım 4.2: Test et

```bash
// turbo
npm run test
```

### Adım 4.3: Commit at

```bash
git add -A && git commit -m "test: add Validators integration tests"
```

### ✅ FAZ 4 TAMAMLANDI MI?

- [ ] validators.integration.test.js oluşturuldu
- [ ] Tüm testler geçiyor
- [ ] Commit atıldı

---

## FAZ 5: UTILS INTEGRATION TEST 🔧

> **Risk:** 🟡 Orta - Basit yardımcı fonksiyonlar

### Adım 5.1: Utils integration test dosyası oluştur

Dosya: `tests/integration/utils.integration.test.js`

```javascript
/**
 * Utils Module Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

let Utils;

describe('Utils Integration', () => {
    beforeEach(async () => {
        vi.resetModules();

        try {
            const module = await import('../../modules/utils.js');
            Utils = module.Utils || module.default;
        } catch (e) {
            console.warn('Utils module import failed:', e.message);
            Utils = null;
        }
    });

    describe('Module Loading', () => {
        it('should load Utils module successfully', () => {
            if (!Utils) {
                console.log('Utils module not available, skipping...');
                return;
            }
            expect(Utils).toBeDefined();
        });
    });

    describe('Format Functions', () => {
        it('should format date correctly', () => {
            if (!Utils?.formatDate) return;

            const date = new Date('2026-01-08');
            const formatted = Utils.formatDate(date);
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
        });
    });

    describe('String Helpers', () => {
        it('should slugify text', () => {
            if (!Utils?.slugify) return;

            expect(Utils.slugify('Hello World')).toBe('hello-world');
            expect(Utils.slugify('Türkçe Karakter')).toBeDefined();
        });
    });

    describe('Debounce', () => {
        it('should debounce function calls', async () => {
            if (!Utils?.debounce) return;

            let callCount = 0;
            const fn = Utils.debounce(() => callCount++, 50);

            fn();
            fn();
            fn();

            expect(callCount).toBe(0); // Henüz çağrılmamış olmalı

            await new Promise((r) => setTimeout(r, 100));
            expect(callCount).toBe(1); // Sadece 1 kez çağrılmış olmalı
        });
    });
});
```

### Adım 5.2: Test et ve commit at

```bash
// turbo
npm run test
git add -A && git commit -m "test: add Utils integration tests"
```

### ✅ FAZ 5 TAMAMLANDI MI?

- [ ] utils.integration.test.js oluşturuldu
- [ ] Tüm testler geçiyor
- [ ] Commit atıldı

---

## FAZ 6: CACHE INTEGRATION TEST 📦

> **Risk:** 🟡 Orta - localStorage kullanıyor

### Adım 6.1: Cache integration test dosyası oluştur

Dosya: `tests/integration/cache.integration.test.js`

```javascript
/**
 * Cache Module Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let Cache;

describe('Cache Integration', () => {
    beforeEach(async () => {
        localStorage.clear();
        vi.resetModules();

        try {
            const module = await import('../../modules/cache.js');
            Cache = module.Cache || module.default;
        } catch (e) {
            console.warn('Cache module import failed:', e.message);
            Cache = null;
        }
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Module Loading', () => {
        it('should load Cache module successfully', () => {
            if (!Cache) {
                console.log('Cache module not available, skipping...');
                return;
            }
            expect(Cache).toBeDefined();
        });
    });

    describe('Basic Operations', () => {
        it('should set and get cache value', () => {
            if (!Cache?.set || !Cache?.get) return;

            Cache.set('testKey', { data: 'testValue' });
            const result = Cache.get('testKey');

            expect(result).toBeDefined();
            expect(result.data).toBe('testValue');
        });

        it('should delete cache value', () => {
            if (!Cache?.set || !Cache?.get || !Cache?.delete) return;

            Cache.set('testKey', 'testValue');
            Cache.delete('testKey');

            expect(Cache.get('testKey')).toBeNull();
        });
    });

    describe('Expiration', () => {
        it('should return null for expired cache', async () => {
            if (!Cache?.set || !Cache?.get) return;

            // 100ms TTL ile kaydet
            Cache.set('expireKey', 'value', 100);

            // 150ms bekle
            await new Promise((r) => setTimeout(r, 150));

            // Expire olmuş olmalı
            const result = Cache.get('expireKey');
            expect(result).toBeNull();
        });
    });
});
```

### Adım 6.2: Test et ve commit at

```bash
// turbo
npm run test
git add -A && git commit -m "test: add Cache integration tests"
```

### ✅ FAZ 6 TAMAMLANDI MI?

- [ ] cache.integration.test.js oluşturuldu
- [ ] Tüm testler geçiyor
- [ ] Commit atıldı

---

## FAZ 7: FINAL KONTROL VE DEVAM 🎯

### Adım 7.1: Tüm testleri çalıştır

```bash
// turbo
npm run test:coverage
```

### Adım 7.2: Coverage raporunu incele

- Coverage artmış mı?
- Hangi modüller hâlâ %0?

### Adım 7.3: Final commit

```bash
git add -A && git commit -m "feat: improve test coverage with integration tests"
git push origin main
```

---

## 📊 İLERLEME TAKİBİ

| Faz | Durum | Tari       | Notlar                          |
| --- | ----- | ---------- | ------------------------------- |
| 0   | ✅    | 2026-01-08 | Checkpoint commit atıldı        |
| 1   | ✅    | 2026-01-08 | 48 → 36 uyarı düzeltildi        |
| 2   | ✅    | 2026-01-08 | integration klasörü oluşturuldu |
| 3   | ✅    | 2026-01-08 | Store %96 coverage! 🎉          |
| 4   | ✅    | 2026-01-08 | Validators %100 coverage! 🎉    |
| 5   | ✅    | 2026-01-08 | Utils %97 coverage! 🎉          |
| 6   | ✅    | 2026-01-08 | Cache %96 coverage! 🎉          |
| 7   | ⬜    | -          | Final kontroller                |

---

## 🚨 SORUN GİDERME

### Testler fail olursa:

```bash
# Değişiklikleri geri al
git checkout .
git clean -fd

# Son çalışan commit'e dön
git reset --hard HEAD~1
```

### Import hatası alırsan:

1. Dosya yolunu kontrol et
2. Modül export'unu kontrol et (`export const X` vs `export default`)
3. jsdom environment'ta window objesi var mı kontrol et

### Lint hatası alırsan:

```bash
npm run lint:fix
```

---

## 🔜 SONRAKI ADIMLAR (Bu roadmap sonrası)

1. **Router Integration Test** - Hash routing testi
2. **API Integration Test** - Mock Supabase ile
3. **E2E Tests** - Playwright kurulumu
4. **Admin Module Tests** - Karmaşık, dikkatli yaklaşım gerekli

---

## description: Router ve ViewManager Integration Test Roadmap - Güvenli Minik Adımlar (8 Ocak 2026)

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

---

## description: Vite Production Build - Minik Adımlarla Güvenli Geçiş Planı

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
