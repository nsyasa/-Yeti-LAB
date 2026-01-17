# Changelog

Yeti LAB için tüm önemli değişiklikler bu dosyada belgelenir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına uygundur.

---

## [1.3.9] - 2026-01-17

### 🐛 Bugfix - ThemeManager Method Name Consistency

#### Critical Fix: Admin/Teacher Panel Crash

**Sorun**: Admin ve Teacher panelleri açılırken `TypeError: ThemeManager.load is not a function` hatası alınıyordu.

**Kök Neden**: v1.3.1'de `Navbar.js`'de `ThemeManager.load()` → `ThemeManager.init()` değişikliği yapılmış ama diğer dosyalar güncellenmemişti.

**Çözüm**: Tüm `ThemeManager.load()` çağrıları `ThemeManager.init()` olarak güncellendi.

#### Düzeltilen Dosyalar

| Dosya                                           | Satır | Değişiklik                       |
| ----------------------------------------------- | ----- | -------------------------------- |
| `views/admin/AdminView.js`                      | 275   | `ThemeManager.load()` → `init()` |
| `views/teacher/TeacherView.js`                  | 114   | `ThemeManager.load()` → `init()` |
| `modules/teacher-manager.js`                    | 154   | `ThemeManager.load()` → `init()` |
| `tests/integration/teacher.integration.test.js` | 148   | Test assertion güncellendi       |

#### Etki

- ✅ Admin paneli artık hatasız açılıyor
- ✅ Teacher paneli artık hatasız açılıyor
- ✅ Tema yükleme fonksiyonu tutarlı

---

## [1.3.9] - 2026-01-17

### 🧪 Test Fixes - Spy Error Corrections

#### Test Suite Regression Fixes

**Sorun**: RLS güncellemeleri sonrası test suite'de spy hataları ortaya çıktı.

**Çözüm**: Mock konfigürasyonları düzeltildi, eksik global mock'lar eklendi.

#### Değişiklikler

**1. courses.integration.test.js**

- `vi.spyOn()` yerine doğrudan `vi.fn()` referansı kullanıldı
- `Utils` global mock eklendi (XSS fonksiyonları için)

```javascript
// ÖNCE (Hatalı)
const insertSpy = vi.spyOn(global.SupabaseClient.client, 'from');

// SONRA (Doğru)
const fromSpy = global.SupabaseClient.client.from; // Already a vi.fn

// Utils mock eklendi
global.Utils = {
    escapeHtml: vi.fn((str) => str),
    sanitizeOnclickParam: vi.fn((str) => str),
};
```

**2. teacher.integration.test.js**

- `ThemeManager.init` mock fonksiyonu eklendi

```javascript
global.ThemeManager = {
    load: vi.fn(),
    init: vi.fn(), // Added
};
```

#### Doğrulama

- ✅ Build: PASS (1.54s)
- ✅ All Tests: 457/457 PASS
- ✅ Exit code: 0

#### Dosyalar

- `tests/integration/courses.integration.test.js`
- `tests/integration/teacher.integration.test.js`

---

## [1.3.8] - 2026-01-17

### 🔒 Security Enhancement - Admin Check Unification

#### Dual-Source Admin Verification

**Sorun**: Admin kontrolü iki farklı kaynaktan yapılıyordu ve tutarsızlık yaratabiliyordu:

- `Auth.isAdmin()` → `user_profiles.role === 'admin'` (application-level)
- `SupabaseClient.isAdmin` → `content_admins` tablosu (database-level, RLS)

**Çözüm**: `Auth.isAdmin()` fonksiyonu her iki kaynağı da kontrol edecek şekilde güncellendi (OR logic).

#### Değişiklikler

**1. Auth.isAdmin() - Dual-Source Check**

```javascript
isAdmin() {
    // Check user_profiles.role (application-level)
    const hasAdminRole = this.userRole === 'admin';

    // Check content_admins table (database-level, used by RLS)
    const isContentAdmin = typeof SupabaseClient !== 'undefined' &&
                          SupabaseClient.isAdmin === true;

    // User is admin if EITHER source confirms it
    return hasAdminRole || isContentAdmin;
}
```

**2. Auth.loadUserProfile() - Ensure checkAdminStatus Called**

```javascript
// Check admin status in content_admins table (for RLS compatibility)
if (typeof SupabaseClient !== 'undefined' && SupabaseClient.checkAdminStatus) {
    await SupabaseClient.checkAdminStatus();
}
```

#### Güvenlik İyileştirmesi

**ÖNCE:**

```javascript
// Sadece user_profiles.role kontrolü
return this.userRole === 'admin';
```

**SONRA:**

```javascript
// Dual-source: user_profiles.role OR content_admins
return this.userRole === 'admin' || SupabaseClient.isAdmin === true;
```

#### Admin Senaryoları

