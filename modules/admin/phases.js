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
        setPhaseId: (index, id) => {}, // Function to set phase UUID after creation
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
        // Form inputs - bind on load since form is static
        const titleEl = document.getElementById('ph-title');
        const iconEl = document.getElementById('ph-icon');
        const descEl = document.getElementById('ph-desc');
        const colorEl = document.getElementById('ph-color');

        if (titleEl) titleEl.oninput = () => this.update();
        if (iconEl) iconEl.oninput = () => this.update();
        if (descEl) descEl.oninput = () => this.update();
        if (colorEl) colorEl.onchange = () => this.update();
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
                const activeClass =
                    index === this.currentPhaseIndex
                        ? 'bg-amber-50 border-amber-500'
                        : 'hover:bg-gray-50 border-transparent';

                // Get display values with fallbacks
                const icon = phase?.icon || '📁';
                const title = phase?.title || `Bölüm ${index}`;
                const desc = phase?.description || '';

                list.innerHTML += `
                    <div onclick="PhaseManager.load(${index})" class="p-3 border-l-4 cursor-pointer transition ${activeClass}">
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-${phase?.color || 'gray'}-500 mr-3"></span>
                            <div>
                                <div class="font-bold text-sm text-gray-700">${icon} ${title}</div>
                                <div class="text-xs text-gray-400">${desc}</div>
                            </div>
                        </div>
                    </div>`;
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

        p.title = document.getElementById('ph-title').value;
        p.icon = document.getElementById('ph-icon').value;
        p.description = document.getElementById('ph-desc').value;
        p.color = document.getElementById('ph-color').value;

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
};

window.PhaseManager = PhaseManager;
