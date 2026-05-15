
-- Quran user preferences (tracker opt-in, reading settings, daily goals)
CREATE TABLE public.quran_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tracker_enabled BOOLEAN DEFAULT false,
  daily_goal_pages INTEGER DEFAULT 4,
  font_size INTEGER DEFAULT 24,
  translation_lang TEXT DEFAULT 'en',
  last_surah INTEGER DEFAULT 1,
  last_ayah INTEGER DEFAULT 1,
  night_mode BOOLEAN DEFAULT false,
  memorization_enabled BOOLEAN DEFAULT false,
  daily_memo_goal INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quran_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quran prefs" ON public.quran_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quran prefs" ON public.quran_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quran prefs" ON public.quran_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_quran_preferences_updated_at
  BEFORE UPDATE ON public.quran_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quran bookmarks
CREATE TABLE public.quran_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quran_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.quran_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON public.quran_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.quran_bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_quran_bookmarks_user ON public.quran_bookmarks(user_id);

-- Quran reading sessions (when tracker is active)
CREATE TABLE public.quran_reading_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_surah INTEGER NOT NULL,
  start_ayah INTEGER NOT NULL,
  end_surah INTEGER NOT NULL,
  end_ayah INTEGER NOT NULL,
  pages_read NUMERIC DEFAULT 0,
  ayahs_read INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quran_reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.quran_reading_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.quran_reading_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.quran_reading_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_quran_sessions_user_date ON public.quran_reading_sessions(user_id, date);

-- Quran memorization tracking
CREATE TABLE public.quran_memorization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  memorized_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, surah_number, ayah_number)
);

ALTER TABLE public.quran_memorization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memorization" ON public.quran_memorization FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memorization" ON public.quran_memorization FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own memorization" ON public.quran_memorization FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_quran_memorization_user ON public.quran_memorization(user_id);
