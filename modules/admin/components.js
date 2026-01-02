/**
 * Yeti LAB - Component Manager Module
 * Malzeme (Bileşen) listesini yönetir.
 */

const ComponentManager = {
    data: {}, // componentInfo object
    currentKey: null,
    onUpdate: null, // Callback specifically for when data changes (autosave trigger)
    onLoad: null, // Callback when a component is loaded for editing (to switch UI tabs)

    /**
     * Initialize the component manager
     * @param {Object} componentData - Initial data (admin.currentData.componentInfo)
     * @param {Object} callbacks - { onUpdate, onLoad }
     */
    init: (componentData, callbacks) => {
        ComponentManager.data = componentData || {};
        ComponentManager.currentKey = null;

        if (callbacks) {
            ComponentManager.onUpdate = callbacks.onUpdate;
            ComponentManager.onLoad = callbacks.onLoad;
        }

        ComponentManager.renderList();
    },

    renderList: () => {
        const list = document.getElementById('component-list');
        if (!list) return;

        list.innerHTML = '';

        try {
            Object.entries(ComponentManager.data).forEach(([key, comp]) => {
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
            });
        } catch (e) {
            console.error('Error rendering component list:', e);
            list.innerHTML += '<div class="p-2 text-red-500 text-xs">Hata: Elemanlar yüklenirken sorun oluştu.</div>';
        }
    },

    load: (key) => {
        ComponentManager.currentKey = key;
        const c = ComponentManager.data[key];

        // UI Switching (Delegate if possible, but simple DOM manipulation is fine here)
        document.getElementById('component-welcome').classList.add('hidden');
        document.getElementById('component-form').classList.remove('hidden');

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
        const val = (id) => document.getElementById(id).value;

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

        document.getElementById('component-welcome').classList.remove('hidden');
        document.getElementById('component-form').classList.add('hidden');

        ComponentManager.renderList();
        if (ComponentManager.onUpdate) ComponentManager.onUpdate();
    },
};

window.ComponentManager = ComponentManager;
