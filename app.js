// --- UYGULAMA MOTORU ---
const app = {
    state: {
        currentCourseKey: null,
        componentInfo: {},
        phases: [],
        projects: []
    },

    currentProject: null,
    chartInstance: null,
    simLoop: null,
    lastFrameTime: 0,
    targetFPS: 30, // Frame limit for performance
    simState: { val1: 0, val2: 0, active: false, timer: 0, angle: 0, dir: 2, lastTick: Date.now() },

    // Performance: Stop simulation loop
    stopSimulation: () => {
        if (app.simLoop) {
            cancelAnimationFrame(app.simLoop);
            app.simLoop = null;
        }
        if (app.chartInstance) {
            app.chartInstance.destroy();
            app.chartInstance = null;
        }
    },

    // --- Progress Tracking (delegated to module) ---
    progress: {
        get data() { return window.Progress?.data || {}; },
        load: () => window.Progress?.load(),
        save: () => window.Progress?.save(),
        toggle: (projectId) => window.Progress?.toggle(projectId),
        isComplete: (projectId) => window.Progress?.isComplete(projectId) || false,
        getCompletionRate: (key) => window.Progress?.getRate(key) || 0
    },

    init: () => {
        // data.js dosyasından courseData değişkenini alıyoruz
        if (typeof courseData !== 'undefined') {
            // Init modules
            app.initTheme();
            window.Progress?.load();
            window.Progress.onUpdate = (projectId) => {
                app.renderProgressBar();
                const btn = document.getElementById('btn-complete-project');
                if (btn) {
                    const isComplete = app.progress.isComplete(projectId);
                    btn.innerHTML = isComplete ? "✅ Tamamlandı" : "Dersi Tamamla";
                    btn.className = isComplete ?
                        "mt-8 w-full py-4 bg-green-500 text-white rounded-xl shadow-lg font-bold text-xl hover:bg-green-600 transition transform hover:scale-105 active:scale-95" :
                        "mt-8 w-full py-4 bg-gray-200 text-gray-600 rounded-xl shadow-lg font-bold text-xl hover:bg-green-500 hover:text-white transition transform hover:scale-105 active:scale-95";
                }
            };
            window.Search?.init(app.selectCourse, app.loadProject);
            window.Assistant?.init();

            // Load ALL courses first to ensure metadata is available
            if (window.CourseLoader?.loadAll) {
                UI.showLoading('course-list', 'Kurslar yükleniyor...');
                CourseLoader.loadAll().then(() => {
                    console.log('[App] All courses loaded:', Object.keys(window.courseData));

                    // Restore admin changes from localStorage if available
                    app.restoreFromLocalStorage();

                    app.renderCourseSelection();
                }).catch(err => {
                    console.error('[App] Course loading error:', err);
                    app.renderCourseSelection(); // Fallback to manifest
                });
            } else {
                app.renderCourseSelection();
            }
        } else {
            UI.showError('course-list', 'Veri Yüklenemedi', "window.location.reload()");
        }
    },

    // Restore course data from localStorage (syncs with admin panel autosave)
    restoreFromLocalStorage: () => {
        try {
            const saved = localStorage.getItem('mucit_atolyesi_autosave');
            if (!saved) return;

            const parsed = JSON.parse(saved);
            if (parsed.data && Object.keys(parsed.data).length > 0) {
                // Merge saved data into courseData
                Object.keys(parsed.data).forEach(key => {
                    if (window.courseData[key]) {
                        // Keep the structure, update values
                        window.courseData[key] = parsed.data[key];
                    }
                });
                const date = new Date(parsed.timestamp).toLocaleString();
                console.log(`[App] Course data restored from localStorage (${date})`);
            }
        } catch (e) {
            console.error('[App] Failed to restore from localStorage:', e);
        }
    },

    // Mobile UI Controls
    toggleMobileSearch: () => UI.toggleMobileSearch(),

    toggleSidebar: () => UI.toggleSidebar(),

    // --- Theme Management ---
    theme: {
        modes: ['light', 'dark', 'shield'],
        current: 'light',
        icons: {
            light: '☀️',
            dark: '🌙',
            shield: '🛡️'
        }
    },

    initTheme: () => {
        const saved = Settings.get('theme');
        app.setTheme(saved);
    },

    toggleTheme: () => {
        const modes = app.theme.modes;
        const currentIdx = modes.indexOf(app.theme.current);
        const nextIdx = (currentIdx + 1) % modes.length;
        app.setTheme(modes[nextIdx]);
    },

    setTheme: (mode) => {
        const body = document.body;
        app.theme.current = mode;
        Settings.set('theme', mode);

        // Reset classes
        body.classList.remove('dark-mode', 'eye-shield');

        // Apply new class
        if (mode === 'dark') body.classList.add('dark-mode');
        if (mode === 'shield') body.classList.add('eye-shield');

        // Update icons
        const icon = app.theme.icons[mode];
        document.querySelectorAll('.theme-btn span').forEach(el => el.textContent = icon);
    },

    toggleLanguage: () => {
        const current = Settings.get('language') || 'tr';
        const next = current === 'tr' ? 'en' : 'tr';
        Settings.set('language', next);
        window.location.reload();
    },

    renderCourseSelection: () => {
        const manifest = window.CourseLoader?.getManifest() || {};
        // Update language button text
        const langText = document.getElementById('lang-text');
        if (langText) langText.innerText = (Settings.get('language') || 'tr').toUpperCase();

        UI.renderCourseSelection(manifest);
        app.stopSimulation();
    },

    selectCourse: async (key) => {
        // Show loading indicator
        // Show loading indicator
        UI.showLoading('course-list');

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

        } catch (error) {
            console.error('[App] Failed to load course:', error);
            console.error('[App] Failed to load course:', error);
            UI.showError('course-list', 'Kurs yüklenemedi!', 'app.renderCourseSelection()');
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
    },

    loadProject: (id) => {
        const { projects } = app.state;
        const p = projects.find(prj => prj.id === id);

        if (!p) {
            console.error(`Project not found: ${id}`);
            alert("Ders bulunamadı!");
            app.renderDashboard();
            return;
        }

        app.currentProject = p;
        document.getElementById('dashboard-view').classList.add('hidden');
        document.getElementById('project-view').classList.remove('hidden');
        document.getElementById('project-tag').innerText = p.phase === 0 ? "Hazırlık" : `Ders ${p.id}`;
        document.getElementById('project-title').innerText = p.title;
        document.getElementById('project-desc').innerText = p.desc;
        document.getElementById('project-icon').innerText = p.icon;

        // Reset UI
        ['simCanvas', 'interactive-area', 'interactive-info', 'chart-card'].forEach(id => document.getElementById(id).classList.add('hidden'));
        document.getElementById('simControls').innerHTML = "";

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

    hideHotspotInfo: () => UI.showInfo("Numaralı noktaların üzerine gelerek açıklamaları görün.", "🔍 Keşfet"),

    getPracticalTip: (project) => {
        const tips = window.tipsData || {};
        if (!tips.General) return { title: "İpucu", text: "Bol bol pratik yap!", icon: "✨" };

        let match = null;

        // 1. Materyallere göre ara
        if (project.materials) {
            for (let m of project.materials) {
                // Materyal ismi içinde anahtar kelime var mı? (Örn: "Kırmızı LED" -> "LED")
                for (let key in tips) {
                    if (key !== "General" && m.includes(key)) {
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
        buttons.forEach(b => {
            b.onclick = null;
            b.classList.add('cursor-default', 'opacity-70');
            b.classList.remove('hover:bg-gray-100');
        });

        feedback.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');

        if (optIndex === trueIndex) {
            // Correct
            btn.classList.add('bg-green-100', 'border-green-300');
            btn.querySelector('span').classList.add('bg-green-500', 'text-white', 'border-green-500');
            feedback.innerHTML = "🎉 Doğru Cevap! Harikasın.";
            feedback.classList.add('bg-green-100', 'text-green-700');
            // Confetti effect can be added here
        } else {
            // Wrong
            btn.classList.add('bg-red-100', 'border-red-300');
            btn.querySelector('span').classList.add('bg-red-500', 'text-white', 'border-red-500');

            // Highlight correct answer
            const correctBtn = buttons[trueIndex];
            correctBtn.classList.add('ring-2', 'ring-green-400', 'bg-green-50');

            feedback.innerHTML = "😔 Yanlış Cevap. Doğru cevap işaretlendi.";
            feedback.classList.add('bg-red-100', 'text-red-700');
        }
    },

    renderTabs: (project) => {
        UI.renderTabs(project, app.state.componentInfo, app.state.currentCourseKey, app.progress);
    },

    setupSimulation: (type) => {
        const cvs = document.getElementById('simCanvas');
        const ctx = cvs.getContext('2d');
        cvs.width = 500; cvs.height = 350;

        // Get Current Theme Color from CSS
        const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#00979C';
        app.simState.themeColor = themeColor;

        const chartCtx = document.getElementById('dataChart').getContext('2d');
        if (app.chartInstance) app.chartInstance.destroy();
        if (app.currentProject.hasGraph) {
            app.chartInstance = new Chart(chartCtx, {
                type: 'line', data: { labels: Array(20).fill(''), datasets: [{ data: Array(20).fill(0), borderColor: themeColor, tension: 0.3 }] },
                options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { y: { display: true } } }
            });
        }

        // Helper functions for Simulations
        app.setControls = (html) => document.getElementById('simControls').innerHTML = html;

        // Modüler Yapı Çağrısı
        if (window.Simulations && window.Simulations[type] && window.Simulations[type].setup) {
            window.Simulations[type].setup(app);
        } else {
            app.setControls('<div class="text-red-500 text-xs">Simülasyon Bulunamadı: ' + type + '</div>');
        }

        app.simLoop = requestAnimationFrame(() => app.runSimLoop(ctx, type));
    },

    runSimLoop: (ctx, type) => {
        const now = Date.now();
        const frameInterval = 1000 / app.targetFPS;

        // Throttle to target FPS
        if (now - app.lastFrameTime < frameInterval) {
            app.simLoop = requestAnimationFrame(() => app.runSimLoop(ctx, type));
            return;
        }
        app.lastFrameTime = now;

        ctx.clearRect(0, 0, 500, 350);
        let val = 0;

        // Modüler Çizim Çağrısı
        if (window.Simulations && window.Simulations[type] && window.Simulations[type].draw) {
            val = window.Simulations[type].draw(ctx, app, now);
        }

        if (app.currentProject && app.currentProject.hasGraph && app.chartInstance && val !== undefined) {
            const d = app.chartInstance.data.datasets[0].data;
            d.shift(); d.push(val);
            app.chartInstance.update('none');
        }
        app.simLoop = requestAnimationFrame(() => app.runSimLoop(ctx, type));
    },

    toggleSidebar: () => UI.toggleSidebar(),

    // Search is now handled by modules/search.js

    renderSidebar: () => {
        const { phases, projects } = app.state;
        const currentId = app.currentProject ? app.currentProject.id : null;
        UI.renderSidebar(phases, projects, currentId);
    },
};

window.onload = app.init;
