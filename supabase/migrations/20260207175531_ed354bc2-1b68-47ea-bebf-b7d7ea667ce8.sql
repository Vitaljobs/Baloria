
-- Add visible unique ID to user_profiles (e.g. BAL-4521)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS visible_id TEXT UNIQUE;

-- Function to generate unique visible IDs like BAL-XXXX
CREATE OR REPLACE FUNCTION public.generate_visible_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN;
BEGIN
  done := FALSE;
  WHILE NOT done LOOP
    new_id := 'BAL-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    done := NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE visible_id = new_id);
  END LOOP;
  NEW.visible_id := new_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate visible_id on insert
DROP TRIGGER IF EXISTS set_visible_id ON public.user_profiles;
CREATE TRIGGER set_visible_id
BEFORE INSERT ON public.user_profiles
FOR EACH ROW
WHEN (NEW.visible_id IS NULL)
EXECUTE FUNCTION public.generate_visible_id();

-- Backfill existing profiles
UPDATE public.user_profiles 
SET visible_id = 'BAL-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
WHERE visible_id IS NULL;

-- Create profile reports table
CREATE TABLE IF NOT EXISTS public.profile_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
ON public.profile_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.profile_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- Admins can view all reports (using project-scoped has_role)
CREATE POLICY "Admins can view all reports"
ON public.profile_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update reports
CREATE POLICY "Admins can update reports"
ON public.profile_reports
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
