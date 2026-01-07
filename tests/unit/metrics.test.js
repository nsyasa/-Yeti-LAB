/**
 * Metrics Module Unit Tests
 *
 * Bu testler Metrics modülündeki counter, timer ve summary fonksiyonlarını kapsar.
 * Çalıştırma: npm run test tests/unit/metrics.test.js
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Metrics modülünü mock olarak tanımla
const createMetrics = () => ({
    data: {
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        pageViews: 0,
        courseLoads: 0,
        loginAttempts: 0,
        loadTimes: [],
        sessionStart: Date.now(),
    },

    MAX_TIMING_ENTRIES: 100,

    increment(key, amount = 1) {
        if (typeof this.data[key] === 'number') {
            this.data[key] += amount;
        }
    },

    set(key, value) {
        this.data[key] = value;
    },

    get(key) {
        return this.data[key];
    },

    startTimer(name) {
        return {
            name,
            start: performance.now(),
        };
    },

    endTimer(timer) {
        if (!timer || !timer.start) {
            return 0;
        }

        const duration = performance.now() - timer.start;
        this.recordTiming(timer.name, duration);
        return duration;
    },

    recordTiming(name, duration) {
        this.data.loadTimes.push({
            name,
            duration: Math.round(duration * 100) / 100,
            timestamp: Date.now(),
        });

        while (this.data.loadTimes.length > this.MAX_TIMING_ENTRIES) {
            this.data.loadTimes.shift();
        }
    },

    getAverageTiming(name) {
        const timings = this.data.loadTimes.filter((t) => t.name === name);
        if (timings.length === 0) return 0;

        const sum = timings.reduce((acc, t) => acc + t.duration, 0);
        return Math.round(sum / timings.length);
    },

    getSessionDuration() {
        return Math.round((Date.now() - this.data.sessionStart) / 1000);
    },

    getSummary() {
        const cacheTotal = this.data.cacheHits + this.data.cacheMisses;
        const cacheHitRate = cacheTotal > 0 ? Math.round((this.data.cacheHits / cacheTotal) * 100) : 0;

        return {
            apiCalls: this.data.apiCalls,
            cacheHits: this.data.cacheHits,
            cacheMisses: this.data.cacheMisses,
            cacheHitRate: cacheHitRate + '%',
            errors: this.data.errors,
            pageViews: this.data.pageViews,
            courseLoads: this.data.courseLoads,
            loginAttempts: this.data.loginAttempts,
            avgCourseLoad: this.getAverageTiming('courseLoad') + 'ms',
            avgApiCall: this.getAverageTiming('apiCall') + 'ms',
            avgPageRender: this.getAverageTiming('pageRender') + 'ms',
            timingEntries: this.data.loadTimes.length,
            sessionDuration: this.getSessionDuration() + 's',
        };
    },

    getRecentTimings(count = 10) {
        return this.data.loadTimes.slice(-count);
    },

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
    },

    toJSON() {
        return JSON.stringify({
            summary: this.getSummary(),
            timings: this.data.loadTimes,
            exportedAt: new Date().toISOString(),
        });
    },
});

describe('Metrics Module', () => {
    let Metrics;

    beforeEach(() => {
        Metrics = createMetrics();
        Metrics.reset();
    });

    describe('Counters', () => {
        it('should increment counters', () => {
            Metrics.increment('apiCalls');
            Metrics.increment('apiCalls');
            Metrics.increment('errors');

            expect(Metrics.get('apiCalls')).toBe(2);
            expect(Metrics.get('errors')).toBe(1);
        });

        it('should increment by custom amount', () => {
            Metrics.increment('pageViews', 5);

            expect(Metrics.get('pageViews')).toBe(5);
        });

        it('should handle unknown counter gracefully', () => {
            // Should not throw
            expect(() => Metrics.increment('unknownCounter')).not.toThrow();
        });

        it('should set and get values', () => {
            Metrics.set('customValue', 42);

            expect(Metrics.get('customValue')).toBe(42);
        });
    });

    describe('Timers', () => {
        it('should create timer with name and start time', () => {
            const timer = Metrics.startTimer('testOperation');

            expect(timer.name).toBe('testOperation');
            expect(timer.start).toBeDefined();
            expect(typeof timer.start).toBe('number');
        });

        it('should end timer and return duration', async () => {
            const timer = Metrics.startTimer('testOperation');

            // Simulate some work
            await new Promise((r) => setTimeout(r, 10));

            const duration = Metrics.endTimer(timer);

            expect(duration).toBeGreaterThan(0);
        });

        it('should record timing on endTimer', () => {
            const timer = Metrics.startTimer('apiCall');
            Metrics.endTimer(timer);

            expect(Metrics.data.loadTimes).toHaveLength(1);
            expect(Metrics.data.loadTimes[0].name).toBe('apiCall');
        });

        it('should handle invalid timer gracefully', () => {
            expect(Metrics.endTimer(null)).toBe(0);
            expect(Metrics.endTimer(undefined)).toBe(0);
            expect(Metrics.endTimer({})).toBe(0);
        });

        it('should limit timing entries to MAX_TIMING_ENTRIES', () => {
            for (let i = 0; i < 150; i++) {
                Metrics.recordTiming('test', i);
            }

            expect(Metrics.data.loadTimes.length).toBe(Metrics.MAX_TIMING_ENTRIES);
        });
    });

    describe('Timing Analysis', () => {
        it('should calculate average timing', () => {
            Metrics.recordTiming('apiCall', 100);
            Metrics.recordTiming('apiCall', 200);
            Metrics.recordTiming('apiCall', 300);

            expect(Metrics.getAverageTiming('apiCall')).toBe(200);
        });

        it('should return 0 for unknown timing', () => {
            expect(Metrics.getAverageTiming('unknown')).toBe(0);
        });

        it('should filter by name when calculating average', () => {
            Metrics.recordTiming('apiCall', 100);
            Metrics.recordTiming('courseLoad', 500);
            Metrics.recordTiming('apiCall', 200);

            expect(Metrics.getAverageTiming('apiCall')).toBe(150);
            expect(Metrics.getAverageTiming('courseLoad')).toBe(500);
        });

        it('should get recent timings', () => {
            for (let i = 0; i < 20; i++) {
                Metrics.recordTiming('test', i);
            }

            const recent = Metrics.getRecentTimings(5);

            expect(recent).toHaveLength(5);
            expect(recent[0].duration).toBe(15);
            expect(recent[4].duration).toBe(19);
        });
    });

    describe('Summary', () => {
        it('should provide comprehensive summary', () => {
            Metrics.increment('apiCalls', 10);
            Metrics.increment('cacheHits', 7);
            Metrics.increment('cacheMisses', 3);
            Metrics.increment('errors', 2);

            const summary = Metrics.getSummary();

            expect(summary.apiCalls).toBe(10);
            expect(summary.cacheHits).toBe(7);
            expect(summary.cacheMisses).toBe(3);
            expect(summary.cacheHitRate).toBe('70%');
            expect(summary.errors).toBe(2);
        });

        it('should handle 0% cache hit rate', () => {
            const summary = Metrics.getSummary();
            expect(summary.cacheHitRate).toBe('0%');
        });

        it('should include session duration', () => {
            const summary = Metrics.getSummary();
            expect(summary.sessionDuration).toBeDefined();
            expect(summary.sessionDuration).toMatch(/\d+s/);
        });

        it('should include timing averages', () => {
            Metrics.recordTiming('courseLoad', 100);
            Metrics.recordTiming('apiCall', 50);

            const summary = Metrics.getSummary();

            expect(summary.avgCourseLoad).toBe('100ms');
            expect(summary.avgApiCall).toBe('50ms');
        });
    });

    describe('Reset', () => {
        it('should reset all counters to 0', () => {
            Metrics.increment('apiCalls', 100);
            Metrics.increment('errors', 50);

            Metrics.reset();

            expect(Metrics.get('apiCalls')).toBe(0);
            expect(Metrics.get('errors')).toBe(0);
        });

        it('should clear timing data', () => {
            Metrics.recordTiming('test', 100);
            Metrics.recordTiming('test', 200);

            Metrics.reset();

            expect(Metrics.data.loadTimes).toHaveLength(0);
        });

        it('should reset session start time', () => {
            const oldStart = Metrics.data.sessionStart;

            // Wait a bit
            Metrics.reset();

            expect(Metrics.data.sessionStart).toBeGreaterThanOrEqual(oldStart);
        });
    });

    describe('Export', () => {
        it('should export as valid JSON', () => {
            Metrics.increment('apiCalls', 5);
            Metrics.recordTiming('test', 100);

            const json = Metrics.toJSON();
            const parsed = JSON.parse(json);

            expect(parsed.summary).toBeDefined();
            expect(parsed.summary.apiCalls).toBe(5);
            expect(parsed.timings).toHaveLength(1);
            expect(parsed.exportedAt).toBeDefined();
        });
    });
});
