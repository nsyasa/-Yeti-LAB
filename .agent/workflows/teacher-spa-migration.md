---
description: Teacher.html SPA Dönüşümü - Tam Entegrasyon Planı
---

# 🎯 Teacher Panel SPA Migration

**Hedef:** `teacher.html` dosyasını tamamen `index.html` SPA yapısına entegre etmek.

**Başlangıç:** 2026-01-05
**Tahmini Süre:** 2-3 saat

---

## 📊 Genel Bakış

### Mevcut Durum

- `teacher.html`: 1267 satır bağımsız HTML dosyası
- Inline CSS: ~300 satır
- 12 modül bağımlılığı
- 7 modal pencere
- Özel sidebar + header layout

### Hedef Durum

- `index.html` içinde `#/teacher` route'u ile erişim
- Lazy-loaded teacher view ve modüller
- Ortak layout sistemi (MainLayout) entegrasyonu
- Hash-based internal navigation (`#/teacher/classrooms`, `#/teacher/students`)

---

## FAZ 1: CSS Ayrıştırma ✅

**Hedef:** Inline CSS'i ayrı dosyaya taşı

### Adım 1.1: Teacher CSS Dosyası Oluştur

**Dosya:** `styles/teacher.css`

```css
/* ===========================================
   TEACHER PANEL STYLES
   =========================================== */

/* Layout Adjustments */
.teacher-bg {
    background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 50%, #f0f9ff 100%);
    min-height: 100vh;
}

body.dark-mode .teacher-bg {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

/* Glass Cards */
.glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.3s,
        box-shadow 0.3s;
}

.glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

body.dark-mode .glass-card {
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid rgba(71, 85, 105, 0.5);
}

/* Stat Cards */
.stat-card {
    background: linear-gradient(135deg, var(--theme-color) 0%, var(--theme-color-dark, #0d9488) 100%);
    color: white;
    border-radius: 1.5rem;
    padding: 1.5rem;
    min-width: 200px;
}

.stat-card.secondary {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}
.stat-card.warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}
.stat-card.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Classroom Code Box */
.code-box {
    font-family: 'Courier New', monospace;
    font-size: 2rem;
    font-weight: bold;
    letter-spacing: 0.5rem;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border: 3px dashed #10b981;
    padding: 1rem 2rem;
    border-radius: 1rem;
    text-align: center;
    color: #059669;
    user-select: all;
    cursor: pointer;
    transition: all 0.3s;
}

.code-box:hover {
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    transform: scale(1.02);
}

body.dark-mode .code-box {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
    border-color: #34d399;
    color: #6ee7b7;
}

/* Student List */
.student-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 1rem;
    transition: all 0.2s;
}

.student-item:hover {
    background: #f1f5f9;
    transform: translateX(4px);
}

body.dark-mode .student-item {
    background: #334155;
}
body.dark-mode .student-item:hover {
    background: #475569;
}

/* Progress Bar */
.progress-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 9999px;
    overflow: hidden;
}

.progress-bar .fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    border-radius: 9999px;
    transition: width 0.5s ease-out;
}

body.dark-mode .progress-bar {
    background: #475569;
}

/* Tab Navigation */
.tab-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 1rem;
    font-weight: 600;
    transition: all 0.2s;
    background: transparent;
    color: #64748b;
}

.tab-btn:hover {
    background: rgba(16, 185, 129, 0.1);
    color: var(--theme-color);
}

.tab-btn.active {
    background: var(--theme-color);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Teacher Sidebar */
.teacher-sidebar {
    width: 280px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 40;
}

body.dark-mode .teacher-sidebar {
    background: rgba(15, 23, 42, 0.95);
    border-right-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 1024px) {
    .teacher-sidebar {
        transform: translateX(-100%);
    }
    .teacher-sidebar.open {
        transform: translateX(0);
    }
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.modal-overlay.open {
    opacity: 1;
    pointer-events: auto;
}

.modal-content {
    background: white;
    border-radius: 1.5rem;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    transform: scale(0.9);
    transition: transform 0.3s;
}

.modal-overlay.open .modal-content {
    transform: scale(1);
}

body.dark-mode .modal-content {
    background: #1e293b;
    color: white;
}

/* Loading Spinner */
.teacher-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(16, 185, 129, 0.2);
    border-top-color: #10b981;
    border-radius: 50%;
    animation: teacher-spin 1s linear infinite;
}

@keyframes teacher-spin {
    to {
        transform: rotate(360deg);
    }
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
}

.empty-state .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
}
.delay-100 {
    animation-delay: 0.1s;
}
.delay-200 {
    animation-delay: 0.2s;
}
.delay-300 {
    animation-delay: 0.3s;
}
```