| Senaryo                | user_profiles.role | content_admins | Auth.isAdmin() |
| ---------------------- | ------------------ | -------------- | -------------- |
| Admin (both sources)   | 'admin'            | ✅             | ✅ true        |
| Admin (app-level only) | 'admin'            | ❌             | ✅ true        |
| Admin (DB-level only)  | 'teacher'          | ✅             | ✅ true        |
| Non-admin              | 'teacher'          | ❌             | ❌ false       |

#### Doğrulama

- ✅ Dual-source check implemented
- ✅ checkAdminStatus called in loadUserProfile
- ✅ Backward compatible
- ✅ RLS compatible

#### Dosyalar

- `modules/auth.js` - Lines 251-254, 468-476

---

## [1.3.7] - 2026-01-17

### 🔒 Security Maintenance - SQL Script Deprecation and Consolidation

#### Insecure Script Deprecation

**Sorun**: `sql/fix_permissions.sql` scripti CRITICAL güvenlik açığı içeriyordu ve yanlışlıkla kullanılabilirdi.

**Çözüm**: Script deprecated edildi, consolidated güvenli script oluşturuldu, README'ye uyarılar eklendi.

#### Değişiklikler

**1. File Rename**

```bash
sql/fix_permissions.sql → sql/fix_permissions_INSECURE_DO_NOT_USE.sql
```

**2. Deprecation Warning (18-line banner)**

```sql
-- ============================================================================
-- ⚠️⚠️⚠️ DEPRECATED - DO NOT USE IN PRODUCTION ⚠️⚠️⚠️
-- ============================================================================
--
-- BU SCRIPT AUTHENTICATED WRITE AÇAR - PRODUCTION'DA KULLANMAYIN!
--
-- ❌ SORUN: auth.role() = 'authenticated' → Herkes yazabilir
-- ✅ ÇÖZÜM: sql/rls_content_admin.sql kullanın
```

**3. Consolidated Secure Script**

```bash
# Yeni dosya: sql/rls_content_admin.sql
# İçerik: 4 tablo, 16 policy (tek dosyada)
- courses (4 policies)
- phases (4 policies)
- projects (4 policies)
- course_components (4 policies)
```

**4. README.md Update**

```markdown
### 5. Supabase RLS Güvenliğini Uygulayın

#### Production İçin (ÖNERİLEN):

sql/rls_content_admin.sql

#### ❌ KULLANMAYIN:

sql/fix_permissions_INSECURE_DO_NOT_USE.sql
```

#### Güvenlik İyileştirmesi

**ÖNCE:**

- ❌ Scattered scripts (3 farklı dosya)
- ❌ Kolay yanlışlıkla insecure script kullanımı
- ❌ Uyarı yok

**SONRA:**

- ✅ Consolidated script (tek dosya)
- ✅ Büyük deprecation uyarıları
- ✅ README documentation

#### Doğrulama

- ✅ `git grep "fix_permissions.sql"` → No results
- ✅ README security section added
- ✅ All policies verified in Supabase

#### Dosyalar

- `sql/rls_content_admin.sql` - Consolidated production script
- `sql/fix_permissions_INSECURE_DO_NOT_USE.sql` - Deprecated (⚠️ WARNING)

---

## [1.3.6] - 2026-01-16

### 🔒 Security Hardening - RLS Extension to Content Tables

#### Critical Security Fix: Admin-Only Write Access for Content Tables

**Sorun**: `phases`, `projects`, ve `course_components` tabloları için RLS politikaları eksik veya yetersiz. Bu tablolara write erişimi kısıtlanmamış.

**Çözüm**: `courses` tablosunda uygulanan RLS güvenlik modeli `phases`, `projects`, ve `course_components` tablolarına genişletildi.

#### Değişiklikler

**1. Phases Table (4 policies)**

```sql
-- SELECT: Public read (marketing funnel)
CREATE POLICY "phases_select_public" ON public.phases
FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: Content admins only
CREATE POLICY "phases_insert_admin" ON public.phases
FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());

CREATE POLICY "phases_update_admin" ON public.phases
FOR UPDATE TO authenticated USING (public.is_content_admin());

CREATE POLICY "phases_delete_admin" ON public.phases
FOR DELETE TO authenticated USING (public.is_content_admin());
```

**2. Projects Table (4 policies)**

```sql
-- SELECT: Public read (marketing funnel)
CREATE POLICY "projects_select_public" ON public.projects
FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: Content admins only
CREATE POLICY "projects_insert_admin" ON public.projects
FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());

CREATE POLICY "projects_update_admin" ON public.projects
FOR UPDATE TO authenticated USING (public.is_content_admin());

CREATE POLICY "projects_delete_admin" ON public.projects
FOR DELETE TO authenticated USING (public.is_content_admin());
```

**3. Course Components Table (4 policies)**

