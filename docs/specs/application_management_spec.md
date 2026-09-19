# Module Spec: Application Management

## 1. Overview & Purpose

The Application Management module provides end-to-end lifecycle management for student applications to opportunities (internships, experiential programs, research placements). It implements a 7-stage pipeline (Draft → Submitted → Under Review → Shortlisted → Assessment → Interview → Selected/Rejected) with full status tracking, document management, cover letter editing, and real-time notifications. The module serves as the primary interaction bridge between students applying to opportunities and employers/providers reviewing those applications.

**Who uses it:**
- **Students**: Create, submit, track, and withdraw applications; upload documents; write cover letters; view match scores and status history.
- **Employers**: Review applications, advance/reject candidates through pipeline stages, add reviewer notes, view candidate documents and profiles.
- **Universities**: View applications from their students (read-only monitoring), export application statistics.
- **Providers**: Review applications for experiential programs they manage, similar to employer flow.
- **Admins**: Full access to all applications, override status, resolve disputes, bulk operations.

**Key screens/interfaces:**
- `/(student)/applications` — Application list with filter tabs and search
- `/(student)/applications/[id]` — Application detail with timeline, documents, cover letter
- `/(employer)/applications` — Employer application review queue
- `/(employer)/applications/[id]` — Employer review detail with actions
- Apply Drawer (rendered within opportunity detail page)

**Data flow connections:**
- Reads opportunity data from **opportunity_marketplace** module (title, deadline, org, requirements)
- Reads student profile and match score from **AI Matching Engine** module
- Uses **app_shell** for layout, navigation, notifications panel
- Uses **authentication** for user identity, role-based access, session management
- Writes real-time events consumed by notification system within app_shell

**Scope boundaries — what this module does NOT do:**
- Does not define or manage opportunities (owned by opportunity_marketplace)
- Does not calculate match scores (owned by AI Matching Engine; only reads/displays)
- Does not manage user profiles (owned by profile modules)
- Does not handle interview scheduling (future module)
- Does not process payments or contracts post-selection

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

**Module-specific UI overrides and notes:**

- **Status badges** use distinct color coding within the navy/cyan palette:
  - Draft: `bg-slate-100 text-slate-700 border-slate-300`
  - Submitted: `bg-cyan-50 text-cyan-700 border-cyan-200`
  - Under Review: `bg-blue-50 text-blue-700 border-blue-200`
  - Shortlisted: `bg-indigo-50 text-indigo-700 border-indigo-200`
  - Assessment: `bg-purple-50 text-purple-700 border-purple-200`
  - Interview: `bg-amber-50 text-amber-700 border-amber-200`
  - Selected: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Rejected: `bg-red-50 text-red-700 border-red-200`
  - Withdrawn: `bg-gray-100 text-gray-500 border-gray-300`

- **Timeline visualization** uses a vertical stepper with navy connecting lines and cyan active dots
- **Match score** displayed as circular progress indicator with navy-to-cyan gradient fill
- **Document upload zone** uses dashed border `border-dashed border-2 border-cyan-300` with drag-active state `border-cyan-500 bg-cyan-50`
- **Apply drawer** slides from right, width `max-w-lg`, with frosted glass backdrop
- **Confirmation dialogs** (withdraw, reject) use destructive variant from shadcn/ui AlertDialog

## 3. Features & Functional Requirements

### 3.1 Application List Page (Student)

**User Flow:**
1. Student navigates to `/(student)/applications` via main navigation
2. Page loads with all applications in reverse chronological order (most recent first)
3. Student can filter by status using horizontal tab bar at top
4. Student can search by opportunity title or organization name
5. Student can sort by submitted date (asc/desc) or status (pipeline order)
6. Clicking any application card navigates to detail page
7. Real-time updates: if a status changes while viewing list, card animates update

**UI Layout & Components:**
- Page header: "My Applications" title + total count badge
- Filter tabs: "All", "Active" (Submitted through Interview), "Draft", "Selected", "Rejected", "Withdrawn"
- Search input with magnifying glass icon, debounced 300ms
- Sort dropdown: "Newest First" (default), "Oldest First", "Status"
- Application cards in responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Each card displays:
  - Opportunity title (truncated at 60 chars with ellipsis)
  - Organization name + logo (40x40 avatar)
  - Status badge (color-coded as above)
  - Match score (circular mini badge, percentage)
  - Submitted date (relative: "2 days ago") or "Draft - not submitted"
  - Right chevron icon indicating navigation
- Empty state illustration when no applications match filter
- Pagination: infinite scroll with intersection observer, 12 items per page
- Loading skeleton: 6 card placeholders with pulse animation

**Business Rules:**
- Only shows applications belonging to the authenticated student
- Draft applications older than 90 days display "Expiring soon" warning badge
- "Active" tab combines Submitted + Under Review + Shortlisted + Assessment + Interview
- Count badges on each tab update reactively
- Applications with status "Selected" show celebratory accent (subtle green left border)

**State Machine:**
- `idle` → `loading` (on mount/filter change) → `loaded` | `error`
- `loaded` + scroll → `loading_more` → `loaded` (append)
- Filter/search change → debounce → `loading` (reset)

**Edge Cases:**
- Student with zero applications: show empty state with CTA "Browse Opportunities"
- Network failure during load: show error state with retry button
- Real-time update while user is filtering: queue update, apply when filter matches
- Very long organization names: truncate with tooltip on hover
- Match score unavailable (cache expired): show "—" instead of score

**Acceptance Criteria:**
- Page loads within 1s for up to 50 applications (initial page of 12)
- Filter tabs correctly count and filter applications
- Search returns results within 500ms of debounce completion
- Real-time status updates reflect within 2s without page refresh
- Accessible: all cards keyboard navigable, screen reader announces status
- Mobile responsive: single column, cards stack vertically, touch-friendly tap targets (min 44px)

---

### 3.2 Application Detail Page (Student)

**User Flow:**
1. Student arrives from list page or direct URL `/(student)/applications/[id]`
2. Page displays full application context: opportunity info, status timeline, cover letter, documents
3. If status is "Draft", student can edit cover letter and manage documents
4. Student can withdraw application (if in Submitted or Under Review state)
5. Student views status history as interactive timeline
6. Real-time: if employer changes status, page updates with toast notification

**UI Layout & Components:**
- Breadcrumb: Applications > [Opportunity Title]
- Two-column layout (desktop): Left 60% content, Right 40% sidebar
  - Mobile: single column, sidebar content below main content
- **Left column:**
  - Opportunity summary card: title, org logo+name, location, type, deadline
  - Status timeline (vertical stepper):
    - Each step shows: stage name, date reached, actor name (if available)
    - Current stage highlighted with pulsing cyan dot
    - Future stages shown as gray outline dots
    - Rejected/Withdrawn shown as terminal red/gray dot branching off
  - Cover letter section:
    - Heading "Cover Letter"
    - Rich text display (read-only if not Draft)
    - Edit button (only if Draft status) opens inline editor
    - Character count indicator (max 5000)
  - Status history accordion (expandable):
    - Each entry: status label, timestamp, actor, notes (if any)
    - Sorted newest first
- **Right column (sidebar):**
  - Match score card: large circular chart (navy/cyan), percentage, "View Breakdown" link
  - Documents section:
    - List of uploaded documents with icon, filename, type badge, size, upload date
    - Download button per document
    - Delete button (only if Draft status) with confirmation
    - Upload button (only if Draft status, max 5 documents)
    - Progress bar during upload
  - Actions card:
    - "Withdraw Application" button (destructive, only if Submitted/Under Review)
    - "Edit Draft" button (only if Draft)
    - "Submit Application" button (only if Draft and valid)

**Business Rules:**
- Cover letter editing only available in Draft status
- Document management (upload/delete) only available in Draft status
- Withdrawal only permitted from Submitted or Under Review states
- Match score links to AI Matching explanation endpoint
- Status timeline must show all historical transitions including timestamps
- If opportunity has been deleted/archived, show "Opportunity no longer available" banner
- Cannot navigate to non-existent application or another student's application (403)

**State Machine:**
- Page states: `loading` → `loaded` | `not_found` | `forbidden` | `error`
- Cover letter editing: `viewing` → `editing` → `saving` → `viewing`
- Document upload: `idle` → `uploading` (progress 0-100) → `uploaded` | `upload_error`
- Withdrawal: `idle` → `confirming` (dialog open) → `withdrawing` → `withdrawn`

**Edge Cases:**
- Application in terminal state (Selected/Rejected/Withdrawn): all edit actions disabled
- Document upload fails mid-way: show error, allow retry, don't count toward limit
- Cover letter exceeds 5000 chars during paste: truncate with warning toast
- Concurrent status change by employer while student views: real-time update + toast
- Student attempts to submit Draft without cover letter: inline validation error
- Student attempts to submit Draft without at least one document: inline validation error

**Acceptance Criteria:**
- Detail page loads within 800ms
- Timeline accurately reflects all status transitions in correct chronological order
- Cover letter saves within 1s with optimistic UI update
- Document upload supports drag-and-drop and file picker
- Withdrawal confirmation requires explicit action (type "WITHDRAW" or check box)
- Real-time status changes update timeline within 2s
- 404 page shown for invalid application IDs
- 403 redirect for unauthorized access attempts

---

### 3.3 Apply Flow (Drawer)

**User Flow:**
1. Student views opportunity detail page (owned by opportunity_marketplace)
2. Clicks "Apply Now" button (disabled if already applied, deadline passed, or at max applications)
3. Slide-over drawer opens from right
4. Drawer contains sequential sections: Eligibility Check → Match Score → Cover Letter → Documents → Review & Submit
5. Student completes each section (can scroll freely, not strict wizard)
6. Clicks "Submit Application" at bottom
7. Confirmation dialog appears
8. On confirm: application created with Submitted status, drawer closes, success toast

**UI Layout & Components:**
- Drawer component: `Sheet` from shadcn/ui, side="right", max-width 560px
- Header: "Apply to [Opportunity Title]" + close (X) button
- Scrollable content area with sections:
  - **Eligibility Pre-check** (auto-evaluated):
    - Green checkmarks or red X for each criterion
    - Criteria: deadline not passed, student hasn't already applied, max applications not reached, minimum match score met (if configured)
    - If any criterion fails: show which ones fail, disable submit
  - **Match Score Display:**
    - Circular gauge showing match percentage
    - Top 3 dimension scores as horizontal bars
    - "You're a [strong/moderate/low] match" text
    - Informational only, does not block submission (unless min score configured)
  - **Cover Letter Editor:**
    - Rich text editor (Tiptap-based) with basic formatting: bold, italic, bullet list, numbered list
    - Placeholder text: "Tell the employer why you're a great fit..."
    - Live character count: "[current]/5000"
    - Required field indicator (asterisk)
  - **Document Upload:**
    - Drag-and-drop zone
    - File type selector dropdown: Resume, Transcript, Certificate, Portfolio, Other
    - Max 5 documents, each max 10MB
    - Accepted formats: PDF, DOC, DOCX, JPG, PNG
    - Upload progress indicator per file
    - Uploaded files list with remove button
    - At least 1 document required
  - **Review Section:**
    - Summary of what will be submitted
    - Cover letter preview (collapsed, expandable)
    - Document list
    - Checkbox: "I confirm this information is accurate"
- Footer (sticky): "Save as Draft" (secondary) | "Submit Application" (primary)
- Submit button shows loading spinner during submission

**Business Rules:**
- One application per student per opportunity (enforced by unique constraint; UI disables if exists)
- Cannot apply after opportunity deadline (server validates too)
- Cannot apply if opportunity has reached max_applications count
- Cover letter required for submission (not for draft save)
- At least one document required for submission (not for draft save)
- "Save as Draft" creates application with Draft status, allows returning later
- Match score displayed is from cache or calculated on-demand if expired
- If student already has a Draft for this opportunity, "Apply Now" opens existing draft
- File upload happens immediately on drop/select (stored in temp location), linked on submit
- Confirmation checkbox must be checked to enable Submit button

**State Machine:**
- Drawer: `closed` → `open` (eligibility checking) → `ready` | `ineligible`
- Submission: `idle` → `validating` → `submitting` → `success` | `error`
- Draft save: `idle` → `saving` → `saved`
- File upload (per file): `idle` → `uploading` → `uploaded` | `failed`

**Edge Cases:**
- Student opens drawer, starts writing, accidentally closes: show "Unsaved changes" confirmation
- Deadline passes while student is filling out drawer: show error on submit, explain deadline passed
- Upload fails for one file but others succeed: show individual error, allow retry
- Student pastes image into cover letter: strip to text only
- Very slow network: show progress bars, don't timeout for 60s
- Student submits but server returns conflict (already applied): show error, close drawer, refresh page
- Opportunity reaches max applications between drawer open and submit: server rejects, show error
- Student has existing Draft: drawer loads pre-filled data from draft

**Acceptance Criteria:**
- Drawer opens within 300ms with smooth animation
- Eligibility checks complete within 500ms
- Match score loads within 1s (from cache) or 3s (on-demand calculation)
- Cover letter editor handles paste of large text (5000+ chars) gracefully with truncation warning
- Document upload supports concurrent uploads (up to 5 simultaneously)
- Submit flow completes within 2s on success
- Draft save completes within 1s
- Error states are clearly communicated with actionable messages
- Drawer is fully accessible: focus trapped, escape closes with confirmation if dirty

---

### 3.4 Application Withdrawal

**User Flow:**
1. Student views application detail (status is Submitted or Under Review)
2. Clicks "Withdraw Application" button
3. Confirmation dialog appears with warning text
4. Student must type reason for withdrawal (min 10 chars, max 500 chars)
5. Student confirms withdrawal
6. Application status changes to Withdrawn
7. Status history records the withdrawal with reason and timestamp
8. Student receives confirmation toast
9. Withdrawal is irreversible

**UI Layout & Components:**
- Trigger: "Withdraw Application" button (destructive variant, red outline)
- AlertDialog from shadcn/ui:
  - Title: "Withdraw Application?"
  - Description: "This action cannot be undone. You will not be able to re-apply to this opportunity."
  - Textarea: "Please provide a reason for withdrawal (required)"
  - Character count for textarea
  - Cancel button (secondary)
  - "Confirm Withdrawal" button (destructive, disabled until reason ≥ 10 chars)
  - Loading state on confirm button during API call

**Business Rules:**
- Withdrawal only available from Submitted or Under Review states
- Withdrawal is permanent and irreversible
- Reason is required (minimum 10 characters)
- Withdrawal creates a status_history entry with actor=student, notes=reason
- After withdrawal, student cannot re-apply to the same opportunity
- Employer is notified of withdrawal (via notification system)
- Withdrawal does not count against student's application limits for other opportunities

**State Machine:**
- `idle` → `dialog_open` → `submitting` → `withdrawn` | `error`
- On error: dialog remains open with error message, allow retry

**Edge Cases:**
- Status changes to Shortlisted by employer between dialog open and confirm: server rejects (409 Conflict), show "Application status has changed" message
- Network failure during withdrawal: show retry option, don't close dialog
- Student opens multiple tabs and withdraws in one: other tab receives real-time update
- Reason contains only whitespace: validate as insufficient (trim then check length)

**Acceptance Criteria:**
- Withdrawal button only visible when status is Submitted or Under Review
- Dialog clearly communicates irreversibility
- Reason field validates on blur and on submit
- Successful withdrawal updates UI immediately (optimistic then confirmed)
- Status timeline updates to show Withdrawn step
- API returns 409 if status has changed since page load (use ETag/version)

---

### 3.5 Employer Application Review

**User Flow:**
1. Employer navigates to `/(employer)/applications`
2. Sees all applications for their opportunities in a table/list view
3. Can filter by: opportunity, status, date range, match score range
4. Clicks application to open employer review detail
5. Reviews student profile summary, cover letter, documents, match score
6. Can add reviewer notes (internal, not visible to student)
7. Can advance application to next stage or reject
8. Each transition requires optional notes (rejection requires reason)

**UI Layout & Components:**
- **List view (table format):**
  - Columns: Student Name, Opportunity, Status, Match Score, Submitted Date, Actions
  - Row click navigates to detail
  - Bulk select checkboxes for bulk status transitions
  - Filter bar: opportunity dropdown, status multi-select, date range picker, match score slider
  - Sort by any column header
  - Pagination: server-side, 25 per page with page numbers
- **Detail view:**
  - Three-column layout: Left (student profile summary), Center (application content), Right (actions panel)
  - **Student profile summary (left):**
    - Avatar, name, university, program, GX Score badge
    - Key skills tags (top 5)
    - "View Full Profile" link (opens in new tab)
  - **Application content (center):**
    - Cover letter (full display)
    - Documents list with preview/download
    - Status timeline (same component as student view)
    - Match score breakdown (expandable)
  - **Actions panel (right):**
    - Current status indicator
    - "Advance to [Next Stage]" button (primary)
    - "Reject" button (destructive)
    - Reviewer notes:
      - Existing notes list (by all reviewers, newest first)
      - "Add Note" textarea + submit
    - Stage-specific actions:
      - Assessment stage: "Send Assessment" button (future integration point)
      - Interview stage: "Schedule Interview" button (future integration point)
- **Bulk actions bar** (appears when rows selected):
  - "Move to [status]" dropdown
  - "Reject Selected" button
  - Count indicator: "3 applications selected"

**Business Rules:**
- Employer can only see applications for opportunities owned by their organization
- Valid transitions: Submitted → Under Review → Shortlisted → Assessment → Interview → Selected/Rejected
- Rejection can happen from any active stage (Under Review through Interview)
- Rejection requires a reason (min 20 chars) that is stored but NOT shown to student verbatim (paraphrased notification sent)
- Reviewer notes are internal (never shown to student)
- Multiple reviewers from same org can add notes
- Bulk transitions limited to 50 applications at once
- Advancing past Under Review triggers email notification to student
- Only org members with "reviewer" or "admin" org role can transition
- Status cannot be moved backward (no un-shortlisting)
- Advancing to Assessment/Interview stages: notes are recommended but not required
- Selected: triggers congratulatory notification to student

**State Machine:**
- List: `loading` → `loaded` | `error`; Filter change → `loading`
- Detail: `loading` → `loaded` | `not_found` | `error`
- Transition: `idle` → `confirming` → `transitioning` → `success` | `error`
- Note: `idle` → `saving` → `saved` | `error`
- Bulk: `idle` → `confirming` → `processing` (with progress) → `complete` | `partial_failure`

**Edge Cases:**
- Student withdraws while employer is reviewing: real-time update, disable action buttons, show notice
- Two employers from same org try to advance simultaneously: optimistic locking with version field
- Bulk reject with some already rejected: skip already-rejected, proceed with rest, show summary
- Very long cover letters: render with max-height and "Read more" expand
- Student profile incomplete: show available fields, indicate missing data
- Opportunity deleted while applications exist: applications remain, show "Opportunity archived" notice

**Acceptance Criteria:**
- Table loads 25 applications within 1s
- Filters apply within 500ms (server-side)
- Status transitions complete within 1s
- Reviewer notes save within 500ms
- Bulk operations show progress and complete within 5s for 50 items
- Real-time updates reflect across multiple employer users viewing same applications
- All actions log to application_status_history with actor and timestamp

---

### 3.6 Document Management

**User Flow:**
1. During apply flow or on draft application detail, student uploads documents
2. Selects document type from dropdown
3. Drags file or clicks to browse
4. File uploads with progress indicator
5. On success, document appears in list with metadata
6. Student can download or delete documents (only in Draft status)
7. Employer can view and download documents (never delete)

**UI Layout & Components:**
- **Upload zone:**
  - Dashed border container with cloud upload icon
  - Text: "Drag & drop files here, or click to browse"
  - Sub-text: "PDF, DOC, DOCX, JPG, PNG — Max 10MB per file"
  - Active drag state: border color change, background highlight
  - Document type selector: dropdown above or beside upload zone
- **Document list:**
  - Each row: file type icon (PDF/DOC/IMG), filename (truncated), type badge, file size, upload date
  - Actions: Download (always), Delete (only in Draft), Preview (for PDF/images)
  - Total document count: "[current]/5 documents"
- **Upload progress:**
  - Per-file progress bar (determinate)
  - Cancel upload button
  - Success checkmark on completion
  - Error icon with retry option on failure
- **Preview modal:**
  - PDF: embedded viewer (iframe with signed URL)
  - Images: lightbox with zoom
  - Other: no preview, download only

**Business Rules:**
- Maximum 5 documents per application
- Maximum file size: 10MB per file
- Accepted MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png
- Document types enum: resume, transcript, certificate, portfolio, other
- Files stored in Supabase Storage bucket `application-documents` with path: `{student_id}/{application_id}/{uuid}.{ext}`
- Upload uses signed URL (client → Supabase Storage directly, not through API server)
- Delete removes from storage and database record
- Documents accessible by: owning student, opportunity org members, platform admins
- RLS policy enforces access control on storage bucket
- File names sanitized: stripped of special chars, max 100 chars
- Duplicate filenames allowed (UUID prefix ensures uniqueness in storage)

**State Machine:**
- Upload: `idle` → `validating` (type/size check) → `requesting_url` → `uploading` (progress) → `registering` (DB record) → `complete` | `error`
- Delete: `idle` → `confirming` → `deleting` → `deleted` | `error`

**Edge Cases:**
- Upload interrupted (network drop): detect, show "Upload failed — Retry" state
- File appears to be PDF but has wrong MIME: validate server-side, reject with message
- Student uploads 5th document then tries 6th: upload zone disabled with "Maximum reached" text
- Very large filename: truncate display with tooltip for full name
- Storage quota exceeded (platform-wide): show "Service temporarily unavailable" error
- Concurrent upload of same file twice: allow both (different UUIDs), student can delete duplicate
- Preview for corrupted PDF: show error in preview modal, suggest download instead

**Acceptance Criteria:**
- Upload starts within 500ms of file drop/select
- Progress bar updates smoothly (every 100ms or per chunk)
- 10MB file uploads within 10s on fast connection
- Delete removes file from both storage and database
- MIME type validation happens client-side (immediate feedback) and server-side (security)
- Signed URLs expire after 1 hour
- Document access properly gated by RLS

---

### 3.7 Real-time Status Notifications

**User Flow:**
1. Student has applications page open or is anywhere in the app
2. Employer advances their application status
3. Within 2 seconds, student receives:
   - Toast notification (if on applications pages)
   - Bell icon badge increment (global, via app_shell)
   - Application list card updates (if viewing list)
   - Application detail timeline updates (if viewing that application)
4. Clicking notification navigates to application detail

**UI Layout & Components:**
- Toast notification (from app_shell notification system):
  - Icon: status-specific (checkmark for positive, info for neutral, X for negative)
  - Title: "Application Update"
  - Body: "Your application to [Opportunity Title] has been moved to [New Status]"
  - Action: "View" button navigating to detail page
  - Auto-dismiss after 8 seconds
- Application list card highlight:
  - Brief pulse animation (cyan border flash) on the updated card
  - Status badge updates with smooth transition
- Application detail timeline:
  - New step animates in with slide-down + fade-in
  - Current dot updates position

**Business Rules:**
- Subscribe to Supabase Realtime channel: `applications:student_id=eq.{userId}`
- Listen for UPDATE events on `applications` table where student_id matches
- Also subscribe to `application_status_history` INSERT events for detail page
- Debounce rapid updates (e.g., if employer makes multiple changes in 5s, batch notification)
- Notification stored in notifications table (owned by app_shell) for persistence
- Only notify for transitions TO: Under Review, Shortlisted, Assessment, Interview, Selected, Rejected
- Do NOT notify for Draft → Submitted (student did it themselves)
- Employer receives notification when student withdraws

**State Machine:**
- Subscription: `connecting` → `connected` | `connection_error`
- On event: `received` → `processing` → `ui_updated`
- Reconnection: `disconnected` → `reconnecting` (exponential backoff) → `connected`

**Edge Cases:**
- Student offline when status changes: notification delivered on reconnect (from persistent store)
- Multiple rapid status changes (rare but possible): show latest state, history shows all
- Real-time connection drops: reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Student has 50+ applications: subscription filter ensures only their applications trigger events
- Browser tab inactive: notifications queue, show on tab focus
- Multiple browser tabs open: deduplicate notifications (use broadcast channel API)

**Acceptance Criteria:**
- Status change reflected in UI within 2 seconds
- Toast notification appears with correct content
- No duplicate notifications for same event
- Reconnection happens automatically within 30s of disconnect
- Works across all application pages (list, detail)
- Notification persists in notification center even if toast dismissed

## 4. Data Models

### Entity: `applications`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Unique application identifier |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Applying student |
| opportunity_id | uuid | FK → opportunities.id, NOT NULL | — | Target opportunity |
| organization_id | uuid | FK → organizations.id, NOT NULL | — | Denormalized for efficient RLS |
| status | application_status | NOT NULL | 'draft' | Current pipeline stage |
| cover_letter | text | max 5000 chars | NULL | Rich text cover letter (HTML) |
| cover_letter_plain | text | max 5000 chars | NULL | Plain text version for search |
| match_score | decimal(5,2) | 0.00-100.00 | NULL | Cached match score at submission time |
| match_score_snapshot | jsonb | — | NULL | Dimension breakdown at submission |
| withdrawal_reason | text | max 500 chars | NULL | Required when withdrawn |
| rejection_reason | text | max 1000 chars | NULL | Internal reason (employer provided) |
| rejection_feedback | text | max 500 chars | NULL | Sanitized feedback shown to student |
| submitted_at | timestamptz | — | NULL | When moved from Draft to Submitted |
| reviewed_at | timestamptz | — | NULL | When first moved to Under Review |
| decided_at | timestamptz | — | NULL | When Selected or Rejected |
| version | integer | NOT NULL | 1 | Optimistic locking version |
| metadata | jsonb | — | '{}' | Extensible metadata |
| created_at | timestamptz | NOT NULL | now() | Record creation |
| updated_at | timestamptz | NOT NULL | now() | Last modification |

**Constraints:**
- UNIQUE(student_id, opportunity_id) — one application per student per opportunity
- CHECK(status IN valid enum values)
- CHECK(cover_letter IS NOT NULL OR status = 'draft') — cover letter required for non-draft

**Indexes:**
- `idx_applications_student_id` on (student_id)
- `idx_applications_opportunity_id` on (opportunity_id)
- `idx_applications_organization_id` on (organization_id)
- `idx_applications_status` on (status)
- `idx_applications_submitted_at` on (submitted_at DESC)
- `idx_applications_student_status` on (student_id, status)
- `idx_applications_opportunity_status` on (opportunity_id, status)

---

### Entity: `application_status_history`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Unique record identifier |
| application_id | uuid | FK → applications.id, NOT NULL, ON DELETE CASCADE | — | Parent application |
| from_status | application_status | NULL | NULL | Previous status (NULL for initial creation) |
| to_status | application_status | NOT NULL | — | New status |
| actor_id | uuid | FK → profiles.id, NOT NULL | — | Who made the change |
| actor_role | user_role | NOT NULL | — | Role of actor at time of action |
| notes | text | max 1000 chars | NULL | Transition notes |
| metadata | jsonb | — | '{}' | Additional context |
| created_at | timestamptz | NOT NULL | now() | When transition occurred |

