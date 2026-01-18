const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./analyticsService-CYdFpIOy.js","./router-DkhU4yIh.js","./router-P-fjebgT.css"])))=>i.map(i=>d[i]);
import{_ as o}from"./main-QWdJgBHC.js";import"./router-DkhU4yIh.js";const c={summary:null,submissionTrend:[],classroomPerformance:[],assignmentStats:[],topStudents:[],statusDistribution:null,recentActivity:[],isLoading:!1,render(){return`
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Header with Refresh -->
                <div class="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        📊 Analytics Dashboard
                    </h2>
                    <button onclick="AnalyticsSection.refresh()"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-xs font-medium">
                        <span>🔄</span>
                        <span>Yenile</span>
                    </button>
                </div>

                <!-- Scrollable Content -->
                <div class="flex-1 overflow-y-auto min-h-0 space-y-4">
                    
                    <!-- Summary Stats Grid -->
                    <div id="analyticsSummaryGrid" class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        ${this.renderSummaryLoading()}
                    </div>

                    <!-- Charts Row -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <!-- Submission Trend -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                📈 Gönderim Trendi (Son 7 Gün)
                            </h3>
                            <div id="submissionTrendChart" class="h-32">
                                ${this.renderChartLoading()}
                            </div>
                        </div>

                        <!-- Status Distribution -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                📊 Gönderim Durumu Dağılımı
                            </h3>
                            <div id="statusDistributionChart" class="h-32">
                                ${this.renderChartLoading()}
                            </div>
                        </div>
                    </div>

                    <!-- Classroom Performance -->
                    <div class="teacher-panel-card rounded-xl p-4">
                        <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                            🏫 Sınıf Performansı
                        </h3>
                        <div id="classroomPerformanceTable" class="max-h-40 overflow-y-auto">
                            ${this.renderTableLoading()}
                        </div>
                    </div>

                    <!-- Two Column Layout -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <!-- Top Students -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                🏆 En Başarılı Öğrenciler
                            </h3>
                            <div id="topStudentsList" class="max-h-36 overflow-y-auto">
                                ${this.renderListLoading()}
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                ⚡ Son Aktiviteler
                            </h3>
                            <div id="recentActivityList" class="max-h-36 overflow-y-auto">
                                ${this.renderListLoading()}
                            </div>
                        </div>
                    </div>

                    <!-- Assignment Stats Table -->
                    <div class="teacher-panel-card rounded-xl p-4">
                        <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            📋 Ödev İstatistikleri
                        </h3>
                        <div id="assignmentStatsTable">
                            ${this.renderTableLoading()}
                        </div>
                    </div>
                    
                </div>
            </div>
        `},renderSummaryLoading(){return Array(4).fill("").map(()=>`
            <div class="glass-card rounded-xl p-4 animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
        `).join("")},renderChartLoading(){return`
            <div class="flex items-center justify-center h-full">
                <div class="teacher-spinner"></div>
            </div>
        `},renderTableLoading(){return`
            <div class="animate-pulse space-y-3">
                ${Array(3).fill("").map(()=>`
                    <div class="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                `).join("")}
            </div>
        `},renderListLoading(){return`
            <div class="animate-pulse space-y-3">
                ${Array(5).fill("").map(()=>`
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div class="flex-grow">
                            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `},async mount(){this.isLoading=!0,await this.loadAllData(),this.renderAllSections(),this.isLoading=!1},async refresh(){window.showToast&&window.showToast("Veriler yenileniyor...","info"),await this.mount(),window.showToast&&window.showToast("Veriler güncellendi","success")},async loadAllData(){try{const{default:e}=await o(async()=>{const{default:l}=await import("./analyticsService-CYdFpIOy.js");return{default:l}},__vite__mapDeps([0,1,2]),import.meta.url),[t,s,a,r,i,n,d]=await Promise.all([e.getDashboardSummary(),e.getSubmissionTrend(7),e.getClassroomPerformance(),e.getAssignmentStats(),e.getTopStudents(5),e.getSubmissionStatusDistribution(),e.getRecentActivity(10)]);this.summary=t,this.submissionTrend=s,this.classroomPerformance=a,this.assignmentStats=r,this.topStudents=i,this.statusDistribution=n,this.recentActivity=d}catch(e){console.error("Analytics veri yükleme hatası:",e),window.showToast&&window.showToast("Veriler yüklenirken hata oluştu","error")}},renderAllSections(){this.renderSummary(),this.renderSubmissionTrend(),this.renderStatusDistribution(),this.renderClassroomPerformance(),this.renderTopStudents(),this.renderRecentActivity(),this.renderAssignmentStats()},renderSummary(){const e=document.getElementById("analyticsSummaryGrid");if(!e||!this.summary)return;const t=[{label:"Toplam Öğrenci",value:this.summary.totalStudents,icon:"👨‍🎓",color:"blue"},{label:"Aktif Ödev",value:this.summary.activeAssignments,icon:"📋",color:"green"},{label:"Bekleyen Gönderim",value:this.summary.pendingSubmissions,icon:"📥",color:"orange"},{label:"Ortalama Puan",value:this.summary.averageScore,icon:"⭐",color:"purple",suffix:"%"}];e.innerHTML=t.map(s=>`
            <div class="glass-card rounded-xl p-4 border-l-4 border-${s.color}-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${s.label}</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">
                            ${s.value}${s.suffix||""}
                        </p>
                    </div>
                    <div class="text-3xl opacity-50">${s.icon}</div>
                </div>
            </div>
        `).join("")},renderSubmissionTrend(){const e=document.getElementById("submissionTrendChart");if(!e)return;if(!this.submissionTrend||this.submissionTrend.length===0){e.innerHTML=this.renderEmptyState("Gönderim verisi bulunamadı");return}const t=Math.max(...this.submissionTrend.map(s=>s.count),1);e.innerHTML=`
            <div class="flex items-end justify-between h-48 gap-2 px-2">
                ${this.submissionTrend.map(s=>{const a=s.count/t*100;return`
                        <div class="flex-1 flex flex-col items-center gap-1">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">${s.count}</span>
                            <div class="w-full bg-theme/20 rounded-t-lg transition-all hover:bg-theme/30 relative group"
                                 style="height: ${Math.max(a,5)}%">
                                <div class="absolute inset-0 bg-theme rounded-t-lg" style="height: 100%"></div>
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 text-center">${s.label}</span>
                        </div>
                    `}).join("")}
            </div>
        `},renderStatusDistribution(){const e=document.getElementById("statusDistributionChart");if(!e||!this.statusDistribution)return;const t=Object.values(this.statusDistribution).reduce((a,r)=>a+r,0);if(t===0){e.innerHTML=this.renderEmptyState("Henüz gönderim yok");return}const s=[{label:"Bekliyor",value:this.statusDistribution.submitted,color:"bg-yellow-500"},{label:"Notlandı",value:this.statusDistribution.graded,color:"bg-green-500"},{label:"Geç Gönderim",value:this.statusDistribution.late_submitted,color:"bg-orange-500"},{label:"Taslak",value:this.statusDistribution.draft,color:"bg-gray-400"},{label:"Revizyon",value:this.statusDistribution.revision_requested,color:"bg-purple-500"}].filter(a=>a.value>0);e.innerHTML=`
            <div class="flex items-center gap-6">
                <!-- Simple horizontal bars -->
                <div class="flex-grow space-y-3">
                    ${s.map(a=>{const r=Math.round(a.value/t*100);return`
                            <div class="flex items-center gap-3">
                                <span class="w-24 text-sm text-gray-600 dark:text-gray-400">${a.label}</span>
                                <div class="flex-grow h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div class="${a.color} h-full rounded-full transition-all" style="width: ${r}%"></div>
                                </div>
                                <span class="w-12 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">${a.value}</span>
                            </div>
                        `}).join("")}
                </div>
            </div>
            <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Toplam: ${t} gönderim
            </div>
        `},renderClassroomPerformance(){const e=document.getElementById("classroomPerformanceTable");if(e){if(!this.classroomPerformance||this.classroomPerformance.length===0){e.innerHTML=this.renderEmptyState("Sınıf bulunamadı");return}e.innerHTML=`
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th class="pb-3 font-semibold">Sınıf</th>
                            <th class="pb-3 font-semibold text-center">Öğrenci</th>
                            <th class="pb-3 font-semibold text-center">Ödev</th>
                            <th class="pb-3 font-semibold text-center">Gönderim</th>
                            <th class="pb-3 font-semibold text-center">Ort. Puan</th>
                            <th class="pb-3 font-semibold text-center">Teslim Oranı</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        ${this.classroomPerformance.map(t=>`
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="py-3">
                                    <div class="flex items-center gap-2">
                                        <span class="text-lg">🏫</span>
                                        <span class="font-medium text-gray-800 dark:text-white">${t.name}</span>
                                    </div>
                                </td>
                                <td class="py-3 text-center text-gray-600 dark:text-gray-400">${t.studentCount}</td>
                                <td class="py-3 text-center text-gray-600 dark:text-gray-400">${t.assignmentCount}</td>
                                <td class="py-3 text-center text-gray-600 dark:text-gray-400">${t.submissionCount}</td>
                                <td class="py-3 text-center">
                                    <span class="px-2 py-1 rounded-full text-sm font-semibold ${this.getScoreColor(t.averageScore)}">
                                        ${t.averageScore}%
                                    </span>
                                </td>
                                <td class="py-3 text-center">
                                    <div class="flex items-center justify-center gap-2">
                                        <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div class="h-full bg-theme rounded-full" style="width: ${t.submissionRate}%"></div>
                                        </div>
                                        <span class="text-sm text-gray-600 dark:text-gray-400">${t.submissionRate}%</span>
                                    </div>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `}},renderTopStudents(){const e=document.getElementById("topStudentsList");if(e){if(!this.topStudents||this.topStudents.length===0){e.innerHTML=this.renderEmptyState("Henüz öğrenci verisi yok");return}e.innerHTML=`
            <div class="space-y-3">
                ${this.topStudents.map((t,s)=>{const a=["🥇","🥈","🥉"],r=s<3?a[s]:`${s+1}.`,i=t.avatar&&!t.avatar.startsWith("�")?`<img src="${t.avatar}" class="w-10 h-10 rounded-full object-cover">`:`<span class="text-xl">${t.avatar||"👤"}</span>`;return`
                        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <span class="text-lg w-8 text-center">${r}</span>
                            <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                ${i}
                            </div>
                            <div class="flex-grow">
                                <p class="font-medium text-gray-800 dark:text-white">${t.name}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${t.submissionCount} gönderim</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-theme">${t.averageScore}%</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">ortalama</p>
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `}},renderRecentActivity(){const e=document.getElementById("recentActivityList");if(e){if(!this.recentActivity||this.recentActivity.length===0){e.innerHTML=this.renderEmptyState("Henüz aktivite yok");return}e.innerHTML=`
            <div class="space-y-3 max-h-80 overflow-y-auto">
                ${this.recentActivity.map(t=>{const s=t.type==="graded",a=s?"✅":"📥",r=this.formatTimeAgo(t.createdAt);return`
                        <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                ${t.studentAvatar&&!t.studentAvatar.startsWith("�")?`<img src="${t.studentAvatar}" class="w-8 h-8 rounded-full object-cover">`:`<span class="text-sm">${t.studentAvatar||"👤"}</span>`}
                            </div>
                            <div class="flex-grow min-w-0">
                                <p class="text-sm text-gray-800 dark:text-white">
                                    <span class="font-medium">${t.studentName}</span>
                                    <span class="text-gray-500 dark:text-gray-400">
                                        ${s?"puanlandı":"gönderim yaptı"}
                                    </span>
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${t.assignmentTitle}</p>
                            </div>
                            <div class="text-right shrink-0">
                                ${s&&t.score!==null?`
                                    <span class="text-sm font-semibold text-theme">${t.score}%</span>
                                `:`
                                    <span class="text-lg">${a}</span>
                                `}
                                <p class="text-xs text-gray-400">${r}</p>
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `}},renderAssignmentStats(){const e=document.getElementById("assignmentStatsTable");if(e){if(!this.assignmentStats||this.assignmentStats.length===0){e.innerHTML=this.renderEmptyState("Henüz ödev oluşturulmadı");return}e.innerHTML=`
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th class="pb-3 font-semibold">Ödev</th>
                            <th class="pb-3 font-semibold">Sınıf</th>
                            <th class="pb-3 font-semibold text-center">Durum</th>
                            <th class="pb-3 font-semibold text-center">Gönderim</th>
                            <th class="pb-3 font-semibold text-center">Ort. Puan</th>
                            <th class="pb-3 font-semibold text-center">Geç</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        ${this.assignmentStats.map(t=>`
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="py-3">
                                    <p class="font-medium text-gray-800 dark:text-white line-clamp-1">${t.title}</p>
                                    ${t.dueDate?`
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            📅 ${new Date(t.dueDate).toLocaleDateString("tr-TR")}
                                        </p>
                                    `:""}
                                </td>
                                <td class="py-3 text-sm text-gray-600 dark:text-gray-400">${t.classroomName}</td>
                                <td class="py-3 text-center">
                                    ${this.renderStatusBadge(t.status)}
                                </td>
                                <td class="py-3 text-center">
                                    <span class="text-gray-600 dark:text-gray-400">
                                        ${t.submissionCount}/${t.studentCount}
                                    </span>
                                    <span class="text-xs text-gray-400 ml-1">(${t.submissionRate}%)</span>
                                </td>
                                <td class="py-3 text-center">
                                    ${t.averageScore!==null?`
                                        <span class="font-semibold ${this.getScoreColor(t.averageScore)}">${t.averageScore}%</span>
                                    `:`
                                        <span class="text-gray-400">-</span>
                                    `}
                                </td>
                                <td class="py-3 text-center">
                                    ${t.lateSubmissions>0?`
                                        <span class="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                                            ${t.lateSubmissions}
                                        </span>
                                    `:`
                                        <span class="text-gray-400">-</span>
                                    `}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `}},renderEmptyState(e){return`
            <div class="flex flex-col items-center justify-center py-8 text-gray-400">
                <span class="text-4xl mb-2">📭</span>
                <p>${e}</p>
            </div>
        `},renderStatusBadge(e){const t={draft:{label:"Taslak",class:"bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"},published:{label:"Aktif",class:"bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"},closed:{label:"Kapalı",class:"bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}},s=t[e]||t.draft;return`<span class="px-2 py-0.5 rounded-full text-xs font-medium ${s.class}">${s.label}</span>`},getScoreColor(e){return e>=80?"text-green-600 dark:text-green-400":e>=60?"text-yellow-600 dark:text-yellow-400":e>=40?"text-orange-600 dark:text-orange-400":"text-red-600 dark:text-red-400"},formatTimeAgo(e){const t=new Date(e),a=new Date-t,r=Math.floor(a/6e4),i=Math.floor(a/36e5),n=Math.floor(a/864e5);return r<1?"Az önce":r<60?`${r} dk`:i<24?`${i} saat`:n<7?`${n} gün`:t.toLocaleDateString("tr-TR")}};window.AnalyticsSection=c;
