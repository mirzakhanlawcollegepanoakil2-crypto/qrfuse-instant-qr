CREATE TABLE public.dynamic_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  destination_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  style jsonb NOT NULL DEFAULT '{}'::jsonb,
  scan_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dynamic_codes_slug_format CHECK (slug ~ '^[a-z0-9-]{4,32}$'),
  CONSTRAINT dynamic_codes_destination_format CHECK (destination_url ~* '^https?://')
);

CREATE INDEX dynamic_codes_user_id_idx ON public.dynamic_codes (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dynamic_codes TO authenticated;
GRANT SELECT ON public.dynamic_codes TO anon;
GRANT ALL ON public.dynamic_codes TO service_role;

ALTER TABLE public.dynamic_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read own codes"
  ON public.dynamic_codes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all codes"
  ON public.dynamic_codes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Active codes are resolvable"
  ON public.dynamic_codes FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Owners can create own codes"
  ON public.dynamic_codes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own codes"
  ON public.dynamic_codes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete own codes"
  ON public.dynamic_codes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER dynamic_codes_set_updated_at
  BEFORE UPDATE ON public.dynamic_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Scans ---------------------------------------------------------------------
CREATE TABLE public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.dynamic_codes(id) ON DELETE CASCADE,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  visitor_hash text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT ''
);

CREATE INDEX scans_code_id_scanned_at_idx ON public.scans (code_id, scanned_at DESC);

GRANT SELECT ON public.scans TO authenticated;
GRANT ALL ON public.scans TO service_role;

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read scans for own codes"
  ON public.scans FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dynamic_codes c
    WHERE c.id = scans.code_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Admins can read all scans"
  ON public.scans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Plan enforcement helper ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.count_dynamic_codes(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.dynamic_codes WHERE user_id = _user_id
$$;

REVOKE ALL ON FUNCTION public.count_dynamic_codes(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.count_dynamic_codes(uuid) TO authenticated, service_role;