/**
 * Supabase Sync Module for Admin Panel
 * Handles syncing course data to Supabase database.
 *
 * Dependencies:
 * - SupabaseClient (global) for database operations
 */

const SupabaseSync = {
    // Configuration
    config: {
        onStatusUpdate: null, // (message, color) => void
        downloadFallback: null, // (courseKey, courseData) => void - fallback on error
    },

    /**
     * Initialize with configuration
     */
    init(config) {
        this.config = { ...this.config, ...config };
    },

    /**
     * Update status element
     * @private
     */
    updateStatus(message, color) {
        if (this.config.onStatusUpdate) {
            this.config.onStatusUpdate(message, color);
            return;
        }

        // Default behavior - new HTML structure with dot and text
        const statusEl = document.getElementById('autosave-status');
        if (!statusEl) return;

        // Color mapping for dot and background
        const colorMap = {
            green: { dot: 'bg-green-400', bg: 'bg-green-500/20' },
            red: { dot: 'bg-red-400', bg: 'bg-red-500/20' },
            blue: { dot: 'bg-blue-400', bg: 'bg-blue-500/20' },
            yellow: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/20' },
        };

        const colorConfig = colorMap[color] || colorMap.green;

        statusEl.innerHTML = `
            <span class="inline-block w-2 h-2 rounded-full ${colorConfig.dot} ${color === 'yellow' || color === 'blue' ? 'animate-pulse' : ''}"></span>
            <span>${message}</span>
        `;

        // Update background color
        statusEl.className = `flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm ${colorConfig.bg}`;
    },

    /**
     * Create URL-friendly slug from text
     */
    slugify(text) {
        if (!text) return '';
        return text
            .toString()
            .normalize('NFKD')
            .replace(/[\u0300-\u036F]/g, '')
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // ==========================================
    // DATA LOADING (NEW - Supabase-First)
    // ==========================================

    /**
     * Load list of all courses from Supabase
     * @returns {Promise<Array>} Array of course objects with {id, slug, title, ...}
     */
    async loadCourseList() {
        try {
            const courses = await SupabaseClient.getCourses(false); // Include unpublished
            return courses || [];
        } catch (error) {
            console.error('[SupabaseSync] Failed to load course list:', error);
            return [];
        }
    },

    /**
     * Load full course data from Supabase and convert to legacy format
     * @param {string} courseSlug - The course slug (e.g., 'arduino')
     * @returns {Promise<Object|null>} Course data in legacy format or null
     */
    async loadFromSupabase(courseSlug) {
        try {
            this.updateStatus(`📥 ${courseSlug} yükleniyor...`, 'blue');

            // Get course by slug
            const course = await SupabaseClient.getCourseBySlug(courseSlug);
            if (!course) {
                console.warn(`[SupabaseSync] Course not found: ${courseSlug}`);
                return null;
            }

            // Get full course data
            const fullData = await SupabaseClient.getFullCourseData(course.id);

            // Convert to legacy format
            const legacyData = SupabaseClient.convertToLegacyFormat(fullData);

            // Add Supabase IDs to course data for future updates
            legacyData._supabaseId = course.id;
            legacyData._position = course.position !== undefined ? course.position : 999;
            legacyData._phaseIds = {};
            fullData.phases.forEach((phase, idx) => {
                legacyData._phaseIds[idx] = phase.id;
            });
            legacyData._projectIds = {};
            fullData.projects.forEach((proj) => {
                legacyData._projectIds[proj.position] = proj.id;
            });

            this.updateStatus(`✅ ${courseSlug} yüklendi`, 'green');
            return legacyData;
        } catch (error) {
            console.error(`[SupabaseSync] Failed to load ${courseSlug}:`, error);
            this.updateStatus(`❌ ${courseSlug} yüklenemedi`, 'red');
            return null;
        }
    },

    // ==========================================
    // REAL-TIME CRUD OPERATIONS
    // ==========================================

    /**
     * Save or update a single project in Supabase
     * @param {string} courseId - UUID of the course
     * @param {Object} project - Project data in legacy format
     * @param {Object} phaseIdMap - Map of phase index to UUID
     * @returns {Promise<Object|null>} Saved project or null on error
     */
    async saveProjectToSupabase(courseId, project, phaseIdMap) {
        try {
            // Use position-based slug for consistency with syncProjects
            const position = project.id !== undefined ? project.id : 0;
            const slug = `p-${position}`;
            const phaseId = phaseIdMap[project.phase] || Object.values(phaseIdMap)[0];

            if (!phaseId) {
                throw new Error('No valid phase found for project');
            }

            const projectData = {
                course_id: courseId,
                phase_id: phaseId,
                slug: slug,
                title: typeof project.title === 'object' ? project.title.tr : project.title,
                description: typeof project.desc === 'object' ? project.desc.tr : project.desc,
                materials: project.materials || [],
                circuit: project.circuitImage || null,
                code: project.code || null,
                simulation: project.simType || null,
                challenge: typeof project.challenge === 'object' ? project.challenge.tr : project.challenge,
                component_info: {
                    id: project.id,
                    icon: project.icon,
                    phase: project.phase,
                    week: project.week,
                    mainComponent: project.mainComponent,
                    hotspots: project.hotspots,
                    hasGraph: project.hasGraph,
                    hasSim: project.hasSim,
                    mission: project.mission,
                    theory: project.theory,
                    quiz: project.quiz,
                    hiddenTabs: project.hiddenTabs,
                    enableHotspots: project.enableHotspots,
                    showHotspotsInLab: project.showHotspotsInLab,
                    difficulty: project.difficulty,
                    duration: project.duration,
                    tags: project.tags,
                    prerequisites: project.prerequisites,
                    // i18n fields
                    title_en: typeof project.title === 'object' ? project.title.en : null,
                    desc_en: typeof project.desc === 'object' ? project.desc.en : null,
                    mission_en: typeof project.mission === 'object' ? project.mission.en : null,
                    theory_en: typeof project.theory === 'object' ? project.theory.en : null,
                    challenge_en: typeof project.challenge === 'object' ? project.challenge.en : null,
                },
                is_published: false,
                position: project.id || 0,
            };

            const { data, error } = await SupabaseClient.getClient()
                .from('projects')
                .upsert(projectData, { onConflict: 'course_id,slug' })
                .select()
                .single();

            if (error) throw error;


            return data;
        } catch (error) {
            console.error('[SupabaseSync] Failed to save project:', error);
            return null;
        }
    },

    /**
     * Delete a project from Supabase
     * @param {string} projectId - UUID of the project
     * @returns {Promise<boolean>} Success status
     */
    async deleteProjectFromSupabase(projectId) {
        try {
            await SupabaseClient.deleteProject(projectId);

            return true;
        } catch (error) {
            console.error('[SupabaseSync] Failed to delete project:', error);
            return false;
        }
    },

    /**
     * Delete a project from Supabase by courseId and position
     * This is useful when we don't have the UUID but know the course and position
     * @param {string} courseId - UUID of the course
     * @param {number} position - Project position/id
     * @returns {Promise<boolean>} Success status
     */
    async deleteProjectByPosition(courseId, position) {
        try {
            const slug = `p-${position}`;
            const { error } = await SupabaseClient.getClient()
                .from('projects')
                .delete()
                .eq('course_id', courseId)
                .eq('slug', slug);

            if (error) throw error;


            return true;
        } catch (error) {
            console.error('[SupabaseSync] Failed to delete project by position:', error);
            return false;
        }
    },

    /**
     * Save or update a single phase in Supabase
     * @param {string} courseId - UUID of the course
     * @param {Object} phase - Phase data
     * @param {number} position - Phase position/index
     * @returns {Promise<Object|null>} Saved phase or null on error
     */
    async savePhaseToSupabase(courseId, phase, position) {
        try {
            const name = phase.title || `Bölüm ${position}`;

            // Check if phase exists
            const { data: existing } = await SupabaseClient.getClient()
                .from('phases')
                .select('id')
                .eq('course_id', courseId)
                .eq('name', name)
                .maybeSingle();

            let result;
            if (existing) {
                result = await SupabaseClient.updatePhase(existing.id, {
                    description: phase.description,
                    position: position,
                    meta: { color: phase.color, icon: phase.icon },
                });
            } else {
                result = await SupabaseClient.createPhase({
                    course_id: courseId,
                    name: name,
                    description: phase.description || null,
                    position: position,
                    meta: { color: phase.color, icon: phase.icon },
                });
            }


            return result;
        } catch (error) {
            console.error('[SupabaseSync] Failed to save phase:', error);
            return null;
        }
    },

    /**
     * Delete a phase from Supabase
     * @param {string} phaseId - UUID of the phase
     * @returns {Promise<boolean>} Success status
     */
    async deletePhaseFromSupabase(phaseId) {
        try {
            await SupabaseClient.deletePhase(phaseId);

            return true;
        } catch (error) {
            console.error('[SupabaseSync] Failed to delete phase:', error);
            return false;
        }
    },

    /**
     * Save course settings to Supabase
     * @param {string} courseId - UUID of the course
     * @param {Object} settings - Course settings (title, description, icon, customTabNames)
     * @returns {Promise<boolean>} Success status
     */
    async saveCourseSettings(courseId, settings) {
        try {
            await SupabaseClient.updateCourse(courseId, {
                title: settings.title,
                description: settings.description,
                meta: {
                    icon: settings.icon,
                    customTabNames: settings.customTabNames || null,
                },
            });

            return true;
        } catch (error) {
            console.error('[SupabaseSync] Failed to save course settings:', error);
            return false;
        }
    },

    /**
     * Save course data to Supabase
     */
    async saveToSupabase(courseKey, courseData) {
        try {
            this.updateStatus("☁️ Supabase'e kaydediliyor...", 'yellow');

            // 1. Get or create course
            // FIX: Always use the stable courseKey as slug, don't generate from title
            // This prevents creating duplicate courses when title is updated
            const slug = courseKey || this.slugify(courseData.title);



            let course = await SupabaseClient.getCourseBySlug(slug);

            if (!course) {
                const { data, error } = await SupabaseClient.getClient()
                    .from('courses')
                    .insert({
                        slug: slug,
                        title: courseData.title,
                        description: courseData.description || null,
                        meta: { icon: courseData.icon || null },
                        is_published: false,
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                course = { id: data.id };
            }

            const courseId = course.id;

            // 2. Update course metadata
            await SupabaseClient.updateCourse(courseId, {
                title: courseData.title,
                description: courseData.description,
                meta: {
                    icon: courseData.icon,
                    customTabNames: courseData.customTabNames || null,
                },
            });

            // 3. Sync phases
            const phases = courseData.data?.phases || [];
            const phaseIdMap = await this.syncPhases(courseId, phases);

            // 4. Sync projects
            const projects = courseData.data?.projects || [];
            await this.syncProjects(courseId, projects, phaseIdMap);

            // 5. Sync components
            const componentInfo = courseData.data?.componentInfo || {};
            await this.syncComponents(courseId, componentInfo);

            this.updateStatus(`☁️ Supabase'e kaydedildi: ${new Date().toLocaleTimeString()}`, 'green');
            alert("✅ Değişiklikler Supabase'e kaydedildi!");

            return true;
        } catch (error) {
            console.error('Supabase save error:', error);

            // Oturum süresi kontrolü
            if (error.code === '401' || error.status === 401 || error.message?.includes('JWT')) {
                alert('⚠️ Oturum süreniz dolmuş. Lütfen çıkış yapıp tekrar giriş yapın.');
                this.updateStatus('❌ Oturum hatası - Tekrar giriş yapın', 'red');
                return false;
            }

            this.updateStatus(`❌ Kaydetme hatası: ${error.message}`, 'red');

            // Offer fallback download
            if (confirm(`Supabase'e kaydedilemedi: ${error.message}\n\nYerel dosya olarak indirmek ister misiniz?`)) {
                if (this.config.downloadFallback) {
                    this.config.downloadFallback(courseKey, courseData);
                }
            }

            return false;
        }
    },

    /**
     * Sync phases to Supabase
     * @returns {Object} Map of phase index to UUID
     */
    async syncPhases(courseId, phases) {
        const phaseIdMap = {};

        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            const name = phase.title || `Bölüm ${i}`;

            // Try to find existing phase
            const { data: existing } = await SupabaseClient.getClient()
                .from('phases')
                .select('id')
                .eq('course_id', courseId)
                .eq('name', name)
                .maybeSingle();

            if (existing) {
                // Update existing
                await SupabaseClient.updatePhase(existing.id, {
                    description: phase.description,
                    position: i,
                    meta: { color: phase.color, icon: phase.icon },
                });
                phaseIdMap[i] = existing.id;
            } else {
                // Create new
                const newPhase = await SupabaseClient.createPhase({
                    course_id: courseId,
                    name: name,
                    description: phase.description || null,
                    position: i,
                    meta: { color: phase.color, icon: phase.icon },
                });
                phaseIdMap[i] = newPhase.id;
            }
        }

        return phaseIdMap;
    },

    /**
     * Sync projects to Supabase
     */
    async syncProjects(courseId, projects, phaseIdMap) {
        for (const proj of projects) {
            // CRITICAL FIX: Use position-based slug instead of title-based
            // This prevents duplicate records when title changes
            // Format: p-{position} - stable and unique per course
            const position = proj.id !== undefined ? proj.id : projects.indexOf(proj);
            const slug = `p-${position}`;
            const phaseId = phaseIdMap[proj.phase] || Object.values(phaseIdMap)[0];

            if (!phaseId) {
                console.warn(`Phase not found for project ${proj.title}, skipping...`);
                continue;
            }

            const projectData = {
                course_id: courseId,
                phase_id: phaseId,
                slug: slug,
                title: typeof proj.title === 'object' ? proj.title.tr : proj.title,
                description: typeof proj.desc === 'object' ? proj.desc.tr : proj.desc,
                materials: proj.materials || [],
                circuit: proj.circuitImage || proj.circuit_desc || null,
                code: proj.code || null,
                simulation: proj.simType || null,
                challenge: typeof proj.challenge === 'object' ? proj.challenge.tr : proj.challenge,
                component_info: {
                    id: proj.id,
                    icon: proj.icon,
                    phase: proj.phase,
                    mainComponent: proj.mainComponent,
                    hotspots: proj.hotspots,
                    hasGraph: proj.hasGraph,
                    hasSim: proj.hasSim,
                    mission: proj.mission,
                    theory: proj.theory,
                    quiz: proj.quiz,
                    hiddenTabs: proj.hiddenTabs,
                    enableHotspots: proj.enableHotspots,
                    showHotspotsInLab: proj.showHotspotsInLab,
                    difficulty: proj.difficulty,
                    duration: proj.duration,
                    tags: proj.tags,
                    prerequisites: proj.prerequisites,
                },
                is_published: false,
                position: proj.id || 0,
            };

            // Upsert project
            const { error } = await SupabaseClient.getClient()
                .from('projects')
                .upsert(projectData, { onConflict: 'course_id,slug' });

            if (error) {
                console.error(`Error saving project ${proj.title}:`, error);
            }
        }
    },

    /**
     * Sync components to Supabase
     */
    async syncComponents(courseId, componentInfo) {
        for (const [key, data] of Object.entries(componentInfo)) {
            await SupabaseClient.upsertComponent({
                course_id: courseId,
                key: key,
                data: data,
            });
        }
    },
};

window.SupabaseSync = SupabaseSync;
