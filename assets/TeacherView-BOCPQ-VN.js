const r={isLoaded:!1,currentSection:"classrooms",scriptsLoaded:!1,template(){return`
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
        `},async mount(e){if(console.log("[TeacherView] Mounting..."),!await this.checkAuth())return!1;this.scriptsLoaded||(await this.loadDependencies(),this.scriptsLoaded=!0),e.innerHTML=this.template(),e.classList.remove("hidden"),this.hideMainLayout(),window.TeacherManager&&await TeacherManager.init(),window.ThemeManager&&ThemeManager.init();const t=this.parseInitialSection();return this.showSection(t,!1),this.isLoaded=!0,console.log("[TeacherView] Mounted successfully"),!0},unmount(){console.log("[TeacherView] Unmounting..."),this.showMainLayout();const e=document.getElementById("teacher-view");e&&e.remove();const t=document.getElementById("teacher-view-container");t&&(t.innerHTML="",t.classList.add("hidden")),this.isLoaded=!1,console.log("[TeacherView] Unmounted")},async checkAuth(){return typeof Auth>"u"?(console.error("[TeacherView] Auth module not found"),!1):Auth.currentUser?Auth.userRole!=="teacher"&&Auth.userRole!=="admin"?(window.Toast&&Toast.error("Bu sayfa sadece öğretmenler içindir"),setTimeout(()=>Router.navigate("/"),1500),!1):!0:(console.warn("[TeacherView] No user, redirecting to auth..."),Router.redirectTo("auth.html"),!1)},async loadDependencies(){if(console.log("[TeacherView] Loading dependencies..."),window.TeacherLayout&&window.TeacherManager){console.log("[TeacherView] Dependencies already bundled, skipping dynamic load");return}const e=["views/teacher/TeacherLayout.js","views/teacher/sections/DashboardSection.js","views/teacher/sections/ClassroomsSection.js","views/teacher/sections/StudentsSection.js","views/teacher/sections/AssignmentsSection.js","views/teacher/sections/CoursesSection.js","views/teacher/sections/AnalyticsSection.js","views/teacher/modals/TeacherModals.js","views/teacher/modals/AssignmentModals.js","modules/teacher/classrooms.js","modules/teacher/students.js","modules/teacher/analytics.js","modules/teacher-manager.js","modules/assignmentService.js"];for(const t of e)await this.loadScript(t);console.log("[TeacherView] Dependencies loaded")},loadScript(e){return new Promise((t,s)=>{if(document.querySelector(`script[src="${e}"]`)){t();return}const o=document.createElement("script");o.src=e,o.onload=()=>{console.log(`[TeacherView] Loaded: ${e}`),t()},o.onerror=()=>{console.error(`[TeacherView] Failed to load: ${e}`),s(new Error(`Failed to load ${e}`))},document.body.appendChild(o)})},parseInitialSection(){const e=window.location.hash;if(e.includes("/teacher/")){const t=e.split("/teacher/");if(t[1]){const s=t[1].split("/")[0];if(["classrooms","students","assignments","courses","analytics"].includes(s))return s}}return"classrooms"},showSection(e,t=!0){console.log("[TeacherView] showSection called:",e,"updateUrl:",t),this.currentSection=e,document.querySelectorAll(".modal-overlay.open, .modal-overlay.active").forEach(a=>{a.classList.remove("open","active"),a.classList.add("hidden")}),document.body.style.overflow="";const s=document.querySelectorAll('[id^="teacher"][id$="Section"]');console.log("[TeacherView] Hiding all sections, count:",s.length),s.forEach(a=>{a.classList.add("hidden")});const o=document.getElementById("teacherLoadingState");o&&o.classList.add("hidden");const i=`teacher${e.charAt(0).toUpperCase()+e.slice(1)}Section`,n=document.getElementById(i);console.log("[TeacherView] Target section:",i,"Found:",!!n),n?(n.classList.remove("hidden"),console.log("[TeacherView] After remove hidden, classList:",n.classList.toString()),n.classList.contains("hidden")&&(console.error("[TeacherView] CRITICAL: hidden class still present after remove!"),n.classList.remove("hidden"))):console.error("[TeacherView] Section NOT FOUND:",i),TeacherLayout.updateActiveTab(e),window.TeacherManager&&(e==="classrooms"&&TeacherManager.loadClassrooms&&TeacherManager.loadClassrooms(),e==="students"&&TeacherManager.loadStudents&&TeacherManager.loadStudents()),e==="assignments"&&window.AssignmentsSection&&AssignmentsSection.loadData(),e==="courses"&&window.CoursesSection&&CoursesSection.mount(),e==="analytics"&&window.AnalyticsSection&&AnalyticsSection.mount(),t&&(e==="dashboard"?Router.navigate("/teacher"):Router.navigate(`/teacher/${e}`))},hideMainLayout(){document.body.classList.add("h-screen","overflow-hidden"),document.body.classList.remove("min-h-screen");const e=document.getElementById("main-content");e&&e.classList.add("h-full");const t=e?.parentElement;t&&t.tagName==="MAIN"&&(t.classList.add("h-full","flex-1","overflow-hidden"),t.classList.remove("py-6"));const s=document.getElementById("main-footer");s&&(s.style.display="none");const o=document.getElementById("mobile-bottom-nav");o&&(o.style.display="none");const c=document.getElementById("course-selection-view");c&&c.classList.add("hidden");const i=document.getElementById("dashboard-view");i&&i.classList.add("hidden");const n=document.getElementById("project-view");n&&n.classList.add("hidden")},showMainLayout(){document.body.classList.remove("h-screen","overflow-hidden"),document.body.classList.add("min-h-screen");const e=document.getElementById("main-content");e&&e.classList.remove("h-full");const t=e?.parentElement;t&&t.tagName==="MAIN"&&(t.classList.remove("h-full","overflow-hidden"),t.classList.add("py-6"));const s=document.getElementById("main-footer");s&&(s.style.display="");const o=document.getElementById("mobile-bottom-nav");o&&(o.style.display="")}};window.TeacherView=r;