```sql
-- SELECT: Authenticated users only (sensitive data)
CREATE POLICY "components_select_authenticated" ON public.course_components
FOR SELECT TO authenticated USING (true);

-- INSERT/UPDATE/DELETE: Content admins only
CREATE POLICY "components_insert_admin" ON public.course_components
FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());

CREATE POLICY "components_update_admin" ON public.course_components
FOR UPDATE TO authenticated USING (public.is_content_admin());

CREATE POLICY "components_delete_admin" ON public.course_components
FOR DELETE TO authenticated USING (public.is_content_admin());
```

#### SELECT Policy Kararları

| Table               | SELECT Policy      | Gerekçe                                          |
| ------------------- | ------------------ | ------------------------------------------------ |
| `phases`            | Public read        | Kurs yapısı marketing funnel için görünür olmalı |
| `projects`          | Public read        | Proje listesi anonim ziyaretçilere gösterilmeli  |
| `course_components` | Authenticated-only | Hassas metadata (quiz cevapları vb.)             |

#### Güvenlik İyileştirmesi

**Kod Kanıtı (supabase-sync.js):**

- `phases`: INSERT (L329), UPDATE (L323), DELETE (L352)
- `projects`: UPSERT (L246), DELETE (L289)
- `course_components`: UPSERT (L655)

**Güvenlik Durumu:**

- ✅ 4 tablo güvenli: `courses`, `phases`, `projects`, `course_components`
- ✅ 16 policy total (4 per table)
- ✅ Admin-only write, public/authenticated read

#### Doğrulama

- ✅ Policy count: 12 policies (4 per table)
- ✅ Non-admin write: BLOCKED
- ✅ Admin write: ALLOWED
- ✅ Public read (phases/projects): ALLOWED
- ✅ Authenticated read (components): ALLOWED

#### Dosyalar

- `sql/secure_content_tables_rls.sql` - Production patch
- `sql/rollback_content_tables_rls.sql` - Emergency rollback (⚠️ INSECURE)

---

## [1.3.5] - 2026-01-16

### 🔒 Security Hardening - RLS Policy Enhancement for Courses Table

#### Critical Security Fix: Admin-Only Write Access

**Sorun**: `courses` tablosu RLS politikaları tüm `authenticated` kullanıcılara (öğrenciler dahil) INSERT, UPDATE, DELETE izni veriyordu. Bu, yetkisiz kurs manipülasyonuna açıktı.

**Çözüm**: RLS politikaları güncellenerek write operasyonları sadece `content_admins` tablosunda kaydı olan kullanıcılarla sınırlandırıldı.

#### Değişiklikler

**1. Helper Function (SECURITY DEFINER + search_path protection)**

```sql
CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.content_admins
    WHERE user_id = auth.uid()
  );
$$;
```

**2. New Secure Policies**

```sql
-- SELECT: Public read (marketing funnel)
CREATE POLICY "courses_select_public" ON public.courses
FOR SELECT USING (true);

-- INSERT: Content admins only
CREATE POLICY "courses_insert_admin" ON public.courses
FOR INSERT TO authenticated WITH CHECK (public.is_content_admin());

-- UPDATE: Content admins only
CREATE POLICY "courses_update_admin" ON public.courses
FOR UPDATE TO authenticated USING (public.is_content_admin());

-- DELETE: Content admins only
CREATE POLICY "courses_delete_admin" ON public.courses
FOR DELETE TO authenticated USING (public.is_content_admin());
```

#### Güvenlik İyileştirmesi

**ÖNCE (Vulnerable):**

```sql
-- ❌ Herhangi bir authenticated user kurs ekleyebilir/silebilir
auth.role() = 'authenticated'
```

**SONRA (Secure):**

```sql
-- ✅ Sadece content_admins tablosundaki kullanıcılar
public.is_content_admin()
```

#### Admin Kaynağı Seçimi

**Seçilen:** `content_admins` tablosu (database-level security)

**Gerekçe:**

1. Database-level security: RLS'de doğrudan sorgulanabilir
2. Consistency: Mevcut `supabaseClient.js` zaten bu kaynağı kullanıyor

#### Doğrulama

- ✅ Helper function: `SECURITY DEFINER` + `SET search_path = public`
- ✅ Policy count: 4 policies (clean)
- ✅ Non-admin write: BLOCKED
- ✅ Admin write: ALLOWED
- ✅ Public read: ALLOWED (marketing funnel)

#### Dosyalar

- `sql/secure_courses_rls.sql` - Production patch
- `sql/rollback_courses_rls.sql` - Emergency rollback (⚠️ INSECURE)

---

## [1.3.4] - 2026-01-16

### 🔒 Security Enhancement - XSS Hardening Fixes

#### Additional Security Improvements

**Sorun**: P0/P1 XSS patch'lerinden sonra 3 küçük güvenlik açığı tespit edildi:

1. `components.js` - `comp` undefined olursa crash
2. `phases.js` - `safeColor` boş kalırsa invalid CSS class
3. `richTextEditor.js` - URL attribute injection riski

