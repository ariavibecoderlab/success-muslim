
-- Add selawat_count and sunnah_solat to ramadan_daily_log
ALTER TABLE public.ramadan_daily_log ADD COLUMN selawat_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.ramadan_daily_log ADD COLUMN sunnah_solat jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Create dakwah_posters table
CREATE TABLE public.dakwah_posters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dakwah_posters ENABLE ROW LEVEL SECURITY;

-- Anyone can view posters
CREATE POLICY "Anyone can view dakwah posters"
  ON public.dakwah_posters FOR SELECT
  USING (true);

-- Admins can manage posters
CREATE POLICY "Admins can manage dakwah posters"
  ON public.dakwah_posters FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for dakwah posters
INSERT INTO storage.buckets (id, name, public) VALUES ('dakwah-posters', 'dakwah-posters', true);

-- Storage policies for dakwah posters
CREATE POLICY "Anyone can view dakwah poster files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dakwah-posters');

CREATE POLICY "Admins can upload dakwah posters"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dakwah-posters' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete dakwah posters"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dakwah-posters' AND has_role(auth.uid(), 'admin'::app_role));
