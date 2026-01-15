const s={isLoaded:!1,currentSection:"projects",scriptsLoaded:!1,template(){return`
            <div id="admin-view" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <!-- Tab Navigation (main-header altında) -->
                ${AdminLayout.renderTabNav()}
                
                <!-- Main Content -->
                <div class="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
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

                    <!-- Settings Section -->
                    <section id="adminSettingsSection" class="hidden">
                        <div id="adminSettingsContent"></div>
                    </section>
                </div>

                <!-- Modals -->
                ${AdminModals.renderAll()}
            </div>
        `},async mount(e){if(console.log("[AdminView] Mounting..."),!await this.checkAuth())return!1;this.scriptsLoaded||(await this.loadDependencies(),this.scriptsLoaded=!0),e.innerHTML=this.template(),e.classList.remove("hidden"),this.hideMainLayout(),await this.initializeAdmin();const n=this.parseInitialSection();return this.showSection(n,!1),this.isLoaded=!0,console.log("[AdminView] Mounted successfully"),!0},unmount(){console.log("[AdminView] Unmounting..."),this.showMainLayout();const e=document.getElementById("admin-view");e&&e.remove();const n=document.getElementById("admin-view-container");n&&(n.innerHTML="",n.classList.add("hidden")),window.CourseLoader&&(CourseLoader.loadedCourses.clear(),console.log("[AdminView] CourseLoader cache cleared")),this.isLoaded=!1,console.log("[AdminView] Unmounted")},async checkAuth(){if(typeof Auth>"u"&&(console.warn("[AdminView] Auth module not found, waiting..."),await new Promise(n=>setTimeout(n,500)),typeof Auth>"u"))return console.error("[AdminView] Auth module still not found"),Router.redirectTo("auth.html"),!1;if(Auth.currentUser||(console.log("[AdminView] No current user, checking session..."),await Auth.checkSession()),!Auth.currentUser)return console.warn("[AdminView] No user after session check, redirecting to auth..."),Router.redirectTo("auth.html"),!1;const e=Auth.isAdmin();return console.log("[AdminView] User role:",Auth.userRole,"isAdmin:",e),e?!0:(window.Toast&&Toast.error("Bu sayfa sadece yöneticiler içindir"),setTimeout(()=>Router.navigate("/"),1500),!1)},async loadDependencies(){if(console.log("[AdminView] Loading dependencies..."),window.AdminLayout&&window.CourseManager&&window.ProjectManager&&window.admin){console.log("[AdminView] Dependencies already bundled, skipping dynamic load");return}const e=["modules/admin/state.js","modules/admin/ui.js","modules/admin/backup.js","modules/admin/projectEditor.js","modules/admin/courses.js","modules/admin/projects.js","modules/admin/phases.js","modules/admin/components.js","modules/admin/settings.js","modules/admin/storage.js","modules/admin/supabase-sync.js","modules/admin/hotspots.js","modules/admin/images.js","modules/admin/quizzes.js","views/admin/AdminLayout.js","views/admin/modals/AdminModals.js","views/admin/sections/SettingsSection.js","modules/admin.js"];for(const n of e)await this.loadScript(n);console.log("[AdminView] Dependencies loaded")},loadScript(e){return new Promise((n,i)=>{if(document.querySelector(`script[src="${e}"]`)){n();return}const t=document.createElement("script");t.src=e,t.onload=()=>{console.log(`[AdminView] Loaded: ${e}`),n()},t.onerror=()=>{console.error(`[AdminView] Failed to load: ${e}`),i(new Error(`Failed to load ${e}`))},document.body.appendChild(t)})},async initializeAdmin(){if(console.log("[AdminView] Initializing admin..."),window.courseData=window.courseData||{},window.admin)try{await admin.init()}catch(i){console.error("[AdminView] Error initializing admin:",i),window.Toast&&Toast.error("Yükleme hatası. Lütfen sayfayı yenileyin.")}AdminLayout.updateUserInfo();const e=document.getElementById("adminLoadingState");e&&e.classList.add("hidden");const n=document.getElementById("adminCourseSettings");n&&n.classList.remove("hidden"),window.ThemeManager&&ThemeManager.load()},parseInitialSection(){const e=window.location.hash;if(e.includes("/admin/")){const n=e.split("/admin/");if(n[1]){const i=n[1].split("/")[0];if(["phases","components","projects","settings"].includes(i))return i}}return"projects"},showSection(e,n=!0){this.currentSection=e,document.querySelectorAll('[id^="admin"][id$="Section"]').forEach(o=>{o.classList.add("hidden")});const i=e.charAt(0).toUpperCase()+e.slice(1),t=document.getElementById(`admin${i}Section`);t&&t.classList.remove("hidden"),AdminLayout.updateActiveTab(e),this.renderSectionContent(e),n&&(e==="projects"?Router.navigate("/admin"):Router.navigate(`/admin/${e}`))},renderSectionContent(e){switch(e){case"projects":if(window.ProjectManager){const n=document.getElementById("adminProjectsContent");n&&(n.innerHTML=ProjectsSection.render(),ProjectManager.renderList())}break;case"phases":if(window.PhaseManager){const n=document.getElementById("adminPhasesContent");n&&(n.innerHTML=PhasesSection.render(),PhaseManager.renderList())}break;case"components":if(window.ComponentManager){const n=document.getElementById("adminComponentsContent");n&&(n.innerHTML=ComponentsSection.render(),ComponentManager.renderList())}break;case"settings":if(window.SettingsSection){const n=document.getElementById("adminSettingsContent");n&&(n.innerHTML=window.SettingsSection.render(),window.SettingsSection.mount())}break}},hideMainLayout(){const e=document.getElementById("main-footer");e&&(e.style.display="none");const n=document.getElementById("mobile-bottom-nav");n&&(n.style.display="none");const i=document.getElementById("course-selection-view");i&&i.classList.add("hidden");const t=document.getElementById("dashboard-view");t&&t.classList.add("hidden");const o=document.getElementById("project-view");o&&o.classList.add("hidden")},showMainLayout(){const e=document.getElementById("main-footer");e&&(e.style.display="");const n=document.getElementById("mobile-bottom-nav");n&&(n.style.display="")},async handleLogout(){window.AdminLayout&&AdminLayout.handleLogout&&await AdminLayout.handleLogout()}};window.AdminView=s;
