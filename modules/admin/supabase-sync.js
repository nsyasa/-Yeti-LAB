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

    // Save lock to prevent concurrent saves
    _isSaving: false,
    _pendingSave: null, // { courseKey, courseData } - queued save request

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
        const trMap = {
            ç: 'c',
            Ç: 'c',
            ğ: 'g',
            Ğ: 'g',
            ş: 's',
            Ş: 's',
            ü: 'u',
            Ü: 'u',
            ı: 'i',
            İ: 'i',
            ö: 'o',
            Ö: 'o',
        };
        return text
            .toString()
            .replace(/[çÇğĞşŞüÜıİöÖ]/g, (c) => trMap[c] || c)
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

            // Try to get phase ID from map, or use first available phase
            let phaseId = phaseIdMap[project.phase] || Object.values(phaseIdMap)[0];

            // If no phase ID found, fetch phases from database
            if (!phaseId) {
                console.warn('[SupabaseSync] No phase ID in map, fetching from database...');
                try {
                    const { data: phases, error } = await SupabaseClient.getClient()
                        .from('phases')
                        .select('id')
                        .eq('course_id', courseId)
                        .order('position', { ascending: true })
                        .limit(1);

                    if (error) throw error;
                    if (phases && phases.length > 0) {
                        phaseId = phases[0].id;
                        console.log('[SupabaseSync] Using first phase from database:', phaseId);
                    }
                } catch (dbError) {
                    console.error('[SupabaseSync] Failed to fetch phases:', dbError);
                }
            }

            if (!phaseId) {
                throw new Error(
                    'No valid phase found for project. Please ensure the course has at least one phase defined.'
                );
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
                youtube_url: project.youtubeUrl || null,
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

            // Debug: Log what we're sending
            console.log(`[SupabaseSync] Saving project ${slug}:`, projectData.title);

            const { data, error } = await SupabaseClient.getClient()
                .from('projects')
                .upsert(projectData, { onConflict: 'course_id,slug' })
                .select();

            // Debug: Log response
            console.log(`[SupabaseSync] Project ${slug} response:`, data?.[0]?.id || 'no data', error || 'success');

            if (error) throw error;

            return data?.[0] || null;
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
     * With lock mechanism to prevent concurrent saves
     */
    async saveToSupabase(courseKey, courseData) {
        console.log('[SupabaseSync] saveToSupabase called:', courseKey);

        // DEADLOCK FIX: Check if lock is stuck (held > 15s)
        const LOCK_TIMEOUT = 15000;
        const now = Date.now();
        if (this._isSaving && this._lockTimestamp && now - this._lockTimestamp > LOCK_TIMEOUT) {
            console.warn('[SupabaseSync] Lock stuck for >15s. Forcing reset.');
            this._isSaving = false;
        }

        // If already saving, queue this request
        if (this._isSaving) {
            console.log('[SupabaseSync] Save already in progress, queuing...');
            this._pendingSave = { courseKey, courseData };
            this.updateStatus('⏳ Sırada bekliyor...', 'yellow');
            return false;
        }

        // Set save lock
        this._isSaving = true;
        this._lockTimestamp = Date.now();

        // Create a timeout promise to race against the actual operation
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error('İstek zaman aşımına uğradı (60sn). İnternet bağlantınızı kontrol edin.')),
                60000
            )
        );

        // The actual save logic wrapped in a function
        const performSave = async () => {
            // 1. Get or create course
            // FIX: Always use the stable courseKey as slug, don't generate from title
            // This prevents creating duplicate courses when title is updated
            const slug = courseKey || this.slugify(courseData.title);
            console.log('[SupabaseSync] Step 1: Getting course by slug:', slug);

            let course = await SupabaseClient.getCourseBySlug(slug);
            console.log('[SupabaseSync] Step 1 complete: course =', course?.id || 'new');

            if (!course) {
                console.log('[SupabaseSync] Creating new course...');
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
                console.log('[SupabaseSync] New course created:', course.id);
            }

            const courseId = course.id;

            // 2. Update course metadata
            console.log('[SupabaseSync] Step 2: Updating course metadata...');
            console.log('[SupabaseSync] Step 2 Payload:', {
                title: courseData.title,
                description: courseData.description,
                metaIcon: courseData.icon,
            });

            // DIRECT UPDATE TRIGGER with VERIFICATION
            const { data: updatedData, error: updateError } = await SupabaseClient.getClient()
                .from('courses')
                .update({
                    title: courseData.title,
                    description: courseData.description,
                    meta: {
                        icon: courseData.icon,
                        customTabNames: courseData.customTabNames || null, // FIX: Ensure customTabNames are saved
                    },
                })
                .eq('id', courseId) // Use ID for absolute certainty
                .select(); // <--- CRITICAL: Returns the updated header

            if (updateError) throw updateError;

            // SILENT FAILURE CHECK
            if (!updatedData || updatedData.length === 0) {
                console.error('🚨 CRITICAL: Update returned no data. Possible ID mismatch or RLS issue.');
                console.error('Attempted to update ID:', courseId);
                throw new Error(
                    'Update failed: Course not found or permission denied (RLS). Server returned 0 updated rows.'
                );
            }

            console.log('✅ Supabase Confirmed Update:', updatedData);
            console.log('[SupabaseSync] Step 2 complete');

            // 3. Sync phases
            console.log('[SupabaseSync] Step 3: Syncing phases...');
            const phases = courseData.data?.phases || [];
            const phaseIdMap = await this.syncPhases(courseId, phases);
            console.log('[SupabaseSync] Step 3 complete: phaseIdMap =', phaseIdMap);

            // 4. Sync projects
            console.log('[SupabaseSync] Step 4: Syncing projects...');
            const projects = courseData.data?.projects || [];
            await this.syncProjects(courseId, projects, phaseIdMap);
            console.log('[SupabaseSync] Step 4 complete');

            // 5. Sync components
            console.log('[SupabaseSync] Step 5: Syncing components...');
            const componentInfo = courseData.data?.componentInfo || {};
            await this.syncComponents(courseId, componentInfo);
            console.log('[SupabaseSync] Step 5 complete');

            // 6. Invalidate cache to ensure fresh data on next load
            if (typeof Cache !== 'undefined') {
                // Clear Single Course Cache
                Cache.clear(`course_${slug}`);
                console.log(`[SupabaseSync] Cache invalidated for course_${slug}`);

                // Clear Global Course Lists (All variants to be safe)
                Cache.clear('courses_true');
                Cache.clear('courses_false');
                Cache.clear('courses_list');
                Cache.clear('courses');
                console.log('[SupabaseSync] Global course list cache invalidated.');
            }

            console.log('[SupabaseSync] All steps complete!');
            this.updateStatus(`☁️ Supabase'e kaydedildi: ${new Date().toLocaleTimeString()}`, 'green');
            // alert("✅ Değişiklikler Supabase'e kaydedildi!"); // Kirlilik önlendi

            return true;
        };

        try {
            this.updateStatus("☁️ Supabase'e kaydediliyor...", 'yellow');

            // Race the save operation against the timeout
            await Promise.race([performSave(), timeoutPromise]);
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
        } finally {
            // Release save lock
            this._isSaving = false;

            // Process pending save if any
            if (this._pendingSave) {
                const pending = this._pendingSave;
                this._pendingSave = null;
                console.log('[SupabaseSync] Processing queued save...');
                // Use setTimeout to avoid stack overflow on rapid saves
                setTimeout(() => {
                    this.saveToSupabase(pending.courseKey, pending.courseData);
                }, 100);
            }
        }
    },

    /**
     * Sync phases to Supabase
     * @returns {Object} Map of phase index to UUID
     */
    async syncPhases(courseId, phases) {
        const phaseIdMap = {};

        // Process phases in parallel
        const promises = phases.map(async (phase, i) => {
            // Use existing helper function to save/update phase
            const savedPhase = await this.savePhaseToSupabase(courseId, phase, i);

            if (savedPhase && savedPhase.id) {
                phaseIdMap[i] = savedPhase.id;
            } else {
                console.warn(`[SupabaseSync] Failed to sync phase index ${i}`);
            }
        });

        await Promise.all(promises);
        return phaseIdMap;
    },

    /**
     * Sync projects to Supabase
     */
    async syncProjects(courseId, projects, phaseIdMap) {
        // Process in chunks (batches) to ensure stability and avoid timeouts
        const CHUNK_SIZE = 4;
        const results = [];

        console.log(`[SupabaseSync] Syncing ${projects.length} projects in chunks of ${CHUNK_SIZE}...`);

        for (let i = 0; i < projects.length; i += CHUNK_SIZE) {
            const chunk = projects.slice(i, i + CHUNK_SIZE);

            // Execute chunk in parallel
            const chunkPromises = chunk.map((proj) => this.saveProjectToSupabase(courseId, proj, phaseIdMap));

            // Wait for this chunk to finish
            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);

            // Optional: Update status in console or UI
            if (this.updateStatus) {
                // Kirlilik Önleme: Sadece konsola yaz, UI'ı güncelleme
                // const progress = Math.min(i + CHUNK_SIZE, projects.length);
                // this.updateStatus(`💾 Kaydediliyor... (${progress}/${projects.length})`, 'blue');
                console.log(
                    `[SupabaseSync] Saving progress: ${Math.min(i + CHUNK_SIZE, projects.length)}/${projects.length}`
                );
            }

            // Small delay to release event loop
            if (i + CHUNK_SIZE < projects.length) {
                await new Promise((r) => setTimeout(r, 50));
            }
        }

        // Log results
        const successCount = results.filter((r) => r !== null).length;
        console.log(`[SupabaseSync] Synced ${successCount}/${projects.length} projects`);
    },

    /**
     * Sync components to Supabase
     */
    async syncComponents(courseId, componentInfo) {
        const promises = Object.entries(componentInfo).map(([key, data]) =>
            SupabaseClient.upsertComponent({
                course_id: courseId,
                key: key,
                data: data,
            })
        );
        await Promise.all(promises);
    },
};

window.SupabaseSync = SupabaseSync;
