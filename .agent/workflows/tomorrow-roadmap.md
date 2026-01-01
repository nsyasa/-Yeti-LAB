---
description: Yarınki geliştirme planı - 1 Ocak 2025
---

# 🗺️ YETİ LAB GELİŞTİRME ROADMAP
## Tarih: 2 Ocak 2026 (Yarından itibaren)

---

## ✅ BUGÜN TAMAMLANANLAR (1 Ocak 2026)

| Görev | Durum |
|-------|-------|
| Profile "Kaydet" buton genişliği | ✅ Tamamlandı |
| Emoji Avatar 404 fix | ✅ Tamamlandı |
| Copyright 2025 → 2026 | ✅ Tamamlandı |
| Toast modülü profile.html | ✅ Tamamlandı |
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
| Gün | Görevler |
|-----|----------|
| 2 Ocak | SEC-001, SEC-002 (Güvenlik) |
| 3 Ocak | DES-001 (Design Tokens) |
| 4 Ocak | DES-002 (Component Classes) |
| 5 Ocak | DES-003 (Footer tutarlılığı) |
| 6-7 Ocak | SEO-001, Test & Debug |

### HAFTA 2 (8-14 Ocak) - PROFESYONELLİK
| Gün | Görevler |
|-----|----------|
| 8-9 Ocak | Form validation & UX |
| 10-11 Ocak | Responsive polish, mobil iyileştirmeler |
| 12-14 Ocak | Cross-browser testing |

### HAFTA 3 (15-21 Ocak) - ALTYAPI
| Gün | Görevler |
|-----|----------|
| 15-17 Ocak | Veritabanı genişletmeleri (badges, certificates tabloları) |
| 18-21 Ocak | Modül altyapıları (gamification.js, certificates.js) |

### HAFTA 4 (22-31 Ocak) - ÖZELLİKLER
| Gün | Görevler |
|-----|----------|
| 22-25 Ocak | Rozet sistemi (Gamification) |
| 26-28 Ocak | AI Asistan güçlendirme |
| 29-31 Ocak | Sertifika sistemi temeli |

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

| Hafta | Hedef | Durum |
|-------|-------|-------|
| 1 | Temizlik & Güvenlik | ⏳ Devam |
| 2 | Profesyonellik | 📅 Planlı |
| 3 | Altyapı | 📅 Planlı |
| 4 | Özellikler | 📅 Planlı |

---

## 🎯 SONRAKI BÜYÜK HEDEFLER

1. **Şubat:** Rozet sistemi tam çalışır, sertifikalar verilebilir
2. **Mart:** AI Asistan güçlendirmesi, Veli Paneli
3. **Nisan:** Proje paylaşım galerisi, PWA desteği
4. **Mayıs:** Beta test, kullanıcı feedback toplama
