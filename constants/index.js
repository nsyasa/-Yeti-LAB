/**
 * Yeti LAB - Constants Index
 * Tüm sabit değerler tek bir dosyada toplanmıştır
 *
 * NOT: Bu dosya FAZ 5'e kadar ES6 export KULLANMAZ
 * Çünkü dynamic <script> tag ile yüklendiğinde export syntax error verir
 *
 * Kullanım (Global):
 *   window.Constants.ROLES
 *   window.EL.ADMIN.PROJECT_LIST
 */

// ============================================
// ROLLER
// ============================================
const ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
};

// ============================================
// AVATARLAR
// ============================================
const AVATARS = ['👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👦', '👧', '🧑', '🤖', '🐱', '🐶', '🚀', '⭐', '🦸', '🦹', '🧙', '🧟'];

// ============================================
// STORAGE KEYS
// ============================================
const STORAGE_KEYS = {
    USER_ROLE: 'yeti_user_role',
    THEME: 'yeti_theme',
    STUDENT_SESSION: 'yeti_student_session',
    LANGUAGE: 'yeti_lang',
};

// ============================================
// UI KONFİGÜRASYONLARI
// ============================================
const CONFIG = {
    TOAST_DURATION: 3000,
    DEBOUNCE_DELAY: 300,
    PASSWORD_MIN_LENGTH: 6,
};

// ============================================
// ELEMENT ID'LERİ
// ============================================
const EL = {
    // --- ADMIN PANEL ---
    ADMIN: {
        // Navigation & Layout
        PROJECT_LIST: 'project-list',
        PROJECT_WELCOME: 'project-welcome',
        PROJECT_FORM: 'project-form',

        COMPONENT_LIST: 'component-list',
        COMPONENT_WELCOME: 'component-welcome',
        COMPONENT_FORM: 'component-form',

        PHASE_LIST: 'phase-list',
        PHASE_WELCOME: 'phase-welcome',
        PHASE_FORM: 'phase-form',

        // Project Form Fields
        PROJECT: {
            ID: 'p-id',
            TITLE: 'p-title',
            ICON: 'p-icon',
            DESC: 'p-desc',
            PHASE: 'p-phase',
            WEEK: 'p-week',
            MISSION: 'p-mission',
            THEORY: 'p-theory',

            // Settings
            SIM_TYPE: 'p-simType',
            SIM_TYPE_CUSTOM: 'p-simType-custom',
            HAS_GRAPH: 'p-hasGraph',
            CODE_MODE: 'p-code-mode',

            // Content
            CODE: 'p-code',
            CODE_IMAGE_INPUT: 'p-code-image-input',
            CHALLENGE: 'p-challenge',
            CIRCUIT_IMAGE: 'p-circuitImage',
            HOTSPOTS_DATA: 'p-hotspots',
            MATERIALS_CUSTOM: 'p-materials-custom',

            // Toggles
            ENABLE_HOTSPOTS: 'p-enableHotspots',
            SHOW_IN_LAB: 'p-showInLab',

            // Tab Visibility Checkboxes Prefix
            SHOW_TAB_PREFIX: 'p-show-', // e.g. p-show-mission
        },

        // Component Form Fields
        COMPONENT: {
            KEY: 'c-key',
            NAME: 'c-name',
            ICON: 'c-icon',
            IMG: 'c-imgFileName',
            DESC: 'c-desc',
        },

        // Phase Form Fields
        PHASE: {
            FIXED_NAME: 'ph-fixed-name',
            ICON: 'ph-icon',
            DESC: 'ph-desc',
            COLOR: 'ph-color',
        },

        // Course Settings
        COURSE: {
            ICON: 'admin-course-icon',
            TITLE: 'admin-course-title',
            DESC: 'admin-course-description',
            PREVIEW_ICON: 'course-icon-preview',
            PREVIEW_TITLE: 'course-title-preview',
            PREVIEW_DESC: 'course-desc-preview',
            FORM: 'course-settings-form',
            TOGGLE: 'course-settings-toggle',
        },
    },

    // --- MAIN APP ---
    APP: {
        CONTENT: 'content',
        SIDEBAR: 'sidebar',
        HEADER: 'main-header',
        FOOTER: 'main-footer',
        COURSE_LIST: 'course-list',
        DASHBOARD_VIEW: 'dashboard-view',
        PROJECT_VIEW: 'project-view',
    },
};

// ============================================
// LEGACY UYUMLULUK İÇİN BİRLEŞİK OBJE
// ============================================
const Constants = {
    ROLES,
    AVATARS,
    STORAGE_KEYS,
    CONFIG,
};

// ============================================
// GLOBAL EXPORTS (Geriye uyumluluk)
// ============================================
// NOT: ES6 export kullanılamaz, dosyalar dynamic <script> tag ile yükleniyor
if (typeof window !== 'undefined') {
    window.Constants = Constants;
    window.EL = EL;
    window.ROLES = ROLES;
    window.AVATARS = AVATARS;
    window.STORAGE_KEYS = STORAGE_KEYS;
    window.CONFIG = CONFIG;
}