**Çözüm**: Minimal diff ile 3 hardening düzeltmesi uygulandı.

#### Değişiklikler

**1. Optional Chaining (components.js)**

```javascript
// ✅ SAFE: Prevents crash on undefined comp
const safeName = Utils.escapeHtml(String(comp?.name ?? key));
const safeIcon = Utils.escapeHtml(String(comp?.icon ?? '📦'));
```

**2. Color Fallback (phases.js)**

```javascript
// ✅ SAFE: Prevents empty class name
const safeColor = rawColor.replace(/[^a-z0-9-]/gi, '') || 'gray';
```

**3. URL Attribute Escaping + Protocol Allowlist (richTextEditor.js)**

```javascript
// Helper: Escape HTML attributes
const escapeAttr = (str) => {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

// Allowlist: Safe protocols only
const safePatterns = [
    /^https?:\/\//i, // http(s)://
    /^mailto:/i, // mailto:
    /^#/, // anchors
    /^\//, // absolute paths
    /^\.\//, // relative paths
];
```

#### Güvenlik İyileştirmesi

- ✅ **URL Attribute Injection:** `[x](url" onmouseover="alert(1))` → Escaped
- ✅ **Protocol Allowlist:** `javascript:`, `data:`, `file:` → Blocked
- ✅ **Relative URLs:** `/`, `./`, `../` → Allowed
- ✅ **Mailto Links:** `mailto:` → Allowed
- ✅ **rel="noopener noreferrer":** Added for security

#### Doğrulama

- ✅ Build test: PASS (1.46s)
- ✅ URL attribute injection test: BLOCKED
- ✅ JavaScript protocol test: BLOCKED
- ✅ Relative URLs test: ALLOWED

---

## [1.3.3] - 2026-01-16

### 🔒 Security Fix - XSS Prevention in Admin Courses UI

#### Critical Security Patch: HTML Injection Prevention

**Sorun**: `modules/admin/courses.js` dosyasındaki `renderSelectorGrid()` ve `renderList()` fonksiyonları, kullanıcı tarafından kontrol edilebilir verileri (course title, key, icon) doğrudan `innerHTML` ile render ediyordu. Bu, XSS (Cross-Site Scripting) ve attribute injection saldırılarına açıktı.

**Çözüm**: Minimal diff ile güvenlik açığı kapatıldı. HTML özel karakterleri escape edildi ve onclick parametreleri güvenli şekilde serialize edildi.

#### Değişiklikler

**HTML Escaping:**

```javascript
// ✅ SAFE: Escape HTML special characters
const safeKey = Utils.escapeHtml(String(c.key ?? ''));
const safeTitle = Utils.escapeHtml(String(c.title ?? ''));
const safeIcon = Utils.escapeHtml(String(c.icon ?? '📦'));
```

**Onclick Parameter Sanitization:**

```javascript
// ❌ BEFORE: String interpolation (vulnerable to injection)
onclick = "CourseManager.selectCourse('${c.key}')";

// ✅ AFTER: JSON.stringify (safe serialization)
const onclickParam = JSON.stringify(String(c.key ?? ''));
onclick = 'CourseManager.selectCourse(${onclickParam})';
```

#### Güvenlik İyileştirmesi

- ✅ **HTML Injection:** `<img src=x onerror="alert()">` → Escaped, script çalışmaz
- ✅ **Attribute Injection:** `test' onclick='alert(1)'` → Escaped, onclick hijack olmaz
- ✅ **Script Injection:** `</span><script>alert()</script>` → Escaped, tag kırılmaz

#### Etkilenen Fonksiyonlar

| Fonksiyon              | Satırlar | Değişiklik                            |
| ---------------------- | -------- | ------------------------------------- |
| `renderSelectorGrid()` | 63-96    | +6 satır (escape logic), 4 değişiklik |
| `renderList()`         | 304-335  | +6 satır (escape logic), 4 değişiklik |

#### Doğrulama

- ✅ Grep test: Vulnerable pattern kalmadı
- ✅ Build test: Hatasız build (2.72s)
- ✅ Fonksiyonellik: Tüm özellikler çalışıyor
- ✅ Performance: Bundle size değişmedi

---

## [1.3.2] - 2026-01-16

### 🔒 Security Hardening - RLS Policy Update

#### Critical Security Fix: Courses Table Access Control

**Sorun**: `courses` tablosu RLS politikaları tüm `authenticated` kullanıcılara write izni veriyordu. Bu, öğrenciler dahil herhangi bir giriş yapmış kullanıcının kurs ekleyebileceği/silebileceği anlamına geliyordu.

**Çözüm**: RLS politikaları güncellenerek write operasyonları sadece `content_admins` tablosunda kaydı olan kullanıcılarla sınırlandırıldı.

#### Değişiklikler

