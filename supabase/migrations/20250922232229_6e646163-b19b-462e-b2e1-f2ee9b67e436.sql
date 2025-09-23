-- Fix team_members table id column to have proper default value
ALTER TABLE public.team_members ALTER COLUMN id SET DEFAULT gen_random_uuid();