/* global SupabaseClient */
/**
 * Course Loader Module
 * Handles lazy loading of course data files.
 *
 * Usage:
 *   CourseLoader.loadCourse('arduino')  → Loads arduino.js dynamically
 *   CourseLoader.isLoaded('arduino')    → Check if already loaded
 *   CourseLoader.getManifest()          → Get list of available courses
 */

const CourseLoader = {
    // Track which courses have been loaded
    loadedCourses: new Set(),

    // Course manifest - metadata without full content
    manifest: {
        // Static defaults (will be overwritten/merged with dynamic data)
        arduino: {
            title: 'Arduino Serüveni',
            description: '20 Haftalık Arduino robotik eğitimi',
            icon: '🤖',
            color: '#00979C',
            file: 'data/arduino.js',
        },
        microbit: {
            title: 'Micro:bit Dünyası',
            description: 'BBC Micro:bit ile kodlama',
            icon: '💻',
            color: '#6C63FF',
            file: 'data/microbit.js',
        },
        scratch: {
            title: 'Scratch ile Oyun Yapımı',
            description: 'Blok tabanlı programlama',
            icon: '🎮',
            color: '#FF6F00',
            file: 'data/scratch.js',
        },
        mblock: {
            title: 'mBlock ile Robotik',
            description: 'mBlock tabanlı Arduino programlama',
            icon: '🦾',
            color: '#30B0C7',
            file: 'data/mblock.js',
        },
        appinventor: {
            title: 'App Inventor',
            description: 'Android uygulama geliştirme',
            icon: '📱',
            color: '#7CB342',
            file: 'data/appinventor.js',
        },
    },

    /**
     * Initialize CourseLoader and fetch dynamic course list
     */
    async init() {
        // Initialize SupabaseClient if not already done
        if (typeof SupabaseClient !== 'undefined' && !SupabaseClient.client) {
            SupabaseClient.init();
        }

        // Check again after init attempt
        if (typeof SupabaseClient === 'undefined' || !SupabaseClient.client) {
            console.warn('[CourseLoader] SupabaseClient not available, using static manifest');
            return;
        }

        try {
            console.log('[CourseLoader] Fetching courses from Supabase...');

            // Fetch courses with project count
            const { data: courses, error } = await SupabaseClient.client
                .from('courses')
                .select('*, projects(count)')
                .order('position', { ascending: true, nullsFirst: false });

            if (error) throw error;

            console.log('[CourseLoader] Courses loaded:', courses?.length || 0);

            if (courses && courses.length > 0) {
                // Rebuild manifest based on Supabase order (Master Source)
                const newManifest = {};

                courses.forEach((c) => {
                    const existing = this.manifest[c.slug];
                    // Get count from join relation (projects: [{count: 12}] or similar based on API)
                    // Supabase returns { count: N } or array depending on select mode
                    // With select('*, projects(count)'), projects is [{count: N}] array if 1-many
                    const pCount =
                        c.projects && c.projects[0] && c.projects[0].count
                            ? c.projects[0].count
                            : existing?.projectCount || 10;

                    newManifest[c.slug] = {
                        title: c.title,
                        description: c.description,
                        // Use existing file path if available, otherwise default pattern
                        file: existing ? existing.file : `data/${c.slug}.js`,
                        icon: c.meta?.icon || (existing ? existing.icon : '📚'),
                        color: c.meta?.color || (existing ? existing.color : 'gray'),
                        isDynamic: true,
                        position: c.position !== undefined ? c.position : 999,
                        projectCount: pCount,
                    };
                });

                // Overwrite manifest to reflect Supabase state (including additions/deletions/order)
                this.manifest = newManifest;
            }
        } catch (e) {
            console.error('[CourseLoader] Failed to fetch course list:', e);
        }
    },

    /**
     * Get the manifest (for course selection screen)
     */
    getManifest: () => CourseLoader.manifest,

    /**
     * Check if a course is already loaded
     */
    isLoaded: (key) => CourseLoader.loadedCourses.has(key),

    /**
     * Load a course dynamically with retry
     * Returns a Promise that resolves when the course is loaded
     */
    loadCourse: (key, retryCount = 0) => {
        const MAX_RETRIES = 1;
        const RETRY_DELAY = 1000;

        return new Promise(async (resolve, reject) => {
            // Already loaded?
            if (CourseLoader.isLoaded(key)) {
                resolve(window.courseData[key]);
                return;
            }

            // Performance tracking
            if (window.Performance) window.Performance.mark('load_course_' + key);

            // 1. Try to load from Supabase (Supabase-First Strategy)
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client) {
                try {
                    // Use key directly as slug (most reliable matching with Supabase)
                    // The key (e.g., 'arduino', 'minecraft-edu') should match the DB slug.
                    const slug = key;

                    const course = await SupabaseClient.getCourseBySlug(slug);
                    if (course) {
                        const fullData = await SupabaseClient.getFullCourseData(course.id);
                        if (fullData) {
                            const legacyData = SupabaseClient.convertToLegacyFormat(fullData);
                            window.courseData[key] = legacyData;
                            CourseLoader.loadedCourses.add(key);

                            if (window.Performance)
                                window.Performance.measure('Load Course (Supabase): ' + key, 'load_course_' + key);
                            resolve(legacyData);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn(`[CourseLoader] Supabase load failed for ${key}, falling back to local file.`, e);
                }
            }

            // 2. Fallback to Local Script Loading
            const courseInfo = CourseLoader.manifest[key];
            if (!courseInfo) {
                reject(new Error(`Course not found: ${key}`));
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = courseInfo.file;
            script.async = true;

            script.onload = async () => {
                CourseLoader.loadedCourses.add(key);

                // Initialize course data if missing
                if (!window.courseData[key]) {
                    window.courseData[key] = {
                        title: courseInfo.title,
                        description: courseInfo.description,
                        icon: courseInfo.icon,
                        data: { projects: [], componentInfo: {}, phases: [] },
                    };
                }

                // Try to sync metadata only (if not full load)
                try {
                    if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client) {
                        const slug = key; // Use key here too

                        const { data: course } = await SupabaseClient.client
                            .from('courses')
                            .select('meta')
                            .eq('slug', slug)
                            .maybeSingle();

                        if (course && course.meta && course.meta.customTabNames) {
                            window.courseData[key].customTabNames = course.meta.customTabNames;
                        }
                    }
                } catch (e) {
                    console.warn('[CourseLoader] Supabase meta sync failed:', e);
                }

                if (window.Performance)
                    window.Performance.measure('Load Course (Script): ' + key, 'load_course_' + key);
                resolve(window.courseData[key]);
            };

            script.onerror = () => {
                // Retry logic
                if (retryCount < MAX_RETRIES) {
                    console.warn(`[CourseLoader] Retry ${retryCount + 1}/${MAX_RETRIES} for: ${key}`);
                    script.remove(); // Clean up failed script

                    setTimeout(
                        () => {
                            CourseLoader.loadCourse(key, retryCount + 1)
                                .then(resolve)
                                .catch(reject);
                        },
                        RETRY_DELAY * (retryCount + 1)
                    ); // Exponential backoff
                } else {
                    reject(new Error(`Failed to load course after ${MAX_RETRIES} retries: ${key}`));
                }
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Load ALL courses (useful for Admin panel or pre-caching)
     */
    loadAll: async () => {
        // Initialize dynamic manifest first
        await CourseLoader.init();

        const promises = Object.keys(CourseLoader.manifest).map((key) =>
            CourseLoader.loadCourse(key).catch((err) => {
                console.warn(`[CourseLoader] Warning: Failed to load '${key}'. Skipping.`, err);
                return null; // Resolve with null to satisfy Promise.all
            })
        );
        return Promise.all(promises);
    },

    /**
     * Preload essential data (tips, quiz) - called on init
     */
    preloadEssentials: () => {
        // These are small files, load them upfront
        const essentials = ['data/tips.js', 'data/quiz.js'];
        essentials.forEach((src) => {
            if (!document.querySelector(`script[src="${src}"]`)) {
                const script = document.createElement('script');
                script.src = src;
                document.head.appendChild(script);
            }
        });
    },
};

// Export for global access
window.CourseLoader = CourseLoader;
