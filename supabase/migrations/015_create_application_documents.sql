-- Create application documents table
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL DEFAULT 'other',
  file_name TEXT NOT NULL CHECK (char_length(file_name) <= 255),
  file_path TEXT NOT NULL DEFAULT '',
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  mime_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'application-documents',
  upload_status upload_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE application_documents IS 'Documents attached to applications';
COMMENT ON COLUMN application_documents.file_size IS 'File size in bytes, max 10MB';
