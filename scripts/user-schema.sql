-- =====================================================
-- Yeti LAB - Kullanıcı Sistemi Veritabanı Şeması
-- Tarih: 29 Aralık 2024
-- =====================================================

-- =====================================================
-- 1. USER_PROFILES (Öğretmen/Admin Profilleri)
-- OAuth ile giriş yapan kullanıcılar için
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'teacher' CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: updated_at otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. CLASSROOMS (Sınıflar)
-- Öğretmenlerin oluşturduğu sınıflar
-- =====================================================

CREATE TABLE IF NOT EXISTS classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(5) NOT NULL UNIQUE,  -- 5 harfli benzersiz kod
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sınıf kodu oluşturma fonksiyonu (5 karakter, kolay okunur)
CREATE OR REPLACE FUNCTION generate_classroom_code()
RETURNS VARCHAR(5) AS $$
DECLARE
    chars VARCHAR := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- Karışık karakterler hariç (O/0, I/1, L)
    result VARCHAR(5) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..5 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Sınıf oluşturulduğunda otomatik kod ata
CREATE OR REPLACE FUNCTION set_classroom_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code VARCHAR(5);
    code_exists BOOLEAN;
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        LOOP
            new_code := generate_classroom_code();
            SELECT EXISTS(SELECT 1 FROM classrooms WHERE code = new_code) INTO code_exists;
            EXIT WHEN NOT code_exists;
        END LOOP;
        NEW.code := new_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_classroom_code_trigger
    BEFORE INSERT ON classrooms
    FOR EACH ROW
    EXECUTE FUNCTION set_classroom_code();

CREATE TRIGGER update_classrooms_updated_at
    BEFORE UPDATE ON classrooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index: Kod aramaları için
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON classrooms(code);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);

-- =====================================================
-- 3. STUDENTS (Öğrenciler)
-- Kod+isim ile veya OAuth ile giriş yapan öğrenciler
-- =====================================================

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sınıf ilişkisi (kod+isim girişi için zorunlu)
    classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
    
    -- OAuth kullanıcısı (opsiyonel - büyük öğrenciler için)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Öğrenci bilgileri
    display_name VARCHAR(255) NOT NULL,
    avatar_emoji VARCHAR(10) DEFAULT '🎓',
    
    -- Session token (kod+isim girişi için)
    session_token VARCHAR(64) UNIQUE,
    
    -- Aktivite takibi
    last_active_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ya classroom_id ya da user_id olmalı
    CONSTRAINT student_identity CHECK (
        classroom_id IS NOT NULL OR user_id IS NOT NULL
    )
);

-- Session token oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_session_token()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Öğrenci oluşturulduğunda session token ata (classroom girişi için)
CREATE OR REPLACE FUNCTION set_student_session_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_token IS NULL AND NEW.classroom_id IS NOT NULL THEN
        NEW.session_token := generate_session_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_student_session_token_trigger
    BEFORE INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION set_student_session_token();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_classroom ON students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_session ON students(session_token);

-- =====================================================
-- 4. STUDENT_PROGRESS (Öğrenci İlerlemesi)
-- Hangi öğrenci hangi dersi tamamladı
-- =====================================================

CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT now(),
    quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
    time_spent_seconds INTEGER DEFAULT 0,
    
    -- Her öğrenci her projeyi bir kez tamamlayabilir
    UNIQUE(student_id, project_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_course ON student_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_project ON student_progress(project_id);

-- =====================================================
-- RLS (Row Level Security) POLİTİKALARI
-- =====================================================

-- RLS aktifleştir
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES politikaları
-- Herkes kendi profilini okuyabilir ve güncelleyebilir
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Yeni kayıt için (auth.users'dan otomatik)
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- CLASSROOMS politikaları
-- Öğretmenler kendi sınıflarını yönetebilir
CREATE POLICY "Teachers can manage own classrooms"
    ON classrooms FOR ALL
    USING (teacher_id = auth.uid());

-- Herkes aktif sınıfları kod ile bulabilir (giriş için)
CREATE POLICY "Anyone can find active classrooms by code"
    ON classrooms FOR SELECT
    USING (is_active = true);

-- STUDENTS politikaları
-- Öğretmenler kendi sınıflarındaki öğrencileri görebilir
CREATE POLICY "Teachers can view classroom students"
    ON students FOR SELECT
    USING (
        classroom_id IN (
            SELECT id FROM classrooms WHERE teacher_id = auth.uid()
        )
    );

-- OAuth öğrenciler kendi profillerini görebilir
CREATE POLICY "OAuth students can view own profile"
    ON students FOR SELECT
    USING (user_id = auth.uid());

-- Yeni öğrenci kaydı (kod+isim girişi - anon için)
CREATE POLICY "Anyone can create student with classroom code"
    ON students FOR INSERT
    WITH CHECK (
        classroom_id IN (
            SELECT id FROM classrooms WHERE is_active = true
        )
    );

-- Öğrenciler kendi bilgilerini güncelleyebilir
CREATE POLICY "Students can update own profile"
    ON students FOR UPDATE
    USING (user_id = auth.uid() OR session_token IS NOT NULL);

-- STUDENT_PROGRESS politikaları
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

-- OAuth öğrenciler kendi ilerlemelerini görebilir
CREATE POLICY "Students can view own progress"
    ON student_progress FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM students WHERE user_id = auth.uid()
        )
    );

-- İlerleme kaydı ekleme (herkes kendi için)
CREATE POLICY "Students can insert own progress"
    ON student_progress FOR INSERT
    WITH CHECK (true);  -- Session token kontrolü uygulama tarafında yapılacak

-- =====================================================
-- YARDIMCI FONKSİYONLAR
-- =====================================================

-- Öğrenci giriş fonksiyonu (kod + isim)
CREATE OR REPLACE FUNCTION student_login(
    p_classroom_code VARCHAR(5),
    p_display_name VARCHAR(255)
)
RETURNS TABLE (
    student_id UUID,
    session_token VARCHAR(64),
    classroom_name VARCHAR(255),
    teacher_name VARCHAR(255)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_classroom_id UUID;
    v_student_id UUID;
    v_session_token VARCHAR(64);
    v_classroom_name VARCHAR(255);
    v_teacher_name VARCHAR(255);
BEGIN
    -- Sınıfı bul
    SELECT c.id, c.name, up.full_name
    INTO v_classroom_id, v_classroom_name, v_teacher_name
    FROM classrooms c
    LEFT JOIN user_profiles up ON c.teacher_id = up.id
    WHERE c.code = UPPER(p_classroom_code) AND c.is_active = true;
    
    IF v_classroom_id IS NULL THEN
        RAISE EXCEPTION 'Geçersiz sınıf kodu';
    END IF;
    
    -- Aynı isimde öğrenci var mı kontrol et
    SELECT id, students.session_token
    INTO v_student_id, v_session_token
    FROM students
    WHERE classroom_id = v_classroom_id 
      AND LOWER(students.display_name) = LOWER(p_display_name);
    
    -- Yoksa yeni öğrenci oluştur
    IF v_student_id IS NULL THEN
        INSERT INTO students (classroom_id, display_name)
        VALUES (v_classroom_id, p_display_name)
        RETURNING id, students.session_token INTO v_student_id, v_session_token;
    END IF;
    
    -- last_active_at güncelle
    UPDATE students SET last_active_at = now() WHERE id = v_student_id;
    
    RETURN QUERY SELECT v_student_id, v_session_token, v_classroom_name, v_teacher_name;
END;
$$;

-- Fonksiyon izinleri (anonim kullanıcılar da çağırabilir)
GRANT EXECUTE ON FUNCTION student_login(VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION student_login(VARCHAR, VARCHAR) TO authenticated;

-- =====================================================
-- KULLANICI PROFİLİ OLUŞTURMA TRİGGER'I
-- Yeni auth.users kaydında otomatik profil oluştur
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        'teacher'  -- Default rol: öğretmen
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auth.users'a yeni kayıt eklendiğinde
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- BAŞARILI! 🎉
-- Bu SQL'i Supabase SQL Editor'da çalıştırın.
-- =====================================================
