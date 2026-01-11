/**
 * TeacherLayout - Tab Navigation ve Header render fonksiyonları
 * Teacher panel için layout bileşenleri (Sidebar kaldırıldı)
 */
const TeacherLayout = {
    /**
     * Tab Navigation - Yatay menü (Sidebar yerine)
     */
    renderTabNav() {
        return `
            <div class="teacher-tab-nav bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6">
                    <div class="flex items-center justify-between h-11">
                        <!-- Tab Buttons -->
                        <div class="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
                            <button onclick="TeacherView.showSection('dashboard')"
                                class="teacher-tab-btn flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="dashboard">
                                <span>📊</span>
                                <span class="hidden sm:inline">Panel</span>
                            </button>

                            <button onclick="TeacherView.showSection('classrooms')"
                                class="teacher-tab-btn flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="classrooms">
                                <span>🏫</span>
                                <span class="hidden sm:inline">Sınıflar</span>
                            </button>
                            
                            <button onclick="TeacherView.showSection('students')"
                                class="teacher-tab-btn flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="students">
                                <span>👨‍🎓</span>
                                <span class="hidden sm:inline">Öğrenciler</span>
                            </button>

                            <button onclick="TeacherView.showSection('assignments')"
                                class="teacher-tab-btn flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="assignments">
                                <span>📋</span>
                                <span class="hidden sm:inline">Ödevler</span>
                            </button>

                            <button onclick="TeacherView.showSection('courses')"
                                class="teacher-tab-btn flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="courses">
                                <span>📚</span>
                                <span class="hidden sm:inline">Kurslar</span>
                            </button>

                            <button onclick="TeacherView.showSection('analytics')"
                                class="teacher-tab-btn flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="analytics">
                                <span>📈</span>
                                <span class="hidden sm:inline">Analytics</span>
                            </button>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex items-center gap-1.5">
                            <!-- Theme Toggle -->
                            <button onclick="ThemeManager?.toggle()"
                                class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Tema Değiştir">
                                <span id="teacherThemeIcon" class="text-sm">🌙</span>
                            </button>
                            
                            <!-- New Class Button -->
                            <button onclick="TeacherManager?.openCreateClassroomModal()"
                                class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-theme text-white rounded-lg font-semibold hover:brightness-110 transition-all shadow-sm text-sm">
                                <span>+</span>
                                <span>Yeni Sınıf</span>
                            </button>
                            
                            <!-- Mobile: Just icon -->
                            <button onclick="TeacherManager?.openCreateClassroomModal()"
                                class="sm:hidden p-1.5 bg-theme text-white rounded-lg hover:brightness-110 transition-all shadow-sm"
                                title="Yeni Sınıf">
                                <span class="text-sm">+</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * User bilgilerini güncelle (header'daki bilgiler için)
     */
    updateUserInfo() {
        // Main header'daki kullanıcı bilgileri Navbar tarafından yönetiliyor
        // Bu fonksiyon geriye dönük uyumluluk için bırakıldı
        console.log('[TeacherLayout] User info updated via main navbar');
    },

    /**
     * Tab aktif durumunu güncelle
     */
    updateActiveTab(section) {
        document.querySelectorAll('.teacher-tab-btn').forEach((btn) => {
            btn.classList.remove('active', 'bg-theme/10', 'text-theme');
            btn.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-100', 'dark:hover:bg-gray-700');

            if (btn.dataset && btn.dataset.section === section) {
                btn.classList.add('active', 'bg-theme/10', 'text-theme');
                btn.classList.remove('text-gray-600', 'dark:text-gray-300');
            }
        });
    },
};

window.TeacherLayout = TeacherLayout;
