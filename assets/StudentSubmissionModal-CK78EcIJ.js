const a={currentAssignment:null,currentSubmission:null,uploadedFiles:[],isSubmitting:!1,template(){return`
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
        `},async open(e){document.getElementById("studentSubmissionModal")||document.body.insertAdjacentHTML("beforeend",this.template()),document.getElementById("studentSubmissionModal").classList.add("active"),document.body.style.overflow="hidden",await this.loadAssignment(e)},close(){const e=document.getElementById("studentSubmissionModal");e&&(e.classList.remove("active"),document.body.style.overflow=""),this.currentAssignment=null,this.currentSubmission=null,this.uploadedFiles=[]},async loadAssignment(e){const i=document.getElementById("submissionModalContent");try{const t=await window.StudentSubmissionService?.getAssignmentDetail(e);if(!t)throw new Error("Ödev bulunamadı");this.currentAssignment=t,this.currentSubmission=t.current_submission,this.uploadedFiles=this.currentSubmission?.files||[],document.getElementById("submissionModalTitle").textContent=t.title;const s=window.StudentSubmissionService?.getAssignmentStatus(t),r=window.StudentSubmissionService?.getTimeRemaining(t.due_date),n=window.StudentSubmissionService?.getStatusBadgeHtml(s);document.getElementById("submissionModalMeta").innerHTML=`
                ${n}
                ${t.course?`<span>📚 ${this.escapeHtml(t.course.title)}</span>`:""}
                ${t.due_date?`
                    <span class="${r?.overdue?"text-red-500":r?.urgent?"text-orange-500":""}">
                        ⏰ ${r?.text}
                    </span>
                `:""}
                <span>⭐ ${t.max_points} puan</span>
            `,this.renderContent(t,s)}catch(t){console.error("[StudentSubmissionModal] Load error:",t),i.innerHTML=`
                <div class="text-center py-12">
                    <div class="text-4xl mb-3">❌</div>
                    <p class="text-red-500">Ödev yüklenirken hata oluştu</p>
                    <button onclick="StudentSubmissionModal.close()" class="mt-4 text-theme hover:underline">Kapat</button>
                </div>
            `}},renderContent(e,i){const t=document.getElementById("submissionModalContent"),s=this.currentSubmission,r=s?.grade!==null&&s?.grade!==void 0;t.innerHTML=`
            <!-- Ödev Açıklaması -->
            ${e.description?`
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">📄 Açıklama</h4>
                    <p class="text-gray-600 dark:text-gray-400">${this.escapeHtml(e.description)}</p>
                </div>
            `:""}

            <!-- Talimatlar -->
            ${e.instructions?`
                <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <h4 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">📋 Talimatlar</h4>
                    <div class="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-200">
                        ${e.instructions}
                    </div>
                </div>
            `:""}

            <!-- Değerlendirme Kriterleri -->
            ${e.rubric&&e.rubric.length>0?`
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 Değerlendirme Kriterleri</h4>
                    <div class="grid gap-2">
                        ${e.rubric.map(n=>`
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <span class="font-medium text-gray-800 dark:text-white">${this.escapeHtml(n.criterion_name)}</span>
                                    ${n.criterion_description?`<p class="text-xs text-gray-500 mt-0.5">${this.escapeHtml(n.criterion_description)}</p>`:""}
                                </div>
                                <span class="text-sm font-bold text-theme">${n.max_points} puan</span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `:""}

            <!-- Not ve Geri Bildirim (varsa) -->
            ${r?`
                <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-green-800 dark:text-green-300">✅ Değerlendirme Sonucu</h4>
                        <div class="text-2xl font-bold ${s.grade>=e.max_points*.6?"text-green-600":"text-orange-600"}">
                            ${s.grade} / ${e.max_points}
                        </div>
                    </div>
                    ${s.feedback?`
                        <div class="p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <p class="text-sm text-gray-700 dark:text-gray-300">${this.escapeHtml(s.feedback)}</p>
                        </div>
                    `:""}
                    <p class="text-xs text-gray-500 mt-2">
                        Değerlendirilme: ${window.StudentSubmissionService?.formatDate(s.graded_at)}
                    </p>
                </div>
            `:""}

            <!-- Revizyon Talebi (varsa) -->
            ${s?.status==="revision_requested"?`
                <div class="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                    <h4 class="font-semibold text-orange-800 dark:text-orange-300 mb-2">🔄 Revizyon İstendi</h4>
                    ${s.feedback?`
                        <p class="text-sm text-orange-900 dark:text-orange-200 mb-3">${this.escapeHtml(s.feedback)}</p>
                    `:""}
                    <p class="text-xs text-orange-600">Öğretmenin geri bildirimine göre ödevini düzenleyip tekrar gönderebilirsin.</p>
                </div>
            `:""}

            <!-- Gönderim Formu (gönderilebilirse) -->
            ${i?.canSubmit?this.renderSubmissionForm():""}

            <!-- Önceki Gönderimler -->
            ${e.my_submissions&&e.my_submissions.length>0&&!i?.canSubmit?`
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">📜 Gönderim Geçmişi</h4>
                    <div class="space-y-2">
                        ${e.my_submissions.map(n=>`
                            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                                <span class="text-gray-600 dark:text-gray-300">
                                    Deneme ${n.attempt_number} - ${window.StudentSubmissionService?.formatDate(n.submitted_at)}
                                </span>
                                <span class="${n.grade!==null?"font-bold text-green-600":"text-gray-400"}">
                                    ${n.grade!==null?n.grade+" puan":"Değerlendirilmedi"}
                                </span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `:""}
        `,i?.canSubmit&&this.setupDropZone()},renderSubmissionForm(){const e=this.currentSubmission,t=this.currentAssignment?.max_attempts||1,s=e?.attempt_number||1;return`
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    📤 Gönderim ${s>1?`(Deneme ${s}/${t})`:""}
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
                        placeholder="Öğretmenine bir not bırakmak istersen buraya yazabilirsin...">${this.escapeHtml(e?.content||"")}</textarea>
                </div>

                <!-- Aksiyonlar -->
                <div class="flex gap-3">
                    <button onclick="StudentSubmissionModal.saveDraft()"
                        class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        ${this.isSubmitting?"disabled":""}>
                        📝 Taslak Kaydet
                    </button>
                    <button onclick="StudentSubmissionModal.submitAssignment()"
                        class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-md"
                        ${this.isSubmitting?"disabled":""}>
                        ${this.isSubmitting?"⏳ Gönderiliyor...":"🚀 Gönder"}
                    </button>
                </div>

                <p class="text-xs text-gray-400 mt-3 text-center">
                    ⚠️ Gönderdikten sonra düzenleme yapamazsın. Emin ol!
                </p>
            </div>
        `},renderUploadedFiles(){return this.uploadedFiles.length===0?"":this.uploadedFiles.map(e=>`
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg">${this.getFileIcon(e.file_type)}</span>
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-800 dark:text-white truncate">${this.escapeHtml(e.file_name)}</p>
                        <p class="text-xs text-gray-400">${window.StudentSubmissionService?.formatFileSize(e.file_size)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <a href="${e.file_url}" target="_blank" 
                        class="text-theme hover:underline text-sm">Görüntüle</a>
                    <button onclick="StudentSubmissionModal.removeFile('${e.id}')"
                        class="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
            </div>
        `).join("")},setupDropZone(){const e=document.getElementById("submissionDropZone"),i=document.getElementById("submissionFileInput");!e||!i||(e.addEventListener("click",()=>i.click()),i.addEventListener("change",t=>{this.handleFiles(t.target.files)}),e.addEventListener("dragover",t=>{t.preventDefault(),e.classList.add("border-theme","bg-theme/5")}),e.addEventListener("dragleave",()=>{e.classList.remove("border-theme","bg-theme/5")}),e.addEventListener("drop",t=>{t.preventDefault(),e.classList.remove("border-theme","bg-theme/5"),this.handleFiles(t.dataTransfer.files)}))},async handleFiles(e){if(!e||e.length===0)return;const i=["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.presentationml.presentation","application/zip","application/x-zip-compressed","image/png","image/jpeg"],t=5*1024*1024;this.currentSubmission||await this.saveDraft(!0);for(const s of e){if(!i.includes(s.type)){window.Toast&&Toast.error(`${s.name}: Desteklenmeyen dosya türü`);continue}if(s.size>t){window.Toast&&Toast.error(`${s.name}: Dosya çok büyük (max 5MB)`);continue}try{const r=await window.StudentSubmissionService?.uploadFile(this.currentSubmission.id,s);r&&(this.uploadedFiles.push(r),this.updateFilesList(),window.Toast&&Toast.success(`${s.name} yüklendi`))}catch(r){console.error("File upload error:",r),window.Toast&&Toast.error(`${s.name}: Yükleme başarısız`)}}},async removeFile(e){if(confirm("Bu dosyayı silmek istediğine emin misin?"))try{await window.StudentSubmissionService?.deleteFile(e),this.uploadedFiles=this.uploadedFiles.filter(i=>i.id!==e),this.updateFilesList(),window.Toast&&Toast.success("Dosya silindi")}catch(i){console.error("File delete error:",i),window.Toast&&Toast.error("Dosya silinemedi")}},updateFilesList(){const e=document.getElementById("submissionFilesList");e&&(e.innerHTML=this.renderUploadedFiles())},async saveDraft(e=!1){try{const i=document.getElementById("submissionContent")?.value||"",t=await window.StudentSubmissionService?.saveSubmission({assignment_id:this.currentAssignment.id,content:i});return this.currentSubmission=t,!e&&window.Toast&&Toast.success("Taslak kaydedildi"),t}catch(i){throw console.error("Save draft error:",i),!e&&window.Toast&&Toast.error("Taslak kaydedilemedi"),i}},async submitAssignment(){if(confirm("Ödevi göndermek istediğine emin misin? Gönderdikten sonra düzenleme yapamazsın.")){this.isSubmitting=!0,this.updateSubmitButton();try{const e=await this.saveDraft(!0);await window.StudentSubmissionService?.submitAssignment(e.id),window.Toast&&Toast.success("Ödev başarıyla gönderildi! 🎉"),this.close(),window.StudentAssignmentsSection&&StudentAssignmentsSection.loadData()}catch(e){console.error("Submit error:",e),window.Toast&&Toast.error("Gönderim başarısız: "+e.message)}finally{this.isSubmitting=!1,this.updateSubmitButton()}}},updateSubmitButton(){const e=document.querySelector('#submissionModalContent button[onclick*="submitAssignment"]');e&&(e.disabled=this.isSubmitting,e.innerHTML=this.isSubmitting?"⏳ Gönderiliyor...":"🚀 Gönder")},getFileIcon(e){return e?e.includes("pdf")?"📕":e.includes("word")?"📘":e.includes("presentation")?"📙":e.includes("zip")?"📦":e.includes("image")?"🖼️":"📄":"📄"},escapeHtml(e){if(!e)return"";const i=document.createElement("div");return i.textContent=e,i.innerHTML}};window.StudentSubmissionModal=a;
