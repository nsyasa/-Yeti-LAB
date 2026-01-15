const f={projectsCache:{},async loadProjects(){try{const{data:i,error:s}=await SupabaseClient.getClient().from("courses").select("id, slug, title").eq("is_published",!0);if(s)throw s;const{data:a,error:o}=await SupabaseClient.getClient().from("projects").select("id, slug, title, course_id, phase_id, position").eq("is_published",!0).order("position",{ascending:!0});if(o)throw o;return this.projectsCache={},i.forEach(e=>{const r=a.filter(t=>t.course_id===e.id).map(t=>({id:t.slug,dbId:t.id,title:t.title,course:e.title,courseSlug:e.slug}));this.projectsCache[e.slug]=r}),this.projectsCache}catch(i){return console.error("Error loading projects:",i),window.showToast&&window.showToast("Proje listesi yüklenemedi","error"),{}}},async renderCourseProgress(i,s){const a=document.getElementById(i);if(a){a.innerHTML=`
            <div class="flex justify-center py-8">
                <div class="spinner"></div>
            </div>
        `;try{if(!s||s.length===0){a.innerHTML=`
                    <div class="empty-state">
                        <div class="icon">👨‍🎓</div>
                        <p>Henüz öğrenci yok</p>
                        <p class="text-sm mt-2">İlerleme verisi görüntülemek için önce öğrenci gerekli</p>
                    </div>
                `;return}const o=s.map(n=>n.id),{data:e,error:r}=await SupabaseClient.getClient().from("student_progress").select("student_id, course_id, project_id, completed_at").in("student_id",o);if(r)throw r;const t=e?.length||0,d=document.getElementById("statCompletedLessons");if(d&&(d.textContent=t),!e||e.length===0){a.innerHTML=`
                    <div class="empty-state">
                        <div class="icon">📊</div>
                        <p>Henüz tamamlanan ders yok</p>
                        <p class="text-sm mt-2">Öğrenciler ders tamamladıkça burada görünecek</p>
                    </div>
                `;return}const c={};e.forEach(n=>{if(c[n.course_id]||(c[n.course_id]={courseKey:n.course_id,students:{},totalCompleted:0}),!c[n.course_id].students[n.student_id]){const p=s.find(u=>u.id===n.student_id);c[n.course_id].students[n.student_id]={name:p?.display_name||"Bilinmeyen",completed:[]}}c[n.course_id].students[n.student_id].completed.push(n.project_id),c[n.course_id].totalCompleted++});const l={arduino:"🔌 Arduino",microbit:"📟 Micro:bit",scratch:"🐱 Scratch",mblock:"🤖 mBlock",appinventor:"📱 App Inventor"};let m="";Object.entries(c).forEach(([n,p])=>{const u=l[n]||n,h=Object.entries(p.students);m+=`
                    <div class="glass-card rounded-xl p-4 mb-4">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="font-bold text-lg text-gray-800 dark:text-white">${u}</h4>
                            <span class="text-sm text-gray-500">${p.totalCompleted} tamamlama</span>
                        </div>
                        <div class="space-y-3">
                            ${h.map(([x,g])=>{const y=g.completed.length;return`
                                    <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div class="w-10 h-10 rounded-full bg-theme/10 flex items-center justify-center text-xl">🎓</div>
                                        <div class="flex-grow">
                                            <p class="font-medium text-gray-800 dark:text-white">${f.escapeHtml(g.name)}</p>
                                            <p class="text-sm text-gray-500">${y} ders tamamladı</p>
                                        </div>
                                        <div class="flex gap-1">
                                            ${g.completed.slice(0,5).map(()=>'<span class="text-green-500">✓</span>').join("")}
                                            ${y>5?`<span class="text-gray-400 text-sm">+${y-5}</span>`:""}
                                        </div>
                                    </div>
                                `}).join("")}
                        </div>
                    </div>
                `}),a.innerHTML=m||`
                <div class="empty-state">
                    <div class="icon">📊</div>
                    <p>İlerleme verisi henüz yok</p>
                </div>
            `}catch(o){console.error("Error loading progress:",o),a.innerHTML=`
                <div class="empty-state">
                    <div class="icon">❌</div>
                    <p>Veri yüklenirken hata oluştu</p>
                    <button onclick="TeacherAnalytics.renderCourseProgress('courseProgress', window.loadStudents ? students : [])" class="mt-4 px-4 py-2 bg-theme text-white rounded-lg">Tekrar Dene</button>
                </div>
            `}}},renderStudentDetailStats(i){const s=i.length,a=s*50,o=Math.floor(a/500)+1,e=[];s>=1&&e.push({icon:"🎉",name:"İlk Adım"}),s>=5&&e.push({icon:"🚀",name:"Hızlı Başlangıç"}),s>=10&&e.push({icon:"⭐",name:"Kodlama Yıldızı"}),s>=20&&e.push({icon:"🏆",name:"Uzman Kodlayıcı"}),s>=50&&e.push({icon:"👑",name:"Yeti Ustası"}),document.getElementById("detailCompletedCount").textContent=s,document.getElementById("detailXP").textContent=a,document.getElementById("detailLevel").textContent=o;const r=document.getElementById("detailBadges");r&&(e.length===0?r.innerHTML='<span class="text-gray-400 text-sm">Henüz rozet yok</span>':r.innerHTML=e.map(t=>`
                    <div class="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span class="text-2xl mb-1">${t.icon}</span>
                        <span class="text-[10px] text-gray-500 text-center leading-tight">${t.name}</span>
                    </div>
                `).join(""))},renderStudentProjectList(i,s){const a=document.getElementById(i);if(!a)return;const o={arduino:"Arduino",microbit:"Micro:bit",scratch:"Scratch",mblock:"mBlock",appinventor:"App Inventor"};let e='<div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">';Object.keys(this.projectsCache).length===0?(e+=`
                <div class="text-center py-4 text-gray-400 text-sm">
                    <p>Proje listesi yükleniyor...</p>
                </div>
            `,this.loadProjects().then(()=>{document.getElementById(i)&&this.renderStudentProjectList(i,s)})):Object.entries(this.projectsCache).forEach(([r,t])=>{const d=o[r]||r,c=t.filter(l=>s.includes(l.dbId)).length;t.length!==0&&(e+=`
                    <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-1 mb-2">
                            <h5 class="font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">${d}</h5>
                            <span class="text-xs text-gray-400">${c}/${t.length}</span>
                        </div>
                        <div class="space-y-1">
                `,t.forEach(l=>{const m=s.includes(l.dbId),n=m?"✅":"⬜";e+=`
                        <div class="flex items-center justify-between p-1.5 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors">
                            <span class="text-sm ${m?"text-gray-900 dark:text-white font-medium":"text-gray-400 dark:text-gray-500"}">${l.title}</span>
                            <span class="text-sm">${n}</span>
                        </div>
                    `}),e+="</div></div>")}),e+="</div>",a.innerHTML=e},renderStudentRecentLessons(i,s){const a=document.getElementById(i);if(!a)return;const o=r=>typeof window.formatRelativeTime=="function"?window.formatRelativeTime(r):typeof Utils<"u"&&Utils.formatDate?Utils.formatDate(r):r,e=r=>r.split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ");if(s.length===0)a.innerHTML='<p class="text-xs text-center text-gray-400 py-2">Ders kaydı yok</p>';else{const r=t=>{for(const d of Object.values(this.projectsCache)){const c=d.find(l=>l.dbId===t);if(c)return c.title}return e(t)};a.innerHTML=`
                <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                    ${s.sort((t,d)=>new Date(d.completed_at)-new Date(t.completed_at)).map(t=>`
                        <div class="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-600 last:border-0 text-xs">
                             <span class="text-gray-600 dark:text-gray-300 truncate pr-2">${r(t.project_id)}</span>
                             <span class="text-gray-400 whitespace-nowrap">${o(t.completed_at)}</span>
                        </div>
                    `).join("")}
                </div>
             `}},escapeHtml:i=>{if(!i)return"";if(typeof Utils<"u"&&Utils.escapeHtml)return Utils.escapeHtml(i);const s=document.createElement("div");return s.textContent=i,s.innerHTML}};window.TeacherAnalytics=f;
