const s={renderCompactHeader(){return`
            <header class="teacher-compact-header bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-30">
                
                <!-- Top Row: Logo + Actions -->
                <div class="h-12 flex items-center px-4 gap-4 border-b border-slate-100 dark:border-slate-700/50">
                    <!-- Logo & Title -->
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🎓</span>
                        <h1 class="text-sm font-bold text-slate-800 dark:text-white">Öğretmen Paneli</h1>
                    </div>
                    
                    <!-- Spacer -->
                    <div class="flex-1"></div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2">
                        <!-- Action Buttons Cleaned -->
                    </div>
                </div>
                
                <!-- Tab Navigation Row -->
                <div class="h-11 flex items-center px-4 gap-1 overflow-x-auto scrollbar-hide">
                    <button onclick="TeacherView.showSection('classrooms')"
                        class="teacher-header-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                        data-section="classrooms">
                        <span>🏫</span>
                        <span>Sınıflar</span>
                    </button>
                    
                    <button onclick="TeacherView.showSection('students')"
                        class="teacher-header-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                        data-section="students">
                        <span>👨‍🎓</span>
                        <span>Öğrenciler</span>
                    </button>
                    
                    <button onclick="TeacherView.showSection('assignments')"
                        class="teacher-header-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                        data-section="assignments">
                        <span>📋</span>
                        <span>Ödevler</span>
                    </button>
                    
                    <button onclick="TeacherView.showSection('courses')"
                        class="teacher-header-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                        data-section="courses">
                        <span>📚</span>
                        <span>Kurslar</span>
                    </button>
                    
                    <button onclick="TeacherView.showSection('analytics')"
                        class="teacher-header-tab flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                        data-section="analytics">
                        <span>📈</span>
                        <span>Analytics</span>
                    </button>
                </div>
            </header>
        `},renderSidebar(){return""},renderMobileBottomNav(){return`
            <nav class="teacher-mobile-nav lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-800/95 backdrop-blur-xl border-t border-slate-700 flex items-center justify-around px-2 z-40">
                
                <button onclick="TeacherView.showSection('classrooms')"
                    class="teacher-mobile-nav-item flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
                    data-section="classrooms">
                    <span class="text-xl">🏫</span>
                    <span class="text-[10px] font-medium">Sınıflar</span>
                </button>
                
                <button onclick="TeacherView.showSection('students')"
                    class="teacher-mobile-nav-item flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
                    data-section="students">
                    <span class="text-xl">👨‍🎓</span>
                    <span class="text-[10px] font-medium">Öğrenciler</span>
                </button>
                
                <button onclick="TeacherView.showSection('courses')"
                    class="teacher-mobile-nav-item flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
                    data-section="courses">
                    <span class="text-xl">📚</span>
                    <span class="text-[10px] font-medium">Kurslar</span>
                </button>
                
                <button onclick="TeacherView.showSection('analytics')"
                    class="teacher-mobile-nav-item flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
                    data-section="analytics">
                    <span class="text-xl">📈</span>
                    <span class="text-[10px] font-medium">Analiz</span>
                </button>
                
            </nav>
        `},renderTabNav(){return""},updateUserInfo(){console.log("[TeacherLayout] User info updated via main navbar")},updateActiveTab(t){console.log("[TeacherLayout] updateActiveTab called with section:",t);const a=document.querySelectorAll(".teacher-header-tab");console.log("[TeacherLayout] Found header tabs:",a.length),a.forEach(e=>{e.classList.remove("active","bg-emerald-100","dark:bg-emerald-900/40","text-emerald-700","dark:text-emerald-400"),e.classList.add("text-slate-600","dark:text-slate-300","hover:bg-slate-100","dark:hover:bg-slate-700"),e.dataset&&e.dataset.section===t&&(console.log("[TeacherLayout] Activating tab:",e.dataset.section),e.classList.add("active","bg-emerald-100","dark:bg-emerald-900/40","text-emerald-700","dark:text-emerald-400"),e.classList.remove("text-slate-600","dark:text-slate-300","hover:bg-slate-100","dark:hover:bg-slate-700"))}),document.querySelectorAll(".teacher-mobile-nav-item").forEach(e=>{e.classList.remove("active","bg-emerald-50","dark:bg-emerald-900/30","text-emerald-600","dark:text-emerald-400"),e.classList.add("text-slate-500","dark:text-slate-400"),e.dataset&&e.dataset.section===t&&(e.classList.add("active","bg-emerald-50","dark:bg-emerald-900/30","text-emerald-600","dark:text-emerald-400"),e.classList.remove("text-slate-500","dark:text-slate-400"))})},updateSidebarStats(t,a){console.log("[TeacherLayout] Stats:",t,"classes,",a,"students")}};window.TeacherLayout=s;
