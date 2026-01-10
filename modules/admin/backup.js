/**
 * Admin Panel Backup & File Service
 *
 * Dosya indirme ve yedekleme işlemlerini yönetir.
 */

const BackupService = {
    /**
     * Tüm verileri JSON olarak indirir
     * @param {Object} allCourseData - Tüm kurs verileri
     */
    downloadBackup: (allCourseData) => {
        try {
            const fullData = {
                timestamp: new Date().toISOString(),
                courses: allCourseData || {},
                quizzes: window.quizData || {},
            };

            const jsonContent = JSON.stringify(fullData, null, 4);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);

            // Format: backup_2023-12-27.json
            const dateStr = new Date().toISOString().slice(0, 10);
            a.download = `backup_mucit_atolyesi_${dateStr}.json`;
            a.click();

            return true;
        } catch (e) {
            console.error('Backup failed:', e);
            alert('Yedekleme sırasında bir hata oluştu: ' + e.message);
            return false;
        }
    },

    /**
     * Tek bir kursu JS dosyası olarak indirir (Legacy Format)
     * @param {string} key - Kurs anahtarı (örn: 'arduino')
     * @param {Object} courseData - Kurs verisi
     */
    downloadCourseAsFile: (key, courseData) => {
        const jsContent = `window.courseData = window.courseData || {};
window.courseData.${key} = ${JSON.stringify(courseData, null, 4)};`;

        const blob = new Blob([jsContent], { type: 'text/javascript;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${key}.js`;
        a.click();

        alert('İndirme başlatıldı!\n' + key + '.js dosyasını data klasörüne kaydedin.');
    },
};

// Global erişim
window.BackupService = BackupService;

export default BackupService;
