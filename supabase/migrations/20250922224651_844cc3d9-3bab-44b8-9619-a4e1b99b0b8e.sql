-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.generate_request_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  next_num INTEGER;
  code TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_code FROM 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.material_requests 
  WHERE request_code ~ '^MR[0-9]+$';
  
  code := 'MR' || LPAD(next_num::TEXT, 3, '0');
  RETURN code;
END;
$function$;