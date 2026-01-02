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
let projectsCache = {}; // Cache for projects by course: { courseId: [project1, project2...] }

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
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
                await loadProjects(); // Load projects from database
                hideLoading();
                showSection('dashboard');
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
    document.querySelectorAll('[id$="Section"]').forEach((el) => el.classList.add('hidden'));

    // Show selected section
    const sectionEl = document.getElementById(section + 'Section');
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
    }

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        classrooms: 'Sınıflarım',
        students: 'Öğrenciler',
        progress: 'İlerleme Takibi',
    };
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = titles[section] || section;

    // Update nav
    document.querySelectorAll('.nav-item').forEach((item) => {
        item.classList.remove('bg-theme/10', 'text-theme');
        if (item.dataset.section === section) {
            item.classList.add('bg-theme/10', 'text-theme');
        }
    });

    // Load section data
    if (section === 'classrooms') loadClassrooms();
    if (section === 'students') loadStudents();
    // Progress section removed
}

function hideLoading() {
    const el = document.getElementById('loadingState');
    if (el) el.classList.add('hidden');
}

function updateUserInfo() {
    if (typeof Auth === 'undefined') return;

    const name = Auth.getDisplayName();
    const avatarUrl = Auth.getAvatarUrl();

    // Update Name (New ID: user-name)
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = name;

    // Update Avatar (New ID: user-avatar)
    const avatarEl = document.getElementById('user-avatar');

    if (avatarEl) {
        if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:'))) {
            // URL Image
            avatarEl.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover">`;
            avatarEl.classList.add('overflow-hidden'); // Ensure rounding works
            avatarEl.classList.remove('flex', 'items-center', 'justify-center'); // Reset text centering classes if needed
        } else {
            // Emoji or Initial
            avatarEl.textContent = avatarUrl || name.charAt(0).toUpperCase();
            avatarEl.classList.remove('overflow-hidden');
            avatarEl.classList.add('flex', 'items-center', 'justify-center');
        }
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
        // Fallback implementation if Toast module is missing
        const toast = document.getElementById('toast');
        if (toast) {
            const toastMessage = document.getElementById('toastMessage');
            toastMessage.textContent = message;
            toast.className =
                'fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 z-50';
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

// Eski formatDate fonksiyonu modules/utils.js'e taşındı.
// Kullanım: Utils.formatDate(dateString);

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
    return Utils.formatDate(dateString);
}

// ==========================================
// DATA FUNCTIONS
// ==========================================

/**
 * Load projects from database and cache them
 */
async function loadProjects() {
    try {
        // Get all courses first
        const { data: courses, error: coursesError } = await SupabaseClient.getClient()
            .from('courses')
            .select('id, slug, title')
            .eq('is_published', true);

        if (coursesError) throw coursesError;

        // Get all projects
        const { data: projects, error: projectsError } = await SupabaseClient.getClient()
            .from('projects')
            .select('id, slug, title, course_id, phase_id, position')
            .eq('is_published', true)
            .order('position', { ascending: true });

        if (projectsError) throw projectsError;

        // Build cache by course slug
        projectsCache = {};

        courses.forEach((course) => {
            const courseProjects = projects
                .filter((p) => p.course_id === course.id)
                .map((p) => ({
                    id: p.slug,
                    dbId: p.id,
                    title: p.title,
                    course: course.title,
                    courseSlug: course.slug,
                }));

            projectsCache[course.slug] = courseProjects;
        });

        return projectsCache;
    } catch (error) {
        console.error('Error loading projects:', error);
        return {};
    }
}

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
            const classroomIds = classrooms.map((c) => c.id);

            const { data: studentsData, error: studentsError } = await SupabaseClient.getClient()
                .from('students')
                .select('*, student_progress(*)')
                .in('classroom_id', classroomIds);

            if (!studentsError && studentsData) {
                students = studentsData;
                totalStudents = studentsData.length;

                // Calculate active today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                activeToday = studentsData.filter((s) => {
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

        // Initialize Classroom Manager
        if (typeof ClassroomManager !== 'undefined') {
            ClassroomManager.init(currentUser, classrooms, {
                onStateChange: () => {
                    loadDashboardData();
                },
            });
        }

        // Initialize Student Manager
        if (typeof StudentManager !== 'undefined') {
            StudentManager.init(currentUser, students, classrooms, {
                onStateChange: () => {
                    loadDashboardData();
                },
            });
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Veri yüklenirken hata oluştu', 'error');
    }
}

function loadClassrooms() {
    if (typeof ClassroomManager !== 'undefined') {
        ClassroomManager.renderList();
    }
}

function loadStudents() {
    if (typeof StudentManager !== 'undefined') {
        StudentManager.renderList();
    }
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

        const studentIds = students.map((s) => s.id);

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
        progressData.forEach((p) => {
            if (!courseProgress[p.course_id]) {
                courseProgress[p.course_id] = {
                    courseKey: p.course_id,
                    students: {},
                    totalCompleted: 0,
                };
            }

            if (!courseProgress[p.course_id].students[p.student_id]) {
                const student = students.find((s) => s.id === p.student_id);
                courseProgress[p.course_id].students[p.student_id] = {
                    name: student?.display_name || 'Bilinmeyen',
                    completed: [],
                };
            }

            courseProgress[p.course_id].students[p.student_id].completed.push(p.project_id);
            courseProgress[p.course_id].totalCompleted++;
        });

        // Course name mapping
        const courseNames = {
            arduino: '🔌 Arduino',
            microbit: '📟 Micro:bit',
            scratch: '🐱 Scratch',
            mblock: '🤖 mBlock',
            appinventor: '📱 App Inventor',
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
                        ${studentList
                            .map(([studentId, studentData]) => {
                                const completedCount = studentData.completed.length;
                                return `
                                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div class="w-10 h-10 rounded-full bg-theme/10 flex items-center justify-center text-xl">🎓</div>
                                    <div class="flex-grow">
                                        <p class="font-medium text-gray-800 dark:text-white">${escapeHtml(studentData.name)}</p>
                                        <p class="text-sm text-gray-500">${completedCount} ders tamamladı</p>
                                    </div>
                                    <div class="flex gap-1">
                                        ${studentData.completed
                                            .slice(0, 5)
                                            .map(() => '<span class="text-green-500">✓</span>')
                                            .join('')}
                                        ${completedCount > 5 ? `<span class="text-gray-400 text-sm">+${completedCount - 5}</span>` : ''}
                                    </div>
                                </div>
                            `;
                            })
                            .join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML =
            html ||
            `
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

    if (typeof ClassroomManager !== 'undefined') {
        const result = await ClassroomManager.create(name, description, submitBtn);

        if (result.success) {
            closeModal('createClassroomModal');
            document.getElementById('createClassroomForm').reset();
            showToast(`"${result.data.name}" sınıfı oluşturuldu! Kod: ${result.data.code}`, 'success');
            // Data refresh is handled via onStateChange callback in init
        } else {
            showToast('Sınıf oluşturulurken hata oluştu', 'error');
        }
    } else {
        console.error('ClassroomManager not loaded');
    }
}

function viewClassroom(classroomId) {
    currentClassroom = classrooms.find((c) => c.id === classroomId);
    if (!currentClassroom) return;

    document.getElementById('viewClassroomName').textContent = currentClassroom.name;
    document.getElementById('viewClassroomCode').textContent = currentClassroom.code;
    document.getElementById('viewClassroomModal').classList.add('open');
}

async function toggleClassroom(classroomId, isActive) {
    if (typeof ClassroomManager !== 'undefined') {
        const result = await ClassroomManager.toggle(classroomId, isActive);
        if (result.success) {
            showToast(isActive ? 'Sınıf aktifleştirildi' : 'Sınıf duraklatıldı', 'success');
        } else {
            showToast('İşlem başarısız', 'error');
        }
    }
}

async function deleteClassroom(classroomId) {
    const classroom = classrooms.find((c) => c.id === classroomId);
    if (!classroom) return;

    if (
        !confirm(
            `"${classroom.name}" sınıfını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve tüm öğrenci verileri silinecektir.`
        )
    ) {
        return;
    }

    if (typeof ClassroomManager !== 'undefined') {
        const result = await ClassroomManager.delete(classroomId);
        if (result.success) {
            showToast('Sınıf silindi', 'success');
        } else {
            showToast('Sınıf silinirken hata oluştu', 'error');
        }
    }
}

function copyCode(element) {
    const code = element.textContent;
    navigator.clipboard
        .writeText(code)
        .then(() => {
            showToast(`Kod kopyalandı: ${code}`, 'success');
        })
        .catch(() => {
            showToast('Kopyalama başarısız', 'error');
        });
}

function shareClassroomCode() {
    if (!currentClassroom) return;

    const text = `Yeti LAB'a katıl!\n\nSınıf: ${currentClassroom.name}\nKod: ${currentClassroom.code}\n\nGiriş: ${window.location.origin}/auth.html`;

    if (navigator.share) {
        navigator.share({
            title: 'Yeti LAB Sınıf Daveti',
            text: text,
        });
    } else {
        navigator.clipboard.writeText(text);
        showToast('Davet metni kopyalandı', 'success');
    }
}

// Old student functions removed - now using delegates below

// ==========================================
// ==========================================
// STUDENT MANAGEMENT DELEGATES
// ==========================================

function selectAvatar(emoji) {
    selectedAvatarEmoji = emoji;
    const input = document.getElementById('selectedAvatar');
    if (input) input.value = emoji;

    document.querySelectorAll('.avatar-btn').forEach((btn) => {
        btn.classList.remove('selected', 'border-theme', 'bg-theme/10');
        btn.classList.add('border-gray-200');
    });
    const selectedBtn = document.querySelector(`.avatar-btn[data-emoji="${emoji}"]`);
    if (selectedBtn) {
        selectedBtn.classList.remove('border-gray-200');
        selectedBtn.classList.add('selected', 'border-theme', 'bg-theme/10');
    }
}

function openAddStudentModal(classroomId) {
    if (classroomId) {
        document.getElementById('newStudentClassroom').value = classroomId;
    }
    document.getElementById('studentName').value = '';

    if (typeof selectAvatar === 'function') selectAvatar('🎓');

    const password = typeof StudentManager !== 'undefined' ? StudentManager.generatePassword() : '123456';
    document.getElementById('studentPassword').value = password;

    document.getElementById('addStudentModal').classList.add('open');
}

async function addStudent(event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.disabled) return;

    const classroomId = document.getElementById('newStudentClassroom').value;
    const displayName = document.getElementById('studentName').value.trim();
    const password = document.getElementById('studentPassword').value.trim();
    const avatarEmoji = selectedAvatarEmoji || '🎓';

    if (!displayName) {
        showToast('Öğrenci adı gerekli', 'error');
        return;
    }

    const originalText = submitBtn ? submitBtn.innerHTML : 'Ekle';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Ekleniyor...';
    }

    if (typeof StudentManager !== 'undefined') {
        const result = await StudentManager.add(classroomId, displayName, password, avatarEmoji);

        if (result.success) {
            closeModal('addStudentModal');
            document.getElementById('addStudentForm').reset();
            showToast(`${result.data.display_name} eklendi!`, 'success');
        } else {
            showToast('Öğrenci eklenemedi', 'error');
        }
    }

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) return;

    if (typeof StudentManager !== 'undefined') {
        const result = await StudentManager.delete(studentId);
        if (result.success) {
            showToast('Öğrenci silindi', 'success');
        } else {
            showToast('Silme hatası', 'error');
        }
    }
}

