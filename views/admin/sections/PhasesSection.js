/**
 * PhasesSection - Faz yönetim bölümü
 * Admin panel fazlar sekmesinin içeriği
 */
const PhasesSection = {
    /**
     * Section render
     */
    render() {
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 flex items-center gap-2">
                        📁 Faz Yönetimi
                    </h2>
                    <button
                        onclick="PhaseManager.add()"
                        class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm transition"
                    >
                        + Yeni Faz Ekle
                    </button>
                </div>

                <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    💡 Fazlar, dersleri gruplandırmak için kullanılır. Örneğin: "Başlangıç", "Orta Seviye", "İleri Seviye" gibi.
                </p>

                <!-- Faz Listesi -->
                <div id="phase-list" class="space-y-2">
                    <!-- JS tarafından doldurulacak -->
                </div>

                <!-- Boş Durum -->
                <div id="phase-empty-state" class="hidden text-center py-12 text-gray-400">
                    <div class="text-5xl mb-4">📂</div>
                    <p>Henüz faz eklenmemiş.</p>
                    <button
                        onclick="PhaseManager.add()"
                        class="mt-4 text-theme hover:text-theme-dark font-bold"
                    >
                        + İlk fazı ekle
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Tek faz kartı render
     */
    renderPhaseCard(phase, index, totalCount) {
        return `
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border hover:border-theme/50 transition group"
                 draggable="true"
                 ondragstart="PhaseManager.dragStart(event, ${index})"
                 ondragover="PhaseManager.allowDrop(event)"
                 ondrop="PhaseManager.drop(event, ${index})">
                
                <!-- Drag Handle -->
                <div class="cursor-move text-gray-400 hover:text-gray-600">
                    <span class="text-xl">⋮⋮</span>
                </div>
                
                <!-- Phase Number -->
                <div class="w-10 h-10 rounded-full bg-theme text-white flex items-center justify-center font-bold">
                    ${phase.id || index + 1}
                </div>
                
                <!-- Phase Info -->
                <div class="flex-grow">
                    <input
                        type="text"
                        value="${this.escapeHtml(phase.name || phase.title || '')}"
                        onchange="PhaseManager.updateName(${index}, this.value)"
                        class="font-bold text-lg bg-transparent border-b border-transparent hover:border-gray-300 focus:border-theme focus:outline-none transition w-full"
                        placeholder="Faz adı..."
                    />
                    <p class="text-xs text-gray-400 mt-1">
                        Bu fazda <span class="font-bold">${phase.projectCount || 0}</span> ders var
                    </p>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    ${
                        index > 0
                            ? `
                        <button onclick="PhaseManager.moveUp(${index})" 
                                class="p-2 hover:bg-gray-200 rounded" title="Yukarı Taşı">
                            ⬆️
                        </button>
                    `
                            : ''
                    }
                    ${
                        index < totalCount - 1
                            ? `
                        <button onclick="PhaseManager.moveDown(${index})" 
                                class="p-2 hover:bg-gray-200 rounded" title="Aşağı Taşı">
                            ⬇️
                        </button>
                    `
                            : ''
                    }
                    <button onclick="PhaseManager.deleteByIndex(${index})" 
                            class="p-2 hover:bg-red-100 text-red-500 rounded" title="Sil">
                        🗑️
                    </button>
                </div>
            </div>
        `;
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

window.PhasesSection = PhasesSection;
