/**
 * SettingsSection - Ayarlar yönetim bölümü
 * Admin panel ayarlar sekmesinin içeriği
 * - Kurs Bilgileri (icon, title, desc)
 * - Sekme İsimleri
 * - Devre Elemanları Kütüphanesi
 */
const SettingsSection = {
    /**
     * Section render
     */
    render() {
        return `
            <div class="space-y-6">
                <!-- Kurs Seçimi -->
                ${this.renderCourseSelector()}
                
                <!-- Kurs Bilgileri -->
                ${this.renderCourseInfo()}
                
                <!-- Sekme İsimleri -->
                ${this.renderTabNames()}
                
                <!-- Devre Elemanları Kütüphanesi -->
                ${this.renderComponentLibrary()}
            </div>
        `;
    },

    /**
     * Kurs Seçim Kartları
     */
    renderCourseSelector() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        📚 Kurs Seçimi
                    </h2>
                    <button
                        onclick="CourseManager.showInlineAddForm()"
                        class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm transition"
                    >
                        + Yeni Kurs Ekle
                    </button>
                </div>

                <!-- Kurs Seçim Kartları -->
                <div id="settings-course-selector" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <!-- JS tarafından doldurulacak -->
                </div>

                <!-- Inline Yeni Kurs Formu (gizli) -->
                <div id="settings-add-course-form" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-bold text-gray-700 dark:text-gray-200 mb-3">Yeni Kurs Oluştur</h4>
                    <div class="grid grid-cols-12 gap-3">
                        <input
                            type="text"
                            id="settings-course-icon"
                            placeholder="📚"
                            class="col-span-2 border border-gray-300 dark:border-gray-600 rounded p-2 text-center text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            maxlength="2"
                        />
                        <input
                            type="text"
                            id="settings-course-title"
                            placeholder="Kurs Başlığı"
                            class="col-span-4 border border-gray-300 dark:border-gray-600 rounded p-2 font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            id="settings-course-key"
                            placeholder="kurs-anahtari"
                            class="col-span-3 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            id="settings-course-desc"
                            placeholder="Açıklama"
                            class="col-span-3 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div class="flex justify-end gap-2 mt-3">
                        <button
                            type="button"
                            onclick="SettingsSection.hideAddCourseForm()"
                            class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                        >
                            İptal
                        </button>
                        <button
                            type="button"
                            onclick="SettingsSection.createCourse()"
                            class="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold transition"
                        >
                            ✓ Oluştur
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Kurs Bilgileri Düzenleme
     */
    renderCourseInfo() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        ⚙️ Seçili Kurs Ayarları
                    </h2>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl" id="settings-course-icon-preview">📚</span>
                        <span class="font-bold text-gray-600 dark:text-gray-300" id="settings-course-title-preview">Kurs Seçin</span>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-2">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Simge</label>
                        <input
                            type="text"
                            id="settings-edit-icon"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 text-center text-3xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="📚"
                        />
                    </div>
                    <div class="col-span-4">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Kurs Başlığı</label>
                        <input
                            type="text"
                            id="settings-edit-title"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Kurs Başlığı"
                        />
                    </div>
                    <div class="col-span-6">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Açıklama</label>
                        <input
                            type="text"
                            id="settings-edit-desc"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Kurs Açıklaması"
                        />
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Sekme İsimleri Düzenleyici
     */
    renderTabNames() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        🏷️ Ders Sekme İsimleri
                    </h2>
                    <button
                        type="button"
                        onclick="SettingsSection.resetTabNames()"
                        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                    >
                        ↺ Varsayılana Dön
                    </button>
                </div>

                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    💡 Bu sekme isimleri derslerde görünür (Amaç, Donanım, Devre, Kod vb.)
                </p>

                <div id="settings-tab-names" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <!-- JS tarafından doldurulacak -->
                </div>
            </div>
        `;
    },

    /**
     * Devre Elemanları Kütüphanesi
     */
    renderComponentLibrary() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        🔧 Devre Elemanları Kütüphanesi
                    </h2>
                    <button
                        onclick="ComponentManager.add()"
                        class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm transition"
                    >
                        + Yeni Eleman Ekle
                    </button>
                </div>

                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    💡 Burada tanımlanan devre elemanları, proje düzenlerken "Donanım" sekmesinde seçilebilir olacaktır.
                </p>

                <!-- Bileşen Listesi Grid -->
                <div id="settings-component-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    <!-- JS tarafından doldurulacak -->
                </div>

                <!-- Boş Durum -->
                <div id="settings-component-empty" class="hidden text-center py-12 text-gray-400 dark:text-gray-500">
                    <div class="text-5xl mb-4">🔌</div>
                    <p>Henüz devre elemanı eklenmemiş.</p>
                    <button
                        onclick="ComponentManager.add()"
                        class="mt-4 text-theme hover:text-theme-dark font-bold"
                    >
                        + İlk elemanı ekle
                    </button>
                </div>
            </div>
        `;
    },

    // === HELPER METHODS ===

    /**
     * Kurs seçim kartlarını render et
     */
    renderCourseCards() {
        const container = document.getElementById('settings-course-selector');
        if (!container) return;

        const allCourses = window.admin?.allCourseData || {};
        const currentKey = window.admin?.currentCourseKey;

        container.innerHTML = '';

        Object.entries(allCourses).forEach(([key, course]) => {
            const isActive = key === currentKey;
            const icon = course.icon || '📚';
            const title = course.title || key;

            const card = document.createElement('div');
            card.className = `
                p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                ${
                    isActive
                        ? 'border-theme bg-theme/10 dark:bg-theme/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-theme/50 bg-gray-50 dark:bg-gray-700'
                }
            `;
            card.innerHTML = `
                <div class="text-3xl mb-2">${icon}</div>
                <div class="font-bold text-sm text-gray-700 dark:text-gray-200 truncate">${title}</div>
                ${isActive ? '<div class="text-xs text-theme font-bold mt-1">✓ Seçili</div>' : ''}
            `;
            card.onclick = () => admin.changeCourse(key);
            container.appendChild(card);
        });

        // Update preview
        this.updateCoursePreview();
    },

    /**
     * Seçili kurs önizlemesini güncelle
     */
    updateCoursePreview() {
        const currentKey = window.admin?.currentCourseKey;
        const course = window.admin?.allCourseData?.[currentKey];

        if (!course) return;

        const iconPreview = document.getElementById('settings-course-icon-preview');
        const titlePreview = document.getElementById('settings-course-title-preview');
        const iconInput = document.getElementById('settings-edit-icon');
        const titleInput = document.getElementById('settings-edit-title');
        const descInput = document.getElementById('settings-edit-desc');

        if (iconPreview) iconPreview.textContent = course.icon || '📚';
        if (titlePreview) titlePreview.textContent = course.title || currentKey;
        if (iconInput) iconInput.value = course.icon || '';
        if (titleInput) titleInput.value = course.title || '';
        if (descInput) descInput.value = course.description || '';
    },

    /**
     * Kurs bilgilerini güncelle
     */
    updateCourseInfo() {
        const currentKey = window.admin?.currentCourseKey;
        const course = window.admin?.allCourseData?.[currentKey];

        if (!course) return;

        const icon = document.getElementById('settings-edit-icon')?.value || '';
        const title = document.getElementById('settings-edit-title')?.value || '';
        const desc = document.getElementById('settings-edit-desc')?.value || '';

        course.icon = icon;
        course.title = title;
        course.description = desc;

        // Update preview
        const iconPreview = document.getElementById('settings-course-icon-preview');
        const titlePreview = document.getElementById('settings-course-title-preview');
        if (iconPreview) iconPreview.textContent = icon || '📚';
        if (titlePreview) titlePreview.textContent = title || currentKey;

        // Trigger autosave
        if (window.admin?.triggerAutoSave) admin.triggerAutoSave();
    },

    /**
     * Sekme isimlerini render et
     */
    renderTabNames() {
        const container = document.getElementById('settings-tab-names');
        if (!container) return;

        const currentKey = window.admin?.currentCourseKey;
        const course = window.admin?.allCourseData?.[currentKey];
        const customTabNames = course?.customTabNames || {};

        // Use TabConfig to get the exact tabs for this course type
        // This ensures Admin ID matches Frontend ID (e.g. 'design' vs 'circuit')
        let tabsToRender = [];
        if (window.TabConfig && window.TabConfig.getConfig) {
            tabsToRender = window.TabConfig.getConfig(currentKey).tabs;
        } else {
            // Fallback if TabConfig is missing
            tabsToRender = [
                { id: 'mission', label: '🎯 Amaç' },
                { id: 'materials', label: '🧩 Donanım' },
                { id: 'circuit', label: '⚡ Devre' },
                { id: 'code', label: '💻 Kod' },
                { id: 'challenge', label: '🏆 Görev' },
                { id: 'quiz', label: '📝 Test' },
            ];
        }

        container.innerHTML = '';

        tabsToRender.forEach((tab) => {
            // Extract text from label for default placeholder (remove emojis)
            const cleanLabel = tab.label.replace(/[\p{Emoji}\u2580-\u2FFF\u200d\uFE0F]/gu, '').trim();
            const currentName = customTabNames[tab.id] || cleanLabel;

            const div = document.createElement('div');
            div.className = 'flex flex-col gap-1';
            div.innerHTML = `
                <label class="text-xs text-gray-500 dark:text-gray-400">${cleanLabel} (ID: ${tab.id})</label>
                <input
                    type="text"
                    id="tab-name-${tab.id}"
                    data-key="${tab.id}"
                    value="${currentName}"
                    placeholder="${cleanLabel}"
                    class="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    oninput="SettingsSection.updateTabName('${tab.id}', this.value)"
                />
            `;
            container.appendChild(div);
        });
    },

    /**
     * Sekme adını güncelle
     */
    updateTabName(tabId, newName) {
        const course = window.admin?.allCourseData?.[window.admin?.currentCourseKey];
        if (!course) return;

        if (!course.customTabNames) course.customTabNames = {};
        course.customTabNames[tabId] = newName;

        // Apply to project form labels
        if (window.CourseSettings?.applyCustomTabNames) {
            CourseSettings.applyCustomTabNames();
        }

        // Trigger autosave
        if (window.admin?.triggerAutoSave) admin.triggerAutoSave();
    },

    /**
     * Sekme isimlerini sıfırla
     */
    resetTabNames() {
        if (!confirm('Sekme isimlerini varsayılana döndürmek istiyor musunuz?')) return;

        const course = window.admin?.allCourseData?.[window.admin?.currentCourseKey];
        if (!course) return;

        course.customTabNames = {};
        this.renderTabNames();

        if (window.CourseSettings?.applyCustomTabNames) {
            CourseSettings.applyCustomTabNames();
        }

        if (window.admin?.triggerAutoSave) admin.triggerAutoSave();
    },

    /**
     * Devre elemanlarını render et
     */
    renderComponents() {
        const container = document.getElementById('settings-component-list');
        const emptyState = document.getElementById('settings-component-empty');
        if (!container) return;

        const componentInfo = window.admin?.currentData?.componentInfo || {};
        const keys = Object.keys(componentInfo);

        if (keys.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        container.innerHTML = '';

        keys.forEach((key) => {
            const comp = componentInfo[key];
            const card = document.createElement('div');
            card.className =
                'bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3 hover:border-theme/50 hover:shadow-md transition cursor-pointer group';
            card.innerHTML = `
                <div class="text-2xl mb-2">${comp.icon || '🔌'}</div>
                <div class="font-bold text-sm text-gray-700 dark:text-gray-200 truncate">${comp.name || key}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">${comp.desc || ''}</div>
                <div class="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                    <button onclick="event.stopPropagation(); ComponentManager.edit('${key}')" 
                            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs">✏️</button>
                    <button onclick="event.stopPropagation(); ComponentManager.deleteById('${key}')" 
                            class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded text-xs">🗑️</button>
                </div>
            `;
            card.onclick = () => ComponentManager.edit(key);
            container.appendChild(card);
        });
    },

    /**
     * Yeni kurs formunu göster
     */
    showAddCourseForm() {
        const form = document.getElementById('settings-add-course-form');
        if (form) form.classList.remove('hidden');
    },

    /**
     * Yeni kurs formunu gizle
     */
    hideAddCourseForm() {
        const form = document.getElementById('settings-add-course-form');
        if (form) form.classList.add('hidden');
    },

    /**
     * Yeni kurs oluştur
     */
    createCourse() {
        const icon = document.getElementById('settings-course-icon')?.value || '📚';
        const title = document.getElementById('settings-course-title')?.value;
        const key = document.getElementById('settings-course-key')?.value;
        const desc = document.getElementById('settings-course-desc')?.value || '';

        if (!title || !key) {
            alert('Lütfen kurs başlığı ve anahtar girin.');
            return;
        }

        if (window.CourseManager?.create) {
            CourseManager.create({ key, title, icon, description: desc });
        }

        this.hideAddCourseForm();
        this.renderCourseCards();
    },

    /**
     * Event Listeners Bağla
     */
    bindEvents() {
        const attachListener = (id, event, handler) => {
            const el = document.getElementById(id);
            if (el) {
                // Remove old listener to be safe (though simpler to just add new one on clean fresh DOM)
                el.removeEventListener(event, handler);
                el.addEventListener(event, handler);
            }
        };

        // Course Info Inputs
        attachListener('settings-edit-icon', 'input', () => this.updateCourseInfo());
        attachListener('settings-edit-title', 'input', () => this.updateCourseInfo());
        attachListener('settings-edit-desc', 'input', () => this.updateCourseInfo());
    },

    /**
     * Section mount olduğunda çağrılır
     */
    mount() {
        this.renderCourseCards();
        this.renderTabNames();
        this.renderComponents();

        // Bind events after rendering
        setTimeout(() => this.bindEvents(), 100);
    },
};

window.SettingsSection = SettingsSection;
export default SettingsSection;
