# GlobalXcelerate Architecture Rules

**Document Type:** Architecture Rules
**Version:** 1.0
**Effective Date:** 2025-01-27
**Scope:** All GlobalXcelerate platform development — Next.js 14+ (App Router), Supabase (PostgreSQL, Auth, Storage, Realtime), TypeScript, Tailwind CSS, shadcn/ui

## 1. Purpose & Overview

This document establishes the architecture governance rules for the GlobalXcelerate B2B2C Global Talent Mobility & Experiential Learning Platform. It defines mandatory patterns for component architecture, state management, routing, data fetching, caching, database design, real-time subscriptions, file storage, responsive design, AI integration, notifications, and multi-tenant isolation. These rules ensure consistency, scalability, performance, and maintainability across a platform serving students, employers, universities, program providers, mentors, and platform administrators globally.

## 2. Definitions

- **Server Component**: A React component that renders on the server and does not include client-side interactivity (default in App Router)
- **Client Component**: A React component marked with 'use client' that includes browser interactivity, event handlers, or state
- **Atomic Design**: A component hierarchy methodology consisting of Atoms, Molecules, Organisms, Templates, and Pages
- **ISR (Incremental Static Regeneration)**: A data fetching strategy that regenerates static pages at a configured interval
- **RLS (Row Level Security)**: PostgreSQL-level access control policies enforcing data isolation per user/role
- **Route Group**: A Next.js App Router directory wrapped in parentheses that organizes routes without affecting URL structure
- **Multi-Tenant**: Architecture pattern where multiple organizations share the same database with row-level data isolation
- **Donut Pattern**: Server component wrapping client component children to minimize client JavaScript bundle

## 3. Rules & Policies

### ARCH-001: Atomic Design Component Hierarchy (REQUIRED)
**Statement:** All UI components MUST be organized following the Atomic Design methodology with five levels: Atoms (Button, Input, Badge, Avatar), Molecules (SearchBar, FormField, StatCard), Organisms (NavigationBar, OpportunityCard, ProfileHeader), Templates (DashboardTemplate, MarketplaceTemplate), and Pages (route-level components).
**Scope:** All React components in the `src/components/` directory
**Rationale:** Atomic Design ensures consistent component reuse, clear dependency direction, and scalable design system growth — critical for a platform with 6 distinct user roles and dozens of views.

### ARCH-002: Component File Organization (REQUIRED)
**Statement:** Each component MUST reside in its own directory with the structure `ComponentName/index.tsx`, `ComponentName.types.ts`, and `ComponentName.test.tsx`. Components MUST NOT exceed 200 lines; sub-components SHALL be extracted when this limit is exceeded.
**Scope:** All component files in `src/components/`
**Rationale:** Enforces single responsibility principle, improves discoverability, and ensures testability of every component.

### ARCH-003: TypeScript Strict Typing (REQUIRED)
**Statement:** All components MUST be typed with explicit TypeScript interfaces. The use of `any` type is MUST NOT be permitted. Props interfaces MUST be exported separately for reuse across the application.
**Scope:** Entire codebase
**Rationale:** TypeScript strict mode prevents runtime errors, improves IDE support, and documents component contracts — essential for a multi-developer team building a complex platform.

### ARCH-004: Server Components as Default (REQUIRED)
**Statement:** All components MUST be Server Components by default. The 'use client' directive MUST only be added when the component requires event handlers, useState/useEffect, browser APIs, or third-party client-side libraries.
**Scope:** All React components in the App Router
**Rationale:** Server Components reduce client JavaScript bundle size, improve initial load performance, and enable direct backend access — aligning with the < 2 second LCP performance requirement.

### ARCH-005: Client Component Boundary Minimization (REQUIRED)
**Statement:** The 'use client' boundary MUST be pushed as low as possible in the component tree. Developers MUST NOT wrap entire pages in 'use client'; instead, interactive parts SHALL be extracted into leaf client components using the donut pattern.
**Scope:** All page and layout components
**Rationale:** Minimizing client component scope reduces JavaScript payload, improves Time to Interactive, and maximizes server-side rendering benefits for SEO.

### ARCH-006: Route Group Organization (REQUIRED)
**Statement:** Routes MUST be organized into route groups: `(public)` for unauthenticated pages, `(dashboard)` for student routes, `(marketplace)` for opportunity browsing, `(employer)` for employer routes, `(university)` for university admin routes, `(admin)` for platform administration, and `api/` for backend API routes.
**Scope:** All pages in `src/app/`
**Rationale:** Route groups enforce role-based access patterns, enable per-group layouts and middleware, and provide clear organizational boundaries aligned with the 6-role RBAC model.

