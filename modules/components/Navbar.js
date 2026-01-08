/**
 * Navbar Modülü
 * Tüm sayfalardaki üst menüyü tek bir yerden yönetir.
 * Bağımlılıklar: Auth, Search, I18n, ThemeManager
 */

const Navbar = {
    /**
     * SPA içinde miyiz kontrol et (index.html)
     */
    isOnSPA: () => {
        const path = window.location.pathname;
        return (
            path.endsWith('index.html') ||
            path.endsWith('/') ||
            path.endsWith('-Yeti-LAB') ||
            path.endsWith('-Yeti-LAB/')
        );
    },

    /**
     * SPA navigasyonu - ayrı sayfalardayken doğru yönlendirme yapar
     * @param {string} route - Hedef route (orn: '/', '/admin', '/teacher')
     */
    navigateSPA: (route) => {
        // Ana sayfaya dönüyorsa query parametrelerini temizle
        if (route === '/' && window.location.search) {
            // URL'deki ?course=... gibi parametreleri temizle
            const cleanUrl = window.location.pathname + '#/';
            window.history.replaceState(null, '', cleanUrl);
        }

        if (Navbar.isOnSPA()) {
            // index.html içindeyiz, Router kullan
            if (window.Router) {
                Router.navigate(route);
            } else {
                window.location.hash = '#' + route;
            }
        } else {
            // Ayrı sayfadayız (profile.html, auth.html vs), index.html'e yönlendir
            window.location.href = 'index.html#' + route;
        }
    },
    render: (containerId = 'main-header') => {
        const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!container) return;

        // Navbar HTML Şablonu
        const html = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20 items-center">
                
                <!-- Logo -->
                <a href="index.html#/" 
                   onclick="event.preventDefault(); Navbar.navigateSPA('/');" 
                   class="flex-shrink-0 flex items-center gap-3 cursor-pointer group no-underline">
                    <div class="relative w-10 h-10 transition-transform group-hover:scale-110 duration-300">
                        <div class="absolute inset-0 bg-gradient-to-tr from-theme to-cyan-300 rounded-xl rotate-6 group-hover:rotate-12 transition-transform opacity-20"></div>
                        <div class="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                <img src="img/logo.svg" alt="YetiLAB" class="w-8 h-8 object-contain" />
                        </div>
                    </div>
                    <div class="flex flex-col brand-logo">
                        <span class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight leading-none group-hover:text-theme transition-colors">Yeti<span class="brand-lab text-theme">LAB</span></span>
                    </div>
                </a>

                <div class="flex-1 max-w-xl mx-8 hidden lg:block relative group">
                    <input type="text" 
                        oninput="window.Search?.handle(this.value)" 
                        placeholder="Ders, konu veya proje ara..."
                        class="block w-full pl-4 pr-4 py-3 border-2 border-gray-100 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-theme focus:ring-4 focus:ring-theme/10 transition-all bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-200"
                    >
                    <div id="searchResults" class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 hidden z-50 max-h-96 overflow-y-auto"></div>
                </div>

                <!-- Right Menu -->
                <div class="flex items-center gap-3">
                    
                    <!-- Mobile Search Toggle -->
                    <button onclick="UI.toggleMobileSearch()" 
                        class="lg:hidden p-2 text-gray-500 hover:text-theme hover:bg-gray-50 rounded-lg transition-colors">
                        <span class="text-xl">🔍</span>
                    </button>

                    <!-- Themes -->
                    <div class="h-8 flex items-center gap-1">
                    </div>

                    <!-- Language -->
                    <button onclick="window.I18n?.toggle()" 
                        class="p-2 text-gray-600 hover:text-theme rounded-lg hover:bg-gray-100 font-bold border border-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center transform hover:scale-105 transition-all"
                        title="Dil Değiştir / Change Language">
                        <span id="lang-text" class="text-sm">TR</span>
                    </button>

                    <!-- Auth Menu -->
                    <div id="navbar-auth-section" class="ml-2">
                        <!-- Loading State -->
                        <div class="animate-pulse flex space-x-2">
                            <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        container.innerHTML = html;
        Navbar.updateAuthUI();

        // Dark mode güncelleme
        if (window.ThemeManager) window.ThemeManager.load();
    },

    // Auth durumunu güncelle (Retry logic ile)
    updateAuthUI: (retryCount = 0) => {
        const container = document.getElementById('navbar-auth-section');

        // Race Condition Fix: Eğer container henüz render edilmediyse bekle
        if (!container) {
            if (retryCount < 10) {
                setTimeout(() => Navbar.updateAuthUI(retryCount + 1), 100);
            }
            return;
        }

        // Auth verisini önce Store'dan, yoksa Auth modülünden al
        const currentUser = window.Store?.getState()?.user || window.Auth?.currentUser;

        if (currentUser) {
            // Logged In
            const user = currentUser;
            const meta = user.user_metadata || {};
            const role = meta.role || 'student';
            const isTeacher = role === 'teacher' || (window.Auth && window.Auth.isTeacher());

            // Avatar İşlemi
            const avatarUrl = meta.avatar_url || '👤';
            const isEmoji = !avatarUrl.includes('.');
            const avatarHtml = isEmoji
                ? `<span class="text-xl">${avatarUrl}</span>`
                : `<img src="${avatarUrl}" class="w-6 h-6 rounded-full object-cover">`;

            // Admin kontrolü
            const isAdmin = window.Auth && window.Auth.isAdmin();

            container.innerHTML = `
                <div class="relative group" id="user-menu-wrapper">
                    <button onclick="document.getElementById('user-dropdown').classList.toggle('hidden')" 
                        class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 group-hover:border-theme transition-colors">
                            ${avatarHtml}
                        </div>
                        <span class="hidden md:inline font-bold text-gray-700 dark:text-gray-200 text-sm max-w-[100px] truncate">${meta.full_name || 'Kullanıcı'}</span>
                        <span class="text-xs text-gray-400">▼</span>
                    </button>

                    <!-- Dropdown Wrapper (Bridge) -->
                    <div id="user-dropdown" class="absolute right-0 top-full pt-2 w-56 hidden group-hover:block z-50">
                        <!-- Dropdown Content -->
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div class="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                                    ${avatarHtml}
                                </div>
                                <div>
                                    <div class="font-bold text-gray-800 dark:text-white text-sm">${meta.full_name || 'Misafir'}</div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">${isAdmin ? 'Yönetici Hesabı' : isTeacher ? 'Eğitmen Hesabı' : 'Öğrenci Hesabı'}</div>
                                </div>
                            </div>
                            
                            <div class="py-1">
                                <a href="index.html#/profile" onclick="event.preventDefault(); Navbar.navigateSPA('/profile')" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-theme transition-colors">
                                    <span>👤</span> Profilim
                                </a>
                                ${
                                    isTeacher
                                        ? `
                                <a href="index.html#/teacher" onclick="event.preventDefault(); Navbar.navigateSPA('/teacher')" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                                    <span>👨‍🏫</span> Öğretmen Paneli
                                </a>`
                                        : ''
                                }
                                ${
                                    isAdmin
                                        ? `
                                <a href="index.html#/admin" onclick="event.preventDefault(); Navbar.navigateSPA('/admin')" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-purple-600 transition-colors">
                                    <span>⚙️</span> Admin Paneli
                                </a>`
                                        : ''
                                }
                            </div>
                            
                            <div class="border-t border-gray-100 dark:border-gray-700 p-1">
                                <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors font-medium">
                                    <span>🚪</span> Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Dışarı tıklayınca menüyü kapat
            document.addEventListener('click', (e) => {
                const wrapper = document.getElementById('user-menu-wrapper');
                const dropdown = document.getElementById('user-dropdown');
                if (wrapper && !wrapper.contains(e.target) && dropdown && !dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('hidden');
                }
            });
        } else {
            // Logged Out
            container.innerHTML = `
                <a href="auth.html" class="flex items-center gap-2 px-5 py-2.5 bg-theme text-white rounded-xl font-bold shadow-lg shadow-theme/20 hover:shadow-theme/40 hover:-translate-y-0.5 transition-all">
                    <span>🚀</span>
                    <span>Giriş Yap</span>
                </a>
            `;
        }
    },

    // Sayfa yüklenince otomatik çalışsın
    init: () => {
        Navbar.render();

        // Store dinleyicisi: State değişirse UI'ı güncelle
        if (window.Store) {
            window.Store.subscribe((state, prevState) => {
                // Sadece user veya profile değiştiyse güncelle
                if (state.user !== prevState?.user || state.userProfile !== prevState?.userProfile) {
                    Navbar.updateAuthUI();
                }
            });
        }
    },
};

window.Navbar = Navbar;
