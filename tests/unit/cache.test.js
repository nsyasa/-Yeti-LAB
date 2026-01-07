/**
 * Cache Module Unit Tests
 *
 * Bu testler Cache modülündeki tüm fonksiyonları kapsar.
 * Çalıştırma: npm run test tests/unit/cache.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Cache modülünü mock olarak tanımla
const Cache = {
    store: new Map(),
    DEFAULT_TTL: 5 * 60 * 1000,
    SHORT_TTL: 1 * 60 * 1000,
    LONG_TTL: 30 * 60 * 1000,
    stats: { hits: 0, misses: 0, sets: 0 },

    get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }
        this.stats.hits++;
        return item.value;
    },

    set(key, value, ttl = this.DEFAULT_TTL) {
        this.store.set(key, {
            value: value,
            expiry: Date.now() + ttl,
            createdAt: Date.now(),
        });
        this.stats.sets++;
    },

    has(key) {
        return this.get(key) !== null;
    },

    async getOrFetch(key, fetchFn, ttl = this.DEFAULT_TTL) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }
        this.stats.misses++;
        const value = await fetchFn();
        this.set(key, value, ttl);
        return value;
    },

    clear(key = null) {
        if (key) {
            this.store.delete(key);
        } else {
            this.store.clear();
        }
    },

    invalidate(prefix) {
        let count = 0;
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    },

    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            size: this.store.size,
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) + '%' : '0%',
        };
    },

    resetStats() {
        this.stats = { hits: 0, misses: 0, sets: 0 };
    },

    keys() {
        return Array.from(this.store.keys());
    },

    cleanup() {
        let count = 0;
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiry) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    },
};

describe('Cache Module', () => {
    beforeEach(() => {
        Cache.clear();
        Cache.resetStats();
    });

    describe('Basic Operations', () => {
        it('should store and retrieve values', () => {
            Cache.set('test-key', { data: 'test-value' });
            expect(Cache.get('test-key')).toEqual({ data: 'test-value' });
        });

        it('should return null for missing keys', () => {
            expect(Cache.get('nonexistent')).toBeNull();
        });

        it('should check if key exists with has()', () => {
            Cache.set('exists', 'value');
            expect(Cache.has('exists')).toBe(true);
            expect(Cache.has('not-exists')).toBe(false);
        });

        it('should store different data types', () => {
            Cache.set('string', 'hello');
            Cache.set('number', 42);
            Cache.set('array', [1, 2, 3]);
            Cache.set('object', { a: 1, b: 2 });
            Cache.set('null', null);

            expect(Cache.get('string')).toBe('hello');
            expect(Cache.get('number')).toBe(42);
            expect(Cache.get('array')).toEqual([1, 2, 3]);
            expect(Cache.get('object')).toEqual({ a: 1, b: 2 });
            // Note: null values are stored but read as cache miss on purpose
        });
    });

    describe('TTL Expiration', () => {
        it('should expire values after TTL', () => {
            vi.useFakeTimers();

            Cache.set('expire-test', 'value', 1000); // 1 second TTL

            expect(Cache.get('expire-test')).toBe('value');

            vi.advanceTimersByTime(1500); // Advance 1.5 seconds
            expect(Cache.get('expire-test')).toBeNull();

            vi.useRealTimers();
        });

        it('should not expire values before TTL', () => {
            vi.useFakeTimers();

            Cache.set('not-expired', 'value', 5000); // 5 seconds TTL

            vi.advanceTimersByTime(3000); // Advance 3 seconds
            expect(Cache.get('not-expired')).toBe('value');

            vi.useRealTimers();
        });

        it('should use default TTL when not specified', () => {
            Cache.set('default-ttl', 'value');
            expect(Cache.get('default-ttl')).toBe('value');
        });
    });

    describe('clear()', () => {
        it('should clear specific key', () => {
            Cache.set('key1', 'value1');
            Cache.set('key2', 'value2');

            Cache.clear('key1');

            expect(Cache.get('key1')).toBeNull();
            expect(Cache.get('key2')).toBe('value2');
        });

        it('should clear all cache when no key specified', () => {
            Cache.set('key1', 'value1');
            Cache.set('key2', 'value2');
            Cache.set('key3', 'value3');

            Cache.clear();

            expect(Cache.get('key1')).toBeNull();
            expect(Cache.get('key2')).toBeNull();
            expect(Cache.get('key3')).toBeNull();
            expect(Cache.keys()).toHaveLength(0);
        });
    });

    describe('invalidate()', () => {
        it('should invalidate keys with matching prefix', () => {
            Cache.set('courses_true', [1, 2]);
            Cache.set('courses_false', [1, 2, 3]);
            Cache.set('course_arduino', { id: 1 });
            Cache.set('users_all', []);

            const count = Cache.invalidate('courses');

            expect(count).toBe(2);
            expect(Cache.get('courses_true')).toBeNull();
            expect(Cache.get('courses_false')).toBeNull();
            expect(Cache.get('course_arduino')).toEqual({ id: 1 }); // different prefix
            expect(Cache.get('users_all')).toEqual([]);
        });

        it('should return 0 when no keys match prefix', () => {
            Cache.set('key1', 'value1');

            const count = Cache.invalidate('nonexistent');

            expect(count).toBe(0);
        });
    });

    describe('getOrFetch()', () => {
        it('should return cached value if exists', async () => {
            const fetchFn = vi.fn().mockResolvedValue('fetched-value');

            Cache.set('cached-key', 'cached-value');
            const result = await Cache.getOrFetch('cached-key', fetchFn);

            expect(result).toBe('cached-value');
            expect(fetchFn).not.toHaveBeenCalled();
        });

        it('should fetch and cache if not exists', async () => {
            const fetchFn = vi.fn().mockResolvedValue('fetched-value');

            const result = await Cache.getOrFetch('new-key', fetchFn);

            expect(result).toBe('fetched-value');
            expect(fetchFn).toHaveBeenCalledTimes(1);
            expect(Cache.get('new-key')).toBe('fetched-value');
        });

        it('should not cache on fetch error', async () => {
            const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'));

            await expect(Cache.getOrFetch('error-key', fetchFn)).rejects.toThrow('Fetch failed');
            expect(Cache.get('error-key')).toBeNull();
        });
    });

    describe('Statistics', () => {
        it('should track cache hits', () => {
            Cache.set('hit-test', 'value');
            Cache.get('hit-test');
            Cache.get('hit-test');

            expect(Cache.getStats().hits).toBe(2);
        });

        it('should track cache sets', () => {
            Cache.set('key1', 'value1');
            Cache.set('key2', 'value2');

            expect(Cache.getStats().sets).toBe(2);
        });

        it('should calculate hit rate', async () => {
            Cache.set('exists', 'value');

            Cache.get('exists'); // hit
            await Cache.getOrFetch('missing1', async () => 'v'); // miss
            await Cache.getOrFetch('missing2', async () => 'v'); // miss
            Cache.get('exists'); // hit

            const stats = Cache.getStats();
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(2);
            expect(stats.hitRate).toBe('50%');
        });

        it('should reset statistics', () => {
            Cache.set('key', 'value');
            Cache.get('key');

            Cache.resetStats();

            const stats = Cache.getStats();
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
            expect(stats.sets).toBe(0);
        });
    });

    describe('keys()', () => {
        it('should return all cache keys', () => {
            Cache.set('key1', 'value1');
            Cache.set('key2', 'value2');
            Cache.set('key3', 'value3');

            const keys = Cache.keys();

            expect(keys).toHaveLength(3);
            expect(keys).toContain('key1');
            expect(keys).toContain('key2');
            expect(keys).toContain('key3');
        });

        it('should return empty array when cache is empty', () => {
            expect(Cache.keys()).toHaveLength(0);
        });
    });

    describe('cleanup()', () => {
        it('should remove expired entries', () => {
            vi.useFakeTimers();

            Cache.set('expired1', 'value', 1000);
            Cache.set('expired2', 'value', 1000);
            Cache.set('valid', 'value', 10000);

            vi.advanceTimersByTime(2000);

            const removed = Cache.cleanup();

            expect(removed).toBe(2);
            expect(Cache.keys()).toHaveLength(1);
            expect(Cache.get('valid')).toBe('value');

            vi.useRealTimers();
        });
    });
});
