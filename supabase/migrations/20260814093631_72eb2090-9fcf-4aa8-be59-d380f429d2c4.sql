ALTER TABLE public.entitlements
  ADD COLUMN trial_started_at timestamptz;

-- Start a 14-day trial (once per account) ------------------------------------
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS public.plan_tier
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  current public.entitlements;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.entitlements (user_id) VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO current FROM public.entitlements WHERE user_id = uid;

  IF current.plan = 'pro' THEN
    RETURN current.plan;
  END IF;

  IF current.trial_started_at IS NOT NULL THEN
    RAISE EXCEPTION 'Your trial has already been used.';
  END IF;

  UPDATE public.entitlements
     SET plan = 'trial',
         trial_started_at = now(),
         trial_ends_at = now() + interval '14 days',
         dynamic_qr_limit = 5
   WHERE user_id = uid;

  RETURN 'trial'::public.plan_tier;
END;
$$;

REVOKE ALL ON FUNCTION public.start_trial() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated, service_role;

-- Resolve a short link and record the scan -----------------------------------
CREATE OR REPLACE FUNCTION public.record_scan(
  _slug text,
  _visitor_hash text DEFAULT '',
  _country text DEFAULT '',
  _device text DEFAULT '',
  _referrer text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target public.dynamic_codes;
BEGIN
  SELECT * INTO target FROM public.dynamic_codes
   WHERE slug = lower(_slug) AND is_active = true;

  IF target.id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.scans (code_id, visitor_hash, country, device, referrer)
  VALUES (
    target.id,
    left(coalesce(_visitor_hash, ''), 64),
    left(coalesce(_country, ''), 8),
    left(coalesce(_device, ''), 16),
    left(coalesce(_referrer, ''), 300)
  );

  UPDATE public.dynamic_codes
     SET scan_count = scan_count + 1
   WHERE id = target.id;

  RETURN target.destination_url;
END;
$$;

REVOKE ALL ON FUNCTION public.record_scan(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_scan(text, text, text, text, text) TO anon, authenticated, service_role;