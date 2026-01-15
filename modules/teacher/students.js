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
        console.log(
            '[StudentManager] renderList called, container found:',
            !!container,
            'students count:',
            StudentManager.students?.length
        );
        if (!container) {
            console.error('[StudentManager] #studentsList container NOT FOUND!');
            return;
        }

        const filterSelect = document.getElementById('classroomFilter');
        const selectedClassroom = filterSelect ? filterSelect.value : 'all';

        // Get search query from StudentsSection
        const searchQuery = window.StudentsSection?.getSearchQuery?.() || '';

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

        // Filter students by classroom
        let filteredStudents = StudentManager.students;
        if (selectedClassroom !== 'all') {
            filteredStudents = StudentManager.students.filter((s) => s.classroom_id === selectedClassroom);
        }

        // Filter by search query
        if (searchQuery) {
            filteredStudents = filteredStudents.filter((s) => s.display_name?.toLowerCase().includes(searchQuery));
        }

        if (filteredStudents.length === 0) {
            // Differentiate between no students at all vs no matches
            const hasStudents = StudentManager.students.length > 0;
            container.innerHTML = `
                <div class="empty-state py-8">
                    <div class="text-4xl opacity-50 mb-2">${hasStudents ? '🔍' : '👨‍🎓'}</div>
                    <p class="text-sm text-gray-500">${hasStudents ? 'Filtreye uygun öğrenci bulunamadı' : 'Henüz öğrenci yok'}</p>
                    <p class="text-xs mt-1 text-gray-400">${hasStudents ? 'Farklı bir sınıf seçin veya arama terimini değiştirin' : 'Öğrenciler sınıf kodunu kullanarak katılabilir'}</p>
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
            if (window.Toast) {
                Toast.warning('Yazdırılacak öğrenci yok');
            } else {
                alert('Yazdırılacak öğrenci yok');
            }
            return;
        }

        const classroomName =
            selectedClassroom === 'all'
                ? 'Tüm Sınıflar'
                : StudentManager.classrooms.find((c) => c.id === selectedClassroom)?.name || 'Sınıf';

        const currentDate = new Date().toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        // FİŞ TASARIMI - Güncellenmiş Modern Tasarım (Logo + Class Code)
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) {
            if (window.Toast) Toast.error('Pop-up engelleyici aktif olabilir');
            return;
        }

        // Build cards HTML
        let cardsHTML = '';
        filteredStudents.forEach((student) => {
            const cls = StudentManager.classrooms.find((c) => c.id === student.classroom_id);
            const cName = cls?.name || 'Sınıfsız';
            // Use classroom code or fallback to ID (shortened) or '-'
            const cCode = cls?.code || (cls?.id ? cls.id.substring(0, 6).toUpperCase() : '-');

            cardsHTML += `
                <div class="student-card">
                    <div class="card-header">
                        <div class="header-text">${StudentManager.escapeHtml(cName)}</div>
                        <img src="img/logo.svg" alt="Yeti Lab" class="card-logo">
                    </div>
                    <div class="content">
                        <div class="info-row highlight">
                            <span class="label">Sınıf Kodu:</span> 
                            <span class="value code">${cCode}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Öğrenci:</span> 
                            <span class="value strong">${StudentManager.escapeHtml(student.display_name)}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Şifre:</span> 
                            <span class="value monospace">${student.password || 'Şifresiz'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Giriş:</span> 
                            <span class="value link">yetilab.com</span>
                        </div>
                    </div>
                    <div class="cut-line">✂️ ---------------- KESİNİZ ----------------</div>
                </div>
            `;
        });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="tr">
            <head>
                <meta charset="UTF-8">
                <title>${classroomName} - Öğrenci Şifre Fişleri</title>
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
                    <h1>🎓 ${classroomName}</h1>
                    <div class="info">${currentDate} • ${filteredStudents.length} öğrenci • Yeti LAB Giriş Bilgileri</div>
                </div>
                
                <div class="grid-container">
                    ${cardsHTML}
                </div>
                
                <script>
                    window.onload = function() { 
                        setTimeout(function() { window.print(); }, 1000);
                    }
                </script>
            </body>
            </html>
        `);
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
