/**
 * LocalStorage Manager Module
 * Admin paneli autosave verilerini güvenli şekilde yönetir
 * XSS koruması ve veri doğrulama içerir
 *
 * @module modules/core/localStorage
 */

const LocalStorageManager = {
    // Storage key for autosave data
    AUTOSAVE_KEY: 'mucit_atolyesi_autosave',

    // Default allowed course keys (whitelist)
    DEFAULT_ALLOWED_COURSES: ['arduino', 'microbit', 'scratch', 'mblock', 'appinventor'],

    /**
     * Restore course data from localStorage (syncs with admin panel autosave)
     * Security: Validates and sanitizes data to prevent XSS attacks
     * @returns {number} Number of courses restored
     */
    restoreFromLocalStorage: () => {
        // Allow all courses defined in manifest + defaults
        const manifestKeys =
            window.CourseLoader && window.CourseLoader.manifest ? Object.keys(window.CourseLoader.manifest) : [];
        const allowedCourses = [...new Set([...LocalStorageManager.DEFAULT_ALLOWED_COURSES, ...manifestKeys])];

        try {
            // In Supabase-First architecture, the main app should only read from the database.
            // localStorage contains admin autosaves which might be stale, duplicate, or draft.
            // We only want to restore from localStorage if we are in the Admin Panel.
            const isAdminPanel =
                window.location.pathname.includes('admin.html') || window.location.pathname.includes('admin');

            if (!isAdminPanel) {
                // Check if we have connectivity/Supabase loaded?
                // Actually, regardless, main app shouldn't read admin drafts.
                // Exception: Maybe offline mode? But current issue is duplicates.
                console.log('[LocalStorage] Skipping restore on main site (Supabase-First)');
                return 0;
            }

            const saved = localStorage.getItem(LocalStorageManager.AUTOSAVE_KEY);
            if (!saved) return 0;

            // Parse with error handling
            let parsed;
            try {
                parsed = JSON.parse(saved);
            } catch (parseError) {
                console.warn('[LocalStorage] Invalid JSON in localStorage, clearing corrupted data:', parseError);
                localStorage.removeItem(LocalStorageManager.AUTOSAVE_KEY);
                return 0;
            }

            // Validate top-level structure
            if (!parsed || typeof parsed !== 'object') {
                console.warn('[LocalStorage] Invalid autosave structure, ignoring');
                return 0;
            }

            if (!parsed.data || typeof parsed.data !== 'object' || Object.keys(parsed.data).length === 0) {
                return 0;
            }

            // Validate timestamp
            if (
                parsed.timestamp &&
                (typeof parsed.timestamp !== 'number' || parsed.timestamp > Date.now() + 86400000)
            ) {
                console.warn('[LocalStorage] Invalid autosave timestamp, ignoring');
                return 0;
            }

            // Process only allowed courses with validation and sanitization
            let restoredCount = 0;
            Object.keys(parsed.data).forEach((key) => {
                // Only accept whitelisted course keys
                if (!allowedCourses.includes(key)) {
                    console.warn(`[LocalStorage] Unknown course key rejected: ${key}`);
                    return;
                }

                // Only merge if course exists in window.courseData
                if (!window.courseData[key]) {
                    return;
                }

                // Skip if course data is sourced from Supabase (Official Source)
                if (window.courseData[key]._supabaseId) {
                    console.log(`[LocalStorage] Skipping restore for ${key} (Supabase source)`);
                    return;
                }

                const courseData = parsed.data[key];

                // Validate course data structure
                if (typeof Validators !== 'undefined' && !Validators.isValidCourseData(courseData)) {
                    console.warn(`[LocalStorage] Invalid course data structure for: ${key}`);
                    return;
                }

                // Sanitize all string values to prevent XSS
                const sanitizedData =
                    typeof Validators !== 'undefined' ? Validators.sanitizeObject(courseData) : courseData;

                // Merge sanitized data
                window.courseData[key] = sanitizedData;
                restoredCount++;
            });

            if (restoredCount > 0) {
                const date = new Date(parsed.timestamp).toLocaleString();
                console.log(`[LocalStorage] Course data restored (${date}), ${restoredCount} course(s)`);
            }

            return restoredCount;
        } catch (e) {
            console.error('[LocalStorage] Failed to restore from localStorage:', e);
            // Don't propagate error, just log it
            return 0;
        }
    },

    /**
     * Clear autosave data
     */
    clearAutosave: () => {
        localStorage.removeItem(LocalStorageManager.AUTOSAVE_KEY);
        console.log('[LocalStorage] Autosave data cleared');
    },

    /**
     * Check if autosave data exists
     * @returns {boolean}
     */
    hasAutosave: () => {
        return localStorage.getItem(LocalStorageManager.AUTOSAVE_KEY) !== null;
    },

    /**
     * Get autosave timestamp
     * @returns {Date|null}
     */
    getAutosaveTimestamp: () => {
        try {
            const saved = localStorage.getItem(LocalStorageManager.AUTOSAVE_KEY);
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            return parsed.timestamp ? new Date(parsed.timestamp) : null;
        } catch {
            return null;
        }
    },
};

// Global scope'a ekle (mevcut yapıya uyum için)
window.LocalStorageManager = LocalStorageManager;
