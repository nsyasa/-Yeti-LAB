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
        timeout: 30000 // 30 seconds
    },

    // Track online status
    isOnline: navigator.onLine,

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
            context = 'Veri yükleme'
        } = options;

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

                return result;

            } catch (error) {
                lastError = error;
                console.warn(`[API] Attempt ${attempt}/${maxRetries} failed:`, error.message);

                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    throw error;
                }

                // Last attempt failed
                if (attempt === maxRetries) {
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
            '422'  // Validation error
        ];

        const message = error?.message?.toLowerCase() || '';
        const code = error?.code?.toString() || '';
        const status = error?.status?.toString() || '';

        return nonRetryable.some(e =>
            message.includes(e.toLowerCase()) ||
            code.includes(e) ||
            status.includes(e)
        );
    },

    /**
     * Sleep helper
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Fetch wrapper with timeout and retry
     * @param {string} url - URL to fetch
     * @param {object} options - Fetch options + retry options
     */
    async fetch(url, options = {}) {
        const {
            timeout = this.defaults.timeout,
            maxRetries = this.defaults.maxRetries,
            ...fetchOptions
        } = options;

        const fetchWithTimeout = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(url, {
                    ...fetchOptions,
                    signal: controller.signal
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
            maxRetries = this.defaults.maxRetries
        } = options;

        let loadingToastId = null;

        try {
            if (showLoading && window.Toast) {
                loadingToastId = Toast.loading(loadingMessage);
            }

            const result = await this.withRetry(queryFn, {
                maxRetries,
                context,
                onRetry: (attempt, error) => {
                    console.log(`[API] Retrying ${context} (attempt ${attempt})...`);
                }
            });

            if (loadingToastId) {
                Toast.dismiss(loadingToastId);
            }

            return result;

        } catch (error) {
            if (loadingToastId) {
                Toast.dismiss(loadingToastId);
            }

            console.error(`[API] ${context} failed:`, error);

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

            const { error } = await SupabaseClient.getClient()
                .from('courses')
                .select('id')
                .limit(1);

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
    }
};

// Auto-init when loaded
if (typeof window !== 'undefined') {
    window.API = API;
    API.init();
}
