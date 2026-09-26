# Software Requirements Specification

## Architecture baseline

GlobalXcelerate is a Next.js App Router TypeScript application using Supabase PostgreSQL/Auth/Storage/Realtime, API route handlers under `/api/v1`, Tailwind CSS, React Hook Form, Zod and AI integrations. It has role portals for students, employers, universities, providers and administrators.

## Technical requirements

### SRS-01 Data integrity

PostgreSQL is the production source of truth. Multi-record writes are transactional. Application history, reviewer notes, documents and score history remain consistent with parent records.

### SRS-02 Multi-tenant authorization

Supabase RLS and server-side guards enforce user, role, organisation and institution boundaries. Tests cover anonymous, wrong-role, wrong-tenant and cross-user access.

### SRS-03 Authentication security

Use secure cookie sessions, expiry/rotation, logout invalidation, MFA where configured, brute-force protection, OTP expiry and recovery controls. Never commit or expose secrets.

### SRS-04 Validation

Shared schemas validate opportunity, profile, application, status, document and filter inputs. Reject malformed, oversized, stale or unauthorized requests with stable errors.

### SRS-05 Document security

Use private storage, authorized signed URLs, content/type/size checks, safe filenames and retention/deletion rules. Documents must not be publicly enumerable or cached.

### SRS-06 AI governance

AI calls require timeouts, rate limits, circuit breakers, safe fallbacks, data minimization, abuse filtering, usage monitoring and traceable result versions. Matching/GX Score limitations must be visible to users.

### SRS-07 Performance

Paginate marketplace, applications, candidates, users and reports. Index tenant keys and common filters. Target p95 under 500 ms for ordinary database-backed requests, excluding external AI/email latency.

### SRS-08 Notifications/background work

Status and matching events should use idempotent outbox/queue processing with retry state, provider IDs and observable failure status. The UI distinguishes queued, sent, delivered and failed.

### SRS-09 Observability

Log correlation ID, actor, tenant, route, status, latency and error class. Do not log passwords, tokens, document contents or unnecessary personal data. Alert on auth failures, queue backlog, upload failures and database errors.

### SRS-10 Accessibility/responsive UX

All portals and forms support keyboard navigation, visible focus, semantic labels, accessible errors, loading/empty/error states and mobile layouts.

## API inventory

The branch exposes API families for auth, onboarding/profiles, opportunities, saved opportunities, applications, documents, reviewer notes, employer/provider/university workflows, matching, GX Score, Copilot, reference data and administration. Keep this document synchronized with `src/app/api` when routes change.

## Business state rules

Application lifecycle: Draft → Submitted → Under Review → Shortlisted → Assessment → Interview → Selected/Rejected. Rejection requires a reason; withdrawal is allowed before selection; submission is blocked after the deadline; minimum profile completion is required. Enforce transitions server-side and test them.

Matching requires sufficient profile completion, uses configured dimensions/weights, provides explanations and handles unsuitable opportunities. GX Score is deterministic for the same inputs, retains history and is not a guaranteed employability outcome.

## Verification plan

1. Install dependencies and run lint/type/build checks.
2. Apply migrations in an isolated Supabase environment.
3. Test auth, MFA and recovery in a fresh browser session.
4. Test every role against every protected route/API family.
5. Exercise onboarding → dashboard → marketplace → application.
6. Verify employer/provider review and status history.
7. Test private document upload/download and denial paths.
8. Test matching, GX Score and Copilot dependency failures.
9. Reconcile reports with database records.
10. Run accessibility, performance, security and migration rollback checks.

## Readiness statement

The branch has broad feature coverage but is not automatically production-ready. Highest-risk areas are tenant isolation, document privacy, application transitions, AI governance, notifications/background jobs and complete end-to-end QA.
