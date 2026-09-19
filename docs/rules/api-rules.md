# GlobalXcelerate API Design Rules

**Document Type:** API Rules
**Version:** 1.0
**Effective Date:** 2025-08-16
**Scope:** All API routes, Edge Functions, real-time subscriptions, webhook handlers, and third-party integrations in the GlobalXcelerate platform

## 1. Purpose & Overview

This document defines the mandatory API design standards for GlobalXcelerate — a B2B2C Global Talent Mobility & Experiential Learning Platform built with Next.js 14+ (App Router) and Supabase. These rules govern RESTful API design, endpoint naming, request/response schemas, pagination, filtering, error handling, versioning, Supabase client patterns, Edge Functions, real-time subscriptions, file uploads, AI service contracts, webhooks, and bulk operations. Compliance ensures a consistent, secure, and developer-friendly API surface across all platform modules.

## 2. Definitions

- **API Route**: A Next.js App Router route handler serving HTTP requests at `/api/v1/*`
- **Edge Function**: A Supabase serverless function running on Deno runtime for compute-heavy operations
- **RLS**: Row Level Security — PostgreSQL policies enforcing data access at the database layer
- **SSE**: Server-Sent Events — unidirectional streaming from server to client for real-time text delivery
- **Anon Key**: Supabase public API key with access restricted by RLS policies
- **Service Role Key**: Supabase privileged key that bypasses RLS for admin operations
- **Cursor Pagination**: Pagination using an opaque token representing position in a result set
- **Idempotency Key**: A unique client-generated identifier ensuring duplicate requests produce the same result
- **Webhook**: An HTTP callback delivering event notifications to external subscriber endpoints

## 3. Rules & Policies

### API-001: Resource Naming Convention (REQUIRED)
**Statement:** All API endpoints MUST use plural nouns for collection resources and kebab-case for multi-word resource names. Verb-based endpoint names (e.g., `/getUser`, `/createOrder`) MUST NOT be used.
**Scope:** All Next.js API routes and Edge Function endpoints
**Rationale:** RESTful naming conventions improve API discoverability and reduce ambiguity. Plural nouns (`/opportunities`, `/students`) align with industry standards (OpenAPI, JSON:API).

### API-002: URL Versioning Strategy (REQUIRED)
**Statement:** All API endpoints MUST be prefixed with `/api/v{major}` where `{major}` is the integer major version number. The current production version SHALL be v1. Breaking changes MUST increment the major version.
**Scope:** All public and internal API endpoints
**Rationale:** URL-based versioning provides clear, visible, and testable API evolution while maintaining backward compatibility for existing integrations.

### API-003: HTTP Method Semantics (REQUIRED)
**Statement:** API routes MUST use HTTP methods according to their defined semantics: GET for retrieval (safe, idempotent), POST for creation and actions, PUT for full replacement (idempotent), PATCH for partial updates, DELETE for removal (idempotent). POST MUST NOT be used for idempotent retrieval operations.
**Scope:** All API routes
**Rationale:** Correct HTTP method usage enables proper caching, retry logic, and client expectations per RFC 7231.

### API-004: Maximum Resource Nesting Depth (REQUIRED)
**Statement:** API resource hierarchies MUST NOT exceed 2 levels of nesting (e.g., `/students/{id}/applications` is valid; `/students/{id}/applications/{aid}/documents/{did}` is NOT). Deeply nested resources SHALL be promoted to top-level endpoints with query parameters.
**Scope:** All endpoint URL design
**Rationale:** Deep nesting creates complex URLs, coupling, and maintenance burden. Flat hierarchies with filters provide equivalent functionality with better usability.

### API-005: Standard Success Response Format (REQUIRED)
**Statement:** All successful API responses MUST follow the standard envelope format with a `data` field containing the response payload. Collection responses MUST include a `meta` object with pagination information. Responses MAY include a `links` object for HATEOAS navigation.
**Scope:** All API responses returning data
**Rationale:** Consistent response envelopes allow clients to implement generic response handling, reducing integration complexity across 8+ platform modules.

### API-006: Standard Error Response Format (REQUIRED)
**Statement:** All error responses MUST return a JSON object with an `error` field containing: `code` (machine-readable string), `message` (human-readable description), `request_id` (unique identifier), `timestamp` (ISO 8601), and `path` (request path). Validation errors MUST include a `details` array with field-level errors.
**Scope:** All API error responses (4xx, 5xx)
**Rationale:** Standardized error responses enable consistent client-side error handling, debugging, and support ticket correlation.

