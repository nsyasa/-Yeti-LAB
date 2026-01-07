/**
 * API Module Unit Tests
 *
 * Bu testler API modülündeki retry, error logging ve utility fonksiyonlarını kapsar.
 * Çalıştırma: npm run test tests/unit/api.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// API modülünü mock olarak tanımla
const createAPI = () => ({
    defaults: {
        maxRetries: 3,
        retryDelay: 10, // Short delay for tests
        retryBackoff: 2,
        timeout: 30000,
    },

    ERROR_LOG_KEY: 'yeti_error_logs',
    MAX_ERROR_LOGS: 50,
    isOnline: true,

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },

    isNonRetryableError(error) {
        const nonRetryable = [
            'JWT expired',
            'Invalid login credentials',
            'Email not confirmed',
            'permission denied',
            'foreign key constraint',
            'duplicate key value',
            '401',
            '403',
            '404',
            '422',
        ];

        const message = error?.message?.toLowerCase() || '';
        const code = error?.code?.toString() || '';
        const status = error?.status?.toString() || '';

        return nonRetryable.some((e) => message.includes(e.toLowerCase()) || code.includes(e) || status.includes(e));
    },

    async withRetry(queryFn, options = {}) {
        const {
            maxRetries = this.defaults.maxRetries,
            retryDelay = this.defaults.retryDelay,
            onRetry = null,
        } = options;

        let lastError = null;
        let delay = retryDelay;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (!this.isOnline) {
                    throw new Error('NetworkError: No internet connection');
                }

                const result = await queryFn();

                if (result?.error) {
                    throw result.error;
                }

                return result;
            } catch (error) {
                lastError = error;

                if (this.isNonRetryableError(error)) {
                    throw error;
                }

                if (attempt === maxRetries) {
                    throw error;
                }

                if (onRetry) {
                    onRetry(attempt, error);
                }

                await this.sleep(delay);
                delay *= this.defaults.retryBackoff;
            }
        }

        throw lastError;
    },

    // Error logging
    errorLogs: [],

    logError(error, context = 'Unknown') {
        const errorLog = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            context: context,
            message: error?.message || 'Unknown error',
            code: error?.code || null,
            status: error?.status || null,
        };

        this.errorLogs.push(errorLog);

        // Keep max logs
        while (this.errorLogs.length > this.MAX_ERROR_LOGS) {
            this.errorLogs.shift();
        }

        return errorLog;
    },

    getErrorLogs() {
        return [...this.errorLogs];
    },

    clearErrorLogs() {
        this.errorLogs = [];
    },

    getErrorSummary() {
        const logs = this.getErrorLogs();
        const contexts = {};

        logs.forEach((log) => {
            contexts[log.context] = (contexts[log.context] || 0) + 1;
        });

        return {
            totalErrors: logs.length,
            byContext: contexts,
            lastError: logs[logs.length - 1] || null,
            oldestError: logs[0] || null,
        };
    },
});

describe('API Module', () => {
    let API;

    beforeEach(() => {
        API = createAPI();
    });

    describe('isNonRetryableError()', () => {
        it('should return true for 401 status', () => {
            expect(API.isNonRetryableError({ status: 401 })).toBe(true);
        });

        it('should return true for 403 status', () => {
            expect(API.isNonRetryableError({ status: 403 })).toBe(true);
        });

        it('should return true for 404 status', () => {
            expect(API.isNonRetryableError({ status: 404 })).toBe(true);
        });

        it('should return true for 422 status', () => {
            expect(API.isNonRetryableError({ status: 422 })).toBe(true);
        });

        it('should return true for JWT expired message', () => {
            expect(API.isNonRetryableError({ message: 'JWT expired' })).toBe(true);
        });

        it('should return true for permission denied message', () => {
            expect(API.isNonRetryableError({ message: 'permission denied for table users' })).toBe(true);
        });

        it('should return true for duplicate key message', () => {
            expect(API.isNonRetryableError({ message: 'duplicate key value violates unique constraint' })).toBe(true);
        });

        it('should return false for network errors', () => {
            expect(API.isNonRetryableError({ message: 'Network request failed' })).toBe(false);
        });

        it('should return false for 500 status', () => {
            expect(API.isNonRetryableError({ status: 500 })).toBe(false);
        });

        it('should return false for timeout errors', () => {
            expect(API.isNonRetryableError({ message: 'Request timeout' })).toBe(false);
        });

        it('should handle null/undefined gracefully', () => {
            expect(API.isNonRetryableError(null)).toBe(false);
            expect(API.isNonRetryableError(undefined)).toBe(false);
            expect(API.isNonRetryableError({})).toBe(false);
        });
    });

    describe('Error Logging', () => {
        it('should log error with context', () => {
            const error = new Error('Test error');
            const log = API.logError(error, 'TestContext');

            expect(log.message).toBe('Test error');
            expect(log.context).toBe('TestContext');
            expect(log.id).toBeDefined();
            expect(log.timestamp).toBeDefined();
        });

        it('should log error with code and status', () => {
            const error = new Error('Database error');
            error.code = 'PGRST116';
            error.status = 406;

            const log = API.logError(error, 'Database');

            expect(log.code).toBe('PGRST116');
            expect(log.status).toBe(406);
        });

        it('should store logs and retrieve them', () => {
            API.logError(new Error('Error 1'), 'Context1');
            API.logError(new Error('Error 2'), 'Context2');

            const logs = API.getErrorLogs();

            expect(logs).toHaveLength(2);
            expect(logs[0].context).toBe('Context1');
            expect(logs[1].context).toBe('Context2');
        });

        it('should clear error logs', () => {
            API.logError(new Error('Error 1'), 'Context1');
            API.logError(new Error('Error 2'), 'Context2');

            API.clearErrorLogs();

            expect(API.getErrorLogs()).toHaveLength(0);
        });

        it('should limit stored logs to MAX_ERROR_LOGS', () => {
            for (let i = 0; i < 60; i++) {
                API.logError(new Error(`Error ${i}`), `Context${i}`);
            }

            expect(API.getErrorLogs()).toHaveLength(API.MAX_ERROR_LOGS);
        });

        it('should provide error summary', () => {
            API.logError(new Error('Error 1'), 'Auth');
            API.logError(new Error('Error 2'), 'Auth');
            API.logError(new Error('Error 3'), 'Database');

            const summary = API.getErrorSummary();

            expect(summary.totalErrors).toBe(3);
            expect(summary.byContext['Auth']).toBe(2);
            expect(summary.byContext['Database']).toBe(1);
            expect(summary.lastError.context).toBe('Database');
            expect(summary.oldestError.context).toBe('Auth');
        });

        it('should handle missing error properties gracefully', () => {
            const log = API.logError(null, 'NullError');

            expect(log.message).toBe('Unknown error');
            expect(log.code).toBeNull();
            expect(log.status).toBeNull();
        });

        it('should return empty summary when no errors', () => {
            const summary = API.getErrorSummary();

            expect(summary.totalErrors).toBe(0);
            expect(summary.byContext).toEqual({});
            expect(summary.lastError).toBeNull();
            expect(summary.oldestError).toBeNull();
        });
    });

    describe('withRetry() - Success Cases', () => {
        it('should succeed on first try', async () => {
            const mockFn = vi.fn().mockResolvedValue({ data: 'success' });

            const result = await API.withRetry(mockFn);

            expect(result).toEqual({ data: 'success' });
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should retry on failure and succeed', async () => {
            const mockFn = vi
                .fn()
                .mockRejectedValueOnce(new Error('Temporary failure'))
                .mockResolvedValue({ data: 'success' });

            const result = await API.withRetry(mockFn, { maxRetries: 3, retryDelay: 1 });

            expect(result).toEqual({ data: 'success' });
            expect(mockFn).toHaveBeenCalledTimes(2);
        });
    });

    describe('withRetry() - Failure Cases', () => {
        it('should fail after max retries', async () => {
            const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'));

            await expect(API.withRetry(mockFn, { maxRetries: 2, retryDelay: 1 })).rejects.toThrow('Always fails');
            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        it('should not retry on 401 Unauthorized error', async () => {
            const error = new Error('Unauthorized');
            error.status = 401;
            const mockFn = vi.fn().mockRejectedValue(error);

            await expect(API.withRetry(mockFn)).rejects.toThrow('Unauthorized');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should not retry on JWT expired error', async () => {
            const error = new Error('JWT expired');
            const mockFn = vi.fn().mockRejectedValue(error);

            await expect(API.withRetry(mockFn)).rejects.toThrow('JWT expired');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should throw when offline', async () => {
            API.isOnline = false;
            const mockFn = vi.fn().mockResolvedValue({ data: 'success' });

            await expect(API.withRetry(mockFn)).rejects.toThrow('No internet connection');
            expect(mockFn).not.toHaveBeenCalled();
        });
    });

    describe('withRetry() - Callbacks', () => {
        it('should call onRetry callback on each retry', async () => {
            const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));
            const onRetry = vi.fn();

            await expect(API.withRetry(mockFn, { maxRetries: 3, retryDelay: 1, onRetry })).rejects.toThrow('Fail');

            expect(onRetry).toHaveBeenCalledTimes(2); // Called for attempts 1 and 2, not 3
            expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
            expect(onRetry).toHaveBeenCalledWith(2, expect.any(Error));
        });
    });

    describe('withRetry() - Supabase Format', () => {
        it('should handle Supabase error format', async () => {
            const mockFn = vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error', code: 'PGRST116' },
            });

            await expect(API.withRetry(mockFn, { maxRetries: 1 })).rejects.toEqual({
                message: 'Database error',
                code: 'PGRST116',
            });
        });
    });

    describe('sleep()', () => {
        it('should resolve after specified time', async () => {
            const start = Date.now();
            await API.sleep(10);
            const elapsed = Date.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(5);
        });
    });
});
