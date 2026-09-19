-- Enable Row Level Security on all application tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviewer_notes ENABLE ROW LEVEL SECURITY;

-- Applications policies
-- Students can see their own applications
CREATE POLICY "students_select_own_applications" ON applications
  FOR SELECT USING (auth.uid() = student_id);

-- Organization members can see applications to their org
CREATE POLICY "org_members_select_applications" ON applications
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Students can insert their own applications
CREATE POLICY "students_insert_applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own draft applications
CREATE POLICY "students_update_own_drafts" ON applications
  FOR UPDATE USING (auth.uid() = student_id AND status = 'draft')
  WITH CHECK (auth.uid() = student_id);

-- Org members can update applications (status transitions)
CREATE POLICY "org_members_update_applications" ON applications
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Status history: same access as parent application
CREATE POLICY "select_own_status_history" ON application_status_history
  FOR SELECT USING (
    application_id IN (SELECT id FROM applications WHERE student_id = auth.uid())
  );

CREATE POLICY "org_select_status_history" ON application_status_history
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "insert_status_history" ON application_status_history
  FOR INSERT WITH CHECK (true);

-- Documents: students manage own, org members can read
CREATE POLICY "students_manage_own_documents" ON application_documents
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "org_members_read_documents" ON application_documents
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

-- Reviewer notes: org members full access, students no access
CREATE POLICY "org_members_manage_reviewer_notes" ON application_reviewer_notes
  FOR ALL USING (
    application_id IN (
      SELECT id FROM applications WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );
