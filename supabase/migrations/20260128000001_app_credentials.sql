CREATE TABLE public.app_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

INSERT INTO public.app_credentials (username, password)
VALUES ('cosmax', '2026@');

ALTER TABLE public.app_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view credentials" ON public.app_credentials
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update credentials" ON public.app_credentials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE TRIGGER update_app_credentials_updated_at
  BEFORE UPDATE ON public.app_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 신규 유저 기본 활성 상태로 변경
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_role TEXT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  IF user_count = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := 'user';
  END IF;
  
  INSERT INTO public.users (id, email, name, avatar_url, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    new_role,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
