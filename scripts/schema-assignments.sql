-- =====================================================
-- Yeti LAB - Ödev ve Bildirim Sistemi Veritabanı Şeması
-- Faz 0: Temel Tablolar
-- Tarih: 11 Ocak 2026
-- =====================================================

-- =====================================================
-- 1. ASSIGNMENTS (Ödevler)
-- Öğretmenlerin oluşturduğu ödevler
-- =====================================================

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İlişkiler
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,  -- Opsiyonel: Belirli bir dersle ilişki
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,  -- Hangi sınıfa atandı
    created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Ödev bilgileri
    title VARCHAR(500) NOT NULL,
    description TEXT,  -- Rich text HTML olarak saklanacak (TipTap çıktısı)
    instructions TEXT,  -- Ek talimatlar
    
    -- Dosya kuralları
    max_file_size_mb INTEGER DEFAULT 5 CHECK (max_file_size_mb <= 10),
    allowed_extensions TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'pptx', 'zip', 'png', 'jpg', 'jpeg'],
    max_files INTEGER DEFAULT 3,
    
    -- Değerlendirme
    max_score INTEGER DEFAULT 100 CHECK (max_score > 0),
    rubric JSONB DEFAULT '[]'::jsonb,  -- [{criterion: string, maxPoints: number, description: string}]
    
    -- Tarihler
    due_date TIMESTAMPTZ,
    late_submission_allowed BOOLEAN DEFAULT false,
    late_penalty_percent INTEGER DEFAULT 0 CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100),
    
    -- Durum
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
    published_at TIMESTAMPTZ,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: updated_at otomatik güncelle
CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_classroom ON assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignments_creator ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- =====================================================
-- 2. SUBMISSIONS (Ödev Gönderimleri)
-- Öğrencilerin ödev gönderimleri
-- =====================================================

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İlişkiler
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Gönderim içeriği
    content TEXT,  -- Inline metin gönderimi için (opsiyonel)
    
    -- Durum makinesi
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft',           -- Taslak (henüz gönderilmedi)
        'submitted',       -- Gönderildi
        'late_submitted',  -- Geç gönderildi
        'grading',         -- Değerlendirme aşamasında
        'graded',          -- Puanlandı
        'returned',        -- İade edildi (revizyon gerekiyor)
        'resubmitted'      -- Tekrar gönderildi
    )),
    
    -- Değerlendirme
    score INTEGER CHECK (score >= 0),
    feedback TEXT,  -- Öğretmen geri bildirimi
    rubric_scores JSONB DEFAULT '{}'::jsonb,  -- {criterionId: score}
    
    -- Tarihler
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    returned_at TIMESTAMPTZ,
    
    -- Meta
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Her öğrenci her ödev için bir aktif gönderim (attempt ile unique)
    UNIQUE(assignment_id, student_id, attempt_number)
);

-- Trigger: updated_at
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_graded_by ON submissions(graded_by);

-- =====================================================
-- 3. SUBMISSION_FILES (Gönderim Dosyaları)
-- Bir gönderime ait dosyalar (ayrı tablo - normalizasyon)
-- =====================================================

CREATE TABLE IF NOT EXISTS submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    
    -- Dosya bilgileri
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,  -- Supabase Storage path: submissions/{student_id}/{assignment_id}/{filename}
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0),
    file_type VARCHAR(100),  -- MIME type
    
    -- Meta
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_submission_files_submission ON submission_files(submission_id);

-- =====================================================
-- 4. COURSE_ENROLLMENTS (Kurs Kayıtları)
-- Öğrencilerin kurslara kaydı
-- =====================================================

CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- İlişkiler
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,  -- Hangi sınıf üzerinden atandı
    assigned_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,  -- Atayan öğretmen
    
    -- Durum
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'paused')),
    
    -- Tarihler
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    
    -- Her öğrenci her kursa bir kez kaydolabilir
    UNIQUE(student_id, course_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_classroom ON course_enrollments(classroom_id);

-- =====================================================
-- 5. NOTIFICATIONS (Bildirimler)
-- Uygulama içi bildirim sistemi
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Alıcı (student veya user_profile olabilir)
    recipient_student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    recipient_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Bildirim içeriği
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'assignment_created',      -- Yeni ödev oluşturuldu
        'assignment_due_soon',     -- Ödev teslim tarihi yaklaşıyor (24 saat)
        'assignment_due_today',    -- Ödev bugün bitiyor
        'assignment_overdue',      -- Ödev süresi geçti
        'submission_received',     -- Gönderim alındı (öğretmene)
        'submission_graded',       -- Ödev puanlandı (öğrenciye)
        'submission_returned',     -- Ödev iade edildi
        'course_enrolled',         -- Kursa kaydedildin
        'achievement_earned',      -- Rozet/başarı kazanıldı
        'announcement',            -- Genel duyuru
        'system'                   -- Sistem bildirimi
    )),
    
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- İlişkili kaynak (opsiyonel)
    related_entity_type VARCHAR(50),  -- 'assignment', 'submission', 'course', etc.
    related_entity_id UUID,
    
    -- Link (tıklandığında nereye gidecek)
    action_url TEXT,
    
    -- Durum
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- En az bir alıcı olmalı
    CONSTRAINT notification_recipient CHECK (
        recipient_student_id IS NOT NULL OR recipient_user_id IS NOT NULL
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(recipient_student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- =====================================================
-- 6. ANALYTICS_EVENTS (Analitik Olayları)
-- Dashboard için olay takibi
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Kim
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(64),  -- Anonim kullanıcılar için
    
    -- Ne
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'page_view',           -- Sayfa görüntüleme
        'lesson_started',      -- Ders başlatıldı
        'lesson_completed',    -- Ders tamamlandı
        'quiz_started',        -- Quiz başlatıldı
        'quiz_completed',      -- Quiz tamamlandı
        'assignment_viewed',   -- Ödev görüntülendi
        'assignment_started',  -- Ödev başlatıldı
        'submission_created',  -- Gönderim oluşturuldu
        'simulation_used',     -- Simülasyon kullanıldı
        'login',               -- Giriş yapıldı
        'logout'               -- Çıkış yapıldı
    )),
    
    -- Nerede
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
    
    -- Detaylar
    metadata JSONB DEFAULT '{}'::jsonb,  -- Ek bilgiler (quiz skoru, süre vs.)
    
    -- Ne zaman
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes (Analytics sorguları için optimize)
CREATE INDEX IF NOT EXISTS idx_analytics_student ON analytics_events(student_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_course ON analytics_events(course_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC);

-- Date-based index: created_at::date yerine timezone-safe yaklaşım
-- Not: DATE() IMMUTABLE değil, bu yüzden created_at üzerinde range query kullanacağız
CREATE INDEX IF NOT EXISTS idx_analytics_created_date ON analytics_events(created_at);

-- Composite index for common queries (date fonksiyonu olmadan)
CREATE INDEX IF NOT EXISTS idx_analytics_student_course 
    ON analytics_events(student_id, course_id, created_at);

-- =====================================================
-- 7. NOTIFICATION_PREFERENCES (Bildirim Tercihleri)
-- Kullanıcıların bildirim ayarları
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Kullanıcı
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    
    -- Tercihler (JSON olarak - esnek)
    preferences JSONB DEFAULT '{
        "assignment_created": true,
        "assignment_due_soon": true,
        "assignment_due_today": true,
        "submission_graded": true,
        "submission_returned": true,
        "course_enrolled": true,
        "achievement_earned": true,
        "announcement": true,
        "email_notifications": false
    }'::jsonb,
    
    -- Meta
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT notification_pref_user CHECK (
        user_id IS NOT NULL OR student_id IS NOT NULL
    ),
    UNIQUE(user_id),
    UNIQUE(student_id)
);

-- =====================================================
-- RLS (Row Level Security) POLİTİKALARI
-- =====================================================

-- RLS aktifleştir
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ASSIGNMENTS Politikaları
-- =====================================================

-- Herkes yayınlanmış ödevleri görebilir (kendi sınıfındaki)
CREATE POLICY "Students can view published assignments in their classroom"
    ON assignments FOR SELECT
    USING (
        status = 'published' AND
        classroom_id IN (
            SELECT classroom_id FROM students WHERE id = auth.uid()::uuid
            UNION
            SELECT classroom_id FROM students WHERE user_id = auth.uid()
        )
    );

-- Öğretmenler kendi ödevlerini yönetebilir
CREATE POLICY "Teachers can manage own assignments"
    ON assignments FOR ALL
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Adminler tüm ödevlere erişebilir
CREATE POLICY "Admins full access to assignments"
    ON assignments FOR ALL
    USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- SUBMISSIONS Politikaları
