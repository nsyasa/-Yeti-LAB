import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Cache module logic since it's a global singleton in a separate file
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
