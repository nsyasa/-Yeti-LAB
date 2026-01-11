// --- UYGULAMA MOTORU ---

// FAZ 4.1: app.state artık Store ile senkronize
// StateProxy modülü: modules/core/stateProxy.js
// Geriye uyumluluk için app.state kullanılabilir, ama veriler Store'da tutulur
const createStateProxy = () => {
    // StateProxy modülü yüklü ise onu kullan
    if (window.StateProxy?.create) {
        return window.StateProxy.create();
    }

    // Fallback: Modül yüklenmemişse basit obje döndür
    console.warn('[App] StateProxy module not loaded, using fallback');
    return {
        currentCourseKey: null,
        componentInfo: {},
        phases: [],
        projects: [],
    };
};

const app = {
    // State artık Store ile senkronize (geriye uyumluluk için)
    get state() {
        // Lazy init
        if (!this._stateProxy) {
            this._stateProxy = createStateProxy();
        }
        return this._stateProxy;
    },

    currentProject: null,

    // Simulation state & control (delegated to modules/simulation/simController.js)
    get chartInstance() {
        return window.SimController?.chartInstance || null;
    },
    get simLoop() {
        return window.SimController?.loop || null;
    },
    get simState() {
        return (
            window.SimController?.state || {
                val1: 0,
                val2: 0,
                active: false,
                timer: 0,
                angle: 0,
                dir: 2,
                lastTick: Date.now(),
            }
        );
    },
    lastFrameTime: 0,
    targetFPS: 30,

    // Performance: Stop simulation loop
    stopSimulation: () => {
        if (window.SimController?.stop) {
            return window.SimController.stop();
        }
        // Fallback
        if (app.simLoop) {
            cancelAnimationFrame(app.simLoop);
        }
    },

    // --- Progress Tracking (delegated to module) ---
    progress: {
        get data() {
            return window.Progress?.data || {};
        },
        load: () => window.Progress?.load(),
        save: () => window.Progress?.save(),
        toggle: (projectId) => window.Progress?.toggle(projectId),
        isComplete: (projectId) => window.Progress?.isComplete(projectId) || false,
        getCompletionRate: (key) => window.Progress?.getRate(key) || 0,
    },

    init: async () => {
        // Global Logout Alias for Component Compatibility
        window.logout = app.logout;

        // data.js dosyasından courseData değişkenini alıyoruz
        if (typeof courseData !== 'undefined') {
            // Init modules
            // app.initTheme(); // ThemeManager handles this automatically in <head>
            if (window.ScrollManager) {
                window.ScrollManager.init();
            }

            // CRITICAL: Auth must complete before UI renders to show correct user state
            await app.initAuth(); // Auth durumunu kontrol et, Progress da burada başlatılacak

            // Progress callback'i ayarla (init auth içinde çağrılacak)
            if (window.Progress) {
                window.Progress.onUpdate = (projectId) => {
                    app.renderProgressBar();
                    const btn = document.getElementById('btn-complete-project');
                    if (btn) {
                        const isComplete = app.progress.isComplete(projectId);
                        btn.innerHTML = isComplete ? '✅ Tamamlandı' : 'Dersi Tamamla';
                        btn.className = isComplete
                            ? 'mt-8 w-full py-4 bg-green-500 text-white rounded-xl shadow-lg font-bold text-xl hover:bg-green-600 transition transform hover:scale-105 active:scale-95'
                            : 'mt-8 w-full py-4 bg-gray-200 text-gray-600 rounded-xl shadow-lg font-bold text-xl hover:bg-green-500 hover:text-white transition transform hover:scale-105 active:scale-95';
                    }
                };
            }

            window.Search?.init(app.selectCourse, app.loadProject);
            window.Assistant?.init();

            // Navbar'ı başlat (Auth tamamlandıktan sonra)
            if (window.MainLayout) {
                try {
                    window.MainLayout.init();
                } catch (layoutError) {
                    console.error('MainLayout init error:', layoutError);
                }
            }

            // ViewManager başlat (SPA view lifecycle yönetimi)
            if (window.ViewManager) {
                window.ViewManager.init('main-content');
            }

            // Performans İyileştirmesi: Full veriyi (loadAll) yüklemek yerine
            // Sadece kurs listesini (metadata) alıp listeliyoruz.
            // Detaylı veriler kurs seçilince (selectCourse) yüklenecek.
            if (window.CourseLoader?.init) {
                // Optimistic Rendering: Show static manifest immediately to prevent waiting
                app.renderCourseSelection();

                CourseLoader.init()
                    .then(() => {
                        // Restore admin changes from localStorage if available
                        app.restoreFromLocalStorage();

                        // Re-render with dynamic data (e.g. updated counts or titles)
                        app.renderCourseSelection();

                        // ===== FAZ 3: Route Change Event Handler =====
                        // Store'un route:change eventini dinlemeye GEREK YOK
                        // Router.js artık doğrudan yönetiyor.

                        // Router Init: URL parametrelerini kontrol et ve yönlendir
                        if (window.Router) {
                            window.Router.init(app);
                        }
                    })
                    .catch((err) => {
                        console.warn('[App] Course init warning (using static manifest):', err);
                        // No need to re-render, static manifest is already visible
                    });
            } else {
                app.renderCourseSelection();
            }
        } else {
            UI.showError('course-list', 'Veri Yüklenemedi', 'window.location.reload()');
        }

        // Performance Check
        Performance.measure('App Init', 'app_start');
    },

    // --- Auth Management ---
    // Refactored to modules/authUI.js (FAZ 4.1 Part 2)
    initAuth: async () => {
        if (window.AuthUI) {
            await window.AuthUI.init();
        } else {
            console.error('[App] AuthUI module not found');
        }
    },

    updateUserUI: (userInfo) => {
        if (window.AuthUI) {
            window.AuthUI.updateUserUI(userInfo);
        }
    },

    toggleUserMenu: () => {
        if (window.AuthUI) {
            window.AuthUI.toggleUserMenu();
        }
    },

    closeUserMenu: (e) => {
        if (window.AuthUI) {
            window.AuthUI.closeUserMenu(e);
        }
    },

    logout: () => {
        if (window.AuthUI) {
            window.AuthUI.logout();
        }
    },

    // Global alias for logout, useful for direct calls from HTML
    globalLogout: () => app.logout(),

    // Restore course data from localStorage (syncs with admin panel autosave)
    // Security: Validates and sanitizes data to prevent XSS attacks
    // Refactored to modules/core/localStorage.js
    restoreFromLocalStorage: () => {
        if (window.LocalStorageManager?.restoreFromLocalStorage) {
            return window.LocalStorageManager.restoreFromLocalStorage();
        }
        console.warn('[App] LocalStorageManager module not loaded');
        return 0;
    },

    // Mobile UI Controls
    toggleMobileSearch: () => UI.toggleMobileSearch(),

    toggleSidebar: () => UI.toggleSidebar(),

    // --- Theme Management ---
    // ThemeManager modülünü kullan (modules/themeManager.js)
    // Bu fonksiyonlar sadece geriye uyumluluk için burada, ThemeManager'a delege eder
    initTheme: () => {
        // ThemeManager otomatik init oluyor, bu fonksiyon artık gereksiz
        // Ama çağrıldığında hata vermesin diye bırakıldı
    },

    setTheme: (mode) => {
        if (window.ThemeManager) {
            window.ThemeManager.setTheme(mode);
        }
    },

    getCurrentTheme: () => {
        return window.ThemeManager ? window.ThemeManager.getCurrentTheme() : 'light';
    },

    toggleLanguage: () => {
        const current = Settings.get('language') || 'tr';
        const next = current === 'tr' ? 'en' : 'tr';
        Settings.set('language', next);
        window.location.reload();
    },

    // ===== FAZ 3: Legacy Route Handler =====
    // Sadece Home, Course ve Project route'larını yönetir
    // SPA route'ları (Admin, Teacher vb.) Router.js tarafından yönetilir
    handleLegacyRoute: async (route, params) => {
        console.log(`[App] Legacy Route: ${route}`, params);

        // SPA View'larından çıkış yapılıyorsa unmount et
        const currentView = window.ViewManager?.getCurrentView?.();
        if (currentView) {
            console.log('[App] Switching to legacy view, unmounting SPA view...');
            ViewManager.unmountCurrent();
        }

        switch (route) {
            case 'home':
                // Ana sayfa - kurs seçim ekranı
                // Refresh course list from Supabase (in case admin made changes)
                if (window.CourseLoader?.init) {
                    await CourseLoader.init();
                }
                app.renderCourseSelection(false); // updateHistory: false (URL zaten hash'te)
                break;

            case 'course':
                // Kurs dashboard
                if (params.key) {
                    // Kurs zaten yüklüyse tekrar yükleme
                    if (app.state.currentCourseKey !== params.key) {
                        await app.selectCourse(params.key, null, false);
                    } else {
                        // Aynı kurs, sadece dashboard göster
                        UI.switchView('dashboard-view');
                    }
                }
                break;

            case 'project':
                // Proje detay
                if (params.key && params.id) {
                    // Önce kurs yüklü mü kontrol et
                    if (app.state.currentCourseKey !== params.key) {
                        await app.selectCourse(params.key, null, false);
                    }
                    // Sonra projeyi aç
                    const projectId = parseInt(params.id);
                    if (!isNaN(projectId)) {
                        app.loadProject(projectId, false);
                    }
                }
                break;

            default:
                console.warn(`[App] Unknown legacy route: ${route}`);
                app.renderCourseSelection(false);
        }
    },

    renderCourseSelection: (updateHistory = true) => {
        const manifest = window.CourseLoader?.getManifest() || {};

        // Explicitly hide other views first (fix for logo navigation)
        const dashboardView = document.getElementById('dashboard-view');
        const projectView = document.getElementById('project-view');
        if (dashboardView) dashboardView.classList.add('hidden');
        if (projectView) projectView.classList.add('hidden');

        // Stop any running simulation
        app.stopSimulation();

        // Reset current project and course state for clean navigation
        app.currentProject = null;

        UI.renderCourseSelection(manifest);

        // URL'yi temizle (Ana sayfa)
        if (window.Router && updateHistory) window.Router.updateUrl(null, null);
    },

    selectCourse: async (key, event, updateHistory = true) => {
        // Prevent double-click
        const actionId = `select-course-${key}`;
        if (UI.isLoading(actionId)) return;
        UI.setActionLoading(actionId, true);

        // Find and add loading state to clicked card
        let clickedCard = null;
        if (event?.target) {
            clickedCard = event.target.closest('.course-card');
        } else {
            // Fallback: find by key
            clickedCard = document.querySelector(`[onclick*="selectCourse('${key}')"]`);
        }

        if (clickedCard) {
            UI.setCardLoading(clickedCard, true);
        }

        try {
            // Lazy load the course data
            await window.CourseLoader?.loadCourse(key);

            app.state.currentCourseKey = key;
            if (window._appState) window._appState.currentCourseKey = key;

            const course = courseData[key];
            if (!course) {
                throw new Error('Course data not found after loading');
            }

            // Merkezi tema uygulaması
            if (window.applyTheme) {
                window.applyTheme(key);
            }

            // Verileri yükle - app.state içine
            app.state.componentInfo = course.data.componentInfo || {};
            app.state.phases = course.data.phases || [];
            app.state.projects = course.data.projects || [];

            // Dashboard başlıklarını güncelle
            document.getElementById('course-title').innerText = course.title;
            document.getElementById('course-desc').innerText = course.description;

            app.renderDashboard();
            app.renderSidebar();
            app.renderProgressBar();

            // URL güncelle
            if (window.Router && updateHistory) window.Router.updateUrl(key, null);

            // Store Update (Faz 2: Adım 4)
            if (window.Store) {
                window.Store.setCurrentCourse(course, key);
            }
        } catch (error) {
            console.error('[App] Failed to load course:', error);
            Toast?.errorWithRetry('Kurs yüklenemedi!', () => app.selectCourse(key));
            UI.showError('course-list', 'Kurs yüklenemedi!', 'app.renderCourseSelection()');
        } finally {
            // Clear loading state
            UI.setActionLoading(actionId, false);
            if (clickedCard) {
                UI.setCardLoading(clickedCard, false);
            }
        }
    },

    renderProgressBar: () => {
        const { currentCourseKey } = app.state;
        const rate = app.progress.getCompletionRate(currentCourseKey);
        UI.renderProgressBar(rate);
    },

    renderDashboard: () => {
        const { phases, projects } = app.state;
        UI.renderDashboard(phases, projects, app.progress);
        app.stopSimulation();

        // URL güncelle (Sadece proje seçimini kaldır)
        if (window.Router && app.state.currentCourseKey) {
            window.Router.updateUrl(app.state.currentCourseKey, null);
        }
    },

    loadProject: (id, updateHistory = true) => {
        // Prevent double-click
        const actionId = `load-project-${id}`;
        if (UI.isLoading(actionId)) return;
        UI.setActionLoading(actionId, true);

        const { projects } = app.state;
        const p = projects.find((prj) => prj.id === id);

        if (!p) {
            console.error(`Project not found: ${id}`);
            alert('Ders bulunamadı!');
            app.renderDashboard();
            UI.setActionLoading(actionId, false);
            return;
        }

        app.currentProject = p;
        // Store Update (Faz 2: Adım 4)
        if (window.Store) {
            window.Store.setState({ activeProject: p });
        }
        if (UI.switchView) {
            UI.switchView('project-view');
        } else {
            // Fallback if UI.switchView is missing
            document.getElementById('dashboard-view').classList.add('hidden');
            document.getElementById('project-view').classList.remove('hidden');
        }
        document.getElementById('project-tag').innerText = p.phase === 0 ? 'Hazırlık' : `Ders ${p.id}`;
        document.getElementById('project-title').innerText = p.title;
        document.getElementById('project-desc').innerText = p.desc;
        document.getElementById('project-icon').innerText = p.icon;

        // Reset UI
        ['simCanvas', 'interactive-area', 'interactive-info', 'chart-card'].forEach((elementId) =>
            document.getElementById(elementId).classList.add('hidden')
        );
        document.getElementById('simControls').innerHTML = '';

        // Artık Explorer da bir simülasyon (Canvas tabanlı)
        document.getElementById('sim-container').classList.remove('hidden');
        document.getElementById('simCanvas').classList.remove('hidden');
        if (p.hasGraph) document.getElementById('chart-card').classList.remove('hidden');
        app.setupSimulation(p.simType);

        // Show custom hotspots in Virtual Lab if enabled
        if (p.showHotspotsInLab && p.hotspots && p.hotspots.length > 0) {
            UI.setupCustomHotspots(p);
        }

        app.renderTabs(p);
        window.scrollTo(0, 0);

        // URL güncelle
        if (window.Router && updateHistory) window.Router.updateUrl(app.state.currentCourseKey, id);

        // Clear loading state after a short delay
        setTimeout(() => UI.setActionLoading(actionId, false), 100);
    },

    setupExplorer: (type) => {
        // --- İNTERAKTİF FOTOĞRAF ALANLARI ---
        if (type === 'explorer_board') {
            UI.setupInteractiveArea(`
                <div class="relative w-full h-full bg-gray-100 flex items-center justify-center">
                    <img src="img/arduino_tanitim.jpg" class="max-h-full max-w-full object-contain" onerror="this.parentElement.innerHTML='<div class=\\'text-center p-4\\'>Görsel Yok: img/arduino_tanitim.jpg<br>Arduino fotoğrafını bu isimle ekleyin.</div>'">
                    <div class="hotspot" style="top:20%; left:10%;" title="USB Port" onmouseover="UI.showInfo('USB Portu: Kod yükler ve güç verir.')"></div>
                    <div class="hotspot" style="top:75%; left:10%;" title="Güç" onmouseover="UI.showInfo('Güç Girişi: Pil veya adaptör takılır.')"></div>
                    <div class="hotspot" style="top:10%; right:20%;" title="Dijital" onmouseover="UI.showInfo('Dijital Pinler: LED yakmak için kullanılır.')"></div>
                    <div class="hotspot" style="bottom:10%; right:30%;" title="Analog" onmouseover="UI.showInfo('Analog Pinler: Sensör okumak için kullanılır.')"></div>
                    <div class="hotspot" style="top:60%; left:45%;" title="Çip" onmouseover="UI.showInfo('Mikrodenetleyici: Arduino\\'nun beyni.')"></div>
                </div>`);
        } else {
            UI.setupInteractiveArea(`
                <div class="relative w-full h-full bg-gray-800 flex items-center justify-center">
                    <img src="img/ide_tanitim.jpg" class="max-h-full max-w-full object-contain" onerror="this.parentElement.innerHTML='<div class=\\'text-center p-4 text-white\\'>Görsel Yok: img/ide_tanitim.jpg<br>IDE ekran görüntüsünü ekleyin.</div>'">
                    <div class="hotspot" style="top:5%; left:5%;" title="Kontrol" onmouseover="UI.showInfo('Kontrol Et: Koddaki hataları bulur.')"></div>
                    <div class="hotspot" style="top:5%; left:12%;" title="Yükle" onmouseover="UI.showInfo('Yükle: Kodu karta gönderir.')"></div>
                    <div class="hotspot" style="top:5%; right:5%;" title="Seri Port" onmouseover="UI.showInfo('Seri Port Ekranı: Mesajları okur.')"></div>
                </div>`);
        }
    },

    showInfo: (msg) => UI.showInfo(msg),

    openImageModal: (src, caption) => UI.openImageModal(src, caption),

    closeImageModal: () => UI.closeImageModal(),

    // Custom Hotspots Display (Moved to UI)
    setupCustomHotspots: (project) => UI.setupCustomHotspots(project),

    showHotspotInfo: (name, desc) => UI.showInfo(desc, name),

    hideHotspotInfo: () => UI.showInfo('Numaralı noktaların üzerine gelerek açıklamaları görün.', '🔍 Keşfet'),

    getPracticalTip: (project) => {
        const tips = window.tipsData || {};
        if (!tips.General) return { title: 'İpucu', text: 'Bol bol pratik yap!', icon: '✨' };

        let match = null;

        // 1. Materyallere göre ara
        if (project.materials) {
            for (const m of project.materials) {
                // Materyal ismi içinde anahtar kelime var mı? (Örn: "Kırmızı LED" -> "LED")
                for (const key in tips) {
                    if (key !== 'General' && m.includes(key)) {
                        match = tips[key];
                        break;
                    }
                }
                if (match) break;
            }
        }

        // 2. Bulamazsan Genk ipucu ver
        if (!match) {
            const generalTips = tips.General;
            // Rastgele bir ipucu seç (Her açılışta değişir)
            // Sabit olması istersen: project.id % generalTips.length kullanılabilir.
            const index = project.id % generalTips.length;
            match = generalTips[index];
        }

        return match;
    },

    checkAnswer: (qIndex, optIndex, trueIndex, btn) => {
        const parent = document.getElementById(`q-${qIndex}`);
        const feedback = parent.querySelector('.quiz-feedback');
        const buttons = parent.querySelectorAll('button');

        // Disable all buttons in this question
        buttons.forEach((b) => {
            b.onclick = null;
            b.classList.add('cursor-default', 'opacity-70');
            b.classList.remove('hover:bg-gray-100');
        });

        feedback.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');

        if (optIndex === trueIndex) {
            // Correct
            btn.classList.add('bg-green-100', 'border-green-300');
            btn.querySelector('span').classList.add('bg-green-500', 'text-white', 'border-green-500');
            feedback.innerHTML = '🎉 Doğru Cevap! Harikasın.';
            feedback.classList.add('bg-green-100', 'text-green-700');
            // Confetti effect can be added here
        } else {
            // Wrong
            btn.classList.add('bg-red-100', 'border-red-300');
            btn.querySelector('span').classList.add('bg-red-500', 'text-white', 'border-red-500');

            // Highlight correct answer
            const correctBtn = buttons[trueIndex];
            correctBtn.classList.add('ring-2', 'ring-green-400', 'bg-green-50');

            feedback.innerHTML = '😔 Yanlış Cevap. Doğru cevap işaretlendi.';
            feedback.classList.add('bg-red-100', 'text-red-700');
        }
    },

    renderTabs: (project) => {
        UI.renderTabs(project, app.state.componentInfo, app.state.currentCourseKey, app.progress);
    },

    // Simulation setup & loop (delegated to modules/simulation/simController.js)
    setupSimulation: (type) => {
        if (window.SimController?.setup) {
            // Set current project for chart decision
            window.SimController.setProject(app.currentProject);
            return window.SimController.setup(type);
        }
        // Fallback: basic setup
        console.warn('[App] SimController not loaded, using fallback');
        const cvs = document.getElementById('simCanvas');
        if (!cvs) return;
        cvs.width = 500;
        cvs.height = 350;
        if (window.Simulations?.[type]?.setup) {
            window.Simulations[type].setup(app);
        }
    },

    runSimLoop: (_ctx, type) => {
        // This is now handled by SimController internally
        // Kept for backward compatibility if called directly
        if (window.SimController?._runLoop) {
            return window.SimController._runLoop(_ctx, type);
        }
    },

    // Helper for simulations to set controls
    setControls: (html) => {
        if (window.SimController?.setControls) {
            return window.SimController.setControls(html);
        }
        const el = document.getElementById('simControls');
        if (el) el.innerHTML = html;
    },

    toggleSidebar: () => UI.toggleSidebar(),

    // Search is now handled by modules/search.js

    renderSidebar: () => {
        const { phases, projects } = app.state;
        const currentId = app.currentProject ? app.currentProject.id : null;
        UI.renderSidebar(phases, projects, currentId);
    },
};

// Global erişim için window'a ata (Vite/Module sistemi için KRİTİK)
window.app = app;

// Başlatma mantığı
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    // DOM zaten hazırsa hemen başlat
    app.init();
}
