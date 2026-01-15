const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./courseEnrollmentService-CnDNuDOr.js","./router-BFmYSC8h.js","./router-Dd0B837Q.css"])))=>i.map(i=>d[i]);
import{_ as n}from"./main-DSunrIcW.js";import"./router-BFmYSC8h.js";const d={courses:[],classrooms:[],enrollmentStats:{},selectedCourse:null,selectedCourseIndex:0,isLoading:!1,render(){return`
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Header with Stats -->
                <div class="flex flex-wrap items-center gap-2 mb-4 flex-shrink-0">
                    <div class="px-3 py-1.5 rounded-lg text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center gap-1.5 font-medium">
                        <span>💡</span>
                        <span>Kursu sınıfa atayın → tüm öğrenciler erişir</span>
                    </div>
                    <div id="courseStatsBar" class="flex flex-wrap gap-2 ml-auto">
                        ${this.renderStatsBar()}
                    </div>
                </div>

                <!-- Master-Detail Container -->
                <div class="flex-1 flex gap-4 min-h-0 overflow-hidden">
                    
                    <!-- Left: Course List (Master) -->
                    <div class="w-64 lg:w-72 flex-shrink-0 flex flex-col min-h-0 overflow-hidden">
                        <div class="teacher-panel-card flex-1 flex flex-col overflow-hidden">
                            <div class="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    📚 Kurslar
                                </h3>
                            </div>
                            <div id="coursesMasterList" class="flex-1 overflow-y-auto p-2 space-y-1">
                                ${this.renderMasterListLoading()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right: Course Detail (Detail) -->
                    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div class="teacher-panel-card flex-1 flex flex-col overflow-hidden">
                            <div id="courseDetailContent" class="flex-1 overflow-y-auto">
                                ${this.renderDetailEmpty()}
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>

            <!-- Course Assignment Modal -->
            <div id="courseAssignmentModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    <div id="courseAssignmentModalContent">
                        <!-- Content will be rendered dynamically -->
                    </div>
                </div>
            </div>
        `},renderStatsBar(){const e=this.courses?.length||0;Object.values(this.enrollmentStats).reduce((r,s)=>r+(s.total||0),0);const t=Object.values(this.enrollmentStats).reduce((r,s)=>r+(s.active||0),0);return`
            <div class="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30">
                <span class="text-sm">📚</span>
                <span class="font-bold text-purple-700 dark:text-purple-400 text-sm">${e}</span>
                <span class="text-xs text-purple-600 dark:text-purple-400">Kurs</span>
            </div>
            <div class="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30">
                <span class="text-sm">👥</span>
                <span class="font-bold text-green-700 dark:text-green-400 text-sm">${t}</span>
                <span class="text-xs text-green-600 dark:text-green-400">Aktif</span>
            </div>
        `},renderMasterListLoading(){return`
            <div class="flex items-center justify-center py-8">
                <div class="teacher-spinner"></div>
            </div>
        `},renderMasterListItem(e,t=!1){const r=this.enrollmentStats[e.id]||{active:0},s=e.theme_color||"#00979c";return`
            <button onclick="CoursesSection.selectCourse('${e.id}')"
                class="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${t?"bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500":"hover:bg-slate-100 dark:hover:bg-slate-700/50 border-l-4 border-transparent"}">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                     style="background: ${s}20">
                    📚
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-sm text-slate-800 dark:text-white truncate ${t?"text-emerald-700 dark:text-emerald-400":""}">
                        ${e.title||"İsimsiz Kurs"}
                    </h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                        ${r.active} aktif kayıt
                    </p>
                </div>
            </button>
        `},renderMasterList(){return!this.courses||this.courses.length===0?`
                <div class="text-center py-8">
                    <div class="text-3xl mb-2">📚</div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Kurs bulunamadı</p>
                </div>
            `:this.courses.map((e,t)=>this.renderMasterListItem(e,this.selectedCourse?.id===e.id)).join("")},renderDetailEmpty(){return`
            <div class="h-full flex items-center justify-center">
                <div class="text-center py-8">
                    <div class="text-5xl mb-4">👈</div>
                    <p class="text-slate-500 dark:text-slate-400">Detayları görmek için sol taraftan bir kurs seçin</p>
                </div>
            </div>
        `},renderDetailContent(e){if(!e)return this.renderDetailEmpty();const t=this.enrollmentStats[e.id]||{total:0,active:0,completed:0};return`
            <div class="p-6">
                <!-- Course Header -->
                <div class="flex items-start gap-4 mb-6">
                    <div class="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                         style="background: ${e.theme_color||"#00979c"}20">
                        📚
                    </div>
                    <div class="flex-1">
                        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">
                            ${e.title||"İsimsiz Kurs"}
                        </h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                            ${e.description||"Açıklama yok"}
                        </p>
                    </div>
                    <button onclick="CoursesSection.openAssignmentModal('${e.id}')"
                        class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 relative z-50">
                        <span>➕</span>
                        <span>Sınıfa Ata</span>
                    </button>
                </div>
                
                <!-- Stats Cards -->
                <div class="grid grid-cols-3 gap-3 mb-6">
                    <div class="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">${t.active}</div>
                        <div class="text-xs text-green-700 dark:text-green-400">Aktif Kayıt</div>
                    </div>
                    <div class="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${t.completed}</div>
                        <div class="text-xs text-blue-700 dark:text-blue-400">Tamamlayan</div>
                    </div>
                    <div class="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${t.total}</div>
                        <div class="text-xs text-purple-700 dark:text-purple-400">Toplam Kayıt</div>
                    </div>
                </div>
                
                <!-- Assigned Classrooms -->
                <div>
                    <h3 class="font-semibold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        🏫 Atanan Sınıflar
                    </h3>
                    <div id="courseDetailClassrooms" class="space-y-2">
                        <div class="text-center py-4 text-slate-400 dark:text-slate-500 text-sm">
                            Yükleniyor...
                        </div>
                    </div>
                </div>
            </div>
        `},async selectCourse(e){const t=this.courses.find(a=>a.id===e);if(!t)return;this.selectedCourse=t;const r=document.getElementById("coursesMasterList");r&&(r.innerHTML=this.renderMasterList());const s=document.getElementById("courseDetailContent");s&&(s.innerHTML=this.renderDetailContent(t)),await this.loadCourseClassrooms(e)},async loadCourseClassrooms(e){const t=document.getElementById("courseDetailClassrooms");if(t)try{const{default:r}=await n(async()=>{const{default:a}=await import("./courseEnrollmentService-CnDNuDOr.js");return{default:a}},__vite__mapDeps([0,1,2]),import.meta.url),s=[];for(const a of this.classrooms){const l=(await r.getClassroomEnrollments(a.id)).filter(o=>o.course_id===e);l.length>0&&s.push({...a,enrolledCount:l.length})}if(s.length===0){t.innerHTML=`
                    <div class="text-center py-4 text-slate-400 dark:text-slate-500 text-sm">
                        Bu kurs henüz hiçbir sınıfa atanmamış.
                    </div>
                `;return}t.innerHTML=s.map(a=>`
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span>🏫</span>
                        <span class="font-medium text-sm text-slate-700 dark:text-slate-300">${a.name}</span>
                        <span class="text-xs text-slate-500">(${a.enrolledCount} kayıt)</span>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ✓ Aktif
                    </span>
                </div>
            `).join("")}catch(r){console.error("Sınıf yükleme hatası:",r),t.innerHTML=`
                <div class="text-center py-4 text-red-500 text-sm">
                    Yüklenirken hata oluştu
                </div>
            `}},renderLoading(){return`
            <div class="col-span-full glass-card rounded-2xl p-12">
                <div class="flex flex-col items-center justify-center">
                    <div class="teacher-spinner mb-4"></div>
                    <p class="text-gray-500">Kurslar yükleniyor...</p>
                </div>
            </div>
        `},updateUI(){const e=document.getElementById("courseStatsBar");e&&(e.innerHTML=this.renderStatsBar());const t=document.getElementById("coursesMasterList");t&&(this.isLoading?t.innerHTML=this.renderMasterListLoading():(t.innerHTML=this.renderMasterList(),this.courses.length>0&&!this.selectedCourse&&this.selectCourse(this.courses[0].id)))},async mount(){await this.loadData()},async loadData(){this.isLoading=!0,this.selectedCourse=null,this.updateUI();try{const{default:e}=await n(async()=>{const{default:s}=await import("./courseEnrollmentService-CnDNuDOr.js");return{default:s}},__vite__mapDeps([0,1,2]),import.meta.url),[t,r]=await Promise.all([e.getCourses(),e.getTeacherClassrooms()]);this.courses=t,this.classrooms=r,await this.loadEnrollmentStats(),this.isLoading=!1,this.updateUI()}catch(e){console.error("Veri yükleme hatası:",e),this.isLoading=!1,this.showError("Veriler yüklenirken bir hata oluştu")}},async loadEnrollmentStats(){try{const{default:e}=await n(async()=>{const{default:s}=await import("./courseEnrollmentService-CnDNuDOr.js");return{default:s}},__vite__mapDeps([0,1,2]),import.meta.url),t=this.courses.map(async s=>{const a=await e.getCourseEnrollmentStats(s.id);return{courseId:s.id,stats:a}}),r=await Promise.all(t);this.enrollmentStats={},r.forEach(({courseId:s,stats:a})=>{this.enrollmentStats[s]=a})}catch(e){console.error("İstatistik yükleme hatası:",e)}},async openAssignmentModal(e){const t=this.courses.find(a=>a.id===e);if(!t)return;this.selectedCourse=t;const r=document.getElementById("courseAssignmentModal"),s=document.getElementById("courseAssignmentModalContent");!r||!s||(s.innerHTML=this.renderAssignmentModalContent(t),r.classList.remove("hidden"),await this.loadClassroomEnrollments())},renderAssignmentModalContent(e){const t=e.theme_color||"#00979c";return`
            <!-- Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700" style="background: ${t}10">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                             style="background: ${t}20">
                            📚
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                                ${e.title}
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Sınıflara Kurs Ata</p>
                        </div>
                    </div>
                    <button onclick="CoursesSection.closeAssignmentModal()"
                        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span class="text-xl">✕</span>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="p-6 max-h-[60vh] overflow-y-auto">
                <div class="space-y-4">
                    <h4 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        🏫 Sınıflarınız
                    </h4>
                    
                    <div id="classroomEnrollmentList" class="space-y-3">
                        ${this.renderClassroomLoadingState()}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div class="flex justify-end">
                    <button onclick="CoursesSection.closeAssignmentModal()"
                        class="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        Kapat
                    </button>
                </div>
            </div>
        `},renderClassroomLoadingState(){return`
            <div class="flex items-center justify-center py-8">
                <div class="teacher-spinner"></div>
            </div>
        `},async loadClassroomEnrollments(){const e=document.getElementById("classroomEnrollmentList");if(!(!e||!this.selectedCourse))try{const{default:t}=await n(async()=>{const{default:s}=await import("./courseEnrollmentService-CnDNuDOr.js");return{default:s}},__vite__mapDeps([0,1,2]),import.meta.url),r=await Promise.all(this.classrooms.map(async s=>{const i=(await t.getClassroomEnrollments(s.id)).filter(l=>l.course_id===this.selectedCourse.id);return{...s,enrolledCount:i.length,isAssigned:i.length>0}}));if(r.length===0){e.innerHTML=`
                    <div class="text-center py-8">
                        <p class="text-gray-500 dark:text-gray-400">Henüz sınıf oluşturmadınız.</p>
                        <a href="/teacher#classrooms" class="text-theme hover:underline mt-2 inline-block">
                            Sınıf Oluştur →
                        </a>
                    </div>
                `;return}e.innerHTML=r.map(s=>this.renderClassroomEnrollmentItem(s)).join("")}catch(t){console.error("Sınıf kayıtları yüklenemedi:",t),e.innerHTML=`
                <div class="text-center py-8 text-red-500">
                    <p>Kayıtlar yüklenirken hata oluştu</p>
                </div>
            `}},renderClassroomEnrollmentItem(e){const t=e.students?.[0]?.count||0,r=e.isAssigned,s=e.enrolledCount||0;return`
            <div class="glass-card rounded-xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-theme/10 flex items-center justify-center">
                        🏫
                    </div>
                    <div>
                        <h5 class="font-semibold text-gray-800 dark:text-white">${e.name}</h5>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            ${t} öğrenci ${r?`• ${s} kayıtlı`:""}
                        </p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    ${r?`
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            ✓ Atandı
                        </span>
                        <button onclick="CoursesSection.unenrollClassroom('${e.id}')"
                            class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            title="Atamayı Kaldır">
                            <span>🗑️</span>
                        </button>
                    `:`
                        <button onclick="CoursesSection.enrollClassroom('${e.id}')"
                            class="px-4 py-2 bg-theme text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2"
                            ${t===0?'disabled title="Sınıfta öğrenci yok"':""}>
                            <span>➕</span>
                            <span>Ata</span>
                        </button>
                    `}
                </div>
            </div>
        `},async enrollClassroom(e){if(this.selectedCourse)try{const{default:t}=await n(async()=>{const{default:s}=await import("./courseEnrollmentService-CnDNuDOr.js");return{default:s}},__vite__mapDeps([0,1,2]),import.meta.url),r=await t.enrollClassroom(e,this.selectedCourse.id);window.showToast&&window.showToast(r.message,"success"),await this.loadClassroomEnrollments(),await this.loadEnrollmentStats(),this.updateUI()}catch(t){console.error("Atama hatası:",t),window.showToast&&window.showToast("Atama sırasında bir hata oluştu","error")}},async unenrollClassroom(e){if(this.selectedCourse&&confirm("Bu sınıftaki tüm öğrencilerin kurs kaydı silinecek. Devam etmek istiyor musunuz?"))try{const{default:t}=await n(async()=>{const{default:r}=await import("./courseEnrollmentService-CnDNuDOr.js");return{default:r}},__vite__mapDeps([0,1,2]),import.meta.url);await t.unenrollClassroom(e,this.selectedCourse.id),window.showToast&&window.showToast("Kurs ataması kaldırıldı","success"),await this.loadClassroomEnrollments(),await this.loadEnrollmentStats(),this.updateUI()}catch(t){console.error("Silme hatası:",t),window.showToast&&window.showToast("İşlem sırasında bir hata oluştu","error")}},closeAssignmentModal(){const e=document.getElementById("courseAssignmentModal");e&&e.classList.add("hidden"),this.selectedCourse=null},showError(e){const t=document.getElementById("coursesList");t&&(t.innerHTML=`
                <div class="col-span-full glass-card rounded-2xl p-12">
                    <div class="text-center">
                        <div class="text-4xl mb-4">⚠️</div>
                        <p class="text-red-500">${e}</p>
                        <button onclick="CoursesSection.loadData()" class="mt-4 px-4 py-2 bg-theme text-white rounded-lg">
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            `)}};window.CoursesSection=d;
