-- Create enums for application management
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'draft', 'submitted', 'under_review', 'shortlisted',
    'assessment', 'interview', 'selected', 'rejected', 'withdrawn'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'resume', 'transcript', 'certificate', 'portfolio', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE upload_status AS ENUM (
    'pending', 'completed', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
