REVOKE ALL ON FUNCTION public.bootstrap_user(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_user(TEXT) TO authenticated;