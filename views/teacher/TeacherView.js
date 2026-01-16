/**
 * TeacherView - Ana teacher panel view container
 * SPA entegrasyonu için mount/unmount lifecycle metodları
 * Single Screen Dashboard - 100vh, overflow-hidden yapısı
 */
const TeacherView = {
    isLoaded: false,
    currentSection: 'classrooms',
    scriptsLoaded: false,

    /**
     * Template - Single Screen Dashboard Layout (100vh, no body scroll)
     */
    template() {
        return `
            <div id="teacher-view" class="teacher-dashboard-container h-screen overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                
                <!-- Compact Header Bar -->
                ${TeacherLayout.renderCompactHeader()}
                
                <!-- Main Container: Sidebar + Content -->
                <div class="flex-1 flex overflow-hidden">
                    
                    <!-- Left Sidebar Navigation (Desktop) -->
                    ${TeacherLayout.renderSidebar()}
                    
                    <!-- Main Content Area -->
                    <main class="flex-1 overflow-hidden flex flex-col relative">
                        
                        <!-- Content Area with internal scroll -->
                        <div id="teacherContent" class="flex-1 overflow-y-auto overflow-x-hidden">
                            
                            <!-- Loading State -->
                            <div id="teacherLoadingState" class="flex items-center justify-center h-full">
                                <div class="text-center">
                                    <div class="teacher-spinner mx-auto mb-3"></div>
                                    <p class="text-gray-500 dark:text-gray-400 text-sm">Yükleniyor...</p>
                                </div>
                            </div>
                            
                            <!-- Dashboard Section -->
                            <section id="teacherDashboardSection" class="hidden h-full">
                                ${DashboardSection.render()}
                            </section>
                            
                            <!-- Classrooms Section -->
                            <section id="teacherClassroomsSection" class="hidden h-full">
                                ${ClassroomsSection.render()}
                            </section>
                            
                            <!-- Students Section -->
                            <section id="teacherStudentsSection" class="hidden h-full">
                                ${StudentsSection.render()}
                            </section>

                            <!-- Assignments Section -->
                            <section id="teacherAssignmentsSection" class="hidden h-full">
                                ${AssignmentsSection.render()}
                            </section>

                            <!-- Courses Section -->
                            <section id="teacherCoursesSection" class="hidden h-full">
                                ${CoursesSection.render()}
                            </section>

                            <!-- Analytics Section -->
                            <section id="teacherAnalyticsSection" class="hidden h-full">
                                ${AnalyticsSection.render()}
                            </section>
                        </div>
                    </main>
                </div>
                
                <!-- Mobile Bottom Navigation -->
                ${TeacherLayout.renderMobileBottomNav()}
                
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
        if (window.ThemeManager) ThemeManager.init();

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
        return 'classrooms';
    },

    /**
     * Section göster
     * @param {string} section - Gösterilecek section (dashboard, classrooms, students)
     * @param {boolean} updateUrl - URL'yi güncellesin mi (default: true)
     */
    showSection(section, updateUrl = true) {
        console.log('[TeacherView] showSection called:', section, 'updateUrl:', updateUrl);
        this.currentSection = section;

        // CRITICAL: Close all open modals before switching sections
        // Note: TeacherModals use 'open' class, AssignmentModals use 'active' class
        document.querySelectorAll('.modal-overlay.open, .modal-overlay.active').forEach((modal) => {
            modal.classList.remove('open', 'active');
            modal.classList.add('hidden');
        });
        // Restore body scroll if any modal had locked it
        document.body.style.overflow = '';

        // Hide all sections
        const allSections = document.querySelectorAll('[id^="teacher"][id$="Section"]');
        console.log('[TeacherView] Hiding all sections, count:', allSections.length);
        allSections.forEach((el) => {
            el.classList.add('hidden');
        });

        // Hide loading
        const loading = document.getElementById('teacherLoadingState');
        if (loading) loading.classList.add('hidden');

        // Show target section
        const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
        const targetId = `teacher${sectionName}Section`;
        const sectionEl = document.getElementById(targetId);
        console.log('[TeacherView] Target section:', targetId, 'Found:', !!sectionEl);
        if (sectionEl) {
            sectionEl.classList.remove('hidden');
            console.log('[TeacherView] After remove hidden, classList:', sectionEl.classList.toString());
            // Double check - force remove hidden
            if (sectionEl.classList.contains('hidden')) {
                console.error('[TeacherView] CRITICAL: hidden class still present after remove!');
                sectionEl.classList.remove('hidden');
            }
        } else {
            console.error('[TeacherView] Section NOT FOUND:', targetId);
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
     * Also lock body scroll for compact dashboard experience
     */
    hideMainLayout() {
        // CRITICAL: Lock body scroll for compact dashboard (h-screen overflow-hidden)
        document.body.classList.add('h-screen', 'overflow-hidden');
        document.body.classList.remove('min-h-screen');

        // CRITICAL: Set parent containers to full height for flex layout to work
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.add('h-full');
        }

        // The parent <main> element also needs height
        const mainEl = mainContent?.parentElement;
        if (mainEl && mainEl.tagName === 'MAIN') {
            mainEl.classList.add('h-full', 'flex-1', 'overflow-hidden');
            mainEl.classList.remove('py-6'); // Remove padding that interferes with full height
        }

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
     * Show footer again and unlock body scroll
     */
    showMainLayout() {
        // CRITICAL: Unlock body scroll (restore normal scrolling)
        document.body.classList.remove('h-screen', 'overflow-hidden');
        document.body.classList.add('min-h-screen');

        // Remove full height from parent containers
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.remove('h-full');
        }

        const mainEl = mainContent?.parentElement;
        if (mainEl && mainEl.tagName === 'MAIN') {
            mainEl.classList.remove('h-full', 'overflow-hidden');
            mainEl.classList.add('py-6'); // Restore padding
        }

        // Footer göster
        const footer = document.getElementById('main-footer');
        if (footer) footer.style.display = '';

        // Mobile nav göster
        const mobileNav = document.getElementById('mobile-bottom-nav');
        if (mobileNav) mobileNav.style.display = '';
    },
};

window.TeacherView = TeacherView;
