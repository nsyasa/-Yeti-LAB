/**
 * @deprecated Bu dosya artık kullanılmıyor.
 * Lütfen 'constants/index.js' dosyasını kullanın.
 *
 * Bu dosya geriye uyumluluk için korunuyor ve
 * FAZ 5 tamamlandığında silinecek.
 */

// Yeni merkezi dosyadan import et ve re-export et
// Not: ES Module olarak yüklenene kadar doğrudan tanımlama kullan

const Constants = {
    // Roller
    ROLES: {
        STUDENT: 'student',
        TEACHER: 'teacher',
        ADMIN: 'admin',
    },

    // Avatar Listesi
    AVATARS: ['👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👦', '👧', '🧑', '🤖', '🐱', '🐶', '🚀', '⭐', '🦸', '🦹', '🧙', '🧟'],

    // Storage Keys
    STORAGE_KEYS: {
        USER_ROLE: 'yeti_user_role',
        THEME: 'yeti_theme',
        STUDENT_SESSION: 'yeti_student_session',
        LANGUAGE: 'yeti_lang',
    },

    // UI Konfigürasyonları
    CONFIG: {
        TOAST_DURATION: 3000,
        DEBOUNCE_DELAY: 300,
        PASSWORD_MIN_LENGTH: 6,
    },
};

// Global export (geriye uyumluluk)
// NOT: Dosyalar dynamic <script> tag ile yükleniyor, ES6 export kullanılamaz
if (typeof window !== 'undefined') {
    window.Constants = Constants;
}
