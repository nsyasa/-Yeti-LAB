/**
 * Router Modülü
 * URL parametrelerini (query string) yönetir ve sayfa durumunu url ile senkronize eder.
 * Örn: index.html?course=arduino&project=5
 */

const Router = {
    // ===== YENİ: SPA Router Konfigürasyonu =====
    mode: 'hash', // 'hash' (/#/path) veya 'history' (/path)
    currentRoute: null, // Aktif route bilgisi

    // Route tanımları: pattern → route adı
    routes: {
        '': 'home', // Ana sayfa
        'course/:key': 'course', // Kurs dashboard
        'course/:key/project/:id': 'project', // Proje detay
    },

    // ===== Adım 1.2: Hash Parse Fonksiyonu =====
    // Hash URL'yi parse et
    // Örn: #/course/arduino → { path: 'course/arduino', segments: ['course', 'arduino'] }
    parseHash() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash.startsWith('/') ? hash.slice(1) : hash;
        const segments = path.split('/').filter(Boolean);
        return { path, segments };
    },

    // ===== Adım 1.3: Route Matching Fonksiyonu =====
    // Route eşleştir: path='course/arduino' → { route: 'course', params: { key: 'arduino' } }
    matchRoute(path) {
        const segments = path.split('/').filter(Boolean);

        for (const [pattern, routeName] of Object.entries(this.routes)) {
            const patternSegments = pattern.split('/').filter(Boolean);

            if (patternSegments.length !== segments.length) continue;

            const params = {};
            let match = true;

            for (let i = 0; i < patternSegments.length; i++) {
                if (patternSegments[i].startsWith(':')) {
                    // Dynamic param
                    const paramName = patternSegments[i].slice(1);
                    params[paramName] = segments[i];
                } else if (patternSegments[i] !== segments[i]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { route: routeName, params };
            }
        }

        return { route: 'home', params: {} };
    },

    // ===== Adım 1.4: Navigate Fonksiyonu =====
    // Programatik navigasyon: Router.navigate('/course/arduino')
    navigate(path) {
        if (this.mode === 'hash') {
            window.location.hash = path.startsWith('/') ? path : '/' + path;
        } else {
            window.history.pushState({}, '', path);
            this.handleRouteChange();
        }
    },

    // ===== Adım 2.1 (FAZ 2): Backward Compatible Redirect =====
    // HTML dosya adını hash route'a dönüştür
    // Örn: Router.redirectTo('auth.html') → /#/auth
    // Aynı sayfadaysak (index.html) sadece hash güncelle, değilse hard redirect
    redirectTo(page) {
        // HTML dosya → hash route mapping
        const routes = {
            'auth.html': '/auth',
            'index.html': '/',
            'profile.html': '/profile',
            'teacher.html': '/teacher',
            'admin.html': '/admin',
            'student-dashboard.html': '/student',
        };

        // Eğer şu an index.html'deysen ve hedef de index.html tabanlıysa, hash kullan
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isOnMainApp = currentPage === 'index.html' || currentPage === '' || currentPage === '-Yeti-LAB';

        if (routes[page] && isOnMainApp) {
            // SPA modu: Hash ile navigate et
            console.log(`[Router] SPA redirect: ${page} → ${routes[page]}`);
            this.navigate(routes[page]);
        } else if (routes[page]) {
            // Farklı sayfadan geliyoruz, index.html'e yönlendir + hash
            console.log(`[Router] MPA redirect: ${page} → index.html${routes[page]}`);
            window.location.href = 'index.html#' + routes[page];
        } else {
            // Fallback: Eski davranış (bilinmeyen sayfa)
            console.log(`[Router] Fallback redirect: ${page}`);
            window.location.href = page;
        }
    },

    // ===== Adım 1.5: Route Change Handler =====
    // Route değişikliğini işle
    handleRouteChange() {
        const { path } = this.parseHash();
        const { route, params } = this.matchRoute(path);

        this.currentRoute = { route, params, path };

        console.log(`[Router] Route: ${route}`, params);

        // Store event sistemi varsa kullan
        if (window.Store && Store.emit) {
            Store.emit('route:change', this.currentRoute);
        }
    },

    // ===== MEVCUT: Query String Desteği (Backward Compat) =====
    // URL parametrelerini oku
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        return {
            course: params.get('course'),
            project: params.get('project'),
        };
    },

    // URL'yi güncelle (Sayfa yenilenmeden)
    updateUrl: (courseKey, projectId) => {
        const url = new URL(window.location);

        if (courseKey) {
            url.searchParams.set('course', courseKey);
        } else {
            url.searchParams.delete('course');
        }

        if (projectId) {
            url.searchParams.set('project', projectId);
        } else {
            url.searchParams.delete('project');
        }

        // Geçmişe kaydet
        window.history.pushState({ course: courseKey, project: projectId }, '', url);
    },

    // ===== Adım 1.7: Backward Compatibility =====
    // Eski URL formatını kontrol et (?course=arduino) ve hash'e dönüştür
    checkLegacyParams() {
        const params = new URLSearchParams(window.location.search);
        const course = params.get('course');
        const project = params.get('project');

        if (course) {
            // Eski format tespit edildi, hash'e çevir
            let newPath = `/course/${course}`;
            if (project) {
                newPath += `/project/${project}`;
            }
            // Query params'ı temizle ve hash'e yönlendir
            console.log(`[Router] Legacy URL tespit edildi, dönüştürülüyor: ${newPath}`);
            window.history.replaceState({}, '', window.location.pathname);
            this.navigate(newPath);
            return true;
        }
        return false;
    },

    // Başlangıç durumunu yükle
    init: async (appInstance) => {
        // ===== Adım 1.6: Hash Change Listener =====
        if (Router.mode === 'hash') {
            window.addEventListener('hashchange', () => Router.handleRouteChange());
        }

        // Önce legacy URL kontrolü yap
        if (Router.checkLegacyParams()) {
            // Legacy URL dönüştürüldü, hash routing devralacak
            return;
        }

        // Hash varsa hash routing kullan
        if (window.location.hash) {
            Router.handleRouteChange();
            return;
        }

        // === ESKİ MANTIK (Query String desteği - geriye uyumluluk) ===
        const { course, project } = Router.getParams();

        // Tarayıcı geri/ileri butonlarını dinle
        // Monitor browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const { course, project } = Router.getParams();

            if (course) {
                // Navigate to Course
                // updateHistory: false (URL is already updated by browser)
                appInstance.selectCourse(course, null, false).then(() => {
                    if (project) {
                        // Navigate to Project
                        const projectId = parseInt(project);
                        // Force project view if valid
                        if (!isNaN(projectId)) {
                            appInstance.loadProject(projectId, false);
                        }
                    } else {
                        // If no project, explicitly show dashboard (in case we were in a project)
                        if (UI && UI.switchView) UI.switchView('dashboard-view');
                    }
                });
            } else {
                // Navigate to Home
                appInstance.renderCourseSelection(false);
            }
        });

        if (course) {
            console.log(`[Router] Kurs tespit edildi: ${course}`);
            try {
                // Önce kursu seç ve verilerin yüklenmesini bekle
                await appInstance.selectCourse(course);

                // Eğer proje ID varsa ve kurs başarıyla yüklendiyse projeyi aç
                if (project) {
                    console.log(`[Router] Proje tespit edildi: ${project}`);
                    // Proje ID string gelir, sayıya çevir
                    const projectId = parseInt(project);

                    // Projelerin yüklendiğinden emin ol
                    if (appInstance.state.projects && appInstance.state.projects.length > 0) {
                        setTimeout(() => {
                            appInstance.loadProject(projectId);
                        }, 100); // UI render için ufak bir gecikme
                    }
                }
            } catch (error) {
                console.error('[Router] Yönlendirme hatası:', error);
                // Hata durumunda parametreleri temizle
                Router.updateUrl(null, null);
            }
        }
    },
};

window.Router = Router;
