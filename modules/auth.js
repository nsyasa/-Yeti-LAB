/**
 * Auth Module - Yeti LAB
 * Kullanıcı kimlik doğrulama ve oturum yönetimi
 * 
 * Desteklenen giriş yöntemleri:
 * - Öğretmen: Google/GitHub OAuth veya E-posta/Şifre
 * - Öğrenci: Sınıf Kodu + İsim (5 harfli kod)
 * - Öğrenci (opsiyonel): E-posta/Şifre veya OAuth
 */

const Auth = {
    // Current user state
    currentUser: null,
    currentStudent: null,
    userRole: null, // 'teacher', 'student', 'admin'

    // Session storage keys
    STUDENT_SESSION_KEY: 'yeti_student_session',
    USER_ROLE_KEY: 'yeti_user_role',

    /**
     * Initialize auth module
     */
    async init() {
        console.log('🔐 Auth module initializing...');

        // Check for existing Supabase session (teachers/admins)
        await this.checkSession();

        // Check for existing student session
        this.checkStudentSession();

        console.log('✅ Auth module ready');
        return this;
    },

    // ==========================================
    // TEACHER/ADMIN AUTH (Supabase Auth)
    // ==========================================

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        // Redirect to index.html after OAuth
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        const redirectUrl = baseUrl + '/index.html';

        const { data, error } = await SupabaseClient.getClient().auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl
            }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign in with GitHub
     */
    async signInWithGitHub() {
        // Redirect to index.html after OAuth
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        const redirectUrl = baseUrl + '/index.html';

        const { data, error } = await SupabaseClient.getClient().auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: redirectUrl
            }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign in with email/password
     */
    async signInWithEmail(email, password) {
        const { data, error } = await SupabaseClient.getClient().auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        this.currentUser = data.user;
        await this.loadUserProfile();

        return data;
    },

    /**
     * Sign up with email/password (for teachers)
     */
    async signUpWithEmail(email, password, fullName) {
        const { data, error } = await SupabaseClient.getClient().auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign out (for teachers/admins)
     */
    async signOut() {
        const { error } = await SupabaseClient.getClient().auth.signOut();
        if (error) throw error;

        this.currentUser = null;
        this.userRole = null;
        localStorage.removeItem(this.USER_ROLE_KEY);
    },

    /**
     * Check existing session
     */
    async checkSession() {
        const { data: { session } } = await SupabaseClient.getClient().auth.getSession();

        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile();
        }

        return session;
    },

    /**
     * Load user profile from database
     */
    async loadUserProfile() {
        if (!this.currentUser) return null;

        const { data, error } = await SupabaseClient.getClient()
            .from('user_profiles')
            .select('*')
            .eq('id', this.currentUser.id)
            .maybeSingle();

        if (data) {
            this.userRole = data.role;
            localStorage.setItem(this.USER_ROLE_KEY, data.role);
        }

        return data;
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback) {
        return SupabaseClient.getClient().auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                await this.loadUserProfile();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.userRole = null;
            }

            callback(event, session, this.userRole);
        });
    },

    // ==========================================
    // STUDENT AUTH (Classroom Code + Name)
    // ==========================================

    /**
     * Student login with classroom code and name
     * @param {string} classroomCode - 5 character classroom code
     * @param {string} displayName - Student's display name
     */
    async studentLogin(classroomCode, displayName) {
        // Validate inputs
        if (!classroomCode || classroomCode.length !== 5) {
            throw new Error('Sınıf kodu 5 karakter olmalıdır');
        }

        if (!displayName || displayName.trim().length < 2) {
            throw new Error('İsim en az 2 karakter olmalıdır');
        }

        // Call the student_login function in Supabase
        const { data, error } = await SupabaseClient.getClient()
            .rpc('student_login', {
                p_classroom_code: classroomCode.toUpperCase(),
                p_display_name: displayName.trim()
            });

        if (error) {
            if (error.message.includes('Geçersiz sınıf kodu')) {
                throw new Error('Geçersiz sınıf kodu. Lütfen öğretmeninizden doğru kodu isteyin.');
            }
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('Giriş yapılamadı. Lütfen tekrar deneyin.');
        }

        const studentData = data[0];

        // Store session in localStorage
        const session = {
            studentId: studentData.student_id,
            sessionToken: studentData.session_token,
            displayName: displayName.trim(),
            classroomName: studentData.classroom_name,
            teacherName: studentData.teacher_name,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem(this.STUDENT_SESSION_KEY, JSON.stringify(session));
        this.currentStudent = session;
        this.userRole = 'student';
        localStorage.setItem(this.USER_ROLE_KEY, 'student');

        console.log('✅ Student logged in:', displayName);

        return session;
    },

    /**
     * Check existing student session
     */
    checkStudentSession() {
        const stored = localStorage.getItem(this.STUDENT_SESSION_KEY);

        if (stored) {
            try {
                this.currentStudent = JSON.parse(stored);
                this.userRole = 'student';
                console.log('✅ Student session restored:', this.currentStudent.displayName);
                return this.currentStudent;
            } catch (e) {
                console.warn('[Auth] Invalid student session, clearing...');
                this.studentLogout();
            }
        }

        return null;
    },

    /**
     * Student logout
     */
    studentLogout() {
        localStorage.removeItem(this.STUDENT_SESSION_KEY);
        localStorage.removeItem(this.USER_ROLE_KEY);
        this.currentStudent = null;
        this.userRole = null;
        console.log('👋 Student logged out');
    },

    /**
     * Verify student session is still valid
     */
    async verifyStudentSession() {
        if (!this.currentStudent) return false;

        const { data, error } = await SupabaseClient.getClient()
            .from('students')
            .select('id, display_name, classroom_id')
            .eq('session_token', this.currentStudent.sessionToken)
            .maybeSingle();

        if (error || !data) {
            console.warn('[Auth] Student session invalid, logging out...');
            this.studentLogout();
            return false;
        }

        // Update last active
        await SupabaseClient.getClient()
            .from('students')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', data.id);

        return true;
    },

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Check if user is logged in (any type)
     */
    isLoggedIn() {
        return !!(this.currentUser || this.currentStudent);
    },

    /**
     * Check if current user is a teacher
     */
    isTeacher() {
        return this.userRole === 'teacher';
    },

    /**
     * Check if current user is a student
     */
    isStudent() {
        return this.userRole === 'student' || !!this.currentStudent;
    },

    /**
     * Check if current user is an admin
     */
    isAdmin() {
        return this.userRole === 'admin';
    },

    /**
     * Get current user display name
     */
    getDisplayName() {
        if (this.currentStudent) {
            return this.currentStudent.displayName;
        }
        if (this.currentUser) {
            return this.currentUser.user_metadata?.full_name ||
                this.currentUser.user_metadata?.name ||
                this.currentUser.email?.split('@')[0] ||
                'Kullanıcı';
        }
        return 'Misafir';
    },

    /**
     * Get current user avatar
     */
    getAvatarUrl() {
        if (this.currentStudent) {
            // Return emoji or default avatar for students
            return null; // Will use emoji instead
        }
        if (this.currentUser) {
            return this.currentUser.user_metadata?.avatar_url || null;
        }
        return null;
    },

    /**
     * Get user info summary
     */
    getUserInfo() {
        return {
            isLoggedIn: this.isLoggedIn(),
            role: this.userRole,
            displayName: this.getDisplayName(),
            avatarUrl: this.getAvatarUrl(),
            isTeacher: this.isTeacher(),
            isStudent: this.isStudent(),
            isAdmin: this.isAdmin(),
            studentInfo: this.currentStudent,
            userId: this.currentUser?.id || this.currentStudent?.studentId
        };
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.Auth = Auth;
}
