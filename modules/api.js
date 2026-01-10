/**
 * API Module
 * Retry mekanizmalı API wrapper
 * Network hatalarını yakalar ve otomatik retry yapar
 */

const API = {
    // Default settings
    defaults: {
        maxRetries: 3,
        retryDelay: 1000, // ms
        retryBackoff: 2, // exponential backoff multiplier
        timeout: 30000, // 30 seconds
    },

    // Error log storage key
    ERROR_LOG_KEY: 'yeti_error_logs',
    MAX_ERROR_LOGS: 50, // Son 50 hatayı tut

    // Track online status
    isOnline: navigator.onLine,

    // ==========================================
    // ERROR LOGGING SYSTEM
    // ==========================================

    /**
     * Log an error with structured format
     * Stores in localStorage for debugging
     * @param {Error} error - The error object
     * @param {string} context - Where the error occurred
     * @returns {Object} Structured error log
     */
    logError(error, context = 'Unknown') {
        const errorLog = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            context: context,
            message: error?.message || 'Unknown error',
            code: error?.code || null,
            status: error?.status || null,
            hint: error?.hint || null,
            details: error?.details || null,
            // Stack trace (sadece ilk 3 satır - privacy için)
            stack: error?.stack?.split('\n').slice(0, 4).join('\n') || null,
            // Browser info
            userAgent: navigator.userAgent?.substr(0, 100),
            url: window.location.href,
            online: navigator.onLine,
        };

        // Console'a yazdır
        console.error(`[API Error] ${context}:`, errorLog);

        // localStorage'a kaydet (debugging için)
        this._saveErrorLog(errorLog);

        return errorLog;
    },

    /**
     * Save error log to localStorage
     * @private
     */
    _saveErrorLog(errorLog) {
        try {
            if (typeof localStorage === 'undefined') return;

            const logs = JSON.parse(localStorage.getItem(this.ERROR_LOG_KEY) || '[]');
            logs.push(errorLog);

            // Max log sayısını aşarsa eski logları sil
            while (logs.length > this.MAX_ERROR_LOGS) {
                logs.shift();
            }

            localStorage.setItem(this.ERROR_LOG_KEY, JSON.stringify(logs));
        } catch (e) {
            // localStorage dolu veya erişilemiyor olabilir
            console.warn('[API] Could not save error log:', e.message);
        }
    },

    /**
     * Get all stored error logs
     * @returns {Array} Array of error logs
     */
    getErrorLogs() {
        try {
            if (typeof localStorage === 'undefined') return [];
            return JSON.parse(localStorage.getItem(this.ERROR_LOG_KEY) || '[]');
        } catch {
            return [];
        }
    },

    /**
     * Clear all stored error logs
     */
    clearErrorLogs() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.ERROR_LOG_KEY);
            }
        } catch {
            // Ignore
        }
    },

    /**
     * Get error summary (for debugging)
     * @returns {Object} Error statistics
     */
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

    /**
     * Initialize API module
     */
    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            Toast?.success('İnternet bağlantısı sağlandı!');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            Toast?.warning('İnternet bağlantısı kesildi!');
        });
    },

    /**
     * Execute a Supabase query with retry logic
     * @param {function} queryFn - Async function that returns Supabase response
     * @param {object} options - Retry options
     * @returns {Promise} Query result
     */
    async withRetry(queryFn, options = {}) {
        const {
            maxRetries = this.defaults.maxRetries,
            retryDelay = this.defaults.retryDelay,
            retryBackoff = this.defaults.retryBackoff,
            onRetry = null, // callback(attempt, error)
            context = 'Veri yükleme', // eslint-disable-line no-unused-vars
        } = options;

        // Metrik: API call sayısı
        if (typeof Metrics !== 'undefined') Metrics.increment('apiCalls');

        const timer = typeof Metrics !== 'undefined' ? Metrics.startTimer('apiCall') : null;

        let lastError = null;
        let delay = retryDelay;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Check online status
                if (!this.isOnline) {
                    throw new Error('NetworkError: No internet connection');
                }

                const result = await queryFn();

                // Check for Supabase errors
                if (result?.error) {
                    throw result.error;
                }

                if (timer) Metrics.endTimer(timer);
                return result;
            } catch (error) {
                lastError = error;
                console.warn(`[API] Attempt ${attempt}/${maxRetries} failed:`, error.message);

                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    if (typeof Metrics !== 'undefined') Metrics.increment('errors');
                    throw error;
                }

                // Last attempt failed
                if (attempt === maxRetries) {
                    if (typeof Metrics !== 'undefined') Metrics.increment('errors');
                    throw error;
                }

                // Call retry callback
                if (onRetry) {
                    onRetry(attempt, error);
                }

                // Wait before retry (with exponential backoff)
                await this.sleep(delay);
                delay *= retryBackoff;
            }
        }

        if (typeof Metrics !== 'undefined') Metrics.increment('errors');
        throw lastError;
    },

    /**
     * Check if error should not be retried
     * @param {Error} error - Error object
     * @returns {boolean}
     */
    isNonRetryableError(error) {
        const nonRetryable = [
            'JWT expired',
            'Invalid login credentials',
            'Email not confirmed',
            'permission denied',
            'foreign key constraint',
            'duplicate key value',
            '401', // Unauthorized
            '403', // Forbidden
            '404', // Not found
            '422', // Validation error
        ];

        const message = error?.message?.toLowerCase() || '';
        const code = error?.code?.toString() || '';
        const status = error?.status?.toString() || '';

        return nonRetryable.some((e) => message.includes(e.toLowerCase()) || code.includes(e) || status.includes(e));
    },

    /**
     * Sleep helper
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    },

    /**
     * Fetch wrapper with timeout and retry
     * @param {string} url - URL to fetch
     * @param {object} options - Fetch options + retry options
     */
    async fetch(url, options = {}) {
        const { timeout = this.defaults.timeout, maxRetries = this.defaults.maxRetries, ...fetchOptions } = options;

        const fetchWithTimeout = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    ...fetchOptions,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }
        };

        return this.withRetry(fetchWithTimeout, { maxRetries });
    },

    // ================================
    // SUPABASE HELPERS
    // ================================

    /**
     * Safe Supabase query wrapper
     * Shows toast on error
     * @param {function} queryFn - Supabase query function
     * @param {string} context - What operation is being done
     * @param {object} options - Options including showToast, retryFn
     */
    async query(queryFn, context = 'Veri yükleme', options = {}) {
        const {
            showToast = true,
            showLoading = false,
            loadingMessage = 'Yükleniyor...',
            maxRetries = this.defaults.maxRetries,
        } = options;

        let loadingToastId = null;
        const timer = typeof Metrics !== 'undefined' ? Metrics.startTimer('apiCall') : null;

        // Track API call
        if (typeof Metrics !== 'undefined') {
            Metrics.increment('apiCalls');
        }

        try {
            if (showLoading && window.Toast) {
                loadingToastId = Toast.loading(loadingMessage);
            }

            const result = await this.withRetry(queryFn, {
                maxRetries,
                // context, // unused by withRetry logic but passed for potential extension
                onRetry: () => {
                    // Retry silently
                },
            });

            if (loadingToastId) {
                Toast.dismiss(loadingToastId);
            }

            // Record timing
            if (timer) {
                Metrics.endTimer(timer);
            }

            return result;
        } catch (error) {
            if (loadingToastId) {
                Toast.dismiss(loadingToastId);
            }

            // Log error with structured format
            this.logError(error, context);

            // Track error
            if (typeof Metrics !== 'undefined') {
                Metrics.increment('errors');
            }

            if (showToast && window.Toast) {
                // Create retry function
                const retryFn = () => this.query(queryFn, context, options);
                Toast.apiError(error, context, retryFn);
            }

            throw error;
        }
    },

    /**
     * Check Supabase connection health
     * @returns {Promise<boolean>}
     */
    async checkConnection() {
        try {
            if (!window.SupabaseClient?.getClient) {
                return false;
            }

            const { error } = await SupabaseClient.getClient().from('courses').select('id').limit(1);

            return !error;
        } catch {
            return false;
        }
    },

    /**
     * Monitor connection and show status
     */
    async monitorConnection() {
        const isConnected = await this.checkConnection();

        if (!isConnected && window.Toast) {
            Toast.warning('Veritabanı bağlantısı kurulamadı. Bazı özellikler çalışmayabilir.');
        }

        return isConnected;
    },
};

// Auto-init when loaded
if (typeof window !== 'undefined') {
    window.API = API;
    API.init();
}
