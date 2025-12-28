/**
 * Progress Tracking Module
 * Handles lesson completion status using localStorage.
 * 
 * Usage:
 *   Progress.load()           - Load from localStorage
 *   Progress.save()           - Save to localStorage
 *   Progress.toggle(id)       - Toggle lesson completion
 *   Progress.isComplete(id)   - Check if lesson is complete
 *   Progress.getRate(key)     - Get completion percentage for a course
 */

const Progress = {
    data: {}, // { courseKey: [completedId1, completedId2] }

    // Reference to app state (will be set on init)
    _getKey: () => window._appState?.currentCourseKey || null,
    _getCourseData: () => window.courseData || {},

    load: () => {
        const stored = localStorage.getItem('courseProgress');
        if (stored) {
            try {
                Progress.data = JSON.parse(stored);
            } catch (e) {
                console.warn('[Progress] Could not parse stored data:', e);
                Progress.data = {};
            }
        }
    },

    save: () => {
        localStorage.setItem('courseProgress', JSON.stringify(Progress.data));
    },

    toggle: (projectId) => {
        const key = Progress._getKey();
        if (!key) return;

        if (!Progress.data[key]) Progress.data[key] = [];

        const index = Progress.data[key].indexOf(projectId);
        if (index > -1) {
            Progress.data[key].splice(index, 1);
        } else {
            Progress.data[key].push(projectId);
        }
        Progress.save();

        // Trigger UI update via callback
        if (typeof Progress.onUpdate === 'function') {
            Progress.onUpdate(projectId);
        }
    },

    isComplete: (projectId) => {
        const key = Progress._getKey();
        return Progress.data[key] && Progress.data[key].includes(projectId);
    },

    getRate: (key) => {
        const completed = Progress.data[key] ? Progress.data[key].length : 0;
        const courseData = Progress._getCourseData();
        const total = (courseData[key]?.data?.projects?.length) || 1;
        return Math.round((completed / total) * 100);
    },

    // Callback for UI updates (set by app.js)
    onUpdate: null
};

// Export for global access
window.Progress = Progress;
