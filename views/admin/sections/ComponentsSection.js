/**
 * ComponentsSection - Devre elemanları yönetim bölümü
 * Admin panel bileşenler sekmesinin içeriği
 */
const ComponentsSection = {
    /**
     * Section render
     */
    render() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 flex items-center gap-2">
                        🔧 Devre Elemanları
                    </h2>
                    <button
                        onclick="ComponentManager.add()"
                        class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm transition"
                    >
                        + Yeni Eleman Ekle
                    </button>
                </div>

                <p class="text-gray-500 text-sm mb-6">
                    💡 Burada tanımlanan devre elemanları, proje düzenlerken "Donanım" sekmesinde seçilebilir olacaktır.
                </p>

                <!-- Filtre ve Arama -->
                <div class="flex gap-4 mb-6">
                    <div class="flex-grow">
                        <input
                            type="text"
                            id="component-search"
                            placeholder="🔍 Eleman ara..."
                            class="w-full border rounded-lg p-3"
                            oninput="ComponentsSection.filterList(this.value)"
                        />
                    </div>
                    <select id="component-category-filter" 
                            class="border rounded-lg px-4"
                            onchange="ComponentsSection.filterByCategory(this.value)">
                        <option value="">Tüm Kategoriler</option>
                        <option value="basic">Temel</option>
                        <option value="sensor">Sensörler</option>
                        <option value="actuator">Aktüatörler</option>
                        <option value="display">Ekranlar</option>
                        <option value="communication">İletişim</option>
                        <option value="power">Güç</option>
                        <option value="other">Diğer</option>
                    </select>
                </div>

                <!-- Bileşen Listesi Grid -->
                <div id="component-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <!-- JS tarafından doldurulacak -->
                </div>

                <!-- Boş Durum -->
                <div id="component-empty-state" class="hidden text-center py-12 text-gray-400">
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

            <!-- Edit Modal -->
            ${this.renderEditModal()}
        `;
    },

    /**
     * Bileşen kartı render
     */
    renderComponentCard(comp) {
        return `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:border-theme/50 hover:shadow-md transition cursor-pointer group"
                 onclick="ComponentManager.edit('${comp.id}')">
                <div class="flex items-start justify-between mb-3">
                    <div class="text-3xl">${comp.icon || '🔌'}</div>
                    <span class="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                        ${this.getCategoryLabel(comp.category)}
                    </span>
                </div>
                <h3 class="font-bold text-gray-700 dark:text-gray-200 mb-1">${this.escapeHtml(comp.name || 'İsimsiz')}</h3>
                <p class="text-xs text-gray-400 dark:text-gray-400 line-clamp-2">${this.escapeHtml(comp.description || '')}</p>
                
                <!-- Actions -->
                <div class="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition">
                    <button onclick="event.stopPropagation(); ComponentManager.edit('${comp.id}')" 
                            class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm" title="Düzenle">
                        ✏️
                    </button>
                    <button onclick="event.stopPropagation(); ComponentManager.deleteById('${comp.id}')" 
                            class="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded text-sm" title="Sil">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Edit Modal
     */
    renderEditModal() {
        return `
            <div id="component-edit-modal" 
                 class="fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center"
                 onclick="if(event.target === this) ComponentManager.closeEditModal()">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-bold text-lg">🔧 Devre Elemanı Düzenle</h3>
                        <button onclick="ComponentManager.closeEditModal()" 
                                class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    
                    <form id="component-edit-form" class="space-y-4">
                        <input type="hidden" id="comp-edit-id" />
                        
                        <div class="grid grid-cols-4 gap-4">
                            <div class="col-span-1">
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Simge</label>
                                <input type="text" id="comp-edit-icon" 
                                       class="w-full border rounded p-2 text-center text-2xl"
                                       placeholder="🔌" maxlength="2" />
                            </div>
                            <div class="col-span-3">
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Eleman Adı</label>
                                <input type="text" id="comp-edit-name" 
                                       class="w-full border rounded p-2 font-bold"
                                       placeholder="LED" />
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori</label>
                            <select id="comp-edit-category" class="w-full border rounded p-2">
                                <option value="basic">Temel</option>
                                <option value="sensor">Sensör</option>
                                <option value="actuator">Aktüatör</option>
                                <option value="display">Ekran</option>
                                <option value="communication">İletişim</option>
                                <option value="power">Güç</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label>
                            <textarea id="comp-edit-description" rows="3" 
                                      class="w-full border rounded p-2 text-sm"
                                      placeholder="Eleman hakkında kısa açıklama..."></textarea>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Varsayılan Miktar</label>
                                <input type="number" id="comp-edit-quantity" 
                                       class="w-full border rounded p-2"
                                       placeholder="1" min="1" />
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Birim</label>
                                <input type="text" id="comp-edit-unit" 
                                       class="w-full border rounded p-2"
                                       placeholder="adet" />
                            </div>
                        </div>
                        
                        <div class="flex gap-2 pt-4">
                            <button type="button" onclick="ComponentManager.closeEditModal()"
                                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg transition">
                                İptal
                            </button>
                            <button type="submit"
                                    class="flex-1 bg-theme hover:bg-theme-dark text-white font-bold py-2 rounded-lg transition">
                                💾 Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Listeyi filtrele
     */
    filterList(query) {
        const items = document.querySelectorAll('#component-list > div');
        const lowerQuery = query.toLowerCase();

        items.forEach((item) => {
            const name = item.querySelector('h3')?.textContent?.toLowerCase() || '';
            const desc = item.querySelector('p')?.textContent?.toLowerCase() || '';
            if (name.includes(lowerQuery) || desc.includes(lowerQuery)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    },

    /**
     * Kategoriye göre filtrele
     */
    filterByCategory(category) {
        // ComponentManager'a delege et
        if (window.ComponentManager && ComponentManager.filterByCategory) {
            ComponentManager.filterByCategory(category);
        }
    },

    /**
     * Kategori label helper
     */
    getCategoryLabel(category) {
        const labels = {
            basic: 'Temel',
            sensor: 'Sensör',
            actuator: 'Aktüatör',
            display: 'Ekran',
            communication: 'İletişim',
            power: 'Güç',
            other: 'Diğer',
        };
        return labels[category] || category || 'Diğer';
    },

    /**
     * HTML escape helper
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
};

window.ComponentsSection = ComponentsSection;
