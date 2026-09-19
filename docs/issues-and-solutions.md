# Issues & Solutions Tracker

## Issue #1: `/student/onboarding` returns 404 after persona selection

**Severity:** Critical (blocks onboarding flow)

**Symptoms:**
```
POST /api/auth/role-select 200 in 1945ms
GET /student/onboarding 404 in 550ms
GET /student/onboarding 404 in 262ms
```

**Root Cause:**
The onboarding pages live inside the `(student)` route group (`src/app/(student)/onboarding/`). In Next.js, parenthesized folders are **route groups** — they do NOT appear in the URL. So the correct URL is `/onboarding`, not `/student/onboarding`.

However, `ROLE_ONBOARDING` in `src/lib/auth/constants.ts:42` maps:
```ts
student: '/student/onboarding'
```

The `role-select` API (`src/app/api/auth/role-select/route.ts:101`) returns this path as `redirectTo`, causing the client to navigate to a non-existent route.

**Files Involved:**
- `src/lib/auth/constants.ts` — `ROLE_ONBOARDING` map (line 42)
- `src/lib/auth/guards.ts` — `requireOnboarding()` (line 90)
- `src/app/api/auth/role-select/route.ts` — uses `ROLE_ONBOARDING` (line 101)
- `src/middleware.ts` — `PROTECTED_PREFIX_ROLE` expects `/student` prefix (line 9)

**Solution Applied:**
Renamed `src/app/(student)` to `src/app/student`. This makes `/student/onboarding`, `/student/dashboard`, etc. real URLs — matching the constants in `ROLE_ONBOARDING`, `ROLE_DASHBOARDS`, and the middleware's `PROTECTED_PREFIX_ROLE` map.

---

## Issue #2: Missing `data-scroll-behavior` on `<html>` element

**Severity:** Low (warning, not blocking)

**Symptoms:**
```
add `data-scroll-behavior="smooth"` to your <html> element.
Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior
(src/app/providers.tsx:20:18)
```

**Root Cause:**
Next.js expects `data-scroll-behavior="smooth"` on the `<html>` tag when using features that rely on smooth scrolling. The attribute is missing in `src/app/layout.tsx:15`.

**Files Involved:**
- `src/app/layout.tsx` (line 15)

**Solution Applied:**
Added `data-scroll-behavior="smooth"` to the `<html>` element in `src/app/layout.tsx`.

---

---

## Issue #3: `/onboarding/identity` and other sub-routes return 404

**Severity:** Critical (blocks onboarding steps)

**Symptoms:**
```
GET /student/onboarding 200
GET /onboarding/identity 404
GET /onboarding 404
```

**Root Cause:**
After fixing Issue #1, the onboarding page's internal `STEP_URL_MAP` and other components still used bare `/onboarding/...` paths without the `/student` prefix. The `redirect('/dashboard')` in the same file also lacked the prefix.

**Files Fixed:**
- `src/app/student/onboarding/page.tsx` — `STEP_URL_MAP` paths and dashboard redirect
- `src/app/student/dashboard/page.tsx` — redirect to onboarding
- `src/components/dashboard/quick-actions.tsx` — Edit Profile href
- `src/lib/ai/gx-score/recommendation-generator.ts` — action_url for portfolio
- `src/lib/dashboard/constants.ts` — Edit Profile href

**Solution Applied:**
Prefixed all bare `/onboarding` and `/dashboard` routes with `/student` across all student-context files.

---

---

## Issue #4: Maximum update depth exceeded — infinite re-render loop on onboarding pages

**Severity:** Critical (crashes the page)

**Symptoms:**
```
Maximum update depth exceeded.
at setStepData (src/stores/onboarding-store.ts:127:9)
at IdentityPage.useEffect (src/app/student/onboarding/identity/page.tsx:42:5)
```

**Root Cause:**
Circular dependency between two `useEffect` hooks:
1. `form.watch()` returns a new object reference every render
2. Effect syncs `formValues` → store via `setStepData` → store's `identity` updates
3. Another effect watches store `identity` → calls `form.reset()` → form values change
4. Triggers step 1 again → infinite loop

