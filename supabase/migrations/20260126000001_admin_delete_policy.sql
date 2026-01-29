-- RLS policy for admin to delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
    AND id != auth.uid()  -- Prevent self-deletion at DB level
  );
