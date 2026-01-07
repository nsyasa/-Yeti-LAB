/**
 * StudentDashboardView - SPA Student Dashboard View Controller
 * Handles student progress dashboard in SPA context
 *
 * Migrated from student-dashboard.html as part of SPA migration
 */

const StudentDashboardView = {
    isLoaded: false,
    container: null,
    studentData: null,
    progressData: [],
    quizData: [],

    /**
     * Check if user is authenticated as student
     * @returns {Promise<object|null>} Student info or null
     */
    async checkAuth() {
        // Wait for Auth module to initialize
        if (window.Auth && typeof Auth.waitForInit === 'function') {
            await Auth.waitForInit();
        }

        // Check if logged in as student
        if (window.Auth && Auth.isStudent() && Auth.currentStudent) {
            return Auth.currentStudent;
        }

        return null;
    },

    /**
     * Get the main template HTML
     */
    template() {
        return `
            <div class="dashboard-bg min-h-screen pb-8">
                <!-- Main Content -->
                <main class="max-w-6xl mx-auto px-4 py-8">
                    <!-- Welcome Section -->
                    <div class="mb-8">
                        <h2 class="text-3xl font-bold mb-2">Merhaba, <span id="sd-welcomeName">Öğrenci</span>! 👋</h2>
                        <p class="text-gray-600">İşte senin öğrenme yolculuğun</p>
                    </div>

                    <!-- Stats Overview -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">📚</div>
                            <div id="sd-totalLessons" class="text-3xl font-bold text-theme">0</div>
                            <div class="text-gray-500 text-sm">Tamamlanan Ders</div>
                        </div>
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">🏆</div>
                            <div id="sd-avgScore" class="text-3xl font-bold text-yellow-500">0</div>
                            <div class="text-gray-500 text-sm">Ortalama Puan</div>
                        </div>
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">🔥</div>
                            <div id="sd-streak" class="text-3xl font-bold text-orange-500">0</div>
                            <div class="text-gray-500 text-sm">Gün Seri</div>
                        </div>
                        <div class="stat-card text-center">
                            <div class="text-4xl mb-2">⭐</div>
                            <div id="sd-totalQuizzes" class="text-3xl font-bold text-purple-500">0</div>
                            <div class="text-gray-500 text-sm">Tamamlanan Quiz</div>
                        </div>
                    </div>

                    <!-- Course Progress -->
                    <h3 class="text-xl font-bold mb-4">📊 Kurs İlerlemen</h3>
                    <div id="sd-courseProgress" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="flex justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <h3 class="text-xl font-bold mb-4">📝 Son Aktiviteler</h3>
                    <div id="sd-recentActivity" class="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div class="flex justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                        </div>
                    </div>

                    <!-- Quiz History -->
                    <h3 class="text-xl font-bold mb-4 mt-8">🎯 Quiz Puanları</h3>
                    <div id="sd-quizHistory" class="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div class="flex justify-center py-12">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme"></div>
                        </div>
                    </div>

                    <!-- Back to Home -->
                    <div class="text-center mt-8">
                        <button onclick="StudentDashboardView.goHome()" class="text-theme hover:text-theme/80 font-medium text-sm flex items-center gap-2 mx-auto">
                            ← Ana Sayfaya Dön
                        </button>
                    </div>
                </main>
            </div>
        `;
    },

    /**
     * Mount the student dashboard view into a container
     * @param {HTMLElement} container - Container element
     */
    async mount(container) {
        console.log('[StudentDashboardView] Mounting...');
        this.container = container;

        // Show loading state
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[60vh]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-theme mb-4"></div>
                <p class="text-gray-500">Öğrenci paneli yükleniyor...</p>
            </div>
        `;

        // 1. Check authentication
        this.studentData = await this.checkAuth();
        if (!this.studentData) {
            console.log('[StudentDashboardView] Not authenticated as student, redirecting...');
            window.location.href = 'auth.html?redirect=student-dashboard';
            return;
        }

        // 2. Render template
        container.innerHTML = this.template();

        // 3. Update welcome name
        const welcomeEl = document.getElementById('sd-welcomeName');
        if (welcomeEl) {
            welcomeEl.textContent = this.studentData.displayName || 'Öğrenci';
        }

        // 4. Load data
        await Promise.all([this.loadProgressData(), this.loadQuizData()]);

        // 5. Render sections
        this.renderStats();
        this.renderCourseProgress();
        this.renderRecentActivity();
        this.renderQuizHistory();

        this.isLoaded = true;
        console.log('[StudentDashboardView] Mounted successfully');
    },

    /**
     * Unmount the student dashboard view
     */
    unmount() {
        console.log('[StudentDashboardView] Unmounting...');
        this.isLoaded = false;
        this.container = null;
        this.progressData = [];
        this.quizData = [];
    },

    /**
     * Load progress data from Supabase
     */
    async loadProgressData() {
        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('student_progress')
                .select('*')
                .eq('student_id', this.studentData.studentId)
                .order('completed_at', { ascending: false });

            if (error) throw error;
            this.progressData = data || [];
        } catch (err) {
            console.error('[StudentDashboardView] Error loading progress:', err);
            this.progressData = [];
        }
    },

    /**
     * Load quiz data from Supabase
     */
    async loadQuizData() {
        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('student_progress')
                .select('*')
                .eq('student_id', this.studentData.studentId)
                .not('quiz_score', 'is', null)
                .order('completed_at', { ascending: false });

            if (error) throw error;
            this.quizData = data || [];
        } catch (err) {
            console.error('[StudentDashboardView] Error loading quiz data:', err);
            this.quizData = [];
        }
    },

    /**
     * Render stats overview
     */
    renderStats() {
        // Total completed lessons
        const totalLessonsEl = document.getElementById('sd-totalLessons');
        if (totalLessonsEl) {
            totalLessonsEl.textContent = this.progressData.length;
        }

        // Average quiz score
        const quizScores = this.quizData.filter((q) => q.quiz_score !== null).map((q) => q.quiz_score);
        const avgScore =
            quizScores.length > 0 ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
        const avgScoreEl = document.getElementById('sd-avgScore');
        if (avgScoreEl) {
            avgScoreEl.textContent = avgScore;
        }

        // Total quizzes
        const totalQuizzesEl = document.getElementById('sd-totalQuizzes');
        if (totalQuizzesEl) {
            totalQuizzesEl.textContent = this.quizData.length;
        }

        // Calculate streak (simplified - consecutive days)
        let streak = 0;
        const uniqueDays = [...new Set(this.progressData.map((p) => new Date(p.completed_at).toDateString()))];
        uniqueDays.sort((a, b) => new Date(b) - new Date(a));

        const todayDate = new Date();
        for (let i = 0; i < uniqueDays.length; i++) {
            const checkDate = new Date(todayDate);
            checkDate.setDate(checkDate.getDate() - i);

            if (uniqueDays.includes(checkDate.toDateString())) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        const streakEl = document.getElementById('sd-streak');
        if (streakEl) {
            streakEl.textContent = streak;
        }
    },

    /**
     * Render course progress cards
     */
    renderCourseProgress() {
        const container = document.getElementById('sd-courseProgress');
        if (!container) return;

        // Courses configuration
        const courses = {
            arduino: { title: 'Arduino Serüveni', icon: '🤖', color: '#00979C', total: 20 },
            microbit: { title: 'Micro:bit Dünyası', icon: '💻', color: '#6C63FF', total: 10 },
            scratch: { title: 'Scratch ile Oyun', icon: '🎮', color: '#FF6F00', total: 8 },
            mblock: { title: 'mBlock ile Robotik', icon: '🦾', color: '#30B0C7', total: 10 },
        };

        const courseStats = {};

        // Calculate progress for each course
        Object.keys(courses).forEach((key) => {
            const courseProgress = this.progressData.filter((p) => p.course_id === key);
            courseStats[key] = {
                completed: courseProgress.length,
                total: courses[key].total,
                percentage: Math.round((courseProgress.length / courses[key].total) * 100),
            };
        });

        container.innerHTML = Object.entries(courses)
            .map(([key, course]) => {
                const stats = courseStats[key];
                const circumference = 2 * Math.PI * 40;
                const offset = circumference - (stats.percentage / 100) * circumference;

                return `
                    <div class="course-progress-card bg-white rounded-2xl p-6 shadow-lg">
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <svg width="100" height="100" class="progress-ring">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="${course.color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-3xl">${course.icon}</span>
                                </div>
                            </div>
                            <div class="flex-grow">
                                <h4 class="font-bold text-lg mb-1">${course.title}</h4>
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-2xl font-bold" style="color: ${course.color}">${stats.percentage}%</span>
                                    <span class="text-gray-500 text-sm">(${stats.completed}/${stats.total} ders)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="h-2 rounded-full transition-all duration-500" style="width: ${stats.percentage}%; background: ${course.color}"></div>
                                </div>
                            </div>
                        </div>
                        <a href="#/course/${key}" onclick="event.preventDefault(); StudentDashboardView.goToCourse('${key}');"
                           class="mt-4 block text-center py-2 px-4 border-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                           style="border-color: ${course.color}; color: ${course.color}">
                            Devam Et →
                        </a>
                    </div>
                `;
            })
            .join('');
    },

    /**
     * Render recent activity list
     */
    renderRecentActivity() {
        const container = document.getElementById('sd-recentActivity');
        if (!container) return;

        if (this.progressData.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <div class="text-4xl mb-2">📭</div>
                    <p>Henüz aktivite yok</p>
                    <p class="text-sm">Dersleri tamamladıkça burada görünecek</p>
                </div>
            `;
            return;
        }

        // Show last 10 activities
        const recent = this.progressData.slice(0, 10);

        const courseIcons = {
            arduino: '🤖',
            microbit: '💻',
            scratch: '🎮',
            mblock: '🦾',
        };

        container.innerHTML = recent
            .map((activity) => {
                const date = new Date(activity.completed_at);
                const formattedDate = date.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                });

                const icon = courseIcons[activity.course_id] || '📚';
                const hasQuiz = activity.quiz_score !== null;

                return `
                    <div class="lesson-item completed px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${icon}</span>
                            <div>
                                <p class="font-medium">${activity.project_id}</p>
                                <p class="text-sm text-gray-500">${activity.course_id} kursu</p>
                            </div>
                        </div>
                        <div class="text-right">
                            ${hasQuiz ? `<span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-sm font-medium">Quiz: ${activity.quiz_score}%</span>` : ''}
                            <p class="text-sm text-gray-400 mt-1">${formattedDate}</p>
                        </div>
                    </div>
                `;
            })
            .join('');
    },

    /**
     * Render quiz history
     */
    renderQuizHistory() {
        const container = document.getElementById('sd-quizHistory');
        if (!container) return;

        if (this.quizData.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <div class="text-4xl mb-2">🎯</div>
                    <p>Henüz quiz tamamlanmadı</p>
                    <p class="text-sm">Ders sonlarındaki quizleri çöz</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.quizData
            .map((quiz) => {
                const date = new Date(quiz.completed_at);
                const formattedDate = date.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });

                const score = quiz.quiz_score;
                let scoreColor = 'text-red-500';
                let scoreEmoji = '😢';

                if (score >= 80) {
                    scoreColor = 'text-green-500';
                    scoreEmoji = '🎉';
                } else if (score >= 60) {
                    scoreColor = 'text-yellow-500';
                    scoreEmoji = '👍';
                } else if (score >= 40) {
                    scoreColor = 'text-orange-500';
                    scoreEmoji = '💪';
                }

                return `
                    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${scoreEmoji}</span>
                            <div>
                                <p class="font-medium">${quiz.project_id}</p>
                                <p class="text-sm text-gray-500">${quiz.course_id} kursu • ${formattedDate}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-2xl font-bold ${scoreColor}">${score}%</span>
                        </div>
                    </div>
                `;
            })
            .join('');
    },

    /**
     * Navigate to home
     */
    goHome() {
        if (window.Navbar && typeof Navbar.navigateSPA === 'function') {
            Navbar.navigateSPA('/');
        } else if (window.Router) {
            Router.navigate('/');
        } else {
            window.location.href = 'index.html';
        }
    },

    /**
     * Navigate to course
     * @param {string} courseKey - Course key
     */
    goToCourse(courseKey) {
        if (window.Navbar && typeof Navbar.navigateSPA === 'function') {
            Navbar.navigateSPA(`/course/${courseKey}`);
        } else if (window.Router) {
            Router.navigate(`/course/${courseKey}`);
        } else {
            window.location.href = `index.html#/course/${courseKey}`;
        }
    },
};

// Expose globally
window.StudentDashboardView = StudentDashboardView;
