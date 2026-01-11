/**
 * AssignmentModals - Ödev oluşturma, düzenleme ve gönderi modalları
 * Teacher panel için modal bileşenleri
 */
const AssignmentModals = {
    currentAssignment: null,
    classrooms: [],
    courses: [],
    rubricItems: [],
    richEditor: null,

    /**
     * Tüm ödev modallarını render et
     */
    renderAll() {
        return `
            ${this.createEditModal()}
            ${this.submissionsModal()}
            ${this.gradeModal()}
            ${this.bulkAssignModal()}
        `;
    },

    /**
     * Toplu ödev atama modalı - Öğrenci seçimi ile
     */
    bulkAssignModal() {
        return `
            <div id="bulkAssignModal" class="modal-overlay hidden">
                <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700 z-10">
                        <div>
                            <h3 id="bulkAssignTitle" class="text-xl font-bold text-gray-800 dark:text-white">📋 Ödev Ata</h3>
                            <p id="bulkAssignSubtitle" class="text-sm text-gray-500 mt-1">Öğrencileri seçin ve ödev atayın</p>
                        </div>
                        <button onclick="AssignmentModals.close('bulkAssignModal')" 
                            class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                    
                    <!-- Sınıf Filtresi -->
                    <div class="mb-4">
                        <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Sınıf Seçin</label>
                        <select id="bulkAssignClassroomFilter"
                            onchange="AssignmentModals.loadStudentsForBulkAssign()"
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="">Sınıf seçin...</option>
                        </select>
                    </div>
                    
                    <!-- Select All / Deselect All -->
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <button onclick="AssignmentModals.selectAllStudents(true)" 
                                class="text-sm text-theme hover:underline font-medium">
                                ✓ Tümünü Seç
                            </button>
                            <span class="text-gray-300">|</span>
                            <button onclick="AssignmentModals.selectAllStudents(false)" 
                                class="text-sm text-gray-500 hover:underline">
                                Seçimi Kaldır
                            </button>
                        </div>
                        <span id="bulkAssignSelectedCount" class="text-sm text-gray-500">0 öğrenci seçili</span>
                    </div>
                    
                    <!-- Öğrenci Listesi (Checkbox ile) -->
                    <div id="bulkAssignStudentsList" class="border-2 border-gray-200 dark:border-gray-600 rounded-xl max-h-[300px] overflow-y-auto mb-6">
                        <div class="p-8 text-center text-gray-500">
                            Önce bir sınıf seçin
                        </div>
                    </div>
                    
                    <!-- Aksiyonlar -->
                    <div class="flex gap-3">
                        <button type="button" onclick="AssignmentModals.close('bulkAssignModal')"
                            class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                            İptal
                        </button>
                        <button type="button" onclick="AssignmentModals.confirmBulkAssign()"
                            id="bulkAssignConfirmBtn"
                            class="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled>
                            📋 Seçili Öğrencilere Ata
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Ödev oluşturma/düzenleme modalı
     */
    createEditModal() {
        return `
            <div id="assignmentFormModal" class="modal-overlay hidden">
                <div class="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 id="assignmentFormTitle" class="text-xl font-bold text-gray-800 dark:text-white">📋 Yeni Ödev</h3>
                        <button onclick="AssignmentModals.close('assignmentFormModal')" 
                            class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                    
                    <form id="assignmentForm" onsubmit="AssignmentModals.handleSubmit(event)">
                        <!-- Temel Bilgiler -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <!-- Sol Kolon -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                        Ödev Başlığı <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" id="assignmentTitle" name="title" required maxlength="200"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Örn: Scratch ile Animasyon Projesi" />
                                </div>

                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Sınıf</label>
                                    <select id="assignmentClassroom" name="classroom_id"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="">Sınıf seçin (opsiyonel)</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Kurs</label>
                                    <select id="assignmentCourse" name="course_id"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="">Kurs seçin (opsiyonel)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Sağ Kolon -->
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Ödev Tipi</label>
                                    <select id="assignmentType" name="assignment_type"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="project">🎯 Proje</option>
                                        <option value="homework">📚 Ödev</option>
                                        <option value="quiz">❓ Quiz</option>
                                        <option value="exam">📝 Sınav</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Son Teslim Tarihi</label>
                                    <input type="datetime-local" id="assignmentDueDate" name="due_date"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>

                                <div>
                                    <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Maksimum Puan</label>
                                    <input type="number" id="assignmentMaxPoints" name="max_points" 
                                        value="100" min="1" max="1000"
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        <!-- Kısa Açıklama -->
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Kısa Açıklama</label>
                            <textarea id="assignmentDescription" name="description" rows="2" maxlength="500"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Ödev hakkında kısa bir açıklama..."></textarea>
                        </div>

                        <!-- Detaylı Talimatlar (Rich Text) -->
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                Detaylı Talimatlar
                            </label>
                            <div id="assignmentInstructionsEditor" class="border-2 border-gray-200 rounded-xl overflow-hidden dark:border-gray-600">
                                <!-- Rich text editor buraya mount edilecek -->
                                <div id="assignmentRTEToolbar" class="rte-toolbar flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <button type="button" onclick="AssignmentModals.formatText('bold')" class="rte-btn p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Kalın">
                                        <strong>B</strong>
                                    </button>
                                    <button type="button" onclick="AssignmentModals.formatText('italic')" class="rte-btn p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="İtalik">
                                        <em>I</em>
                                    </button>
                                    <button type="button" onclick="AssignmentModals.formatText('underline')" class="rte-btn p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Altı Çizili">
                                        <u>U</u>
                                    </button>
                                    <span class="border-l border-gray-300 dark:border-gray-500 mx-1"></span>
                                    <button type="button" onclick="AssignmentModals.formatText('insertUnorderedList')" class="rte-btn p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Liste">
                                        •
                                    </button>
                                    <button type="button" onclick="AssignmentModals.formatText('insertOrderedList')" class="rte-btn p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Numaralı Liste">
                                        1.
                                    </button>
                                    <span class="border-l border-gray-300 dark:border-gray-500 mx-1"></span>
                                    <select onchange="AssignmentModals.formatHeading(this.value); this.value='';" 
                                        class="px-2 py-1 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-sm">
                                        <option value="">Başlık</option>
                                        <option value="h2">Başlık 2</option>
                                        <option value="h3">Başlık 3</option>
                                        <option value="p">Normal</option>
                                    </select>
                                </div>
                                <div id="assignmentInstructionsContent" 
                                    contenteditable="true"
                                    class="min-h-[200px] p-4 bg-white dark:bg-gray-800 dark:text-white focus:outline-none prose prose-sm max-w-none"
                                    placeholder="Ödev talimatlarını buraya yazın..."></div>
                            </div>
                            <input type="hidden" id="assignmentInstructions" name="instructions" />
                        </div>

                        <!-- Gelişmiş Ayarlar (Collapsible) -->
                        <details class="mb-6 border border-gray-200 dark:border-gray-600 rounded-xl">
                            <summary class="px-4 py-3 cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl">
                                ⚙️ Gelişmiş Ayarlar
                            </summary>
                            <div class="p-4 space-y-4 border-t border-gray-200 dark:border-gray-600">
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-700 dark:text-gray-300">Geç teslimlere izin ver</label>
                                    <input type="checkbox" id="assignmentAllowLate" name="allow_late_submission" checked
                                        class="w-5 h-5 text-theme rounded focus:ring-theme" />
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-700 dark:text-gray-300">Geç teslim ceza yüzdesi</label>
                                    <input type="number" id="assignmentLatePenalty" name="late_penalty_percent" 
                                        value="10" min="0" max="100"
                                        class="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center" />
                                </div>

                                <div class="flex items-center justify-between">
                                    <label class="text-gray-700 dark:text-gray-300">Maksimum deneme hakkı</label>
                                    <input type="number" id="assignmentMaxAttempts" name="max_attempts" 
                                        value="1" min="1" max="10"
                                        class="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center" />
                                </div>
                            </div>
                        </details>

                        <!-- Rubrik Bölümü -->
                        <details class="mb-6 border border-gray-200 dark:border-gray-600 rounded-xl">
                            <summary class="px-4 py-3 cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl">
                                📊 Değerlendirme Rubriği (Opsiyonel)
                            </summary>
                            <div class="p-4 border-t border-gray-200 dark:border-gray-600">
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Rubrik kriterleri ekleyerek öğrenci gönderilerini daha detaylı değerlendirebilirsiniz.
                                </p>
                                <div id="rubricItemsList" class="space-y-3 mb-4">
                                    <!-- Rubrik öğeleri buraya eklenecek -->
                                </div>
                                <button type="button" onclick="AssignmentModals.addRubricItem()"
                                    class="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-theme hover:text-theme transition-colors">
                                    + Kriter Ekle
                                </button>
                            </div>
                        </details>

                        <!-- Form Aksiyonları -->
                        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onclick="AssignmentModals.close('assignmentFormModal')"
                                class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                İptal
                            </button>
                            <button type="button" onclick="AssignmentModals.saveDraft()"
                                class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                                📝 Taslak Kaydet
                            </button>
                            <button type="submit"
                                class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                                🚀 Kaydet & Yayınla
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    /**
     * Gönderiler modalı
     */
    submissionsModal() {
        return `
            <div id="submissionsModal" class="modal-overlay hidden">
                <div class="modal-content max-w-5xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700 z-10">
                        <div>
                            <h3 id="submissionsModalTitle" class="text-xl font-bold text-gray-800 dark:text-white">📥 Öğrenci Gönderileri</h3>
                            <p id="submissionsModalSubtitle" class="text-sm text-gray-500 mt-1"></p>
                        </div>
                        <button onclick="AssignmentModals.close('submissionsModal')" 
                            class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>

                    <!-- Stats -->
                    <div id="submissionsStats" class="flex flex-wrap gap-3 mb-6">
                        <!-- Stats buraya yüklenecek -->
                    </div>

                    <!-- Submissions List -->
                    <div id="submissionsList" class="space-y-3">
                        <!-- Gönderiler buraya yüklenecek -->
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Notlandırma modalı
     */
    gradeModal() {
        return `
            <div id="gradeModal" class="modal-overlay hidden">
                <div class="modal-content max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">✏️ Gönderiyi Değerlendir</h3>
                            <p id="gradeStudentName" class="text-sm text-gray-500 mt-1"></p>
                        </div>
                        <button onclick="AssignmentModals.close('gradeModal')" 
                            class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>

                    <form id="gradeForm" onsubmit="AssignmentModals.handleGrade(event)">
                        <input type="hidden" id="gradeSubmissionId" name="submission_id" />
                        
                        <!-- Öğrenci Gönderisi -->
                        <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                            <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">📄 Gönderilen Dosyalar</h4>
                            <div id="gradeSubmissionFiles" class="space-y-2">
                                <!-- Dosyalar buraya -->
                            </div>
                            <div id="gradeSubmissionContent" class="mt-4 prose prose-sm dark:prose-invert max-w-none">
                                <!-- İçerik buraya -->
                            </div>
                        </div>

                        <!-- Rubrik Puanlama (varsa) -->
                        <div id="gradeRubricSection" class="mb-6 hidden">
                            <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">📊 Rubrik Değerlendirmesi</h4>
                            <div id="gradeRubricItems" class="space-y-4">
                                <!-- Rubrik kriterleri buraya -->
                            </div>
                        </div>

                        <!-- Puan -->
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                                Puan <span class="text-sm text-gray-500">(Max: <span id="gradeMaxPoints">100</span>)</span>
                            </label>
                            <input type="number" id="gradePoints" name="grade" required min="0"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-2xl font-bold text-center" />
                        </div>

                        <!-- Geri Bildirim -->
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Geri Bildirim</label>
                            <textarea id="gradeFeedback" name="feedback" rows="4"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Öğrenciye geri bildiriminizi yazın..."></textarea>
                        </div>

                        <!-- Aksiyonlar -->
                        <div class="flex gap-3">
                            <button type="button" onclick="AssignmentModals.requestRevision()"
                                class="flex-1 px-4 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-200 transition-colors">
                                🔄 Revizyon İste
                            </button>
                            <button type="submit"
                                class="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all">
                                ✅ Notlandır
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    // ==========================================
    // MODAL AKSİYONLARI
    // ==========================================

    /**
     * Yeni ödev modalını aç
     */
    openCreate(classrooms, courses) {
        this.currentAssignment = null;
        this.classrooms = classrooms || [];
        this.courses = courses || [];
        this.rubricItems = [];

        this.populateDropdowns();
        this.resetForm();

        document.getElementById('assignmentFormTitle').textContent = '📋 Yeni Ödev';
        this.open('assignmentFormModal');
    },

    /**
     * Düzenleme modalını aç
     */
    openEdit(assignment, classrooms, courses) {
        this.currentAssignment = assignment;
        this.classrooms = classrooms || [];
        this.courses = courses || [];
        this.rubricItems = assignment.rubric || [];

        this.populateDropdowns();
        this.populateForm(assignment);
        this.renderRubricItems();

        document.getElementById('assignmentFormTitle').textContent = '✏️ Ödevi Düzenle';
        this.open('assignmentFormModal');
    },

    /**
     * Gönderiler modalını aç
     */
    async openSubmissions(assignmentId) {
        this.open('submissionsModal');

        // Loading göster
        document.getElementById('submissionsList').innerHTML = `
            <div class="text-center py-8">
                <div class="teacher-spinner mx-auto mb-4"></div>
                <p class="text-gray-500">Gönderiler yükleniyor...</p>
            </div>
        `;

        try {
            const [assignment, submissions, stats] = await Promise.all([
                window.AssignmentService?.getAssignment(assignmentId),
                window.AssignmentService?.getSubmissions(assignmentId),
                window.AssignmentService?.getAssignmentStats(assignmentId),
            ]);

            this.currentAssignment = assignment;

            // Başlık güncelle
            document.getElementById('submissionsModalTitle').textContent =
                `📥 ${assignment?.title || 'Öğrenci Gönderileri'}`;
            document.getElementById('submissionsModalSubtitle').textContent =
                `${assignment?.classroom?.name || 'Sınıf belirtilmemiş'} • ${submissions?.length || 0} gönderi`;

            // Stats render
            this.renderSubmissionStats(stats);

            // Gönderileri render
            this.renderSubmissions(submissions);
        } catch (error) {
            console.error('[AssignmentModals] Load submissions error:', error);
            document.getElementById('submissionsList').innerHTML = `
                <div class="text-center py-8 text-red-500">
                    Gönderiler yüklenirken hata oluştu
                </div>
            `;
        }
    },

    /**
     * Notlandırma modalını aç
     */
    openGrade(submission) {
        document.getElementById('gradeSubmissionId').value = submission.id;
        document.getElementById('gradeStudentName').textContent = submission.student?.display_name || 'Öğrenci';
        document.getElementById('gradeMaxPoints').textContent = this.currentAssignment?.max_points || 100;
        document.getElementById('gradePoints').max = this.currentAssignment?.max_points || 100;
        document.getElementById('gradePoints').value = submission.grade || '';
        document.getElementById('gradeFeedback').value = submission.feedback || '';

        // Dosyaları göster
        const filesContainer = document.getElementById('gradeSubmissionFiles');
        if (submission.files && submission.files.length > 0) {
            filesContainer.innerHTML = submission.files
                .map(
                    (file) => `
                <a href="${file.file_url}" target="_blank" 
                    class="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors">
                    <span>📎</span>
                    <span class="text-sm text-theme hover:underline">${this.escapeHtml(file.file_name)}</span>
                    <span class="text-xs text-gray-400">(${this.formatFileSize(file.file_size)})</span>
                </a>
            `
                )
                .join('');
        } else {
            filesContainer.innerHTML = '<p class="text-sm text-gray-400">Dosya yüklenmemiş</p>';
        }

        // İçeriği göster
        const contentContainer = document.getElementById('gradeSubmissionContent');
        if (submission.content) {
            contentContainer.innerHTML = submission.content;
        } else {
            contentContainer.innerHTML = '<p class="text-sm text-gray-400 italic">Metin içeriği yok</p>';
        }

        // Rubrik varsa göster
        if (this.currentAssignment?.rubric && this.currentAssignment.rubric.length > 0) {
            document.getElementById('gradeRubricSection').classList.remove('hidden');
            this.renderGradeRubric(submission.rubric_scores);
        } else {
            document.getElementById('gradeRubricSection').classList.add('hidden');
        }

        this.open('gradeModal');
    },

    // ==========================================
    // FORM İŞLEMLERİ
    // ==========================================

    /**
     * Dropdown'ları doldur
     */
    populateDropdowns() {
        const classroomSelect = document.getElementById('assignmentClassroom');
        const courseSelect = document.getElementById('assignmentCourse');

        if (classroomSelect) {
            classroomSelect.innerHTML =
                '<option value="">Sınıf seçin (opsiyonel)</option>' +
                this.classrooms.map((c) => `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`).join('');
        }

        if (courseSelect) {
            courseSelect.innerHTML =
                '<option value="">Kurs seçin (opsiyonel)</option>' +
                this.courses.map((c) => `<option value="${c.id}">${this.escapeHtml(c.title)}</option>`).join('');
        }
    },

    /**
     * Formu sıfırla
     */
    resetForm() {
        const form = document.getElementById('assignmentForm');
        if (form) form.reset();

        const editor = document.getElementById('assignmentInstructionsContent');
        if (editor) editor.innerHTML = '';

        document.getElementById('rubricItemsList').innerHTML = '';
        this.rubricItems = [];
    },

    /**
     * Formu doldur (düzenleme için)
     */
    populateForm(assignment) {
        document.getElementById('assignmentTitle').value = assignment.title || '';
        document.getElementById('assignmentClassroom').value = assignment.classroom_id || '';
        document.getElementById('assignmentCourse').value = assignment.course_id || '';
        document.getElementById('assignmentType').value = assignment.assignment_type || 'project';
        document.getElementById('assignmentDescription').value = assignment.description || '';
        document.getElementById('assignmentMaxPoints').value = assignment.max_points || 100;
        document.getElementById('assignmentAllowLate').checked = assignment.allow_late_submission ?? true;
        document.getElementById('assignmentLatePenalty').value = assignment.late_penalty_percent || 10;
        document.getElementById('assignmentMaxAttempts').value = assignment.max_attempts || 1;

        // Due date
        if (assignment.due_date) {
            const date = new Date(assignment.due_date);
            document.getElementById('assignmentDueDate').value = date.toISOString().slice(0, 16);
        }

        // Instructions (rich text)
        const editor = document.getElementById('assignmentInstructionsContent');
        if (editor) {
            editor.innerHTML = assignment.instructions || '';
        }
    },

    /**
     * Form submit handler
     */
    async handleSubmit(event) {
        event.preventDefault();
        await this.saveAssignment('active');
    },

    /**
     * Taslak olarak kaydet
     */
    async saveDraft() {
        await this.saveAssignment('draft');
    },

    /**
     * Ödevi kaydet
     */
    async saveAssignment(status) {
        try {
            // Instructions'ı hidden input'a al
            const editor = document.getElementById('assignmentInstructionsContent');
            document.getElementById('assignmentInstructions').value = editor?.innerHTML || '';

            const formData = {
                title: document.getElementById('assignmentTitle').value.trim(),
                classroom_id: document.getElementById('assignmentClassroom').value || null,
                course_id: document.getElementById('assignmentCourse').value || null,
                assignment_type: document.getElementById('assignmentType').value,
                due_date: document.getElementById('assignmentDueDate').value || null,
                max_points: parseInt(document.getElementById('assignmentMaxPoints').value) || 100,
                description: document.getElementById('assignmentDescription').value.trim(),
                instructions: document.getElementById('assignmentInstructions').value,
                allow_late_submission: document.getElementById('assignmentAllowLate').checked,
                late_penalty_percent: parseInt(document.getElementById('assignmentLatePenalty').value) || 10,
                max_attempts: parseInt(document.getElementById('assignmentMaxAttempts').value) || 1,
                status: status,
                rubric: this.rubricItems,
            };

            if (!formData.title) {
                if (window.Toast) Toast.error('Ödev başlığı zorunludur');
                return;
            }

            let result;
            if (this.currentAssignment) {
                result = await window.AssignmentService?.updateAssignment(this.currentAssignment.id, formData);
            } else {
                result = await window.AssignmentService?.createAssignment(formData);
            }

            if (result) {
                const message = status === 'draft' ? 'Taslak kaydedildi' : 'Ödev kaydedildi ve yayınlandı!';
                if (window.Toast) Toast.success(message);
                this.close('assignmentFormModal');

                // Listeyi yenile
                if (window.AssignmentsSection) {
                    AssignmentsSection.loadData();
                }
            }
        } catch (error) {
            console.error('[AssignmentModals] Save error:', error);
            if (window.Toast) Toast.error('Kaydetme başarısız: ' + error.message);
        }
    },

    /**
     * Notlandırma handler
     */
    async handleGrade(event) {
        event.preventDefault();

        const submissionId = document.getElementById('gradeSubmissionId').value;
        const grade = parseFloat(document.getElementById('gradePoints').value);
        const feedback = document.getElementById('gradeFeedback').value.trim();

        if (isNaN(grade) || grade < 0) {
            if (window.Toast) Toast.error('Geçerli bir puan girin');
            return;
        }

        try {
            const rubricScores = this.collectRubricScores();

            await window.AssignmentService?.gradeSubmission(submissionId, {
                grade,
                feedback,
                rubric_scores: rubricScores,
            });

            if (window.Toast) Toast.success('Gönderi notlandırıldı!');
            this.close('gradeModal');

            // Gönderileri yenile
            if (this.currentAssignment) {
                this.openSubmissions(this.currentAssignment.id);
            }
        } catch (error) {
            console.error('[AssignmentModals] Grade error:', error);
            if (window.Toast) Toast.error('Notlandırma başarısız');
        }
    },

    /**
     * Revizyon iste
     */
    async requestRevision() {
        const submissionId = document.getElementById('gradeSubmissionId').value;
        const feedback = document.getElementById('gradeFeedback').value.trim();

        if (!feedback) {
            if (window.Toast) Toast.error('Lütfen revizyon için geri bildirim yazın');
            return;
        }

        try {
            await window.AssignmentService?.requestRevision(submissionId, feedback);
            if (window.Toast) Toast.success('Revizyon talebi gönderildi');
            this.close('gradeModal');

            if (this.currentAssignment) {
                this.openSubmissions(this.currentAssignment.id);
            }
        } catch (error) {
            console.error('[AssignmentModals] Revision error:', error);
            if (window.Toast) Toast.error('İşlem başarısız');
        }
    },

    // ==========================================
    // RUBRİK İŞLEMLERİ
    // ==========================================

    /**
     * Rubrik öğesi ekle
     */
    addRubricItem() {
        const item = {
            id: Date.now(),
            name: '',
            description: '',
            max_points: 10,
        };
        this.rubricItems.push(item);
        this.renderRubricItems();
    },

    /**
     * Rubrik öğesi sil
     */
    removeRubricItem(id) {
        this.rubricItems = this.rubricItems.filter((item) => item.id !== id);
        this.renderRubricItems();
    },

    /**
     * Rubrik öğelerini render et
     */
    renderRubricItems() {
        const container = document.getElementById('rubricItemsList');
        if (!container) return;

        if (this.rubricItems.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">Henüz kriter eklenmedi</p>';
            return;
        }

        container.innerHTML = this.rubricItems
            .map(
                (item, index) => `
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl" data-rubric-id="${item.id}">
                <div class="flex items-start gap-3">
                    <span class="text-lg font-bold text-gray-400">${index + 1}</span>
                    <div class="flex-1 space-y-3">
                        <input type="text" 
                            value="${this.escapeHtml(item.name)}"
                            onchange="AssignmentModals.updateRubricItem(${item.id}, 'name', this.value)"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                            placeholder="Kriter adı (örn: Kod kalitesi)" />
                        <textarea 
                            onchange="AssignmentModals.updateRubricItem(${item.id}, 'description', this.value)"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                            rows="2"
                            placeholder="Kriter açıklaması (opsiyonel)">${this.escapeHtml(item.description)}</textarea>
                        <div class="flex items-center gap-2">
                            <label class="text-sm text-gray-500">Maks. Puan:</label>
                            <input type="number" 
                                value="${item.max_points}"
                                onchange="AssignmentModals.updateRubricItem(${item.id}, 'max_points', parseInt(this.value))"
                                class="w-20 px-2 py-1 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm text-center"
                                min="1" max="100" />
                        </div>
                    </div>
                    <button type="button" onclick="AssignmentModals.removeRubricItem(${item.id})"
                        class="text-red-400 hover:text-red-600 text-xl">×</button>
                </div>
            </div>
        `
            )
            .join('');
    },

    /**
     * Rubrik öğesini güncelle
     */
    updateRubricItem(id, field, value) {
        const item = this.rubricItems.find((i) => i.id === id);
        if (item) {
            item[field] = value;
        }
    },

    /**
     * Notlandırma için rubrik render
     */
    renderGradeRubric(existingScores = {}) {
        const container = document.getElementById('gradeRubricItems');
        if (!container || !this.currentAssignment?.rubric) return;

        container.innerHTML = this.currentAssignment.rubric
            .map(
                (criterion) => `
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h5 class="font-medium text-gray-800 dark:text-white">${this.escapeHtml(criterion.criterion_name)}</h5>
                        ${criterion.criterion_description ? `<p class="text-xs text-gray-500">${this.escapeHtml(criterion.criterion_description)}</p>` : ''}
                    </div>
                    <span class="text-sm text-gray-500">/ ${criterion.max_points}</span>
                </div>
                <input type="number" 
                    data-criterion-id="${criterion.id}"
                    value="${existingScores?.[criterion.id] || ''}"
                    class="rubric-score-input w-full px-3 py-2 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-center"
                    min="0" max="${criterion.max_points}"
                    placeholder="Puan" />
            </div>
        `
            )
            .join('');
    },

    /**
     * Rubrik puanlarını topla
     */
    collectRubricScores() {
        const scores = {};
        document.querySelectorAll('.rubric-score-input').forEach((input) => {
            const criterionId = input.dataset.criterionId;
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                scores[criterionId] = value;
            }
        });
        return Object.keys(scores).length > 0 ? scores : null;
    },

    // ==========================================
    // RENDER HELPERS
    // ==========================================

    /**
     * Submission stats render
     */
    renderSubmissionStats(stats) {
        const container = document.getElementById('submissionsStats');
        if (!container || !stats) return;

        container.innerHTML = `
            <div class="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center gap-2">
                <span class="font-bold text-blue-700 dark:text-blue-400">${stats.total}</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">Toplam</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center gap-2">
                <span class="font-bold text-yellow-700 dark:text-yellow-400">${stats.submitted}</span>
                <span class="text-sm text-yellow-600 dark:text-yellow-400">Bekliyor</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center gap-2">
                <span class="font-bold text-green-700 dark:text-green-400">${stats.graded}</span>
                <span class="text-sm text-green-600 dark:text-green-400">Notlandırıldı</span>
            </div>
            ${
                stats.average_grade > 0
                    ? `
                <div class="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center gap-2">
                    <span class="font-bold text-purple-700 dark:text-purple-400">${stats.average_grade.toFixed(1)}</span>
                    <span class="text-sm text-purple-600 dark:text-purple-400">Ortalama</span>
                </div>
            `
                    : ''
            }
        `;
    },

    /**
     * Submissions listesini render
     */
    renderSubmissions(submissions) {
        const container = document.getElementById('submissionsList');
        if (!container) return;

        if (!submissions || submissions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-4xl mb-3">📭</div>
                    <p class="text-gray-500 dark:text-gray-400">Henüz gönderi yok</p>
                </div>
            `;
            return;
        }

        container.innerHTML = submissions
            .map((sub) => {
                const statusBadge = this.getSubmissionStatusBadge(sub.status);
                const submittedAt = window.AssignmentService?.formatDate(sub.submitted_at) || '-';

                return `
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-theme/20 flex items-center justify-center text-lg">
                            ${sub.student?.avatar_url || '👤'}
                        </div>
                        <div>
                            <p class="font-medium text-gray-800 dark:text-white">${this.escapeHtml(sub.student?.display_name || 'Öğrenci')}</p>
                            <p class="text-xs text-gray-500">${submittedAt}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        ${statusBadge}
                        ${
                            sub.grade !== null
                                ? `
                            <span class="font-bold text-lg ${sub.grade >= this.currentAssignment?.max_points * 0.6 ? 'text-green-600' : 'text-orange-600'}">
                                ${sub.grade}/${this.currentAssignment?.max_points || 100}
                            </span>
                        `
                                : ''
                        }
                        <button onclick='AssignmentModals.openGrade(${JSON.stringify(sub).replace(/'/g, "\\'")})'
                            class="px-4 py-2 bg-theme text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all">
                            ${sub.status === 'graded' ? '✏️ Düzenle' : '✅ Notlandır'}
                        </button>
                    </div>
                </div>
            `;
            })
            .join('');
    },

    /**
     * Submission status badge
     */
    getSubmissionStatusBadge(status) {
        const badges = {
            submitted:
                '<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">⏳ Bekliyor</span>',
            graded: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✅ Notlandı</span>',
            revision_requested:
                '<span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">🔄 Revizyon</span>',
            late: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">⏰ Geç</span>',
        };
        return badges[status] || badges.submitted;
    },

    // ==========================================
    // RİCH TEXT EDITOR
    // ==========================================

    /**
     * Metin formatlama
     */
    formatText(command) {
        document.execCommand(command, false, null);
        document.getElementById('assignmentInstructionsContent')?.focus();
    },

    /**
     * Başlık formatlama
     */
    formatHeading(tag) {
        if (!tag) return;
        document.execCommand('formatBlock', false, tag);
        document.getElementById('assignmentInstructionsContent')?.focus();
    },

    // ==========================================
    // UTILITY
    // ==========================================

    /**
     * Modal aç
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Modal kapat
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active', 'open');
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    // ==========================================
    // BULK ASSIGN FONKSİYONLARI
    // ==========================================

    selectedStudents: [],
    bulkAssignmentId: null,
    bulkStudentsList: [],

    /**
     * Bulk assign modalını aç
     */
    async openBulkAssign(assignmentId) {
        this.bulkAssignmentId = assignmentId;
        this.selectedStudents = [];
        this.bulkStudentsList = [];

        // Assignment bilgisini al
        const assignment = window.AssignmentsSection?.assignments?.find((a) => a.id === assignmentId);
        if (assignment) {
            document.getElementById('bulkAssignTitle').textContent = `📋 ${this.escapeHtml(assignment.title)}`;
            document.getElementById('bulkAssignSubtitle').textContent = 'Öğrencileri seçin ve ödev atayın';
        }

        // Sınıf dropdown'ını doldur
        const classrooms = window.AssignmentsSection?.classrooms || [];
        const select = document.getElementById('bulkAssignClassroomFilter');
        if (select) {
            select.innerHTML =
                '<option value="">Sınıf seçin...</option>' +
                classrooms.map((c) => `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`).join('');
        }

        // Öğrenci listesini sıfırla
        document.getElementById('bulkAssignStudentsList').innerHTML = `
            <div class="p-8 text-center text-gray-500">
                Önce bir sınıf seçin
            </div>
        `;

        this.updateBulkAssignUI();
        this.open('bulkAssignModal');
    },

    /**
     * Sınıfa göre öğrencileri yükle
     */
    async loadStudentsForBulkAssign() {
        const classroomId = document.getElementById('bulkAssignClassroomFilter')?.value;
        const container = document.getElementById('bulkAssignStudentsList');

        if (!classroomId) {
            container.innerHTML = '<div class="p-8 text-center text-gray-500">Önce bir sınıf seçin</div>';
            this.bulkStudentsList = [];
            this.selectedStudents = [];
            this.updateBulkAssignUI();
            return;
        }

        // Loading
        container.innerHTML = `
            <div class="p-8 text-center">
                <div class="teacher-spinner mx-auto mb-2"></div>
                <p class="text-gray-500 text-sm">Öğrenciler yükleniyor...</p>
            </div>
        `;

        try {
            // Supabase'den öğrencileri çek
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase not initialized');

            const { data: students, error } = await supabase
                .from('students')
                .select('id, display_name, avatar_emoji, classroom_id')
                .eq('classroom_id', classroomId)
                .order('display_name');

            if (error) throw error;

            this.bulkStudentsList = students || [];
            this.selectedStudents = [];

            if (this.bulkStudentsList.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center text-gray-500">
                        <div class="text-3xl mb-2">👨‍🎓</div>
                        <p>Bu sınıfta henüz öğrenci yok</p>
                    </div>
                `;
            } else {
                this.renderBulkStudentsList();
            }
        } catch (error) {
            console.error('[AssignmentModals] Load students error:', error);
            container.innerHTML = '<div class="p-8 text-center text-red-500">Öğrenciler yüklenirken hata oluştu</div>';
        }

        this.updateBulkAssignUI();
    },

    /**
     * Öğrenci listesini render et (checkbox ile)
     */
    renderBulkStudentsList() {
        const container = document.getElementById('bulkAssignStudentsList');
        if (!container) return;

        container.innerHTML = this.bulkStudentsList
            .map((student) => {
                const isSelected = this.selectedStudents.includes(student.id);
                const checkboxClass = isSelected
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600';

                // Check if already submitted for this assignment (green indicator)
                const isSubmitted = false; // TODO: Check from submissions data
                const submittedBadge = isSubmitted
                    ? '<span class="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✅ Gönderildi</span>'
                    : '';

                return `
                <label class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}"
                    onclick="AssignmentModals.toggleStudentSelection('${student.id}')">
                    <div class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checkboxClass}">
                        ${isSelected ? '<span class="text-xs">✓</span>' : ''}
                    </div>
                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                        ${student.avatar_emoji || '🎓'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-800 dark:text-white truncate">
                            ${this.escapeHtml(student.display_name)}
                        </p>
                        ${submittedBadge}
                    </div>
                </label>
            `;
            })
            .join('');
    },

    /**
     * Öğrenci seçimini toggle et
     */
    toggleStudentSelection(studentId) {
        const index = this.selectedStudents.indexOf(studentId);
        if (index > -1) {
            this.selectedStudents.splice(index, 1);
        } else {
            this.selectedStudents.push(studentId);
        }
        this.renderBulkStudentsList();
        this.updateBulkAssignUI();
    },

    /**
     * Tümünü seç / kaldır
     */
    selectAllStudents(selectAll) {
        if (selectAll) {
            this.selectedStudents = this.bulkStudentsList.map((s) => s.id);
        } else {
            this.selectedStudents = [];
        }
        this.renderBulkStudentsList();
        this.updateBulkAssignUI();
    },

    /**
     * UI güncelle (buton, sayaç)
     */
    updateBulkAssignUI() {
        const countEl = document.getElementById('bulkAssignSelectedCount');
        const btn = document.getElementById('bulkAssignConfirmBtn');

        if (countEl) {
            countEl.textContent = `${this.selectedStudents.length} öğrenci seçili`;
        }

        if (btn) {
            btn.disabled = this.selectedStudents.length === 0;
        }
    },

    /**
     * Bulk assign onayla ve kaydet
     */
    async confirmBulkAssign() {
        if (this.selectedStudents.length === 0) {
            if (window.Toast) Toast.warning('Lütfen en az bir öğrenci seçin');
            return;
        }

        const btn = document.getElementById('bulkAssignConfirmBtn');
        const originalText = btn?.innerHTML;

        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="teacher-spinner inline-block w-4 h-4 mr-2"></span> Atanıyor...';
            }

            // Supabase'e ödev atamalarını kaydet
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase not initialized');

            const assignments = this.selectedStudents.map((studentId) => ({
                assignment_id: this.bulkAssignmentId,
                student_id: studentId,
                status: 'pending',
                created_at: new Date().toISOString(),
            }));

            // Upsert - varsa güncelle, yoksa ekle
            const { error } = await supabase
                .from('student_assignments')
                .upsert(assignments, { onConflict: 'assignment_id,student_id' });

            if (error) throw error;

            if (window.Toast) {
                Toast.success(`${this.selectedStudents.length} öğrenciye ödev atandı!`);
            }

            this.close('bulkAssignModal');

            // Listeyi yenile
            if (window.AssignmentsSection) {
                AssignmentsSection.loadData();
            }
        } catch (error) {
            console.error('[AssignmentModals] Bulk assign error:', error);
            if (window.Toast) Toast.error('Ödev atama işlemi başarısız');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText || '📋 Seçili Öğrencilere Ata';
            }
        }
    },

    /**
     * HTML escape
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Dosya boyutu formatla
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    },
};

window.AssignmentModals = AssignmentModals;
