-- Create the task-attachments storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Delete old policies to prevent collision
DROP POLICY IF EXISTS "Allow public download of task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete task attachments" ON storage.objects;

-- Create policies
CREATE POLICY "Allow public download of task attachments" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'task-attachments');

CREATE POLICY "Allow authenticated users to upload task attachments" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Allow authenticated users to delete task attachments" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'task-attachments');