- **Helper Function**: `public.is_content_admin()` fonksiyonu eklendi
    - `STABLE` ve `SECURITY DEFINER` olarak tanımlandı
    - `content_admins` tablosunda kullanıcı kontrolü yapıyor
    - `authenticated` role'üne execute yetkisi verildi

- **RLS Policies Güncellendi**:
    - ✅ `SELECT`: Public erişim korundu (herkes kursları okuyabilir)
    - 🔒 `INSERT`: Sadece content_admins
    - 🔒 `UPDATE`: Sadece content_admins
    - 🔒 `DELETE`: Sadece content_admins

#### Yeni Dosyalar

| Dosya                          | Açıklama               |
| ------------------------------ | ---------------------- |
| `sql/secure_courses_rls.sql`   | Ana güvenlik patch'i   |
| `sql/rollback_courses_rls.sql` | Acil geri alma scripti |

#### Admin Tanımı - Tek Kaynak

**Önceki Durum**: İki farklı admin kaynağı kullanılıyordu

- `Auth.isAdmin()` → `user_profiles.role === 'admin'`
- `SupabaseClient.checkAdminStatus()` → `content_admins` tablosu

**Yeni Durum**: RLS politikaları için `content_admins` tablosu tek kaynak olarak seçildi

- Database-level güvenlik sağlar
- Foreign key constraint ile veri bütünlüğü garantili
- RLS'de doğrudan sorgulanabilir

#### Doğrulama

- ✅ Admin olmayan kullanıcı ile INSERT/UPDATE/DELETE → `403 Forbidden` (RLS policy violation)
- ✅ Admin kullanıcı ile tüm CRUD operasyonları → Başarılı
- ✅ Public SELECT erişimi → Korundu

#### Etki

- **Güvenlik**: Yetkisiz kurs manipülasyonu riski ortadan kaldırıldı
- **Fonksiyonellik**: Admin kullanıcılar için değişiklik yok
- **Kullanıcı Deneyimi**: Public kurs görüntüleme etkilenmedi

---

## [1.3.1] - 2026-01-16

### 📱 Navigation UX Overhaul

#### Context-Aware Mobile Navigation

- **Akıllı Buton Görünürlüğü**: Mobil alt menüdeki "Ders Listesi" butonu artık sadece kurs içinde görünüyor
    - Index (kurs seçim) sayfasında: Sadece 🔍 (Ara) butonu görünür
    - Dashboard/Ders detayında: Hem 🔍 hem 📖 (Ders Listesi) butonları görünür
- **`switchView` Fonksiyonu**: Görünüm değişikliklerinde buton durumlarını otomatik güncelliyor

#### Desktop Dashboard Improvements

- **Kurslar Butonu**: Turuncu-kırmızı gradient ile vurgulanmış geri dönüş butonu
- **Ders Listesi Butonu**: Kurs başlığının altında, teal/cyan gradient ile belirgin CTA

#### Navbar Cleanup

- Navbar'daki arama ikonu mobilde kaldırıldı (alt menüde var)
- `ThemeManager.load()` → `ThemeManager.init()` hatası düzeltildi

### 🐛 Kritik Bug Fix: Sidebar Açılmıyor

#### Problem Analizi

**Sorun**: Mobilde "Ders Listesi" butonuna tıklandığında sidebar açılmıyordu, sadece overlay (blur) görünüyordu.

**Kök Neden - CSS/JS Class Çakışması**:

1. **HTML** (`index.html`): Sidebar elementi `invisible -translate-x-full` Tailwind class'larıyla başlıyordu
2. **CSS** (`input.css`): `#lesson-sidebar.open { transform: translateX(0) }` kuralı tanımlıydı
3. **JS** (`ui.js`): `toggleSidebar` fonksiyonu sadece `.open` class'ı ekliyordu

**Sonuç**: Tailwind'in `-translate-x-full` class'ı `!important` benzeri specificity ile CSS'teki `.open` transform'unu override ediyordu. Sidebar yerinde kalıyordu.

#### Çözüm

`toggleSidebar` fonksiyonu güncellendi:

```javascript
// AÇARKEN - Tailwind class'larını kaldır + CSS class'ını ekle
sidebar.classList.remove('invisible', '-translate-x-full');
sidebar.classList.add('open');

// KAPATIRKEN - CSS class'ını kaldır + animasyon sonrası Tailwind class'larını geri ekle
sidebar.classList.remove('open');
setTimeout(() => sidebar.classList.add('invisible', '-translate-x-full'), 350);
```

### 📝 Öğrenilen Dersler

> **⚠️ Tailwind + Custom CSS Kullanırken Dikkat!**
>
> - Tailwind utility class'ları (`-translate-x-full`, `invisible`) CSS specificity savaşı yaratabilir
> - Animasyon için CSS class, gizleme için Tailwind class kullanıldığında **ikisini de yönetmek** gerekir
> - Sorunu geç bulmamızın sebebi: Overlay doğru çalıştığı için JS fonksiyonunun doğru çalıştığını düşündük, ancak sorun sidebar elementinin transform değerindeydi

