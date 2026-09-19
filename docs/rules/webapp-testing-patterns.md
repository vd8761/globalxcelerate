# GlobalXcelerate Testing Rules

**Document Type:** Testing Rules
**Version:** 1.0
**Effective Date:** 2025-01-27
**Scope:** All development, CI/CD pipelines, and quality assurance processes for the GlobalXcelerate B2B2C Global Talent Mobility & Experiential Learning Platform

## 1. Purpose & Overview

This document defines comprehensive testing rules and standards for the GlobalXcelerate platform. It governs unit testing, integration testing, end-to-end testing, performance testing, accessibility testing, visual regression testing, mobile responsiveness testing, cross-browser compatibility, and test data management. These rules ensure platform reliability, security, accessibility compliance (WCAG 2.1 AA), and performance across all user roles (Student, Employer, University Admin, Program Provider, Mentor, Platform Admin) and device types.

## 2. Definitions

- **Unit Test**: A test that validates a single function, component, or module in isolation with mocked dependencies.
- **Integration Test**: A test that validates the interaction between multiple modules, including API routes, database queries, and authentication flows.
- **E2E Test**: An end-to-end test that validates a complete user journey through the application in a real browser environment.
- **Core Web Vitals**: Google's metrics for user experience — LCP (Largest Contentful Paint), INP (Interaction to Next Paint), CLS (Cumulative Layout Shift).
- **RLS**: Row Level Security — Supabase database-level access control policies.
- **Test Fixture**: Pre-defined test data representing a specific user role or scenario.
- **Visual Regression**: Automated comparison of UI screenshots against approved baselines to detect unintended visual changes.
- **Flaky Test**: A test that produces inconsistent pass/fail results without code changes.
- **Test Seam**: An architectural boundary where tests can be inserted to validate behavior.
- **MSW**: Mock Service Worker — a library for intercepting network requests at the service worker level.

## 3. Rules & Policies

### TEST-001: Testing Philosophy Compliance (REQUIRED)
**Statement:** All tests MUST validate external behavior from the user's perspective and MUST NOT test implementation details such as internal state variables, private methods, or component internals.
**Scope:** All unit, integration, and E2E tests across the platform.
**Rationale:** Testing behavior over implementation ensures tests remain stable through refactoring and accurately represent user-facing quality. Aligns with React Testing Library philosophy and industry best practices.

### TEST-002: Test Independence (REQUIRED)
**Statement:** All tests MUST be independent and MUST be able to run in any order without shared state between test cases or test files.
**Scope:** All test suites at every testing level.
**Rationale:** Shared state between tests creates flaky failures, makes debugging difficult, and prevents parallel execution. Independent tests are more reliable and faster to run in CI.

### TEST-003: Test Determinism (REQUIRED)
**Statement:** All tests MUST produce consistent results regardless of execution timing, environment, or external conditions. Tests MUST NOT rely on real-time clocks, network availability, or non-deterministic data.
**Scope:** All automated tests in the CI pipeline.
**Rationale:** Non-deterministic tests erode developer confidence in the test suite and waste CI resources. Deterministic tests provide reliable quality signals.

### TEST-004: Unit Test Coverage for Business Logic (REQUIRED)
**Statement:** Business logic modules (AI Matching Engine, GX Score Calculator, Application State Machine, form validation schemas) MUST maintain greater than 80% line coverage.
**Scope:** All utility modules containing core business logic under `src/lib/`, `src/utils/`, and `src/services/`.
**Rationale:** Business logic is the platform's core differentiator and drives user value. High coverage ensures correctness of matching scores, employability calculations, and application lifecycle transitions.

### TEST-005: Unit Test Coverage for UI Components (REQUIRED)
**Statement:** UI components MUST maintain greater than 60% line coverage with tests covering rendering, interaction handlers, conditional display logic, loading states, error states, and empty states.
**Scope:** All React components under `src/components/` and page components.
**Rationale:** UI components represent the user-facing layer of the application. Testing ensures visual correctness and interaction reliability across all user roles.

### TEST-006: Component Test Selector Priority (REQUIRED)
**Statement:** Component tests MUST use accessible selectors in priority order: getByRole, getByLabelText, getByText, getByPlaceholderText, getByTestId. Tests MUST NOT use CSS class selectors or internal component references.
**Scope:** All React Testing Library tests.
**Rationale:** Accessible selectors validate that components are properly accessible to assistive technologies while testing. This approach aligns testing with accessibility requirements and ensures components work for all users.

