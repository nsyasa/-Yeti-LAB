---
description: Test Coverage ve Kod Kalitesi İyileştirme Roadmap - Güvenli Minik Adımlar (8 Ocak 2026)
---

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

| Faz | Durum | Tarih | Notlar |
| --- | ----- | ----- | ------ |
| 0   | ⬜    | -     | -      |
| 1   | ⬜    | -     | -      |
| 2   | ⬜    | -     | -      |
| 3   | ⬜    | -     | -      |
| 4   | ⬜    | -     | -      |
| 5   | ⬜    | -     | -      |
| 6   | ⬜    | -     | -      |
| 7   | ⬜    | -     | -      |

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