### 🛠️ Değişen Dosyalar

| Dosya                          | Değişiklik                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `index.html`                   | Mobil nav butonu `hidden` + `id` eklendi, Dashboard layout yeniden düzenlendi |
| `modules/ui.js`                | `toggleSidebar` Tailwind uyumlu, `switchView` buton görünürlüğü eklendi       |
| `modules/components/Navbar.js` | Arama ikonu kaldırıldı, ThemeManager hatası düzeltildi                        |

---

## [1.3.0] - 2026-01-15

### 🌙 Dark Mode & UI Overhaul (Major Update)

#### Visual Refinements

- **Strict Default Dark Mode**: Uygulama artık varsayılan olarak optimize edilmiş koyu modda açılıyor.
- **Enhanced Course Cards**:
    - Kart arka planları `bg-slate-900/60` ile daha okunabilir yapıldı.
    - Emoji ikonları için "beyaz kutu" sorunu giderildi (`bg-slate-800`).
    - Metin renkleri koyu zemin üzerinde maksimum okunabilirlik için `gray-100` ve `gray-400` olarak güncellendi.
- **Lesson Cards**: Dashboard ders kartlarına border ve belirgin arka plan eklendi.

#### 📱 Mobile Experience

- **Layout Fixes**: Mobil görünümde kurs kartlarının üst üste binme sorunu (`aspect-square` çakışması) giderildi.
- **Rocket Icon**: Karşılama ekranındaki roket ikonu mobilde daha görünür hale getirildi (5x büyütüldü).

### 🐛 Düzeltmeler

- `themes.js`: Eksik olan `dark` renk varyasyonları tüm kurslar için tanımlandı.
- `ui.js`: Sabit `bg-white` sınıfları `dark:` varyasyonları ile değiştirildi.
- Tailwind dark mode utility sınıflarının düzgün çalışması için `style.css` override kuralları eklendi.

---

## [1.2.2] - 2026-01-13

### 🎨 Teacher Panel UX Overhaul

#### Modal-Free Fluid UX

- **Tüm modallar kaldırıldı**: Artık hiçbir pop-up yok, tüm işlemler inline gerçekleşiyor
- **Accordion Row Layout**: Sınıf listesi kart gridinden yatay satır görünümüne geçti
- **Inline Forms**: Öğrenci ekleme, toplu ekleme ve ayarlar artık satır altında açılıyor

#### Yeni Özellikler

- **Top-Inline New Classroom Form**: Yeni sınıf oluşturma formu listenin tepesinde açılıyor
- **Settings Inline Form**: Sınıf ayarları (ad, açıklama, aktif durumu) inline düzenlenebilir
- **Real-time Student Count**: Öğrenci eklerken sayı anında güncelleniyor
- **Copy to Clipboard**: Sınıf kodu tıklanarak kopyalanıyor (Toast feedback)

#### Text-Based Action Buttons

| Buton          | Renk       | İşlem                      |
| -------------- | ---------- | -------------------------- |
| + Öğrenci Ekle | 🟢 Yeşil   | Tek öğrenci inline form    |
| Toplu Ekle     | 🟣 Mor     | Textarea ile çoklu ekleme  |
| Ayarlar        | 🔵 Mavi    | Inline ayar formu          |
| Sil            | 🔴 Kırmızı | Onay dialogu sonrası silme |

#### Focus Mode

- Bir panel açıldığında diğer tüm paneller otomatik kapanıyor
- Tek bir işleme odaklanmayı kolaylaştırıyor

### 🐛 Bug Fixes

- **courseEnrollmentService.js**: `students.name` → `students.display_name` kolon hatası düzeltildi
- **Dropdown Z-Index**: Dropdown menüler artık kart altında kalmıyor (z-50)
- **Menu Overlap**: Aynı anda sadece 1 menü açık olabiliyor

### 🛠️ Technical Changes

- `ClassroomManager.renderList()` tamamen yeniden yazıldı
- Yeni fonksiyonlar: `togglePanel`, `closeAllPanels`, `showNewClassroomForm`, `createNewClassroom`, `saveSettings`
- CSS: `.classroom-row`, `.classroom-accordion`, `.classroom-panel` stilleri eklendi

---

## [1.2.1] - 2026-01-12

### 🐛 Bug Fixes

#### Modal Visibility Bug (Tailwind CSS v4 Uyumluluk)

- **Sorun**: Teacher panel modalları sayfa yüklendiğinde görünür olarak kalıyordu
- **Kök Neden**: Tailwind CSS v4'ün `@layer` sistemi, custom CSS'deki `display: none` kuralını override ediyordu
- **Çözüm**: Tüm modal-overlay elementlerine Tailwind'in `hidden` class'ı eklendi
- **Etkilenen Dosyalar**:
    - `views/teacher/modals/TeacherModals.js` - 7 modal güncellendi
    - `views/teacher/modals/AssignmentModals.js` - 4 modal güncellendi
    - `modules/teacher-manager.js` - Modal açma/kapama fonksiyonları güncellendi
    - `views/teacher/TeacherView.js` - Section değişiminde modal kapatma güncellendi

