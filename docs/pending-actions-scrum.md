# Global Talent & Mobility Platform — Feature Status Report

**Last Updated:** 2026-08-31
**Project:** Global Talent & Mobility Platform (GX)
**Overall Status:** All 5 user roles are functional with core features live


---

## Platform Overview

The platform serves 5 user personas. Each persona has its own onboarding flow, dashboard, and role-specific features.

| Role | Who are they? | Status |
|------|--------------|--------|
| Student | Job seekers exploring global opportunities | Fully built |
| Employer | Companies posting jobs and hiring talent | Mostly built |
| University Admin | Staff tracking student outcomes and partnerships | Fully built |
| Program Provider | Organizations offering internships, exchanges, etc. | Fully built |
| Platform Admin | Internal team managing the platform | Fully built |

---

## Feature Completion by Role

### Student

| Feature | Status | Notes |
|---------|--------|-------|
| Account registration & role selection | Done | |
| 7-step onboarding (identity, education, skills, experience, career goals, global preferences, portfolio) | Done | |
| Dashboard with personalized widgets | Done | Includes GX score, profile completion, recommendations, deadlines, notifications |
| Profile page | Done | View and edit personal details |
| Browse opportunity marketplace | Done | Search, filter by category/location/work mode/compensation |
| View opportunity details | Done | Match score, organization info, application option |
| Apply to opportunities | Done | With document uploads |
| Track applications | Done | List and detail views with status updates |
| GX Score page | Done | Score breakdown and improvement tips |
| Logout | Done | Available from dashboard and profile page |

### Employer

| Feature | Status | Notes |
|---------|--------|-------|
| Account registration & role selection | Done | |
| Company setup (name, industry, size, website) | Done | Single-page form |
| Dashboard with stats overview | Done | Active listings, applications, matched candidates |
| Create job/opportunity listings | Done | Full form with location, compensation, requirements, deadlines |
| Manage listings (edit, publish, close) | Done | Draft → Published → Closed lifecycle |
| Review incoming applications | Done | Filter by status, view applicant details |
| Application pipeline (review → shortlist → interview → offer/reject) | Done | Status transitions with reviewer notes |
| Search candidates by skills & GX score | **Frontend only** | The search page exists but the backend is not connected — **searches will fail** |
| Logout from dashboard | Done | |

### University Admin

| Feature | Status | Notes |
|---------|--------|-------|
| Account registration & role selection | Done | |
| Institution setup (name, department, position, website) | Done | Single-page form |
| Dashboard with institution stats | Done | Student count, average GX score, active programs |
| View student roster | Done | Search by name/email, sort by GX score, see skills and application counts |
| View individual student details | Done | Profile info, applications history, skills breakdown, GX score |
| View program partnerships | Done | Programs students are enrolled in, acceptance rates, enrollment counts |
| Logout from dashboard | Done | |

### Program Provider

| Feature | Status | Notes |
|---------|--------|-------|
| Account registration & role selection | Done | |
| Organization setup (name, program type, description, website) | Done | Single-page form; also registers the organization in the system |
| Dashboard with program stats | Done | Active programs, applications, enrolled participants |
| Create new programs | Done | Title, category, description, location, duration, spots, requirements |
| Manage programs (edit, publish, close, archive) | Done | Full lifecycle management |
| View program details with applicant list | Done | See who applied, their GX scores, and application status |
| Review applications (accept, reject, waitlist) | Done | With status tracking history |
| Logout from dashboard | Done | |

### Platform Admin

| Feature | Status | Notes |
|---------|--------|-------|
| Account registration (restricted to approved email domains) | Done | Only `@globalxcelerate.com` emails can select admin role |
| Admin setup confirmation | Done | One-click activation |
| Dashboard with platform-wide stats | Done | Total users (live count), listings, reports, system health |
| User management — browse all users | Done | Search, filter by role and status, paginated |
| User management — view user details | Done | See role-specific profile info, account activity |
| User management — suspend / reactivate accounts | Done | |
| User management — change user roles | Done | |
| User management — delete accounts | Done | Soft delete (ban) |
| Moderate opportunity listings | Done | Pending review queue, approve or reject with reason |
| Platform analytics & reports | Done | User breakdown, opportunity stats, conversion rates, approval rates |
| Logout from dashboard | Done | |

---

## Shared / Cross-Role Features

| Feature | Status | Notes |
|---------|--------|-------|
| Login / Registration / Forgot Password | Done | |
| Role selection during signup | Done | Visual card-based picker for all 5 roles |
| Role-based access control | Done | Each role can only access their own section |
| AI-powered match scoring | Done | Calculates how well a student matches an opportunity |
| Match score explanations | Done | Natural language breakdown of why a score was given |
| Batch matching for employers | Done | Calculate scores for all candidates on an opportunity |
| Landing page | Done | Hero section, features, university/employer benefits |

---

## What's Not Done Yet

### Must Fix (blocking user experience)

| # | Issue | Who's affected | What happens |
|---|-------|---------------|-------------|
| 1 | Candidate search is broken | Employers | The "Search Candidates" page loads but returns errors because the backend isn't connected |
| 2 | ~~No logout button on 3 dashboards~~ | ~~Employers, University Admins, Platform Admins~~ | **Fixed** — All 5 role dashboards now have a Sign Out button |
| 3 | No centralized route protection | All users | If someone manually types a URL for another role's pages, protection depends on each individual page checking access (most do, but there's no safety net) |

