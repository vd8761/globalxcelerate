# GlobalXcelerate Global Governance Rules

**Document Type:** Global Rules
**Version:** 1.0
**Effective Date:** 2025-08-16
**Scope:** All development on the GlobalXcelerate B2B2C SaaS platform — Next.js 14+ App Router with Supabase backend, deployed on Vercel, serving 6 user roles across multiple countries.

## 1. Purpose & Overview

This document defines the mandatory global governance rules for all engineering work on GlobalXcelerate — a global talent mobility and experiential learning platform. These rules establish coding standards, naming conventions, file organization patterns, documentation requirements, accessibility standards (WCAG 2.1 AA), internationalization requirements, performance budgets, error handling patterns, and logging standards. Compliance ensures consistent code quality, maintainability, accessibility for diverse global users, and a premium user experience across all platform modules.

## 2. Definitions

- **Platform**: The GlobalXcelerate web application and all associated services
- **Tenant**: An organization (university, employer, program provider) with isolated data within the platform
- **Role**: One of 6 platform roles — Student, University Admin, Employer, Program Provider, Mentor, Platform Admin
- **RSC**: React Server Component (default rendering mode in Next.js App Router)
- **RLS**: Row Level Security — PostgreSQL-level data access policies in Supabase
- **GX Score**: Global Employability Score — proprietary 0-100 scoring across 12 dimensions
- **Core Web Vitals**: Google's metrics for user experience — LCP, FID/INP, CLS
- **i18n**: Internationalization — architecture for multi-language support
- **RTL**: Right-to-Left text direction (required for Arabic locale support)

## 3. Rules & Policies

### GOV-001: TypeScript Strict Mode Required (REQUIRED)
**Statement:** All source code MUST be written in TypeScript with `strict: true` enabled in tsconfig.json. The `any` type MUST NOT be used; developers MUST use `unknown` with type guards or proper generics instead.
**Scope:** All TypeScript source files across the entire codebase
**Rationale:** Type safety prevents runtime errors, improves IDE support, and enables confident refactoring in a multi-developer environment. Reference: TypeScript best practices for large-scale applications.

### GOV-002: Explicit Return Types on All Functions (REQUIRED)
**Statement:** All exported functions and methods MUST have explicit TypeScript return type annotations. Internal helper functions SHOULD have explicit return types.
**Scope:** All TypeScript source files
**Rationale:** Explicit return types serve as documentation, catch unintended type changes, and improve compile-time error detection.

### GOV-003: React Server Components by Default (REQUIRED)
**Statement:** Components MUST be implemented as React Server Components by default. The `'use client'` directive MUST only be added when client-side interactivity (state, effects, event handlers, browser APIs) is genuinely required.
**Scope:** All React components in the Next.js application
**Rationale:** Server Components reduce client bundle size, improve initial load performance, and enable direct data access without API roundtrips — critical for meeting performance budgets.

### GOV-004: Component Size Limit (REQUIRED)
**Statement:** Individual component files MUST NOT exceed 150 lines of code. Components exceeding this limit MUST be decomposed into smaller, single-responsibility sub-components.
**Scope:** All React component files (.tsx)
**Rationale:** Smaller components are easier to test, review, and maintain. Single-responsibility ensures clear ownership and reduces coupling.

### GOV-005: PascalCase Components and camelCase Utilities (REQUIRED)
**Statement:** Component files MUST use PascalCase naming (e.g., `OpportunityCard.tsx`). Utility files MUST use camelCase naming (e.g., `formatDate.ts`). Hook files MUST use `use` prefix with camelCase (e.g., `useStudentProfile.ts`). API route directories MUST use kebab-case.
**Scope:** All source files and directories
**Rationale:** Consistent naming conventions reduce cognitive overhead, enable automated tooling, and align with React ecosystem conventions.

### GOV-006: Database Naming Snake Case (REQUIRED)
**Statement:** Database tables MUST use snake_case plural nouns (e.g., `student_profiles`). Database columns MUST use snake_case (e.g., `created_at`). Foreign keys MUST follow the pattern `{referenced_table_singular}_id`.
**Scope:** All Supabase/PostgreSQL schema definitions and migrations
**Rationale:** PostgreSQL convention alignment ensures consistency with Supabase tooling and avoids case-sensitivity issues in queries.

