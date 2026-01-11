/**
 * TeacherView - Ana teacher panel view container
 * SPA entegrasyonu için mount/unmount lifecycle metodları
 * (Sidebar kaldırıldı, index header kullanılıyor)
 */
const TeacherView = {
    isLoaded: false,
    currentSection: 'dashboard',
    scriptsLoaded: false,

    /**
     * Template - Ana layout (sidebar yok, main-header kullanılıyor)
     */
    template() {
        return `
            <div id="teacher-view" class="teacher-bg min-h-screen">
                <!-- Tab Navigation (Sidebar yerine) -->
                ${TeacherLayout.renderTabNav()}
                
                <!-- Main Content -->
                <div class="teacher-content max-w-7xl mx-auto px-4 sm:px-6 py-6">
                    <!-- Content Area -->
                    <div id="teacherContent" class="space-y-6">
                        <!-- Loading State -->
                        <div id="teacherLoadingState" class="flex items-center justify-center h-64">
                            <div class="text-center">
                                <div class="teacher-spinner mx-auto mb-4"></div>
                                <p class="text-gray-500">Yükleniyor...</p>
                            </div>
                        </div>
                        
                        <!-- Dashboard Section -->
                        <section id="teacherDashboardSection" class="hidden">
                            ${DashboardSection.render()}
                        </section>
                        
                        <!-- Classrooms Section -->
                        <section id="teacherClassroomsSection" class="hidden">
                            ${ClassroomsSection.render()}
                        </section>
                        
                        <!-- Students Section -->
                        <section id="teacherStudentsSection" class="hidden">
                            ${StudentsSection.render()}
                        </section>

                        <!-- Assignments Section -->
                        <section id="teacherAssignmentsSection" class="hidden">
                            ${AssignmentsSection.render()}
                        </section>

                        <!-- Courses Section -->
                        <section id="teacherCoursesSection" class="hidden">
                            ${CoursesSection.render()}
                        </section>

                        <!-- Analytics Section -->
                        <section id="teacherAnalyticsSection" class="hidden">
                            ${AnalyticsSection.render()}
                        </section>
                    </div>
                </div>
                
                <!-- Modals -->
                ${TeacherModals.renderAll()}
                ${AssignmentModals.renderAll()}
            </div>
        `;
    },

    /**
     * Mount - View DOM'a eklendiğinde
     */
    async mount(container) {
        console.log('[TeacherView] Mounting...');

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

        // Hide footer and mobile bottom nav (but keep main-header visible!)
        this.hideMainLayout();

        // Initialize TeacherManager
        if (window.TeacherManager) {
            await TeacherManager.init();
        }

        // Apply theme
        if (window.ThemeManager) ThemeManager.load();

        // Parse initial section from URL hash
        // #/teacher → dashboard, #/teacher/classrooms → classrooms
        const initialSection = this.parseInitialSection();
        this.showSection(initialSection, false); // false = don't update URL on initial load

        this.isLoaded = true;
        console.log('[TeacherView] Mounted successfully');
        return true;
    },

    /**
     * Unmount - View DOM'dan kaldırıldığında
     */
    unmount() {
        console.log('[TeacherView] Unmounting...');

        // Show main layout again
        this.showMainLayout();

        // Remove teacher view from DOM
        const teacherView = document.getElementById('teacher-view');
        if (teacherView) {
            teacherView.remove();
        }

        // Hide container
        const container = document.getElementById('teacher-view-container');
        if (container) {
            container.innerHTML = '';
            container.classList.add('hidden');
        }

        this.isLoaded = false;
        console.log('[TeacherView] Unmounted');
    },

    /**
     * Auth kontrolü
     */
    async checkAuth() {
        // Wait for Auth to be ready
        if (typeof Auth === 'undefined') {
            console.error('[TeacherView] Auth module not found');
            return false;
        }

        if (!Auth.currentUser) {
            console.warn('[TeacherView] No user, redirecting to auth...');
            Router.redirectTo('auth.html');
            return false;
        }

        if (Auth.userRole !== 'teacher' && Auth.userRole !== 'admin') {
            if (window.Toast) Toast.error('Bu sayfa sadece öğretmenler içindir');
            setTimeout(() => Router.navigate('/'), 1500);
            return false;
        }

        return true;
    },

    /**
     * Teacher modül bağımlılıklarını yükle
     * In production (Vite bundle), these are already loaded via main.js imports
     */
    async loadDependencies() {
        console.log('[TeacherView] Loading dependencies...');

        // Check if already bundled (Vite production build)
        // If TeacherLayout exists, scripts are already loaded via bundle
        if (window.TeacherLayout && window.TeacherManager) {
            console.log('[TeacherView] Dependencies already bundled, skipping dynamic load');
            return;
        }

        const scripts = [
            'views/teacher/TeacherLayout.js',
            'views/teacher/sections/DashboardSection.js',
            'views/teacher/sections/ClassroomsSection.js',
            'views/teacher/sections/StudentsSection.js',
            'views/teacher/sections/AssignmentsSection.js',
            'views/teacher/sections/CoursesSection.js',
            'views/teacher/sections/AnalyticsSection.js',
            'views/teacher/modals/TeacherModals.js',
            'views/teacher/modals/AssignmentModals.js',
            'modules/teacher/classrooms.js',
            'modules/teacher/students.js',
            'modules/teacher/analytics.js',
            'modules/teacher-manager.js',
            'modules/assignmentService.js',
        ];

        for (const src of scripts) {
            await this.loadScript(src);
        }

        console.log('[TeacherView] Dependencies loaded');
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
                console.log(`[TeacherView] Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`[TeacherView] Failed to load: ${src}`);
                reject(new Error(`Failed to load ${src}`));
            };
            document.body.appendChild(script);
        });
    },

    /**
     * URL'den başlangıç section'ını parse et
     */
    parseInitialSection() {
        const hash = window.location.hash;
        // #/teacher/classrooms → classrooms
        // #/teacher/students → students
        // #/teacher/assignments → assignments
        // #/teacher/courses → courses
        // #/teacher/analytics → analytics
        // #/teacher → dashboard
        if (hash.includes('/teacher/')) {
            const parts = hash.split('/teacher/');
            if (parts[1]) {
                const section = parts[1].split('/')[0]; // İlk segment
                if (['classrooms', 'students', 'assignments', 'courses', 'analytics'].includes(section)) {
                    return section;
                }
            }
        }
        return 'dashboard';
    },

    /**
     * Section göster
     * @param {string} section - Gösterilecek section (dashboard, classrooms, students)
     * @param {boolean} updateUrl - URL'yi güncellesin mi (default: true)
     */
    showSection(section, updateUrl = true) {
        this.currentSection = section;

        // Hide all sections
        document.querySelectorAll('[id^="teacher"][id$="Section"]').forEach((el) => {
            el.classList.add('hidden');
        });

        // Hide loading
        const loading = document.getElementById('teacherLoadingState');
        if (loading) loading.classList.add('hidden');

        // Show target section
        const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
        const sectionEl = document.getElementById(`teacher${sectionName}Section`);
        if (sectionEl) {
            sectionEl.classList.remove('hidden');
        }

        // Update tab active state
        TeacherLayout.updateActiveTab(section);

        // Trigger data load for sections
        if (window.TeacherManager) {
            if (section === 'classrooms' && TeacherManager.loadClassrooms) {
                TeacherManager.loadClassrooms();
            }
            if (section === 'students' && TeacherManager.loadStudents) {
                TeacherManager.loadStudents();
            }
        }

        // Load assignments data
        if (section === 'assignments' && window.AssignmentsSection) {
            AssignmentsSection.loadData();
        }

        // Load courses data
        if (section === 'courses' && window.CoursesSection) {
            CoursesSection.mount();
        }

        // Load analytics data
        if (section === 'analytics' && window.AnalyticsSection) {
            AnalyticsSection.mount();
        }

        // Update URL hash (if requested)
        if (updateUrl) {
            if (section === 'dashboard') {
                Router.navigate('/teacher');
            } else {
                Router.navigate(`/teacher/${section}`);
            }
        }
    },

    /**
     * Hide footer and mobile nav (but keep main-header visible)
     */
    hideMainLayout() {
        // KEEP main-header visible (index style top bar)
        // const header = document.getElementById('main-header');
        // if (header) header.style.display = 'none';

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
     * Show footer again
     */
    showMainLayout() {
        // Footer göster
        const footer = document.getElementById('main-footer');
        if (footer) footer.style.display = '';

        // Mobile nav göster
        const mobileNav = document.getElementById('mobile-bottom-nav');
        if (mobileNav) mobileNav.style.display = '';
    },
};

window.TeacherView = TeacherView;
