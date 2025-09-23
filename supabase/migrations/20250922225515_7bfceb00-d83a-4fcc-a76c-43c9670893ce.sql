-- Create storage policies for the logistic bucket to allow image uploads

-- First, ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logistic', 'logistic', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to select files from logistic bucket
CREATE POLICY "Allow public read access on logistic bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logistic');

-- Allow anyone to insert files into logistic bucket
CREATE POLICY "Allow public upload to logistic bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logistic');

-- Allow anyone to update files in logistic bucket (for replacing images)
CREATE POLICY "Allow public update on logistic bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logistic');

-- Allow anyone to delete files from logistic bucket (for removing images)
CREATE POLICY "Allow public delete on logistic bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logistic');