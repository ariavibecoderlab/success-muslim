
-- Add onboarding fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS focus_areas JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS consistency_level TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT false;
