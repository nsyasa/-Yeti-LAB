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

    // ==========================================
    // YENİ: Backend Güvenlik Validasyonları
    // ==========================================

    /**
     * UUID formatını kontrol eder
     * @param {string} str - Kontrol edilecek string
     * @returns {boolean} Geçerli UUID ise true
     */
    isValidUUID: (str) => {
        if (!str || typeof str !== 'string') return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    },

    /**
     * Sınıf kodunu kontrol eder (5 karakter, alfanumerik)
     * @param {string} code - Sınıf kodu
     * @returns {boolean} Geçerliyse true
     */
    isValidClassroomCode: (code) => {
        if (!code || typeof code !== 'string') return false;
        return /^[A-Z0-9]{5}$/.test(code.toUpperCase());
    },

    /**
     * String'i güvenli hale getirir (XSS koruması)
     * HTML taglarını kaldırır ve maksimum uzunluk uygular
     * @param {string} str - Temizlenecek string
     * @param {number} maxLength - Maksimum uzunluk (varsayılan: 500)
     * @returns {string} Temizlenmiş string
     */
    sanitizeString: (str, maxLength = 500) => {
        if (!str) return '';
        return String(str)
            .slice(0, maxLength)
            .replace(/<[^>]*>/g, '')
            .trim();
    },

    /**
     * Slug formatını kontrol eder (URL-friendly)
     * @param {string} slug - Kontrol edilecek slug
     * @returns {boolean} Geçerli slug ise true
     */
    isValidSlug: (slug) => {
        if (!slug || typeof slug !== 'string') return false;
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    },

    /**
     * Pozitif integer kontrolü
     * @param {any} value - Kontrol edilecek değer
     * @returns {boolean} Pozitif integer ise true
     */
    isPositiveInteger: (value) => {
        const num = Number(value);
        return Number.isInteger(num) && num > 0;
    },

    /**
     * Recursively sanitize all string values in an object
     * @param {Object} obj - The object to sanitize
     * @returns {Object} Sanitized object
     */
    sanitizeObject: (obj) => {
        // Handle string input directly (for recursion in arrays)
        if (typeof obj === 'string') {
            if (typeof window !== 'undefined' && window.Utils && window.Utils.escapeHtml) {
                return window.Utils.escapeHtml(obj);
            } else {
                return Validators.sanitizeString(obj);
            }
        }

        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => Validators.sanitizeObject(item));
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = Validators.sanitizeObject(value);
        }
        return sanitized;
    },

    /**
     * Validate course data structure
     * @param {Object} data - Course data object
     * @returns {boolean} True if structure is valid
     */
    isValidCourseData: (data) => {
        if (!data || typeof data !== 'object') return false;

        // Required logic: Check essential fields
        const requiredFields = ['id', 'title', 'key', 'projects'];
        for (const field of requiredFields) {
            if (!data[field]) {
                console.warn(`[Validator] Missing required field: ${field}`);
                return false;
            }
        }

        // Validate projects array
        if (!Array.isArray(data.projects)) {
            console.warn('[Validator] Projects must be an array');
            return false;
        }

        // Validate each project
        const validProjects = data.projects.every((project) => {
            return project.id && project.title && project.type;
        });

        if (!validProjects) {
            console.warn('[Validator] Invalid project structure found');
            return false;
        }

        return true;
    },
};

// ============================================
// GLOBAL EXPORT (Geriye uyumluluk)
// ============================================
// NOT: Dosyalar dynamic <script> tag ile yükleniyor, ES6 export kullanılamaz
// FAZ 5'te module sistemine geçildiğinde export'lar eklenecek
if (typeof window !== 'undefined') {
    window.Validators = Validators;
}
