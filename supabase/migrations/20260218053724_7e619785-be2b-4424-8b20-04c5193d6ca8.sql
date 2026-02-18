-- Create quran_log table for daily reading tracking
CREATE TABLE public.quran_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  pages_read INTEGER NOT NULL DEFAULT 0,
  juz_number INTEGER,
  surah_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one entry per user per date
CREATE UNIQUE INDEX idx_quran_log_user_date ON public.quran_log (user_id, date);

-- Enable RLS
ALTER TABLE public.quran_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own quran log"
  ON public.quran_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quran log"
  ON public.quran_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quran log"
  ON public.quran_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quran log"
  ON public.quran_log FOR DELETE
  USING (auth.uid() = user_id);