Same pattern existed in `career-goals/page.tsx` and `global-preferences/page.tsx`.

**Files Fixed:**
- `src/app/student/onboarding/identity/page.tsx`
- `src/app/student/onboarding/career-goals/page.tsx`
- `src/app/student/onboarding/global-preferences/page.tsx`

**Solution Applied:**
Removed the `setStepData` effect entirely (it was redundant — `useAutoSave` already handles persistence, and `goToNext` passes form data directly to the API). Changed `form.reset` from store data to only run once on initial load via `initializedRef`, breaking the circular dependency completely.

---

## Issue #5: `useStepNavigation` routes to `/onboarding/...` instead of `/student/onboarding/...`

**Severity:** Critical (404 on every step transition)

**Symptoms:**
```
GET /onboarding/education 404
```

**Root Cause:**
`src/hooks/onboarding/useStepNavigation.ts` used `/onboarding/${slug}` in `router.push()` calls (lines 42, 56, 77, 88) — missing the `/student` prefix.

**Files Fixed:**
- `src/hooks/onboarding/useStepNavigation.ts`

**Solution Applied:**
Made navigation dynamic — derives `rolePrefix` from `usePathname()` (splits on `/onboarding`), so it works for any role (student, employer, etc.) without hardcoding.

---

## Issue #6: `/dashboard` 404 after onboarding complete

**Severity:** Critical (blocks post-onboarding flow)

**Symptoms:**
```
POST /api/v1/students/onboarding/complete 200
GET /dashboard 404
```

**Root Cause:**
`src/app/student/onboarding/complete/page.tsx:83` used `router.push('/dashboard')` instead of `router.push('/student/dashboard')`.

**Solution Applied:**
Changed to `/student/dashboard`. This is student-specific code so hardcoding is fine here.

---

## Issue #7: Hardcoded role paths in shared components break other personas

**Severity:** Medium (would affect employer/university/admin flows)

**Root Cause:**
Shared components and hooks hardcoded `/student` prefix, meaning employer/university/admin would get wrong redirects.

**Files Fixed:**
- `src/components/dashboard/quick-actions.tsx` — now accepts `rolePrefix` prop (defaults to `/student`)
- `src/lib/dashboard/constants.ts` — converted `QUICK_ACTION_ITEMS` to `getQuickActionItems(rolePrefix)` function
- `src/components/auth/mfa-verify-form.tsx` — now reads role from API response, uses `ROLE_DASHBOARDS[role]`
- `src/components/auth/role-select-grid.tsx` — fallback changed from `/student/dashboard` to `/role-select`
- `src/hooks/onboarding/useStepNavigation.ts` — derives `rolePrefix` from current `pathname`

**Solution Applied:**
Made all shared components role-agnostic by either accepting a role prefix prop or deriving it from the current URL/API response.

---

## Summary

| # | Issue | Status |
|---|-------|--------|
| 1 | `/student/onboarding` 404 after role select | Fixed |
| 2 | Missing `data-scroll-behavior` on `<html>` | Fixed |
| 3 | `/onboarding/identity` sub-routes 404 | Fixed |
| 4 | Infinite re-render loop on onboarding pages | Fixed |
| 5 | Step navigation routes missing `/student` prefix | Fixed |
| 6 | `/dashboard` 404 after onboarding complete | Fixed |
| 7 | Hardcoded role paths in shared components | Fixed |
| 8 | No logout button anywhere in UI | Fixed — avatar dropdown in student, button in provider |
| 9 | No student profile page | Fixed — created `/student/profile` |
| 10 | Program creation: `work_mode` enum mismatch (`onsite` vs `on_site`) | Fixed |
| 11 | Program creation: `description`/`location_country` sent as optional (DB requires NOT NULL) | Fixed |
| 12 | Program creation: `organization_id` column missing from `program_provider_profiles` | Fixed — migration 020 |
| 13 | Provider setup: no `organizations` row created during onboarding | Fixed — setup API creates org |
| 14 | Supabase GoTree auth service unreachable | **BLOCKED** — infrastructure issue |