-- =====================================================

-- Öğrenciler kendi gönderimlerini yönetebilir
CREATE POLICY "Students can manage own submissions"
    ON submissions FOR ALL
    USING (
        student_id IN (
            SELECT id FROM students WHERE id = auth.uid()::uuid OR user_id = auth.uid()
        )
    )
    WITH CHECK (
        student_id IN (
            SELECT id FROM students WHERE id = auth.uid()::uuid OR user_id = auth.uid()
        )
    );

-- Öğretmenler kendi ödevlerine yapılan gönderimleri görebilir
CREATE POLICY "Teachers can view submissions to their assignments"
    ON submissions FOR SELECT
    USING (
        assignment_id IN (
            SELECT id FROM assignments WHERE created_by = auth.uid()
        )
    );

-- Öğretmenler puanlama yapabilir
CREATE POLICY "Teachers can grade submissions"
    ON submissions FOR UPDATE
    USING (
        assignment_id IN (
            SELECT id FROM assignments WHERE created_by = auth.uid()
        )
    )
    WITH CHECK (
        assignment_id IN (
            SELECT id FROM assignments WHERE created_by = auth.uid()
        )
    );

-- =====================================================
-- SUBMISSION_FILES Politikaları
-- =====================================================

-- Öğrenciler kendi dosyalarını yönetebilir
CREATE POLICY "Students can manage own submission files"
    ON submission_files FOR ALL
    USING (
        submission_id IN (
            SELECT id FROM submissions WHERE student_id IN (
                SELECT id FROM students WHERE id = auth.uid()::uuid OR user_id = auth.uid()
            )
        )
    );

-- Öğretmenler dosyaları görebilir
CREATE POLICY "Teachers can view submission files"
    ON submission_files FOR SELECT
    USING (
        submission_id IN (
            SELECT s.id FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            WHERE a.created_by = auth.uid()
        )
    );

-- =====================================================
-- COURSE_ENROLLMENTS Politikaları
-- =====================================================

-- Öğrenciler kendi kayıtlarını görebilir
CREATE POLICY "Students can view own enrollments"
    ON course_enrollments FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM students WHERE id = auth.uid()::uuid OR user_id = auth.uid()
        )
    );

-- Öğretmenler kayıt ekleyebilir/düzenleyebilir
CREATE POLICY "Teachers can manage enrollments"
    ON course_enrollments FOR ALL
    USING (
        assigned_by = auth.uid() OR
        classroom_id IN (
            SELECT id FROM classrooms WHERE teacher_id = auth.uid()
        )
    );

-- =====================================================
-- NOTIFICATIONS Politikaları
-- =====================================================

-- Kullanıcılar kendi bildirimlerini görebilir
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        recipient_user_id = auth.uid() OR
        recipient_student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

