# Testing Rules & Standards — GlobalXcelerate

## Overview

Comprehensive testing standards for the GlobalXcelerate B2B2C Global Talent Mobility & Experiential Learning Platform. This skill governs unit testing, integration testing, end-to-end testing, performance testing, accessibility testing, visual regression testing, mobile responsiveness testing, cross-browser compatibility, and test data management for a platform serving students, employers, universities, program providers, mentors, and platform administrators.

## When to Use This Skill

- Writing or reviewing unit tests for React components, utility functions, or business logic
- Implementing integration tests for API routes, Supabase queries, or authentication flows
- Creating E2E tests for critical user journeys (registration, onboarding, marketplace, applications)
- Setting up performance testing with Core Web Vitals targets
- Implementing accessibility testing for WCAG 2.1 AA compliance
- Configuring visual regression testing for premium UI components
- Testing mobile responsiveness across device categories
- Managing test data for multi-role scenarios (student, employer, university, admin)
- Mocking Supabase client, AI services, or external APIs in tests

## Testing Philosophy

- Tests validate external behavior from the user's perspective, not implementation details
- Tests are independent and can run in any order without shared state
- Tests are fast and deterministic (no flaky tests from timing issues)
- Test names describe the business scenario being validated
- Failures produce clear, actionable messages indicating what broke and why
- Testing pyramid: many unit tests, moderate integration tests, focused E2E tests

## Technology Stack

- **Unit & Component Testing**: Vitest + React Testing Library
- **Integration Testing**: Vitest + Supertest (API routes) + Supabase test helpers
- **E2E Testing**: Playwright (TypeScript)
- **Performance Testing**: k6 (load), Lighthouse CI (Core Web Vitals)
- **Visual Regression**: Playwright visual comparisons + Chromatic (Storybook)
- **Accessibility Testing**: axe-core (automated) + manual screen reader audits
- **Mocking**: MSW (Mock Service Worker) for API mocks, Vitest mocks for modules

## Unit Testing Standards

### Component Testing (React Testing Library + Vitest)
- Test components from the user's perspective (what they see and interact with)
- Use `screen.getByRole`, `screen.getByLabelText`, `screen.getByText` over `getByTestId`
- Test accessibility: verify ARIA labels, keyboard navigation, focus management
- Test loading states, error states, empty states, and success states
- Test conditional rendering based on user role (student vs employer views)
- Never test implementation details (state variables, internal methods)
- Coverage target: > 60% for UI components

### Utility Function Testing (Vitest)
- Test pure functions with input/output assertions
- Cover edge cases: null/undefined inputs, empty arrays, boundary values
- Test error throwing for invalid inputs
- Coverage target: > 80% for business logic utilities
- Key modules to test:
  - AI Matching Engine score calculation (dimension weighting, accuracy)
  - GX Score Calculator (dimension scoring rubrics, composite calculation, boundaries)
  - Application State Machine (valid/invalid transitions, rejection, withdrawal)
  - Form Validation (all Zod schemas, custom validators, edge cases)
  - Date/locale utilities (multi-timezone support)
  - Search/filter logic (opportunity filtering, full-text search)

### Test File Organization
- Test files co-located with source: `Component.test.tsx` next to `Component.tsx`
- Utility tests in `__tests__/` directories: `utils/__tests__/matching.test.ts`
- Test helpers and factories in `tests/helpers/` directory
- Shared mocks in `tests/mocks/` directory
- Test naming convention: `describe('ComponentName')` → `it('should [expected behavior] when [condition]')`

## Integration Testing Standards

### API Route Testing
- Test all API endpoints with success and error cases
- Validate request body parsing with Zod schemas
- Test authentication middleware (valid token, expired token, missing token)
- Test authorization (role-based access — student vs employer vs admin)
- Test rate limiting behavior (429 responses after threshold)
- Verify correct HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500)
- Coverage: All API endpoints tested with at least success + auth failure + validation failure

