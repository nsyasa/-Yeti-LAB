-- =====================================================
-- Mucit Atölyesi - Supabase Veritabanı Şeması
-- Bu SQL'i Supabase SQL Editor'da çalıştırın
-- =====================================================

-- 1. COURSES (Kurslar) Tablosu
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    theme_color VARCHAR(50),
    meta JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PHASES (Bölümler/Fazlar) Tablosu
CREATE TABLE IF NOT EXISTS phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    position INTEGER DEFAULT 0,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, name)
);

-- 3. PROJECTS (Projeler/Dersler) Tablosu
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    materials JSONB DEFAULT '[]'::jsonb,
    circuit TEXT,
    code TEXT,
    simulation VARCHAR(255),
    challenge TEXT,
    component_info JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, slug)
);

-- 4. COURSE_COMPONENTS (Kurs Bileşenleri) Tablosu
CREATE TABLE IF NOT EXISTS course_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, key)
);

-- 5. CONTENT_ADMINS (İçerik Yöneticileri) Tablosu
CREATE TABLE IF NOT EXISTS content_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'editor',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- 6. COURSE_PUBLISH_AUDIT (Yayın Denetim Logu) Tablosu
CREATE TABLE IF NOT EXISTS course_publish_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ DEFAULT now(),
    details JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- İNDEKSLER (Performans için)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_phases_course ON phases(course_id);
CREATE INDEX IF NOT EXISTS idx_projects_course ON projects(course_id);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(phase_id);
CREATE INDEX IF NOT EXISTS idx_components_course ON course_components(course_id);

-- =====================================================
-- RLS (Row Level Security) Politikaları
-- =====================================================

-- RLS aktifleştir
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_publish_audit ENABLE ROW LEVEL SECURITY;

-- Herkes yayınlanmış kursları okuyabilir
CREATE POLICY "Public can read published courses" ON courses
    FOR SELECT USING (is_published = true);

-- Herkes fazları okuyabilir (kurs yayınlandıysa)
CREATE POLICY "Public can read phases" ON phases
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = phases.course_id AND courses.is_published = true)
    );

-- Herkes projeleri okuyabilir (kurs yayınlandıysa)
CREATE POLICY "Public can read projects" ON projects
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = projects.course_id AND courses.is_published = true)
    );

-- Herkes bileşenleri okuyabilir
CREATE POLICY "Public can read components" ON course_components
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = course_components.course_id AND courses.is_published = true)
    );

-- Content adminler tam erişim
CREATE POLICY "Admins full access to courses" ON courses
    FOR ALL USING (
        EXISTS (SELECT 1 FROM content_admins WHERE content_admins.user_id = auth.uid())
    );

CREATE POLICY "Admins full access to phases" ON phases
    FOR ALL USING (
        EXISTS (SELECT 1 FROM content_admins WHERE content_admins.user_id = auth.uid())
    );

CREATE POLICY "Admins full access to projects" ON projects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM content_admins WHERE content_admins.user_id = auth.uid())
    );

CREATE POLICY "Admins full access to components" ON course_components
    FOR ALL USING (
        EXISTS (SELECT 1 FROM content_admins WHERE content_admins.user_id = auth.uid())
    );

CREATE POLICY "Admins can view audit" ON course_publish_audit
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM content_admins WHERE content_admins.user_id = auth.uid())
    );

-- =====================================================
-- publish_course FONKSIYONU
-- =====================================================

CREATE OR REPLACE FUNCTION publish_course(p_course_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid UUID;
    v_phase_count INTEGER;
    v_project_count INTEGER;
BEGIN
    -- Kullanıcı ID'sini al
    v_uid := auth.uid();

    -- Admin kontrolü
    IF NOT EXISTS (SELECT 1 FROM content_admins WHERE user_id = v_uid) THEN
        RAISE EXCEPTION 'Yetki hatası: Bu işlem için admin olmalısınız';
    END IF;

    -- En az 1 faz kontrolü
    SELECT COUNT(*) INTO v_phase_count FROM phases WHERE course_id = p_course_id;
    IF v_phase_count = 0 THEN
        RAISE EXCEPTION 'Doğrulama hatası: Kursun en az 1 bölümü olmalı';
    END IF;

    -- En az 1 proje kontrolü
    SELECT COUNT(*) INTO v_project_count FROM projects WHERE course_id = p_course_id;
    IF v_project_count = 0 THEN
        RAISE EXCEPTION 'Doğrulama hatası: Kursun en az 1 projesi olmalı';
    END IF;

    -- Kursu yayınla
    UPDATE courses 
    SET is_published = true, 
        updated_at = now(), 
        version = version + 1 
    WHERE id = p_course_id;

    -- Audit kaydı ekle
    INSERT INTO course_publish_audit(course_id, performed_by, details)
    VALUES (p_course_id, v_uid, jsonb_build_object(
        'phase_count', v_phase_count,
        'project_count', v_project_count,
        'note', 'Kurs yayınlandı'
    ));
END;
$$;

-- Fonksiyon izinleri
REVOKE EXECUTE ON FUNCTION publish_course(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publish_course(UUID) TO authenticated;

-- Audit tablosu okuma izni
GRANT SELECT ON course_publish_audit TO authenticated;

-- =====================================================
-- BAŞARILI! 🎉
-- =====================================================