### ARCH-007: Route Convention Files (REQUIRED)
**Statement:** Every route group MUST include `layout.tsx` for shared UI, `loading.tsx` for Suspense fallbacks, `error.tsx` for error boundaries, and `not-found.tsx` for 404 handling. Loading states MUST be present on every page.
**Scope:** All route directories in `src/app/`
**Rationale:** Consistent loading, error, and not-found handling ensures graceful degradation and provides immediate visual feedback to users during page transitions.

### ARCH-008: Dynamic Route Parameter Validation (REQUIRED)
**Statement:** All dynamic route parameters (`[id]`, `[slug]`) MUST be validated with Zod schemas before being used in database queries. Invalid parameters MUST return appropriate HTTP error responses (400 or 404).
**Scope:** All dynamic route handlers and page components
**Rationale:** Input validation at the routing layer prevents injection attacks and ensures data integrity before any database operation.

### ARCH-009: SSR for Personalized Pages (REQUIRED)
**Statement:** Pages displaying user-specific, frequently changing data (student dashboard, application management, admin panels) MUST use Server-Side Rendering with no-cache data fetching to ensure fresh content on every request.
**Scope:** Dashboard, application, and admin pages
**Rationale:** Personalized pages require current data; stale cached data would mislead users about application statuses, scores, or notifications.

### ARCH-010: ISR for Marketplace Pages (REQUIRED)
**Statement:** Marketplace listing pages MUST use Incremental Static Regeneration with a revalidation interval of 60 seconds. Public student profiles SHALL revalidate every 300 seconds. Organization pages SHALL revalidate every 3600 seconds.
**Scope:** Marketplace, public profiles, organization pages
**Rationale:** ISR provides near-static performance with periodic freshness — suitable for content that changes infrequently but must stay reasonably current for 100K+ opportunities.

### ARCH-011: Client-Side Data Fetching Restrictions (REQUIRED)
**Statement:** Client-side data fetching (SWR/React Query) MUST only be used for real-time updates, infinite scroll pagination, optimistic updates, and polling for background jobs. Developers MUST NOT fetch in client components what can be fetched in server components.
**Scope:** All data fetching implementations
**Rationale:** Server-side fetching is more performant, secure (no exposed API keys), and SEO-friendly; client-side fetching adds complexity and should be reserved for truly dynamic scenarios.

### ARCH-012: Supabase Client Separation (REQUIRED)
**Statement:** Developers MUST use the Supabase server client in Server Components and API routes, and the Supabase browser client only in client components. The service role key MUST NEVER be used in client-side code or exposed in client bundles.
**Scope:** All Supabase database interactions
**Rationale:** Separating clients ensures RLS policies are enforced correctly and prevents credential exposure that could allow unauthorized data access.

### ARCH-013: Cache Invalidation on Data Mutation (REQUIRED)
**Statement:** All data mutations MUST trigger appropriate cache invalidation using `revalidatePath()` or `revalidateTag()`. Profile updates MUST invalidate matching cache, GX Score cache, and public profile cache. New opportunities MUST invalidate marketplace listings cache.
**Scope:** All server actions and API route mutations
**Rationale:** Stale cache data after mutations causes user confusion and data inconsistency. Explicit invalidation ensures UI reflects the latest state.

### ARCH-014: Never Cache Auth or Transaction State (REQUIRED)
**Statement:** Authentication state, application status, and payment transaction data MUST NEVER be served from cache. These values MUST always be fetched fresh from the database on every request.
**Scope:** Auth checks, application status queries, payment flows
**Rationale:** Stale auth/transaction state creates security vulnerabilities and can lead to incorrect business decisions (e.g., user sees accepted status that was actually rejected).

### ARCH-015: UUID Primary Keys (REQUIRED)
**Statement:** All database tables MUST use UUID as primary keys generated with `gen_random_uuid()`. Sequential integer IDs MUST NOT be used.
**Scope:** All Supabase PostgreSQL tables
**Rationale:** UUIDs prevent enumeration attacks, support distributed systems, and eliminate ID collision risks in multi-tenant environments.

### ARCH-016: Mandatory Table Timestamps (REQUIRED)
**Statement:** Every database table MUST include `created_at` and `updated_at` timestamp columns with automatic trigger-based updates. Recoverable entities (profiles, opportunities) MUST implement soft delete with a `deleted_at` column.
**Scope:** All database tables
**Rationale:** Timestamps enable audit trails, debugging, and compliance reporting. Soft delete prevents accidental data loss and supports GDPR right-to-erasure workflows.