### API-007: Error Code Taxonomy (REQUIRED)
**Statement:** All error codes MUST use the platform's defined taxonomy with prefix categories: AUTH_ for authentication/authorization, VAL_ for validation, RES_ for resource state, BIZ_ for business rule violations. New error codes MUST be registered in the central error code registry before use.
**Scope:** All API error responses
**Rationale:** Categorized error codes enable programmatic error handling, monitoring dashboards, and alert routing.

### API-008: Mandatory Pagination (REQUIRED)
**Statement:** All endpoints returning collections MUST implement pagination. No endpoint SHALL return unbounded result sets. The default page size MUST be 20 items. The maximum page size MUST NOT exceed 100 items.
**Scope:** All collection/list endpoints
**Rationale:** Unbounded queries risk database overload, memory exhaustion, and poor client performance. Pagination protects both server resources and user experience.

### API-009: Pagination Strategy Selection (REQUIRED)
**Statement:** Offset-based pagination SHALL be used for datasets under 100,000 records where users need page jumping (opportunity marketplace, application lists). Cursor-based pagination SHALL be used for unbounded or frequently-changing feeds (notifications, activity streams, messages).
**Scope:** All paginated endpoints
**Rationale:** Each pagination strategy has optimal use cases — offset for bounded, jumpable lists; cursor for infinite scroll and real-time feeds.

### API-010: Query Parameter Filtering (REQUIRED)
**Statement:** All filtering MUST use query parameters (never path parameters). Multi-value filters MUST use comma separation. Range filters MUST use `_min`/`_max` suffixes. Date filters MUST accept ISO 8601 format. Boolean filters MUST accept `true`/`false` string values.
**Scope:** All endpoints supporting filtering
**Rationale:** Consistent filter parameter conventions reduce client-side complexity and enable generic filter builders.

### API-011: Full-Text Search Implementation (REQUIRED)
**Statement:** Search endpoints MUST use Supabase full-text search (tsvector/tsquery) with the `search` query parameter. Search MUST index across title, description, skills, and organization name fields for opportunities. Results MUST include relevance scoring.
**Scope:** Opportunity marketplace search, student search (employer view)
**Rationale:** PostgreSQL full-text search provides performant, typo-tolerant search without external service dependencies.

### API-012: Supabase Server-Side Client Usage (REQUIRED)
**Statement:** Next.js API routes and Server Components MUST use `createServerClient` from `@supabase/ssr`. The service role key MUST only be used in server-side contexts for admin operations. The service role key MUST NEVER appear in client-side bundles, environment variables prefixed with `NEXT_PUBLIC_`, or browser-accessible code.
**Scope:** All server-side Supabase interactions
**Rationale:** Service role keys bypass RLS, creating catastrophic security vulnerabilities if exposed client-side.

### API-013: Supabase Client-Side Usage (REQUIRED)
**Statement:** Client-side React components MUST use `createBrowserClient` from `@supabase/ssr` with only the anon key. Client-side code MUST NOT perform admin operations, bypass RLS, or access the service role key. All client-side data access MUST be protected by RLS policies.
**Scope:** All client-side Supabase interactions
**Rationale:** Client-side code is inherently untrusted. RLS provides defense-in-depth ensuring data access control regardless of client behavior.

### API-014: Edge Function Standards (REQUIRED)
**Statement:** Supabase Edge Functions MUST use TypeScript on the Deno runtime. Functions MUST validate requests using Zod schemas at entry. Functions MUST verify JWT authentication before processing. Functions MUST respond within 60 seconds (prefer under 10 seconds). Functions MUST use the standard error response format.
**Scope:** All Supabase Edge Functions
**Rationale:** Consistent standards across Edge Functions ensure reliability, security, and maintainability of serverless compute.

### API-015: Edge Function Naming Convention (REQUIRED)
**Statement:** Edge Functions MUST use kebab-case names prefixed with their domain: `matching-calculate`, `copilot-chat`, `score-recalculate`, `webhook-{provider}`. Function files MUST be located at `supabase/functions/{function-name}/index.ts`.
**Scope:** All Edge Function definitions
**Rationale:** Consistent naming enables automated discovery, monitoring, and deployment pipeline configuration.

