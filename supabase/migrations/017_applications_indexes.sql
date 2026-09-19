-- Indexes for applications table
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_organization_id ON applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_student_status ON applications(student_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_org_status ON applications(organization_id, status);

-- Indexes for status history
CREATE INDEX IF NOT EXISTS idx_status_history_application_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON application_status_history(created_at DESC);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON application_documents(student_id);

-- Indexes for reviewer notes
CREATE INDEX IF NOT EXISTS idx_reviewer_notes_application_id ON application_reviewer_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_notes_created_at ON application_reviewer_notes(created_at DESC);
