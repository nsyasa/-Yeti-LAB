/**
 * Yeti LAB - Component Manager Module
 * Malzeme (Bileşen) listesini yönetir.
 */

const ComponentManager = {
    // Configuration (getter functions like PhaseManager)
    config: {
        getComponentInfo: () => ({}), // Function to get componentInfo object
        onUpdate: null, // Callback for autosave
        onComponentSelect: null, // Callback when a component is loaded
    },

    // State
    currentKey: null,

    // Legacy compatibility getters
    get data() {
        return this.config.getComponentInfo() || {};
    },
    get onUpdate() {
        return this.config.onUpdate;
    },
    get onLoad() {
        return this.config.onComponentSelect;
    },

    /**
     * Initialize the component manager
     * @param {Object} config - Configuration object with getter functions
     */
    init(config) {
        // New mode: init({ getComponentInfo, onUpdate, onComponentSelect })
        if (config && config.getComponentInfo) {
            this.config = { ...this.config, ...config };
        } else {
            // Legacy mode: init(componentData, callbacks) - keep for backwards compatibility
            // This shouldn't happen with the new admin.js but just in case
            console.warn('[ComponentManager] Using legacy init mode');
        }

        this.currentKey = null;
        this.renderList();
    },

    renderList: () => {
        const list = document.getElementById('component-list');
        if (!list) return;

        list.innerHTML = '';

        try {
            Object.entries(ComponentManager.data).forEach(([key, comp]) => {
                // SPA Mode: Use ComponentsSection card renderer if available
                if (window.ComponentsSection && ComponentsSection.renderComponentCard) {
                    const compData = {
                        id: key,
                        name: comp.name || key,
                        icon: comp.icon || '📦',
                        category: comp.category || 'basic',
                        description: comp.desc || comp.description || '',
                    };
                    list.innerHTML += ComponentsSection.renderComponentCard(compData);
                } else {
                    // Legacy Mode: Old rendering for admin.html
                    const activeClass =
                        key === ComponentManager.currentKey
                            ? 'bg-purple-50 border-purple-500'
                            : 'hover:bg-gray-50 border-transparent';
                    list.innerHTML += `
                        <div onclick="ComponentManager.load('${key}')" class="p-3 border-l-4 cursor-pointer transition ${activeClass}">
                            <div class="flex items-center">
                                <span class="text-xl mr-3">${comp.icon || '📦'}</span>
                                <div>
                                    <div class="font-bold text-sm text-gray-700">${comp.name || key}</div>
                                    <div class="text-xs text-gray-400 font-mono">${key}</div>
                                </div>
                            </div>
                        </div>`;
                }
            });
        } catch (e) {
            console.error('Error rendering component list:', e);
            list.innerHTML += '<div class="p-2 text-red-500 text-xs">Hata: Elemanlar yüklenirken sorun oluştu.</div>';
        }
    },

    load: (key) => {
        ComponentManager.currentKey = key;
        const c = ComponentManager.data[key];
        if (!c) return;

        // UI Switching with null safety for SPA
        const welcomeEl = document.getElementById('component-welcome');
        const formEl = document.getElementById('component-form');
        if (welcomeEl) welcomeEl.classList.add('hidden');
        if (formEl) formEl.classList.remove('hidden');

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('c-key', key);
        setVal('c-name', c.name);
        setVal('c-icon', c.icon);
        setVal('c-imgFileName', c.imgFileName);
        setVal('c-desc', c.desc);

        ComponentManager.renderList();

        if (ComponentManager.onLoad) ComponentManager.onLoad(key);
    },

    update: () => {
        if (!ComponentManager.currentKey) return;

        const c = ComponentManager.data[ComponentManager.currentKey];
        if (!c) return;

        // Null-safe value getter
        const val = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        c.name = val('c-name');
        c.icon = val('c-icon');
        c.imgFileName = val('c-imgFileName');
        c.desc = val('c-desc');

        // Update list item visual (optimization) or just re-render
        // Re-render is safer and fast enough for this list
        ComponentManager.renderList();

        if (ComponentManager.onUpdate) ComponentManager.onUpdate();
    },

    add: () => {
        const key = prompt('Yeni eleman için benzersiz bir ID girin (örn: sensor_dht11):');
        if (!key) return;

        if (ComponentManager.data[key]) {
            alert('Bu ID zaten kullanılıyor!');
            return;
        }

        ComponentManager.data[key] = {
            name: 'Yeni Malzeme',
            icon: '📦',
            imgFileName: '',
            desc: 'Açıklama...',
        };

        ComponentManager.load(key);
        if (ComponentManager.onUpdate) ComponentManager.onUpdate();
    },

    delete: () => {
        if (!ComponentManager.currentKey) return;
        if (!confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) return;

        delete ComponentManager.data[ComponentManager.currentKey];
        ComponentManager.currentKey = null;

        // Null safety for SPA context
        const welcomeEl = document.getElementById('component-welcome');
        const formEl = document.getElementById('component-form');
        if (welcomeEl) welcomeEl.classList.remove('hidden');
        if (formEl) formEl.classList.add('hidden');

        ComponentManager.renderList();
        if (ComponentManager.onUpdate) ComponentManager.onUpdate();
    },

    // === SPA-COMPATIBLE API METHODS ===
    // These methods are called by ComponentsSection.js modal editor

    /**
     * Open edit modal for a component
     * @param {string} key - Component key/id
     */
    edit: (key) => {
        const modal = document.getElementById('component-edit-modal');
        if (!modal) {
            // Fallback to old behavior if modal doesn't exist
            ComponentManager.load(key);
            return;
        }

        const comp = ComponentManager.data[key];
        if (!comp) return;

        ComponentManager.currentKey = key;

        // Populate modal fields
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || '';
        };

        setVal('comp-edit-id', key);
        setVal('comp-edit-icon', comp.icon);
        setVal('comp-edit-name', comp.name);
        setVal('comp-edit-category', comp.category || 'basic');
        setVal('comp-edit-description', comp.desc || comp.description || '');
        setVal('comp-edit-quantity', comp.quantity || '1');
        setVal('comp-edit-unit', comp.unit || 'adet');

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Bind form submit
        const form = document.getElementById('component-edit-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                ComponentManager.saveFromModal();
            };
        }
    },

    /**
     * Close edit modal
     */
    closeEditModal: () => {
        const modal = document.getElementById('component-edit-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    /**
     * Save component from modal form
     */
    saveFromModal: () => {
        const key = ComponentManager.currentKey;
        if (!key || !ComponentManager.data[key]) return;

        const comp = ComponentManager.data[key];

        // Get values from modal form
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        comp.icon = getVal('comp-edit-icon') || '📦';
        comp.name = getVal('comp-edit-name') || 'İsimsiz';
        comp.category = getVal('comp-edit-category') || 'basic';
        comp.desc = getVal('comp-edit-description');
        comp.description = comp.desc; // Sync both field names
        comp.quantity = parseInt(getVal('comp-edit-quantity')) || 1;
        comp.unit = getVal('comp-edit-unit') || 'adet';

        ComponentManager.closeEditModal();
        ComponentManager.renderList();

        if (ComponentManager.onUpdate) ComponentManager.onUpdate();
    },

    /**
     * Delete component by key (SPA-compatible)
     * @param {string} key - Component key to delete
     */
    deleteById: (key) => {
        if (!key || !ComponentManager.data[key]) return;

        const compName = ComponentManager.data[key].name || key;
        if (!confirm(`"${compName}" elemanını silmek istediğinize emin misiniz?`)) return;

        delete ComponentManager.data[key];

        if (ComponentManager.currentKey === key) {
            ComponentManager.currentKey = null;
        }

        ComponentManager.closeEditModal();
        ComponentManager.renderList();

        if (ComponentManager.onUpdate) ComponentManager.onUpdate();
    },
};

window.ComponentManager = ComponentManager;
