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
    },

    // State
    currentPhaseIndex: null,

    init(config) {
        this.config = { ...this.config, ...config };
        this.bindEvents();
    },

    bindEvents() {
        // Form inputs - bind on load since form is static
        const iconEl = document.getElementById('ph-icon');
        const descEl = document.getElementById('ph-desc');
        const colorEl = document.getElementById('ph-color');

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
                const fixedName = index === 0 ? 'Başlangıç' : `Bölüm ${index}`;

                // Fallback logic for display safe-guards
                let icon = '❓';
                let desc = '';

                if (phase) {
                    icon =
                        phase.icon ||
                        (phase.title && typeof phase.title === 'string' ? phase.title.split(' ')[0] : '❓');
                    desc =
                        phase.description ||
                        (phase.title && typeof phase.title === 'string' ? phase.title.replace(icon, '').trim() : '');
                }

                list.innerHTML += `
                    <div onclick="PhaseManager.load(${index})" class="p-3 border-l-4 cursor-pointer transition ${activeClass}">
                        <div class="flex items-center">
                            <span class="w-3 h-3 rounded-full bg-${phase?.color || 'gray'}-500 mr-3"></span>
                            <div>
                                <div class="font-bold text-sm text-gray-700">${icon} ${fixedName}</div>
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

        document.getElementById('phase-welcome').classList.add('hidden');
        document.getElementById('phase-form').classList.remove('hidden');

        // Fixed Name Logic
        const fixedName = index === 0 ? 'Başlangıç' : `Bölüm ${index}`;
        document.getElementById('ph-fixed-name').value = fixedName;

        // Data Migration / Fallback Logic
        const icon = p.icon || (p.title ? p.title.split(' ')[0] : '🚀');
        // If description is missing, use title minus icon.
        const desc = p.description || (p.title ? p.title.replace(icon, '').trim() : '');

        document.getElementById('ph-icon').value = icon;
        document.getElementById('ph-desc').value = desc;
        document.getElementById('ph-color').value = p.color || 'gray';

        this.renderList();
    },

    // --- UPDATE PHASE ---
    update() {
        if (this.currentPhaseIndex === null) return;
        const phases = this.config.getPhases();
        if (!phases || !phases[this.currentPhaseIndex]) return;

        const p = phases[this.currentPhaseIndex];

        p.icon = document.getElementById('ph-icon').value;
        p.description = document.getElementById('ph-desc').value;
        p.color = document.getElementById('ph-color').value;

        // Backwards compatibility for data file readability
        const fixedName = this.currentPhaseIndex === 0 ? 'Başlangıç' : `Bölüm ${this.currentPhaseIndex}`;
        p.title = `${p.icon} ${fixedName}`;

        this.renderList();

        if (this.config.onUpdate) this.config.onUpdate();
    },

    // --- ADD PHASE ---
    add() {
        const phases = this.config.getPhases();
        if (!phases) return;

        const newIndex = phases.length;
        phases.push({
            icon: '✨',
            description: 'Yeni Konu',
            title: '✨ Bölüm ' + newIndex,
            color: 'blue',
        });
        this.renderList();
        this.load(newIndex);

        if (this.config.onUpdate) this.config.onUpdate();
    },

    // --- DELETE PHASE ---
    delete() {
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

        const deletedPhase = phases[idx];
        phases.splice(idx, 1);
        this.currentPhaseIndex = null;

        document.getElementById('phase-welcome').classList.remove('hidden');
        document.getElementById('phase-form').classList.add('hidden');

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
