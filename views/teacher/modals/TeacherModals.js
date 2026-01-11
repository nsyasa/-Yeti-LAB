/**
 * TeacherModals - Tüm modal HTML template'leri
 * Teacher panel için modal bileşenleri
 */
const TeacherModals = {
    /**
     * Tüm modalları render et
     */
    renderAll() {
        return `
            ${this.createClassroomModal()}
            ${this.viewClassroomModal()}
            ${this.addStudentModal()}
            ${this.bulkAddModal()}
            ${this.classroomSettingsModal()}
            ${this.editStudentModal()}
            ${this.studentDetailModal()}
        `;
    },

    /**
     * Sınıf oluşturma modalı
     */
    createClassroomModal() {
        return `
            <div id="createClassroomModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <h3 class="text-xl font-bold mb-4">🏫 Yeni Sınıf Oluştur</h3>
                    <form id="createClassroomForm" onsubmit="TeacherManager.createClassroom(event)">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Sınıf Adı</label>
                            <input type="text" id="classroomName" required maxlength="100"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Örn: 5-A Robotik Kulübü" />
                        </div>
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Açıklama (Opsiyonel)</label>
                            <textarea id="classroomDescription" rows="2"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Sınıf hakkında kısa bir açıklama..."></textarea>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="TeacherManager.closeModal('createClassroomModal')"
                                class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                İptal
                            </button>
                            <button type="submit"
                                class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                                Oluştur
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Sınıf görüntüleme modalı
     */
    viewClassroomModal() {
        return `
            <div id="viewClassroomModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="flex justify-between items-start mb-4">
                        <h3 id="viewClassroomName" class="text-xl font-bold">Sınıf Adı</h3>
                        <button onclick="TeacherManager.closeModal('viewClassroomModal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <div class="mb-6">
                        <p class="text-gray-600 dark:text-gray-400 mb-4">Öğrenciler bu kod ile sınıfa katılabilir:</p>
                        <div id="viewClassroomCode" class="code-box" onclick="TeacherManager.copyCode(this)">XXXXX</div>
                        <p class="text-center text-sm text-gray-500 mt-2">Kodu kopyalamak için tıklayın</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="TeacherManager.closeModal('viewClassroomModal')"
                            class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                            Kapat
                        </button>
                        <button onclick="TeacherManager.shareClassroomCode()"
                            class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                            <span>📤</span> Paylaş
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Öğrenci ekleme modalı
     */
    addStudentModal() {
        return `
            <div id="addStudentModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold">👨‍🎓 Öğrenci Ekle</h3>
                        <button onclick="TeacherManager.closeModal('addStudentModal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <form id="addStudentForm" onsubmit="TeacherManager.addStudent(event)">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Sınıf</label>
                            <select id="newStudentClassroom" required
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="">Sınıf seçin...</option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Öğrenci Adı</label>
                            <input type="text" id="studentName" required maxlength="50"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Örn: Ahmet Yılmaz" />
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Şifre (Opsiyonel)</label>
                            <div class="flex gap-2">
                                <input type="text" id="studentPassword" maxlength="20"
                                    class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Boş bırakılabilir" />
                                <button type="button" onclick="document.getElementById('studentPassword').value = TeacherManager.generateRandomPassword()"
                                    class="px-4 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xl"
                                    title="Rastgele Şifre Oluştur">
                                    🎲
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Öğrenci girişte ismini seçtikten sonra bu şifreyi girecek</p>
                        </div>
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Avatar</label>
                            <div class="flex flex-wrap gap-2" id="avatarSelector">
                                ${this.renderAvatarButtons()}
                            </div>
                            <input type="hidden" id="selectedAvatar" value="🎓" />
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="TeacherManager.closeModal('addStudentModal')"
                                class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                İptal
                            </button>
                            <button type="submit" id="addStudentBtn"
                                class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                                Öğrenci Ekle
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Avatar butonları helper
     */
    renderAvatarButtons() {
        const avatars = ['🎓', '👦', '👧', '🧑', '👨‍🎓', '👩‍🎓', '🤖', '🦸'];
        return avatars
            .map(
                (emoji, i) => `
            <button type="button" onclick="TeacherManager.selectAvatar('${emoji}')"
                class="avatar-btn text-2xl p-2 rounded-lg border-2 ${i === 0 ? 'border-theme bg-theme/10 selected' : 'border-gray-200'} hover:border-theme transition-colors"
                data-emoji="${emoji}">
                ${emoji}
            </button>
        `
            )
            .join('');
    },

    /**
     * Toplu öğrenci ekleme modalı
     */
    bulkAddModal() {
        return `
            <div id="bulkAddModal" class="modal-overlay hidden">
                <div class="modal-content" style="max-width: 800px; max-height: 85vh; overflow-y: auto;">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold">📋 Toplu Öğrenci Ekle</h3>
                        <button onclick="TeacherManager.closeModal('bulkAddModal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    <!-- Step 1: Input -->
                    <div id="bulkStep1">
                        <p class="text-gray-600 mb-4">Her satıra bir öğrenci ismi gelecek şekilde listeyi yapıştırın.</p>

                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Sınıf Seçin</label>
                            <select id="bulkStudentClassroom"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="">Sınıf seçin...</option>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Öğrenci Listesi</label>
                            <textarea id="bulkStudentList" rows="10"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Ahmet Yılmaz&#10;Ayşe Demir&#10;Mehmet Kaya..."></textarea>
                        </div>

                        <div class="mb-6">
                            <label class="flex items-center gap-3 cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <input type="checkbox" id="bulkGeneratePassword" class="w-5 h-5 text-theme rounded focus:ring-theme" checked />
                                <div>
                                    <span class="font-bold text-gray-800 dark:text-white">🔒 Otomatik Şifre Oluştur</span>
                                    <p class="text-sm text-gray-500">Her öğrenci için 6 haneli rastgele şifre oluşturulur</p>
                                </div>
                            </label>
                        </div>

                        <button onclick="TeacherManager.previewBulkStudents()"
                            class="w-full py-4 bg-theme text-white rounded-xl font-bold hover:brightness-110 transition-all">
                            Önizle ve Devam Et →
                        </button>
                    </div>

                    <!-- Step 2: Preview & Confirm -->
                    <div id="bulkStep2" class="hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-bold text-lg">Önizleme (<span id="bulkCount">0</span> öğrenci)</h4>
                            <button onclick="TeacherManager.copyBulkList()" class="text-theme hover:underline text-sm font-bold flex items-center gap-1">
                                📋 Listeyi Kopyala
                            </button>
                        </div>

                        <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 max-h-[400px] overflow-y-auto border border-gray-200 dark:border-gray-700">
                            <table class="w-full text-left text-sm">
                                <thead class="text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th class="pb-2">Öğrenci Adı</th>
                                        <th class="pb-2">Şifre</th>
                                        <th class="pb-2">Avatar</th>
                                    </tr>
                                </thead>
                                <tbody id="bulkPreviewTable" class="divide-y divide-gray-200 dark:divide-gray-700">
                                    <!-- Preview items -->
                                </tbody>
                            </table>
                        </div>

                        <div class="flex gap-3">
                            <button onclick="TeacherManager.resetBulkForm()"
                                class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                ← Geri Dön
                            </button>
                            <button onclick="TeacherManager.saveBulkStudents()" id="saveBulkBtn"
                                class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                                Onayla ve Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Sınıf ayarları modalı
     */
    classroomSettingsModal() {
        return `
            <div id="classroomSettingsModal" class="modal-overlay hidden">
                <div class="modal-content" style="max-width: 600px; max-height: 85vh; overflow-y: auto;">
                    <div class="flex justify-between items-start mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10 border-b border-gray-100 dark:border-gray-700">
                        <h3 class="text-xl font-bold">⚙️ Sınıf Ayarları</h3>
                        <button onclick="TeacherManager.closeModal('classroomSettingsModal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <form id="classroomSettingsForm" onsubmit="TeacherManager.saveClassroomSettings(event)" class="px-1">
                        <input type="hidden" id="settingsClassroomId" />
                        
                        <!-- Temel Bilgiler -->
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Sınıf Adı</label>
                            <input type="text" id="settingsClassroomName" required maxlength="100"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Açıklama</label>
                            <textarea id="settingsClassroomDescription" rows="2"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                        </div>
                        <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="settingsRequirePassword" class="w-5 h-5 text-theme rounded focus:ring-theme" />
                                <div>
                                    <span class="font-medium text-gray-700 dark:text-gray-300">🔒 Şifre Gerekli</span>
                                    <p class="text-xs text-gray-500">Öğrencilerin giriş yaparken şifre girmesini iste</p>
                                </div>
                            </label>
                        </div>

                        <!-- Tab Ayarları Bölümü (Açılır/Kapanır) -->
                        <details class="mb-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                            <summary class="cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
                                <span class="text-lg">📑</span>
                                <span>Tab Ayarları (İsteğe Bağlı)</span>
                                <span class="ml-auto text-xs text-gray-400">Ders sayfası tablarını özelleştir</span>
                            </summary>
                            <div class="p-4 pt-2 space-y-2 max-h-56 overflow-y-auto">
                                <!-- Genel Tab -->
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input type="checkbox" id="tabVisGeneral" checked class="w-4 h-4 text-theme rounded focus:ring-theme flex-shrink-0" />
                                    <input type="text" id="tabNameGeneral" value="Genel" maxlength="20"
                                        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <span class="text-gray-400 text-sm">📋</span>
                                </div>
                                <!-- İçerik Tab -->
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input type="checkbox" id="tabVisContent" checked class="w-4 h-4 text-theme rounded focus:ring-theme flex-shrink-0" />
                                    <input type="text" id="tabNameContent" value="İçerik" maxlength="20"
                                        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <span class="text-gray-400 text-sm">📖</span>
                                </div>
                                <!-- Donanım Tab -->
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input type="checkbox" id="tabVisHardware" checked class="w-4 h-4 text-theme rounded focus:ring-theme flex-shrink-0" />
                                    <input type="text" id="tabNameHardware" value="Donanım" maxlength="20"
                                        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <span class="text-gray-400 text-sm">🔧</span>
                                </div>
                                <!-- Devre Tab -->
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input type="checkbox" id="tabVisCircuit" checked class="w-4 h-4 text-theme rounded focus:ring-theme flex-shrink-0" />
                                    <input type="text" id="tabNameCircuit" value="Devre" maxlength="20"
                                        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <span class="text-gray-400 text-sm">⚡</span>
                                </div>
                                <!-- Kod Tab -->
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input type="checkbox" id="tabVisCode" checked class="w-4 h-4 text-theme rounded focus:ring-theme flex-shrink-0" />
                                    <input type="text" id="tabNameCode" value="Kod" maxlength="20"
                                        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <span class="text-gray-400 text-sm">💻</span>
                                </div>
                                <!-- Test Tab -->
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <input type="checkbox" id="tabVisTest" checked class="w-4 h-4 text-theme rounded focus:ring-theme flex-shrink-0" />
                                    <input type="text" id="tabNameTest" value="Test" maxlength="20"
                                        class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    <span class="text-gray-400 text-sm">✅</span>
                                </div>
                            </div>
                        </details>

                        <div class="flex gap-3 sticky bottom-0 bg-white dark:bg-gray-800 py-3 border-t border-gray-100 dark:border-gray-700 -mx-1 px-1">
                            <button type="button" onclick="TeacherManager.closeModal('classroomSettingsModal')"
                                class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                İptal
                            </button>
                            <button type="submit"
                                class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Öğrenci düzenleme modalı
     */
    editStudentModal() {
        return `
            <div id="editStudentModal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold">✏️ Öğrenci Düzenle</h3>
                        <button onclick="TeacherManager.closeModal('editStudentModal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <form id="editStudentForm" onsubmit="TeacherManager.saveStudentEdit(event)">
                        <input type="hidden" id="editStudentId" />
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Öğrenci Adı</label>
                            <input type="text" id="editStudentName" required maxlength="50"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Öğrenci adı" />
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                <span class="flex items-center gap-2">
                                    🔒 Şifre
                                    <span id="editPasswordStatus" class="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"></span>
                                </span>
                            </label>
                            <input type="text" id="editStudentPassword" maxlength="20"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Yeni şifre (boş bırakırsanız değişmez)" />
                            <p class="text-xs text-gray-500 mt-1">Şifreyi değiştirmek için yeni şifre yazın</p>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Avatar</label>
                            <div class="flex flex-wrap gap-2" id="editAvatarSelector">
                                ${this.renderEditAvatarButtons()}
                            </div>
                            <input type="hidden" id="editSelectedAvatar" value="🎓" />
                        </div>
                        <div class="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="editRemovePassword" class="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
                                <div>
                                    <span class="font-medium text-yellow-800 dark:text-yellow-200">🗑️ Şifreyi Kaldır</span>
                                    <p class="text-xs text-yellow-600 dark:text-yellow-400">Öğrencinin şifresini tamamen sil</p>
                                </div>
                            </label>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="TeacherManager.closeModal('editStudentModal')"
                                class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                İptal
                            </button>
                            <button type="submit" id="saveStudentEditBtn"
                                class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    renderEditAvatarButtons() {
        const avatars = ['🎓', '👦', '👧', '🧑', '👨‍🎓', '👩‍🎓', '🤖', '🦸'];
        return avatars
            .map(
                (emoji) => `
            <button type="button" onclick="TeacherManager.selectEditAvatar('${emoji}')"
                class="edit-avatar-btn text-2xl p-2 rounded-lg border-2 border-gray-200 hover:border-theme transition-colors"
                data-emoji="${emoji}">
                ${emoji}
            </button>
        `
            )
            .join('');
    },

    /**
     * Öğrenci detay modalı
     */
    studentDetailModal() {
        return `
            <div id="studentDetailModal" class="modal-overlay hidden">
                <div class="modal-content" style="max-width: 600px; max-height: 85vh; overflow-y: auto;">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <span id="detailStudentAvatar" class="text-4xl">🎓</span>
                            <div>
                                <h3 id="detailStudentName" class="text-xl font-bold">Öğrenci Adı</h3>
                                <p id="detailStudentClass" class="text-gray-500 text-sm">Sınıf</p>
                            </div>
                        </div>
                        <button onclick="TeacherManager.closeModal('studentDetailModal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    <!-- Student Stats -->
                    <div class="grid grid-cols-3 gap-3 mb-6">
                        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                            <div class="text-2xl font-bold text-green-600" id="detailCompletedCount">0</div>
                            <div class="text-xs text-green-700 dark:text-green-400">Tamamlanan</div>
                        </div>
                        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
                            <div class="text-2xl font-bold text-yellow-600" id="detailAvgScore">0%</div>
                            <div class="text-xs text-yellow-700 dark:text-yellow-400">Ort. Quiz</div>
                        </div>
                        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                            <div class="text-2xl font-bold text-blue-600" id="detailLastActive">-</div>
                            <div class="text-xs text-blue-700 dark:text-blue-400">Son Aktif</div>
                        </div>
                    </div>

                    <!-- Course Progress -->
                    <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-3">📊 Kurs İlerlemesi</h4>
                    <div id="detailCourseProgress" class="space-y-3 mb-6 max-h-48 overflow-y-auto">
                        <!-- Course progress bars will be loaded here -->
                    </div>

                    <!-- Recent Lessons -->
                    <h4 class="font-bold text-gray-700 dark:text-gray-300 mb-3">📝 Son Tamamlanan Dersler</h4>
                    <div id="detailRecentLessons" class="space-y-2 max-h-48 overflow-y-auto">
                        <!-- Recent lessons will be loaded here -->
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="TeacherManager.closeModal('studentDetailModal')"
                            class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                            Kapat
                        </button>
                        <button type="button" onclick="TeacherManager.openEditStudentFromDetail()"
                            class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                            <span>✏️</span> Düzenle
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
};

window.TeacherModals = TeacherModals;
