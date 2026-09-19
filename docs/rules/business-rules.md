# GlobalXcelerate Business Rules

**Document Type:** Business Rules
**Version:** 1.0
**Effective Date:** 2025-01-27
**Scope:** All GlobalXcelerate platform agents, services, modules, and API endpoints handling application lifecycle, AI matching, scoring, user management, notifications, and data access

## 1. Purpose & Overview
This document defines the comprehensive business rules governing the GlobalXcelerate Global Talent Mobility & Experiential Learning Platform. It establishes formal policies for application lifecycle state management, AI matching score calculation, Global Employability Score computation, profile completion logic, opportunity approval workflows, role-based access control, notification triggers, deadline enforcement, and data privacy/visibility controls. These rules ensure consistent, deterministic platform behavior across all system components and user interactions.

## 2. Definitions
- **GX Score**: Global Employability Score — a proprietary 0-100 metric measuring a student's global career readiness across 12 dimensions
- **Match Score**: AI-calculated compatibility percentage (0-100%) between a student profile and an opportunity
- **Profile Completion**: Importance-weighted percentage reflecting how much of a student's onboarding profile has been filled
- **Pipeline Stage**: One of the defined application lifecycle statuses (Draft, Submitted, Under Review, Shortlisted, Assessment, Interview, Selected, Rejected)
- **Opportunity Owner**: The employer, university admin, or program provider who posted and manages an opportunity
- **RLS**: Row-Level Security — database-level access control enforcing data isolation between roles
- **PII**: Personally Identifiable Information — data that can identify an individual (DOB, phone, email, address)
- **Dimension**: One of 12 measured aspects of the Global Employability Score
- **Grade Bracket**: Named tier corresponding to GX Score ranges (Exceptional, Strong, Developing, Emerging, Beginner)

## 3. Rules & Policies

### BIZ-001: Application Pipeline Stage Order (REQUIRED)
**Statement:** Application status transitions MUST follow the sequential pipeline order: Draft → Submitted → Under Review → Shortlisted → Assessment → Interview → Selected. Forward transitions MUST NOT skip intermediate stages.
**Scope:** All application state management operations, API endpoints processing status updates
**Rationale:** Sequential pipeline ensures consistent review process, enables accurate analytics, and provides transparent progress tracking for all parties

### BIZ-002: Rejection From Any Stage (REQUIRED)
**Statement:** An application MAY be moved to "Rejected" status from any pipeline stage. Every rejection MUST include a reason category selected from a predefined list.
**Scope:** Opportunity owner actions, admin actions on application records
**Rationale:** Enables timely decisions at any review point while maintaining accountability and enabling rejection analytics

### BIZ-003: Student Application Withdrawal (REQUIRED)
**Statement:** A student MUST be able to withdraw their application from any pipeline stage before "Selected" status. Withdrawal MUST require explicit confirmation and MUST notify the opportunity owner.
**Scope:** Student-facing application management interfaces and APIs
**Rationale:** Respects student autonomy while keeping opportunity owners informed of pipeline changes

### BIZ-004: Profile Completion Threshold for Application Submission (REQUIRED)
**Statement:** The system MUST enforce a minimum 60% profile completion to allow application submission. Draft applications MAY be created regardless of profile completion percentage.
**Scope:** Application submission endpoints, form validation logic
**Rationale:** Ensures applications contain sufficient data for meaningful review while allowing students to prepare drafts early

### BIZ-005: Profile Completion Threshold for AI Matching (REQUIRED)
**Statement:** AI matching scores and personalized opportunity recommendations SHALL only be generated for students with profile completion of 60% or higher. Students below this threshold MUST see generic popular opportunities without personalized match scores.
**Scope:** AI matching engine, recommendation endpoints, marketplace display logic
**Rationale:** Prevents inaccurate matching based on incomplete data; motivates profile completion through feature gating

