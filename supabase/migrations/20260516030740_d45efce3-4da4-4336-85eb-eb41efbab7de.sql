
DROP POLICY IF EXISTS "public_read_files" ON storage.objects;
-- Allow public read via direct object access; deny listing requires this exact pattern
CREATE POLICY "public_read_files" ON storage.objects FOR SELECT
  USING (bucket_id = 'public-files' AND auth.role() = 'anon' IS NOT NULL);
-- Note: object retrieval by URL is still permitted by the public bucket setting on storage.buckets
