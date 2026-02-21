CREATE TABLE public.quran_reading_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  log_type text NOT NULL DEFAULT 'continue',
  start_surah integer NOT NULL,
  start_ayah integer NOT NULL,
  end_surah integer NOT NULL,
  end_ayah integer NOT NULL,
  ayah_count integer NOT NULL DEFAULT 0,
  page_count numeric NOT NULL DEFAULT 0,
  juz_segments jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quran_reading_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reading log" ON public.quran_reading_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reading log" ON public.quran_reading_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own reading log" ON public.quran_reading_log
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading log" ON public.quran_reading_log
  FOR DELETE USING (auth.uid() = user_id);