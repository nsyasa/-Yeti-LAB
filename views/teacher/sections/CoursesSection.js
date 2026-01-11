/**
 * CoursesSection - Öğretmen paneli kurs atama yönetimi
 * Master-Detail Layout: Sol menü (kurs listesi) + Sağ önizleme
 */
const CoursesSection = {
    courses: [],
    classrooms: [],
    enrollmentStats: {},
    selectedCourse: null,
    selectedCourseIndex: 0,
    isLoading: false,

    /**
     * Ana render - Master-Detail Layout
     */
    render() {
        return `
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Header with Stats -->
                <div class="flex flex-wrap items-center gap-2 mb-4 flex-shrink-0">
                    <div class="px-3 py-1.5 rounded-lg text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center gap-1.5 font-medium">
                        <span>💡</span>
                        <span>Kursu sınıfa atayın → tüm öğrenciler erişir</span>
                    </div>
                    <div id="courseStatsBar" class="flex flex-wrap gap-2 ml-auto">
                        ${this.renderStatsBar()}
                    </div>
                </div>

                <!-- Master-Detail Container -->
                <div class="flex-1 flex gap-4 min-h-0 overflow-hidden">
                    
                    <!-- Left: Course List (Master) -->
                    <div class="w-64 lg:w-72 flex-shrink-0 flex flex-col min-h-0 overflow-hidden">
                        <div class="teacher-panel-card flex-1 flex flex-col overflow-hidden">
                            <div class="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    📚 Kurslar
                                </h3>
                            </div>
                            <div id="coursesMasterList" class="flex-1 overflow-y-auto p-2 space-y-1">
                                ${this.renderMasterListLoading()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right: Course Detail (Detail) -->
                    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div class="teacher-panel-card flex-1 flex flex-col overflow-hidden">
                            <div id="courseDetailContent" class="flex-1 overflow-y-auto">
                                ${this.renderDetailEmpty()}
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>

            <!-- Course Assignment Modal -->
            <div id="courseAssignmentModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 hidden">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    <div id="courseAssignmentModalContent">
                        <!-- Content will be rendered dynamically -->
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Stats bar render
     */
    renderStatsBar() {
        const totalCourses = this.courses?.length || 0;
        const totalEnrollments = Object.values(this.enrollmentStats).reduce((sum, stat) => sum + (stat.total || 0), 0);
        const activeEnrollments = Object.values(this.enrollmentStats).reduce(
            (sum, stat) => sum + (stat.active || 0),
            0
        );

        return `
            <div class="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30">
                <span class="text-sm">📚</span>
                <span class="font-bold text-purple-700 dark:text-purple-400 text-sm">${totalCourses}</span>
                <span class="text-xs text-purple-600 dark:text-purple-400">Kurs</span>
            </div>
            <div class="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30">
                <span class="text-sm">👥</span>
                <span class="font-bold text-green-700 dark:text-green-400 text-sm">${activeEnrollments}</span>
                <span class="text-xs text-green-600 dark:text-green-400">Aktif</span>
            </div>
        `;
    },

    /**
     * Master list loading
     */
    renderMasterListLoading() {
        return `
            <div class="flex items-center justify-center py-8">
                <div class="teacher-spinner"></div>
            </div>
        `;
    },

    /**
     * Master list item render
     */
    renderMasterListItem(course, isSelected = false) {
        const stats = this.enrollmentStats[course.id] || { total: 0, active: 0 };
        const themeColor = course.theme_color || '#00979c';

        return `
            <button onclick="CoursesSection.selectCourse('${course.id}')"
                class="w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${
                    isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border-l-4 border-transparent'
                }">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                     style="background: ${themeColor}20">
                    📚
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-sm text-slate-800 dark:text-white truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : ''}">
                        ${course.title || 'İsimsiz Kurs'}
                    </h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                        ${stats.active} aktif kayıt
                    </p>
                </div>
            </button>
        `;
    },

    /**
     * Master list render
     */
    renderMasterList() {
        if (!this.courses || this.courses.length === 0) {
            return `
                <div class="text-center py-8">
                    <div class="text-3xl mb-2">📚</div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Kurs bulunamadı</p>
                </div>
            `;
        }

        return this.courses
            .map((course, index) => this.renderMasterListItem(course, this.selectedCourse?.id === course.id))
            .join('');
    },

    /**
     * Detail empty state
     */
    renderDetailEmpty() {
        return `
            <div class="h-full flex items-center justify-center">
                <div class="text-center py-8">
                    <div class="text-5xl mb-4">👈</div>
                    <p class="text-slate-500 dark:text-slate-400">Detayları görmek için sol taraftan bir kurs seçin</p>
                </div>
            </div>
        `;
    },

    /**
     * Detail content render
     */
    renderDetailContent(course) {
        if (!course) return this.renderDetailEmpty();

        const stats = this.enrollmentStats[course.id] || { total: 0, active: 0, completed: 0 };
        const themeColor = course.theme_color || '#00979c';

        return `
            <div class="p-6">
                <!-- Course Header -->
                <div class="flex items-start gap-4 mb-6">
                    <div class="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                         style="background: ${themeColor}20">
                        📚
                    </div>
                    <div class="flex-1">
                        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-1">
                            ${course.title || 'İsimsiz Kurs'}
                        </h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                            ${course.description || 'Açıklama yok'}
                        </p>
                    </div>
                    <button onclick="CoursesSection.openAssignmentModal('${course.id}')"
                        class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 relative z-50">
                        <span>➕</span>
                        <span>Sınıfa Ata</span>
                    </button>
                </div>
                
                <!-- Stats Cards -->
                <div class="grid grid-cols-3 gap-3 mb-6">
                    <div class="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">${stats.active}</div>
                        <div class="text-xs text-green-700 dark:text-green-400">Aktif Kayıt</div>
                    </div>
                    <div class="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${stats.completed}</div>
                        <div class="text-xs text-blue-700 dark:text-blue-400">Tamamlayan</div>
                    </div>
                    <div class="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${stats.total}</div>
                        <div class="text-xs text-purple-700 dark:text-purple-400">Toplam Kayıt</div>
                    </div>
                </div>
                
                <!-- Assigned Classrooms -->
                <div>
                    <h3 class="font-semibold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        🏫 Atanan Sınıflar
                    </h3>
                    <div id="courseDetailClassrooms" class="space-y-2">
                        <div class="text-center py-4 text-slate-400 dark:text-slate-500 text-sm">
                            Yükleniyor...
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Kurs seç
     */
    async selectCourse(courseId) {
        const course = this.courses.find((c) => c.id === courseId);
        if (!course) return;

        this.selectedCourse = course;

        // Update master list
        const masterList = document.getElementById('coursesMasterList');
        if (masterList) {
            masterList.innerHTML = this.renderMasterList();
        }

        // Update detail
        const detailContent = document.getElementById('courseDetailContent');
        if (detailContent) {
            detailContent.innerHTML = this.renderDetailContent(course);
        }

        // Load assigned classrooms for this course
        await this.loadCourseClassrooms(courseId);
    },

    /**
     * Kursun atandığı sınıfları yükle
     */
    async loadCourseClassrooms(courseId) {
        const container = document.getElementById('courseDetailClassrooms');
        if (!container) return;

        try {
            const { default: CourseEnrollmentService } = await import('/modules/courseEnrollmentService.js');

            const assignedClassrooms = [];

            for (const classroom of this.classrooms) {
                const enrollments = await CourseEnrollmentService.getClassroomEnrollments(classroom.id);
                const courseEnrollments = enrollments.filter((e) => e.course_id === courseId);
                if (courseEnrollments.length > 0) {
                    assignedClassrooms.push({
                        ...classroom,
                        enrolledCount: courseEnrollments.length,
                    });
                }
            }

            if (assignedClassrooms.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4 text-slate-400 dark:text-slate-500 text-sm">
                        Bu kurs henüz hiçbir sınıfa atanmamış.
                    </div>
                `;
                return;
            }

            container.innerHTML = assignedClassrooms
                .map(
                    (classroom) => `
                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div class="flex items-center gap-2">
                        <span>🏫</span>
                        <span class="font-medium text-sm text-slate-700 dark:text-slate-300">${classroom.name}</span>
                        <span class="text-xs text-slate-500">(${classroom.enrolledCount} kayıt)</span>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ✓ Aktif
                    </span>
                </div>
            `
                )
                .join('');
        } catch (error) {
            console.error('Sınıf yükleme hatası:', error);
            container.innerHTML = `
                <div class="text-center py-4 text-red-500 text-sm">
                    Yüklenirken hata oluştu
                </div>
            `;
        }
    },

    /**
     * Loading durumu render
     */
    renderLoading() {
        return `
            <div class="col-span-full glass-card rounded-2xl p-12">
                <div class="flex flex-col items-center justify-center">
                    <div class="teacher-spinner mb-4"></div>
                    <p class="text-gray-500">Kurslar yükleniyor...</p>
                </div>
            </div>
        `;
    },

    /**
     * UI güncelle
     */
    updateUI() {
        // Stats bar
        const statsBar = document.getElementById('courseStatsBar');
        if (statsBar) {
            statsBar.innerHTML = this.renderStatsBar();
        }

        // Master list (sol menü)
        const masterList = document.getElementById('coursesMasterList');
        if (masterList) {
            if (this.isLoading) {
                masterList.innerHTML = this.renderMasterListLoading();
            } else {
                masterList.innerHTML = this.renderMasterList();

                // İlk kursu otomatik seç
                if (this.courses.length > 0 && !this.selectedCourse) {
                    this.selectCourse(this.courses[0].id);
                }
            }
        }
    },

    /**
     * Mount ve veri yükleme
     */
    async mount() {
        await this.loadData();
    },

    /**
     * Verileri yükle
     */
    async loadData() {
        this.isLoading = true;
        this.selectedCourse = null;
        this.updateUI();

        try {
            const { default: CourseEnrollmentService } = await import('/modules/courseEnrollmentService.js');

            // Paralel yükleme
            const [courses, classrooms] = await Promise.all([
                CourseEnrollmentService.getCourses(),
                CourseEnrollmentService.getTeacherClassrooms(),
            ]);

            this.courses = courses;
            this.classrooms = classrooms;

            // Her kurs için istatistik yükle
            await this.loadEnrollmentStats();

            this.isLoading = false;
            this.updateUI();
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            this.isLoading = false;
            this.showError('Veriler yüklenirken bir hata oluştu');
        }
    },

    /**
     * Kayıt istatistiklerini yükle
     */
    async loadEnrollmentStats() {
        try {
            const { default: CourseEnrollmentService } = await import('/modules/courseEnrollmentService.js');

            const statsPromises = this.courses.map(async (course) => {
                const stats = await CourseEnrollmentService.getCourseEnrollmentStats(course.id);
                return { courseId: course.id, stats };
            });

            const results = await Promise.all(statsPromises);

            this.enrollmentStats = {};
            results.forEach(({ courseId, stats }) => {
                this.enrollmentStats[courseId] = stats;
            });
        } catch (error) {
            console.error('İstatistik yükleme hatası:', error);
        }
    },

    /**
     * Kurs atama modalını aç
     * @param {string} courseId - Kurs ID
     */
    async openAssignmentModal(courseId) {
        const course = this.courses.find((c) => c.id === courseId);
        if (!course) return;

        this.selectedCourse = course;

        const modal = document.getElementById('courseAssignmentModal');
        const content = document.getElementById('courseAssignmentModalContent');

        if (!modal || !content) return;

        content.innerHTML = this.renderAssignmentModalContent(course);
        modal.classList.remove('hidden');

        // Sınıf kayıtlarını yükle
        await this.loadClassroomEnrollments();
    },

    /**
     * Modal içeriği render
     * @param {Object} course - Kurs
     */
    renderAssignmentModalContent(course) {
        const themeColor = course.theme_color || '#00979c';

        return `
            <!-- Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700" style="background: ${themeColor}10">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                             style="background: ${themeColor}20">
                            📚
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                                ${course.title}
                            </h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Sınıflara Kurs Ata</p>
                        </div>
                    </div>
                    <button onclick="CoursesSection.closeAssignmentModal()"
                        class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span class="text-xl">✕</span>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <div class="p-6 max-h-[60vh] overflow-y-auto">
                <div class="space-y-4">
                    <h4 class="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        🏫 Sınıflarınız
                    </h4>
                    
                    <div id="classroomEnrollmentList" class="space-y-3">
                        ${this.renderClassroomLoadingState()}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div class="flex justify-end">
                    <button onclick="CoursesSection.closeAssignmentModal()"
                        class="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        Kapat
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Sınıf loading durumu
     */
    renderClassroomLoadingState() {
        return `
            <div class="flex items-center justify-center py-8">
                <div class="teacher-spinner"></div>
            </div>
        `;
    },

    /**
     * Sınıf kayıtlarını yükle
     */
    async loadClassroomEnrollments() {
        const list = document.getElementById('classroomEnrollmentList');
        if (!list || !this.selectedCourse) return;

        try {
            const { default: CourseEnrollmentService } = await import('/modules/courseEnrollmentService.js');

            // Her sınıf için kayıt durumunu kontrol et
            const classroomData = await Promise.all(
                this.classrooms.map(async (classroom) => {
                    const enrollments = await CourseEnrollmentService.getClassroomEnrollments(classroom.id);
                    const courseEnrollments = enrollments.filter((e) => e.course_id === this.selectedCourse.id);
                    return {
                        ...classroom,
                        enrolledCount: courseEnrollments.length,
                        isAssigned: courseEnrollments.length > 0,
                    };
                })
            );

            if (classroomData.length === 0) {
                list.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500 dark:text-gray-400">Henüz sınıf oluşturmadınız.</p>
                        <a href="/teacher#classrooms" class="text-theme hover:underline mt-2 inline-block">
                            Sınıf Oluştur →
                        </a>
                    </div>
                `;
                return;
            }

            list.innerHTML = classroomData.map((classroom) => this.renderClassroomEnrollmentItem(classroom)).join('');
        } catch (error) {
            console.error('Sınıf kayıtları yüklenemedi:', error);
            list.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <p>Kayıtlar yüklenirken hata oluştu</p>
                </div>
            `;
        }
    },

    /**
     * Sınıf kayıt item'ı render
     * @param {Object} classroom - Sınıf verisi
     */
    renderClassroomEnrollmentItem(classroom) {
        const studentCount = classroom.students?.[0]?.count || 0;
        const isAssigned = classroom.isAssigned;
        const enrolledCount = classroom.enrolledCount || 0;

        return `
            <div class="glass-card rounded-xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-theme/10 flex items-center justify-center">
                        🏫
                    </div>
                    <div>
                        <h5 class="font-semibold text-gray-800 dark:text-white">${classroom.name}</h5>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            ${studentCount} öğrenci ${isAssigned ? `• ${enrolledCount} kayıtlı` : ''}
                        </p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    ${
                        isAssigned
                            ? `
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            ✓ Atandı
                        </span>
                        <button onclick="CoursesSection.unenrollClassroom('${classroom.id}')"
                            class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            title="Atamayı Kaldır">
                            <span>🗑️</span>
                        </button>
                    `
                            : `
                        <button onclick="CoursesSection.enrollClassroom('${classroom.id}')"
                            class="px-4 py-2 bg-theme text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-2"
                            ${studentCount === 0 ? 'disabled title="Sınıfta öğrenci yok"' : ''}>
                            <span>➕</span>
                            <span>Ata</span>
                        </button>
                    `
                    }
                </div>
            </div>
        `;
    },

    /**
     * Sınıfa kurs ata
     * @param {string} classroomId - Sınıf ID
     */
    async enrollClassroom(classroomId) {
        if (!this.selectedCourse) return;

        try {
            const { default: CourseEnrollmentService } = await import('/modules/courseEnrollmentService.js');

            const result = await CourseEnrollmentService.enrollClassroom(classroomId, this.selectedCourse.id);

            // Toast göster
            if (window.showToast) {
                window.showToast(result.message, 'success');
            }

            // Listeyi yenile
            await this.loadClassroomEnrollments();

            // İstatistikleri güncelle
            await this.loadEnrollmentStats();
            this.updateUI();
        } catch (error) {
            console.error('Atama hatası:', error);
            if (window.showToast) {
                window.showToast('Atama sırasında bir hata oluştu', 'error');
            }
        }
    },

    /**
     * Sınıftan kursu kaldır
     * @param {string} classroomId - Sınıf ID
     */
    async unenrollClassroom(classroomId) {
        if (!this.selectedCourse) return;

        if (!confirm('Bu sınıftaki tüm öğrencilerin kurs kaydı silinecek. Devam etmek istiyor musunuz?')) {
            return;
        }

        try {
            const { default: CourseEnrollmentService } = await import('/modules/courseEnrollmentService.js');

            await CourseEnrollmentService.unenrollClassroom(classroomId, this.selectedCourse.id);

            if (window.showToast) {
                window.showToast('Kurs ataması kaldırıldı', 'success');
            }

            // Listeyi yenile
            await this.loadClassroomEnrollments();

            // İstatistikleri güncelle
            await this.loadEnrollmentStats();
            this.updateUI();
        } catch (error) {
            console.error('Silme hatası:', error);
            if (window.showToast) {
                window.showToast('İşlem sırasında bir hata oluştu', 'error');
            }
        }
    },

    /**
     * Modalı kapat
     */
    closeAssignmentModal() {
        const modal = document.getElementById('courseAssignmentModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.selectedCourse = null;
    },

    /**
     * Hata mesajı göster
     * @param {string} message - Hata mesajı
     */
    showError(message) {
        const list = document.getElementById('coursesList');
        if (list) {
            list.innerHTML = `
                <div class="col-span-full glass-card rounded-2xl p-12">
                    <div class="text-center">
                        <div class="text-4xl mb-4">⚠️</div>
                        <p class="text-red-500">${message}</p>
                        <button onclick="CoursesSection.loadData()" class="mt-4 px-4 py-2 bg-theme text-white rounded-lg">
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            `;
        }
    },
};

window.CoursesSection = CoursesSection;
