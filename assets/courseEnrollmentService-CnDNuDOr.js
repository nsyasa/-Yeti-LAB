import{S as m}from"./router-BFmYSC8h.js";const c=()=>m.getClient(),a={from:(...t)=>c().from(...t),auth:{getUser:()=>c().auth.getUser()},rpc:(...t)=>c().rpc(...t)},f={async getCourses(){const{data:t,error:r}=await a.from("courses").select("id, slug, title, description, theme_color, is_published").eq("is_published",!0).order("title");if(r)throw console.error("Kurslar yüklenemedi:",r),r;return t||[]},async getTeacherClassrooms(){const{data:{user:t}}=await c().auth.getUser();if(!t)throw new Error("Oturum bulunamadı");const{data:r,error:e}=await a.from("classrooms").select(`
                id,
                name,
                code,
                students:students(count)
            `).eq("teacher_id",t.id).order("name");if(e)throw console.error("Sınıflar yüklenemedi:",e),e;return r||[]},async getStudentsByClassroom(t){const{data:r,error:e}=await a.from("students").select("id, display_name, avatar_emoji, classroom_id").eq("classroom_id",t).order("display_name");if(e)throw console.error("Öğrenciler yüklenemedi:",e),e;return(r||[]).map(s=>({...s,name:s.display_name}))},async getClassroomEnrollments(t){const{data:r,error:e}=await a.from("course_enrollments").select(`
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
            `).eq("classroom_id",t);if(e)throw console.error("Kayıtlar yüklenemedi:",e),e;return r||[]},async getStudentEnrollments(t){const{data:r,error:e}=await a.from("course_enrollments").select(`
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
            `).eq("student_id",t).order("enrolled_at",{ascending:!1});if(e)throw console.error("Öğrenci kayıtları yüklenemedi:",e),e;return r||[]},async enrollClassroom(t,r){const{data:{user:e}}=await c().auth.getUser();if(!e)throw new Error("Oturum bulunamadı");const s=await this.getStudentsByClassroom(t);if(s.length===0)throw new Error("Bu sınıfta henüz öğrenci yok");const{data:o}=await a.from("course_enrollments").select("student_id").eq("course_id",r).in("student_id",s.map(i=>i.id)),d=new Set(o?.map(i=>i.student_id)||[]),n=s.filter(i=>!d.has(i.id)).map(i=>({student_id:i.id,course_id:r,classroom_id:t,assigned_by:e.id,status:"active"}));if(n.length===0)return{success:!0,message:"Tüm öğrenciler zaten bu kursa kayıtlı",enrolled:0,skipped:s.length};const{data:l,error:u}=await c().from("course_enrollments").insert(n).select();if(u)throw console.error("Toplu kayıt hatası:",u),u;return{success:!0,message:`${l.length} öğrenci kursa kaydedildi`,enrolled:l.length,skipped:d.size}},async enrollStudent(t,r,e=null){const{data:{user:s}}=await c().auth.getUser();if(!s)throw new Error("Oturum bulunamadı");const{data:o}=await a.from("course_enrollments").select("id, status").eq("student_id",t).eq("course_id",r).single();if(o){if(o.status!=="active"){const{error:l}=await a.from("course_enrollments").update({status:"active"}).eq("id",o.id);if(l)throw l;return{success:!0,message:"Kurs kaydı yeniden aktifleştirildi",reactivated:!0}}return{success:!0,message:"Öğrenci zaten bu kursa kayıtlı",alreadyEnrolled:!0}}const{data:d,error:n}=await a.from("course_enrollments").insert({student_id:t,course_id:r,classroom_id:e,assigned_by:s.id,status:"active"}).select().single();if(n)throw console.error("Kayıt hatası:",n),n;return{success:!0,message:"Öğrenci kursa kaydedildi",enrollment:d}},async enrollMultipleStudents(t,r,e=null){const{data:{user:s}}=await c().auth.getUser();if(!s)throw new Error("Oturum bulunamadı");const{data:o}=await a.from("course_enrollments").select("student_id").eq("course_id",r).in("student_id",t),d=new Set(o?.map(i=>i.student_id)||[]),n=t.filter(i=>!d.has(i)).map(i=>({student_id:i,course_id:r,classroom_id:e,assigned_by:s.id,status:"active"}));if(n.length===0)return{success:!0,enrolled:0,skipped:t.length,message:"Tüm öğrenciler zaten kayıtlı"};const{data:l,error:u}=await c().from("course_enrollments").insert(n).select();if(u)throw console.error("Toplu kayıt hatası:",u),u;return{success:!0,enrolled:l.length,skipped:d.size,message:`${l.length} öğrenci kaydedildi`}},async updateEnrollmentStatus(t,r){const e={status:r};r==="completed"&&(e.completed_at=new Date().toISOString());const{data:s,error:o}=await a.from("course_enrollments").update(e).eq("id",t).select().single();if(o)throw console.error("Durum güncelleme hatası:",o),o;return s},async removeEnrollment(t){const{error:r}=await c().from("course_enrollments").delete().eq("id",t);if(r)throw console.error("Kayıt silme hatası:",r),r;return{success:!0}},async unenrollClassroom(t,r){const{error:e}=await a.from("course_enrollments").delete().eq("classroom_id",t).eq("course_id",r);if(e)throw console.error("Toplu silme hatası:",e),e;return{success:!0,message:"Sınıftan kurs kaldırıldı"}},async getCourseEnrollmentStats(t){const{data:{user:r}}=await c().auth.getUser();if(!r)throw new Error("Oturum bulunamadı");const{data:e}=await c().from("classrooms").select("id").eq("teacher_id",r.id);if(!e||e.length===0)return{total:0,active:0,completed:0,dropped:0,paused:0};const s=e.map(l=>l.id),{data:o,error:d}=await a.from("course_enrollments").select("status").eq("course_id",t).in("classroom_id",s);if(d)throw console.error("İstatistik hatası:",d),d;const n={total:o?.length||0,active:0,completed:0,dropped:0,paused:0};return o?.forEach(l=>{n[l.status]!==void 0&&n[l.status]++}),n},async hasAccess(t,r){const{data:e,error:s}=await a.from("course_enrollments").select(`
                id,
                status,
                courses:course_id (slug)
            `).eq("student_id",t).eq("status","active");return s?(console.error("Erişim kontrolü hatası:",s),!1):e?.some(o=>o.courses?.slug===r)||!1},async getMyActiveCourses(t){const{data:r,error:e}=await a.from("course_enrollments").select(`
                id,
                enrolled_at,
                courses:course_id (
                    id,
                    slug,
                    title,
                    description,
                    theme_color
                )
            `).eq("student_id",t).eq("status","active").order("enrolled_at",{ascending:!1});if(e)throw console.error("Aktif kurslar yüklenemedi:",e),e;return r?.map(s=>({enrollmentId:s.id,enrolledAt:s.enrolled_at,...s.courses}))||[]}};export{f as default};
