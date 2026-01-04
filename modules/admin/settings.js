/* global admin */
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

    // --- TAB NAME EDITOR ---
    renderTabEditor() {
        const container = document.getElementById('tab-names-editor');
        if (!container) return;

        const courseKey = this.config.getCourseKey();
        const course = this.config.getCourseData();

        // Get current tab config (custom or default)
        const defaultConfig = window.TabConfig?.courses?.default?.tabs || [];
        const courseConfig = window.TabConfig?.courses?.[courseKey]?.tabs || defaultConfig;

        // Get custom names from course data (if any)
        const customTabNames = course?.customTabNames || {};

        container.innerHTML = '';

        courseConfig.forEach((tab, index) => {
            // Get current label (custom or default)
            const currentLabel = customTabNames[tab.id] || tab.label;

            const div = document.createElement('div');
            div.className = 'flex items-center gap-1';
            div.innerHTML = `
                <input 
                    type="text" 
                    id="tab-name-${tab.id}"
                    value="${currentLabel}"
                    placeholder="${tab.label}"
                    class="flex-1 border rounded px-2 py-1 text-sm"
                    oninput="CourseSettings.updateTabName('${tab.id}', this.value)"
                />
            `;
            container.appendChild(div);
        });
    },

    updateTabName(tabId, newLabel) {
        const course = this.config.getCourseData();
        if (!course) return;

        // Initialize customTabNames if not exists
        if (!course.customTabNames) {
            course.customTabNames = {};
        }

        // Update custom tab name
        course.customTabNames[tabId] = newLabel;

        // Apply to project tabs immediately
        this.applyCustomTabNames();

        if (this.config.onUpdate) this.config.onUpdate();
    },

    resetTabNames() {
        const course = this.config.getCourseData();
        if (!course) return;

        if (!confirm('Sekme isimlerini varsayılana döndürmek istiyor musunuz?')) return;

        // Clear custom names
        course.customTabNames = {};

        // Re-render editor
        this.renderTabEditor();

        // Apply to project tabs
        this.applyCustomTabNames();

        if (this.config.onUpdate) this.config.onUpdate();
    },

    // Apply custom tab names to the project form labels and visibility checkboxes
    applyCustomTabNames() {
        const course = this.config.getCourseData();
        if (!course) return;

        const customTabNames = course.customTabNames || {};

        // Mapping between TabConfig IDs and target HTML Element IDs (Array of IDs)
        const tabMapping = {
            mission: ['lbl-mission', 'lbl-chk-mission'],
            materials: ['lbl-materials', 'lbl-chk-materials'],
            circuit: ['lbl-circuit', 'lbl-chk-circuit'],
            code: ['lbl-code', 'lbl-chk-code'],
            quiz: ['lbl-quiz', 'lbl-chk-quiz'],
            challenge: ['lbl-challenge', 'lbl-chk-challenge']
        };

        // Default Labels (to restore if custom name is deleted)
        const defaultLabels = {
            mission: '🎯 Amaç',
            materials: '🧩 Donanım',
            circuit: '⚡ Simülasyon',
            code: '💻 Kod',
            quiz: '📝 Test',
            challenge: '🏆 Görev'
        };

        // Apply custom names to targets
        Object.keys(tabMapping).forEach((tabId) => {
            const targetIds = tabMapping[tabId];

            targetIds.forEach(targetId => {
                const element = document.getElementById(targetId);
                if (element) {
                    // Use custom name or fall back to default
                    if (customTabNames[tabId]) {
                        // Try to preserve default emoji if user didn't provide one
                        const defaultEmoji = defaultLabels[tabId]?.split(' ')[0] || '';
                        if (!customTabNames[tabId].includes(defaultEmoji) && defaultEmoji) {
                            element.textContent = `${defaultEmoji} ${customTabNames[tabId]}`;
                        } else {
                            element.textContent = customTabNames[tabId];
                        }
                    } else if (defaultLabels[tabId]) {
                        element.textContent = defaultLabels[tabId];
                    }
                }
            });
        });
    },
};

window.CourseSettings = CourseSettings;
