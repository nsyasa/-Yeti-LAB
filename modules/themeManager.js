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

        // 1. Get saved preference
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem('theme');

        // 2. If saved, use it. If not, detect system preference.
        let theme;
        if (savedTheme) {
            theme = savedTheme;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }

        // 3. Apply theme
        this.applyTheme(theme);

        // 4. Sync local storage (optional, maybe we don't want to persist system pref immediately?
        // User asked to remember MANUAL choice. So if it's auto, we might not need to save it,
        // but saving ensures consistency across reloads if system changes during session.
        // Actually best practice: Don't write to LS if it's system default, so we can respect future system changes.
        // BUT, existing code syncs keys. Let's keep keys in sync ONLY if we have a saved preference.
        if (savedTheme) {
            if (localStorage.getItem(this.STORAGE_KEY) !== theme) localStorage.setItem(this.STORAGE_KEY, theme);
            if (localStorage.getItem('theme') !== theme) localStorage.setItem('theme', theme);
        }

        // 5. Sync with Store
        if (window.Store && typeof window.Store.setState === 'function') {
            window.Store.setState({ theme });
        }

        // 6. Add Listener for System Changes (Dynamic update if no manual override)
        if (!this._systemListenerAdded) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Modern event listener
            mediaQuery.addEventListener('change', (e) => {
                // If user has NO manual preference in localStorage, update theme automatically
                if (!localStorage.getItem(this.STORAGE_KEY) && !localStorage.getItem('theme')) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(newTheme);

                    // Sync Store
                    if (window.Store && window.Store.setState) {
                        window.Store.setState({ theme: newTheme });
                    }
                    console.log(`[ThemeManager] System theme changed to: ${newTheme}`);
                }
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
