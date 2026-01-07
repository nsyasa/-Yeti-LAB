/**
 * ProfileView - SPA Profile View Controller
 * Handles profile page logic in SPA context
 *
 * Migrated from profile.html as part of SPA migration
 */

const ProfileView = {
    isLoaded: false,
    currentView: 'settings', // 'wizard' or 'settings'
    scriptsLoaded: false,
    container: null,

    /**
     * Check if user is authenticated
     * @returns {Promise<object|null>} User info or null
     */
    async checkAuth() {
        // Wait for Auth module to initialize
        if (window.Auth && typeof Auth.waitForInit === 'function') {
            await Auth.waitForInit();
        }

        // Check if user is logged in
        if (window.Auth && Auth.currentUser) {
            return Auth.currentUser;
        }

        // Check for student code auth
        const studentSession = sessionStorage.getItem('studentSession');
        if (studentSession) {
            try {
                return JSON.parse(studentSession);
            } catch (e) {
                console.error('[ProfileView] Failed to parse student session:', e);
            }
        }

        return null;
    },

    /**
     * Load required dependencies (scripts)
     */
    async loadDependencies() {
        if (this.scriptsLoaded) return;

        const scripts = [
            'modules/constants.js',
            'modules/validators.js',
            'data/cities.js',
            'modules/badges.js',
            'modules/profile.js',
        ];

        for (const src of scripts) {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) continue;

            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }

        this.scriptsLoaded = true;
        console.log('[ProfileView] Dependencies loaded');
    },

    /**
     * Get the main template HTML
     */
    template() {
        return `
            <div class="profile-bg flex flex-col min-h-screen">
                <!-- Main Content -->
                <main class="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                    <!-- VIEW: WIZARD (First Time Setup) -->
                    <div id="view-wizard" class="hidden max-w-2xl mx-auto">
                        <!-- Progress Steps -->
                        <div class="flex justify-center gap-4 mb-8">
                            <div class="step-dot w-3 h-3 rounded-full bg-theme ring-4 ring-theme/20"></div>
                            <div class="step-dot w-3 h-3 rounded-full bg-gray-200"></div>
                            <div class="step-dot w-3 h-3 rounded-full bg-gray-200"></div>
                        </div>

                        <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-theme to-cyan-400"></div>

                            <!-- Wizard Step 1: Role -->
                            <div id="wizard-step-1" class="wizard-step">
                                <h2 class="text-3xl font-bold text-center mb-2">Hoş Geldin! 👋</h2>
                                <p class="text-gray-500 text-center mb-8">Seni daha yakından tanıyalım</p>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div onclick="Wizard.selectRole('teacher')" class="role-card border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-theme transition-colors group">
                                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍🏫</div>
                                        <h3 class="text-xl font-bold mb-2">Öğretmenim</h3>
                                        <p class="text-gray-400 text-sm">Sınıflar oluştur, öğrencilerini yönet</p>
                                    </div>
                                    <div onclick="Wizard.selectRole('student')" class="role-card border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-theme transition-colors group">
                                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                                        <h3 class="text-xl font-bold mb-2">Öğrenciyim</h3>
                                        <p class="text-gray-400 text-sm">Dersleri tamamla, projeler yap</p>
                                    </div>
                                </div>

                                <button id="wiz-btn-1" onclick="Wizard.nextStep()" disabled class="w-full bg-gray-200 text-gray-400 py-4 rounded-xl font-bold transition-all">
                                    Devam Et
                                </button>
                            </div>

                            <!-- Wizard Step 2: Info -->
                            <div id="wizard-step-2" class="wizard-step hidden">
                                <h2 class="text-2xl font-bold text-center mb-6">Bilgilerini Tamamla 📝</h2>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block font-bold text-gray-700 mb-2">Ad Soyad</label>
                                        <input type="text" id="wiz-name" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label class="block font-bold text-gray-700 mb-2">Okul Adı</label>
                                        <input type="text" id="wiz-school" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none transition-colors" placeholder="Örn: Atatürk Ortaokulu" />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block font-bold text-gray-700 mb-2">İl</label>
                                            <select id="wiz-city" onchange="loadDistricts('wiz-city', 'wiz-district')" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none"></select>
                                        </div>
                                        <div>
                                            <label class="block font-bold text-gray-700 mb-2">İlçe</label>
                                            <select id="wiz-district" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none"></select>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex gap-4 mt-8">
                                    <button onclick="Wizard.prevStep()" class="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Geri</button>
                                    <button onclick="Wizard.nextStep()" class="flex-1 bg-theme text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all">Devam Et</button>
                                </div>
                            </div>

                            <!-- Wizard Step 3: Avatar -->
                            <div id="wizard-step-3" class="wizard-step hidden">
                                <h2 class="text-2xl font-bold text-center mb-6">Bir Avatar Seç 🎨</h2>
                                <div class="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-8" id="wiz-avatar-grid">
                                    <!-- Avatars will be injected here -->
                                </div>
                                <div class="text-center">
                                    <button onclick="Wizard.complete()" id="wiz-complete-btn" class="w-full bg-theme text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 shadow-lg shadow-theme/30 transition-all">
                                        Başla 🚀
                                    </button>
                                    <p id="wiz-error" class="text-red-500 mt-4 text-sm hidden"></p>
                                </div>
                                <div class="mt-4 text-center">
                                    <button onclick="Wizard.prevStep()" class="text-gray-400 text-sm hover:text-gray-600">Geri Dön</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- VIEW: SETTINGS (Modern Card Layout) -->
                    <div id="view-settings" class="hidden">
                        <!-- Hero Section -->
                        <div class="text-center mb-8">
                            <div class="inline-block relative">
                                <div class="hero-avatar" id="profile-hero-avatar">
                                    <span id="hero-avatar-emoji">👤</span>
                                </div>
                                <button onclick="ProfileEditor.toggleAvatarSelector()" class="hero-avatar-edit" title="Avatar Değiştir">✏️</button>
                            </div>
                            <!-- Avatar Selector (hidden by default) -->
                            <div id="avatar-selector-popup" class="hidden mt-4 p-4 bg-white rounded-2xl shadow-lg border max-w-xs mx-auto">
                                <div class="grid grid-cols-8 gap-2" id="avatar-grid">
                                    <!-- Avatars injected via JS -->
                                </div>
                            </div>
                            <h2 class="text-2xl font-bold mt-4" id="hero-name">Kullanıcı</h2>
                            <div class="flex items-center justify-center gap-2 mt-1">
                                <span id="hero-role-badge" class="text-xs font-bold px-3 py-1 rounded-full bg-theme/10 text-theme">Öğrenci</span>
                                <span id="hero-level-badge" class="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Level 1</span>
                            </div>

                            <!-- XP Progress Bar -->
                            <div class="max-w-xs mx-auto mt-3">
                                <div class="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Kazanılan XP: <span id="hero-xp" class="text-theme font-bold">0</span></span>
                                    <span>Sonraki Seviye: <span id="hero-next-xp">1000</span></span>
                                </div>
                                <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div id="hero-xp-bar" class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000" style="width: 0%"></div>
                                </div>
                            </div>

                            <p class="text-gray-500 text-sm mt-2" id="hero-email">email@example.com</p>
                            <p class="text-gray-400 text-xs mt-1" id="hero-joined">Katılım: Ocak 2026</p>
                        </div>

                        <!-- Stats Cards -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-lessons">0</div>
                                <div class="stat-badge-label">Ders Tamamlandı</div>
                            </div>
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-badges">0</div>
                                <div class="stat-badge-label">Rozet Kazanıldı</div>
                            </div>
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-streak">0</div>
                                <div class="stat-badge-label">Gün Seri</div>
                            </div>
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-quiz">0%</div>
                                <div class="stat-badge-label">Quiz Ortalaması</div>
                            </div>
                        </div>

                        <!-- Activity Heatmap -->
                        <div class="mb-8">
                            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                                <span>📊</span> Son 30 Günlük Aktivite
                            </h3>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div id="activity-heatmap" class="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <!-- Heatmap cells injected via JS -->
                                </div>
                                <div class="flex items-center gap-2 mt-4 text-xs text-gray-400 justify-end">
                                    <span>Az</span>
                                    <div class="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700"></div>
                                    <div class="w-3 h-3 rounded-sm bg-theme/40"></div>
                                    <div class="w-3 h-3 rounded-sm bg-theme"></div>
                                    <span>Çok</span>
                                </div>
                            </div>
                        </div>

                        <!-- Badge Gallery -->
                        <div class="mb-8">
                            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                                <span>🏆</span> Rozet Koleksiyonu
                            </h3>
                            <div id="badge-gallery" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <!-- Badges injected via JS -->
                            </div>
                        </div>

                        <!-- Teacher Panel Link (Hidden by default) -->
                        <div id="teacher-panel-link" class="hidden mb-6">
                            <a href="#/teacher" onclick="event.preventDefault(); Navbar.navigateSPA('/teacher');" class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full bg-theme/10 flex items-center justify-center text-2xl">🎛️</div>
                                    <div>
                                        <h3 class="font-bold text-lg text-gray-800 dark:text-white group-hover:text-theme transition-colors">Öğretmen Kontrol Paneli</h3>
                                        <p class="text-gray-500 text-sm">Sınıflarınızı ve öğrencilerinizi yönetin</p>
                                    </div>
                                </div>
                                <span class="text-gray-400 group-hover:translate-x-1 transition-transform text-xl">→</span>
                            </a>
                        </div>

                        <!-- Kişisel Bilgiler Card -->
                        <div class="profile-card mb-4" id="card-personal">
                            <div class="profile-card-header">
                                <div class="profile-card-title"><span>📋</span> Kişisel Bilgiler</div>
                                <button class="edit-btn" onclick="ProfileEditor.toggleEdit('personal')" title="Düzenle">✏️</button>
                            </div>
                            <div class="profile-card-body">
                                <!-- View Mode -->
                                <div class="view-mode">
                                    <div class="inline-field">
                                        <span class="inline-field-label">Ad Soyad</span>
                                        <span class="inline-field-value" id="view-name">—</span>
                                    </div>
                                    <div class="inline-field">
                                        <span class="inline-field-label">Okul</span>
                                        <span class="inline-field-value" id="view-school">—</span>
                                    </div>
                                    <div class="inline-field">
                                        <span class="inline-field-label">İl</span>
                                        <span class="inline-field-value" id="view-city">—</span>
                                    </div>
                                    <div class="inline-field">
                                        <span class="inline-field-label">İlçe</span>
                                        <span class="inline-field-value" id="view-district">—</span>
                                    </div>
                                </div>
                                <!-- Edit Mode -->
                                <div class="edit-mode space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                        <input type="text" id="edit-name" class="inline-field-input" placeholder="Adınız Soyadınız" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Okul</label>
                                        <input type="text" id="edit-school" class="inline-field-input" placeholder="Okul adı (opsiyonel)" />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">İl</label>
                                            <select id="edit-city" class="inline-field-input" onchange="ProfileEditor.loadDistricts()">
                                                <option value="">Seçiniz</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                                            <select id="edit-district" class="inline-field-input">
                                                <option value="">Önce il seçin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="flex gap-2 pt-2">
                                        <button class="btn-save" onclick="ProfileEditor.savePersonal()">💾 Kaydet</button>
                                        <button class="btn-cancel" onclick="ProfileEditor.cancelEdit('personal')">İptal</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Güvenlik Card -->
                        <div class="profile-card mb-4" id="card-security">
                            <div class="profile-card-header">
                                <div class="profile-card-title"><span>🔐</span> Güvenlik</div>
                                <button class="edit-btn" onclick="ProfileEditor.toggleEdit('security')" title="Şifre Değiştir">✏️</button>
                            </div>
                            <div class="profile-card-body">
                                <!-- View Mode -->
                                <div class="view-mode">
                                    <div class="inline-field">
                                        <span class="inline-field-label">Şifre</span>
                                        <span class="inline-field-value">••••••••</span>
                                    </div>
                                    <div class="inline-field">
                                        <span class="inline-field-label">Bağlı Hesaplar</span>
                                        <span class="inline-field-value" id="view-connections">—</span>
                                    </div>
                                </div>
                                <!-- Edit Mode -->
                                <div class="edit-mode space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                        <input type="password" id="new-password" class="inline-field-input" placeholder="En az 6 karakter" minlength="6" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                        <input type="password" id="new-password-confirm" class="inline-field-input" placeholder="Şifreyi tekrar girin" minlength="6" />
                                    </div>
                                    <div class="flex gap-2 pt-2">
                                        <button class="btn-save" onclick="ProfileEditor.savePassword()">🔒 Şifreyi Güncelle</button>
                                        <button class="btn-cancel" onclick="ProfileEditor.cancelEdit('security')">İptal</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tercihler Card -->
                        <div class="profile-card mb-4" id="card-preferences">
                            <div class="profile-card-header">
                                <div class="profile-card-title"><span>⚙️</span> Tercihler</div>
                            </div>
                            <div class="profile-card-body">
                                <div class="inline-field">
                                    <span class="inline-field-label">Tema</span>
                                    <div class="flex gap-2">
                                        <button onclick="ProfileEditor.setTheme('light')" id="theme-light-btn" class="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100">☀️ Açık</button>
                                        <button onclick="ProfileEditor.setTheme('dark')" id="theme-dark-btn" class="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100">🌙 Koyu</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Çıkış Butonu -->
                        <div class="text-center mt-8 mb-8">
                            <button onclick="ProfileView.logout()" class="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-2 mx-auto">
                                🚪 Çıkış Yap
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Mount the profile view into a container
     * @param {HTMLElement} container - Container element
     */
    async mount(container) {
        console.log('[ProfileView] Mounting...');
        this.container = container;

        // Show loading state
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[60vh]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-theme mb-4"></div>
                <p class="text-gray-500">Profil yükleniyor...</p>
            </div>
        `;

        // 1. Check authentication
        const userInfo = await this.checkAuth();
        if (!userInfo) {
            console.log('[ProfileView] Not authenticated, redirecting to auth...');
            window.location.href = 'auth.html?redirect=profile';
            return;
        }

        // 2. Load dependencies
        await this.loadDependencies();

        // 3. Render template
        container.innerHTML = this.template();

        // 4. Initialize Profile module if available
        if (window.Profile) {
            // Determine if wizard or settings view
            const isFirstTime = !userInfo.role || !userInfo.full_name;

            if (isFirstTime) {
                this.currentView = 'wizard';
                document.getElementById('view-wizard')?.classList.remove('hidden');
                document.getElementById('view-settings')?.classList.add('hidden');
                Profile.Wizard.init(userInfo);
            } else {
                this.currentView = 'settings';
                document.getElementById('view-wizard')?.classList.add('hidden');
                document.getElementById('view-settings')?.classList.remove('hidden');
                Profile.Settings.init(userInfo);
            }
        }

        this.isLoaded = true;
        console.log('[ProfileView] Mounted successfully');
    },

    /**
     * Unmount the profile view
     */
    unmount() {
        console.log('[ProfileView] Unmounting...');
        this.isLoaded = false;
        this.container = null;
    },

    /**
     * Handle logout
     */
    logout() {
        if (window.Profile && typeof Profile.logout === 'function') {
            Profile.logout();
        } else if (window.Auth && typeof Auth.signOut === 'function') {
            Auth.signOut();
            window.location.href = 'index.html';
        } else {
            sessionStorage.removeItem('studentSession');
            window.location.href = 'index.html';
        }
    },

    /**
     * Navigate to home
     */
    goHome() {
        if (window.Navbar && typeof Navbar.navigateSPA === 'function') {
            Navbar.navigateSPA('/');
        } else {
            window.location.href = 'index.html';
        }
    },
};

// Expose globally
window.ProfileView = ProfileView;

// Also expose Wizard for onclick handlers in template
window.Wizard = {
    selectRole: (role) => Profile?.Wizard?.selectRole?.(role),
    nextStep: () => Profile?.Wizard?.nextStep?.(),
    prevStep: () => Profile?.Wizard?.prevStep?.(),
    complete: () => Profile?.Wizard?.complete?.(),
};

// loadDistricts for wizard compatibility
// loadDistricts for wizard compatibility
window.loadDistricts = (cityId, districtId) => {
    const citySelect = document.getElementById(cityId);
    const districtSelect = document.getElementById(districtId);

    // Use turkeyData (defined in data/cities.js) or fallback to Cities.districts if available
    const cityData = window.turkeyData || (window.Cities && window.Cities.districts);

    if (!citySelect || !districtSelect || !cityData) {
        console.warn('[ProfileView] Missing city data or elements');
        return;
    }

    const selectedCity = citySelect.value;
    const districts = cityData[selectedCity] || [];

    districtSelect.innerHTML = '<option value="">İlçe Seçiniz</option>';
    districts.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        districtSelect.appendChild(opt);
    });
};
