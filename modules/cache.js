/**
 * Simple Cache Module
 * Memory-based caching for API responses
 */
const Cache = {
    store: new Map(),
    stats: {
        hits: 0,
        misses: 0,
        sets: 0,
    },

    // Constants
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    SHORT_TTL: 1 * 60 * 1000, // 1 minute
    LONG_TTL: 30 * 60 * 1000, // 30 minutes

    /**
     * Get cached value if exists and not expired
     */
    get(key) {
        const item = this.store.get(key);
        if (!item) {
            // Only track miss if not in store (but usually get is called directly)
            // getOrFetch handles hit/miss counting usually
            return null;
        }

        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }

        this.stats.hits++;
        return item.value;
    },

    /**
     * Check if key exists (and is valid)
     */
    has(key) {
        return this.get(key) !== null;
    },

    /**
     * Set cache value with TTL
     */
    set(key, value, ttl = this.DEFAULT_TTL) {
        this.store.set(key, {
            value: value,
            expiry: Date.now() + ttl,
        });
        this.stats.sets++;
    },

    /**
     * Clear specific key or all cache
     */
    clear(key = null) {
        if (key) {
            this.store.delete(key);
        } else {
            this.store.clear();
            this.resetStats();
        }
    },

    /**
     * Invalidate keys starting with prefix
     * Returns count of invalidated keys
     */
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

    /**
     * Get or fetch pattern
     */
    async getOrFetch(key, fetchFn, ttl = this.DEFAULT_TTL) {
        const cached = this.get(key);
        // Note: this.get() increments hits if found
        if (cached !== null) {
            console.log(`[Cache] HIT: ${key}`);
            return cached;
        }

        console.log(`[Cache] MISS: ${key}`);
        this.stats.misses++;
        try {
            const value = await fetchFn();
            this.set(key, value, ttl);
            return value;
        } catch (error) {
            // Do not cache errors
            throw error;
        }
    },

    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            ...this.stats,
            hitRate: total === 0 ? '0%' : Math.round((this.stats.hits / total) * 100) + '%',
        };
    },

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = { hits: 0, misses: 0, sets: 0 };
    },

    /**
     * Get all keys
     */
    keys() {
        return Array.from(this.store.keys());
    },

    /**
     * Cleanup expired entries
     * Returns count of removed entries
     */
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

if (typeof window !== 'undefined') {
    window.Cache = Cache;
}
