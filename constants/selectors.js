/**
 * DOM Selectors Module
 * Tekrar eden DOM selector string'lerini merkezi bir noktada toplar.
 *
 * AMAÇ: Typo hatalarını önlemek ve refactoring kolaylığı sağlamak.
 *
 * KULLANIM:
 *   const el = document.getElementById(SELECTORS.DASHBOARD);
 *   element.classList.add(CSS_CLASSES.HIDDEN);
 */

// ==========================================
// VIEW SELECTORS
// ==========================================
const SELECTORS = {
    // Ana görünümler
    COURSE_SELECTION: 'course-selection-view',
    DASHBOARD: 'dashboard-view',
    PROJECT: 'project-view',
    MAIN_CONTENT: 'main-content',

    // SPA Container'lar
    ADMIN_CONTAINER: 'admin-view-container',
    TEACHER_CONTAINER: 'teacher-view-container',
    PROFILE_CONTAINER: 'profile-view-container',
    STUDENT_DASHBOARD_CONTAINER: 'student-dashboard-container',

    // Header & Footer
    HEADER: 'main-header',
    FOOTER: 'main-footer',

    // Sidebar
    SIDEBAR: 'lesson-sidebar',
    SIDEBAR_OVERLAY: 'sidebar-overlay',
    SIDEBAR_CONTENT: 'sidebar-content',

    // Course & Dashboard
    COURSE_LIST: 'course-list',
    COURSE_TITLE: 'course-title',
    COURSE_DESC: 'course-desc',
    COURSE_PROGRESS_BAR: 'course-progress-bar',
    COURSE_PROGRESS_TEXT: 'course-progress-text',
    DASHBOARD_CONTENT: 'dashboard-content',

    // Project View
    PROJECT_TITLE: 'project-title',
    PROJECT_DESC: 'project-desc',
    PROJECT_ICON: 'project-icon',
    PROJECT_TAG: 'project-tag',
    PROJECT_TABS_CONTAINER: 'project-tabs-container',
    TAB_CONTENT_AREA: 'tab-content-area',

    // Simulation
    SIM_CONTAINER: 'sim-container',
    SIM_CANVAS: 'simCanvas',
    SIM_CONTROLS: 'simControls',
    SIM_CONTENT_AREA: 'sim-content-area',
    SIM_TITLE: 'sim-title',
    SIM_BADGE: 'sim-badge',
    CHART_CARD: 'chart-card',
    DATA_CHART: 'dataChart',
    INTERACTIVE_AREA: 'interactive-area',
    INTERACTIVE_INFO: 'interactive-info',
    INFO_TITLE: 'info-title',
    INFO_DESC: 'info-desc',

    // Modal
    IMAGE_MODAL: 'image-modal',
    MODAL_IMG: 'modal-img',
    MODAL_CAPTION: 'modal-caption',
    MODAL_CONTENT: 'modal-content',

    // Search
    MOBILE_SEARCH_OVERLAY: 'mobile-search-overlay',
    MOBILE_SEARCH_INPUT: 'mobileSearchInput',
    MOBILE_SEARCH_RESULTS: 'mobileSearchResults',

    // User Menu
    USER_MENU: 'user-menu',
    USER_MENU_BTN: 'user-menu-btn',
    USER_AVATAR: 'user-avatar',
    USER_NAME: 'user-name',

    // Mobile Nav
    MOBILE_BOTTOM_NAV: 'mobile-bottom-nav',
};

// ==========================================
// CSS CLASSES
// ==========================================
const CSS_CLASSES = {
    // Visibility
    HIDDEN: 'hidden',
    VISIBLE: 'visible',

    // States
    LOADING: 'is-loading',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    OPEN: 'open',

    // Theme
    THEME_BG: 'bg-theme',
    THEME_TEXT: 'text-theme',
    THEME_LIGHT: 'bg-theme-light',

    // Animations
    FADE_IN: 'fade-in',
    ANIMATE_BOUNCE: 'animate-bounce',
    ANIMATE_PULSE: 'animate-pulse',

    // View Transitions
    VIEW_ENTER_START: 'view-enter-start',
    VIEW_ENTER_ACTIVE: 'view-enter-active',
    VIEW_EXIT_START: 'view-exit-start',
    VIEW_EXIT_ACTIVE: 'view-exit-active',

    // Tab States
    TAB_BTN: 'tab-btn',
    TAB_ACTIVE: 'tab-btn-active',
};

// ==========================================
// STORAGE KEYS
// ==========================================
const STORAGE_KEYS = {
    AUTOSAVE: 'mucit_atolyesi_autosave',
    PROGRESS: 'yetilab_progress',
    THEME: 'yetilab_theme',
    LANGUAGE: 'yetilab_lang',
    USER_PREFERENCES: 'yetilab_preferences',
};

// ==========================================
// API TABLE NAMES
// ==========================================
const TABLES = {
    COURSES: 'courses',
    PHASES: 'phases',
    PROJECTS: 'projects',
    COMPONENTS: 'course_components',
    USERS: 'users',
    CONTENT_ADMINS: 'content_admins',
    TEACHERS: 'teachers',
    STUDENTS: 'students',
    CLASSROOMS: 'classrooms',
    STUDENT_PROGRESS: 'student_progress',
};

// Global olarak erişilebilir yap
window.SELECTORS = SELECTORS;
window.CSS_CLASSES = CSS_CLASSES;
window.STORAGE_KEYS = STORAGE_KEYS;
window.TABLES = TABLES;

// ES Module uyumluluğu
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SELECTORS, CSS_CLASSES, STORAGE_KEYS, TABLES };
}
