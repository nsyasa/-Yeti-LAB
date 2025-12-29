/**
 * Admin Panel Module
 * Manages course content, projects, phases, and components.
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
            statusEl.textContent = "Kaydediliyor...";
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
                data: admin.allCourseData
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
            console.error("AutoSave Error:", e);
            const statusEl = document.getElementById('autosave-status');
            if (statusEl) {
                statusEl.textContent = "Otomatik kayıt hatası! (Depolama dolu olabilir)";
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
                console.log(`Veriler LocalStorage'dan geri yüklendi (${date})`);

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
            console.error("Restore Error:", e);
        }
    },

    clearLocalData: () => {
        localStorage.removeItem(admin.autoSaveKey);
        const statusEl = document.getElementById('autosave-status');
        if (statusEl) statusEl.textContent = "";
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
            alert("data.js yüklenemedi!");
        }

        // Form dinleyicileri
        document.querySelectorAll('#project-form input, #project-form textarea, #project-form select').forEach(i => {
            // Checkboxlar için özel işlem (input event'i bazen yetersiz kalabilir)
            if (i.type === "checkbox") i.addEventListener('change', admin.updateProject);
            else i.addEventListener('input', admin.updateProject);
        });
        document.querySelectorAll('#component-form input, #component-form textarea, #component-form select').forEach(i => i.addEventListener('input', admin.updateComponent));
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

        admin.renderProjectList();
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

        tabs.forEach(t => {
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

    // --- COURSE SETTINGS MANAGEMENT ---
    loadCourseSettings: () => {
        const course = admin.allCourseData[admin.currentCourseKey];
        if (!course) return;

        // Default icon based on course type
        const defaultIcons = {
            arduino: '🔌',
            microbit: '🎮',
            scratch: '🐱',
            mblock: '🤖',
            appinventor: '📱'
        };

        const icon = course.icon || defaultIcons[admin.currentCourseKey] || '📚';
        const title = course.title || admin.currentCourseKey;
        const desc = course.description || '';

        // Update form fields
        document.getElementById(EL.ADMIN.COURSE.ICON).value = icon;
        document.getElementById(EL.ADMIN.COURSE.TITLE).value = title;
        document.getElementById(EL.ADMIN.COURSE.DESC).value = desc;

        // Update preview
        document.getElementById(EL.ADMIN.COURSE.PREVIEW_ICON).textContent = icon;
        document.getElementById(EL.ADMIN.COURSE.PREVIEW_TITLE).textContent = title;
        document.getElementById(EL.ADMIN.COURSE.PREVIEW_DESC).textContent = desc || 'Açıklama eklemek için tıklayın';
    },

    updateCourseSettings: () => {
        const course = admin.allCourseData[admin.currentCourseKey];
        if (!course) return;

        const icon = document.getElementById(EL.ADMIN.COURSE.ICON).value;
        const title = document.getElementById(EL.ADMIN.COURSE.TITLE).value;
        const desc = document.getElementById(EL.ADMIN.COURSE.DESC).value;

        // Update course data
        course.icon = icon;
        course.title = title;
        course.description = desc;

        // Update preview in real-time
        document.getElementById(EL.ADMIN.COURSE.PREVIEW_ICON).textContent = icon || '📚';
        document.getElementById(EL.ADMIN.COURSE.PREVIEW_TITLE).textContent = title || admin.currentCourseKey;
        document.getElementById(EL.ADMIN.COURSE.PREVIEW_DESC).textContent = desc || 'Açıklama yok';

        admin.triggerAutoSave();
    },

    toggleCourseSettings: () => {
        const form = document.getElementById(EL.ADMIN.COURSE.FORM);
        const toggle = document.getElementById(EL.ADMIN.COURSE.TOGGLE);

        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
            toggle.textContent = '▲';
            toggle.style.transform = 'rotate(180deg)';
        } else {
            form.classList.add('hidden');
            toggle.textContent = '▼';
            toggle.style.transform = 'rotate(0deg)';
        }
    },

    // --- PROJECTS MANAGEMENT ---
    renderProjectList: () => {
        const list = document.getElementById('project-list');
        list.innerHTML = "";
        if (!admin.currentData.projects) admin.currentData.projects = [];

        try {
            admin.currentData.projects.sort((a, b) => a.id - b.id).forEach(p => {
                const activeClass = p.id === admin.currentProjectId ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50 border-transparent";
                const pIcon = p.icon || '📄';
                // Handle localized title
                const pTitle = typeof p.title === 'object' ? (p.title.tr || p.title.en || 'Untitled') : (p.title || 'Untitled');
                list.innerHTML += `
                    <div onclick="admin.loadProject(${p.id})" data-project-id="${p.id}" class="p-3 border-l-4 cursor-pointer transition ${activeClass}">
                        <div class="flex justify-between items-center">
                            <span class="project-title font-bold text-sm text-gray-700">#${p.id} ${pTitle}</span>
                            <span class="project-icon text-xs text-gray-400">${pIcon}</span>
                        </div>
                    </div>`;
            });
        } catch (e) {
            console.error("Error rendering project list:", e);
            list.innerHTML += `<div class="p-2 text-red-500 text-xs">Hata: Dersler listelenemedi.</div>`;
        }
    },

    toggleCustomSimType: () => {
        const select = document.getElementById('p-simType');
        const customInput = document.getElementById('p-simType-custom');

        // Custom Input Toggle
        if (select.value === 'custom') {
            customInput.classList.remove('hidden');
            customInput.focus();
        } else {
            customInput.classList.add('hidden');
        }
    },

    toggleCodeMode: () => {
        const mode = document.getElementById('p-code-mode');
        if (!mode) return;

        const codeText = document.getElementById('code-text-area');
        const codeImg = document.getElementById('code-image-area');

        if (mode.value === 'text') {
            if (codeText) codeText.classList.remove('hidden');
            if (codeImg) codeImg.classList.add('hidden');
        } else {
            if (codeText) codeText.classList.add('hidden');
            if (codeImg) codeImg.classList.remove('hidden');
        }
    },

    switchProjectTab: (tabName) => {
        document.querySelectorAll('.project-tab-btn').forEach(b => {
            b.classList.remove('active', 'border-theme', 'text-theme');
            b.classList.add('border-transparent', 'text-gray-500');
        });
        document.querySelectorAll('.project-tab-content').forEach(c => c.classList.add('hidden'));

        const btn = document.getElementById('ptab-' + tabName);
        if (btn) {
            btn.classList.add('active', 'border-theme', 'text-theme');
            btn.classList.remove('border-transparent', 'text-gray-500');
        }
        document.getElementById('pcontent-' + tabName).classList.remove('hidden');
    },

    // --- LANGUAGE SWITCHING ---
    switchLang: (lang) => {
        admin.currentLang = lang;

        // Update button styles
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('bg-theme', 'text-white');
            btn.classList.add('text-gray-500');
        });
        const activeBtn = document.getElementById('lang-btn-' + lang);
        if (activeBtn) {
            activeBtn.classList.add('bg-theme', 'text-white');
            activeBtn.classList.remove('text-gray-500');
        }

        // Toggle field visibility
        document.querySelectorAll('.lang-field.lang-tr').forEach(el => {
            el.classList.toggle('hidden', lang !== 'tr');
        });
        document.querySelectorAll('.lang-field.lang-en').forEach(el => {
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
        const p = admin.currentData.projects.find(x => x.id === id);
        document.getElementById('project-welcome').classList.add('hidden');
        document.getElementById('project-form').classList.remove('hidden');

        // Reset Tab to 'Genel'
        admin.switchProjectTab('genel');

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = (val !== undefined && val !== null) ? val : "";
        };

        setVal('p-id', p.id); // Read-only ID

        // Handle localized fields (TR/EN)
        const setLocalizedField = (fieldName, value) => {
            const trEl = document.getElementById(`p-${fieldName}-tr`);
            const enEl = document.getElementById(`p-${fieldName}-en`);
            if (typeof value === 'object' && value !== null) {
                if (trEl) trEl.value = value.tr || '';
                if (enEl) enEl.value = value.en || '';
            } else {
                // Backward compatibility: string value goes to TR
                if (trEl) trEl.value = value || '';
                if (enEl) enEl.value = '';
            }
        };

        setLocalizedField('title', p.title);
        setLocalizedField('desc', p.desc);
        setLocalizedField('mission', p.mission);
        setLocalizedField('theory', p.theory);
        setLocalizedField('challenge', p.challenge);

        setVal('p-icon', p.icon);
        setVal('p-phase', p.phase);
        setVal('p-week', p.week); // Optional week support

        // New metadata fields
        setVal('p-difficulty', p.difficulty || 'beginner');
        setVal('p-duration', p.duration || '');
        setVal('p-tags', p.tags ? p.tags.join(', ') : '');
        setVal('p-prerequisites', p.prerequisites ? p.prerequisites.join(', ') : '');

        // Set Tab Visibility Checkboxes
        const tabIds = ['mission', 'materials', 'circuit', 'code', 'challenge', 'quiz'];
        const hiddenTabs = p.hiddenTabs || []; // Default to empty (all visible) if undefined
        tabIds.forEach(id => {
            const chk = document.getElementById(`p-show-${id}`);
            if (chk) {
                chk.checked = !hiddenTabs.includes(id);
            }
        });

        // Sim Type Logic
        const select = document.getElementById('p-simType');
        const customInput = document.getElementById('p-simType-custom');

        // Eğer mevcut değer listede varsa seç, yoksa 'custom' yap ve inputa yaz
        let found = false;
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === p.simType) {
                select.value = p.simType;
                found = true;
                break;
            }
        }
        if (!found && p.simType) {
            select.value = 'custom';
            customInput.value = p.simType;
            customInput.classList.remove('hidden');
        } else {
            customInput.classList.add('hidden');
            customInput.value = "";
        }

        // Code Mode Logic
        const codeVal = p.code || '';
        const isImg = codeVal.match(/\.(jpeg|jpg|gif|png)$/) != null;
        document.getElementById('p-code-mode').value = isImg ? 'image' : 'text';
        admin.toggleCodeMode();

        if (isImg) {
            setVal('p-code', codeVal); // Set textarea too for sync
            setVal('p-code-image-input', codeVal);
        } else {
            setVal('p-code', codeVal);
            setVal('p-code-image-input', '');
        }

        setVal('p-hasGraph', p.hasGraph ? "true" : "false");
        setVal('p-challenge', p.challenge);
        setVal('p-circuitImage', p.circuitImage || `devre${p.id}.jpg`);
        setVal('p-hotspots', p.hotspots ? JSON.stringify(p.hotspots) : "");

        // Hotspot checkboxes
        const enableHotspots = document.getElementById('p-enableHotspots');
        const showInLab = document.getElementById('p-showInLab');
        const editorContent = document.getElementById('hotspot-editor-content');

        // Check if project has hotspots enabled (either has hotspots data or explicit flag)
        const hasHotspots = (p.hotspots && p.hotspots.length > 0) || p.enableHotspots;
        enableHotspots.checked = hasHotspots;
        showInLab.checked = p.showHotspotsInLab || false;

        // Show/hide editor content based on checkbox
        if (hasHotspots) {
            editorContent.classList.remove('hidden');
            setTimeout(() => admin.initHotspotEditor(), 100);
        } else {
            editorContent.classList.add('hidden');
        }

        // Malzeme Seçiciyi Doldur (Güvenli Yöntem v2)
        const matList = document.getElementById('p-materials-list');

        let components = {};
        // Veri kaynağını belirle
        if (admin.currentData && admin.currentData.componentInfo) {
            components = admin.currentData.componentInfo;
        } else if (window.courseData && window.courseData[admin.currentCourseKey] && window.courseData[admin.currentCourseKey].data) {
            components = window.courseData[admin.currentCourseKey].data.componentInfo || {};
        }

        const compKeys = Object.keys(components);

        let htmlContent = "";

        if (compKeys.length > 0) {
            compKeys.forEach(key => {
                const comp = components[key];
                if (!comp) return;

                const name = comp.name || key;
                const icon = comp.icon || '📦';

                const isChecked = p.materials && p.materials.includes(name);
                const safeName = name.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

                htmlContent += `
                    <label class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer bg-white">
                        <input type="checkbox" value="${safeName}" class="material-checkbox w-4 h-4 text-blue-600 rounded" ${isChecked ? "checked" : ""} onchange="admin.updateProject()">
                        <span class="text-lg">${icon}</span>
                        <span class="text-sm font-medium text-gray-700 select-none">${name}</span>
                    </label>`;
            });
            matList.innerHTML = htmlContent;
        } else {
            matList.innerHTML = `<div class="col-span-full p-4 text-center text-gray-400 text-sm border-2 border-dashed rounded bg-gray-50">
                <p>Henüz kayıtlı malzeme yok.</p>
                <div class="mt-2 text-xs">Sol menüdeki <b>Devre Elemanları</b> kısmından malzeme ekleyebilirsiniz.</div>
             </div>`;
        }

        // 2. Özel malzemeleri ayıkla
        try {
            const knownNames = Object.values(components).map(c => c.name);
            const customMats = p.materials ? p.materials.filter(m => !knownNames.includes(m)) : [];
            const materialsInput = document.getElementById('p-materials-custom');
            if (materialsInput) materialsInput.value = customMats.join(', ');
        } catch (e) { console.error("Error processing custom materials", e); }

        // QUIZ RENDERING
        if (admin.renderQuizEditor) admin.renderQuizEditor(p.id);

        admin.renderProjectList();
    },

    // --- QUIZ MANAGEMENT ---
    renderQuizEditor: (projectId) => {
        // Find project in CURRENT data
        const p = admin.currentData.projects.find(x => x.id === parseInt(projectId));
        if (!p) return;

        // Ensure quiz array exists
        if (!p.quiz) p.quiz = [];

        const list = document.getElementById('quiz-editor-list');
        const emptyMsg = document.getElementById('quiz-empty-msg');
        list.innerHTML = "";

        const questions = p.quiz;

        if (questions.length === 0) {
            emptyMsg.classList.remove('hidden');
        } else {
            emptyMsg.classList.add('hidden');
            questions.forEach((q, qIndex) => {
                list.innerHTML += `
                <div class="bg-white border rounded p-4 shadow-sm relative group">
                    <button type="button" onclick="admin.removeQuestion(${qIndex})" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 font-bold p-1">❌</button>
                    
                    <div class="mb-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">Soru ${qIndex + 1}</label>
                        <input type="text" class="w-full border rounded p-2 text-sm font-bold" value="${q.q}" onchange="admin.updateQuestion(${qIndex}, 'q', this.value)">
                    </div>
                    
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">Seçenekler</label>
                        ${q.options.map((opt, oIndex) => `
                            <div class="flex items-center space-x-2">
                                <input type="radio" name="q${qIndex}_ans" value="${oIndex}" ${q.answer === oIndex ? 'checked' : ''} onchange="admin.updateQuestion(${qIndex}, 'answer', ${oIndex})">
                                <input type="text" class="w-full border rounded p-1 text-sm bg-gray-50" value="${opt}" onchange="admin.updateQuestion(${qIndex}, 'option_${oIndex}', this.value)">
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-2 text-xs text-green-600 font-bold">
                        * Doğru cevabın yanındaki kutucuğu işaretleyin.
                    </div>
                </div>`;
            });
        }
    },

    addQuestion: () => {
        const pid = admin.currentProjectId;
        const p = admin.currentData.projects.find(x => x.id === pid);
        if (!p) return;

        if (!p.quiz) p.quiz = [];

        p.quiz.push({
            q: "Yeni Soru?",
            options: ["A Şıkkı", "B Şıkkı", "C Şıkkı", "D Şıkkı"],
            answer: 0
        });
        admin.renderQuizEditor(pid);
        admin.triggerAutoSave();
    },

    removeQuestion: (index) => {
        const pid = admin.currentProjectId;
        const p = admin.currentData.projects.find(x => x.id === pid);
        if (!p || !p.quiz) return;

        if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;

        p.quiz.splice(index, 1);
        admin.renderQuizEditor(pid);
        admin.triggerAutoSave();
    },

    updateQuestion: (qIndex, field, value) => {
        const pid = admin.currentProjectId;
        const p = admin.currentData.projects.find(x => x.id === pid);
        if (!p || !p.quiz) return;

        const question = p.quiz[qIndex];

        if (field === 'q') {
            question.q = value;
        } else if (field === 'answer') {
            question.answer = parseInt(value);
        } else if (field.startsWith('option_')) {
            const optIndex = parseInt(field.split('_')[1]);
            question.options[optIndex] = value;
        }

        admin.triggerAutoSave();
    },

    // --- MIGRATION UTILS ---
    migrateQuizData: () => {
        // Eğer global quizData varsa ve henüz projelere taşınmamışsa taşı
        if (window.quizData && typeof window.quizData === 'object' && Object.keys(window.quizData).length > 0) {
            console.log("Migrating quiz data to projects...");
            let migratedCount = 0;

            // Tüm kursları gez
            Object.keys(admin.allCourseData).forEach(courseKey => {
                const course = admin.allCourseData[courseKey];
                if (course && course.data && course.data.projects) {
                    course.data.projects.forEach(p => {
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
                console.log(`${migratedCount} projects enriched with quiz data.`);
                // Global quizData'yı temizle ki tekrar tekrar çalışmasın (veya migration flag kullan)
                // window.quizData = null; // Şimdilik dursun, her ihtimale karşı
                admin.triggerAutoSave(); // Değişiklikleri kaydet
            }
        }
    },

    updateProject: () => {
        if (admin.currentProjectId === null) return;
        const p = admin.currentData.projects.find(x => x.id === admin.currentProjectId);
        if (!p) {
            console.error("Project not found:", admin.currentProjectId);
            return;
        }

        const phaseEl = document.getElementById('p-phase');
        p.phase = phaseEl ? parseInt(phaseEl.value) || 0 : (p.phase || 0);

        // Handle localized fields (TR/EN)
        const getLocalizedField = (fieldName, currentValue) => {
            const trEl = document.getElementById(`p-${fieldName}-tr`);
            const enEl = document.getElementById(`p-${fieldName}-en`);
            const trVal = trEl ? trEl.value : '';
            const enVal = enEl ? enEl.value : '';

            // If EN has content, store as object. Otherwise keep TR as string for backward compat
            if (enVal && enVal.trim()) {
                return { tr: trVal, en: enVal };
            }
            return trVal; // Backward compatibility: just string if no EN
        };

        p.title = getLocalizedField('title', p.title);
        p.desc = getLocalizedField('desc', p.desc);
        p.mission = getLocalizedField('mission', p.mission);
        p.theory = getLocalizedField('theory', p.theory);
        p.challenge = getLocalizedField('challenge', p.challenge);

        p.icon = document.getElementById('p-icon').value;

        // New metadata fields
        p.difficulty = document.getElementById('p-difficulty')?.value || 'beginner';
        p.duration = document.getElementById('p-duration')?.value || '';

        const tagsVal = document.getElementById('p-tags')?.value || '';
        p.tags = tagsVal ? tagsVal.split(',').map(t => t.trim()).filter(t => t) : [];

        const prereqVal = document.getElementById('p-prerequisites')?.value || '';
        p.prerequisites = prereqVal ? prereqVal.split(',').map(t => parseInt(t.trim())).filter(n => !isNaN(n)) : [];

        // Sim Type Logic
        const select = document.getElementById('p-simType');
        if (select.value === 'custom') {
            p.simType = document.getElementById('p-simType-custom').value;
        } else {
            p.simType = select.value;
        }

        p.hasGraph = document.getElementById('p-hasGraph').value === "true";

        // Code reading based on mode
        const mode = document.getElementById('p-code-mode').value;
        if (mode === 'text') {
            p.code = document.getElementById('p-code').value;
        } else {
            // New ID for image input
            const imgInput = document.getElementById('p-code-image-input');
            p.code = imgInput ? imgInput.value : '';
        }

        p.circuitImage = document.getElementById('p-circuitImage').value;

        try {
            const hs = document.getElementById('p-hotspots').value;
            p.hotspots = hs ? JSON.parse(hs) : null;
        } catch (e) {
            // alert("Hotspots JSON formatı hatalı! Kaydedilmedi.");
        }

        // Malzemeleri Topla
        const selected = Array.from(document.querySelectorAll('.material-checkbox:checked')).map(cb => cb.value);
        const custom = document.getElementById('p-materials-custom').value.split(',').map(s => s.trim()).filter(s => s !== "");
        p.materials = [...selected, ...custom];

        // Hotspot options
        p.enableHotspots = document.getElementById('p-enableHotspots').checked;
        p.showHotspotsInLab = document.getElementById('p-showInLab').checked;

        // Tab Visibility
        const tabIds = ['mission', 'materials', 'circuit', 'code', 'challenge', 'quiz'];
        p.hiddenTabs = [];
        tabIds.forEach(id => {
            const chk = document.getElementById(`p-show-${id}`);
            if (chk && !chk.checked) {
                p.hiddenTabs.push(id);
            }
        });

        // Update list item text in real-time (for title/icon)
        admin.updateListItemText(p);

        admin.triggerAutoSave();
    },

    // Toggle hotspot editor visibility
    toggleHotspotEnabled: () => {
        const enabled = document.getElementById('p-enableHotspots').checked;
        const editorContent = document.getElementById('hotspot-editor-content');

        if (enabled) {
            editorContent.classList.remove('hidden');
            admin.initHotspotEditor();
        } else {
            editorContent.classList.add('hidden');
        }

        // Trigger updateProject to save the state
        admin.updateProject();
    },

    // Update just the text of current project in list (no re-render to keep focus)
    updateListItemText: (p) => {
        // Handle localized title
        const pTitle = typeof p.title === 'object' ? (p.title.tr || p.title.en || 'Untitled') : (p.title || 'Untitled');

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
        if (!admin.currentData.projects) admin.currentData.projects = [];
        const newId = admin.currentData.projects.length > 0 ? Math.max(...admin.currentData.projects.map(p => p.id)) + 1 : 0;
        const newProject = {
            id: newId, phase: 0, title: "Yeni Ders", icon: "✨",
            desc: "Açıklama...", mission: "Amaç...", theory: "",
            materials: [], mainComponent: "", code: "// Kod...", challenge: "Görev...",
            hasGraph: false, simType: "none", circuitImage: `devre${newId}.jpg`,
            // Metadata fields
            difficulty: "beginner", duration: "", tags: [], prerequisites: []
        };
        admin.currentData.projects.push(newProject);
        admin.renderProjectList();
        admin.loadProject(newId);
        setTimeout(() => document.getElementById('project-list').scrollTop = 9999, 100);

        admin.triggerAutoSave();
    },

    duplicateProject: () => {
        if (admin.currentProjectId === null) return;
        const p = admin.currentData.projects.find(x => x.id === admin.currentProjectId);
        const newId = Math.max(...admin.currentData.projects.map(x => x.id)) + 1;

        const copy = JSON.parse(JSON.stringify(p));
        copy.id = newId;
        copy.title += " (Kopyası)";
        admin.currentData.projects.push(copy);
        admin.renderProjectList();
        admin.loadProject(newId);
        alert("Ders kopyalandı!");

        admin.triggerAutoSave();
    },

    deleteProject: () => {
        if (!confirm("Bu dersi silmek istediğinize emin misiniz?")) return;

        // Store in undo stack before deleting
        const deletedProject = admin.currentData.projects.find(p => p.id === admin.currentProjectId);
        if (deletedProject) {
            admin.undoStack.push({
                type: 'project',
                data: JSON.parse(JSON.stringify(deletedProject)),
                courseKey: admin.currentCourseKey
            });
            admin.updateUndoButton();
        }

        admin.currentData.projects = admin.currentData.projects.filter(p => p.id !== admin.currentProjectId);
        admin.currentProjectId = null;
        document.getElementById('project-welcome').classList.remove('hidden');
        document.getElementById('project-form').classList.add('hidden');
        admin.renderProjectList();

        admin.showUndoToast(`"${deletedProject.title}" silindi.`);

        admin.triggerAutoSave();
    },

    // --- COMPONENTS MANAGEMENT ---
    renderComponentList: () => {
        const list = document.getElementById('component-list');
        if (!list) return;

        list.innerHTML = "";
        if (!admin.currentData.componentInfo) admin.currentData.componentInfo = {};

        try {
            Object.entries(admin.currentData.componentInfo).forEach(([key, comp]) => {
                const activeClass = key === admin.currentComponentKey ? "bg-purple-50 border-purple-500" : "hover:bg-gray-50 border-transparent";
                list.innerHTML += `
                    <div onclick="admin.loadComponent('${key}')" class="p-3 border-l-4 cursor-pointer transition ${activeClass}">
                        <div class="flex items-center">
                            <span class="text-xl mr-3">${comp.icon || '📦'}</span>
                            <div>
                                <div class="font-bold text-sm text-gray-700">${comp.name || key}</div>
                                <div class="text-xs text-gray-400 font-mono">${key}</div>
                            </div>
                        </div>
                    </div>`;
            });
        } catch (e) {
            console.error("Error rendering component list:", e);
            list.innerHTML += `<div class="p-2 text-red-500 text-xs">Hata: Elemanlar yüklenirken sorun oluştu.</div>`;
        }
    },

    loadComponent: (key) => {
        admin.currentComponentKey = key;
        const c = admin.currentData.componentInfo[key];
        document.getElementById('component-welcome').classList.add('hidden');
        document.getElementById('component-form').classList.remove('hidden');

        document.getElementById('c-key').value = key;
        document.getElementById('c-name').value = c.name;
        document.getElementById('c-icon').value = c.icon;
        document.getElementById('c-imgFileName').value = c.imgFileName;
        document.getElementById('c-desc').value = c.desc;

        admin.renderComponentList();
    },

    updateComponent: () => {
        if (!admin.currentComponentKey) return;
        const c = admin.currentData.componentInfo[admin.currentComponentKey];
        c.name = document.getElementById('c-name').value;
        c.icon = document.getElementById('c-icon').value;
        c.imgFileName = document.getElementById('c-imgFileName').value;
        c.desc = document.getElementById('c-desc').value;

        admin.triggerAutoSave();
    },

    addNewComponent: () => {
        const key = prompt("Yeni malzeme için benzersiz bir ID girin (örn: Lazer):");
        if (!key) return;
        if (!admin.currentData.componentInfo) admin.currentData.componentInfo = {};
        if (admin.currentData.componentInfo[key]) { alert("Bu ID zaten var!"); return; }

        admin.currentData.componentInfo[key] = {
            name: "Yeni Malzeme", icon: "📦",
            imgFileName: "resim.jpg", desc: "Açıklama giriniz."
        };
        admin.renderComponentList();
        admin.loadComponent(key);
        setTimeout(() => document.getElementById('component-list').scrollTop = 9999, 100);

        admin.triggerAutoSave();
    },

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
        Object.values(window.courseData || {}).forEach(course => {
            if (course && course.data) {
                (course.data.projects || []).forEach(p => {
                    if (p.circuitImage) knownImages.add(p.circuitImage);
                    if (p.code && p.code.match(/\.(png|jpg|jpeg|gif)$/i)) knownImages.add(p.code);
                });
                Object.values(course.data.componentInfo || {}).forEach(c => {
                    if (c.imgFileName) knownImages.add(c.imgFileName);
                });
            }
        });

        // Add some generic ones manually if not found
        ['arduino_uno.jpg', 'breadboard.jpg', 'led_red.jpg', 'resistor.jpg', 'buzzer.jpg'].forEach(img => knownImages.add(img));

        grid.innerHTML = '';
        if (knownImages.size === 0) {
            grid.innerHTML = '<div class="col-span-full text-center p-4 text-gray-500">Kayıtlı resim bulunamadı.</div>';
            return;
        }

        Array.from(knownImages).sort().forEach(imgName => {
            const div = document.createElement('div');
            div.className = 'border rounded cursor-pointer hover:border-blue-500 hover:shadow-md transition p-1 bg-white flex flex-col items-center';
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
        if (!confirm("Kullanımda olan bir malzemeyi silerseniz site bozulabilir. Yine de silinsin mi?")) return;

        // Store in undo stack
        const key = admin.currentComponentKey;
        const deletedComponent = admin.currentData.componentInfo[key];
        if (deletedComponent) {
            admin.undoStack.push({
                type: 'component',
                key: key,
                data: JSON.parse(JSON.stringify(deletedComponent)),
                courseKey: admin.currentCourseKey
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

    // --- PHASES MANAGEMENT ---
    renderPhaseList: () => {
        console.log("Rendering phase list...");
        const list = document.getElementById('phase-list');
        if (!list) return;

        list.innerHTML = "";
        if (!admin.currentData.phases) admin.currentData.phases = [];

        try {
            admin.currentData.phases.forEach((phase, index) => {
                const activeClass = index === admin.currentPhaseIndex ? "bg-amber-50 border-amber-500" : "hover:bg-gray-50 border-transparent";
                const fixedName = index === 0 ? "Başlangıç" : `Bölüm ${index}`;

                // Fallback logic for display safe-guards
                let icon = '❓';
                let desc = '';

                if (phase) {
                    icon = phase.icon || (phase.title && typeof phase.title === 'string' ? phase.title.split(' ')[0] : '❓');
                    desc = phase.description || (phase.title && typeof phase.title === 'string' ? phase.title.replace(icon, '').trim() : '');
                }

                list.innerHTML += `
                    <div onclick="admin.loadPhase(${index})" class="p-3 border-l-4 cursor-pointer transition ${activeClass}">
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-${phase.color || 'gray'}-500 mr-3"></span>
                            <div>
                                <div class="font-bold text-sm text-gray-700">${icon} ${fixedName}</div>
                                <div class="text-xs text-gray-400">${desc}</div>
                            </div>
                        </div>
                    </div>`;
            });
        } catch (e) {
            console.error("Error rendering phase list:", e);
            list.innerHTML += `<div class="p-2 text-red-500 text-xs">Hata: Fazlar yüklenirken sorun oluştu.</div>`;
        }
    },

    loadPhase: (index) => {
        admin.currentPhaseIndex = index;
        const p = admin.currentData.phases[index];
        document.getElementById('phase-welcome').classList.add('hidden');
        document.getElementById('phase-form').classList.remove('hidden');

        // Fixed Name Logic
        const fixedName = index === 0 ? "Başlangıç" : `Bölüm ${index}`;
        document.getElementById('ph-fixed-name').value = fixedName;

        // Data Migration / Fallback Logic
        const icon = p.icon || (p.title ? p.title.split(' ')[0] : '🚀');
        // If description is missing, use title minus icon.
        const desc = p.description || (p.title ? p.title.replace(icon, '').trim() : '');

        document.getElementById('ph-icon').value = icon;
        document.getElementById('ph-desc').value = desc;
        document.getElementById('ph-color').value = p.color;

        // Auto-save on change
        document.getElementById('ph-icon').oninput = admin.updatePhase;
        document.getElementById('ph-desc').oninput = admin.updatePhase;
        document.getElementById('ph-color').onchange = admin.updatePhase;

        admin.renderPhaseList();
    },

    updatePhase: () => {
        if (admin.currentPhaseIndex === null) return;
        const p = admin.currentData.phases[admin.currentPhaseIndex];

        p.icon = document.getElementById('ph-icon').value;
        p.description = document.getElementById('ph-desc').value;
        p.color = document.getElementById('ph-color').value;

        // Backwards compatibility for data file readability, though app.js uses new system now
        // This keeps the 'title' field roughly in sync for older viewers
        const fixedName = admin.currentPhaseIndex === 0 ? "Başlangıç" : `Bölüm ${admin.currentPhaseIndex}`;
        p.title = `${p.icon} ${fixedName}`;

        admin.renderPhaseList();

        admin.triggerAutoSave();
    },

    addNewPhase: () => {
        if (!admin.currentData.phases) admin.currentData.phases = [];
        const newIndex = admin.currentData.phases.length;
        admin.currentData.phases.push({
            icon: "✨",
            description: "Yeni Konu",
            title: "✨ Bölüm " + newIndex, // Temp
            color: "blue"
        });
        admin.renderPhaseList();
        admin.loadPhase(newIndex);

        admin.triggerAutoSave();
    },

    deletePhase: () => {
        if (admin.currentPhaseIndex === null) return;
        const idx = admin.currentPhaseIndex;
        const projectsInPhase = admin.currentData.projects.filter(p => p.phase === idx).length;

        if (projectsInPhase > 0) {
            if (!confirm(`Bu fazda ${projectsInPhase} ders var! Silmek, bu derslerin görünmez olmasına neden olur. Devam?`)) return;
        } else {
            if (!confirm("Bu fazı silmek istediğinize emin misiniz?")) return;
        }

        admin.currentData.phases.splice(idx, 1);
        admin.currentPhaseIndex = null;
        document.getElementById('phase-welcome').classList.remove('hidden');
        document.getElementById('phase-form').classList.add('hidden');
        admin.renderPhaseList();

        admin.triggerAutoSave();
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
            if (!p.title || p.title.trim() === "") {
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
                quizzes: window.quizData || {}
            };

            const jsonContent = JSON.stringify(fullData, null, 4);
            const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);

            // Format: backup_2023-12-27.json
            const dateStr = new Date().toISOString().slice(0, 10);
            a.download = `backup_mucit_atolyesi_${dateStr}.json`;
            a.click();

            // Trigger autosave to ensure consistency
            admin.triggerAutoSave();
        } catch (e) {
            console.error("Backup failed:", e);
            alert("Yedekleme sırasında bir hata oluştu: " + e.message);
        }
    },

    saveData: async () => {
        const errors = admin.validateProjectData();
        if (errors.length > 0) {
            if (!confirm("Hatalar var (konsola bak). Yine de kaydetmek ister misin?")) return;
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

        const blob = new Blob([jsContent], { type: "text/javascript;charset=utf-8" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${key}.js`;
        a.click();

        alert("İndirme başlatıldı!\n" + key + ".js dosyasını data klasörüne kaydedin.");
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
                        is_published: false
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
                meta: { icon: courseData.icon }
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
            console.error("Supabase save error:", error);

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
                    meta: { color: phase.color, icon: phase.icon }
                });
                phaseIdMap[i] = existing.id;
            } else {
                // Create new
                const newPhase = await SupabaseClient.createPhase({
                    course_id: courseId,
                    name: name,
                    description: phase.description || null,
                    position: i,
                    meta: { color: phase.color, icon: phase.icon }
                });
                phaseIdMap[i] = newPhase.id;
            }
        }

        return phaseIdMap;
    },

    // Sync projects to Supabase
    syncProjectsToSupabase: async (courseId, projects, phaseIdMap) => {
        for (const proj of projects) {
            const slug = admin.slugify(typeof proj.title === 'object' ? proj.title.tr : proj.title) || `project-${proj.id}`;
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
                    prerequisites: proj.prerequisites
                },
                is_published: false,
                position: proj.id || 0
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
                data: data
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

    // --- HOTSPOT VISUAL EDITOR ---
    hotspotAddMode: false,
    hotspotData: [],

    initHotspotEditor: () => {
        const p = admin.currentData.projects.find(x => x.id === admin.currentProjectId);
        if (!p) return;

        // Load existing hotspots
        admin.hotspotData = p.hotspots || [];

        // Set image source
        const img = document.getElementById('hotspot-image');
        const circuitImg = p.circuitImage || 'devre' + p.id + '.jpg';
        // Handle both "img/file.jpg" and "file.jpg" formats
        const imgPath = circuitImg.startsWith('img/') ? circuitImg : `img/${circuitImg}`;

        // Reset onerror before setting new src to prevent loops
        img.onerror = null;
        img.src = imgPath;

        // Set error handler once
        img.onerror = function () {
            this.onerror = null; // Prevent infinite loop
            this.style.display = 'none';
            const editor = document.getElementById('hotspot-editor');
            // Show error message instead of image
            if (!editor.querySelector('.error-msg')) {
                const msg = document.createElement('div');
                msg.className = 'error-msg absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-center p-4';
                msg.innerHTML = `<div><div class="text-4xl mb-2">🖼️</div><div>Resim bulunamadı:<br><code class="text-xs">${imgPath}</code></div></div>`;
                editor.appendChild(msg);
            }
        };

        // Remove old error message if image loads
        img.onload = function () {
            this.style.display = 'block';
            const oldMsg = document.getElementById('hotspot-editor').querySelector('.error-msg');
            if (oldMsg) oldMsg.remove();
        };

        // Render existing hotspots
        admin.renderHotspotMarkers();
        admin.renderHotspotList();
    },

    toggleHotspotMode: () => {
        admin.hotspotAddMode = !admin.hotspotAddMode;
        const btn = document.getElementById('btn-hotspot-mode');
        const layer = document.getElementById('hotspot-click-layer');

        if (admin.hotspotAddMode) {
            btn.textContent = '✋ İptal (Ekleme Modu Açık)';
            btn.classList.remove('bg-orange-600');
            btn.classList.add('bg-green-600');
            layer.style.cursor = 'crosshair';
        } else {
            btn.textContent = '🎯 Nokta Ekle Modu';
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-orange-600');
            layer.style.cursor = 'default';
        }
    },

    handleEditorClick: (e) => {
        if (!admin.hotspotAddMode) return;

        const editor = document.getElementById('hotspot-editor');
        const img = document.getElementById('hotspot-image');
        const rect = editor.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        // Calculate click position relative to image
        const clickX = e.clientX - imgRect.left;
        const clickY = e.clientY - imgRect.top;

        // Normalize to image dimensions (0-100%)
        const percentX = Math.round((clickX / imgRect.width) * 100);
        const percentY = Math.round((clickY / imgRect.height) * 100);

        // Check bounds
        if (percentX < 0 || percentX > 100 || percentY < 0 || percentY > 100) return;

        // Prompt for hotspot name
        const name = prompt("Bu noktanın adı ne olsun? (örn: USB Port)");
        if (!name) return;

        const desc = prompt("Açıklama girin (örn: Bilgisayara bağlanmak için kullanılır)") || "";

        // Add to data
        const newHotspot = {
            name: name,
            desc: desc,
            x: percentX,
            y: percentY,
            r: 15 // Default radius
        };

        admin.hotspotData.push(newHotspot);
        admin.syncHotspots();
        admin.renderHotspotMarkers();
        admin.renderHotspotList();

        // Auto-disable add mode after adding
        admin.toggleHotspotMode();
    },

    renderHotspotMarkers: () => {
        const container = document.getElementById('hotspot-markers');
        const img = document.getElementById('hotspot-image');

        container.innerHTML = '';

        admin.hotspotData.forEach((hs, index) => {
            const marker = document.createElement('div');
            marker.className = 'absolute w-6 h-6 bg-orange-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-xs text-white font-bold';
            marker.style.left = `calc(${hs.x}% - 12px)`;
            marker.style.top = `calc(${hs.y}% - 12px)`;
            marker.style.pointerEvents = 'auto';
            marker.style.cursor = 'pointer';
            marker.textContent = index + 1;
            marker.title = hs.name;
            marker.onclick = () => admin.selectHotspot(index);
            container.appendChild(marker);
        });
    },

    renderHotspotList: () => {
        const list = document.getElementById('hotspot-list');

        if (admin.hotspotData.length === 0) {
            list.innerHTML = '<div class="text-center text-gray-400 text-sm py-4">Henüz nokta eklenmedi. "Nokta Ekle Modu"nu açıp resme tıklayın.</div>';
            return;
        }

        list.innerHTML = admin.hotspotData.map((hs, i) => `
            <div class="flex items-center justify-between bg-white p-2 rounded border text-sm">
                <div class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">${i + 1}</span>
                    <div>
                        <div class="font-bold text-gray-700">${hs.name}</div>
                        <div class="text-xs text-gray-400">${hs.desc || 'Açıklama yok'}</div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button type="button" onclick="admin.editHotspot(${i})" class="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                    <button type="button" onclick="admin.deleteHotspot(${i})" class="text-red-500 hover:text-red-700 p-1">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    selectHotspot: (index) => {
        // Highlight selected marker (future enhancement: show edit form)
        const markers = document.querySelectorAll('#hotspot-markers > div');
        markers.forEach((m, i) => {
            if (i === index) {
                m.classList.add('ring-2', 'ring-yellow-400');
            } else {
                m.classList.remove('ring-2', 'ring-yellow-400');
            }
        });
    },

    editHotspot: (index) => {
        const hs = admin.hotspotData[index];
        const newName = prompt("Yeni isim:", hs.name);
        if (newName === null) return;

        const newDesc = prompt("Yeni açıklama:", hs.desc);
        if (newDesc === null) return;

        hs.name = newName;
        hs.desc = newDesc;

        admin.syncHotspots();
        admin.renderHotspotMarkers();
        admin.renderHotspotList();
    },

    deleteHotspot: (index) => {
        if (!confirm(`"${admin.hotspotData[index].name}" noktasını silmek istediğinize emin misiniz?`)) return;

        admin.hotspotData.splice(index, 1);
        admin.syncHotspots();
        admin.renderHotspotMarkers();
        admin.renderHotspotList();
    },

    clearAllHotspots: () => {
        if (admin.hotspotData.length === 0) return;
        if (!confirm("Tüm etkileşim noktalarını silmek istediğinize emin misiniz?")) return;

        admin.hotspotData = [];
        admin.syncHotspots();
        admin.renderHotspotMarkers();
        admin.renderHotspotList();
    },

    syncHotspots: () => {
        // Sync to hidden field and project data
        const p = admin.currentData.projects.find(x => x.id === admin.currentProjectId);
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
            toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transition-all';
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
            statusEl.textContent = "⬆️ Resim yükleniyor...";
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
                statusEl.textContent = "✅ Resim yüklendi!";
                statusEl.classList.remove('text-yellow-400');
                statusEl.classList.add('text-green-400');
            }

            admin.updateProject();

        } catch (error) {
            console.error('Image upload error:', error);

            if (statusEl) {
                statusEl.textContent = "❌ Yükleme hatası!";
                statusEl.classList.remove('text-yellow-400');
                statusEl.classList.add('text-red-400');
            }

            alert('Resim yüklenemedi: ' + error.message + '\n\nAlternatif: Dosya adını manuel girin veya harici URL kullanın.');
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

    /**
     * Open image selector modal (existing images in img/ folder)
     */
    openImageSelector: (targetInputId) => {
        // This could be enhanced to show a gallery of existing images
        // For now, just focus the input
        const input = document.getElementById(targetInputId);
        if (input) {
            input.focus();
            input.select();
        }

        // Show a helper message
        alert('Resim ekleme seçenekleri:\n\n' +
            '1. Dosya adı girin: led.jpg (img/ klasöründen)\n' +
            '2. URL yapıştırın: https://example.com/img.png\n' +
            '3. "Yükle" butonuyla Supabase\'e yükleyin\n\n' +
            'GitHub Pages resimlerini img/ klasörüne ekleyip commit/push yapın.');
    }
};

// Export for global
window.admin = admin;
