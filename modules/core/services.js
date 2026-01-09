/**
 * Services Wrapper Module
 * Mevcut global modülleri sarmalayan güvenli erişim katmanı.
 *
 * AMAÇ: Doğrudan window.X erişimi yerine Services.X kullanarak
 * bağımlılıkları merkezi bir noktadan yönetmek.
 *
 * NOT: Bu dosya mevcut kodu DEĞİŞTİRMEZ, sadece yeni bir erişim katmanı ekler.
 * Eski kod (window.Toast vb.) çalışmaya devam eder.
 */

const Services = {
    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    toast: {
        /**
         * Başarı bildirimi göster
         * @param {string} msg - Mesaj
         */
        success: (msg) => window.Toast?.success(msg) ?? console.log('✓', msg),

        /**
         * Hata bildirimi göster
         * @param {string} msg - Mesaj
         */
        error: (msg) => window.Toast?.error(msg) ?? console.error('✗', msg),

        /**
         * Uyarı bildirimi göster
         * @param {string} msg - Mesaj
         */
        warning: (msg) => window.Toast?.warning(msg) ?? console.warn('⚠', msg),

        /**
         * Bilgi bildirimi göster
         * @param {string} msg - Mesaj
         */
        info: (msg) => window.Toast?.info(msg) ?? console.info('ℹ', msg),
    },

    // ==========================================
    // INTERNATIONALIZATION (i18n)
    // ==========================================
    i18n: {
        /**
         * Çeviri anahtarını çevrilmiş metne dönüştür
         * @param {string} key - Çeviri anahtarı
         * @param {Object} [params] - İsteğe bağlı parametreler
         * @returns {string} Çevrilmiş metin veya anahtar
         */
        t: (key, params) => window.I18n?.t(key, params) ?? key,

        /**
         * Mevcut dili getir
         * @returns {string} Dil kodu (tr, en, vb.)
         */
        getCurrentLang: () => window.I18n?.currentLang ?? 'tr',
    },

    // ==========================================
    // ROUTER (SPA Navigation)
    // ==========================================
    router: {
        /**
         * Hash route'a git
         * @param {string} path - Yol (örn: '/admin')
         */
        navigate: (path) => window.Router?.navigate(path),

        /**
         * Sayfaya yönlendir (uyumluluk için)
         * @param {string} page - Sayfa adı (örn: 'auth.html')
         */
        redirectTo: (page) => window.Router?.redirectTo(page),

        /**
         * Mevcut route bilgisini getir
         * @returns {Object|null} Route bilgisi
         */
        getCurrentRoute: () => window.Router?.parseHash() ?? null,
    },

    // ==========================================
    // STATE MANAGEMENT (Store)
    // ==========================================
    store: {
        /**
         * State değeri getir
         * @param {string} key - State anahtarı
         * @returns {*} State değeri
         */
        getState: (key) => window.Store?.getState(key),

        /**
         * State değeri ayarla
         * @param {string} key - State anahtarı
         * @param {*} value - Değer
         */
        setState: (key, value) => window.Store?.setState(key, value),

        /**
         * State değişikliğine abone ol
         * @param {string} event - Event adı
         * @param {Function} callback - Callback fonksiyonu
         */
        subscribe: (event, callback) => window.Store?.subscribe(event, callback),
    },

    // ==========================================
    // THEME MANAGEMENT
    // ==========================================
    theme: {
        /**
         * Mevcut tema modunu getir
         * @returns {string} 'light' veya 'dark'
         */
        getCurrent: () => window.ThemeManager?.getCurrent() ?? 'light',

        /**
         * Tema modunu değiştir
         */
        toggle: () => window.ThemeManager?.toggle(),

        /**
         * Belirli temayı ayarla
         * @param {string} mode - 'light' veya 'dark'
         */
        set: (mode) => window.ThemeManager?.set(mode),
    },

    // ==========================================
    // UTILITY - Availability Check
    // ==========================================

    /**
     * Bir servisin kullanılabilir olup olmadığını kontrol et
     * @param {string} serviceName - Servis adı (toast, i18n, router, store, theme)
     * @returns {boolean}
     */
    isAvailable: (serviceName) => {
        const checks = {
            toast: () => typeof window.Toast !== 'undefined',
            i18n: () => typeof window.I18n !== 'undefined',
            router: () => typeof window.Router !== 'undefined',
            store: () => typeof window.Store !== 'undefined',
            theme: () => typeof window.ThemeManager !== 'undefined',
        };
        return checks[serviceName]?.() ?? false;
    },
};

// Global olarak erişilebilir yap
window.Services = Services;

// ES Module uyumluluğu için export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Services;
}
