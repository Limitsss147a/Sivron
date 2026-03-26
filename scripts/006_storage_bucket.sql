-- Create a specific storage bucket for budget documents if it doesn't already exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('budget_documents', 'budget_documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the bucket
-- Allow authenticated users to view files in their own budgets
CREATE POLICY "Users can view their own budget documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'budget_documents' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload documents
CREATE POLICY "Users can upload budget documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'budget_documents' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Users can update their own budget documents" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'budget_documents' 
  AND auth.uid() = owner
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete their own budget documents" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'budget_documents' 
  AND auth.uid() = owner
);
