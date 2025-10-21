-- supabase/migrations/003_storage_setup.sql

-- Create a bucket for assets with public access.
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the assets bucket.
-- 1. Allow authenticated users to view all files.
CREATE POLICY "Authenticated users can view assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assets');

-- 2. Allow authenticated users to upload assets.
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- 3. Allow users to update their own assets.
CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- 4. Allow users to delete their own assets.
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);
