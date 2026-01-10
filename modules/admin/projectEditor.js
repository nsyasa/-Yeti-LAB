/**
 * Admin Panel Project Editor
 *
 * Proje ekleme, düzenleme, silme ve liste işlemlerini yönetir.
 * Ayrıca Video ve Rich Text içerik alanlarını destekler.
 */

const ProjectEditor = {
    init: () => {
        // Event listeners can be set up here if needed
    },

    /**
     * Proje Listesini Render Et
     * @param {number|null} activeProjectId - Seçili proje ID'si
     */
    renderList: (activeProjectId) => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.renderList(activeProjectId);
        } else {
            console.error('ProjectManager bulunamadı!');
        }
    },

    /**
     * Yeni Proje Ekle
     */
    add: () => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.add();
        }
    },

    /**
     * Projeyi Çoğalt
     */
    duplicate: () => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.duplicate();
        }
    },

    /**
     * Projeyi Sil
     */
    delete: () => {
        // Silme işlemi için önce Undo Stack'e ekle (Admin.js üzerinden)
        if (typeof ProjectManager !== 'undefined') {
            if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;

            const deleted = ProjectManager.delete(window.AdminState?.currentProjectId);

            if (deleted && window.AdminState) {
                window.AdminState.undoStack.push({
                    type: 'project',
                    data: JSON.parse(JSON.stringify(deleted)),
                    courseKey: window.AdminState.currentCourseKey,
                });

                // UI Güncellemeleri (Admin.js üzerinden veya direkt)
                if (window.admin) {
                    admin.updateUndoButton();
                    admin.showUndoToast(`"${deleted.title || 'Proje'}" silindi.`);
                    admin.triggerAutoSave();
                }
            }
        }
    },

    /**
     * Proje Güncelleme (Formdan gelen verilerle)
     * YENİ: Video URL ve Rich Text Content burada işlenecek
     */
    update: () => {
        if (typeof ProjectManager !== 'undefined') {
            // Standart güncelleme
            ProjectManager.update();

            // YENİ ÖZELLİK: Video ve Rich Text alanlarını işle
            // Bu kısım UI formuna yeni alanlar eklendiğinde aktif olacak
            const p = ProjectManager.getCurrentProject();
            if (p) {
                const videoInput = document.getElementById('p-video');
                if (videoInput) p.videoUrl = videoInput.value;

                // Rich Text (ckeditor/quill entegrasyonu gelince burası dolacak)
                // const contentInput = document.getElementById('p-content');
                // if(contentInput) p.content = contentInput.value;
            }
        }
    },

    /**
     * Tek bir projeyi yükle ve forma doldur
     * @param {number} id - Proje ID
     */
    load: (id) => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.load(id);

            // YENİ: Video alanı varsa doldur
            const p = ProjectManager.getProjectById(id);
            if (p) {
                const videoInput = document.getElementById('p-video');
                if (videoInput) videoInput.value = p.videoUrl || '';
            }
        }
    },
};

// Global erişim
window.ProjectEditor = ProjectEditor;

export default ProjectEditor;