### GOV-007: Absolute Imports with Path Alias (REQUIRED)
**Statement:** All imports MUST use absolute paths with the `@/` prefix configured in tsconfig.json. Relative imports MUST NOT traverse more than one parent directory. Import ordering MUST follow: external packages → internal modules → relative imports → type imports.
**Scope:** All TypeScript/TSX source files
**Rationale:** Absolute imports improve readability, simplify refactoring, and eliminate fragile relative path chains.

### GOV-008: Feature-Based File Organization (REQUIRED)
**Statement:** Source code MUST be organized by feature/domain (e.g., `components/student/`, `components/marketplace/`), NOT by file type. Directory nesting MUST NOT exceed 4 levels. Each major feature directory MUST contain a README.md.
**Scope:** The entire `src/` directory structure
**Rationale:** Feature-based organization improves discoverability, enables team ownership of modules, and scales better than type-based organization.

### GOV-009: JSDoc on All Exported Members (REQUIRED)
**Statement:** All exported functions, components, hooks, and type definitions MUST have JSDoc documentation including `@param`, `@returns`, and at least one `@example`. Complex business logic MUST have inline comments explaining "why", not "what".
**Scope:** All exported TypeScript/TSX members
**Rationale:** Documentation is critical for a multi-team platform with 8+ modules. JSDoc enables IDE tooltip support and can generate API documentation.

### GOV-010: WCAG 2.1 AA Compliance Mandatory (REQUIRED)
**Statement:** All user-facing components MUST comply with WCAG 2.1 Level AA. All interactive elements MUST be keyboard-accessible with visible focus indicators. Color contrast MUST meet minimum 4.5:1 for normal text and 3:1 for large text. All images MUST have descriptive alt text or be marked aria-hidden.
**Scope:** All user-facing UI components and pages
**Rationale:** GlobalXcelerate serves diverse global users including those with disabilities. WCAG 2.1 AA is also a legal requirement in many target markets (EU, US, Australia).

### GOV-011: Form Accessibility Requirements (REQUIRED)
**Statement:** All form inputs MUST have associated visible labels or aria-label attributes. Validation error messages MUST be programmatically linked to their fields via aria-describedby. Required fields MUST be indicated both visually and via aria-required.
**Scope:** All form components across the platform
**Rationale:** Forms are the primary interaction pattern (onboarding wizard, applications, profile editing). Inaccessible forms block users with assistive technologies.

### GOV-012: Automated Accessibility Testing in CI (REQUIRED)
**Statement:** The CI pipeline MUST include automated accessibility testing using axe-core. Accessibility violations at the "critical" or "serious" level MUST block PR merges. Screen reader testing MUST be performed manually for all critical user journeys before release.
**Scope:** CI/CD pipeline and release process
**Rationale:** Automated testing catches 30-50% of accessibility issues early; manual testing catches the rest before users are impacted.

### GOV-013: All Strings Externalized for i18n (REQUIRED)
**Statement:** All user-facing text strings MUST be externalized to locale message files. Hardcoded strings in components MUST NOT exist. String concatenation for translated content MUST NOT be used — ICU MessageFormat with interpolation variables MUST be used instead.
**Scope:** All user-facing UI text across the platform
**Rationale:** GlobalXcelerate operates across multiple countries. Externalized strings enable translation without code changes and support RTL languages (Arabic).

### GOV-014: RTL Layout Architecture (REQUIRED)
**Statement:** All CSS layout MUST use logical properties (e.g., `margin-inline-start` instead of `margin-left`, `padding-block-end` instead of `padding-bottom`) to support both LTR and RTL languages without separate stylesheets.
**Scope:** All Tailwind CSS and custom CSS throughout the application
**Rationale:** Arabic is a supported locale requiring RTL layout. Logical properties provide automatic bidirectional support.

### GOV-015: URL-Based Locale Routing (REQUIRED)
**Statement:** The application MUST implement URL-based locale routing (e.g., `/en/dashboard`, `/ar/dashboard`). Locale MUST be detected from browser settings on first visit with user preference stored and respected on subsequent visits.
**Scope:** Next.js routing configuration and middleware
**Rationale:** URL-based routing enables SEO for localized content, supports sharing locale-specific links, and provides clear user context.

### GOV-016: LCP Performance Budget (REQUIRED)
**Statement:** Largest Contentful Paint MUST be under 2.5 seconds at the 75th percentile. Pages exceeding this budget MUST NOT be deployed to production without an approved performance improvement plan.
**Scope:** All pages accessible to end users
**Rationale:** LCP directly impacts user engagement and Google search ranking. Students accessing the platform from varied network conditions require fast initial loads.

