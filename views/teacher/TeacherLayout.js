/**
 * TeacherLayout - Sidebar ve Header render fonksiyonları
 * Teacher panel için layout bileşenleri
 */
const TeacherLayout = {
    /**
     * Sidebar HTML template - Sol menü
     */
    renderSidebar() {
        return `
            <!-- Logo -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <a href="#/" class="flex items-center gap-3" onclick="Router.navigate('/')">
                    <span class="text-4xl">❄️</span>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800 dark:text-white">Yeti LAB</h1>
                        <p class="text-xs text-gray-500">Öğretmen Paneli</p>
                    </div>
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-grow p-4 space-y-2">
                <button onclick="TeacherView.showSection('dashboard')"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800 bg-theme/10 text-theme"
                    data-section="dashboard">
                    <span>📊</span> Kontrol Paneli
                </button>

                <a href="profile.html"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <span>👤</span> Profil Ayarları
                </a>

                <button onclick="TeacherView.showSection('classrooms')"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                    data-section="classrooms">
                    <span class="text-xl">🏫</span>
                    <span>Sınıflarım</span>
                </button>
                
                <button onclick="TeacherView.showSection('students')"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                    data-section="students">
                    <span class="text-xl">👨‍🎓</span>
                    <span>Öğrenciler</span>
                </button>
            </nav>

            <!-- User Info -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div id="teacher-user-avatar" class="w-10 h-10 rounded-full bg-theme flex items-center justify-center text-white font-bold overflow-hidden">
                        <!-- Avatar will be injected by JS -->
                    </div>
                    <div class="flex-grow min-w-0">
                        <p id="teacher-user-name" class="font-semibold text-gray-800 dark:text-white truncate">Yükleniyor...</p>
                        <p class="text-xs text-gray-500">Öğretmen</p>
                    </div>
                    <button onclick="Auth.signOut()" title="Çıkış Yap"
                        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Header HTML template - Üst bar
     */
    renderHeader() {
        return `
            <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-4">
                        <!-- Mobile Menu Button -->
                        <button onclick="TeacherView.toggleSidebar()"
                            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h2 id="teacherSectionTitle" class="text-xl font-bold text-gray-800 dark:text-white">
                            Kontrol Paneli
                        </h2>
                    </div>
                    <div class="flex items-center gap-3">
                        <!-- Theme Toggle -->
                        <button onclick="ThemeManager?.toggle()"
                            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span id="teacherThemeIcon">🌙</span>
                        </button>
                        <!-- Quick Add Classroom -->
                        <button onclick="TeacherManager?.openCreateClassroomModal()"
                            class="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg hover:shadow-xl">
                            <span>+</span>
                            <span>Yeni Sınıf</span>
                        </button>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * User bilgilerini güncelle
     */
    updateUserInfo() {
        if (typeof Auth === 'undefined') return;

        const name = Auth.getDisplayName();
        const avatarUrl = Auth.getAvatarUrl();

        const nameEl = document.getElementById('teacher-user-name');
        if (nameEl) nameEl.textContent = name;

        const avatarEl = document.getElementById('teacher-user-avatar');
        if (avatarEl) {
            if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:'))) {
                avatarEl.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover">`;
                avatarEl.classList.add('overflow-hidden');
            } else {
                avatarEl.textContent = avatarUrl || name.charAt(0).toUpperCase();
            }
        }
    },
};

window.TeacherLayout = TeacherLayout;
