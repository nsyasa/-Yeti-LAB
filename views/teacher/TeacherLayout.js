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
                    <div class="flex items-center justify-between h-14">
                        <!-- Tab Buttons -->
                        <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                            <button onclick="TeacherView.showSection('dashboard')"
                                class="teacher-tab-btn flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="dashboard">
                                <span>📊</span>
                                <span class="hidden sm:inline">Kontrol Paneli</span>
                                <span class="sm:hidden">Panel</span>
                            </button>

                            <button onclick="TeacherView.showSection('classrooms')"
                                class="teacher-tab-btn flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="classrooms">
                                <span>🏫</span>
                                <span class="hidden sm:inline">Sınıflarım</span>
                                <span class="sm:hidden">Sınıf</span>
                            </button>
                            
                            <button onclick="TeacherView.showSection('students')"
                                class="teacher-tab-btn flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                                data-section="students">
                                <span>👨‍🎓</span>
                                <span class="hidden sm:inline">Öğrenciler</span>
                                <span class="sm:hidden">Öğrenci</span>
                            </button>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex items-center gap-2">
                            <!-- Theme Toggle -->
                            <button onclick="ThemeManager?.toggle()"
                                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Tema Değiştir">
                                <span id="teacherThemeIcon">🌙</span>
                            </button>
                            
                            <!-- New Class Button -->
                            <button onclick="TeacherManager?.openCreateClassroomModal()"
                                class="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-lg font-semibold hover:brightness-110 transition-all shadow-md hover:shadow-lg text-sm">
                                <span>+</span>
                                <span>Yeni Sınıf</span>
                            </button>
                            
                            <!-- Mobile: Just icon -->
                            <button onclick="TeacherManager?.openCreateClassroomModal()"
                                class="sm:hidden p-2 bg-theme text-white rounded-lg hover:brightness-110 transition-all shadow-md"
                                title="Yeni Sınıf">
                                <span>+</span>
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