### ARCH-017: Row Level Security on All Tables (REQUIRED)
**Statement:** RLS MUST be enabled on ALL database tables without exception. RLS policies MUST use `auth.uid()` for user identification. Policies MUST be applied in the same migration that creates the table.
**Scope:** All Supabase PostgreSQL tables
**Rationale:** RLS is the primary data isolation mechanism; any table without RLS is a potential data breach vector in a multi-tenant platform.

### ARCH-018: Database Indexing Standards (REQUIRED)
**Statement:** All foreign key columns MUST be indexed. Composite indexes MUST be created for common query patterns. Full-text search fields MUST have tsvector indexes. Performance MUST be monitored and new indexes added when P95 query time exceeds 100ms.
**Scope:** All database tables and queries
**Rationale:** Proper indexing ensures the < 100ms database query time requirement is met even as data grows to 1M+ student profiles and 100K+ opportunities.

### ARCH-019: Forward-Only Migrations (REQUIRED)
**Statement:** Database migrations MUST be forward-only — deployed migrations MUST NOT be edited. Each migration MUST have a descriptive name with timestamp prefix and MUST include a reversible down migration.
**Scope:** All Supabase database migrations
**Rationale:** Forward-only migrations prevent state inconsistencies across environments and ensure reproducible database state from any point in history.

### ARCH-020: Real-Time Subscription Hygiene (REQUIRED)
**Statement:** Supabase Realtime subscriptions MUST only exist in client components with proper cleanup via useEffect unsubscribe. Subscriptions MUST be filtered to user-relevant data only. Maximum 10 concurrent subscriptions per client session MUST be enforced.
**Scope:** All real-time features (notifications, status updates, chat)
**Rationale:** Unmanaged subscriptions cause memory leaks, excessive server load, and potential data exposure. Limiting concurrent subscriptions prevents resource exhaustion.

### ARCH-021: File Storage Bucket Separation (REQUIRED)
**Statement:** Files MUST be stored in role-specific buckets: `avatars` (public), `portfolios` (private), `opportunity-assets` (private), `resumes` (private), `temp` (private with 24h auto-cleanup). Private file access MUST use signed URLs with 1-hour expiry.
**Scope:** All file upload and storage operations
**Rationale:** Bucket separation enables granular access control, simplifies security audits, and prevents unauthorized file access through predictable URLs.

### ARCH-022: File Upload Validation (REQUIRED)
**Statement:** All file uploads MUST validate MIME type on both client and server. Maximum sizes MUST be enforced: 10MB for documents, 5MB for images. File names MUST be sanitized and UUID-prefixed. Only PDF, DOCX (documents) and JPEG, PNG, WebP (images) formats SHALL be accepted.
**Scope:** All file upload endpoints and client upload components
**Rationale:** File validation prevents malicious file uploads, storage abuse, and ensures consistent file handling across the platform.

### ARCH-023: Next.js Image Component Mandatory (REQUIRED)
**Statement:** All images MUST use the Next.js `<Image>` component with appropriate width, height, responsive srcSet, and lazy loading configuration. Above-the-fold images MUST set `priority={true}`. All images MUST include blur placeholders.
**Scope:** All image rendering across the application
**Rationale:** Next.js Image component provides automatic optimization, responsive sizing, lazy loading, and WebP conversion — essential for < 2 second LCP target.

### ARCH-024: Mobile-First Responsive Design (REQUIRED)
**Statement:** All layouts MUST be designed mobile-first using Tailwind's responsive prefixes (sm, md, lg, xl, 2xl). Touch targets MUST be minimum 44x44px on mobile. No horizontal scrolling SHALL occur on any breakpoint. The breakpoint system MUST follow: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px).
**Scope:** All UI components and page layouts
**Rationale:** Mobile-first design ensures the majority of users (mobile web traffic) have an optimal experience, with progressive enhancement for larger screens.

### ARCH-025: Sidebar Layout Architecture (REQUIRED)
**Statement:** Desktop layouts (≥ 1024px) MUST use a fixed sidebar (280px expanded, 64px collapsed) with role-based navigation items. Tablet and mobile MUST use a slide-over overlay sidebar. The main content area MUST have a max-width constraint (max-w-7xl) with consistent padding.
**Scope:** All authenticated route group layouts
**Rationale:** Consistent navigation architecture across roles reduces cognitive load, enables quick access to features, and maintains spatial consistency.

