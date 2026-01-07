---
description: Backend İyileştirme Roadmap - Siteyi Bozmadan Güvenli Değişiklikler
---

# 🛡️ Backend İyileştirme Roadmap

Bu plan, Yeti LAB projesinin backend altyapısını **siteyi bozmadan**, **küçük ve güvenli adımlarla** iyileştirmek için hazırlanmıştır.

**Tarih:** 7 Ocak 2026  
**Tahmini Süre:** 2-3 Hafta  
**Risk Seviyesi:** Düşük (Her adım test edilebilir)

---

## 📋 Öncelik Sıralaması

| Öncelik   | Faz   | Açıklama                   | Risk  | Süre   |
| --------- | ----- | -------------------------- | ----- | ------ |
| 🔴 Kritik | Faz 1 | Güvenlik İyileştirmeleri   | Düşük | 2 saat |
| 🟠 Yüksek | Faz 2 | Error Handling Güçlendirme | Düşük | 2 saat |
| 🟡 Orta   | Faz 3 | API Caching                | Düşük | 3 saat |
| 🟢 Düşük  | Faz 4 | Test Coverage Artırma      | Düşük | 4 saat |
| 🔵 Bonus  | Faz 5 | Monitoring & Logging       | Düşük | 2 saat |

---

## 🔴 FAZ 1: Güvenlik İyileştirmeleri (Kritik)

### Adım 1.1: Environment Variables Düzenlemesi

**Dosya:** `modules/supabaseClient.js`  
**Risk:** ⚪ Çok Düşük  
**Test:** Site açılıyor mu? Login çalışıyor mu?

```javascript
// ÖNCE (satır 16-18):
const DEFAULT_SUPABASE_URL = 'https://zuezvfojutlefdvqrica.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// SONRA:
// Vite build sırasında .env'den al, fallback olarak default kullan
const DEFAULT_SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL || 'https://zuezvfojutlefdvqrica.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = import.meta?.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Doğrulama:**
// turbo

```bash
npm run lint
npm run test
```

---

### Adım 1.2: Input Validation Güçlendirme

**Dosya:** `modules/validators.js`  
**Risk:** ⚪ Çok Düşük (Yeni fonksiyon ekleme)  
**Test:** Mevcut testler geçiyor mu?

Eklenecek validation fonksiyonları:

```javascript
// UUID validation
isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
},

// Classroom code validation
isValidClassroomCode(code) {
    return /^[A-Z0-9]{5}$/.test(code?.toUpperCase());
},

// Safe string (no script injection)
sanitizeString(str, maxLength = 500) {
    if (!str) return '';
    return String(str).slice(0, maxLength).replace(/<[^>]*>/g, '');
}
```

**Doğrulama:**
// turbo

```bash
npm run test -- tests/unit/validators.test.js
```

---

### Adım 1.3: Progress Modülünde UUID Kontrolü İyileştirme

**Dosya:** `modules/progress.js`  
**Risk:** ⚪ Çok Düşük (Mevcut kontrol iyileştirme)  
**Test:** İlerleme kaydı çalışıyor mu?

Mevcut UUID kontrolü zaten var (satır 82-93), bunu Validators modülüne taşıyabiliriz:

```javascript
// ÖNCE:
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(studentId)) { ... }

