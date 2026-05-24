CREATE TABLE public.short_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  target_url text NOT NULL,
  note text,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_short_links_code ON public.short_links(code);

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "short_links_public_read" ON public.short_links
  FOR SELECT USING (true);

CREATE POLICY "short_links_public_insert" ON public.short_links
  FOR INSERT WITH CHECK (
    length(code) BETWEEN 3 AND 32
    AND code ~ '^[a-zA-Z0-9_-]+$'
    AND target_url ~* '^https?://'
    AND length(target_url) <= 2048
    AND clicks = 0
  );

CREATE POLICY "short_links_admin_update" ON public.short_links
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "short_links_admin_delete" ON public.short_links
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.increment_short_link_click(_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
BEGIN
  UPDATE public.short_links
    SET clicks = clicks + 1
    WHERE code = _code
    RETURNING target_url INTO _url;
  RETURN _url;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_short_link_click(text) TO anon, authenticated;