### BIZ-006: AI Match Score Weight Distribution (REQUIRED)
**Statement:** The default AI matching algorithm MUST use the following balanced weight distribution: Skills Match 20%, Academic Background 20%, Experience Level 20%, Geography Preferences 15%, Availability 15%, Mobility Readiness 10%. Weights MUST be configurable per opportunity type/category.
**Scope:** AI matching engine calculation logic, scoring configuration
**Rationale:** Balanced weighting ensures no single dimension dominates match quality; configurability allows specialization per opportunity category (e.g., technical roles emphasize skills)

### BIZ-007: Match Score Recommendation Threshold (REQUIRED)
**Statement:** Students with a match score below 50% for a given opportunity MUST NOT be proactively recommended that opportunity. Students below 50% match MAY still discover the opportunity through direct search or browsing.
**Scope:** Recommendation engine, notification triggers, marketplace featured/recommended sections
**Rationale:** Maintains recommendation quality and prevents low-relevance noise in student feeds

### BIZ-008: New Opportunity Match Notification (REQUIRED)
**Statement:** When a new opportunity is posted and approved, the system MUST identify the top 20 matched students (with match score ≥80%) and MUST send them push notifications within 5 minutes of opportunity approval.
**Scope:** Batch matching pipeline, notification service
**Rationale:** Drives timely applications for high-quality matches; creates competitive advantage for engaged students

### BIZ-009: Match Score Performance Requirements (REQUIRED)
**Statement:** Match scores MUST calculate within 2 seconds per individual student-opportunity pair. Batch matching for new opportunities across 1000 students MUST complete within 30 seconds.
**Scope:** AI matching engine performance benchmarks, infrastructure scaling decisions
**Rationale:** Ensures responsive user experience and timely batch processing for new opportunity notifications

### BIZ-010: GX Score Equal Dimension Weighting (REQUIRED)
**Statement:** The Global Employability Score MUST weight all 12 dimensions equally at approximately 8.33% each. The 12 dimensions are: Academic Readiness, Technical Skills, Communication, Leadership, Project Experience, Internship Experience, International Exposure, Certifications, Portfolio Quality, Interview Readiness, Languages, and Industry Skills.
**Scope:** GX Score calculation engine, scoring rubric configuration
**Rationale:** Equal weighting provides a holistic employability assessment without biasing toward any single skill area; reflects the platform's global mobility philosophy

### BIZ-011: GX Score Grade Brackets (REQUIRED)
**Statement:** The system MUST classify GX Scores into the following grade brackets: Exceptional (90-100), Strong (75-89), Developing (50-74), Emerging (25-49), Beginner (0-24). These brackets MUST be displayed alongside the numeric score.
**Scope:** GX Score display components, profile pages, employer search results
**Rationale:** Provides intuitive labels that contextualize numeric scores for students and employers

### BIZ-012: GX Score Recalculation Timing (REQUIRED)
**Statement:** The GX Score MUST be recalculated within 5 minutes of any profile data update that affects scored fields. The recalculation MUST be logged in the score history.
**Scope:** Profile update event handlers, GX Score calculation pipeline, score history storage
**Rationale:** Ensures scores reflect current profile state with acceptable latency; maintains audit trail for score progression

### BIZ-013: GX Score Determinism (REQUIRED)
**Statement:** GX Score calculation MUST be deterministic — identical profile data MUST always produce the identical composite score and dimension scores regardless of calculation timing or system state.
**Scope:** Scoring algorithm implementation, testing validation
**Rationale:** Ensures fairness and reproducibility; prevents non-deterministic factors from affecting student standings

### BIZ-014: GX Score Anti-Gaming Protection (REQUIRED)
**Statement:** The GX Score MUST NOT decrease by more than 5 points from any single profile edit. If a calculated decrease exceeds 5 points, the system MUST cap the decrease at 5 points and log the event for admin review.
**Scope:** Score change validation logic, admin alerting
**Rationale:** Prevents students from being penalized harshly for profile corrections or refinements; discourages gaming through strategic data removal

