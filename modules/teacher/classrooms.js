/**
 * Yeti LAB - Classroom Manager Module
 * Sınıf oluşturma, düzenleme, silme ve listeleme işlemlerini yönetir.
 */

export const ClassroomManager = {
    classrooms: [],
    currentUser: null,
    onStateChange: null, // Callback to update parent state/UI (e.g. dashboard stats)

    init: (user, initialClassrooms, callbacks) => {
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

        if (ClassroomManager.classrooms.length === 0) {
            container.innerHTML = `
                <div class="col-span-full">
                    <div class="empty-state py-8">
                        <div class="icon text-4xl mb-2">🏫</div>
                        <p class="text-gray-500">Henüz sınıf oluşturmadınız</p>
                        <p class="text-xs text-gray-400 mt-1">Üst menüden "Yeni Sınıf" butonuna tıklayın</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = ClassroomManager.classrooms
            .map((classroom) => {
                const studentCount = classroom.students?.[0]?.count || 0;
                const requiresPassword = classroom.requires_password ? '🔒' : '';
                const statusIcon = classroom.is_active ? '✅' : '⏸️';
                return `
                <div class="glass-card rounded-xl p-3 hover:shadow-md transition-all">
                    <!-- Header + Code inline -->
                    <div class="flex items-center gap-3 mb-2">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5">
                                <h4 class="font-bold text-sm text-gray-800 dark:text-white truncate">${ClassroomManager.escapeHtml(classroom.name)}</h4>
                                ${requiresPassword ? '<span class="text-xs">🔒</span>' : ''}
                                <span class="text-sm ml-auto">${statusIcon}</span>
                            </div>
                        </div>
                        <div class="code-box text-sm px-2 py-1 cursor-pointer hover:bg-theme/10 transition-colors shrink-0" 
                             onclick="event.stopPropagation(); copyCode(this)" 
                             title="Kopyala">
                            ${classroom.code}
                        </div>
                    </div>
                    
                    <!-- Stats + Actions inline -->
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">👨‍🎓 ${studentCount}</span>
                        <span class="text-xs text-gray-400">${ClassroomManager.formatDate(classroom.created_at)}</span>
                        
                        <div class="ml-auto flex gap-1">
                            <button onclick="viewClassroom('${classroom.id}')" 
                                class="px-2 py-1 text-xs bg-theme/10 text-theme rounded font-medium hover:bg-theme/20 transition-colors">
                                Görüntüle
                            </button>
                            <button onclick="openAddStudentModal('${classroom.id}')"
                                class="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                title="Öğrenci Ekle">
                                +
                            </button>
                            <div class="relative inline-block">
                                <button onclick="this.nextElementSibling.classList.toggle('hidden')"
                                    class="px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Diğer">
                                    ⋯
                                </button>
                                <div class="hidden absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                    <button onclick="openBulkAddModal('${classroom.id}'); this.parentElement.classList.add('hidden')"
                                        class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        📋 Toplu Ekle
                                    </button>
                                    <button onclick="openClassroomSettings('${classroom.id}'); this.parentElement.classList.add('hidden')"
                                        class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        ⚙️ Ayarlar
                                    </button>
                                    <hr class="my-1 border-gray-200 dark:border-gray-700">
                                    <button onclick="toggleClassroom('${classroom.id}', ${!classroom.is_active}); this.parentElement.classList.add('hidden')"
                                        class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        ${classroom.is_active ? '⏸️ Duraklat' : '▶️ Aktifleştir'}
                                    </button>
                                    <button onclick="deleteClassroom('${classroom.id}')"
                                        class="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        🗑️ Sil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            })
            .join('');
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
};

window.ClassroomManager = ClassroomManager;
