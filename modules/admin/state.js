/**
 * Admin Panel State Manager
 *
 * Sadece veri tutmaktan sorumludur. Logic barındırmaz.
 * Singleton Pattern kullanılır.
 */

const AdminState = {
    // Tüm kurs verileri (Supabase veya Local'den gelen)
    allCourseData: {},

    // O an seçili olan kursun anahtarı (örn: 'arduino')
    currentCourseKey: 'arduino',

    // Seçili kursun saf verisi (projects, phases vb.)
    // admin.js'de eskiden 'currentData' olarak geçiyordu
    currentData: null,

    // Editör durumları
    currentProjectId: null,
    currentComponentKey: null,
    currentPhaseIndex: null,

    // Dil seçimi
    currentLang: 'tr',

    // Geri alma yığını
    undoStack: [], // {type, data, courseKey}

    // Auto-save timer referansı
    autoSaveTimer: null,

    // Yüklenme durumu (init flag)
    isInitialized: false,

    // --- Getters & Setters (Validation eklenebilir) ---

    setCourseData(key, data) {
        this.allCourseData[key] = data;
    },

    getCourseData(key) {
        return this.allCourseData[key];
    },

    setCurrentCourse(key) {
        this.currentCourseKey = key;
        if (this.allCourseData[key]) {
            this.currentData = this.allCourseData[key].data;
        } else {
            this.currentData = null;
        }
    },

    resetSelection() {
        this.currentProjectId = null;
        this.currentComponentKey = null;
        this.currentPhaseIndex = null;
    },
};

// Global erişim için (Geçici - Refactoring bitince kalkacak)
window.AdminState = AdminState;

export default AdminState;
