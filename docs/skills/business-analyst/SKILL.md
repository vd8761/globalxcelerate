# GlobalXcelerate Business Rules

## Platform Overview
GlobalXcelerate is a B2B2C Global Talent Mobility & Experiential Learning Platform connecting students with international opportunities (internships, exchanges, research, scholarships, graduate careers) through AI-powered matching and a proprietary Global Employability Score.

## Core Business Domains

### 1. Application Lifecycle Management
**Pipeline Stages**: Draft → Submitted → Under Review → Shortlisted → Assessment → Interview → Selected/Rejected

**Transition Rules**:
- Forward transitions must follow sequential order (no stage skipping)
- Rejection is valid from any stage and must include a reason category
- Student withdrawal is valid from any stage before "Selected"
- Notifications triggered within 60 seconds of any status change (all channels: in-app, email, push, SMS for critical)
- Minimum 60% profile completion required to submit (Draft creation allowed regardless)
- Applications cannot be submitted after opportunity deadline

**Automatic Rejection Triggers**:
- Match score drops below 30% due to student profile changes

### 2. AI Matching Score Calculation
**Default Weight Distribution (Balanced)**:
- Skills Match: 20%
- Academic Background: 20%
- Experience Level: 20%
- Geography Preferences: 15%
- Availability: 15%
- Mobility Readiness: 10%

**Business Logic**:
- Minimum 60% profile completion required for matching to activate
- Scores recalculated when student profile or opportunity requirements change
- Students below 50% match are not recommended the opportunity (can still find via search)
- Top 20 matched students notified when new matching opportunity is posted
- Match scores must calculate within 2 seconds per student-opportunity pair
- Batch matching for new opportunities (1000 students) within 30 seconds
- Weights are configurable per opportunity type/category

### 3. Global Employability Score (GX Score)
**12 Dimensions (Equal Weight ~8.33% each)**:
1. Academic Readiness
2. Technical Skills
3. Communication
4. Leadership
5. Project Experience
6. Internship Experience
7. International Exposure
8. Certifications
9. Portfolio Quality
10. Interview Readiness
11. Languages
12. Industry Skills

**Calculation Rules**:
- Composite score: 0-100 scale
- All dimensions weighted equally at ~8.33% each
- Grade Brackets: Exceptional (90-100), Strong (75-89), Developing (50-74), Emerging (25-49), Beginner (0-24)
- Recalculation within 5 minutes of any profile update
- Deterministic: same profile data always produces same score
- Anti-gaming: score cannot decrease by more than 5 points from a single edit
- Peer comparison shows anonymous percentile (no identity reveal)
- Percentile rankings update daily

### 4. Profile Completion Percentage
**Importance-Weighted Calculation**:
- Step 1 - Identity: 15%
- Step 2 - Education: 20%
- Step 3 - Skills: 20%
- Step 4 - Experience: 15%
- Step 5 - Career Goals: 10%
- Step 6 - Global Preferences: 10%
- Step 7 - Portfolio: 10%

**Rules**:
- Steps 1 (Identity) and 2 (Education) are mandatory
- Steps 3-7 can be skipped with "Complete Later" option
- Auto-save on every step transition (forward or backward)
- 60% minimum threshold unlocks AI matching and application submission
- Real-time calculation updates as fields are completed

### 5. Opportunity Posting & Approval Workflow
**Approval Process**: All opportunities require platform admin approval before publishing
- Submitted opportunities enter moderation queue
- Admin reviews for quality, legitimacy, and completeness
- Approved opportunities become visible in marketplace
- Rejected opportunities return to poster with feedback
- Only approved, active opportunities with future deadlines appear in marketplace
- Expired opportunities automatically archived 30 days after deadline
- Opportunity owners can view their own draft/expired listings

### 6. Student Onboarding Flow Rules
- 8-step guided wizard with visual progress indicator
- Steps 1-2 mandatory; Steps 3-7 skippable
- Auto-save on each step transition
- University field uses autocomplete from 10,000+ institution database
- Manual university entry allowed (flagged for admin verification)
- Session expiry preserves progress; student resumes from last completed step
- Initial GX Score calculated upon reaching Step 8
- AI matching activates when profile completion reaches 60%

### 7. Role-Based Feature Access
**6 Roles**: Student, Employer, University Admin, Program Provider, Mentor, Platform Admin

**Access Rules**:
- Users hold exactly one primary role (permanent without admin intervention)
- Admin role requires invitation from super-admin (no self-assignment)
- University admin requires institutional email verification or admin approval
- Role-specific RLS policies enforce data isolation at database level
- Unauthorized cross-role access returns 403 error with redirect

**University Admin Access**: Aggregate analytics only (placement rates, application counts, score distributions) — no individual student application details unless student has opted into institutional visibility.

### 8. Opportunity Eligibility Rules
- Profile completion ≥ 60% to apply
- Opportunity must be active with future deadline
- Opportunity must be admin-approved
- Draft applications can be created regardless of completion percentage
- Students can browse marketplace without match scores if below 60% completion

### 9. Notification Trigger Rules
**Channels**: In-app + Email + Push + SMS (for critical actions)

**Triggers**:
- Application status change → all channels (SMS for Selected/Rejected/Interview Scheduled)
- New matching opportunity (>80% match) → in-app + email + push
- Deadline approaching (48 hours) → in-app + email + push
- Profile completion milestone → in-app
- GX Score change → in-app
- Opportunity expiration (for owners) → email
- New application received (for opportunity owners) → in-app + email
- Interview scheduled → all channels including SMS
- Platform announcements → in-app + email

### 10. Data Privacy & Visibility Rules
**Profile Section Visibility Options**: Public / Private / Employer-only

**Rules**:
- "Private" sections never shown to any external party
- "Employer-only" sections visible only to authenticated employer accounts
- Platform admins can view all data regardless of privacy settings (moderation/support)
- Student always sees their own complete profile
- Student contact information hidden until student explicitly responds to employer interest
- PII fields (DOB, phone, email) encrypted at rest
- Employer search only returns students with "Public" or "Employer-only" visibility
- University admin sees only aggregate data (no PII in summary views)
- Application data visible to: student (own), opportunity owner (their opportunity), platform admin (all)
- Reviewer/employer notes never visible to student
- Right to export and delete personal data supported

### 11. Deadline Enforcement
- Applications cannot be submitted after opportunity deadline
- Draft applications archived when deadline passes (student notified)
- Opportunity automatically moves to "closed" status when deadline passes
- 48-hour reminder notifications sent before deadline
- Expired opportunities removed from marketplace search results
- Opportunity archived 30 days post-deadline

### 12. AI Career Copilot Rules
- Read-only access to student profile (cannot modify data)
- Responses grounded in platform data (no hallucinated opportunities)
- Session-based memory only (resets between sessions)
- Sensitive topics include appropriate disclaimers (visa, financial advice)
- Rate limit: 50 messages per student per day
- Response time: within 3 seconds for standard queries
