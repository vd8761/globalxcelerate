-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'draft',
  cover_letter TEXT,
  cover_letter_plain TEXT,
  match_score DECIMAL(5,2) CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 100)),
  match_score_snapshot JSONB,
  withdrawal_reason TEXT,
  rejection_reason TEXT,
  rejection_feedback TEXT CHECK (rejection_feedback IS NULL OR char_length(rejection_feedback) <= 500),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint: one application per student per opportunity
  CONSTRAINT uq_student_opportunity UNIQUE (student_id, opportunity_id),
  -- Cover letter length check
  CONSTRAINT chk_cover_letter_length CHECK (cover_letter IS NULL OR char_length(cover_letter) <= 5000)
);

COMMENT ON TABLE applications IS 'Student applications to opportunities';
COMMENT ON COLUMN applications.version IS 'Optimistic locking version counter';
COMMENT ON COLUMN applications.match_score_snapshot IS 'Dimension scores snapshot at application time';