### API-016: Real-Time Subscription Patterns (REQUIRED)
**Statement:** Real-time subscriptions MUST use row-level filters to minimize payload delivery. Clients MUST unsubscribe on component unmount. Subscriptions MUST implement reconnection with exponential backoff. No client SHALL maintain more than 10 concurrent subscriptions.
**Scope:** All Supabase Realtime usage
**Rationale:** Unfiltered subscriptions waste bandwidth and processing. Leaked subscriptions cause memory leaks and connection exhaustion.

### API-017: File Upload Flow (REQUIRED)
**Statement:** File uploads MUST use a two-phase flow: (1) client requests a signed upload URL via `POST /api/v1/uploads/request` with file metadata, (2) client uploads directly to Supabase Storage using the signed URL, (3) client confirms via `POST /api/v1/uploads/confirm`. Direct uploads without server-validated signed URLs MUST NOT be permitted.
**Scope:** All file upload operations (profiles, portfolios, documents, applications)
**Rationale:** Two-phase uploads enable server-side validation, size enforcement, virus scanning, and audit logging before files enter storage.

### API-018: File Validation Requirements (REQUIRED)
**Statement:** All file uploads MUST validate MIME type (not just extension), enforce maximum file sizes (5MB images, 10MB documents, 100MB videos), verify allowed file types per upload purpose, and reject executable files. Filename sanitization MUST remove special characters and enforce length limits.
**Scope:** All file upload endpoints
**Rationale:** Unvalidated uploads create malware, storage exhaustion, and cross-site scripting attack vectors.

### API-019: AI Matching Engine API Contract (REQUIRED)
**Statement:** The matching API MUST require minimum 60% profile completion (returning HTTP 400 with BIZ_001 otherwise). Match responses MUST include the composite score (0-100), all 12 dimension breakdowns, identified skill gaps, and improvement recommendations. Results MUST be cached for 24 hours and recalculated on profile or opportunity changes.
**Scope:** `/api/v1/matching/*` endpoints
**Rationale:** Incomplete profiles produce unreliable matches. Transparent scoring with actionable feedback drives user engagement and profile completion.

### API-020: AI Copilot Streaming Contract (REQUIRED)
**Statement:** The Career Copilot endpoint MUST use Server-Sent Events (SSE) for response streaming. The SSE stream MUST emit `start`, `delta`, `done`, and `error` event types in the defined format. Rate limiting MUST enforce 50 messages per day per user. AI API keys MUST be proxied server-side and MUST NEVER be exposed to the client.
**Scope:** `/api/v1/copilot/chat` endpoint
**Rationale:** SSE provides efficient real-time text streaming. Rate limiting prevents abuse. Server-side key proxying protects expensive AI API credentials.

### API-021: Webhook Security Standards (REQUIRED)
**Statement:** Outgoing webhooks MUST include HMAC-SHA256 signatures in the `X-GX-Signature` header and timestamps in `X-GX-Timestamp` header. Incoming webhooks MUST verify provider signatures before processing. Webhook receivers MUST implement idempotency via event ID deduplication. Failed deliveries MUST retry 3 times with exponential backoff (1s, 10s, 60s).
**Scope:** All webhook send and receive operations
**Rationale:** Unsigned webhooks are vulnerable to spoofing. Idempotency prevents duplicate processing. Retries ensure delivery reliability.

### API-022: Webhook Payload Standards (REQUIRED)
**Statement:** Webhook payloads MUST include: unique event `id`, event `type` (dot-notation), ISO 8601 `created_at` timestamp, event-specific `data` object, and `webhook_id`. Payload size MUST NOT exceed 64KB. Webhook URLs MUST use TLS 1.2 or higher.
**Scope:** All outgoing webhook deliveries
**Rationale:** Standardized payloads enable generic webhook consumers. Size limits prevent memory exhaustion. TLS ensures transit security.

### API-023: Bulk Operation Limits (REQUIRED)
**Statement:** Bulk operation endpoints MUST accept a maximum of 500 items per request. Operations exceeding 30 seconds MUST return HTTP 202 Accepted with a job ID for status polling. Bulk responses MUST report individual item status (created/updated/skipped/failed) with per-item error details.
**Scope:** All `/api/v1/bulk/*` endpoints
**Rationale:** Bounded batch sizes prevent timeout and memory issues. Async processing with job tracking prevents client timeout failures.

### API-024: Rate Limiting Implementation (REQUIRED)
**Statement:** All API endpoints MUST implement rate limiting. Rate limit responses MUST return HTTP 429 with `Retry-After` header. All responses MUST include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers. Per-endpoint limits SHALL follow: general (100/15min), auth (5/15min/IP), copilot (50/day), uploads (20/hour), search (60/min), bulk (5/hour), admin (200/15min).
**Scope:** All API endpoints
**Rationale:** Rate limiting protects against abuse, ensures fair resource distribution, and prevents cascade failures.

