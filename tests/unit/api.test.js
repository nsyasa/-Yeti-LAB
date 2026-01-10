import { describe, it, expect, vi, beforeEach } from 'vitest';

// API modülünü test et (Simplified mock for unit testing logic)
describe('API Module', () => {
    let API;

    beforeEach(() => {
        API = {
            defaults: { maxRetries: 3, retryDelay: 100 },
            isOnline: true,

            sleep: (ms) => new Promise((r) => setTimeout(r, ms)),

            isNonRetryableError(error) {
                const nonRetryable = ['401', '403', '404'];
                const status = error?.status?.toString() || '';
                return nonRetryable.some((e) => status.includes(e));
            },

            async withRetry(queryFn, options = {}) {
                const maxRetries = options.maxRetries || this.defaults.maxRetries;
                let lastError;

                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        return await queryFn();
                    } catch (error) {
                        lastError = error;
                        if (this.isNonRetryableError(error)) throw error;
                        if (attempt === maxRetries) throw error;
                        await this.sleep(100);
                    }
                }
                throw lastError;
            },
        };
    });

    it('should succeed on first try', async () => {
        const mockFn = vi.fn().mockResolvedValue({ data: 'success' });

        const result = await API.withRetry(mockFn);

        expect(result).toEqual({ data: 'success' });
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
        const mockFn = vi.fn().mockRejectedValueOnce(new Error('Fail 1')).mockResolvedValue({ data: 'success' });

        const result = await API.withRetry(mockFn);

        expect(result).toEqual({ data: 'success' });
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 401 error', async () => {
        const error = new Error('Unauthorized');
        error.status = 401;
        const mockFn = vi.fn().mockRejectedValue(error);

        await expect(API.withRetry(mockFn)).rejects.toThrow('Unauthorized');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'));

        await expect(API.withRetry(mockFn, { maxRetries: 2 })).rejects.toThrow('Always fails');
        expect(mockFn).toHaveBeenCalledTimes(2);
    });
});
