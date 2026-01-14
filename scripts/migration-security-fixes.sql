-- =====================================================
-- Migration: Güvenlik Düzeltmeleri
-- Tarih: 14 Ocak 2026
-- Açıklama: 
--   1. Fonksiyonlarda search_path sabitlenmesi
--   2. RLS politikalarının güçlendirilmesi
-- =====================================================

-- =====================================================
-- BÖLÜM 1: SEARCH_PATH DÜZELTMELERİ
-- Fonksiyonların search_path ayarını sabitler
-- Bu, SQL injection ve privilege escalation riskini azaltır
-- =====================================================

-- 1.1 update_updated_at_column
ALTER FUNCTION public.update_updated_at_column()
SET search_path = public;

-- 1.2 generate_classroom_code
ALTER FUNCTION public.generate_classroom_code()
SET search_path = public;

-- 1.3 set_classroom_code
ALTER FUNCTION public.set_classroom_code()
SET search_path = public;

-- 1.4 generate_session_token
ALTER FUNCTION public.generate_session_token()
SET search_path = public;

-- 1.5 set_student_session_token
ALTER FUNCTION public.set_student_session_token()
SET search_path = public;

-- 1.6 create_notification (parametreli fonksiyon - tüm parametreler DEFAULT değerli)
ALTER FUNCTION public.create_notification(
    UUID, UUID, VARCHAR(50), VARCHAR(255), TEXT, VARCHAR(50), UUID, TEXT
)
SET search_path = public;

-- 1.7 notify_assignment_published
ALTER FUNCTION public.notify_assignment_published()
SET search_path = public;

-- 1.8 notify_submission_graded
ALTER FUNCTION public.notify_submission_graded()
SET search_path = public;

-- 1.9 student_login (VARCHAR(5), VARCHAR(255) parametreleri ile)
ALTER FUNCTION public.student_login(VARCHAR(5), VARCHAR(255))
SET search_path = public;

-- 1.10 student_login_secure (3 VARCHAR parametresi ile)
ALTER FUNCTION public.student_login_secure(VARCHAR(5), VARCHAR(255), VARCHAR(255))
SET search_path = public;

-- 1.11 publish_course (parametreli fonksiyon)
ALTER FUNCTION public.publish_course(UUID)
SET search_path = public;


-- =====================================================
-- BÖLÜM 2: RLS POLİTİKA DÜZELTMELERİ
-- "true" olan politikaları daha güvenli hale getirir
-- =====================================================

-- =====================================================
-- 2.1 analytics_events - INSERT Politikası
-- Mevcut: true (herkes ekleyebilir)
-- Yeni: Sadece authenticated kullanıcılar,
--       kendi student_id veya user_id'leri ile ekleyebilir
-- =====================================================

-- Eski politikayı kaldır
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

-- Yeni güvenli politika
CREATE POLICY "Authenticated users can insert own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
    -- Kullanıcı sadece kendi ID'si ile event ekleyebilir
    (user_id IS NULL OR user_id = auth.uid())
    AND
    -- Öğrenci ID'si belirtilmişse, bu öğrenci kullanıcıya ait olmalı
    (student_id IS NULL OR student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ))
);

-- Anonim kullanıcılar için sınırlı erişim (opsiyonel - sadece session_id ile)
CREATE POLICY "Anon users can insert session-only analytics"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (
    -- Anonim kullanıcılar sadece session_id ile, user_id/student_id olmadan ekleyebilir
    user_id IS NULL 
    AND student_id IS NULL 
    AND session_id IS NOT NULL
);


-- =====================================================
-- 2.2 notifications - INSERT Politikası
-- Mevcut: true (herkes ekleyebilir)
-- Yeni: Sadece service_role veya sistem fonksiyonları ekleyebilir
-- =====================================================

-- Eski politikayı kaldır
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