### API-025: Request Validation with Zod (REQUIRED)
**Statement:** All API request bodies and query parameters MUST be validated using Zod schemas at the route entry point before any business logic executes. Validation failures MUST return HTTP 422 with field-level error details in the standard error format. Zod schemas SHOULD be shared between frontend and backend via a types package.
**Scope:** All API routes accepting user input
**Rationale:** Schema-based validation provides type safety, clear error messages, and shared contracts between frontend and backend.

### API-026: HTTP Status Code Usage (REQUIRED)
**Statement:** API responses MUST use semantically correct HTTP status codes: 200 (successful retrieval/update), 201 (resource created), 202 (async accepted), 204 (successful delete), 400 (malformed request), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict/invalid transition), 413 (payload too large), 422 (validation error), 429 (rate limited), 500 (server error), 502 (upstream failure), 503 (unavailable), 504 (timeout).
**Scope:** All API responses
**Rationale:** Correct status codes enable client libraries to implement appropriate retry, redirect, and error handling logic.

### API-027: API Performance Targets (REQUIRED)
**Statement:** API endpoints MUST meet the following p95 response time targets: simple CRUD < 200ms, search/filter < 500ms, AI matching < 3 seconds, Copilot first token < 2 seconds, upload URL generation < 100ms, bulk acknowledgment < 1 second. Endpoints consistently exceeding targets MUST be investigated and optimized.
**Scope:** All production API endpoints
**Rationale:** Performance SLOs ensure acceptable user experience and enable SLA commitments to B2B customers.

### API-028: Caching Strategy (RECOMMENDED)
**Statement:** Public opportunity listings SHOULD use CDN caching with 5-minute TTL. AI matching scores SHOULD be cached server-side for 24 hours. Profile and opportunity detail endpoints SHOULD support ETag-based conditional requests. Cache-Control headers SHOULD be set appropriately per resource sensitivity and update frequency.
**Scope:** All cacheable API responses
**Rationale:** Strategic caching reduces database load, improves response times, and reduces infrastructure costs at scale.

### API-029: API Documentation (REQUIRED)
**Statement:** All API endpoints MUST be documented in an OpenAPI 3.1 specification. Documentation MUST include request/response examples, authentication requirements, error codes, and rate limit information. The OpenAPI spec MUST be maintained alongside code and auto-generated where possible.
**Scope:** All public and internal API endpoints
**Rationale:** Comprehensive documentation reduces integration time for internal developers and external partners (universities, employers).

### API-030: Third-Party Integration Proxy (REQUIRED)
**Statement:** All external API calls MUST be routed through server-side proxy endpoints. Third-party API keys MUST NEVER be exposed to client-side code. Integration proxies MUST implement circuit breaker patterns for external service failures. All external API calls MUST be logged with duration, status, and provider identification.
**Scope:** All third-party API integrations (OpenAI, LinkedIn, email services)
**Rationale:** Server-side proxying protects API credentials, enables monitoring, and provides a stable interface even when external providers change.

## 4. Enforcement & Compliance

- All API implementations are subject to code review verifying compliance with these rules
- CI/CD pipeline includes OpenAPI spec validation and schema consistency checks
- API response format compliance verified through integration tests
- Rate limiting and performance targets monitored via application performance monitoring (APM)
- Non-compliant PRs MUST NOT be merged without documented exemption
- Monthly API audit reviews endpoint compliance, error rate trends, and performance SLO adherence

## 5. Exceptions & Exemptions

- Health check endpoints (`/api/health`) are exempt from authentication and standard response envelope requirements
- Internal development endpoints (prefixed `/api/dev/`) are exempt from versioning in non-production environments
- Exceptions to rate limits require written approval from the platform team lead with documented justification
- Performance target exceptions for AI endpoints may be granted during model upgrades with temporary relaxed SLOs
- Bulk operation size limits may be increased for verified enterprise customers via admin configuration

## 6. Review & Governance

- API rules reviewed quarterly or upon major platform version release
- Breaking API changes require RFC proposal with 30-day review period
- New endpoint designs undergo API review before implementation begins
- API versioning decisions require architecture team approval
- Performance SLO adjustments require data-driven justification with 30-day measurement period
- Webhook event type additions require documentation update and partner notification