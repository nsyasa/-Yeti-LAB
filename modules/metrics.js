/**
 * Metrics Module - Yeti LAB
 * Collects performance and usage metrics for monitoring
 *
 * Usage:
 *   Metrics.increment('apiCalls')           - Increment a counter
 *   Metrics.startTimer('loadCourse')        - Start a timer
 *   Metrics.endTimer(timer)                 - End timer and record
 *   Metrics.getSummary()                    - Get metrics summary
 *   Metrics.logSummary()                    - Log to console
 */

const Metrics = {
    // Collected metrics data
    data: {
        // Counters
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        pageViews: 0,
        courseLoads: 0,
        loginAttempts: 0,

        // Timing data
        loadTimes: [],

        // Session info
        sessionStart: Date.now(),
    },

    // Maximum entries for timing data (prevent memory bloat)
    MAX_TIMING_ENTRIES: 100,

    /**
     * Increment a counter
     * @param {string} key - Counter key
     * @param {number} amount - Amount to increment (default: 1)
     */
    increment(key, amount = 1) {
        if (typeof this.data[key] === 'number') {
            this.data[key] += amount;
        } else {
            console.warn(`[Metrics] Unknown counter: ${key}`);
        }
    },

    /**
     * Set a specific value
     * @param {string} key - Key to set
     * @param {any} value - Value to set
     */
    set(key, value) {
        this.data[key] = value;
    },

    /**
     * Get a specific value
     * @param {string} key - Key to get
     * @returns {any}
     */
    get(key) {
        return this.data[key];
    },

    /**
     * Start a timer
     * @param {string} name - Timer name (e.g., 'loadCourse', 'apiCall')
     * @returns {Object} Timer object to pass to endTimer()
     */
    startTimer(name) {
        return {
            name,
            start: performance.now(),
        };
    },

    /**
     * End timer and record the duration
     * @param {Object} timer - Timer object from startTimer()
     * @returns {number} Duration in milliseconds
     */
    endTimer(timer) {
        if (!timer || !timer.start) {
            console.warn('[Metrics] Invalid timer object');
            return 0;
        }

        const duration = performance.now() - timer.start;

        this.recordTiming(timer.name, duration);

        return duration;
    },

    /**
     * Record a timing entry
     * @param {string} name - Name of the operation
     * @param {number} duration - Duration in milliseconds
     */
    recordTiming(name, duration) {
        this.data.loadTimes.push({
            name,
            duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
            timestamp: Date.now(),
        });

        // Keep only last MAX_TIMING_ENTRIES entries
        while (this.data.loadTimes.length > this.MAX_TIMING_ENTRIES) {
            this.data.loadTimes.shift();
        }
    },

    /**
     * Get average timing for a specific operation
     * @param {string} name - Operation name
     * @returns {number} Average duration in ms, or 0 if no data
     */
    getAverageTiming(name) {
        const timings = this.data.loadTimes.filter((t) => t.name === name);
        if (timings.length === 0) return 0;

        const sum = timings.reduce((acc, t) => acc + t.duration, 0);
        return Math.round(sum / timings.length);
    },

    /**
     * Get session duration
     * @returns {number} Duration in seconds
     */
    getSessionDuration() {
        return Math.round((Date.now() - this.data.sessionStart) / 1000);
    },

    /**
     * Get comprehensive metrics summary
     * @returns {Object} Summary object
     */
    getSummary() {
        const cacheTotal = this.data.cacheHits + this.data.cacheMisses;
        const cacheHitRate = cacheTotal > 0 ? Math.round((this.data.cacheHits / cacheTotal) * 100) : 0;

        return {
            // Counters
            apiCalls: this.data.apiCalls,
            cacheHits: this.data.cacheHits,
            cacheMisses: this.data.cacheMisses,
            cacheHitRate: cacheHitRate + '%',
            errors: this.data.errors,
            pageViews: this.data.pageViews,
            courseLoads: this.data.courseLoads,
            loginAttempts: this.data.loginAttempts,

            // Timing
            avgCourseLoad: this.getAverageTiming('courseLoad') + 'ms',
            avgApiCall: this.getAverageTiming('apiCall') + 'ms',
            avgPageRender: this.getAverageTiming('pageRender') + 'ms',
            timingEntries: this.data.loadTimes.length,

            // Session
            sessionDuration: this.getSessionDuration() + 's',
        };
    },

    /**
     * Log summary to console in a formatted way
     */
    logSummary() {
        console.group('📊 Yeti LAB Metrics');
        console.table(this.getSummary());
        console.groupEnd();
    },

    /**
     * Get recent timings (for debugging)
     * @param {number} count - Number of recent entries
     * @returns {Array}
     */
    getRecentTimings(count = 10) {
        return this.data.loadTimes.slice(-count);
    },

    /**
     * Reset all metrics
     */
    reset() {
        this.data = {
            apiCalls: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            pageViews: 0,
            courseLoads: 0,
            loginAttempts: 0,
            loadTimes: [],
            sessionStart: Date.now(),
        };
        console.log('[Metrics] Reset complete');
    },

    /**
     * Export metrics as JSON (for sending to analytics)
     * @returns {string} JSON string
     */
    toJSON() {
        return JSON.stringify({
            summary: this.getSummary(),
            timings: this.data.loadTimes,
            exportedAt: new Date().toISOString(),
        });
    },
};

// Export globally
if (typeof window !== 'undefined') {
    window.Metrics = Metrics;
}
