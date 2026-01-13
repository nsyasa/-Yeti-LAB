/**
 * Supabase Client Module
 * Merkezi Supabase bağlantı yönetimi
 *
 * Environment Variables (Vite):
 * - VITE_SUPABASE_URL: Supabase proje URL'si
 * - VITE_SUPABASE_ANON_KEY: Public anon key (RLS ile güvenli)
 */

import { createClient } from '@supabase/supabase-js';

// Default credentials (public - anon key)
// Bu değerler production'da kullanılır
// Vite build zamanında .env dosyasından override edilebilir
// Vite build sırasında .env'den al, fallback olarak default kullan
// Environment variables checking with fallback values
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zuezvfojutlefdvqrica.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZXp2Zm9qdXRsZWZkdnFyaWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTI1OTksImV4cCI6MjA4MjQ4ODU5OX0.dyv-C23_w6B3spF-FgB0Gp3hwA82aJdDbUlBOnGFxW8';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('🚨 Supabase environment variables are missing! Using fallback values.');
    console.warn('Yeti LAB: .env dosyası oluşturup VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY tanımlamanız önerilir.');
}

// NOT: Environment variables desteği için Vite build pipeline'ı gereklidir
// Şu an klasik <script> tag'leri kullanıldığı için doğrudan değerler kullanılıyor
// Gelecekte ES modules'a geçildiğinde import.meta.env kullanılabilir

