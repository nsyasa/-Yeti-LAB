/**
 * Project Management Module for Admin Panel
 * Handles CRUD operations, form management, and list rendering for projects.
 */

const ProjectManager = {
    // Dependencies & Configuration
    config: {
        onUpdate: null, // Callback for autosave
        onProjectSelect: null, // Callback when project is clicked
        getProjects: () => [], // Function to get current projects array
        getPhases: () => [], // Function to get current phases array
        getComponentInfo: () => ({}), // Function to get component data
        getCourseKey: () => 'arduino', // Function to get current course key
        // NEW: Supabase IDs for real-time sync
        getCourseId: () => null, // Function to get Supabase course UUID
        getPhaseIdMap: () => ({}), // Function to get phase index to UUID map
    },

    // Save timer for debounced Supabase sync
    saveTimer: null,

    // State
    currentProjectId: null,

    init(config) {
        this.config = { ...this.config, ...config };
        this.bindEvents();
    },

    bindEvents() {
        // Form inputs
        document.querySelectorAll('#project-form input, #project-form textarea, #project-form select').forEach((i) => {
            if (i.type === 'checkbox') i.addEventListener('change', () => this.update());
            else i.addEventListener('input', () => this.update());
        });
    },

    // --- RENDER LIST ---
    renderList(activeId) {
        const list = document.getElementById('project-list');
        if (!list) return;

        list.innerHTML = '';
        const projects = this.config.getProjects() || [];

        this.currentProjectId = activeId;

        try {
            if (projects.length === 0) {
                list.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">Ders bulunamadı.</div>';
                return;
            }

            // Sort by id (position)
            const sortedProjects = [...projects].sort((a, b) => a.id - b.id);

            sortedProjects.forEach((p, index) => {
                const activeClass =
                    p.id === activeId ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-transparent';
                const pIcon = p.icon || '📄';
                const pTitle =
                    typeof p.title === 'object' ? p.title.tr || p.title.en || 'Untitled' : p.title || 'Untitled';

                const isFirst = index === 0;
                const isLast = index === sortedProjects.length - 1;

                const div = document.createElement('div');
                div.className = `p-3 border-l-4 cursor-pointer transition ${activeClass} group`;
                div.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="project-title font-bold text-sm text-gray-700 flex-1">#${p.id} ${pTitle}</span>
                        <div class="flex items-center gap-1">
                            <span class="project-icon text-xs text-gray-400 mr-2">${pIcon}</span>
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button onclick="event.stopPropagation(); ProjectManager.moveUp(${p.id})" 
                                    class="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-xs ${isFirst ? 'invisible' : ''}" 
                                    title="Yukarı Taşı">↑</button>
                                <button onclick="event.stopPropagation(); ProjectManager.moveDown(${p.id})" 
                                    class="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-xs ${isLast ? 'invisible' : ''}" 
                                    title="Aşağı Taşı">↓</button>
                            </div>
                        </div>
                    </div>`;
                div.onclick = () => {
                    if (this.config.onProjectSelect) this.config.onProjectSelect(p.id);
                    else this.load(p.id);
                };

                // Add data attribute for easier selection/update
                div.setAttribute('data-project-id', p.id);

                list.appendChild(div);
            });
        } catch (e) {
            console.error('Error rendering project list:', e);
            list.innerHTML += '<div class="p-2 text-red-500 text-xs">Hata: Dersler listelenemedi.</div>';
        }
    },

    // --- LOAD PROJECT ---
    load(id) {
        this.currentProjectId = id;
        const projects = this.config.getProjects();
        const p = projects.find((x) => x.id === id);

        if (!p) return;

        document.getElementById('project-welcome').classList.add('hidden');
        document.getElementById('project-form').classList.remove('hidden');

        // Reset Tab to 'Genel' - No longer needed in single page form
        // this.switchTab('genel');

        const setVal = (elmId, val) => {
            const el = document.getElementById(elmId);
            if (el) el.value = val !== undefined && val !== null ? val : '';
        };

        setVal('p-id', p.id); // Read-only ID

        // Localized fields
        const setLocalizedField = (fieldName, value) => {
            const trEl = document.getElementById(`p-${fieldName}-tr`);
            const enEl = document.getElementById(`p-${fieldName}-en`);
            if (typeof value === 'object' && value !== null) {
                if (trEl) trEl.value = value.tr || '';
                if (enEl) enEl.value = value.en || '';
            } else {
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

        // Populate phase dropdown with available phases
        this.populatePhaseDropdown(p.phase);

        setVal('p-week', p.week);

        // Metadata
        setVal('p-difficulty', p.difficulty || 'beginner');
        setVal('p-duration', p.duration || '');
        setVal('p-tags', p.tags ? p.tags.join(', ') : '');
        setVal('p-prerequisites', p.prerequisites ? p.prerequisites.join(', ') : '');

        // Tab Visibility Checkboxes - Apply initial state
        const tabIds = ['mission', 'materials', 'circuit', 'code', 'challenge', 'quiz'];
        const hiddenTabs = p.hiddenTabs || [];
        tabIds.forEach((tabId) => {
            const chk = document.getElementById(`p-show-${tabId}`);
            if (chk) {
                chk.checked = !hiddenTabs.includes(tabId);
                // Apply visibility immediately without triggering update
                this.toggleSection(tabId, true);
            }
        });

        // Sim Type Logic
        const select = document.getElementById('p-simType');
        const customInput = document.getElementById('p-simType-custom');
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
            customInput.value = '';
        }

        // Code Mode Logic
        const codeVal = p.code || '';
        const isImg = codeVal.match(/\.(jpeg|jpg|gif|png)$/) != null;
        document.getElementById('p-code-mode').value = isImg ? 'image' : 'text';
        this.toggleCodeMode();

        if (isImg) {
            setVal('p-code', codeVal);
            setVal('p-code-image-input', codeVal);
        } else {
            setVal('p-code', codeVal);
            setVal('p-code-image-input', '');
        }

        setVal('p-hasGraph', p.hasGraph ? 'true' : 'false');
        setVal('p-challenge', p.challenge); // Duplicate set? Keep for safety aligned with original
        setVal('p-circuitImage', p.circuitImage || `devre${p.id}.jpg`);
        setVal('p-hotspots', p.hotspots ? JSON.stringify(p.hotspots) : '');

        // Hotspots
        const enableHotspots = document.getElementById('p-enableHotspots');
        const showInLab = document.getElementById('p-showInLab');
        const editorContent = document.getElementById('hotspot-editor-content');

        const hasHotspots = (p.hotspots && p.hotspots.length > 0) || p.enableHotspots;
        enableHotspots.checked = hasHotspots;
        showInLab.checked = p.showHotspotsInLab || false;

        if (hasHotspots) {
            editorContent.classList.remove('hidden');
            // Assuming HotspotEditor is global or we need to bridge it
            if (typeof HotspotEditor !== 'undefined') setTimeout(() => HotspotEditor.init(), 100);
        } else {
            editorContent.classList.add('hidden');
        }

        // Materials List
        this.renderMaterialsList(p);

        // Quiz Rendering (Delegated)
        if (typeof QuizEditor !== 'undefined') {
            // Ensure quiz array exists
            if (!p.quiz) p.quiz = [];
            QuizEditor.init(p.id, p.quiz, (newData) => {
                p.quiz = newData;
                if (this.config.onUpdate) this.config.onUpdate();
            });
        }

        // Re-render list to highlight active
        this.renderList(this.currentProjectId);
    },

    // --- UPDATE PROJECT ---
    update() {
        if (this.currentProjectId === null) return;
        const projects = this.config.getProjects();
        const p = projects.find((x) => x.id === this.currentProjectId);
        if (!p) return;

        const phaseEl = document.getElementById('p-phase');
        p.phase = phaseEl ? parseInt(phaseEl.value) || 0 : p.phase || 0;

        const getLocalizedField = (fieldName) => {
            const trEl = document.getElementById(`p-${fieldName}-tr`);
            const enEl = document.getElementById(`p-${fieldName}-en`);
            const trVal = trEl ? trEl.value : '';
            const enVal = enEl ? enEl.value : '';
            if (enVal && enVal.trim()) return { tr: trVal, en: enVal };
            return trVal;
        };

        p.title = getLocalizedField('title');
        p.desc = getLocalizedField('desc');
        p.mission = getLocalizedField('mission');
        p.theory = getLocalizedField('theory');
        p.challenge = getLocalizedField('challenge');

        p.icon = document.getElementById('p-icon').value;
        p.difficulty = document.getElementById('p-difficulty')?.value || 'beginner';
        p.duration = document.getElementById('p-duration')?.value || '';

        const tagsVal = document.getElementById('p-tags')?.value || '';
        p.tags = tagsVal
            ? tagsVal
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t)
            : [];

        const prereqVal = document.getElementById('p-prerequisites')?.value || '';
        p.prerequisites = prereqVal
            ? prereqVal
                .split(',')
                .map((t) => parseInt(t.trim()))
                .filter((n) => !isNaN(n))
            : [];

        // Sim Type
        const select = document.getElementById('p-simType');
        if (select.value === 'custom') {
            p.simType = document.getElementById('p-simType-custom').value;
        } else {
            p.simType = select.value;
        }

        p.hasGraph = document.getElementById('p-hasGraph').value === 'true';

        // Code
        const mode = document.getElementById('p-code-mode').value;
        if (mode === 'text') {
            p.code = document.getElementById('p-code').value;
        } else {
            const imgInput = document.getElementById('p-code-image-input');
            p.code = imgInput ? imgInput.value : '';
        }

        p.circuitImage = document.getElementById('p-circuitImage').value;

        try {
            const hs = document.getElementById('p-hotspots').value;
            p.hotspots = hs ? JSON.parse(hs) : null;
        } catch (e) {
            // Error parsing hotspots JSON
        }

        // Materials
        const selected = Array.from(document.querySelectorAll('.material-checkbox:checked')).map((cb) => cb.value);
        const custom = document
            .getElementById('p-materials-custom')
            .value.split(',')
            .map((s) => s.trim())
            .filter((s) => s !== '');
        p.materials = [...selected, ...custom];

        // Options
        p.enableHotspots = document.getElementById('p-enableHotspots').checked;
        p.showHotspotsInLab = document.getElementById('p-showInLab').checked;

        // Hidden Tabs
        const tabIds = ['mission', 'materials', 'circuit', 'code', 'challenge', 'quiz'];
        p.hiddenTabs = [];
        tabIds.forEach((id) => {
            const chk = document.getElementById(`p-show-${id}`);
            if (chk && !chk.checked) {
                p.hiddenTabs.push(id);
            }
        });

        // Update list item text only
        this.updateListItemText(p);

        // Trigger local autosave
        if (this.config.onUpdate) this.config.onUpdate();

        // Debounced Supabase sync
        this.scheduleSaveToSupabase(p);
    },

    /**
     * Schedule a debounced save to Supabase (500ms delay)
     */
    scheduleSaveToSupabase(project) {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveProjectToSupabase(project), 500);
    },

    /**
     * Save single project to Supabase
     */
    async saveProjectToSupabase(project) {
        const courseId = this.config.getCourseId?.();
        const phaseIdMap = this.config.getPhaseIdMap?.();

        if (!courseId || !phaseIdMap) {
            console.warn('[ProjectManager] Cannot save to Supabase: missing courseId or phaseIdMap');
            return;
        }

        if (typeof SupabaseSync !== 'undefined') {
            const saved = await SupabaseSync.saveProjectToSupabase(courseId, project, phaseIdMap);
            if (saved) {

            }
        }
    },

    // --- ADD PROJECT ---
    async add() {
        const projects = this.config.getProjects();
        if (!projects) return;

        // Calculate new ID from local projects
        let newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 0;

        // Also check Supabase for max position to avoid slug conflicts
        const courseId = this.config.getCourseId?.();
        if (courseId && typeof SupabaseClient !== 'undefined') {
            try {
                const { data } = await SupabaseClient.getClient()
                    .from('projects')
                    .select('position')
                    .eq('course_id', courseId)
                    .order('position', { ascending: false })
                    .limit(1);

                if (data && data.length > 0) {
                    const maxSupabasePosition = data[0].position;
                    // Use the higher of local or Supabase max
                    newId = Math.max(newId, maxSupabasePosition + 1);
                }
            } catch (e) {
                console.warn('[ProjectManager] Could not check Supabase max position:', e);
            }
        }

        const newProject = {
            id: newId,
            phase: 0,
            title: 'Yeni Ders',
            icon: '✨',
            desc: 'Açıklama...',
            mission: 'Amaç...',
            theory: '',
            materials: [],
            mainComponent: '',
            code: '// Kod...',
            challenge: 'Görev...',
            hasGraph: false,
            simType: 'none',
            circuitImage: `devre${newId}.jpg`,
            difficulty: 'beginner',
            duration: '',
            tags: [],
            prerequisites: [],
        };

        // Add to local array
        projects.push(newProject);
        this.renderList(newId);

        if (this.config.onProjectSelect) this.config.onProjectSelect(newId);
        else this.load(newId);

        setTimeout(() => (document.getElementById('project-list').scrollTop = 9999), 100);
        if (this.config.onUpdate) this.config.onUpdate();

        // Save to Supabase
        await this.saveProjectToSupabase(newProject);

        return newProject;
    },

    // --- DUPLICATE PROJECT ---
    async duplicate() {
        if (this.currentProjectId === null) return;
        const projects = this.config.getProjects();
        const p = projects.find((x) => x.id === this.currentProjectId);
        if (!p) return;

        const newId = Math.max(...projects.map((x) => x.id)) + 1;
        const copy = JSON.parse(JSON.stringify(p));
        copy.id = newId;

        // Handle localized title if object, or string
        if (typeof copy.title === 'object' && copy.title !== null) {
            copy.title.tr = (copy.title.tr || '') + ' (Kopyası)';
            copy.title.en = (copy.title.en || '') + ' (Copy)';
        } else {
            copy.title += ' (Kopyası)';
        }

        // Add to local array
        projects.push(copy);
        this.renderList(newId);

        if (this.config.onProjectSelect) this.config.onProjectSelect(newId);
        else this.load(newId);

        if (this.config.onUpdate) this.config.onUpdate();

        // Save to Supabase
        await this.saveProjectToSupabase(copy);
        alert('Ders kopyalandı!');
    },

    // --- DELETE PROJECT ---
    async delete() {
        if (!confirm('Bu dersi silmek istediğinize emin misiniz?')) return null;

        const projects = this.config.getProjects();
        const deletedProject = projects.find((p) => p.id === this.currentProjectId);
        const index = projects.findIndex((p) => p.id === this.currentProjectId);

        if (index > -1) {
            // Delete from Supabase first
            const courseId = this.config.getCourseId?.();
            if (courseId && typeof SupabaseSync !== 'undefined') {
                const deleted = await SupabaseSync.deleteProjectByPosition(courseId, deletedProject.id);
                if (!deleted) {
                    console.warn('[ProjectManager] Failed to delete from Supabase, continuing with local delete');
                }
            }

            // Delete from local array
            projects.splice(index, 1);
            this.currentProjectId = null;

            document.getElementById('project-welcome').classList.remove('hidden');
            document.getElementById('project-form').classList.add('hidden');

            this.renderList(null);
            if (this.config.onUpdate) this.config.onUpdate();

            return deletedProject; // Return for undo stack handling in admin.js
        }
        return null;
    },

    // --- REORDERING ---

    /**
     * Move a project up in the list (swap with previous)
     */
    async moveUp(projectId) {
        const projects = this.config.getProjects();
        const sortedProjects = [...projects].sort((a, b) => a.id - b.id);
        const index = sortedProjects.findIndex(p => p.id === projectId);

        if (index <= 0) return; // Already at top

        await this.swapProjects(sortedProjects[index], sortedProjects[index - 1]);
    },

    /**
     * Move a project down in the list (swap with next)
     */
    async moveDown(projectId) {
        const projects = this.config.getProjects();
        const sortedProjects = [...projects].sort((a, b) => a.id - b.id);
        const index = sortedProjects.findIndex(p => p.id === projectId);

        if (index >= sortedProjects.length - 1) return; // Already at bottom

        await this.swapProjects(sortedProjects[index], sortedProjects[index + 1]);
    },

    /**
     * Swap two projects' positions
     */
    async swapProjects(projectA, projectB) {
        // Swap IDs (which are used as position)
        const tempId = projectA.id;
        projectA.id = projectB.id;
        projectB.id = tempId;

        // Re-render list
        this.renderList(this.currentProjectId);

        // Trigger autosave
        if (this.config.onUpdate) this.config.onUpdate();

        // Save both to Supabase
        const courseId = this.config.getCourseId?.();
        const phaseIdMap = this.config.getPhaseIdMap?.();

        if (courseId && phaseIdMap && typeof SupabaseSync !== 'undefined') {


            // Save both projects with swapped positions
            await Promise.all([
                SupabaseSync.saveProjectToSupabase(courseId, projectA, phaseIdMap),
                SupabaseSync.saveProjectToSupabase(courseId, projectB, phaseIdMap)
            ]);


        }
    },

    // --- HELPERS ---

    /**
     * Populate phase dropdown with available phases
     */
    populatePhaseDropdown(selectedPhase = 0) {
        const select = document.getElementById('p-phase');
        if (!select) return;

        const phases = this.config.getPhases() || [];

        select.innerHTML = '';

        if (phases.length === 0) {
            select.innerHTML = '<option value="0">Faz bulunamadı</option>';
            return;
        }

        phases.forEach((phase, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${index}: ${phase.title || 'Faz ' + (index + 1)}`;
            if (index === selectedPhase) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    },

    renderMaterialsList(p) {
        const matList = document.getElementById('p-materials-list');
        if (!matList) return;

        const components = this.config.getComponentInfo() || {};
        const compKeys = Object.keys(components);

        let htmlContent = '';
        if (compKeys.length > 0) {
            compKeys.forEach((key) => {
                const comp = components[key];
                if (!comp) return;

                const name = comp.name || key;
                const icon = comp.icon || '📦';
                const isChecked = p.materials && p.materials.includes(name);
                const safeName = name.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

                htmlContent += `
                    <label class="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer bg-white">
                        <input type="checkbox" value="${safeName}" class="material-checkbox w-4 h-4 text-blue-600 rounded" ${isChecked ? 'checked' : ''} onchange="ProjectManager.update()">
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

        // Custom materials
        try {
            const knownNames = Object.values(components).map((c) => c.name);
            const customMats = p.materials ? p.materials.filter((m) => !knownNames.includes(m)) : [];
            const materialsInput = document.getElementById('p-materials-custom');
            if (materialsInput) materialsInput.value = customMats.join(', ');
        } catch (e) {
            console.error('Error processing custom materials', e);
        }
    },

    toggleCustomSimType() {
        const select = document.getElementById('p-simType');
        const customInput = document.getElementById('p-simType-custom');
        if (select.value === 'custom') {
            customInput.classList.remove('hidden');
            customInput.focus();
        } else {
            customInput.classList.add('hidden');
        }
        this.update();
    },

    toggleCodeMode() {
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
        this.update();
    },

    toggleHotspotEnabled() {
        const enabled = document.getElementById('p-enableHotspots').checked;
        const editorContent = document.getElementById('hotspot-editor-content');

        if (enabled) {
            editorContent.classList.remove('hidden');
            if (typeof HotspotEditor !== 'undefined') HotspotEditor.init();
        } else {
            editorContent.classList.add('hidden');
        }
        this.update();
    },

    toggleSection(tabId, skipUpdate = false) {
        const checkbox = document.getElementById(`p-show-${tabId}`);
        const isVisible = checkbox ? checkbox.checked : true;

        if (tabId === 'mission') {
            const el = document.getElementById('p-mission-tr');
            if (el) {
                // The textarea is inside .lang-field, which is inside the main container div
                const container = el.closest('.lang-field')?.parentElement;
                if (container) container.style.display = isVisible ? 'block' : 'none';
            }
        } else if (tabId === 'challenge') {
            const el = document.getElementById('p-challenge-tr');
            if (el) {
                const container = el.closest('.lang-field')?.parentElement;
                if (container) container.style.display = isVisible ? 'block' : 'none';
            }
        } else {
            const map = {
                materials: 'pcontent-donanim',
                circuit: 'pcontent-devre',
                code: 'pcontent-kod',
                quiz: 'pcontent-test'
            };
            const contentId = map[tabId];
            const content = document.getElementById(contentId);
            if (content) {
                if (isVisible) content.classList.remove('hidden');
                else content.classList.add('hidden');
            }
        }

        if (!skipUpdate) this.update();
    },

    // Helper for updating list item text without full re-render
    updateListItemText(p) {
        const pTitle = typeof p.title === 'object' ? p.title.tr || p.title.en || 'Untitled' : p.title || 'Untitled';
        const item = document.querySelector(`[data-project-id="${p.id}"]`);
        if (item) {
            const textSpan = item.querySelector('.project-title');
            const iconSpan = item.querySelector('.project-icon');
            if (textSpan) textSpan.textContent = `#${p.id} ${pTitle}`;
            if (iconSpan) iconSpan.textContent = p.icon || '📄';
        }
    },
};

window.ProjectManager = ProjectManager;
