const l={assignments:[],isLoading:!1,filter:"all",render(){return`
            <div class="student-assignments-section">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            📋 Ödevlerim
                        </h2>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Sana atanan ödevleri görüntüle ve gönder
                        </p>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button onclick="StudentAssignmentsSection.setFilter('all')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="all">
                        📋 Tümü
                    </button>
                    <button onclick="StudentAssignmentsSection.setFilter('pending')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="pending">
                        ⏳ Bekleyen
                    </button>
                    <button onclick="StudentAssignmentsSection.setFilter('submitted')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="submitted">
                        📤 Gönderilenler
                    </button>
                    <button onclick="StudentAssignmentsSection.setFilter('graded')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="graded">
                        ✅ Notlandırılanlar
                    </button>
                </div>

                <!-- Stats -->
                <div id="studentAssignmentStats" class="flex flex-wrap gap-3 mb-6">
                    ${this.renderStats()}
                </div>

                <!-- Assignments List -->
                <div id="studentAssignmentsList" class="space-y-4">
                    ${this.renderLoading()}
                </div>
            </div>
        `},renderStats(){const t=this.calculateStats();return`
            <div class="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center gap-2">
                <span class="font-bold text-blue-700 dark:text-blue-400">${t.total}</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">Toplam</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center gap-2">
                <span class="font-bold text-yellow-700 dark:text-yellow-400">${t.pending}</span>
                <span class="text-sm text-yellow-600 dark:text-yellow-400">Bekliyor</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center gap-2">
                <span class="font-bold text-orange-700 dark:text-orange-400">${t.urgent}</span>
                <span class="text-sm text-orange-600 dark:text-orange-400">Acil</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center gap-2">
                <span class="font-bold text-green-700 dark:text-green-400">${t.graded}</span>
                <span class="text-sm text-green-600 dark:text-green-400">Notlandı</span>
            </div>
        `},renderLoading(){return`
            <div class="glass-card rounded-2xl p-12 text-center">
                <div class="teacher-spinner mx-auto mb-4"></div>
                <p class="text-gray-500 dark:text-gray-400">Ödevler yükleniyor...</p>
            </div>
        `},renderEmptyState(){return`
            <div class="glass-card rounded-2xl p-12 text-center">
                <div class="text-6xl mb-4">📭</div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Henüz ödevin yok</h3>
                <p class="text-gray-500 dark:text-gray-400">Öğretmenin sana ödev atadığında burada görünecek</p>
            </div>
        `},renderAssignmentCard(t){const e=window.StudentSubmissionService,s=e?.getAssignmentStatus(t)||{label:"-",icon:"📋",color:"gray"},n=e?.getTimeRemaining(t.due_date)||{text:"-"},i=e?.getStatusBadgeHtml(s)||"",a=t.my_submission,r=a?.grade!==null&&a?.grade!==void 0;return`
            <div class="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onclick="StudentAssignmentsSection.openAssignment('${t.id}')">
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <!-- Sol: Ana Bilgiler -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start gap-3 mb-2">
                            <span class="text-3xl">${this.getTypeIcon(t.assignment_type)}</span>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-lg text-gray-800 dark:text-white">
                                    ${this.escapeHtml(t.title)}
                                </h4>
                                <div class="flex flex-wrap items-center gap-2 mt-1">
                                    ${i}
                                    ${t.course?`<span class="text-xs text-gray-500">📚 ${this.escapeHtml(t.course.title)}</span>`:""}
                                </div>
                            </div>
                        </div>
                        
                        ${t.description?`
                            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-12 mb-2">
                                ${this.escapeHtml(t.description.substring(0,120))}${t.description.length>120?"...":""}
                            </p>
                        `:""}

                        <div class="flex flex-wrap items-center gap-4 text-sm ml-12">
                            ${t.due_date?`
                                <span class="flex items-center gap-1 ${n.overdue?"text-red-500 font-medium":n.urgent?"text-orange-500 font-medium":"text-gray-500"}">
                                    ⏰ ${n.text}
                                </span>
                            `:'<span class="text-gray-400">⏰ Süresiz</span>'}
                            <span class="text-gray-500">⭐ ${t.max_points} puan</span>
                        </div>
                    </div>

                    <!-- Sağ: Not veya Aksiyon -->
                    <div class="flex items-center gap-3 lg:flex-shrink-0">
                        ${r?`
                            <div class="text-center">
                                <div class="text-3xl font-bold ${a.grade>=t.max_points*.6?"text-green-600":"text-orange-600"}">
                                    ${a.grade}
                                </div>
                                <div class="text-xs text-gray-500">/ ${t.max_points}</div>
                            </div>
                        `:s.canSubmit?`
                            <button onclick="event.stopPropagation(); StudentAssignmentsSection.openAssignment('${t.id}')"
                                class="px-5 py-2.5 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-md">
                                ${a?.status==="draft"?"📝 Devam Et":"📤 Gönder"}
                            </button>
                        `:`
                            <span class="text-gray-400 text-sm">👀 Görüntüle</span>
                        `}
                        
                        <span class="text-gray-400 text-xl">→</span>
                    </div>
                </div>
            </div>
        `},renderAssignmentsList(){const t=document.getElementById("studentAssignmentsList");if(!t)return;if(this.isLoading){t.innerHTML=this.renderLoading();return}const e=this.getFilteredAssignments();if(e.length===0){this.assignments.length===0?t.innerHTML=this.renderEmptyState():t.innerHTML=`
                    <div class="glass-card rounded-2xl p-8 text-center">
                        <div class="text-4xl mb-3">🔍</div>
                        <p class="text-gray-500 dark:text-gray-400">Bu kategoride ödev bulunamadı</p>
                        <button onclick="StudentAssignmentsSection.setFilter('all')"
                            class="mt-3 text-theme hover:underline text-sm font-medium">
                            Tümünü Göster
                        </button>
                    </div>
                `;return}const s=[...e].sort((n,i)=>{const a=window.StudentSubmissionService?.getAssignmentStatus(n),r=window.StudentSubmissionService?.getAssignmentStatus(i);return a?.canSubmit&&!r?.canSubmit?-1:!a?.canSubmit&&r?.canSubmit?1:n.due_date&&i.due_date?new Date(n.due_date)-new Date(i.due_date):0});t.innerHTML=s.map(n=>this.renderAssignmentCard(n)).join("")},async loadData(){this.isLoading=!0,this.renderAssignmentsList(),this.updateFilterButtons();try{const t=await window.StudentSubmissionService?.getMyAssignments({status:"all"})||[];this.assignments=t,this.updateStats()}catch(t){console.error("[StudentAssignmentsSection] Load error:",t),window.Toast&&Toast.error("Ödevler yüklenirken hata oluştu")}finally{this.isLoading=!1,this.renderAssignmentsList()}},updateStats(){const t=document.getElementById("studentAssignmentStats");t&&(t.innerHTML=this.renderStats())},calculateStats(){const t=window.StudentSubmissionService;let e=0,s=0,n=0,i=0;return this.assignments.forEach(a=>{const r=t?.getAssignmentStatus(a),d=t?.getTimeRemaining(a.due_date);r?.code==="graded"?i++:r?.code==="submitted"?n++:r?.canSubmit&&(e++,d?.urgent&&!d?.overdue&&s++)}),{total:this.assignments.length,pending:e,urgent:s,submitted:n,graded:i}},getFilteredAssignments(){const t=window.StudentSubmissionService;return this.assignments.filter(e=>{const s=t?.getAssignmentStatus(e);switch(this.filter){case"pending":return s?.canSubmit&&s?.code!=="draft";case"submitted":return s?.code==="submitted"||s?.code==="draft";case"graded":return s?.code==="graded";default:return!0}})},setFilter(t){this.filter=t,this.updateFilterButtons(),this.renderAssignmentsList()},updateFilterButtons(){document.querySelectorAll(".assignment-filter-btn").forEach(t=>{t.classList.remove("bg-theme","text-white"),t.classList.add("bg-gray-100","text-gray-600","dark:bg-gray-700","dark:text-gray-300"),t.dataset.filter===this.filter&&(t.classList.add("bg-theme","text-white"),t.classList.remove("bg-gray-100","text-gray-600","dark:bg-gray-700","dark:text-gray-300"))})},async openAssignment(t){window.StudentSubmissionModal&&StudentSubmissionModal.open(t)},getTypeIcon(t){return{project:"🎯",homework:"📚",quiz:"❓",exam:"📝"}[t]||"📋"},escapeHtml(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}};window.StudentAssignmentsSection=l;
