/**
 * View Loader Module
 * SPA view'larını (Admin, Teacher, Profile, StudentDashboard) lazy load eder
 * Script yükleme ve view mounting işlemlerini yönetir
 *
 * @module modules/routing/viewLoader
 */

const ViewLoader = {
    // Track loaded scripts to prevent duplicate loading
    _loadedScripts: new Set(),

    // ========================
    // SCRIPT LOADER UTILITY
    // ========================

    /**
     * Load a script dynamically, with duplicate prevention
     * @param {string} src - Script source path
     * @returns {Promise<void>}
     */
    loadScript: (src) => {
        return new Promise((resolve, reject) => {
            // 1. Check if we've already loaded this script
            if (ViewLoader._loadedScripts.has(src)) {
                resolve();
                return;
            }

            // 2. Check if script tag exists in DOM
            if (document.querySelector(`script[src="${src}"]`)) {
                ViewLoader._loadedScripts.add(src);
                resolve();
                return;
            }

            // 3. Check if global module is already defined
            // This catches modules loaded inline by Vite dev server
            const moduleChecks = {
                'modules/courseLoader.js': () => typeof window.CourseLoader !== 'undefined',
                'config/tabs.js': () => typeof window.TabConfig !== 'undefined',
                'modules/themes.js': () => typeof window.applyTheme !== 'undefined',
                'data/base.js': () => typeof window.courseData !== 'undefined',
                'data/quiz.js': () => typeof window.quizQuestions !== 'undefined',
            };

            const checkFn = moduleChecks[src];
            if (checkFn && checkFn()) {
                ViewLoader._loadedScripts.add(src);
                resolve();
                return;
            }

            // 4. Load the script
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                ViewLoader._loadedScripts.add(src);
                console.log(`[ViewLoader] Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`[ViewLoader] Failed to load: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.body.appendChild(script);
        });
    },

    /**
     * Load multiple scripts in sequence
     * @param {Array<string>} scripts - Array of script paths
     * @returns {Promise<void>}
     */
    loadScripts: async (scripts) => {
        for (const src of scripts) {
            await ViewLoader.loadScript(src);
        }
    },

    // ========================
    // CONTAINER MANAGEMENT
    // ========================

    /**
     * Get or create a view container
     * @param {string} containerId - Container element ID
     * @param {string} className - Initial class name
     * @returns {HTMLElement}
     */
    getOrCreateContainer: (containerId, className = 'hidden') => {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = className;

            // Add to main content area
            const mainContent =
                document.getElementById('main-content') || document.querySelector('main') || document.body;
            mainContent.appendChild(container);
        }
        return container;
    },

    // ========================
    // ADMIN VIEW
    // ========================

    /**
     * Load and mount Admin View
     * @param {string} route - Current route (admin, admin-projects, admin-phases, admin-components)
     */
    loadAdminView: async (route) => {
        console.log('[ViewLoader] Loading admin view:', route);

        // Load scripts if AdminView not available
        if (!window.AdminView) {
            await ViewLoader.loadAdminScripts();
        }

        // Get or create container
        const container = ViewLoader.getOrCreateContainer('admin-view-container', 'hidden');

        // Switch to this view (hide others)
        if (window.UI?.switchView) {
            UI.switchView('admin-view-container');
        }

        // If already loaded, just switch section
        if (window.AdminView?.isLoaded) {
            console.log('[ViewLoader] AdminView already loaded, just switching section');
            ViewLoader._handleAdminSection(route);
            return;
        }

        // Mount view (first time)
        let mounted = false;
        if (window.ViewManager && window.AdminView) {
            mounted = await ViewManager.mount(AdminView, { route, container });
        } else if (window.AdminView) {
            mounted = await AdminView.mount(container);
        }

        if (mounted) {
            ViewLoader._handleAdminSection(route);
        }
    },

    /**
     * Handle admin section routing
     * @private
     */
    _handleAdminSection: (route) => {
        if (!window.AdminView?.showSection) return;

        if (route === 'admin-projects' || route === 'admin') {
            AdminView.showSection('projects');
        } else if (route === 'admin-phases') {
            AdminView.showSection('phases');
        } else if (route === 'admin-components') {
            AdminView.showSection('components');
        }
    },

    /**
     * Load admin-related scripts
     * In production (Vite bundle), these are already loaded via main.js
     */
    loadAdminScripts: async () => {
        console.log('[ViewLoader] Loading admin scripts...');

        // Check if already bundled (Vite production build)
        if (window.AdminView && window.AdminLayout && window.ProjectManager) {
            console.log('[ViewLoader] Admin scripts already bundled, skipping');
            return;
        }

        const scripts = [
            // Constants
            'constants/elements.js',
            // Core dependencies
            'data/base.js',
            'modules/courseLoader.js',
            'data/quiz.js',
            'modules/themes.js',
            'config/tabs.js',
            // Admin modules
            'modules/admin/storage.js',
            'modules/admin/courses.js',
            'modules/admin/phases.js',
            'modules/admin/components.js',
            'modules/admin/projects.js',
            'modules/admin/settings.js',
            'modules/admin/supabase-sync.js',
            'modules/admin/hotspots.js',
            'modules/admin/images.js',
            'modules/admin/quizzes.js',
            'modules/admin.js', // Main admin coordinator
            // View components
            'views/admin/AdminLayout.js',
            'views/admin/sections/ProjectsSection.js',
            'views/admin/sections/PhasesSection.js',
            'views/admin/sections/ComponentsSection.js',
            'views/admin/modals/AdminModals.js',
            'views/admin/AdminView.js',
        ];

        await ViewLoader.loadScripts(scripts);
        console.log('[ViewLoader] Admin scripts loaded');
    },

    // ========================
    // TEACHER VIEW
    // ========================

    /**
     * Load and mount Teacher View
     * @param {string} route - Current route (teacher, teacher-classrooms, teacher-students)
     */
    loadTeacherView: async (route) => {
        console.log('[ViewLoader] Loading teacher view:', route);

        // Load scripts if TeacherView not available
        if (!window.TeacherView) {
            await ViewLoader.loadTeacherScripts();
        }

        // Get or create container
        const container = ViewLoader.getOrCreateContainer('teacher-view-container', 'hidden');

        // Switch to this view
        if (window.UI?.switchView) {
            UI.switchView('teacher-view-container');
        }

        // If already loaded, just switch section
        if (window.TeacherView?.isLoaded) {
            console.log('[ViewLoader] TeacherView already loaded, just switching section');
            ViewLoader._handleTeacherSection(route);
            return;
        }

        // Mount view (first time)
        let mounted = false;
        if (window.ViewManager && window.TeacherView) {
            mounted = await ViewManager.mount(TeacherView, { route, container });
        } else if (window.TeacherView) {
            mounted = await TeacherView.mount(container);
        }

        if (mounted) {
            ViewLoader._handleTeacherSection(route);
        }
    },

    /**
     * Handle teacher section routing
     * @private
     */
    _handleTeacherSection: (route) => {
        if (!window.TeacherView?.showSection) return;

        if (route === 'teacher-classrooms') {
            TeacherView.showSection('classrooms');
        } else if (route === 'teacher-students') {
            TeacherView.showSection('students');
        }
    },

    /**
     * Load teacher-related scripts
     * In production (Vite bundle), these are already loaded via main.js
     */
    loadTeacherScripts: async () => {
        console.log('[ViewLoader] Loading teacher scripts...');

        // Check if already bundled (Vite production build)
        if (window.TeacherView && window.TeacherLayout && window.TeacherManager) {
            console.log('[ViewLoader] Teacher scripts already bundled, skipping');
            return;
        }

        const scripts = [
            'views/teacher/TeacherLayout.js',
            'views/teacher/sections/DashboardSection.js',
            'views/teacher/sections/ClassroomsSection.js',
            'views/teacher/sections/StudentsSection.js',
            'views/teacher/modals/TeacherModals.js',
            'views/teacher/TeacherView.js',
        ];

        await ViewLoader.loadScripts(scripts);
        console.log('[ViewLoader] Teacher scripts loaded');
    },

    // ========================
    // PROFILE VIEW
    // ========================

    /**
     * Load and mount Profile View
     * @param {string} route - Current route (profile, profile-wizard)
     */
    loadProfileView: async (route) => {
        console.log('[ViewLoader] Loading profile view:', route);

        // Load scripts if ProfileView not available
        if (!window.ProfileView) {
            await ViewLoader.loadProfileScripts();
        }

        // Get or create container
        const container = ViewLoader.getOrCreateContainer('profile-view-container', '');

        // Switch to this view
        if (window.UI?.switchView) {
            UI.switchView('profile-view-container');
        }

        // Mount view
        if (window.ViewManager && window.ProfileView) {
            await ViewManager.mount(ProfileView, { route, container });
        } else if (window.ProfileView) {
            await ProfileView.mount(container);
        }
    },

    /**
     * Load profile-related scripts
     * In production (Vite bundle), these are already loaded via main.js
     */
    loadProfileScripts: async () => {
        console.log('[ViewLoader] Loading profile scripts...');

        // Check if already bundled (Vite production build)
        if (window.ProfileView && window.Profile && window.turkeyData) {
            console.log('[ViewLoader] Profile scripts already bundled, skipping');
            return;
        }

        const scripts = [
            'modules/constants.js',
            'modules/validators.js',
            'data/cities.js',
            'modules/badges.js',
            'modules/profile.js',
            'views/profile/ProfileView.js',
        ];

        await ViewLoader.loadScripts(scripts);
        console.log('[ViewLoader] Profile scripts loaded');
    },

    // ========================
    // STUDENT DASHBOARD VIEW
    // ========================

    /**
     * Load and mount Student Dashboard View
     */
    loadStudentDashboardView: async () => {
        console.log('[ViewLoader] Loading student dashboard view...');

        // Load scripts if StudentDashboardView not available
        if (!window.StudentDashboardView) {
            await ViewLoader.loadStudentDashboardScripts();
        }

        // Get or create container
        const container = ViewLoader.getOrCreateContainer('student-dashboard-container', '');

        // Switch to this view
        if (window.UI?.switchView) {
            UI.switchView('student-dashboard-container');
        }

        // Mount view
        if (window.ViewManager && window.StudentDashboardView) {
            await ViewManager.mount(StudentDashboardView, { container });
        } else if (window.StudentDashboardView) {
            await StudentDashboardView.mount(container);
        }
    },

    /**
     * Load student dashboard-related scripts
     */
    loadStudentDashboardScripts: async () => {
        console.log('[ViewLoader] Loading student dashboard scripts...');

        const scripts = ['modules/courseLoader.js', 'views/student/StudentDashboardView.js'];

        await ViewLoader.loadScripts(scripts);
        console.log('[ViewLoader] Student dashboard scripts loaded');
    },
};

// Global scope'a ekle (mevcut yapıya uyum için)
window.ViewLoader = ViewLoader;
