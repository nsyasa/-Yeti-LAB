/**
 * Progress Tracking Module - Yeti LAB
 * Handles lesson completion with Supabase integration.
 * 
 * For logged-in students: Saves to Supabase (student_progress table)
 * For guests: No progress saving (removed localStorage to avoid confusion)
 * 
 * Usage:
 *   Progress.init()             - Initialize (called after Auth.init)
 *   Progress.toggle(id)         - Toggle lesson completion
 *   Progress.isComplete(id)     - Check if lesson is complete
 *   Progress.getRate(key)       - Get completion percentage for a course
 *   Progress.loadFromServer()   - Load progress from Supabase
 */

const Progress = {
    data: {}, // { courseKey: [completedProjectId1, completedProjectId2, ...] }
    scores: {}, // { courseKey: { projectId: score } }
    dates: [],  // Array of ISO date strings
    isLoading: false,
    isInitialized: false,

    // Reference to app state - try multiple sources
    _getKey: () => {
        // Try window._appState first
        if (window._appState?.currentCourseKey) {
            return window._appState.currentCourseKey;
        }
        // Try app.state
        if (typeof app !== 'undefined' && app.state?.currentCourseKey) {
            return app.state.currentCourseKey;
        }
        console.warn('[Progress] Could not get current course key');
        return null;
    },
    _getCourseData: () => window.courseData || {},

    // Helper to get student ID (works for both classroom and OAuth students)
    _getStudentId: () => {
        if (typeof Auth === 'undefined') return null;
        // Classroom-based student
        if (Auth.currentStudent?.studentId) {
            return Auth.currentStudent.studentId;
        }
        // OAuth-based student (uses user ID from Supabase Auth)
        if (Auth.isStudent() && Auth.currentUser?.id) {
            return Auth.currentUser.id;
        }
        return null;
    },

    /**
     * Initialize progress module
     * Must be called after Auth.init()
     */
    init: async () => {
        if (Progress.isInitialized) return;

        // Only load from server if student is logged in
        if (typeof Auth !== 'undefined' && Auth.isStudent()) {
            await Progress.loadFromServer();
        }

        Progress.isInitialized = true;
    },

    /**
     * Load progress from Supabase (for logged-in students)
     */
    loadFromServer: async () => {
        const studentId = Progress._getStudentId();
        if (!studentId) {
            return;
        }

        Progress.isLoading = true;

        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('student_progress')
                .select('course_id, project_id, completed_at, quiz_score')
                .eq('student_id', studentId);

            if (error) throw error;

            // Organize by course
            Progress.data = {};
            Progress.scores = {};
            Progress.dates = [];

            (data || []).forEach(row => {
                // Course-Project mapping
                if (!Progress.data[row.course_id]) {
                    Progress.data[row.course_id] = [];
                    Progress.scores[row.course_id] = {};
                }
                Progress.data[row.course_id].push(row.project_id);

                // Store Score
                if (row.quiz_score) {
                    Progress.scores[row.course_id][row.project_id] = row.quiz_score;
                }

                // Store Date
                if (row.completed_at) {
                    Progress.dates.push(row.completed_at);
                }
            });

        } catch (error) {
            console.error('[Progress] Failed to load from server:', error);
            Toast?.apiError(error, 'İlerleme verileri yükleme');
        } finally {
            Progress.isLoading = false;
        }
    },

    /**
     * Save a single progress entry to Supabase
     */
    saveToServer: async (courseKey, projectId, completed) => {
        const studentId = Progress._getStudentId();
        if (!studentId) {
            return false;
        }

        try {
            if (completed) {
                // Insert progress record
                const payload = {
                    student_id: studentId,
                    course_id: courseKey,
                    project_id: projectId,
                    completed_at: new Date().toISOString()
                };

                const { error } = await SupabaseClient.getClient()
                    .from('student_progress')
                    .upsert(payload, {
                        onConflict: 'student_id,project_id'
                    });

                if (error) {
                    console.error('[Progress] Save error:', error.message);
                    throw error;
                }

            } else {
                // Delete progress record
                const { error } = await SupabaseClient.getClient()
                    .from('student_progress')
                    .delete()
                    .eq('student_id', studentId)
                    .eq('project_id', projectId);

                if (error) {
                    console.error('[Progress] Delete error:', error.message);
                    throw error;
                }
            }

            return true;

        } catch (error) {
            console.error('[Progress] Failed:', error.message);
            Toast?.error('İlerleme kaydedilemedi. Lütfen tekrar deneyin.');
            return false;
        }
    },

    /**
     * Toggle lesson completion
     */
    toggle: async (projectId) => {
        const key = Progress._getKey();

        if (!key) {
            return;
        }

        // Check if user is logged in as a student (either via classroom code or OAuth)
        const isLoggedIn = typeof Auth !== 'undefined' && Auth.isStudent();

        if (!isLoggedIn) {
            // Show login prompt for guests
            if (confirm('İlerlemenizi kaydetmek için giriş yapmanız gerekiyor. Giriş sayfasına gitmek ister misiniz?')) {
                window.location.href = 'auth.html';
            }
            return;
        }

        // Initialize arrays if needed
        if (!Progress.data[key]) Progress.data[key] = [];

        const index = Progress.data[key].indexOf(projectId);
        const isCompleting = index === -1;

        // Update local state immediately for UI responsiveness
        if (isCompleting) {
            Progress.data[key].push(projectId);
        } else {
            Progress.data[key].splice(index, 1);
        }

        // Trigger UI update
        if (typeof Progress.onUpdate === 'function') {
            Progress.onUpdate(projectId);
        }

        // Save to server in background
        await Progress.saveToServer(key, projectId, isCompleting);
    },

    /**
     * Check if a lesson is complete
     */
    isComplete: (projectId) => {
        const key = Progress._getKey();
        return Progress.data[key] && Progress.data[key].includes(projectId);
    },

    /**
     * Get all completed project IDs across all courses
     */
    getCompleted: () => {
        let all = [];
        Object.values(Progress.data).forEach(arr => {
            all = all.concat(arr);
        });
        return all;
    },

    /**
     * Get completion rate for a course
     */
    getRate: (key) => {
        // If not logged in, return 0
        if (typeof Auth !== 'undefined' && !Auth.isStudent()) {
            return 0;
        }

        const completed = Progress.data[key] ? Progress.data[key].length : 0;
        const courseData = Progress._getCourseData();
        const total = (courseData[key]?.data?.projects?.length) || 1;
        return Math.round((completed / total) * 100);
    },

    /**
     * Get overall statistics for the student
     */
    getStats: () => {
        if (typeof Auth !== 'undefined' && !Auth.isStudent()) {
            return { totalLessons: 0, badges: 0, streak: 0, quizAvg: 0 };
        }

        // 1. Total Lessons
        let totalLessons = 0;
        const completedLessons = Progress.getCompleted();
        const quizScores = Progress.scores || {};
        const quizKeys = Object.keys(quizScores);
        let quizSum = 0;

        quizKeys.forEach(k => quizSum += quizScores[k]);

        const quizAvg = quizKeys.length > 0 ? (quizSum / quizKeys.length) : 0;

        // Calculate Streak
        const dates = Progress.dates || [];
        let streak = 0;
        if (dates.length > 0) {
            // Sort dates new to old
            const sortedDates = dates.map(d => new Date(d).toDateString()).sort((a, b) => new Date(b) - new Date(a));
            const uniqueDates = [...new Set(sortedDates)];

            // Check if today or yesterday is present to start streak
            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (uniqueDates.includes(today) || uniqueDates.includes(yesterdayStr)) {
                streak = 1;
                let currentDate = new Date(uniqueDates[0]); // Start checking from most recent

                for (let i = 1; i < uniqueDates.length; i++) {
                    const prevDate = new Date(uniqueDates[i]);
                    const diffTime = Math.abs(currentDate - prevDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        streak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // --- XP & LEVEL CALCULATION ---
        // 1 Lesson = 150 XP
        // 1 Badge = 500 XP
        const baseXP = completedLessons.length * 150;

        // Calculate Badges first
        let earnedBadges = [];
        if (window.BadgeSystem) {
            earnedBadges = window.BadgeSystem.calculateEarned({
                totalLessons: completedLessons.length,
                quizAvg: quizAvg,
                streak: streak
            });
        } else {
            // Fallback
            if (completedLessons.length >= 1) earnedBadges.push('newbie');
        }

        const badgeXP = earnedBadges.length * 500;
        const totalXP = baseXP + badgeXP;

        // Level Logic: Level 1 = 0-1000 XP, Level 2 = 1001-2000...
        // Formula: Floor(XP / 1000) + 1
        const level = Math.floor(totalXP / 1000) + 1;
        const nextLevelXP = level * 1000;
        const currentLevelXP = totalXP % 1000; // Progress within current level
        const levelProgress = (currentLevelXP / 1000) * 100;

        return {
            totalLessons: completedLessons.length,
            quizAvg: Math.round(quizAvg),
            streak: streak,
            badges: earnedBadges.length,
            earnedBadges: earnedBadges,
            xp: totalXP,
            level: level,
            levelProgress: Math.round(levelProgress),
            nextLevelXP: nextLevelXP
        };
    },

    /**
     * Get completed project IDs for a specific student and course
     * (Used by teacher panel)
     */
    getStudentProgress: async (studentId, courseKey) => {
        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('student_progress')
                .select('project_id, completed_at, quiz_score')
                .eq('student_id', studentId)
                .eq('course_id', courseKey);

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('[Progress] Failed to get student progress:', error);
            return [];
        }
    },

    /**
     * Get all progress for a classroom (for teacher dashboard)
     */
    getClassroomProgress: async (classroomId) => {
        try {
            // First get all students in the classroom
            const { data: students, error: studentsError } = await SupabaseClient.getClient()
                .from('students')
                .select('id, display_name')
                .eq('classroom_id', classroomId);

            if (studentsError) throw studentsError;
            if (!students || students.length === 0) return [];

            const studentIds = students.map(s => s.id);

            // Get all progress for these students
            const { data: progressData, error: progressError } = await SupabaseClient.getClient()
                .from('student_progress')
                .select('student_id, course_id, project_id, completed_at')
                .in('student_id', studentIds);

            if (progressError) throw progressError;

            // Combine data
            return students.map(student => ({
                ...student,
                progress: (progressData || []).filter(p => p.student_id === student.id)
            }));

        } catch (error) {
            console.error('[Progress] Failed to get classroom progress:', error);
            return [];
        }
    },

    // Callback for UI updates (set by app.js)
    onUpdate: null,

    // Legacy compatibility - load does nothing now, init handles everything
    load: () => { },

    // Legacy compatibility - save does nothing now, saveToServer handles everything
    save: () => { }
};

// Export for global access
window.Progress = Progress;
