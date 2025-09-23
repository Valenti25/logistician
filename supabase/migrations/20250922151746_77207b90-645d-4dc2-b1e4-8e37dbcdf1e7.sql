-- Create material_tracking table for detailed tracking
CREATE TABLE public.material_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'pending',
  description TEXT NOT NULL,
  total_quantity NUMERIC NOT NULL DEFAULT 0,
  used_quantity NUMERIC NOT NULL DEFAULT 0,
  remaining_quantity NUMERIC GENERATED ALWAYS AS (total_quantity - used_quantity) STORED,
  date_usage JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.material_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" 
ON public.material_tracking 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.material_tracking 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.material_tracking 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.material_tracking 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_material_tracking_updated_at
BEFORE UPDATE ON public.material_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();