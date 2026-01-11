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
// projectsCache moved to TeacherAnalytics module

// ==========================================
// INITIALIZATION
// ==========================================

// Exposed init function for TeacherManager wrapper
async function init() {
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
                    Router.redirectTo('auth.html');
                    return;
                }
            } else {
                // Check Role
                if (Auth.userRole !== 'teacher' && Auth.userRole !== 'admin') {
                    showToast('Bu sayfa sadece öğretmenler içindir', 'error');
                    setTimeout(() => {
                        Router.redirectTo('index.html');
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
}

// Auto-run if DOM is ready (Legacy support)
// document.addEventListener('DOMContentLoaded', init);

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
        dashboard: 'Kontrol Paneli',
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
    if (window.ThemeManager) window.ThemeManager.toggle();
}

function applyTheme() {
    if (window.ThemeManager) window.ThemeManager.load();
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
    if (typeof TeacherAnalytics !== 'undefined') {
        return await TeacherAnalytics.loadProjects();
    }
    return {};
}

async function loadDashboardData() {
    try {
        // Fallback to Auth.currentUser if currentUser is null
        if (!currentUser && typeof Auth !== 'undefined' && Auth.currentUser) {
            currentUser = Auth.currentUser;
        }

        if (!currentUser) {
            console.warn('[TeacherManager] No user found for dashboard data');
            return;
        }

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
                .select('*')
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

        // Render dashboard classrooms list
        renderDashboardClassrooms(classrooms);

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
    if (typeof TeacherAnalytics !== 'undefined') {
        TeacherAnalytics.renderCourseProgress('courseProgress', students);
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

function renderDashboardClassrooms(classroomsList) {
    const container = document.getElementById('dashboardClassroomsList');
    if (!container) return;

    if (!classroomsList || classroomsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state py-8">
                <div class="icon text-4xl mb-2">🏫</div>
                <p class="text-gray-500">Henüz sınıf oluşturmadınız</p>
                <button onclick="TeacherManager?.openCreateClassroomModal()"
                    class="mt-3 px-4 py-2 bg-theme text-white rounded-lg text-sm font-semibold hover:brightness-110 transition">
                    İlk Sınıfı Oluştur
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = classroomsList
        .map((classroom) => {
            const studentCount = classroom.students?.[0]?.count || 0;
            return `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" onclick="viewClassroom('${classroom.id}')">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${classroom.is_active ? '✅' : '⏸️'}</span>
                    <div>
                        <p class="font-semibold text-gray-800 dark:text-white">${escapeHtml(classroom.name)}</p>
                        <p class="text-sm text-gray-500">👨‍🎓 ${studentCount} öğrenci • ${classroom.code}</p>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); openClassroomSettings('${classroom.id}')" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors" title="Ayarlar">
                    ⚙️
                </button>
            </div>
        `;
        })
        .join('');
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

function renderStudentDetailStats(progressData) {
    if (typeof TeacherAnalytics !== 'undefined') {
        const completedProjectIds = progressData.map((p) => p.project_id);
        TeacherAnalytics.renderStudentDetailStats(completedProjectIds);
    }
}

function renderStudentProjectList(progressData) {
    if (typeof TeacherAnalytics !== 'undefined') {
        const completedProjectIds = progressData.map((p) => p.project_id);
        TeacherAnalytics.renderStudentProjectList('detailCourseProgress', completedProjectIds);
        TeacherAnalytics.renderStudentRecentLessons('detailRecentLessons', progressData);
    }
}

// Aliases for compatibility
function renderStudentCourseProgress(_data) {
    renderStudentProjectList(_data);
}
function renderStudentRecentLessons(_data) {
    // Handled in renderStudentProjectList
}

function openEditStudentFromDetail() {
    if (currentDetailStudentId) {
        closeModal('studentDetailModal');
        openEditStudentModal(currentDetailStudentId);
    }
}

async function openStudentDetailModal(studentId) {
    currentDetailStudentId = studentId;
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    document.getElementById('detailStudentName').textContent = student.display_name;
    document.getElementById('detailStudentAvatar').textContent = student.avatar || '🎓';

    // Reset stats
    document.getElementById('detailCompletedCount').textContent = '-';
    document.getElementById('detailAvgScore').textContent = '-';
    document.getElementById('detailCourseProgress').innerHTML = '<div class="spinner"></div>';
    document.getElementById('detailRecentLessons').innerHTML = '';

    document.getElementById('studentDetailModal').classList.add('open');

    // Load details
    if (typeof TeacherAnalytics !== 'undefined') {
        const progressData = await TeacherAnalytics.loadStudentDetails(studentId);

        // Update Stats
        const completedCount = progressData.length;
        document.getElementById('detailCompletedCount').textContent = completedCount;

        // Calculate score
        let totalScore = 0;
        let quizCount = 0;
        progressData.forEach((p) => {
            if (p.quiz_score !== null) {
                totalScore += p.quiz_score;
                quizCount++;
            }
        });
        const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;
        document.getElementById('detailAvgScore').textContent = avgScore + '%';

        // Last Active
        if (student.last_active_at) {
            document.getElementById('detailLastActive').textContent = formatRelativeTime(student.last_active_at);
        } else {
            document.getElementById('detailLastActive').textContent = 'Hiç';
        }

        renderStudentDetailStats(progressData);
        renderStudentProjectList(progressData);
    }
}

function openClassroomSettings(classroomId) {
    const classroom = classrooms.find((c) => c.id === classroomId);
    if (!classroom) return;

    document.getElementById('settingsClassroomId').value = classroomId;
    document.getElementById('settingsClassroomName').value = classroom.name;
    document.getElementById('settingsClassroomDescription').value = classroom.description || '';

    // Tab settings
    if (classroom.tab_settings) {
        if (classroom.tab_settings.names) {
            document.getElementById('tabNameGeneral').value = classroom.tab_settings.names.general || 'Genel';
            document.getElementById('tabNameContent').value = classroom.tab_settings.names.content || 'İçerik';
            document.getElementById('tabNameHardware').value = classroom.tab_settings.names.hardware || 'Donanım';
            document.getElementById('tabNameCircuit').value = classroom.tab_settings.names.circuit || 'Devre';
            document.getElementById('tabNameCode').value = classroom.tab_settings.names.code || 'Kod';
            document.getElementById('tabNameTest').value = classroom.tab_settings.names.test || 'Test';
        }
        if (classroom.tab_settings.visibility) {
            document.getElementById('tabVisGeneral').checked = classroom.tab_settings.visibility.general !== false;
            document.getElementById('tabVisContent').checked = classroom.tab_settings.visibility.content !== false;
            document.getElementById('tabVisHardware').checked = classroom.tab_settings.visibility.hardware !== false;
            document.getElementById('tabVisCircuit').checked = classroom.tab_settings.visibility.circuit !== false;
            document.getElementById('tabVisCode').checked = classroom.tab_settings.visibility.code !== false;
            document.getElementById('tabVisTest').checked = classroom.tab_settings.visibility.test !== false;
        }
    }

    document.getElementById('classroomSettingsModal').classList.add('open');
}

async function saveClassroomSettings(event) {
    event.preventDefault();
    const classroomId = document.getElementById('settingsClassroomId').value;
    const name = document.getElementById('settingsClassroomName').value;
    const description = document.getElementById('settingsClassroomDescription').value;

    const tabSettings = {
        names: {
            general: document.getElementById('tabNameGeneral').value,
            content: document.getElementById('tabNameContent').value,
            hardware: document.getElementById('tabNameHardware').value,
            circuit: document.getElementById('tabNameCircuit').value,
            code: document.getElementById('tabNameCode').value,
            test: document.getElementById('tabNameTest').value,
        },
        visibility: {
            general: document.getElementById('tabVisGeneral').checked,
            content: document.getElementById('tabVisContent').checked,
            hardware: document.getElementById('tabVisHardware').checked,
            circuit: document.getElementById('tabVisCircuit').checked,
            code: document.getElementById('tabVisCode').checked,
            test: document.getElementById('tabVisTest').checked,
        },
    };

    if (typeof ClassroomManager !== 'undefined') {
        const result = await ClassroomManager.update(classroomId, {
            name,
            description,
            tab_settings: tabSettings,
        });

        if (result.success) {
            closeModal('classroomSettingsModal');
            showToast('Sınıf ayarları kaydedildi', 'success');
        } else {
            showToast('Ayarlar kaydedilemedi', 'error');
        }
    }
}

// ==========================================
// EXPORT FUNCTIONS TO WINDOW & WRAPPER
// ==========================================

// Create Wrapper Object
window.TeacherManager = {
    init,
    showSection,
    hideLoading,
    updateUserInfo,
    toggleSidebar,
    toggleTheme,
    applyTheme,
    showToast,
    escapeHtml, // uses utility but exposing wrapper
    loadDashboardData,
    loadClassrooms,
    loadStudents,
    loadProgress,
    loadProjects,
    openCreateClassroomModal,
    closeModal,
    createClassroom,
    viewClassroom,
    toggleClassroom,
    deleteClassroom,
    copyCode,
    shareClassroomCode,
    selectAvatar,
    generateRandomPassword,
    openAddStudentModal,
    addStudent,
    deleteStudent,
    printStudentList,
    openBulkAddModal,
    previewBulkStudents,
    resetBulkForm,
    copyBulkList,
    saveBulkStudents,
    selectEditAvatar,
    openEditStudentModal,
    saveStudentEdit,
    openStudentDetailModal,
    renderStudentDetailStats,
    renderStudentCourseProgress,
    openEditStudentFromDetail,
    openClassroomSettings,
    saveClassroomSettings,
};

// Also expose global functions for inline HTML event handlers
window.showSection = showSection;
window.hideLoading = hideLoading;
window.updateUserInfo = updateUserInfo;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;
window.showToast = showToast;
// window.escapeHtml = escapeHtml; // Conflict with Utils
window.formatRelativeTime = formatRelativeTime;
window.loadDashboardData = loadDashboardData;

// Classroom management functions for inline event handlers
window.openAddStudentModal = openAddStudentModal;
window.openBulkAddModal = openBulkAddModal;
window.openClassroomSettings = openClassroomSettings;
window.toggleClassroom = toggleClassroom;
window.deleteClassroom = deleteClassroom;
window.viewClassroom = viewClassroom;
window.previewBulkStudents = previewBulkStudents;
window.resetBulkForm = resetBulkForm;
window.copyBulkList = copyBulkList;
window.saveBulkStudents = saveBulkStudents;
window.saveClassroomSettings = saveClassroomSettings;

// Student management functions
window.selectEditAvatar = selectEditAvatar;
window.openEditStudentModal = openEditStudentModal;
window.saveStudentEdit = saveStudentEdit;
window.openStudentDetailModal = openStudentDetailModal;
window.openEditStudentFromDetail = openEditStudentFromDetail;
// ... (others are implicitly exposed by being functions in global scope)

// Helper: Ensure other modules used are available or mocked if needed for safe init
// Already handled in init() check
