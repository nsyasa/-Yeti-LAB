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
        if (!container) return;

        if (ClassroomManager.classrooms.length === 0) {
            container.innerHTML = `
                <div class="col-span-full">
                    <div class="empty-state">
                        <div class="icon">🏫</div>
                        <p class="text-lg mb-2">Henüz sınıf oluşturmadınız</p>
                        <button onclick="openCreateClassroomModal()" 
                            class="mt-4 px-6 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                            İlk Sınıfını Oluştur
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = ClassroomManager.classrooms
            .map((classroom) => {
                const studentCount = classroom.students?.[0]?.count || 0;
                const requiresPassword = classroom.requires_password ? '🔒' : '';
                return `
                <div class="glass-card rounded-2xl p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="font-bold text-lg text-gray-800 dark:text-white">${ClassroomManager.escapeHtml(classroom.name)} ${requiresPassword}</h4>
                            <p class="text-sm text-gray-500">${classroom.description || 'Açıklama yok'}</p>
                        </div>
                        <span class="text-2xl">${classroom.is_active ? '✅' : '⏸️'}</span>
                    </div>
                    <div class="code-box text-xl mb-4" onclick="copyCode(this)">${classroom.code}</div>
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>👨‍🎓 ${studentCount} öğrenci</span>
                        <span>${ClassroomManager.formatDate(classroom.created_at)}</span>
                    </div>
                    <div class="flex gap-2 mb-3">
                        <button onclick="viewClassroom('${classroom.id}')" 
                            class="flex-1 px-3 py-2 bg-theme/10 text-theme rounded-lg font-medium hover:bg-theme/20 transition-colors">
                            Görüntüle
                        </button>
                        <button onclick="openAddStudentModal('${classroom.id}')"
                            class="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                            title="Öğrenci Ekle">
                            ➕👨‍🎓
                        </button>
                        <button onclick="openBulkAddModal('${classroom.id}')"
                            class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                            title="Toplu Ekle">
                            📋
                        </button>
                        <button onclick="openClassroomSettings('${classroom.id}')"
                            class="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            title="Sınıf Ayarları">
                            ⚙️
                        </button>
                    </div>
                    <div class="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <button onclick="toggleClassroom('${classroom.id}', ${!classroom.is_active})"
                            class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            title="${classroom.is_active ? 'Sınıfı Duraklat' : 'Sınıfı Aktifleştir'}">
                            ${classroom.is_active ? '⏸️ Duraklat' : '▶️ Aktifleştir'}
                        </button>
                        <button onclick="deleteClassroom('${classroom.id}')"
                            class="px-3 py-2 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title="Sınıfı Sil">
                            🗑️ Sil
                        </button>
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

    delete: async (classroomId) => {
        try {
            // In a real scenario we might need to cascade delete manually if DB doesn't handle it
            // but assuming Supabase handling or let it fail if connected.
            // Teacher Manager original code was simple delete.
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
