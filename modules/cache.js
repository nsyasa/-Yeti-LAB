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
