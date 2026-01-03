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

    // --- AUTOSAVE SYSTEM ---
    autoSaveKey: 'mucit_atolyesi_autosave',
    autoSaveTimer: null,

    triggerAutoSave: () => {
        const statusEl = document.getElementById('autosave-status');
        if (statusEl) {
            statusEl.textContent = 'Kaydediliyor...';
            statusEl.classList.remove('text-green-400', 'text-red-400', 'text-blue-400');
            statusEl.classList.add('text-yellow-400');
        }

        if (admin.autoSaveTimer) clearTimeout(admin.autoSaveTimer);
        admin.autoSaveTimer = setTimeout(admin.saveToLocal, 2000); // 2 seconds debounce
    },

    saveToLocal: () => {
        try {
            const dataToSave = {
                timestamp: new Date().getTime(),
                data: admin.allCourseData,
            };
            localStorage.setItem(admin.autoSaveKey, JSON.stringify(dataToSave));

            const timeStr = new Date().toLocaleTimeString();
            const statusEl = document.getElementById('autosave-status');
            if (statusEl) {
                statusEl.textContent = `Son otomatik kayıt: ${timeStr}`;
                statusEl.classList.remove('text-yellow-400', 'text-red-400', 'text-blue-400');
                statusEl.classList.add('text-green-400');
            }
        } catch (e) {
            console.error('AutoSave Error:', e);
            const statusEl = document.getElementById('autosave-status');
            if (statusEl) {
                statusEl.textContent = 'Otomatik kayıt hatası! (Depolama dolu olabilir)';
                statusEl.classList.remove('text-yellow-400', 'text-green-400', 'text-blue-400');
                statusEl.classList.add('text-red-400');
            }
        }
    },

    restoreFromLocal: () => {
        try {
            const saved = localStorage.getItem(admin.autoSaveKey);
            if (!saved) return;

            const parsed = JSON.parse(saved);

            if (parsed.data) {
                // Check if local data is vastly different or empty
                if (Object.keys(parsed.data).length === 0) return;

                admin.allCourseData = parsed.data;
                const date = new Date(parsed.timestamp).toLocaleString();
                // Data restored silently

                // UI update delayed to ensure element exists
                setTimeout(() => {
                    const statusEl = document.getElementById('autosave-status');
                    if (statusEl) {
                        statusEl.textContent = `Yüklendi: ${date}`;
                        statusEl.classList.remove('text-yellow-400', 'text-green-400', 'text-red-400');
                        statusEl.classList.add('text-blue-400');
                    }
                }, 500);
            }
        } catch (e) {
            console.error('Restore Error:', e);
        }
    },

    clearLocalData: () => {
        localStorage.removeItem(admin.autoSaveKey);
        const statusEl = document.getElementById('autosave-status');
        if (statusEl) statusEl.textContent = '';
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

    // --- IMAGE SELECTOR ---
    targetInputId: null,
    targetInputId2: null, // Optional secondary input (e.g. for syncing two fields)

    openImageSelector: (inputId, inputId2 = null) => {
        admin.targetInputId = inputId;
        admin.targetInputId2 = inputId2;
        document.getElementById('image-selector-modal').classList.remove('hidden');
        admin.loadImageList();
    },

    closeImageSelector: () => {
        document.getElementById('image-selector-modal').classList.add('hidden');
        admin.targetInputId = null;
        admin.targetInputId2 = null;
    },

    loadImageList: async () => {
        const grid = document.getElementById('image-selector-grid');
        grid.innerHTML = '<div class="col-span-full text-center p-4">Yükleniyor...</div>';

        // Simulating fetching image list (In a real app, this would be an API call)
        // For now, we'll list common images and try to "guess" or manually list them.
        // Since we can't list server files directly without an API, we will use a predefined list + some common logic
        // OR we can make the AI "read" the img directory if possible (not possible in browser JS).
        // Best approach for this "local" tool is to scan known images from loaded data

        const knownImages = new Set();
        // Collect images from all loaded course data to build a library
        Object.values(window.courseData || {}).forEach((course) => {
            if (course && course.data) {
                (course.data.projects || []).forEach((p) => {
                    if (p.circuitImage) knownImages.add(p.circuitImage);
                    if (p.code && p.code.match(/\.(png|jpg|jpeg|gif)$/i)) knownImages.add(p.code);
                });
                Object.values(course.data.componentInfo || {}).forEach((c) => {
                    if (c.imgFileName) knownImages.add(c.imgFileName);
                });
            }
        });

        // Add some generic ones manually if not found
        ['arduino_uno.jpg', 'breadboard.jpg', 'led_red.jpg', 'resistor.jpg', 'buzzer.jpg'].forEach((img) =>
            knownImages.add(img)
        );

        grid.innerHTML = '';
        if (knownImages.size === 0) {
            grid.innerHTML = '<div class="col-span-full text-center p-4 text-gray-500">Kayıtlı resim bulunamadı.</div>';
            return;
        }

        Array.from(knownImages)
            .sort()
            .forEach((imgName) => {
                const div = document.createElement('div');
                div.className =
                    'border rounded cursor-pointer hover:border-blue-500 hover:shadow-md transition p-1 bg-white flex flex-col items-center';
                div.onclick = () => admin.selectImage(imgName);
                div.innerHTML = `
                <div class="w-full h-24 bg-gray-100 mb-1 flex items-center justify-center overflow-hidden">
                    <img src="img/${imgName}" class="max-w-full max-h-full object-contain" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNSIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg=='">
                </div>
                <span class="text-[10px] text-gray-600 truncate w-full text-center" title="${imgName}">${imgName}</span>
            `;
                grid.appendChild(div);
            });
    },

    selectImage: (imgName) => {
        if (admin.targetInputId) {
            const el = document.getElementById(admin.targetInputId);
            if (el) {
                el.value = imgName;
                // Trigger events
                el.dispatchEvent(new Event('input'));
                el.dispatchEvent(new Event('change'));
            }
        }
        if (admin.targetInputId2) {
            const el2 = document.getElementById(admin.targetInputId2);
            if (el2) {
                el2.value = imgName;
                el2.dispatchEvent(new Event('input'));
                el2.dispatchEvent(new Event('change'));
            }
        }
        admin.closeImageSelector();
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

    // Save to Supabase
    saveToSupabase: async (courseKey, courseData) => {
        const statusEl = document.getElementById('autosave-status');

        try {
            if (statusEl) {
                statusEl.textContent = "☁️ Supabase'e kaydediliyor...";
                statusEl.classList.remove('text-green-400', 'text-red-400', 'text-blue-400');
                statusEl.classList.add('text-yellow-400');
            }

            // 1. Get or create course
            const slug = admin.slugify(courseData.title || courseKey);
            let course = await SupabaseClient.getCourseBySlug(slug);

            if (!course) {
                // Create new course
                const { data, error } = await SupabaseClient.getClient()
                    .from('courses')
                    .insert({
                        slug: slug,
                        title: courseData.title,
                        description: courseData.description || null,
                        meta: { icon: courseData.icon || null },
                        is_published: false,
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                course = { id: data.id };
            }

            const courseId = course.id;

            // 2. Update course metadata
            await SupabaseClient.updateCourse(courseId, {
                title: courseData.title,
                description: courseData.description,
                meta: { icon: courseData.icon },
            });

            // 3. Sync phases
            const phases = courseData.data?.phases || [];
            const phaseIdMap = await admin.syncPhasesToSupabase(courseId, phases);

            // 4. Sync projects
            const projects = courseData.data?.projects || [];
            await admin.syncProjectsToSupabase(courseId, projects, phaseIdMap);

            // 5. Sync components
            const componentInfo = courseData.data?.componentInfo || {};
            await admin.syncComponentsToSupabase(courseId, componentInfo);

            if (statusEl) {
                statusEl.textContent = `☁️ Supabase'e kaydedildi: ${new Date().toLocaleTimeString()}`;
                statusEl.classList.remove('text-yellow-400', 'text-red-400', 'text-blue-400');
                statusEl.classList.add('text-green-400');
            }

            alert("✅ Değişiklikler Supabase'e kaydedildi!");
        } catch (error) {
            console.error('Supabase save error:', error);

            if (statusEl) {
                statusEl.textContent = `❌ Kaydetme hatası: ${error.message}`;
                statusEl.classList.remove('text-yellow-400', 'text-green-400', 'text-blue-400');
                statusEl.classList.add('text-red-400');
            }

            // Offer fallback download
            if (confirm(`Supabase'e kaydedilemedi: ${error.message}\n\nYerel dosya olarak indirmek ister misiniz?`)) {
                admin.downloadCourseAsFile(courseKey, courseData);
            }
        }
    },

    // Sync phases to Supabase
    syncPhasesToSupabase: async (courseId, phases) => {
        const phaseIdMap = {}; // index -> uuid

        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            const name = phase.title || `Bölüm ${i}`;

            // Try to find existing phase
            const { data: existing } = await SupabaseClient.getClient()
                .from('phases')
                .select('id')
                .eq('course_id', courseId)
                .eq('name', name)
                .maybeSingle();

            if (existing) {
                // Update existing
                await SupabaseClient.updatePhase(existing.id, {
                    description: phase.description,
                    position: i,
                    meta: { color: phase.color, icon: phase.icon },
                });
                phaseIdMap[i] = existing.id;
            } else {
                // Create new
                const newPhase = await SupabaseClient.createPhase({
                    course_id: courseId,
                    name: name,
                    description: phase.description || null,
                    position: i,
                    meta: { color: phase.color, icon: phase.icon },
                });
                phaseIdMap[i] = newPhase.id;
            }
        }

        return phaseIdMap;
    },

    // Sync projects to Supabase
    syncProjectsToSupabase: async (courseId, projects, phaseIdMap) => {
        for (const proj of projects) {
            const slug =
                admin.slugify(typeof proj.title === 'object' ? proj.title.tr : proj.title) || `project-${proj.id}`;
            const phaseId = phaseIdMap[proj.phase] || Object.values(phaseIdMap)[0];

            if (!phaseId) {
                console.warn(`Phase not found for project ${proj.title}, skipping...`);
                continue;
            }

            const projectData = {
                course_id: courseId,
                phase_id: phaseId,
                slug: slug,
                title: typeof proj.title === 'object' ? proj.title.tr : proj.title,
                description: typeof proj.desc === 'object' ? proj.desc.tr : proj.desc,
                materials: proj.materials || [],
                circuit: proj.circuitImage || proj.circuit_desc || null,
                code: proj.code || null,
                simulation: proj.simType || null,
                challenge: typeof proj.challenge === 'object' ? proj.challenge.tr : proj.challenge,
                component_info: {
                    id: proj.id,
                    icon: proj.icon,
                    phase: proj.phase,
                    mainComponent: proj.mainComponent,
                    hotspots: proj.hotspots,
                    hasGraph: proj.hasGraph,
                    hasSim: proj.hasSim,
                    mission: proj.mission,
                    theory: proj.theory,
                    quiz: proj.quiz,
                    hiddenTabs: proj.hiddenTabs,
                    enableHotspots: proj.enableHotspots,
                    showHotspotsInLab: proj.showHotspotsInLab,
                    difficulty: proj.difficulty,
                    duration: proj.duration,
                    tags: proj.tags,
                    prerequisites: proj.prerequisites,
                },
                is_published: false,
                position: proj.id || 0,
            };

            // Upsert project
            const { error } = await SupabaseClient.getClient()
                .from('projects')
                .upsert(projectData, { onConflict: 'course_id,slug' });

            if (error) {
                console.error(`Error saving project ${proj.title}:`, error);
            }
        }
    },

    // Sync components to Supabase
    syncComponentsToSupabase: async (courseId, componentInfo) => {
        for (const [key, data] of Object.entries(componentInfo)) {
            await SupabaseClient.upsertComponent({
                course_id: courseId,
                key: key,
                data: data,
            });
        }
    },

    // Helper: Create URL-friendly slug
    slugify: (text) => {
        if (!text) return '';
        return text
            .toString()
            .normalize('NFKD')
            .replace(/[\u0300-\u036F]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
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
    // IMAGE MANAGEMENT (Hybrid: Local + Supabase + URL)
    // ==========================================

    /**
     * Preview circuit image when URL/filename changes
     */
    previewCircuitImage: () => {
        const input = document.getElementById('p-circuitImage');
        const preview = document.getElementById('circuit-image-preview');
        const img = document.getElementById('circuit-preview-img');

        if (!input || !preview || !img) return;

        const value = input.value.trim();
        if (!value) {
            preview.classList.add('hidden');
            return;
        }

        // Resolve the URL
        const resolvedUrl = admin.resolveImageUrl(value);
        img.src = resolvedUrl;
        img.onload = () => preview.classList.remove('hidden');
        img.onerror = () => preview.classList.add('hidden');
    },

    /**
     * Upload circuit image to Supabase Storage
     */
    uploadCircuitImage: async (fileInput) => {
        const file = fileInput.files[0];
        if (!file) return;

        // Show loading state
        const statusEl = document.getElementById('autosave-status');
        if (statusEl) {
            statusEl.textContent = '⬆️ Resim yükleniyor...';
            statusEl.classList.add('text-yellow-400');
        }

        try {
            // Check if Supabase client is available
            if (!window.SupabaseClient || !window.SupabaseClient.getClient()) {
                throw new Error('Supabase client not initialized');
            }

            // Upload to Supabase Storage
            const publicUrl = await window.SupabaseClient.uploadImage(file, 'circuits');

            // Set the URL in the input
            const circuitInput = document.getElementById('p-circuitImage');
            if (circuitInput) {
                circuitInput.value = publicUrl;
                admin.previewCircuitImage();
            }

            if (statusEl) {
                statusEl.textContent = '✅ Resim yüklendi!';
                statusEl.classList.remove('text-yellow-400');
                statusEl.classList.add('text-green-400');
            }

            admin.updateProject();
        } catch (error) {
            console.error('Image upload error:', error);

            if (statusEl) {
                statusEl.textContent = '❌ Yükleme hatası!';
                statusEl.classList.remove('text-yellow-400');
                statusEl.classList.add('text-red-400');
            }

            alert(
                'Resim yüklenemedi: ' +
                    error.message +
                    '\n\nAlternatif: Dosya adını manuel girin veya harici URL kullanın.'
            );
        }

        // Reset file input
        fileInput.value = '';
    },

    /**
     * Smart Image URL Resolver (same logic as SupabaseClient)
     * Handles: local files, Supabase storage, external URLs
     */
    resolveImageUrl: (imagePath) => {
        if (!imagePath) return '';

        // Already a full URL (http/https)
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Local file - use relative path
        return imagePath.startsWith('img/') ? imagePath : `img/${imagePath}`;
    },
};

// Export for global
window.admin = admin;
