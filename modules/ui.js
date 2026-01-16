/* global Services */
/**
 * UI Module
 * Handles all DOM manipulation and HTML generation.
 */

const UI = {
    // --- View Transitions ---
    /**
     * Switch between views with smooth transition
     * @param {string} showId - ID of the view to show
     */
    switchView: (showId) => {
        // Core views that are always in the DOM
        const coreViews = ['course-selection-view', 'dashboard-view', 'project-view'];
        // Dynamic SPA views (created on demand)
        const spaViews = [
            'teacher-view-container',
            'admin-view-container',
            'profile-view-container',
            'student-dashboard-container',
        ];
        const allViews = [...coreViews, ...spaViews];

        const showEl = document.getElementById(showId);
        if (!showEl) {
            console.warn(`[UI] View not found: ${showId}`);
            return;
        }

        // Find currently visible view
        const currentId = allViews.find((id) => {
            const el = document.getElementById(id);
            return el && !el.classList.contains('hidden');
        });
        const currentEl = currentId ? document.getElementById(currentId) : null;

        if (currentId === showId) return; // Already on this view

        // 1. Exit current view
        if (currentEl) {
            currentEl.classList.add('view-exit-start');
            requestAnimationFrame(() => {
                currentEl.classList.add('view-exit-active');
            });

            // Wait for exit animation
            setTimeout(() => {
                currentEl.classList.add('hidden');
                currentEl.classList.remove('view-exit-start', 'view-exit-active');

                // 2. Enter new view
                showEl.classList.remove('hidden');
                showEl.classList.add('view-enter-start');

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        showEl.classList.remove('view-enter-start');
                        showEl.classList.add('view-enter-active');

                        // Cleanup after enter animation
                        setTimeout(() => {
                            showEl.classList.remove('view-enter-active');
                        }, 300);
                    });
                });
            }, 300); // Matches CSS transition duration
        } else {
            // First load (no transition)
            allViews.forEach((id) => {
                const el = document.getElementById(id);
                if (!el) return;
                if (id === showId) el.classList.remove('hidden');
                else el.classList.add('hidden');
            });
        }

        // Ders Listesi butonunu sadece kurs içinde göster (dashboard veya project view)
        const lessonsBtn = document.getElementById('btn-lessons-nav');
        if (lessonsBtn) {
            const inCourseView = ['dashboard-view', 'project-view'].includes(showId);
            if (inCourseView) {
                lessonsBtn.classList.remove('hidden');
            } else {
                lessonsBtn.classList.add('hidden');
            }
        }
    },

    // --- Course Selection Screen ---
    renderCourseSelection: (manifest) => {
        UI.switchView('course-selection-view');

        const container = document.getElementById('course-list');
        if (!container) return;
        // ============================================
        // STALE-WHILE-REVALIDATE PATTERN
        // Prevent flickering: Don't replace existing content unnecessarily
        // ============================================
        const existingCards = container.querySelectorAll('.course-card');
        const hasValidContent = existingCards.length > 0 && !container.querySelector('.skeleton-card');
        const courseCount = Object.keys(manifest).length;

        // Skip full re-render if content already matches (same card count)
        // This prevents the flicker: content -> blank -> content
        if (hasValidContent && existingCards.length === courseCount) {
            console.log('[UI] Stale-While-Revalidate: Content already rendered, skipping re-render');
            return; // Content is already good, no need to re-render
        }

        // Remove any existing "Show All" buttons (prevent duplicates)
        document.querySelectorAll('#show-all-courses-btn').forEach((el) => el.remove());

        // Check if user is logged in as student for progress display
        const isStudent = typeof Auth !== 'undefined' && Auth.isStudent() && Auth.currentStudent;
        const progressData = typeof Progress !== 'undefined' ? Progress.data : {};

        // Dynamic CTA texts based on course type
        const ctaTexts = {
            default: ['Keşfet', 'Başla', 'Hadi Başla!'],
            robot: ['Robotunu Kodla!', 'Maceraya Atıl', 'İlk Robotunu Yap'],
            scratch: ['Oyun Yapmaya Başla!', 'Hayal Et & Kodla', 'Yaratıcılığını Göster'],
            web: ['İlk Siteni Yap!', 'Tasarlamaya Başla', 'Kodlamaya Başla'],
            python: ['Python Yolculuğu', 'Kodlamaya Başla', 'Programcı Ol'],
            inProgress: ['Kaldığın Yerden Devam Et', 'Devam Et →', 'Hadi Bitir!'],
            completed: ['Tekrar Çöz', 'Ustalaş', 'Pekiştir'],
        };

        // Get appropriate CTA based on course key and progress
        const getCTA = (key, percentage) => {
            if (percentage >= 100) {
                return ctaTexts.completed[Math.floor(Math.random() * ctaTexts.completed.length)];
            }
            if (percentage > 0) {
                return ctaTexts.inProgress[Math.floor(Math.random() * ctaTexts.inProgress.length)];
            }

            // Match course type
            const keyLower = key.toLowerCase();
            if (keyLower.includes('mbot') || keyLower.includes('robot') || keyLower.includes('arduino')) {
                return ctaTexts.robot[Math.floor(Math.random() * ctaTexts.robot.length)];
            }
            if (keyLower.includes('scratch') || keyLower.includes('oyun')) {
                return ctaTexts.scratch[Math.floor(Math.random() * ctaTexts.scratch.length)];
            }
            if (keyLower.includes('web') || keyLower.includes('html') || keyLower.includes('css')) {
                return ctaTexts.web[Math.floor(Math.random() * ctaTexts.web.length)];
            }
            if (keyLower.includes('python') || keyLower.includes('kod')) {
                return ctaTexts.python[Math.floor(Math.random() * ctaTexts.python.length)];
            }
            return ctaTexts.default[Math.floor(Math.random() * ctaTexts.default.length)];
        };

        // Get level based on progress
        const getLevel = (percentage) => {
            if (percentage === 0) return { level: 1, label: 'Başlangıç', color: 'gray', icon: '🌱' };
            if (percentage < 25) return { level: 1, label: 'Çaylak', color: 'green', icon: '🌿' };
            if (percentage < 50) return { level: 2, label: 'Öğrenci', color: 'blue', icon: '📚' };
            if (percentage < 75) return { level: 3, label: 'Yetenekli', color: 'purple', icon: '⭐' };
            if (percentage < 100) return { level: 4, label: 'Uzman', color: 'orange', icon: '🔥' };
            return { level: 5, label: 'Usta', color: 'yellow', icon: '👑' };
        };

        const courses = Object.entries(manifest);
        const isMobile = window.innerWidth < 768;
        const initialCount = isMobile ? 4 : courses.length; // Mobile: show first 4, Desktop: show all
        const showingAll = !isMobile;

        const renderCourseCard = (key, manifestCourse, index, isHidden = false) => {
            // Prefer actual courseData values if loaded (reflects admin changes)
            const loadedCourse = window.courseData && window.courseData[key];
            const title = loadedCourse?.title || manifestCourse.title;
            const description = loadedCourse?.description || manifestCourse.description;
            const icon = loadedCourse?.icon || manifestCourse.icon || '🤖';

            // Calculate progress for this course
            const completed = progressData[key] ? progressData[key].length : 0;
            const total = loadedCourse?.data?.projects?.length || manifestCourse.projectCount || 10;
            const percentage = Math.round((completed / total) * 100);

            // Get level info
            const levelInfo = getLevel(percentage);
            const ctaText = getCTA(key, percentage);

            // Mobile: First 4 visible, rest hidden with "Load More" button
            // Desktop: All courses visible
            const hiddenClass = isHidden ? 'hidden' : '';

            // Calculate XP needed for next level
            const xpForNextLevel = levelInfo.level * 50;

            return `
                <div onclick="app.selectCourse('${key}', event)" 
                     class="course-card card-glow bg-white dark:bg-slate-900 rounded-2xl shadow-md p-4 lg:p-5 cursor-pointer group flex flex-col items-center text-center min-h-[200px] relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-105 border border-slate-200 dark:border-slate-700 ${hiddenClass}" 
                     data-course="${key}"
                     data-index="${index}">
                    
                    <!-- Enhanced Level Badge with High Contrast (larger on mobile) -->
                    <div class="level-badge level-badge-enhanced absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1.5 lg:px-2.5 lg:py-1 rounded-full text-[11px] lg:text-xs cursor-pointer hover:scale-110 transition-transform z-30 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-500 shadow-md" data-tooltip="Sonraki Seviye: ${xpForNextLevel} XP">
                        <span class="text-xs">${levelInfo.icon}</span>
                        <span class="font-bold text-slate-700 dark:text-slate-100">Lv.${levelInfo.level}</span>
                    </div>
                    
                    <!-- Icon -->
                    <div class="text-4xl lg:text-5xl mb-2 lg:mb-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 lg:p-4 rounded-full group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-20">
                        ${icon}
                    </div>
                    
                    <!-- Title -->
                    <h3 class="text-sm lg:text-lg text-gray-800 dark:text-gray-100 mb-1 lg:mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-teal-400 transition-colors font-bold line-clamp-2">${title}</h3>
                    
                    <!-- Description (hidden on mobile) -->
                    <p class="hidden lg:block text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">${description}</p>
                    
                    <!-- Progress Bar with Glow Effect -->
                    <div class="mt-auto pt-2 lg:pt-3 w-full">
                        <div class="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-1.5 lg:h-2 overflow-hidden">
                            <div class="h-full rounded-full ${percentage > 0 ? 'bg-gradient-to-r from-teal-400 to-cyan-400 progress-glow' : 'bg-gray-300 dark:bg-gray-600'} transition-all duration-500" style="width: ${percentage}%"></div>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 hidden lg:block">${completed > 0 ? `${completed}/${total} ders` : 'Henüz başlamadın'}</p>
                    </div>
                    
                    <!-- CTA Button with Vibrant Orange-Red Gradient (visible on all screens) -->
                    <div class="mt-3 w-full relative z-10">
                        <span class="block w-full py-2 lg:py-2.5 px-3 lg:px-4 bg-gradient-to-r from-[#FF8C00] to-[#FF4500] text-white rounded-xl font-bold text-xs lg:text-sm shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:brightness-110 transition-all text-center">
                            ${ctaText} 🚀
                        </span>
                    </div>
                    
                    <!-- Peek Yeti (appears on hover, on top of button) -->
                    <div class="absolute -bottom-2 -right-2 lg:-bottom-4 lg:-right-4 w-12 h-12 lg:w-24 lg:h-24 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30 group-hover:translate-y-[-4px]">
                        <img src="img/yeti-peek.png" alt="" width="96" height="96" class="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                </div>`;
        };

        // Render courses - Build HTML string first, then batch update
        let coursesHTML = '';
        courses.forEach(([key, manifestCourse], index) => {
            const isHidden = isMobile && index >= initialCount;
            coursesHTML += renderCourseCard(key, manifestCourse, index, isHidden);
        });

        // Replace content in one operation (prevents partial renders)
        container.innerHTML = coursesHTML;

        // Add "Show All" button for mobile (inside grid)
        if (isMobile && courses.length > initialCount) {
            const showAllBtn = document.createElement('div');
            showAllBtn.id = 'show-all-courses-btn';
            showAllBtn.className = 'col-span-2 flex items-center justify-center';
            showAllBtn.innerHTML = `
                <button onclick="UI.toggleAllCourses()" 
                        class="w-full py-3 px-4 bg-gradient-to-r from-[#FF8C00] to-[#FF4500] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <span>📚 Tüm Kursları Gör</span>
                    <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">${courses.length - initialCount} daha</span>
                </button>
            `;
            container.appendChild(showAllBtn);
        }
    },

    // Toggle show all courses (for mobile)
    toggleAllCourses: () => {
        const hiddenCards = document.querySelectorAll('.course-card.hidden');
        const showAllBtn = document.getElementById('show-all-courses-btn');

        if (hiddenCards.length > 0) {
            // Show all
            hiddenCards.forEach((card) => {
                card.classList.remove('hidden');
                card.classList.add('fade-in');
            });
            if (showAllBtn) {
                showAllBtn.innerHTML = `
                    <button onclick="UI.toggleAllCourses()" 
                            class="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-all flex items-center justify-center gap-2">
                        <span>↑ Daha Az Göster</span>
                    </button>
                `;
            }
        } else {
            // Hide extra cards
            const allCards = document.querySelectorAll('.course-card');
            allCards.forEach((card, index) => {
                if (index >= 4) {
                    card.classList.add('hidden');
                    card.classList.remove('fade-in');
                }
            });
            if (showAllBtn) {
                const remainingCount = allCards.length - 4;
                showAllBtn.innerHTML = `
                    <button onclick="UI.toggleAllCourses()" 
                            class="w-full py-3 px-4 bg-gradient-to-r from-[#FF8C00] to-[#FF4500] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-110 transition-all flex items-center justify-center gap-2">
                        <span>📚 Tüm Kursları Gör</span>
                        <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">${remainingCount} daha</span>
                    </button>
                `;
            }
            // Scroll to top of course list
            document.getElementById('course-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    // --- Loading State Management ---
    _loadingStates: new Map(), // Track loading states to prevent double-clicks

    // Spinner SVG for buttons
    _spinnerSVG: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>`,

    /**
     * Set loading state on a button with spinner
     * @param {HTMLElement} btn - Button element
     * @param {boolean} loading - Whether to show loading state
     * @param {string} [originalContent] - Original button content (auto-stored if not provided)
     */
    setButtonLoading: (btn, loading, originalContent) => {
        if (!btn) return;

        const btnId = btn.id || btn.dataset.loadingId || `btn-${Date.now()}`;
        btn.dataset.loadingId = btnId;

        if (loading) {
            // Prevent double-click
            if (UI._loadingStates.has(btnId)) return;

            // Store original content
            UI._loadingStates.set(btnId, {
                content: originalContent || btn.innerHTML,
                disabled: btn.disabled,
            });

            btn.disabled = true;
            btn.classList.add('is-loading');
            btn.innerHTML = `<span class="btn-spinner">${UI._spinnerSVG}<span>${I18n?.t('loading') || 'Yükleniyor...'}</span></span>`;
        } else {
            const state = UI._loadingStates.get(btnId);
            if (state) {
                btn.innerHTML = state.content;
                btn.disabled = state.disabled;
                btn.classList.remove('is-loading');
                UI._loadingStates.delete(btnId);
            }
        }
    },

    /**
     * Check if an action is currently loading (prevents double-click)
     * @param {string} actionId - Unique action identifier
     * @returns {boolean}
     */
    isLoading: (actionId) => {
        return UI._loadingStates.has(actionId);
    },

    /**
     * Set loading state for an action
     * @param {string} actionId - Unique action identifier
     * @param {boolean} loading - Whether action is loading
     */
    setActionLoading: (actionId, loading) => {
        if (loading) {
            UI._loadingStates.set(actionId, true);
        } else {
            UI._loadingStates.delete(actionId);
        }
    },

    /**
     * Render skeleton loader cards while content is loading
     * @param {string} containerId - Container element ID
     * @param {number} count - Number of skeleton cards to show
     */
    renderSkeletonCards: (containerId, count = 4) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-card flex flex-col items-center text-center h-full">
                    <div class="skeleton skeleton-icon"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text" style="width: 60%;"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>`;
        }
        container.innerHTML = html;
    },

    /**
     * Add loading overlay to a specific card
     * @param {HTMLElement} card - Card element
     * @param {boolean} loading - Whether to show loading
     */
    setCardLoading: (card, loading) => {
        if (!card) return;

        if (loading) {
            card.classList.add('is-loading');
            // Add overlay with spinner
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<span class="pulse-loading text-4xl">⏳</span>';
            card.style.position = 'relative';
            card.appendChild(overlay);
        } else {
            card.classList.remove('is-loading');
            const overlay = card.querySelector('.loading-overlay');
            if (overlay) overlay.remove();
        }
    },

    showLoading: (containerId, msg) => {
        const message = msg || I18n.t('loading');
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <div class="text-6xl mb-4 animate-bounce">⏳</div>
                    <p class="text-gray-500 font-bold">${message}</p>
                </div>`;
        }
    },

    showError: (containerId, msg, retryAction) => {
        const container = document.getElementById(containerId);
        const errorMessage = msg || I18n.t('error_loading');

        // Show toast notification via Services wrapper (Step 6 refactoring)
        // Services.toast has built-in fallback to console if Toast is unavailable
        if (retryAction && window.Toast?.errorWithRetry) {
            // Keep errorWithRetry for now as Services doesn't wrap it yet
            Toast.errorWithRetry(errorMessage, () => {
                try {
                    eval(retryAction);
                } catch (e) {
                    console.error(e);
                }
            });
        } else {
            Services.toast.error(errorMessage);
        }

        // Also show inline error in container
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-20 text-red-500">
                    <div class="text-6xl mb-4">❌</div>
                    <p class="font-bold">${errorMessage}</p>
                    ${retryAction ? `<button onclick="${retryAction}" class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-colors">${I18n.t('back')}</button>` : ''}
                </div>`;
        }
    },

    // --- Dashboard ---
    renderDashboard: (phases, projects, progressModule) => {
        UI.switchView('dashboard-view');

        const container = document.getElementById('dashboard-content');
        container.innerHTML = '';
        container.classList.add('dashboard-content');

        if (phases.length === 0) {
            container.innerHTML = `<div class="text-center text-slate-400 py-10">${I18n.t('no_content')}</div>`;
            return;
        }

        // Check if user is logged in (student, teacher, or admin)
        const isLoggedIn = typeof Auth !== 'undefined' && (Auth.isStudent() || Auth.isTeacher() || Auth.isAdmin());

        phases.forEach((phase, index) => {
            const phaseProjects = projects.filter((p) => p.phase === index);
            if (phaseProjects.length === 0) return;

            const isIntro = index === 0;
            const fixedName = isIntro ? I18n.t('intro') : `${I18n.t('episode')} ${index}`;
            const pIcon =
                phase.icon || (phase.title && typeof phase.title === 'string' ? phase.title.split(' ')[0] : '📂');
            const pDesc = phase.description || '';

            // Phase header with glow effect
            let sectionHTML = `
                <div class="phase-header">
                    <span class="phase-header-icon">${pIcon}</span>
                    <h3 class="phase-header-title">${fixedName}</h3>
                    <span class="phase-header-desc">${pDesc}</span>
                </div>
                <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide" style="-webkit-overflow-scrolling: touch;">`;

            phaseProjects.forEach((p) => {
                const isComplete = progressModule.isComplete(p.id);
                // Calculate progress (0-100) - if complete, 100%, else random demo progress
                const progressPercent = isComplete ? 100 : 0;

                // Check if lesson requires login and user is not logged in
                const requiresLogin = !isLoggedIn && index > 0; // Lock non-intro lessons for guests
                const lockedClass = requiresLogin ? 'lesson-locked' : '';

                sectionHTML += `
                    <div onclick="${requiresLogin ? "Router.redirectTo('auth.html')" : `app.loadProject(${p.id})`}" 
                         class="lesson-card flex-shrink-0 w-32 sm:w-36 p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-sm rounded-xl ${lockedClass}">
                        ${isComplete ? '<div class="lesson-complete-badge">✓</div>' : ''}
                        ${requiresLogin ? '<div class="lesson-lock-icon">🔒</div>' : ''}
                        <div class="lesson-icon">${p.icon}</div>
                        <h3 class="lesson-title line-clamp-2">${p.title}</h3>
                        <div class="flex items-center justify-between mt-2 lesson-meta">
                            <span>#${p.id}</span>
                            ${p.simType !== 'none' ? '<span class="text-blue-400">🔬</span>' : ''}
                        </div>
                        <div class="lesson-progress">
                            <div class="lesson-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                `;
            });
            sectionHTML += '</div>';
            container.innerHTML += sectionHTML;
        });
    },

    renderProgressBar: (rate) => {
        const bar = document.getElementById('course-progress-bar');
        const text = document.getElementById('course-progress-text');

        // Check if user is logged in (student, teacher, or admin)
        const isLoggedIn = typeof Auth !== 'undefined' && (Auth.isStudent() || Auth.isTeacher() || Auth.isAdmin());

        if (bar) bar.style.width = `${rate}%`;
        if (text) {
            if (isLoggedIn) {
                text.innerText = I18n.t('percent_completed', { rate });
            } else {
                text.innerText = '🔐 Giriş yap';
                text.style.cursor = 'pointer';
                text.onclick = () => Router.redirectTo('auth.html');
            }
        }
    },

    // --- Sidebar ---
    renderSidebar: (phases, projects, currentProjectId) => {
        const container = document.getElementById('sidebar-content');
        container.innerHTML = '';

        if (!phases || phases.length === 0) return;

        phases.forEach((phase, index) => {
            const phaseProjects = projects.filter((p) => p.phase === index);
            if (phaseProjects.length === 0) return;

            // Header with dark mode support
            container.innerHTML += `<div class="font-bold text-slate-400 uppercase text-xs mt-4 mb-2 px-2 tracking-wider">${phase.title}</div>`;

            // List
            phaseProjects.forEach((p) => {
                const isActive = currentProjectId === p.id;
                const activeClass = isActive
                    ? 'active-lesson bg-orange-500/20 text-orange-400 font-bold border-r-4 border-orange-500'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border-r-4 border-transparent';

                container.innerHTML += `
                <div onclick="app.loadProject(${p.id}); app.toggleSidebar();" 
                     class="cursor-pointer p-3 rounded-l-lg text-sm transition flex items-center ${activeClass}">
                     <span class="mr-3 text-lg">${p.icon}</span> ${p.title}
                </div>`;
            });
        });
    },

    toggleSidebar: (forceState = null) => {
        const sidebar = document.getElementById('lesson-sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (!sidebar || !overlay) {
            console.warn('[UI] Sidebar veya overlay bulunamadı');
            return;
        }

        // CSS'te .open class kullanılıyor - bu class'a göre durum belirlenir
        const isOpen = sidebar.classList.contains('open');
        const shouldOpen = forceState !== null ? forceState : !isOpen;

        if (shouldOpen) {
            // AÇMAK İÇİN:
            // 1. Gizlilik class'larını kaldır (Tailwind)
            sidebar.classList.remove('invisible', '-translate-x-full');

            // 2. CSS animasyonu için open class ekle
            sidebar.classList.add('open');
            overlay.classList.add('open');

            // 3. Sayfanın kaymasını engelle
            document.body.style.overflow = 'hidden';
        } else {
            // KAPATMAK İÇİN:
            // 1. open class'ını kaldır (CSS animasyonu çalışır)
            sidebar.classList.remove('open');
            overlay.classList.remove('open');

            // 2. Animasyon bittikten sonra gizlilik class'larını geri ekle
            setTimeout(() => {
                if (!sidebar.classList.contains('open')) {
                    sidebar.classList.add('invisible', '-translate-x-full');
                }
            }, 350); // CSS transition süresi

            // 3. Sayfa kaydırmayı serbest bırak
            document.body.style.overflow = '';
        }
    },

    // Sidebar içindeki linklere tıklandığında menüyü kapatan yardımcı fonksiyon
    initSidebarLinks: () => {
        const sidebar = document.getElementById('lesson-sidebar');
        if (!sidebar) return;

        // Sidebar içindeki tüm tıklanabilir elemanları yakala
        sidebar.addEventListener('click', (e) => {
            // Eğer tıklanan element bir link veya butonsa sidebar'ı kapat
            // Sadece kapatma butonu değilse (header içindeki X butonu hariç)
            const isCloseButton = e.target.closest('.sidebar-close-btn');
            const isLessonLink = e.target.closest('[onclick*="loadProject"]');

            if (isLessonLink || isCloseButton) {
                UI.toggleSidebar(false);
            }
        });
    },

    toggleMobileSearch: () => {
        const overlay = document.getElementById('mobile-search-overlay');
        const input = document.getElementById('mobileSearchInput');

        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            input.focus();
            document.body.style.overflow = 'hidden';
        } else {
            overlay.classList.add('hidden');
            input.value = '';
            document.getElementById('mobileSearchResults').innerHTML = '';
            document.body.style.overflow = '';
        }
    },

    // --- Tab Rendering ---
    renderTabs: (project, componentInfo, currentCourseKey, progressModule) => {
        const area = document.getElementById('tab-content-area');
        const btnContainer = document.getElementById('project-tabs-container');

        // Smart image URL resolver
        const resolveImg = (path) => {
            if (!path) return '';
            // Full URL - use as is
            if (path.startsWith('http://') || path.startsWith('https://')) {
                return path;
            }
            // Local file - use relative path (works in both local and GitHub Pages)
            return path.startsWith('img/') ? path : `img/${path}`;
        };

        // Resim HTML helper
        const createImg = (src, caption) => `
            <div class="mb-4 text-center group relative inline-block cursor-zoom-in" onclick="UI.openImageModal('${src}', '${caption || ''}')">
                <img src="${src}" class="max-w-full h-auto mx-auto rounded shadow" onerror="this.parentElement.innerHTML='<div class=\\'bg-gray-100 p-4 rounded border-2 border-dashed\\'>${I18n.t('img_not_found')}</div>'">
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center pointer-events-none">
                     <span class="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 px-3 py-1 rounded-full shadow-lg text-sm font-bold transform scale-90 group-hover:scale-100 transition-all duration-300">${I18n.t('zoom_in')}</span>
                </div>
            </div>`;

        // Circuit Image - use smart resolver
        const imgSrc = resolveImg(project.circuitImage || `devre${project.id}.jpg`);
        const circHTML = createImg(imgSrc, I18n.t('header_circuit'));

        // YouTube Video HTML (if exists)
        let youtubeHTML = '';
        if (project.youtubeUrl) {
            const videoId = UI.extractYouTubeId(project.youtubeUrl);
            if (videoId) {
                youtubeHTML = `
                    <div class="mt-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-red-200 dark:border-red-800">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-2xl">🎬</span>
                            <h4 class="font-bold text-gray-800 dark:text-gray-200">Video Açıklama</h4>
                        </div>
                        <div class="aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src="https://www.youtube.com/embed/${videoId}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                                class="w-full h-full"
                            ></iframe>
                        </div>
                    </div>
                `;
            }
        }

        // Materials
        let materialsHTML = '<div class="space-y-4">';
        project.materials.forEach((m) => {
            const foundCompKey = Object.keys(componentInfo).find((key) => key === m || componentInfo[key].name === m);
            if (foundCompKey) {
                const c = componentInfo[foundCompKey];
                const compImgSrc = resolveImg(c.imgFileName);
                materialsHTML += `
                    <div class="flex items-start bg-white p-3 rounded shadow-sm border">
                        <div class="w-16 h-16 flex-shrink-0 mr-4 border rounded overflow-hidden bg-gray-100 group relative cursor-zoom-in" onclick="UI.openImageModal('${compImgSrc}', '${c.name.replace(/'/g, "\\'")}')">
                            <img src="${compImgSrc}" class="w-full h-full object-cover" onerror="this.style.display='none'">
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                <span class="text-white opacity-0 group-hover:opacity-100">🔍</span>
                            </div>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${c.name}</h4>
                            <p class="text-xs text-gray-600 mt-1">${c.desc}</p>
                        </div>
                    </div>`;
            } else {
                materialsHTML += `
                    <div class="flex items-center bg-gray-50 p-3 rounded border border-dashed">
                        <div class="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                        <span class="text-gray-700 font-medium">${m}</span>
                    </div>`;
            }
        });
        materialsHTML += '</div>';

        // Config
        const config = window.TabConfig?.getConfig(currentCourseKey) || window.TabConfig?.courses.default;
        let tabs = config.tabs;
        const headers = config.headers;

        // Base Content
        const baseContent = {
            mission: `<div class="fade-in">
                <h3 class="font-bold text-xl mb-2 text-theme">${I18n.t('header_mission')}</h3>
                <p>${project.mission}</p>
                <div class="bg-gray-50 p-4 rounded mt-4 border-l-4 border-theme">${project.theory}</div>
            </div>`,
            circuit: `<div class="fade-in"><h3 class="font-bold mb-4 text-theme">${I18n.t('header_circuit')}</h3>${circHTML}<p>${project.circuit_desc}</p></div>`,
            code: (() => {
                const c = project.code || '';
                if (c.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                    return `<div class="fade-in">
                        <h3 class="font-bold text-xl mb-2 text-theme">${I18n.t('tab_blocks')}</h3>
                        <div class="group relative inline-block cursor-zoom-in w-full" onclick="UI.openImageModal('img/${c}', '${I18n.t('tab_blocks')}')">
                            <img src="img/${c}" class="w-full rounded shadow transition-transform group-hover:scale-[1.01]" onerror="this.parentElement.innerHTML='Resim bulunamadı: ${c}'">
                            <div class="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                🔍
                            </div>
                        </div>
                    </div>`;
                } else {
                    return `<div class="fade-in">
                        <button onclick="navigator.clipboard.writeText(app.currentProject.code);alert('${I18n.t('msg_copied')}')" class="bg-gray-200 px-2 py-1 text-xs rounded mb-2 hover:bg-gray-300 transition">${I18n.t('btn_copy_code')}</button>
                        <pre class="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto max-h-64 code-scroll mb-4">${c || '# Kod yok'}</pre>
                    </div>`;
                }
            })(),
            challenge: `<div class="fade-in text-center py-8">
                <div class="text-4xl mb-2">🏆</div>
                <h3 class="font-bold text-theme text-lg">${I18n.t('header_challenge')}</h3>
                <p class="text-gray-600 mt-2">${project.challenge}</p>
            </div>`,
            tip: (() => {
                const tip = app.getPracticalTip(project); // Still using app logic helper
                return `<div class="fade-in bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded shadow-sm">
                    <div class="flex items-start">
                        <div class="text-4xl mr-4">${tip.icon}</div>
                        <div>
                            <h3 class="font-bold text-gray-800 text-lg mb-1">${tip.title}</h3>
                            <p class="text-gray-700 leading-relaxed">${tip.text}</p>
                        </div>
                    </div>
                </div>`;
            })(),
            quiz: (() => {
                const quiz = project.quiz || (window.quizData && window.quizData[project.id]);
                const isComplete = progressModule.isComplete(project.id);

                const btnHTML = `
                    <div class="mt-8 border-t pt-6 text-center">
                        <button id="btn-complete-project" onclick="app.progress.toggle(${project.id})" 
                            class="${isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white'} 
                            w-full md:w-2/3 py-4 rounded-xl shadow-lg font-bold text-xl transition transform hover:scale-105 active:scale-95">
                            ${isComplete ? I18n.t('completed') : I18n.t('btn_complete')}
                        </button>
                        <p class="text-xs text-gray-400 mt-2">${I18n.t('msg_progress_saved')}</p>
                    </div>`;

                if (!quiz)
                    return `<div class="text-center py-10 text-gray-400">Bu ders için henüz test eklenmemiş.</div>${btnHTML}`;

                let quizHTML = `<div class="fade-in space-y-6">
                    <h3 class="font-bold text-xl text-theme mb-4">${I18n.t('header_quiz')}</h3>`;

                quiz.forEach((q, idx) => {
                    quizHTML += `
                        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 quiz-question" id="q-${idx}">
                            <p class="font-bold text-gray-800 mb-3">${idx + 1}. ${q.q}</p>
                            <div class="space-y-2">
                                ${q.options
                                    .map(
                                        (opt, optIdx) => `
                                    <button onclick="app.checkAnswer(${idx}, ${optIdx}, ${q.answer}, this)" 
                                            class="w-full text-left p-3 rounded bg-white border border-gray-200 hover:bg-gray-100 transition flex items-center group">
                                        <span class="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-3 text-xs font-bold bg-gray-50 group-hover:bg-theme group-hover:text-white transition-colors">${['A', 'B', 'C', 'D'][optIdx]}</span>
                                        ${opt}
                                    </button>
                                `
                                    )
                                    .join('')}
                            </div>
                            <div class="quiz-feedback hidden mt-3 p-3 rounded font-bold text-sm"></div>
                        </div>`;
                });
                quizHTML += `</div>${btnHTML}`;
                return quizHTML;
            })(),
        };

        // Construct final content map
        const content = {
            mission: baseContent.mission,
            materials: `<div class="fade-in"><h3 class="font-bold mb-4 text-theme">${headers.materials || 'Devre Elemanları'}</h3>${materialsHTML}</div>`,
            circuit: `<div class="fade-in"><h3 class="font-bold mb-4 text-theme">${headers.circuit || 'Bağlantı Şeması'}</h3>${circHTML}<p>${project.circuit_desc}</p>${youtubeHTML}</div>`,
            code: headers.code
                ? `<div class="fade-in"><h3 class="font-bold text-xl mb-2 text-theme">${headers.code}</h3>${baseContent.code.replace(/<div class="fade-in">|<\/div>/g, '')}</div>`
                : baseContent.code,

            // Aliases
            design: headers.circuit
                ? `<div class="fade-in"><h3 class="font-bold mb-4 text-theme">${headers.circuit}</h3>${circHTML}<p>${project.circuit_desc}</p></div>`
                : null,
            blocks: headers.code
                ? `<div class="fade-in"><h3 class="font-bold text-xl mb-2 text-theme">${headers.code || 'Blok Kodları'}</h3>${baseContent.code.replace(/<div class="fade-in">|<\/div>/g, '')}</div>`
                : null,

            challenge: baseContent.challenge,
            tip: baseContent.tip,
            quiz: baseContent.quiz,
        };

        // Custom Mappings
        if (config.mapping) {
            Object.keys(config.mapping).forEach((key) => {
                // const target = config.mapping[key]; // Unused
                if (key === 'blocks' && !content.blocks) {
                    content[key] =
                        `<div class="fade-in"><h3 class="font-bold text-xl mb-2 text-theme">${I18n.t('tab_blocks')}</h3>${baseContent.code.replace(/<div class="fade-in">|<\/div>/g, '')}</div>`;
                } else if (key === 'design' && !content.design) {
                    content[key] = content.circuit;
                }
            });
        }

        // Filter hidden tabs
        if (project.hiddenTabs && Array.isArray(project.hiddenTabs)) {
            tabs = tabs.filter((t) => !project.hiddenTabs.includes(t.id));
        }

        // Get custom tab names from course data (if any)
        // Priority: localStorage autosave > static courseData > settings.tab_names (legacy)
        let customTabNames = {};

        // Try localStorage first (admin autosave data - immediate preview)
        try {
            const savedData = localStorage.getItem('mucit_atolyesi_autosave');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                customTabNames = parsed.data?.[currentCourseKey]?.customTabNames || {};
            }
        } catch (_e) {
            // Silently fail
        }

        // Fallback to static course data (DB source)
        if (Object.keys(customTabNames).length === 0) {
            const courseData = window.courseData?.[currentCourseKey];

            // Support both new meta.customTabNames and potential settings.tab_names
            if (courseData) {
                customTabNames =
                    courseData.customTabNames ||
                    courseData.settings?.tab_names ||
                    courseData.meta?.customTabNames ||
                    {};

                // Debug: Log found tab names to trace issues
                // console.log(`[UI] RenderTabs for ${currentCourseKey}. Custom Names:`, customTabNames);
            }
        }

        // Tab icons mapping
        const tabIcons = {
            mission: '🎯',
            materials: '🧩',
            circuit: '⚡',
            design: '🎨',
            code: '💻',
            blocks: '🧩',
            challenge: '🏆',
            tip: '💡',
            quiz: '📝',
        };

        // Render Buttons with icons and new styling
        btnContainer.innerHTML = tabs
            .map((t) => {
                // Priority: customTabNames > I18n translation > default label
                let label = t.label;

                // Check for custom tab name first
                // Normalize keys (handle case where DB might have 'Circuit' vs 'circuit')
                const customKey = Object.keys(customTabNames).find((k) => k.toLowerCase() === t.id.toLowerCase());

                if (customKey && customTabNames[customKey]) {
                    label = customTabNames[customKey];
                }
                // Specific fix for Circuit/Simulation tab persistent legacy issues
                else if (t.id === 'circuit') {
                    // Check known aliases if main key is missing
                    if (customTabNames['simulation']) label = customTabNames['simulation'];
                    else if (customTabNames['phases']) label = customTabNames['phases'];
                }

                if (!label || label === t.label) {
                    // Fall back to I18n translation
                    const labelKey = 'tab_' + t.id;
                    if (I18n.translations['tr'][labelKey]) {
                        label = I18n.t(labelKey);
                    }
                }

                const icon = tabIcons[t.id] || '📄';
                // Double Icon Fix: If label already has an emoji, don't show default icon
                const hasEmoji = /[\p{Emoji}\u2580-\u2FFF\u200d\uFE0F]/u.test(label);
                const iconHtml = hasEmoji ? '' : `<span class="lesson-tab-icon">${icon}</span>`;

                return `<button class="lesson-tab whitespace-nowrap" data-tab="${t.id}">${iconHtml}${label}</button>`;
            })
            .join('');

        const btns = document.querySelectorAll('.lesson-tab');
        const clickHandler = (b) => {
            btns.forEach((t) => t.classList.remove('active'));
            b.classList.add('active');
            area.innerHTML = content[b.dataset.tab] || I18n.t('no_content');
        };

        btns.forEach((b) => (b.onclick = () => clickHandler(b)));

        // Click first
        if (btns.length > 0) clickHandler(btns[0]);
    },

    // --- Fullscreen Toggle ---
    toggleFullscreen: (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (!document.fullscreenElement) {
            element.requestFullscreen?.() || element.webkitRequestFullscreen?.() || element.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
        }
    },

    // --- Modal & Info ---
    openImageModal: (src, caption) => {
        const modal = document.getElementById('image-modal');
        const img = document.getElementById('modal-img');
        const cap = document.getElementById('modal-caption');
        const content = document.getElementById('modal-content');

        img.src = src;
        cap.innerText = caption || '';
        cap.style.display = caption ? 'block' : 'none';

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }, 10);
    },

    closeImageModal: () => {
        const modal = document.getElementById('image-modal');
        const content = document.getElementById('modal-content');

        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
            document.getElementById('modal-img').src = '';
        }, 300);
    },

    showInfo: (msg, title) => {
        document.getElementById('info-title').innerText = title || I18n.t('info_title');
        document.getElementById('info-desc').innerText = msg;
    },

    // Used by interactive boards
    setupInteractiveArea: (html) => {
        const area = document.getElementById('interactive-area');
        const info = document.getElementById('interactive-info');
        area.classList.remove('hidden');
        info.classList.remove('hidden');
        document.getElementById('sim-title').innerText = I18n.t('sim_explore');
        document.getElementById('sim-badge').innerText = I18n.t('sim_learn');
        area.innerHTML = html;
    },

    setupCustomHotspots: (project) => {
        const area = document.getElementById('interactive-area');
        const info = document.getElementById('interactive-info');
        const canvas = document.getElementById('simCanvas');

        canvas.classList.add('hidden');
        area.classList.remove('hidden');
        info.classList.remove('hidden');

        document.getElementById('sim-title').innerHTML =
            `<span class="mr-2">🎯</span> ${I18n.t('sim_interactive_img')}`;
        document.getElementById('sim-badge').innerText = I18n.t('sim_discover');

        const imgPath = project.circuitImage
            ? project.circuitImage.startsWith('img/')
                ? project.circuitImage
                : `img/${project.circuitImage}`
            : `img/devre${project.id}.jpg`;

        const hotspotsHtml = (project.hotspots || [])
            .map(
                (hs, i) => `
            <div class="absolute w-8 h-8 bg-orange-500/80 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-sm text-white font-bold cursor-pointer hover:bg-orange-600 hover:scale-110 transition-all z-10"
                style="left: calc(${hs.x}% - 16px); top: calc(${hs.y}% - 16px);"
                onmouseover="UI.showInfo('${(hs.desc || '').replace(/'/g, "\\'")}', '${hs.name.replace(/'/g, "\\'")}')"
                onmouseout="UI.showInfo('${I18n.t('exp_hotspot_msg')}', '${I18n.t('sim_discover')}')"
                title="${hs.name}">
                ${i + 1}
            </div>
        `
            )
            .join('');

        area.innerHTML = `
            <div class="relative w-full h-full bg-gray-100 flex items-center justify-center">
                <img src="${imgPath}" class="max-h-full max-w-full object-contain" 
                    onerror="this.parentElement.innerHTML='<div class=\\'text-center p-4\\'>${I18n.t('img_not_found')}: ${imgPath}</div>'">
                ${hotspotsHtml}
            </div>`;

        UI.showInfo(I18n.t('exp_hotspot_msg'), I18n.t('sim_discover'));
    },

    /**
     * Extract YouTube video ID from various URL formats
     * @param {string} url - YouTube URL
     * @returns {string|null} Video ID or null if invalid
     */
    extractYouTubeId: (url) => {
        if (!url) return null;

        // Remove whitespace
        url = url.trim();

        // Pattern 1: youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/[?&]v=([^&#]+)/);
        if (watchMatch) return watchMatch[1];

        // Pattern 2: youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
        if (shortMatch) return shortMatch[1];

        // Pattern 3: youtube.com/embed/VIDEO_ID
        const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
        if (embedMatch) return embedMatch[1];

        return null;
    },
};

window.UI = UI;
