/**
 * AdminLayout - Admin panel header ve ortak layout bileşenleri
 */
const AdminLayout = {
    /**
     * Header render - Top navigation bar
     */
    renderHeader() {
        return `
            <!-- Row 1: Logo, Autosave Status -->
            <div class="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center border-b border-white/10">
                <div class="flex items-center gap-4">
                    <div class="flex items-center">
                        <span class="text-2xl mr-2">🏔️</span>
                        <h1 class="text-xl font-bold" style="letter-spacing: -0.03em">
                            Yeti <span style="font-weight: 900">LAB</span>
                        </h1>
                    </div>
                    <span class="text-gray-300">|</span>
                    <span class="font-medium">Yönetim Paneli</span>
                </div>

                <!-- Kayıt Durumu & Kullanıcı -->
                <div class="flex items-center gap-4">
                    <div
                        id="autosave-status"
                        class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 font-bold text-sm"
                    >
                        <span class="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span>Hazır</span>
                    </div>
                    <span id="admin-user-email" class="text-gray-300 text-sm"></span>
                    <a href="#/" onclick="AdminView.unmount(); Router.navigate('/');" 
                       class="text-gray-300 hover:text-white transition text-sm">← Siteye Dön</a>
                </div>
            </div>

            <!-- Row 2: Tabs & Actions -->
            <div class="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
                <!-- Sekmeler -->
                <div class="flex bg-white/10 rounded-lg p-1 gap-1">
                    <button
                        onclick="AdminView.showSection('projects')"
                        data-section="projects"
                        class="admin-tab-btn px-4 py-1.5 rounded-md text-sm font-bold transition active bg-white/20"
                    >
                        📚 Dersler
                    </button>
                    <button
                        onclick="AdminView.showSection('phases')"
                        data-section="phases"
                        class="admin-tab-btn px-4 py-1.5 rounded-md text-sm font-bold transition text-gray-300 hover:text-white"
                    >
                        📁 Fazlar
                    </button>
                    <button
                        onclick="AdminView.showSection('components')"
                        data-section="components"
                        class="admin-tab-btn px-4 py-1.5 rounded-md text-sm font-bold transition text-gray-300 hover:text-white"
                    >
                        🔧 Devre Elemanları
                    </button>
                </div>

                <!-- Aksiyonlar -->
                <div class="flex items-center gap-2">
                    <button
                        onclick="admin.undo()"
                        id="btn-undo"
                        class="hidden bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded font-bold transition text-sm"
                        title="Son silinen öğeyi geri al"
                    >
                        ↩️ Geri Al
                    </button>
                    <button
                        onclick="admin.downloadBackup()"
                        class="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded font-bold transition text-sm"
                        title="Tüm verileri JSON olarak indir"
                    >
                        📥 Yedekle
                    </button>
                    <button
                        onclick="admin.saveData()"
                        class="bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded font-bold transition text-sm"
                    >
                        💾 Kaydet
                    </button>
                    <button
                        onclick="AdminView.handleLogout()"
                        class="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded font-bold transition text-sm"
                        title="Çıkış Yap"
                    >
                        🚪
                    </button>
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
        const emailEl = document.getElementById('admin-user-email');
        if (emailEl && window.Auth && Auth.currentUser) {
            emailEl.textContent = Auth.currentUser.email;
        }
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

// NOT: AdminView.handleLogout bağlaması AdminView.js içinde yapılıyor
// Çünkü AdminLayout, AdminView'den önce yükleniyor

window.AdminLayout = AdminLayout;
