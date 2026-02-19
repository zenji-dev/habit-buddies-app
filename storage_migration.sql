-- Migration to update Storage Policies for Clerk (String IDs)
-- We need to replace policies that rely on auth.uid() (UUID) with policies using auth.jwt() ->> 'sub' (Text)
-- And enforce folder-based access control: avatars/{userId}/{filename}

BEGIN;

-- 1. Drop existing policies on storage.objects for the 'avatars' bucket
-- Note: We need to be specific to avoid dropping system policies if any? 
-- Usually user policies are what we care about.
-- Let's drop the ones we identified.

DROP POLICY IF EXISTS "Authenticated users can upload avatars." ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars." ON storage.objects;

-- 2. Create new policies

-- Public Read Access
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Authenticated Upload (INSERT)
-- User can upload if the file path starts with their user ID
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
);

-- Authenticated Update (UPDATE)
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
);

-- Authenticated Delete (DELETE)
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
);

COMMIT;
