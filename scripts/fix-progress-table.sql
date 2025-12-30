-- =====================================================
-- Yeti LAB - Student Progress Tablo Düzeltmesi
-- Tarih: 30 Aralık 2024
-- 
-- Bu script student_progress tablosunu basitleştirir.
-- course_id ve project_id artık TEXT ve INTEGER tipinde.
-- =====================================================

-- Önce mevcut tabloyu sil (varsa)
DROP TABLE IF EXISTS student_progress CASCADE;

-- Yeni basitleştirilmiş tablo
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,  -- örn: "arduino", "microbit"
    project_id INTEGER NOT NULL,  -- örn: 1, 2, 3
    completed_at TIMESTAMPTZ DEFAULT now(),
    quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
    
    -- Her öğrenci her projeyi bir kez tamamlayabilir
    UNIQUE(student_id, project_id)
);

-- Indexes
CREATE INDEX idx_progress_student ON student_progress(student_id);
CREATE INDEX idx_progress_course ON student_progress(course_id);
CREATE INDEX idx_progress_project ON student_progress(project_id);

-- =====================================================
-- RLS (Row Level Security) POLİTİKALARI
-- =====================================================

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Öğretmenler kendi sınıflarındaki ilerlemeyi görebilir
CREATE POLICY "Teachers can view classroom progress"
    ON student_progress FOR SELECT
    USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN classrooms c ON s.classroom_id = c.id
            WHERE c.teacher_id = auth.uid()
        )
    );

-- Herkes ilerleme kaydı ekleyebilir (session token kontrolü uygulama tarafında)
CREATE POLICY "Anyone can insert progress"
    ON student_progress FOR INSERT
    WITH CHECK (true);

-- Herkes kendi ilerlemesini silebilir
CREATE POLICY "Students can delete own progress"
    ON student_progress FOR DELETE
    USING (true);

-- Herkes ilerlemesini okuyabilir
CREATE POLICY "Anyone can read progress"
    ON student_progress FOR SELECT
    USING (true);

-- =====================================================
-- BAŞARILI! 🎉
-- Bu SQL'i Supabase SQL Editor'da çalıştırın.
-- =====================================================