### TEST-007: Integration Test for All API Endpoints (REQUIRED)
**Statement:** Every API endpoint MUST have integration tests covering at minimum: successful operation, authentication failure (401), authorization failure (403), and validation failure (400).
**Scope:** All API routes under `/api/*`.
**Rationale:** API endpoints are the boundary between client and server. Testing all response codes ensures proper error handling, security enforcement, and data validation at the integration level.

### TEST-008: Supabase RLS Policy Testing (REQUIRED)
**Statement:** All Supabase Row Level Security policies MUST be tested to verify data isolation between roles. Tests MUST confirm that students cannot access other students' data, employers see only their opportunities, and university admins see only their institution's students.
**Scope:** All database tables with RLS policies enabled.
**Rationale:** RLS policies are the primary data protection mechanism. Testing ensures that authorization is enforced at the database level, preventing data leakage regardless of application-layer bugs.

### TEST-009: Authentication Flow Coverage (REQUIRED)
**Statement:** All authentication flows MUST have integration tests including: email/password signup and login, OAuth provider flows, SMS OTP verification, MFA enrollment and verification, session refresh, password reset, and failed login rate limiting.
**Scope:** Authentication module and related API routes.
**Rationale:** Authentication is the security perimeter of the platform. Comprehensive testing prevents unauthorized access, ensures proper session management, and validates compliance with security requirements.

### TEST-010: Critical User Journey E2E Tests (REQUIRED)
**Statement:** All critical user journeys MUST have end-to-end tests: Student Registration and Onboarding, Opportunity Discovery, Application Submission, Employer Application Review, University Admin Dashboard, and Cross-Role workflows.
**Scope:** Playwright E2E test suite.
**Rationale:** E2E tests validate that the complete system works together from the user's perspective. Critical journeys represent the platform's core value proposition and must function correctly at all times.

### TEST-011: E2E Test Time Limit (REQUIRED)
**Statement:** Individual E2E tests MUST complete within 60 seconds. Tests exceeding this limit MUST be refactored or split into smaller focused tests.
**Scope:** All Playwright test files.
**Rationale:** Long-running tests slow CI feedback loops, increase infrastructure costs, and are more likely to be flaky. Fast tests encourage frequent execution and rapid feedback.

### TEST-012: E2E Retry Policy (RECOMMENDED)
**Statement:** E2E tests SHOULD configure automatic retry with a maximum of 2 retries. Tests that require retries to pass consistently SHOULD be flagged for investigation within 48 hours.
**Scope:** Playwright test configuration.
**Rationale:** Retries provide resilience against transient environment issues while flagging potentially flaky tests for improvement.

### TEST-013: Core Web Vitals Performance Standards (REQUIRED)
**Statement:** The landing page MUST achieve LCP below 2.0 seconds, INP below 100ms, and CLS below 0.1. The opportunity marketplace MUST achieve LCP below 2.5 seconds and INP below 200ms. These MUST be enforced via Lighthouse CI in the PR pipeline.
**Scope:** Landing page, opportunity marketplace, and student dashboard.
**Rationale:** Performance directly impacts user engagement, SEO ranking, and conversion rates. The PRD specifies these targets based on competitive analysis and user experience research.

### TEST-014: Lighthouse CI Gate (REQUIRED)
**Statement:** Pull requests MUST fail if Lighthouse performance score drops below 90 for the landing page or if Lighthouse accessibility score drops below 95 for any tested page.
**Scope:** CI/CD PR pipeline.
**Rationale:** Automated performance gates prevent gradual degradation and ensure new code does not regress the user experience or accessibility compliance.

### TEST-015: Load Testing Requirements (REQUIRED)
**Statement:** Load tests MUST verify that the platform handles 1,000 concurrent users with response times below 2 seconds (normal load), and stress tests MUST identify breaking points at 5,000 concurrent users. Load tests MUST run in the nightly CI pipeline.
**Scope:** k6 load testing against staging environment.
**Rationale:** The PRD requires support for 5,000 concurrent users at launch with scalability to 25,000. Regular load testing ensures the platform meets these capacity requirements and identifies bottlenecks before production impact.

### TEST-016: API Response Time Standards (REQUIRED)
**Statement:** API response times MUST be below 500ms at the 95th percentile for standard operations and below 200ms for cached queries. AI Copilot initial response MUST be below 3 seconds. Search results MUST return within 500ms for full-text search across 100K+ opportunities.
**Scope:** All API endpoints measured during load testing.
**Rationale:** Response time targets are defined in the PRD (NFR-P-001) based on user experience research showing that delays beyond these thresholds significantly impact engagement and task completion.

