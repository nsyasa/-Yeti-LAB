/**
 * Profile Module - Yeti LAB
 * Handles profile page logic, wizard, settings, and stats.
 */

const Profile = {
    avatars: window.Constants
        ? Constants.AVATARS
        : ['👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👦', '👧', '🧑', '🤖', '🐱', '🐶', '🚀', '⭐'],

    // State
    currentUser: null, // Supabase user or Student session object
    isStudentCodeAuth: false, // True if logged in via Classroom Code

    async init() {
        // Initialize dependencies
        if (typeof SupabaseClient !== 'undefined') SupabaseClient.init();
        if (typeof Auth !== 'undefined') await Auth.init();

        const userInfo = Auth.getUserInfo();

        if (!userInfo.isLoggedIn) {
            window.location.href = 'auth.html';
            return;
        }

        this.currentUser = userInfo.userId;
        this.isStudentCodeAuth = userInfo.isStudent && !userInfo.userId.startsWith('user_'); // Simplified check

        // Check if we show Wizard or Settings
        // For classroom students, profile is considered "complete" if they have a session
        // For Supabase users, check metadata

        const isProfileComplete = Auth.isProfileComplete || (userInfo.isStudent && !userInfo.isAdmin);
        // Note: Students via code usually just start.

        // Initial Header Render
        this.renderHeader(userInfo);

        if (isProfileComplete) {
            this.Settings.init(userInfo);
        } else {
            this.Wizard.init(userInfo);
        }
    },

    renderHeader(userInfo) {
        document.getElementById('headerName').textContent = userInfo.displayName;
        const avatarEl = document.getElementById('headerAvatar');
        const avatarUrl = userInfo.avatarUrl;

        if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:'))) {
            avatarEl.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
            avatarEl.classList.add('overflow-hidden');
        } else {
            avatarEl.textContent = avatarUrl || (userInfo.isStudent ? '🎓' : '👤');
            avatarEl.classList.remove('overflow-hidden');
        }
    },

    goHome() {
        window.location.href = 'index.html';
    },

    // --- WIZARD SUB-MODULE ---
    Wizard: {
        step: 1,
        data: { role: null, name: '', school: '', city: '', district: '', avatar: '' },
        userInfo: null,

        init(userInfo) {
            this.userInfo = userInfo;
            document.getElementById('view-wizard').classList.remove('hidden');

            // Pre-fill name if available
            if (userInfo.displayName && userInfo.displayName !== 'Misafir') {
                document.getElementById('wiz-name').value = userInfo.displayName;
            }

            this.renderAvatars('wiz-avatar-grid', (av) => {
                this.data.avatar = av;
                document
                    .querySelectorAll('#wiz-avatar-grid .avatar-option')
                    .forEach((el) => el.classList.remove('selected'));
                event.target.classList.add('selected');
            });

            this.loadCities('wiz-city');
        },

        selectRole(role) {
            this.data.role = role;
            document.querySelectorAll('.role-card').forEach((el) => el.classList.remove('selected'));
            event.currentTarget.classList.add('selected');
            document.getElementById('wiz-btn-1').disabled = false;
            document.getElementById('wiz-btn-1').classList.replace('bg-gray-200', 'bg-theme');
            document.getElementById('wiz-btn-1').classList.replace('text-gray-400', 'text-white');
        },

        nextStep() {
            if (this.step === 1 && !this.data.role) return;
            document.getElementById(`wizard-step-${this.step}`).classList.add('hidden');
            this.step++;
            document.getElementById(`wizard-step-${this.step}`).classList.remove('hidden');

            const dots = document.querySelectorAll('.step-dot');
            if (dots[this.step - 1]) {
                dots[this.step - 1].classList.replace('bg-gray-200', 'bg-theme');
                dots[this.step - 1].classList.add('ring-4', 'ring-theme/20');
            }
        },

        prevStep() {
            if (this.step === 1) return;
            document.getElementById(`wizard-step-${this.step}`).classList.add('hidden');
            this.step--;
            document.getElementById(`wizard-step-${this.step}`).classList.remove('hidden');
        },

        renderAvatars(containerId, cb) {
            const container = document.getElementById(containerId);
            container.innerHTML = Profile.avatars
                .map(
                    (av) =>
                        `<div onclick="event.stopPropagation();" class="avatar-option text-4xl p-4 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-transparent">
                    ${av}
                </div>`
                )
                .join('');

            Array.from(container.children).forEach((el, idx) => {
                el.onclick = (e) => cb(Profile.avatars[idx]);
            });
        },

        loadCities(id) {
            const select = document.getElementById(id);
            if (!window.turkeyData) return;
            Object.keys(window.turkeyData)
                .sort((a, b) => a.localeCompare(b, 'tr'))
                .forEach((city) => {
                    select.add(new Option(city, city));
                });
        },

        async complete() {
            this.data.name = document.getElementById('wiz-name').value;
            this.data.school = document.getElementById('wiz-school').value;
            this.data.city = document.getElementById('wiz-city').value;
            this.data.district = document.getElementById('wiz-district').value;
            if (!this.data.avatar) this.data.avatar = '👤';

            const btn = document.getElementById('wiz-complete-btn');
            btn.disabled = true;
            btn.innerHTML = 'Kaydediliyor...';

            await Profile.Editor.saveToSupabase(this.data, btn, 'wiz-error', () => {
                if (typeof Toast !== 'undefined') Toast.show('Profil oluşturuldu! Yönlendiriliyorsunuz...', 'success');
                setTimeout(() => (window.location.href = 'index.html'), 1000);
            });
        },
    },

    // --- SETTINGS (MAIN VIEW) SUB-MODULE ---
    Settings: {
        async init(userInfo) {
            document.getElementById('view-settings').classList.remove('hidden');

            // Populate Hero
            Profile.Editor.populateHero(userInfo);

            // Populate Fields
            Profile.Editor.populateFields(userInfo);

            // Load extra data
            Profile.Editor.loadCities();
            Profile.Editor.renderAvatars();

            // Load Stats (Wait for it)
            await Profile.Editor.loadStats();
        },
    },

    // --- EDITOR LOGIC ---
    Editor: {
        currentAvatar: null,

        populateHero(userInfo) {
            // Hero Basics
            document.getElementById('hero-name').textContent = userInfo.displayName;
            document.getElementById('hero-email').textContent = userInfo.studentInfo
                ? userInfo.studentInfo.classroomName
                : Auth.currentUser?.email || '';

            const roleText = userInfo.isTeacher ? 'Öğretmen' : 'Öğrenci';
            document.getElementById('hero-role-badge').textContent = roleText;

            // Date
            const dateStr = Auth.currentUser?.created_at
                ? new Date(Auth.currentUser.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
                : 'Ocak 2026';
            document.getElementById('hero-joined').textContent = 'Katılım: ' + dateStr;

            // Avatar
            const heroAvatarEl = document.getElementById('profile-hero-avatar');
            const heroEmojiEl = document.getElementById('hero-avatar-emoji');

            if (
                userInfo.avatarUrl &&
                (userInfo.avatarUrl.startsWith('http') || userInfo.avatarUrl.startsWith('data:'))
            ) {
                heroAvatarEl.innerHTML = `<img src="${userInfo.avatarUrl}" alt="Avatar" class="w-full h-full object-cover rounded-full">`;
                heroAvatarEl.classList.add('overflow-hidden', 'bg-transparent');
            } else {
                heroEmojiEl.textContent = userInfo.avatarUrl || (userInfo.isStudent ? '🎓' : '👤');
                heroAvatarEl.classList.remove('overflow-hidden', 'bg-transparent');
            }

            // Show Teacher Link
            if (userInfo.isTeacher) {
                document.getElementById('teacher-panel-link').classList.remove('hidden');
            }
        },

        populateFields(userInfo) {
            const meta = Auth.profileData || Auth.currentUser?.user_metadata || {};

            document.getElementById('view-name').textContent = userInfo.displayName || '—';
            document.getElementById('view-school').textContent = meta.school_name || '—';
            document.getElementById('view-city').textContent = meta.city || '—';
            document.getElementById('view-district').textContent = meta.district || '—';

            // Form Inputs
            document.getElementById('edit-name').value = userInfo.displayName || '';
            document.getElementById('edit-school').value = meta.school_name || '';

            // Connection Type
            const provider = Auth.currentUser?.app_metadata?.provider;
            let connText = '📧 Email';
            if (provider === 'google') connText = '✅ Google';
            if (provider === 'github') connText = '✅ GitHub';
            if (userInfo.isStudent && !Auth.currentUser) connText = '🔑 Sınıf Kodu';
            document.getElementById('view-connections').textContent = connText;
        },

        async loadStats() {
            // Load stats using Progress module
            // Only if logged in (which we checked in init)
            if (window.Progress) {
                // Ensure auth is initialized inside Progress if needed, but we did Auth.init() already
                // Explicitly call init/load to ensure data is fresh
                await Progress.init();

                const stats = Progress.getStats();

                const setVal = (id, val) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = val;
                };

                setVal('stat-lessons', stats.totalLessons);
                setVal('stat-badges', stats.badges);
                setVal('stat-streak', stats.streak);
                setVal('stat-quiz', stats.quizAvg + '%');

                // Level UI
                setVal('hero-level-badge', 'Level ' + stats.level);
                setVal('hero-xp', stats.xp);
                setVal('hero-next-xp', stats.nextLevelXP);

                const xpBar = document.getElementById('hero-xp-bar');
                if (xpBar) xpBar.style.width = stats.levelProgress + '%';

                this.renderBadgeGallery(stats.earnedBadges);
                this.renderHeatmap(Progress.dates);
            }
        },

        renderHeatmap(dates) {
            const container = document.getElementById('activity-heatmap');
            if (!container) return;

            const activityMap = {};
            (dates || []).forEach((dateStr) => {
                const d = new Date(dateStr).toISOString().split('T')[0];
                activityMap[d] = (activityMap[d] || 0) + 1;
            });

            const today = new Date();
            let html = '';

            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const iso = d.toISOString().split('T')[0];
                const dateDisplay = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                const count = activityMap[iso] || 0;

                let colorClass = 'bg-gray-100 dark:bg-gray-700';
                if (count > 0) colorClass = 'bg-theme/40';
                if (count > 2) colorClass = 'bg-theme';

                html += `
                    <div class="group relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colorClass} transition-all hover:scale-110 cursor-default">
                        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-gray-900 text-white text-xs p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none text-center">
                            <p class="font-bold">${dateDisplay}</p>
                            <p>${count} ders</p>
                        </div>
                    </div>
                `;
            }
            container.innerHTML = html;
        },

        renderBadgeGallery(earnedBadges) {
            const container = document.getElementById('badge-gallery');
            if (!container || !window.BadgeSystem) return;

            const allBadges = window.BadgeSystem.getAll();
            const earnedIds = earnedBadges.map((b) => (typeof b === 'string' ? b : b.id));

            container.innerHTML = allBadges
                .map((badge) => {
                    const isEarned = earnedIds.includes(badge.id);
                    const opacity = isEarned ? 'opacity-100' : 'opacity-40 grayscale';
                    const border = isEarned ? 'border-theme bg-theme/5' : 'border-gray-200 bg-gray-50';

                    return `
                    <div class="group relative p-4 rounded-xl border-2 ${border} ${opacity} transition-all hover:scale-105 flex flex-col items-center text-center gap-2">
                        <div class="text-4xl mb-1">${isEarned ? badge.icon : '🛡️'}</div>
                        <div class="font-bold text-sm text-gray-800 dark:text-gray-200">${badge.title}</div>
                        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-900 text-white text-xs p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                            <p class="font-bold mb-1">${badge.title}</p>
                            <p>${badge.description}</p>
                            ${!isEarned ? '<p class="mt-1 text-yellow-300 font-bold">Nasıl kazanılır?</p>' : '<p class="mt-1 text-green-300 font-bold">Kazanıldı! 🎉</p>'}
                        </div>
                    </div>`;
                })
                .join('');
        },

        // --- EDIT METHODS ---
        toggleEdit(cardId) {
            const card = document.getElementById(`card-${cardId}`);
            card.classList.toggle('editing');
        },

        cancelEdit(cardId) {
            document.getElementById(`card-${cardId}`).classList.remove('editing');
            if (cardId === 'security') {
                document.getElementById('new-password').value = '';
                document.getElementById('new-password-confirm').value = '';
            }
        },

        async savePersonal() {
            const btn = document.querySelector('#card-personal .btn-save');
            const originalText = btn.innerHTML;
            btn.textContent = 'Kaydediliyor...';
            btn.disabled = true;

            const data = {
                name: document.getElementById('edit-name').value,
                school: document.getElementById('edit-school').value,
                city: document.getElementById('edit-city').value,
                district: document.getElementById('edit-district').value,
                avatar: this.currentAvatar || document.getElementById('hero-avatar-emoji').textContent,
                role: Auth.userRole,
            };

            await this.saveToSupabase(data, btn, null, () => {
                // UI Updates
                document.getElementById('view-name').textContent = data.name;
                document.getElementById('hero-name').textContent = data.name;
                document.getElementById('view-school').textContent = data.school;
                document.getElementById('view-city').textContent = data.city;
                document.getElementById('view-district').textContent = data.district;

                this.cancelEdit('personal');
                if (typeof Toast !== 'undefined') Toast.show('Bilgiler güncellendi', 'success');
            });
        },

        async savePassword() {
            const p1 = document.getElementById('new-password').value;
            const p2 = document.getElementById('new-password-confirm').value;

            if (!Validators.minLength(p1, 6)) {
                Toast?.show('Şifre en az 6 karakter olmalı', 'error');
                return;
            }
            if (!Validators.passwordsMatch(p1, p2)) {
                Toast?.show('Şifreler eşleşmiyor', 'error');
                return;
            }

            // If Student Code Auth
            const userInfo = Auth.getUserInfo();
            if (userInfo.isStudent && !userInfo.userId.startsWith('user_')) {
                // Update student password via RPC or Table (if allowed)
                // For now show generic error as classroom students might not have pswd change permission easily
                // Actually we have saveStudentChanges logic in old file.
                // Let's implement simplified student update
                try {
                    const { error } = await SupabaseClient.getClient()
                        .from('students')
                        .update({ password: p1 })
                        .eq('id', userInfo.userId);
                    if (error) throw error;
                    Toast?.show('Şifre güncellendi', 'success');
                    this.cancelEdit('security');
                } catch (e) {
                    Toast?.show('Hata: ' + e.message, 'error');
                }
                return;
            }

            // If Supabase Auth
            try {
                const { error } = await SupabaseClient.getClient().auth.updateUser({ password: p1 });
                if (error) throw error;
                Toast?.show('Şifre güncellendi', 'success');
                this.cancelEdit('security');
            } catch (e) {
                Toast?.show('Hata: ' + e.message, 'error');
            }
        },

        toggleAvatarSelector() {
            document.getElementById('avatar-selector-popup').classList.toggle('hidden');
        },

        renderAvatars() {
            const grid = document.getElementById('avatar-grid');
            grid.innerHTML = Profile.avatars
                .map(
                    (av) =>
                        `<div class="avatar-option text-2xl p-2 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-transparent cursor-pointer hover:border-theme" onclick="Profile.Editor.selectAvatar('${av}')">${av}</div>`
                )
                .join('');
        },

        selectAvatar(av) {
            this.currentAvatar = av;
            document.getElementById('hero-avatar-emoji').textContent = av;
            this.toggleAvatarSelector();
        },

        // Save Helper
        async saveToSupabase(data, btn, errorId, successCb, originalText = 'Kaydet') {
            try {
                // If Student (Classroom)
                const userInfo = Auth.getUserInfo();
                if (userInfo.isStudent && !userInfo.userId.startsWith('user_')) {
                    // Update 'students' table
                    const { error } = await SupabaseClient.getClient()
                        .from('students')
                        .update({
                            display_name: data.name,
                            // Classroom students don't usually store city/district in their table schema yet
                            // We focus on display_name
                        })
                        .eq('id', userInfo.userId);

                    if (error) throw error;

                    // Update Local Session
                    const session = JSON.parse(localStorage.getItem('yeti_student_session') || '{}');
                    session.displayName = data.name;
                    localStorage.setItem('yeti_student_session', JSON.stringify(session));
                } else {
                    // Standard Supabase Auth Update
                    const updates = {
                        full_name: data.name,
                        school_name: data.school,
                        city: data.city,
                        district: data.district,
                        avatar_url: data.avatar,
                        role: data.role,
                        profile_completed: true,
                    };

                    const { error: metaError } = await SupabaseClient.getClient().auth.updateUser({ data: updates });
                    if (metaError) throw metaError;

                    // Try Table Update
                    try {
                        await SupabaseClient.getClient()
                            .from('user_profiles')
                            .upsert({
                                id: userInfo.userId,
                                ...updates,
                                email: Auth.currentUser?.email,
                            });
                    } catch (_e) {
                        console.warn('Profile table update skipped');
                    }
                }

                btn.textContent = '✅ Kaydedildi';
                if (successCb) successCb();
            } catch (err) {
                console.error(err);
                if (typeof Toast !== 'undefined') Toast.show('Hata: ' + err.message, 'error');
                if (errorId) {
                    document.getElementById(errorId).textContent = err.message;
                    document.getElementById(errorId).classList.remove('hidden');
                }
            } finally {
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }, 2000);
            }
        },

        loadCities() {
            const select = document.getElementById('edit-city');
            if (!select || !window.turkeyData) return;
            select.innerHTML = '<option value="">Seçiniz</option>';
            Object.keys(window.turkeyData)
                .sort((a, b) => a.localeCompare(b, 'tr'))
                .forEach((c) => select.add(new Option(c, c)));
        },

        loadDistricts() {
            const city = document.getElementById('edit-city').value;
            const distSelect = document.getElementById('edit-district');
            distSelect.innerHTML = '<option value="">Seçiniz</option>';
            if (city && window.turkeyData[city]) {
                window.turkeyData[city].forEach((d) => distSelect.add(new Option(d, d)));
            }
        },

        setTheme(theme) {
            if (window.ThemeManager) ThemeManager.setTheme(theme);
            // Update UI buttons
            const isLight = theme === 'light';
            document.getElementById('theme-light-btn').classList.toggle('bg-theme', isLight);
            document.getElementById('theme-light-btn').classList.toggle('text-white', isLight);
            document.getElementById('theme-dark-btn').classList.toggle('bg-theme', !isLight);
            document.getElementById('theme-dark-btn').classList.toggle('text-white', !isLight);
        },
    },

    logout() {
        Auth.signOut().then(() => {
            if (Auth.isStudent()) Auth.studentLogout();
            window.location.href = 'auth.html';
        });
    },
};

window.Profile = Profile;
window.ProfileEditor = Profile.Editor; // Backward compatibility
window.Wizard = Profile.Wizard; // Backward compatibility
window.loadDistricts = (cid, did) => Profile.Editor.loadDistricts(); // Helper
