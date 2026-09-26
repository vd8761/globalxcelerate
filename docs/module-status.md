# GlobalXcelerate Module Status

Assessment basis: `qa` branch, routes under `src/app`, domain code under `src/lib`, and migrations under `supabase/migrations`.

| Module | Status | Evidence / readiness note |
|---|---|---|
| Authentication, recovery and sessions | Implemented | Auth pages and `/api/auth/*`; production configuration and full-flow testing required |
| Email verification and OTP | Implemented | Verification/OTP pages and routes; delivery and abuse controls need verification |
| MFA | Implemented | Enrol, verify and recovery routes; enforcement/recovery testing required |
| Student onboarding | Implemented | Identity, education, skills, experience, goals, preferences and portfolio flows |
| Student profile | Implemented | Profile page, setup API and profile libraries; privacy/consent needs verification |
| Student dashboard | Implemented | Dashboard page/API; aggregation, realtime and empty/error states need testing |
| Opportunity marketplace | Implemented | Browse/detail/filter APIs and pages; moderation and search performance need verification |
| Saved opportunities | Implemented | Save/unsave route and hooks; ownership/duplicate tests required |
| Employer workspace | Implemented | Setup, dashboard, opportunities, candidates and applications |
| Employer opportunity management | Implemented | CRUD and publish routes; ownership, moderation and deadline rules need testing |
| Student applications | Implemented | Application pages/APIs; state machine and deadline enforcement need acceptance tests |
| Application documents | Partial | Upload/download APIs exist; private storage and file security need proof |
| Application history and reviewer notes | Implemented | Migrations and APIs exist; visibility and audit isolation need tests |
| University workspace | Implemented | Dashboard, programmes and students; institution scoping needs verification |
| Programme-provider workspace | Implemented | Programme and application routes/pages; organisation permissions need testing |
| AI matching | Implemented | Single, explain and batch matching routes; failure handling/performance need testing |
| GX Score | Implemented | Calculation, history and recommendations; governance and recalculation need verification |
| GX Career Copilot | Implemented | Chat/session/safety/rate-limit modules; credentials, cost and privacy need testing |
| Reference data | Implemented | Countries, languages, institutions and skills APIs/data |
| Platform administration | Implemented | Users, opportunities, reports and setup pages; destructive actions/audit need testing |
| Reporting and analytics | Partial | Admin reports/aggregations exist; KPI reconciliation and exports need verification |
| Notifications/realtime | Partial | Hooks/consumers exist; delivery, retry and monitoring need validation |
| Database and RLS | Implemented structurally | 21 migrations exist; every role/tenant boundary must be tested |
| Deployment/configuration | Partial | Next/Vercel structure and env example exist; operational runbook needed |

## Overall readiness

The branch has broad feature coverage and is ready for structured QA and hardening. Production readiness is not established until tenant isolation, document privacy, application transitions, AI failure handling, notifications/background work and end-to-end journeys pass acceptance testing.
