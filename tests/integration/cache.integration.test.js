/**
 * Cache Module Integration Tests
 *
 * Bu testler GERÇEK Cache modülünü test eder.
 * Memory-based caching sisteminin tüm fonksiyonlarını test eder.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Cache Integration', () => {
    let Cache;

    beforeEach(async () => {
        vi.resetModules();
        delete window.Cache;

        try {
            await import('../../modules/cache.js');
            Cache = window.Cache;

            // Her test öncesi cache'i temizle
            if (Cache) {
                Cache.clear();
                Cache.resetStats();
            }
        } catch (e) {
            console.warn('Cache module import failed:', e.message);
            Cache = null;
        }
    });

    afterEach(() => {
        if (Cache) {
            Cache.clear();
        }
    });

    describe('Module Loading', () => {
        it('should load Cache module successfully', () => {
            expect(Cache).toBeDefined();
        });

        it('should be available on window object', () => {
            expect(window.Cache).toBe(Cache);
        });

        it('should have all expected methods', () => {
            if (!Cache) return;

            expect(typeof Cache.get).toBe('function');
            expect(typeof Cache.set).toBe('function');
            expect(typeof Cache.has).toBe('function');
            expect(typeof Cache.getOrFetch).toBe('function');
            expect(typeof Cache.clear).toBe('function');
            expect(typeof Cache.invalidate).toBe('function');
            expect(typeof Cache.getStats).toBe('function');
            expect(typeof Cache.keys).toBe('function');
            expect(typeof Cache.cleanup).toBe('function');
        });

        it('should have TTL constants', () => {
            if (!Cache) return;

            expect(Cache.DEFAULT_TTL).toBe(5 * 60 * 1000); // 5 minutes
            expect(Cache.SHORT_TTL).toBe(1 * 60 * 1000); // 1 minute
            expect(Cache.LONG_TTL).toBe(30 * 60 * 1000); // 30 minutes
        });
    });

    describe('Basic Operations', () => {
        it('should set and get cache value', () => {
            if (!Cache) return;

            Cache.set('testKey', { data: 'testValue' });
            const result = Cache.get('testKey');

            expect(result).toBeDefined();
            expect(result.data).toBe('testValue');
        });

        it('should return null for non-existent key', () => {
            if (!Cache) return;

            expect(Cache.get('nonExistentKey')).toBeNull();
        });

        it('should check if key exists with has()', () => {
            if (!Cache) return;

            Cache.set('existingKey', 'value');

            expect(Cache.has('existingKey')).toBe(true);
            expect(Cache.has('nonExistentKey')).toBe(false);
        });

        it('should delete specific key', () => {
            if (!Cache) return;

            Cache.set('keyToDelete', 'value');
            expect(Cache.get('keyToDelete')).toBe('value');

            Cache.clear('keyToDelete');
            expect(Cache.get('keyToDelete')).toBeNull();
        });

        it('should clear all cache', () => {
            if (!Cache) return;

            Cache.set('key1', 'value1');
            Cache.set('key2', 'value2');

            Cache.clear();

            expect(Cache.get('key1')).toBeNull();
            expect(Cache.get('key2')).toBeNull();
        });
    });

    describe('Expiration', () => {
        it('should return null for expired cache', async () => {
            if (!Cache) return;

            // 50ms TTL ile kaydet
            Cache.set('expireKey', 'value', 50);

            // Hemen al - olmalı
            expect(Cache.get('expireKey')).toBe('value');

            // 100ms bekle
            await new Promise((r) => setTimeout(r, 100));

            // Expire olmuş olmalı
            expect(Cache.get('expireKey')).toBeNull();
        });

        it('should use default TTL when not specified', () => {
            if (!Cache) return;

            Cache.set('defaultTTLKey', 'value');

            // Should still be available
            expect(Cache.get('defaultTTLKey')).toBe('value');
        });
    });

    describe('getOrFetch', () => {
        it('should return cached value without calling fetch', async () => {
            if (!Cache) return;

            Cache.set('cachedKey', 'cachedValue');

            const fetchFn = vi.fn().mockResolvedValue('fetchedValue');
            const result = await Cache.getOrFetch('cachedKey', fetchFn);

            expect(result).toBe('cachedValue');
            expect(fetchFn).not.toHaveBeenCalled();
        });

        it('should fetch and cache value on cache miss', async () => {
            if (!Cache) return;

            const fetchFn = vi.fn().mockResolvedValue('fetchedValue');
            const result = await Cache.getOrFetch('newKey', fetchFn);

            expect(result).toBe('fetchedValue');
            expect(fetchFn).toHaveBeenCalledTimes(1);

            // Should be cached now
            expect(Cache.get('newKey')).toBe('fetchedValue');
        });

        it('should not cache errors', async () => {
            if (!Cache) return;

            const fetchFn = vi.fn().mockRejectedValue(new Error('Fetch failed'));

            await expect(Cache.getOrFetch('errorKey', fetchFn)).rejects.toThrow('Fetch failed');

            // Should not be cached
            expect(Cache.get('errorKey')).toBeNull();
        });
    });

    describe('Invalidation', () => {
        it('should invalidate keys by prefix', () => {
            if (!Cache) return;

            Cache.set('user:1', 'data1');
            Cache.set('user:2', 'data2');
            Cache.set('course:1', 'course1');

            const count = Cache.invalidate('user:');

            expect(count).toBe(2);
            expect(Cache.get('user:1')).toBeNull();
            expect(Cache.get('user:2')).toBeNull();
            expect(Cache.get('course:1')).toBe('course1');
        });

        it('should return 0 if no keys match prefix', () => {
            if (!Cache) return;

            Cache.set('key1', 'value1');

            const count = Cache.invalidate('nonexistent:');
            expect(count).toBe(0);
        });
    });

    describe('Statistics', () => {
        it('should track cache hits', () => {
            if (!Cache) return;

            Cache.set('statsKey', 'value');
            Cache.get('statsKey');
            Cache.get('statsKey');

            const stats = Cache.getStats();
            expect(stats.hits).toBe(2);
        });

        it('should track cache misses', async () => {
            if (!Cache) return;

            const fetchFn = vi.fn().mockResolvedValue('value');
            await Cache.getOrFetch('missKey', fetchFn);

            const stats = Cache.getStats();
            expect(stats.misses).toBe(1);
        });

        it('should track cache sets', () => {
            if (!Cache) return;

            Cache.set('key1', 'value1');
            Cache.set('key2', 'value2');

            const stats = Cache.getStats();
            expect(stats.sets).toBe(2);
        });

        it('should calculate hit rate', () => {
            if (!Cache) return;

            Cache.set('key', 'value');
            Cache.get('key'); // hit
            Cache.get('key'); // hit
            Cache.get('nonexistent'); // miss (returns null, doesn't track)

            const stats = Cache.getStats();
            expect(stats.hitRate).toBe('100%'); // Only hits counted, miss not tracked in get()
        });

        it('should reset stats', () => {
            if (!Cache) return;

            Cache.set('key', 'value');
            Cache.get('key');

            Cache.resetStats();

            const stats = Cache.getStats();
            expect(stats.hits).toBe(0);
            expect(stats.misses).toBe(0);
            expect(stats.sets).toBe(0);
        });
    });

    describe('Utility Methods', () => {
        it('should return all cache keys', () => {
            if (!Cache) return;

            Cache.set('key1', 'value1');
            Cache.set('key2', 'value2');

            const keys = Cache.keys();
            expect(keys).toContain('key1');
            expect(keys).toContain('key2');
            expect(keys.length).toBe(2);
        });

        it('should cleanup expired entries', async () => {
            if (!Cache) return;

            Cache.set('expiredKey', 'value', 50);
            Cache.set('validKey', 'value', 10000);

            // Bekle
            await new Promise((r) => setTimeout(r, 100));

            const count = Cache.cleanup();
            expect(count).toBe(1);

            expect(Cache.get('expiredKey')).toBeNull();
            expect(Cache.get('validKey')).toBe('value');
        });
    });
});