### Adım 1.2: index.html'e CSS Ekle

**Dosya:** `index.html` (head içine)

```html
<!-- Teacher Panel Styles (Lazy loaded when needed) -->
<link rel="stylesheet" href="styles/teacher.css" />
```

---

## FAZ 2: View Bileşenleri Oluşturma

**Hedef:** Teacher panel HTML/JS'ini modüler view yapısına dönüştür

### Adım 2.1: Views Klasör Yapısı

```
views/
└── teacher/
    ├── TeacherView.js        # Ana view container + mount/unmount
    ├── TeacherLayout.js      # Sidebar + Header + Content layout
    ├── sections/
    │   ├── DashboardSection.js
    │   ├── ClassroomsSection.js
    │   └── StudentsSection.js
    └── modals/
        └── TeacherModals.js  # Tüm modal HTML'leri
```

### Adım 2.2: TeacherView.js Oluştur

**Dosya:** `views/teacher/TeacherView.js`

```javascript
/**
 * TeacherView - Ana teacher panel view container
 * SPA entegrasyonu için mount/unmount lifecycle metodları
 */
const TeacherView = {
    isLoaded: false,
    currentSection: 'dashboard',

    // Template - Ana layout
    template() {
        return `
            <div id="teacher-view" class="teacher-bg min-h-screen">
                <!-- Sidebar Overlay (mobile) -->
                <div id="teacherSidebarOverlay" class="fixed inset-0 bg-black/50 z-30 lg:hidden hidden" 
                     onclick="TeacherView.toggleSidebar()"></div>
                
                <!-- Sidebar -->
                <aside id="teacherSidebar" class="teacher-sidebar">
                    ${TeacherLayout.renderSidebar()}
                </aside>

                <!-- Main Content -->
                <div class="lg:ml-[280px] min-h-screen flex flex-col">
                    <!-- Header -->
                    ${TeacherLayout.renderHeader()}
                    
                    <!-- Content Area -->
                    <div id="teacherContent" class="flex-grow p-6 overflow-auto">
                        <div id="teacherLoadingState" class="flex items-center justify-center h-64">
                            <div class="text-center">
                                <div class="teacher-spinner mx-auto mb-4"></div>
                                <p class="text-gray-500">Yükleniyor...</p>
                            </div>
                        </div>
                        
                        <!-- Sections -->
                        <section id="teacherDashboardSection" class="hidden"></section>
                        <section id="teacherClassroomsSection" class="hidden"></section>
                        <section id="teacherStudentsSection" class="hidden"></section>
                    </div>
                </div>
                
                <!-- Modals -->
                ${TeacherModals.renderAll()}
                
                <!-- Toast -->
                <div id="teacherToast" class="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl transform translate-y-20 opacity-0 transition-all duration-300 z-50">
                    <span id="teacherToastMessage">Mesaj</span>
                </div>
            </div>
        `;
    },

    // Mount - View DOM'a eklendiğinde
    async mount(container) {
        console.log('[TeacherView] Mounting...');

        // Auth Guard
        if (!(await this.checkAuth())) {
            return false;
        }

        // Render template
        container.innerHTML = this.template();

        // Load dependencies if not loaded
        if (!this.isLoaded) {
            await this.loadDependencies();
            this.isLoaded = true;
        }

        // Initialize TeacherManager
        if (window.TeacherManager) {
            await TeacherManager.init();
        }

        // Show dashboard section
        this.showSection('dashboard');

        console.log('[TeacherView] Mounted successfully');
        return true;
    },

    // Unmount - View DOM'dan kaldırıldığında
    unmount() {
        console.log('[TeacherView] Unmounting...');
        const container = document.getElementById('teacher-view');
        if (container) {
            container.remove();
        }
    },

    // Auth kontrolü
    async checkAuth() {
        if (!Auth.currentUser) {
            Router.redirectTo('auth.html');
            return false;
        }

        if (Auth.userRole !== 'teacher' && Auth.userRole !== 'admin') {
            if (window.Toast) Toast.error('Bu sayfa sadece öğretmenler içindir');
            Router.navigate('/');
            return false;
        }

        return true;
    },

    // Bağımlılıkları yükle
    async loadDependencies() {
        const scripts = [
            'modules/teacher/classrooms.js',
            'modules/teacher/students.js',
            'modules/teacher/analytics.js',
            'modules/teacher-manager.js',
        ];

        for (const src of scripts) {
            if (!document.querySelector(`script[src="${src}"]`)) {
                await this.loadScript(src);
            }
        }
    },

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    },

    // Section göster
    showSection(section) {
        this.currentSection = section;

        // Hide all sections
        document.querySelectorAll('[id^="teacher"][id$="Section"]').forEach((el) => {
            el.classList.add('hidden');
        });

        // Hide loading
        const loading = document.getElementById('teacherLoadingState');
        if (loading) loading.classList.add('hidden');

        // Show target section
        const sectionEl = document.getElementById(
            `teacher${section.charAt(0).toUpperCase() + section.slice(1)}Section`
        );
        if (sectionEl) {
            sectionEl.classList.remove('hidden');
        }

        // Update title
        const titles = {
            dashboard: 'Kontrol Paneli',
            classrooms: 'Sınıflarım',
            students: 'Öğrenciler',
        };
        const titleEl = document.getElementById('teacherSectionTitle');
        if (titleEl) titleEl.textContent = titles[section] || section;

        // Update nav active state
        document.querySelectorAll('.teacher-nav-item').forEach((item) => {
            item.classList.remove('bg-theme/10', 'text-theme');
            if (item.dataset.section === section) {
                item.classList.add('bg-theme/10', 'text-theme');
            }
        });

        // Trigger data load
        if (window.TeacherManager) {
            if (section === 'classrooms') TeacherManager.loadClassrooms?.();
            if (section === 'students') TeacherManager.loadStudents?.();
        }
    },

    // Sidebar toggle
    toggleSidebar() {
        const sidebar = document.getElementById('teacherSidebar');
        const overlay = document.getElementById('teacherSidebarOverlay');
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('hidden');
    },
};

window.TeacherView = TeacherView;
```