#### Teacher Panel Section Display Fix

- **Sorun**: Sınıflar, Öğrenciler vb. bölümler görünmüyordu (height: 0)
- **Çözüm**: Parent container'lara `h-full` class'ı eklendi

#### Supabase Query Fixes

- **analyticsService.js**: Nested relation filtering `!inner` yerine classroomIds pattern'ine çevrildi
- **assignmentService.js**: Var olmayan `rubrics` tablo referansı kaldırıldı
- **courseEnrollmentService.js**: Supabase proxy objesi eklendi

#### Router & Navigation Fixes

- `router.js`: Eksik teacher route'ları eklendi (teacher-assignments, teacher-courses, teacher-analytics)
- `viewLoader.js`: Tüm 5 teacher section'ı için handler eklendi

#### Auth Race Condition Fix

- `app.js`: `app.initAuth()` async/await ile düzgün bekletildi

---

## [1.2.0] - 2026-01-11

### 🧪 Ödev Sistemi - Test & Optimizasyon (Faz 8)

#### Unit Test Coverage

- **assignmentService.test.js**: AssignmentService için 35 kapsamlı test
    - Validasyon testleri (required fields, assignment types, status values)
    - Filtreleme testleri (classroom, course, status, upcoming)
    - Sıralama testleri (due_date ascending, created_at descending)
    - Due date hesaplamaları (overdue, due today, days until due)
    - Geç gönderim ceza hesaplamaları
    - Status geçiş validasyonları
    - Max attempts kontrolü

- **submissionService.test.js**: StudentSubmissionService için 34 kapsamlı test
    - Dosya validasyonu (allowed types, max file size, extension extraction)
    - Status geçişleri (draft → submitted → graded, resubmit flows)
    - Deneme sayısı kontrolü (max attempts, unlimited attempts)
    - Geç gönderim tespiti ve süre hesabı
    - Puan hesaplamaları ve geç ceza uygulaması
    - Feedback ve içerik yönetimi
    - Timestamp takibi

#### E2E Test Suite

- **assignment-flow.spec.js**: Playwright ile uçtan uca ödev akışı testleri
    - Öğretmen ödev oluşturma ve listeleme
    - Öğretmen notlandırma akışı
    - Öğrenci ödev görüntüleme ve gönderim
    - Bildirim sistemi testleri

#### Performans Optimizasyonları

- **lazyLoader.js**: Lazy loading ve pagination yardımcıları
    - IntersectionObserver tabanlı lazy loading
    - Infinite scroll desteği
    - Görüntü lazy loading (placeholder ile)
    - Pagination state yönetimi ve UI render
    - CSS stilleri dahil

- **imageOptimizer.js**: Görüntü optimizasyon servisi
    - WebP/AVIF format desteği kontrolü
    - Responsive srcset oluşturma
    - Blur-up efekti ile progressive loading
    - Thumbnail ve resize işlemleri
    - Dominant renk çıkarma

- **bundleAnalyzer.js**: Bundle analiz ve optimizasyon önerileri
    - Modül kataloglama ve boyut analizi
    - Lazy load adayları tespiti
    - Vite konfigürasyon önerileri
    - Performans bütçesi kontrolü
    - Detaylı analiz raporu oluşturma

#### Yeni UI Bileşenleri

- **StudentSubmissionModal**: Öğrenci ödev detay ve gönderim modalı
- **StudentAssignmentsSection**: Öğrenci ödev listesi ve filtreleme
- **StudentCoursesSection**: Kayıtlı kurslar görünümü
- **AssignmentModals**: Öğretmen ödev CRUD modalları
- **AssignmentsSection**: Öğretmen ödev yönetim paneli
- **AnalyticsSection**: Kapsamlı analytics dashboard
- **CoursesSection**: Kurs atama yönetimi

---

## [1.1.0] - 2026-01-11

### 🎨 Tasarım Sistemi Güncellemesi

#### Global CSS Değişken Sistemi

