/**
 * HotspotManager - Hotspot Editör Wrapper
 * HotspotEditor modülünü modal API'si ile sarmalar
 * Template'lerde HotspotManager.openEditor() şeklinde çağrılır
 */
const HotspotManager = {
    currentProjectId: null,
    isOpen: false,

    /**
     * Hotspot editör modalını aç
     */
    openEditor() {
        const projectId = window.admin?.currentProjectId || window.ProjectManager?.currentProjectId;
        if (!projectId && projectId !== 0) {
            console.warn('[HotspotManager] No project selected');
            if (window.Toast) Toast.warning('Önce bir ders seçin');
            return;
        }

        this.currentProjectId = projectId;

        // Get project data
        const projects = window.admin?.currentData?.projects || [];
        const project = projects.find((p) => p.id === projectId);

        if (!project) {
            console.error('[HotspotManager] Project not found:', projectId);
            return;
        }

        // Ensure hotspots array exists
        if (!project.hotspots) project.hotspots = [];

        // Get circuit image
        const circuitImage = project.circuitImage || `devre${projectId}.jpg`;

        // Initialize HotspotEditor with project data
        if (window.HotspotEditor) {
            HotspotEditor.init(project.hotspots, circuitImage, (newData) => {
                project.hotspots = newData;
                this.updateHotspotCount(newData.length);
                if (window.admin?.triggerAutoSave) admin.triggerAutoSave();
            });
        }

        // Show modal
        const modal = document.getElementById('hotspot-editor-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            this.isOpen = true;
        }

        // Load image and render hotspots
        setTimeout(() => this.loadImageAndRender(circuitImage), 100);
    },

    /**
     * Hotspot editör modalını kapat
     */
    closeEditor() {
        const modal = document.getElementById('hotspot-editor-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            this.isOpen = false;
        }
    },

    /**
     * Yeni hotspot ekle
     */
    addHotspot() {
        if (window.HotspotEditor && HotspotEditor.toggleMode) {
            HotspotEditor.toggleMode();

            // Show instruction
            if (window.Toast) {
                Toast.info('Resim üzerinde bir noktaya tıklayın');
            }
        }
    },

    /**
     * Hotspot sil
     */
    deleteHotspot(index) {
        if (window.HotspotEditor && HotspotEditor.delete) {
            HotspotEditor.delete(index);
            this.renderHotspotList();
            this.renderMarkers();
        }
    },

    /**
     * Hotspot düzenle
     */
    editHotspot(index) {
        if (window.HotspotEditor && HotspotEditor.edit) {
            HotspotEditor.edit(index);
        }
    },

    /**
     * Tüm hotspotları temizle
     */
    clearAllHotspots() {
        if (!confirm('Tüm hotspotları silmek istediğinize emin misiniz?')) return;

        if (window.HotspotEditor && HotspotEditor.clearAll) {
            HotspotEditor.clearAll();
            this.renderHotspotList();
            this.renderMarkers();
        }
    },

    /**
     * Kaydet ve kapat
     */
    saveAndClose() {
        // HotspotEditor already syncs on each change
        this.closeEditor();

        if (window.Toast) {
            Toast.success('Hotspotlar kaydedildi');
        }
    },

    /**
     * Resmi yükle ve hotspotları render et
     */
    loadImageAndRender(circuitImage) {
        const imgContainer = document.getElementById('hotspot-image-container');
        const img = document.getElementById('hotspot-preview-image');

        if (!imgContainer || !img) return;

        // Set image source
        const courseKey = window.admin?.currentCourseKey || 'arduino';
        const imagePath = `img/${courseKey}/${circuitImage}`;

        img.src = imagePath;
        img.onerror = () => {
            img.src = 'img/placeholder-circuit.png';
        };
        img.onload = () => {
            this.renderMarkers();
            this.renderHotspotList();
        };

        // Add click handler for adding hotspots
        imgContainer.onclick = (e) => this.handleImageClick(e);
    },

    /**
     * Resme tıklandığında
     */
    handleImageClick(e) {
        if (!window.HotspotEditor || !HotspotEditor.addMode) return;

        const imgContainer = document.getElementById('hotspot-image-container');
        const img = document.getElementById('hotspot-preview-image');
        if (!imgContainer || !img) return;

        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Create new hotspot
        const hotspot = {
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            label: `Hotspot ${(HotspotEditor.data?.length || 0) + 1}`,
            description: '',
        };

        // Add to HotspotEditor data
        if (!HotspotEditor.data) HotspotEditor.data = [];
        HotspotEditor.data.push(hotspot);

        // Trigger sync
        if (HotspotEditor.onUpdate) HotspotEditor.onUpdate(HotspotEditor.data);

        // Turn off add mode
        HotspotEditor.addMode = false;

        // Re-render
        this.renderMarkers();
        this.renderHotspotList();

        // Prompt for label
        this.editHotspotLabel(HotspotEditor.data.length - 1);
    },

    /**
     * Hotspot etiketini düzenle
     */
    editHotspotLabel(index) {
        if (!window.HotspotEditor || !HotspotEditor.data?.[index]) return;

        const hotspot = HotspotEditor.data[index];
        const newLabel = prompt('Hotspot etiketi:', hotspot.label || '');

        if (newLabel !== null) {
            hotspot.label = newLabel;

            const newDesc = prompt('Açıklama (opsiyonel):', hotspot.description || '');
            if (newDesc !== null) {
                hotspot.description = newDesc;
            }

            // Trigger sync
            if (HotspotEditor.onUpdate) HotspotEditor.onUpdate(HotspotEditor.data);

            this.renderMarkers();
            this.renderHotspotList();
        }
    },

    /**
     * Hotspot işaretçilerini render et
     */
    renderMarkers() {
        const container = document.getElementById('hotspot-markers-container');
        if (!container || !window.HotspotEditor) return;

        const data = HotspotEditor.data || [];

        container.innerHTML = data
            .map(
                (h, index) => `
            <div class="absolute w-6 h-6 -ml-3 -mt-3 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition"
                 style="left: ${h.x}%; top: ${h.y}%;"
                 onclick="HotspotManager.editHotspotLabel(${index})"
                 title="${this.escapeHtml(h.label || '')}">
                ${index + 1}
            </div>
        `
            )
            .join('');
    },

    /**
     * Hotspot listesini render et
     */
    renderHotspotList() {
        const container = document.getElementById('hotspot-list-container');
        if (!container || !window.HotspotEditor) return;

        const data = HotspotEditor.data || [];

        if (data.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <div class="text-4xl mb-2">🎯</div>
                    <p class="text-sm">Hotspot yok</p>
                    <p class="text-xs mt-1">Eklemek için "+" butonuna tıklayın</p>
                </div>
            `;
            return;
        }

        container.innerHTML = data
            .map(
                (h, index) => `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3 group">
                <div class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                    ${index + 1}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-sm text-gray-700 dark:text-gray-200 truncate">
                        ${this.escapeHtml(h.label || 'Etiket yok')}
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                        x: ${h.x}%, y: ${h.y}%
                    </div>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onclick="HotspotManager.editHotspotLabel(${index})" 
                            class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm" title="Düzenle">
                        ✏️
                    </button>
                    <button onclick="HotspotManager.deleteHotspot(${index})" 
                            class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded text-sm" title="Sil">
                        🗑️
                    </button>
                </div>
            </div>
        `
            )
            .join('');
    },

    /**
     * Hotspot sayısını güncelle
     */
    updateHotspotCount(count) {
        const badge = document.getElementById('hotspot-count-badge');
        if (badge) badge.textContent = count;
    },

    /**
     * HTML escape
     */
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
};

window.HotspotManager = HotspotManager;
