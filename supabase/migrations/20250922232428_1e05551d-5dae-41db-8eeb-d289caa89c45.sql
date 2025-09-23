-- Fix security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION generate_team_member_id() RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'tm_' || substr(md5(random()::text), 1, 8);
END;
$$;