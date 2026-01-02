/**
 * Yeti LAB - Constants
 * Sabit değerler ve konfigürasyonlar
 */

const Constants = {
    // Roller
    ROLES: {
        STUDENT: 'student',
        TEACHER: 'teacher',
        ADMIN: 'admin',
    },

    // Avatar Listesi (Tüm uygulama genelinde ortak)
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

// Global export
window.Constants = Constants;
