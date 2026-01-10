/**
 * Auth UI Manager
 * Handles UI interactions related to authentication
 * Coordinates between Auth module and UI elements
 */

const AuthUI = {
    /**
     * Initialize Auth UI listeners and state
     */
    init: async () => {
        // Check if Auth module is loaded
        if (typeof Auth === 'undefined') {
            console.log('[AuthUI] Auth module not loaded, showing login button');
            AuthUI.updateUserUI(null);
            return;
        }

        try {
            await Auth.init();

            // Handle Profile Completion Redirects
            const isProfilePage = window.location.pathname.includes('profile.html');
            const redirectCount = parseInt(sessionStorage.getItem('profile_redirect_count') || '0');
            const MAX_REDIRECTS = 3;

            if (Auth.needsProfileCompletion() && !isProfilePage && redirectCount < MAX_REDIRECTS) {
                console.log(
                    `[AuthUI] Profile incomplete, redirecting to profile.html (attempt ${redirectCount + 1}/${MAX_REDIRECTS})`
                );
                sessionStorage.setItem('profile_redirect_count', String(redirectCount + 1));
                if (window.Router) {
                    Router.redirectTo('profile.html');
                } else {
                    window.location.href = 'profile.html';
                }
                return;
            }

            // Reset redirect count if profile is complete or already on profile page
            if (!Auth.needsProfileCompletion()) {
                sessionStorage.removeItem('profile_redirect_count');
            }

            if (redirectCount >= MAX_REDIRECTS && Auth.needsProfileCompletion()) {
                console.error('[AuthUI] Max profile redirects reached, possible loop detected.');
                if (window.Toast) Toast.error('Profil yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.');
            }

            // Initialize Progress Module (dependency on Auth)
            if (window.Progress && window.Progress.init) {
                await window.Progress.init();
            }

            // Initial UI Update
            AuthUI.updateUserUI(Auth.getUserInfo());

            // Listen for Auth Changes
            Auth.onAuthStateChange(async (event, _session, _role) => {
                AuthUI.updateUserUI(Auth.getUserInfo());

                if (event === 'SIGNED_IN') {
                    // Logic for post-signin redirection and data loading
                    const currentIsProfilePage = window.location.pathname.includes('profile.html');
                    const currentRedirectCount = parseInt(sessionStorage.getItem('profile_redirect_count') || '0');

                    if (
                        Auth.needsProfileCompletion() &&
                        !currentIsProfilePage &&
                        currentRedirectCount < MAX_REDIRECTS
                    ) {
                        sessionStorage.setItem('profile_redirect_count', String(currentRedirectCount + 1));
                        if (window.Router) {
                            Router.redirectTo('profile.html');
                        } else {
                            window.location.href = 'profile.html';
                        }
                    } else if (!Auth.needsProfileCompletion()) {
                        sessionStorage.removeItem('profile_redirect_count');
                        if (window.Progress && window.Progress.loadFromServer) {
                            await window.Progress.loadFromServer();
                        }
                    }
                }
            });
        } catch (err) {
            console.warn('[AuthUI] Auth init error:', err);
            if (window.Toast) Toast.apiError(err, 'Kimlik doğrulama');
            AuthUI.updateUserUI(null);
        }
    },

    /**
     * Update User Interface based on auth state
     * @param {Object} userInfo - User information object
     */
    updateUserUI: (userInfo) => {
        // Delegate to Navbar component if available (Modern Approach)
        if (window.Navbar && window.Navbar.updateAuthUI) {
            window.Navbar.updateAuthUI();
            return;
        }

        // Legacy/Fallback UI Update (Direct DOM manipulation)
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');
        const teacherLink = document.getElementById('teacher-link');

        if (!loginBtn || !userMenu) return;

        if (userInfo && userInfo.isLoggedIn) {
            loginBtn.classList.add('hidden');
            loginBtn.classList.remove('md:flex');
            userMenu.classList.remove('hidden');

            if (userName) userName.textContent = userInfo.displayName || 'Kullanıcı';

            if (userAvatar) {
                if (userInfo.avatarUrl) {
                    const isEmoji = /^[\p{Emoji}\u200d]+$/u.test(userInfo.avatarUrl) || userInfo.avatarUrl.length <= 4;
                    const isUrl =
                        userInfo.avatarUrl.startsWith('http') ||
                        userInfo.avatarUrl.startsWith('/') ||
                        userInfo.avatarUrl.includes('.');

                    if (isUrl && !isEmoji) {
                        userAvatar.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = userInfo.avatarUrl;
                        img.className = 'w-8 h-8 rounded-full object-cover';
                        img.alt = '';
                        img.onerror = () => {
                            userAvatar.textContent = '👤';
                        };
                        userAvatar.appendChild(img);
                    } else {
                        userAvatar.textContent = userInfo.avatarUrl;
                    }
                } else {
                    userAvatar.textContent = userInfo.isStudent ? '🎓' : '👨‍🏫';
                }
            }

            if (teacherLink) {
                if (userInfo.isTeacher || userInfo.isAdmin) {
                    teacherLink.classList.remove('hidden');
                    teacherLink.classList.add('flex');
                } else {
                    teacherLink.classList.add('hidden');
                }
            }
        } else {
            loginBtn.classList.remove('hidden');
            loginBtn.classList.add('md:flex');
            userMenu.classList.add('hidden');
        }
    },

    /**
     * Toggle User Dropdown Menu
     */
    toggleUserMenu: () => {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');

            if (!dropdown.classList.contains('hidden')) {
                setTimeout(() => {
                    document.addEventListener('click', AuthUI.closeUserMenu, { once: true });
                }, 10);
            }
        }
    },

    /**
     * Close User Dropdown Menu
     */
    closeUserMenu: (e) => {
        const dropdown = document.getElementById('user-dropdown');
        const userMenu = document.getElementById('user-menu');
        if (dropdown && userMenu && !userMenu.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    },

    /**
     * Handle Logout
     */
    logout: async () => {
        if (typeof Auth === 'undefined') {
            if (window.Router) Router.redirectTo('auth.html');
            else window.location.href = 'auth.html';
            return;
        }

        try {
            // Attempt server-side sign out
            await Auth.signOut();
        } catch (err) {
            // Log but continue cleanup - if session is missing, we still want to clear local state
            console.warn('[AuthUI] Server logout warning (continuing local cleanup):', err);
        }

        try {
            // Also clear student session if any
            if (Auth.studentLogout) Auth.studentLogout();

            AuthUI.updateUserUI(null);
            window.location.reload();
        } catch (err) {
            console.error('[AuthUI] Local cleanup error:', err);
            // Fallback redirect
            window.location.href = 'auth.html';
        }
    },
};

// Expose globally
if (typeof window !== 'undefined') {
    window.AuthUI = AuthUI;
}
