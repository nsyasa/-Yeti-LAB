/**
 * Settings Module
 * Centralizes localStorage access and default user preferences.
 */
const Settings = {
    defaults: {
        theme: 'light', // light, dark, shield
        lastCourse: null, // Last visited course key
    },

    /**
     * Get a setting value
     * @param {string} key
     * @returns {string} The saved value or default
     */
    get: (key) => {
        const val = localStorage.getItem(key);
        return val !== null ? val : Settings.defaults[key];
    },

    /**
     * Save a setting value
     * @param {string} key
     * @param {string} value
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('Settings could not be saved (localStorage disabled?)');
        }
    },

    /**
     * Clear all settings (Factory Reset)
     */
    clear: () => {
        localStorage.clear();
    },
};

window.Settings = Settings;
