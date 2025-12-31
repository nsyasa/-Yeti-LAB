
// ==========================================
// YETI LAB - TEACHER PANEL MODULE
// ==========================================

// Global State
let currentUser = null;
let classrooms = [];
let students = [];
let currentClassroom = null;
let bulkStudentsData = [];
let selectedAvatarEmoji = '🎓';
let editSelectedAvatarEmoji = '🎓';
let currentDetailStudentId = null;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎓 Teacher Panel initializing...');

    try {
        // Initialize Supabase & Auth
        if (typeof SupabaseClient !== 'undefined') {
            await SupabaseClient.init();
        }

        if (typeof Auth !== 'undefined') {
            await Auth.init();

            // Allow check without strict redirect if Auth handles it
            if (!Auth.currentUser) {
                // If Auth.init didn't handle redirect
                if (!window.location.pathname.includes('auth.html')) {
                    console.warn('No user, redirecting to auth...');
                    window.location.href = 'auth.html';
                    return;
                }
            } else {
                // Check Role
                if (Auth.userRole !== 'teacher' && Auth.userRole !== 'admin') {
                    showToast('Bu sayfa sadece öğretmenler içindir', 'error');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                    return;
                }

                currentUser = Auth.currentUser;

                // Initialize UI
                updateUserInfo();
                applyTheme();

                // Load Initial Data
                await loadDashboardData();

                // Show Dashboard
                hideLoading();
                showSection('dashboard');

                console.log('✅ Teacher Panel ready');
            }
        }

    } catch (e) {
        console.error('Initialization error:', e);
        showToast('Başlatma hatası: ' + e.message, 'error');
    }
});

// ==========================================
// UI FUNCTIONS
// ==========================================

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('[id$="Section"]').forEach(el => el.classList.add('hidden'));

    // Show selected section
    const sectionEl = document.getElementById(section + 'Section');
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
    }

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'classrooms': 'Sınıflarım',
        'students': 'Öğrenciler',
        'progress': 'İlerleme Takibi'
    };
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = titles[section] || section;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-theme/10', 'text-theme');
        if (item.dataset.section === section) {
            item.classList.add('bg-theme/10', 'text-theme');
        }
    });

    // Load section data
    if (section === 'classrooms') loadClassrooms();
    if (section === 'students') loadStudents();
    if (section === 'progress') loadProgress();
}

function hideLoading() {
    const el = document.getElementById('loadingState');
    if (el) el.classList.add('hidden');
}

