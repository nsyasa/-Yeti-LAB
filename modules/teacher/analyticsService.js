/**
 * AnalyticsService - Öğretmen Analytics Dashboard Servisi
 * Ödev, gönderim, öğrenci aktivite metrikleri
 */

import SupabaseClient from '../supabaseClient.js';

// Lazy getter - her çağrıda client'a erişir
const getSupabase = () => SupabaseClient.getClient();

// Proxy for backward compatibility - delegates to getSupabase()
const supabase = {
    from: (...args) => getSupabase().from(...args),
    auth: { getUser: () => getSupabase().auth.getUser() },
    rpc: (...args) => getSupabase().rpc(...args),
};

const AnalyticsService = {
    _cache: {},
    _cacheExpiry: 5 * 60 * 1000, // 5 dakika

    /**
     * Genel dashboard özet istatistikleri
     * @returns {Promise<Object>}
     */
    async getDashboardSummary() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) throw new Error('Oturum bulunamadı');

        // Öğretmenin sınıflarını al
        const { data: classrooms } = await getSupabase().from('classrooms').select('id').eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) {
            return this._getEmptySummary();
        }

        const classroomIds = classrooms.map((c) => c.id);

        // Paralel sorgular
        const [studentsResult, assignmentsResult, submissionsResult, enrollmentsResult] = await Promise.all([
            // Toplam öğrenci
            getSupabase()
                .from('students')
                .select('id', { count: 'exact', head: true })
                .in('classroom_id', classroomIds),

            // Toplam ödev
            getSupabase().from('assignments').select('id, status', { count: 'exact' }).in('classroom_id', classroomIds),

            // Toplam gönderim
            supabase
                .from('submissions')
                .select('id, status, score')
                .in(
                    'assignment_id',
                    (await getSupabase().from('assignments').select('id').in('classroom_id', classroomIds)).data?.map(
                        (a) => a.id
                    ) || []
                ),

            // Aktif kurs kayıtları
            supabase
                .from('course_enrollments')
                .select('id, status', { count: 'exact' })
                .in('classroom_id', classroomIds)
                .eq('status', 'active'),
        ]);

        const submissions = submissionsResult.data || [];
        const assignments = assignmentsResult.data || [];

        // Hesaplamalar
        const pendingSubmissions = submissions.filter((s) => s.status === 'submitted').length;
        const gradedSubmissions = submissions.filter((s) => s.status === 'graded').length;
        const averageScore =
            submissions.filter((s) => s.score !== null).length > 0
                ? Math.round(
                      submissions.filter((s) => s.score !== null).reduce((sum, s) => sum + s.score, 0) /
                          submissions.filter((s) => s.score !== null).length
                  )
                : 0;
        const activeAssignments = assignments.filter((a) => a.status === 'published').length;

        return {
            totalStudents: studentsResult.count || 0,
            totalClassrooms: classrooms.length,
            totalAssignments: assignments.length,
            activeAssignments,
            totalSubmissions: submissions.length,
            pendingSubmissions,
            gradedSubmissions,
            averageScore,
            activeEnrollments: enrollmentsResult.count || 0,
        };
    },

    /**
     * Boş özet
     */
    _getEmptySummary() {
        return {
            totalStudents: 0,
            totalClassrooms: 0,
            totalAssignments: 0,
            activeAssignments: 0,
            totalSubmissions: 0,
            pendingSubmissions: 0,
            gradedSubmissions: 0,
            averageScore: 0,
            activeEnrollments: 0,
        };
    },

    /**
     * Son 7 gün gönderim trendi
     * @returns {Promise<Array>}
     */
    async getSubmissionTrend(days = 7) {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Öğretmenin sınıflarını al
        const { data: classrooms } = await supabase.from('classrooms').select('id').eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) return [];
        const classroomIds = classrooms.map((c) => c.id);

        // Öğretmenin ödevlerini al
        const { data: assignments } = await supabase.from('assignments').select('id').in('classroom_id', classroomIds);

        if (!assignments || assignments.length === 0) return [];

        const assignmentIds = assignments.map((a) => a.id);

        // Gönderim verilerini al
        const { data: submissions } = await supabase
            .from('submissions')
            .select('created_at')
            .in('assignment_id', assignmentIds)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        // Günlük gruplama
        const trend = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const count = submissions?.filter((s) => s.created_at.startsWith(dateStr)).length || 0;

            trend.push({
                date: dateStr,
                label: date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
                count,
            });
        }

        return trend;
    },

    /**
     * Sınıf bazlı performans karşılaştırması
     * @returns {Promise<Array>}
     */
    async getClassroomPerformance() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        const { data: classrooms } = await supabase
            .from('classrooms')
            .select(
                `
                id,
                name,
                students(count),
                assignments(
                    id,
                    submissions(score, status)
                )
            `
            )
            .eq('teacher_id', user.id);

        if (!classrooms) return [];

        return classrooms.map((classroom) => {
            const studentCount = classroom.students?.[0]?.count || 0;
            const allSubmissions = classroom.assignments?.flatMap((a) => a.submissions || []) || [];
            const gradedSubmissions = allSubmissions.filter((s) => s.status === 'graded' && s.score !== null);
            const avgScore =
                gradedSubmissions.length > 0
                    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length)
                    : 0;
            const submissionRate =
                studentCount > 0 && classroom.assignments?.length > 0
                    ? Math.round((allSubmissions.length / (studentCount * classroom.assignments.length)) * 100)
                    : 0;

            return {
                id: classroom.id,
                name: classroom.name,
                studentCount,
                assignmentCount: classroom.assignments?.length || 0,
                submissionCount: allSubmissions.length,
                averageScore: avgScore,
                submissionRate,
            };
        });
    },

    /**
     * Ödev bazlı istatistikler
     * @returns {Promise<Array>}
     */
    async getAssignmentStats() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        // Öğretmenin sınıflarını al
        const { data: classrooms } = await supabase
            .from('classrooms')
            .select('id, name, students(count)')
            .eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) return [];
        const classroomIds = classrooms.map((c) => c.id);
        const classroomMap = Object.fromEntries(classrooms.map((c) => [c.id, c]));

        const { data } = await supabase
            .from('assignments')
            .select(
                `
                id,
                title,
                status,
                due_date,
                max_score,
                classroom_id,
                submissions(id, status, score, submitted_at)
            `
            )
            .in('classroom_id', classroomIds)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!data) return [];

        return data.map((assignment) => {
            const classroom = classroomMap[assignment.classroom_id];
            const studentCount = classroom?.students?.[0]?.count || 0;
            const submissions = assignment.submissions || [];
            const gradedSubs = submissions.filter((s) => s.status === 'graded' && s.score !== null);
            const avgScore =
                gradedSubs.length > 0
                    ? Math.round(gradedSubs.reduce((sum, s) => sum + s.score, 0) / gradedSubs.length)
                    : null;

            // Geç gönderim kontrolü
            const lateSubs = submissions.filter((s) => {
                if (!assignment.due_date || !s.submitted_at) return false;
                return new Date(s.submitted_at) > new Date(assignment.due_date);
            }).length;

            return {
                id: assignment.id,
                title: assignment.title,
                status: assignment.status,
                dueDate: assignment.due_date,
                maxScore: assignment.max_score,
                classroomName: assignment.classrooms?.name || '',
                studentCount,
                submissionCount: submissions.length,
                submissionRate: studentCount > 0 ? Math.round((submissions.length / studentCount) * 100) : 0,
                gradedCount: gradedSubs.length,
                averageScore: avgScore,
                lateSubmissions: lateSubs,
            };
        });
    },

    /**
     * En aktif öğrenciler
     * @param {number} limit - Limit
     * @returns {Promise<Array>}
     */
    async getTopStudents(limit = 5) {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        // Öğretmenin sınıflarını al
        const { data: classrooms } = await supabase.from('classrooms').select('id').eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) return [];
        const classroomIds = classrooms.map((c) => c.id);

        // Öğretmenin sınıflarındaki öğrencileri al
        const { data: students } = await supabase
            .from('students')
            .select('id, name, username, avatar_url, classroom_id')
            .in('classroom_id', classroomIds);

        if (!students || students.length === 0) return [];

        // Her öğrenci için gönderim ve puan bilgisi
        const studentIds = students.map((s) => s.id);

        const { data: submissions } = await supabase
            .from('submissions')
            .select('student_id, score, status')
            .in('student_id', studentIds);

        // Öğrenci bazlı gruplama
        const studentStats = students.map((student) => {
            const studentSubs = submissions?.filter((s) => s.student_id === student.id) || [];
            const gradedSubs = studentSubs.filter((s) => s.status === 'graded' && s.score !== null);
            const totalScore = gradedSubs.reduce((sum, s) => sum + s.score, 0);
            const avgScore = gradedSubs.length > 0 ? Math.round(totalScore / gradedSubs.length) : 0;

            return {
                id: student.id,
                name: student.name,
                username: student.username,
                avatar: student.avatar_url,
                submissionCount: studentSubs.length,
                averageScore: avgScore,
                totalScore,
            };
        });

        // Ortalama puana göre sırala
        return studentStats.sort((a, b) => b.averageScore - a.averageScore).slice(0, limit);
    },

    /**
     * Gönderim durumu dağılımı (pie chart için)
     * @returns {Promise<Object>}
     */
    async getSubmissionStatusDistribution() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return { submitted: 0, graded: 0, late: 0, draft: 0 };

        // Öğretmenin sınıflarını al
        const { data: classrooms } = await supabase.from('classrooms').select('id').eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) {
            return { submitted: 0, graded: 0, late: 0, draft: 0 };
        }
        const classroomIds = classrooms.map((c) => c.id);

        const { data: assignments } = await supabase.from('assignments').select('id').in('classroom_id', classroomIds);

        if (!assignments || assignments.length === 0) {
            return { submitted: 0, graded: 0, late: 0, draft: 0 };
        }

        const assignmentIds = assignments.map((a) => a.id);

        const { data: submissions } = await supabase
            .from('submissions')
            .select('status')
            .in('assignment_id', assignmentIds);

        const distribution = {
            submitted: 0,
            graded: 0,
            late_submitted: 0,
            draft: 0,
            revision_requested: 0,
        };

        submissions?.forEach((s) => {
            if (distribution[s.status] !== undefined) {
                distribution[s.status]++;
            }
        });

        return distribution;
    },

    /**
     * Haftalık aktivite heat map (saat bazlı)
     * @returns {Promise<Array>}
     */
    async getWeeklyActivityHeatmap() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 28); // Son 4 hafta

        // Öğretmenin sınıflarını al
        const { data: classrooms } = await supabase.from('classrooms').select('id').eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) return [];
        const classroomIds = classrooms.map((c) => c.id);

        // Öğretmenin ödevlerini al
        const { data: assignments } = await supabase.from('assignments').select('id').in('classroom_id', classroomIds);

        if (!assignments || assignments.length === 0) return [];
        const assignmentIds = assignments.map((a) => a.id);

        const { data: submissions } = await supabase
            .from('submissions')
            .select('created_at')
            .in('assignment_id', assignmentIds)
            .gte('created_at', startDate.toISOString());

        // Gün ve saat bazlı gruplama
        const heatmap = {};
        const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

        // Boş grid oluştur
        days.forEach((day, dayIndex) => {
            heatmap[dayIndex] = {};
            for (let hour = 0; hour < 24; hour++) {
                heatmap[dayIndex][hour] = 0;
            }
        });

        // Verileri doldur
        submissions?.forEach((s) => {
            const date = new Date(s.created_at);
            const day = date.getDay();
            const hour = date.getHours();
            heatmap[day][hour]++;
        });

        // Formatla
        const result = [];
        days.forEach((dayName, dayIndex) => {
            for (let hour = 8; hour <= 22; hour++) {
                // 08:00 - 22:00 arası
                result.push({
                    day: dayName,
                    dayIndex,
                    hour,
                    hourLabel: `${hour.toString().padStart(2, '0')}:00`,
                    count: heatmap[dayIndex][hour],
                });
            }
        });

        return result;
    },

    /**
     * Kurs tamamlama oranları
     * @returns {Promise<Array>}
     */
    async getCourseCompletionRates() {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        // View kullan
        const { data } = await getSupabase().from('course_completion_rates').select('*');

        return data || [];
    },

    /**
     * Son aktiviteler
     * @param {number} limit
     * @returns {Promise<Array>}
     */
    async getRecentActivity(limit = 10) {
        const {
            data: { user },
        } = await getSupabase().auth.getUser();
        if (!user) return [];

        // Öğretmenin sınıflarını al
        const { data: classrooms } = await supabase.from('classrooms').select('id').eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) return [];
        const classroomIds = classrooms.map((c) => c.id);

        // Öğretmenin ödevlerini al
        const { data: assignments } = await supabase.from('assignments').select('id').in('classroom_id', classroomIds);

        if (!assignments || assignments.length === 0) return [];
        const assignmentIds = assignments.map((a) => a.id);

        const { data: submissions } = await supabase
            .from('submissions')
            .select(
                `
                id,
                status,
                score,
                created_at,
                submitted_at,
                graded_at,
                students(name, avatar_url),
                assignments(title)
            `
            )
            .in('assignment_id', assignmentIds)
            .order('created_at', { ascending: false })
            .limit(limit);

        return (
            submissions?.map((s) => ({
                id: s.id,
                type: s.status === 'graded' ? 'graded' : 'submitted',
                studentName: s.students?.name || 'Bilinmeyen',
                studentAvatar: s.students?.avatar_url,
                assignmentTitle: s.assignments?.title || '',
                score: s.score,
                createdAt: s.created_at,
                submittedAt: s.submitted_at,
                gradedAt: s.graded_at,
            })) || []
        );
    },
};

export default AnalyticsService;
