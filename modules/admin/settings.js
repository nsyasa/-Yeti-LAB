/**
 * Course Settings Module for Admin Panel
 * Handles course metadata (icon, title, description) editing and preview.
 */

const CourseSettings = {
    // Dependencies & Configuration
    config: {
        onUpdate: null, // Callback for autosave
        getCourseData: () => null, // Function to get current course object
        getCourseKey: () => 'arduino', // Function to get current course key
    },

    // Default icons per course type
    defaultIcons: {
        arduino: '🔌',
        microbit: '🎮',
        scratch: '🐱',
        mblock: '🤖',
        appinventor: '📱',
    },

    init(config) {
        this.config = { ...this.config, ...config };
    },

    // --- LOAD SETTINGS ---
    load() {
        const course = this.config.getCourseData();
        if (!course) return;

        const courseKey = this.config.getCourseKey();
        const icon = course.icon || this.defaultIcons[courseKey] || '📚';
        const title = course.title || courseKey;
        const desc = course.description || '';

        // Update form fields
        const iconEl = document.getElementById(EL.ADMIN.COURSE.ICON);
        const titleEl = document.getElementById(EL.ADMIN.COURSE.TITLE);
        const descEl = document.getElementById(EL.ADMIN.COURSE.DESC);

        if (iconEl) iconEl.value = icon;
        if (titleEl) titleEl.value = title;
        if (descEl) descEl.value = desc;

        // Update preview
        this.updatePreview(icon, title, desc);
    },

    // --- UPDATE SETTINGS ---
    update() {
        const course = this.config.getCourseData();
        if (!course) return;

        const iconEl = document.getElementById(EL.ADMIN.COURSE.ICON);
        const titleEl = document.getElementById(EL.ADMIN.COURSE.TITLE);
        const descEl = document.getElementById(EL.ADMIN.COURSE.DESC);

        const icon = iconEl ? iconEl.value : '';
        const title = titleEl ? titleEl.value : '';
        const desc = descEl ? descEl.value : '';

        // Update course data
        course.icon = icon;
        course.title = title;
        course.description = desc;

        // Update preview in real-time
        this.updatePreview(icon, title, desc);

        if (this.config.onUpdate) this.config.onUpdate();
    },

    // --- TOGGLE SETTINGS PANEL ---
    toggle() {
        const form = document.getElementById(EL.ADMIN.COURSE.FORM);
        const toggle = document.getElementById(EL.ADMIN.COURSE.TOGGLE);

        if (!form || !toggle) return;

        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
            toggle.textContent = '▲';
            toggle.style.transform = 'rotate(180deg)';
        } else {
            form.classList.add('hidden');
            toggle.textContent = '▼';
            toggle.style.transform = 'rotate(0deg)';
        }
    },

    // --- HELPER: Update Preview UI ---
    updatePreview(icon, title, desc) {
        const previewIcon = document.getElementById(EL.ADMIN.COURSE.PREVIEW_ICON);
        const previewTitle = document.getElementById(EL.ADMIN.COURSE.PREVIEW_TITLE);
        const previewDesc = document.getElementById(EL.ADMIN.COURSE.PREVIEW_DESC);

        const courseKey = this.config.getCourseKey();

        if (previewIcon) previewIcon.textContent = icon || '📚';
        if (previewTitle) previewTitle.textContent = title || courseKey;
        if (previewDesc) previewDesc.textContent = desc || 'Açıklama yok';
    },
};

window.CourseSettings = CourseSettings;