const SupabaseClient = {
    // Supabase credentials
    // Fallback değerler kullanılıyor, Vite build sırasında .env'den override edilebilir
    SUPABASE_URL: DEFAULT_SUPABASE_URL,
    SUPABASE_ANON_KEY: DEFAULT_SUPABASE_ANON_KEY,

    client: null,
    currentUser: null,
    isAdmin: false,

    /**
     * Initialize Supabase client (Singleton Pattern)
     * Birden fazla çağrılsa bile sadece bir kez client oluşturur
     */
    init() {
        // Singleton: Zaten init edilmişse tekrar oluşturma
        if (this.client) {
            return true;
        }

        try {
            // Create client with auth options to prevent AbortError
            // FIX: Add custom fetch with extended timeout for large data operations
            const customFetch = (url, options = {}) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes

                return fetch(url, {
                    ...options,
                    signal: controller.signal,
                }).finally(() => clearTimeout(timeoutId));
            };

            this.client = createClient(this.SUPABASE_URL, this.SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                    flowType: 'pkce',
                    // Retry setting for unstable connections
                    retryAttempts: 3,
                },
                global: {
                    headers: {
                        'x-client-info': 'yeti-lab-web',
                    },
                    fetch: customFetch, // Use custom fetch with extended timeout
                },
            });
            console.log('[SupabaseClient] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[SupabaseClient] Init error:', error);
            return false;
        }
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
        try {
            const { data, error } = await this.getClient().auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            this.currentUser = data.user;
            await this.checkAdminStatus();

            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.signIn');
            }
            throw error;
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        try {
            const { error } = await this.getClient().auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.isAdmin = false;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.signOut');
            }
            throw error;
        }
    },

    /**
     * Get current session
     */
    async getSession() {
        try {
            const client = this.getClient();
            if (!client) return null;

            const {
                data: { session },
                error,
            } = await client.auth.getSession();

            if (error) throw error;

            if (session) {
                this.currentUser = session.user;
                await this.checkAdminStatus();
            }
            return session;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.getSession');
            }
            // Silent fail for session check to avoid spamming on load
            return null;
        }
    },

    /**
     * Check if current user is admin
     */
    async checkAdminStatus() {
        try {
            if (!this.currentUser) {
                this.isAdmin = false;
                return false;
            }

            const client = this.getClient();
            if (!client) return false;

            const { data, error } = await client
                .from('content_admins')
                .select('id')
                .eq('user_id', this.currentUser.id)
                .maybeSingle();

            if (error) throw error;

            this.isAdmin = data !== null;
            return this.isAdmin;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.checkAdminStatus');
            }
            this.isAdmin = false;
            return false;
        }
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback) {
        const client = this.getClient();
        if (!client) {
            console.warn('[SupabaseClient] Auth not available - skipping onAuthStateChange');
            return { data: { subscription: { unsubscribe: () => {} } } };
        }

        return client.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            callback(event, session);
        });
    },

    // ==========================================
    // COURSES METHODS
    // ==========================================

    /**
     * Get all courses
     * @param {boolean} publishedOnly - Only return published courses
     * @param {boolean} forceRefresh - Bypass cache and fetch fresh data
     */
    /**
     * Get all courses
     * @param {boolean} publishedOnly - Only return published courses
     * @param {boolean} forceRefresh - Bypass cache and fetch fresh data
     */
    async getCourses(publishedOnly = false, forceRefresh = false) {
        const cacheKey = `courses_${publishedOnly}`;

        // Use Cache module if available
        if (typeof Cache !== 'undefined' && !forceRefresh) {
            return Cache.getOrFetch(
                cacheKey,
                async () => {
                    return this._fetchCourses(publishedOnly);
                },
                Cache.DEFAULT_TTL
            );
        }

        // Fallback: direct fetch
        return this._fetchCourses(publishedOnly);
    },

    /**
     * Internal method to fetch courses from database
     * @private
     */
    async _fetchCourses(publishedOnly = false) {
        try {
            let query = this.getClient().from('courses').select('*').order('position', { ascending: true });

            if (publishedOnly) {
                query = query.eq('is_published', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.getCourses');
            }
            throw error;
        }
    },

    /**
     * Get course by slug
     * @param {string} slug - Course slug
     * @param {boolean} forceRefresh - Bypass cache
     */
    async getCourseBySlug(slug, forceRefresh = false) {
        const cacheKey = `course_${slug}`;

        // Use Cache module if available
        if (typeof Cache !== 'undefined' && !forceRefresh) {
            return Cache.getOrFetch(
                cacheKey,
                async () => {
                    return this._fetchCourseBySlug(slug);
                },
                Cache.DEFAULT_TTL
            );
        }

        return this._fetchCourseBySlug(slug);
    },

    /**
     * Internal method to fetch course by slug
     * @private
     */
    async _fetchCourseBySlug(slug) {
        try {
            const { data, error } = await this.getClient().from('courses').select('*').eq('slug', slug).maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.getCourseBySlug');
            }
            throw error;
        }
    },

    /**
     * Get full course data (with phases, projects, components)
     */
    async getFullCourseData(courseId) {
        try {
            const client = this.getClient();

            // Execute all queries in parallel
            const [courseResult, phasesResult, projectsResult, componentsResult] = await Promise.all([
                client.from('courses').select('*').eq('id', courseId).single(),
                client.from('phases').select('*').eq('course_id', courseId).order('position'),
                client.from('projects').select('*').eq('course_id', courseId).order('position'),
                client.from('course_components').select('*').eq('course_id', courseId),
            ]);

            // Check for errors
            if (courseResult.error) throw courseResult.error;
            if (phasesResult.error) throw phasesResult.error;
            if (projectsResult.error) throw projectsResult.error;
            if (componentsResult.error) throw componentsResult.error;

            return {
                course: courseResult.data,
                phases: phasesResult.data,
                projects: projectsResult.data,
                components: componentsResult.data,
            };
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.getFullCourseData');
            }
            throw error;
        }
    },

    /**
     * Update course
     */
    async updateCourse(courseId, updates) {
        try {
            const { data, error } = await this.getClient()
                .from('courses')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', courseId)
                .select();

            if (error) throw error;
            return data?.[0] || null;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.updateCourse');
            }
            throw error;
        }
    },

    /**
     * Update course by slug
     */
    async updateCourseBySlug(slug, updates) {
        return await this.client.from('courses').update(updates).eq('slug', slug);
    },

    // ==========================================
    // PHASES METHODS
    // ==========================================

    /**
     * Get phases for course
     */
    async getPhases(courseId) {
        try {
            const { data, error } = await this.getClient()
                .from('phases')
                .select('*')
                .eq('course_id', courseId)
                .order('position');

            if (error) throw error;
            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.getPhases');
            }
            throw error;
        }
    },

    /**
     * Create phase
     */
    async createPhase(phase) {
        try {
            const { data, error } = await this.getClient().from('phases').insert(phase).select().single();

            if (error) throw error;
            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.createPhase');
            }
            throw error;
        }
    },

    /**
     * Update phase
     */
    async updatePhase(phaseId, updates) {
        try {
            const { data, error } = await this.getClient()
                .from('phases')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', phaseId)
                .select();

            if (error) throw error;
            return data?.[0] || null;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.updatePhase');
            }
            throw error;
        }
    },

    /**
     * Delete phase
     */
    async deletePhase(phaseId) {
        try {
            const { error } = await this.getClient().from('phases').delete().eq('id', phaseId);

            if (error) throw error;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.deletePhase');
            }
            throw error;
        }
    },

    // ==========================================
    // PROJECTS METHODS
    // ==========================================

    /**
     * Get projects for course
     */
    async getProjects(courseId) {
        try {
            const { data, error } = await this.getClient()
                .from('projects')
                .select('*')
                .eq('course_id', courseId)
                .order('position');

            if (error) throw error;
            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.getProjects');
            }
            throw error;
        }
    },

    /**
     * Create project
     */
    async createProject(project) {
        try {
            const { data, error } = await this.getClient().from('projects').insert(project).select().single();

            if (error) throw error;
            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.createProject');
            }
            throw error;
        }
    },

    /**
     * Update project
     */
    async updateProject(projectId, updates) {
        try {
            const { data, error } = await this.getClient()
                .from('projects')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', projectId)
                .select();

            if (error) throw error;
            return data?.[0] || null;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.updateProject');
            }
            throw error;
        }
    },

    /**
     * Delete project
     */
    async deleteProject(projectId) {
        try {
            const { error } = await this.getClient().from('projects').delete().eq('id', projectId);

            if (error) throw error;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.deleteProject');
            }
            throw error;
        }
    },

    // ==========================================
    // COMPONENTS METHODS
    // ==========================================

    /**
     * Get components for course
     */
    async getComponents(courseId) {
        try {
            const { data, error } = await this.getClient()
                .from('course_components')
                .select('*')
                .eq('course_id', courseId);

            if (error) throw error;
            return data;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.getComponents');
            }
            throw error;
        }
    },

    /**
     * Upsert component
     */
    async upsertComponent(component) {
        try {
            const { data, error } = await this.getClient()
                .from('course_components')
                .upsert(component, { onConflict: 'course_id,key' })
                .select();

            if (error) throw error;
            return data?.[0] || null;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.upsertComponent');
            }
            throw error;
        }
    },

    /**
     * Delete component
     */
    async deleteComponent(courseId, key) {
        try {
            const { error } = await this.getClient()
                .from('course_components')
                .delete()
                .eq('course_id', courseId)
                .eq('key', key);

            if (error) throw error;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.deleteComponent');
            }
            throw error;
        }
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
        try {
            const fileName = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

            const { data, error } = await this.getClient()
                .storage.from('images') // bucket name
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = this.getClient().storage.from('images').getPublicUrl(data.path);

            return urlData.publicUrl;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.uploadImage');
            }
            throw error;
        }
    },

    /**
     * Delete image from Supabase Storage
     * @param {string} path - The file path to delete
     */
    async deleteImage(path) {
        try {
            const { error } = await this.getClient().storage.from('images').remove([path]);

            if (error) throw error;
        } catch (error) {
            if (typeof API !== 'undefined' && API.logError) {
                API.logError(error, 'SupabaseClient.deleteImage');
            }
            throw error;
        }
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
            const { data } = this.getClient().storage.from('images').getPublicUrl(path);
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
        components.forEach((comp) => {
            componentInfo[comp.key] = comp.data;
        });

        // Convert phases to array format with color/title
        const phasesArray = phases.map((phase) => ({
            color: phase.meta?.color || 'blue',
            title: phase.name,
            description: phase.description || '',
        }));

        // Create phase ID to index mapping
        const phaseIdToIndex = {};
        phases.forEach((phase, idx) => {
            phaseIdToIndex[phase.id] = idx;
        });

        // Convert projects to legacy format
        const projectsArray = projects.map((proj) => ({
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
            quiz: proj.component_info?.quiz || [],
            hiddenTabs: proj.component_info?.hiddenTabs || [], // FIX: Map hiddenTabs for visibility settings
            youtubeUrl: proj.youtube_url || null, // FIX: Map Supabase youtube_url to legacy youtubeUrl
        }));

        return {
            _supabaseId: course.id,
            title: course.title,
            description: course.description,
            icon: course.meta?.icon || '📚',
            customTabNames: course.meta?.customTabNames || {},
            data: {
                componentInfo,
                phases: phasesArray,
                projects: projectsArray,
            },
        };
    },

    /**
     * Convert legacy format to Supabase format
     */
    convertFromLegacyFormat(legacyData, courseId, phaseIds) {
        // This will be used when saving from admin panel
        // Implementation depends on specific needs
        return legacyData;
    },
};

// Make available globally
if (typeof window !== 'undefined') {
    window.SupabaseClient = SupabaseClient;
}

// ES Module exports for Vite/Rollup bundling
// NOT: supabase client'ı doğrudan export etmek yerine getter fonksiyonu kullanılmalı
// çünkü modül yüklendiğinde supabase CDN henüz yüklenmemiş olabilir
export const getSupabaseClient = () => SupabaseClient.getClient();
export default SupabaseClient;