### TEST-017: Accessibility Automated Testing (REQUIRED)
**Statement:** axe-core MUST be integrated into the CI pipeline and MUST run on all component renders in Storybook and all page loads in E2E tests. Zero critical or serious accessibility violations SHALL be allowed to pass CI.
**Scope:** All UI components and pages.
**Rationale:** WCAG 2.1 Level AA compliance is a platform requirement (NFR-U-002). Automated accessibility testing catches the majority of common violations early in the development cycle.

### TEST-018: Manual Accessibility Audits (REQUIRED)
**Statement:** Manual accessibility audits using screen readers (VoiceOver, NVDA) MUST be conducted quarterly. Keyboard-only navigation testing MUST be performed for all new features before release.
**Scope:** All user-facing features and pages.
**Rationale:** Automated tools cannot detect all accessibility issues. Manual testing with assistive technologies ensures the platform is truly usable by people with disabilities, meeting both compliance and ethical standards.

### TEST-019: Visual Regression Testing (REQUIRED)
**Statement:** Visual regression tests MUST be configured for all design system components and premium UI components (GX Score visualization, matching cards, portfolio views). Baseline updates MUST NOT be auto-approved and MUST require explicit human review.
**Scope:** Design system components, premium UI, and critical pages at responsive breakpoints.
**Rationale:** Visual regression testing prevents unintended UI changes from reaching production. Explicit baseline approval ensures that visual changes are intentional and reviewed by a human.

### TEST-020: Mobile Responsiveness Testing (REQUIRED)
**Statement:** E2E tests MUST validate critical user journeys at minimum three viewport sizes: mobile (375px width), tablet (768px width), and desktop (1440px width). Touch interaction tests MUST verify tap targets are minimum 44x44 pixels.
**Scope:** All E2E test suites for user-facing features.
**Rationale:** The platform serves students globally, many on mobile devices. Testing responsive behavior ensures consistent experience across all device categories specified in NFR-C-002.

### TEST-021: Cross-Browser Compatibility (REQUIRED)
**Statement:** E2E tests MUST run on Chromium as the primary engine for PR checks. Nightly CI MUST run the full test matrix across Chromium, WebKit (Safari), and Firefox. Release pipelines MUST include mobile browser testing.
**Scope:** CI/CD pipeline configuration.
**Rationale:** Browser compatibility requirements (NFR-C-001) specify Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Cross-browser testing ensures consistent functionality across the supported matrix.

### TEST-022: Supabase Client Mocking Standards (REQUIRED)
**Statement:** Unit tests MUST mock the Supabase client using typed mock responses that match actual Supabase response shapes (PostgrestResponse, AuthResponse). Integration tests MUST use Supabase local instance (Docker) with no mocking of database operations.
**Scope:** All tests interacting with Supabase client.
**Rationale:** Typed mocks ensure tests remain valid as the Supabase schema evolves. Local Supabase for integration tests provides realistic validation including RLS policy enforcement.

### TEST-023: AI Service Mocking (REQUIRED)
**Statement:** All AI service calls (OpenAI, Anthropic) MUST be mocked in unit and integration tests using MSW (Mock Service Worker). Mocks MUST provide deterministic responses including streaming responses for copilot tests. Tests MUST cover timeout and rate-limit error scenarios.
**Scope:** All tests involving AI matching engine, GX Career Copilot, and AI-generated content.
**Rationale:** AI services are external dependencies that introduce non-determinism and cost. Mocking ensures fast, reliable, and cost-free test execution while still validating integration logic.

### TEST-024: Test Data Factory Functions (REQUIRED)
**Statement:** All test data MUST be generated using factory functions (Faker.js) that produce realistic synthetic data. Factory functions MUST exist for all core entities: StudentProfile, Opportunity, Application, Organization, and MatchScore. Real user data MUST NEVER be used in non-production environments.
**Scope:** All test data generation across unit, integration, and E2E tests.
**Rationale:** Factory functions ensure consistent, realistic test data while protecting user privacy. Synthetic data prevents GDPR/FERPA violations in testing environments.

### TEST-025: Test Database Reset Strategy (REQUIRED)
**Statement:** The test database MUST be reset before each integration test suite execution. Seed data MUST be recreated on each CI run. A separate Supabase project MUST be used for CI testing that is isolated from staging and production.
**Scope:** Integration test infrastructure and CI environment.
**Rationale:** Database isolation prevents test pollution and ensures reproducible results. Separate CI databases prevent accidental data corruption in staging environments.

