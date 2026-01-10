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
    /**
     * Load admin-related scripts
     * Uses dynamic import for true code splitting in Vite
     */
    loadAdminScripts: async () => {
        console.log('[ViewLoader] Loading admin scripts...');

        // Check if already bundled (Vite production build)
        if (window.AdminView && window.AdminLayout && window.ProjectManager) {
            console.log('[ViewLoader] Admin scripts already bundled, skipping');
            return;
        }

        try {
            // Dynamic imports trigger Vite to create separate chunks
            // Core dependencies
            await import('../../constants/elements.js');
            await import('../../data/base.js');
            await import('../../modules/courseLoader.js');
            await import('../../data/quiz.js');
            await import('../../modules/themes.js');
            await import('../../config/tabs.js');

            // Admin modules
            await import('../../modules/admin/state.js'); // Ensure State is loaded first!
            await import('../../modules/admin/ui.js');
            await import('../../modules/admin/backup.js'); // NEW: Backup Service
            await import('../../modules/admin/projectEditor.js'); // NEW: Project Editor
            await import('../../modules/admin/storage.js');
            await import('../../modules/admin/courses.js');
            await import('../../modules/admin/phases.js');
            await import('../../modules/admin/components.js');
            await import('../../modules/admin/projects.js');
            await import('../../modules/admin/settings.js');
            await import('../../modules/admin/supabase-sync.js');
            await import('../../modules/admin/hotspots.js');
            await import('../../modules/admin/images.js');
            await import('../../modules/admin/quizzes.js');
            await import('../../modules/admin.js');

            // View components
            await import('../../views/admin/AdminLayout.js');
            await import('../../views/admin/sections/ProjectsSection.js');
            await import('../../views/admin/sections/PhasesSection.js');
            await import('../../views/admin/sections/ComponentsSection.js');
            await import('../../views/admin/modals/AdminModals.js');
            await import('../../views/admin/AdminView.js');

            console.log('[ViewLoader] Admin scripts loaded via dynamic import');
        } catch (error) {
            console.error('[ViewLoader] Failed to load admin scripts:', error);
            throw error;
        }
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
    /**
     * Load teacher-related scripts
     * Uses dynamic import for true code splitting in Vite
     */
    loadTeacherScripts: async () => {
        console.log('[ViewLoader] Loading teacher scripts...');

        // Check if already bundled (Vite production build)
        if (window.TeacherView && window.TeacherLayout && window.TeacherManager) {
            console.log('[ViewLoader] Teacher scripts already bundled, skipping');
            return;
        }

        try {
            // Modules
            await import('../../modules/teacher/classrooms.js');
            await import('../../modules/teacher/students.js');
            await import('../../modules/teacher/analytics.js');
            await import('../../modules/teacher-manager.js');

            // View Components
            await import('../../views/teacher/TeacherLayout.js');
            await import('../../views/teacher/sections/DashboardSection.js');
            await import('../../views/teacher/sections/ClassroomsSection.js');
            await import('../../views/teacher/sections/StudentsSection.js');
            await import('../../views/teacher/modals/TeacherModals.js');
            await import('../../views/teacher/TeacherView.js');

            console.log('[ViewLoader] Teacher scripts loaded via dynamic import');
        } catch (error) {
            console.error('[ViewLoader] Failed to load teacher scripts:', error);
            throw error;
        }
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
    /**
     * Load profile-related scripts
     * Uses dynamic import for true code splitting in Vite
     */
    loadProfileScripts: async () => {
        console.log('[ViewLoader] Loading profile scripts...');

        // Check if already bundled (Vite production build)
        if (window.ProfileView && window.Profile && window.turkeyData) {
            console.log('[ViewLoader] Profile scripts already bundled, skipping');
            return;
        }

        try {
            await import('../../modules/constants.js');
            await import('../../modules/validators.js');
            await import('../../data/cities.js');
            await import('../../modules/badges.js');
            await import('../../modules/profile.js');
            await import('../../views/profile/ProfileView.js');

            console.log('[ViewLoader] Profile scripts loaded via dynamic import');
        } catch (error) {
            console.error('[ViewLoader] Failed to load profile scripts:', error);
            throw error;
        }
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
    /**
     * Load student dashboard-related scripts
     * Uses dynamic import for true code splitting in Vite
     */
    loadStudentDashboardScripts: async () => {
        console.log('[ViewLoader] Loading student dashboard scripts...');

        try {
            await import('../../modules/courseLoader.js');
            await import('../../views/student/StudentDashboardView.js');

            console.log('[ViewLoader] Student dashboard scripts loaded via dynamic import');
        } catch (error) {
            console.error('[ViewLoader] Failed to load student dashboard scripts:', error);
            throw error;
        }
    },
};

// Global scope'a ekle (mevcut yapıya uyum için)
window.ViewLoader = ViewLoader;