// SONRA:
if (typeof Validators !== 'undefined' && !Validators.isValidUUID(studentId)) { ... }
```

---

## 🟠 FAZ 2: Error Handling Güçlendirme

### Adım 2.1: Global Error Handler Ekleme

**Dosya:** `modules/api.js`  
**Risk:** ⚪ Çok Düşük (Yeni fonksiyon)  
**Test:** Console'da hatalar görünüyor mu?

```javascript
// api.js içine ekle:
logError(error, context = 'Unknown') {
    const errorLog = {
        timestamp: new Date().toISOString(),
        context: context,
        message: error?.message || 'Unknown error',
        code: error?.code,
        status: error?.status,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    };

    console.error('[API Error]', errorLog);

    // Opsiyonel: localStorage'a kaydet (debugging için)
    if (typeof localStorage !== 'undefined') {
        const logs = JSON.parse(localStorage.getItem('yeti_error_logs') || '[]');
        logs.push(errorLog);
        // Son 20 hatayı tut
        if (logs.length > 20) logs.shift();
        localStorage.setItem('yeti_error_logs', JSON.stringify(logs));
    }

    return errorLog;
}
```

**Doğrulama:**
// turbo

```bash
npm run lint
```

---

### Adım 2.2: Supabase Error Wrapper

**Dosya:** `modules/supabaseClient.js`  
**Risk:** 🟡 Düşük (Mevcut fonksiyonları wrap etme)

Her public metoda try-catch ve error logging ekle:

```javascript
// Örnek: getCourses metoduna
async getCourses(publishedOnly = false) {
    try {
        let query = this.getClient().from('courses').select('*').order('position', { ascending: true });
        if (publishedOnly) query = query.eq('is_published', true);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    } catch (error) {
        if (typeof API !== 'undefined') API.logError(error, 'getCourses');
        throw error; // Re-throw for caller to handle
    }
}
```

---

## 🟡 FAZ 3: API Caching (Performans)

### Adım 3.1: Basit Cache Modülü Oluştur

**Dosya:** `modules/cache.js` (YENİ)  
**Risk:** ⚪ Çok Düşük (Yeni modül)

```javascript
/**
 * Simple Cache Module
 * Memory-based caching for API responses
 */
const Cache = {
    store: new Map(),

    // Default TTL: 5 dakika
    DEFAULT_TTL: 5 * 60 * 1000,

    /**
     * Get cached value if exists and not expired
     */
    get(key) {
        const item = this.store.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }

        return item.value;
    },

    /**
     * Set cache value with TTL
     */
    set(key, value, ttl = this.DEFAULT_TTL) {
        this.store.set(key, {
            value: value,
            expiry: Date.now() + ttl,
        });
    },

    /**
     * Clear specific key or all cache
     */
    clear(key = null) {
        if (key) {
            this.store.delete(key);
        } else {
            this.store.clear();
        }
    },

    /**
     * Get or fetch pattern
     */
    async getOrFetch(key, fetchFn, ttl = this.DEFAULT_TTL) {
        const cached = this.get(key);
        if (cached !== null) {
            console.log(`[Cache] HIT: ${key}`);
            return cached;
        }

        console.log(`[Cache] MISS: ${key}`);
        const value = await fetchFn();
        this.set(key, value, ttl);
        return value;
    },
};