function updateUserInfo() {
    if (!typeof Auth === 'undefined') return;

    const name = Auth.getDisplayName();
    const avatarUrl = Auth.getAvatarUrl();

    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = name;

    if (avatarUrl) {
        const avatarEl = document.getElementById('userAvatar');
        const fallbackEl = document.getElementById('userAvatarFallback');
        if (avatarEl) {
            avatarEl.src = avatarUrl;
            avatarEl.classList.remove('hidden');
        }
        if (fallbackEl) fallbackEl.style.display = 'none';
    } else {
        const fallbackEl = document.getElementById('userAvatarFallback');
        if (fallbackEl) fallbackEl.textContent = name.charAt(0).toUpperCase();
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('yeti_theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
}

function applyTheme() {
    const theme = localStorage.getItem('yeti_theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.textContent = '☀️';
    }
}

// ==========================================
// UTILITY FUNCTIONS & TOAST WRAPPER
// ==========================================

function showToast(message, type = 'info') {
    if (window.Toast) {
        if (type === 'success') window.Toast.success(message);
        else if (type === 'error') window.Toast.error(message);
        else if (type === 'warning') window.Toast.warning(message);
        else window.Toast.info(message);
    } else {
        console.log(`[Toast ${type}]: ${message}`);
        // Fallback implementation if Toast module is missing
        const toast = document.getElementById('toast');
        if (toast) {
            const toastMessage = document.getElementById('toastMessage');
            toastMessage.textContent = message;
            toast.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 z-50';
            if (type === 'success') toast.classList.add('bg-green-600', 'text-white');
            else if (type === 'error') toast.classList.add('bg-red-600', 'text-white');
            else toast.classList.add('bg-gray-900', 'text-white');

            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        } else {
            alert(message);
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelativeTime(dateString) {
    if (!dateString) return 'Hiç';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return formatDate(dateString);
}

// ==========================================
// DATA FUNCTIONS
// ==========================================

async function loadDashboardData() {
    try {
        if (!currentUser) return;

        // Load classrooms
        const { data: classroomsData, error: classroomsError } = await SupabaseClient.getClient()
            .from('classrooms')
            .select('*, students(count)')
            .eq('teacher_id', currentUser.id);

        if (classroomsError) throw classroomsError;

        classrooms = classroomsData || [];

        // Calculate stats
        const totalClassrooms = classrooms.length;
        let totalStudents = 0;
        let activeToday = 0;

        // Get all students for this teacher's classrooms
        if (classrooms.length > 0) {
            const classroomIds = classrooms.map(c => c.id);

            const { data: studentsData, error: studentsError } = await SupabaseClient.getClient()
                .from('students')
                .select('*')
                .in('classroom_id', classroomIds);

            if (!studentsError && studentsData) {
                students = studentsData;
                totalStudents = studentsData.length;

                // Calculate active today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                activeToday = studentsData.filter(s => {
                    if (!s.last_active_at) return false;
                    const lastActive = new Date(s.last_active_at);
                    return lastActive >= today;
                }).length;
            }
        } else {
            students = [];
        }

        // Update stats UI
        const elTotalClassrooms = document.getElementById('statClassrooms');
        const elTotalStudents = document.getElementById('statStudents');
        const elActiveToday = document.getElementById('statActiveToday');
        const elCompletedLessons = document.getElementById('statCompletedLessons');

        if (elTotalClassrooms) elTotalClassrooms.textContent = totalClassrooms;
        if (elTotalStudents) elTotalStudents.textContent = totalStudents;
        if (elActiveToday) elActiveToday.textContent = activeToday;
        if (elCompletedLessons) elCompletedLessons.textContent = '0'; // Will be updated by loadProgress if needed

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Veri yüklenirken hata oluştu', 'error');
    }
}

async function loadClassrooms() {
    const container = document.getElementById('classroomsList');
    if (!container) return;

    if (classrooms.length === 0) {
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

    container.innerHTML = classrooms.map(classroom => {
        const studentCount = classroom.students?.[0]?.count || 0;
        const requiresPassword = classroom.requires_password ? '🔒' : '';
        return `
            <div class="glass-card rounded-2xl p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-lg text-gray-800 dark:text-white">${escapeHtml(classroom.name)} ${requiresPassword}</h4>
                        <p class="text-sm text-gray-500">${classroom.description || 'Açıklama yok'}</p>
                    </div>
                    <span class="text-2xl">${classroom.is_active ? '✅' : '⏸️'}</span>
                </div>
                <div class="code-box text-xl mb-4" onclick="copyCode(this)">${classroom.code}</div>
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>👨‍🎓 ${studentCount} öğrenci</span>
                    <span>${formatDate(classroom.created_at)}</span>
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
    }).join('');
}

async function loadStudents() {
    const container = document.getElementById('studentsList');
    if (!container) return;

    const filterSelect = document.getElementById('classroomFilter');
    const selectedClassroom = filterSelect ? filterSelect.value : 'all';

    // Update filter options
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">Tüm Sınıflar</option>' +
            classrooms.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        filterSelect.value = selectedClassroom;

        // Add event listener (overwrite old one)
        filterSelect.onchange = () => loadStudents();
    }

    // Filter students
    let filteredStudents = students;
    if (selectedClassroom !== 'all') {
        filteredStudents = students.filter(s => s.classroom_id === selectedClassroom);
    }

    if (filteredStudents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">👨‍🎓</div>
                <p>Henüz öğrenci yok</p>
                <p class="text-sm mt-2">Öğrenciler sınıf kodunu kullanarak katılabilir</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredStudents.map(student => {
        const classroom = classrooms.find(c => c.id === student.classroom_id);
        const lastActive = formatRelativeTime(student.last_active_at);
        const addedByTeacher = student.added_by_teacher ? '<span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Öğretmen ekledi</span>' : '';
        const hasPassword = student.password ? '🔒' : '';

        return `
            <div class="student-item">
                <div class="w-12 h-12 rounded-full bg-theme/10 flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-transform" 
                     onclick="openEditStudentModal('${student.id}')" title="Düzenle">
                    ${student.avatar_emoji || '🎓'}
                </div>
                <div class="flex-grow cursor-pointer" onclick="openEditStudentModal('${student.id}')">
                    <p class="font-semibold text-gray-800 dark:text-white">${escapeHtml(student.display_name)} ${hasPassword}</p>
                    <p class="text-sm text-gray-500">${classroom?.name || 'Bilinmeyen sınıf'} ${addedByTeacher}</p>
                </div>
                <div class="text-right text-sm text-gray-400 flex items-center gap-2">
                    <div class="hidden sm:block">
                        <p>Son aktif: ${lastActive}</p>
                    </div>
                    <button onclick="event.stopPropagation(); openStudentDetailModal('${student.id}')" 
                        class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Detaylı Görüntüle">
                        📊
                    </button>
                    <button onclick="event.stopPropagation(); openEditStudentModal('${student.id}')" 
                        class="p-2 text-theme hover:bg-theme/10 rounded-lg transition-colors"
                        title="Öğrenciyi Düzenle">
                        ✏️
                    </button>
                    <button onclick="event.stopPropagation(); deleteStudent('${student.id}')" 
                        class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Öğrenciyi Sil">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadProgress() {
    const container = document.getElementById('courseProgress');
    if (!container) return;

    // Show loading
    container.innerHTML = `
        <div class="flex justify-center py-8">
            <div class="spinner"></div>
        </div>
    `;

    try {
        // Get all students from teacher's classrooms
        if (students.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">👨‍🎓</div>
                    <p>Henüz öğrenci yok</p>
                    <p class="text-sm mt-2">İlerleme verisi görüntülemek için önce öğrenci gerekli</p>
                </div>
            `;
            return;
        }

        const studentIds = students.map(s => s.id);

        // Get all progress data
        const { data: progressData, error } = await SupabaseClient.getClient()
            .from('student_progress')
            .select('student_id, course_id, project_id, completed_at')
            .in('student_id', studentIds);

        if (error) throw error;

        // Update total completed lessons stat
        const totalCompleted = progressData?.length || 0;
        const statEl = document.getElementById('statCompletedLessons');
        if (statEl) statEl.textContent = totalCompleted;

        if (!progressData || progressData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📊</div>
                    <p>Henüz tamamlanan ders yok</p>
                    <p class="text-sm mt-2">Öğrenciler ders tamamladıkça burada görünecek</p>
                </div>
            `;
            return;
        }

        // Group by course
        const courseProgress = {};
        progressData.forEach(p => {
            if (!courseProgress[p.course_id]) {
                courseProgress[p.course_id] = {
                    courseKey: p.course_id,
                    students: {},
                    totalCompleted: 0
                };
            }

            if (!courseProgress[p.course_id].students[p.student_id]) {
                const student = students.find(s => s.id === p.student_id);
                courseProgress[p.course_id].students[p.student_id] = {
                    name: student?.display_name || 'Bilinmeyen',
                    completed: []
                };
            }

            courseProgress[p.course_id].students[p.student_id].completed.push(p.project_id);
            courseProgress[p.course_id].totalCompleted++;
        });

        // Course name mapping
        const courseNames = {
            'arduino': '🔌 Arduino',
            'microbit': '📟 Micro:bit',
            'scratch': '🐱 Scratch',
            'mblock': '🤖 mBlock',
            'appinventor': '📱 App Inventor'
        };

        // Render progress
        let html = '';

        Object.entries(courseProgress).forEach(([courseKey, data]) => {
            const courseName = courseNames[courseKey] || courseKey;
            const studentList = Object.entries(data.students);

            html += `
                <div class="glass-card rounded-xl p-4 mb-4">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-lg text-gray-800 dark:text-white">${courseName}</h4>
                        <span class="text-sm text-gray-500">${data.totalCompleted} tamamlama</span>
                    </div>
                    <div class="space-y-3">
                        ${studentList.map(([studentId, studentData]) => {
                const completedCount = studentData.completed.length;
                return `
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div class="w-10 h-10 rounded-full bg-theme/10 flex items-center justify-center text-xl">🎓</div>
                                    <div class="flex-grow">
                                        <p class="font-medium text-gray-800 dark:text-white">${escapeHtml(studentData.name)}</p>
                                        <p class="text-sm text-gray-500">${completedCount} ders tamamladı</p>
                                    </div>
                                    <div class="flex gap-1">
                                        ${studentData.completed.slice(0, 5).map(() => '<span class="text-green-500">✓</span>').join('')}
                                        ${completedCount > 5 ? `<span class="text-gray-400 text-sm">+${completedCount - 5}</span>` : ''}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || `
            <div class="empty-state">
                <div class="icon">📊</div>
                <p>İlerleme verisi henüz yok</p>
            </div>
        `;

    } catch (error) {
        console.error('Error loading progress:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <p>Veri yüklenirken hata oluştu</p>
                <button onclick="loadProgress()" class="mt-4 px-4 py-2 bg-theme text-white rounded-lg">Tekrar Dene</button>
            </div>
        `;
    }
}

// ==========================================
// CLASSROOM ACTIONS
// ==========================================

function openCreateClassroomModal() {
    document.getElementById('createClassroomModal').classList.add('open');
    document.getElementById('classroomName').focus();
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
}

async function createClassroom(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.disabled) return;

    const name = document.getElementById('classroomName').value.trim();
    const description = document.getElementById('classroomDescription').value.trim();

    if (!name) {
        showToast('Sınıf adı gerekli', 'error');
        return;
    }

    // Show loading state
    const originalBtnText = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Oluşturuluyor...';
    }

    try {
        const { data, error } = await SupabaseClient.getClient()
            .from('classrooms')
            .insert({
                teacher_id: currentUser.id,
                name: name,
                description: description || null
            })
            .select()
            .single();

        if (error) throw error;

        // Update local state
        classrooms.push(data);

        // Close modal and reset form
        closeModal('createClassroomModal');
        document.getElementById('createClassroomForm').reset();

        // Show success
        showToast(`"${name}" sınıfı oluşturuldu! Kod: ${data.code}`, 'success');

        // Refresh view
        await loadDashboardData();
        loadClassrooms();

    } catch (error) {
        console.error('Error creating classroom:', error);
        showToast('Sınıf oluşturulurken hata oluştu', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText || 'Oluştur';
        }
    }
}

function viewClassroom(classroomId) {
    currentClassroom = classrooms.find(c => c.id === classroomId);
    if (!currentClassroom) return;

    document.getElementById('viewClassroomName').textContent = currentClassroom.name;
    document.getElementById('viewClassroomCode').textContent = currentClassroom.code;
    document.getElementById('viewClassroomModal').classList.add('open');
}

async function toggleClassroom(classroomId, isActive) {
    try {
        const { error } = await SupabaseClient.getClient()
            .from('classrooms')
            .update({ is_active: isActive })
            .eq('id', classroomId);

        if (error) throw error;

        // Update local state
        const classroom = classrooms.find(c => c.id === classroomId);
        if (classroom) classroom.is_active = isActive;

        showToast(isActive ? 'Sınıf aktifleştirildi' : 'Sınıf duraklatıldı', 'success');
        loadClassrooms();

    } catch (error) {
        console.error('Error toggling classroom:', error);
        showToast('İşlem başarısız', 'error');
    }
}

async function deleteClassroom(classroomId) {
    const classroom = classrooms.find(c => c.id === classroomId);
    if (!classroom) return;

    if (!confirm(`"${classroom.name}" sınıfını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve tüm öğrenci verileri silinecektir.`)) {
        return;
    }

    try {
        const { error } = await SupabaseClient.getClient()
            .from('classrooms')
            .delete()
            .eq('id', classroomId);

        if (error) throw error;

        // Update local state
        classrooms = classrooms.filter(c => c.id !== classroomId);

        showToast('Sınıf silindi', 'success');
        await loadDashboardData();
        loadClassrooms();

    } catch (error) {
        console.error('Error deleting classroom:', error);
        showToast('Sınıf silinirken hata oluştu', 'error');
    }
}

function copyCode(element) {
    const code = element.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast(`Kod kopyalandı: ${code}`, 'success');
    }).catch(() => {
        showToast('Kopyalama başarısız', 'error');
    });
}

function shareClassroomCode() {
    if (!currentClassroom) return;

    const text = `Yeti LAB'a katıl!\n\nSınıf: ${currentClassroom.name}\nKod: ${currentClassroom.code}\n\nGiriş: ${window.location.origin}/auth.html`;

    if (navigator.share) {
        navigator.share({
            title: 'Yeti LAB Sınıf Daveti',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text);
        showToast('Davet metni kopyalandı', 'success');
    }
}

// ==========================================
// STUDENT MANAGEMENT FUNCTIONS
// ==========================================

function selectAvatar(emoji) {
    selectedAvatarEmoji = emoji;
    const input = document.getElementById('selectedAvatar');
    if (input) input.value = emoji;

    // Update UI
    document.querySelectorAll('.avatar-btn').forEach(btn => {
        btn.classList.remove('selected', 'border-theme', 'bg-theme/10');
        btn.classList.add('border-gray-200');
    });
    const selectedBtn = document.querySelector(`.avatar-btn[data-emoji="${emoji}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-gray-200');
        selectedBtn.classList.add('selected', 'border-theme', 'bg-theme/10');
    }
}

function generateRandomPassword() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function openAddStudentModal(classroomId = null) {
    const select = document.getElementById('studentClassroom');
    select.innerHTML = '<option value="">Sınıf seçin...</option>' +
        classrooms.map(c => `<option value="${c.id}" ${c.id === classroomId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

    document.getElementById('addStudentForm').reset();
    document.getElementById('selectedAvatar').value = '🎓';
    selectAvatar('🎓');

    if (classroomId) {
        select.value = classroomId;
    }

    document.getElementById('addStudentModal').classList.add('open');
}

async function addStudent(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('addStudentBtn');
    if (submitBtn.disabled) return;

    const classroomId = document.getElementById('studentClassroom').value;
    const displayName = document.getElementById('studentName').value.trim();
    const password = document.getElementById('studentPassword').value.trim();
    const avatar = document.getElementById('selectedAvatar').value;

    if (!classroomId || !displayName) {
        showToast('Lütfen tüm alanları doldurun', 'error');
        return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Ekleniyor...';

    try {
        const studentData = {
            classroom_id: classroomId,
            display_name: displayName,
            avatar_emoji: avatar,
            added_by_teacher: true,
            last_active_at: new Date().toISOString()
        };

        if (password) {
            studentData.password = password;
        }

        const { data, error } = await SupabaseClient.getClient()
            .from('students')
            .insert(studentData)
            .select()
            .single();

        if (error) throw error;

        students.push(data);

        closeModal('addStudentModal');
        document.getElementById('addStudentForm').reset();

        showToast(`"${displayName}" öğrenci olarak eklendi!`, 'success');

        await loadDashboardData();
        loadStudents();

    } catch (error) {
        console.error('Error adding student:', error);
        showToast('Öğrenci eklenirken hata oluştu: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (!confirm(`"${student.display_name}" öğrencisini silmek istediğinize emin misiniz?`)) {
        return;
    }

    try {
        const { error } = await SupabaseClient.getClient()
            .from('students')
            .delete()
            .eq('id', studentId);

        if (error) throw error;

        students = students.filter(s => s.id !== studentId);

        showToast('Öğrenci silindi', 'success');
        await loadDashboardData();
        loadStudents();

    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Öğrenci silinemedi', 'error');
    }
}

function printStudentList() {
    if (!currentClassroom) {
        showToast('Lütfen önce bir sınıf seçin', 'error');
        return;
    }
    if (students.length === 0) {
        showToast('Yazdırılacak öğrenci listesi yok', 'warning');
        return;
    }

    const printWindow = window.open('', '_blank');
    const html = `
        <html>
        <head>
            <title>${currentClassroom.name} - Sınıf Listesi</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; }
                h1 { text-align: center; color: #111; margin-bottom: 10px; }
                p { text-align: center; color: #666; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
                th, td { border: 1px solid #000; padding: 15px; text-align: left; font-size: 16px; }
                th { background-color: #f0f0f0; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .password { font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; }
                .no-pass { color: #999; font-style: italic; font-size: 14px; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <h1>${currentClassroom.name}</h1>
            <p>Sınıf Kodu: <b>${currentClassroom.code}</b> | Öğrenci Giriş Bilgileri</p>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px">#</th>
                        <th>Öğrenci Adı</th>
                        <th>Giriş Şifresi</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map((s, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${s.display_name}</td>
                            <td>${s.password ? `<span class="password">${s.password}</span>` : '<span class="no-pass">Şifre Yok</span>'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">
                Yeti LAB - yeti-lab.com - ${new Date().toLocaleDateString('tr-TR')}
            </div>
        </body>
        </html>
     `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// ==========================================
// BULK ADD STUDENT FUNCTIONS
// ==========================================

function openBulkAddModal(classroomId = null) {
    const select = document.getElementById('bulkStudentClassroom');
    select.innerHTML = '<option value="">Sınıf seçin...</option>' +
        classrooms.map(c => `<option value="${c.id}" ${c.id === classroomId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

    if (classroomId) {
        select.value = classroomId;
    }

    resetBulkForm();
    document.getElementById('bulkAddModal').classList.add('open');
}

function previewBulkStudents() {
    const classroomId = document.getElementById('bulkStudentClassroom').value;
    const listText = document.getElementById('bulkStudentList').value.trim();
    const generatePassword = document.getElementById('bulkGeneratePassword').checked;

    if (!classroomId) {
        showToast('Lütfen bir sınıf seçin', 'error');
        return;
    }

    if (!listText) {
        showToast('Lütfen öğrenci listesini girin', 'error');
        return;
    }

    const lines = listText.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
        showToast('Geçerli isim bulunamadı', 'error');
        return;
    }

    bulkStudentsData = lines.map(line => {
        const name = line.trim();
        let password = null;

        if (generatePassword) {
            password = Math.floor(100000 + Math.random() * 900000).toString();
        }

        return {
            name,
            password,
            avatar: '🎓'
        };
    });

    document.getElementById('bulkCount').textContent = bulkStudentsData.length;
    const tbody = document.getElementById('bulkPreviewTable');
    tbody.innerHTML = bulkStudentsData.map(s => `
        <tr class="bg-white dark:bg-gray-800">
            <td class="py-2 pr-2 font-medium text-gray-900 dark:text-white">${escapeHtml(s.name)}</td>
            <td class="py-2 pr-2 font-mono text-gray-600 dark:text-gray-400">${s.password || '<span class="text-gray-300">-</span>'}</td>
            <td class="py-2 text-2xl">${s.avatar}</td>
        </tr>
    `).join('');

    document.getElementById('bulkStep1').classList.add('hidden');
    document.getElementById('bulkStep2').classList.remove('hidden');
}

function resetBulkForm() {
    document.getElementById('bulkStep1').classList.remove('hidden');
    document.getElementById('bulkStep2').classList.add('hidden');
    document.getElementById('bulkStudentList').value = '';
    bulkStudentsData = [];
}

function copyBulkList() {
    if (bulkStudentsData.length === 0) return;

    const text = bulkStudentsData.map(s => {
        if (s.password) return `${s.name}\t${s.password}`;
        return s.name;
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
        showToast('Liste kopyalandı (İsim + Şifre)', 'success');
    });
}

async function saveBulkStudents() {
    const classroomId = document.getElementById('bulkStudentClassroom').value;
    const saveBtn = document.getElementById('saveBulkBtn');

    if (!classroomId || bulkStudentsData.length === 0) return;

    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span> Kaydediliyor...';

    try {
        const studentsToInsert = bulkStudentsData.map(s => ({
            classroom_id: classroomId,
            display_name: s.name,
            password: s.password,
            avatar_emoji: s.avatar,
            added_by_teacher: true,
            last_active_at: new Date().toISOString()
        }));

        const { data, error } = await SupabaseClient.getClient()
            .from('students')
            .insert(studentsToInsert)
            .select();

        if (error) throw error;

        if (data) {
            students.push(...data);
        }

        showToast(`${data.length} öğrenci başarıyla eklendi!`, 'success');
        closeModal('bulkAddModal');

        await loadDashboardData();
        loadStudents();

    } catch (error) {
        console.error('Bulk save error:', error);
        showToast('Kaydetme başarısız: ' + error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

// ==========================================
// EDIT STUDENT FUNCTIONS
// ==========================================

function selectEditAvatar(emoji) {
    editSelectedAvatarEmoji = emoji;
    const input = document.getElementById('editSelectedAvatar');
    if (input) input.value = emoji;

    document.querySelectorAll('.edit-avatar-btn').forEach(btn => {
        btn.classList.remove('selected', 'border-theme', 'bg-theme/10');
        btn.classList.add('border-gray-200');
    });
    const selectedBtn = document.querySelector(`.edit-avatar-btn[data-emoji="${emoji}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-gray-200');
        selectedBtn.classList.add('selected', 'border-theme', 'bg-theme/10');
    }
}

function openEditStudentModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('editStudentId').value = studentId;
    document.getElementById('editStudentName').value = student.display_name;
    document.getElementById('editStudentPassword').value = '';
    document.getElementById('editRemovePassword').checked = false;

    const passwordStatus = document.getElementById('editPasswordStatus');
    if (student.password) {
        passwordStatus.textContent = 'Şifre Var';
        passwordStatus.className = 'text-xs font-normal px-2 py-0.5 rounded-full bg-green-100 text-green-600';
    } else {
        passwordStatus.textContent = 'Şifre Yok';
        passwordStatus.className = 'text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-600';
    }

    editSelectedAvatarEmoji = student.avatar_emoji || '🎓';
    const input = document.getElementById('editSelectedAvatar');
    if (input) input.value = editSelectedAvatarEmoji;
    selectEditAvatar(editSelectedAvatarEmoji);

    document.getElementById('editStudentModal').classList.add('open');
}

async function saveStudentEdit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('saveStudentEditBtn');
    if (submitBtn.disabled) return;

    const studentId = document.getElementById('editStudentId').value;
    const displayName = document.getElementById('editStudentName').value.trim();
    const newPassword = document.getElementById('editStudentPassword').value.trim();
    const removePassword = document.getElementById('editRemovePassword').checked;
    const avatar = document.getElementById('editSelectedAvatar').value;

    if (!displayName) {
        showToast('Öğrenci adı gerekli', 'error');
        return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span> Kaydediliyor...';

    try {
        const updateData = {
            display_name: displayName,
            avatar_emoji: avatar
        };

        if (removePassword) {
            updateData.password = null;
        } else if (newPassword) {
            updateData.password = newPassword;
        }

        const { error } = await SupabaseClient.getClient()
            .from('students')
            .update(updateData)
            .eq('id', studentId);

        if (error) throw error;

        const studentIndex = students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            students[studentIndex] = { ...students[studentIndex], ...updateData };
        }

        closeModal('editStudentModal');
        showToast('Öğrenci güncellendi', 'success');
        loadStudents();

    } catch (error) {
        console.error('Error updating student:', error);
        showToast('Öğrenci güncellenemedi: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ==========================================
// STUDENT DETAIL FUNCTIONS
// ==========================================

async function openStudentDetailModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    currentDetailStudentId = studentId;

    document.getElementById('detailStudentAvatar').textContent = student.avatar_emoji || '🎓';
    document.getElementById('detailStudentName').textContent = student.display_name;

    const classroom = classrooms.find(c => c.id === student.classroom_id);
    document.getElementById('detailStudentClass').textContent = classroom?.name || 'Bilinmeyen sınıf';

    document.getElementById('detailLastActive').textContent = formatRelativeTime(student.last_active_at).split(' ')[0] || '-';

    document.getElementById('detailCourseProgress').innerHTML = '<div class="flex justify-center py-4"><div class="spinner"></div></div>';
    document.getElementById('detailRecentLessons').innerHTML = '<div class="flex justify-center py-4"><div class="spinner"></div></div>';

    document.getElementById('studentDetailModal').classList.add('open');

    try {
        const { data: progressData, error } = await SupabaseClient.getClient()
            .from('student_progress')
            .select('*')
            .eq('student_id', studentId)
            .order('completed_at', { ascending: false });

        if (error) throw error;

        renderStudentDetailStats(progressData || []);
        renderStudentCourseProgress(progressData || []);
        renderStudentRecentLessons(progressData || []);

    } catch (error) {
        console.error('Error loading student progress:', error);
        document.getElementById('detailCourseProgress').innerHTML = '<p class="text-red-500 text-center">Yüklenemedi</p>';
        document.getElementById('detailRecentLessons').innerHTML = '<p class="text-red-500 text-center">Yüklenemedi</p>';
    }
}

function renderStudentDetailStats(progressData) {
    document.getElementById('detailCompletedCount').textContent = progressData.length;

    const quizScores = progressData.filter(p => p.quiz_score !== null).map(p => p.quiz_score);
    const avgScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0;
    document.getElementById('detailAvgScore').textContent = avgScore + '%';
}

function renderStudentCourseProgress(progressData) {
    const container = document.getElementById('detailCourseProgress');

    const courses = {
        arduino: { title: 'Arduino', icon: '🤖', color: '#00979C', total: 20 },
        microbit: { title: 'Micro:bit', icon: '💻', color: '#6C63FF', total: 10 },
        scratch: { title: 'Scratch', icon: '🎮', color: '#FF6F00', total: 8 },
        mblock: { title: 'mBlock', icon: '🦾', color: '#30B0C7', total: 10 }
    };

    let hasProgress = false;

    container.innerHTML = Object.entries(courses).map(([key, course]) => {
        const completed = progressData.filter(p => p.course_id === key).length;
        if (completed === 0) return '';

        hasProgress = true;
        const percentage = Math.round((completed / course.total) * 100);

        return `
            <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span class="text-2xl">${course.icon}</span>
                <div class="flex-grow">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium">${course.title}</span>
                        <span class="text-gray-500">${completed}/${course.total}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div class="h-2 rounded-full" style="width: ${percentage}%; background: ${course.color}"></div>
                    </div>
                </div>
                <span class="font-bold" style="color: ${course.color}">${percentage}%</span>
            </div>
        `;
    }).join('');

    if (!hasProgress) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <div class="text-2xl mb-1">📭</div>
                <p class="text-sm">Henüz ders tamamlanmamış</p>
            </div>
        `;
    }
}

function renderStudentRecentLessons(progressData) {
    const container = document.getElementById('detailRecentLessons');

    if (progressData.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <div class="text-2xl mb-1">📭</div>
                <p class="text-sm">Henüz ders tamamlanmamış</p>
            </div>
        `;
        return;
    }

    const courseIcons = {
        arduino: '🤖',
        microbit: '💻',
        scratch: '🎮',
        mblock: '🦾'
    };

    container.innerHTML = progressData.slice(0, 5).map(lesson => {
        const date = new Date(lesson.completed_at);
        const formattedDate = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        const icon = courseIcons[lesson.course_id] || '📚';
        const quizBadge = lesson.quiz_score !== null
            ? `<span class="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">${lesson.quiz_score}%</span>`
            : '';

        return `
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div class="flex items-center gap-2">
                    <span>${icon}</span>
                    <span class="text-sm font-medium">${lesson.project_id}</span>
                    ${quizBadge}
                </div>
                <span class="text-xs text-gray-400">${formattedDate}</span>
            </div>
        `;
    }).join('');
}

function openEditStudentFromDetail() {
    if (currentDetailStudentId) {
        closeModal('studentDetailModal');
        openEditStudentModal(currentDetailStudentId);
    }
}

function openClassroomSettings(classroomId) {
    const classroom = classrooms.find(c => c.id === classroomId);
    if (!classroom) return;

    document.getElementById('settingsClassroomId').value = classroomId;
    document.getElementById('settingsClassroomName').value = classroom.name;
    document.getElementById('settingsClassroomDesc').value = classroom.description || '';
    document.getElementById('settingsRequirePassword').checked = classroom.requires_password || false;

    document.getElementById('classroomSettingsModal').classList.add('open');
}

async function saveClassroomSettings(event) {
    event.preventDefault();

    const classroomId = document.getElementById('settingsClassroomId').value;
    const name = document.getElementById('settingsClassroomName').value.trim();
    const description = document.getElementById('settingsClassroomDesc').value.trim();
    const requiresPassword = document.getElementById('settingsRequirePassword').checked;

    if (!name) {
        showToast('Sınıf adı gerekli', 'error');
        return;
    }

    try {
        const { error } = await SupabaseClient.getClient()
            .from('classrooms')
            .update({
                name,
                description: description || null,
                requires_password: requiresPassword
            })
            .eq('id', classroomId);

        if (error) throw error;

        const classroom = classrooms.find(c => c.id === classroomId);
        if (classroom) {
            classroom.name = name;
            classroom.description = description;
            classroom.requires_password = requiresPassword;
        }

        closeModal('classroomSettingsModal');
        showToast('Sınıf ayarları güncellendi', 'success');
        loadClassrooms();

    } catch (error) {
        console.error('Error updating classroom:', error);
        showToast('Ayarlar kaydedilemedi', 'error');
    }
}

async function signOut() {
    try {
        await Auth.signOut();
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showToast('Çıkış yapılamadı', 'error');
    }
}

// ==========================================
// EXPORT FUNCTIONS TO WINDOW
// ==========================================
window.showSection = showSection;
window.hideLoading = hideLoading;
window.updateUserInfo = updateUserInfo;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;
window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.formatDate = formatDate;
window.formatRelativeTime = formatRelativeTime;
window.loadDashboardData = loadDashboardData;
window.loadClassrooms = loadClassrooms;
window.loadStudents = loadStudents;
window.loadProgress = loadProgress;
window.openCreateClassroomModal = openCreateClassroomModal;
window.closeModal = closeModal;
window.createClassroom = createClassroom;
window.viewClassroom = viewClassroom;
window.toggleClassroom = toggleClassroom;
window.deleteClassroom = deleteClassroom;
window.copyCode = copyCode;
window.shareClassroomCode = shareClassroomCode;
window.selectAvatar = selectAvatar;
window.generateRandomPassword = generateRandomPassword;
window.openAddStudentModal = openAddStudentModal;
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
window.printStudentList = printStudentList;
window.openBulkAddModal = openBulkAddModal;
window.previewBulkStudents = previewBulkStudents;
window.resetBulkForm = resetBulkForm;
window.copyBulkList = copyBulkList;
window.saveBulkStudents = saveBulkStudents;
window.selectEditAvatar = selectEditAvatar;
window.openEditStudentModal = openEditStudentModal;
window.saveStudentEdit = saveStudentEdit;
window.openStudentDetailModal = openStudentDetailModal;
window.renderStudentDetailStats = renderStudentDetailStats;
window.renderStudentCourseProgress = renderStudentCourseProgress;
window.renderStudentRecentLessons = renderStudentRecentLessons;
window.openEditStudentFromDetail = openEditStudentFromDetail;
window.openClassroomSettings = openClassroomSettings;
window.saveClassroomSettings = saveClassroomSettings;
window.signOut = signOut;