### Adım 2.3: TeacherLayout.js Oluştur

**Dosya:** `views/teacher/TeacherLayout.js`

```javascript
/**
 * TeacherLayout - Sidebar ve Header render fonksiyonları
 */
const TeacherLayout = {
    renderSidebar() {
        return `
            <!-- Logo -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <a href="#/" class="flex items-center gap-3" onclick="Router.navigate('/')">
                    <span class="text-4xl">❄️</span>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800 dark:text-white">Yeti LAB</h1>
                        <p class="text-xs text-gray-500">Öğretmen Paneli</p>
                    </div>
                </a>
            </div>

            <!-- Navigation -->
            <nav class="flex-grow p-4 space-y-2">
                <button onclick="TeacherView.showSection('dashboard')"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800 bg-theme/10 text-theme"
                    data-section="dashboard">
                    <span>📊</span> Kontrol Paneli
                </button>

                <a href="#/profile" onclick="Router.navigate('/profile')"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <span>👤</span> Profil Ayarları
                </a>

                <button onclick="TeacherView.showSection('classrooms')"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                    data-section="classrooms">
                    <span class="text-xl">🏫</span>
                    <span>Sınıflarım</span>
                </button>
                
                <button onclick="TeacherView.showSection('students')"
                    class="teacher-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                    data-section="students">
                    <span class="text-xl">👨‍🎓</span>
                    <span>Öğrenciler</span>
                </button>
            </nav>

            <!-- User Info -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <div id="teacher-user-avatar" class="w-10 h-10 rounded-full bg-theme flex items-center justify-center text-white font-bold overflow-hidden">
                        <!-- Avatar will be injected by JS -->
                    </div>
                    <div class="flex-grow min-w-0">
                        <p id="teacher-user-name" class="font-semibold text-gray-800 dark:text-white truncate">Yükleniyor...</p>
                        <p class="text-xs text-gray-500">Öğretmen</p>
                    </div>
                    <button onclick="Auth.signOut()" title="Çıkış Yap"
                        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    renderHeader() {
        return `
            <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center gap-4">
                        <!-- Mobile Menu Button -->
                        <button onclick="TeacherView.toggleSidebar()"
                            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h2 id="teacherSectionTitle" class="text-xl font-bold text-gray-800 dark:text-white">
                            Kontrol Paneli
                        </h2>
                    </div>
                    <div class="flex items-center gap-3">
                        <!-- Theme Toggle -->
                        <button onclick="ThemeManager?.toggle()"
                            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span id="teacherThemeIcon">🌙</span>
                        </button>
                        <!-- Quick Add Classroom -->
                        <button onclick="TeacherManager?.openCreateClassroomModal()"
                            class="hidden sm:flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-lg hover:shadow-xl">
                            <span>+</span>
                            <span>Yeni Sınıf</span>
                        </button>
                    </div>
                </div>
            </header>
        `;
    },
};

