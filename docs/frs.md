# Functional Requirements Specification

## Scope

This FRS describes the current GlobalXcelerate application on the `qa` branch. It records present functional scope and observed readiness; it is not a future feature wishlist.

## Users

| Role | Purpose |
|---|---|
| Student | Maintain a global profile, discover opportunities, receive matches, apply and track progress |
| Employer | Create opportunities, discover candidates and review applications |
| University administrator | Manage institution context and monitor students/programmes/outcomes |
| Programme provider | Publish and operate experiential programmes and review applicants |
| Platform administrator | Govern users, opportunities, reports, configuration and safety |

## Functional requirements and status

### FRS-01 Authentication and access — Implemented; security verification required

Support registration, login, logout, email verification, OTP, password reset, sessions, MFA enrolment/recovery and role selection. Redirect users to the correct role portal and deny unauthorized routes.

### FRS-02 Student onboarding — Implemented

Students complete identity, education, skills, experience, career goals, global preferences and portfolio. Progress is saved, completion is calculated and required completion gates matching/application actions.

### FRS-03 Student profile — Implemented; privacy verification required

Students maintain education, skills, languages, experience, projects, portfolio and preferences. Sharing with employers, universities and providers must be controlled and understandable.

### FRS-04 Student dashboard — Implemented

Show profile completion, recommended and saved opportunities, deadlines, application status, GX Score and improvement actions.

### FRS-05 Opportunity marketplace — Implemented

Students browse, search, filter and view internships, jobs, exchanges, immersion, research, scholarships, industry projects and related programmes. They can save/unsave opportunities and view eligibility, requirements, dates and organisation details.

### FRS-06 Employer opportunity management — Implemented; moderation verification required

Employers create, edit, publish and manage opportunities. Validate required fields, eligibility, category, location/preferences, dates and deadlines. Enforce organisation ownership and moderation rules.

### FRS-07 Programme-provider management — Implemented

Providers create/manage programmes and review programme applications.

### FRS-08 University administration — Implemented; tenant verification required

University administrators access institution-scoped student/programme information and permitted application/outcome reports.

### FRS-09 AI matching — Implemented; operational verification required

Calculate candidate-opportunity matches using configured dimensions, explain results, identify skill gaps and support single/batch matching. Fail safely when an AI dependency is unavailable.

### FRS-10 GX Score — Implemented; governance verification required

Calculate a 0–100 score across configured employability dimensions, retain history, show recommendations and allow recommendation completion/dismissal. Present it as guidance, not a guaranteed outcome.

### FRS-11 Applications — Implemented; acceptance testing required

Students create drafts, complete required information, submit before deadlines, upload permitted documents, view history and withdraw where allowed. Employers/providers review, add notes and transition applications. Admins have controlled oversight.

### FRS-12 Notifications and realtime — Partial

Notify users of application changes, deadlines, matching events and account events. Distinguish queued, sent, delivered and failed external notifications.

### FRS-13 GX Career Copilot — Implemented; AI safety/cost verification required

Provide context-aware guidance for opportunity discovery, profile improvement, interview preparation and career planning. Isolate sessions, rate-limit usage and apply safety filtering.

### FRS-14 Administration — Implemented

Admins manage users, opportunities, reports, setup/configuration and governance actions. Administrative actions must be authenticated, authorized and auditable.

## Critical acceptance conditions

- No cross-tenant access to students, opportunities, applications, documents or notes.
- No application submission bypasses completion, eligibility or deadline rules.
- Every status transition follows the state machine and creates history.
- Documents are private and downloadable only by authorized users.
- Employer/provider ownership is enforced on every mutation.
- Matching/GX Score failures do not corrupt business data.
- MFA, recovery and session revocation work in a fresh browser session.
- Important mutations show an outcome and persist durably.

## Current assessment exclusions

Native mobile apps, payments/contracts, post-selection onboarding, full interview scheduling, external ATS integrations and advanced enterprise billing are not treated as implemented unless separately evidenced and tested.
