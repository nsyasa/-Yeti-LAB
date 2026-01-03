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

        // Default behavior
        const statusEl = document.getElementById('autosave-status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.classList.remove('text-green-400', 'text-red-400', 'text-blue-400', 'text-yellow-400');
        if (color) statusEl.classList.add(`text-${color}-400`);
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

    /**
     * Save course data to Supabase
     */
    async saveToSupabase(courseKey, courseData) {
        try {
            this.updateStatus("☁️ Supabase'e kaydediliyor...", 'yellow');

            // 1. Get or create course
            const slug = this.slugify(courseData.title || courseKey);
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
                meta: { icon: courseData.icon },
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
            const slug =
                this.slugify(typeof proj.title === 'object' ? proj.title.tr : proj.title) || `project-${proj.id}`;
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
