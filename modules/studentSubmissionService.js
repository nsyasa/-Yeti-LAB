/**
 * Yeti LAB - Student Submission Service
 * Öğrenci tarafı ödev gönderme işlemleri
 * Faz 4: Student Assignment Submission
 */

export const StudentSubmissionService = {
    // ==========================================
    // ÖDEV LİSTELEME
    // ==========================================

    /**
     * Öğrencinin aktif ödevlerini getir
     * @param {Object} options - Filtreleme seçenekleri
     * @returns {Promise<Array>} Ödev listesi
     */
    async getMyAssignments(options = {}) {
        const {
            status = 'active', // active, all
            courseId = null,
            limit = 50,
        } = options;

        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Öğrenci profil bilgisini al (classroom_id için)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, classroom_id')
                .eq('id', user.id)
                .single();

            if (!profile?.classroom_id) {
                console.warn('[StudentSubmissionService] Student has no classroom');
                return [];
            }

            // Öğrencinin sınıfına atanmış ödevleri getir
            let query = supabase
                .from('assignments')
                .select(
                    `
                    *,
                    classroom:classrooms!assignments_classroom_id_fkey(id, name),
                    course:courses!assignments_course_id_fkey(id, title, slug),
                    my_submission:submissions!submissions_assignment_id_fkey(
                        id, status, grade, feedback, submitted_at, graded_at, attempt_number
                    )
                `
                )
                .eq('classroom_id', profile.classroom_id)
                .order('due_date', { ascending: true, nullsFirst: false });

            // Status filtresi
            if (status === 'active') {
                query = query.in('status', ['active']);
            } else {
                query = query.neq('status', 'archived');
            }

            // Kurs filtresi
            if (courseId) {
                query = query.eq('course_id', courseId);
            }

            const { data, error } = await query.limit(limit);

            if (error) throw error;

            // Sadece bu öğrencinin gönderilerini filtrele
            return data.map((assignment) => ({
                ...assignment,
                my_submission: assignment.my_submission?.find((s) => true) || null, // İlk submission
            }));
        } catch (error) {
            console.error('[StudentSubmissionService] getMyAssignments error:', error);
            throw error;
        }
    },

    /**
     * Tekil ödev detayını getir
     * @param {string} assignmentId - Ödev ID
     * @returns {Promise<Object>} Ödev detayları
     */
    async getAssignmentDetail(assignmentId) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Ödev detaylarını al
            const { data: assignment, error: assignmentError } = await supabase
                .from('assignments')
                .select(
                    `
                    *,
                    classroom:classrooms!assignments_classroom_id_fkey(id, name),
                    course:courses!assignments_course_id_fkey(id, title, slug),
                    rubric:rubrics(*)
                `
                )
                .eq('id', assignmentId)
                .single();

            if (assignmentError) throw assignmentError;

            // Bu öğrencinin gönderimlerini al
            const { data: submissions, error: submissionError } = await supabase
                .from('submissions')
                .select(
                    `
                    *,
                    files:submission_files(*)
                `
                )
                .eq('assignment_id', assignmentId)
                .eq('student_id', user.id)
                .order('submitted_at', { ascending: false });

            if (submissionError) throw submissionError;

            return {
                ...assignment,
                my_submissions: submissions || [],
                current_submission: submissions?.[0] || null,
            };
        } catch (error) {
            console.error('[StudentSubmissionService] getAssignmentDetail error:', error);
            throw error;
        }
    },

    // ==========================================
    // GÖNDERİM İŞLEMLERİ
    // ==========================================

    /**
     * Yeni gönderi oluştur veya taslak güncelle
     * @param {Object} submissionData - Gönderi verileri
     * @returns {Promise<Object>} Oluşturulan/güncellenen gönderi
     */
    async saveSubmission(submissionData) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Mevcut taslak var mı kontrol et
            const { data: existingDraft } = await supabase
                .from('submissions')
                .select('id, attempt_number')
                .eq('assignment_id', submissionData.assignment_id)
                .eq('student_id', user.id)
                .eq('status', 'draft')
                .single();

            if (existingDraft) {
                // Taslağı güncelle
                const { data, error } = await supabase
                    .from('submissions')
                    .update({
                        content: submissionData.content || '',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingDraft.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Yeni gönderi oluştur
                const { data: lastSubmission } = await supabase
                    .from('submissions')
                    .select('attempt_number')
                    .eq('assignment_id', submissionData.assignment_id)
                    .eq('student_id', user.id)
                    .order('attempt_number', { ascending: false })
                    .limit(1)
                    .single();

                const nextAttempt = (lastSubmission?.attempt_number || 0) + 1;

                const { data, error } = await supabase
                    .from('submissions')
                    .insert({
                        assignment_id: submissionData.assignment_id,
                        student_id: user.id,
                        content: submissionData.content || '',
                        status: 'draft',
                        attempt_number: nextAttempt,
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error('[StudentSubmissionService] saveSubmission error:', error);
            throw error;
        }
    },

    /**
     * Gönderiyi tamamla ve gönder
     * @param {string} submissionId - Gönderi ID
     * @returns {Promise<Object>} Güncellenen gönderi
     */
    async submitAssignment(submissionId) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('submissions')
                .update({
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
                })
                .eq('id', submissionId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('[StudentSubmissionService] submitAssignment error:', error);
            throw error;
        }
    },

    /**
     * Gönderiye dosya ekle
     * @param {string} submissionId - Gönderi ID
     * @param {File} file - Dosya
     * @param {Function} onProgress - İlerleme callback
     * @returns {Promise<Object>} Dosya kaydı
     */
    async uploadFile(submissionId, file, onProgress = null) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Gönderi bilgisini al
            const { data: submission } = await supabase
                .from('submissions')
                .select('assignment_id')
                .eq('id', submissionId)
                .single();

            if (!submission) throw new Error('Submission not found');

            // Dosya yolu oluştur
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${user.id}/${submission.assignment_id}/${fileName}`;

            // Dosyayı yükle
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('submissions')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Public URL al
            const {
                data: { publicUrl },
            } = supabase.storage.from('submissions').getPublicUrl(filePath);

            // Dosya kaydını oluştur
            const { data: fileRecord, error: fileError } = await supabase
                .from('submission_files')
                .insert({
                    submission_id: submissionId,
                    file_name: file.name,
                    file_path: filePath,
                    file_url: publicUrl,
                    file_size: file.size,
                    file_type: file.type || 'application/octet-stream',
                })
                .select()
                .single();

            if (fileError) throw fileError;
            return fileRecord;
        } catch (error) {
            console.error('[StudentSubmissionService] uploadFile error:', error);
            throw error;
        }
    },

    /**
     * Gönderideki dosyayı sil
     * @param {string} fileId - Dosya ID
     * @returns {Promise<boolean>} Başarı durumu
     */
    async deleteFile(fileId) {
        try {
            const supabase = window.SupabaseClient?.client;
            if (!supabase) throw new Error('Supabase client not initialized');

            // Dosya bilgisini al
            const { data: file } = await supabase
                .from('submission_files')
                .select('file_path')
                .eq('id', fileId)
                .single();

            if (file?.file_path) {
                // Storage'dan sil
                await supabase.storage.from('submissions').remove([file.file_path]);
            }

            // Kaydı sil
            const { error } = await supabase.from('submission_files').delete().eq('id', fileId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[StudentSubmissionService] deleteFile error:', error);
            throw error;
        }
    },

    // ==========================================
    // YARDIMCI FONKSİYONLAR
    // ==========================================

    /**
     * Ödevin durumunu belirle (öğrenci perspektifi)
     * @param {Object} assignment - Ödev objesi
     * @returns {Object} Durum bilgisi
     */
    getAssignmentStatus(assignment) {
        const now = new Date();
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
        const submission = assignment.my_submission || assignment.current_submission;

        // Ödev kapalı
        if (assignment.status === 'closed') {
            return {
                code: 'closed',
                label: 'Kapalı',
                color: 'gray',
                icon: '🔒',
                canSubmit: false,
            };
        }

        // Notlandırıldı
        if (submission?.status === 'graded') {
            return {
                code: 'graded',
                label: 'Notlandırıldı',
                color: 'green',
                icon: '✅',
                canSubmit: false,
            };
        }

        // Revizyon istendi
        if (submission?.status === 'revision_requested') {
            return {
                code: 'revision',
                label: 'Revizyon İstendi',
                color: 'orange',
                icon: '🔄',
                canSubmit: true,
            };
        }

        // Gönderildi, değerlendirme bekleniyor
        if (submission?.status === 'submitted') {
            return {
                code: 'submitted',
                label: 'Gönderildi',
                color: 'blue',
                icon: '📤',
                canSubmit: false,
            };
        }

        // Taslak var
        if (submission?.status === 'draft') {
            return {
                code: 'draft',
                label: 'Taslak',
                color: 'yellow',
                icon: '📝',
                canSubmit: true,
            };
        }

        // Süre dolmuş
        if (dueDate && now > dueDate) {
            if (assignment.allow_late_submission) {
                return {
                    code: 'late',
                    label: 'Geç Teslim',
                    color: 'red',
                    icon: '⏰',
                    canSubmit: true,
                };
            }
            return {
                code: 'overdue',
                label: 'Süresi Doldu',
                color: 'red',
                icon: '❌',
                canSubmit: false,
            };
        }

        // Başlanmadı
        return {
            code: 'pending',
            label: 'Bekliyor',
            color: 'gray',
            icon: '⏳',
            canSubmit: true,
        };
    },

    /**
     * Kalan süreyi hesapla
     * @param {string} dueDate - Son teslim tarihi
     * @returns {Object} Kalan süre bilgisi
     */
    getTimeRemaining(dueDate) {
        if (!dueDate) return { text: 'Süresiz', days: null, urgent: false, overdue: false };

        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;

        if (diff < 0) {
            const overdueDays = Math.abs(Math.ceil(diff / (1000 * 60 * 60 * 24)));
            return {
                text: `${overdueDays} gün geçti`,
                days: -overdueDays,
                urgent: false,
                overdue: true,
            };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 7) {
            return { text: `${days} gün`, days, urgent: false, overdue: false };
        } else if (days > 0) {
            return { text: `${days} gün ${hours} saat`, days, urgent: days <= 2, overdue: false };
        } else if (hours > 0) {
            return { text: `${hours} saat ${minutes} dk`, days: 0, urgent: true, overdue: false };
        } else {
            return { text: `${minutes} dakika`, days: 0, urgent: true, overdue: false };
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
     * Dosya boyutu formatla
     * @param {number} bytes - Byte cinsinden boyut
     * @returns {string} Formatlanmış boyut
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    },

    /**
     * Status badge HTML'i
     * @param {Object} status - Status objesi (getAssignmentStatus'dan)
     * @returns {string} Badge HTML
     */
    getStatusBadgeHtml(status) {
        const colorClasses = {
            green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        };

        return `<span class="px-2 py-1 text-xs font-medium rounded-full ${colorClasses[status.color]}">${status.icon} ${status.label}</span>`;
    },
};

// Global erişim için
window.StudentSubmissionService = StudentSubmissionService;

export default StudentSubmissionService;
