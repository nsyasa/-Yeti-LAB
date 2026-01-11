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
        // Safe check for document/body
        if (!document.documentElement || !document.body) {
            console.warn('ThemeManager: DOM not ready');
            return;
        }

        // Sync with Store: check both localStorage keys
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem('theme') || 'dark';

        // Sync localStorage keys and ensure default is dark
        const theme = savedTheme || 'dark';

        // Ensure consistency across storage keys
        if (localStorage.getItem(this.STORAGE_KEY) !== theme) {
            localStorage.setItem(this.STORAGE_KEY, theme);
        }
        if (localStorage.getItem('theme') !== theme) {
            localStorage.setItem('theme', theme);
        }

        // Apply theme (idempotent operation)
        this.applyTheme(theme);

        // Sync with Store if available
        if (window.Store && typeof window.Store.setState === 'function') {
            window.Store.setState({ theme });
        }

        // Listen for system theme changes (only if no user preference - but we always use dark by default)
        // This listener is kept for future system preference support
        // Note: We use a named function for the listener to avoid duplicates if init is called multiple times,
        // but since matchMedia returns a new object each time, simple protection is hard.
        // Ideally init should only run once.
        if (!this._systemListenerAdded) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only react if strict system mode is enabled (currently not UI exposed)
                // or if we decide to fallback to system when no storage exists.
                // For now, we stick to manual preference or default dark.
            });
            this._systemListenerAdded = true;
        }
    },

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        const root = document.documentElement;
        const body = document.body;

        if (theme === 'dark') {
            // Add both class names to support all CSS selectors
            if (!body.classList.contains('dark-mode')) body.classList.add('dark-mode');

            // Tailwind 'dark' class on HTML is the standard
            if (!root.classList.contains('dark')) root.classList.add('dark');
            if (!root.classList.contains('dark-mode')) root.classList.add('dark-mode');

            // Remove light classes
            root.classList.remove('light');

            // Set data attribute for CSS attribute selectors
            root.setAttribute('data-theme', 'dark');
            root.style.colorScheme = 'dark';
        } else {
            // Remove all dark mode classes
            body.classList.remove('dark-mode');
            root.classList.remove('dark', 'dark-mode');

            // Add light class
            if (!root.classList.contains('light')) root.classList.add('light');

            // Set data attribute
            root.setAttribute('data-theme', 'light');
            root.style.colorScheme = 'light';
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
