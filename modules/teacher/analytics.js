// ==========================================
// YETI LAB - TEACHER ANALYTICS MODULE
// ==========================================

const TeacherAnalytics = {
    projectsCache: {},

    // ==========================================
    // INITIALIZATION & DATA LOADING
    // ==========================================

    /**
     * Load projects from database and cache them
     */
    async loadProjects() {
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
            this.projectsCache = {};

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

                this.projectsCache[course.slug] = courseProjects;
            });

            return this.projectsCache;
        } catch (error) {
            console.error('Error loading projects:', error);
            if (window.showToast) window.showToast('Proje listesi yüklenemedi', 'error');
            return {};
        }
    },

    // ==========================================
    // DASHBOARD PROGRESS RENDERING
    // ==========================================

    async renderCourseProgress(containerId, students) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Show loading
        container.innerHTML = `
            <div class="flex justify-center py-8">
                <div class="spinner"></div>
            </div>
        `;

        try {
            // Check students
            if (!students || students.length === 0) {
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

            // Update total completed lessons stat (if element exists)
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
                                            <p class="font-medium text-gray-800 dark:text-white">${Utils.escapeHtml(studentData.name)}</p>
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
                    <button onclick="TeacherAnalytics.renderCourseProgress('courseProgress', window.loadStudents ? students : [])" class="mt-4 px-4 py-2 bg-theme text-white rounded-lg">Tekrar Dene</button>
                </div>
            `;
        }
    },

    // ==========================================
    // STUDENT DETAIL RENDERING
    // ==========================================

    renderStudentDetailStats(completedProjectIds) {
        const totalCompleted = completedProjectIds.length;
        const totalXP = totalCompleted * 50; // Simple XP calculation
        const level = Math.floor(totalXP / 500) + 1;

        // Badges Logic
        const badges = [];
        if (totalCompleted >= 1) badges.push({ icon: '🎉', name: 'İlk Adım' });
        if (totalCompleted >= 5) badges.push({ icon: '🚀', name: 'Hızlı Başlangıç' });
        if (totalCompleted >= 10) badges.push({ icon: '⭐', name: 'Kodlama Yıldızı' });
        if (totalCompleted >= 20) badges.push({ icon: '🏆', name: 'Uzman Kodlayıcı' });
        if (totalCompleted >= 50) badges.push({ icon: '👑', name: 'Yeti Ustası' });

        document.getElementById('detailCompletedCount').textContent = totalCompleted;
        document.getElementById('detailXP').textContent = totalXP;
        document.getElementById('detailLevel').textContent = level;

        const badgesContainer = document.getElementById('detailBadges');
        if (badgesContainer) {
            if (badges.length === 0) {
                badgesContainer.innerHTML = '<span class="text-gray-400 text-sm">Henüz rozet yok</span>';
            } else {
                badgesContainer.innerHTML = badges
                    .map(
                        (b) => `
                    <div class="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span class="text-2xl mb-1">${b.icon}</span>
                        <span class="text-[10px] text-gray-500 text-center leading-tight">${b.name}</span>
                    </div>
                `
                    )
                    .join('');
            }
        }
    },

    /**
     * Renders project list in student detail modal
     */
    renderStudentProjectList(containerId, completedProjectIds) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // helper formatId
        const formatId = (id) => {
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
        if (Object.keys(this.projectsCache).length === 0) {
            html += `
                <div class="text-center py-4 text-gray-400 text-sm">
                    <p>Proje listesi yükleniyor...</p>
                </div>
            `;
            // Trigger load if empty?
            this.loadProjects().then(() => {
                // Re-render if container still exists and we have data
                if (document.getElementById(containerId)) {
                    this.renderStudentProjectList(containerId, completedProjectIds);
                }
            });
        } else {
            // Iterate through cached courses
            Object.entries(this.projectsCache).forEach(([courseSlug, projects]) => {
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
    },

    renderStudentRecentLessons(containerId, progressData) {
        // Update Recent Lessons Log (Compact)
        const recentContainer = document.getElementById(containerId);
        if (!recentContainer) return;

        // Helper formatRelativeTime
        const formatRelativeTime = (dateString) => {
            if (typeof window.formatRelativeTime === 'function') return window.formatRelativeTime(dateString);
            if (typeof Utils !== 'undefined' && Utils.formatDate) return Utils.formatDate(dateString);
            return dateString;
        };

        // Helper formatId (redundant but safe)
        const formatId = (id) =>
            id
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

        if (progressData.length === 0) {
            recentContainer.innerHTML = '<p class="text-xs text-center text-gray-400 py-2">Ders kaydı yok</p>';
        } else {
            // Find project titles from cache (compare with dbId - UUID)
            const getProjectTitle = (projectId) => {
                for (const courseProjects of Object.values(this.projectsCache)) {
                    const found = courseProjects.find((p) => p.dbId === projectId);
                    if (found) return found.title;
                }
                return formatId(projectId); // Fallback to formatted UUID/Slug if not found
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
    },
};

window.TeacherAnalytics = TeacherAnalytics;
