/* global SupabaseClient, CourseManager */
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
    // --- AUTOSAVE SYSTEM ---
    supabaseAutoSaveTimer: null,

    triggerAutoSave: () => {
        // Local Save (Immediate / Fast)
        if (typeof StorageManager !== 'undefined') {
            StorageManager.triggerAutoSave();
        }

        // TEMPORARILY DISABLED: Remote Save to Supabase
        // Too many concurrent requests cause issues
        // Use manual "Kaydet" button instead
        /*
        if (admin.supabaseAutoSaveTimer) clearTimeout(admin.supabaseAutoSaveTimer);

        // Only autosave to Supabase if user is admin
        if (window.Auth && Auth.isAdmin()) {
            admin.supabaseAutoSaveTimer = setTimeout(() => {
                console.log('[Admin] Triggering Supabase auto-save...');
                admin.saveData(true); // true = silent mode
            }, 5000);
        }
        */
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

    // Loading state management
    showLoading(message = 'Yükleniyor...') {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'fixed inset-0 bg-black/30 flex items-center justify-center z-[300]';
            overlay.innerHTML = `
                <div class="bg-white rounded-lg p-6 shadow-xl text-center">
                    <div class="animate-spin text-4xl mb-2">⏳</div>
                    <p id="loading-message" class="text-gray-600">${message}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            const msg = overlay.querySelector('#loading-message');
            if (msg) msg.textContent = message;
            overlay.classList.remove('hidden');
        }
    },

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    },

    init: async () => {
        // Prevent duplicate initialization
        if (admin._isInitialized && Object.keys(admin.allCourseData || {}).length > 0) {
            console.log('[Admin] Already initialized, skipping...');
            admin.hideLoading();
            return;
        }

        admin.showLoading('Yeti LAB Yönetim Paneli Yükleniyor...');

        try {
            // Initialize empty course data container
            admin.allCourseData = {};

            // Check if user is admin
            const isAdmin = window.Auth && Auth.isAdmin();
            console.log('[Admin] User is admin:', isAdmin);

            // Try to load from Supabase first (if available and user is admin)
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client && isAdmin) {
                console.log('[Admin] Loading courses from Supabase...');

                // Add 30s Timeout (increased from 15s to handle slow connections)
                const timeout = new Promise((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Kurs listesi yüklenemedi: Sunucu 30 saniye içinde yanıt vermedi.')),
                        30000
                    )
                );

                const courseList = await Promise.race([SupabaseSync.loadCourseList(), timeout]);

                console.log('[Admin] Course list:', courseList);

                if (courseList.length > 0) {
                    // Load each course from Supabase
                    for (const course of courseList) {
                        console.log('[Admin] Loading course:', course.slug);
                        const courseData = await SupabaseSync.loadFromSupabase(course.slug);
                        if (courseData) {
                            admin.allCourseData[course.slug] = courseData;
                        }
                    }
                } else {
                    console.warn('[Admin] No courses found in Supabase');
                }
            }

            // Fallback: If no Supabase data, try local courseData
            if (Object.keys(admin.allCourseData).length === 0 && typeof window.courseData !== 'undefined') {
                admin.allCourseData = window.courseData;

                // Restore from LocalStorage if available
                admin.restoreFromLocal();
            }

            admin._isInitialized = true;

            // Migrate Quiz Data if needed
            if (admin.migrateQuizData) admin.migrateQuizData();

            // Populate course selector dynamically
            if (admin.populateCourseSelector) admin.populateCourseSelector();

            // Select first available course
            const firstCourseKey = Object.keys(admin.allCourseData)[0] || 'arduino';
            if (window.applyTheme) window.applyTheme(firstCourseKey);
            await admin.changeCourse(firstCourseKey);
        } catch (error) {
            console.error('[Admin] Initialization error:', error);
            alert('Yükleme hatası: ' + error.message);
        } finally {
            admin.hideLoading();
        }

        // Initialize Project Manager
        if (typeof ProjectManager !== 'undefined') {
            ProjectManager.init({
                onUpdate: () => admin.triggerAutoSave(),
                onProjectSelect: (id) => admin.loadProject(id),
                // Read directly from source of truth to avoid 'currentData' sync issues
                getProjects: () => {
                    const key = admin.currentCourseKey;
                    if (key && admin.allCourseData[key] && admin.allCourseData[key].data) {
                        return admin.allCourseData[key].data.projects || [];
                    }
                    return [];
                },
                getPhases: () => admin.currentData?.phases || [],
                getComponentInfo: () => admin.currentData?.componentInfo || {},
                getCourseKey: () => admin.currentCourseKey,
                // NEW: Get Supabase IDs for real-time sync
                getCourseId: () => admin.allCourseData[admin.currentCourseKey]?._supabaseId,
                getPhaseIdMap: () => admin.allCourseData[admin.currentCourseKey]?._phaseIds || {},
            });
        }

        // Initialize CourseManager
        if (typeof CourseManager !== 'undefined') {
            CourseManager.init();
        }

        // Initialize sub-modules (HotspotEditor is initialized when a project is loaded, not here)

        if (typeof PhaseManager !== 'undefined') {
            PhaseManager.init({
                onUpdate: () => admin.triggerAutoSave(),
                getPhases: () => admin.currentData?.phases || [],
                getProjects: () => admin.currentData?.projects || [],
                // NEW: Supabase IDs for real-time sync
                getCourseId: () => admin.allCourseData[admin.currentCourseKey]?._supabaseId,
                getPhaseIdMap: () => admin.allCourseData[admin.currentCourseKey]?._phaseIds || {},
                setPhaseId: (index, id) => {
                    const course = admin.allCourseData[admin.currentCourseKey];
                    if (course) {
                        if (!course._phaseIds) course._phaseIds = {};
                        course._phaseIds[index] = id;
                    }
                },
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

        // Show/hide sticky save bar on scroll
        window.addEventListener('scroll', () => {
            const stickyBar = document.getElementById('sticky-save-bar');
            if (stickyBar) {
                if (window.scrollY > 200) {
                    stickyBar.classList.remove('hidden');
                } else {
                    stickyBar.classList.add('hidden');
                }
            }
        });
    },

    populateCourseSelector: () => {
        const selector = document.getElementById('course-selector');
        if (!selector) return;

        // Use admin.allCourseData as the source of truth (Supabase-First)
        let courses = [];

        if (admin.allCourseData && Object.keys(admin.allCourseData).length > 0) {
            courses = Object.entries(admin.allCourseData).map(([key, data]) => ({
                key,
                title: data.title || key,
                position: data._position || 999,
            }));
        } else if (typeof CourseLoader !== 'undefined' && CourseLoader.manifest) {
            // Fallback to CourseLoader manifest if allCourseData is empty
            courses = Object.entries(CourseLoader.manifest).map(([key, data]) => ({
                key,
                title: data.title || key,
                position: data.position !== undefined ? data.position : 999,
            }));
        }

        // Sort by position
        courses.sort((a, b) => a.position - b.position);

        if (courses.length === 0) return;

        const currentVal = selector.value || admin.currentCourseKey;

        selector.innerHTML = courses
            .map((c) => `<option value="${c.key}" class="bg-white text-gray-800">${c.title}</option>`)
            .join('');

        // Restore selection if possible, otherwise select first
        if (courses.find((c) => c.key === currentVal)) {
            selector.value = currentVal;
        } else if (courses.length > 0) {
            selector.value = courses[0].key;
        }
    },

    changeCourse: (key) => {
        // If data is missing (e.g. file not found), create a placeholder in memory
        if (!admin.allCourseData[key]) {
            console.warn(`[Admin] Course data '${key}' not found. Creating placeholder.`);
            admin.allCourseData[key] = {
                title: key,
                description: '',
                data: {
                    projects: [],
                    componentInfo: {},
                    phases: [{ title: 'Bölüm 1', description: 'Giriş', color: 'blue' }],
                },
            };

            // Try to get metadata from CourseLoader manifest
            if (typeof CourseLoader !== 'undefined' && CourseLoader.manifest && CourseLoader.manifest[key]) {
                admin.allCourseData[key].title = CourseLoader.manifest[key].title;
                admin.allCourseData[key].description = CourseLoader.manifest[key].description;
            }
        }

        admin.currentCourseKey = key;

        // Apply Theme
        if (window.applyTheme) window.applyTheme(key);

        admin.currentData = admin.allCourseData[key].data;
        // Eğer seçilen kursta data objesi yoksa (veya boşsa) init et
        if (!admin.currentData) {
            console.warn(`[Admin] Data not found for '${key}', creating empty structure.`);
            admin.allCourseData[key].data = { projects: [], componentInfo: {}, phases: [] };
            admin.currentData = admin.allCourseData[key].data;
        }

        // Tema Rengi Güncelle (merkezi sistem)
        if (window.applyTheme) {
            window.applyTheme(key);
        }

        // UI Reset - SPA modunda bu elementler olmayabilir
        const projectWelcome = document.getElementById('project-welcome');
        const projectForm = document.getElementById('project-form');
        if (projectWelcome) projectWelcome.classList.remove('hidden');
        if (projectForm) projectForm.classList.add('hidden');
        admin.currentProjectId = null;

        const componentWelcome = document.getElementById('component-welcome');
        const componentForm = document.getElementById('component-form');
        if (componentWelcome) componentWelcome.classList.remove('hidden');
        if (componentForm) componentForm.classList.add('hidden');
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
                onLoad: (componentKey) => {
                    admin.currentComponentKey = componentKey;
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

        // Load course settings only if data is available
        const courseData = admin.allCourseData[key];
        if (courseData && courseData.title) {
            admin.loadCourseSettings();
        } else {
            // Retry after a short delay (data might still be loading)
            setTimeout(() => {
                admin.loadCourseSettings();
            }, 100);
        }

        // Reset phase UI too - SPA modunda bu elementler olmayabilir
        const phaseWelcome = document.getElementById('phase-welcome');
        const phaseForm = document.getElementById('phase-form');
        if (phaseWelcome) phaseWelcome.classList.remove('hidden');
        if (phaseForm) phaseForm.classList.add('hidden');
        admin.currentPhaseIndex = null;

        // Metadata'yı Supabase'den çek (async)
        admin.fetchMetadataFromSupabase(key);

        // Update course selector grid (if visible)
        if (typeof CourseManager !== 'undefined') {
            CourseManager.renderSelectorGrid();
        }
    },

    showTab: (tabName) => {
        const tabs = ['projects', 'components', 'phases'];

        tabs.forEach((t) => {
            const view = document.getElementById('view-' + t);
            const btn = document.getElementById('tab-' + t);

            // SPA modunda bu elementler olmayabilir
            if (!view || !btn) return;

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
        // Render course selector grid when opening
        if (typeof CourseManager !== 'undefined') {
            CourseManager.refreshList();
            CourseManager.renderSelectorGrid();
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

        projects.forEach((p, _index) => {
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

    saveData: async (silent = false) => {
        const errors = admin.validateProjectData();
        if (errors.length > 0) {
            console.warn('[Admin] Validation errors:', errors);
            if (!silent && !confirm('Hatalar var (konsola bak). Yine de kaydetmek ister misin?')) return;
        }

        const key = admin.currentCourseKey;
        const courseData = admin.allCourseData[key];

        // Check if Supabase is available and user is admin
        const isAdmin = window.Auth && Auth.isAdmin();
        if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client && isAdmin) {
            // Show saving status (custom toast or persistent UI)
            if (silent && typeof StorageManager !== 'undefined') {
                StorageManager.updateStatus('Buluta kaydediliyor...', 'blue');
            } else if (!silent) {
                admin.showLoading('Kaydediliyor...');
            }

            try {
                await admin.saveToSupabase(key, courseData);

                if (silent && typeof StorageManager !== 'undefined') {
                    StorageManager.updateStatus('Buluta kaydedildi ✓', 'green');
                }
            } catch (err) {
                console.error('Save failed:', err);
                if (silent && typeof StorageManager !== 'undefined') {
                    StorageManager.updateStatus('Bulut kaydı başarısız!', 'red');
                }
            } finally {
                if (!silent) admin.hideLoading();
            }
        } else {
            // Fallback: Download as file
            if (!silent) admin.downloadCourseAsFile(key, courseData);
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

    // --- SUPABASE FETCH METADATA ---
    fetchMetadataFromSupabase: async (courseKey) => {
        if (typeof SupabaseClient === 'undefined' || !SupabaseClient.client) return;

        try {
            // Simple slugify for matching (same logic as SupabaseSync)
            const title = admin.allCourseData[courseKey]?.title || courseKey;
            const slug = typeof SupabaseSync !== 'undefined' ? SupabaseSync.slugify(title) : title.toLowerCase();

            const { data: course, error } = await SupabaseClient.client
                .from('courses')
                .select('meta')
                .eq('slug', slug)
                .maybeSingle();

            if (error) throw error;

            if (course && course.meta) {
                const currentCourse = admin.allCourseData[courseKey];
                let hasChanges = false;

                // Update customTabNames
                if (course.meta.customTabNames) {
                    currentCourse.customTabNames = course.meta.customTabNames;
                    hasChanges = true;
                }

                // Update other meta if needed
                if (course.meta.icon && course.meta.icon !== currentCourse.icon) {
                    currentCourse.icon = course.meta.icon;
                    hasChanges = true;
                }

                if (hasChanges) {
                    // Update UI components that rely on this data
                    if (courseKey === admin.currentCourseKey) {
                        if (typeof CourseSettings !== 'undefined') {
                            CourseSettings.load(); // Reload preview
                            CourseSettings.renderTabEditor(); // Reload tab editor
                            CourseSettings.applyCustomTabNames(); // Apply to project tabs
                        }
                    }
                }
            }
        } catch (e) {
            console.error('[Admin] Failed to fetch metadata:', e);
        }
    },
};

// Export for global
window.admin = admin;
