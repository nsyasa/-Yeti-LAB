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
    profileData: null,
    isProfileComplete: false,

    // Session storage keys
    STUDENT_SESSION_KEY: 'yeti_student_session',
    USER_ROLE_KEY: 'yeti_user_role',

    /**
     * Initialize auth module
     */
    isInitialized: false,
    initPromise: null,

    /**
     * Initialize auth module
     */
    async init() {
        if (this.isInitialized) return this;
        // If initialization is already in progress, return the existing promise
        if (this.initPromise) return this.initPromise;

        // Create a new initialization promise with timeout
        this.initPromise = (async () => {
            try {
                // Add timeout for session check (10 seconds max)
                const sessionPromise = this.checkSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session check timeout')), 10000)
                );

                try {
                    await Promise.race([sessionPromise, timeoutPromise]);
                } catch (timeoutErr) {
                    console.warn('[Auth] Session check timed out, continuing without session');
                }

                // Check for existing student session
                this.checkStudentSession();

                this.isInitialized = true;
                return this;
            } catch (error) {
                console.error('[Auth] Init error:', error);
                // Even on error, mark as initialized to prevent infinite loading state
                this.isInitialized = true;
                throw error;
            }
        })();

        return this.initPromise;
    },

    /**
     * Wait for initialization to complete
     */
    async waitForInit() {
        if (this.isInitialized) return this;
        if (!this.initPromise) {
            return this.init();
        }
        return this.initPromise;
    },

    // ==========================================
    // TEACHER/ADMIN AUTH (Supabase Auth)
    // ==========================================

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        // Always redirect to index.html after OAuth - role doesn't matter
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        const redirectUrl = baseUrl + '/index.html';

        const { data, error } = await SupabaseClient.getClient().auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
            },
        });

        if (error) throw error;
        return data;
    },

    /**
     * Sign in with GitHub
     */
    async signInWithGitHub() {
        // Always redirect to index.html after OAuth - role doesn't matter
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        const redirectUrl = baseUrl + '/index.html';

        const { data, error } = await SupabaseClient.getClient().auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: redirectUrl,
            },
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
            password,
        });

        if (error) throw error;

        this.currentUser = data.user;

        // Update Store immediately so UI can react
        if (window.Store) {
            window.Store.setUser(this.currentUser);
        }

        await this.loadUserProfile();

        return data;
    },

    /**
     * Sign up with email/password (for teachers)
     */
    async signUpWithEmail(email, password, fullName) {
        // Calculate correct redirect URL dynamically
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
        const redirectUrl = baseUrl + '/auth.html';

        const { data, error } = await SupabaseClient.getClient().auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: redirectUrl,
            },
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
    async checkSession(retries = 3) {
        try {
            const {
                data: { session },
                error,
            } = await SupabaseClient.getClient().auth.getSession();

            // Handle AbortError gracefully - retry if possible
            if (error) {
                if ((error.name === 'AbortError' || error.message?.includes('aborted')) && retries > 0) {
                    console.warn(`[Auth] Session check aborted, retrying... (${retries} attempts left)`);
                    await new Promise((r) => setTimeout(r, 500)); // Wait 500ms
                    return this.checkSession(retries - 1);
                }
                throw error;
            }

            if (session) {
                this.currentUser = session.user;
                if (window.Store) window.Store.setUser(this.currentUser);
                await this.loadUserProfile();
            }

            return session;
        } catch (error) {
            // If all retries failed
            if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                console.warn(
                    '[Auth] Session check failed after retries (network/abort). Continuing without session updates.'
                );
                return null;
            }
            console.error('[Auth] checkSession error:', error);
            // Don't throw for session check, just return null to allow app to load in guest mode
            return null;
        }
    },

    /**
     * Check user role and return detailed status
     * Used by teacher.html for initialization checks
     */
    async checkUserRole() {
        await this.checkSession();
        return {
            success: !!this.currentUser,
            user: this.currentUser,
            role: this.userRole,
        };
    },

    /**
     * Load user profile from database
     */
    async loadUserProfile() {
        if (!this.currentUser) return null;

        const { data } = await SupabaseClient.getClient()
            .from('user_profiles')
            .select('*')
            .eq('id', this.currentUser.id)
            .maybeSingle();

        if (data) {
            this.userRole = data.role;
            this.profileData = data;

            if (window.Store) window.Store.setProfile(data);

            // Check both DB and Metadata for completion status
            // Metadata is now the primary source of truth for new profiles
            if (data.is_profile_complete) {
                this.isProfileComplete = true;
            } else if (this.currentUser.user_metadata?.profile_completed) {
                this.isProfileComplete = true;
            } else {
                this.isProfileComplete = false;
            }

            localStorage.setItem(this.USER_ROLE_KEY, data.role);
        }

        // Fallback to metadata if profile/role missing
        if (!this.userRole && this.currentUser.user_metadata?.role) {
            this.userRole = this.currentUser.user_metadata.role;
            localStorage.setItem(this.USER_ROLE_KEY, this.userRole);
            // If metadata says completed, trust it
            if (this.currentUser.user_metadata.profile_completed) {
                this.isProfileComplete = true;
            }
        }

        return data;
    },

    /**
     * Check if user needs to complete profile
     */
    needsProfileCompletion() {
        return this.currentUser && !this.isProfileComplete;
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback) {
        return SupabaseClient.getClient().auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                if (window.Store) window.Store.setUser(this.currentUser);
                await this.loadUserProfile();
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.userRole = null;
                if (window.Store) {
                    window.Store.setUser(null);
                    window.Store.setProfile(null);
                }
            }

            callback(event, session, this.userRole);
        });
    },

    // ==========================================
    // STUDENT AUTH (Classroom Code + Name)
    // ==========================================

    /**
     * Student login with classroom code, name and password
     * @param {string} classroomCode - 5 character classroom code
     * @param {string} displayName - Student's display name
     * @param {string} password - Student's password
     */
    async studentLogin(classroomCode, displayName, password) {
        // Validate inputs
        if (!classroomCode || classroomCode.length !== 5) {
            throw new Error('Sınıf kodu 5 karakter olmalıdır');
        }

        if (!displayName || displayName.trim().length < 2) {
            throw new Error('İsim en az 2 karakter olmalıdır');
        }

        if (!password || password.length < 3) {
            throw new Error('Şifre en az 3 karakter olmalıdır');
        }

        // Call the student_login_secure function in Supabase
        const { data, error } = await SupabaseClient.getClient().rpc('student_login_secure', {
            p_classroom_code: classroomCode.toUpperCase(),
            p_display_name: displayName.trim(),
            p_password: password,
        });

        if (error) {
            if (error.message.includes('Geçersiz sınıf kodu')) {
                throw new Error('Geçersiz sınıf kodu. Lütfen öğretmeninizden doğru kodu isteyin.');
            }
            if (error.message.includes('bulunamadı')) {
                throw new Error('Öğrenci bulunamadı. Lütfen listeden isminizi seçtiğinizden emin olun.');
            }
            if (error.message.includes('Hatalı şifre')) {
                throw new Error('Hatalı şifre. Lütfen tekrar deneyin.');
            }
            // Generic error
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('Giriş yapılamadı. Beklenmedik bir hata oluştu.');
        }

        const studentData = data[0];

        // Store session in localStorage
        const session = {
            studentId: studentData.out_student_id,
            sessionToken: studentData.out_session_token,
            displayName: displayName.trim(),
            classroomName: studentData.out_classroom_name,
            teacherName: studentData.out_teacher_name,
            loginTime: new Date().toISOString(),
        };

        localStorage.setItem(this.STUDENT_SESSION_KEY, JSON.stringify(session));
        this.currentStudent = session;
        this.userRole = 'student';
        localStorage.setItem(this.USER_ROLE_KEY, 'student');

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
            return (
                this.currentUser.user_metadata?.full_name ||
                this.currentUser.user_metadata?.name ||
                this.currentUser.email?.split('@')[0] ||
                'Kullanıcı'
            );
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
            userId: this.currentUser?.id || this.currentStudent?.studentId,
        };
    },
};

// Make available globally
if (typeof window !== 'undefined') {
    window.Auth = Auth;
}

export default Auth;
