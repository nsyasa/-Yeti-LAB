/**
 * Central State Management for Yeti LAB
 * Implements a simple specific pub/sub pattern for state updates.
 */

const Store = {
    state: {
        user: null, // Current authenticated user
        userProfile: null, // Extended profile data (XP, level etc.)
        courses: [], // List of available courses
        currentCourse: null, // Currently selected course object
        currentCourseKey: null, // Course key (e.g., 'arduino', 'microbit')
        activeProject: null, // Currently active project
        theme: 'light', // Current theme (light/dark)
        notifications: [], // System notifications

        // Course-specific data (FAZ 4.1 - app.state'den taşındı)
        phases: [], // Current course phases
        projects: [], // Current course projects
        componentInfo: {}, // Current course component info
    },

    listeners: [],

    // Initialize store
    init() {
        // Load initial state from local storage if needed
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setState({ theme: savedTheme });

        console.log('📦 Store initialized');
    },

    // Get current state (immutable-ish)
    getState() {
        return { ...this.state };
    },

    // Update state and notify listeners
    setState(newState) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...newState };

        // Notify listeners
        this.notify(this.state, previousState);

        // Debugging (remove in prod)
        // console.log('State Updated:', newState);
    },

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    },

    // Notify all listeners
    notify(state, previousState) {
        this.listeners.forEach((listener) => listener(state, previousState));
    },

    // --- System 2: Event Bus (Pub/Sub for Actions) ---
    events: {},

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {function} callback - Function to run
     */
    on(eventName, callback) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} eventName
     * @param {function} callback
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    },

    /**
     * Trigger an event
     * @param {string} eventName
     * @param {any} payload
     */
    emit(eventName, payload) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach((cb) => {
            try {
                cb(payload);
            } catch (e) {
                console.error(`[Store] Error in event listener for ${eventName}:`, e);
            }
        });
    },

    // ==========================================
    // Specific Actions
    // ==========================================

    // User Actions
    setUser(user) {
        this.setState({ user });
    },

    setProfile(profile) {
        this.setState({ userProfile: profile });
    },

    // Course Actions
    setCourses(courses) {
        this.setState({ courses });
    },

    setCurrentCourse(course, key = null) {
        this.setState({
            currentCourse: course,
            currentCourseKey: key || course?.key || course?.slug || null,
        });
    },

    /**
     * Set current course key (FAZ 4.1)
     * @param {string} key - Course key (e.g., 'arduino')
     */
    setCurrentCourseKey(key) {
        this.setState({ currentCourseKey: key });
    },

    /**
     * Get current course key
     * @returns {string|null}
     */
    getCurrentCourseKey() {
        return this.state.currentCourseKey;
    },

    /**
     * Set course data (FAZ 4.1 - app.state'den taşındı)
     * @param {Object} data - Course data containing phases, projects, componentInfo
     */
    setCourseData(data) {
        this.setState({
            phases: data.phases || [],
            projects: data.projects || [],
            componentInfo: data.componentInfo || {},
        });
    },

    /**
     * Get phases
     * @returns {Array}
     */
    getPhases() {
        return this.state.phases;
    },

    /**
     * Get projects
     * @returns {Array}
     */
    getProjects() {
        return this.state.projects;
    },

    /**
     * Get component info
     * @returns {Object}
     */
    getComponentInfo() {
        return this.state.componentInfo;
    },

    // UI Actions
    setTheme(theme) {
        this.setState({ theme });
        // Side effect: Save to local storage
        localStorage.setItem('theme', theme);
        // Side effect: Update DOM
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    },
};

// Auto-init on load
Store.init();

window.Store = Store;
