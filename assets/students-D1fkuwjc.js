const e={students:[],classrooms:[],currentUser:null,onStateChange:null,init:(n,t,a,o)=>{e.currentUser=n,e.students=t||[],e.classrooms=a||[],o&&(e.onStateChange=o.onStateChange),e.renderList()},setStudents:n=>{e.students=n||[],e.renderList()},setClassrooms:n=>{e.classrooms=n||[]},renderList:()=>{const n=document.getElementById("studentsList");if(console.log("[StudentManager] renderList called, container found:",!!n,"students count:",e.students?.length),!n){console.error("[StudentManager] #studentsList container NOT FOUND!");return}const t=document.getElementById("classroomFilter"),a=t?t.value:"all",o=window.StudentsSection?.getSearchQuery?.()||"";if(t&&(t.options.length<=1||t.options.length!==e.classrooms.length+1)){const r=t.value;t.innerHTML='<option value="all">Tüm Sınıflar</option>'+e.classrooms.map(l=>`<option value="${l.id}">${e.escapeHtml(l.name)}</option>`).join(""),t.value=r}let s=e.students;if(a!=="all"&&(s=e.students.filter(r=>r.classroom_id===a)),o&&(s=s.filter(r=>r.display_name?.toLowerCase().includes(o))),s.length===0){const r=e.students.length>0;n.innerHTML=`
                <div class="empty-state py-8">
                    <div class="text-4xl opacity-50 mb-2">${r?"🔍":"👨‍🎓"}</div>
                    <p class="text-sm text-gray-500">${r?"Filtreye uygun öğrenci bulunamadı":"Henüz öğrenci yok"}</p>
                    <p class="text-xs mt-1 text-gray-400">${r?"Farklı bir sınıf seçin veya arama terimini değiştirin":"Öğrenciler sınıf kodunu kullanarak katılabilir"}</p>
                </div>
            `;return}n.innerHTML='<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">'+s.map(r=>{const l=e.classrooms.find(c=>c.id===r.classroom_id),i=r.student_progress?.length||0,d=r.password?"🔒":"",p=r.student_progress?.some(c=>c.course_id==="arduino"||c.project_id?.includes("arduino"))?'<span title="Arduino Modülüne Başlamış">🤖</span>':"";return`
                <div class="group flex items-center justify-between p-2 hover:bg-theme/5 transition-colors cursor-pointer" 
                     onclick="openEditStudentModal('${r.id}')">
                    
                    <div class="flex items-center gap-3 flex-grow min-w-0">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg flex-shrink-0 border border-gray-200 dark:border-gray-600">
                            ${r.avatar_emoji||"🎓"}
                        </div>
                        <div class="min-w-0 flex flex-col justify-center">
                            <div class="flex items-center gap-2">
                                <p class="font-semibold text-gray-800 dark:text-white text-sm truncate leading-none">${e.escapeHtml(r.display_name)}</p>
                                <span class="text-[10px] text-gray-400">${d}</span>
                            </div>
                            <p class="text-[10px] text-gray-500 truncate mt-0.5">${l?.name||"-"} • ${i} ders ${p}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onclick="event.stopPropagation(); openStudentDetailModal('${r.id}')" 
                            class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                            İlerleme
                        </button>
                        <button onclick="event.stopPropagation(); openEditStudentModal('${r.id}')" 
                            class="p-1.5 text-gray-400 hover:text-theme rounded hover:bg-gray-100 transition-colors" title="Düzenle">
                            ✏️
                        </button>
                    </div>
                </div>
            `}).join("")+"</div>"},add:async(n,t,a,o)=>{try{const{data:s,error:r}=await SupabaseClient.getClient().from("students").insert({classroom_id:n,display_name:t,password:a||null,avatar_emoji:o||"🎓"}).select().single();if(r)throw r;return e.students.push(s),e.renderList(),e.onStateChange&&e.onStateChange(),{success:!0,data:s}}catch(s){return console.error("Error adding student:",s),{success:!1,error:s}}},bulkAdd:async n=>{try{const{data:t,error:a}=await SupabaseClient.getClient().from("students").insert(n).select();if(a)throw a;return e.students.push(...t),e.renderList(),e.onStateChange&&e.onStateChange(),{success:!0,data:t}}catch(t){return console.error("Error in bulk add:",t),{success:!1,error:t}}},update:async(n,t)=>{try{const{error:a}=await SupabaseClient.getClient().from("students").update(t).eq("id",n);if(a)throw a;const o=e.students.findIndex(s=>s.id===n);return o!==-1&&(e.students[o]={...e.students[o],...t},e.renderList()),e.onStateChange&&e.onStateChange(),{success:!0}}catch(a){return console.error("Error updating student:",a),{success:!1,error:a}}},delete:async n=>{try{const{error:t}=await SupabaseClient.getClient().from("students").delete().eq("id",n);if(t)throw t;return e.students=e.students.filter(a=>a.id!==n),e.renderList(),e.onStateChange&&e.onStateChange(),{success:!0}}catch(t){return console.error("Error deleting student:",t),{success:!1,error:t}}},printList:()=>{const n=document.getElementById("classroomFilter"),t=n?n.value:"all";let a=e.students;if(t!=="all"&&(a=e.students.filter(i=>i.classroom_id===t)),a.length===0){window.Toast?Toast.warning("Yazdırılacak öğrenci yok"):alert("Yazdırılacak öğrenci yok");return}const o=t==="all"?"Tüm Sınıflar":e.classrooms.find(i=>i.id===t)?.name||"Sınıf",s=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}),r=window.open("","","height=800,width=1000");if(!r){window.Toast&&Toast.error("Pop-up engelleyici aktif olabilir");return}let l="";a.forEach(i=>{const d=e.classrooms.find(u=>u.id===i.classroom_id),p=d?.name||"Sınıfsız",c=d?.code||(d?.id?d.id.substring(0,6).toUpperCase():"-");l+=`
                <div class="student-card">
                    <div class="card-header">
                        <div class="header-text">${e.escapeHtml(p)}</div>
                        <img src="img/logo.svg" alt="Yeti Lab" class="card-logo">
                    </div>
                    <div class="content">
                        <div class="info-row highlight">
                            <span class="label">Sınıf Kodu:</span> 
                            <span class="value code">${c}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Öğrenci:</span> 
                            <span class="value strong">${e.escapeHtml(i.display_name)}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Şifre:</span> 
                            <span class="value monospace">${i.password||"Şifresiz"}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Giriş:</span> 
                            <span class="value link">yetilab.com</span>
                        </div>
                    </div>
                    <div class="cut-line">✂️ ---------------- KESİNİZ ----------------</div>
                </div>
            `}),r.document.write(`
            <!DOCTYPE html>
            <html lang="tr">
            <head>
                <meta charset="UTF-8">
                <title>${o} - Öğrenci Şifre Fişleri</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap');
                    
                    @page { size: A4; margin: 1cm; }
                    
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { 
                        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 0; 
                        padding: 10px;
                        background: white;
                        color: #0f172a;
                    }

                    .page-header { 
                        text-align: center; 
                        margin-bottom: 25px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #e2e8f0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 5px;
                    }
                    .page-header h1 { 
                        font-size: 24px; 
                        color: #0d9488; /* Teal-600 */
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .page-header .info {
                        font-size: 14px;
                        color: #64748b;
                    }

                    .grid-container {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        width: 100%;
                    }

                    .student-card {
                        border: 2px solid #e2e8f0;
                        border-radius: 16px;
                        padding: 20px;
                        background: white;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        min-height: 200px;
                        position: relative;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    }

                    .card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #f1f5f9;
                        padding-bottom: 12px;
                        margin-bottom: 15px;
                    }

                    .header-text {
                        font-size: 18px;
                        font-weight: 700;
                        color: #0f172a;
                    }

                    .card-logo {
                        height: 35px;
                        object-fit: contain;
                    }

                    .content {
                        flex-grow: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 4px 0;
                    }
                    
                    .info-row.highlight {
                        background: #f0fdfa; /* Teal-50 */
                        padding: 6px 10px;
                        border-radius: 8px;
                        border: 1px solid #ccfbf1;
                        margin-bottom: 5px;
                    }

                    .label { 
                        color: #64748b; 
                        font-size: 13px; 
                        font-weight: 500; 
                    }
                    
                    .value { 
                        color: #0f172a; 
                        font-weight: 600; 
                        font-size: 15px;
                        text-align: right; 
                    }
                    
                    .value.code { 
                        font-family: 'JetBrains Mono', 'Courier New', monospace;
                        font-size: 18px; 
                        color: #0d9488;
                        letter-spacing: 1px;
                    }

                    .value.monospace {
                        font-family: 'JetBrains Mono', 'Courier New', monospace;
                        background: #f8fafc;
                        padding: 2px 6px;
                        border-radius: 4px;
                        border: 1px solid #e2e8f0;
                        color: #ea580c; /* Orange */
                    }

                    .value.strong {
                        font-size: 16px;
                    }
                    
                    .value.link {
                        color: #2563eb;
                        text-decoration: underline;
                    }

                    .cut-line {
                        margin-top: 20px;
                        padding-top: 15px;
                        border-top: 1px dashed #cbd5e1;
                        font-size: 10px;
                        color: #94a3b8;
                        text-align: center;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    }

                    @media print {
                        body { background: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .student-card { border-color: #cbd5e1; box-shadow: none; }
                        .info-row.highlight { background: #f0fdfa !important; -webkit-print-color-adjust: exact; }
                        .value.monospace { background: #f8fafc !important; }
                    }

                    @media screen and (max-width: 600px) {
                        .grid-container { grid-template-columns: 1fr; }
                    }
                </style>
            </head>
            <body>
                <div class="page-header">
                    <h1>🎓 ${o}</h1>
                    <div class="info">${s} • ${a.length} öğrenci • Yeti LAB Giriş Bilgileri</div>
                </div>
                
                <div class="grid-container">
                    ${l}
                </div>
                
                <script>
                    window.onload = function() { 
                        setTimeout(function() { window.print(); }, 1000);
                    }
                <\/script>
            </body>
            </html>
        `),r.document.close()},generatePassword:()=>{const n="23456789ABCDEFGHJKLMNPQRSTUVWXYZ";let t="";for(let a=0;a<6;a++)t+=n.charAt(Math.floor(Math.random()*n.length));return t},escapeHtml:n=>{if(!n)return"";if(typeof Utils<"u"&&Utils.escapeHtml)return Utils.escapeHtml(n);const t=document.createElement("div");return t.textContent=n,t.innerHTML},formatDate:n=>{if(!n)return"";if(typeof Utils<"u"&&Utils.formatDate)return Utils.formatDate(n);try{return(n instanceof Date?n:new Date(n)).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}catch{return String(n)}}};window.StudentManager=e;export{e as StudentManager};
