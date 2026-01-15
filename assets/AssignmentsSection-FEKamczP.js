const d={assignments:[],classrooms:[],courses:[],filters:{classroom:"",status:"",search:""},isLoading:!1,render(){return`
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Filters Bar -->
                <div class="teacher-panel-card rounded-xl p-3 mb-4 flex-shrink-0">
                    <div class="flex flex-col sm:flex-row gap-2">
                        <!-- Search -->
                        <div class="flex-1">
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                                <input type="text" 
                                    id="assignmentSearchInput"
                                    placeholder="Ödev ara..." 
                                    onkeyup="AssignmentsSection.onSearchChange(event)"
                                    class="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:bg-slate-800 dark:text-white text-sm" />
                            </div>
                        </div>

                        <!-- Classroom Filter -->
                        <select id="assignmentClassroomFilter"
                            onchange="AssignmentsSection.onFilterChange()"
                            class="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 dark:bg-slate-800 dark:text-white text-sm min-w-[130px]">
                            <option value="">Tüm Sınıflar</option>
                        </select>

                        <!-- Status Filter -->
                        <select id="assignmentStatusFilter"
                            onchange="AssignmentsSection.onFilterChange()"
                            class="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 dark:bg-slate-800 dark:text-white text-sm min-w-[110px]">
                            <option value="">Tüm Durumlar</option>
                            <option value="draft">📝 Taslak</option>
                            <option value="active">✅ Aktif</option>
                            <option value="closed">🔒 Kapalı</option>
                        </select>
                        
                        <!-- Create Button -->
                        <button onclick="AssignmentsSection.openCreateModal()"
                            class="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-orange-500/30 relative z-50">
                            <span>+</span>
                            <span>Yeni Ödev</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Bar -->
                <div id="assignmentStatsBar" class="flex flex-wrap gap-2 mb-4 flex-shrink-0">
                    ${this.renderStatsBar()}
                </div>

                <!-- Assignments List with internal scroll -->
                <div class="flex-1 overflow-y-auto min-h-0">
                    <div id="assignmentsList" class="space-y-2">
                        ${this.renderEmptyState()}
                    </div>
                </div>
            </div>
        `},renderStatsBar(){const e=this.calculateStats();return`
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-gray-100 dark:bg-gray-700">
                <span class="text-lg">📋</span>
                <span class="font-bold text-gray-800 dark:text-white">${e.total}</span>
                <span class="text-sm text-gray-600 dark:text-gray-300">Toplam</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-green-100 dark:bg-green-900/30">
                <span class="text-lg">✅</span>
                <span class="font-bold text-green-700 dark:text-green-400">${e.active}</span>
                <span class="text-sm text-green-600 dark:text-green-400">Aktif</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30">
                <span class="text-lg">📝</span>
                <span class="font-bold text-yellow-700 dark:text-yellow-400">${e.draft}</span>
                <span class="text-sm text-yellow-600 dark:text-yellow-400">Taslak</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30">
                <span class="text-lg">📥</span>
                <span class="font-bold text-blue-700 dark:text-blue-400">${e.pendingSubmissions}</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">Bekleyen Gönderi</span>
            </div>
        `},renderEmptyState(){return`
            <div class="glass-card rounded-xl p-6">
                <div class="empty-state text-center">
                    <div class="text-3xl mb-2">📋</div>
                    <h3 class="text-base font-bold text-gray-800 dark:text-white mb-1">Henüz ödev oluşturmadınız</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Yukarıdaki "Yeni Ödev" butonuna tıklayın</p>
                </div>
            </div>
        `},renderLoading(){return`
            <div class="glass-card rounded-xl p-6">
                <div class="flex flex-col items-center justify-center">
                    <div class="teacher-spinner mb-2"></div>
                    <p class="text-gray-500 text-sm">Ödevler yükleniyor...</p>
                </div>
            </div>
        `},renderAssignmentCard(e){const t=window.AssignmentService?.getTimeRemaining(e.due_date)||{text:"-"},s=window.AssignmentService?.getStatusBadge(e.status)||"",i=window.AssignmentService?.getTypeBadge(e.assignment_type)||"",n=e.submission_count||0,a=n>0,o=e.graded_count===n&&n>0;let r="",l="";return o&&a?(r="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10",l='<span class="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Tüm gönderiler değerlendirildi"></span>'):a&&(r="border-l-4 border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/10",l='<span class="absolute top-3 right-3 w-3 h-3 bg-yellow-500 rounded-full" title="Değerlendirilmeyi bekleyen gönderiler var"></span>'),`
            <div class="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-200 relative ${r}" data-assignment-id="${e.id}">
                ${l}
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <!-- Sol: Ana Bilgiler -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start gap-3 mb-2">
                            <span class="text-2xl">${this.getAssignmentIcon(e.assignment_type)}</span>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-lg text-gray-800 dark:text-white truncate">
                                    ${this.escapeHtml(e.title)}
                                </h4>
                                <div class="flex flex-wrap items-center gap-2 mt-1">
                                    ${s}
                                    ${i}
                                    ${e.classroom?`<span class="text-xs text-gray-500">🏫 ${this.escapeHtml(e.classroom.name)}</span>`:""}
                                </div>
                            </div>
                        </div>
                        
                        ${e.description?`
                            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-9 mb-2">
                                ${this.escapeHtml(e.description.substring(0,150))}${e.description.length>150?"...":""}
                            </p>
                        `:""}

                        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ml-9">
                            ${e.due_date?`
                                <span class="flex items-center gap-1 ${t.isOverdue?"text-red-500":t.isUrgent?"text-orange-500":""}">
                                    ⏰ ${t.text}
                                </span>
                            `:""}
                            <span class="flex items-center gap-1">
                                📥 ${e.submission_count||0} gönderi
                            </span>
                            <span class="flex items-center gap-1">
                                ⭐ ${e.max_points} puan
                            </span>
                        </div>
                    </div>

                    <!-- Sağ: Aksiyonlar -->
                    <div class="flex items-center gap-2 lg:flex-shrink-0">
                        ${e.status==="draft"?`
                            <button onclick="AssignmentsSection.publishAssignment('${e.id}')"
                                class="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors text-sm"
                                title="Yayınla">
                                🚀 Yayınla
                            </button>
                        `:""}
                        
                        <!-- Bulk Assign Button -->
                        <button onclick="AssignmentModals.openBulkAssign('${e.id}')"
                            class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors text-sm"
                            title="Öğrencilere Ata">
                            👨‍🎓 Ata
                        </button>
                        
                        <button onclick="AssignmentsSection.viewSubmissions('${e.id}')"
                            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
                            title="Gönderileri Gör">
                            📥 Gönderiler
                        </button>
                        
                        <button onclick="AssignmentsSection.editAssignment('${e.id}')"
                            class="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            title="Düzenle">
                            ✏️
                        </button>
                        
                        <button onclick="AssignmentsSection.showAssignmentMenu('${e.id}', event)"
                            class="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            title="Daha Fazla">
                            ⋮
                        </button>
                    </div>
                </div>
            </div>
        `},renderAssignmentsList(){const e=document.getElementById("assignmentsList");if(!e)return;if(this.isLoading){e.innerHTML=this.renderLoading();return}const t=this.getFilteredAssignments();if(t.length===0){this.assignments.length===0?e.innerHTML=this.renderEmptyState():e.innerHTML=`
                    <div class="glass-card rounded-2xl p-8 text-center">
                        <div class="text-4xl mb-3">🔍</div>
                        <p class="text-gray-500 dark:text-gray-400">Filtrelere uygun ödev bulunamadı</p>
                        <button onclick="AssignmentsSection.clearFilters()"
                            class="mt-3 text-theme hover:underline text-sm font-medium">
                            Filtreleri Temizle
                        </button>
                    </div>
                `;return}e.innerHTML=t.map(s=>this.renderAssignmentCard(s)).join("")},async loadData(){this.isLoading=!0,this.renderAssignmentsList();try{const[e,t,s]=await Promise.all([window.AssignmentService?.getAssignments()||[],window.AssignmentService?.getTeacherClassrooms()||[],window.AssignmentService?.getCourses()||[]]);this.assignments=e,this.classrooms=t,this.courses=s,this.populateClassroomFilter(),this.updateStatsBar()}catch(e){console.error("[AssignmentsSection] Load error:",e),window.Toast&&Toast.error("Ödevler yüklenirken hata oluştu")}finally{this.isLoading=!1,this.renderAssignmentsList()}},populateClassroomFilter(){const e=document.getElementById("assignmentClassroomFilter");e&&(e.innerHTML='<option value="">Tüm Sınıflar</option>'+this.classrooms.map(t=>`<option value="${t.id}">${this.escapeHtml(t.name)}</option>`).join(""))},updateStatsBar(){const e=document.getElementById("assignmentStatsBar");e&&(e.innerHTML=this.renderStatsBar())},calculateStats(){const e={total:this.assignments.length,active:this.assignments.filter(t=>t.status==="active").length,draft:this.assignments.filter(t=>t.status==="draft").length,closed:this.assignments.filter(t=>t.status==="closed").length,pendingSubmissions:0};return e.pendingSubmissions=this.assignments.reduce((t,s)=>t+(s.submission_count||0),0),e},getFilteredAssignments(){return this.assignments.filter(e=>{if(this.filters.classroom&&e.classroom_id!==this.filters.classroom||this.filters.status&&e.status!==this.filters.status)return!1;if(this.filters.search){const t=this.filters.search.toLowerCase(),s=e.title.toLowerCase().includes(t),i=e.description?.toLowerCase().includes(t);if(!s&&!i)return!1}return!0})},onFilterChange(){const e=document.getElementById("assignmentClassroomFilter"),t=document.getElementById("assignmentStatusFilter");this.filters.classroom=e?.value||"",this.filters.status=t?.value||"",this.renderAssignmentsList()},onSearchChange(e){clearTimeout(this._searchTimeout),this._searchTimeout=setTimeout(()=>{this.filters.search=e.target.value.trim(),this.renderAssignmentsList()},300)},clearFilters(){this.filters={classroom:"",status:"",search:""};const e=document.getElementById("assignmentSearchInput"),t=document.getElementById("assignmentClassroomFilter"),s=document.getElementById("assignmentStatusFilter");e&&(e.value=""),t&&(t.value=""),s&&(s.value=""),this.renderAssignmentsList()},openCreateModal(){window.AssignmentModals&&AssignmentModals.openCreate(this.classrooms,this.courses)},async editAssignment(e){try{const t=await window.AssignmentService?.getAssignment(e);t&&window.AssignmentModals&&AssignmentModals.openEdit(t,this.classrooms,this.courses)}catch(t){console.error("[AssignmentsSection] Edit error:",t),window.Toast&&Toast.error("Ödev yüklenirken hata oluştu")}},async publishAssignment(e){if(confirm("Bu ödevi yayınlamak istediğinize emin misiniz?"))try{await window.AssignmentService?.publishAssignment(e),window.Toast&&Toast.success("Ödev yayınlandı!"),await this.loadData()}catch(t){console.error("[AssignmentsSection] Publish error:",t),window.Toast&&Toast.error("Yayınlama başarısız")}},viewSubmissions(e){window.AssignmentModals&&AssignmentModals.openSubmissions(e)},showAssignmentMenu(e,t){t.stopPropagation();const s=document.querySelector(".assignment-context-menu");s&&s.remove();const i=this.assignments.find(r=>r.id===e);if(!i)return;const n=document.createElement("div");n.className="assignment-context-menu absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[180px]";const a=t.target.getBoundingClientRect();n.style.top=`${a.bottom+8}px`,n.style.right=`${window.innerWidth-a.right}px`,n.innerHTML=`
            <button onclick="AssignmentsSection.duplicateAssignment('${e}')" 
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                📋 Kopyala
            </button>
            ${i.status==="active"?`
                <button onclick="AssignmentsSection.closeAssignment('${e}')" 
                    class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    🔒 Kapat
                </button>
            `:""}
            ${i.status==="closed"?`
                <button onclick="AssignmentsSection.reopenAssignment('${e}')" 
                    class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    🔓 Yeniden Aç
                </button>
            `:""}
            <hr class="my-2 border-gray-200 dark:border-gray-700">
            <button onclick="AssignmentsSection.deleteAssignment('${e}')" 
                class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                🗑️ Sil
            </button>
        `,document.body.appendChild(n);const o=r=>{n.contains(r.target)||(n.remove(),document.removeEventListener("click",o))};setTimeout(()=>document.addEventListener("click",o),0)},async closeAssignment(e){if(document.querySelector(".assignment-context-menu")?.remove(),!!confirm("Bu ödevi kapatmak istediğinize emin misiniz? Öğrenciler artık gönderi yapamayacak."))try{await window.AssignmentService?.closeAssignment(e),window.Toast&&Toast.success("Ödev kapatıldı"),await this.loadData()}catch(t){console.error("[AssignmentsSection] Close error:",t),window.Toast&&Toast.error("İşlem başarısız")}},async reopenAssignment(e){document.querySelector(".assignment-context-menu")?.remove();try{await window.AssignmentService?.updateAssignment(e,{status:"active"}),window.Toast&&Toast.success("Ödev yeniden açıldı"),await this.loadData()}catch(t){console.error("[AssignmentsSection] Reopen error:",t),window.Toast&&Toast.error("İşlem başarısız")}},async duplicateAssignment(e){document.querySelector(".assignment-context-menu")?.remove();try{const t=await window.AssignmentService?.getAssignment(e);if(!t)throw new Error("Ödev bulunamadı");const s={...t,title:`${t.title} (Kopya)`,status:"draft",due_date:null};delete s.id,delete s.created_at,delete s.updated_at,delete s.published_at,await window.AssignmentService?.createAssignment(s),window.Toast&&Toast.success("Ödev kopyalandı"),await this.loadData()}catch(t){console.error("[AssignmentsSection] Duplicate error:",t),window.Toast&&Toast.error("Kopyalama başarısız")}},async deleteAssignment(e){if(document.querySelector(".assignment-context-menu")?.remove(),!!confirm("Bu ödevi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."))try{await window.AssignmentService?.deleteAssignment(e),window.Toast&&Toast.success("Ödev silindi"),await this.loadData()}catch(t){console.error("[AssignmentsSection] Delete error:",t),window.Toast&&Toast.error("Silme başarısız")}},getAssignmentIcon(e){return{project:"🎯",homework:"📚",quiz:"❓",exam:"📝"}[e]||"📋"},escapeHtml(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}};window.AssignmentsSection=d;
