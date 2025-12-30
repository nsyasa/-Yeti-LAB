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
    isLoading: false,
    isInitialized: false,

    // Reference to app state
    _getKey: () => window._appState?.currentCourseKey || null,
    _getCourseData: () => window.courseData || {},

    /**
     * Initialize progress module
     * Must be called after Auth.init()
     */
    init: async () => {
        if (Progress.isInitialized) return;

        // Only load from server if student is logged in
        if (typeof Auth !== 'undefined' && Auth.isStudent() && Auth.currentStudent) {
            await Progress.loadFromServer();
        }

        Progress.isInitialized = true;
        console.log('✅ Progress module initialized');
    },

    /**
     * Load progress from Supabase (for logged-in students)
     */
    loadFromServer: async () => {
        if (typeof Auth === 'undefined' || !Auth.currentStudent) {
            console.log('[Progress] Not logged in, skipping server load');
            return;
        }

        Progress.isLoading = true;

        try {
            const { data, error } = await SupabaseClient.getClient()
                .from('student_progress')
                .select('course_id, project_id')
                .eq('student_id', Auth.currentStudent.studentId);

            if (error) throw error;

            // Organize by course
            Progress.data = {};
            (data || []).forEach(row => {
                // We need to map course_id back to course key
                // For now, store by course_id directly
                if (!Progress.data[row.course_id]) {
                    Progress.data[row.course_id] = [];
                }
                Progress.data[row.course_id].push(row.project_id);
            });

            console.log('[Progress] Loaded from server:', Progress.data);

        } catch (error) {
            console.error('[Progress] Failed to load from server:', error);
        } finally {
            Progress.isLoading = false;
        }
    },

    /**
     * Save a single progress entry to Supabase
     */
    saveToServer: async (courseKey, projectId, completed) => {
        if (typeof Auth === 'undefined' || !Auth.currentStudent) {
            console.log('[Progress] Not logged in, progress not saved');
            return false;
        }

        try {
            if (completed) {
                // Insert progress record
                const { error } = await SupabaseClient.getClient()
                    .from('student_progress')
                    .upsert({
                        student_id: Auth.currentStudent.studentId,
                        course_id: courseKey, // Using courseKey as course_id for simplicity
                        project_id: projectId,
                        completed_at: new Date().toISOString()
                    }, {
                        onConflict: 'student_id,project_id'
                    });

                if (error) throw error;
                console.log('[Progress] Saved to server:', { courseKey, projectId });

            } else {
                // Delete progress record
                const { error } = await SupabaseClient.getClient()
                    .from('student_progress')
                    .delete()
                    .eq('student_id', Auth.currentStudent.studentId)
                    .eq('project_id', projectId);

                if (error) throw error;
                console.log('[Progress] Deleted from server:', { courseKey, projectId });
            }

            return true;

        } catch (error) {
            console.error('[Progress] Failed to save to server:', error);
            return false;
        }
    },

    /**
     * Toggle lesson completion
     */
    toggle: async (projectId) => {
        const key = Progress._getKey();
        if (!key) return;

        // Check if user is logged in
        const isLoggedIn = typeof Auth !== 'undefined' && Auth.isStudent() && Auth.currentStudent;

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
    load: () => {
        console.log('[Progress] load() called - now using init() instead');
    },

    // Legacy compatibility - save does nothing now, saveToServer handles everything
    save: () => {
        console.log('[Progress] save() called - now auto-saving to server');
    }
};

// Export for global access
window.Progress = Progress;
