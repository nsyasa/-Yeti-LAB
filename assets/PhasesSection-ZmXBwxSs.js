const a={render(){return`
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
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
                <div id="phase-empty-state" class="hidden text-center py-12 text-gray-400 dark:text-gray-500">
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
        `},renderPhaseCard(t,e,r){return`
            <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-theme/50 dark:hover:border-theme/50 transition group"
                 draggable="true"
                 ondragstart="PhaseManager.dragStart(event, ${e})"
                 ondragover="PhaseManager.allowDrop(event)"
                 ondrop="PhaseManager.drop(event, ${e})">
                
                <!-- Drag Handle -->
                <div class="cursor-move text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                    <span class="text-xl">⋮⋮</span>
                </div>
                
                <!-- Phase Number -->
                <div class="w-10 h-10 rounded-full bg-theme text-white flex items-center justify-center font-bold">
                    ${t.id||e+1}
                </div>
                
                <!-- Phase Info -->
                <div class="flex-grow">
                    <input
                        type="text"
                        value="${this.escapeHtml(t.name||t.title||"")}"
                        onchange="PhaseManager.updateName(${e}, this.value)"
                        class="font-bold text-lg bg-transparent text-gray-900 dark:text-gray-100 border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-theme focus:outline-none transition w-full"
                        placeholder="Faz adı..."
                    />
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Bu fazda <span class="font-bold">${t.projectCount||0}</span> ders var
                    </p>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    ${e>0?`
                        <button onclick="PhaseManager.moveUp(${e})" 
                                class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Yukarı Taşı">
                            ⬆️
                        </button>
                    `:""}
                    ${e<r-1?`
                        <button onclick="PhaseManager.moveDown(${e})" 
                                class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Aşağı Taşı">
                            ⬇️
                        </button>
                    `:""}
                    <button onclick="PhaseManager.deleteByIndex(${e})" 
                            class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded" title="Sil">
                        🗑️
                    </button>
                </div>
            </div>
        `},escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}};window.PhasesSection=a;