function printStudentList() {
    if (typeof StudentManager !== 'undefined') {
        StudentManager.printList();
    }
}

function generateRandomPassword() {
    const password = typeof StudentManager !== 'undefined' ? StudentManager.generatePassword() : '123456';

    const addInput = document.getElementById('studentPassword');
    if (addInput && document.getElementById('addStudentModal').classList.contains('open')) {
        addInput.value = password;
    }

    const editInput = document.getElementById('editStudentPassword');
    if (editInput && document.getElementById('editStudentModal').classList.contains('open')) {
        editInput.value = password;
        document.getElementById('editRemovePassword').checked = false;
    }

    return password;
}

// ==========================================
// BULK ADD STUDENT FUNCTIONS
// ==========================================

function openBulkAddModal(classroomId = null) {
    const select = document.getElementById('bulkStudentClassroom');
    if (select && classrooms) {
        select.innerHTML =
            '<option value="">Sınıf seçin...</option>' +
            classrooms
                .map(
                    (c) =>
                        `<option value="${c.id}" ${c.id === classroomId ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
                )
                .join('');
        if (classroomId) select.value = classroomId;
    }

    if (typeof resetBulkForm === 'function') resetBulkForm(); // Ensure reset
    document.getElementById('bulkAddModal').classList.add('open');
}

function previewBulkStudents() {
    // Basic validation handled here, data processing in StudentManager could be better but let's keep UI logic here for now
    const classroomId = document.getElementById('bulkStudentClassroom').value;
    const listText = document.getElementById('bulkStudentList').value.trim();
    const generatePassword = document.getElementById('bulkGeneratePassword').checked;

    if (!classroomId || !listText) {
        showToast('Sınıf ve liste gerekli', 'error');
        return;
    }

    const lines = listText.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) {
        showToast('Geçerli isim bulunamadı', 'error');
        return;
    }

    bulkStudentsData = lines.map((line) => ({
        name: line.trim(),
        password: generatePassword ? Math.floor(100000 + Math.random() * 900000).toString() : null,
        avatar: '🎓',
    }));

    document.getElementById('bulkCount').textContent = bulkStudentsData.length;
    const tbody = document.getElementById('bulkPreviewTable');
    tbody.innerHTML = bulkStudentsData
        .map(
            (s) => `
        <tr class="bg-white dark:bg-gray-800">
            <td class="py-2 pr-2 font-medium text-gray-900 dark:text-white">${escapeHtml(s.name)}</td>
            <td class="py-2 pr-2 font-mono text-gray-600 dark:text-gray-400">${s.password || '-'}</td>
            <td class="py-2 text-2xl">${s.avatar}</td>
        </tr>
    `
        )
        .join('');

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
    // Legacy support
    if (bulkStudentsData.length === 0) return;
    const text = bulkStudentsData.map((s) => (s.password ? `${s.name}\t${s.password}` : s.name)).join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('Liste kopyalandı', 'success'));
}

async function saveBulkStudents() {
    const classroomId = document.getElementById('bulkStudentClassroom').value;
    const saveBtn = document.getElementById('saveBulkBtn');

    if (typeof StudentManager !== 'undefined') {
        const studentsToInsert = bulkStudentsData.map((s) => ({
            classroom_id: classroomId,
            display_name: s.name,
            password: s.password,
            avatar_emoji: s.avatar,
            added_by_teacher: true,
        }));

        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;

        const result = await StudentManager.bulkAdd(studentsToInsert);

        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;

        if (result.success) {
            closeModal('bulkAddModal');
            showToast(`${result.data.length} öğrenci eklendi`, 'success');
        } else {
            showToast('Ekleme hatası', 'error');
        }
    }
}

// ==========================================
// EDIT STUDENT FUNCTIONS
// ==========================================

function selectEditAvatar(emoji) {
    if (typeof StudentManager !== 'undefined') {
        // UI logic remains here
        editSelectedAvatarEmoji = emoji;
        const input = document.getElementById('editSelectedAvatar');
        if (input) input.value = emoji;

        document.querySelectorAll('.edit-avatar-btn').forEach((btn) => {
            btn.classList.remove('selected', 'border-theme', 'bg-theme/10');
            btn.classList.add('border-gray-200');
        });
        const selectedBtn = document.querySelector(`.edit-avatar-btn[data-emoji="${emoji}"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('border-gray-200');
            selectedBtn.classList.add('selected', 'border-theme', 'bg-theme/10');
        }
    }
}

function openEditStudentModal(studentId) {
    if (typeof StudentManager !== 'undefined') {
        // We need existing student data. StudentManager has it.
        const student = StudentManager.students.find((s) => s.id === studentId);
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
        showToast('İsim gerekli', 'error');
        return;
    }

    const updateData = { display_name: displayName, avatar_emoji: avatar };
    if (removePassword) updateData.password = null;
    else if (newPassword) updateData.password = newPassword;

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;

    if (typeof StudentManager !== 'undefined') {
        const result = await StudentManager.update(studentId, updateData);
        if (result.success) {
            closeModal('editStudentModal');
            showToast('Güncellendi', 'success');
        } else {
            showToast('Güncelleme hatası', 'error');
        }
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
}

// ==========================================
// STUDENT DETAIL FUNCTIONS
// ==========================================

async function openStudentDetailModal(studentId) {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    currentDetailStudentId = studentId;

    document.getElementById('detailStudentAvatar').textContent = student.avatar_emoji || '🎓';
    document.getElementById('detailStudentName').textContent = student.display_name;

    const classroom = classrooms.find((c) => c.id === student.classroom_id);
    document.getElementById('detailStudentClass').textContent = classroom?.name || 'Bilinmeyen sınıf';

    document.getElementById('detailLastActive').textContent =
        formatRelativeTime(student.last_active_at).split(' ')[0] || '-';

    document.getElementById('detailCourseProgress').innerHTML =
        '<div class="flex justify-center py-4"><div class="spinner"></div></div>';
    document.getElementById('detailRecentLessons').innerHTML =
        '<div class="flex justify-center py-4"><div class="spinner"></div></div>';

    document.getElementById('studentDetailModal').classList.add('open');

    try {
        const { data: progressData, error } = await SupabaseClient.getClient()
            .from('student_progress')
            .select('*')
            .eq('student_id', studentId)
            .order('completed_at', { ascending: false });

        if (error) throw error;

        renderStudentDetailStats(progressData || []);
        renderStudentProjectList(progressData || []);
        // Removed separate calls since renderStudentProjectList handles updating both containers if needed
        // renderStudentCourseProgress(progressData || []);
        // renderStudentRecentLessons(progressData || []);
    } catch (error) {
        console.error('Error loading student progress:', error);
        document.getElementById('detailCourseProgress').innerHTML =
            '<p class="text-red-500 text-center">Yüklenemedi</p>';
        document.getElementById('detailRecentLessons').innerHTML =
            '<p class="text-red-500 text-center">Yüklenemedi</p>';
    }
}

function renderStudentDetailStats(progressData) {
    document.getElementById('detailCompletedCount').textContent = progressData.length;

    const quizScores = progressData.filter((p) => p.quiz_score !== null).map((p) => p.quiz_score);
    const avgScore = quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
    document.getElementById('detailAvgScore').textContent = avgScore + '%';
}

// Replaces both course progress and recent lessons with a detailed project list
function renderStudentProjectList(progressData) {
    const container = document.getElementById('detailCourseProgress');
    if (!container) return;

    // Use cached projects from database instead of hardcoded list
    // Note: project_id in student_progress is a UUID, so we compare with dbId
    const completedProjectIds = progressData.map((p) => p.project_id);

    const formatId = (id) => {
        if (!id) return 'Bilinmeyen';
        if (typeof id !== 'string') return 'Bilinmeyen';
        // Handle both UUID format and slug format
        if (id.includes('-') && id.length > 30) {
            return 'Proje ' + id.slice(0, 8); // Truncate UUID for display
        }
        return id
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    // Course display names
    const courseDisplayNames = {
        arduino: 'Arduino',
        microbit: 'Micro:bit',
        scratch: 'Scratch',
        mblock: 'mBlock',
        appinventor: 'App Inventor',
    };

    let html = '<div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">';

    // Check if projectsCache is loaded
    if (Object.keys(projectsCache).length === 0) {
        html += `
            <div class="text-center py-4 text-gray-400 text-sm">
                <p>Proje listesi yükleniyor...</p>
            </div>
        `;
    } else {
        // Iterate through cached courses
        Object.entries(projectsCache).forEach(([courseSlug, projects]) => {
            const courseName = courseDisplayNames[courseSlug] || courseSlug;

            // Check if student has any activity in this course (compare with dbId - UUID)
            const courseCompletedCount = projects.filter((p) => completedProjectIds.includes(p.dbId)).length;

            // Only show courses that have projects
            if (projects.length === 0) return;

            html += `
                <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-1 mb-2">
                        <h5 class="font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider">${courseName}</h5>
                        <span class="text-xs text-gray-400">${courseCompletedCount}/${projects.length}</span>
                    </div>
                    <div class="space-y-1">
            `;

            // Render projects from cache (compare with dbId - UUID)
            projects.forEach((proj) => {
                const isCompleted = completedProjectIds.includes(proj.dbId);
                const statusIcon = isCompleted ? '✅' : '⬜';
                const textClass = isCompleted
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-400 dark:text-gray-500';

                html += `
                    <div class="flex items-center justify-between p-1.5 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors">
                        <span class="text-sm ${textClass}">${proj.title}</span>
                        <span class="text-sm">${statusIcon}</span>
                    </div>
                `;
            });

            html += '</div></div>';
        });
    }

    html += '</div>';

    container.innerHTML = html;

    // Update Recent Lessons Log (Compact)
    const recentContainer = document.getElementById('detailRecentLessons');
    if (recentContainer) {
        if (progressData.length === 0) {
            recentContainer.innerHTML = '<p class="text-xs text-center text-gray-400 py-2">Ders kaydı yok</p>';
        } else {
            // Find project titles from cache (compare with dbId - UUID)
            const getProjectTitle = (projectId) => {
                for (const courseProjects of Object.values(projectsCache)) {
                    const found = courseProjects.find((p) => p.dbId === projectId);
                    if (found) return found.title;
                }
                return formatId(projectId);
            };

            recentContainer.innerHTML = `
                <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                    ${progressData
                        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
                        .map(
                            (p) => `
                        <div class="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-600 last:border-0 text-xs">
                             <span class="text-gray-600 dark:text-gray-300 truncate pr-2">${getProjectTitle(p.project_id)}</span>
                             <span class="text-gray-400 whitespace-nowrap">${formatRelativeTime(p.completed_at)}</span>
                        </div>
                    `
                        )
                        .join('')}
                </div>
             `;
        }
    }
}

// Aliases for compatibility
function renderStudentCourseProgress(data) {
    renderStudentProjectList(data);
}
function renderStudentRecentLessons(data) {}

function openEditStudentFromDetail() {
    if (currentDetailStudentId) {
        closeModal('studentDetailModal');
        openEditStudentModal(currentDetailStudentId);
    }
}

function openClassroomSettings(classroomId) {
    const classroom = classrooms.find((c) => c.id === classroomId);
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
                requires_password: requiresPassword,
            })
            .eq('id', classroomId);

        if (error) throw error;

        const classroom = classrooms.find((c) => c.id === classroomId);
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
window.escapeHtml = Utils.escapeHtml;
window.formatDate = Utils.formatDate;
window.formatRelativeTime = formatRelativeTime;
window.loadDashboardData = loadDashboardData;
window.loadClassrooms = loadClassrooms;
window.loadStudents = loadStudents;
window.loadProgress = loadProgress;
window.loadProjects = loadProjects;
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