window.TeacherLayout = TeacherLayout;
```

### Adım 2.4: TeacherModals.js Oluştur

**Dosya:** `views/teacher/modals/TeacherModals.js`

```javascript
/**
 * TeacherModals - Tüm modal HTML template'leri
 */
const TeacherModals = {
    renderAll() {
        return `
            ${this.createClassroomModal()}
            ${this.viewClassroomModal()}
            ${this.addStudentModal()}
            ${this.bulkAddModal()}
            ${this.classroomSettingsModal()}
            ${this.editStudentModal()}
            ${this.studentDetailModal()}
        `;
    },

    createClassroomModal() {
        return `
            <div id="createClassroomModal" class="modal-overlay">
                <div class="modal-content">
                    <h3 class="text-xl font-bold mb-4">🏫 Yeni Sınıf Oluştur</h3>
                    <form id="createClassroomForm" onsubmit="TeacherManager.createClassroom(event)">
                        <div class="mb-4">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Sınıf Adı</label>
                            <input type="text" id="classroomName" required maxlength="100"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Örn: 5-A Robotik Kulübü" />
                        </div>
                        <div class="mb-6">
                            <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Açıklama (Opsiyonel)</label>
                            <textarea id="classroomDescription" rows="2"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Sınıf hakkında kısa bir açıklama..."></textarea>
                        </div>
                        <div class="flex gap-3">
                            <button type="button" onclick="TeacherManager.closeModal('createClassroomModal')"
                                class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                                İptal
                            </button>
                            <button type="submit"
                                class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                                Oluştur
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    viewClassroomModal() {
        return `
            <div id="viewClassroomModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="flex justify-between items-start mb-4">
                        <h3 id="viewClassroomName" class="text-xl font-bold">Sınıf Adı</h3>
                        <button onclick="TeacherManager.closeModal('viewClassroomModal')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    <div class="mb-6">
                        <p class="text-gray-600 dark:text-gray-400 mb-4">Öğrenciler bu kod ile sınıfa katılabilir:</p>
                        <div id="viewClassroomCode" class="code-box" onclick="TeacherManager.copyCode(this)">XXXXX</div>
                        <p class="text-center text-sm text-gray-500 mt-2">Kodu kopyalamak için tıklayın</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="TeacherManager.closeModal('viewClassroomModal')"
                            class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
                            Kapat
                        </button>
                        <button onclick="TeacherManager.shareClassroomCode()"
                            class="flex-1 px-4 py-3 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                            <span>📤</span> Paylaş
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    addStudentModal() {
        return `<!-- Add Student Modal - will be filled similar to above -->`;
    },

    bulkAddModal() {
        return `<!-- Bulk Add Modal - will be filled similar to above -->`;
    },

    classroomSettingsModal() {
        return `<!-- Settings Modal - will be filled similar to above -->`;
    },

    editStudentModal() {
        return `<!-- Edit Student Modal - will be filled similar to above -->`;
    },

    studentDetailModal() {
        return `<!-- Student Detail Modal - will be filled similar to above -->`;
    },
};

window.TeacherModals = TeacherModals;
```

---

## FAZ 3: Router Entegrasyonu

**Hedef:** Teacher route'larını SPA router'a ekle

### Adım 3.1: router.js Güncelle

**Dosya:** `modules/router.js`

```javascript
// routes objesine EKLENECEKLER:
routes: {
    '': 'home',
    'course/:key': 'course',
    'course/:key/project/:id': 'project',
    // YENİ: Teacher routes
    'teacher': 'teacher',
    'teacher/classrooms': 'teacher-classrooms',
    'teacher/students': 'teacher-students',
},

// separatePages array'inden teacher.html'i ÇIKAR:
// ÖNCEKİ: const separatePages = ['auth.html', 'profile.html', 'teacher.html', 'admin.html', 'student-dashboard.html'];
// SONRA:
const separatePages = ['auth.html', 'profile.html', 'admin.html', 'student-dashboard.html'];
```

### Adım 3.2: app.js Güncelle

**Dosya:** `app.js`

```javascript
// handleRouteChange fonksiyonuna EKLENECEKLER:
async handleRouteChange(data) {
    const { route, params } = data;

    switch(route) {
        case 'home':
            this.renderCourseSelection();
            break;
        case 'course':
            await this.selectCourse(params.key);
            break;
        case 'project':
            await this.selectCourse(params.key);
            this.loadProject(parseInt(params.id));
            break;
        // YENİ: Teacher view
        case 'teacher':
        case 'teacher-classrooms':
        case 'teacher-students':
            await this.loadTeacherView(route);
            break;
    }
},

// YENİ METOD:
async loadTeacherView(route) {
    // Hide other views
    this.hideAllViews();

    // Load TeacherView if not loaded
    if (!window.TeacherView) {
        await this.loadTeacherScripts();
    }

    // Get or create container
    let container = document.getElementById('teacher-view-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'teacher-view-container';
        document.querySelector('main').appendChild(container);
    }

    // Mount view
    await TeacherView.mount(container);

    // Handle sub-routes
    if (route === 'teacher-classrooms') {
        TeacherView.showSection('classrooms');
    } else if (route === 'teacher-students') {
        TeacherView.showSection('students');
    }
},

async loadTeacherScripts() {
    const scripts = [
        'views/teacher/TeacherLayout.js',
        'views/teacher/modals/TeacherModals.js',
        'views/teacher/TeacherView.js',
        'modules/teacher/classrooms.js',
        'modules/teacher/students.js',
        'modules/teacher/analytics.js',
        'modules/teacher-manager.js'
    ];

    for (const src of scripts) {
        await this.loadScript(src);
    }
},

loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
},

