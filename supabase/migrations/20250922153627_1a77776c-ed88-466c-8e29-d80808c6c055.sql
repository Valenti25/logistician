-- Enable RLS on team_members table (if not already enabled)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Enable read access for all users" 
ON public.team_members 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.team_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.team_members 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.team_members 
FOR DELETE 
USING (true);

-- Insert material tracking entries for existing approved material requests
-- Don't include remaining_quantity since it appears to be a generated column
INSERT INTO public.material_tracking (project_id, description, category, total_quantity, used_quantity, date_usage)
SELECT DISTINCT 
    mr.project_id,
    mi.item_name,
    'approved'::text,
    mi.quantity,
    0,
    '{}'::jsonb
FROM public.material_requests mr
JOIN public.material_items mi ON mr.id = mi.request_id
WHERE mr.status = 'approved'
AND NOT EXISTS (
    SELECT 1 FROM public.material_tracking mt 
    WHERE mt.project_id = mr.project_id 
    AND mt.description = mi.item_name
);