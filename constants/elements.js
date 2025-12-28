/**
 * Application Element IDs
 * Merkezi element ID yönetimi
 */

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
            SHOW_TAB_PREFIX: 'p-show-' // e.g. p-show-mission
        },

        // Component Form Fields
        COMPONENT: {
            KEY: 'c-key',
            NAME: 'c-name',
            ICON: 'c-icon',
            IMG: 'c-imgFileName',
            DESC: 'c-desc'
        },

        // Phase Form Fields
        PHASE: {
            FIXED_NAME: 'ph-fixed-name',
            ICON: 'ph-icon',
            DESC: 'ph-desc',
            COLOR: 'ph-color'
        },

        // Course Settings
        COURSE: {
            ICON: 'course-icon',
            TITLE: 'course-title',
            DESC: 'course-description',
            PREVIEW_ICON: 'course-icon-preview',
            PREVIEW_TITLE: 'course-title-preview',
            PREVIEW_DESC: 'course-desc-preview',
            FORM: 'course-settings-form',
            TOGGLE: 'course-settings-toggle'
        }
    },

    // --- MAIN APP (Placeholder for now) ---
    APP: {
        CONTENT: 'content',
        SIDEBAR: 'sidebar',
        // Add more as we migrate app.js
    }
};

// Global erişim için window'a ata (Module import sistemi olmadığı için)
window.EL = EL;
