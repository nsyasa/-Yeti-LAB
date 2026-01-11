/**
 * CourseEnrollmentService - Kurs kayıt yönetimi servisi
 * Öğretmenler için sınıf/öğrenci → kurs atama
 * Öğrenciler için kayıtlı kursları görme
 */

import { supabase } from './supabaseClient.js';

const CourseEnrollmentService = {
    /**
     * Tüm kursları getir (atama için)
     */
    async getCourses() {
        const { data, error } = await supabase
            .from('courses')
            .select('id, slug, title, description, theme_color, is_published')
            .eq('is_published', true)
            .order('title');

        if (error) {
            console.error('Kurslar yüklenemedi:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Öğretmenin sınıflarını getir
     */
    async getTeacherClassrooms() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum bulunamadı');

        const { data, error } = await supabase
            .from('classrooms')
            .select(`
                id,
                name,
                code,
                students:students(count)
            `)
            .eq('teacher_id', user.id)
            .order('name');

        if (error) {
            console.error('Sınıflar yüklenemedi:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Bir sınıftaki öğrencileri getir
     */
    async getStudentsByClassroom(classroomId) {
        const { data, error } = await supabase
            .from('students')
            .select('id, name, username, avatar_url')
            .eq('classroom_id', classroomId)
            .order('name');

        if (error) {
            console.error('Öğrenciler yüklenemedi:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Bir sınıfın mevcut kurs atamalarını getir
     */
    async getClassroomEnrollments(classroomId) {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select(`
                id,
                course_id,
                student_id,
                status,
                enrolled_at,
                courses:course_id (
                    id,
                    slug,
                    title,
                    theme_color
                )
            `)
            .eq('classroom_id', classroomId);

        if (error) {
            console.error('Kayıtlar yüklenemedi:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Bir öğrencinin kurs kayıtlarını getir
     */
    async getStudentEnrollments(studentId) {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select(`
                id,
                course_id,
                status,
                enrolled_at,
                completed_at,
                courses:course_id (
                    id,
                    slug,
                    title,
                    description,
                    theme_color
                )
            `)
            .eq('student_id', studentId)
            .order('enrolled_at', { ascending: false });

        if (error) {
            console.error('Öğrenci kayıtları yüklenemedi:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Tüm sınıfa kurs ata (toplu)
     * @param {string} classroomId - Sınıf ID
     * @param {string} courseId - Kurs ID
     */
    async enrollClassroom(classroomId, courseId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum bulunamadı');

        // Sınıftaki tüm öğrencileri al
        const students = await this.getStudentsByClassroom(classroomId);
        
        if (students.length === 0) {
            throw new Error('Bu sınıfta henüz öğrenci yok');
        }

        // Mevcut kayıtları kontrol et
        const { data: existingEnrollments } = await supabase
            .from('course_enrollments')
            .select('student_id')
            .eq('course_id', courseId)
            .in('student_id', students.map(s => s.id));

        const existingStudentIds = new Set(existingEnrollments?.map(e => e.student_id) || []);
        
        // Sadece kayıtlı olmayan öğrencileri ekle
        const newEnrollments = students
            .filter(s => !existingStudentIds.has(s.id))
            .map(student => ({
                student_id: student.id,
                course_id: courseId,
                classroom_id: classroomId,
                assigned_by: user.id,
                status: 'active'
            }));

        if (newEnrollments.length === 0) {
            return { 
                success: true, 
                message: 'Tüm öğrenciler zaten bu kursa kayıtlı',
                enrolled: 0,
                skipped: students.length
            };
        }

        const { data, error } = await supabase
            .from('course_enrollments')
            .insert(newEnrollments)
            .select();

        if (error) {
            console.error('Toplu kayıt hatası:', error);
            throw error;
        }

        return {
            success: true,
            message: `${data.length} öğrenci kursa kaydedildi`,
            enrolled: data.length,
            skipped: existingStudentIds.size
        };
    },

    /**
     * Bireysel öğrenciye kurs ata
     * @param {string} studentId - Öğrenci ID
     * @param {string} courseId - Kurs ID
     * @param {string} classroomId - Sınıf ID (opsiyonel)
     */
    async enrollStudent(studentId, courseId, classroomId = null) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum bulunamadı');

        // Mevcut kayıt kontrolü
        const { data: existing } = await supabase
            .from('course_enrollments')
            .select('id, status')
            .eq('student_id', studentId)
            .eq('course_id', courseId)
            .single();

        if (existing) {
            // Eğer dropped/paused ise tekrar aktive et
            if (existing.status !== 'active') {
                const { error } = await supabase
                    .from('course_enrollments')
                    .update({ status: 'active' })
                    .eq('id', existing.id);

                if (error) throw error;
                return { success: true, message: 'Kurs kaydı yeniden aktifleştirildi', reactivated: true };
            }
            return { success: true, message: 'Öğrenci zaten bu kursa kayıtlı', alreadyEnrolled: true };
        }

        const { data, error } = await supabase
            .from('course_enrollments')
            .insert({
                student_id: studentId,
                course_id: courseId,
                classroom_id: classroomId,
                assigned_by: user.id,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Kayıt hatası:', error);
            throw error;
        }

        return { success: true, message: 'Öğrenci kursa kaydedildi', enrollment: data };
    },

    /**
     * Birden fazla öğrenciyi kursa kaydet
     * @param {string[]} studentIds - Öğrenci ID listesi
     * @param {string} courseId - Kurs ID
     * @param {string} classroomId - Sınıf ID (opsiyonel)
     */
    async enrollMultipleStudents(studentIds, courseId, classroomId = null) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum bulunamadı');

        // Mevcut kayıtları kontrol et
        const { data: existingEnrollments } = await supabase
            .from('course_enrollments')
            .select('student_id')
            .eq('course_id', courseId)
            .in('student_id', studentIds);

        const existingStudentIds = new Set(existingEnrollments?.map(e => e.student_id) || []);
        
        const newEnrollments = studentIds
            .filter(id => !existingStudentIds.has(id))
            .map(studentId => ({
                student_id: studentId,
                course_id: courseId,
                classroom_id: classroomId,
                assigned_by: user.id,
                status: 'active'
            }));

        if (newEnrollments.length === 0) {
            return { 
                success: true, 
                enrolled: 0, 
                skipped: studentIds.length,
                message: 'Tüm öğrenciler zaten kayıtlı'
            };
        }

        const { data, error } = await supabase
            .from('course_enrollments')
            .insert(newEnrollments)
            .select();

        if (error) {
            console.error('Toplu kayıt hatası:', error);
            throw error;
        }

        return {
            success: true,
            enrolled: data.length,
            skipped: existingStudentIds.size,
            message: `${data.length} öğrenci kaydedildi`
        };
    },

    /**
     * Kayıt durumunu güncelle
     * @param {string} enrollmentId - Kayıt ID
     * @param {string} status - Yeni durum (active, paused, dropped, completed)
     */
    async updateEnrollmentStatus(enrollmentId, status) {
        const updateData = { status };
        
        if (status === 'completed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('course_enrollments')
            .update(updateData)
            .eq('id', enrollmentId)
            .select()
            .single();

        if (error) {
            console.error('Durum güncelleme hatası:', error);
            throw error;
        }

        return data;
    },

    /**
     * Kayıt sil
     * @param {string} enrollmentId - Kayıt ID
     */
    async removeEnrollment(enrollmentId) {
        const { error } = await supabase
            .from('course_enrollments')
            .delete()
            .eq('id', enrollmentId);

        if (error) {
            console.error('Kayıt silme hatası:', error);
            throw error;
        }

        return { success: true };
    },

    /**
     * Sınıftan kursu kaldır (toplu)
     * @param {string} classroomId - Sınıf ID
     * @param {string} courseId - Kurs ID
     */
    async unenrollClassroom(classroomId, courseId) {
        const { error } = await supabase
            .from('course_enrollments')
            .delete()
            .eq('classroom_id', classroomId)
            .eq('course_id', courseId);

        if (error) {
            console.error('Toplu silme hatası:', error);
            throw error;
        }

        return { success: true, message: 'Sınıftan kurs kaldırıldı' };
    },

    /**
     * Kurs bazında kayıt istatistikleri
     * @param {string} courseId - Kurs ID
     */
    async getCourseEnrollmentStats(courseId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Oturum bulunamadı');

        // Öğretmenin sınıflarındaki kayıtları al
        const { data: classrooms } = await supabase
            .from('classrooms')
            .select('id')
            .eq('teacher_id', user.id);

        if (!classrooms || classrooms.length === 0) {
            return { total: 0, active: 0, completed: 0, dropped: 0, paused: 0 };
        }

        const classroomIds = classrooms.map(c => c.id);

        const { data, error } = await supabase
            .from('course_enrollments')
            .select('status')
            .eq('course_id', courseId)
            .in('classroom_id', classroomIds);

        if (error) {
            console.error('İstatistik hatası:', error);
            throw error;
        }

        const stats = {
            total: data?.length || 0,
            active: 0,
            completed: 0,
            dropped: 0,
            paused: 0
        };

        data?.forEach(enrollment => {
            if (stats[enrollment.status] !== undefined) {
                stats[enrollment.status]++;
            }
        });

        return stats;
    },

    /**
     * Öğrencinin bir kursa erişimi var mı kontrol et
     * @param {string} studentId - Öğrenci ID
     * @param {string} courseSlug - Kurs slug
     */
    async hasAccess(studentId, courseSlug) {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select(`
                id,
                status,
                courses:course_id (slug)
            `)
            .eq('student_id', studentId)
            .eq('status', 'active');

        if (error) {
            console.error('Erişim kontrolü hatası:', error);
            return false;
        }

        return data?.some(e => e.courses?.slug === courseSlug) || false;
    },

    /**
     * Öğrencinin aktif kurslarını getir (öğrenci paneli için)
     * @param {string} studentId - Öğrenci ID
     */
    async getMyActiveCourses(studentId) {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select(`
                id,
                enrolled_at,
                courses:course_id (
                    id,
                    slug,
                    title,
                    description,
                    theme_color
                )
            `)
            .eq('student_id', studentId)
            .eq('status', 'active')
            .order('enrolled_at', { ascending: false });

        if (error) {
            console.error('Aktif kurslar yüklenemedi:', error);
            throw error;
        }

        return data?.map(e => ({
            enrollmentId: e.id,
            enrolledAt: e.enrolled_at,
            ...e.courses
        })) || [];
    }
};

export default CourseEnrollmentService;
