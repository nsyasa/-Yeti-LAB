-- =====================================================
-- GÜVENLİ ÖĞRENCİ GİRİŞİ GÜNCELLEMESİ
-- =====================================================

-- 1. Students tablosuna şifre kolonu ekle (Eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'password') THEN
        ALTER TABLE students ADD COLUMN password VARCHAR(255);
    END IF;
END $$;

-- 2. Güvenli Login Fonksiyonu
CREATE OR REPLACE FUNCTION student_login_secure(
    p_classroom_code VARCHAR(5),
    p_display_name VARCHAR(255),
    p_password VARCHAR(255)
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
    v_stored_password VARCHAR(255);
    v_session_token VARCHAR(64);
    v_classroom_name VARCHAR(255);
    v_teacher_name VARCHAR(255);
BEGIN
    -- 1. Sınıfı bul
    SELECT c.id, c.name, up.full_name
    INTO v_classroom_id, v_classroom_name, v_teacher_name
    FROM classrooms c
    LEFT JOIN user_profiles up ON c.teacher_id = up.id
    WHERE c.code = UPPER(p_classroom_code) AND c.is_active = true;

    IF v_classroom_id IS NULL THEN
        RAISE EXCEPTION 'Geçersiz sınıf kodu';
    END IF;

    -- 2. Öğrenciyi bul (Sadece mevcut öğretmen tarafından eklenmiş öğrenciler)
    SELECT id, password, session_token
    INTO v_student_id, v_stored_password, v_session_token
    FROM students
    WHERE classroom_id = v_classroom_id 
      AND LOWER(display_name) = LOWER(p_display_name);

    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Bu isimde bir öğrenci bulunamadı. Lütfen isminizi kontrol edin veya öğretmeninize danışın.';
    END IF;

    -- 3. Şifre Kontrolü
    IF v_stored_password IS NULL THEN
        -- İlk giriş: Şifreyi kaydet (En az 3 karakter)
        IF p_password IS NOT NULL AND length(p_password) >= 3 THEN
           UPDATE students SET password = p_password WHERE id = v_student_id;
        ELSE
           RAISE EXCEPTION 'İlk girişiniz olduğu için bir şifre belirlemelisiniz (en az 3 karakter).';
        END IF;
    ELSE
        -- Sonraki girişler: Şifreyi kontrol et
        IF v_stored_password <> p_password THEN
            RAISE EXCEPTION 'Hatalı şifre. Lütfen tekrar deneyin.';
        END IF;
    END IF;

    -- 4. Session Token Kontrolü (Yoksa oluştur)
    IF v_session_token IS NULL THEN
        v_session_token := encode(gen_random_bytes(32), 'hex');
        UPDATE students SET session_token = v_session_token WHERE id = v_student_id;
    END IF;

    -- 5. Aktivite zamanını güncelle
    UPDATE students SET last_active_at = now() WHERE id = v_student_id;

    RETURN QUERY SELECT v_student_id, v_session_token, v_classroom_name, v_teacher_name;
END;
$$;

-- İzinleri ayarla
GRANT EXECUTE ON FUNCTION student_login_secure(VARCHAR, VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION student_login_secure(VARCHAR, VARCHAR, VARCHAR) TO authenticated;
