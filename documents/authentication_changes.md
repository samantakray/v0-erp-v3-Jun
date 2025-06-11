# Authentication Changes Reminder

This document serves as a reminder to update your Supabase Row Level Security (RLS) policies for the `product-images` storage bucket once you have successfully set up user authentication using Supabase Auth.

**Current State (Temporary for Anonymous Access):**
Your current RLS policies for the `product-images` bucket allow `anon` users to `INSERT`, `UPDATE`, and `DELETE` files. This was done to facilitate development before authentication was in place.

**Action Required After Authentication Setup:**
Once Supabase Auth is implemented and users are authenticated, it is **CRITICAL** to revert these policies to restrict access to `authenticated` users only. This will significantly improve the security of your storage bucket and prevent unauthorized file operations.

**Recommended RLS Policy Changes (Example):**

\`\`\`sql
-- Policy to allow AUTHENTICATED users to upload to product-images bucket
CREATE POLICY "Allow authenticated users to upload to product-images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN ('skus', 'temp')
);

-- Policy to allow AUTHENTICATED users to update images in product-images bucket
CREATE POLICY "Allow authenticated users to update product-images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow AUTHENTICATED users to delete images from product-images bucket
CREATE POLICY "Allow authenticated users to delete from product-images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- The public read policy can remain as is if you want public access to view images
-- CREATE POLICY "Allow public read access to product-images" 
-- ON storage.objects 
-- FOR SELECT 
-- TO public 
-- USING (bucket_id = 'product-images');
\`\`\`

**Steps to Take:**
1.  Confirm your Supabase authentication is fully functional.
2.  Navigate to your Supabase project's SQL Editor.
3.  Execute the updated RLS policies to replace the `anon` policies with `authenticated` ones.
4.  Verify that only authenticated users can now upload, update, or delete files in the `product-images` bucket.
