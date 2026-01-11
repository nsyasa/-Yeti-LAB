/**
 * Yeti LAB - Student Manager Module
 * Öğrenci listeleme, ekleme, düzenleme ve silme işlemlerini yönetir.
 */

export const StudentManager = {
    students: [],
    classrooms: [],
    currentUser: null,
    onStateChange: null, // Callback to update parent state (dashboard loads)

    init: (user, studentsData, classroomsData, callbacks) => {
        StudentManager.currentUser = user;
        StudentManager.students = studentsData || [];
        StudentManager.classrooms = classroomsData || [];

        if (callbacks) {
            StudentManager.onStateChange = callbacks.onStateChange;
        }

        StudentManager.renderList();
    },

    setStudents: (list) => {
        StudentManager.students = list || [];
        StudentManager.renderList();
    },

    setClassrooms: (list) => {
        StudentManager.classrooms = list || [];
        // Re-render handled by updateUI or explicit call
    },

    renderList: () => {
        const container = document.getElementById('studentsList');
        if (!container) return;

        const filterSelect = document.getElementById('classroomFilter');
        const selectedClassroom = filterSelect ? filterSelect.value : 'all';

        // Update filter options if only default exists or option count mismatch
        if (
            filterSelect &&
            (filterSelect.options.length <= 1 || filterSelect.options.length !== StudentManager.classrooms.length + 1)
        ) {
            const currentVal = filterSelect.value;
            filterSelect.innerHTML =
                '<option value="all">Tüm Sınıflar</option>' +
                StudentManager.classrooms
                    .map((c) => `<option value="${c.id}">${StudentManager.escapeHtml(c.name)}</option>`)
                    .join('');
            filterSelect.value = currentVal;

            // Re-attach listener? better to rely on onchange="loadStudents()" which delegates here
        }

        // Filter students
        let filteredStudents = StudentManager.students;
        if (selectedClassroom !== 'all') {
            filteredStudents = StudentManager.students.filter((s) => s.classroom_id === selectedClassroom);
        }

        if (filteredStudents.length === 0) {
            container.innerHTML = `
                <div class="empty-state py-8">
                    <div class="text-4xl opacity-50 mb-2">👨‍🎓</div>
                    <p class="text-sm text-gray-500">Henüz öğrenci yok</p>
                    <p class="text-xs mt-1 text-gray-400">Öğrenciler sınıf kodunu kullanarak katılabilir</p>
                </div>
            `;
            return;
        }

        container.innerHTML =
            '<div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">' +
            filteredStudents
                .map((student) => {
                    const classroom = StudentManager.classrooms.find((c) => c.id === student.classroom_id);
                    const progressCount = student.student_progress?.length || 0;
                    const hasPassword = student.password ? '🔒' : '';
                    const hasArduino = student.student_progress?.some(
                        (p) => p.course_id === 'arduino' || p.project_id?.includes('arduino')
                    )
                        ? '<span title="Arduino Modülüne Başlamış">🤖</span>'
                        : '';

                    return `
                <div class="group flex items-center justify-between p-2 hover:bg-theme/5 transition-colors cursor-pointer" 
                     onclick="openEditStudentModal('${student.id}')">
                    
                    <div class="flex items-center gap-3 flex-grow min-w-0">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-lg flex-shrink-0 border border-gray-200 dark:border-gray-600">
                            ${student.avatar_emoji || '🎓'}
                        </div>
                        <div class="min-w-0 flex flex-col justify-center">
                            <div class="flex items-center gap-2">
                                <p class="font-semibold text-gray-800 dark:text-white text-sm truncate leading-none">${StudentManager.escapeHtml(student.display_name)}</p>
                                <span class="text-[10px] text-gray-400">${hasPassword}</span>
                            </div>
                            <p class="text-[10px] text-gray-500 truncate mt-0.5">${classroom?.name || '-'} • ${progressCount} ders ${hasArduino}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onclick="event.stopPropagation(); openStudentDetailModal('${student.id}')" 
                            class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                            İlerleme
                        </button>
                        <button onclick="event.stopPropagation(); openEditStudentModal('${student.id}')" 
                            class="p-1.5 text-gray-400 hover:text-theme rounded hover:bg-gray-100 transition-colors" title="Düzenle">
                            ✏️
                        </button>
                    </div>
                </div>
            `;
                })
                .join('') +
            '</div>';
    },

    add: async (classroomId, displayName, password, avatarEmoji) => {
        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('students')
                .insert({
                    classroom_id: classroomId,
                    display_name: displayName,
                    password: password || null,
                    avatar_emoji: avatarEmoji || '🎓',
                })
                .select()
                .single();

            if (error) throw error;

            StudentManager.students.push(data);
            StudentManager.renderList();
            if (StudentManager.onStateChange) StudentManager.onStateChange();

            return { success: true, data };
        } catch (error) {
            console.error('Error adding student:', error);
            return { success: false, error };
        }
    },

    bulkAdd: async (studentsData) => {
        try {
            const { data, error } = await SupabaseClient.getClient().from('students').insert(studentsData).select();

            if (error) throw error;

            StudentManager.students.push(...data);
            StudentManager.renderList();
            if (StudentManager.onStateChange) StudentManager.onStateChange();

            return { success: true, data };
        } catch (error) {
            console.error('Error in bulk add:', error);
            return { success: false, error };
        }
    },

    update: async (studentId, updateData) => {
        try {
            const { error } = await SupabaseClient.getClient().from('students').update(updateData).eq('id', studentId);

            if (error) throw error;

            const index = StudentManager.students.findIndex((s) => s.id === studentId);
            if (index !== -1) {
                StudentManager.students[index] = { ...StudentManager.students[index], ...updateData };
                StudentManager.renderList();
            }
            if (StudentManager.onStateChange) StudentManager.onStateChange();

            return { success: true };
        } catch (error) {
            console.error('Error updating student:', error);
            return { success: false, error };
        }
    },

    delete: async (studentId) => {
        try {
            const { error } = await SupabaseClient.getClient().from('students').delete().eq('id', studentId);

            if (error) throw error;

            StudentManager.students = StudentManager.students.filter((s) => s.id !== studentId);
            StudentManager.renderList();
            if (StudentManager.onStateChange) StudentManager.onStateChange();

            return { success: true };
        } catch (error) {
            console.error('Error deleting student:', error);
            return { success: false, error };
        }
    },

    printList: () => {
        const filterSelect = document.getElementById('classroomFilter');
        const selectedClassroom = filterSelect ? filterSelect.value : 'all';
        let filteredStudents = StudentManager.students;

        if (selectedClassroom !== 'all') {
            filteredStudents = StudentManager.students.filter((s) => s.classroom_id === selectedClassroom);
        }

        if (filteredStudents.length === 0) {
            alert('Yazdırılacak öğrenci yok');
            return;
        }

        const classroomName =
            selectedClassroom === 'all'
                ? 'Tüm Sınıflar'
                : StudentManager.classrooms.find((c) => c.id === selectedClassroom)?.name || 'Sınıf';

        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Öğrenci Listesi</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; margin-bottom: 5px; }
            h2 { text-align: center; color: #666; margin-top: 0; font-size: 16px; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .password-col { font-family: monospace; font-size: 14px; letter-spacing: 1px; }
            @media print { button { display: none; } }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<h1>Yeti LAB Öğrenci Listesi</h1>');
        printWindow.document.write(`<h2>${classroomName} (${StudentManager.formatDate(new Date())})</h2>`);
        printWindow.document.write(
            '<table><thead><tr><th>Öğrenci Adı</th><th>Sınıf</th><th>Şifre</th></tr></thead><tbody>'
        );

        filteredStudents.forEach((s) => {
            const cName = StudentManager.classrooms.find((c) => c.id === s.classroom_id)?.name || '-';
            printWindow.document.write(`
            <tr>
                <td>${StudentManager.escapeHtml(s.display_name)}</td>
                <td>${StudentManager.escapeHtml(cName)}</td>
                <td class="password-col">${s.password || '<span style="color:#999;font-style:italic">Şifresiz</span>'}</td>
            </tr>
        `);
        });

        printWindow.document.write('</tbody></table>');
        printWindow.document.write('<script>window.onload = function() { window.print(); }</script>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
    },

    generatePassword: () => {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed similar looking chars
        let pass = '';
        for (let i = 0; i < 6; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    },

    // Helper - escapeHtml fallback
    escapeHtml: (text) => {
        if (!text) return '';
        if (typeof Utils !== 'undefined' && Utils.escapeHtml) {
            return Utils.escapeHtml(text);
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Helper - formatDate fallback
    formatDate: (dateInput) => {
        if (!dateInput) return '';
        if (typeof Utils !== 'undefined' && Utils.formatDate) {
            return Utils.formatDate(dateInput);
        }
        try {
            const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
            return date.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch (e) {
            return String(dateInput);
        }
    },
};

window.StudentManager = StudentManager;
