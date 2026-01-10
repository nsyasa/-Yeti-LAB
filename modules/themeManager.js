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
     * Priority: 1. User preference  2. Default dark mode
     */
    init() {
        // Sync with Store: check both localStorage keys
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem('theme') || 'dark';

        // Sync localStorage keys and ensure default is dark
        const theme = savedTheme || 'dark';
        localStorage.setItem(this.STORAGE_KEY, theme);
        localStorage.setItem('theme', theme);

        // Apply theme
        this.applyTheme(theme);

        // Sync with Store if available
        if (window.Store && window.Store.setState) {
            window.Store.setState({ theme });
        }

        // Listen for system theme changes (only if no user preference - but we always use dark by default)
        // This listener is kept for future system preference support
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const currentTheme = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem('theme');
            if (!currentTheme) {
                // Only use system preference if no saved preference exists
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
            // Add both class names to support all CSS selectors
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark', 'dark-mode');
        } else {
            // Remove all dark mode classes
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark', 'dark-mode');
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
            // Remove saved preference, use system (but default to dark)
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            this.applyTheme(systemTheme);

            // Sync with Store
            if (window.Store && window.Store.setState) {
                window.Store.setState({ theme: systemTheme });
            }
        } else {
            // Save user preference to both localStorage keys
            localStorage.setItem(this.STORAGE_KEY, theme);
            localStorage.setItem('theme', theme);
            this.applyTheme(theme);

            // Sync with Store
            if (window.Store && window.Store.setState) {
                window.Store.setState({ theme });
            }
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
    },

    /**
     * Toggle Eye Shield (Warm Filter)
     */
    toggleEyeShield() {
        let shield = document.getElementById('eye-shield-overlay');
        if (!shield) {
            shield = document.createElement('div');
            shield.id = 'eye-shield-overlay';
            shield.style.cssText =
                'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255, 200, 0, 0.15);pointer-events:none;z-index:9999;mix-blend-mode:multiply;display:none;';
            document.body.appendChild(shield);
        }

        const isHidden = shield.style.display === 'none';
        shield.style.display = isHidden ? 'block' : 'none';

        // Save preference if needed (optional)
        localStorage.setItem('yeti_eye_shield', isHidden ? 'true' : 'false');
    },

    load() {
        // Load Eye Shield state
        if (localStorage.getItem('yeti_eye_shield') === 'true') {
            this.toggleEyeShield();
            // Toggle logic toggles it ON because it starts as none (unless created differently)
            // Wait, if I call toggleEyeShield() it creates it hidden then shows it. Correct.
            // But if I call it twice it hides it. Logic is fine.
            // Actually, need to be careful with double init.
            const shield = document.getElementById('eye-shield-overlay');
            if (shield && shield.style.display === 'block') {
                // Already on, do nothing
            } else {
                // It might not exist yet
            }
        }
    },
};

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

// Make globally available
window.ThemeManager = ThemeManager;
