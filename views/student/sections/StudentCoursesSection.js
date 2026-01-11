/**
 * StudentCoursesSection - Öğrenci kayıtlı kursları görünümü
 * Öğrencinin atanmış olduğu kursları listeler
 */

import CourseEnrollmentService from '/modules/courseEnrollmentService.js';

const StudentCoursesSection = {
    courses: [],
    isLoading: false,
    studentId: null,

    /**
     * Initialization
     * @param {string} studentId - Student ID
     */
    async init(studentId) {
        this.studentId = studentId;
        await this.loadCourses();
    },

    /**
     * Kursları yükle
     */
    async loadCourses() {
        if (!this.studentId) return;

        this.isLoading = true;

        try {
            this.courses = await CourseEnrollmentService.getMyActiveCourses(this.studentId);
        } catch (error) {
            console.error('Kurslar yüklenemedi:', error);
            this.courses = [];
        }

        this.isLoading = false;
    },

    /**
     * Ana render - Dashboard özet kartları
     * @returns {string} HTML
     */
    render() {
        if (this.isLoading) {
            return `
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin w-8 h-8 border-4 border-theme border-t-transparent rounded-full"></div>
                </div>
            `;
        }

        if (!this.courses || this.courses.length === 0) {
            return `
                <div class="glass-card rounded-2xl p-8 text-center">
                    <div class="text-4xl mb-3">📚</div>
                    <h4 class="font-bold text-gray-800 dark:text-white mb-1">Henüz kayıtlı kurs yok</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Öğretmeniniz size kurs atadığında burada görünecek.
                    </p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${this.courses.map((course) => this.renderCourseCard(course)).join('')}
            </div>
        `;
    },

    /**
     * Kurs kartı render
     * @param {Object} course - Kurs verisi
     * @returns {string} HTML
     */
    renderCourseCard(course) {
        const themeColor = course.theme_color || '#00979c';
        const enrolledDate = course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('tr-TR') : '';

        // Kurs slug'a göre ikon belirle
        const icons = {
            arduino: '🤖',
            microbit: '💻',
            scratch: '🎮',
            mblock: '🦾',
            'minecraft-edu': '⛏️',
            appinventor: '📱',
        };
        const icon = icons[course.slug] || '📚';

        return `
            <div class="course-progress-card glass-card rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer"
                 onclick="StudentCoursesSection.openCourse('${course.slug}')"
                 style="border-left: 4px solid ${themeColor}">
                <div class="flex items-start gap-4">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                         style="background: ${themeColor}20">
                        ${icon}
                    </div>
                    <div class="flex-grow min-w-0">
                        <h4 class="font-bold text-gray-800 dark:text-white line-clamp-1">
                            ${course.title}
                        </h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            ${course.description || 'Açıklama yok'}
                        </p>
                        ${
                            enrolledDate
                                ? `
                            <p class="text-xs text-gray-400 mt-2">
                                📅 Kayıt: ${enrolledDate}
                            </p>
                        `
                                : ''
                        }
                    </div>
                </div>
                <button class="mt-4 w-full py-2.5 px-4 border-2 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
                        style="border-color: ${themeColor}; color: ${themeColor}">
                    <span>Kursa Git</span>
                    <span>→</span>
                </button>
            </div>
        `;
    },

    /**
     * Kursa git
     * @param {string} slug - Kurs slug
     */
    openCourse(slug) {
        // Router varsa kullan, yoksa doğrudan yönlendir
        if (window.router && typeof window.router.navigate === 'function') {
            window.router.navigate(`/course/${slug}`);
        } else if (window.location) {
            window.location.hash = `#/course/${slug}`;
        }
    },

    /**
     * Kurs erişim kontrolü
     * @param {string} courseSlug - Kurs slug
     * @returns {boolean}
     */
    async hasAccess(courseSlug) {
        if (!this.studentId) return false;
        return await CourseEnrollmentService.hasAccess(this.studentId, courseSlug);
    },

    /**
     * Kayıtlı kurs sayısı
     * @returns {number}
     */
    getEnrolledCount() {
        return this.courses?.length || 0;
    },
};

// Global export for onclick handlers
window.StudentCoursesSection = StudentCoursesSection;

export default StudentCoursesSection;
