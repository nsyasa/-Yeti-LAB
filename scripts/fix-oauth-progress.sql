-- =====================================================
-- Yeti LAB - OAuth Kullanıcıları İçin Progress İzni
-- Tarih: 2 Ocak 2026
-- 
-- Bu script, OAuth ile giriş yapan kullanıcıların
-- (students tablosunda kaydı olmayanların) ilerleme
-- kaydedebilmesi için FK constraint'ini kaldırır.
-- =====================================================

-- SEÇENEK 1: FK Constraint'i Kaldır (Önerilen)
-- Bu, student_progress.student_id alanının artık
-- students tablosuna referans vermemesini sağlar.
-- Böylece OAuth user UUID'leri de kullanılabilir.

ALTER TABLE student_progress 
DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;

-- =====================================================
-- ALTERNATİF: Yeni bir user_progress tablosu oluştur
-- (Eğer students FK'sını korumak istiyorsanız)
-- =====================================================

-- CREATE TABLE IF NOT EXISTS user_progress (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL,  -- auth.users veya students ID olabilir
--     course_id TEXT NOT NULL,
--     project_id INTEGER NOT NULL,
--     completed_at TIMESTAMPTZ DEFAULT now(),
--     quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
--     UNIQUE(user_id, project_id)
-- );

-- =====================================================
-- Bu SQL'i Supabase SQL Editor'da çalıştırın!
-- =====================================================
