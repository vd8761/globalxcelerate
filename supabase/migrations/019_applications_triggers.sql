-- Auto-update updated_at timestamp on applications
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Auto-update updated_at on application_documents
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON application_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Auto-update updated_at on application_reviewer_notes
CREATE TRIGGER trg_reviewer_notes_updated_at
  BEFORE UPDATE ON application_reviewer_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Enforce max 5 documents per application
CREATE OR REPLACE FUNCTION enforce_max_documents()
RETURNS TRIGGER AS $$
DECLARE
  doc_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doc_count
  FROM application_documents
  WHERE application_id = NEW.application_id;

  IF doc_count >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 documents allowed per application'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_max_documents
  BEFORE INSERT ON application_documents
  FOR EACH ROW
  EXECUTE FUNCTION enforce_max_documents();

-- Enable realtime for applications table
ALTER PUBLICATION supabase_realtime ADD TABLE applications;