### Planned but Not Started

| # | Feature | Who it's for | Priority |
|---|---------|-------------|----------|
| 4 | Sidebar navigation for each role | All roles | P2 — Currently dashboards have quick-action links but no persistent sidebar menu |
| 5 | Cross-role notifications | Employers, Providers | P2 — e.g., "You have 3 new applicants" when students apply |
| 6 | AI-powered candidate recommendations | Employers, Providers | P2 — Use the matching engine to suggest best-fit candidates |
| 7 | Provider profile page | Providers | P2 — Students can view provider/organization profiles (like the student profile page) |
| 8 | End-to-end automated testing | All roles | Blocked — The test authentication service is unreachable, so automated login tests can't run |

---

## Scope from PRD vs Delivered

### Fully Delivered
- All 5 personas can register, onboard, and access their dashboards
- Logout available on all 5 role dashboards
- Student: complete 7-step onboarding, marketplace, applications, GX score
- Employer: opportunity lifecycle (create → publish → manage), application review pipeline with status tracking
- University Admin: student roster, individual student profiles, program partnership overview
- Program Provider: program lifecycle (create → publish → close → archive), application review with accept/reject/waitlist
- Platform Admin: user management (full CRUD), opportunity moderation, platform analytics
- AI matching engine (scoring, explanations, batch processing, candidate ranking)
- Role-based access control across all sections
- Email verification flow (signup → email link → callback → role selection)
- Reverse proxy compatible email callbacks via `NEXT_PUBLIC_APP_URL`

### Partially Delivered
- Employer candidate search (UI exists, backend not connected)

### Not Yet Started
- Sidebar navigation for role-specific sections
- Real-time notifications across roles
- Provider/organization public profiles
- Automated end-to-end test suite (blocked by infrastructure)

---


## Environment Setup — Supabase Keys

To run the project, you need three environment variables from your Supabase project. Create a `.env` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_APP_URL=<your-public-url>
```

### How to get the keys from Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in
2. Select your project (or create a new one)
3. In the left sidebar, click **Project Settings** (gear icon at the bottom)
4. Click **API** under the "Configuration" section
5. You will see:
   - **Project URL** — Copy this as `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys**:
     - `anon` / `public` — Copy this as `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to expose in the browser)
     - `service_role` — Copy this as `SUPABASE_SERVICE_ROLE_KEY` (**keep this secret** — never expose it in client-side code or commit it to git)

### NEXT_PUBLIC_APP_URL (required for reverse proxy / VM deployments)

If the app runs behind a reverse proxy (e.g., Nginx, Caddy, Cloudflare Tunnel), set `NEXT_PUBLIC_APP_URL` to the public URL users access in their browser:

```env
NEXT_PUBLIC_APP_URL=https://app.example.com
```

This ensures email verification and password reset links point to the correct address. If not set, the app falls back to `x-forwarded-host` headers, then `request.url` origin.

### Important notes

- The `anon` key is designed to be public — it only has access allowed by your Row Level Security (RLS) policies
- The `service_role` key bypasses RLS — use it only in server-side code (API routes, server components)
- Never commit `.env` to git (it's already in `.gitignore`)
- If you create a new Supabase project, you'll also need to run the database migrations and seed script

---

## Test Accounts

All accounts use the same password: **`Test@1234`**
Link - [Preview URL](https://app-preview--saiv2--rgsjvfpcua.appbuilder.adya.ai/)

| Role | Email | Name |
|------|-------|------|
| Student | student1@gxtest.com | Arjun Mehta |
| Student | student2@gxtest.com | Priya Sharma |
| Student | student3@gxtest.com | Liam Chen |
| Employer | employer1@gxtest.com | Rajesh Kumar |
| Employer | employer2@gxtest.com | Sarah Johnson |
| University Admin | university1@gxtest.com | Dr. Anita Rao |
| University Admin | university2@gxtest.com | Prof. James Wilson |
| Program Provider | provider1@gxtest.com | Michael Torres |
| Program Provider | provider2@gxtest.com | Aisha Patel |

---

## Summary

The platform has gone from **1 working role (Student)** to **all 5 roles fully functional** with core features.

### Recent fixes
- **Logout** — All 5 role dashboards now have a Sign Out button (previously missing on employer, university, and admin)
- **Hero section visibility** — Fixed dark body background (`#050607`) bleeding through the landing page hero section, making text invisible. Replaced with theme-aware `bg-background` and made the hero gradient fully opaque
- **Registration rate limit removed** — Removed the in-memory rate limiter that was blocking signup after 5 attempts per IP per hour (`RATE_LIMITED` error)
- **Supabase `getSession()` warning fixed** — Replaced insecure `getSession()` calls with `getUser()` in middleware and the client auth hook, eliminating the "could be insecure" console warnings
- **Reverse proxy support** — Email verification and password reset callback URLs now resolve correctly behind a reverse proxy. Uses `NEXT_PUBLIC_APP_URL` env var with fallback to `x-forwarded-host` headers

### Remaining critical items
1. Employer candidate search backend is not connected (frontend-only)
2. No centralized route protection (each page checks individually)

### P2 polish (not blocking launch)
- Sidebar navigation for role-specific sections
- Real-time cross-role notifications
- Provider/organization public profiles
- Automated end-to-end test suite (blocked by infrastructure)