### Supabase Query Testing
- Test RLS policies: verify data isolation between roles
- Test query builders with realistic data scenarios
- Verify cascading deletes and referential integrity
- Test pagination logic (cursor-based, offset-based)
- Test full-text search with filters across opportunities
- Use Supabase local instance (Docker) for integration tests

### Authentication Flow Testing
- Signup → role selection → onboarding (full flow with Supabase Auth)
- OAuth provider flows (Google, Microsoft, Apple, LinkedIn)
- Email/password login with MFA
- SMS OTP verification
- Session management (creation, refresh, invalidation)
- Password reset flow
- Concurrent session handling (max 5 devices)
- Failed login rate limiting (5 attempts per 15 minutes)

### Multi-Module Integration
- Application submission: Profile check → opportunity validation → application creation → notification
- Matching integration: Profile update → score recalculation → recommendation refresh
- Cross-role workflows: Employer posts → Student matches → Student applies → Employer reviews

## End-to-End Testing Standards

### Critical User Journeys (Must be tested)
1. **Student Registration & Onboarding**: Signup → email verify → role select → multi-step onboarding wizard → dashboard
2. **Opportunity Discovery**: Login → browse marketplace → apply filters → view opportunity detail → save to wishlist
3. **Application Submission**: View opportunity → check eligibility → fill application → upload documents → submit → track status
4. **Employer Application Review**: Login → view applications → review profile → update status → select candidate
5. **University Admin Dashboard**: Login → view student analytics → generate report → export data
6. **Cross-Role Journey**: Employer posts opportunity → Student matches → Student applies → Employer reviews → Status update → Student notified

### E2E Test Configuration
- Run against staging environment (seeded with test data)
- Use role-specific test accounts (one per role, pre-created)
- Tests must be independent (no shared state between test files)
- Maximum test duration: 60 seconds per test
- Automatic retry on flaky failures: 2 retries maximum
- Screenshot on failure for debugging
- Video recording for critical journey tests
- Parallel execution across browser contexts

### Playwright Best Practices
- Use `data-testid` attributes for test-specific selectors
- Prefer role-based selectors (`role=button[name="Submit"]`) for accessible elements
- Use `page.waitForLoadState('networkidle')` for SPA navigation
- Mock external services (AI APIs, email, SMS) with route interception
- Test with realistic viewport sizes (mobile: 375px, tablet: 768px, desktop: 1440px)

## Performance Testing Standards

### Core Web Vitals Targets
- **Landing Page**:
  - LCP (Largest Contentful Paint): < 2.0 seconds
  - FID (First Input Delay) / INP (Interaction to Next Paint): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
  - TTFB (Time to First Byte): < 600ms
- **Opportunity Marketplace**:
  - LCP: < 2.5 seconds (with filter results)
  - INP: < 200ms (filter interactions)
  - CLS: < 0.1 (no layout shift on results load)
- **Student Dashboard**:
  - LCP: < 2.5 seconds
  - INP: < 200ms
  - CLS: < 0.05

### Load Testing (k6)
- **Normal Load**: 1,000 concurrent users typical actions — verify < 2s response times
- **Peak Load**: 5,000 concurrent users with 50% searching — identify breaking points
- **Endurance Testing**: 500 concurrent users over 4 hours — identify memory leaks
- **API Response Time**: < 500ms for 95th percentile; < 200ms for cached queries
- **Database Query Time**: < 100ms for indexed queries; < 1 second for aggregates
- **AI Copilot Response**: < 3 seconds for initial response
- **Search Results**: < 500ms for full-text search with filters across 100K+ opportunities

### Lighthouse CI Integration
- Run Lighthouse CI on every PR for key pages (landing, marketplace, dashboard)
- Fail PR if performance score drops below 90 for landing page
- Fail PR if accessibility score drops below 95
- Track performance budgets: JS bundle < 200KB initial, total page < 1MB

