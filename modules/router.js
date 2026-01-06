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
        // Teacher Panel Routes (SPA)
        teacher: 'teacher', // Teacher dashboard
        'teacher/classrooms': 'teacher-classrooms', // Sınıflar
        'teacher/students': 'teacher-students', // Öğrenciler
        // Admin Panel Routes (SPA)
        admin: 'admin', // Admin dashboard/projects
        'admin/projects': 'admin-projects', // Ders yönetimi
        'admin/phases': 'admin-phases', // Faz yönetimi
        'admin/components': 'admin-components', // Bileşen yönetimi
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
    // HTML dosya adını hash route'a dönüştür veya ayrı sayfaya yönlendir
    // NOTLAR:
    // - auth.html, profile.html, teacher.html, admin.html → AYRI HTML SAYFALARI (hard redirect)
    // - index.html, course seçimi → SPA hash routing
    redirectTo(page) {
        // Ayrı HTML sayfaları - bunlar SPA'nın parçası DEĞİL
        // Her zaman hard redirect kullan
        // NOT: teacher.html ve admin.html artık SPA'nın parçası, listeden çıkarıldı
        const separatePages = ['auth.html', 'profile.html', 'student-dashboard.html'];

        if (separatePages.includes(page)) {
            console.log(`[Router] Separate page redirect: ${page}`);
            window.location.href = page;
            return;
        }

        // SPA route mapping - index.html içindeki view'lar için
        const spaRoutes = {
            'index.html': '/',
            'teacher.html': '/teacher', // Teacher panel artık SPA
            'admin.html': '/admin', // Admin panel artık SPA
        };

        // Eğer şu an index.html'deysen ve hedef de SPA route'uysa, hash kullan
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isOnMainApp = currentPage === 'index.html' || currentPage === '' || currentPage === '-Yeti-LAB';

        if (spaRoutes[page] && isOnMainApp) {
            // SPA modu: Hash ile navigate et
            console.log(`[Router] SPA redirect: ${page} → ${spaRoutes[page]}`);
            this.navigate(spaRoutes[page]);
        } else if (spaRoutes[page]) {
            // Farklı sayfadan geliyoruz, index.html'e yönlendir + hash
            console.log(`[Router] MPA redirect: ${page} → index.html${spaRoutes[page]}`);
            window.location.href = 'index.html#' + spaRoutes[page];
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
        if (window.Performance) window.Performance.mark('router_init');
        console.log('[Router] Initializing...');

        // ===== Adım 1.6: Hash Change Listener =====
        if (Router.mode === 'hash') {
            window.addEventListener('hashchange', () => Router.handleRouteChange());
        }

        // Önce legacy URL kontrolü yap (?course=xxx → #/course/xxx)
        if (Router.checkLegacyParams()) {
            // Legacy URL dönüştürüldü, hash routing devralacak
            console.log('[Router] Legacy params detected and converted');
            return;
        }

        // ===== FAZ 6: Başlangıç Route'unu Her Zaman İşle =====
        // Hash varsa veya yoksa (ana sayfa) route'u işle
        Router.handleRouteChange();
        console.log('[Router] Initial route handled:', Router.currentRoute);

        // === ESKİ MANTIK (Query String popstate desteği - geriye uyumluluk) ===
        // Tarayıcı geri/ileri butonlarını dinle
        window.addEventListener('popstate', (_event) => {
            // Hash routing aktifse hashchange zaten dinleniyor
            if (Router.mode === 'hash' && window.location.hash) {
                return; // hashchange event'i halledecek
            }

            // Legacy query string desteği
            const { course, project } = Router.getParams();

            if (course && appInstance) {
                // Navigate to Course
                appInstance.selectCourse(course, null, false).then(() => {
                    if (project) {
                        const projectId = parseInt(project);
                        if (!isNaN(projectId)) {
                            appInstance.loadProject(projectId, false);
                        }
                    } else {
                        if (UI && UI.switchView) UI.switchView('dashboard-view');
                    }
                });
            } else if (appInstance) {
                // Navigate to Home
                appInstance.renderCourseSelection(false);
            }
        });

        console.log('[Router] Initialized successfully');
        if (window.Performance) window.Performance.measure('Router Init', 'router_init');
    },
};

window.Router = Router;
