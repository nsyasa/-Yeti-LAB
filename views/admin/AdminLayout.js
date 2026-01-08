/**
 * AdminLayout - Admin panel header ve ortak layout bileşenleri
 * Sadeleştirilmiş versiyon - index main-header kullanılıyor
 */
const AdminLayout = {
    /**
     * Tab Navigation - Sadece tab'lar ve aksiyonlar (header yerine)
     */
    renderTabNav() {
        return `
            <div class="admin-tab-nav bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                <div class="max-w-7xl mx-auto px-4 sm:px-6">
                    <div class="flex items-center justify-between h-14">
                        <!-- Admin Label -->
                        <div class="flex items-center gap-4">
                            <span class="text-sm font-bold px-3 py-1 rounded-full" style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white;">
                                🔧 Yönetim Paneli
                            </span>
                            
                            <!-- Tab Buttons -->
                            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onclick="AdminView.showSection('projects')"
                                    data-section="projects"
                                    class="admin-tab-btn px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                >
                                    📚 Dersler
                                </button>
                                <button
                                    onclick="AdminView.showSection('phases')"
                                    data-section="phases"
                                    class="admin-tab-btn px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                >
                                    📁 Fazlar
                                </button>
                                <button
                                    onclick="AdminView.showSection('components')"
                                    data-section="components"
                                    class="admin-tab-btn px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                >
                                    🔧 Devre
                                </button>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2">
                            <!-- Autosave Status -->
                            <div id="autosave-status" 
                                 class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                                 style="background: rgba(16, 185, 129, 0.1); color: #059669;">
                                <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span>Hazır</span>
                            </div>
                            
                            <button onclick="admin.undo()" id="btn-undo"
                                class="hidden text-sm px-3 py-1.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                title="Son silinen öğeyi geri al">
                                ↩️
                            </button>
                            <button onclick="admin.downloadBackup()"
                                class="hidden sm:inline-flex text-sm px-3 py-1.5 rounded-lg font-semibold transition"
                                style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white;"
                                title="Tüm verileri JSON olarak indir">
                                📥 Yedekle
                            </button>
                            <button onclick="admin.saveData()"
                                class="text-sm px-3 py-1.5 rounded-lg font-semibold transition"
                                style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white;">
                                💾 Kaydet
                            </button>
                            <button onclick="AdminView.handleLogout()"
                                class="text-sm p-1.5 rounded-lg font-semibold transition text-gray-500 hover:bg-red-100 hover:text-red-600"
                                title="Çıkış Yap">
                                🚪
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Course Settings Panel render
     */
    renderCourseSettings() {
        return `
            <div class="bg-gradient-to-r from-theme/10 to-transparent border border-theme/20 rounded-lg mb-6">
                <button
                    type="button"
                    onclick="admin.toggleCourseSettings()"
                    class="w-full flex items-center justify-between p-4 text-left hover:bg-white/30 transition"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-2xl" id="course-icon-preview">🔧</span>
                        <div>
                            <h3 class="font-bold text-gray-700" id="course-title-preview">Kurs Başlığı</h3>
                            <p class="text-sm text-gray-500" id="course-desc-preview">Kurs açıklaması</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400">Ayarları düzenlemek için tıklayın</span>
                        <span id="course-settings-toggle" class="text-gray-400 text-xl transition-transform">▼</span>
                    </div>
                </button>

                <div id="course-settings-form" class="hidden border-t border-theme/20 bg-white/50">
                    <!-- Bölüm 1: Kurs Seçimi ve Yönetimi -->
                    <div class="p-4 border-b border-gray-200">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-xs font-bold text-gray-500 uppercase">📚 Kurs Seç veya Yönet</label>
                            <button
                                type="button"
                                onclick="CourseManager.showInlineAddForm()"
                                class="text-xs bg-theme text-white px-3 py-1 rounded hover:bg-theme-dark transition"
                            >
                                + Yeni Kurs Ekle
                            </button>
                        </div>

                        <!-- Kurs Seçim Kartları -->
                        <div id="course-selector-grid" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
                            <!-- JS tarafından doldurulacak -->
                        </div>

                        <!-- Inline Yeni Kurs Formu (gizli) -->
                        <div id="inline-add-course-form" class="hidden mt-3 p-3 bg-gray-50 rounded-lg border">
                            <div class="grid grid-cols-12 gap-2">
                                <input
                                    type="text"
                                    id="inline-course-icon"
                                    placeholder="📚"
                                    class="col-span-1 border rounded p-2 text-center text-xl"
                                    maxlength="2"
                                />
                                <input
                                    type="text"
                                    id="inline-course-title"
                                    placeholder="Kurs Başlığı"
                                    class="col-span-4 border rounded p-2 font-bold"
                                />
                                <input
                                    type="text"
                                    id="inline-course-key"
                                    placeholder="kurs-anahtari"
                                    class="col-span-3 border rounded p-2 text-sm font-mono"
                                />
                                <input
                                    type="text"
                                    id="inline-course-desc"
                                    placeholder="Açıklama"
                                    class="col-span-4 border rounded p-2 text-sm"
                                />
                            </div>
                            <div class="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onclick="CourseManager.hideInlineAddForm()"
                                    class="text-xs text-gray-500 px-3 py-1 hover:bg-gray-200 rounded"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onclick="CourseManager.createFromInline()"
                                    class="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                >
                                    Oluştur
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Bölüm 2: Seçili Kursun Ayarları -->
                    <div class="p-4 border-b border-gray-200">
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-3">⚙️ Seçili Kurs Ayarları</label>
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-2">
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Simge</label>
                                <input
                                    type="text"
                                    id="admin-course-icon"
                                    class="w-full border rounded p-2 text-center text-2xl"
                                    placeholder="🎓"
                                    onchange="admin.updateCourseSettings()"
                                />
                            </div>
                            <div class="col-span-4">
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Kurs Başlığı</label>
                                <input
                                    type="text"
                                    id="admin-course-title"
                                    class="w-full border rounded p-2 font-bold"
                                    placeholder="Kurs Başlığı"
                                    oninput="admin.updateCourseSettings()"
                                />
                            </div>
                            <div class="col-span-6">
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label>
                                <input
                                    type="text"
                                    id="admin-course-description"
                                    class="w-full border rounded p-2"
                                    placeholder="Kurs Açıklaması"
                                    oninput="admin.updateCourseSettings()"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Bölüm 3: Sekme İsim Editörü -->
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-xs font-bold text-gray-500 uppercase">🏷️ Ders Sekme İsimleri</label>
                            <button
                                type="button"
                                onclick="admin.resetTabNames()"
                                class="text-xs text-gray-400 hover:text-gray-600"
                            >
                                ↺ Varsayılana Dön
                            </button>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" id="tab-names-editor">
                            <!-- Dinamik olarak doldurulacak -->
                        </div>
                        <p class="text-xs text-gray-400 mt-3">
                            💡 Bu sekme isimleri derslerde görünür (Amaç, Donanım, Devre, Kod vb.)
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Kullanıcı bilgisini güncelle
     */
    updateUserInfo() {
        // Main header'daki kullanıcı bilgileri Navbar tarafından yönetiliyor
        console.log('[AdminLayout] User info managed by main navbar');
    },

    /**
     * Tab aktif durumunu güncelle
     */
    updateActiveTab(section) {
        document.querySelectorAll('.admin-tab-btn').forEach((tab) => {
            // Reset all tabs
            tab.classList.remove('bg-theme', 'text-white');
            tab.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');

            // Activate current tab
            if (tab.dataset && tab.dataset.section === section) {
                tab.classList.add('bg-theme', 'text-white');
                tab.classList.remove(
                    'text-gray-600',
                    'dark:text-gray-300',
                    'hover:bg-gray-200',
                    'dark:hover:bg-gray-600'
                );
            }
        });
    },

    /**
     * Logout işlemi
     */
    async handleLogout() {
        if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
            try {
                if (window.SupabaseClient) {
                    await SupabaseClient.signOut();
                }
                AdminView.unmount();
                Router.navigate('/');
            } catch (error) {
                console.error('[AdminLayout] Logout error:', error);
            }
        }
    },
};

window.AdminLayout = AdminLayout;