## Accessibility Testing Standards

### Automated Testing (axe-core)
- Run axe-core on every component in Storybook (via addon)
- Run axe-core in E2E tests on all page loads
- Zero critical or serious violations allowed in CI
- WCAG 2.1 Level AA compliance required

### Manual Accessibility Audits
- Screen reader testing quarterly (VoiceOver, NVDA)
- Keyboard-only navigation testing for all features
- Color contrast verification (4.5:1 for text, 3:1 for large text/UI)
- Focus management testing for modals, drawers, and multi-step flows
- Dynamic content announcement testing (ARIA live regions)

### Accessibility Test Checklist
- All form inputs have associated labels
- All images have meaningful alt text (or aria-hidden for decorative)
- All interactive elements are keyboard accessible
- Skip navigation links present
- Focus indicators visible on all interactive elements
- Error messages linked to form fields (aria-describedby)
- Loading states announced to screen readers
- Modal/dialog focus trapping implemented correctly

## Visual Regression Testing

### Scope
- All design system components (buttons, inputs, cards, modals)
- Premium UI components (GX Score visualization, matching cards, portfolio views)
- Critical pages: landing page, marketplace, student dashboard, opportunity detail
- Dark mode / light mode variants (if applicable)
- Responsive breakpoints: mobile (375px), tablet (768px), desktop (1440px)

### Configuration
- Pixel-difference threshold: 0.1% for component tests, 0.5% for full-page
- Run against Chromium for baseline comparisons
- Update baselines only through explicit approval (never auto-update)
- Store baselines in version control
- Generate diff images for review on failures

### Storybook Integration
- All shared components documented in Storybook
- Visual snapshot for each component state (default, hover, active, disabled, error)
- Chromatic integration for cross-browser visual testing (optional)

## Mobile Responsiveness Testing

### Viewport Testing Matrix
- **Mobile Small**: 320px × 568px (iPhone SE)
- **Mobile Standard**: 375px × 812px (iPhone 13/14)
- **Mobile Large**: 428px × 926px (iPhone 14 Pro Max)
- **Tablet Portrait**: 768px × 1024px (iPad)
- **Tablet Landscape**: 1024px × 768px (iPad)
- **Desktop**: 1440px × 900px (standard laptop)
- **Desktop Wide**: 1920px × 1080px (full HD)

### Touch Interaction Testing
- Tap targets minimum 44×44px
- Swipe gestures for carousels and bottom sheets
- Pull-to-refresh where applicable
- No hover-only interactions on mobile
- Bottom sheet patterns for filters on mobile

### Mobile-Specific Tests
- Onboarding wizard renders correctly on all mobile viewports
- Opportunity cards are single-column on mobile
- Navigation switches to hamburger menu below 768px
- Filter bottom sheet opens correctly on mobile marketplace
- File upload works with mobile camera/gallery picker

## Cross-Browser Compatibility Standards

### Supported Browsers
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome for Android 90+, Samsung Internet 15+

### Testing Strategy
- E2E tests run on Chromium (primary) + WebKit (Safari) + Firefox
- Visual regression baselines per browser engine
- CSS Grid/Flexbox compatibility verified across all targets
- Web API feature detection for optional enhancements
- Polyfills documented and tested for older browser versions

### Cross-Browser CI Matrix
- PR checks: Chromium only (fast feedback)
- Nightly: Full matrix (Chromium + WebKit + Firefox)
- Release: Full matrix + mobile browsers

## Mock Strategies

### Supabase Client Mocking
- Use `@supabase/supabase-js` mock for unit tests
- Mock individual methods: `from().select()`, `from().insert()`, `auth.signInWithPassword()`
- Provide typed mock responses matching actual Supabase response shapes
- Test both success and error responses (PostgrestError, AuthError)
- Use Supabase local (Docker) for integration tests (no mocking)

