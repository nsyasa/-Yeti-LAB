/**
 * Toast Notification Module
 * Merkezi kullanıcı bildirim sistemi
 */

const Toast = {
    container: null,
    queue: [],
    isShowing: false,
    defaultDuration: 4000,

    // Toast types with icons and colors
    types: {
        success: {
            icon: '✅',
            bgClass: 'bg-green-600',
            borderClass: 'border-green-500',
        },
        error: {
            icon: '❌',
            bgClass: 'bg-red-600',
            borderClass: 'border-red-500',
        },
        warning: {
            icon: '⚠️',
            bgClass: 'bg-amber-500',
            borderClass: 'border-amber-400',
        },
        info: {
            icon: 'ℹ️',
            bgClass: 'bg-blue-600',
            borderClass: 'border-blue-500',
        },
        loading: {
            icon: '⏳',
            bgClass: 'bg-gray-700',
            borderClass: 'border-gray-600',
        },
    },

    /**
     * Initialize toast container
     */
    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none';
        this.container.style.cssText = 'max-width: 400px; min-width: 300px;';
        document.body.appendChild(this.container);
    },

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: success, error, warning, info, loading
     * @param {object} options - Additional options
     * @returns {string} Toast ID for later reference
     */
    show(message, type = 'info', options = {}) {
        this.init();

        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const config = this.types[type] || this.types.info;
        const duration = options.duration ?? (type === 'loading' ? 0 : this.defaultDuration);
        const action = options.action; // { label: 'Retry', onClick: fn }

        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `
            ${config.bgClass} text-white px-4 py-3 rounded-xl shadow-2xl
            flex items-start gap-3 pointer-events-auto
            transform translate-x-full opacity-0 transition-all duration-300 ease-out
            border-l-4 ${config.borderClass}
        `
            .replace(/\s+/g, ' ')
            .trim();

        toast.innerHTML = `
            <span class="text-lg flex-shrink-0 ${type === 'loading' ? 'animate-pulse' : ''}">${config.icon}</span>
            <div class="flex-grow min-w-0">
                <p class="font-medium text-sm leading-snug">${message}</p>
                ${
                    action
                        ? `
                    <button class="mt-2 text-xs font-bold underline hover:no-underline opacity-90 hover:opacity-100 transition-opacity" 
                            onclick="Toast.handleAction('${id}')">
                        ${action.label}
                    </button>
                `
                        : ''
                }
            </div>
            ${type === 'success' ? '<img src="img/yeti-celebrating.png" alt="" class="w-10 h-10 object-contain flex-shrink-0 animate-bounce" />' : ''}
            ${
                type !== 'loading'
                    ? `
                <button class="flex-shrink-0 opacity-70 hover:opacity-100 text-lg leading-none" 
                        onclick="Toast.dismiss('${id}')">&times;</button>
            `
                    : ''
            }
        `;

        // Store action callback
        if (action) {
            toast._action = action.onClick;
        }

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
            toast.classList.add('translate-x-0', 'opacity-100');
        });

        // Auto-dismiss (unless duration is 0 for loading)
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }

        return id;
    },

    /**
     * Dismiss a toast by ID
     * @param {string} id - Toast ID
     */
    dismiss(id) {
        const toast = document.getElementById(id);
        if (!toast) return;

        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-full', 'opacity-0');

        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    /**
     * Handle action button click
     * @param {string} id - Toast ID
     */
    handleAction(id) {
        const toast = document.getElementById(id);
        if (toast && toast._action) {
            toast._action();
        }
        this.dismiss(id);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        if (!this.container) return;
        const toasts = this.container.querySelectorAll('[id^="toast-"]');
        toasts.forEach((t) => this.dismiss(t.id));
    },

    /**
     * Update an existing toast (useful for loading -> success/error)
     * @param {string} id - Toast ID
     * @param {string} message - New message
     * @param {string} type - New type
     */
    update(id, message, type) {
        this.dismiss(id);
        return this.show(message, type);
    },

    // ================================
    // CONVENIENCE METHODS
    // ================================

    success(message, options = {}) {
        return this.show(message, 'success', options);
    },

    error(message, options = {}) {
        return this.show(message, 'error', { duration: 6000, ...options });
    },

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    },

    info(message, options = {}) {
        return this.show(message, 'info', options);
    },

    loading(message = 'Yükleniyor...', options = {}) {
        return this.show(message, 'loading', { duration: 0, ...options });
    },

    // ================================
    // ERROR HANDLING HELPERS
    // ================================

    /**
     * Show error with retry action
     * @param {string} message - Error message
     * @param {function} retryFn - Function to call on retry
     */
    errorWithRetry(message, retryFn) {
        return this.show(message, 'error', {
            duration: 8000,
            action: {
                label: '🔄 Tekrar Dene',
                onClick: retryFn,
            },
        });
    },

    /**
     * Parse and show Supabase/API errors
     * @param {Error|object} error - Error object
     * @param {string} context - What was being attempted
     * @param {function} retryFn - Optional retry function
     */
    apiError(error, context = 'İşlem', retryFn = null) {
        let message = `${context} başarısız oldu`;

        // Parse error message
        if (error) {
            if (typeof error === 'string') {
                message = error;
            } else if (error.message) {
                // Common error translations
                const errorMap = {
                    'Failed to fetch': 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
                    NetworkError: 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
                    timeout: 'İstek zaman aşımına uğradı.',
                    'JWT expired': 'Oturum süresi doldu. Lütfen tekrar giriş yapın.',
                    'Invalid login credentials': 'Hatalı e-posta veya şifre.',
                    'Email not confirmed': 'E-posta adresi doğrulanmamış.',
                    'User already registered': 'Bu e-posta adresi zaten kayıtlı.',
                    'duplicate key value': 'Bu kayıt zaten mevcut.',
                    'foreign key constraint': 'İlişkili kayıtlar var, önce onları silmelisiniz.',
                    'permission denied': 'Bu işlem için yetkiniz yok.',
                };

                for (const [key, translation] of Object.entries(errorMap)) {
                    if (error.message.toLowerCase().includes(key.toLowerCase())) {
                        message = translation;
                        break;
                    }
                }

                // If no match, show original (shortened)
                if (message === `${context} başarısız oldu` && error.message.length < 100) {
                    message = error.message;
                }
            }
        }

        if (retryFn) {
            return this.errorWithRetry(message, retryFn);
        }
        return this.error(message);
    },

    /**
     * Show network error with retry
     * @param {function} retryFn - Retry function
     */
    networkError(retryFn) {
        return this.show('İnternet bağlantısı yok. Bağlantınızı kontrol edin.', 'error', {
            duration: 0,
            action: {
                label: '🔄 Tekrar Dene',
                onClick: retryFn,
            },
        });
    },
};

// Make globally available
window.Toast = Toast;
