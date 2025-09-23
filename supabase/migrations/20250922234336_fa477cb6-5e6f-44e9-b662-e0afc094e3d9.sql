-- Change team_size column to team_name to store team name instead of number
ALTER TABLE public.projects 
DROP COLUMN team_size,
ADD COLUMN team_name TEXT;