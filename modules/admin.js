/* global SupabaseClient, CourseManager */
import SettingsSection from '../views/admin/sections/SettingsSection.js';

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
    // --- STATE MANAGEMENT (Delegated to modules/admin/state.js) ---
    // Geriye uyumluluk için getter/setter kullanıyoruz
    get allCourseData() {
        return window.AdminState?.allCourseData || {};
    },
    set allCourseData(val) {
        if (window.AdminState) window.AdminState.allCourseData = val;
    },

    get currentCourseKey() {
        return window.AdminState?.currentCourseKey || 'arduino';
    },
    set currentCourseKey(val) {
        if (window.AdminState) window.AdminState.currentCourseKey = val;
    },

    get currentData() {
        return window.AdminState?.currentData;
    },
    set currentData(val) {
        if (window.AdminState) window.AdminState.currentData = val;
    },

    get currentProjectId() {
        return window.AdminState?.currentProjectId;
    },
    set currentProjectId(val) {
        if (window.AdminState) window.AdminState.currentProjectId = val;
    },

    get currentComponentKey() {
        return window.AdminState?.currentComponentKey;
    },
    set currentComponentKey(val) {
        if (window.AdminState) window.AdminState.currentComponentKey = val;
    },

    get currentPhaseIndex() {
        return window.AdminState?.currentPhaseIndex;
    },
    set currentPhaseIndex(val) {
        if (window.AdminState) window.AdminState.currentPhaseIndex = val;
    },

    get currentLang() {
        return window.AdminState?.currentLang || 'tr';
    },
    set currentLang(val) {
        if (window.AdminState) window.AdminState.currentLang = val;
    },

    get undoStack() {
        return window.AdminState?.undoStack || [];
    },
    set undoStack(val) {
        if (window.AdminState) window.AdminState.undoStack = val;
    },

    // Timer state
    get supabaseAutoSaveTimer() {
        return window.AdminState?.autoSaveTimer;
    },
    set supabaseAutoSaveTimer(val) {
        if (window.AdminState) window.AdminState.autoSaveTimer = val;
    },

    // Init flag
    get _isInitialized() {
        return window.AdminState?.isInitialized;
    },
    set _isInitialized(val) {
        if (window.AdminState) window.AdminState.isInitialized = val;
    },

    triggerAutoSave: () => {
        // Local Save (Immediate / Fast)
        if (typeof StorageManager !== 'undefined') {
            StorageManager.triggerAutoSave();
        }

        // Remote Save to Supabase (Debounced)
        if (admin.supabaseAutoSaveTimer) clearTimeout(admin.supabaseAutoSaveTimer);

        // Only autosave to Supabase if user is admin
        if (window.Auth && Auth.isAdmin()) {
            admin.supabaseAutoSaveTimer = setTimeout(() => {
                console.log('[Admin] Triggering Supabase auto-save...');
                if (typeof SupabaseSync !== 'undefined') {
                    admin.saveData(true); // true = silent mode
                }
            }, 3000); // 3 seconds debounce
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

    // Loading state management (Delegated to AdminUI)
    showLoading(message) {
        if (window.AdminUI) window.AdminUI.showLoading(message);
    },

    hideLoading() {
        if (window.AdminUI) window.AdminUI.hideLoading();
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
            // 1. Load course list from Supabase
            if (typeof SupabaseSync !== 'undefined') {
                const courses = await SupabaseSync.loadCourseList();

                // Initialize allCourseData with placeholders
                admin.allCourseData = {};
                courses.forEach((c) => {
                    admin.allCourseData[c.slug] = {
                        title: c.title,
                        _supabaseId: c.id,
                        // Other data will be loaded on demand
                    };
                });
            }

            // 2. Determine initial course
            let initialKey = admin.currentCourseKey;
            const keys = Object.keys(admin.allCourseData || {});

            if (keys.length > 0) {
                if (!keys.includes(initialKey)) {
                    initialKey = keys[0];
                }
            } else {
                // No courses found, create default/empty state or handle gracefully
                console.warn('[Admin] No courses found.');
                // Optional: Create a default course or just let the user create one
            }

            // 3. Select course (loads full data)
            if (initialKey) {
                await admin.changeCourse(initialKey);
            }

            // 4. Initialize Sub-Modules
            if (typeof CourseManager !== 'undefined') CourseManager.init();

            // Initialize Project Manager
            if (typeof ProjectManager !== 'undefined') {
                ProjectManager.init({
                    getProjects: () => admin.currentData?.projects || [],
                    getPhases: () => admin.currentData?.phases || [],
                    getComponentInfo: () => admin.currentData?.componentInfo || {},
                    getCourseKey: () => admin.currentCourseKey,
                    getCourseId: () => admin.allCourseData[admin.currentCourseKey]?._supabaseId,
                    getPhaseIdMap: () => admin.allCourseData[admin.currentCourseKey]?._phaseIds || {},
                    onUpdate: () => admin.triggerAutoSave(),
                    onProjectSelect: (id) => admin.loadProject(id),
                });
            }

            // Initialize Phase Manager
            if (typeof PhaseManager !== 'undefined') {
                PhaseManager.init({
                    getPhases: () => admin.currentData?.phases || [],
                    getPhaseIdMap: () => admin.allCourseData[admin.currentCourseKey]?._phaseIds || {},
                    getCourseId: () => admin.allCourseData[admin.currentCourseKey]?._supabaseId,
                    onUpdate: () => admin.triggerAutoSave(),
                    onPhaseSelect: (index) => admin.loadPhase(index),
                });
            }

            // Initialize Component Manager
            if (typeof ComponentManager !== 'undefined') {
                ComponentManager.init({
                    getComponentInfo: () => admin.currentData?.componentInfo || {},
                    onUpdate: () => admin.triggerAutoSave(),
                    onComponentSelect: (key) => admin.loadComponent(key),
                });
            }

            // Initialize Course Settings (Legacy Top Bar)
            if (typeof CourseSettings !== 'undefined') {
                CourseSettings.init({
                    getCourseData: () => admin.allCourseData[admin.currentCourseKey],
                    getCourseKey: () => admin.currentCourseKey,
                    onUpdate: () => admin.triggerAutoSave(),
                });
            }

            // Initialize Image Manager
            if (typeof ImageManager !== 'undefined') {
                ImageManager.init({
                    getCourseKey: () => admin.currentCourseKey,
                });
            }

            // 5. Finalize
            admin._isInitialized = true;
            console.log('[Admin] Initialized successfully');
        } catch (error) {
            console.error('[Admin] Init error:', error);
            alert('Admin paneli yüklenirken hata oluştu: ' + error.message);
        } finally {
            admin.hideLoading();
        }
    },

    changeCourse: async (key) => {
        try {
            admin.showLoading(`"${key}" kursu yükleniyor...`);

            console.log(`[Admin] Changing course to: ${key}`);
            admin.currentCourseKey = key;

            // 1. Load full data if not already fully loaded
            // We check for 'data' property to see if full content is loaded
            let courseData = admin.allCourseData[key];

            if (!courseData || !courseData.data) {
                if (typeof SupabaseSync !== 'undefined') {
                    const loadedData = await SupabaseSync.loadFromSupabase(key);
                    if (loadedData) {
                        admin.allCourseData[key] = loadedData;
                        courseData = loadedData;
                    }
                }
            }

            if (!courseData) {
                throw new Error(`Course data for "${key}" could not be loaded.`);
            }

            // 2. Set as current global data
            admin.currentData = courseData.data;

            // 3. Render UI components
            if (typeof CourseManager !== 'undefined') {
                CourseManager.refreshList(); // Update course selector
                CourseManager.renderSelectorGrid();
            }

            // Update Header/Settings Preview
            const titleEl = document.getElementById('course-title-preview');
            const descEl = document.getElementById('course-desc-preview');
            const iconEl = document.getElementById('course-icon-preview');

            if (titleEl) titleEl.textContent = courseData.title || key;
            if (descEl) descEl.textContent = courseData.description || 'Açıklama yok';
            if (iconEl) iconEl.textContent = courseData.icon || '📦';

            // Render settings form inputs
            // FIX: Re-mount SettingsSection if needed to ensure event listeners are bound
            if (window.SettingsSection && document.getElementById('settings-edit-title')) {
                SettingsSection.mount();
            } else {
                // Fallback for when not on settings page but these elements exist (unlikely but safe)
                const inputTitle = document.getElementById('admin-course-title');
                const inputDesc = document.getElementById('admin-course-description');
                const inputIcon = document.getElementById('admin-course-icon');

                if (inputTitle) inputTitle.value = courseData.title || '';
                if (inputDesc) inputDesc.value = courseData.description || '';
                if (inputIcon) inputIcon.value = courseData.icon || '📦';
            }

            // 4. Initial Render of content
            admin.renderProjectList();
            admin.renderPhaseList();
            admin.renderComponentList();

            // Initialize other editors
            if (admin.currentData.projects && admin.currentData.projects.length > 0) {
                // Select first project by default
                admin.loadProject(admin.currentData.projects[0].id);
            } else {
                document.getElementById('project-form').classList.add('hidden');
                document.getElementById('project-welcome').classList.remove('hidden');
            }

            // Load Custom Tab Names
            admin.loadCourseSettings();
        } catch (error) {
            console.error('[Admin] Change course error:', error);
            // Don't show alert for simple switch, maybe toast?
        } finally {
            admin.hideLoading();
        }
    },

    // ...

    showTab: (tabName) => {
        if (window.AdminUI) window.AdminUI.showTab(tabName);
    },

    // ...

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

    // --- PROJECTS MANAGEMENT (Delegated to modules/admin/projectEditor.js) ---
    renderProjectList: () => {
        if (window.ProjectEditor) window.ProjectEditor.renderList(admin.currentProjectId);
    },

    toggleCustomSimType: () => ProjectManager.toggleCustomSimType(),

    toggleCodeMode: () => ProjectManager.toggleCodeMode(),

    switchProjectTab: (tabName) => ProjectManager.switchTab(tabName),

    // --- LANGUAGE SWITCHING ---
    switchLang: (lang) => {
        if (window.AdminUI) {
            window.AdminUI.switchLangUI(lang);
            // State update
            admin.currentLang = lang;
        }
    },

    // ...

    loadProject: (id) => {
        admin.currentProjectId = id;
        if (window.ProjectEditor) {
            window.ProjectEditor.load(id);
        }
    },

    // ...

    updateProject: () => {
        if (window.ProjectEditor) {
            window.ProjectEditor.update();
        }
    },

    // ...

    addNewProject: () => {
        if (window.ProjectEditor) {
            window.ProjectEditor.add();
        }
    },

    duplicateProject: () => {
        if (window.ProjectEditor) {
            window.ProjectEditor.duplicate();
        }
    },

    deleteProject: () => {
        if (window.ProjectEditor) {
            window.ProjectEditor.delete();
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
        if (window.BackupService && window.AdminState) {
            const success = window.BackupService.downloadBackup(window.AdminState.allCourseData);
            if (success) admin.triggerAutoSave();
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

    // Download course data as JS file (delegate)
    downloadCourseAsFile: (key, courseData) => {
        if (window.BackupService) {
            window.BackupService.downloadCourseAsFile(key, courseData);
        }
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

    // --- QUIZ MANAGEMENT (Delegated to modules/admin/quizzes.js) ---
    renderQuizEditor: (projectId) => {
        const id = projectId || admin.currentProjectId;
        const p = admin.currentData.projects.find((x) => x.id === parseInt(id));
        if (!p) return;

        // Ensure quiz array exists
        if (!p.quiz) p.quiz = [];

        if (typeof window.QuizEditor !== 'undefined') {
            window.QuizEditor.init(p.id, p.quiz, (newData) => {
                p.quiz = newData;
                admin.triggerAutoSave();
            });
        } else {
            console.error('QuizEditor module not loaded!');
        }
    },

    addQuestion: () => window.QuizEditor && window.QuizEditor.addQuestion(),

    removeQuestion: (index) => window.QuizEditor && window.QuizEditor.removeQuestion(index),

    updateQuestion: (qIndex, field, value) =>
        window.QuizEditor && window.QuizEditor.updateQuestion(qIndex, field, value),

    // --- MIGRATION UTILS ---
    migrateQuizData: () => {
        // ...
    },

    // ...

    // --- IMAGES ---
    openImageManager: () => {
        if (typeof window.ImageManager !== 'undefined') window.ImageManager.open();
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
// Export for global
window.admin = admin;

export default admin;
