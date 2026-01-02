/**
 * Yeti LAB - Validation Functions
 * Form doğrulama fonksiyonları
 */

const Validators = {
    /**
     * Değerin boş olup olmadığını kontrol eder
     * @param {any} value - Kontrol edilecek değer
     * @returns {boolean} Boşsa true
     */
    isEmpty: (value) => {
        return value === null || value === undefined || value.toString().trim() === '';
    },

    /**
     * Minimum karakter uzunluğunu kontrol eder
     * @param {string} value - Kontrol edilecek string
     * @param {number} min - Minimum uzunluk
     * @returns {boolean} Uzunluk yeterliyse true
     */
    minLength: (value, min) => {
        if (!value) return false;
        return value.toString().trim().length >= min;
    },

    /**
     * Şifrelerin eşleşip eşleşmediğini kontrol eder
     * @param {string} p1 - İlk şifre
     * @param {string} p2 - İkinci şifre
     * @returns {boolean} Eşleşiyorsa true
     */
    passwordsMatch: (p1, p2) => {
        return p1 === p2;
    },

    /**
     * E-posta formatını kontrol eder (Basit regex)
     * @param {string} email - E-posta adresi
     * @returns {boolean} Geçerliyse true
     */
    isValidEmail: (email) => {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
};

// Global export
window.Validators = Validators;
