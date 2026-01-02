/**
 * Yeti LAB - Utility Functions
 * Ortak yardımcı fonksiyonlar
 */

const Utils = {
    /**
     * Tarih formatlar (TR locale)
     * @param {string|Date} dateString - Tarih objesi veya string
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatlanmış tarih
     */
    formatDate: (dateString, options = {}) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            const defaultOptions = {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            };
            return date.toLocaleDateString('tr-TR', { ...defaultOptions, ...options });
        } catch (e) {
            console.error('Date formatting error:', e);
            return dateString;
        }
    },

    /**
     * Fonksiyon çağrılarını geciktirir
     * @param {Function} func - Çağrılacak fonksiyon
     * @param {number} wait - Bekleme süresi (ms)
     * @returns {Function} Debounced fonksiyon
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Benzersiz ID oluşturur
     * @returns {string} UUID v4 benzeri string
     */
    generateId: () => {
        return 'id-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * HTML özel karakterlerini escape eder (XSS koruması)
     * @param {string} unsafe - Güvensiz string
     * @returns {string} Güvenli string
     */
    escapeHtml: (unsafe) => {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * URL query parametresini döner
     * @param {string} name - Parametre adı
     * @returns {string|null} Parametre değeri
     */
    getUrlParam: (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
};

// Global export
window.Utils = Utils;