-- Yeni güvenli politika - Öğretmenler kendi sınıflarına bildirim gönderebilir
CREATE POLICY "Teachers can insert notifications to their students"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
    -- Bildirim alıcısı, gönderenin sınıfındaki bir öğrenci olmalı
    (recipient_student_id IS NOT NULL AND recipient_student_id IN (
        SELECT s.id FROM students s
        JOIN classrooms c ON s.classroom_id = c.id
        WHERE c.teacher_id = auth.uid()
    ))
    OR
    -- Veya bildirim kendisine (örn: sistem mesajları için test)
    recipient_user_id = auth.uid()
);

-- Not: Service role ile çalışan edge function'lar veya trigger'lar 
-- RLS'i bypass eder (service_role kullanır), bu yüzden onlar için 
-- ayrı bir politika gerekmez.


-- =====================================================
-- 2.3 student_progress - DELETE Politikası
-- Mevcut: true (herkes silebilir!) - KRİTİK GÜVENLİK AÇIĞI
-- Yeni: Sadece öğrenci kendi ilerlemesini silebilir 
--       veya öğretmen sınıfındaki öğrencilerin ilerlemesini silebilir
-- =====================================================

-- Eski politikayı kaldır (dikkat: politika adını kontrol edin)
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.student_progress;
DROP POLICY IF EXISTS "Authenticated users can delete progress" ON public.student_progress;
DROP POLICY IF EXISTS "student_progress_delete_policy" ON public.student_progress;

-- Yeni güvenli politika - Öğrenciler kendi ilerlemelerini silebilir
CREATE POLICY "Students can delete own progress"
ON public.student_progress
FOR DELETE
TO authenticated
USING (
    -- Öğrenci sadece kendi ilerlemesini silebilir
    student_id IN (
        SELECT id FROM students 
        WHERE user_id = auth.uid() OR id = auth.uid()::uuid
    )
);

-- Öğretmenler sınıflarındaki öğrencilerin ilerlemesini silebilir
CREATE POLICY "Teachers can delete classroom student progress"
ON public.student_progress
FOR DELETE
TO authenticated
USING (
    student_id IN (
        SELECT s.id FROM students s
        JOIN classrooms c ON s.classroom_id = c.id
        WHERE c.teacher_id = auth.uid()
    )
);


-- =====================================================
-- 2.4 student_progress - INSERT Politikası
-- Mevcut: true (auth olan herkes ekleyebilir)
-- Yeni: Sadece kendi ilerlemesini ekleyebilir
-- =====================================================

-- Eski politikayı kaldır
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.student_progress;
DROP POLICY IF EXISTS "Authenticated users can insert progress" ON public.student_progress;
DROP POLICY IF EXISTS "student_progress_insert_policy" ON public.student_progress;

-- Yeni güvenli politika
CREATE POLICY "Students can insert own progress"
ON public.student_progress
FOR INSERT
TO authenticated
WITH CHECK (
    -- Öğrenci sadece kendi ilerlemesini ekleyebilir
    student_id IN (
        SELECT id FROM students 
        WHERE user_id = auth.uid() OR id = auth.uid()::uuid
    )
);

-- Öğretmenler sınıflarındaki öğrenciler için ilerleme ekleyebilir
CREATE POLICY "Teachers can insert classroom student progress"
ON public.student_progress
FOR INSERT
TO authenticated
WITH CHECK (
    student_id IN (
        SELECT s.id FROM students s
        JOIN classrooms c ON s.classroom_id = c.id
        WHERE c.teacher_id = auth.uid()
    )
);


-- =====================================================
-- BÖLÜM 3: DOĞRULAMA SORGULARI
-- Migration sonrası çalıştırarak kontrol edebilirsiniz
-- =====================================================

/*
-- Fonksiyonların search_path ayarlarını kontrol et
SELECT 
    proname as function_name,
    proconfig as config_options
FROM pg_proc 
WHERE proname IN (
    'update_updated_at_column',
    'generate_classroom_code',
    'set_classroom_code',
    'generate_session_token',
    'set_student_session_token',
    'create_notification',
    'notify_assignment_published',
    'notify_submission_graded',
    'student_login',
    'student_login_secure',
    'publish_course'
);

-- RLS politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('analytics_events', 'notifications', 'student_progress');
*/

-- =====================================================
-- Migration tamamlandı!
-- =====================================================
