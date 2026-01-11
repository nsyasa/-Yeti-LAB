/**
 * CoursesSection - Öğretmen paneli kurs atama yönetimi
 * Kurslara öğrenci/sınıf atama ve kayıt yönetimi
 */
const CoursesSection = {
    courses: [],
    classrooms: [],
    enrollmentStats: {},
    selectedCourse: null,
    isLoading: false,

    /**
     * Ana render
     */
    render() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            📚 Kurs Atamaları
                        </h2>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Sınıflarınıza kurs atayın ve öğrenci kayıtlarını yönetin
                        </p>
                    </div>
                </div>

                <!-- Info Banner -->
                <div class="glass-card rounded-2xl p-4 border-l-4 border-theme bg-theme/5">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl">💡</span>
                        <div>
                            <p class="font-semibold text-gray-800 dark:text-white">Kurs Atama Nasıl Çalışır?</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Bir kursu sınıfa atadığınızda, o sınıftaki tüm öğrenciler kursa erişim kazanır. 
                                Bireysel öğrenci atamaları için öğrenci detay sayfasını kullanabilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Stats Bar -->
                <div id="courseStatsBar" class="flex flex-wrap gap-3">
                    ${this.renderStatsBar()}
                </div>

                <!-- Courses Grid -->
                <div id="coursesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${this.renderLoading()}
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
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30">
                <span class="text-lg">📚</span>
                <span class="font-bold text-purple-700 dark:text-purple-400">${totalCourses}</span>
                <span class="text-sm text-purple-600 dark:text-purple-400">Kurs</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-green-100 dark:bg-green-900/30">
                <span class="text-lg">👥</span>
                <span class="font-bold text-green-700 dark:text-green-400">${activeEnrollments}</span>
                <span class="text-sm text-green-600 dark:text-green-400">Aktif Kayıt</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30">
                <span class="text-lg">📊</span>
                <span class="font-bold text-blue-700 dark:text-blue-400">${totalEnrollments}</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">Toplam Kayıt</span>
            </div>
        `;
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
     * Kurs kartı render
     * @param {Object} course - Kurs verisi
     */
    renderCourseCard(course) {
        const stats = this.enrollmentStats[course.id] || { total: 0, active: 0, completed: 0 };
        const themeColor = course.theme_color || '#00979c';

        return `
            <div class="glass-card rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group"
                 onclick="CoursesSection.openAssignmentModal('${course.id}')"
                 style="border-left: 4px solid ${themeColor}">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                         style="background: ${themeColor}20">
                        📚
                    </div>
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-theme"
                                title="Öğrenci Ata">
                            <span>➕</span>
                        </button>
                    </div>
                </div>
                
                <h3 class="font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">
                    ${course.title || 'İsimsiz Kurs'}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    ${course.description || 'Açıklama yok'}
                </p>
                
                <!-- Stats -->
                <div class="flex items-center gap-4 text-sm">
                    <div class="flex items-center gap-1">
                        <span class="text-green-500">👥</span>
                        <span class="font-semibold text-gray-700 dark:text-gray-300">${stats.active}</span>
                        <span class="text-gray-500 dark:text-gray-400">aktif</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-blue-500">✅</span>
                        <span class="font-semibold text-gray-700 dark:text-gray-300">${stats.completed}</span>
                        <span class="text-gray-500 dark:text-gray-400">tamamladı</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Boş durum render
     */
    renderEmptyState() {
        return `
            <div class="col-span-full glass-card rounded-2xl p-12">
                <div class="empty-state text-center">
                    <div class="text-6xl mb-4">📚</div>
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Henüz kurs bulunamadı</h3>
                    <p class="text-gray-500 dark:text-gray-400">Sistemde yayınlanmış kurs bulunmuyor.</p>
                </div>
            </div>
        `;
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
     * UI güncelle
     */
    updateUI() {
        // Stats bar
        const statsBar = document.getElementById('courseStatsBar');
        if (statsBar) {
            statsBar.innerHTML = this.renderStatsBar();
        }

        // Courses list
        const list = document.getElementById('coursesList');
        if (!list) return;

        if (this.isLoading) {
            list.innerHTML = this.renderLoading();
            return;
        }

        if (!this.courses || this.courses.length === 0) {
            list.innerHTML = this.renderEmptyState();
            return;
        }

        list.innerHTML = this.courses.map((course) => this.renderCourseCard(course)).join('');
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
