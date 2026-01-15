const l={courses:[],init(){this.refreshList()},refreshList(){if(this.courses=[],typeof admin<"u"&&admin.allCourseData&&Object.keys(admin.allCourseData).length>0)this.courses=Object.entries(admin.allCourseData).map(([e,t])=>({key:e,title:t.title||e,description:t.description||"",icon:t.icon||"📦",position:t._position!==void 0?t._position:999,_supabaseId:t._supabaseId}));else if(typeof CourseLoader<"u"){const e=CourseLoader.getManifest();this.courses=Object.entries(e).map(([t,r])=>({key:t,title:r.title||t,description:r.description||"",icon:r.icon||"📦",position:r.position!==void 0?r.position:999}))}this.courses.sort((e,t)=>{const r=e.position!==void 0?e.position:999,o=t.position!==void 0?t.position:999;return r-o})},renderSelectorGrid(){const e=document.getElementById("course-selector-grid");if(!e)return;if(this.courses.length===0){e.innerHTML='<div class="col-span-full text-center text-gray-400 py-4">Kayıtlı kurs yok.</div>';return}const t=admin.currentCourseKey;e.innerHTML=this.courses.map((r,o)=>{const s=r.key===t,a=o===0,n=o===this.courses.length-1;return`
            <div class="relative group">
                <button type="button" onclick="CourseManager.selectCourse('${r.key}')"
                    class="w-full p-3 rounded-lg border-2 transition text-left ${s?"border-theme bg-theme/10 dark:bg-theme/20 shadow-md":"border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow"}">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">${r.icon||"📦"}</span>
                        <div class="flex-1 min-w-0">
                            <div class="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">${r.title}</div>
                            <div class="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">${r.key}</div>
                        </div>
                    </div>
                </button>
                <!-- Reorder buttons (on hover) -->
                <div class="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onclick="event.stopPropagation(); CourseManager.moveUp(${o})" 
                        class="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs ${a?"invisible":""}"
                        title="Yukarı">↑</button>
                    <button type="button" onclick="event.stopPropagation(); CourseManager.moveDown(${o})" 
                        class="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs ${n?"invisible":""}"
                        title="Aşağı">↓</button>
                </div>
            </div>`}).join("")},selectCourse(e){typeof admin<"u"&&admin.changeCourse&&(admin.changeCourse(e),this.renderSelectorGrid())},showInlineAddForm(){const e=document.getElementById("inline-add-course-form");e&&(e.classList.remove("hidden"),document.getElementById("inline-course-icon").value="📚",document.getElementById("inline-course-title").value="",document.getElementById("inline-course-key").value="",document.getElementById("inline-course-desc").value="",document.getElementById("inline-course-title").focus())},hideInlineAddForm(){const e=document.getElementById("inline-add-course-form");e&&e.classList.add("hidden")},async createFromInline(){const e=document.getElementById("inline-course-icon").value||"📚",t=document.getElementById("inline-course-title").value;let r=document.getElementById("inline-course-key").value;const o=document.getElementById("inline-course-desc").value;if(r&&(r=r.toLowerCase().trim().replace(/_/g,"-").replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),document.getElementById("inline-course-key").value=r),!t||!r){alert("Lütfen başlık ve anahtar alanlarını doldurun.");return}if(!/^[a-z0-9-]+$/.test(r)){alert("Anahtar sadece küçük harf, rakam ve tire içerebilir.");return}if(this.courses.find(s=>s.key===r)){alert("Bu anahtara sahip bir kurs zaten var.");return}try{typeof admin<"u"&&admin.showLoading&&admin.showLoading("Kurs oluşturuluyor...");let s=null;if(typeof SupabaseClient<"u"&&SupabaseClient.client){const{data:a,error:n}=await SupabaseClient.client.from("courses").insert({slug:r,title:t,description:o,meta:{icon:e},is_published:!0,position:this.courses.length}).select("id").single();if(n)throw n;s=a.id,await SupabaseClient.client.from("phases").insert({course_id:s,name:"Başlangıç",description:"İlk adımlar",position:0,meta:{color:"blue",icon:"🚀"}})}typeof admin<"u"&&(admin.allCourseData[r]={title:t,description:o,icon:e,_supabaseId:s,_phaseIds:{},_projectIds:{},data:{phases:[{color:"blue",title:"Başlangıç",description:"İlk adımlar",icon:"🚀"}],projects:[],componentInfo:{}}}),this.hideInlineAddForm(),this.renderSelectorGrid(),typeof admin<"u"&&admin.changeCourse&&await admin.changeCourse(r),alert(`✅ "${t}" kursu oluşturuldu!`)}catch(s){console.error(s),alert("Kurs oluşturulurken hata oluştu: "+s.message)}finally{typeof admin<"u"&&admin.hideLoading&&admin.hideLoading()}},renderManagementModal(){const e="course-management-modal";let t=document.getElementById(e);t||(t=document.createElement("div"),t.id=e,t.className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center hidden",t.innerHTML=`
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <!-- Header -->
                    <div class="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h3 class="text-xl font-bold text-gray-800">Kurs Yönetimi</h3>
                        <button onclick="CourseManager.closeModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>

                    <!-- Content -->
                    <div class="p-6 overflow-y-auto flex-1">
                        
                        <!-- Actions -->
                        <div class="mb-6 flex justify-end">
                            <button onclick="CourseManager.showAddForm()" class="px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-dark flex items-center gap-2">
                                <span>➕</span> Yeni Kurs Ekle
                            </button>
                        </div>

                        <!-- Course List -->
                        <div id="course-list-container" class="space-y-3">
                            <!-- Populated by JS -->
                        </div>

                        <!-- Add Form (Hidden by default) -->
                        <div id="add-course-form" class="hidden mt-6 p-4 border rounded-lg bg-gray-50">
                            <h4 class="font-bold mb-4">Yeni Kurs Ekle</h4>
                            <div class="space-y-3">
                                <input type="text" id="new-course-title" placeholder="Kurs Başlığı" class="w-full p-2 border rounded">
                                <input type="text" id="new-course-key" placeholder="Kurs Anahtarı (örn: arduino-advanced)" class="w-full p-2 border rounded">
                                <input type="text" id="new-course-desc" placeholder="Açıklama" class="w-full p-2 border rounded">
                                <div class="flex gap-2">
                                    <input type="text" id="new-course-icon" placeholder="Emoji İkonu" class="w-20 p-2 border rounded text-center text-xl">
                                    <input type="color" id="new-course-color" value="#3b82f6" class="h-10 w-20 p-1 border rounded cursor-pointer">
                                </div>
                                <div class="flex justify-end gap-2 mt-4">
                                    <button onclick="CourseManager.hideAddForm()" class="px-3 py-1 text-gray-500 hover:bg-gray-200 rounded">İptal</button>
                                    <button onclick="CourseManager.createCourse()" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Oluştur</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            `,document.body.appendChild(t)),this.renderList(),t.classList.remove("hidden")},closeModal(){const e=document.getElementById("course-management-modal");e&&e.classList.add("hidden")},renderList(){const e=document.getElementById("course-list-container");if(e){if(this.refreshList(),this.courses.length===0){e.innerHTML='<div class="text-center text-gray-400 py-4">Kayıtlı kurs yok.</div>';return}e.innerHTML=this.courses.map((t,r)=>{const o=r===0,s=r===this.courses.length-1;return`
            <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm hover:shadow transition group" draggable="true" ondragstart="CourseManager.dragStart(event, ${r})" ondragover="CourseManager.allowDrop(event)" ondrop="CourseManager.drop(event, ${r})">
                <div class="flex items-center gap-4">
                    <div class="flex flex-col items-center gap-1">
                        <span class="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5">#${r+1}</span>
                        <span class="cursor-move text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 text-lg">☰</span>
                    </div>
                    <div class="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-2xl">${t.icon||"📦"}</div>
                    <div>
                        <div class="font-bold text-gray-800 dark:text-gray-100">${t.title}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">${t.key}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="event.stopPropagation(); CourseManager.moveUp(${r})" 
                            class="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm ${o?"invisible":""}" 
                            title="Yukarı Taşı">↑</button>
                        <button onclick="event.stopPropagation(); CourseManager.moveDown(${r})" 
                            class="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm ${s?"invisible":""}" 
                            title="Aşağı Taşı">↓</button>
                    </div>
                    <button onclick="CourseManager.deleteCourse('${t.key}')" class="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Sil">🗑️</button>
                </div>
            </div>`}).join("")}},showAddForm(){document.getElementById("add-course-form").classList.remove("hidden"),document.getElementById("course-list-container").classList.add("hidden")},hideAddForm(){document.getElementById("add-course-form").classList.add("hidden"),document.getElementById("course-list-container").classList.remove("hidden")},async createCourse(){const e=document.getElementById("new-course-title").value;let t=document.getElementById("new-course-key").value;const r=document.getElementById("new-course-desc").value,o=document.getElementById("new-course-icon").value||"📚",s=document.getElementById("new-course-color").value;if(t&&(t=t.toLowerCase().trim().replace(/_/g,"-").replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""),document.getElementById("new-course-key").value=t),!e||!t){alert("Lütfen başlık ve anahtar alanlarını doldurun.");return}if(!/^[a-z0-9-]+$/.test(t)){alert("Anahtar sadece küçük harf, rakam ve tire içerebilir.");return}if(this.courses.find(a=>a.key===t)){alert("Bu anahtara sahip bir kurs zaten var.");return}try{typeof admin<"u"&&admin.showLoading&&admin.showLoading("Kurs oluşturuluyor...");let a=null;if(typeof SupabaseClient<"u"&&SupabaseClient.client){const{data:n,error:i}=await SupabaseClient.client.from("courses").insert({slug:t,title:e,description:r,meta:{icon:o,color:s},is_published:!0,position:this.courses.length}).select("id").single();if(i)throw i;a=n.id;const{error:d}=await SupabaseClient.client.from("phases").insert({course_id:a,name:"Başlangıç",description:"İlk adımlar",position:0,meta:{color:"blue",icon:"🚀"}});d&&console.error("Phase creation error:",d)}typeof admin<"u"&&(admin.allCourseData[t]={title:e,description:r,icon:o,_supabaseId:a,_phaseIds:{},_projectIds:{},data:{phases:[{color:"blue",title:"Başlangıç",description:"İlk adımlar",icon:"🚀"}],projects:[],componentInfo:{}}},admin.populateCourseSelector&&admin.populateCourseSelector()),this.hideAddForm(),this.closeModal(),typeof admin<"u"&&admin.changeCourse?(await admin.changeCourse(t),alert(`✅ "${e}" kursu oluşturuldu!`)):alert("✅ Kurs Supabase'e kaydedildi! Sayfayı yenileyerek kursu görebilirsiniz.")}catch(a){console.error(a),alert("Kurs oluşturulurken hata oluştu: "+a.message)}finally{typeof admin<"u"&&admin.hideLoading&&admin.hideLoading()}},async deleteCourse(e){try{if(typeof SupabaseClient<"u"&&SupabaseClient.client){const{error:t}=await SupabaseClient.client.from("courses").delete().eq("slug",e);if(t)throw t}typeof CourseLoader<"u"&&delete CourseLoader.manifest[e],this.renderList(),alert("Kurs silindi."),location.reload()}catch(t){console.error(t),alert("Silme işlemi başarısız: "+t.message)}},async moveUp(e){if(e<=0)return;const t=this.courses[e];this.courses[e]=this.courses[e-1],this.courses[e-1]=t,this.renderList(),this.renderSelectorGrid(),await this.saveOrder()},async moveDown(e){if(e>=this.courses.length-1)return;const t=this.courses[e];this.courses[e]=this.courses[e+1],this.courses[e+1]=t,this.renderList(),this.renderSelectorGrid(),await this.saveOrder()},dragStart(e,t){e.dataTransfer.setData("text/plain",t),e.dataTransfer.effectAllowed="move"},allowDrop(e){e.preventDefault(),e.dataTransfer.dropEffect="move"},async drop(e,t){e.preventDefault();const r=parseInt(e.dataTransfer.getData("text/plain"));if(r===t)return;const o=this.courses.splice(r,1)[0];this.courses.splice(t,0,o),this.renderList(),await this.saveOrder()},async saveOrder(){if(!(typeof SupabaseClient>"u"||!SupabaseClient.client))try{const e=this.courses.map((t,r)=>SupabaseClient.updateCourseBySlug(t.key,{position:r}));await Promise.all(e)}catch(e){console.error("Failed to save order",e)}}};window.CourseManager=l;
