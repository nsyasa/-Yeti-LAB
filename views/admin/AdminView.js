/**
 * AdminView - Ana admin panel view container
 * SPA entegrasyonu için mount/unmount lifecycle metodları
 */
const AdminView = {
    isLoaded: false,
    currentSection: 'projects',
    scriptsLoaded: false,

    /**
     * Template - Ana layout
     */
    template() {
        return `
            <div id="admin-view" class="bg-gray-100 text-gray-800 min-h-screen flex flex-col">
                <!-- Top Bar -->
                <nav class="bg-theme text-white shadow-md sticky top-0 z-50 transition-colors duration-500">
                    ${AdminLayout.renderHeader()}
                </nav>

                <!-- Main Content -->
                <div class="max-w-7xl mx-auto w-full px-4 py-8 flex-grow">
                    <!-- Loading State -->
                    <div id="adminLoadingState" class="flex items-center justify-center h-64">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-theme mx-auto mb-4"></div>
                            <p class="text-gray-500">Yükleniyor...</p>
                        </div>
                    </div>

                    <!-- Course Settings Panel -->
                    <div id="adminCourseSettings" class="hidden">
                        ${AdminLayout.renderCourseSettings()}
                    </div>

                    <!-- Projects Section -->
                    <section id="adminProjectsSection" class="hidden">
                        <div id="adminProjectsContent"></div>
                    </section>

                    <!-- Phases Section -->
                    <section id="adminPhasesSection" class="hidden">
                        <div id="adminPhasesContent"></div>
                    </section>

                    <!-- Components Section -->
                    <section id="adminComponentsSection" class="hidden">
                        <div id="adminComponentsContent"></div>
                    </section>
                </div>

                <!-- Modals -->
                ${AdminModals.renderAll()}
            </div>
        `;
    },

    /**
     * Mount - View DOM'a eklendiğinde
     */
    async mount(container) {
        console.log('[AdminView] Mounting...');

        // Auth Guard
        if (!(await this.checkAuth())) {
            return false;
        }

        // Load dependencies first
        if (!this.scriptsLoaded) {
            await this.loadDependencies();
            this.scriptsLoaded = true;
        }

        // Render template
        container.innerHTML = this.template();
        container.classList.remove('hidden');

        // Hide main-header and main-footer for admin view (has its own layout)
        this.hideMainLayout();

        // Initialize admin
        await this.initializeAdmin();

        // Parse initial section from URL hash
        // #/admin → projects, #/admin/phases → phases
        const initialSection = this.parseInitialSection();
        this.showSection(initialSection, false); // false = don't update URL on initial load

        this.isLoaded = true;
        console.log('[AdminView] Mounted successfully');
        return true;
    },

    /**
     * Unmount - View DOM'dan kaldırıldığında
     */
    unmount() {
        console.log('[AdminView] Unmounting...');

        // Show main layout again
        this.showMainLayout();

        // Remove admin view from DOM
        const adminView = document.getElementById('admin-view');
        if (adminView) {
            adminView.remove();
        }

        // Hide container
        const container = document.getElementById('admin-view-container');
        if (container) {
            container.innerHTML = '';
            container.classList.add('hidden');
        }

        // Clear CourseLoader cache so home page fetches fresh data
        if (window.CourseLoader) {
            CourseLoader.loadedCourses.clear();
            console.log('[AdminView] CourseLoader cache cleared');
        }

        this.isLoaded = false;
        console.log('[AdminView] Unmounted');
    },

    /**
     * Auth kontrolü - Sadece admin
     */
    async checkAuth() {
        // Wait for Auth to be ready
        if (typeof Auth === 'undefined') {
            console.warn('[AdminView] Auth module not found, waiting...');
            // Wait a bit and retry
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (typeof Auth === 'undefined') {
                console.error('[AdminView] Auth module still not found');
                Router.redirectTo('auth.html');
                return false;
            }
        }

        // Make sure Auth session is checked
        if (!Auth.currentUser) {
            console.log('[AdminView] No current user, checking session...');
            await Auth.checkSession();
        }

        // Still no user? Redirect to login
        if (!Auth.currentUser) {
            console.warn('[AdminView] No user after session check, redirecting to auth...');
            Router.redirectTo('auth.html');
            return false;
        }

        // Check if admin
        const isAdmin = Auth.isAdmin();
        console.log('[AdminView] User role:', Auth.userRole, 'isAdmin:', isAdmin);

        if (!isAdmin) {
            if (window.Toast) Toast.error('Bu sayfa sadece yöneticiler içindir');
            setTimeout(() => Router.navigate('/'), 1500);
            return false;
        }

        return true;
    },

    /**
     * Admin modül bağımlılıklarını yükle
     */
    async loadDependencies() {
        console.log('[AdminView] Loading dependencies...');

        const scripts = [
            // Core admin modules (already exist)
            'modules/admin/courses.js',
            'modules/admin/projects.js',
            'modules/admin/phases.js',
            'modules/admin/components.js',
            'modules/admin/settings.js',
            'modules/admin/storage.js',
            'modules/admin/supabase-sync.js',
            'modules/admin/hotspots.js',
            'modules/admin/images.js',
            'modules/admin/quizzes.js',
            // View components
            'views/admin/AdminLayout.js',
            'views/admin/modals/AdminModals.js',
        ];

        for (const src of scripts) {
            await this.loadScript(src);
        }

        console.log('[AdminView] Dependencies loaded');
    },

    /**
     * Script yükle
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Already loaded?
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`[AdminView] Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`[AdminView] Failed to load: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.body.appendChild(script);
        });
    },

    /**
     * Admin panel'i başlat
     */
    async initializeAdmin() {
        console.log('[AdminView] Initializing admin...');

        // Initialize courseData container (for fallback compatibility)
        window.courseData = window.courseData || {};

        // Initialize admin module
        if (window.admin) {
            try {
                await admin.init();
            } catch (err) {
                console.error('[AdminView] Error initializing admin:', err);
                if (window.Toast) Toast.error('Yükleme hatası. Lütfen sayfayı yenileyin.');
            }
        }

        // Update user info
        AdminLayout.updateUserInfo();

        // Hide loading, show course settings
        const loading = document.getElementById('adminLoadingState');
        if (loading) loading.classList.add('hidden');

        const courseSettings = document.getElementById('adminCourseSettings');
        if (courseSettings) courseSettings.classList.remove('hidden');

        // Apply theme
        if (window.ThemeManager) ThemeManager.load();
    },

    /**
     * URL'den başlangıç section'ını parse et
     */
    parseInitialSection() {
        const hash = window.location.hash;
        // #/admin/phases → phases
        // #/admin/components → components
        // #/admin → projects (default)
        if (hash.includes('/admin/')) {
            const parts = hash.split('/admin/');
            if (parts[1]) {
                const section = parts[1].split('/')[0]; // İlk segment
                if (['phases', 'components', 'projects'].includes(section)) {
                    return section;
                }
            }
        }
        return 'projects';
    },

    /**
     * Section göster
     * @param {string} section - Gösterilecek section (projects, phases, components)
     * @param {boolean} updateUrl - URL'yi güncellesin mi (default: true)
     */
    showSection(section, updateUrl = true) {
        this.currentSection = section;

        // Hide all sections
        document.querySelectorAll('[id^="admin"][id$="Section"]').forEach((el) => {
            el.classList.add('hidden');
        });

        // Show target section
        const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
        const sectionEl = document.getElementById(`admin${sectionName}Section`);
        if (sectionEl) {
            sectionEl.classList.remove('hidden');
        }

        // Update tab active state
        document.querySelectorAll('.admin-tab-btn').forEach((tab) => {
            tab.classList.remove('active', 'bg-white/20');
            tab.classList.add('text-gray-300', 'hover:text-white');
            if (tab.dataset && tab.dataset.section === section) {
                tab.classList.add('active', 'bg-white/20');
                tab.classList.remove('text-gray-300', 'hover:text-white');
            }
        });

        // Trigger content render for sections
        this.renderSectionContent(section);

        // Update URL hash (if requested)
        if (updateUrl) {
            if (section === 'projects') {
                Router.navigate('/admin');
            } else {
                Router.navigate(`/admin/${section}`);
            }
        }
    },

    /**
     * Section içeriğini render et
     */
    renderSectionContent(section) {
        switch (section) {
            case 'projects':
                if (window.ProjectManager) {
                    const container = document.getElementById('adminProjectsContent');
                    if (container) {
                        container.innerHTML = ProjectsSection.render();
                        ProjectManager.renderList();
                    }
                }
                break;
            case 'phases':
                if (window.PhaseManager) {
                    const container = document.getElementById('adminPhasesContent');
                    if (container) {
                        container.innerHTML = PhasesSection.render();
                        PhaseManager.renderList();
                    }
                }
                break;
            case 'components':
                if (window.ComponentManager) {
                    const container = document.getElementById('adminComponentsContent');
                    if (container) {
                        container.innerHTML = ComponentsSection.render();
                        ComponentManager.renderList();
                    }
                }
                break;
        }
    },

    /**
     * Main layout'u gizle (admin kendi layout'unu kullanıyor)
     */
    hideMainLayout() {
        // Hide header
        const header = document.getElementById('main-header');
        if (header) header.style.display = 'none';

        // Hide footer
        const footer = document.getElementById('main-footer');
        if (footer) footer.style.display = 'none';

        // Hide mobile bottom nav
        const mobileNav = document.getElementById('mobile-bottom-nav');
        if (mobileNav) mobileNav.style.display = 'none';

        // Hide other views
        const courseSelection = document.getElementById('course-selection-view');
        if (courseSelection) courseSelection.classList.add('hidden');

        const dashboardView = document.getElementById('dashboard-view');
        if (dashboardView) dashboardView.classList.add('hidden');

        const projectView = document.getElementById('project-view');
        if (projectView) projectView.classList.add('hidden');
    },

    /**
     * Main layout'u göster
     */
    showMainLayout() {
        const header = document.getElementById('main-header');
        if (header) header.style.display = '';

        const footer = document.getElementById('main-footer');
        if (footer) footer.style.display = '';

        const mobileNav = document.getElementById('mobile-bottom-nav');
        if (mobileNav) mobileNav.style.display = '';
    },

    /**
     * Logout handler - AdminLayout'taki fonksiyonu çağırır
     */
    async handleLogout() {
        if (window.AdminLayout && AdminLayout.handleLogout) {
            await AdminLayout.handleLogout();
        }
    },
};

window.AdminView = AdminView;
