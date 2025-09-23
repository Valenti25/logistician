-- Fix team_members table id column for text type
-- Since id is text type, we need to create a function that generates text-based unique IDs
CREATE OR REPLACE FUNCTION generate_team_member_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'tm_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Set the default value for id column
ALTER TABLE public.team_members ALTER COLUMN id SET DEFAULT generate_team_member_id();