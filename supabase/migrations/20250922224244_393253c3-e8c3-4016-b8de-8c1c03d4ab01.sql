-- Add images column to material_requests table
ALTER TABLE public.material_requests 
ADD COLUMN images_url text[] DEFAULT '{}';

-- Update progress_updates table to ensure photos_url exists and is properly typed
-- Check if column exists first, then add if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'progress_updates' 
                   AND column_name = 'photos_url') THEN
        ALTER TABLE public.progress_updates 
        ADD COLUMN photos_url text[] DEFAULT '{}';
    END IF;
END $$;