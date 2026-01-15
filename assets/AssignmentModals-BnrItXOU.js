const i={currentAssignment:null,classrooms:[],courses:[],rubricItems:[],richEditor:null,renderAll(){return`
            ${this.createEditModal()}
            ${this.submissionsModal()}
            ${this.gradeModal()}
            ${this.bulkAssignModal()}
        `},bulkAssignModal(){return`
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
        `},createEditModal(){return`
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
        `},submissionsModal(){return`
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
        `},gradeModal(){return`
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
        `},openCreate(e,t){this.currentAssignment=null,this.classrooms=e||[],this.courses=t||[],this.rubricItems=[],this.populateDropdowns(),this.resetForm(),document.getElementById("assignmentFormTitle").textContent="📋 Yeni Ödev",this.open("assignmentFormModal")},openEdit(e,t,s){this.currentAssignment=e,this.classrooms=t||[],this.courses=s||[],this.rubricItems=e.rubric||[],this.populateDropdowns(),this.populateForm(e),this.renderRubricItems(),document.getElementById("assignmentFormTitle").textContent="✏️ Ödevi Düzenle",this.open("assignmentFormModal")},async openSubmissions(e){this.open("submissionsModal"),document.getElementById("submissionsList").innerHTML=`
            <div class="text-center py-8">
                <div class="teacher-spinner mx-auto mb-4"></div>
                <p class="text-gray-500">Gönderiler yükleniyor...</p>
            </div>
        `;try{const[t,s,r]=await Promise.all([window.AssignmentService?.getAssignment(e),window.AssignmentService?.getSubmissions(e),window.AssignmentService?.getAssignmentStats(e)]);this.currentAssignment=t,document.getElementById("submissionsModalTitle").textContent=`📥 ${t?.title||"Öğrenci Gönderileri"}`,document.getElementById("submissionsModalSubtitle").textContent=`${t?.classroom?.name||"Sınıf belirtilmemiş"} • ${s?.length||0} gönderi`,this.renderSubmissionStats(r),this.renderSubmissions(s)}catch(t){console.error("[AssignmentModals] Load submissions error:",t),document.getElementById("submissionsList").innerHTML=`
                <div class="text-center py-8 text-red-500">
                    Gönderiler yüklenirken hata oluştu
                </div>
            `}},openGrade(e){document.getElementById("gradeSubmissionId").value=e.id,document.getElementById("gradeStudentName").textContent=e.student?.display_name||"Öğrenci",document.getElementById("gradeMaxPoints").textContent=this.currentAssignment?.max_points||100,document.getElementById("gradePoints").max=this.currentAssignment?.max_points||100,document.getElementById("gradePoints").value=e.grade||"",document.getElementById("gradeFeedback").value=e.feedback||"";const t=document.getElementById("gradeSubmissionFiles");e.files&&e.files.length>0?t.innerHTML=e.files.map(r=>`
                <a href="${r.file_url}" target="_blank" 
                    class="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors">
                    <span>📎</span>
                    <span class="text-sm text-theme hover:underline">${this.escapeHtml(r.file_name)}</span>
                    <span class="text-xs text-gray-400">(${this.formatFileSize(r.file_size)})</span>
                </a>
            `).join(""):t.innerHTML='<p class="text-sm text-gray-400">Dosya yüklenmemiş</p>';const s=document.getElementById("gradeSubmissionContent");e.content?s.innerHTML=e.content:s.innerHTML='<p class="text-sm text-gray-400 italic">Metin içeriği yok</p>',this.currentAssignment?.rubric&&this.currentAssignment.rubric.length>0?(document.getElementById("gradeRubricSection").classList.remove("hidden"),this.renderGradeRubric(e.rubric_scores)):document.getElementById("gradeRubricSection").classList.add("hidden"),this.open("gradeModal")},populateDropdowns(){const e=document.getElementById("assignmentClassroom"),t=document.getElementById("assignmentCourse");e&&(e.innerHTML='<option value="">Sınıf seçin (opsiyonel)</option>'+this.classrooms.map(s=>`<option value="${s.id}">${this.escapeHtml(s.name)}</option>`).join("")),t&&(t.innerHTML='<option value="">Kurs seçin (opsiyonel)</option>'+this.courses.map(s=>`<option value="${s.id}">${this.escapeHtml(s.title)}</option>`).join(""))},resetForm(){const e=document.getElementById("assignmentForm");e&&e.reset();const t=document.getElementById("assignmentInstructionsContent");t&&(t.innerHTML=""),document.getElementById("rubricItemsList").innerHTML="",this.rubricItems=[]},populateForm(e){if(document.getElementById("assignmentTitle").value=e.title||"",document.getElementById("assignmentClassroom").value=e.classroom_id||"",document.getElementById("assignmentCourse").value=e.course_id||"",document.getElementById("assignmentType").value=e.assignment_type||"project",document.getElementById("assignmentDescription").value=e.description||"",document.getElementById("assignmentMaxPoints").value=e.max_points||100,document.getElementById("assignmentAllowLate").checked=e.allow_late_submission??!0,document.getElementById("assignmentLatePenalty").value=e.late_penalty_percent||10,document.getElementById("assignmentMaxAttempts").value=e.max_attempts||1,e.due_date){const s=new Date(e.due_date);document.getElementById("assignmentDueDate").value=s.toISOString().slice(0,16)}const t=document.getElementById("assignmentInstructionsContent");t&&(t.innerHTML=e.instructions||"")},async handleSubmit(e){e.preventDefault(),await this.saveAssignment("active")},async saveDraft(){await this.saveAssignment("draft")},async saveAssignment(e){try{const t=document.getElementById("assignmentInstructionsContent");document.getElementById("assignmentInstructions").value=t?.innerHTML||"";const s={title:document.getElementById("assignmentTitle").value.trim(),classroom_id:document.getElementById("assignmentClassroom").value||null,course_id:document.getElementById("assignmentCourse").value||null,assignment_type:document.getElementById("assignmentType").value,due_date:document.getElementById("assignmentDueDate").value||null,max_points:parseInt(document.getElementById("assignmentMaxPoints").value)||100,description:document.getElementById("assignmentDescription").value.trim(),instructions:document.getElementById("assignmentInstructions").value,allow_late_submission:document.getElementById("assignmentAllowLate").checked,late_penalty_percent:parseInt(document.getElementById("assignmentLatePenalty").value)||10,max_attempts:parseInt(document.getElementById("assignmentMaxAttempts").value)||1,status:e,rubric:this.rubricItems};if(!s.title){window.Toast&&Toast.error("Ödev başlığı zorunludur");return}let r;if(this.currentAssignment?r=await window.AssignmentService?.updateAssignment(this.currentAssignment.id,s):r=await window.AssignmentService?.createAssignment(s),r){const n=e==="draft"?"Taslak kaydedildi":"Ödev kaydedildi ve yayınlandı!";window.Toast&&Toast.success(n),this.close("assignmentFormModal"),window.AssignmentsSection&&AssignmentsSection.loadData()}}catch(t){console.error("[AssignmentModals] Save error:",t),window.Toast&&Toast.error("Kaydetme başarısız: "+t.message)}},async handleGrade(e){e.preventDefault();const t=document.getElementById("gradeSubmissionId").value,s=parseFloat(document.getElementById("gradePoints").value),r=document.getElementById("gradeFeedback").value.trim();if(isNaN(s)||s<0){window.Toast&&Toast.error("Geçerli bir puan girin");return}try{const n=this.collectRubricScores();await window.AssignmentService?.gradeSubmission(t,{grade:s,feedback:r,rubric_scores:n}),window.Toast&&Toast.success("Gönderi notlandırıldı!"),this.close("gradeModal"),this.currentAssignment&&this.openSubmissions(this.currentAssignment.id)}catch(n){console.error("[AssignmentModals] Grade error:",n),window.Toast&&Toast.error("Notlandırma başarısız")}},async requestRevision(){const e=document.getElementById("gradeSubmissionId").value,t=document.getElementById("gradeFeedback").value.trim();if(!t){window.Toast&&Toast.error("Lütfen revizyon için geri bildirim yazın");return}try{await window.AssignmentService?.requestRevision(e,t),window.Toast&&Toast.success("Revizyon talebi gönderildi"),this.close("gradeModal"),this.currentAssignment&&this.openSubmissions(this.currentAssignment.id)}catch(s){console.error("[AssignmentModals] Revision error:",s),window.Toast&&Toast.error("İşlem başarısız")}},addRubricItem(){const e={id:Date.now(),name:"",description:"",max_points:10};this.rubricItems.push(e),this.renderRubricItems()},removeRubricItem(e){this.rubricItems=this.rubricItems.filter(t=>t.id!==e),this.renderRubricItems()},renderRubricItems(){const e=document.getElementById("rubricItemsList");if(e){if(this.rubricItems.length===0){e.innerHTML='<p class="text-sm text-gray-400 text-center py-4">Henüz kriter eklenmedi</p>';return}e.innerHTML=this.rubricItems.map((t,s)=>`
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl" data-rubric-id="${t.id}">
                <div class="flex items-start gap-3">
                    <span class="text-lg font-bold text-gray-400">${s+1}</span>
                    <div class="flex-1 space-y-3">
                        <input type="text" 
                            value="${this.escapeHtml(t.name)}"
                            onchange="AssignmentModals.updateRubricItem(${t.id}, 'name', this.value)"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                            placeholder="Kriter adı (örn: Kod kalitesi)" />
                        <textarea 
                            onchange="AssignmentModals.updateRubricItem(${t.id}, 'description', this.value)"
                            class="w-full px-3 py-2 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                            rows="2"
                            placeholder="Kriter açıklaması (opsiyonel)">${this.escapeHtml(t.description)}</textarea>
                        <div class="flex items-center gap-2">
                            <label class="text-sm text-gray-500">Maks. Puan:</label>
                            <input type="number" 
                                value="${t.max_points}"
                                onchange="AssignmentModals.updateRubricItem(${t.id}, 'max_points', parseInt(this.value))"
                                class="w-20 px-2 py-1 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm text-center"
                                min="1" max="100" />
                        </div>
                    </div>
                    <button type="button" onclick="AssignmentModals.removeRubricItem(${t.id})"
                        class="text-red-400 hover:text-red-600 text-xl">×</button>
                </div>
            </div>
        `).join("")}},updateRubricItem(e,t,s){const r=this.rubricItems.find(n=>n.id===e);r&&(r[t]=s)},renderGradeRubric(e={}){const t=document.getElementById("gradeRubricItems");!t||!this.currentAssignment?.rubric||(t.innerHTML=this.currentAssignment.rubric.map(s=>`
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h5 class="font-medium text-gray-800 dark:text-white">${this.escapeHtml(s.criterion_name)}</h5>
                        ${s.criterion_description?`<p class="text-xs text-gray-500">${this.escapeHtml(s.criterion_description)}</p>`:""}
                    </div>
                    <span class="text-sm text-gray-500">/ ${s.max_points}</span>
                </div>
                <input type="number" 
                    data-criterion-id="${s.id}"
                    value="${e?.[s.id]||""}"
                    class="rubric-score-input w-full px-3 py-2 border border-gray-200 rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white text-center"
                    min="0" max="${s.max_points}"
                    placeholder="Puan" />
            </div>
        `).join(""))},collectRubricScores(){const e={};return document.querySelectorAll(".rubric-score-input").forEach(t=>{const s=t.dataset.criterionId,r=parseFloat(t.value);isNaN(r)||(e[s]=r)}),Object.keys(e).length>0?e:null},renderSubmissionStats(e){const t=document.getElementById("submissionsStats");!t||!e||(t.innerHTML=`
            <div class="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center gap-2">
                <span class="font-bold text-blue-700 dark:text-blue-400">${e.total}</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">Toplam</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center gap-2">
                <span class="font-bold text-yellow-700 dark:text-yellow-400">${e.submitted}</span>
                <span class="text-sm text-yellow-600 dark:text-yellow-400">Bekliyor</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center gap-2">
                <span class="font-bold text-green-700 dark:text-green-400">${e.graded}</span>
                <span class="text-sm text-green-600 dark:text-green-400">Notlandırıldı</span>
            </div>
            ${e.average_grade>0?`
                <div class="px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center gap-2">
                    <span class="font-bold text-purple-700 dark:text-purple-400">${e.average_grade.toFixed(1)}</span>
                    <span class="text-sm text-purple-600 dark:text-purple-400">Ortalama</span>
                </div>
            `:""}
        `)},renderSubmissions(e){const t=document.getElementById("submissionsList");if(t){if(!e||e.length===0){t.innerHTML=`
                <div class="text-center py-12">
                    <div class="text-4xl mb-3">📭</div>
                    <p class="text-gray-500 dark:text-gray-400">Henüz gönderi yok</p>
                </div>
            `;return}t.innerHTML=e.map(s=>{const r=this.getSubmissionStatusBadge(s.status),n=window.AssignmentService?.formatDate(s.submitted_at)||"-";return`
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-theme/20 flex items-center justify-center text-lg">
                            ${s.student?.avatar_url||"👤"}
                        </div>
                        <div>
                            <p class="font-medium text-gray-800 dark:text-white">${this.escapeHtml(s.student?.display_name||"Öğrenci")}</p>
                            <p class="text-xs text-gray-500">${n}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        ${r}
                        ${s.grade!==null?`
                            <span class="font-bold text-lg ${s.grade>=this.currentAssignment?.max_points*.6?"text-green-600":"text-orange-600"}">
                                ${s.grade}/${this.currentAssignment?.max_points||100}
                            </span>
                        `:""}
                        <button onclick='AssignmentModals.openGrade(${JSON.stringify(s).replace(/'/g,"\\'")})'
                            class="px-4 py-2 bg-theme text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all">
                            ${s.status==="graded"?"✏️ Düzenle":"✅ Notlandır"}
                        </button>
                    </div>
                </div>
            `}).join("")}},getSubmissionStatusBadge(e){const t={submitted:'<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">⏳ Bekliyor</span>',graded:'<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✅ Notlandı</span>',revision_requested:'<span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">🔄 Revizyon</span>',late:'<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">⏰ Geç</span>'};return t[e]||t.submitted},formatText(e){document.execCommand(e,!1,null),document.getElementById("assignmentInstructionsContent")?.focus()},formatHeading(e){e&&(document.execCommand("formatBlock",!1,e),document.getElementById("assignmentInstructionsContent")?.focus())},open(e){const t=document.getElementById(e);t&&(t.classList.remove("hidden"),t.classList.add("active"),document.body.style.overflow="hidden")},close(e){const t=document.getElementById(e);t&&(t.classList.remove("active","open"),t.classList.add("hidden"),document.body.style.overflow="")},selectedStudents:[],bulkAssignmentId:null,bulkStudentsList:[],async openBulkAssign(e){this.bulkAssignmentId=e,this.selectedStudents=[],this.bulkStudentsList=[];const t=window.AssignmentsSection?.assignments?.find(n=>n.id===e);t&&(document.getElementById("bulkAssignTitle").textContent=`📋 ${this.escapeHtml(t.title)}`,document.getElementById("bulkAssignSubtitle").textContent="Öğrencileri seçin ve ödev atayın");const s=window.AssignmentsSection?.classrooms||[],r=document.getElementById("bulkAssignClassroomFilter");r&&(r.innerHTML='<option value="">Sınıf seçin...</option>'+s.map(n=>`<option value="${n.id}">${this.escapeHtml(n.name)}</option>`).join("")),document.getElementById("bulkAssignStudentsList").innerHTML=`
            <div class="p-8 text-center text-gray-500">
                Önce bir sınıf seçin
            </div>
        `,this.updateBulkAssignUI(),this.open("bulkAssignModal")},async loadStudentsForBulkAssign(){const e=document.getElementById("bulkAssignClassroomFilter")?.value,t=document.getElementById("bulkAssignStudentsList");if(!e){t.innerHTML='<div class="p-8 text-center text-gray-500">Önce bir sınıf seçin</div>',this.bulkStudentsList=[],this.selectedStudents=[],this.updateBulkAssignUI();return}t.innerHTML=`
            <div class="p-8 text-center">
                <div class="teacher-spinner mx-auto mb-2"></div>
                <p class="text-gray-500 text-sm">Öğrenciler yükleniyor...</p>
            </div>
        `;try{const s=window.SupabaseClient?.client;if(!s)throw new Error("Supabase not initialized");const{data:r,error:n}=await s.from("students").select("id, display_name, avatar_emoji, classroom_id").eq("classroom_id",e).order("display_name");if(n)throw n;this.bulkStudentsList=r||[],this.selectedStudents=[],this.bulkStudentsList.length===0?t.innerHTML=`
                    <div class="p-8 text-center text-gray-500">
                        <div class="text-3xl mb-2">👨‍🎓</div>
                        <p>Bu sınıfta henüz öğrenci yok</p>
                    </div>
                `:this.renderBulkStudentsList()}catch(s){console.error("[AssignmentModals] Load students error:",s),t.innerHTML='<div class="p-8 text-center text-red-500">Öğrenciler yüklenirken hata oluştu</div>'}this.updateBulkAssignUI()},renderBulkStudentsList(){const e=document.getElementById("bulkAssignStudentsList");e&&(e.innerHTML=this.bulkStudentsList.map(t=>{const s=this.selectedStudents.includes(t.id),r=s?"bg-emerald-500 border-emerald-500 text-white":"bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600";return`
                <label class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${s?"bg-emerald-50 dark:bg-emerald-900/20":""}"
                    onclick="AssignmentModals.toggleStudentSelection('${t.id}')">
                    <div class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${r}">
                        ${s?'<span class="text-xs">✓</span>':""}
                    </div>
                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                        ${t.avatar_emoji||"🎓"}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-800 dark:text-white truncate">
                            ${this.escapeHtml(t.display_name)}
                        </p>
                        
                    </div>
                </label>
            `}).join(""))},toggleStudentSelection(e){const t=this.selectedStudents.indexOf(e);t>-1?this.selectedStudents.splice(t,1):this.selectedStudents.push(e),this.renderBulkStudentsList(),this.updateBulkAssignUI()},selectAllStudents(e){e?this.selectedStudents=this.bulkStudentsList.map(t=>t.id):this.selectedStudents=[],this.renderBulkStudentsList(),this.updateBulkAssignUI()},updateBulkAssignUI(){const e=document.getElementById("bulkAssignSelectedCount"),t=document.getElementById("bulkAssignConfirmBtn");e&&(e.textContent=`${this.selectedStudents.length} öğrenci seçili`),t&&(t.disabled=this.selectedStudents.length===0)},async confirmBulkAssign(){if(this.selectedStudents.length===0){window.Toast&&Toast.warning("Lütfen en az bir öğrenci seçin");return}const e=document.getElementById("bulkAssignConfirmBtn"),t=e?.innerHTML;try{e&&(e.disabled=!0,e.innerHTML='<span class="teacher-spinner inline-block w-4 h-4 mr-2"></span> Atanıyor...');const s=window.SupabaseClient?.client;if(!s)throw new Error("Supabase not initialized");const r=this.selectedStudents.map(a=>({assignment_id:this.bulkAssignmentId,student_id:a,status:"pending",created_at:new Date().toISOString()})),{error:n}=await s.from("student_assignments").upsert(r,{onConflict:"assignment_id,student_id"});if(n)throw n;window.Toast&&Toast.success(`${this.selectedStudents.length} öğrenciye ödev atandı!`),this.close("bulkAssignModal"),window.AssignmentsSection&&AssignmentsSection.loadData()}catch(s){console.error("[AssignmentModals] Bulk assign error:",s),window.Toast&&Toast.error("Ödev atama işlemi başarısız")}finally{e&&(e.disabled=!1,e.innerHTML=t||"📋 Seçili Öğrencilere Ata")}},escapeHtml(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML},formatFileSize(e){if(!e)return"0 B";const t=["B","KB","MB","GB"],s=Math.floor(Math.log(e)/Math.log(1024));return(e/Math.pow(1024,s)).toFixed(1)+" "+t[s]}};window.AssignmentModals=i;
