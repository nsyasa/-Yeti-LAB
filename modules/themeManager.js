/**
 * Global Theme Manager
 * - Detects system preference
 * - Respects user preference from localStorage
 * - Applies theme across all pages
 */
const ThemeManager = {
    STORAGE_KEY: 'yeti_theme',

    /**
     * Initialize theme on page load
     * Priority: 1. User preference  2. System preference  3. Light
     */
    init() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

        if (savedTheme) {
            // User has a saved preference
            this.applyTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(prefersDark ? 'dark' : 'light');
        }

        // Listen for system theme changes (only if no user preference)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark');
        }

        // Update meta theme-color for mobile browsers
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#0f172a' : '#ffffff';
        }
    },

    /**
     * Set user theme preference
     * @param {string} theme - 'light', 'dark', or 'system'
     */
    setTheme(theme) {
        if (theme === 'system') {
            // Remove saved preference, use system
            localStorage.removeItem(this.STORAGE_KEY);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(prefersDark ? 'dark' : 'light');
        } else {
            // Save user preference
            localStorage.setItem(this.STORAGE_KEY, theme);
            this.applyTheme(theme);
        }
    },

    /**
     * Get current theme
     * @returns {string} 'light' or 'dark'
     */
    getCurrentTheme() {
        return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    },

    /**
     * Toggle between light and dark
     */
    toggle() {
        const current = this.getCurrentTheme();
        this.setTheme(current === 'dark' ? 'light' : 'dark');
    }
};

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

// Make globally available
window.ThemeManager = ThemeManager;
