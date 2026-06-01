
-- 1) Drop URL shortener
DROP FUNCTION IF EXISTS public.increment_short_link_click(text);
DROP TABLE IF EXISTS public.short_links;

-- 2) Bookings: revoke teacher_wa from anon via column-level grants.
--    Public can still read other columns (needed for jadwal grid).
--    Authenticated (admin) retains full access.
REVOKE SELECT ON public.bookings FROM anon;
GRANT SELECT (id, date, start_time, end_time, status, subject, student_count, notes, teacher_name, created_at, updated_at)
  ON public.bookings TO anon;

-- 3) RPC for cek-status: lookup by WA/name without leaking teacher_wa
CREATE OR REPLACE FUNCTION public.lookup_bookings(_q text)
RETURNS TABLE(status text, date date, start_time time, end_time time, subject text, teacher_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.status, b.date, b.start_time, b.end_time, b.subject, b.teacher_name
  FROM public.bookings b
  WHERE length(_q) >= 3
    AND (b.teacher_wa ILIKE '%' || _q || '%' OR b.teacher_name ILIKE '%' || _q || '%')
  ORDER BY b.date DESC
  LIMIT 20
$$;
REVOKE ALL ON FUNCTION public.lookup_bookings(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_bookings(text) TO anon, authenticated;

-- 4) Settings: hide sensitive keys from anon, expose to authenticated (admin)
DROP POLICY IF EXISTS settings_public_read ON public.settings;
CREATE POLICY settings_anon_read ON public.settings
  FOR SELECT TO anon
  USING (key NOT IN ('admin_wa'));
CREATE POLICY settings_auth_read ON public.settings
  FOR SELECT TO authenticated
  USING (true);

-- Expose admin_wa publicly via a safe RPC (used by booking page to compose WA link)
CREATE OR REPLACE FUNCTION public.get_public_admin_wa()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM public.settings WHERE key = 'admin_wa' LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_public_admin_wa() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_admin_wa() TO anon, authenticated;

-- 5) Storage: tighten public upload to reports/ prefix only; add admin policy for other paths
DROP POLICY IF EXISTS public_upload_reports ON storage.objects;
CREATE POLICY public_upload_reports ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'public-files'
    AND (storage.foldername(name))[1] = 'reports'
  );
CREATE POLICY admin_upload_files ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'public-files'
    AND has_role(auth.uid(), 'admin')
  );

-- 6) Lock down SECURITY DEFINER helpers — revoke direct EXECUTE from public roles
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