### GOV-017: JavaScript Bundle Size Budget (REQUIRED)
**Statement:** Initial JavaScript bundle MUST NOT exceed 150KB (gzipped). Per-route additional JavaScript MUST NOT exceed 50KB (gzipped). Bundle size impact MUST be reported on all pull requests.
**Scope:** All client-side JavaScript delivered to users
**Rationale:** Users access GlobalXcelerate from varied devices and network conditions across multiple countries. Smaller bundles ensure fast interactivity.

### GOV-018: Image Optimization Required (REQUIRED)
**Statement:** All images MUST use the `next/image` component for automatic optimization. Images MUST be served in WebP or AVIF format. Images below the fold MUST use lazy loading. Responsive size attributes MUST be specified.
**Scope:** All image rendering in the application
**Rationale:** Images are typically the largest page weight contributor. Optimization is critical for meeting the <1MB total page weight budget.

### GOV-019: API Response Time Budget (REQUIRED)
**Statement:** API read operations MUST respond within 500ms at P95. API write operations MUST respond within 2000ms at P95. Database queries exceeding 100ms MUST have indexes added or be optimized. The AI matching engine MUST respond within 5000ms with streaming for longer operations.
**Scope:** All API routes and database queries
**Rationale:** Responsive APIs are critical for user experience, especially for real-time features like opportunity search and AI Copilot interactions.

### GOV-020: Consistent Error Response Format (REQUIRED)
**Statement:** All API errors MUST return a consistent JSON shape: `{ error: { code: string, message: string, details?: object } }`. Stack traces and internal implementation details MUST NOT be exposed to clients. System errors MUST include a support reference ID.
**Scope:** All API routes (app/api/)
**Rationale:** Consistent error formats enable standardized client-side error handling and improve debugging without compromising security.

### GOV-021: Route-Level Error Boundaries (REQUIRED)
**Statement:** Every route segment MUST have an `error.tsx` error boundary. Every route segment MUST have a `loading.tsx` loading state. A global `not-found.tsx` MUST provide helpful navigation and search. Offline detection MUST be implemented with graceful degradation.
**Scope:** All Next.js route segments
**Rationale:** Error boundaries prevent entire page crashes from isolated failures. Loading states prevent layout shift and improve perceived performance.

### GOV-022: User-Facing Error Messages Actionable (REQUIRED)
**Statement:** Error messages shown to users MUST be specific and actionable — never generic. Messages MUST include suggested next steps. Messages MUST be translatable through the i18n system. The word "error" SHOULD be avoided in user-facing copy.
**Scope:** All user-visible error states and messages
**Rationale:** Actionable errors reduce support tickets and improve user confidence, especially for the 18-28 student demographic who expect polished experiences.

### GOV-023: Structured JSON Logging (REQUIRED)
**Statement:** All application logs MUST use structured JSON format. Required fields MUST include: timestamp, level, message, correlationId, and service. Logs MUST include userId and tenantId when available in context. PII (passwords, tokens, full emails) MUST NEVER appear in logs.
**Scope:** All server-side logging across API routes and server actions
**Rationale:** Structured logs enable machine parsing, alerting, and debugging in production. PII in logs creates compliance risks under GDPR and other regulations.

### GOV-024: Business Event Audit Logging (REQUIRED)
**Statement:** All significant business events MUST be logged at INFO level including: user registrations, role assignments, application state transitions, AI match generations, and administrative actions. Multi-tenant context (organization ID) MUST be included on all tenant-scoped log entries.
**Scope:** All business logic that changes platform state
**Rationale:** Audit logging is required for compliance (SOC 2), debugging production issues, and understanding platform usage patterns.

### GOV-025: Row Level Security on All Tenant Tables (REQUIRED)
**Statement:** Row Level Security (RLS) policies MUST be enabled on ALL tables containing tenant-scoped data. Data isolation MUST be enforced at the database level, not just the application level. Cross-tenant data access MUST be impossible even if application-level checks fail.
**Scope:** All Supabase PostgreSQL tables with multi-tenant data
**Rationale:** RLS provides defense-in-depth for data isolation. Application-level checks alone are insufficient — a single bug could expose another tenant's data.

