/**
 * Admin Panel Coordinator Module
 *
 * This module acts as the central orchestrator for the admin panel.
 * It coordinates between specialized sub-modules:
 *   - HotspotEditor: Interactive hotspot editing
 *   - QuizEditor: Quiz question management
 *   - ComponentManager: Hardware component CRUD
 *   - ProjectManager: Lesson/project CRUD
 *   - PhaseManager: Course phase/section management
 *   - CourseSettings: Course metadata editing
 *
 * Responsibilities:
 *   - Initialize and configure all sub-modules
 *   - Maintain shared state (currentData, currentCourseKey)
 *   - Handle cross-module operations (autosave, undo, data sync)
 *   - Provide delegate methods for HTML event handlers
 */

const admin = {
    allCourseData: null,
    currentCourseKey: 'arduino',
    currentData: null, // Sadece seçili kursun datası (projects, componentInfo)

    currentProjectId: null,
    currentComponentKey: null,
    currentPhaseIndex: null,

    // Language state for i18n
    currentLang: 'tr',

    // Undo system
    undoStack: [], // {type: 'project'|'component'|'phase', data: {...}, courseKey: 'arduino'}

    // --- AUTOSAVE SYSTEM (Delegated to modules/admin/storage.js) ---
    triggerAutoSave: () => {
        if (typeof StorageManager !== 'undefined') {
            StorageManager.triggerAutoSave();
        }
    },

    saveToLocal: () => {
        if (typeof StorageManager !== 'undefined') {
            StorageManager.saveToLocal();
        }
    },

    restoreFromLocal: () => {
        if (typeof StorageManager !== 'undefined') {
            StorageManager.restoreFromLocal();
        }
    },

    clearLocalData: () => {
        if (typeof StorageManager !== 'undefined') {
            StorageManager.clear();
        }
    },

    init: () => {
        if (typeof window.courseData !== 'undefined') {
            admin.allCourseData = window.courseData;

            // Restore from LocalStorage if available
            admin.restoreFromLocal();

            // Migrate Quiz Data if needed
            if (admin.migrateQuizData) admin.migrateQuizData();

            if (window.applyTheme) window.applyTheme('arduino');
            admin.changeCourse('arduino'); // Başlangıçta Arduino yükle
        } else {
            alert('data.js yüklenemedi!');
        }

        // Initialize Project Manager
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.init({
                onUpdate: admin.triggerAutoSave,
                onProjectSelect: (id) => admin.loadProject(id),
                getProjects: () => admin.currentData.projects,
                getComponentInfo: () => admin.currentData.componentInfo,
                getCourseKey: () => admin.currentCourseKey,
            });
        }

        // Initialize Phase Manager
        if (typeof PhaseManager !== 'undefined') {
            PhaseManager.init({
                onUpdate: admin.triggerAutoSave,
                getPhases: () => admin.currentData?.phases || [],
                getProjects: () => admin.currentData?.projects || [],
            });
        }

        // Initialize Course Settings
        if (typeof CourseSettings !== 'undefined') {
            CourseSettings.init({
                onUpdate: admin.triggerAutoSave,
                getCourseData: () => admin.allCourseData[admin.currentCourseKey],
                getCourseKey: () => admin.currentCourseKey,
            });
        }

        // Initialize Storage Manager
        if (typeof StorageManager !== 'undefined') {
            StorageManager.init({
                storageKey: 'mucit_atolyesi_autosave',
                getData: () => admin.allCourseData,
                setData: (data) => {
                    admin.allCourseData = data;
                },
            });
        }

        // Initialize Image Manager
        if (typeof ImageManager !== 'undefined') {
            ImageManager.init({
                onUpdate: admin.triggerAutoSave,
                getCourseData: () => window.courseData || {},
            });
        }

        // Initialize Supabase Sync
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.init({
                downloadFallback: admin.downloadCourseAsFile,
            });
        }

        // Legacy listener cleanup (ProjectManager handles its own listeners now)
        // But Component listeners remain here
        document
            .querySelectorAll('#component-form input, #component-form textarea, #component-form select')
            .forEach((i) => i.addEventListener('input', admin.updateComponent));
    },

    changeCourse: (key) => {
        if (!admin.allCourseData[key]) {
            console.error(`Course '${key}' not found in courseData.`);
            alert(`Hata: '${key}' dersi verileri bulunamadı via data dosyasını kontrol edin.`);
            return;
        }

        admin.currentCourseKey = key;

        // Apply Theme
        if (window.applyTheme) window.applyTheme(key);

        admin.currentData = admin.allCourseData[key].data;
        // Eğer seçilen kursta data objesi yoksa (veya boşsa) init et
        if (!admin.currentData) {
            admin.allCourseData[key].data = { projects: [], componentInfo: {}, phases: [] };
            admin.currentData = admin.allCourseData[key].data;
        }

        // Tema Rengi Güncelle (merkezi sistem)
        if (window.applyTheme) {
            window.applyTheme(key);
        }

        // UI Reset
        document.getElementById('project-welcome').classList.remove('hidden');
        document.getElementById('project-form').classList.add('hidden');
        admin.currentProjectId = null;

        document.getElementById('component-welcome').classList.remove('hidden');
        document.getElementById('component-form').classList.add('hidden');
        admin.currentComponentKey = null;

        // Dynamic Labels
        const compLabel = document.getElementById('lbl-components');
        const matLabel = document.getElementById('lbl-materials');

        if (key === 'mblock') {
            if (compLabel) compLabel.innerText = 'Aygıt & Uzantı';
            if (matLabel) matLabel.innerText = 'Aygıtlar & Uzantılar';
        } else if (key === 'scratch') {
            if (compLabel) compLabel.innerText = 'Kuklalar';
            if (matLabel) matLabel.innerText = 'Kuklalar';
        } else if (key === 'appinventor') {
            if (compLabel) compLabel.innerText = 'Bileşenler';
            if (matLabel) matLabel.innerText = 'Bileşenler';
        } else {
            if (compLabel) compLabel.innerText = 'Devre Elemanları';
            if (matLabel) matLabel.innerText = 'Devre Elemanları';
        }

        // Initialize Component Manager
        if (typeof ComponentManager !== 'undefined') {
            ComponentManager.init(admin.currentData.componentInfo, {
                onUpdate: admin.triggerAutoSave,
                onLoad: (key) => {
                    admin.currentComponentKey = key;
                }, // Sync active key
            });
        }

        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.renderList(admin.currentProjectId);
        } else {
            admin.renderProjectList();
        }
        admin.renderComponentList();
        admin.renderPhaseList();
        admin.loadCourseSettings();

        // Reset phase UI too
        document.getElementById('phase-welcome').classList.remove('hidden');
        document.getElementById('phase-form').classList.add('hidden');
        admin.currentPhaseIndex = null;
    },

    showTab: (tabName) => {
        const tabs = ['projects', 'components', 'phases'];

        tabs.forEach((t) => {
            const view = document.getElementById('view-' + t);
            const btn = document.getElementById('tab-' + t);

            if (t === tabName) {
                view.classList.remove('hidden');
                view.classList.add('flex'); // Ensure flex display is active
                btn.classList.add('active', 'bg-gray-700', 'text-white'); // Add active styles
                btn.classList.remove('text-gray-300');
            } else {
                view.classList.add('hidden');
                view.classList.remove('flex'); // Remove flex to ensure hidden works
                btn.classList.remove('active', 'bg-gray-700', 'text-white');
                btn.classList.add('text-gray-300');
            }
        });
    },

    // --- COURSE SETTINGS MANAGEMENT (Delegated to modules/admin/settings.js) ---
    loadCourseSettings: () => {
        if (typeof CourseSettings !== 'undefined') {
            CourseSettings.load();
            // Apply custom tab names when course is loaded
            CourseSettings.applyCustomTabNames();
        }
    },

    updateCourseSettings: () => {
        if (typeof CourseSettings !== 'undefined') {
            CourseSettings.update();
        }
    },

    toggleCourseSettings: () => {
        if (typeof CourseSettings !== 'undefined') {
            CourseSettings.toggle();
            // Render tab editor when opening
            CourseSettings.renderTabEditor();
        }
    },

    resetTabNames: () => {
        if (typeof CourseSettings !== 'undefined') {
            CourseSettings.resetTabNames();
        }
    },

    // --- PROJECTS MANAGEMENT (Delegated to modules/admin/projects.js) ---
    renderProjectList: () => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.renderList(admin.currentProjectId);
        }
    },

    toggleCustomSimType: () => ProjectManager.toggleCustomSimType(),

    toggleCodeMode: () => ProjectManager.toggleCodeMode(),

    switchProjectTab: (tabName) => ProjectManager.switchTab(tabName),

    // --- LANGUAGE SWITCHING ---
    switchLang: (lang) => {
        admin.currentLang = lang;

        // Update button styles
        document.querySelectorAll('.lang-btn').forEach((btn) => {
            btn.classList.remove('bg-theme', 'text-white');
            btn.classList.add('text-gray-500');
        });
        const activeBtn = document.getElementById('lang-btn-' + lang);
        if (activeBtn) {
            activeBtn.classList.add('bg-theme', 'text-white');
            activeBtn.classList.remove('text-gray-500');
        }

        // Toggle field visibility
        document.querySelectorAll('.lang-field.lang-tr').forEach((el) => {
            el.classList.toggle('hidden', lang !== 'tr');
        });
        document.querySelectorAll('.lang-field.lang-en').forEach((el) => {
            el.classList.toggle('hidden', lang !== 'en');
        });
    },

    // Helper to get localized value from object or string
    getLocalizedValue: (value, lang) => {
        if (typeof value === 'object' && value !== null) {
            return value[lang] || value['tr'] || '';
        }
        return value || '';
    },

    // Helper to set localized value
    setLocalizedValue: (currentValue, lang, newValue) => {
        if (typeof currentValue === 'object' && currentValue !== null) {
            return { ...currentValue, [lang]: newValue };
        }
        // Convert string to object format
        if (lang === 'tr') {
            return { tr: newValue, en: '' };
        } else {
            return { tr: currentValue || '', en: newValue };
        }
    },

    loadProject: (id) => {
        admin.currentProjectId = id;
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.load(id);
        }
    },

    // --- QUIZ MANAGEMENT (Delegated to modules/admin/quizzes.js) ---
    renderQuizEditor: (projectId) => {
        const id = projectId || admin.currentProjectId;
        const p = admin.currentData.projects.find((x) => x.id === parseInt(id));
        if (!p) return;

        // Ensure quiz array exists
        if (!p.quiz) p.quiz = [];

        if (typeof QuizEditor !== 'undefined') {
            QuizEditor.init(p.id, p.quiz, (newData) => {
                p.quiz = newData;
                admin.triggerAutoSave();
            });
        } else {
            console.error('QuizEditor module not loaded!');
        }
    },

    addQuestion: () => QuizEditor.addQuestion(),

    removeQuestion: (index) => QuizEditor.removeQuestion(index),

    updateQuestion: (qIndex, field, value) => QuizEditor.updateQuestion(qIndex, field, value),

    // --- MIGRATION UTILS ---
    migrateQuizData: () => {
        // Eğer global quizData varsa ve henüz projelere taşınmamışsa taşı
        if (window.quizData && typeof window.quizData === 'object' && Object.keys(window.quizData).length > 0) {
            // Migrating quiz data to projects (silent)
            let migratedCount = 0;

            // Tüm kursları gez
            Object.keys(admin.allCourseData).forEach((courseKey) => {
                const course = admin.allCourseData[courseKey];
                if (course && course.data && course.data.projects) {
                    course.data.projects.forEach((p) => {
                        // Eğer projenin quizi yoksa ve globalde varsa
                        if ((!p.quiz || p.quiz.length === 0) && window.quizData[p.id]) {
                            // Arduino öncelikli olduğu için sadece 'arduino' kursu veya ID çakışması riskini göze alarak
                            // Kullanıcının belirttiği senaryoda ders ile soru ayrıydı.
                            // Burada basitçe ID eşleşmesine bakıyoruz.
                            // Çoklu kurs durumunda en doğrusu bu verinin hangi kursa ait olduğunu bilmektir ama
                            // mevcut quiz.js yapısı bunu desteklemiyor.
                            // Varsayım: quiz.js sadece Arduino içindi.
                            if (courseKey === 'arduino' || Object.keys(admin.allCourseData).length === 1) {
                                p.quiz = JSON.parse(JSON.stringify(window.quizData[p.id]));
                                migratedCount++;
                            }
                        }
                    });
                }
            });

            if (migratedCount > 0) {
                // Migration complete
                // Global quizData'yı temizle ki tekrar tekrar çalışmasın (veya migration flag kullan)
                // window.quizData = null; // Şimdilik dursun, her ihtimale karşı
                admin.triggerAutoSave(); // Değişiklikleri kaydet
            }
        }
    },

    updateProject: () => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.update();
        }
    },

    toggleHotspotEnabled: () => ProjectManager.toggleHotspotEnabled(),

    // Update just the text of current project in list (no re-render to keep focus)
    updateListItemText: (p) => {
        // Handle localized title
        const pTitle = typeof p.title === 'object' ? p.title.tr || p.title.en || 'Untitled' : p.title || 'Untitled';

        // Find item by data attribute (more reliable)
        const item = document.querySelector(`[data-project-id="${p.id}"]`);
        if (item) {
            const textSpan = item.querySelector('.project-title');
            const iconSpan = item.querySelector('.project-icon');
            if (textSpan) textSpan.textContent = `#${p.id} ${pTitle}`;
            if (iconSpan) iconSpan.textContent = p.icon || '📄';
        }
    },

    addNewProject: () => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.add();
        }
    },

    duplicateProject: () => {
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.duplicate();
        }
    },

    deleteProject: () => {
        if (typeof ProjectManager !== 'undefined') {
            const deleted = ProjectManager.delete();
            if (deleted) {
                // Handle Undo here if needed
                admin.undoStack.push({
                    type: 'project',
                    data: JSON.parse(JSON.stringify(deleted)),
                    courseKey: admin.currentCourseKey,
                });
                admin.updateUndoButton();
                admin.showUndoToast(`"${deleted.title}" silindi.`);
                admin.triggerAutoSave();
            }
        }
    },

    // --- COMPONENTS MANAGEMENT (Delegated to modules/admin/components.js) ---
    renderComponentList: () => ComponentManager.renderList(),

    loadComponent: (key) => ComponentManager.load(key),

    updateComponent: () => ComponentManager.update(),

    addNewComponent: () => ComponentManager.add(),

    // --- IMAGE MANAGEMENT (Delegated to modules/admin/images.js) ---
    openImageSelector: (inputId, inputId2 = null) => {
        if (typeof ImageManager !== 'undefined') {
            ImageManager.openSelector(inputId, inputId2);
        }
    },

    closeImageSelector: () => {
        if (typeof ImageManager !== 'undefined') {
            ImageManager.closeSelector();
        }
    },

    loadImageList: () => {
        if (typeof ImageManager !== 'undefined') {
            ImageManager.loadImageList();
        }
    },

    selectImage: (imgName) => {
        if (typeof ImageManager !== 'undefined') {
            ImageManager.selectImage(imgName);
        }
    },

    deleteComponent: () => {
        if (!confirm('Kullanımda olan bir malzemeyi silerseniz site bozulabilir. Yine de silinsin mi?')) return;

        // Store in undo stack
        const key = admin.currentComponentKey;
        const deletedComponent = admin.currentData.componentInfo[key];
        if (deletedComponent) {
            admin.undoStack.push({
                type: 'component',
                key: key,
                data: JSON.parse(JSON.stringify(deletedComponent)),
                courseKey: admin.currentCourseKey,
            });
            admin.updateUndoButton();
        }

        delete admin.currentData.componentInfo[admin.currentComponentKey];
        admin.currentComponentKey = null;
        document.getElementById('component-welcome').classList.remove('hidden');
        document.getElementById('component-form').classList.add('hidden');
        admin.renderComponentList();

        admin.showUndoToast(`"${deletedComponent.name}" silindi.`);

        admin.triggerAutoSave();
    },

    // --- PHASES MANAGEMENT (Delegated to modules/admin/phases.js) ---
    renderPhaseList: () => {
        if (typeof PhaseManager !== 'undefined') {
            // Ensure phases array exists
            if (!admin.currentData.phases) admin.currentData.phases = [];
            PhaseManager.renderList();
        }
    },

    loadPhase: (index) => {
        if (typeof PhaseManager !== 'undefined') {
            PhaseManager.load(index);
        }
    },

    updatePhase: () => {
        if (typeof PhaseManager !== 'undefined') {
            PhaseManager.update();
        }
    },

    addNewPhase: () => {
        if (typeof PhaseManager !== 'undefined') {
            // Ensure phases array exists
            if (!admin.currentData.phases) admin.currentData.phases = [];
            PhaseManager.add();
        }
    },

    deletePhase: () => {
        if (typeof PhaseManager !== 'undefined') {
            PhaseManager.delete();
        }
    },

    validateProjectData: () => {
        const errors = [];
        const projects = admin.currentData.projects || [];
        const phases = admin.currentData.phases || [];
        const ids = new Set();

        projects.forEach((p, index) => {
            // 1. ID Kontrolü
            if (ids.has(p.id)) {
                errors.push(`HATA: Ders ID çakışması! ID: ${p.id} (Ders: ${p.title})`);
            }
            ids.add(p.id);

            // 2. Zorunlu Alanlar
            if (!p.title || p.title.trim() === '') {
                errors.push(`UYARI: ID ${p.id} için başlık boş.`);
            }

            // 3. Faz Geçerliliği
            if (phases.length > 0 && (p.phase < 0 || p.phase >= phases.length)) {
                errors.push(`HATA: ID ${p.id} geçersiz bir faza atanmış (Phase Index: ${p.phase}).`);
            }
        });

        return errors;
    },

    downloadBackup: () => {
        try {
            const fullData = {
                timestamp: new Date().toISOString(),
                courses: admin.allCourseData,
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

            // Trigger autosave to ensure consistency
            admin.triggerAutoSave();
        } catch (e) {
            console.error('Backup failed:', e);
            alert('Yedekleme sırasında bir hata oluştu: ' + e.message);
        }
    },

    saveData: async () => {
        const errors = admin.validateProjectData();
        if (errors.length > 0) {
            if (!confirm('Hatalar var (konsola bak). Yine de kaydetmek ister misin?')) return;
        }

        const key = admin.currentCourseKey;
        const courseData = admin.allCourseData[key];

        // Check if Supabase is available and user is authenticated
        if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client && SupabaseClient.isAdmin) {
            await admin.saveToSupabase(key, courseData);
        } else {
            // Fallback: Download as file
            admin.downloadCourseAsFile(key, courseData);
        }
    },

    // Download course data as JS file (legacy method)
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

    // --- SUPABASE SYNC (Delegated to modules/admin/supabase-sync.js) ---
    saveToSupabase: async (courseKey, courseData) => {
        if (typeof SupabaseSync !== 'undefined') {
            return await SupabaseSync.saveToSupabase(courseKey, courseData);
        }
    },

    syncPhasesToSupabase: async (courseId, phases) => {
        if (typeof SupabaseSync !== 'undefined') {
            return await SupabaseSync.syncPhases(courseId, phases);
        }
    },

    syncProjectsToSupabase: async (courseId, projects, phaseIdMap) => {
        if (typeof SupabaseSync !== 'undefined') {
            return await SupabaseSync.syncProjects(courseId, projects, phaseIdMap);
        }
    },

    syncComponentsToSupabase: async (courseId, componentInfo) => {
        if (typeof SupabaseSync !== 'undefined') {
            return await SupabaseSync.syncComponents(courseId, componentInfo);
        }
    },

    slugify: (text) => {
        if (typeof SupabaseSync !== 'undefined') {
            return SupabaseSync.slugify(text);
        }
        // Fallback
        if (!text) return '';
        return text.toString().toLowerCase().trim().replace(/\s+/g, '-');
    },

    // --- HOTSPOT VISUAL EDITOR (Delegated to modules/admin/hotspots.js) ---
    hotspotAddMode: false, // Legacy fallback
    hotspotData: [],

    initHotspotEditor: () => {
        const p = admin.currentData.projects.find((x) => x.id === admin.currentProjectId);
        if (!p) return;

        // Sync local legacy data just in case
        admin.hotspotData = p.hotspots || [];

        const circuitImg = p.circuitImage || 'devre' + p.id + '.jpg';

        if (typeof HotspotEditor !== 'undefined') {
            HotspotEditor.init(p.hotspots, circuitImg, (newData) => {
                admin.hotspotData = newData; // Sync local state
                admin.syncHotspots();
            });
        } else {
            console.error('HotspotEditor module not loaded!');
        }
    },

    toggleHotspotMode: () => HotspotEditor.toggleMode(),
    handleEditorClick: (e) => HotspotEditor.handleClick(e),
    renderHotspotMarkers: () => HotspotEditor.renderMarkers(),
    renderHotspotList: () => HotspotEditor.renderList(),
    selectHotspot: (index) => HotspotEditor.select(index),
    editHotspot: (index) => HotspotEditor.edit(index),
    deleteHotspot: (index) => HotspotEditor.delete(index),
    clearAllHotspots: () => HotspotEditor.clearAll(),

    syncHotspots: () => {
        // Sync to hidden field and project data
        const p = admin.currentData.projects.find((x) => x.id === admin.currentProjectId);
        if (p) {
            p.hotspots = admin.hotspotData.length > 0 ? admin.hotspotData : null;
        }
        document.getElementById('p-hotspots').value = JSON.stringify(admin.hotspotData);

        admin.triggerAutoSave();
    },

    // --- UNDO SYSTEM ---
    showUndoToast: (message) => {
        // Create or update toast
        let toast = document.getElementById('undo-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'undo-toast';
            toast.className =
                'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transition-all';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <span class="text-sm">${message}</span>
            <button onclick="admin.undo()" class="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm font-bold">
                ↩️ Geri Al
            </button>
            <button onclick="admin.hideUndoToast()" class="text-gray-400 hover:text-white ml-1">✕</button>
        `;
        toast.style.display = 'flex';

        // Auto-hide after 8 seconds
        clearTimeout(admin.undoToastTimer);
        admin.undoToastTimer = setTimeout(() => admin.hideUndoToast(), 8000);
    },

    hideUndoToast: () => {
        const toast = document.getElementById('undo-toast');
        if (toast) toast.style.display = 'none';
    },

    updateUndoButton: () => {
        // Update header undo button visibility
        const btn = document.getElementById('btn-undo');
        if (btn) {
            if (admin.undoStack.length > 0) {
                btn.classList.remove('hidden');
                btn.title = `${admin.undoStack.length} silinen öğe`;
            } else {
                btn.classList.add('hidden');
            }
        }
    },

    undo: () => {
        if (admin.undoStack.length === 0) return;

        const item = admin.undoStack.pop();
        admin.updateUndoButton();
        admin.hideUndoToast();

        // Switch to correct course if needed
        if (item.courseKey !== admin.currentCourseKey) {
            const selector = document.getElementById('course-selector');
            if (selector) selector.value = item.courseKey;
            admin.changeCourse(item.courseKey);
        }

        if (item.type === 'project') {
            admin.currentData.projects.push(item.data);
            admin.renderProjectList();
            admin.loadProject(item.data.id);
            alert(`"${item.data.title}" geri yüklendi!`);
        }
    },

    // ==========================================
    // IMAGE PREVIEW/UPLOAD (Delegated to modules/admin/images.js)
    // ==========================================

    previewCircuitImage: () => {
        if (typeof ImageManager !== 'undefined') {
            ImageManager.previewCircuitImage();
        }
    },

    uploadCircuitImage: async (fileInput) => {
        if (typeof ImageManager !== 'undefined') {
            await ImageManager.uploadCircuitImage(fileInput);
        }
    },

    resolveImageUrl: (imagePath) => {
        if (typeof ImageManager !== 'undefined') {
            return ImageManager.resolveImageUrl(imagePath);
        }
        // Fallback
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        return imagePath.startsWith('img/') ? imagePath : `img/${imagePath}`;
    },
};

// Export for global
window.admin = admin;
