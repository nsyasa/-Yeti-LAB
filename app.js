// --- UYGULAMA MOTORU ---

// FAZ 4.1: app.state artık Store ile senkronize
// StateProxy modülü: modules/core/stateProxy.js
// Geriye uyumluluk için app.state kullanılabilir, ama veriler Store'da tutulur
const createStateProxy = () => {
    // StateProxy modülü yüklü ise onu kullan
    if (window.StateProxy?.create) {
        return window.StateProxy.create();
    }

    // Fallback: Modül yüklenmemişse basit obje döndür
    console.warn('[App] StateProxy module not loaded, using fallback');
    return {
        currentCourseKey: null,
        componentInfo: {},
        phases: [],
        projects: [],
    };
};

const app = {
    // State artık Store ile senkronize (geriye uyumluluk için)
    get state() {
        // Lazy init
        if (!this._stateProxy) {
            this._stateProxy = createStateProxy();
        }
        return this._stateProxy;
    },

    currentProject: null,
    chartInstance: null,
    simLoop: null,
    lastFrameTime: 0,
    targetFPS: 30, // Frame limit for performance
    simState: { val1: 0, val2: 0, active: false, timer: 0, angle: 0, dir: 2, lastTick: Date.now() },

    // Performance: Stop simulation loop
    stopSimulation: () => {
        if (app.simLoop) {
            cancelAnimationFrame(app.simLoop);
            app.simLoop = null;
        }
        if (app.chartInstance) {
            app.chartInstance.destroy();
            app.chartInstance = null;
        }
    },

    // --- Progress Tracking (delegated to module) ---
    progress: {
        get data() {
            return window.Progress?.data || {};
        },
        load: () => window.Progress?.load(),
        save: () => window.Progress?.save(),
        toggle: (projectId) => window.Progress?.toggle(projectId),
        isComplete: (projectId) => window.Progress?.isComplete(projectId) || false,
        getCompletionRate: (key) => window.Progress?.getRate(key) || 0,
    },

    init: () => {
        // Global Logout Alias for Component Compatibility
        window.logout = app.logout;

        // data.js dosyasından courseData değişkenini alıyoruz
        if (typeof courseData !== 'undefined') {
            // Init modules
            // app.initTheme(); // ThemeManager handles this automatically in <head>
            if (window.ScrollManager) {
                window.ScrollManager.init();
            }
            app.initAuth(); // Auth durumunu kontrol et, Progress da burada başlatılacak

            // Progress callback'i ayarla (init auth içinde çağrılacak)
            if (window.Progress) {
                window.Progress.onUpdate = (projectId) => {
                    app.renderProgressBar();
                    const btn = document.getElementById('btn-complete-project');
                    if (btn) {
                        const isComplete = app.progress.isComplete(projectId);
                        btn.innerHTML = isComplete ? '✅ Tamamlandı' : 'Dersi Tamamla';
                        btn.className = isComplete
                            ? 'mt-8 w-full py-4 bg-green-500 text-white rounded-xl shadow-lg font-bold text-xl hover:bg-green-600 transition transform hover:scale-105 active:scale-95'
                            : 'mt-8 w-full py-4 bg-gray-200 text-gray-600 rounded-xl shadow-lg font-bold text-xl hover:bg-green-500 hover:text-white transition transform hover:scale-105 active:scale-95';
                    }
                };
            }

            window.Search?.init(app.selectCourse, app.loadProject);
            window.Assistant?.init();

            // Navbar'ı başlat
            if (window.MainLayout) {
                try {
                    window.MainLayout.init();
                } catch (layoutError) {
                    console.error('MainLayout init error:', layoutError);
                }
            }

            // ViewManager başlat (SPA view lifecycle yönetimi)
            if (window.ViewManager) {
                window.ViewManager.init('main-content');
            }

            // Performans İyileştirmesi: Full veriyi (loadAll) yüklemek yerine
            // Sadece kurs listesini (metadata) alıp listeliyoruz.
            // Detaylı veriler kurs seçilince (selectCourse) yüklenecek.
            if (window.CourseLoader?.init) {
                // Optimistic Rendering: Show static manifest immediately to prevent waiting
                app.renderCourseSelection();

                CourseLoader.init()
                    .then(() => {
                        // Restore admin changes from localStorage if available
                        app.restoreFromLocalStorage();

                        // Re-render with dynamic data (e.g. updated counts or titles)
                        app.renderCourseSelection();

                        // ===== FAZ 3: Route Change Event Handler =====
                        // Store'un route:change eventini dinle
                        if (window.Store && Store.on) {
                            Store.on('route:change', (routeInfo) => {
                                app.handleRouteChange(routeInfo);
                            });
                        }

                        // Router Init: URL parametrelerini kontrol et ve yönlendir
                        if (window.Router) {
                            window.Router.init(app);
                        }
                    })
                    .catch((err) => {
                        console.warn('[App] Course init warning (using static manifest):', err);
                        // No need to re-render, static manifest is already visible
                    });
            } else {
                app.renderCourseSelection();
            }
        } else {
            UI.showError('course-list', 'Veri Yüklenemedi', 'window.location.reload()');
        }

        // Performance Check
        Performance.measure('App Init', 'app_start');
    },

    // --- Auth Management ---
    // Refactored to modules/authUI.js (FAZ 4.1 Part 2)
    initAuth: () => {
        if (window.AuthUI) {
            window.AuthUI.init();
        } else {
            console.error('[App] AuthUI module not found');
        }
    },

    updateUserUI: (userInfo) => {
        if (window.AuthUI) {
            window.AuthUI.updateUserUI(userInfo);
        }
    },

    toggleUserMenu: () => {
        if (window.AuthUI) {
            window.AuthUI.toggleUserMenu();
        }
    },

    closeUserMenu: (e) => {
        if (window.AuthUI) {
            window.AuthUI.closeUserMenu(e);
        }
    },

    logout: () => {
        if (window.AuthUI) {
            window.AuthUI.logout();
        }
    },

    // Global alias for logout, useful for direct calls from HTML
    globalLogout: () => app.logout(),

    // Restore course data from localStorage (syncs with admin panel autosave)
    // Security: Validates and sanitizes data to prevent XSS attacks
    restoreFromLocalStorage: () => {
        // Allow all courses defined in manifest + defaults
        const defaultAllowed = ['arduino', 'microbit', 'scratch', 'mblock', 'appinventor'];
        const manifestKeys =
            window.CourseLoader && window.CourseLoader.manifest ? Object.keys(window.CourseLoader.manifest) : [];
        const allowedCourses = [...new Set([...defaultAllowed, ...manifestKeys])];

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
                console.log('[App] Skipping restoreFromLocalStorage on main site (Supabase-First)');
                return;
            }

            const saved = localStorage.getItem('mucit_atolyesi_autosave');
            if (!saved) return;

            // Parse with error handling
            let parsed;
            try {
                parsed = JSON.parse(saved);
            } catch (parseError) {
                console.warn('[App] Invalid JSON in localStorage, clearing corrupted data:', parseError);
                localStorage.removeItem('mucit_atolyesi_autosave');
                return;
            }

            // Validate top-level structure
            if (!parsed || typeof parsed !== 'object') {
                console.warn('[App] Invalid autosave structure, ignoring');
                return;
            }

            if (!parsed.data || typeof parsed.data !== 'object' || Object.keys(parsed.data).length === 0) {
                return;
            }

            // Validate timestamp
            if (
                parsed.timestamp &&
                (typeof parsed.timestamp !== 'number' || parsed.timestamp > Date.now() + 86400000)
            ) {
                console.warn('[App] Invalid autosave timestamp, ignoring');
                return;
            }

            // Process only allowed courses with validation and sanitization
            let restoredCount = 0;
            Object.keys(parsed.data).forEach((key) => {
                // Only accept whitelisted course keys
                if (!allowedCourses.includes(key)) {
                    console.warn(`[App] Unknown course key rejected: ${key}`);
                    return;
                }

                // Only merge if course exists in window.courseData
                if (!window.courseData[key]) {
                    return;
                }

                // Skip if course data is sourced from Supabase (Official Source)
                if (window.courseData[key]._supabaseId) {
                    console.log(`[App] Skipping localStorage restore for ${key} (Supabase source)`);
                    return;
                }

                const courseData = parsed.data[key];

                // Validate course data structure
                if (!Validators.isValidCourseData(courseData)) {
                    console.warn(`[App] Invalid course data structure for: ${key}`);
                    return;
                }

                // Sanitize all string values to prevent XSS
                const sanitizedData = Validators.sanitizeObject(courseData);

                // Merge sanitized data
                window.courseData[key] = sanitizedData;
                restoredCount++;
            });

            if (restoredCount > 0) {
                const date = new Date(parsed.timestamp).toLocaleString();
                console.log(`[App] Course data restored from localStorage (${date}), ${restoredCount} course(s)`);
            }
        } catch (e) {
            console.error('[App] Failed to restore from localStorage:', e);
            // Don't propagate error, just log it
        }
    },

    // Mobile UI Controls
    toggleMobileSearch: () => UI.toggleMobileSearch(),

    toggleSidebar: () => UI.toggleSidebar(),

    // --- Theme Management ---
    // ThemeManager modülünü kullan (modules/themeManager.js)
    // Bu fonksiyonlar sadece geriye uyumluluk için burada, ThemeManager'a delege eder
    initTheme: () => {
        // ThemeManager otomatik init oluyor, bu fonksiyon artık gereksiz
        // Ama çağrıldığında hata vermesin diye bırakıldı
    },

    setTheme: (mode) => {
        if (window.ThemeManager) {
            window.ThemeManager.setTheme(mode);
        }
    },

    getCurrentTheme: () => {
        return window.ThemeManager ? window.ThemeManager.getCurrentTheme() : 'light';
    },

    toggleLanguage: () => {
        const current = Settings.get('language') || 'tr';
        const next = current === 'tr' ? 'en' : 'tr';
        Settings.set('language', next);
        window.location.reload();
    },

    // ===== FAZ 3: Route Change Handler =====
    // Hash route değişikliklerini mevcut view'lara bağlar
    handleRouteChange: async (routeInfo) => {
        const { route, params } = routeInfo;
        console.log(`[App] Route change: ${route}`, params);

        // Route tipini belirle
        const isTeacherRoute = route === 'teacher' || route === 'teacher-classrooms' || route === 'teacher-students';
        const isAdminRoute =
            route === 'admin' || route === 'admin-projects' || route === 'admin-phases' || route === 'admin-components';
        const isProfileRoute = route === 'profile' || route === 'profile-wizard';
        const isStudentDashboardRoute = route === 'student-dashboard';
        const _isHomeRoute = route === 'home' || route === 'course' || route === 'project';

        // ===== ViewManager ile akıllı unmount =====
        // Sadece farklı bir view grubuna geçerken unmount et
        // Admin route'ları arasında geçişte yeniden mount ETME!
        const currentView = window.ViewManager?.getCurrentView?.();

        // Sadece view grup değişimlerinde unmount
        if (currentView) {
            const isLeavingAdmin = currentView === window.AdminView && !isAdminRoute;
            const isLeavingTeacher = currentView === window.TeacherView && !isTeacherRoute;
            const isLeavingProfile = currentView === window.ProfileView && !isProfileRoute;
            const isLeavingStudentDashboard = currentView === window.StudentDashboardView && !isStudentDashboardRoute;

            if (isLeavingAdmin || isLeavingTeacher || isLeavingProfile || isLeavingStudentDashboard) {
                console.log('[App] Leaving current view, unmounting...');
                ViewManager.unmountCurrent();
            }
        }

        // Teacher view'dan çıkış kontrolü (fallback)
        if (!isTeacherRoute && window.TeacherView?.isLoaded) {
            console.log('[App] Leaving teacher view, unmounting...');
            TeacherView.unmount();
        }

        // Admin view'dan çıkış kontrolü (fallback)
        if (!isAdminRoute && window.AdminView?.isLoaded) {
            console.log('[App] Leaving admin view, unmounting...');
            AdminView.unmount();
        }

        // Profile view'dan çıkış kontrolü (fallback)
        if (!isProfileRoute && window.ProfileView?.isLoaded) {
            console.log('[App] Leaving profile view, unmounting...');
            ProfileView.unmount();
        }

        // Student Dashboard view'dan çıkış kontrolü (fallback)
        if (!isStudentDashboardRoute && window.StudentDashboardView?.isLoaded) {
            console.log('[App] Leaving student dashboard view, unmounting...');
            StudentDashboardView.unmount();
        }

        switch (route) {
            case 'home':
                // Ana sayfa - kurs seçim ekranı
                // Refresh course list from Supabase (in case admin made changes)
                if (window.CourseLoader?.init) {
                    await CourseLoader.init();
                }
                app.renderCourseSelection(false); // updateHistory: false (URL zaten hash'te)
                break;

            case 'course':
                // Kurs dashboard
                if (params.key) {
                    // Kurs zaten yüklüyse tekrar yükleme
                    if (app.state.currentCourseKey !== params.key) {
                        await app.selectCourse(params.key, null, false);
                    } else {
                        // Aynı kurs, sadece dashboard göster
                        UI.switchView('dashboard-view');
                    }
                }
                break;

            case 'project':
                // Proje detay
                if (params.key && params.id) {
                    // Önce kurs yüklü mü kontrol et
                    if (app.state.currentCourseKey !== params.key) {
                        await app.selectCourse(params.key, null, false);
                    }
                    // Sonra projeyi aç
                    const projectId = parseInt(params.id);
                    if (!isNaN(projectId)) {
                        app.loadProject(projectId, false);
                    }
                }
                break;

            // ===== TEACHER PANEL ROUTES (SPA) =====
            case 'teacher':
            case 'teacher-classrooms':
            case 'teacher-students':
                await app.loadTeacherView(route);
                break;

            // ===== ADMIN PANEL ROUTES (SPA) =====
            case 'admin':
            case 'admin-projects':
            case 'admin-phases':
            case 'admin-components':
                await app.loadAdminView(route);
                break;

            // ===== PROFILE ROUTES (SPA) =====
            case 'profile':
            case 'profile-wizard':
                await app.loadProfileView(route);
                break;

            // ===== STUDENT DASHBOARD ROUTE (SPA) =====
            case 'student-dashboard':
                await app.loadStudentDashboardView();
                break;

            default:
                console.warn(`[App] Unknown route: ${route}`);
                app.renderCourseSelection(false);
        }
    },

    // ===== Admin View Loader (SPA) =====
    loadAdminView: async (route) => {
        console.log('[App] Loading admin view:', route);

        // AdminView yüklü değilse, script'leri yükle
        if (!window.AdminView) {
            await app.loadAdminScripts();
        }

        // Container al veya oluştur
        let container = document.getElementById('admin-view-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'admin-view-container';
            container.className = 'hidden';

            // Ana içerik alanına ekle
            const mainContent =
                document.getElementById('main-content') || document.querySelector('main') || document.body;
            mainContent.appendChild(container);
        }

        // Visible yap (Diğer viewları gizle)
        UI.switchView('admin-view-container');

        // AdminView zaten yüklü ve mount edilmişse, sadece section değiştir
        if (window.AdminView?.isLoaded) {
            console.log('[App] AdminView already loaded, just switching section');
            // Handle sub-routes
            if (route === 'admin-projects' || route === 'admin') {
                AdminView.showSection('projects');
            } else if (route === 'admin-phases') {
                AdminView.showSection('phases');
            } else if (route === 'admin-components') {
                AdminView.showSection('components');
            }
            return;
        }

        // ViewManager ile mount et (sadece ilk kez)
        let mounted = false;
        if (window.ViewManager && window.AdminView) {
            mounted = await ViewManager.mount(AdminView, { route, container });
        } else {
            // Fallback: doğrudan mount
            mounted = await AdminView.mount(container);
        }

        if (mounted) {
            // Handle sub-routes
            if (route === 'admin-projects' || route === 'admin') {
                AdminView.showSection('projects');
            } else if (route === 'admin-phases') {
                AdminView.showSection('phases');
            } else if (route === 'admin-components') {
                AdminView.showSection('components');
            }
        }
    },

    // Admin script'lerini lazy load et
    loadAdminScripts: async () => {
        console.log('[App] Loading admin scripts...');

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

        for (const src of scripts) {
            await app.loadScript(src);
        }

        console.log('[App] Admin scripts loaded');
    },

    // ===== Teacher View Loader (SPA) =====
    loadTeacherView: async (route) => {
        console.log('[App] Loading teacher view:', route);

        // TeacherView yüklü değilse, script'leri yükle
        if (!window.TeacherView) {
            await app.loadTeacherScripts();
        }

        // Container al veya oluştur
        let container = document.getElementById('teacher-view-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'teacher-view-container';
            container.className = 'hidden';

            // Ana içerik alanına ekle
            const mainContent =
                document.getElementById('main-content') || document.querySelector('main') || document.body;
            mainContent.appendChild(container);
        }

        // Visible yap (Diğer viewları gizle)
        UI.switchView('teacher-view-container');

        // TeacherView zaten yüklü ve mount edilmişse, sadece section değiştir
        if (window.TeacherView?.isLoaded) {
            console.log('[App] TeacherView already loaded, just switching section');
            if (route === 'teacher-classrooms') {
                TeacherView.showSection('classrooms');
            } else if (route === 'teacher-students') {
                TeacherView.showSection('students');
            }
            return;
        }

        // ViewManager ile mount et (sadece ilk kez)
        let mounted = false;
        if (window.ViewManager && window.TeacherView) {
            mounted = await ViewManager.mount(TeacherView, { route, container });
        } else {
            // Fallback: doğrudan mount
            mounted = await TeacherView.mount(container);
        }

        if (mounted) {
            // Handle sub-routes
            if (route === 'teacher-classrooms') {
                TeacherView.showSection('classrooms');
            } else if (route === 'teacher-students') {
                TeacherView.showSection('students');
            }
        }
    },

    // Teacher script'lerini lazy load et
    loadTeacherScripts: async () => {
        console.log('[App] Loading teacher scripts...');

        const scripts = [
            'views/teacher/TeacherLayout.js',
            'views/teacher/sections/DashboardSection.js',
            'views/teacher/sections/ClassroomsSection.js',
            'views/teacher/sections/StudentsSection.js',
            'views/teacher/modals/TeacherModals.js',
            'views/teacher/TeacherView.js',
        ];

        for (const src of scripts) {
            await app.loadScript(src);
        }

        console.log('[App] Teacher scripts loaded');
    },

    // ===== Profile View Loader (SPA) =====
    loadProfileView: async (route) => {
        console.log('[App] Loading profile view:', route);

        // ProfileView yüklü değilse, script'leri yükle
        if (!window.ProfileView) {
            await app.loadProfileScripts();
        }

        // Container al veya oluştur
        let container = document.getElementById('profile-view-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'profile-view-container';
            container.className = '';

            // Ana içerik alanına ekle
            const mainContent =
                document.getElementById('main-content') || document.querySelector('main') || document.body;
            mainContent.appendChild(container);
        }

        // Hide main layout elements
        UI.switchView('profile-view-container');

        // ViewManager ile mount et
        if (window.ViewManager && window.ProfileView) {
            await ViewManager.mount(ProfileView, { route, container });
        } else {
            // Fallback: doğrudan mount
            await ProfileView.mount(container);
        }
    },

    // Profile script'lerini lazy load et
    loadProfileScripts: async () => {
        console.log('[App] Loading profile scripts...');

        const scripts = [
            'modules/constants.js',
            'modules/validators.js',
            'data/cities.js',
            'modules/badges.js',
            'modules/profile.js',
            'views/profile/ProfileView.js',
        ];

        for (const src of scripts) {
            await app.loadScript(src);
        }

        console.log('[App] Profile scripts loaded');
    },

    // ===== Student Dashboard View Loader (SPA) =====
    loadStudentDashboardView: async () => {
        console.log('[App] Loading student dashboard view...');

        // StudentDashboardView yüklü değilse, script'leri yükle
        if (!window.StudentDashboardView) {
            await app.loadStudentDashboardScripts();
        }

        // Container al veya oluştur
        let container = document.getElementById('student-dashboard-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'student-dashboard-container';
            container.className = '';

            // Ana içerik alanına ekle
            const mainContent =
                document.getElementById('main-content') || document.querySelector('main') || document.body;
            mainContent.appendChild(container);
        }

        // Hide main layout elements
        UI.switchView('student-dashboard-container');

        // ViewManager ile mount et
        if (window.ViewManager && window.StudentDashboardView) {
            await ViewManager.mount(StudentDashboardView, { container });
        } else {
            // Fallback: doğrudan mount
            await StudentDashboardView.mount(container);
        }
    },

    // Student Dashboard script'lerini lazy load et
    loadStudentDashboardScripts: async () => {
        console.log('[App] Loading student dashboard scripts...');

        const scripts = ['modules/courseLoader.js', 'views/student/StudentDashboardView.js'];

        for (const src of scripts) {
            await app.loadScript(src);
        }

        console.log('[App] Student dashboard scripts loaded');
    },

    // Script loader helper
    // Zaten yüklü modülleri tekrar yüklemeyi önler
    _loadedScripts: new Set(),

    loadScript: (src) => {
        return new Promise((resolve, reject) => {
            // 1. Daha önce yüklediğimizi kontrol et
            if (app._loadedScripts.has(src)) {
                resolve();
                return;
            }

            // 2. DOM'da script tag var mı kontrol et
            if (document.querySelector(`script[src="${src}"]`)) {
                app._loadedScripts.add(src);
                resolve();
                return;
            }

            // 3. Global modül zaten tanımlı mı kontrol et
            // Bu, Vite dev server'ın inline yüklediği modülleri yakalar
            const moduleChecks = {
                'modules/courseLoader.js': () => typeof window.CourseLoader !== 'undefined',
                'config/tabs.js': () => typeof window.TabConfig !== 'undefined',
                'modules/themes.js': () => typeof window.applyTheme !== 'undefined',
                'data/base.js': () => typeof window.courseData !== 'undefined',
                'data/quiz.js': () => typeof window.quizQuestions !== 'undefined',
            };

            const checkFn = moduleChecks[src];
            if (checkFn && checkFn()) {
                app._loadedScripts.add(src);
                resolve();
                return;
            }

            // 4. Script'i yükle
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                app._loadedScripts.add(src);
                console.log(`[App] Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`[App] Failed to load: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.body.appendChild(script);
        });
    },

    renderCourseSelection: (updateHistory = true) => {
        const manifest = window.CourseLoader?.getManifest() || {};
        // Update language button text
        const langText = document.getElementById('lang-text');
        if (langText) langText.innerText = (Settings.get('language') || 'tr').toUpperCase();

        UI.renderCourseSelection(manifest);
        app.stopSimulation();

        // URL'yi temizle (Ana sayfa)
        if (window.Router && updateHistory) window.Router.updateUrl(null, null);
    },

    selectCourse: async (key, event, updateHistory = true) => {
        // Prevent double-click
        const actionId = `select-course-${key}`;
        if (UI.isLoading(actionId)) return;
        UI.setActionLoading(actionId, true);

        // Find and add loading state to clicked card
        let clickedCard = null;
        if (event?.target) {
            clickedCard = event.target.closest('.course-card');
        } else {
            // Fallback: find by key
            clickedCard = document.querySelector(`[onclick*="selectCourse('${key}')"]`);
        }

        if (clickedCard) {
            UI.setCardLoading(clickedCard, true);
        }

        try {
            // Lazy load the course data
            await window.CourseLoader?.loadCourse(key);

            app.state.currentCourseKey = key;
            if (window._appState) window._appState.currentCourseKey = key;

            const course = courseData[key];
            if (!course) {
                throw new Error('Course data not found after loading');
            }

            // Merkezi tema uygulaması
            if (window.applyTheme) {
                window.applyTheme(key);
            }

            // Verileri yükle - app.state içine
            app.state.componentInfo = course.data.componentInfo || {};
            app.state.phases = course.data.phases || [];
            app.state.projects = course.data.projects || [];

            // Dashboard başlıklarını güncelle
            document.getElementById('course-title').innerText = course.title;
            document.getElementById('course-desc').innerText = course.description;

            app.renderDashboard();
            app.renderSidebar();
            app.renderProgressBar();

            // URL güncelle
            if (window.Router && updateHistory) window.Router.updateUrl(key, null);

            // Store Update (Faz 2: Adım 4)
            if (window.Store) {
                window.Store.setCurrentCourse(course, key);
            }
        } catch (error) {
            console.error('[App] Failed to load course:', error);
            Toast?.errorWithRetry('Kurs yüklenemedi!', () => app.selectCourse(key));
            UI.showError('course-list', 'Kurs yüklenemedi!', 'app.renderCourseSelection()');
        } finally {
            // Clear loading state
            UI.setActionLoading(actionId, false);
            if (clickedCard) {
                UI.setCardLoading(clickedCard, false);
            }
        }
    },

    renderProgressBar: () => {
        const { currentCourseKey } = app.state;
        const rate = app.progress.getCompletionRate(currentCourseKey);
        UI.renderProgressBar(rate);
    },

    renderDashboard: () => {
        const { phases, projects } = app.state;
        UI.renderDashboard(phases, projects, app.progress);
        app.stopSimulation();

        // URL güncelle (Sadece proje seçimini kaldır)
        if (window.Router && app.state.currentCourseKey) {
            window.Router.updateUrl(app.state.currentCourseKey, null);
        }
    },

    loadProject: (id, updateHistory = true) => {
        // Prevent double-click
        const actionId = `load-project-${id}`;
        if (UI.isLoading(actionId)) return;
        UI.setActionLoading(actionId, true);

        const { projects } = app.state;
        const p = projects.find((prj) => prj.id === id);

        if (!p) {
            console.error(`Project not found: ${id}`);
            alert('Ders bulunamadı!');
            app.renderDashboard();
            UI.setActionLoading(actionId, false);
            return;
        }

        app.currentProject = p;
        // Store Update (Faz 2: Adım 4)
        if (window.Store) {
            window.Store.setState({ activeProject: p });
        }
        if (UI.switchView) {
            UI.switchView('project-view');
        } else {
            // Fallback if UI.switchView is missing
            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('project-view').classList.remove('hidden');
        }
        document.getElementById('project-tag').innerText = p.phase === 0 ? 'Hazırlık' : `Ders ${p.id}`;
        document.getElementById('project-title').innerText = p.title;
        document.getElementById('project-desc').innerText = p.desc;
        document.getElementById('project-icon').innerText = p.icon;

        // Reset UI
        ['simCanvas', 'interactive-area', 'interactive-info', 'chart-card'].forEach((elementId) =>
            document.getElementById(elementId).classList.add('hidden')
        );
        document.getElementById('simControls').innerHTML = '';

        // Artık Explorer da bir simülasyon (Canvas tabanlı)
        document.getElementById('sim-container').classList.remove('hidden');
        document.getElementById('simCanvas').classList.remove('hidden');
        if (p.hasGraph) document.getElementById('chart-card').classList.remove('hidden');
        app.setupSimulation(p.simType);

        // Show custom hotspots in Virtual Lab if enabled
        if (p.showHotspotsInLab && p.hotspots && p.hotspots.length > 0) {
            UI.setupCustomHotspots(p);
        }

        app.renderTabs(p);
        window.scrollTo(0, 0);

        // URL güncelle
        if (window.Router && updateHistory) window.Router.updateUrl(app.state.currentCourseKey, id);

        // Clear loading state after a short delay
        setTimeout(() => UI.setActionLoading(actionId, false), 100);
    },

    setupExplorer: (type) => {
        // --- İNTERAKTİF FOTOĞRAF ALANLARI ---
        if (type === 'explorer_board') {
            UI.setupInteractiveArea(`
                <div class="relative w-full h-full bg-gray-100 flex items-center justify-center">
                    <img src="img/arduino_tanitim.jpg" class="max-h-full max-w-full object-contain" onerror="this.parentElement.innerHTML='<div class=\\'text-center p-4\\'>Görsel Yok: img/arduino_tanitim.jpg<br>Arduino fotoğrafını bu isimle ekleyin.</div>'">
                    <div class="hotspot" style="top:20%; left:10%;" title="USB Port" onmouseover="UI.showInfo('USB Portu: Kod yükler ve güç verir.')"></div>
                    <div class="hotspot" style="top:75%; left:10%;" title="Güç" onmouseover="UI.showInfo('Güç Girişi: Pil veya adaptör takılır.')"></div>
                    <div class="hotspot" style="top:10%; right:20%;" title="Dijital" onmouseover="UI.showInfo('Dijital Pinler: LED yakmak için kullanılır.')"></div>
                    <div class="hotspot" style="bottom:10%; right:30%;" title="Analog" onmouseover="UI.showInfo('Analog Pinler: Sensör okumak için kullanılır.')"></div>
                    <div class="hotspot" style="top:60%; left:45%;" title="Çip" onmouseover="UI.showInfo('Mikrodenetleyici: Arduino\\'nun beyni.')"></div>
                </div>`);
        } else {
            UI.setupInteractiveArea(`
                <div class="relative w-full h-full bg-gray-800 flex items-center justify-center">
                    <img src="img/ide_tanitim.jpg" class="max-h-full max-w-full object-contain" onerror="this.parentElement.innerHTML='<div class=\\'text-center p-4 text-white\\'>Görsel Yok: img/ide_tanitim.jpg<br>IDE ekran görüntüsünü ekleyin.</div>'">
                    <div class="hotspot" style="top:5%; left:5%;" title="Kontrol" onmouseover="UI.showInfo('Kontrol Et: Koddaki hataları bulur.')"></div>
                    <div class="hotspot" style="top:5%; left:12%;" title="Yükle" onmouseover="UI.showInfo('Yükle: Kodu karta gönderir.')"></div>
                    <div class="hotspot" style="top:5%; right:5%;" title="Seri Port" onmouseover="UI.showInfo('Seri Port Ekranı: Mesajları okur.')"></div>
                </div>`);
        }
    },

    showInfo: (msg) => UI.showInfo(msg),

    openImageModal: (src, caption) => UI.openImageModal(src, caption),

    closeImageModal: () => UI.closeImageModal(),

    // Custom Hotspots Display (Moved to UI)
    setupCustomHotspots: (project) => UI.setupCustomHotspots(project),

    showHotspotInfo: (name, desc) => UI.showInfo(desc, name),

    hideHotspotInfo: () => UI.showInfo('Numaralı noktaların üzerine gelerek açıklamaları görün.', '🔍 Keşfet'),

    getPracticalTip: (project) => {
        const tips = window.tipsData || {};
        if (!tips.General) return { title: 'İpucu', text: 'Bol bol pratik yap!', icon: '✨' };

        let match = null;

        // 1. Materyallere göre ara
        if (project.materials) {
            for (const m of project.materials) {
                // Materyal ismi içinde anahtar kelime var mı? (Örn: "Kırmızı LED" -> "LED")
                for (const key in tips) {
                    if (key !== 'General' && m.includes(key)) {
                        match = tips[key];
                        break;
                    }
                }
                if (match) break;
            }
        }

        // 2. Bulamazsan Genk ipucu ver
        if (!match) {
            const generalTips = tips.General;
            // Rastgele bir ipucu seç (Her açılışta değişir)
            // Sabit olması istersen: project.id % generalTips.length kullanılabilir.
            const index = project.id % generalTips.length;
            match = generalTips[index];
        }

        return match;
    },

    checkAnswer: (qIndex, optIndex, trueIndex, btn) => {
        const parent = document.getElementById(`q-${qIndex}`);
        const feedback = parent.querySelector('.quiz-feedback');
        const buttons = parent.querySelectorAll('button');

        // Disable all buttons in this question
        buttons.forEach((b) => {
            b.onclick = null;
            b.classList.add('cursor-default', 'opacity-70');
            b.classList.remove('hover:bg-gray-100');
        });

        feedback.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');

        if (optIndex === trueIndex) {
            // Correct
            btn.classList.add('bg-green-100', 'border-green-300');
            btn.querySelector('span').classList.add('bg-green-500', 'text-white', 'border-green-500');
            feedback.innerHTML = '🎉 Doğru Cevap! Harikasın.';
            feedback.classList.add('bg-green-100', 'text-green-700');
            // Confetti effect can be added here
        } else {
            // Wrong
            btn.classList.add('bg-red-100', 'border-red-300');
            btn.querySelector('span').classList.add('bg-red-500', 'text-white', 'border-red-500');

            // Highlight correct answer
            const correctBtn = buttons[trueIndex];
            correctBtn.classList.add('ring-2', 'ring-green-400', 'bg-green-50');

            feedback.innerHTML = '😔 Yanlış Cevap. Doğru cevap işaretlendi.';
            feedback.classList.add('bg-red-100', 'text-red-700');
        }
    },

    renderTabs: (project) => {
        UI.renderTabs(project, app.state.componentInfo, app.state.currentCourseKey, app.progress);
    },

    setupSimulation: (type) => {
        const cvs = document.getElementById('simCanvas');
        const ctx = cvs.getContext('2d');
        cvs.width = 500;
        cvs.height = 350;

        // Get Current Theme Color from CSS
        const themeColor =
            getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#00979C';
        app.simState.themeColor = themeColor;

        const chartCtx = document.getElementById('dataChart').getContext('2d');
        if (app.chartInstance) app.chartInstance.destroy();
        if (app.currentProject.hasGraph) {
            app.chartInstance = new Chart(chartCtx, {
                type: 'line',
                data: {
                    labels: Array(20).fill(''),
                    datasets: [{ data: Array(20).fill(0), borderColor: themeColor, tension: 0.3 }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { display: true } },
                },
            });
        }

        // Helper functions for Simulations
        app.setControls = (html) => (document.getElementById('simControls').innerHTML = html);

        // Modüler Yapı Çağrısı
        if (window.Simulations && window.Simulations[type] && window.Simulations[type].setup) {
            window.Simulations[type].setup(app);
        } else {
            app.setControls('<div class="text-red-500 text-xs">Simülasyon Bulunamadı: ' + type + '</div>');
        }

        app.simLoop = requestAnimationFrame(() => app.runSimLoop(ctx, type));
    },

    runSimLoop: (ctx, type) => {
        const now = Date.now();
        const frameInterval = 1000 / app.targetFPS;

        // Throttle to target FPS
        if (now - app.lastFrameTime < frameInterval) {
            app.simLoop = requestAnimationFrame(() => app.runSimLoop(ctx, type));
            return;
        }
        app.lastFrameTime = now;

        ctx.clearRect(0, 0, 500, 350);
        let val = 0;

        // Modüler Çizim Çağrısı
        if (window.Simulations && window.Simulations[type] && window.Simulations[type].draw) {
            val = window.Simulations[type].draw(ctx, app, now);
        }

        if (app.currentProject && app.currentProject.hasGraph && app.chartInstance && val !== undefined) {
            const d = app.chartInstance.data.datasets[0].data;
            d.shift();
            d.push(val);
            app.chartInstance.update('none');
        }
        app.simLoop = requestAnimationFrame(() => app.runSimLoop(ctx, type));
    },

    toggleSidebar: () => UI.toggleSidebar(),

    // Search is now handled by modules/search.js

    renderSidebar: () => {
        const { phases, projects } = app.state;
        const currentId = app.currentProject ? app.currentProject.id : null;
        UI.renderSidebar(phases, projects, currentId);
    },
};

window.onload = app.init;
