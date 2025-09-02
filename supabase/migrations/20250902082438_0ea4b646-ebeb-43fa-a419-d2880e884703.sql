-- Tighten profiles RLS and add safe RPCs

-- 1) Restrict direct SELECT on profiles to the owner only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2) Safe public profile accessor (non-sensitive fields only)
CREATE OR REPLACE FUNCTION public.get_public_profile(_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  rating numeric,
  total_reviews integer,
  created_at timestamptz
) AS $$
  SELECT id, full_name, avatar_url, rating, total_reviews, created_at
  FROM public.profiles
  WHERE id = _id;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.get_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;

-- 3) Safe aggregate counts for homepage stats
CREATE OR REPLACE FUNCTION public.get_platform_counts()
RETURNS TABLE (
  users_count bigint,
  items_count bigint,
  services_count bigint
) AS $$
  SELECT 
    (SELECT count(*) FROM public.profiles) AS users_count,
    (SELECT count(*) FROM public.items WHERE availability = true) AS items_count,
    (SELECT count(*) FROM public.services WHERE is_active = true) AS services_count;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.get_platform_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_counts() TO anon, authenticated;