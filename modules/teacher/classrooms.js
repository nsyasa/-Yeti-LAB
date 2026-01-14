/**
 * Yeti LAB - Classroom Manager Module
 * Sınıf oluşturma, düzenleme, silme ve listeleme işlemlerini yönetir.
 */

export const ClassroomManager = {
    classrooms: [],
    currentUser: null,
    onStateChange: null, // Callback to update parent state/UI (e.g. dashboard stats)

    init: (user, initialClassrooms, callbacks) => {
        console.log('[ClassroomManager] init called with:', {
            user_id: user?.id,
            classrooms_count: initialClassrooms?.length || 0,
            classrooms: initialClassrooms,
        });
        ClassroomManager.currentUser = user;
        ClassroomManager.classrooms = initialClassrooms || [];
        if (callbacks) {
            ClassroomManager.onStateChange = callbacks.onStateChange;
        }
        ClassroomManager.renderList();
    },

    setValidClassrooms: (list) => {
        ClassroomManager.classrooms = list || [];
        ClassroomManager.renderList();
    },

    renderList: () => {
        const container = document.getElementById('classroomsList');
        console.log(
            '[ClassroomManager] renderList called, container found:',
            !!container,
            'classrooms count:',
            ClassroomManager.classrooms?.length
        );
        if (!container) {
            console.error('[ClassroomManager] #classroomsList container NOT FOUND!');
            return;
        }

        // Change container to flex column layout (Row View)
        container.className = 'flex flex-col gap-3';

        // Build HTML: New Classroom Form + Classroom Rows
        let html = '';

        // =============================================
        // TOP: New Classroom Inline Form (FORM FIRST)
        // =============================================
        html += `
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
        `;

        // =============================================
        // Empty State
        // =============================================
        if (ClassroomManager.classrooms.length === 0) {
            html += `
                <div class="w-full">
                    <div class="empty-state py-12 text-center">
                        <div class="text-5xl mb-3">🏫</div>
                        <p class="text-gray-500 dark:text-gray-400 font-medium">Henüz sınıf oluşturmadınız</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Yukarıdan "Yeni Sınıf" butonuna tıklayın</p>
                    </div>
                </div>
            `;
            container.innerHTML = html;
            return;
        }

        // =============================================
        // Classroom Rows
        // =============================================
        html += ClassroomManager.classrooms
            .map((classroom) => {
                const studentCount = classroom.students?.[0]?.count || 0;
                const statusIcon = classroom.is_active ? '✅' : '⏸️';
                const statusText = classroom.is_active ? 'Aktif' : 'Duraklatıldı';
                const escapedName = ClassroomManager.escapeHtml(classroom.name);
                const escapedDesc = ClassroomManager.escapeHtml(classroom.description || '');

                return `
                <div class="classroom-accordion" data-classroom-id="${classroom.id}">
                    <!-- Main Row -->
                    <div class="classroom-row w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all">
                        
                        <!-- Left: Icon + Name + Student Count -->
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                            <div class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-lg shrink-0">
                                🏫
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <h4 class="font-bold text-sm text-slate-800 dark:text-white truncate" id="name-display-${classroom.id}">${escapedName}</h4>
                                    <span class="text-xs" title="${statusText}">${statusIcon}</span>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-slate-400" id="student-count-${classroom.id}">
                                    👨‍🎓 <span class="student-count-value">${studentCount}</span> öğrenci • ${ClassroomManager.formatDate(classroom.created_at)}
                                </p>
                            </div>
                        </div>
                        
                        <!-- Center: Classroom Code Badge -->
                        <div class="shrink-0">
                            <button onclick="ClassroomManager.copyCode('${classroom.code}', event)" 
                                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                                title="Kodu Kopyala">
                                ${classroom.code}
                            </button>
                        </div>
                        
                        <!-- Right: Action Buttons (Text-based) -->
                        <div class="flex items-center gap-2 shrink-0 flex-wrap">
                            <!-- Add Single Student (Green) -->
                            <button onclick="ClassroomManager.togglePanel('${classroom.id}', 'single')"
                                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                                + Öğrenci Ekle
                            </button>
                            
                            <!-- Bulk Add (Purple) -->
                            <button onclick="ClassroomManager.togglePanel('${classroom.id}', 'bulk')"
                                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
                                Toplu Ekle
                            </button>
                            
                            <!-- Settings (Blue/Gray) - Now Inline -->
                            <button onclick="ClassroomManager.togglePanel('${classroom.id}', 'settings')"
                                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                Ayarlar
                            </button>
                            
                            <!-- Delete (Red) -->
                            <button onclick="ClassroomManager.confirmDelete('${classroom.id}', '${escapedName}')"
                                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                                Sil
                            </button>
                        </div>
                    </div>
                    
                    <!-- Expand Panel (Hidden by default) -->
                    <div id="panel-${classroom.id}" class="classroom-panel hidden mt-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        
                        <!-- Single Add Form (Green theme) -->
                        <div id="single-form-${classroom.id}" class="hidden">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-sm">👤</span>
                                <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Tek Öğrenci Ekle</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <input type="text" 
                                    id="input-name-${classroom.id}"
                                    placeholder="Öğrenci adı girin..."
                                    class="flex-1 px-3 py-2 text-sm rounded-lg border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                                <button onclick="ClassroomManager.addSingleStudent('${classroom.id}')"
                                    class="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                                    Kaydet
                                </button>
                                <button onclick="ClassroomManager.closePanel('${classroom.id}')"
                                    class="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    İptal
                                </button>
                            </div>
                        </div>
                        
                        <!-- Bulk Add Form (Purple theme) -->
                        <div id="bulk-form-${classroom.id}" class="hidden">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-sm">👥</span>
                                <span class="text-xs font-semibold text-purple-700 dark:text-purple-400">Toplu Öğrenci Ekle</span>
                            </div>
                            <div class="space-y-3">
                                <textarea 
                                    id="input-bulk-${classroom.id}"
                                    rows="4"
                                    placeholder="Her satıra bir öğrenci adı yazın...&#10;Ali Veli&#10;Ayşe Fatma&#10;Mehmet Yılmaz"
                                    class="w-full px-3 py-2 text-sm rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"></textarea>
                                <div class="flex items-center gap-3">
                                    <button onclick="ClassroomManager.addBulkStudents('${classroom.id}')"
                                        class="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                                        Tümünü Ekle
                                    </button>
                                    <button onclick="ClassroomManager.closePanel('${classroom.id}')"
                                        class="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                        İptal
                                    </button>
                                    <span class="text-xs text-slate-500 dark:text-slate-400 ml-auto">Her satır = 1 öğrenci</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Settings Form (Blue theme) -->
                        <div id="settings-form-${classroom.id}" class="hidden">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-sm">⚙️</span>
                                <span class="text-xs font-semibold text-blue-700 dark:text-blue-400">Sınıf Ayarları</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Sınıf Adı</label>
                                    <input type="text" 
                                        id="settings-name-${classroom.id}"
                                        value="${escapedName}"
                                        class="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Açıklama</label>
                                    <input type="text" 
                                        id="settings-desc-${classroom.id}"
                                        value="${escapedDesc}"
                                        placeholder="Açıklama ekleyin..."
                                        class="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                </div>
                            </div>
                            <div class="flex items-center gap-4 mb-4">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" 
                                        id="settings-active-${classroom.id}"
                                        ${classroom.is_active ? 'checked' : ''}
                                        class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                                    <span class="text-xs text-slate-600 dark:text-slate-400">Sınıf Aktif</span>
                                </label>
                            </div>
                            <div class="flex items-center gap-3">
                                <button onclick="ClassroomManager.saveSettings('${classroom.id}')"
                                    class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                    Güncelle
                                </button>
                                <button onclick="ClassroomManager.closePanel('${classroom.id}')"
                                    class="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            })
            .join('');

        container.innerHTML = html;
    },

    create: async (name, description, submitBtn) => {
        // Show loading state
        const originalBtnText = submitBtn?.innerHTML;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Oluşturuluyor...';
        }

        try {
            // Fallback to Auth.currentUser if ClassroomManager.currentUser is null
            const user = ClassroomManager.currentUser || (typeof Auth !== 'undefined' ? Auth.currentUser : null);
            if (!user) {
                throw new Error('Kullanıcı oturumu bulunamadı');
            }

            const { data, error } = await SupabaseClient.getClient()
                .from('classrooms')
                .insert({
                    teacher_id: user.id,
                    name: name,
                    description: description || null,
                })
                .select()
                .single();

            if (error) throw error;

            // Update local state
            ClassroomManager.classrooms.push(data);
            ClassroomManager.renderList();

            if (ClassroomManager.onStateChange) ClassroomManager.onStateChange();

            return { success: true, data };
        } catch (error) {
            console.error('Error creating classroom:', error);
            return { success: false, error };
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText || 'Oluştur';
            }
        }
    },

    toggle: async (classroomId, isActive) => {
        try {
            const { error } = await SupabaseClient.getClient()
                .from('classrooms')
                .update({ is_active: isActive })
                .eq('id', classroomId);

            if (error) throw error;

            // Update local state
            const classroom = ClassroomManager.classrooms.find((c) => c.id === classroomId);
            if (classroom) classroom.is_active = isActive;

            ClassroomManager.renderList();
            return { success: true };
        } catch (error) {
            console.error('Error toggling classroom:', error);
            return { success: false, error };
        }
    },

    update: async (classroomId, updateData) => {
        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('classrooms')
                .update(updateData)
                .eq('id', classroomId)
                .select()
                .single();

            if (error) throw error;

            // Update local state
            const index = ClassroomManager.classrooms.findIndex((c) => c.id === classroomId);
            if (index !== -1) {
                ClassroomManager.classrooms[index] = { ...ClassroomManager.classrooms[index], ...data };
            }

            ClassroomManager.renderList();
            if (ClassroomManager.onStateChange) ClassroomManager.onStateChange();

            return { success: true, data };
        } catch (error) {
            console.error('Error updating classroom:', error);
            return { success: false, error };
        }
    },

    delete: async (classroomId) => {
        try {
            // Önce bu sınıfa ait öğrencilerin progress kayıtlarını sil
            const { data: students } = await SupabaseClient.getClient()
                .from('students')
                .select('id')
                .eq('classroom_id', classroomId);

            if (students && students.length > 0) {
                const studentIds = students.map((s) => s.id);

                // Öğrenci progress kayıtlarını sil
                await SupabaseClient.getClient().from('student_progress').delete().in('student_id', studentIds);

                // Öğrencileri sil
                const { error: studentsError } = await SupabaseClient.getClient()
                    .from('students')
                    .delete()
                    .eq('classroom_id', classroomId);

                if (studentsError) {
                    console.error('Error deleting students:', studentsError);
                    throw studentsError;
                }
            }

            // Sonra sınıfı sil
            const { error } = await SupabaseClient.getClient().from('classrooms').delete().eq('id', classroomId);

            if (error) throw error;

            // Update local state
            ClassroomManager.classrooms = ClassroomManager.classrooms.filter((c) => c.id !== classroomId);

            ClassroomManager.renderList();
            if (ClassroomManager.onStateChange) ClassroomManager.onStateChange();

            return { success: true };
        } catch (error) {
            console.error('Error deleting classroom:', error);
            return { success: false, error };
        }
    },

    // Helper
    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Date formatter - fallback if Utils not available
    formatDate: (dateString) => {
        if (!dateString) return '';
        // Try to use global Utils if available
        if (typeof Utils !== 'undefined' && Utils.formatDate) {
            return Utils.formatDate(dateString);
        }
        // Fallback: simple Turkish date format
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    },

    // ============================================
    // MENU MANAGEMENT - Single menu open at a time
    // ============================================

    /**
     * Close all open dropdown menus
     */
    closeAllMenus: () => {
        document.querySelectorAll('.dropdown-menu').forEach((menu) => {
            menu.classList.add('hidden');
        });
    },

    // ============================================
    // ACCORDION PANEL MANAGEMENT
    // ============================================

    /**
     * Close all open accordion panels
     */
    closeAllPanels: () => {
        // Close new classroom form
        const newClassroomPanel = document.getElementById('new-class-form-row');
        if (newClassroomPanel) newClassroomPanel.classList.add('hidden');

        // Close all classroom panels
        document.querySelectorAll('.classroom-panel').forEach((panel) => {
            panel.classList.add('hidden');
        });
        document.querySelectorAll('.classroom-panel [id^="single-form-"]').forEach((form) => {
            form.classList.add('hidden');
        });
        document.querySelectorAll('.classroom-panel [id^="bulk-form-"]').forEach((form) => {
            form.classList.add('hidden');
        });
        document.querySelectorAll('.classroom-panel [id^="settings-form-"]').forEach((form) => {
            form.classList.add('hidden');
        });
    },

    /**
     * Close a specific panel
     */
    closePanel: (classroomId) => {
        const panel = document.getElementById(`panel-${classroomId}`);
        if (panel) {
            panel.classList.add('hidden');
        }
        const singleForm = document.getElementById(`single-form-${classroomId}`);
        const bulkForm = document.getElementById(`bulk-form-${classroomId}`);
        const settingsForm = document.getElementById(`settings-form-${classroomId}`);
        if (singleForm) singleForm.classList.add('hidden');
        if (bulkForm) bulkForm.classList.add('hidden');
        if (settingsForm) settingsForm.classList.add('hidden');
    },

    /**
     * Toggle accordion panel (single, bulk, or settings form)
     * @param {string} classroomId - Classroom ID
     * @param {string} formType - 'single', 'bulk', or 'settings'
     */
    togglePanel: (classroomId, formType) => {
        const panel = document.getElementById(`panel-${classroomId}`);
        const singleForm = document.getElementById(`single-form-${classroomId}`);
        const bulkForm = document.getElementById(`bulk-form-${classroomId}`);
        const settingsForm = document.getElementById(`settings-form-${classroomId}`);

        if (!panel) {
            console.error('[ClassroomManager] Panel not found for:', classroomId);
            return;
        }

        // Determine target form
        let targetForm;
        if (formType === 'single') targetForm = singleForm;
        else if (formType === 'bulk') targetForm = bulkForm;
        else if (formType === 'settings') targetForm = settingsForm;

        if (!targetForm) {
            console.error('[ClassroomManager] Form not found:', formType, classroomId);
            return;
        }

        // Check if this specific form is already open
        const isCurrentlyOpen = !panel.classList.contains('hidden') && !targetForm.classList.contains('hidden');

        // Close ALL panels first (Focus Mode)
        ClassroomManager.closeAllPanels();

        // If it wasn't open, open it now
        if (!isCurrentlyOpen) {
            panel.classList.remove('hidden');
            targetForm.classList.remove('hidden');

            // Focus on appropriate input
            if (formType === 'single') {
                const input = document.getElementById(`input-name-${classroomId}`);
                if (input) input.focus();
            } else if (formType === 'bulk') {
                const textarea = document.getElementById(`input-bulk-${classroomId}`);
                if (textarea) textarea.focus();
            } else if (formType === 'settings') {
                const nameInput = document.getElementById(`settings-name-${classroomId}`);
                if (nameInput) nameInput.focus();
            }
        }
    },

    /**
     * Copy classroom code to clipboard with feedback
     */
    copyCode: (code, event) => {
        if (event) event.stopPropagation();

        navigator.clipboard
            .writeText(code)
            .then(() => {
                if (window.Toast) {
                    Toast.success(`Kod kopyalandı: ${code}`);
                } else {
                    alert(`Kopyalandı: ${code}`);
                }
            })
            .catch(() => {
                if (window.Toast) {
                    Toast.error('Kopyalama başarısız');
                }
            });
    },

    /**
     * Add a single student via inline form
     */
    addSingleStudent: async (classroomId) => {
        const input = document.getElementById(`input-name-${classroomId}`);
        const displayName = input?.value?.trim();

        if (!displayName) {
            if (window.Toast) Toast.error('Öğrenci adı gerekli');
            return;
        }

        try {
            // Get current user
            const user = ClassroomManager.currentUser || (typeof Auth !== 'undefined' ? Auth.currentUser : null);
            if (!user) throw new Error('Kullanıcı bulunamadı');

            // Insert student
            const { data, error } = await SupabaseClient.getClient()
                .from('students')
                .insert({
                    classroom_id: classroomId,
                    display_name: displayName,
                    avatar_emoji: '🎓',
                    added_by_teacher: true,
                })
                .select()
                .single();

            if (error) throw error;

            // Success: Clear input, close panel, update count
            input.value = '';
            ClassroomManager.closePanel(classroomId);
            ClassroomManager.updateStudentCount(classroomId, 1);

            if (window.Toast) Toast.success(`${data.display_name} eklendi!`);
        } catch (error) {
            console.error('[ClassroomManager] addSingleStudent error:', error);
            if (window.Toast) Toast.error('Ekleme hatası: ' + error.message);
        }
    },

    /**
     * Add multiple students via bulk form (one per line)
     */
    addBulkStudents: async (classroomId) => {
        const textarea = document.getElementById(`input-bulk-${classroomId}`);
        const text = textarea?.value?.trim();

        if (!text) {
            if (window.Toast) Toast.error('En az bir öğrenci adı girin');
            return;
        }

        const names = text
            .split('\n')
            .map((n) => n.trim())
            .filter((n) => n.length > 0);

        if (names.length === 0) {
            if (window.Toast) Toast.error('Geçerli isim bulunamadı');
            return;
        }

        try {
            const records = names.map((name) => ({
                classroom_id: classroomId,
                display_name: name,
                avatar_emoji: '🎓',
                added_by_teacher: true,
            }));

            const { data, error } = await SupabaseClient.getClient().from('students').insert(records).select();

            if (error) throw error;

            // Success: Clear textarea, close panel, update count
            textarea.value = '';
            ClassroomManager.closePanel(classroomId);
            ClassroomManager.updateStudentCount(classroomId, data.length);

            if (window.Toast) Toast.success(`${data.length} öğrenci eklendi!`);
        } catch (error) {
            console.error('[ClassroomManager] addBulkStudents error:', error);
            if (window.Toast) Toast.error('Toplu ekleme hatası: ' + error.message);
        }
    },

    /**
     * Update student count display after adding
     */
    updateStudentCount: (classroomId, addedCount) => {
        const countEl = document.querySelector(`#student-count-${classroomId} .student-count-value`);
        if (countEl) {
            const currentCount = parseInt(countEl.textContent) || 0;
            countEl.textContent = currentCount + addedCount;
        }

        // Also update the local state
        const classroom = ClassroomManager.classrooms.find((c) => c.id === classroomId);
        if (classroom && classroom.students && classroom.students[0]) {
            classroom.students[0].count = (classroom.students[0].count || 0) + addedCount;
        }
    },

    /**
     * Confirm delete with user confirmation dialog
     */
    confirmDelete: (classroomId, classroomName) => {
        ClassroomManager.closeAllPanels();

        const confirmed = confirm(
            `⚠️ "${classroomName}" sınıfını silmek istediğinize emin misiniz?\n\n` +
                'Bu işlem geri alınamaz ve:\n' +
                '• Sınıftaki tüm öğrenciler silinecek\n' +
                '• Tüm ilerleme verileri kaybolacak'
        );

        if (confirmed) {
            ClassroomManager.delete(classroomId);
        }
    },

    // ============================================
    // NEW CLASSROOM FORM (Top Inline)
    // ============================================

    /**
     * Toggle new classroom form visibility
     */
    toggleNewClassForm: () => {
        const panel = document.getElementById('new-class-form-row');
        if (!panel) {
            console.error('[ClassroomManager] new-class-form-row not found');
            return;
        }

        const isHidden = panel.classList.contains('hidden');

        if (isHidden) {
            ClassroomManager.closeAllPanels();
            panel.classList.remove('hidden');
            const nameInput = document.getElementById('new-class-name');
            if (nameInput) {
                nameInput.value = '';
                nameInput.focus();
            }
            const descInput = document.getElementById('new-class-desc');
            if (descInput) descInput.value = '';
            const pwdCheckbox = document.getElementById('new-class-password');
            if (pwdCheckbox) pwdCheckbox.checked = false;
        } else {
            panel.classList.add('hidden');
        }
    },

    /**
     * Create classroom from new form (with password checkbox)
     */
    createFromForm: async () => {
        const nameInput = document.getElementById('new-class-name');
        const descInput = document.getElementById('new-class-desc');
        const pwdCheckbox = document.getElementById('new-class-password');

        const name = nameInput?.value?.trim();
        const description = descInput?.value?.trim() || '';
        const passwordRequired = pwdCheckbox?.checked || false;

        if (!name) {
            if (window.Toast) Toast.warning('Lütfen sınıf adı girin');
            nameInput?.focus();
            return;
        }

        try {
            await ClassroomManager.create(name, description, null);
            ClassroomManager.toggleNewClassForm(); // Hide form
            if (window.Toast) Toast.success(`"${name}" sınıfı oluşturuldu!`);
        } catch (error) {
            console.error('[ClassroomManager] createFromForm error:', error);
            if (window.Toast) Toast.error('Sınıf oluşturulamadı: ' + error.message);
        }
    },

    /**
     * Show the new classroom form at the top (legacy - calls toggleNewClassForm)
     */
    showNewClassroomForm: () => {
        ClassroomManager.toggleNewClassForm();
    },

    /**
     * Hide the new classroom form (legacy - calls toggleNewClassForm)
     */
    hideNewClassroomForm: () => {
        const panel = document.getElementById('new-class-form-row');
        if (panel) {
            panel.classList.add('hidden');
        }
    },

    /**
     * Create new classroom from inline form
     */
    createNewClassroom: async () => {
        const nameInput = document.getElementById('new-classroom-name');
        const descInput = document.getElementById('new-classroom-description');
        const btn = document.getElementById('btn-create-classroom');

        const name = nameInput?.value?.trim();
        const description = descInput?.value?.trim();

        if (!name) {
            if (window.Toast) Toast.error('Sınıf adı gerekli');
            nameInput?.focus();
            return;
        }

        // Show loading
        const originalText = btn?.textContent;
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Oluşturuluyor...';
        }

        try {
            const result = await ClassroomManager.create(name, description, null);

            if (result.success) {
                ClassroomManager.hideNewClassroomForm();
                if (window.Toast) Toast.success(`"${name}" sınıfı oluşturuldu!`);

                // Add to local state and re-render
                if (result.classroom) {
                    ClassroomManager.classrooms.unshift({
                        ...result.classroom,
                        students: [{ count: 0 }],
                    });
                    ClassroomManager.renderList();
                }
            } else {
                if (window.Toast) Toast.error('Oluşturma hatası: ' + (result.error?.message || 'Bilinmeyen hata'));
            }
        } catch (error) {
            console.error('[ClassroomManager] createNewClassroom error:', error);
            if (window.Toast) Toast.error('Oluşturma hatası: ' + error.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    },

    // ============================================
    // SETTINGS (Inline Form)
    // ============================================

    /**
     * Save classroom settings from inline form
     */
    saveSettings: async (classroomId) => {
        const nameInput = document.getElementById(`settings-name-${classroomId}`);
        const descInput = document.getElementById(`settings-desc-${classroomId}`);
        const activeCheckbox = document.getElementById(`settings-active-${classroomId}`);

        const name = nameInput?.value?.trim();
        const description = descInput?.value?.trim();
        const isActive = activeCheckbox?.checked ?? true;

        if (!name) {
            if (window.Toast) Toast.error('Sınıf adı gerekli');
            nameInput?.focus();
            return;
        }

        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('classrooms')
                .update({
                    name: name,
                    description: description,
                    is_active: isActive,
                })
                .eq('id', classroomId)
                .select()
                .single();

            if (error) throw error;

            // Update local state
            const classroom = ClassroomManager.classrooms.find((c) => c.id === classroomId);
            if (classroom) {
                classroom.name = name;
                classroom.description = description;
                classroom.is_active = isActive;
            }

            // Update display
            const nameDisplay = document.getElementById(`name-display-${classroomId}`);
            if (nameDisplay) nameDisplay.textContent = data.name;

            ClassroomManager.closePanel(classroomId);
            if (window.Toast) Toast.success('Ayarlar güncellendi!');

            // Re-render to update status icons
            ClassroomManager.renderList();
        } catch (error) {
            console.error('[ClassroomManager] saveSettings error:', error);
            if (window.Toast) Toast.error('Güncelleme hatası: ' + error.message);
        }
    },

    // Legacy - kept for backward compatibility
    closeAllMenus: () => {
        ClassroomManager.closeAllPanels();
    },
    toggleMenu: () => {},
    initClickOutsideHandler: () => {},
};

window.ClassroomManager = ClassroomManager;
