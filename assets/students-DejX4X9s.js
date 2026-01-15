const e={students:[],classrooms:[],currentUser:null,onStateChange:null,init:(r,t,a,i)=>{e.currentUser=r,e.students=t||[],e.classrooms=a||[],i&&(e.onStateChange=i.onStateChange),e.renderList()},setStudents:r=>{e.students=r||[],e.renderList()},setClassrooms:r=>{e.classrooms=r||[]},renderList:()=>{const r=document.getElementById("studentsList");if(console.log("[StudentManager] renderList called, container found:",!!r,"students count:",e.students?.length),!r){console.error("[StudentManager] #studentsList container NOT FOUND!");return}const t=document.getElementById("classroomFilter"),a=t?t.value:"all",i=window.StudentsSection?.getSearchQuery?.()||"";if(t&&(t.options.length<=1||t.options.length!==e.classrooms.length+1)){const n=t.value;t.innerHTML='<option value="all">Tüm Sınıflar</option>'+e.classrooms.map(d=>`<option value="${d.id}">${e.escapeHtml(d.name)}</option>`).join(""),t.value=n}let s=e.students;if(a!=="all"&&(s=e.students.filter(n=>n.classroom_id===a)),i&&(s=s.filter(n=>n.display_name?.toLowerCase().includes(i))),s.length===0){const n=e.students.length>0;r.innerHTML=`
                <div class="empty-state py-8">
                    <div class="text-4xl opacity-50 mb-2">${n?"🔍":"👨‍🎓"}</div>
                    <p class="text-sm text-gray-500">${n?"Filtreye uygun öğrenci bulunamadı":"Henüz öğrenci yok"}</p>
                    <p class="text-xs mt-1 text-gray-400">${n?"Farklı bir sınıf seçin veya arama terimini değiştirin":"Öğrenciler sınıf kodunu kullanarak katılabilir"}</p>
                </div>
            `;return}r.innerHTML='<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">'+s.map(n=>{const d=e.classrooms.find(l=>l.id===n.classroom_id),o=n.student_progress?.length||0,c=n.password?"🔒":"",u=n.student_progress?.some(l=>l.course_id==="arduino"||l.project_id?.includes("arduino"))?'<span title="Arduino Modülüne Başlamış">🤖</span>':"";return`
                <div class="group flex items-center justify-between p-2 hover:bg-theme/5 transition-colors cursor-pointer" 
                     onclick="openEditStudentModal('${n.id}')">
                    
                    <div class="flex items-center gap-3 flex-grow min-w-0">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg flex-shrink-0 border border-gray-200 dark:border-gray-600">
                            ${n.avatar_emoji||"🎓"}
                        </div>
                        <div class="min-w-0 flex flex-col justify-center">
                            <div class="flex items-center gap-2">
                                <p class="font-semibold text-gray-800 dark:text-white text-sm truncate leading-none">${e.escapeHtml(n.display_name)}</p>
                                <span class="text-[10px] text-gray-400">${c}</span>
                            </div>
                            <p class="text-[10px] text-gray-500 truncate mt-0.5">${d?.name||"-"} • ${o} ders ${u}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onclick="event.stopPropagation(); openStudentDetailModal('${n.id}')" 
                            class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                            İlerleme
                        </button>
                        <button onclick="event.stopPropagation(); openEditStudentModal('${n.id}')" 
                            class="p-1.5 text-gray-400 hover:text-theme rounded hover:bg-gray-100 transition-colors" title="Düzenle">
                            ✏️
                        </button>
                    </div>
                </div>
            `}).join("")+"</div>"},add:async(r,t,a,i)=>{try{const{data:s,error:n}=await SupabaseClient.getClient().from("students").insert({classroom_id:r,display_name:t,password:a||null,avatar_emoji:i||"🎓"}).select().single();if(n)throw n;return e.students.push(s),e.renderList(),e.onStateChange&&e.onStateChange(),{success:!0,data:s}}catch(s){return console.error("Error adding student:",s),{success:!1,error:s}}},bulkAdd:async r=>{try{const{data:t,error:a}=await SupabaseClient.getClient().from("students").insert(r).select();if(a)throw a;return e.students.push(...t),e.renderList(),e.onStateChange&&e.onStateChange(),{success:!0,data:t}}catch(t){return console.error("Error in bulk add:",t),{success:!1,error:t}}},update:async(r,t)=>{try{const{error:a}=await SupabaseClient.getClient().from("students").update(t).eq("id",r);if(a)throw a;const i=e.students.findIndex(s=>s.id===r);return i!==-1&&(e.students[i]={...e.students[i],...t},e.renderList()),e.onStateChange&&e.onStateChange(),{success:!0}}catch(a){return console.error("Error updating student:",a),{success:!1,error:a}}},delete:async r=>{try{const{error:t}=await SupabaseClient.getClient().from("students").delete().eq("id",r);if(t)throw t;return e.students=e.students.filter(a=>a.id!==r),e.renderList(),e.onStateChange&&e.onStateChange(),{success:!0}}catch(t){return console.error("Error deleting student:",t),{success:!1,error:t}}},printList:()=>{const r=document.getElementById("classroomFilter"),t=r?r.value:"all";let a=e.students;if(t!=="all"&&(a=e.students.filter(o=>o.classroom_id===t)),a.length===0){window.Toast?Toast.warning("Yazdırılacak öğrenci yok"):alert("Yazdırılacak öğrenci yok");return}const i=t==="all"?"Tüm Sınıflar":e.classrooms.find(o=>o.id===t)?.name||"Sınıf",s=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}),n=window.open("","","height=800,width=1000");if(!n){window.Toast&&Toast.error("Pop-up engelleyici aktif olabilir");return}let d="";a.forEach(o=>{const c=e.classrooms.find(u=>u.id===o.classroom_id)?.name||"Sınıfsız";d+=`
                <div class="student-card">
                    <div class="header">${e.escapeHtml(c)}</div>
                    <div class="content">
                        <div class="info-row"><span class="label">Öğrenci:</span> <span class="value strong">${e.escapeHtml(o.display_name)}</span></div>
                        <div class="info-row"><span class="label">Şifre:</span> <span class="value code">${o.password||"Şifresiz"}</span></div>
                        <div class="info-row"><span class="label">Giriş:</span> <span class="value">yetilab.com</span></div>
                    </div>
                    <div class="cut-line">✂️ ---------------- KESİNİZ ----------------</div>
                </div>
            `}),n.document.write(`
            <!DOCTYPE html>
            <html lang="tr">
            <head>
                <meta charset="UTF-8">
                <title>${i} - Öğrenci Şifre Fişleri</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap');
                    
                    @page { size: A4; margin: 1cm; }
                    
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 10px;
                        background: white;
                        color: #1e293b;
                    }

                    .page-header { 
                        text-align: center; 
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #333;
                    }
                    .page-header h1 { 
                        font-size: 20px; 
                        color: #1f2937; 
                        margin-bottom: 5px;
                    }
                    .page-header .info {
                        font-size: 12px;
                        color: #666;
                    }

                    .grid-container {
                        display: grid;
                        grid-template-columns: 1fr 1fr; /* Yan yana 2 kart */
                        gap: 20px;
                        width: 100%;
                    }

                    .student-card {
                        border: 2px dashed #94a3b8;
                        border-radius: 12px;
                        padding: 16px;
                        background: #f8fafc;
                        break-inside: avoid;       /* Modern tarayıcılar */
                        page-break-inside: avoid;  /* Eski tarayıcılar */
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        min-height: 180px; /* Standart yükseklik */
                    }

                    .student-card .header {
                        font-size: 16px;
                        font-weight: 700;
                        color: #ea580c; /* Orange-600 */
                        border-bottom: 2px solid #e2e8f0;
                        padding-bottom: 8px;
                        margin-bottom: 12px;
                        text-align: center;
                        text-transform: uppercase;
                    }

                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }

                    .label { color: #64748b; font-weight: 500; }
                    .value { color: #0f172a; font-weight: 600; text-align: right; }
                    .value.code { font-family: monospace; font-size: 16px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
                    .value.strong { font-size: 15px; font-weight: 700; }

                    .cut-line {
                        margin-top: auto;
                        padding-top: 10px;
                        font-size: 11px;
                        color: #94a3b8;
                        text-align: center;
                        font-style: italic;
                    }

                    @media print {
                        body { background: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .student-card { border-color: #000; } /* Yazıcıda net çıksın */
                        .page-header { page-break-after: avoid; }
                    }

                    /* Mobilde tek sütun görünsün (önizleme için) */
                    @media screen and (max-width: 600px) {
                        .grid-container { grid-template-columns: 1fr; }
                        .student-card { min-height: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="page-header">
                    <h1>✂️ ${i} - Öğrenci Şifre Fişleri</h1>
                    <div class="info">${s} • ${a.length} öğrenci • Yeti LAB</div>
                </div>
                
                <div class="grid-container">
                    ${d}
                </div>
                
                <script>
                    window.onload = function() { 
                        setTimeout(function() { window.print(); }, 500);
                    }
                <\/script>
            </body>
            </html>
        `),n.document.close()},generatePassword:()=>{const r="23456789ABCDEFGHJKLMNPQRSTUVWXYZ";let t="";for(let a=0;a<6;a++)t+=r.charAt(Math.floor(Math.random()*r.length));return t},escapeHtml:r=>{if(!r)return"";if(typeof Utils<"u"&&Utils.escapeHtml)return Utils.escapeHtml(r);const t=document.createElement("div");return t.textContent=r,t.innerHTML},formatDate:r=>{if(!r)return"";if(typeof Utils<"u"&&Utils.formatDate)return Utils.formatDate(r);try{return(r instanceof Date?r:new Date(r)).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}catch{return String(r)}}};window.StudentManager=e;export{e as StudentManager};