- **CSS Variables**: Tüm sayfalarda tutarlılık için kapsamlı `:root` değişken sistemi eklendi
    - `--cta-start` / `--cta-end`: Turuncu-kırmızı gradient (#FF8C00 → #FF4500)
    - `--lab-bg-dark`: Deep navy background (#0F172A) tüm sayfalarda varsayılan
    - `--glass-bg`, `--glass-blur`: Glassmorphism efektleri için değişkenler
    - Responsive typography: `clamp()` ile dinamik heading boyutları
- **Progress Bars**: Tüm ilerleme çubukları artık CTA gradient kullanıyor
- **Active States**: Tüm aktif durumlar (tabs, nav items) unified turuncu accent
- **Z-index Scale**: Bileşenler arası katmanlama için sistematik ölçek

#### Research Lab Teması - Lesson Page

- **Dark Glassmorphic Panel**: İçerik alanı #0F172A bazlı 85% opacity glassmorphism
- **Tab Navigation**:
    - Her sekme için tutarlı ikonlar (🎯 Mission, 🔧 Materials, ⚡ Circuit, etc.)
    - Aktif sekmede glowing turuncu underline + box-shadow efekti
    - Hover states ile subtle background highlight
- **Virtual Lab Container**:
    - Pulsing "CANLI" badge with red animation (`@keyframes live-pulse`)
    - Entegre fullscreen toggle butonu (SVG icon)
    - `UI.toggleFullscreen()` fonksiyonu eklendi
- **Navigation Buttons**: Brand gradient ile stilize edilmiş Geri/Ders Listesi butonları
- **Accessibility**: Tüm metinler white/light-gray, kod blokları dark inset background

#### Dashboard Glassmorphism Redesign

- **Lesson Cards**: Solid white yerine dark glassmorphic containers
    - `rgba(30, 41, 59, 0.75)` arka plan + `backdrop-filter: blur(10px)`
    - Hover: border-color turuncu glow efekti
- **Mini Progress Bars**: Her kartın altında turuncu-kırmızı gradient ilerleme
- **Phase Headers**:
    - Glowing icons with `@keyframes icon-glow` animation
    - Gradient underline (60% width)
- **Locked States**:
    - Blur overlay + lock icon guests için
    - Login olmayan kullanıcılar intro dışındaki dersleri kilidi görür
- **Sidebar**: Dark mode glassmorphism + orange accent colors

### 🤖 AI Asistan İyileştirmeleri

- **Global Positioning**: BANA SOR artık tüm sayfalarda görünür (Homepage, Dashboard, Lesson)
- **Consistent Placement**:
    - Mobil: `bottom: 6rem` (bottom nav üzerinde)
    - Desktop: `bottom: 1.5rem, right: 1.5rem`
- **Z-index**: `var(--z-assistant)` ile proper layering

### 📱 Mobile & Responsive

- **Bottom Navigation**: Glassmorphic bar with backdrop blur
- **Active Indicators**: Turuncu gradient bottom border on active nav items
- **Course Grid**: 2-column layout on mobile with proper spacing

### 🔧 Teknik İyileştirmeler

- **Tailwind v4**: Theme değişkenleri `@theme` bloğunda konsolide edildi
- **Component Layer**: `.lesson-card`, `.lesson-tab`, `.virtual-lab-container` etc.
- **Animation System**: Standardize edilmiş keyframe animasyonları
- **Typography Scale**: Consistent h1-h4 sizing across all pages

---

## [1.0.1] - 2026-01-11

### 🔧 İyileştirmeler & Düzeltmeler

- **Güvenlik**: `supabaseClient.js` içindeki hardcoded API anahtarları temizlendi.
- **Mimari**: 17 adet dağınık workflow dosyası 3 ana dosyada birleştirildi (`active_roadmap.md`, `SPA_MIGRATION_ARCHIVE.md`, `REFACTORING_ROADMAP.md`).
- **Görsel**: Kurs kartlarındaki kayıp renk stilleri (CSS safelist hatası) düzeltildi.
- **Performans**: Admin Paneli kayıt işlemlerine `debounce` mekanizması eklendi.
- **SPA**: View yönetimi için `ViewManager` entegrasyonu tamamlandı.

## [1.0.0] - 2026-01-01

### 🚀 Eklenen

- **5 Farklı Kurs**: Arduino, Micro:bit, Scratch, mBlock, App Inventor
- **65 İnteraktif Ders**: Her kurs için aşamalı eğitim içeriği
- **20+ Simülasyon**: Gerçek zamanlı devre simülasyonları
- **Öğretmen Paneli**: Sınıf yönetimi ve ilerleme takibi
- **Öğrenci Girişi**: Sınıf kodu ile güvenli giriş
- **Yeti Asistan**: AI destekli öğrenme yardımcısı
- **Çoklu Dil**: Türkçe ve İngilizce desteği
- **Karanlık Mod**: Göz dostu tema seçeneği

### 🔒 Güvenlik

- Server-side şifre doğrulama (RPC fonksiyonları)
- Row Level Security (RLS) ile veri izolasyonu
- Environment variable ile credential yönetimi

### 🛠️ Teknik

- Supabase entegrasyonu (Auth, Database, Storage)
- Modüler JavaScript mimarisi
- Tailwind CSS ile responsive tasarım
- GitHub Pages üzerinde hosting

---

## [0.9.0] - 2024-12-28

### Eklenen

- Başlangıç beta sürümü
- Arduino ve Micro:bit kursları
- Temel simülasyonlar

---

_Bu proje aktif geliştirme aşamasındadır._
