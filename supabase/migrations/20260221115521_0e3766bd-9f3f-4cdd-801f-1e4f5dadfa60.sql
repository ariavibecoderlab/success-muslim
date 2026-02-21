
-- Create user_health_profiles table for IF onboarding
CREATE TABLE public.user_health_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  goal text,
  gender text,
  age integer,
  height_cm numeric,
  weight_kg numeric,
  goal_weight_kg numeric,
  bmi numeric,
  tdee numeric,
  eating_habits text,
  sleep_hours text,
  activity_level text,
  fasting_experience text,
  recommended_protocol text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own health profile"
  ON public.user_health_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own health profile"
  ON public.user_health_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own health profile"
  ON public.user_health_profiles FOR UPDATE
  USING (auth.uid() = user_id);