if (typeof window !== 'undefined') {
    window.Cache = Cache;
}
```

**Doğrulama:**
// turbo

```bash
npm run lint
```

---

### Adım 3.2: SupabaseClient'a Cache Entegrasyonu

**Dosya:** `modules/supabaseClient.js`  
**Risk:** 🟡 Düşük

```javascript
// getCourses metodunu cache ile wrap et:
async getCourses(publishedOnly = false, forceRefresh = false) {
    const cacheKey = `courses_${publishedOnly}`;

    // Cache modülü varsa kullan
    if (typeof Cache !== 'undefined' && !forceRefresh) {
        return Cache.getOrFetch(cacheKey, async () => {
            let query = this.getClient().from('courses').select('*').order('position', { ascending: true });
            if (publishedOnly) query = query.eq('is_published', true);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        });
    }

    // Fallback: direkt sorgula
    let query = this.getClient().from('courses').select('*').order('position', { ascending: true });
    if (publishedOnly) query = query.eq('is_published', true);
    const { data, error } = await query;
    if (error) throw error;
    return data;
}
```

---

### Adım 3.3: Cache Invalidation (Data değiştiğinde)

**Dosya:** `modules/admin/supabase-sync.js`  
**Risk:** ⚪ Çok Düşük

```javascript
// saveToSupabase başarılı olduğunda cache temizle:
async saveToSupabase(courseKey, courseData) {
    try {
        // ... mevcut kod ...

        // Başarılı kayıt sonrası cache temizle
        if (typeof Cache !== 'undefined') {
            Cache.clear('courses_true');
            Cache.clear('courses_false');
            Cache.clear(`course_${courseKey}`);
        }

        return true;
    } catch (error) {
        // ... mevcut hata handling ...
    }
}
```

---

## 🟢 FAZ 4: Test Coverage Artırma

### Adım 4.1: Cache Modülü Testleri

**Dosya:** `tests/unit/cache.test.js` (YENİ)  
**Risk:** ⚪ Hiç (Sadece test)

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Cache module
const Cache = {
    store: new Map(),
    DEFAULT_TTL: 5 * 60 * 1000,

    get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    },

    set(key, value, ttl = this.DEFAULT_TTL) {
        this.store.set(key, { value, expiry: Date.now() + ttl });
    },

    clear(key = null) {
        if (key) this.store.delete(key);
        else this.store.clear();
    },
};

describe('Cache Module', () => {
    beforeEach(() => {
        Cache.clear();
    });

    it('should store and retrieve values', () => {
        Cache.set('test', { data: 'value' });
        expect(Cache.get('test')).toEqual({ data: 'value' });
    });

    it('should return null for missing keys', () => {
        expect(Cache.get('nonexistent')).toBeNull();
    });

    it('should expire values after TTL', () => {
        vi.useFakeTimers();
        Cache.set('expire-test', 'value', 1000); // 1 second TTL

        expect(Cache.get('expire-test')).toBe('value');

        vi.advanceTimersByTime(1500); // Advance 1.5 seconds
        expect(Cache.get('expire-test')).toBeNull();

        vi.useRealTimers();
    });

    it('should clear specific key', () => {
        Cache.set('key1', 'value1');
        Cache.set('key2', 'value2');

        Cache.clear('key1');

        expect(Cache.get('key1')).toBeNull();
        expect(Cache.get('key2')).toBe('value2');
    });

    it('should clear all cache', () => {
        Cache.set('key1', 'value1');
        Cache.set('key2', 'value2');

        Cache.clear();

        expect(Cache.get('key1')).toBeNull();
        expect(Cache.get('key2')).toBeNull();
    });
});
```

**Doğrulama:**
// turbo

```bash
npm run test -- tests/unit/cache.test.js
```

---

### Adım 4.2: API Module Testleri Genişletme

**Dosya:** `tests/unit/api.test.js` (YENİ)  
**Risk:** ⚪ Hiç

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// API modülünü test et
describe('API Module', () => {
    let API;

    beforeEach(() => {
        API = {
            defaults: { maxRetries: 3, retryDelay: 100 },
            isOnline: true,

            sleep: (ms) => new Promise((r) => setTimeout(r, ms)),

            isNonRetryableError(error) {
                const nonRetryable = ['401', '403', '404'];
                const status = error?.status?.toString() || '';
                return nonRetryable.some((e) => status.includes(e));
            },

            async withRetry(queryFn, options = {}) {
                const maxRetries = options.maxRetries || this.defaults.maxRetries;
                let lastError;

                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        return await queryFn();
                    } catch (error) {
                        lastError = error;
                        if (this.isNonRetryableError(error)) throw error;
                        if (attempt === maxRetries) throw error;
                        await this.sleep(100);
                    }
                }
                throw lastError;
            },
        };
    });

    it('should succeed on first try', async () => {
        const mockFn = vi.fn().mockResolvedValue({ data: 'success' });

        const result = await API.withRetry(mockFn);

        expect(result).toEqual({ data: 'success' });
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
        const mockFn = vi.fn().mockRejectedValueOnce(new Error('Fail 1')).mockResolvedValue({ data: 'success' });

        const result = await API.withRetry(mockFn);

        expect(result).toEqual({ data: 'success' });
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 401 error', async () => {
        const error = new Error('Unauthorized');
        error.status = 401;
        const mockFn = vi.fn().mockRejectedValue(error);

        await expect(API.withRetry(mockFn)).rejects.toThrow('Unauthorized');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'));

        await expect(API.withRetry(mockFn, { maxRetries: 2 })).rejects.toThrow('Always fails');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });
});
```

---

## 🔵 FAZ 5: Monitoring & Logging (Bonus)

### Adım 5.1: Performance Metrics Toplama

**Dosya:** `modules/metrics.js` (YENİ)  
**Risk:** ⚪ Çok Düşük

```javascript
/**
 * Simple Metrics Module
 * Collects performance and usage metrics
 */