### GOV-026: RBAC Enforcement at API Level (REQUIRED)
**Statement:** Role-Based Access Control MUST be enforced at the API route level via middleware for all protected endpoints. UI-level role checks MUST NOT be the sole authorization mechanism. The principle of least privilege MUST be applied — default deny, explicit allow.
**Scope:** All authenticated API routes and server actions
**Rationale:** 6 distinct roles with different permissions require robust server-side enforcement. Client-side checks alone can be bypassed.

### GOV-027: Tenant Context in Auth Token Claims (REQUIRED)
**Statement:** Tenant ID and user role MUST be included in authentication token custom claims. All API routes handling tenant data MUST validate tenant context before processing. Server Components MUST receive tenant context from middleware, not from client-side state.
**Scope:** Authentication system, middleware, and all tenant-aware routes
**Rationale:** Centralizing tenant context in auth tokens ensures consistent propagation and prevents unauthorized cross-tenant operations.

### GOV-028: shadcn/ui as Component Foundation (RECOMMENDED)
**Statement:** The shadcn/ui component library SHOULD be used as the foundation for all UI components. Custom components SHOULD extend or compose shadcn/ui primitives rather than building from scratch. The design system SHOULD use a consistent 4px spacing scale.
**Scope:** All UI component development
**Rationale:** shadcn/ui provides accessible, customizable components built on Radix UI primitives, ensuring WCAG compliance and consistent behavior without reinventing patterns.

### GOV-029: Conventional Commits Format (REQUIRED)
**Statement:** All git commit messages MUST follow Conventional Commits format: `type(scope): description`. Types MUST be one of: feat, fix, docs, style, refactor, test, chore, perf. Scope MUST match a platform module (auth, profile, marketplace, matching, copilot, admin). Subject line MUST NOT exceed 72 characters.
**Scope:** All git commits to the repository
**Rationale:** Conventional commits enable automated changelog generation, semantic versioning, and clear commit history for the multi-module platform.

### GOV-030: Code Review and CI Gates Required (REQUIRED)
**Statement:** All changes MUST receive at least one peer review before merging. Self-merging to the main branch MUST NOT be allowed. CI pipeline MUST pass (lint, type-check, tests, build, accessibility checks) before merge is permitted. Bundle size impact MUST be reported on all PRs.
**Scope:** All code changes to protected branches
**Rationale:** Code review catches defects early, ensures knowledge sharing, and maintains code quality standards across the team.

## 4. Enforcement & Compliance

- **Automated Enforcement**: ESLint, Prettier, TypeScript compiler (strict mode), axe-core accessibility checks, and bundle size analysis run in CI on every pull request
- **Build-Breaking Violations**: TypeScript errors, ESLint critical errors, accessibility violations (critical/serious), and bundle size budget exceedances block deployment
- **Warning-Level Violations**: ESLint warnings and accessibility "moderate" issues generate PR comments but do not block merge
- **Manual Review Gates**: Architecture decisions, new module creation, and database schema changes require senior review
- **Quarterly Audits**: Full WCAG compliance audit, performance budget review, and logging coverage assessment performed quarterly
- **Violation Escalation**: Repeated violations of REQUIRED rules trigger team-level training and process improvement discussions

## 5. Exceptions & Exemptions

- **Emergency Hotfixes**: Critical production issues may bypass code review with post-merge review within 24 hours; all other CI checks still apply
- **Third-Party Integrations**: External library constraints may necessitate `any` types at integration boundaries — these MUST be wrapped in typed adapters and documented with a `// @governance-exception: [reason]` comment
- **Performance Budget Exceptions**: AI-heavy pages (matching results, Copilot) may exceed bundle budgets with documented justification and streaming/progressive loading implementation
- **Exception Request Process**: Submit exception request via PR description with: rule being excepted, justification, proposed mitigation, and expiration date. Requires senior engineer approval.

## 6. Review & Governance

- **Quarterly Review**: These rules are reviewed and updated quarterly aligned with platform release cycles
- **Rule Change Process**: Proposed changes submitted as PRs to the governance document; require 2 senior engineer approvals
- **Metrics Tracking**: Performance budgets, accessibility scores, and code quality metrics tracked in continuous monitoring dashboards
- **Onboarding Requirement**: All new team members must review this document as part of engineering onboarding within first week
- **Audit Schedule**: Annual third-party accessibility audit (WCAG), quarterly internal security review, monthly performance budget validation
- **Version History**: All changes to this document are tracked in git with conventional commit messages