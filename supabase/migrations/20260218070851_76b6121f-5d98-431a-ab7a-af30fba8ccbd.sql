
-- Prayer settings table: stores calculation method, madhab, location, mosque overrides, and per-prayer adhan settings
CREATE TABLE public.prayer_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Location
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  city TEXT DEFAULT 'Kuala Lumpur',
  country TEXT DEFAULT 'Malaysia',
  location_method TEXT DEFAULT 'manual', -- 'gps' or 'manual'
  -- Calculation
  calculation_method INTEGER DEFAULT 3, -- Aladhan method ID (3=MWL)
  madhab TEXT DEFAULT 'shafi', -- 'shafi' or 'hanafi'
  -- Mosque overrides (null = use calculated)
  mosque_fajr TEXT,
  mosque_dhuhr TEXT,
  mosque_asr TEXT,
  mosque_maghrib TEXT,
  mosque_isha TEXT,
  mosque_enabled BOOLEAN DEFAULT false,
  -- Per-prayer adhan settings (jsonb with keys: fajr, dhuhr, asr, maghrib, isha)
  adhan_settings JSONB DEFAULT '{
    "fajr": {"mode": "full", "audio": "makkah", "preReminder": 0},
    "dhuhr": {"mode": "full", "audio": "makkah", "preReminder": 0},
    "asr": {"mode": "full", "audio": "makkah", "preReminder": 0},
    "maghrib": {"mode": "full", "audio": "makkah", "preReminder": 0},
    "isha": {"mode": "full", "audio": "makkah", "preReminder": 0}
  }'::jsonb,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayer_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prayer settings"
  ON public.prayer_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer settings"
  ON public.prayer_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer settings"
  ON public.prayer_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_prayer_settings_updated_at
  BEFORE UPDATE ON public.prayer_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
