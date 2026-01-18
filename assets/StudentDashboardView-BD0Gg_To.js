const u={isLoaded:!1,container:null,studentData:null,progressData:[],quizData:[],async checkAuth(){return window.Auth&&typeof Auth.waitForInit=="function"&&await Auth.waitForInit(),window.Auth&&Auth.isStudent()&&Auth.currentStudent?Auth.currentStudent:null},template(){return`
            <div class="dashboard-bg min-h-screen pb-32">
                <!-- Main Content -->
                <main class="max-w-6xl mx-auto px-4 py-8">
                    <!-- Welcome Section -->
                    <div class="mb-8">
                        <h2 class="text-3xl font-bold mb-2">Merhaba, <span id="sd-welcomeName">Öğrenci</span>! 👋</h2>
                        <p class="text-gray-600">İşte senin öğrenme yolculuğun</p>
                    </div>

                    <!-- Stats Overview -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">📚</div>
                            <div id="sd-totalLessons" class="text-3xl font-bold text-theme">0</div>
                            <div class="text-gray-500 text-sm">Tamamlanan Ders</div>
                        </div>
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">🏆</div>
                            <div id="sd-avgScore" class="text-3xl font-bold text-yellow-500">0</div>
                            <div class="text-gray-500 text-sm">Ortalama Puan</div>
                        </div>
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">🔥</div>
                            <div id="sd-streak" class="text-3xl font-bold text-orange-500">0</div>
                            <div class="text-gray-500 text-sm">Gün Seri</div>
                        </div>
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">⭐</div>
                            <div id="sd-totalQuizzes" class="text-3xl font-bold text-purple-500">0</div>
                            <div class="text-gray-500 text-sm">Tamamlanan Quiz</div>
                        </div>
                    </div>

                    <!-- Course Progress -->
                    <h3 class="text-xl font-bold mb-4">📊 Kurs İlerlemen</h3>
                    <div id="sd-courseProgress" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="flex justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                        </div>
                    </div>

                    <!-- My Assignments Section -->
                    <h3 class="text-xl font-bold mb-4">📋 Ödevlerim</h3>
                    <div id="sd-assignments" class="mb-8">
                        <div class="flex justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <h3 class="text-xl font-bold mb-4">📝 Son Aktiviteler</h3>
                    <div id="sd-recentActivity" class="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div class="flex justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                        </div>
                    </div>

                    <!-- Quiz History -->
                    <h3 class="text-xl font-bold mb-4 mt-8">🎯 Quiz Puanları</h3>
                    <div id="sd-quizHistory" class="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div class="flex justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                        </div>
                    </div>

                    <!-- Back to Home -->
                    <div class="text-center mt-8">
                        <button onclick="StudentDashboardView.goHome()" class="text-theme hover:text-theme/80 font-medium text-sm flex items-center gap-2 mx-auto">
                            ← Ana Sayfaya Dön
                        </button>
                    </div>
                </main>
            </div>
        `},async mount(e){if(console.log("[StudentDashboardView] Mounting..."),this.container=e,e.innerHTML=`
            <div class="flex flex-col items-center justify-center min-h-[60vh]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-theme mb-4"></div>
                <p class="text-gray-500">Öğrenci paneli yükleniyor...</p>
            </div>
        `,this.studentData=await this.checkAuth(),!this.studentData){console.log("[StudentDashboardView] Not authenticated as student, redirecting..."),window.location.href="auth.html?redirect=student-dashboard";return}e.innerHTML=this.template();const t=document.getElementById("sd-welcomeName");t&&(t.textContent=this.studentData.displayName||"Öğrenci"),await Promise.all([this.loadProgressData(),this.loadQuizData()]),this.renderStats(),this.renderCourseProgress(),this.renderAssignments(),this.renderRecentActivity(),this.renderQuizHistory(),this.isLoaded=!0,console.log("[StudentDashboardView] Mounted successfully")},unmount(){console.log("[StudentDashboardView] Unmounting..."),this.container&&(this.container.innerHTML="",this.container.classList.add("hidden"));const e=document.getElementById("student-dashboard-view-container");e&&(e.innerHTML="",e.classList.add("hidden")),this.isLoaded=!1,this.container=null,this.progressData=[],this.quizData=[],console.log("[StudentDashboardView] Unmounted")},async loadProgressData(){try{const e=this.studentData?.sessionToken;if(e){const{data:t,error:i}=await SupabaseClient.getClient().rpc("student_get_progress",{p_session_token:e});if(i)throw i;this.progressData=(t||[]).sort((s,n)=>new Date(n.completed_at)-new Date(s.completed_at))}else{const{data:t,error:i}=await SupabaseClient.getClient().from("student_progress").select("*").eq("student_id",this.studentData.studentId).order("completed_at",{ascending:!1});if(i)throw i;this.progressData=t||[]}}catch(e){console.error("[StudentDashboardView] Error loading progress:",e),this.progressData=[]}},async loadQuizData(){this.quizData=this.progressData.filter(e=>e.quiz_score!==null&&e.quiz_score!==void 0).sort((e,t)=>new Date(t.completed_at)-new Date(e.completed_at))},renderStats(){const e=document.getElementById("sd-totalLessons");e&&(e.textContent=this.progressData.length);const t=this.quizData.filter(o=>o.quiz_score!==null).map(o=>o.quiz_score),i=t.length>0?Math.round(t.reduce((o,l)=>o+l,0)/t.length):0,s=document.getElementById("sd-avgScore");s&&(s.textContent=i);const n=document.getElementById("sd-totalQuizzes");n&&(n.textContent=this.quizData.length);let a=0;const r=[...new Set(this.progressData.map(o=>new Date(o.completed_at).toDateString()))];r.sort((o,l)=>new Date(l)-new Date(o));const d=new Date;for(let o=0;o<r.length;o++){const l=new Date(d);if(l.setDate(l.getDate()-o),r.includes(l.toDateString()))a++;else if(o>0)break}const c=document.getElementById("sd-streak");c&&(c.textContent=a)},renderCourseProgress(){const e=document.getElementById("sd-courseProgress");if(!e)return;const t={arduino:{title:"Arduino Serüveni",icon:"🤖",color:"#00979C",total:20},microbit:{title:"Micro:bit Dünyası",icon:"💻",color:"#6C63FF",total:10},scratch:{title:"Scratch ile Oyun",icon:"🎮",color:"#FF6F00",total:8},mblock:{title:"mBlock ile Robotik",icon:"🦾",color:"#30B0C7",total:10}},i={};Object.keys(t).forEach(s=>{const n=this.progressData.filter(a=>a.course_id===s);i[s]={completed:n.length,total:t[s].total,percentage:Math.round(n.length/t[s].total*100)}}),e.innerHTML=Object.entries(t).map(([s,n])=>{const a=i[s],r=2*Math.PI*40,d=r-a.percentage/100*r;return`
                    <div class="course-progress-card bg-white rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <svg width="100" height="100" class="progress-ring">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="${n.color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${r}" stroke-dashoffset="${d}" />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-3xl">${n.icon}</span>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <h4 class="font-bold text-lg mb-1">${n.title}</h4>
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-2xl font-bold" style="color: ${n.color}">${a.percentage}%</span>
                                    <span class="text-gray-500 text-sm">(${a.completed}/${a.total} ders)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="h-2 rounded-full transition-all duration-500" style="width: ${a.percentage}%; background: ${n.color}"></div>
                                </div>
                            </div>
                        </div>
                        <a href="#/course/${s}" onclick="event.preventDefault(); StudentDashboardView.goToCourse('${s}');"
                           class="mt-4 block text-center py-2 px-4 border-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                           style="border-color: ${n.color}; color: ${n.color}">
                            Devam Et →
                        </a>
                    </div>
                `}).join("")},renderRecentActivity(){const e=document.getElementById("sd-recentActivity");if(!e)return;if(this.progressData.length===0){e.innerHTML=`
                <div class="p-8 text-center text-gray-500">
                    <div class="text-4xl mb-2">📭</div>
                    <p>Henüz aktivite yok</p>
                    <p class="text-sm">Dersleri tamamladıkça burada görünecek</p>
                </div>
            `;return}const t=this.progressData.slice(0,10),i={arduino:"🤖",microbit:"💻",scratch:"🎮",mblock:"🦾"};e.innerHTML=t.map(s=>{const a=new Date(s.completed_at).toLocaleDateString("tr-TR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}),r=i[s.course_id]||"📚",d=s.quiz_score!==null;return`
                    <div class="lesson-item completed px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${r}</span>
                            <div>
                                <p class="font-medium">${s.project_id}</p>
                                <p class="text-sm text-gray-500">${s.course_id} kursu</p>
                            </div>
                        </div>
                        <div class="text-right">
                            ${d?`<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-sm font-medium">Quiz: ${s.quiz_score}%</span>`:""}
                            <p class="text-sm text-gray-400 mt-1">${a}</p>
                        </div>
                    </div>
                `}).join("")},renderQuizHistory(){const e=document.getElementById("sd-quizHistory");if(e){if(this.quizData.length===0){e.innerHTML=`
                <div class="p-8 text-center text-gray-500">
                    <div class="text-4xl mb-2">🎯</div>
                    <p>Henüz quiz tamamlanmadı</p>
                    <p class="text-sm">Ders sonlarındaki quizleri çöz</p>
                </div>
            `;return}e.innerHTML=this.quizData.map(t=>{const s=new Date(t.completed_at).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"}),n=t.quiz_score;let a="text-red-500",r="😢";return n>=80?(a="text-green-500",r="🎉"):n>=60?(a="text-yellow-500",r="👍"):n>=40&&(a="text-orange-500",r="💪"),`
                    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${r}</span>
                            <div>
                                <p class="font-medium">${t.project_id}</p>
                                <p class="text-sm text-gray-500">${t.course_id} kursu • ${s}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-2xl font-bold ${a}">${n}%</span>
                        </div>
                    </div>
                `}).join("")}},goHome(){window.Navbar&&typeof Navbar.navigateSPA=="function"?Navbar.navigateSPA("/"):window.Router?Router.navigate("/"):window.location.href="index.html"},goToCourse(e){window.Navbar&&typeof Navbar.navigateSPA=="function"?Navbar.navigateSPA(`/course/${e}`):window.Router?Router.navigate(`/course/${e}`):window.location.href=`index.html#/course/${e}`},async renderAssignments(){const e=document.getElementById("sd-assignments");if(e)try{const t=await window.StudentSubmissionService?.getMyAssignments({status:"active"})||[];if(t.length===0){e.innerHTML=`
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                        <div class="text-4xl mb-3">📭</div>
                        <p class="text-gray-500 dark:text-gray-400">Henüz bekleyen ödevin yok</p>
                    </div>
                `;return}const i=t.slice(0,3),s=t.length>3;e.innerHTML=`
                <div class="space-y-3">
                    ${i.map(n=>this.renderAssignmentCard(n)).join("")}
                </div>
                ${s?`
                    <div class="text-center mt-4">
                        <button onclick="StudentDashboardView.showAllAssignments()"
                            class="text-theme hover:underline font-medium text-sm">
                            Tüm Ödevleri Gör (${t.length}) →
                        </button>
                    </div>
                `:""}
            `}catch(t){console.error("[StudentDashboardView] renderAssignments error:",t),e.innerHTML=`
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                    <p class="text-red-500">Ödevler yüklenirken hata oluştu</p>
                </div>
            `}},renderAssignmentCard(e){const t=window.StudentSubmissionService,i=t?.getAssignmentStatus(e)||{label:"-",icon:"📋",color:"gray"},s=t?.getTimeRemaining(e.due_date)||{text:"-"},n=e.my_submission,a=n?.grade!==null&&n?.grade!==void 0,d={project:"🎯",homework:"📚",quiz:"❓",exam:"📝"}[e.assignment_type]||"📋";return`
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between gap-4"
                onclick="StudentSubmissionModal?.open('${e.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <span class="text-2xl">${d}</span>
                    <div class="min-w-0">
                        <h4 class="font-semibold text-gray-800 dark:text-white truncate">${this.escapeHtml(e.title)}</h4>
                        <div class="flex items-center gap-2 text-sm">
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium 
                                ${i.color==="green"?"bg-green-100 text-green-700":i.color==="orange"?"bg-orange-100 text-orange-700":i.color==="red"?"bg-red-100 text-red-700":i.color==="blue"?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-700"}">
                                ${i.icon} ${i.label}
                            </span>
                            ${e.due_date?`
                                <span class="${s.overdue?"text-red-500":s.urgent?"text-orange-500":"text-gray-400"} text-xs">
                                    ⏰ ${s.text}
                                </span>
                            `:""}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${a?`
                        <span class="font-bold ${n.grade>=e.max_points*.6?"text-green-600":"text-orange-600"}">
                            ${n.grade}/${e.max_points}
                        </span>
                    `:i.canSubmit?`
                        <span class="px-3 py-1 bg-theme text-white rounded-lg text-sm font-medium">Gönder</span>
                    `:""}
                    <span class="text-gray-400">→</span>
                </div>
            </div>
        `},showAllAssignments(){if(window.StudentAssignmentsSection){const e=document.getElementById("sd-assignments");e&&(e.innerHTML=StudentAssignmentsSection.render(),StudentAssignmentsSection.loadData())}},escapeHtml(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}};window.StudentDashboardView=u;
