-- =====================================================
-- USER PROFILES UPDATE - Yeni alanlar ekleme
-- Bu scripti Supabase SQL Editor'da çalıştırın
-- =====================================================

-- 1. user_profiles tablosuna yeni alanlar ekle
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS district VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

-- 2. Mevcut kayıtları güncelle (eğer varsa)
-- Eğer okul bilgisi doluysa profile complete say
UPDATE public.user_profiles 
SET is_profile_complete = true 
WHERE school_name IS NOT NULL AND school_name != '';

-- 3. RLS politikalarını güncelle (kullanıcı kendi profilini güncelleyebilir)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Profil güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_role VARCHAR DEFAULT NULL,
    p_full_name VARCHAR DEFAULT NULL,
    p_school_name VARCHAR DEFAULT NULL,
    p_city VARCHAR DEFAULT NULL,
    p_district VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Mevcut kullanıcıyı al
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Oturum açılmamış');
    END IF;
    
    -- Profili güncelle
    UPDATE public.user_profiles
    SET 
        role = COALESCE(p_role, role),
        full_name = COALESCE(p_full_name, full_name),
        school_name = COALESCE(p_school_name, school_name),
        city = COALESCE(p_city, city),
        district = COALESCE(p_district, district),
        is_profile_complete = true,
        updated_at = NOW()
    WHERE id = v_user_id;
    
    -- Sonucu döndür
    SELECT jsonb_build_object(
        'success', true,
        'user_id', id,
        'role', role,
        'full_name', full_name,
        'school_name', school_name,
        'city', city,
        'district', district,
        'is_profile_complete', is_profile_complete
    )
    INTO v_result
    FROM public.user_profiles
    WHERE id = v_user_id;
    
    RETURN v_result;
END;
$$;

-- 5. Profil durumu kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.check_profile_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_profile RECORD;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('is_logged_in', false);
    END IF;
    
    SELECT * INTO v_profile
    FROM public.user_profiles
    WHERE id = v_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'is_logged_in', true,
            'has_profile', false,
            'is_profile_complete', false
        );
    END IF;
    
    RETURN jsonb_build_object(
        'is_logged_in', true,
        'has_profile', true,
        'is_profile_complete', COALESCE(v_profile.is_profile_complete, false),
        'role', v_profile.role,
        'full_name', v_profile.full_name,
        'school_name', v_profile.school_name,
        'city', v_profile.city,
        'district', v_profile.district
    );
END;
$$;

-- İşlem tamamlandı mesajı
SELECT 'Profil alanları başarıyla eklendi!' as result;
