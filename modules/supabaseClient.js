/**
 * Supabase Client Module
 * Merkezi Supabase bağlantı yönetimi
 */

// Supabase CDN'den yüklenir (admin.html ve index2.html'de script tag ile)
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SupabaseClient = {
    // Supabase credentials (public - anon key)
    SUPABASE_URL: 'https://zuezvfojutlefdvqrica.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZXp2Zm9qdXRsZWZkdnFyaWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTI1OTksImV4cCI6MjA4MjQ4ODU5OX0.dyv-C23_w6B3spF-FgB0Gp3hwA82aJdDbUlBOnGFxW8',

    client: null,
    currentUser: null,
    isAdmin: false,

    /**
     * Initialize Supabase client
     */
    init() {
        if (typeof supabase === 'undefined') {
            console.error('Supabase SDK yüklenmedi! Script tag ekleyin.');
            return false;
        }

        this.client = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY);
        return true;
    },

    /**
     * Get Supabase client instance
     */
    getClient() {
        if (!this.client) {
            this.init();
        }
        return this.client;
    },

    // ==========================================
    // AUTH METHODS
    // ==========================================

    /**
     * Sign in with email/password
     */
    async signIn(email, password) {
        const { data, error } = await this.getClient().auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        this.currentUser = data.user;
        await this.checkAdminStatus();

        return data;
    },

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await this.getClient().auth.signOut();
        if (error) throw error;

        this.currentUser = null;
        this.isAdmin = false;
    },

    /**
     * Get current session
     */
    async getSession() {
        const { data: { session } } = await this.getClient().auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.checkAdminStatus();
        }
        return session;
    },

    /**
     * Check if current user is admin
     */
    async checkAdminStatus() {
        if (!this.currentUser) {
            this.isAdmin = false;
            return false;
        }

        const { data, error } = await this.getClient()
            .from('content_admins')
            .select('id')
            .eq('user_id', this.currentUser.id)
            .maybeSingle();

        this.isAdmin = !error && data !== null;
        return this.isAdmin;
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback) {
        return this.getClient().auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            callback(event, session);
        });
    },

    // ==========================================
    // COURSES METHODS
    // ==========================================

    /**
     * Get all courses
     */
    async getCourses(publishedOnly = false) {
        let query = this.getClient()
            .from('courses')
            .select('*')
            .order('created_at', { ascending: true });

        if (publishedOnly) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    /**
     * Get course by slug
     */
    async getCourseBySlug(slug) {
        const { data, error } = await this.getClient()
            .from('courses')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    /**
     * Get full course data (with phases, projects, components)
     */
    async getFullCourseData(courseId) {
        // Get course
        const { data: course, error: courseError } = await this.getClient()
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (courseError) throw courseError;

        // Get phases
        const { data: phases, error: phasesError } = await this.getClient()
            .from('phases')
            .select('*')
            .eq('course_id', courseId)
            .order('position');

        if (phasesError) throw phasesError;

        // Get projects
        const { data: projects, error: projectsError } = await this.getClient()
            .from('projects')
            .select('*')
            .eq('course_id', courseId)
            .order('position');

        if (projectsError) throw projectsError;

        // Get components
        const { data: components, error: componentsError } = await this.getClient()
            .from('course_components')
            .select('*')
            .eq('course_id', courseId);

        if (componentsError) throw componentsError;

        return { course, phases, projects, components };
    },

    /**
     * Update course
     */
    async updateCourse(courseId, updates) {
        const { data, error } = await this.getClient()
            .from('courses')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', courseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ==========================================
    // PHASES METHODS
    // ==========================================

    /**
     * Get phases for course
     */
    async getPhases(courseId) {
        const { data, error } = await this.getClient()
            .from('phases')
            .select('*')
            .eq('course_id', courseId)
            .order('position');

        if (error) throw error;
        return data;
    },

    /**
     * Create phase
     */
    async createPhase(phase) {
        const { data, error } = await this.getClient()
            .from('phases')
            .insert(phase)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update phase
     */
    async updatePhase(phaseId, updates) {
        const { data, error } = await this.getClient()
            .from('phases')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', phaseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete phase
     */
    async deletePhase(phaseId) {
        const { error } = await this.getClient()
            .from('phases')
            .delete()
            .eq('id', phaseId);

        if (error) throw error;
    },

    // ==========================================
    // PROJECTS METHODS
    // ==========================================

    /**
     * Get projects for course
     */
    async getProjects(courseId) {
        const { data, error } = await this.getClient()
            .from('projects')
            .select('*')
            .eq('course_id', courseId)
            .order('position');

        if (error) throw error;
        return data;
    },

    /**
     * Create project
     */
    async createProject(project) {
        const { data, error } = await this.getClient()
            .from('projects')
            .insert(project)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update project
     */
    async updateProject(projectId, updates) {
        const { data, error } = await this.getClient()
            .from('projects')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', projectId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete project
     */
    async deleteProject(projectId) {
        const { error } = await this.getClient()
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;
    },

    // ==========================================
    // COMPONENTS METHODS
    // ==========================================

    /**
     * Get components for course
     */
    async getComponents(courseId) {
        const { data, error } = await this.getClient()
            .from('course_components')
            .select('*')
            .eq('course_id', courseId);

        if (error) throw error;
        return data;
    },

    /**
     * Upsert component
     */
    async upsertComponent(component) {
        const { data, error } = await this.getClient()
            .from('course_components')
            .upsert(component, { onConflict: 'course_id,key' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete component
     */
    async deleteComponent(courseId, key) {
        const { error } = await this.getClient()
            .from('course_components')
            .delete()
            .eq('course_id', courseId)
            .eq('key', key);

        if (error) throw error;
    },

    // ==========================================
    // STORAGE METHODS (Hybrid Image Management)
    // ==========================================

    // GitHub Pages base URL
    GITHUB_PAGES_URL: 'https://nsyasa.github.io/-Yeti-LAB/',

    /**
     * Upload image to Supabase Storage
     * @param {File} file - The file to upload
     * @param {string} folder - Optional folder name (default: 'uploads')
     * @returns {Promise<string>} Public URL of uploaded file
     */
    async uploadImage(file, folder = 'uploads') {
        const fileName = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

        const { data, error } = await this.getClient()
            .storage
            .from('images')  // bucket name
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = this.getClient()
            .storage
            .from('images')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    },

    /**
     * Delete image from Supabase Storage
     * @param {string} path - The file path to delete
     */
    async deleteImage(path) {
        const { error } = await this.getClient()
            .storage
            .from('images')
            .remove([path]);

        if (error) throw error;
    },

    /**
     * Smart Image URL Resolver
     * Handles: local files, Supabase storage, external URLs
     * @param {string} imagePath - The image path/URL
     * @returns {string} Resolved full URL
     */
    resolveImageUrl(imagePath) {
        if (!imagePath) return '';

        // Already a full URL (http/https)
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Supabase storage path (starts with 'supabase:' or contains supabase domain)
        if (imagePath.startsWith('supabase:')) {
            const path = imagePath.replace('supabase:', '');
            const { data } = this.getClient()
                .storage
                .from('images')
                .getPublicUrl(path);
            return data.publicUrl;
        }

        // Local file - serve from GitHub Pages
        // Remove leading 'img/' if present to avoid duplication
        const cleanPath = imagePath.startsWith('img/') ? imagePath : `img/${imagePath}`;
        return `${this.GITHUB_PAGES_URL}${cleanPath}`;
    },

    /**
     * Check if image source is from Supabase
     * @param {string} url - The URL to check
     * @returns {boolean}
     */
    isSupabaseImage(url) {
        return url && url.includes('supabase.co/storage');
    },

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Convert Supabase data to legacy format (for backward compatibility)
     */
    convertToLegacyFormat(courseData) {
        const { course, phases, projects, components } = courseData;

        // Convert components to object format
        const componentInfo = {};
        components.forEach(comp => {
            componentInfo[comp.key] = comp.data;
        });

        // Convert phases to array format with color/title
        const phasesArray = phases.map((phase, idx) => ({
            color: phase.meta?.color || 'blue',
            title: phase.name,
            description: phase.description || ''
        }));

        // Create phase ID to index mapping
        const phaseIdToIndex = {};
        phases.forEach((phase, idx) => {
            phaseIdToIndex[phase.id] = idx;
        });

        // Convert projects to legacy format
        const projectsArray = projects.map(proj => ({
            id: proj.position,
            phase: phaseIdToIndex[proj.phase_id] || 0,
            title: proj.title,
            icon: proj.component_info?.icon || '📚',
            desc: proj.description,
            hasGraph: proj.component_info?.hasGraph || false,
            hasSim: !!proj.simulation,
            simType: proj.simulation,
            mission: proj.component_info?.mission || '',
            theory: proj.component_info?.theory || '',
            materials: proj.materials || [],
            mainComponent: proj.component_info?.mainComponent || null,
            circuit_desc: proj.circuit,
            code: proj.code,
            challenge: proj.challenge,
            circuitImage: proj.circuit,
            hotspots: proj.component_info?.hotspots || null,
            quiz: proj.component_info?.quiz || []
        }));

        return {
            title: course.title,
            description: course.description,
            icon: course.meta?.icon || '📚',
            data: {
                componentInfo,
                phases: phasesArray,
                projects: projectsArray
            }
        };
    },

    /**
     * Convert legacy format to Supabase format
     */
    convertFromLegacyFormat(legacyData, courseId, phaseIds) {
        // This will be used when saving from admin panel
        // Implementation depends on specific needs
        return legacyData;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.SupabaseClient = SupabaseClient;
}
