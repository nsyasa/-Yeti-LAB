-- ============================================
-- HOTFIX: gen_random_bytes schema qualification
-- Run this in Supabase SQL Editor to fix the error:
-- "function gen_random_bytes(integer) does not exist"
-- ============================================

-- Supabase'de pgcrypto extensions şemasında olduğu için
-- fonksiyonları extensions.gen_random_bytes kullanacak şekilde güncelle

-- 1. generate_session_token fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION public.generate_session_token()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(extensions.gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 2. student_login_secure fonksiyonunu da güncelle
-- (gen_random_bytes inline kullanıyorsa)
CREATE OR REPLACE FUNCTION public.student_login_secure(
    p_classroom_code VARCHAR(10),
    p_display_name VARCHAR(100),
    p_password VARCHAR(100)
)
RETURNS TABLE (
    out_student_id UUID,
    out_session_token VARCHAR(64),
    out_classroom_name VARCHAR(100),
    out_teacher_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_classroom_id UUID;
    v_classroom_name VARCHAR(100);
    v_teacher_id UUID;
    v_teacher_name TEXT;
    v_student_id UUID;
    v_stored_password VARCHAR(100);
    v_session_token VARCHAR(64);
BEGIN
    -- 1. Sınıf kodunu kontrol et
    SELECT c.id, c.name, c.teacher_id INTO v_classroom_id, v_classroom_name, v_teacher_id
    FROM classrooms c
    WHERE c.code = p_classroom_code;

    IF v_classroom_id IS NULL THEN
        RAISE EXCEPTION 'Bu kodla bir sınıf bulunamadı. Lütfen kodu kontrol edin.';
    END IF;

    -- 2. Öğretmen adını al
    SELECT COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        u.email
    ) INTO v_teacher_name
    FROM auth.users u
    WHERE u.id = v_teacher_id;

    -- 3. Öğrenci var mı kontrol et (display_name + classroom_id)
    SELECT s.id, s.password, s.session_token
    INTO v_student_id, v_stored_password, v_session_token
    FROM students s
    WHERE s.display_name ILIKE p_display_name
      AND s.classroom_id = v_classroom_id;

    IF v_student_id IS NULL THEN
        -- İlk giriş: Yeni öğrenci oluştur
        INSERT INTO students (display_name, classroom_id, password, session_token)
        VALUES (
            p_display_name,
            v_classroom_id,
            p_password,
            encode(extensions.gen_random_bytes(32), 'hex')
        )
        RETURNING id, session_token INTO v_student_id, v_session_token;
    ELSE
        -- Sonraki girişler: Şifreyi kontrol et
        IF v_stored_password <> p_password THEN
            RAISE EXCEPTION 'Hatalı şifre. Lütfen tekrar deneyin.';
        END IF;
    END IF;

    -- 4. Session Token yoksa oluştur
    IF v_session_token IS NULL THEN
        v_session_token := encode(extensions.gen_random_bytes(32), 'hex');
        UPDATE students SET session_token = v_session_token WHERE id = v_student_id;
    END IF;

    -- 5. Aktivite zamanını güncelle
    UPDATE students SET last_active_at = now() WHERE id = v_student_id;

    -- 6. Sonuç döndür
    RETURN QUERY SELECT v_student_id, v_session_token, v_classroom_name, v_teacher_name;
END;
$$;

-- ============================================
-- Verification
-- ============================================
-- Test: Bu sorgu hata vermemeli
-- SELECT encode(extensions.gen_random_bytes(32), 'hex');

COMMENT ON FUNCTION public.generate_session_token IS 'Generates 64-char hex session token using extensions.gen_random_bytes';
