/**
 * StudentSubmissionModal - Ödev detay ve gönderim modalı
 * Öğrenci perspektifinden ödev görüntüleme ve dosya yükleme
 */
const StudentSubmissionModal = {
    currentAssignment: null,
    currentSubmission: null,
    uploadedFiles: [],
    isSubmitting: false,

    /**
     * Modal HTML'i
     */
    template() {
        return `
            <div id="studentSubmissionModal" class="modal-overlay">
                <div class="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700 z-10">
                        <div class="flex-1 min-w-0">
                            <h3 id="submissionModalTitle" class="text-xl font-bold text-gray-800 dark:text-white truncate">📋 Ödev</h3>
                            <div id="submissionModalMeta" class="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                                <!-- Meta bilgiler -->
                            </div>
                        </div>
                        <button onclick="StudentSubmissionModal.close()" 
                            class="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4">&times;</button>
                    </div>

                    <!-- Content -->
                    <div id="submissionModalContent">
                        <!-- Loading -->
                        <div class="flex flex-col items-center justify-center py-12">
                            <div class="teacher-spinner mb-4"></div>
                            <p class="text-gray-500">Yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Modalı aç
     */
    async open(assignmentId) {
        // Modal yoksa ekle
        if (!document.getElementById('studentSubmissionModal')) {
            document.body.insertAdjacentHTML('beforeend', this.template());
        }

        // Modalı göster
        document.getElementById('studentSubmissionModal').classList.add('active');
        document.body.style.overflow = 'hidden';

        // Yükle
        await this.loadAssignment(assignmentId);
    },

    /**
     * Modalı kapat
     */
    close() {
        const modal = document.getElementById('studentSubmissionModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        this.currentAssignment = null;
        this.currentSubmission = null;
        this.uploadedFiles = [];
    },

    /**
     * Ödev yükle
     */
    async loadAssignment(assignmentId) {
        const contentEl = document.getElementById('submissionModalContent');
        
        try {
            const assignment = await window.StudentSubmissionService?.getAssignmentDetail(assignmentId);
            if (!assignment) throw new Error('Ödev bulunamadı');

            this.currentAssignment = assignment;
            this.currentSubmission = assignment.current_submission;
            this.uploadedFiles = this.currentSubmission?.files || [];

            // Başlık güncelle
            document.getElementById('submissionModalTitle').textContent = assignment.title;
            
            // Meta güncelle
            const status = window.StudentSubmissionService?.getAssignmentStatus(assignment);
            const timeRemaining = window.StudentSubmissionService?.getTimeRemaining(assignment.due_date);
            const statusBadge = window.StudentSubmissionService?.getStatusBadgeHtml(status);

            document.getElementById('submissionModalMeta').innerHTML = `
                ${statusBadge}
                ${assignment.course ? `<span>📚 ${this.escapeHtml(assignment.course.title)}</span>` : ''}
                ${assignment.due_date ? `
                    <span class="${timeRemaining?.overdue ? 'text-red-500' : timeRemaining?.urgent ? 'text-orange-500' : ''}">
                        ⏰ ${timeRemaining?.text}
                    </span>
                ` : ''}
                <span>⭐ ${assignment.max_points} puan</span>
            `;

            // İçerik render
            this.renderContent(assignment, status);

        } catch (error) {
            console.error('[StudentSubmissionModal] Load error:', error);
            contentEl.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-4xl mb-3">❌</div>
                    <p class="text-red-500">Ödev yüklenirken hata oluştu</p>
                    <button onclick="StudentSubmissionModal.close()" class="mt-4 text-theme hover:underline">Kapat</button>
                </div>
            `;
        }
    },

    /**
     * İçerik render
     */
    renderContent(assignment, status) {
        const contentEl = document.getElementById('submissionModalContent');
        const submission = this.currentSubmission;
        const hasGrade = submission?.grade !== null && submission?.grade !== undefined;

        contentEl.innerHTML = `
            <!-- Ödev Açıklaması -->
            ${assignment.description ? `
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">📄 Açıklama</h4>
                    <p class="text-gray-600 dark:text-gray-400">${this.escapeHtml(assignment.description)}</p>
                </div>
            ` : ''}

            <!-- Talimatlar -->
            ${assignment.instructions ? `
                <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <h4 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">📋 Talimatlar</h4>
                    <div class="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-200">
                        ${assignment.instructions}
                    </div>
                </div>
            ` : ''}

            <!-- Değerlendirme Kriterleri -->
            ${assignment.rubric && assignment.rubric.length > 0 ? `
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 Değerlendirme Kriterleri</h4>
                    <div class="grid gap-2">
                        ${assignment.rubric.map(r => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <span class="font-medium text-gray-800 dark:text-white">${this.escapeHtml(r.criterion_name)}</span>
                                    ${r.criterion_description ? `<p class="text-xs text-gray-500 mt-0.5">${this.escapeHtml(r.criterion_description)}</p>` : ''}
                                </div>
                                <span class="text-sm font-bold text-theme">${r.max_points} puan</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Not ve Geri Bildirim (varsa) -->
            ${hasGrade ? `
                <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-green-800 dark:text-green-300">✅ Değerlendirme Sonucu</h4>
                        <div class="text-2xl font-bold ${submission.grade >= assignment.max_points * 0.6 ? 'text-green-600' : 'text-orange-600'}">
                            ${submission.grade} / ${assignment.max_points}
                        </div>
                    </div>
                    ${submission.feedback ? `
                        <div class="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p class="text-sm text-gray-700 dark:text-gray-300">${this.escapeHtml(submission.feedback)}</p>
                        </div>
                    ` : ''}
                    <p class="text-xs text-gray-500 mt-2">
                        Değerlendirilme: ${window.StudentSubmissionService?.formatDate(submission.graded_at)}
                    </p>
                </div>
            ` : ''}

            <!-- Revizyon Talebi (varsa) -->
            ${submission?.status === 'revision_requested' ? `
                <div class="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                    <h4 class="font-semibold text-orange-800 dark:text-orange-300 mb-2">🔄 Revizyon İstendi</h4>
                    ${submission.feedback ? `
                        <p class="text-sm text-orange-900 dark:text-orange-200 mb-3">${this.escapeHtml(submission.feedback)}</p>
                    ` : ''}
                    <p class="text-xs text-orange-600">Öğretmenin geri bildirimine göre ödevini düzenleyip tekrar gönderebilirsin.</p>
                </div>
            ` : ''}

            <!-- Gönderim Formu (gönderilebilirse) -->
            ${status?.canSubmit ? this.renderSubmissionForm() : ''}

            <!-- Önceki Gönderimler -->
            ${assignment.my_submissions && assignment.my_submissions.length > 0 && !status?.canSubmit ? `
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📜 Gönderim Geçmişi</h4>
                    <div class="space-y-2">
                        ${assignment.my_submissions.map(s => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                                <span class="text-gray-600 dark:text-gray-300">
                                    Deneme ${s.attempt_number} - ${window.StudentSubmissionService?.formatDate(s.submitted_at)}
                                </span>
                                <span class="${s.grade !== null ? 'font-bold text-green-600' : 'text-gray-400'}">
                                    ${s.grade !== null ? s.grade + ' puan' : 'Değerlendirilmedi'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        // Drag-drop alanını aktifleştir
        if (status?.canSubmit) {
            this.setupDropZone();
        }
    },

    /**
     * Gönderim formu
     */
    renderSubmissionForm() {
        const submission = this.currentSubmission;
        const assignment = this.currentAssignment;
        const maxAttempts = assignment?.max_attempts || 1;
        const currentAttempt = submission?.attempt_number || 1;

        return `
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    📤 Gönderim ${currentAttempt > 1 ? `(Deneme ${currentAttempt}/${maxAttempts})` : ''}
                </h4>

                <!-- Dosya Yükleme Alanı -->
                <div id="submissionDropZone" 
                    class="file-drop-zone border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center mb-4 cursor-pointer hover:border-theme transition-colors">
                    <div class="text-4xl mb-2">📁</div>
                    <p class="text-gray-600 dark:text-gray-400 mb-1">Dosyaları sürükleyip bırakın veya tıklayarak seçin</p>
                    <p class="text-xs text-gray-400">PDF, DOC, DOCX, PPTX, ZIP, PNG, JPG - Maks. 5MB</p>
                    <input type="file" id="submissionFileInput" class="hidden" multiple 
                        accept=".pdf,.doc,.docx,.pptx,.zip,.png,.jpg,.jpeg" />
                </div>

                <!-- Yüklenen Dosyalar -->
                <div id="submissionFilesList" class="space-y-2 mb-4">
                    ${this.renderUploadedFiles()}
                </div>

                <!-- Metin İçeriği (opsiyonel) -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        💬 Açıklama veya Not (opsiyonel)
                    </label>
                    <textarea id="submissionContent" rows="3"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Öğretmenine bir not bırakmak istersen buraya yazabilirsin...">${this.escapeHtml(submission?.content || '')}</textarea>
                </div>

                <!-- Aksiyonlar -->
                <div class="flex gap-3">
                    <button onclick="StudentSubmissionModal.saveDraft()"
                        class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        ${this.isSubmitting ? 'disabled' : ''}>
                        📝 Taslak Kaydet
                    </button>
                    <button onclick="StudentSubmissionModal.submitAssignment()"
                        class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-md"
                        ${this.isSubmitting ? 'disabled' : ''}>
                        ${this.isSubmitting ? '⏳ Gönderiliyor...' : '🚀 Gönder'}
                    </button>
                </div>

                <p class="text-xs text-gray-400 mt-3 text-center">
                    ⚠️ Gönderdikten sonra düzenleme yapamazsın. Emin ol!
                </p>
            </div>
        `;
    },

    /**
     * Yüklenen dosyaları render
     */
    renderUploadedFiles() {
        if (this.uploadedFiles.length === 0) return '';

        return this.uploadedFiles.map(file => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg">${this.getFileIcon(file.file_type)}</span>
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-800 dark:text-white truncate">${this.escapeHtml(file.file_name)}</p>
                        <p class="text-xs text-gray-400">${window.StudentSubmissionService?.formatFileSize(file.file_size)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <a href="${file.file_url}" target="_blank" 
                        class="text-theme hover:underline text-sm">Görüntüle</a>
                    <button onclick="StudentSubmissionModal.removeFile('${file.id}')"
                        class="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
            </div>
        `).join('');
    },

    /**
     * Drop zone kurulumu
     */
    setupDropZone() {
        const dropZone = document.getElementById('submissionDropZone');
        const fileInput = document.getElementById('submissionFileInput');
        if (!dropZone || !fileInput) return;

        // Tıklama
        dropZone.addEventListener('click', () => fileInput.click());

        // Dosya seçildi
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-theme', 'bg-theme/5');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-theme', 'bg-theme/5');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-theme', 'bg-theme/5');
            this.handleFiles(e.dataTransfer.files);
        });
    },

    /**
     * Dosyaları işle
     */
    async handleFiles(files) {
        if (!files || files.length === 0) return;

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'application/x-zip-compressed',
            'image/png',
            'image/jpeg'
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB

        // Önce taslak oluştur/güncelle
        if (!this.currentSubmission) {
            await this.saveDraft(true); // silent
        }

        for (const file of files) {
            // Validasyon
            if (!allowedTypes.includes(file.type)) {
                if (window.Toast) Toast.error(`${file.name}: Desteklenmeyen dosya türü`);
                continue;
            }
            if (file.size > maxSize) {
                if (window.Toast) Toast.error(`${file.name}: Dosya çok büyük (max 5MB)`);
                continue;
            }

            try {
                // Yükle
                const fileRecord = await window.StudentSubmissionService?.uploadFile(
                    this.currentSubmission.id,
                    file
                );

                if (fileRecord) {
                    this.uploadedFiles.push(fileRecord);
                    this.updateFilesList();
                    if (window.Toast) Toast.success(`${file.name} yüklendi`);
                }

            } catch (error) {
                console.error('File upload error:', error);
                if (window.Toast) Toast.error(`${file.name}: Yükleme başarısız`);
            }
        }
    },

    /**
     * Dosyayı sil
     */
    async removeFile(fileId) {
        if (!confirm('Bu dosyayı silmek istediğine emin misin?')) return;

        try {
            await window.StudentSubmissionService?.deleteFile(fileId);
            this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
            this.updateFilesList();
            if (window.Toast) Toast.success('Dosya silindi');
        } catch (error) {
            console.error('File delete error:', error);
            if (window.Toast) Toast.error('Dosya silinemedi');
        }
    },

    /**
     * Dosya listesini güncelle
     */
    updateFilesList() {
        const container = document.getElementById('submissionFilesList');
        if (container) {
            container.innerHTML = this.renderUploadedFiles();
        }
    },

    /**
     * Taslak kaydet
     */
    async saveDraft(silent = false) {
        try {
            const content = document.getElementById('submissionContent')?.value || '';

            const submission = await window.StudentSubmissionService?.saveSubmission({
                assignment_id: this.currentAssignment.id,
                content: content
            });

            this.currentSubmission = submission;

            if (!silent && window.Toast) {
                Toast.success('Taslak kaydedildi');
            }

            return submission;

        } catch (error) {
            console.error('Save draft error:', error);
            if (!silent && window.Toast) {
                Toast.error('Taslak kaydedilemedi');
            }
            throw error;
        }
    },

    /**
     * Ödevi gönder
     */
    async submitAssignment() {
        // Onay
        if (!confirm('Ödevi göndermek istediğine emin misin? Gönderdikten sonra düzenleme yapamazsın.')) {
            return;
        }

        this.isSubmitting = true;
        this.updateSubmitButton();

        try {
            // Önce taslağı kaydet
            const submission = await this.saveDraft(true);

            // Gönder
            await window.StudentSubmissionService?.submitAssignment(submission.id);

            if (window.Toast) Toast.success('Ödev başarıyla gönderildi! 🎉');
            
            // Modalı kapat
            this.close();

            // Listeyi yenile
            if (window.StudentAssignmentsSection) {
                StudentAssignmentsSection.loadData();
            }

        } catch (error) {
            console.error('Submit error:', error);
            if (window.Toast) Toast.error('Gönderim başarısız: ' + error.message);
        } finally {
            this.isSubmitting = false;
            this.updateSubmitButton();
        }
    },

    /**
     * Gönder butonunu güncelle
     */
    updateSubmitButton() {
        const btn = document.querySelector('#submissionModalContent button[onclick*="submitAssignment"]');
        if (btn) {
            btn.disabled = this.isSubmitting;
            btn.innerHTML = this.isSubmitting ? '⏳ Gönderiliyor...' : '🚀 Gönder';
        }
    },

    // ==========================================
    // YARDIMCI
    // ==========================================

    /**
     * Dosya ikonu
     */
    getFileIcon(mimeType) {
        if (!mimeType) return '📄';
        if (mimeType.includes('pdf')) return '📕';
        if (mimeType.includes('word')) return '📘';
        if (mimeType.includes('presentation')) return '📙';
        if (mimeType.includes('zip')) return '📦';
        if (mimeType.includes('image')) return '🖼️';
        return '📄';
    },

    /**
     * HTML escape
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.StudentSubmissionModal = StudentSubmissionModal;
