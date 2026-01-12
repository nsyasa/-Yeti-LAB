-- Migration: Add Rich Text Editor fields to projects table
-- Date: 2026-01-12
-- Description: Adds mission, theory, and code_explanation fields for RTE support

-- Add new columns if they don't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS mission TEXT,
ADD COLUMN IF NOT EXISTS theory TEXT,
ADD COLUMN IF NOT EXISTS code_explanation TEXT;

-- Add comments for documentation
COMMENT ON COLUMN projects.mission IS 'Project goal/mission (supports Markdown via RTE)';
COMMENT ON COLUMN projects.theory IS 'Theoretical knowledge/explanation (supports Markdown via RTE)';
COMMENT ON COLUMN projects.code_explanation IS 'Code explanation (supports Markdown via RTE)';

-- Optional: Create indexes for search if needed
-- CREATE INDEX IF NOT EXISTS idx_projects_mission_search ON projects USING gin(to_tsvector('turkish', mission));
-- CREATE INDEX IF NOT EXISTS idx_projects_theory_search ON projects USING gin(to_tsvector('turkish', theory));
