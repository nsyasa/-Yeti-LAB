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