-- Kullanıcılar kendi bildirimlerini okundu işaretleyebilir
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (
        recipient_user_id = auth.uid() OR
        recipient_student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

-- Sistem bildirimleri ekleyebilir (service role)
CREATE POLICY "Service can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);  -- Service role ile kontrol edilecek

-- =====================================================
-- ANALYTICS_EVENTS Politikaları
-- =====================================================

-- Herkes event ekleyebilir
CREATE POLICY "Anyone can insert analytics events"
    ON analytics_events FOR INSERT
    WITH CHECK (true);

-- Öğretmenler kendi sınıflarının analitiğini görebilir
CREATE POLICY "Teachers can view classroom analytics"
    ON analytics_events FOR SELECT
    USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN classrooms c ON s.classroom_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- Adminler tüm analitiği görebilir
CREATE POLICY "Admins can view all analytics"
    ON analytics_events FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Bildirim oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_notification(
    p_recipient_student_id UUID DEFAULT NULL,
    p_recipient_user_id UUID DEFAULT NULL,
    p_type VARCHAR(50) DEFAULT 'system',
    p_title VARCHAR(255) DEFAULT '',
    p_message TEXT DEFAULT NULL,
    p_related_entity_type VARCHAR(50) DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        recipient_student_id,
        recipient_user_id,
        type,
        title,
        message,
        related_entity_type,
        related_entity_id,
        action_url
    ) VALUES (
        p_recipient_student_id,
        p_recipient_user_id,
        p_type,
        p_title,
        p_message,
        p_related_entity_type,
        p_related_entity_id,
        p_action_url
    )
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- Ödev yayınlandığında otomatik bildirim
CREATE OR REPLACE FUNCTION notify_assignment_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_student RECORD;
    v_assignment_title VARCHAR(255);
BEGIN
    -- Sadece draft -> published geçişinde çalış
    IF OLD.status = 'draft' AND NEW.status = 'published' THEN
        v_assignment_title := NEW.title;
        
        -- Sınıftaki tüm öğrencilere bildirim gönder
        FOR v_student IN 
            SELECT id FROM students WHERE classroom_id = NEW.classroom_id
        LOOP
            PERFORM create_notification(
                p_recipient_student_id := v_student.id,
                p_type := 'assignment_created',
                p_title := 'Yeni Ödev: ' || v_assignment_title,
                p_message := 'Öğretmeniniz yeni bir ödev oluşturdu.',
                p_related_entity_type := 'assignment',
                p_related_entity_id := NEW.id,
                p_action_url := '/assignments/' || NEW.id
            );
        END LOOP;
        
        -- Yayınlanma tarihini kaydet
        NEW.published_at := now();
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_assignment_published
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_assignment_published();

-- Gönderim puanlandığında öğrenciye bildirim
CREATE OR REPLACE FUNCTION notify_submission_graded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_assignment_title VARCHAR(255);
BEGIN
    -- Sadece graded durumuna geçişte çalış
    IF (OLD.status IS DISTINCT FROM 'graded') AND NEW.status = 'graded' THEN
        SELECT title INTO v_assignment_title 
        FROM assignments WHERE id = NEW.assignment_id;
        
        PERFORM create_notification(
            p_recipient_student_id := NEW.student_id,
            p_type := 'submission_graded',
            p_title := 'Ödevin Puanlandı: ' || v_assignment_title,
            p_message := 'Puanın: ' || NEW.score || '. Geri bildirimi görmek için tıkla.',
            p_related_entity_type := 'submission',
            p_related_entity_id := NEW.id,
            p_action_url := '/submissions/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_submission_graded
    AFTER UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_submission_graded();

-- =====================================================
-- ANALYTICS HELPER VIEWS
-- =====================================================

-- Günlük aktif kullanıcı sayısı
CREATE OR REPLACE VIEW daily_active_users AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT COALESCE(student_id::text, session_id)) as unique_users,
    COUNT(*) as total_events
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Kurs bazlı tamamlama oranları
CREATE OR REPLACE VIEW course_completion_rates AS
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

-- Ödev istatistikleri
CREATE OR REPLACE VIEW assignment_statistics AS
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

-- =====================================================
-- STORAGE BUCKET (Manuel oluşturulacak)
-- =====================================================
-- Supabase Dashboard'dan şu bucket'ı oluşturun:
-- 
-- Bucket Name: submissions
-- Public: false
-- File size limit: 5MB
-- Allowed MIME types: application/pdf, application/msword, 
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--   application/zip, image/png, image/jpeg
--
-- RLS Policy (SQL Editor'da):
-- 
-- CREATE POLICY "Students can upload to own folder"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--     bucket_id = 'submissions' AND
--     (storage.foldername(name))[1] = auth.uid()::text
-- );
--
-- CREATE POLICY "Students can view own files"
-- ON storage.objects FOR SELECT
-- USING (
--     bucket_id = 'submissions' AND
--     (storage.foldername(name))[1] = auth.uid()::text
-- );
--
-- CREATE POLICY "Teachers can view classroom submissions"
-- ON storage.objects FOR SELECT
-- USING (
--     bucket_id = 'submissions' AND
--     EXISTS (
--         SELECT 1 FROM classrooms c
--         JOIN students s ON s.classroom_id = c.id
--         WHERE c.teacher_id = auth.uid()
--         AND (storage.foldername(name))[1] = s.id::text
--     )
-- );

COMMENT ON TABLE assignments IS 'Öğretmenlerin oluşturduğu ödevler';
COMMENT ON TABLE submissions IS 'Öğrencilerin ödev gönderimleri';
COMMENT ON TABLE submission_files IS 'Gönderim dosyaları (Supabase Storage referansları)';
COMMENT ON TABLE course_enrollments IS 'Öğrenci-Kurs kayıtları';
COMMENT ON TABLE notifications IS 'Uygulama içi bildirimler';
COMMENT ON TABLE analytics_events IS 'Dashboard analitik olayları';
