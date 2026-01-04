/**
 * Router Modülü
 * URL parametrelerini (query string) yönetir ve sayfa durumunu url ile senkronize eder.
 * Örn: index.html?course=arduino&project=5
 */

const Router = {
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

    // Başlangıç durumunu yükle
    init: async (appInstance) => {
        const { course, project } = Router.getParams();

        // Tarayıcı geri/ileri butonlarını dinle
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                // Basitçe sayfayı yenilemek en temiz çözüm şu an için
                // İleride tam SPA geçişi yapılabilir
                window.location.reload();
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
