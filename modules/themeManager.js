/**
 * Global Theme Manager
 * Single Source of Truth: 'yeti_theme'
 * Policy: STRICT DEFAULT DARK. System preferences are IGNORED.
 */
const ThemeManager = {
    STORAGE_KEY: 'yeti_theme',

    /**
     * Initialize theme
     * - Migrates legacy 'theme' key to 'yeti_theme'
     * - Enforces Dark Mode by default
     */
    init() {
        if (!document.documentElement || !document.body) return;

        // 1. MIGRATION: Check for legacy key
        const legacyTheme = localStorage.getItem('theme');
        if (legacyTheme) {
            // Move to new key
            localStorage.setItem(this.STORAGE_KEY, legacyTheme);
            // Delete old key
            localStorage.removeItem('theme');
            console.log('ThemeManager: Migrated legacy theme preference');
        }

        // 2. GET PREFERENCE: Single source of truth
        // If null/undefined -> Default to 'dark'
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

        // 3. LOGIC: Strict check. Only 'light' triggers Light Mode.
        const theme = savedTheme === 'light' ? 'light' : 'dark';

        // 4. APPLY
        this.applyTheme(theme);

        // 5. UPDATE STORE (if available)
        if (window.Store && typeof window.Store.setState === 'function') {
            window.Store.setState({ theme });
        }
    },

    /**
     * Apply theme to DOM
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        const root = document.documentElement;
        const body = document.body;
        const metaTheme = document.querySelector('meta[name="theme-color"]');

        if (theme === 'light') {
            // --- LIGHT MODE ---
            // Remove dark classes
            root.classList.remove('dark', 'dark-mode');
            body.classList.remove('dark-mode');

            // Add light classes
            root.classList.add('light');

            // Set attributes
            root.setAttribute('data-theme', 'light');
            root.style.colorScheme = 'light';

            // Update Mobile Meta
            if (metaTheme) metaTheme.content = '#f9fafb'; // gray-50
        } else {
            // --- DARK MODE (Default) ---
            // Remove light classes
            root.classList.remove('light');

            // Add dark classes (Ensure they exist)
            root.classList.add('dark', 'dark-mode');
            body.classList.add('dark-mode');

            // Set attributes
            root.setAttribute('data-theme', 'dark');
            root.style.colorScheme = 'dark';

            // Update Mobile Meta
            if (metaTheme) metaTheme.content = '#0f172a'; // slate-900
        }
    },

    /**
     * Set User Preference
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        // Normalize input
        const validTheme = theme === 'light' ? 'light' : 'dark';

        // Save to Storage (Single Source)
        localStorage.setItem(this.STORAGE_KEY, validTheme);

        // Apply
        this.applyTheme(validTheme);

        // Sync Store
        if (window.Store && window.Store.setState) {
            window.Store.setState({ theme: validTheme });
        }
    },

    /**
     * Toggle Theme
     */
    toggle() {
        const current = this.getCurrentTheme();
        this.setTheme(current === 'dark' ? 'light' : 'dark');
    },

    /**
     * Get Current Theme
     * @returns {string} 'light' or 'dark'
     */
    getCurrentTheme() {
        // Truth is in DOM classList
        return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    },
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

// Export Global
window.ThemeManager = ThemeManager;