### ARCH-026: URL-Based Filter State (REQUIRED)
**Statement:** Search and filter state MUST be managed in URL search parameters to enable shareable and bookmarkable filtered views. Filter components MUST update URL params; server components MUST read params for database queries. Search input MUST be debounced at 300ms.
**Scope:** Marketplace, search, and listing pages
**Rationale:** URL-based state enables deep linking, browser history navigation, and sharing of specific search results — improving user experience and reducing support queries.

### ARCH-027: Server-Side AI Integration Only (REQUIRED)
**Statement:** All AI/LLM API calls MUST be routed exclusively through Next.js API routes. AI API keys MUST NEVER appear in client-side code. A circuit breaker pattern MUST be implemented with fallback responses when AI services are unavailable. Maximum timeout for AI requests MUST be 30 seconds.
**Scope:** AI Matching Engine, Career Copilot, Score Explanations, Skill Gap Analysis
**Rationale:** Server-side AI integration protects API keys, enables rate limiting and cost control, and provides a single point for monitoring and circuit breaking.

### ARCH-028: AI Service Abstraction Layer (RECOMMENDED)
**Statement:** AI service calls SHOULD be implemented through a provider-agnostic abstraction layer in `lib/ai/` that supports model version A/B testing via configuration. Token limits SHOULD be enforced: 4000 input tokens and 2000 output tokens for Copilot interactions.
**Scope:** All AI integration code
**Rationale:** Abstraction enables provider switching (OpenAI to Anthropic, etc.) without code changes, supports experimentation, and controls costs.

### ARCH-029: Notification Rate Limiting (REQUIRED)
**Statement:** The notification system MUST NOT send more than 5 notifications per hour per user; excess notifications MUST be batched. Critical notifications (security alerts, application decisions) MUST always be delivered regardless of rate limits. Email notifications MUST include an unsubscribe link.
**Scope:** All notification delivery paths (in-app, email, future push)
**Rationale:** Notification fatigue reduces platform engagement. Rate limiting with critical overrides balances user experience with important communication needs.

### ARCH-030: Multi-Tenant Row-Level Isolation (REQUIRED)
**Statement:** Multi-tenant data isolation MUST be implemented at the row level using RLS policies with `organization_id` columns on organization-scoped tables. The RLS policy pattern MUST be: `organization_id = (SELECT organization_id FROM org_members WHERE user_id = auth.uid())`. Cross-tenant data access attempts MUST be audit-logged.
**Scope:** All organization-scoped data (opportunities, applications, student-institution relationships)
**Rationale:** Row-level multi-tenancy is the chosen isolation strategy; proper implementation prevents data leakage between organizations that would constitute a severe security breach and compliance violation.

## 4. Enforcement & Compliance

- **Code Review**: All pull requests MUST be reviewed for architecture rule compliance before merge
- **Automated Linting**: ESLint rules SHALL enforce naming conventions, import boundaries, and component size limits
- **CI/CD Checks**: Build pipeline SHALL verify TypeScript strict mode passes, no `any` types exist, and all route groups have required convention files
- **Architecture Decision Records**: Any deviation from these rules MUST be documented in an ADR with justification and approval
- **Performance Monitoring**: Vercel Analytics and Supabase Dashboard SHALL track compliance with performance targets (LCP < 2s, query P95 < 100ms)
- **RLS Testing**: Integration test suite SHALL verify RLS policies prevent cross-tenant data access on every deployment

## 5. Exceptions & Exemptions

- **Process**: Exceptions require a written Architecture Decision Record (ADR) with problem statement, alternatives considered, and approval from tech lead
- **Temporary Exceptions**: Prototypes and spike branches MAY bypass component size and testing rules; these branches MUST NOT be merged to main without compliance
- **Third-Party Constraints**: When third-party libraries mandate specific patterns (e.g., a library requires 'use client' at a higher level), document the constraint in the component's README
- **Performance Exceptions**: If ISR revalidation timing needs adjustment based on measured traffic patterns, changes may be made with monitoring data justification

## 6. Review & Governance

- **Quarterly Review**: Architecture rules reviewed every quarter against platform growth metrics and team feedback
- **Performance Audit**: Monthly performance audit comparing actual metrics against targets (LCP, query times, bundle size)
- **Technology Updates**: When Next.js or Supabase release major versions, rules SHALL be reviewed for alignment with new capabilities
- **Rule Updates**: Proposed rule changes require RFC process with 1-week comment period from all active developers
- **Compliance Tracking**: Architecture compliance score tracked per sprint; target > 95% compliance across all rules