### AI Service Mocking
- Mock OpenAI/Anthropic API responses for unit and integration tests
- Use MSW (Mock Service Worker) for realistic network-level mocking
- Provide deterministic AI responses for test stability
- Mock streaming responses for copilot chat testing
- Test timeout and error scenarios (rate limit, service unavailable)

### External Service Mocks
- Email service (Resend/SendGrid): Intercept and verify email payloads
- SMS service: Mock OTP generation and verification
- File storage: Use in-memory storage for upload tests
- Payment provider: Mock tokenization and webhook events
- OAuth providers: Mock token exchange flows

## Test Data Management

### Multi-Role Test Fixtures
- **Student Fixture**: Complete profile with skills, education, preferences, portfolio items
- **Employer Fixture**: Organization profile with active opportunities (various types/locations)
- **University Admin Fixture**: Institution with linked students, programs, analytics data
- **Program Provider Fixture**: Programs with enrollment data, completion rates
- **Mentor Fixture**: Expertise areas, availability, mentorship history
- **Platform Admin Fixture**: Super-admin with full access for admin panel testing

### Factory Functions (Faker.js)
- `createStudentProfile(overrides?)`: Generates realistic student data
- `createOpportunity(overrides?)`: Generates opportunity with all required fields
- `createApplication(studentId, opportunityId, overrides?)`: Links student to opportunity
- `createOrganization(type, overrides?)`: Employer or university organization
- `createMatchScore(studentId, opportunityId, overrides?)`: AI match result

### Test Database Strategy
- Reset test database before each integration test suite
- Seed data recreated on each CI run
- All test data uses synthetic/fake PII (Faker.js)
- No real student data in non-production environments
- Anonymized production data snapshots for performance testing only
- Separate Supabase project for CI testing

### Test Account Convention
- `student-test@globalxcelerate.test` — Standard student account
- `employer-test@globalxcelerate.test` — Standard employer account
- `university-admin-test@globalxcelerate.test` — University admin account
- `admin-test@globalxcelerate.test` — Platform admin account
- `mentor-test@globalxcelerate.test` — Mentor account
- All test accounts use password: `TestP@ss2024!` (non-production only)

## Coverage Requirements

### Minimum Coverage Thresholds (enforced in CI)
- **Business Logic** (matching engine, GX Score, state machine): > 80% line coverage
- **UI Components**: > 60% line coverage
- **API Routes**: 100% of endpoints have at least one integration test
- **Critical User Journeys**: 100% of journeys from Section 4.2 have E2E tests
- **Overall Project**: > 70% line coverage

### Coverage Reporting
- Generate coverage reports on every PR
- Fail PR if coverage drops below thresholds
- Track coverage trends over time (no regressions allowed)
- Exclude generated code, type definitions, and config files from coverage

## CI/CD Integration

### PR Pipeline (fast feedback < 5 minutes)
1. Lint + Type Check
2. Unit Tests (Vitest, parallel)
3. Integration Tests (critical subset)
4. Lighthouse CI (landing page performance)
5. Accessibility scan (axe-core on changed components)

### Nightly Pipeline (comprehensive)
1. Full unit test suite
2. Full integration test suite
3. E2E tests (all browsers)
4. Performance load tests (k6 against staging)
5. Visual regression tests (full component matrix)
6. Security dependency scan

### Release Pipeline
1. Full test suite (all levels)
2. Cross-browser E2E (Chromium + WebKit + Firefox)
3. Performance benchmarks with comparison to previous release
4. Accessibility audit (full site crawl)
5. Visual regression approval gate

## Test Quality Standards

- No `test.skip` in main branch (create issues for skipped tests)
- No `any` type in test code (fully typed test utilities)
- Test helpers must be reusable and well-documented
- Flaky tests must be fixed within 48 hours or quarantined
- Test execution time monitored — flag tests > 10 seconds
- Mock data must match production data shapes (TypeScript ensures this)