### BIZ-015: GX Score Peer Comparison Privacy (REQUIRED)
**Statement:** Peer comparison features MUST show only anonymous percentile rankings. The system MUST NOT reveal other students' identities, scores, or profile data in any peer comparison view.
**Scope:** Percentile calculation, peer comparison UI components, API responses
**Rationale:** Enables motivational benchmarking without compromising student privacy or creating toxic competitive dynamics

### BIZ-016: Profile Completion Importance-Weighted Calculation (REQUIRED)
**Statement:** Profile completion percentage MUST be calculated using importance-weighted steps: Identity 15%, Education 20%, Skills 20%, Experience 15%, Career Goals 10%, Global Preferences 10%, Portfolio 10%. Within each step, individual fields contribute proportionally to that step's weight.
**Scope:** Profile completion calculation service, progress indicator UI
**Rationale:** Weighted calculation prioritizes high-value profile sections that most impact AI matching and GX Score quality

### BIZ-017: Mandatory Onboarding Steps (REQUIRED)
**Statement:** Onboarding Steps 1 (Identity) and Step 2 (Education) MUST be completed before a student can access the main platform. Steps 3-7 MAY be skipped with a "Complete Later" option.
**Scope:** Onboarding wizard navigation logic, platform access gating
**Rationale:** Minimum viable profile data (identity + education) needed for basic platform functionality; flexibility on remaining steps reduces onboarding friction

### BIZ-018: Onboarding Auto-Save (REQUIRED)
**Statement:** The system MUST auto-save all entered data on every onboarding step transition (both forward and backward navigation). Session expiry MUST preserve all saved progress, and the student MUST resume from their last completed step.
**Scope:** Onboarding wizard state management, session handling
**Rationale:** Prevents data loss from navigation errors or session timeouts; reduces onboarding abandonment

### BIZ-019: Opportunity Approval Requirement (REQUIRED)
**Statement:** ALL opportunities MUST be approved by a platform administrator before becoming visible in the marketplace. Submitted opportunities MUST enter a moderation queue for admin review.
**Scope:** Opportunity creation workflow, marketplace visibility logic, admin moderation interface
**Rationale:** Ensures marketplace quality, legitimacy verification, and compliance with platform standards; protects students from fraudulent or low-quality listings

### BIZ-020: Opportunity Expiration Automation (REQUIRED)
**Statement:** Opportunities MUST automatically transition to "closed" status when their deadline passes. Closed opportunities MUST be removed from marketplace search results. Opportunities MUST be permanently archived 30 days after their deadline.
**Scope:** Scheduled jobs, opportunity status management, marketplace search indexing
**Rationale:** Maintains marketplace freshness; prevents student confusion from stale listings; reduces database clutter through automated archival

### BIZ-021: Role Singularity and Permanence (REQUIRED)
**Statement:** Each user MUST hold exactly one primary role at any time. Role selection MUST be permanent — changing role MUST require platform admin intervention. The Admin role MUST NOT be self-assignable; it MUST require invitation from an existing super-admin.
**Scope:** User registration flow, role assignment, admin panel
**Rationale:** Simplifies permission management; prevents role-switching abuse; protects admin access through invitation-only flow

### BIZ-022: University Admin Institutional Verification (REQUIRED)
**Statement:** University Admin role assignment MUST require either institutional email domain verification OR explicit platform admin approval. Self-registration with non-institutional email MUST NOT grant University Admin privileges.
**Scope:** University admin registration, email verification service, admin approval queue
**Rationale:** Prevents unauthorized individuals from accessing institutional analytics and student data

### BIZ-023: University Admin Data Access Limitation (REQUIRED)
**Statement:** University Administrators MUST only access aggregate analytics (placement rates, application counts, score distributions). Individual student application details MUST NOT be visible to university admins unless the specific student has opted into institutional visibility.
**Scope:** University admin dashboard, API authorization, data aggregation services
**Rationale:** Balances institutional reporting needs with student privacy; opt-in model respects individual data autonomy