**Indexes:**
- `idx_status_history_application_id` on (application_id)
- `idx_status_history_created_at` on (created_at DESC)
- `idx_status_history_actor_id` on (actor_id)

---

### Entity: `application_documents`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Unique document identifier |
| application_id | uuid | FK → applications.id, NOT NULL, ON DELETE CASCADE | — | Parent application |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Owning student (for RLS) |
| document_type | document_type | NOT NULL | — | Category of document |
| file_name | varchar(255) | NOT NULL | — | Original filename (sanitized) |
| file_path | varchar(512) | NOT NULL | — | Storage bucket path |
| file_size | integer | NOT NULL, CHECK > 0, CHECK ≤ 10485760 | — | Size in bytes |
| mime_type | varchar(100) | NOT NULL | — | Validated MIME type |
| storage_bucket | varchar(100) | NOT NULL | 'application-documents' | Supabase storage bucket |
| upload_status | upload_status | NOT NULL | 'pending' | Upload lifecycle state |
| created_at | timestamptz | NOT NULL | now() | Upload timestamp |
| updated_at | timestamptz | NOT NULL | now() | Last modification |

**Constraints:**
- CHECK(file_size > 0 AND file_size <= 10485760) — max 10MB
- No more than 5 documents per application (enforced via trigger or application logic)

**Indexes:**
- `idx_documents_application_id` on (application_id)
- `idx_documents_student_id` on (student_id)

---

### Entity: `application_reviewer_notes`

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Unique note identifier |
| application_id | uuid | FK → applications.id, NOT NULL, ON DELETE CASCADE | — | Parent application |
| reviewer_id | uuid | FK → profiles.id, NOT NULL | — | Note author |
| content | text | NOT NULL, max 2000 chars | — | Note content |
| is_pinned | boolean | NOT NULL | false | Pinned to top |
| created_at | timestamptz | NOT NULL | now() | Note creation |
| updated_at | timestamptz | NOT NULL | now() | Last edit |

**Indexes:**
- `idx_reviewer_notes_application_id` on (application_id)
- `idx_reviewer_notes_reviewer_id` on (reviewer_id)

---

### Enums

```typescript
enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  ASSESSMENT = 'assessment',
  INTERVIEW = 'interview',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

enum DocumentType {
  RESUME = 'resume',
  TRANSCRIPT = 'transcript',
  CERTIFICATE = 'certificate',
  PORTFOLIO = 'portfolio',
  OTHER = 'other'
}

enum UploadStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
```

---

### Relationships

- `applications` → `profiles` (student_id): Many-to-one
- `applications` → `opportunities` (opportunity_id): Many-to-one
- `applications` → `organizations` (organization_id): Many-to-one
- `application_status_history` → `applications`: Many-to-one (cascade delete)
- `application_documents` → `applications`: Many-to-one (cascade delete)
- `application_reviewer_notes` → `applications`: Many-to-one (cascade delete)
- `application_reviewer_notes` → `profiles` (reviewer_id): Many-to-one

## 5. API Contracts

All endpoints use the error envelope from shared_contracts.md:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string; details?: Record<string, any> } | null;
  meta?: { page: number; per_page: number; total: number; total_pages: number };
}
```

---

### GET /api/v1/applications

**Description:** List applications for authenticated user (student sees own, employer sees org's)

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| status | string | No | — | Comma-separated statuses to filter |
| opportunity_id | uuid | No | — | Filter by specific opportunity |
| search | string | No | — | Search opportunity title or org name |
| sort_by | string | No | submitted_at | Field to sort by: submitted_at, created_at, status, match_score |
| sort_order | string | No | desc | asc or desc |
| page | integer | No | 1 | Page number |
| per_page | integer | No | 12 | Items per page (max 50) |
| match_score_min | number | No | — | Minimum match score filter |
| match_score_max | number | No | — | Maximum match score filter |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "opportunity": {
        "id": "uuid",
        "title": "Software Engineering Intern",
        "organization": {
          "id": "uuid",
          "name": "TechCorp",
          "logo_url": "https://..."
        },
        "location": "London, UK",
        "type": "internship",
        "deadline": "2024-03-15T23:59:59Z"
      },
      "status": "under_review",
      "match_score": 78.5,
      "submitted_at": "2024-02-20T14:30:00Z",
      "created_at": "2024-02-19T10:00:00Z",
      "updated_at": "2024-02-21T09:15:00Z",
      "document_count": 3,
      "has_cover_letter": true
    }
  ],
  "error": null,
  "meta": {
    "page": 1,
    "per_page": 12,
    "total": 45,
    "total_pages": 4
  }
}
```

**Error Responses:**
- 401: `{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Authentication required" } }`
- 422: `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid sort_by field", "details": { "field": "sort_by", "allowed": ["submitted_at", "created_at", "status", "match_score"] } } }`

---

### POST /api/v1/applications

**Description:** Create a new application (draft or submitted)

**Request Body:**
```json
{
  "opportunity_id": "uuid",
  "cover_letter": "<p>Rich text content...</p>",
  "status": "draft",
  "documents": []
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| opportunity_id | uuid | Yes | Must exist, not past deadline, not at max |
| cover_letter | string | No (required if status=submitted) | Max 5000 chars (HTML), non-empty after stripping tags |
| status | string | No | Only "draft" or "submitted" |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "opportunity_id": "uuid",
    "organization_id": "uuid",
    "status": "draft",
    "cover_letter": "<p>Rich text content...</p>",
    "match_score": 78.5,
    "submitted_at": null,
    "created_at": "2024-02-20T14:30:00Z",
    "updated_at": "2024-02-20T14:30:00Z",
    "version": 1
  },
  "error": null
}
```

**Error Responses:**
- 409: `{ "success": false, "error": { "code": "DUPLICATE_APPLICATION", "message": "You have already applied to this opportunity" } }`
- 422: `{ "success": false, "error": { "code": "DEADLINE_PASSED", "message": "The application deadline has passed" } }`
- 422: `{ "success": false, "error": { "code": "MAX_APPLICATIONS_REACHED", "message": "This opportunity has reached its maximum number of applications" } }`
- 422: `{ "success": false, "error": { "code": "COVER_LETTER_REQUIRED", "message": "Cover letter is required for submission" } }`

---

### GET /api/v1/applications/:id

**Description:** Get full application details