### TEST-026: Multi-Role Test Fixture Completeness (REQUIRED)
**Statement:** Test fixtures MUST exist for all six platform roles (Student, Employer, University Admin, Program Provider, Mentor, Platform Admin) with complete profile data, relationships, and associated records sufficient to test all role-specific features.
**Scope:** Test data management and fixture definitions.
**Rationale:** The platform serves six distinct roles with different permissions and views. Complete fixtures ensure that role-based features are tested thoroughly and RLS policies are validated for each role.

### TEST-027: Overall Coverage Threshold (REQUIRED)
**Statement:** The project MUST maintain greater than 70% overall line coverage. Pull requests MUST NOT reduce coverage below this threshold. Coverage reports MUST be generated on every PR and coverage regressions MUST fail the CI pipeline.
**Scope:** Entire codebase excluding generated code, type definitions, and configuration files.
**Rationale:** The PRD (NFR-M-001) specifies greater than 70% test coverage for critical business logic. This threshold ensures comprehensive quality validation while remaining achievable for a growing codebase.

### TEST-028: Flaky Test Policy (REQUIRED)
**Statement:** Tests identified as flaky (inconsistent pass/fail without code changes) MUST be fixed within 48 hours or quarantined to a separate test suite. No flaky tests SHALL remain in the main test suite beyond the 48-hour window.
**Scope:** All automated test suites.
**Rationale:** Flaky tests erode developer confidence in the test suite, slow down CI pipelines, and mask real failures. Strict quarantine policies maintain test suite reliability.

### TEST-029: PR Pipeline Time Budget (REQUIRED)
**Statement:** The complete PR CI pipeline (lint, type check, unit tests, critical integration tests, Lighthouse CI, accessibility scan) MUST complete within 5 minutes. Tests exceeding this budget MUST be optimized or moved to the nightly pipeline.
**Scope:** PR-triggered CI pipeline.
**Rationale:** Fast CI feedback encourages frequent commits, enables rapid iteration, and reduces context-switching costs for developers. The 5-minute target balances thoroughness with developer productivity.

### TEST-030: Test Code Quality Standards (REQUIRED)
**Statement:** Test code MUST NOT use TypeScript `any` type. Test helpers MUST be reusable and documented. No `test.skip` SHALL exist in the main branch — skipped tests MUST have associated tracking issues. Mock data MUST conform to TypeScript interfaces matching production data shapes.
**Scope:** All test code, test utilities, and mock definitions.
**Rationale:** Test code quality directly impacts maintainability and reliability of the test suite. Typed tests catch integration issues at compile time and ensure mocks remain synchronized with production interfaces.

## 4. Enforcement & Compliance

- Coverage thresholds are enforced by Vitest coverage reporter in CI — PRs failing thresholds are blocked from merge.
- Lighthouse CI gates are enforced in the PR pipeline — performance and accessibility regressions block deployment.
- axe-core violations at critical/serious level fail the CI pipeline immediately.
- Load testing results are tracked over time with alerts for regressions exceeding 20% from baseline.
- Visual regression failures require explicit human approval before merge.
- Cross-browser test failures in nightly builds trigger Slack/PagerDuty alerts.
- Quarterly accessibility audits are tracked in the project management tool with assigned owners.
- Flaky test metrics are reported weekly — teams with persistent flaky tests are flagged for remediation.

## 5. Exceptions & Exemptions

- Third-party library code and auto-generated files (Supabase types, GraphQL codegen) are excluded from coverage requirements.
- Performance testing targets may be relaxed for development/staging environments with documented justification.
- Visual regression baselines may be bulk-updated during design system upgrades with tech lead approval.
- Cross-browser testing may be reduced to Chromium-only during rapid prototyping phases with PM approval and a commitment to full testing before release.
- New experimental features behind feature flags may have reduced coverage requirements (minimum 50%) during the experimental phase.

## 6. Review & Governance

- Testing rules are reviewed quarterly alongside the release cycle.
- Coverage thresholds are reviewed semi-annually and adjusted based on team maturity and codebase growth.
- Performance baselines are updated after each major release.
- Visual regression baselines are reviewed and cleaned up monthly to remove stale snapshots.
- Cross-browser compatibility matrix is reviewed annually against browser market share data.
- Test infrastructure costs are reviewed quarterly to ensure testing efficiency.
- Any changes to testing rules require approval from the Engineering Lead and QA Lead.