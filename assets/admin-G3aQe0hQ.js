const c={render(){return`
            <div class="space-y-6">
                <!-- Kurs Seçimi -->
                ${this.renderCourseSelector()}
                
                <!-- Kurs Bilgileri -->
                ${this.renderCourseInfo()}
                
                <!-- Sekme İsimleri -->
                ${this.renderTabNames()}
                
                <!-- Devre Elemanları Kütüphanesi -->
                ${this.renderComponentLibrary()}
            </div>
        `},renderCourseSelector(){return`
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        📚 Kurs Seçimi
                    </h2>
                    <button
                        onclick="CourseManager.showInlineAddForm()"
                        class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm transition"
                    >
                        + Yeni Kurs Ekle
                    </button>
                </div>

                <!-- Kurs Seçim Kartları -->
                <div id="settings-course-selector" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <!-- JS tarafından doldurulacak -->
                </div>

                <!-- Inline Yeni Kurs Formu (gizli) -->
                <div id="settings-add-course-form" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 class="font-bold text-gray-700 dark:text-gray-200 mb-3">Yeni Kurs Oluştur</h4>
                    <div class="grid grid-cols-12 gap-3">
                        <input
                            type="text"
                            id="settings-course-icon"
                            placeholder="📚"
                            class="col-span-2 border border-gray-300 dark:border-gray-600 rounded p-2 text-center text-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            maxlength="2"
                        />
                        <input
                            type="text"
                            id="settings-course-title"
                            placeholder="Kurs Başlığı"
                            class="col-span-4 border border-gray-300 dark:border-gray-600 rounded p-2 font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            id="settings-course-key"
                            placeholder="kurs-anahtari"
                            class="col-span-3 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            id="settings-course-desc"
                            placeholder="Açıklama"
                            class="col-span-3 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <div class="flex justify-end gap-2 mt-3">
                        <button
                            type="button"
                            onclick="SettingsSection.hideAddCourseForm()"
                            class="text-sm text-gray-500 dark:text-gray-400 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                        >
                            İptal
                        </button>
                        <button
                            type="button"
                            onclick="SettingsSection.createCourse()"
                            class="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold transition"
                        >
                            ✓ Oluştur
                        </button>
                    </div>
                </div>
            </div>
        `},renderCourseInfo(){return`
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        ⚙️ Seçili Kurs Ayarları
                    </h2>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl" id="settings-course-icon-preview">📚</span>
                        <span class="font-bold text-gray-600 dark:text-gray-300" id="settings-course-title-preview">Kurs Seçin</span>
                    </div>
                </div>

                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-2">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Simge</label>
                        <input
                            type="text"
                            id="settings-edit-icon"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 text-center text-3xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="📚"
                        />
                    </div>
                    <div class="col-span-4">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Kurs Başlığı</label>
                        <input
                            type="text"
                            id="settings-edit-title"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Kurs Başlığı"
                        />
                    </div>
                    <div class="col-span-6">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Açıklama</label>
                        <input
                            type="text"
                            id="settings-edit-desc"
                            class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Kurs Açıklaması"
                        />
                    </div>
                </div>
            </div>
        `},renderTabNames(){return`
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        🏷️ Ders Sekme İsimleri
                    </h2>
                    <button
                        type="button"
                        onclick="SettingsSection.resetTabNames()"
                        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                    >
                        ↺ Varsayılana Dön
                    </button>
                </div>

                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    💡 Bu sekme isimleri derslerde görünür (Amaç, Donanım, Devre, Kod vb.)
                </p>

                <div id="settings-tab-names" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <!-- JS tarafından doldurulacak -->
                </div>
            </div>
        `},renderComponentLibrary(){return`
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        🔧 Devre Elemanları Kütüphanesi
                    </h2>
                    <button
                        onclick="ComponentManager.add()"
                        class="bg-theme hover:bg-theme-dark text-white px-4 py-2 rounded font-bold text-sm transition"
                    >
                        + Yeni Eleman Ekle
                    </button>
                </div>

                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    💡 Burada tanımlanan devre elemanları, proje düzenlerken "Donanım" sekmesinde seçilebilir olacaktır.
                </p>

                <!-- Bileşen Listesi Grid -->
                <div id="settings-component-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    <!-- JS tarafından doldurulacak -->
                </div>

                <!-- Boş Durum -->
                <div id="settings-component-empty" class="hidden text-center py-12 text-gray-400 dark:text-gray-500">
                    <div class="text-5xl mb-4">🔌</div>
                    <p>Henüz devre elemanı eklenmemiş.</p>
                    <button
                        onclick="ComponentManager.add()"
                        class="mt-4 text-theme hover:text-theme-dark font-bold"
                    >
                        + İlk elemanı ekle
                    </button>
                </div>
            </div>
        `},renderCourseCards(){const e=document.getElementById("settings-course-selector");if(!e)return;const n=window.admin?.allCourseData||{},a=window.admin?.currentCourseKey;e.innerHTML="",Object.entries(n).forEach(([r,o])=>{const i=r===a,s=o.icon||"📚",u=o.title||r,d=document.createElement("div");d.className=`
                p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                ${i?"border-theme bg-theme/10 dark:bg-theme/20":"border-gray-200 dark:border-gray-700 hover:border-theme/50 bg-gray-50 dark:bg-gray-700"}
            `,d.innerHTML=`
                <div class="text-3xl mb-2">${s}</div>
                <div class="font-bold text-sm text-gray-700 dark:text-gray-200 truncate">${u}</div>
                ${i?'<div class="text-xs text-theme font-bold mt-1">✓ Seçili</div>':""}
            `,d.onclick=()=>admin.changeCourse(r),e.appendChild(d)}),this.updateCoursePreview()},updateCoursePreview(){const e=window.admin?.currentCourseKey,n=window.admin?.allCourseData?.[e];if(!n)return;const a=document.getElementById("settings-course-icon-preview"),r=document.getElementById("settings-course-title-preview"),o=document.getElementById("settings-edit-icon"),i=document.getElementById("settings-edit-title"),s=document.getElementById("settings-edit-desc");a&&(a.textContent=n.icon||"📚"),r&&(r.textContent=n.title||e),o&&(o.value=n.icon||""),i&&(i.value=n.title||""),s&&(s.value=n.description||"")},updateCourseInfo(){const e=window.admin?.currentCourseKey,n=window.admin?.allCourseData?.[e];if(!n)return;const a=document.getElementById("settings-edit-icon")?.value||"",r=document.getElementById("settings-edit-title")?.value||"",o=document.getElementById("settings-edit-desc")?.value||"";n.icon=a,n.title=r,n.description=o;const i=document.getElementById("settings-course-icon-preview"),s=document.getElementById("settings-course-title-preview");i&&(i.textContent=a||"📚"),s&&(s.textContent=r||e),window.admin?.triggerAutoSave&&admin.triggerAutoSave()},renderTabNames(){const e=document.getElementById("settings-tab-names");if(!e)return;const n=window.admin?.currentCourseKey,r=window.admin?.allCourseData?.[n]?.customTabNames||{};let o=[];window.TabConfig&&window.TabConfig.getConfig?o=window.TabConfig.getConfig(n).tabs:o=[{id:"mission",label:"🎯 Amaç"},{id:"materials",label:"🧩 Donanım"},{id:"circuit",label:"⚡ Devre"},{id:"code",label:"💻 Kod"},{id:"challenge",label:"🏆 Görev"},{id:"quiz",label:"📝 Test"}],e.innerHTML="",o.forEach(i=>{const s=i.label.replace(/[\p{Emoji}\u2580-\u2FFF\u200d\uFE0F]/gu,"").trim(),u=r[i.id]||s,d=document.createElement("div");d.className="flex flex-col gap-1",d.innerHTML=`
                <label class="text-xs text-gray-500 dark:text-gray-400">${s} (ID: ${i.id})</label>
                <input
                    type="text"
                    id="tab-name-${i.id}"
                    data-key="${i.id}"
                    value="${u}"
                    placeholder="${s}"
                    class="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    oninput="SettingsSection.updateTabName('${i.id}', this.value)"
                />
            `,e.appendChild(d)})},updateTabName(e,n){const a=window.admin?.allCourseData?.[window.admin?.currentCourseKey];a&&(a.customTabNames||(a.customTabNames={}),a.customTabNames[e]=n,window.CourseSettings?.applyCustomTabNames&&CourseSettings.applyCustomTabNames(),window.admin?.triggerAutoSave&&admin.triggerAutoSave())},resetTabNames(){if(!confirm("Sekme isimlerini varsayılana döndürmek istiyor musunuz?"))return;const e=window.admin?.allCourseData?.[window.admin?.currentCourseKey];e&&(e.customTabNames={},this.renderTabNames(),window.CourseSettings?.applyCustomTabNames&&CourseSettings.applyCustomTabNames(),window.admin?.triggerAutoSave&&admin.triggerAutoSave())},renderComponents(){const e=document.getElementById("settings-component-list"),n=document.getElementById("settings-component-empty");if(!e)return;const a=window.admin?.currentData?.componentInfo||{},r=Object.keys(a);if(r.length===0){e.innerHTML="",n&&n.classList.remove("hidden");return}n&&n.classList.add("hidden"),e.innerHTML="",r.forEach(o=>{const i=a[o],s=document.createElement("div");s.className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-3 hover:border-theme/50 hover:shadow-md transition cursor-pointer group",s.innerHTML=`
                <div class="text-2xl mb-2">${i.icon||"🔌"}</div>
                <div class="font-bold text-sm text-gray-700 dark:text-gray-200 truncate">${i.name||o}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">${i.desc||""}</div>
                <div class="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                    <button onclick="event.stopPropagation(); ComponentManager.edit('${o}')" 
                            class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-xs">✏️</button>
                    <button onclick="event.stopPropagation(); ComponentManager.deleteById('${o}')" 
                            class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded text-xs">🗑️</button>
                </div>
            `,s.onclick=()=>ComponentManager.edit(o),e.appendChild(s)})},showAddCourseForm(){const e=document.getElementById("settings-add-course-form");e&&e.classList.remove("hidden")},hideAddCourseForm(){const e=document.getElementById("settings-add-course-form");e&&e.classList.add("hidden")},createCourse(){const e=document.getElementById("settings-course-icon")?.value||"📚",n=document.getElementById("settings-course-title")?.value,a=document.getElementById("settings-course-key")?.value,r=document.getElementById("settings-course-desc")?.value||"";if(!n||!a){alert("Lütfen kurs başlığı ve anahtar girin.");return}window.CourseManager?.create&&CourseManager.create({key:a,title:n,icon:e,description:r}),this.hideAddCourseForm(),this.renderCourseCards()},bindEvents(){const e=(n,a,r)=>{const o=document.getElementById(n);o&&(o.removeEventListener(a,r),o.addEventListener(a,r))};e("settings-edit-icon","input",()=>this.updateCourseInfo()),e("settings-edit-title","input",()=>this.updateCourseInfo()),e("settings-edit-desc","input",()=>this.updateCourseInfo())},mount(){this.renderCourseCards(),this.renderTabNames(),this.renderComponents(),setTimeout(()=>this.bindEvents(),100)}};window.SettingsSection=c;const t={get allCourseData(){return window.AdminState?.allCourseData||{}},set allCourseData(e){window.AdminState&&(window.AdminState.allCourseData=e)},get currentCourseKey(){return window.AdminState?.currentCourseKey||"arduino"},set currentCourseKey(e){window.AdminState&&(window.AdminState.currentCourseKey=e)},get currentData(){return window.AdminState?.currentData},set currentData(e){window.AdminState&&(window.AdminState.currentData=e)},get currentProjectId(){return window.AdminState?.currentProjectId},set currentProjectId(e){window.AdminState&&(window.AdminState.currentProjectId=e)},get currentComponentKey(){return window.AdminState?.currentComponentKey},set currentComponentKey(e){window.AdminState&&(window.AdminState.currentComponentKey=e)},get currentPhaseIndex(){return window.AdminState?.currentPhaseIndex},set currentPhaseIndex(e){window.AdminState&&(window.AdminState.currentPhaseIndex=e)},get currentLang(){return window.AdminState?.currentLang||"tr"},set currentLang(e){window.AdminState&&(window.AdminState.currentLang=e)},get undoStack(){return window.AdminState?.undoStack||[]},set undoStack(e){window.AdminState&&(window.AdminState.undoStack=e)},get hasUnsavedChanges(){return window.AdminState?.hasUnsavedChanges||!1},set hasUnsavedChanges(e){window.AdminState&&(window.AdminState.hasUnsavedChanges=e),t.updateSaveButtonUI()},get supabaseAutoSaveTimer(){return window.AdminState?.autoSaveTimer},set supabaseAutoSaveTimer(e){window.AdminState&&(window.AdminState.autoSaveTimer=e)},get _isInitialized(){return window.AdminState?.isInitialized},set _isInitialized(e){window.AdminState&&(window.AdminState.isInitialized=e)},triggerAutoSave:(e=!1)=>{typeof StorageManager<"u"&&StorageManager.triggerAutoSave(),t.hasUnsavedChanges=!0,e&&(t.supabaseAutoSaveTimer&&clearTimeout(t.supabaseAutoSaveTimer),window.Auth&&Auth.isAdmin()&&(console.log("[Admin] Triggering Cloud Save (Force/Manual)..."),t.supabaseAutoSaveTimer=setTimeout(()=>{t.saveData(!0)},100)))},saveToLocal:()=>{typeof StorageManager<"u"&&StorageManager.saveToLocal()},restoreFromLocal:()=>{typeof StorageManager<"u"&&StorageManager.restoreFromLocal()},clearLocalData:()=>{typeof StorageManager<"u"&&StorageManager.clear()},showLoading(e){window.AdminUI&&window.AdminUI.showLoading(e)},hideLoading(){window.AdminUI&&window.AdminUI.hideLoading()},updateSaveButtonUI(){const e=document.getElementById("btn-save-cloud");e&&(t.hasUnsavedChanges?(e.classList.remove("bg-gray-600","hover:bg-gray-700","opacity-50","cursor-not-allowed"),e.classList.add("bg-orange-500","hover:bg-orange-600","animate-pulse"),e.innerHTML="💾 Kaydet *",e.disabled=!1):(e.classList.remove("bg-orange-500","hover:bg-orange-600","animate-pulse"),e.classList.add("bg-green-600","hover:bg-green-700"),e.innerHTML="✅ Kayıtlı"))},init:async()=>{if(t._isInitialized&&Object.keys(t.allCourseData||{}).length>0){console.log("[Admin] Already initialized, skipping..."),t.hideLoading();return}t.showLoading("Yeti LAB Yönetim Paneli Yükleniyor...");try{if(typeof SupabaseSync<"u"){const a=await SupabaseSync.loadCourseList();t.allCourseData={},a.forEach(r=>{t.allCourseData[r.slug]={title:r.title,_supabaseId:r.id}})}let e=t.currentCourseKey;const n=Object.keys(t.allCourseData||{});n.length>0?n.includes(e)||(e=n[0]):console.warn("[Admin] No courses found."),e&&await t.changeCourse(e),typeof CourseManager<"u"&&CourseManager.init(),typeof ProjectManager<"u"&&ProjectManager.init({getProjects:()=>t.currentData?.projects||[],getPhases:()=>t.currentData?.phases||[],getComponentInfo:()=>t.currentData?.componentInfo||{},getCourseKey:()=>t.currentCourseKey,getCourseId:()=>t.allCourseData[t.currentCourseKey]?._supabaseId,getPhaseIdMap:()=>t.allCourseData[t.currentCourseKey]?._phaseIds||{},onUpdate:()=>t.triggerAutoSave(),onProjectSelect:a=>t.loadProject(a)}),typeof PhaseManager<"u"&&PhaseManager.init({getPhases:()=>t.currentData?.phases||[],getPhaseIdMap:()=>t.allCourseData[t.currentCourseKey]?._phaseIds||{},getCourseId:()=>t.allCourseData[t.currentCourseKey]?._supabaseId,onUpdate:()=>t.triggerAutoSave(),onPhaseSelect:a=>t.loadPhase(a)}),typeof ComponentManager<"u"&&ComponentManager.init({getComponentInfo:()=>t.currentData?.componentInfo||{},onUpdate:()=>t.triggerAutoSave(),onComponentSelect:a=>t.loadComponent(a)}),typeof CourseSettings<"u"&&CourseSettings.init({getCourseData:()=>t.allCourseData[t.currentCourseKey],getCourseKey:()=>t.currentCourseKey,onUpdate:()=>t.triggerAutoSave()}),typeof ImageManager<"u"&&ImageManager.init({getCourseKey:()=>t.currentCourseKey}),t._isInitialized=!0,window.addEventListener("beforeunload",a=>{if(t.hasUnsavedChanges){const r="Kaydedilmemiş değişiklikleriniz var! Çıkmak istediğinize emin misiniz?";return a.returnValue=r,r}}),t.updateSaveButtonUI(),console.log("[Admin] Initialized successfully")}catch(e){console.error("[Admin] Init error:",e),alert("Admin paneli yüklenirken hata oluştu: "+e.message)}finally{t.hideLoading()}},changeCourse:async e=>{try{t.showLoading(`"${e}" kursu yükleniyor...`),console.log(`[Admin] Changing course to: ${e}`),t.currentCourseKey=e;let n=t.allCourseData[e];if((!n||!n.data)&&typeof SupabaseSync<"u"){const i=await SupabaseSync.loadFromSupabase(e);i&&(t.allCourseData[e]=i,n=i)}if(!n)throw new Error(`Course data for "${e}" could not be loaded.`);t.currentData=n.data,typeof CourseManager<"u"&&(CourseManager.refreshList(),CourseManager.renderSelectorGrid());const a=document.getElementById("course-title-preview"),r=document.getElementById("course-desc-preview"),o=document.getElementById("course-icon-preview");if(a&&(a.textContent=n.title||e),r&&(r.textContent=n.description||"Açıklama yok"),o&&(o.textContent=n.icon||"📦"),window.SettingsSection&&document.getElementById("settings-edit-title"))c.mount();else{const i=document.getElementById("admin-course-title"),s=document.getElementById("admin-course-description"),u=document.getElementById("admin-course-icon");i&&(i.value=n.title||""),s&&(s.value=n.description||""),u&&(u.value=n.icon||"📦")}t.renderProjectList(),t.renderPhaseList(),t.renderComponentList(),t.currentData.projects&&t.currentData.projects.length>0?t.loadProject(t.currentData.projects[0].id):(document.getElementById("project-form").classList.add("hidden"),document.getElementById("project-welcome").classList.remove("hidden")),t.loadCourseSettings()}catch(n){console.error("[Admin] Change course error:",n)}finally{t.hideLoading()}},showTab:e=>{window.AdminUI&&window.AdminUI.showTab(e)},loadCourseSettings:()=>{typeof CourseSettings<"u"&&(CourseSettings.load(),CourseSettings.applyCustomTabNames())},updateCourseSettings:()=>{typeof CourseSettings<"u"&&CourseSettings.update()},toggleCourseSettings:()=>{typeof CourseSettings<"u"&&(CourseSettings.toggle(),CourseSettings.renderTabEditor()),typeof CourseManager<"u"&&(CourseManager.refreshList(),CourseManager.renderSelectorGrid())},resetTabNames:()=>{typeof CourseSettings<"u"&&CourseSettings.resetTabNames()},renderProjectList:()=>{window.ProjectEditor&&window.ProjectEditor.renderList(t.currentProjectId)},toggleCustomSimType:()=>ProjectManager.toggleCustomSimType(),toggleCodeMode:()=>ProjectManager.toggleCodeMode(),switchProjectTab:e=>ProjectManager.switchTab(e),switchLang:e=>{window.AdminUI&&(window.AdminUI.switchLangUI(e),t.currentLang=e)},loadProject:e=>{t.currentProjectId=e,window.ProjectEditor&&window.ProjectEditor.load(e)},updateProject:()=>{window.ProjectEditor&&window.ProjectEditor.update()},addNewProject:()=>{window.ProjectEditor&&window.ProjectEditor.add()},duplicateProject:()=>{window.ProjectEditor&&window.ProjectEditor.duplicate()},deleteProject:()=>{window.ProjectEditor&&window.ProjectEditor.delete()},renderComponentList:()=>ComponentManager.renderList(),loadComponent:e=>ComponentManager.load(e),updateComponent:()=>ComponentManager.update(),addNewComponent:()=>ComponentManager.add(),openImageSelector:(e,n=null)=>{typeof ImageManager<"u"&&ImageManager.openSelector(e,n)},closeImageSelector:()=>{typeof ImageManager<"u"&&ImageManager.closeSelector()},loadImageList:()=>{typeof ImageManager<"u"&&ImageManager.loadImageList()},selectImage:e=>{typeof ImageManager<"u"&&ImageManager.selectImage(e)},deleteComponent:()=>{if(!confirm("Kullanımda olan bir malzemeyi silerseniz site bozulabilir. Yine de silinsin mi?"))return;const e=t.currentComponentKey,n=t.currentData.componentInfo[e];n&&(t.undoStack.push({type:"component",key:e,data:JSON.parse(JSON.stringify(n)),courseKey:t.currentCourseKey}),t.updateUndoButton()),delete t.currentData.componentInfo[t.currentComponentKey],t.currentComponentKey=null,document.getElementById("component-welcome").classList.remove("hidden"),document.getElementById("component-form").classList.add("hidden"),t.renderComponentList(),t.showUndoToast(`"${n.name}" silindi.`),t.triggerAutoSave()},renderPhaseList:()=>{typeof PhaseManager<"u"&&(t.currentData.phases||(t.currentData.phases=[]),PhaseManager.renderList())},loadPhase:e=>{typeof PhaseManager<"u"&&PhaseManager.load(e)},updatePhase:()=>{typeof PhaseManager<"u"&&PhaseManager.update()},addNewPhase:()=>{typeof PhaseManager<"u"&&(t.currentData.phases||(t.currentData.phases=[]),PhaseManager.add())},deletePhase:()=>{typeof PhaseManager<"u"&&PhaseManager.delete()},validateProjectData:()=>{const e=[],n=t.currentData.projects||[],a=t.currentData.phases||[],r=new Set;return n.forEach((o,i)=>{r.has(o.id)&&e.push(`HATA: Ders ID çakışması! ID: ${o.id} (Ders: ${o.title})`),r.add(o.id),(!o.title||o.title.trim()==="")&&e.push(`UYARI: ID ${o.id} için başlık boş.`),a.length>0&&(o.phase<0||o.phase>=a.length)&&e.push(`HATA: ID ${o.id} geçersiz bir faza atanmış (Phase Index: ${o.phase}).`)}),e},downloadBackup:()=>{window.BackupService&&window.AdminState&&window.BackupService.downloadBackup(window.AdminState.allCourseData)&&t.triggerAutoSave()},saveData:async(e=!1)=>{const n=t.validateProjectData();if(n.length>0&&(console.warn("[Admin] Validation errors:",n),!e&&!confirm("Hatalar var (konsola bak). Yine de kaydetmek ister misin?")))return;const a=t.currentCourseKey,r=t.allCourseData[a],o=window.Auth&&Auth.isAdmin();if(typeof SupabaseClient<"u"&&SupabaseClient.client&&o){e&&typeof StorageManager<"u"?StorageManager.updateStatus("Buluta kaydediliyor...","blue"):e||t.showLoading("Kaydediliyor...");try{await t.saveToSupabase(a,r),e&&typeof StorageManager<"u"&&StorageManager.updateStatus("Buluta kaydedildi ✓","green"),t.hasUnsavedChanges=!1}catch(i){console.error("Save failed:",i),e&&typeof StorageManager<"u"&&StorageManager.updateStatus("Bulut kaydı başarısız!","red")}finally{e||t.hideLoading()}}else e||t.downloadCourseAsFile(a,r)},downloadCourseAsFile:(e,n)=>{window.BackupService&&window.BackupService.downloadCourseAsFile(e,n)},saveToSupabase:async(e,n)=>{if(typeof SupabaseSync<"u")return await SupabaseSync.saveToSupabase(e,n)},syncPhasesToSupabase:async(e,n)=>{if(typeof SupabaseSync<"u")return await SupabaseSync.syncPhases(e,n)},syncProjectsToSupabase:async(e,n,a)=>{if(typeof SupabaseSync<"u")return await SupabaseSync.syncProjects(e,n,a)},syncComponentsToSupabase:async(e,n)=>{if(typeof SupabaseSync<"u")return await SupabaseSync.syncComponents(e,n)},slugify:e=>typeof SupabaseSync<"u"?SupabaseSync.slugify(e):e?e.toString().toLowerCase().trim().replace(/\s+/g,"-"):"",renderQuizEditor:e=>{const n=e||t.currentProjectId,a=t.currentData.projects.find(r=>r.id===parseInt(n));a&&(a.quiz||(a.quiz=[]),typeof window.QuizEditor<"u"?window.QuizEditor.init(a.id,a.quiz,r=>{a.quiz=r,t.triggerAutoSave()}):console.error("QuizEditor module not loaded!"))},addQuestion:()=>window.QuizEditor&&window.QuizEditor.addQuestion(),removeQuestion:e=>window.QuizEditor&&window.QuizEditor.removeQuestion(e),updateQuestion:(e,n,a)=>window.QuizEditor&&window.QuizEditor.updateQuestion(e,n,a),migrateQuizData:()=>{},openImageManager:()=>{typeof window.ImageManager<"u"&&window.ImageManager.open()},hotspotAddMode:!1,hotspotData:[],initHotspotEditor:()=>{const e=t.currentData.projects.find(a=>a.id===t.currentProjectId);if(!e)return;t.hotspotData=e.hotspots||[];const n=e.circuitImage||"devre"+e.id+".jpg";typeof HotspotEditor<"u"?HotspotEditor.init(e.hotspots,n,a=>{t.hotspotData=a,t.syncHotspots()}):console.error("HotspotEditor module not loaded!")},toggleHotspotMode:()=>HotspotEditor.toggleMode(),handleEditorClick:e=>HotspotEditor.handleClick(e),renderHotspotMarkers:()=>HotspotEditor.renderMarkers(),renderHotspotList:()=>HotspotEditor.renderList(),selectHotspot:e=>HotspotEditor.select(e),editHotspot:e=>HotspotEditor.edit(e),deleteHotspot:e=>HotspotEditor.delete(e),clearAllHotspots:()=>HotspotEditor.clearAll(),syncHotspots:()=>{const e=t.currentData.projects.find(n=>n.id===t.currentProjectId);e&&(e.hotspots=t.hotspotData.length>0?t.hotspotData:null),document.getElementById("p-hotspots").value=JSON.stringify(t.hotspotData),t.triggerAutoSave()},showUndoToast:e=>{let n=document.getElementById("undo-toast");n||(n=document.createElement("div"),n.id="undo-toast",n.className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transition-all",document.body.appendChild(n)),n.innerHTML=`
            <span class="text-sm">${e}</span>
            <button onclick="admin.undo()" class="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm font-bold">
                ↩️ Geri Al
            </button>
            <button onclick="admin.hideUndoToast()" class="text-gray-400 hover:text-white ml-1">✕</button>
        `,n.style.display="flex",clearTimeout(t.undoToastTimer),t.undoToastTimer=setTimeout(()=>t.hideUndoToast(),8e3)},hideUndoToast:()=>{const e=document.getElementById("undo-toast");e&&(e.style.display="none")},updateUndoButton:()=>{const e=document.getElementById("btn-undo");e&&(t.undoStack.length>0?(e.classList.remove("hidden"),e.title=`${t.undoStack.length} silinen öğe`):e.classList.add("hidden"))},undo:()=>{if(t.undoStack.length===0)return;const e=t.undoStack.pop();if(t.updateUndoButton(),t.hideUndoToast(),e.courseKey!==t.currentCourseKey){const n=document.getElementById("course-selector");n&&(n.value=e.courseKey),t.changeCourse(e.courseKey)}e.type==="project"&&(t.currentData.projects.push(e.data),t.renderProjectList(),t.loadProject(e.data.id),alert(`"${e.data.title}" geri yüklendi!`))},previewCircuitImage:()=>{typeof ImageManager<"u"&&ImageManager.previewCircuitImage()},uploadCircuitImage:async e=>{typeof ImageManager<"u"&&await ImageManager.uploadCircuitImage(e)},resolveImageUrl:e=>typeof ImageManager<"u"?ImageManager.resolveImageUrl(e):e?e.startsWith("http://")||e.startsWith("https://")||e.startsWith("img/")?e:`img/${e}`:"",fetchMetadataFromSupabase:async e=>{if(!(typeof SupabaseClient>"u"||!SupabaseClient.client))try{const n=t.allCourseData[e]?.title||e,a=typeof SupabaseSync<"u"?SupabaseSync.slugify(n):n.toLowerCase(),{data:r,error:o}=await SupabaseClient.client.from("courses").select("meta").eq("slug",a).maybeSingle();if(o)throw o;if(r&&r.meta){const i=t.allCourseData[e];let s=!1;r.meta.customTabNames&&(i.customTabNames=r.meta.customTabNames,s=!0),r.meta.icon&&r.meta.icon!==i.icon&&(i.icon=r.meta.icon,s=!0),s&&e===t.currentCourseKey&&typeof CourseSettings<"u"&&(CourseSettings.load(),CourseSettings.renderTabEditor(),CourseSettings.applyCustomTabNames())}}catch(n){console.error("[Admin] Failed to fetch metadata:",n)}}};window.admin=t;export{t as default};