hideAllViews() {
    document.getElementById('course-selection-view')?.classList.add('hidden');
    document.getElementById('dashboard-view')?.classList.add('hidden');
    document.getElementById('project-view')?.classList.add('hidden');
}
```

---

## FAZ 4: index.html Güncellemeleri

### Adım 4.1: Teacher CSS Ekle

```html
<!-- head içine -->
<link rel="stylesheet" href="styles/teacher.css" />
```

### Adım 4.2: Teacher Container Ekle

```html
<!-- main içine, project-view'dan sonra -->
<div id="teacher-view-container" class="hidden"></div>
```

---

## FAZ 5: teacher.html'i Koru (Fallback)

**Not:** Geçiş sürecinde teacher.html dosyasını SILME. Sadece şu değişikliği yap:

```html
<!-- teacher.html head'ine ekle -->
<script>
    // SPA'ya yönlendir (eğer index.html'den gelmediyse)
    const fromSPA = sessionStorage.getItem('spa_navigation');
    if (!fromSPA && window.location.pathname.includes('teacher.html')) {
        window.location.href = 'index.html#/teacher';
    }
</script>
```

---

## FAZ 6: Test Senaryoları

### Temel Testler

1. **Route Testi:**
    - [ ] `index.html#/teacher` → Teacher panel açılmalı
    - [ ] `index.html#/teacher/classrooms` → Sınıflar sekmesi açılmalı
    - [ ] `index.html#/teacher/students` → Öğrenciler sekmesi açılmalı

2. **Auth Guard Testi:**
    - [ ] Giriş yapmamış → auth.html'e yönlenmeli
    - [ ] Öğrenci rolü → Ana sayfaya yönlenmeli + hata mesajı
    - [ ] Öğretmen/Admin → Teacher panel açılmalı

3. **Fonksiyon Testleri:**
    - [ ] Sınıf oluşturma çalışmalı
    - [ ] Öğrenci ekleme çalışmalı
    - [ ] Toplu öğrenci ekleme çalışmalı
    - [ ] Modal açma/kapama çalışmalı

4. **Navigasyon Testleri:**
    - [ ] Sidebar linkleri çalışmalı
    - [ ] Ana sayfaya dönüş çalışmalı
    - [ ] Profil sayfasına geçiş çalışmalı

---

## ⚠️ Kritik Notlar

1. **Backward Compatibility:** teacher.html'e direkt erişim SPA'ya yönlendirecek
2. **Lazy Loading:** Teacher modülleri sadece ihtiyaç halinde yüklenecek
3. **CSS Isolation:** Teacher CSS class'ları `teacher-` prefix'i ile çakışma önlenecek
4. **Auth State:** Auth modülü teacher view mount olmadan önce hazır olmalı

---

## 📊 Tamamlanma Durumu

| Faz                          | Durum | Not                                                             |
| ---------------------------- | ----- | --------------------------------------------------------------- |
| FAZ 1: CSS Ayrıştırma        | ✅    | `styles/teacher.css` oluşturuldu                                |
| FAZ 2: View Bileşenleri      | ✅    | TeacherView, TeacherLayout, TeacherModals, Sections oluşturuldu |
| FAZ 3: Router Entegrasyonu   | ✅    | router.js güncellendi, teacher route'ları eklendi               |
| FAZ 4: index.html Güncelleme | ✅    | teacher.css eklendi                                             |
| FAZ 5: Fallback              | ✅    | teacher.html'e SPA redirect scripti eklendi                     |
| FAZ 6: Test                  | ⏳    | Manuel test gerekiyor                                           |

---

// turbo-all
