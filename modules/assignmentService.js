/**
 * Yeti LAB - Assignment Service Module
 * Ödev CRUD işlemleri ve Supabase entegrasyonu
 * Faz 3: Teacher Panel Assignment Management
 */

export const AssignmentService = {
    // ==========================================
    // ÖDEV İŞLEMLERİ (CRUD)
    // ==========================================

    /**
     * Öğretmenin ödevlerini listele
     * @param {Object} options - Filtreleme seçenekleri
     * @returns {Promise<Array>} Ödev listesi
     */
    async getAssignments(options = {}) {
        const {
            classroomId = null,
            courseId = null,
            status = null,
            limit = 50,
            offset = 0,
            orderBy = 'created_at',
            orderDirection = 'desc',
        } = options;

        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            let query = supabase
                .from('assignments')
                .select(
                    `
                    *,
                    classroom:classrooms!assignments_classroom_id_fkey(id, name, code),
                    course:courses!assignments_course_id_fkey(id, title, slug),
                    submission_count:submissions(count),
                    rubric:rubrics(*)
                `
                )
                .order(orderBy, { ascending: orderDirection === 'asc' })
                .range(offset, offset + limit - 1);

            // Filtreler
            if (classroomId) {
                query = query.eq('classroom_id', classroomId);
            }
            if (courseId) {
                query = query.eq('course_id', courseId);
            }
            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Submission count'ı düzelt
            return data.map((assignment) => ({
                ...assignment,
                submission_count: assignment.submission_count?.[0]?.count || 0,
            }));
        } catch (error) {
            console.error('[AssignmentService] getAssignments error:', error);
            throw error;
        }
    },

    /**
     * Tekil ödev getir
     * @param {string} assignmentId - Ödev ID
     * @returns {Promise<Object>} Ödev detayları
     */
    async getAssignment(assignmentId) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('assignments')
                .select(
                    `
                    *,
                    classroom:classrooms!assignments_classroom_id_fkey(id, name, code),
                    course:courses!assignments_course_id_fkey(id, title, slug),
                    rubric:rubrics(*),
                    submissions(
                        id, status, grade, submitted_at, graded_at,
                        student:profiles!submissions_student_id_fkey(id, display_name, avatar_url)
                    )
                `
                )
                .eq('id', assignmentId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('[AssignmentService] getAssignment error:', error);
            throw error;
        }
    },

    /**
     * Yeni ödev oluştur
     * @param {Object} assignmentData - Ödev verileri
     * @returns {Promise<Object>} Oluşturulan ödev
     */
    async createAssignment(assignmentData) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Ödev verilerini hazırla
            const assignment = {
                teacher_id: user.id,
                classroom_id: assignmentData.classroom_id || null,
                course_id: assignmentData.course_id || null,
                project_id: assignmentData.project_id || null,
                title: assignmentData.title,
                description: assignmentData.description || '',
                instructions: assignmentData.instructions || '',
                due_date: assignmentData.due_date || null,
                max_points: assignmentData.max_points || 100,
                assignment_type: assignmentData.assignment_type || 'project',
                allow_late_submission: assignmentData.allow_late_submission ?? true,
                late_penalty_percent: assignmentData.late_penalty_percent || 10,
                max_attempts: assignmentData.max_attempts || 1,
                status: assignmentData.status || 'draft',
                settings: assignmentData.settings || {},
            };

            const { data, error } = await supabase.from('assignments').insert(assignment).select().single();

            if (error) throw error;

            // Rubric varsa oluştur
            if (assignmentData.rubric && assignmentData.rubric.length > 0) {
                await this.createRubric(data.id, assignmentData.rubric);
            }

            return data;
        } catch (error) {
            console.error('[AssignmentService] createAssignment error:', error);
            throw error;
        }
    },

    /**
     * Ödev güncelle
     * @param {string} assignmentId - Ödev ID
     * @param {Object} updates - Güncellenecek alanlar
     * @returns {Promise<Object>} Güncellenen ödev
     */
    async updateAssignment(assignmentId, updates) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            // Updated_at otomatik güncellenir (trigger ile)
            const { data, error } = await supabase
                .from('assignments')
                .update(updates)
                .eq('id', assignmentId)
                .select()
                .single();

            if (error) throw error;

            // Rubric güncellemesi varsa
            if (updates.rubric !== undefined) {
                await this.updateRubric(assignmentId, updates.rubric);
            }

            return data;
        } catch (error) {
            console.error('[AssignmentService] updateAssignment error:', error);
            throw error;
        }
    },

    /**
     * Ödev sil (soft delete - status: archived)
     * @param {string} assignmentId - Ödev ID
     * @returns {Promise<boolean>} Başarı durumu
     */
    async deleteAssignment(assignmentId) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            // Soft delete - status'u archived yap
            const { error } = await supabase.from('assignments').update({ status: 'archived' }).eq('id', assignmentId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[AssignmentService] deleteAssignment error:', error);
            throw error;
        }
    },

    /**
     * Ödevi yayınla (draft → active)
     * @param {string} assignmentId - Ödev ID
     * @returns {Promise<Object>} Güncellenen ödev
     */
    async publishAssignment(assignmentId) {
        return this.updateAssignment(assignmentId, {
            status: 'active',
            published_at: new Date().toISOString(),
        });
    },

    /**
     * Ödevi kapat (active → closed)
     * @param {string} assignmentId - Ödev ID
     * @returns {Promise<Object>} Güncellenen ödev
     */
    async closeAssignment(assignmentId) {
        return this.updateAssignment(assignmentId, { status: 'closed' });
    },

    // ==========================================
    // RUBRİK İŞLEMLERİ
    // ==========================================

    /**
     * Rubrik oluştur
     * @param {string} assignmentId - Ödev ID
     * @param {Array} criteria - Rubrik kriterleri
     * @returns {Promise<Array>} Oluşturulan rubrik
     */
    async createRubric(assignmentId, criteria) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const rubrics = criteria.map((criterion, index) => ({
                assignment_id: assignmentId,
                criterion_name: criterion.name,
                criterion_description: criterion.description || '',
                max_points: criterion.max_points || 10,
                position: index + 1,
                levels: criterion.levels || this.getDefaultLevels(criterion.max_points || 10),
            }));

            const { data, error } = await supabase.from('rubrics').insert(rubrics).select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('[AssignmentService] createRubric error:', error);
            throw error;
        }
    },

    /**
     * Rubrik güncelle (sil ve yeniden oluştur)
     * @param {string} assignmentId - Ödev ID
     * @param {Array} criteria - Yeni rubrik kriterleri
     * @returns {Promise<Array>} Güncellenen rubrik
     */
    async updateRubric(assignmentId, criteria) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            // Eski rubriği sil
            await supabase.from('rubrics').delete().eq('assignment_id', assignmentId);

            // Yeni rubrik oluştur (boş değilse)
            if (criteria && criteria.length > 0) {
                return await this.createRubric(assignmentId, criteria);
            }
            return [];
        } catch (error) {
            console.error('[AssignmentService] updateRubric error:', error);
            throw error;
        }
    },

    /**
     * Varsayılan rubrik seviyeleri
     * @param {number} maxPoints - Maksimum puan
     * @returns {Array} Varsayılan seviyeler
     */
    getDefaultLevels(maxPoints) {
        return [
            { name: 'Mükemmel', points: maxPoints, description: 'Tüm kriterleri eksiksiz karşılıyor' },
            { name: 'İyi', points: Math.round(maxPoints * 0.75), description: 'Kriterlerin çoğunu karşılıyor' },
            { name: 'Orta', points: Math.round(maxPoints * 0.5), description: 'Temel kriterleri karşılıyor' },
            { name: 'Geliştirilmeli', points: Math.round(maxPoints * 0.25), description: 'Önemli eksiklikler var' },
            { name: 'Yetersiz', points: 0, description: 'Kriterleri karşılamıyor' },
        ];
    },

    // ==========================================
    // GÖNDERİ İŞLEMLERİ (Teacher tarafı)
    // ==========================================

    /**
     * Ödeve ait gönderileri listele
     * @param {string} assignmentId - Ödev ID
     * @param {Object} options - Filtreleme seçenekleri
     * @returns {Promise<Array>} Gönderi listesi
     */
    async getSubmissions(assignmentId, options = {}) {
        const { status = null, limit = 100 } = options;

        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            let query = supabase
                .from('submissions')
                .select(
                    `
                    *,
                    student:profiles!submissions_student_id_fkey(id, display_name, avatar_url, email),
                    files:submission_files(*)
                `
                )
                .eq('assignment_id', assignmentId)
                .order('submitted_at', { ascending: false })
                .limit(limit);

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('[AssignmentService] getSubmissions error:', error);
            throw error;
        }
    },

    /**
     * Gönderi notlandır
     * @param {string} submissionId - Gönderi ID
     * @param {Object} gradeData - Not verileri
     * @returns {Promise<Object>} Güncellenen gönderi
     */
    async gradeSubmission(submissionId, gradeData) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const updates = {
                grade: gradeData.grade,
                feedback: gradeData.feedback || '',
                rubric_scores: gradeData.rubric_scores || null,
                graded_by: user.id,
                graded_at: new Date().toISOString(),
                status: 'graded',
            };

            const { data, error } = await supabase
                .from('submissions')
                .update(updates)
                .eq('id', submissionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('[AssignmentService] gradeSubmission error:', error);
            throw error;
        }
    },

    /**
     * Gönderiyi revizyon için geri gönder
     * @param {string} submissionId - Gönderi ID
     * @param {string} feedback - Geri bildirim
     * @returns {Promise<Object>} Güncellenen gönderi
     */
    async requestRevision(submissionId, feedback) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('submissions')
                .update({
                    status: 'revision_requested',
                    feedback: feedback,
                })
                .eq('id', submissionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('[AssignmentService] requestRevision error:', error);
            throw error;
        }
    },

    // ==========================================
    // YARDIMCI FONKSİYONLAR
    // ==========================================

    /**
     * Ödevin istatistiklerini hesapla
     * @param {string} assignmentId - Ödev ID
     * @returns {Promise<Object>} İstatistikler
     */
    async getAssignmentStats(assignmentId) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data: submissions, error } = await supabase
                .from('submissions')
                .select('status, grade')
                .eq('assignment_id', assignmentId);

            if (error) throw error;

            const stats = {
                total: submissions.length,
                submitted: submissions.filter((s) => s.status === 'submitted').length,
                graded: submissions.filter((s) => s.status === 'graded').length,
                revision_requested: submissions.filter((s) => s.status === 'revision_requested').length,
                average_grade: 0,
            };

            const gradedSubmissions = submissions.filter((s) => s.grade !== null);
            if (gradedSubmissions.length > 0) {
                stats.average_grade = gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length;
            }

            return stats;
        } catch (error) {
            console.error('[AssignmentService] getAssignmentStats error:', error);
            throw error;
        }
    },

    /**
     * Sınıfa kayıtlı öğrenci sayısını al
     * @param {string} classroomId - Sınıf ID
     * @returns {Promise<number>} Öğrenci sayısı
     */
    async getClassroomStudentCount(classroomId) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const { count, error } = await supabase
                .from('classroom_students')
                .select('*', { count: 'exact', head: true })
                .eq('classroom_id', classroomId);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('[AssignmentService] getClassroomStudentCount error:', error);
            return 0;
        }
    },

    /**
     * Öğretmenin sınıflarını getir (dropdown için)
     * @returns {Promise<Array>} Sınıf listesi
     */
    async getTeacherClassrooms() {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('classrooms')
                .select('id, name, code, is_active')
                .eq('teacher_id', user.id)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[AssignmentService] getTeacherClassrooms error:', error);
            return [];
        }
    },

    /**
     * Kursları getir (dropdown için)
     * @returns {Promise<Array>} Kurs listesi
     */
    async getCourses() {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('courses')
                .select('id, title, slug')
                .eq('is_active', true)
                .order('title');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[AssignmentService] getCourses error:', error);
            return [];
        }
    },

    /**
     * Tarih formatla
     * @param {string} dateStr - ISO tarih string
     * @returns {string} Formatlanmış tarih
     */
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    /**
     * Kalan süreyi hesapla
     * @param {string} dueDate - Son teslim tarihi
     * @returns {Object} Kalan süre bilgisi
     */
    getTimeRemaining(dueDate) {
        if (!dueDate) return { text: 'Süresiz', isOverdue: false, isUrgent: false };

        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;

        if (diff < 0) {
            return { text: 'Süresi doldu', isOverdue: true, isUrgent: false };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 7) {
            return { text: `${days} gün`, isOverdue: false, isUrgent: false };
        } else if (days > 0) {
            return { text: `${days} gün ${hours} saat`, isOverdue: false, isUrgent: days <= 2 };
        } else {
            return { text: `${hours} saat`, isOverdue: false, isUrgent: true };
        }
    },

    /**
     * Status badge HTML'i
     * @param {string} status - Ödev durumu
     * @returns {string} Badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            draft: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">📝 Taslak</span>',
            active: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✅ Aktif</span>',
            closed: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">🔒 Kapalı</span>',
            archived:
                '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">🗄️ Arşiv</span>',
        };
        return badges[status] || badges.draft;
    },

    /**
     * Assignment type badge HTML'i
     * @param {string} type - Ödev tipi
     * @returns {string} Badge HTML
     */
    getTypeBadge(type) {
        const badges = {
            project:
                '<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">🎯 Proje</span>',
            homework:
                '<span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">📚 Ödev</span>',
            quiz: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">❓ Quiz</span>',
            exam: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">📝 Sınav</span>',
        };
        return badges[type] || badges.project;
    },
};

// Global erişim için
window.AssignmentService = AssignmentService;

export default AssignmentService;