### BIZ-024: Notification Multi-Channel Delivery (REQUIRED)
**Statement:** The system MUST support four notification channels: in-app, email, push notification, and SMS. Critical actions (Selected, Rejected, Interview Scheduled) MUST trigger notifications on ALL channels including SMS. Non-critical notifications SHOULD use in-app and email only.
**Scope:** Notification service, channel routing logic, notification templates
**Rationale:** Ensures critical career-impacting notifications reach students regardless of platform engagement; multi-channel reduces missed communications

### BIZ-025: Notification Delivery Timing (REQUIRED)
**Statement:** Notifications triggered by application status changes MUST be delivered within 60 seconds of the status change event. New matching opportunity notifications (>80% match) MUST be delivered within 5 minutes of opportunity approval.
**Scope:** Notification queue processing, event-driven architecture, SLA monitoring
**Rationale:** Timely notifications enable rapid student response; delay thresholds balance urgency with system load management

### BIZ-026: Deadline Reminder Notifications (REQUIRED)
**Statement:** The system MUST send deadline reminder notifications to students with saved or draft applications 48 hours before the opportunity deadline via in-app, email, and push notification channels.
**Scope:** Scheduled notification jobs, application tracking, deadline monitoring
**Rationale:** Reduces missed deadlines; increases application completion rates for interested students

### BIZ-027: Profile Section Privacy Controls (REQUIRED)
**Statement:** Students MUST be able to set each profile section to one of three visibility levels: Public, Private, or Employer-only. "Private" sections MUST NEVER be shown to any external party. "Employer-only" sections MUST only be visible to authenticated employer accounts.
**Scope:** Profile API responses, search result filtering, profile view rendering
**Rationale:** Gives students granular control over their digital identity exposure; supports GDPR-aligned data minimization principles

### BIZ-028: Admin Data Access Override (REQUIRED)
**Statement:** Platform administrators MUST have access to all user data regardless of privacy settings for purposes of content moderation, dispute resolution, and platform support. Admin data access MUST be logged in audit trails.
**Scope:** Admin panel, admin API endpoints, audit logging
**Rationale:** Enables effective platform governance and user support while maintaining accountability through audit logging

### BIZ-029: Student Contact Information Protection (REQUIRED)
**Statement:** Student contact information (email, phone) MUST be hidden from employers until the student explicitly responds to employer interest or initiates contact. Employer search results MUST NOT include student contact details.
**Scope:** Employer talent search, profile display for employer role, messaging system
**Rationale:** Prevents unsolicited contact; gives students control over employer communication; reduces spam and potential harassment

### BIZ-030: PII Encryption at Rest (REQUIRED)
**Statement:** All Personally Identifiable Information fields (date of birth, phone number, email address, physical address) MUST be encrypted at rest in the database. Decryption MUST only occur at the application layer for authorized access.
**Scope:** Database schema, encryption service, data access layer
**Rationale:** Protects sensitive personal data in case of database breach; aligns with data protection regulations (GDPR, PDPA)

### BIZ-031: Data Export and Deletion Rights (REQUIRED)
**Statement:** Students MUST be able to request a full export of their personal data in a machine-readable format. Students MUST be able to request permanent deletion of their account and all associated data. Deletion requests MUST be processed within 30 days.
**Scope:** Account settings, data export service, account deletion workflow
**Rationale:** Compliance with GDPR Article 20 (data portability) and Article 17 (right to erasure); fundamental user data rights

### BIZ-032: Application Data Visibility Matrix (REQUIRED)
**Statement:** Application data MUST follow strict visibility rules: students see only their own applications, opportunity owners see all applications for their posted opportunities, platform admins see all applications system-wide. Reviewer/employer internal notes MUST NEVER be visible to the applicant student.
**Scope:** Application API authorization, data filtering middleware, UI conditional rendering
**Rationale:** Ensures appropriate information access per role while protecting internal review deliberations from candidate influence

