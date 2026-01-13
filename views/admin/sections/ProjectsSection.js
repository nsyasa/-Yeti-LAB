/**
 * ProjectsSection - Ders/Proje yönetim bölümü
 * Admin panel projeler sekmesinin içeriği
 */
const ProjectsSection = {
    /**
     * Section render
     */
    render() {
        return `
            <div class="flex items-start gap-6 h-full">
                <!-- Sol Menü - Proje Listesi -->
                <div class="w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden sticky top-24 max-h-[80vh] flex flex-col">
                    <div class="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h2 class="font-bold text-lg text-gray-700">Ders Listesi</h2>
                        <button
                            onclick="admin.addNewProject()"
                            class="text-xs bg-gray-100 text-theme hover:bg-gray-200 px-2 py-1 rounded font-bold"
                        >
                            + Yeni Ekle
                        </button>
                    </div>
                    <div id="project-list" class="overflow-y-auto p-2 space-y-1 flex-grow"></div>
                </div>

                <!-- Sağ Form - Proje Düzenleme -->
                <div class="w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div id="project-welcome" class="text-center py-16 text-gray-500">
                        <div class="text-6xl mb-4">📚</div>
                        <h2 class="text-xl font-bold text-gray-600 dark:text-gray-200 mb-2">Ders Seçin veya Oluşturun</h2>
                        <p class="text-gray-400 dark:text-gray-500 mb-6 max-w-md mx-auto">
                            Soldan bir ders seçin veya yeni bir ders oluşturarak başlayın.
                        </p>
                        <button
                            onclick="admin.addNewProject()"
                            class="inline-flex items-center gap-2 bg-theme hover:bg-theme-dark text-white px-6 py-3 rounded-lg font-bold transition shadow-lg"
                        >
                            <span class="text-xl">✨</span>
                            Yeni Ders Oluştur
                        </button>
                    </div>
                    
                    <form id="project-form" class="hidden h-full flex flex-col">
                        ${this.renderFormHeader()}
                        ${this.renderFormContent()}
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Form header - Başlık ve aksiyonlar
     */
    renderFormHeader() {
        return `
            <div class="flex justify-between items-center border-b pb-4 mb-4">
                <div class="flex items-center gap-4">
                    <h3 class="text-xl font-bold text-theme">Ders Düzenle</h3>
                    <!-- Language Switcher -->
                    <div class="flex bg-gray-100 rounded-lg p-1" id="lang-switcher">
                        <button
                            type="button"
                            onclick="admin.switchLang('tr')"
                            id="lang-btn-tr"
                            class="lang-btn px-3 py-1 rounded text-sm font-bold bg-theme text-white"
                        >
                            🇹🇷 TR
                        </button>
                        <button
                            type="button"
                            onclick="admin.switchLang('en')"
                            id="lang-btn-en"
                            class="lang-btn px-3 py-1 rounded text-sm font-bold text-gray-500 hover:text-gray-700"
                        >
                            🇬🇧 EN
                        </button>
                    </div>
                </div>
                <div class="space-x-2">
                    <button
                        type="button"
                        onclick="admin.duplicateProject()"
                        class="text-blue-500 hover:text-blue-700 text-sm font-bold"
                    >
                        📋 Kopyala
                    </button>
                    <button
                        type="button"
                        onclick="admin.deleteProject()"
                        class="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                        🗑️ Sil
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Form content - Tüm form alanları
     */
    renderFormContent() {
        return `
            <div class="overflow-y-auto flex-grow pr-2 space-y-8">
                ${this.renderGeneralSection()}
                ${this.renderSimulationSection()}
                ${this.renderContentSection()}
                ${this.renderHardwareSection()}
                ${this.renderCircuitSection()}
                ${this.renderCodeSection()}
                ${this.renderQuizSection()}
            </div>
        `;
    },

    /**
     * Genel Bilgiler Bölümü
     */
    renderGeneralSection() {
        return `
            <div id="pcontent-genel" class="space-y-4">
                <h3 class="text-lg font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                    ⚙️ Genel Bilgiler
                </h3>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">ID</label>
                        <input
                            type="text"
                            id="p-id"
                            class="w-full border rounded p-2 bg-gray-100 font-mono text-center font-bold"
                            readonly
                            disabled
                        />
                    </div>
                    <div class="col-span-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">İkon</label>
                        <input
                            type="text"
                            id="p-icon"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                        />
                    </div>
                    <div class="col-span-8">
                        <label class="block text-xs font-bold text-gray-500 uppercase">Ders Başlığı</label>
                        <div class="lang-field lang-tr">
                            <input
                                type="text"
                                id="p-title-tr"
                                class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                                placeholder="Türkçe başlık..."
                            />
                        </div>
                        <div class="lang-field lang-en hidden">
                            <input
                                type="text"
                                id="p-title-en"
                                class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                                placeholder="English title..."
                            />
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Faz (Phase)</label>
                        <select id="p-phase" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent">
                            <option value="0">Faz seçin...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Hafta (Opsiyonel)</label>
                        <input
                            type="number"
                            id="p-week"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                            placeholder="1"
                        />
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Zorluk Seviyesi</label>
                        <select id="p-difficulty" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent">
                            <option value="beginner">🟢 Başlangıç</option>
                            <option value="intermediate">🟡 Orta</option>
                            <option value="advanced">🔴 İleri</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase">Tahmini Süre</label>
                        <input
                            type="text"
                            id="p-duration"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                            placeholder="30 dakika"
                        />
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Etiketler (virgülle ayırın)</label>
                    <input
                        type="text"
                        id="p-tags"
                        class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                        placeholder="led, temel, dijital"
                    />
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Ön Gereksinimler (Ders ID'leri, virgülle)</label>
                    <input
                        type="text"
                        id="p-prerequisites"
                        class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                        placeholder="1, 2, 3"
                    />
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase">Kısa Açıklama (Listede görünür)</label>
                    <div class="lang-field lang-tr">
                        <input
                            type="text"
                            id="p-desc-tr"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                            placeholder="Türkçe açıklama..."
                        />
                    </div>
                    <div class="lang-field lang-en hidden">
                        <input
                            type="text"
                            id="p-desc-en"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                            placeholder="English description..."
                        />
                    </div>
                </div>

                <!-- Tab Visibility Toggles -->
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Sekme Görünürlük Ayarları</label>
                    <div class="flex flex-wrap gap-4">
                        <label class="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" id="p-show-mission" class="rounded text-green-600 dark:bg-gray-700 dark:border-gray-600" 
                                   onchange="ProjectManager.toggleSection('mission')" checked />
                            <span id="lbl-chk-mission">🎯 Amaç</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" id="p-show-materials" class="rounded text-green-600 dark:bg-gray-700 dark:border-gray-600" 
                                   onchange="ProjectManager.toggleSection('materials')" checked />
                            <span id="lbl-chk-materials">🧩 Donanım</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" id="p-show-circuit" class="rounded text-green-600 dark:bg-gray-700 dark:border-gray-600" 
                                   onchange="ProjectManager.toggleSection('circuit')" checked />
                            <span id="lbl-chk-circuit">⚡ Devre</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" id="p-show-code" class="rounded text-green-600 dark:bg-gray-700 dark:border-gray-600" 
                                   onchange="ProjectManager.toggleSection('code')" checked />
                            <span id="lbl-chk-code">💻 Kod</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" id="p-show-challenge" class="rounded text-green-600 dark:bg-gray-700 dark:border-gray-600" 
                                   onchange="ProjectManager.toggleSection('challenge')" checked />
                            <span id="lbl-chk-challenge">🏆 Görev</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" id="p-show-quiz" class="rounded text-green-600 dark:bg-gray-700 dark:border-gray-600" 
                                   onchange="ProjectManager.toggleSection('quiz')" checked />
                            <span id="lbl-chk-quiz">📝 Test</span>
                        </label>
                         <label class="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input type="checkbox" id="p-show-tip" class="rounded text-green-600 dark:bg-gray-700 dark:border-gray-600" 
                                   onchange="ProjectManager.toggleSection('tip')" checked />
                            <span id="lbl-chk-tip">💡 İpucu</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Simülasyon Bölümü
     */
    renderSimulationSection() {
        return `
            <div id="pcontent-simulation" class="space-y-4">
                <h3 class="text-lg font-bold text-purple-600 dark:text-purple-400 border-b pb-2 flex items-center gap-2">
                    🎮 Simülasyon
                </h3>
                <div>
                    <label id="lbl-simulation" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Simülasyon Tipi</label>
                    <div class="flex gap-2">
                        <select id="p-simType" class="flex-1 border border-gray-200 dark:border-gray-600 p-2 rounded text-sm bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 transition text-gray-900 dark:text-gray-100"
                                onchange="admin.toggleCustomSimType()">
                            <option value="led">LED Yakma</option>
                            <option value="button">Buton Kullanımı</option>
                            <option value="pot">Potansiyometre</option>
                            <option value="streetLight">Sokak Lambası</option>
                            <option value="traffic">Trafik Lambası</option>
                            <option value="rgb">RGB Led</option>
                            <option value="dht">Sıcaklık Sensörü</option>
                            <option value="ultrasonic">Mesafe Sensörü</option>
                            <option value="servo">Servo Motor</option>
                            <option value="countdown">Geri Sayım</option>
                            <option value="melody">Melodi Çal</option>
                            <option value="radar">Radar Ekranı</option>
                            <option value="clap">Alkış Sensörü</option>
                            <option value="fire">Ateş Sensörü</option>
                            <option value="moisture">Toprak Nem</option>
                            <option value="flood">Su Seviyesi</option>
                            <option value="theremin">Theremin</option>
                            <option value="hourglass">Kum Saati</option>
                            <option value="knight_rider">Kara Şimşek</option>
                            <option value="explorer_board">Kart Keşfi</option>
                            <option value="custom">-- Özel Gir --</option>
                        </select>
                        <input type="text" id="p-simType-custom" 
                               class="flex-1 border border-gray-200 dark:border-gray-600 p-2 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hidden"
                               placeholder="Simülasyon Kodu..." />
                    </div>
                </div>

                <!-- YouTube Video -->
                <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800">
                    <div class="mb-3">
                        <label class="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                            🎬 YouTube Video (Opsiyonel)
                        </label>
                    </div>
                    <input type="text" id="p-youtubeUrl" 
                           class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="https://www.youtube.com/watch?v=... veya https://youtu.be/..."
                           onchange="ProjectManager.validateYouTubeUrl(this)" />
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Simülasyon ile ilgili açıklayıcı video ekleyebilirsiniz. URL girildiğinde ders sayfasında video gösterilecek.
                    </p>
                    <div id="youtube-preview" class="mt-3 hidden">
                        <div class="aspect-video bg-black rounded overflow-hidden">
                            <iframe id="youtube-preview-iframe" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * İçerik Detayları Bölümü
     */
    renderContentSection() {
        return `
            <div id="pcontent-icerik" class="space-y-4">
                <h3 class="text-lg font-bold text-theme border-b pb-2 flex items-center gap-2">
                    📖 İçerik Detayları
                </h3>
                <div>
                    <label id="lbl-mission" class="block text-xs font-bold text-gray-500 uppercase mb-2">🎯 Amaç</label>
                    <div class="lang-field lang-tr">
                        <div id="p-mission-tr-editor" class="rte-container"></div>
                    </div>
                    <div class="lang-field lang-en hidden">
                        <div id="p-mission-en-editor" class="rte-container"></div>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">📚 Teorik Bilgi</label>
                    <div class="lang-field lang-tr">
                        <div id="p-theory-tr-editor" class="rte-container"></div>
                    </div>
                    <div class="lang-field lang-en hidden">
                        <div id="p-theory-en-editor" class="rte-container"></div>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">🏆 Meydan Okuma Bilgi</label>
                    <div class="lang-field lang-tr">
                        <div id="p-challenge-tr-editor" class="rte-container"></div>
                    </div>
                    <div class="lang-field lang-en hidden">
                        <div id="p-challenge-en-editor" class="rte-container"></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Donanım Bilgileri Bölümü
     */
    renderHardwareSection() {
        return `
            <div id="pcontent-donanim" class="space-y-4">
                <h3 class="text-lg font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                    🧩 Donanım Bilgileri
                </h3>
                <label id="lbl-materials" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Devre Elemanları</label>
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2">
                    <div id="p-materials-list" class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 max-h-60 overflow-y-auto"></div>
                    <input
                        type="text"
                        id="p-materials-custom"
                        placeholder="Diğer malzemeler (virgül ile ayırın...)"
                        class="w-full border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 bg-transparent text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
                    />
                </div>
            </div>
        `;
    },

    /**
     * Devre Şeması Bölümü
     */
    renderCircuitSection() {
        return `
            <div id="pcontent-devre" class="space-y-4">
                <div class="flex items-center justify-between border-b pb-2">
                    <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        ⚡ Devre Şeması
                    </h3>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="p-circuitEnabled" class="rounded" 
                               onchange="ProjectManager.toggleCircuitSection()" />
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Devre şeması kullan</span>
                    </label>
                </div>
                
                <div id="circuit-section-content" class="space-y-4 hidden">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Devre/Blok Resmi</label>
                        <p class="text-xs text-gray-400 mb-1">Dosya adı (led.jpg) veya tam URL (https://...)</p>
                        <div class="flex gap-1">
                            <input type="text" id="p-circuitImage" 
                                   class="flex-1 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                                   placeholder="devre1.jpg veya https://example.com/img.png"
                                   onchange="admin.previewCircuitImage()" />
                            <button type="button" onclick="admin.openImageSelector('p-circuitImage')"
                                    class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-1 px-2 rounded text-xs whitespace-nowrap">
                                🖼️ Seç
                            </button>
                            <label class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs cursor-pointer whitespace-nowrap">
                                ⬆️ Yükle
                                <input type="file" accept="image/*" class="hidden" onchange="admin.uploadCircuitImage(this)" />
                            </label>
                        </div>
                        <div id="circuit-image-preview" class="mt-2 hidden">
                            <img id="circuit-preview-img" src="" class="max-h-32 rounded border shadow-sm" />
                        </div>
                    </div>

                    <!-- Hotspots -->
                    <div id="container-hotspots" class="transition-all duration-300 bg-orange-50 dark:bg-orange-900/20 p-4 rounded border border-orange-200 dark:border-orange-800">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" id="p-hotspotEnabled" class="rounded" 
                                           onchange="ProjectManager.toggleHotspotEnabled()" />
                                    <span class="text-sm font-bold text-gray-700 dark:text-gray-300">🎯 Etkileşimli Hotspotlar</span>
                                </label>
                            </div>
                            <button type="button" id="btn-open-hotspot-editor" onclick="HotspotManager.openEditor()"
                                    class="hidden text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded font-bold">
                                ✏️ Hotspot Düzenle
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Devre bileşenlerinin üzerine tıklanabilir bilgi noktaları ekleyin.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Kod Bölümü
     */
    renderCodeSection() {
        return `
            <div id="pcontent-kod" class="space-y-4">
                <h3 class="text-lg font-bold text-purple-600 border-b pb-2 flex items-center gap-2">
                    💻 Kod ve Blok Editörü
                </h3>
                
                <!-- Code Mode Toggle -->
                <div class="flex items-center gap-4 mb-4">
                    <label class="text-xs font-bold text-gray-500 uppercase">Kod Tipi:</label>
                    <div class="flex bg-gray-100 rounded-lg p-1">
                        <button type="button" onclick="ProjectManager.setCodeMode('block')" id="code-mode-block"
                                class="px-4 py-1.5 rounded-md text-sm font-bold transition bg-purple-500 text-white">
                            🧩 Blok
                        </button>
                        <button type="button" onclick="ProjectManager.setCodeMode('text')" id="code-mode-text"
                                class="px-4 py-1.5 rounded-md text-sm font-bold transition text-gray-500 hover:text-gray-700">
                            📝 Metin
                        </button>
                    </div>
                </div>

                <!-- Block Code Section -->
                <div id="block-code-section" class="">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Blok Kodu (JSON)</label>
                    <textarea id="p-blockCode" rows="10" 
                              class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm font-mono bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-theme focus:border-transparent"
                              placeholder="Scratch/Blockly JSON kodu..."></textarea>
                    <div class="flex gap-2 mt-2">
                        <button type="button" onclick="admin.formatBlockCode()"
                                class="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded font-medium transition-colors">
                            📐 Formatla
                        </button>
                        <button type="button" onclick="admin.validateBlockCode()"
                                class="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded font-medium transition-colors">
                            ✅ Doğrula
                        </button>
                    </div>
                </div>

                <!-- Text Code Section -->
                <div id="text-code-section" class="hidden">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Metin Kodu</label>
                    <textarea id="p-textCode" rows="12" 
                              class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm font-mono bg-gray-900 dark:bg-gray-950 text-green-400 focus:ring-2 focus:ring-theme focus:border-transparent"
                              placeholder="Arduino/Python/JavaScript kodu..."></textarea>
                </div>

                <!-- Code Explanation -->
                <div>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Kod Açıklaması</label>
                    <div class="lang-field lang-tr">
                        <div id="p-codeExplanation-tr-editor" class="rte-container"></div>
                    </div>
                    <div class="lang-field lang-en hidden">
                        <div id="p-codeExplanation-en-editor" class="rte-container"></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Quiz/Test Bölümü
     */
    renderQuizSection() {
        return `
            <div id="pcontent-quiz" class="space-y-4">
                <h3 class="text-lg font-bold text-green-600 border-b pb-2 flex items-center gap-2">
                    📝 Test ve Değerlendirme
                </h3>
                
                <div class="bg-green-50 p-4 rounded border border-green-200">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <span class="font-bold text-green-700">Quiz Soruları</span>
                            <span id="quiz-count-badge" class="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">0</span>
                        </div>
                        <button type="button" onclick="QuizManager.openEditor()"
                                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold text-sm">
                            ✏️ Quiz Düzenle
                        </button>
                    </div>
                    <p class="text-xs text-gray-500">
                        Dersin sonunda öğrenciyi test edecek çoktan seçmeli sorular ekleyin.
                    </p>
                </div>

                <!-- Quiz Preview -->
                <div id="quiz-preview" class="hidden space-y-2">
                    <!-- JS tarafından doldurulacak -->
                </div>
            </div>
        `;
    },

    /**
     * Initialize Rich Text Editors
     * Textarea'ları zengin metin editörlerine dönüştürür
     */
    initializeRichTextEditors() {
        // RichTextEditor modülünün yüklü olduğunu kontrol et
        if (typeof window.AdminRichTextEditor === 'undefined') {
            console.warn('[ProjectsSection] AdminRichTextEditor modülü bulunamadı, textarea kullanılacak');
            return;
        }

        const editors = {
            mission: { tr: null, en: null },
            theory: { tr: null, en: null },
            challenge: { tr: null, en: null },
            codeExplanation: { tr: null, en: null },
        };

        // Amaç (Mission)
        const missionTrContainer = document.getElementById('p-mission-tr-editor');
        const missionEnContainer = document.getElementById('p-mission-en-editor');
        if (missionTrContainer) {
            editors.mission.tr = window.AdminRichTextEditor.create(missionTrContainer, {
                placeholder: 'Türkçe amaç açıklaması (Markdown destekli)...',
                autosave: false,
            });
        }
        if (missionEnContainer) {
            editors.mission.en = window.AdminRichTextEditor.create(missionEnContainer, {
                placeholder: 'English mission description (Markdown supported)...',
                autosave: false,
            });
        }

        // Teorik Bilgi (Theory)
        const theoryTrContainer = document.getElementById('p-theory-tr-editor');
        const theoryEnContainer = document.getElementById('p-theory-en-editor');
        if (theoryTrContainer) {
            editors.theory.tr = window.AdminRichTextEditor.create(theoryTrContainer, {
                placeholder: 'Türkçe teorik bilgi (Markdown destekli)...',
                autosave: false,
            });
        }
        if (theoryEnContainer) {
            editors.theory.en = window.AdminRichTextEditor.create(theoryEnContainer, {
                placeholder: 'English theory (Markdown supported)...',
                autosave: false,
            });
        }

        // Meydan Okuma (Challenge)
        const challengeTrContainer = document.getElementById('p-challenge-tr-editor');
        const challengeEnContainer = document.getElementById('p-challenge-en-editor');
        if (challengeTrContainer) {
            editors.challenge.tr = window.AdminRichTextEditor.create(challengeTrContainer, {
                placeholder: 'Türkçe meydan okuma (Markdown destekli)...',
                autosave: false,
            });
        }
        if (challengeEnContainer) {
            editors.challenge.en = window.AdminRichTextEditor.create(challengeEnContainer, {
                placeholder: 'English challenge (Markdown supported)...',
                autosave: false,
            });
        }

        // Kod Açıklaması (Code Explanation)
        const codeExpTrContainer = document.getElementById('p-codeExplanation-tr-editor');
        const codeExpEnContainer = document.getElementById('p-codeExplanation-en-editor');
        if (codeExpTrContainer) {
            editors.codeExplanation.tr = window.AdminRichTextEditor.create(codeExpTrContainer, {
                placeholder: 'Türkçe kod açıklaması (Markdown destekli)...',
                autosave: false,
            });
        }
        if (codeExpEnContainer) {
            editors.codeExplanation.en = window.AdminRichTextEditor.create(codeExpEnContainer, {
                placeholder: 'English code explanation (Markdown supported)...',
                autosave: false,
            });
        }

        // Editörleri global olarak sakla (Admin modülü tarafından erişilebilir)
        window.projectEditors = editors;

        console.log('[ProjectsSection] Rich Text Editors initialized:', editors);

        // Apply custom tab names if available
        if (window.CourseSettings && window.CourseSettings.applyCustomTabNames) {
            window.CourseSettings.applyCustomTabNames();
        }
    },

    /**
     * Destroy Rich Text Editors
     * Editörleri temizle
     */
    destroyRichTextEditors() {
        if (window.projectEditors) {
            Object.values(window.projectEditors).forEach((langEditors) => {
                if (langEditors.tr?.destroy) langEditors.tr.destroy();
                if (langEditors.en?.destroy) langEditors.en.destroy();
            });
            window.projectEditors = null;
        }
    },
};

window.ProjectsSection = ProjectsSection;
