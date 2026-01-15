const n={classrooms:[],currentUser:null,onStateChange:null,init:(t,s,e)=>{console.log("[ClassroomManager] init called with:",{user_id:t?.id,classrooms_count:s?.length||0,classrooms:s}),n.currentUser=t,n.classrooms=s||[],e&&(n.onStateChange=e.onStateChange),n.renderList()},setValidClassrooms:t=>{n.classrooms=t||[],n.renderList()},renderList:()=>{const t=document.getElementById("classroomsList");if(console.log("[ClassroomManager] renderList called, container found:",!!t,"classrooms count:",n.classrooms?.length),!t){console.error("[ClassroomManager] #classroomsList container NOT FOUND!");return}t.className="flex flex-col gap-3";let s="";if(s+=`
        <div id="new-class-form-row" class="hidden w-full bg-slate-800 border-l-4 border-orange-500 rounded-lg p-6 mb-6 shadow-xl transition-all duration-300">
            <div class="flex flex-col gap-4">
                <h3 class="text-white font-bold text-lg border-b border-slate-700 pb-2">✨ Yeni Sınıf Oluştur</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs text-slate-400 block mb-1">Sınıf Adı</label>
                        <input type="text" id="new-class-name" placeholder="Örn: 5-A" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="text-xs text-slate-400 block mb-1">Açıklama</label>
                        <input type="text" id="new-class-desc" placeholder="Açıklama..." class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-orange-500">
                    </div>
                </div>
                <div class="flex items-center justify-between mt-2">
                    <label class="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-2 rounded border border-slate-700 select-none">
                        <input type="checkbox" id="new-class-password" class="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 bg-slate-800 border-slate-600">
                        <span class="text-sm text-slate-300">🔒 Şifreli Giriş</span>
                    </label>
                    <div class="flex gap-2">
                        <button onclick="ClassroomManager.toggleNewClassForm()" class="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm">İptal</button>
                        <button onclick="ClassroomManager.createFromForm()" class="px-6 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform">✓ Sınıfı Oluştur</button>
                    </div>
                </div>
            </div>
        </div>
        `,n.classrooms.length===0){s+=`
                <div class="w-full">
                    <div class="empty-state py-12 text-center">
                        <div class="text-5xl mb-3">🏫</div>
                        <p class="text-gray-500 dark:text-gray-400 font-medium">Henüz sınıf oluşturmadınız</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Yukarıdan "Yeni Sınıf" butonuna tıklayın</p>
                    </div>
                </div>
            `,t.innerHTML=s;return}s+=n.classrooms.map(e=>{const r=e.students?.[0]?.count||0,a=e.is_active?"✅":"⏸️",o=e.is_active?"Aktif":"Duraklatıldı",l=n.escapeHtml(e.name),i=n.escapeHtml(e.description||"");return`
                <div class="w-full bg-slate-800 rounded-lg border border-slate-700 mb-4 overflow-hidden shadow-sm hover:border-slate-500 transition-all" data-classroom-id="${e.id}">
                    <!-- Main Row - Flex-col on mobile, flex-row on desktop -->
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
                        
                        <!-- Left: Icon + Name + Info -->
                        <div class="flex items-center gap-3 w-full md:w-auto">
                            <div class="w-12 h-12 md:w-10 md:h-10 rounded-full bg-slate-700 flex items-center justify-center text-2xl md:text-xl shrink-0">
                                🏫
                            </div>
                            
                            <div class="flex flex-col min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <h4 class="text-white font-bold text-base md:text-sm truncate" id="name-display-${e.id}">${l}</h4>
                                    <span class="text-xs" title="${o}">${a}</span>
                                </div>
                                <div class="flex items-center gap-2 text-sm text-slate-400 mt-1 flex-wrap">
                                    <span class="text-orange-400 font-medium whitespace-nowrap">
                                        👨‍🎓 <span class="student-count-value">${r}</span> öğrenci
                                    </span>
                                    <span class="text-slate-500 text-xs hidden sm:inline">• ${n.formatDate(e.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Right: Code + Action Buttons -->
                        <div class="flex items-center justify-between w-full md:w-auto gap-2 md:gap-3 border-t md:border-t-0 border-slate-700 pt-3 md:pt-0">
                            
                            <!-- Classroom Code Badge -->
                            <button onclick="ClassroomManager.copyCode('${e.code}', event)" 
                                class="flex items-center gap-1 bg-slate-900 px-2 md:px-3 py-2 rounded border border-slate-600 cursor-pointer active:scale-95 transition-transform hover:border-emerald-500"
                                title="Kodu Kopyala">
                                <span class="text-[10px] sm:text-xs text-slate-500 font-bold">Sınıf Kodu:</span>
                                <span class="text-white font-mono font-bold tracking-widest text-sm md:text-base">${e.code}</span>
                                <span class="text-slate-500 text-xs">📋</span>
                            </button>

                            <!-- Action Buttons - Icons only on mobile -->
                            <div class="flex items-center gap-1 md:gap-2">
                                <!-- Add Student (Green) -->
                                <button onclick="ClassroomManager.togglePanel('${e.id}', 'single')"
                                    class="h-9 md:h-10 px-2 md:px-3 rounded bg-emerald-900/30 border border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center"
                                    title="Öğrenci Ekle">
                                    <span class="text-base md:text-lg font-bold">+</span>
                                    <span class="hidden md:inline ml-1 text-xs font-medium">Ekle</span>
                                </button>
                                
                                <!-- Bulk Add (Purple) -->
                                <button onclick="ClassroomManager.togglePanel('${e.id}', 'bulk')"
                                    class="h-9 md:h-10 px-2 md:px-3 rounded border border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center"
                                    title="Toplu Ekle">
                                    <span class="text-base md:text-lg">👥</span>
                                    <span class="hidden md:inline ml-1 text-xs font-medium">Toplu</span>
                                </button>
                                
                                <!-- Settings -->
                                <button onclick="ClassroomManager.togglePanel('${e.id}', 'settings')"
                                    class="h-9 md:h-10 px-2 md:px-3 rounded border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex items-center justify-center"
                                    title="Ayarlar">
                                    <span class="text-base md:text-lg">⚙️</span>
                                </button>
                                
                                <!-- Delete (Red) -->
                                <button onclick="ClassroomManager.confirmDelete('${e.id}', '${l}')"
                                    class="h-9 md:h-10 px-2 md:px-3 rounded border border-red-800 text-red-400 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                                    title="Sil">
                                    <span class="text-base md:text-lg">🗑️</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Expand Panel (Hidden by default) -->
                    <div id="panel-${e.id}" class="classroom-panel hidden bg-slate-900/50 border-t border-slate-700 p-4">
                        
                        <!-- Single Add Form (Green theme) -->
                        <div id="single-form-${e.id}" class="hidden">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-sm">👤</span>
                                <span class="text-xs font-semibold text-emerald-400">Tek Öğrenci Ekle</span>
                            </div>
                            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <input type="text" 
                                    id="input-name-${e.id}"
                                    placeholder="Öğrenci adı girin..."
                                    class="flex-1 px-3 py-2 text-sm rounded-lg border border-emerald-600 bg-slate-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                                <div class="flex gap-2">
                                    <button onclick="ClassroomManager.addSingleStudent('${e.id}')"
                                        class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                                        Kaydet
                                    </button>
                                    <button onclick="ClassroomManager.closePanel('${e.id}')"
                                        class="px-3 py-2 text-sm rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors">
                                        İptal
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bulk Add Form (Purple theme) -->
                        <div id="bulk-form-${e.id}" class="hidden">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-sm">👥</span>
                                <span class="text-xs font-semibold text-purple-400">Toplu Öğrenci Ekle</span>
                            </div>
                            <div class="space-y-3">
                                <textarea 
                                    id="input-bulk-${e.id}"
                                    rows="4"
                                    placeholder="Her satıra bir öğrenci adı yazın...&#10;Ali Veli&#10;Ayşe Fatma&#10;Mehmet Yılmaz"
                                    class="w-full px-3 py-2 text-sm rounded-lg border border-purple-600 bg-slate-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"></textarea>
                                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div class="flex gap-2">
                                        <button onclick="ClassroomManager.addBulkStudents('${e.id}')"
                                            class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                                            Tümünü Ekle
                                        </button>
                                        <button onclick="ClassroomManager.closePanel('${e.id}')"
                                            class="px-3 py-2 text-sm rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors">
                                            İptal
                                        </button>
                                    </div>
                                    <span class="text-xs text-slate-400 sm:ml-auto text-center sm:text-right">Her satır = 1 öğrenci</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Settings Form (Blue theme) -->
                        <div id="settings-form-${e.id}" class="hidden">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-sm">⚙️</span>
                                <span class="text-xs font-semibold text-blue-400">Sınıf Ayarları</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-xs font-medium text-slate-400 mb-1">Sınıf Adı</label>
                                    <input type="text" 
                                        id="settings-name-${e.id}"
                                        value="${l}"
                                        class="w-full px-3 py-2 text-sm rounded-lg border border-blue-600 bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-400 mb-1">Açıklama</label>
                                    <input type="text" 
                                        id="settings-desc-${e.id}"
                                        value="${i}"
                                        placeholder="Açıklama ekleyin..."
                                        class="w-full px-3 py-2 text-sm rounded-lg border border-blue-600 bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                </div>
                            </div>
                            <div class="flex items-center gap-4 mb-4">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" 
                                        id="settings-active-${e.id}"
                                        ${e.is_active?"checked":""}
                                        class="w-4 h-4 text-blue-600 rounded border-slate-500 focus:ring-blue-500 bg-slate-700">
                                    <span class="text-xs text-slate-400">Sınıf Aktif</span>
                                </label>
                            </div>
                            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div class="flex gap-2">
                                    <button onclick="ClassroomManager.saveSettings('${e.id}')"
                                        class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                        Güncelle
                                    </button>
                                    <button onclick="ClassroomManager.closePanel('${e.id}')"
                                        class="px-3 py-2 text-sm rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700 transition-colors">
                                        İptal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `}).join(""),t.innerHTML=s},create:async(t,s,e)=>{const r=e?.innerHTML;e&&(e.disabled=!0,e.innerHTML='<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Oluşturuluyor...');try{const a=n.currentUser||(typeof Auth<"u"?Auth.currentUser:null);if(!a)throw new Error("Kullanıcı oturumu bulunamadı");const{data:o,error:l}=await SupabaseClient.getClient().from("classrooms").insert({teacher_id:a.id,name:t,description:s||null}).select().single();if(l)throw l;return n.classrooms.push(o),n.renderList(),n.onStateChange&&n.onStateChange(),{success:!0,data:o}}catch(a){return console.error("Error creating classroom:",a),{success:!1,error:a}}finally{e&&(e.disabled=!1,e.innerHTML=r||"Oluştur")}},toggle:async(t,s)=>{try{const{error:e}=await SupabaseClient.getClient().from("classrooms").update({is_active:s}).eq("id",t);if(e)throw e;const r=n.classrooms.find(a=>a.id===t);return r&&(r.is_active=s),n.renderList(),{success:!0}}catch(e){return console.error("Error toggling classroom:",e),{success:!1,error:e}}},update:async(t,s)=>{try{const{data:e,error:r}=await SupabaseClient.getClient().from("classrooms").update(s).eq("id",t).select().single();if(r)throw r;const a=n.classrooms.findIndex(o=>o.id===t);return a!==-1&&(n.classrooms[a]={...n.classrooms[a],...e}),n.renderList(),n.onStateChange&&n.onStateChange(),{success:!0,data:e}}catch(e){return console.error("Error updating classroom:",e),{success:!1,error:e}}},delete:async t=>{try{const{data:s}=await SupabaseClient.getClient().from("students").select("id").eq("classroom_id",t);if(s&&s.length>0){const r=s.map(o=>o.id);await SupabaseClient.getClient().from("student_progress").delete().in("student_id",r);const{error:a}=await SupabaseClient.getClient().from("students").delete().eq("classroom_id",t);if(a)throw console.error("Error deleting students:",a),a}const{error:e}=await SupabaseClient.getClient().from("classrooms").delete().eq("id",t);if(e)throw e;return n.classrooms=n.classrooms.filter(r=>r.id!==t),n.renderList(),n.onStateChange&&n.onStateChange(),{success:!0}}catch(s){return console.error("Error deleting classroom:",s),{success:!1,error:s}}},escapeHtml:t=>{if(!t)return"";const s=document.createElement("div");return s.textContent=t,s.innerHTML},formatDate:t=>{if(!t)return"";if(typeof Utils<"u"&&Utils.formatDate)return Utils.formatDate(t);try{return new Date(t).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}catch{return t}},closeAllMenus:()=>{document.querySelectorAll(".dropdown-menu").forEach(t=>{t.classList.add("hidden")})},closeAllPanels:()=>{const t=document.getElementById("new-class-form-row");t&&t.classList.add("hidden"),document.querySelectorAll(".classroom-panel").forEach(s=>{s.classList.add("hidden")}),document.querySelectorAll('.classroom-panel [id^="single-form-"]').forEach(s=>{s.classList.add("hidden")}),document.querySelectorAll('.classroom-panel [id^="bulk-form-"]').forEach(s=>{s.classList.add("hidden")}),document.querySelectorAll('.classroom-panel [id^="settings-form-"]').forEach(s=>{s.classList.add("hidden")})},closePanel:t=>{const s=document.getElementById(`panel-${t}`);s&&s.classList.add("hidden");const e=document.getElementById(`single-form-${t}`),r=document.getElementById(`bulk-form-${t}`),a=document.getElementById(`settings-form-${t}`);e&&e.classList.add("hidden"),r&&r.classList.add("hidden"),a&&a.classList.add("hidden")},togglePanel:(t,s)=>{const e=document.getElementById(`panel-${t}`),r=document.getElementById(`single-form-${t}`),a=document.getElementById(`bulk-form-${t}`),o=document.getElementById(`settings-form-${t}`);if(!e){console.error("[ClassroomManager] Panel not found for:",t);return}let l;if(s==="single"?l=r:s==="bulk"?l=a:s==="settings"&&(l=o),!l){console.error("[ClassroomManager] Form not found:",s,t);return}const i=!e.classList.contains("hidden")&&!l.classList.contains("hidden");if(n.closeAllPanels(),!i){if(e.classList.remove("hidden"),l.classList.remove("hidden"),s==="single"){const d=document.getElementById(`input-name-${t}`);d&&d.focus()}else if(s==="bulk"){const d=document.getElementById(`input-bulk-${t}`);d&&d.focus()}else if(s==="settings"){const d=document.getElementById(`settings-name-${t}`);d&&d.focus()}}},copyCode:(t,s)=>{s&&s.stopPropagation(),navigator.clipboard.writeText(t).then(()=>{Toast.info("Sınıf kodu panoya kopyalandı 📋")}).catch(()=>{Toast.error("Kopyalama başarısız")})},addSingleStudent:async t=>{const s=document.getElementById(`input-name-${t}`),e=s?.value?.trim();if(!e){Toast.error("Öğrenci adı gerekli");return}try{if(!(n.currentUser||(typeof Auth<"u"?Auth.currentUser:null)))throw new Error("Kullanıcı bulunamadı");const{data:a,error:o}=await SupabaseClient.getClient().from("students").insert({classroom_id:t,display_name:e,avatar_emoji:"🎓",added_by_teacher:!0}).select().single();if(o)throw o;s.value="",n.closePanel(t),n.updateStudentCount(t,1),Toast.success(`${a.display_name} eklendi!`)}catch(r){console.error("[ClassroomManager] addSingleStudent error:",r),Toast.error("Ekleme hatası: "+r.message)}},addBulkStudents:async t=>{const s=document.getElementById(`input-bulk-${t}`),e=s?.value?.trim();if(!e){Toast.error("En az bir öğrenci adı girin");return}const r=e.split(`
`).map(a=>a.trim()).filter(a=>a.length>0);if(r.length===0){Toast.error("Geçerli isim bulunamadı");return}try{const a=r.map(i=>({classroom_id:t,display_name:i,avatar_emoji:"🎓",added_by_teacher:!0})),{data:o,error:l}=await SupabaseClient.getClient().from("students").insert(a).select();if(l)throw l;s.value="",n.closePanel(t),n.updateStudentCount(t,o.length),Toast.success(`${o.length} öğrenci eklendi!`)}catch(a){console.error("[ClassroomManager] addBulkStudents error:",a),Toast.error("Toplu ekleme hatası: "+a.message)}},updateStudentCount:(t,s)=>{const e=document.querySelector(`#student-count-${t} .student-count-value`);if(e){const a=parseInt(e.textContent)||0;e.textContent=a+s}const r=n.classrooms.find(a=>a.id===t);r&&r.students&&r.students[0]&&(r.students[0].count=(r.students[0].count||0)+s)},confirmDelete:(t,s)=>{n.closeAllPanels(),confirm(`⚠️ "${s}" sınıfını silmek istediğinize emin misiniz?

Bu işlem geri alınamaz ve:
• Sınıftaki tüm öğrenciler silinecek
• Tüm ilerleme verileri kaybolacak`)&&n.delete(t)},toggleNewClassForm:()=>{const t=document.getElementById("new-class-form-row");if(!t){console.error("[ClassroomManager] new-class-form-row not found");return}if(t.classList.contains("hidden")){n.closeAllPanels(),t.classList.remove("hidden");const e=document.getElementById("new-class-name");e&&(e.value="",e.focus());const r=document.getElementById("new-class-desc");r&&(r.value="");const a=document.getElementById("new-class-password");a&&(a.checked=!1)}else t.classList.add("hidden")},createFromForm:async()=>{const t=document.getElementById("new-class-name"),s=document.getElementById("new-class-desc"),e=document.getElementById("new-class-password"),r=t?.value?.trim(),a=s?.value?.trim()||"";if(e?.checked,!r){Toast.warning("Lütfen sınıf adı girin"),t?.focus();return}try{await n.create(r,a,null),n.toggleNewClassForm(),Toast.success(`"${r}" sınıfı oluşturuldu! 🎉`)}catch(o){console.error("[ClassroomManager] createFromForm error:",o),Toast.error("Sınıf oluşturulamadı: "+o.message)}},showNewClassroomForm:()=>{n.toggleNewClassForm()},hideNewClassroomForm:()=>{const t=document.getElementById("new-class-form-row");t&&t.classList.add("hidden")},createNewClassroom:async()=>{const t=document.getElementById("new-classroom-name"),s=document.getElementById("new-classroom-description"),e=document.getElementById("btn-create-classroom"),r=t?.value?.trim(),a=s?.value?.trim();if(!r){Toast.error("Sınıf adı gerekli"),t?.focus();return}const o=e?.textContent;e&&(e.disabled=!0,e.textContent="Oluşturuluyor...");try{const l=await n.create(r,a,null);l.success?(n.hideNewClassroomForm(),Toast.success(`"${r}" sınıfı oluşturuldu! 🎉`),l.classroom&&(n.classrooms.unshift({...l.classroom,students:[{count:0}]}),n.renderList())):Toast.error("Oluşturma hatası: "+(l.error?.message||"Bilinmeyen hata"))}catch(l){console.error("[ClassroomManager] createNewClassroom error:",l),Toast.error("Oluşturma hatası: "+l.message)}finally{e&&(e.disabled=!1,e.textContent=o)}},saveSettings:async t=>{const s=document.getElementById(`settings-name-${t}`),e=document.getElementById(`settings-desc-${t}`),r=document.getElementById(`settings-active-${t}`),a=s?.value?.trim(),o=e?.value?.trim(),l=r?.checked??!0;if(!a){Toast.error("Sınıf adı gerekli"),s?.focus();return}try{const{data:i,error:d}=await SupabaseClient.getClient().from("classrooms").update({name:a,description:o,is_active:l}).eq("id",t).select().single();if(d)throw d;const c=n.classrooms.find(m=>m.id===t);c&&(c.name=a,c.description=o,c.is_active=l);const u=document.getElementById(`name-display-${t}`);u&&(u.textContent=i.name),n.closePanel(t),Toast.success("Ayarlar güncellendi!"),n.renderList()}catch(i){console.error("[ClassroomManager] saveSettings error:",i),Toast.error("Güncelleme hatası: "+i.message)}},printStudentCredentials:async(t,s)=>{try{const{data:e,error:r}=await SupabaseClient.getClient().from("students").select("id, first_name, last_name, username, password, display_name").eq("classroom_id",t).order("display_name",{ascending:!0});if(r)throw r;if(!e||e.length===0){Toast.warning("Bu sınıfta yazdırılacak öğrenci yok.");return}const a=window.open("","","height=800,width=1000");if(!a){Toast.error("Pop-up engelleyici aktif olabilir");return}let o="";e.forEach(l=>{const i=l.first_name&&l.last_name?l.first_name+" "+l.last_name:l.display_name||"İsimsiz";o+=`
                    <div class="student-card">
                        <div class="header">${n.escapeHtml(s)}</div>
                        <div class="content">
                            <div class="info-row"><span class="label">Öğrenci:</span> <span class="value strong">${n.escapeHtml(i)}</span></div>
                            <div class="info-row"><span class="label">Kullanıcı Adı:</span> <span class="value">${n.escapeHtml(l.username||l.display_name||"-")}</span></div>
                            <div class="info-row"><span class="label">Şifre:</span> <span class="value code">${l.password||"******"}</span></div>
                            <div class="info-row"><span class="label">Giriş:</span> <span class="value">yetilab.com</span></div>
                        </div>
                        <div class="cut-line">✂️ ---------------- KESİNİZ ----------------</div>
                    </div>
                `}),a.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${n.escapeHtml(s)} - Giriş Fişleri</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap');
                        
                        @page { size: A4; margin: 1cm; }
                        
                        body { 
                            font-family: 'Segoe UI', sans-serif; 
                            margin: 0; 
                            padding: 10px;
                            background: white;
                            color: #1e293b;
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

                        .header {
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
                        }

                        /* Mobilde tek sütun görünsün (önizleme için) */
                        @media screen and (max-width: 600px) {
                            .grid-container { grid-template-columns: 1fr; }
                        }
                    </style>
                </head>
                <body>
                    <div class="grid-container">
                        ${o}
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(() => { window.print(); }, 500); // Resimlerin yüklenmesi için ufak bekleme
                        }
                    <\/script>
                </body>
                </html>
            `),a.document.close()}catch(e){console.error("[ClassroomManager] printStudentCredentials error:",e),window.Toast&&Toast.error("Yazdırma hatası: "+e.message)}},closeAllMenus:()=>{n.closeAllPanels()},toggleMenu:()=>{},initClickOutsideHandler:()=>{}};window.ClassroomManager=n;export{n as ClassroomManager};
