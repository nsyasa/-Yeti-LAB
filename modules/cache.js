/**
 * Cache Module - Yeti LAB
 * Memory-based caching for API responses
 * Reduces redundant API calls and improves performance
 *
 * Usage:
 *   Cache.get('key')                     - Get value if exists and not expired
 *   Cache.set('key', value, ttl)         - Set value with TTL (ms)
 *   Cache.getOrFetch('key', fetchFn)     - Get from cache or fetch if missing
 *   Cache.clear('key')                   - Clear specific key
 *   Cache.clear()                        - Clear all cache
 *   Cache.invalidate('prefix')           - Clear all keys starting with prefix
 */

const Cache = {
    // Internal cache storage
    store: new Map(),

    // Default TTL: 5 minutes
    DEFAULT_TTL: 5 * 60 * 1000,

    // Short TTL: 1 minute (for frequently changing data)
    SHORT_TTL: 1 * 60 * 1000,

    // Long TTL: 30 minutes (for rarely changing data)
    LONG_TTL: 30 * 60 * 1000,

    // Statistics
    stats: {
        hits: 0,
        misses: 0,
        sets: 0,
    },

    /**
     * Get cached value if exists and not expired
     * @param {string} key - Cache key
     * @returns {any|null} Cached value or null if not found/expired
     */
    get(key) {
        const item = this.store.get(key);

        if (!item) {
            return null;
        }

        // Check if expired
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }

        this.stats.hits++;
        return item.value;
    },

    /**
     * Set cache value with TTL
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
     */
    set(key, value, ttl = this.DEFAULT_TTL) {
        this.store.set(key, {
            value: value,
            expiry: Date.now() + ttl,
            createdAt: Date.now(),
        });
        this.stats.sets++;
    },

    /**
     * Check if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    },

    /**
     * Get or fetch pattern - returns cached value or fetches and caches
     * @param {string} key - Cache key
     * @param {Function} fetchFn - Async function to fetch data if cache miss
     * @param {number} ttl - Time to live in milliseconds
     * @returns {Promise<any>} Cached or fetched value
     */
    async getOrFetch(key, fetchFn, ttl = this.DEFAULT_TTL) {
        const cached = this.get(key);

        if (cached !== null) {
            console.log(`[Cache] HIT: ${key}`);
            // Track cache hit in Metrics (if our Metrics module, not a browser API)
            if (typeof Metrics !== 'undefined' && typeof Metrics.increment === 'function') {
                Metrics.increment('cacheHits');
            }
            return cached;
        }

        console.log(`[Cache] MISS: ${key}`);
        this.stats.misses++;
        // Track cache miss in Metrics
        if (typeof Metrics !== 'undefined' && typeof Metrics.increment === 'function') {
            Metrics.increment('cacheMisses');
        }

        try {
            const value = await fetchFn();
            this.set(key, value, ttl);
            return value;
        } catch (error) {
            // Don't cache errors, just re-throw
            throw error;
        }
    },

    /**
     * Clear specific key or all cache
     * @param {string|null} key - Key to clear, or null to clear all
     */
    clear(key = null) {
        if (key) {
            this.store.delete(key);
            console.log(`[Cache] Cleared: ${key}`);
        } else {
            this.store.clear();
            console.log('[Cache] Cleared all');
        }
    },

    /**
     * Invalidate all keys matching a prefix
     * Useful for clearing related cache entries
     * @param {string} prefix - Key prefix to match
     * @returns {number} Number of entries cleared
     */
    invalidate(prefix) {
        let count = 0;
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
                count++;
            }
        }
        if (count > 0) {
            console.log(`[Cache] Invalidated ${count} entries with prefix: ${prefix}`);
        }
        return count;
    },

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
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

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = { hits: 0, misses: 0, sets: 0 };
    },

    /**
     * Get all cached keys (for debugging)
     * @returns {Array} Array of cache keys
     */
    keys() {
        return Array.from(this.store.keys());
    },

    /**
     * Cleanup expired entries
     * Can be called periodically for memory management
     * @returns {number} Number of expired entries removed
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

        if (count > 0) {
            console.log(`[Cache] Cleanup: removed ${count} expired entries`);
        }
        return count;
    },

    /**
     * Log cache summary to console (for debugging)
     */
    logSummary() {
        console.log('[Cache] Summary:', {
            ...this.getStats(),
            keys: this.keys(),
        });
    },
};

// Export globally
if (typeof window !== 'undefined') {
    window.Cache = Cache;
}