### BIZ-033: AI Career Copilot Data Access Boundary (REQUIRED)
**Statement:** The AI Career Copilot MUST have read-only access to the student's profile data. The Copilot MUST NOT modify, create, or delete any profile data directly. All Copilot responses MUST be grounded in actual platform data — the system MUST NOT generate hallucinated opportunities or fabricated statistics.
**Scope:** Copilot service architecture, data access layer, response validation
**Rationale:** Prevents unintended data mutations from AI interactions; ensures trustworthy responses that students can rely on for career decisions

### BIZ-034: AI Copilot Rate Limiting (REQUIRED)
**Statement:** The AI Career Copilot MUST enforce a rate limit of 50 messages per student per 24-hour period. The Copilot MUST respond within 3 seconds for standard queries. Session memory MUST reset between separate sessions (no long-term conversational memory beyond profile data).
**Scope:** Copilot API rate limiting, session management, performance SLAs
**Rationale:** Controls compute costs; ensures responsive experience; prevents session memory from accumulating potentially outdated context

### BIZ-035: Automatic Rejection on Match Score Drop (REQUIRED)
**Statement:** If a student's match score for an active application drops below 30% due to profile changes, the application MUST be automatically moved to "Rejected" status with reason "Profile no longer meets minimum match threshold." The student MUST be notified of this automated action.
**Scope:** Match score recalculation pipeline, application status management, notification triggers
**Rationale:** Prevents continued processing of applications where the student's profile has diverged significantly from opportunity requirements; saves reviewer time

## 4. Enforcement & Compliance

**Automated Enforcement:**
- All pipeline transition rules enforced via application state machine with invalid transition rejection
- Profile completion thresholds enforced at API level (submission endpoints return 400 for insufficient completion)
- Privacy visibility rules enforced via Row-Level Security (RLS) policies at the database level
- Notification timing SLAs monitored via observability dashboards with alerts for violations
- GX Score determinism validated via automated regression tests (same input → same output)

**Violation Handling:**
- Invalid state transitions: rejected immediately with error response and logged for admin review
- Unauthorized data access attempts: blocked at RLS/API layer, logged as security events, trigger admin alerts after 3 attempts
- Notification SLA breaches: escalated to engineering team when >5% of notifications exceed timing thresholds
- Privacy violations: treated as P0 incidents with immediate investigation and remediation

**Audit Requirements:**
- All application status transitions logged with timestamp, actor, and previous/new status
- All admin data access logged with timestamp, admin ID, and accessed records
- GX Score changes logged with previous score, new score, triggering update, and all dimension breakdowns
- All automated rejection events logged with full context for review

## 5. Exceptions & Exemptions

**Exception Process:**
- Exceptions to business rules require written request to Platform Admin team
- Requests must include: rule being excepted, justification, duration, and scope
- Platform Admin or Super Admin must approve exceptions

**Pre-Approved Exemptions:**
- Platform Admin may manually override GX Score anti-gaming cap for verified legitimate profile corrections
- Platform Admin may bypass opportunity approval for pre-verified premium institutional partners (after formal trust establishment)
- System may exceed 60-second notification SLA during planned maintenance windows (users notified in advance)
- Deadline enforcement paused during documented platform outages (deadlines extended by outage duration)

## 6. Review & Governance

**Review Schedule:**
- Quarterly review of AI matching weight distribution effectiveness (correlation with application outcomes)
- Monthly review of GX Score dimension rubrics for accuracy and fairness
- Bi-annual review of all business rules for relevance and completeness
- Weekly review of opportunity approval queue turnaround times
- Daily monitoring of notification delivery SLAs

**Change Management:**
- Business rule changes require stakeholder review (Product, Engineering, Compliance)
- Changes to scoring algorithms require 2-week notice period and A/B testing
- Privacy rule changes require legal review and user notification
- All changes versioned and documented with effective dates

**Ownership:**
- Application Lifecycle Rules: Product Manager
- AI Matching & GX Score Rules: Data Science Lead + Product Manager
- Data Privacy Rules: Data Protection Officer + Legal
- Notification Rules: Product Manager + Engineering Lead
- Role-Based Access: Security Lead + Product Manager