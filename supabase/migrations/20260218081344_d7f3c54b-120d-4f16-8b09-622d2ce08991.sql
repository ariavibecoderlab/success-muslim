
-- Qiyam (Tahajjud) log
CREATE TABLE public.qiyam_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  performed BOOLEAN NOT NULL DEFAULT false,
  sleep_time TEXT,
  wake_time TEXT,
  tahajjud_start TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.qiyam_log ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_qiyam_log_user_date ON public.qiyam_log(user_id, date);
CREATE POLICY "Users can view own qiyam" ON public.qiyam_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own qiyam" ON public.qiyam_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own qiyam" ON public.qiyam_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own qiyam" ON public.qiyam_log FOR DELETE USING (auth.uid() = user_id);

-- Qiyam settings (sleep/wake defaults, alarm)
CREATE TABLE public.qiyam_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_sleep_time TEXT NOT NULL DEFAULT '23:00',
  default_wake_time TEXT NOT NULL DEFAULT '05:00',
  alarm_enabled BOOLEAN NOT NULL DEFAULT false,
  alarm_minutes_before_fajr INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.qiyam_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own qiyam settings" ON public.qiyam_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own qiyam settings" ON public.qiyam_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own qiyam settings" ON public.qiyam_settings FOR UPDATE USING (auth.uid() = user_id);

-- Ramadan settings
CREATE TABLE public.ramadan_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  suhoor_minutes_before_fajr INTEGER NOT NULL DEFAULT 30,
  daily_quran_goal INTEGER NOT NULL DEFAULT 4,
  daily_dhikr_goal INTEGER NOT NULL DEFAULT 100,
  tarawih_target INTEGER NOT NULL DEFAULT 8,
  suhoor_alarm BOOLEAN NOT NULL DEFAULT true,
  iftar_alarm BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ramadan_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ramadan settings" ON public.ramadan_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ramadan settings" ON public.ramadan_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ramadan settings" ON public.ramadan_settings FOR UPDATE USING (auth.uid() = user_id);

-- Ramadan daily log
CREATE TABLE public.ramadan_daily_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  fasted BOOLEAN NOT NULL DEFAULT true,
  quran_pages NUMERIC NOT NULL DEFAULT 0,
  tarawih_rakaat INTEGER NOT NULL DEFAULT 0,
  dhikr_count INTEGER NOT NULL DEFAULT 0,
  charity_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ramadan_daily_log ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX idx_ramadan_daily_user_date ON public.ramadan_daily_log(user_id, date);
CREATE POLICY "Users can view own ramadan log" ON public.ramadan_daily_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ramadan log" ON public.ramadan_daily_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ramadan log" ON public.ramadan_daily_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ramadan log" ON public.ramadan_daily_log FOR DELETE USING (auth.uid() = user_id);

-- Hajj/Umrah progress
CREATE TABLE public.hajj_umrah_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_type TEXT NOT NULL DEFAULT 'umrah',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  packing_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hajj_umrah_progress ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_hajj_umrah_user ON public.hajj_umrah_progress(user_id);
CREATE POLICY "Users can view own hajj progress" ON public.hajj_umrah_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hajj progress" ON public.hajj_umrah_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hajj progress" ON public.hajj_umrah_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hajj progress" ON public.hajj_umrah_progress FOR DELETE USING (auth.uid() = user_id);
