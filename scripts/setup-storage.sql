-- Create the health-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-documents', 'health-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'health-documents');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'health-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (bucket_id = 'health-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'health-documents' AND auth.role() = 'authenticated');

-- Alternative: Allow anonymous uploads (less secure but simpler for demo)
-- Uncomment these if you want to allow anonymous uploads
-- CREATE POLICY "Anonymous uploads allowed" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'health-documents');
-- CREATE POLICY "Anonymous updates allowed" ON storage.objects FOR UPDATE USING (bucket_id = 'health-documents');
-- CREATE POLICY "Anonymous deletes allowed" ON storage.objects FOR DELETE USING (bucket_id = 'health-documents');
