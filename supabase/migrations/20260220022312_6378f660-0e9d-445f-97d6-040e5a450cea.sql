
-- Add new columns to quran_preferences
ALTER TABLE public.quran_preferences
  ADD COLUMN IF NOT EXISTS daily_target_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_selected_at TIMESTAMPTZ DEFAULT NULL;

-- Create simple daily log table
CREATE TABLE IF NOT EXISTS public.quran_daily_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_met BOOLEAN NOT NULL DEFAULT false,
  surah_number INTEGER,
  ayah_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS
ALTER TABLE public.quran_daily_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily log"
  ON public.quran_daily_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily log"
  ON public.quran_daily_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily log"
  ON public.quran_daily_log FOR UPDATE
  USING (auth.uid() = user_id);