**Path Parameters:**
- `id` (uuid): Application ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "opportunity": {
      "id": "uuid",
      "title": "Software Engineering Intern",
      "organization": {
        "id": "uuid",
        "name": "TechCorp",
        "logo_url": "https://...",
        "website": "https://techcorp.com"
      },
      "location": "London, UK",
      "type": "internship",
      "deadline": "2024-03-15T23:59:59Z",
      "is_active": true
    },
    "status": "under_review",
    "cover_letter": "<p>Rich text...</p>",
    "match_score": 78.5,
    "match_score_snapshot": {
      "skills": 82,
      "academic": 75,
      "experience": 70,
      "geography": 85,
      "availability": 90,
      "mobility": 65
    },
    "submitted_at": "2024-02-20T14:30:00Z",
    "reviewed_at": "2024-02-21T09:15:00Z",
    "decided_at": null,
    "withdrawal_reason": null,
    "rejection_feedback": null,
    "documents": [
      {
        "id": "uuid",
        "document_type": "resume",
        "file_name": "John_Doe_Resume.pdf",
        "file_size": 245760,
        "mime_type": "application/pdf",
        "upload_status": "completed",
        "created_at": "2024-02-20T14:25:00Z",
        "download_url": "https://signed-url..."
      }
    ],
    "status_history": [
      {
        "id": "uuid",
        "from_status": "submitted",
        "to_status": "under_review",
        "actor_name": "Jane Smith",
        "actor_role": "employer",
        "notes": null,
        "created_at": "2024-02-21T09:15:00Z"
      },
      {
        "id": "uuid",
        "from_status": null,
        "to_status": "submitted",
        "actor_name": "John Doe",
        "actor_role": "student",
        "notes": null,
        "created_at": "2024-02-20T14:30:00Z"
      }
    ],
    "reviewer_notes": [],
    "version": 2,
    "created_at": "2024-02-19T10:00:00Z",
    "updated_at": "2024-02-21T09:15:00Z"
  },
  "error": null
}
```

**Notes:**
- `reviewer_notes` only included for employer/admin roles (empty array for students)
- `rejection_reason` only visible to employers/admins; students see `rejection_feedback`
- `download_url` is a signed URL valid for 1 hour
- `status_history` sorted newest first

**Error Responses:**
- 403: `{ "success": false, "error": { "code": "FORBIDDEN", "message": "You do not have access to this application" } }`
- 404: `{ "success": false, "error": { "code": "NOT_FOUND", "message": "Application not found" } }`

---

### PATCH /api/v1/applications/:id

**Description:** Update application (cover letter edit, save draft)

**Request Body:**
```json
{
  "cover_letter": "<p>Updated content...</p>",
  "version": 1
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| cover_letter | string | No | Max 5000 chars HTML |
| status | string | No | Only "submitted" (to submit a draft) |
| version | integer | Yes | Must match current version (optimistic lock) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "draft",
    "cover_letter": "<p>Updated content...</p>",
    "version": 2,
    "updated_at": "2024-02-20T15:00:00Z"
  },
  "error": null
}
```

**Error Responses:**
- 409: `{ "success": false, "error": { "code": "VERSION_CONFLICT", "message": "Application has been modified. Please refresh and try again.", "details": { "current_version": 3 } } }`
- 422: `{ "success": false, "error": { "code": "INVALID_STATUS_TRANSITION", "message": "Cannot edit application in current status" } }`
- 422: `{ "success": false, "error": { "code": "COVER_LETTER_TOO_LONG", "message": "Cover letter exceeds 5000 characters" } }`

---

### POST /api/v1/applications/:id/status

**Description:** Transition application status (employer advances/rejects, student withdraws)

**Request Body:**
```json
{
  "to_status": "shortlisted",
  "notes": "Strong candidate, good skill match",
  "version": 2
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| to_status | ApplicationStatus | Yes | Must be valid transition from current status |
| notes | string | Conditional | Required for rejection (min 20 chars), optional otherwise. Max 1000 chars |
| rejection_feedback | string | No | Max 500 chars, student-visible feedback (only with rejected status) |
| withdrawal_reason | string | Conditional | Required when student withdraws (min 10 chars, max 500) |
| version | integer | Yes | Optimistic locking |

**Valid Transitions:**
| From | To | Actor |
|------|----|-------|
| draft | submitted | student |
| submitted | under_review | employer |
| submitted | withdrawn | student |
| under_review | shortlisted | employer |
| under_review | rejected | employer |
| under_review | withdrawn | student |
| shortlisted | assessment | employer |
| shortlisted | rejected | employer |
| assessment | interview | employer |
| assessment | rejected | employer |
| interview | selected | employer |
| interview | rejected | employer |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "shortlisted",
    "version": 3,
    "updated_at": "2024-02-22T10:00:00Z",
    "status_history_entry": {
      "id": "uuid",
      "from_status": "under_review",
      "to_status": "shortlisted",
      "actor_name": "Jane Smith",
      "notes": "Strong candidate, good skill match",
      "created_at": "2024-02-22T10:00:00Z"
    }
  },
  "error": null
}
```

**Error Responses:**
- 409: `{ "success": false, "error": { "code": "VERSION_CONFLICT", "message": "Application status has changed" } }`
- 422: `{ "success": false, "error": { "code": "INVALID_TRANSITION", "message": "Cannot transition from 'shortlisted' to 'submitted'" } }`
- 422: `{ "success": false, "error": { "code": "REJECTION_REASON_REQUIRED", "message": "Reason is required when rejecting an application (min 20 characters)" } }`
- 403: `{ "success": false, "error": { "code": "FORBIDDEN", "message": "Only organization members can advance applications" } }`

---

### POST /api/v1/applications/:id/documents

**Description:** Register a document after upload to storage (get signed upload URL)

**Request Body:**
```json
{
  "file_name": "Resume_John_Doe.pdf",
  "document_type": "resume",
  "file_size": 245760,
  "mime_type": "application/pdf"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| file_name | string | Yes | Max 255 chars, sanitized |
| document_type | DocumentType | Yes | Valid enum value |
| file_size | integer | Yes | > 0, ≤ 10485760 (10MB) |
| mime_type | string | Yes | One of: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, image/png |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "document_type": "resume",
    "file_name": "Resume_John_Doe.pdf",
    "file_path": "student-uuid/application-uuid/doc-uuid.pdf",
    "file_size": 245760,
    "mime_type": "application/pdf",
    "upload_status": "pending",
    "upload_url": "https://supabase-storage-signed-url...",
    "upload_url_expires_at": "2024-02-20T15:30:00Z",
    "created_at": "2024-02-20T14:30:00Z"
  },
  "error": null
}
```

**Error Responses:**
- 422: `{ "success": false, "error": { "code": "MAX_DOCUMENTS_REACHED", "message": "Maximum 5 documents per application" } }`
- 422: `{ "success": false, "error": { "code": "INVALID_FILE_TYPE", "message": "File type not allowed", "details": { "allowed": ["application/pdf", "..."] } } }`
- 422: `{ "success": false, "error": { "code": "FILE_TOO_LARGE", "message": "File exceeds 10MB limit" } }`
- 422: `{ "success": false, "error": { "code": "APPLICATION_NOT_DRAFT", "message": "Documents can only be added to draft applications" } }`

---

### DELETE /api/v1/applications/:id/documents/:documentId

**Description:** Delete a document from application

**Response (200):**
```json
{
  "success": true,
  "data": { "deleted": true },
  "error": null
}
```

**Error Responses:**
- 404: Document not found
- 422: Application not in draft status
- 403: Not the owning student

---

### POST /api/v1/applications/:id/reviewer-notes

**Description:** Add a reviewer note (employer/admin only)

**Request Body:**
```json
{
  "content": "Candidate has strong technical skills but limited international experience."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| content | string | Yes | Min 1 char, max 2000 chars |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "reviewer_id": "uuid",
    "reviewer_name": "Jane Smith",
    "content": "Candidate has strong technical skills...",
    "is_pinned": false,
    "created_at": "2024-02-22T11:00:00Z"
  },
  "error": null
}
```

**Error Responses:**
- 403: Not an org member for this opportunity
- 422: Content validation failure

---

### POST /api/v1/applications/batch/status

**Description:** Bulk status transition (employer only, max 50)

**Request Body:**
```json
{
  "application_ids": ["uuid1", "uuid2", "uuid3"],
  "to_status": "under_review",
  "notes": "Moving to review phase"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| application_ids | uuid[] | Yes | 1-50 items, all must belong to actor's org |
| to_status | ApplicationStatus | Yes | Valid target status |
| notes | string | No | Max 1000 chars |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "processed": 3,
    "succeeded": 2,
    "failed": 1,
    "results": [
      { "id": "uuid1", "success": true, "new_status": "under_review" },
      { "id": "uuid2", "success": true, "new_status": "under_review" },
      { "id": "uuid3", "success": false, "error": { "code": "INVALID_TRANSITION", "message": "Application already in shortlisted status" } }
    ]
  },
  "error": null
}
```

---

### GET /api/v1/applications/:id/documents/:documentId/download

**Description:** Get a fresh signed download URL for a document

**Response (200):**
```json
{
  "success": true,
  "data": {
    "download_url": "https://signed-url...",
    "expires_at": "2024-02-20T16:30:00Z",
    "file_name": "Resume_John_Doe.pdf",
    "mime_type": "application/pdf"
  },
  "error": null
}
```

## 6. Module Dependencies

| Dependency | What's Needed | How It's Used | Failure Handling |
|------------|---------------|---------------|------------------|
| **app_shell** | Layout components, navigation, notification system, toast provider | Wraps all application pages, provides global notification bell, toast messages | Module cannot render without app_shell; hard dependency |
| **authentication** | Session, user identity, role information, RLS context | Guards all routes, provides user_id for queries, determines role-specific UI | Redirect to login if unauthenticated; 403 for unauthorized roles |
| **opportunity_marketplace** | Opportunity data (title, org, deadline, requirements, max_applications) | Displayed in application cards, validated during apply flow, linked from detail pages | Show cached opportunity data if available; "Opportunity unavailable" fallback if API fails |
| **AI Matching Engine** | Match scores, dimension breakdown | Displayed in apply drawer and application detail; used for eligibility checks | Show "Score unavailable" placeholder; do not block application submission |
| **Supabase Storage** | File upload/download signed URLs | Document upload direct to storage, download via signed URLs | Retry 3 times with backoff; show "Upload service unavailable" after failures |
| **Supabase Realtime** | WebSocket subscriptions | Real-time status change notifications, live list updates | Exponential backoff reconnection; fall back to polling (30s interval) after 5 failed reconnects |
| **Supabase Auth** | RLS policy context | Row-level security enforces data access at database level | If RLS rejects, API returns 403; client shows appropriate error |

## 7. Non-Functional Requirements

### Pagination
- Student application list: cursor-based (infinite scroll), 12 items per page
- Employer application table: offset-based (page numbers), 25 items per page, max 50 per request
- Status history: loaded in full (max ~20 entries per application, no pagination needed)
- Reviewer notes: loaded in full (typically < 20 per application)

### Rate Limiting
- Application creation: 5 per minute per student (prevent spam)
- Status transitions: 30 per minute per employer (support bulk review)
- Document upload registration: 10 per minute per student
- Reviewer notes: 20 per minute per employer
- General GET endpoints: 60 per minute per user

### Caching
- Application list (student): no cache (real-time requirements)
- Application detail: stale-while-revalidate with 30s max-age, invalidated by real-time event
- Opportunity data within applications: cached 5 minutes (ISR or React Query staleTime)
- Match score: use existing match_scores table cache (24h TTL)
- Document signed URLs: generated on demand, valid 1 hour, not cached

### Concurrency
- Optimistic locking via `version` field on applications table
- All status transitions check version match; return 409 on conflict
- Bulk operations process sequentially within a transaction; partial success supported
- Document count enforcement uses SELECT FOR UPDATE to prevent race conditions

### Performance Targets
- Application list page load: < 1s (p95)
- Application detail page load: < 800ms (p95)
- Apply drawer open to interactive: < 500ms
- Status transition API: < 500ms (p95)
- Document upload URL generation: < 300ms
- Bulk status transition (50 items): < 5s (p95)
- Real-time event propagation: < 2s end-to-end

### Data Retention
- Active applications: retained indefinitely while opportunity org is active
- Withdrawn applications: retained 2 years, then anonymized
- Rejected applications: retained 2 years, then anonymized
- Application documents: retained same duration as parent application
- Status history: retained same duration as parent application
- Reviewer notes: retained same duration as parent application
- Audit trail (who changed what): retained 7 years (compliance)

### Availability
- Target 99.9% uptime for application submission flow
- Graceful degradation: if real-time fails, polling fallback activates
- If AI Matching unavailable: apply flow still works, match score shown as "Calculating..."

## 8. Key Implementation Notes

1. **Optimistic Locking Implementation:** Every PATCH and status transition endpoint must include a `version` field in the request body. The database UPDATE uses `WHERE id = $1 AND version = $2` and returns the affected row count. If 0 rows affected, return 409 Conflict with the current version number so the client can refresh.

2. **RLS Policies Must Be Comprehensive:** Four policies needed on `applications` table: (a) Students SELECT own applications, (b) Org members SELECT applications where organization_id matches their org, (c) Students can INSERT where student_id = auth.uid(), (d) Org members can UPDATE status fields where organization_id matches. Use `auth.uid()` and a helper function `get_user_org_id()` for RLS.

3. **Cover Letter Sanitization:** Rich text from Tiptap editor contains HTML. Server-side, sanitize with DOMPurify (or similar) allowing only: `<p>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`, `<br>`. Strip all attributes except basic styling. Generate `cover_letter_plain` by stripping all HTML for full-text search indexing.

4. **Document Upload Flow is Two-Phase:** (1) Client calls POST /documents to register intent and get signed upload URL. Document record created with `upload_status: 'pending'`. (2) Client uploads directly to Supabase Storage using signed URL. (3) A Supabase Storage webhook or client callback calls a confirmation endpoint to set `upload_status: 'completed'`. Documents with `pending` status older than 1 hour are cleaned up by a cron job.

5. **Real-time Subscription Scoping:** Use Supabase Realtime with RLS enabled. Student subscribes to `public:applications:student_id=eq.{uid}` channel. Employer subscribes to `public:applications:organization_id=eq.{orgId}`. This ensures only relevant events are pushed. Implement a custom hook `useApplicationRealtime(applicationId?)` that handles subscription lifecycle, reconnection, and UI update dispatching.

6. **Status Transition Validation as a Pure Function:** Create a `validateTransition(currentStatus, targetStatus, actorRole)` function used both client-side (to show/hide buttons) and server-side (to enforce). This is the single source of truth for the state machine. Export from a shared utility used by both frontend and API route handlers.

7. **Batch Operations Use Database Transactions:** The bulk status endpoint wraps all transitions in a single Supabase RPC call (PostgreSQL function) that processes each application within a transaction. If any application fails (wrong version, invalid transition), it's logged as failed but doesn't rollback successful ones (partial success model).

8. **Anti-Gaming: Auto-reject on Match Score Drop:** A Supabase database trigger or Edge Function runs when `match_scores` table is updated. If a student's match score for an opportunity drops below 30% AND they have an active application (Submitted through Interview), the application is auto-rejected with a system-generated reason. This is rate-limited to prevent accidental mass rejections during score recalculation.

9. **Deadline Enforcement Happens Server-Side:** While the UI disables the apply button after deadline, the server MUST validate `opportunities.deadline > NOW()` during application creation. Use a joined query or database constraint trigger. Time zone handling: all deadlines stored and compared in UTC.

10. **Search Implementation:** Application search (by opportunity title/org name) uses PostgreSQL `ILIKE` with trigram index (`pg_trgm` extension) for performance. Index on `opportunities.title` using `gin_trgm_ops`. The search query joins applications → opportunities → organizations and filters on both title and org name fields.

## 9. File Map

```
src/
├── app/
│   ├── (student)/
│   │   └── applications/
│   │       ├── page.tsx                          # Student application list page (server component)
│   │       ├── loading.tsx                       # List page loading skeleton
│   │       ├── error.tsx                         # List page error boundary
│   │       └── [id]/
│   │           ├── page.tsx                      # Application detail page (server component)
│   │           ├── loading.tsx                   # Detail page loading skeleton
│   │           └── error.tsx                     # Detail page error boundary
│   ├── (employer)/
│   │   └── applications/
│   │       ├── page.tsx                          # Employer review queue page
│   │       ├── loading.tsx                       # Employer list loading skeleton
│   │       └── [id]/
│   │           ├── page.tsx                      # Employer review detail page
│   │           └── loading.tsx                   # Employer detail loading skeleton
│   └── api/
│       └── v1/
│           └── applications/
│               ├── route.ts                      # GET (list) + POST (create) handlers
│               ├── [id]/
│               │   ├── route.ts                  # GET (detail) + PATCH (update) + DELETE handlers
│               │   ├── status/
│               │   │   └── route.ts              # POST status transition handler
│               │   ├── documents/
│               │   │   ├── route.ts              # GET (list) + POST (register upload) handlers
│               │   │   └── [documentId]/
│               │   │       ├── route.ts          # DELETE document handler
│               │   │       └── download/
│               │   │           └── route.ts      # GET signed download URL
│               │   └── reviewer-notes/
│               │       └── route.ts              # GET + POST reviewer notes
│               └── batch/
│                   └── status/
│                       └── route.ts              # POST bulk status transition
├── components/
│   └── applications/
│       ├── application-card.tsx                   # Application list card component
│       ├── application-list.tsx                   # Application list with filters (client component)
│       ├── application-filters.tsx               # Filter tabs + search + sort controls
│       ├── application-detail-content.tsx        # Main detail page content layout
│       ├── application-timeline.tsx              # Visual status timeline stepper
│       ├── application-status-badge.tsx          # Color-coded status badge
│       ├── apply-drawer.tsx                      # Apply flow slide-over drawer
│       ├── apply-eligibility-check.tsx           # Eligibility pre-check section
│       ├── apply-match-score.tsx                 # Match score display in drawer
│       ├── cover-letter-editor.tsx               # Tiptap rich text editor for cover letter
│       ├── cover-letter-display.tsx              # Read-only cover letter renderer
│       ├── document-upload-zone.tsx              # Drag-and-drop upload component
│       ├── document-list.tsx                     # Document list with actions
│       ├── document-preview-modal.tsx            # PDF/image preview lightbox
│       ├── withdrawal-dialog.tsx                 # Withdrawal confirmation dialog
│       ├── status-transition-dialog.tsx          # Employer status advance/reject dialog
│       ├── reviewer-notes-panel.tsx              # Reviewer notes list + add form
│       ├── employer-application-table.tsx        # Employer table view with bulk select
│       ├── employer-application-detail.tsx       # Three-column employer review layout
│       ├── employer-bulk-actions-bar.tsx         # Bulk actions toolbar
│       ├── application-empty-state.tsx           # Empty state illustration component
│       └── match-score-gauge.tsx                 # Circular match score indicator
├── hooks/
│   └── applications/
│       ├── use-applications.ts                   # React Query hook for fetching application list
│       ├── use-application-detail.ts             # React Query hook for single application
│       ├── use-create-application.ts             # Mutation hook for creating applications
│       ├── use-update-application.ts             # Mutation hook for updating applications
│       ├── use-application-status.ts             # Mutation hook for status transitions
│       ├── use-application-documents.ts          # Hook for document CRUD operations
│       ├── use-document-upload.ts                # Hook managing upload lifecycle + progress
│       ├── use-reviewer-notes.ts                 # Hook for fetching/adding reviewer notes
│       ├── use-application-realtime.ts           # Supabase Realtime subscription hook
│       ├── use-bulk-status-transition.ts         # Mutation hook for bulk operations
│       └── use-eligibility-check.ts              # Hook for checking apply eligibility
├── lib/
│   └── applications/
│       ├── types.ts                              # TypeScript types/interfaces for applications
│       ├── constants.ts                          # Status colors, transitions map, limits
│       ├── validations.ts                        # Zod schemas for all request bodies
│       ├── transitions.ts                        # State machine: validateTransition() function
│       ├── utils.ts                              # Helper functions (sanitize, format, etc.)
│       ├── queries.ts                            # Supabase query builders for applications
│       └── storage.ts                            # Storage utilities (signed URLs, paths)
├── stores/
│   └── applications/
│       └── application-filters-store.ts          # Zustand store for filter/sort state persistence
└── supabase/
    └── migrations/
        ├── 20240301000001_create_applications_table.sql
        ├── 20240301000002_create_application_status_history.sql
        ├── 20240301000003_create_application_documents.sql
        ├── 20240301000004_create_application_reviewer_notes.sql
        ├── 20240301000005_applications_rls_policies.sql
        ├── 20240301000006_applications_indexes.sql
        ├── 20240301000007_applications_triggers.sql          # updated_at trigger, version increment
        ├── 20240301000008_document_cleanup_function.sql      # Cleanup pending uploads
        └── 20240301000009_status_transition_rpc.sql          # Bulk transition PostgreSQL function
```