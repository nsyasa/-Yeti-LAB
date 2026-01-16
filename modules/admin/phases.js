/**
 * Phase Management Module for Admin Panel
 * Handles CRUD operations, form management, and list rendering for phases.
 */

const PhaseManager = {
    // Dependencies & Configuration
    config: {
        onUpdate: null, // Callback for autosave
        getPhases: () => [], // Function to get current phases array
        getProjects: () => [], // Function to get projects (for delete validation)
        // NEW: Supabase IDs for real-time sync
        getCourseId: () => null, // Function to get Supabase course UUID
        getPhaseIdMap: () => ({}), // Function to get phase index to UUID map
        setPhaseId: (_index, _id) => {}, // Function to set phase UUID after creation
    },

    // Save timer for debounced Supabase sync
    saveTimer: null,

    // State
    currentPhaseIndex: null,

    init(config) {
        this.config = { ...this.config, ...config };
        this.bindEvents();
    },

    bindEvents() {
        // Use event delegation for SPA compatibility
        // This works even if #phase-form is not yet in the DOM
        document.addEventListener('input', (e) => {
            const form = document.getElementById('phase-form');
            if (!form || !form.contains(e.target)) return;

            const id = e.target.id;
            if (id === 'ph-title' || id === 'ph-icon' || id === 'ph-desc') {
                this.update();
            }
        });

        document.addEventListener('change', (e) => {
            const form = document.getElementById('phase-form');
            if (!form || !form.contains(e.target)) return;

            if (e.target.id === 'ph-color') {
                this.update();
            }
        });
    },

    // --- RENDER LIST ---
    renderList() {
        const list = document.getElementById('phase-list');
        if (!list) return;

        list.innerHTML = '';
        const phases = this.config.getPhases();
        if (!phases) return;

        try {
            phases.forEach((phase, index) => {
                // SPA Mode: Use PhasesSection card renderer if available
                if (window.PhasesSection && PhasesSection.renderPhaseCard) {
                    const phaseData = {
                        id: index, // Use index as ID
                        name: phase?.title || `Bölüm ${index}`,
                        title: phase?.title || `Bölüm ${index}`,
                        icon: phase?.icon || '📁',
                        color: phase?.color || 'gray',
                        projectCount: 0, // TODO: Calculate from projects
                    };
                    list.innerHTML += PhasesSection.renderPhaseCard(phaseData, index, phases.length);
                } else {
                    // Legacy Mode: Old rendering for admin.html
                    const activeClass =
                        index === this.currentPhaseIndex
                            ? 'bg-amber-50 border-amber-500'
                            : 'hover:bg-gray-50 border-transparent';

                    // XSS Protection: Escape HTML and sanitize color class
                    const safeIcon = Utils.escapeHtml(String(phase?.icon ?? '📁'));
                    const safeTitle = Utils.escapeHtml(String(phase?.title ?? `Bölüm ${index}`));
                    const safeDesc = Utils.escapeHtml(String(phase?.description ?? ''));
                    // Sanitize color to prevent class injection (allow only alphanumeric + hyphen)
                    const rawColor = phase?.color || 'gray';
                    const safeColor = rawColor.replace(/[^a-z0-9-]/gi, '') || 'gray';

                    list.innerHTML += `
                        <div onclick="PhaseManager.load(${index})" class="p-3 border-l-4 cursor-pointer transition ${activeClass}">
                            <div class="flex items-center">
                                <span class="w-3 h-3 rounded-full bg-${safeColor}-500 mr-3"></span>
                                <div>
                                    <div class="font-bold text-sm text-gray-700">${safeIcon} ${safeTitle}</div>
                                    <div class="text-xs text-gray-400">${safeDesc}</div>
                                </div>
                            </div>
                        </div>`;
                }
            });
        } catch (e) {
            console.error('Error rendering phase list:', e);
            list.innerHTML += '<div class="p-2 text-red-500 text-xs">Hata: Fazlar yüklenirken sorun oluştu.</div>';
        }
    },

    // --- LOAD PHASE ---
    load(index) {
        this.currentPhaseIndex = index;
        const phases = this.config.getPhases();
        if (!phases || !phases[index]) return;

        const p = phases[index];

        // SPA modunda bu elementler olmayabilir
        const welcomeEl = document.getElementById('phase-welcome');
        const formEl = document.getElementById('phase-form');

        if (welcomeEl) welcomeEl.classList.add('hidden');
        if (formEl) formEl.classList.remove('hidden');

        // Load phase data with fallbacks - null check for each element
        const titleEl = document.getElementById('ph-title');
        const iconEl = document.getElementById('ph-icon');
        const descEl = document.getElementById('ph-desc');
        const colorEl = document.getElementById('ph-color');

        if (titleEl) titleEl.value = p.title || `Bölüm ${index}`;
        if (iconEl) iconEl.value = p.icon || '📁';
        if (descEl) descEl.value = p.description || '';
        if (colorEl) colorEl.value = p.color || 'gray';

        this.renderList();
    },

    // --- UPDATE PHASE ---
    update() {
        if (this.currentPhaseIndex === null) return;
        const phases = this.config.getPhases();
        if (!phases || !phases[this.currentPhaseIndex]) return;

        const p = phases[this.currentPhaseIndex];

        // Update with null safety
        const titleEl = document.getElementById('ph-title');
        const iconEl = document.getElementById('ph-icon');
        const descEl = document.getElementById('ph-desc');
        const colorEl = document.getElementById('ph-color');

        if (titleEl) p.title = titleEl.value;
        if (iconEl) p.icon = iconEl.value;
        if (descEl) p.description = descEl.value;
        if (colorEl) p.color = colorEl.value;

        this.renderList();

        if (this.config.onUpdate) this.config.onUpdate();

        // Debounced Supabase sync
        this.scheduleSaveToSupabase(this.currentPhaseIndex, p);
    },

    /**
     * Schedule a debounced save to Supabase (500ms delay)
     */
    scheduleSaveToSupabase(index, phase) {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.savePhaseToSupabase(index, phase), 500);
    },

    /**
     * Save single phase to Supabase
     */
    async savePhaseToSupabase(index, phase) {
        const courseId = this.config.getCourseId?.();

        if (!courseId) {
            console.warn('[PhaseManager] Cannot save to Supabase: missing courseId');
            return;
        }

        if (typeof SupabaseSync !== 'undefined') {
            const saved = await SupabaseSync.savePhaseToSupabase(courseId, phase, index);
            if (saved) {
                // Update the phase ID map if this was a new phase
                if (this.config.setPhaseId) {
                    this.config.setPhaseId(index, saved.id);
                }
            }
        }
    },

    // --- ADD PHASE ---
    async add() {
        const phases = this.config.getPhases();
        if (!phases) return;

        const newIndex = phases.length;
        const newPhase = {
            title: `Bölüm ${newIndex}`,
            icon: '✨',
            description: 'Yeni bölüm açıklaması',
            color: 'blue',
        };

        phases.push(newPhase);
        this.renderList();
        this.load(newIndex);

        if (this.config.onUpdate) this.config.onUpdate();

        // Save to Supabase
        await this.savePhaseToSupabase(newIndex, newPhase);
    },

    // --- DELETE PHASE ---
    async delete() {
        if (this.currentPhaseIndex === null) return null;

        const phases = this.config.getPhases();
        const projects = this.config.getProjects();
        const idx = this.currentPhaseIndex;

        const projectsInPhase = projects ? projects.filter((p) => p.phase === idx).length : 0;

        if (projectsInPhase > 0) {
            if (
                !confirm(
                    `Bu fazda ${projectsInPhase} ders var! Silmek, bu derslerin görünmez olmasına neden olur. Devam?`
                )
            )
                return null;
        } else {
            if (!confirm('Bu fazı silmek istediğinize emin misiniz?')) return null;
        }

        // Delete from Supabase if we have the UUID
        const phaseIdMap = this.config.getPhaseIdMap?.();
        const phaseId = phaseIdMap?.[idx];
        if (phaseId && typeof SupabaseSync !== 'undefined') {
            const deleted = await SupabaseSync.deletePhaseFromSupabase(phaseId);
            if (!deleted) {
                alert('Supabase silme hatası. Yerel veri silinmedi.');
                return null;
            }
        }

        const deletedPhase = phases[idx];
        phases.splice(idx, 1);
        this.currentPhaseIndex = null;

        // SPA modunda null kontrolü
        const welcomeEl = document.getElementById('phase-welcome');
        const formEl = document.getElementById('phase-form');
        if (welcomeEl) welcomeEl.classList.remove('hidden');
        if (formEl) formEl.classList.add('hidden');

        this.renderList();

        if (this.config.onUpdate) this.config.onUpdate();

        return deletedPhase;
    },

    // --- GET CURRENT INDEX (for external access) ---
    getCurrentIndex() {
        return this.currentPhaseIndex;
    },

    // === SPA-COMPATIBLE API METHODS ===
    // These methods are called by PhasesSection.js inline editor

    /**
     * Update phase name by index (called from inline input)
     * @param {number} indexOrId - Phase index (in SPA, phase.id is the index)
     * @param {string} newName - New phase name
     */
    updateName(indexOrId, newName) {
        const phases = this.config.getPhases();
        if (!phases || !phases[indexOrId]) return;

        phases[indexOrId].title = newName;
        // Don't re-render to avoid losing focus on input

        if (this.config.onUpdate) this.config.onUpdate();
        this.scheduleSaveToSupabase(indexOrId, phases[indexOrId]);
    },

    /**
     * Move phase up (swap with previous)
     */
    async moveUp(index) {
        const phases = this.config.getPhases();
        if (!phases || index <= 0) return;

        // Swap phases
        [phases[index - 1], phases[index]] = [phases[index], phases[index - 1]];

        this.renderList();
        if (this.config.onUpdate) this.config.onUpdate();

        // Save both phases to Supabase
        await Promise.all([
            this.savePhaseToSupabase(index - 1, phases[index - 1]),
            this.savePhaseToSupabase(index, phases[index]),
        ]);
    },

    /**
     * Move phase down (swap with next)
     */
    async moveDown(index) {
        const phases = this.config.getPhases();
        if (!phases || index >= phases.length - 1) return;

        // Swap phases
        [phases[index], phases[index + 1]] = [phases[index + 1], phases[index]];

        this.renderList();
        if (this.config.onUpdate) this.config.onUpdate();

        // Save both phases to Supabase
        await Promise.all([
            this.savePhaseToSupabase(index, phases[index]),
            this.savePhaseToSupabase(index + 1, phases[index + 1]),
        ]);
    },

    /**
     * Delete phase by index (SPA-compatible version)
     * Overloaded: if called with number, treats it as index
     */
    async deleteByIndex(index) {
        const phases = this.config.getPhases();
        const projects = this.config.getProjects();

        if (!phases || index < 0 || index >= phases.length) return null;

        const projectsInPhase = projects ? projects.filter((p) => p.phase === index).length : 0;

        if (projectsInPhase > 0) {
            if (
                !confirm(
                    `Bu fazda ${projectsInPhase} ders var! Silmek, bu derslerin görünmez olmasına neden olur. Devam?`
                )
            ) {
                return null;
            }
        } else {
            if (!confirm('Bu fazı silmek istediğinize emin misiniz?')) return null;
        }

        // Delete from Supabase if we have the UUID
        const phaseIdMap = this.config.getPhaseIdMap?.();
        const phaseId = phaseIdMap?.[index];
        if (phaseId && typeof SupabaseSync !== 'undefined') {
            const deleted = await SupabaseSync.deletePhaseFromSupabase(phaseId);
            if (!deleted) {
                alert('Supabase silme hatası. Yerel veri silinmedi.');
                return null;
            }
        }

        const deletedPhase = phases[index];
        phases.splice(index, 1);
        this.currentPhaseIndex = null;

        this.renderList();
        if (this.config.onUpdate) this.config.onUpdate();

        return deletedPhase;
    },

    // === DRAG AND DROP SUPPORT ===

    /**
     * Drag start handler for phase reordering
     */
    dragStart(event, index) {
        event.dataTransfer.setData('text/plain', index.toString());
        event.dataTransfer.effectAllowed = 'move';
    },

    /**
     * Allow drop handler
     */
    allowDrop(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    },

    /**
     * Drop handler for phase reordering
     */
    async drop(event, targetIndex) {
        event.preventDefault();
        const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);

        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

        const phases = this.config.getPhases();
        if (!phases) return;

        // Remove from source and insert at target
        const [movedPhase] = phases.splice(sourceIndex, 1);
        phases.splice(targetIndex, 0, movedPhase);

        this.renderList();
        if (this.config.onUpdate) this.config.onUpdate();

        // Save all affected phases to Supabase (position changed)
        const affectedIndices = [];
        const minIdx = Math.min(sourceIndex, targetIndex);
        const maxIdx = Math.max(sourceIndex, targetIndex);
        for (let i = minIdx; i <= maxIdx; i++) {
            affectedIndices.push(i);
        }

        await Promise.all(affectedIndices.map((idx) => this.savePhaseToSupabase(idx, phases[idx])));
    },
};

window.PhaseManager = PhaseManager;
