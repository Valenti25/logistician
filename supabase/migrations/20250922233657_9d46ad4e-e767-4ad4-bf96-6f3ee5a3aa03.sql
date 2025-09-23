-- Add assigned_members column to projects table to store team members assigned to the project
ALTER TABLE public.projects ADD COLUMN assigned_members TEXT[];