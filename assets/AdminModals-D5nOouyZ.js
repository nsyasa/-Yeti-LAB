const a={renderAll(){return`
            ${this.imagePickerModal()}
            ${this.confirmDeleteModal()}
            ${this.hotspotEditorModal()}
            ${this.quizEditorModal()}
            ${this.courseManagementModal()}
        `},imagePickerModal(){return`
            <div id="image-picker-modal" 
                 class="fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center"
                 onclick="if(event.target === this) ImageManager.closeModal()">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="font-bold text-lg">🖼️ Resim Seç</h3>
                        <button onclick="ImageManager.closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <div class="p-4">
                        <!-- Upload Area -->
                        <div class="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-theme transition">
                            <input type="file" id="image-upload-input" accept="image/*" class="hidden" 
                                   onchange="ImageManager.handleUpload(this.files)">
                            <label for="image-upload-input" class="cursor-pointer">
                                <span class="text-4xl">📤</span>
                                <p class="text-gray-600 mt-2">Yeni resim yüklemek için tıklayın veya sürükleyin</p>
                            </label>
                        </div>
                        
                        <!-- Image Grid -->
                        <div id="image-picker-grid" class="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[50vh] overflow-y-auto">
                            <!-- JS tarafından doldurulacak -->
                        </div>
                    </div>
                </div>
            </div>
        `},confirmDeleteModal(){return`
            <div id="confirm-delete-modal" 
                 class="fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center"
                 onclick="if(event.target === this) this.classList.add('hidden')">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                    <div class="text-center mb-4">
                        <span class="text-5xl">⚠️</span>
                        <h3 class="font-bold text-xl mt-2" id="delete-modal-title">Silmek istediğinize emin misiniz?</h3>
                        <p class="text-gray-500 mt-2" id="delete-modal-message">Bu işlem geri alınamaz.</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="document.getElementById('confirm-delete-modal').classList.add('hidden')"
                                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-lg transition">
                            İptal
                        </button>
                        <button id="delete-modal-confirm-btn"
                                class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition">
                            Sil
                        </button>
                    </div>
                </div>
            </div>
        `},hotspotEditorModal(){return`
            <div id="hotspot-editor-modal" 
                 class="fixed inset-0 bg-black/80 z-[100] hidden items-center justify-center p-4"
                 onclick="if(event.target === this) HotspotManager.closeEditor()">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b bg-gray-50">
                        <h3 class="font-bold text-lg">🎯 Hotspot Editörü</h3>
                        <div class="flex items-center gap-2">
                            <button onclick="HotspotManager.addHotspot()" 
                                    class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm">
                                + Yeni Hotspot
                            </button>
                            <button onclick="HotspotManager.closeEditor()" 
                                    class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                    </div>
                    <div class="flex-grow overflow-auto p-4">
                        <div class="grid grid-cols-2 gap-4 h-full">
                            <!-- Image Preview with Hotspots -->
                            <div class="relative bg-gray-100 rounded-lg overflow-hidden" id="hotspot-image-container">
                                <img id="hotspot-preview-image" src="" class="w-full h-auto" />
                                <div id="hotspot-markers-container" class="absolute inset-0"></div>
                            </div>
                            <!-- Hotspot List -->
                            <div class="space-y-2 overflow-y-auto" id="hotspot-list-container">
                                <!-- JS tarafından doldurulacak -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `},quizEditorModal(){return`
            <div id="quiz-editor-modal" 
                 class="fixed inset-0 bg-black/80 z-[100] hidden items-center justify-center p-4"
                 onclick="if(event.target === this) QuizManager.closeEditor()">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between p-4 border-b bg-gray-50">
                        <h3 class="font-bold text-lg">📝 Quiz Editörü</h3>
                        <div class="flex items-center gap-2">
                            <button onclick="QuizManager.addQuestion()" 
                                    class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm">
                                + Yeni Soru
                            </button>
                            <button onclick="QuizManager.closeEditor()" 
                                    class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                    </div>
                    <div class="flex-grow overflow-auto p-4" id="quiz-questions-container">
                        <!-- JS tarafından doldurulacak -->
                    </div>
                    <div class="p-4 border-t bg-gray-50 flex justify-end">
                        <button onclick="QuizManager.saveAndClose()" 
                                class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold">
                            💾 Kaydet ve Kapat
                        </button>
                    </div>
                </div>
            </div>
        `},courseManagementModal(){return`
            <div id="course-management-modal" 
                 class="fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center"
                 onclick="if(event.target === this) CourseManager.closeModal()">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                    <div class="flex items-center justify-between p-4 border-b">
                        <h3 class="font-bold text-lg">📚 Kurs Yönetimi</h3>
                        <button onclick="CourseManager.closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <div class="p-4 overflow-y-auto max-h-[60vh]" id="course-management-content">
                        <!-- JS tarafından doldurulacak -->
                    </div>
                </div>
            </div>
        `},show(t){const e=document.getElementById(t);e&&(e.classList.remove("hidden"),e.classList.add("flex"))},hide(t){const e=document.getElementById(t);e&&(e.classList.add("hidden"),e.classList.remove("flex"))},showConfirm(t,e,i){document.getElementById("confirm-delete-modal");const d=document.getElementById("delete-modal-title"),o=document.getElementById("delete-modal-message"),l=document.getElementById("delete-modal-confirm-btn");d&&(d.textContent=t),o&&(o.textContent=e),l&&(l.onclick=()=>{this.hide("confirm-delete-modal"),i&&i()}),this.show("confirm-delete-modal")}};window.AdminModals=a;
