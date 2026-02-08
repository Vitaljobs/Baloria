-- Fix the trigger: change 'user' to 'member' which is allowed by the check constraint
CREATE OR REPLACE FUNCTION public.handle_baloria_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  baloria_project_id UUID;
BEGIN
  SELECT id INTO baloria_project_id FROM public.projects WHERE slug = 'baloria' LIMIT 1;
  
  IF baloria_project_id IS NOT NULL THEN
    -- Create BALORIA profile
    INSERT INTO public.user_profiles (user_id, project_id, display_name)
    VALUES (NEW.id, baloria_project_id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT DO NOTHING;
    
    -- Create user stats
    INSERT INTO public.baloria_user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
    
    -- Give user role
    INSERT INTO public.user_roles (user_id, project_id, role)
    VALUES (NEW.id, baloria_project_id, 'user')
    ON CONFLICT DO NOTHING;
    
    -- Give project access (use 'member' to match check constraint)
    INSERT INTO public.user_project_access (user_id, project_id, role)
    VALUES (NEW.id, baloria_project_id, 'member')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;