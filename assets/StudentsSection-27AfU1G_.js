const t={render(){return`
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Header with Filters -->
                <div class="flex flex-wrap gap-3 items-center mb-4 flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <label class="text-slate-600 dark:text-slate-400 text-sm font-medium">Sınıf:</label>
                        <select id="classroomFilter"
                            onchange="StudentsSection.onFilterChange()"
                            class="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:bg-slate-800 dark:text-white text-sm min-w-[150px]">
                            <option value="all">Tüm Sınıflar</option>
                        </select>
                    </div>
                    
                    <!-- Search Input -->
                    <div class="flex-1 max-w-xs">
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                            <input type="text" 
                                id="studentSearchInput"
                                placeholder="Öğrenci ara..." 
                                onkeyup="StudentsSection.onSearchChange(event)"
                                class="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:bg-slate-800 dark:text-white text-sm" />
                        </div>
                    </div>
                    
                    <div class="ml-auto flex items-center gap-2">
                        <button onclick="TeacherManager?.printStudentList()"
                            class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                            title="Öğrenci Şifre Listesini Yazdır">
                            <span>🖨️</span>
                            <span class="hidden sm:inline">Şifre Listesi</span>
                        </button>
                        <button onclick="TeacherManager?.openBulkAddModal()"
                            class="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold text-xs hover:brightness-110 transition-all shadow-sm shadow-emerald-500/30 relative z-50"
                            title="Toplu Öğrenci Ekle">
                            <span>+</span>
                            <span class="hidden sm:inline">Öğrenci Ekle</span>
                        </button>
                    </div>
                </div>

                <!-- Students List with internal scroll -->
                <div class="flex-1 overflow-hidden min-h-0">
                    <div class="teacher-panel-card h-full flex flex-col overflow-hidden">
                        <div class="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <div class="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                <div class="col-span-5">Öğrenci</div>
                                <div class="col-span-3">Sınıf</div>
                                <div class="col-span-4 text-right">İşlemler</div>
                            </div>
                        </div>
                        <div id="studentsList" class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                            <!-- Students will be rendered here by StudentManager -->
                            <div class="p-8 text-center">
                                <div class="text-3xl mb-2">👨‍🎓</div>
                                <p class="text-slate-500 dark:text-slate-400 text-sm">Öğrenciler yükleniyor...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `},searchQuery:"",onFilterChange(){window.StudentManager&&StudentManager.renderList()},onSearchChange(e){clearTimeout(this._searchTimeout),this._searchTimeout=setTimeout(()=>{this.searchQuery=e.target.value.trim().toLowerCase(),window.StudentManager&&StudentManager.renderList()},300)},getSearchQuery(){return this.searchQuery||""}};window.StudentsSection=t;
