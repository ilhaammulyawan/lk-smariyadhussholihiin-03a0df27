
-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke EXECUTE on has_role from public/authenticated (RLS uses it via owner privileges already)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- Tighten reports insert: require non-empty fields
DROP POLICY IF EXISTS "reports_public_insert" ON public.reports;
CREATE POLICY "reports_public_insert" ON public.reports FOR INSERT
  WITH CHECK (length(student_name) > 0 AND length(content) > 0 AND status = 'baru');

-- Tighten bookings insert: require non-empty
DROP POLICY IF EXISTS "bookings_public_insert" ON public.bookings;
CREATE POLICY "bookings_public_insert" ON public.bookings FOR INSERT
  WITH CHECK (length(teacher_name) > 0 AND length(teacher_wa) > 0 AND status = 'pending');