const Metrics = {
    data: {
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        loadTimes: [],
    },

    /**
     * Increment a counter
     */
    increment(key) {
        if (this.data[key] !== undefined) {
            this.data[key]++;
        }
    },

    /**
     * Record a load time
     */
    recordLoadTime(name, duration) {
        this.data.loadTimes.push({
            name,
            duration,
            timestamp: Date.now(),
        });
        // Keep last 50 entries
        if (this.data.loadTimes.length > 50) {
            this.data.loadTimes.shift();
        }
    },

    /**
     * Start a timer
     */
    startTimer(name) {
        return {
            name,
            start: performance.now(),
        };
    },

    /**
     * End timer and record
     */
    endTimer(timer) {
        const duration = performance.now() - timer.start;
        this.recordLoadTime(timer.name, duration);
        return duration;
    },

    /**
     * Get summary
     */
    getSummary() {
        const avgLoadTime =
            this.data.loadTimes.length > 0
                ? this.data.loadTimes.reduce((a, b) => a + b.duration, 0) / this.data.loadTimes.length
                : 0;

        return {
            apiCalls: this.data.apiCalls,
            cacheHitRate: (this.data.cacheHits / (this.data.cacheHits + this.data.cacheMisses)) * 100 || 0,
            errors: this.data.errors,
            avgLoadTime: Math.round(avgLoadTime) + 'ms',
        };
    },

    /**
     * Log summary to console (dev only)
     */
    logSummary() {
        console.table(this.getSummary());
    },
};

if (typeof window !== 'undefined') {
    window.Metrics = Metrics;
}
```

---

### Adım 5.2: Metrics Entegrasyonu

**Dosya:** `modules/api.js`  
**Risk:** ⚪ Çok Düşük

```javascript
// withRetry metoduna metrik ekle:
async withRetry(queryFn, options = {}) {
    // Metrik: API call sayısı
    if (typeof Metrics !== 'undefined') Metrics.increment('apiCalls');

    const timer = typeof Metrics !== 'undefined' ? Metrics.startTimer('apiCall') : null;

    try {
        const result = await this._originalWithRetry(queryFn, options);
        if (timer) Metrics.endTimer(timer);
        return result;
    } catch (error) {
        if (typeof Metrics !== 'undefined') Metrics.increment('errors');
        throw error;
    }
}
```

---

## ✅ Doğrulama Kontrol Listesi

Her faz sonrası kontrol edilecekler:

### Temel Kontroller

- [ ] `npm run lint` hatasız geçiyor mu?
- [ ] `npm run test` tüm testler geçiyor mu?
- [ ] `npm run dev` ile site açılıyor mu?

### Fonksiyonel Kontroller

- [ ] Ana sayfa yükleniyor mu?
- [ ] Login çalışıyor mu? (öğretmen + öğrenci)
- [ ] Kurs seçimi çalışıyor mu?
- [ ] Admin panel açılıyor mu?
- [ ] Öğretmen paneli açılıyor mu?
- [ ] İlerleme kaydediliyor mu?

### Performans Kontrolü

- [ ] Sayfa yüklenme süresi normal mi?
- [ ] Console'da hata yok mu?

---

## 📅 Uygulama Takvimi

| Gün | Faz                   | Tahmini Süre |
| --- | --------------------- | ------------ |
| 1   | Faz 1: Güvenlik       | 2 saat       |
| 1   | Faz 2: Error Handling | 2 saat       |
| 2   | Faz 3: Caching        | 3 saat       |
| 2   | Faz 4: Testler        | 4 saat       |
| 3   | Faz 5: Monitoring     | 2 saat       |
| 3   | Final Test & Commit   | 1 saat       |

**Toplam:** ~14 saat (3 gün)

---

## 🚨 Geri Alma Planı

Herhangi bir adım sorun çıkarırsa:

1. `git stash` ile değişiklikleri kaydet
2. `git checkout .` ile temiz duruma dön
3. Sorunlu adımı atla, sonrakine geç

---

## 📝 Notlar

- Her adım bağımsız, sırayla yapılabilir
- Bir adım başarısız olursa diğerleri etkilenmez
- Tüm değişiklikler backward-compatible
- Mevcut API'ler değişmiyor, sadece genişletiliyor
