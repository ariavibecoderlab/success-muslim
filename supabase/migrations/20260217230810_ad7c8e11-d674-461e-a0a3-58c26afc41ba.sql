
-- Create page_overrides table for CMS visual editor
CREATE TABLE public.page_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  element_key text NOT NULL,
  override_type text NOT NULL CHECK (override_type IN ('text', 'image', 'style', 'position')),
  value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, element_key, override_type)
);

-- Enable RLS
ALTER TABLE public.page_overrides ENABLE ROW LEVEL SECURITY;

-- Anyone can read overrides (so all visitors see CMS content)
CREATE POLICY "Anyone can read page overrides"
  ON public.page_overrides FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert page overrides"
  ON public.page_overrides FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update page overrides"
  ON public.page_overrides FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete page overrides"
  ON public.page_overrides FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE TRIGGER update_page_overrides_updated_at
  BEFORE UPDATE ON public.page_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create cms-uploads storage bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-uploads', 'cms-uploads', true);

-- Storage policies: anyone can view
CREATE POLICY "Anyone can view cms uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-uploads');

-- Only admins can upload
CREATE POLICY "Admins can upload cms files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'cms-uploads' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update cms files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'cms-uploads' AND public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete cms files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cms-uploads' AND public.has_role(auth.uid(), 'admin'));
