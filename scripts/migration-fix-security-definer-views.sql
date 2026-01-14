-- =====================================================
-- Migration: Fix SECURITY DEFINER Views
-- Tarih: 14 Ocak 2026
-- Açıklama: RLS bypass riskini önlemek için view'ları
--           SECURITY INVOKER ile yeniden oluşturur
-- =====================================================

-- =====================================================
-- 1. MEVCUT VİEW'LARI KALDIR
-- =====================================================

DROP VIEW IF EXISTS course_completion_rates CASCADE;
DROP VIEW IF EXISTS daily_active_users CASCADE;
DROP VIEW IF EXISTS assignment_statistics CASCADE;

-- =====================================================
-- 2. VİEW'LARI SECURITY INVOKER İLE YENİDEN OLUŞTUR
-- =====================================================

-- Günlük aktif kullanıcı sayısı
-- Bu view caller'ın yetkileriyle çalışır (RLS uygulanır)
CREATE VIEW daily_active_users 
WITH (security_invoker = true)
AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT COALESCE(student_id::text, session_id)) as unique_users,
    COUNT(*) as total_events
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

COMMENT ON VIEW daily_active_users IS 'Günlük aktif kullanıcı sayısı - SECURITY INVOKER ile güvenli';

-- Kurs bazlı tamamlama oranları
-- Bu view caller'ın yetkileriyle çalışır (RLS uygulanır)
CREATE VIEW course_completion_rates 
WITH (security_invoker = true)
AS
SELECT 
    c.id as course_id,
    c.title as course_title,
    COUNT(DISTINCT ce.student_id) as enrolled_students,
    COUNT(DISTINCT CASE WHEN ce.status = 'completed' THEN ce.student_id END) as completed_students,
    ROUND(
        COUNT(DISTINCT CASE WHEN ce.status = 'completed' THEN ce.student_id END)::numeric / 
        NULLIF(COUNT(DISTINCT ce.student_id), 0) * 100, 2
    ) as completion_rate
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
GROUP BY c.id, c.title;

COMMENT ON VIEW course_completion_rates IS 'Kurs tamamlama oranları - SECURITY INVOKER ile güvenli';

-- Ödev istatistikleri
-- Bu view caller'ın yetkileriyle çalışır (RLS uygulanır)
CREATE VIEW assignment_statistics 
WITH (security_invoker = true)
AS
SELECT 
    a.id as assignment_id,
    a.title as assignment_title,
    a.classroom_id,
    a.due_date,
    COUNT(DISTINCT s.student_id) as total_submissions,
    COUNT(DISTINCT CASE WHEN s.status = 'graded' THEN s.student_id END) as graded_count,
    ROUND(AVG(s.score), 2) as average_score,
    COUNT(DISTINCT CASE WHEN s.status = 'late_submitted' THEN s.student_id END) as late_submissions
FROM assignments a
LEFT JOIN submissions s ON a.id = s.assignment_id
GROUP BY a.id, a.title, a.classroom_id, a.due_date;

COMMENT ON VIEW assignment_statistics IS 'Ödev istatistikleri - SECURITY INVOKER ile güvenli';

-- =====================================================
-- 3. İZİNLER (GRANTS)
-- =====================================================

-- Authenticated kullanıcılar view'ları okuyabilir
-- (RLS politikaları uygulanacak)
GRANT SELECT ON daily_active_users TO authenticated;
GRANT SELECT ON course_completion_rates TO authenticated;
GRANT SELECT ON assignment_statistics TO authenticated;

-- Anon kullanıcılar erişemez (güvenlik)
REVOKE ALL ON daily_active_users FROM anon;
REVOKE ALL ON course_completion_rates FROM anon;
REVOKE ALL ON assignment_statistics FROM anon;

-- =====================================================
-- 4. DOĞRULAMA SORGUSU
-- Migration sonrası çalıştırarak kontrol edebilirsiniz
-- =====================================================

/*
-- View'ların güvenlik ayarlarını kontrol et
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE viewname IN ('course_completion_rates', 'daily_active_users', 'assignment_statistics');

-- RLS durumunu kontrol et (underlying tablolar için)
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('analytics_events', 'course_enrollments', 'assignments', 'submissions', 'courses');
*/

-- =====================================================
-- Migration tamamlandı!
-- =====================================================
