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
        // Ana sayfaya dönüyorsa özel işlem yap
        if (route === '/') {
            // URL'deki ?course=... gibi parametreleri temizle
            if (window.location.search) {
                const cleanUrl = window.location.pathname + '#/';
                window.history.replaceState(null, '', cleanUrl);
            }

            // Doğrudan kurs seçim ekranını göster (Router'a güvenmeden)
            if (Navbar.isOnSPA() && window.app?.renderCourseSelection) {
                window.location.hash = '#/';
                app.renderCourseSelection(false);
                return;
            }
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
                        <span class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight leading-none group-hover:text-theme transition-colors">Yeti<span class="brand-lab text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 font-black">LAB</span></span>
                    </div>
                </a>

                <!-- Right Menu -->
                <div class="flex items-center gap-2">
                    
                    <!-- Search Icon (All screens) -->
                    <button onclick="UI.toggleMobileSearch()" 
                        class="p-2.5 text-gray-500 hover:text-theme hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                        title="Ara">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </button>

                    <!-- Notification Bell (Logged in only) -->
                    <div id="navbar-notification-section" class="relative hidden">
                        <!-- Will be populated by NotificationDropdown -->
                    </div>

                    <!-- Themes -->
                    <div class="h-8 flex items-center gap-1">
                    </div>

                    <!-- Language toggle removed - single language for now -->

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

        // Notification section
        const notificationSection = document.getElementById('navbar-notification-section');

        if (currentUser) {
            // Logged In - Show notification bell
            if (notificationSection) {
                notificationSection.classList.remove('hidden');
                Navbar.initNotifications();
            }

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
            // Logged Out - Hide notification bell
            if (notificationSection) {
                notificationSection.classList.add('hidden');
            }

            container.innerHTML = `
                <a href="auth.html" class="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 transition-all">
                    <span class="rocket-icon inline-block transition-transform group-hover:rotate-[-15deg] group-hover:-translate-y-0.5">🚀</span>
                    <span>Giriş Yap</span>
                </a>
            `;
        }
    },

    // Bildirimleri başlat
    initNotifications: async () => {
        const container = document.getElementById('navbar-notification-section');
        if (!container) return;

        // NotificationDropdown yüklü mü kontrol et
        if (!window.NotificationDropdown) {
            try {
                await import('/modules/components/NotificationDropdown.js');
            } catch (error) {
                console.error('[Navbar] NotificationDropdown yüklenemedi:', error);
                return;
            }
        }

        // Render bell icon and dropdown
        container.innerHTML = `
            ${NotificationDropdown.renderBellIcon()}
            ${NotificationDropdown.renderDropdown()}
        `;

        // Initialize NotificationDropdown
        await NotificationDropdown.init();
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
