# GlobalXcelerate Security Rules

**Document Type:** Security Rules
**Version:** 1.0
**Effective Date:** 2025-01-20
**Scope:** All GlobalXcelerate platform systems, agents, APIs, and infrastructure — covering authentication, authorization, data protection, session management, input validation, file handling, and international compliance across Student, Employer, University Admin, Program Provider, Mentor, and Platform Admin roles.

## 1. Purpose & Overview

This document defines mandatory security rules for the GlobalXcelerate B2B2C Global Talent Mobility & Experiential Learning Platform. It governs authentication mechanisms, authorization patterns, data protection standards, session management, attack prevention, API security, file upload handling, Supabase Row Level Security policies, JWT token management, and secure communications. These rules ensure compliance with GDPR (EU), FERPA (US), CCPA (California), and UAE PDPL while protecting sensitive student data including passport information, academic records, and personal documents across a globally distributed platform.

## 2. Definitions

- **PII**: Personally Identifiable Information — data that can identify an individual (name, email, phone, DOB, address, passport number)
- **RLS**: Row Level Security — PostgreSQL/Supabase mechanism enforcing data access at the database row level
- **RBAC**: Role-Based Access Control — permission model where access is determined by user role
- **JWT**: JSON Web Token — compact token format used for authentication and session management
- **MFA**: Multi-Factor Authentication — requiring two or more verification factors
- **CSP**: Content Security Policy — HTTP header controlling resource loading in browsers
- **CSRF**: Cross-Site Request Forgery — attack forcing authenticated users to perform unintended actions
- **XSS**: Cross-Site Scripting — attack injecting malicious scripts into web pages
- **OAuth 2.0**: Authorization framework enabling third-party authentication (Google, Microsoft, Apple, LinkedIn)
- **Sensitive Data**: Data classified as Confidential or Restricted (passport numbers, academic transcripts, government IDs)
- **Service Role Key**: Supabase administrative key with full database access bypassing RLS
- **Anon Key**: Supabase public key for client-side operations subject to RLS policies

## 3. Rules & Policies

### SEC-001: Multi-Provider Authentication Support (REQUIRED)
**Statement:** The platform MUST support six authentication methods: Email/Password, Mobile/SMS OTP, Google OAuth, Microsoft OAuth, Apple OAuth, and LinkedIn OAuth using Supabase Auth with RS256-signed JWT tokens.
**Scope:** All user-facing authentication flows across all roles
**Rationale:** Reduces signup friction by 60% per PRD requirements; provides fallback options if any single provider is unavailable; aligns with industry standard multi-provider patterns.

### SEC-002: Email Verification Before Profile Creation (REQUIRED)
**Statement:** Email addresses MUST be verified before any profile creation or data entry is permitted. Verification links SHALL expire after 24 hours and be delivered within 30 seconds.
**Scope:** All new user registrations regardless of authentication method
**Rationale:** Prevents account spam, ensures communication channel validity, and protects against identity spoofing attacks.

### SEC-003: Password Policy Enforcement (REQUIRED)
**Statement:** Passwords MUST be minimum 8 characters containing at least one uppercase letter, one lowercase letter, and one number. The system MUST check passwords against known breach databases. Password hashing SHALL use bcrypt with minimum 10 salt rounds.
**Scope:** All email/password authentication flows
**Rationale:** NIST SP 800-63B guidelines for memorized secrets; breach detection prevents credential stuffing attacks.

### SEC-004: Multi-Factor Authentication for Administrators (REQUIRED)
**Statement:** TOTP-based Multi-Factor Authentication MUST be mandatory for all Platform Admin accounts. MFA SHOULD be available as an option for all other roles. Backup codes (10, single-use) MUST be generated on MFA enrollment.
**Scope:** Admin accounts (mandatory), all other roles (optional)
**Rationale:** Admin accounts have elevated privileges including access to all user data; MFA reduces account takeover risk by 99.9% per Microsoft security research.

### SEC-005: Admin Account Creation Restriction (REQUIRED)
**Statement:** Admin accounts MUST NOT be created through public signup flows. Admin and super-admin roles SHALL only be assigned through invitation from an existing super-admin. University Admin roles MUST require institutional email verification or admin approval.
**Scope:** All admin-level role assignments
**Rationale:** Prevents privilege escalation attacks and unauthorized administrative access; aligns with principle of least privilege.

### SEC-006: Authentication Rate Limiting (REQUIRED)
**Statement:** Failed login attempts MUST be rate-limited to 5 attempts per 15 minutes per IP address and per user account. The system MUST return 429 status with Retry-After header when limits are exceeded.
**Scope:** All authentication endpoints (login, register, password reset, OTP verification)
**Rationale:** Prevents brute force attacks and credential stuffing; industry standard threshold per OWASP guidelines.

### SEC-007: Role-Based Access Control Enforcement (REQUIRED)
**Statement:** RBAC with 6 defined roles (Student, Employer, University Admin, Program Provider, Mentor, Platform Admin) MUST be enforced at both the application layer (Next.js middleware) AND the database layer (Supabase RLS). Users SHALL hold exactly one primary role. Unauthorized access to another role's routes MUST return 403 status.
**Scope:** All authenticated routes, API endpoints, and database operations
**Rationale:** Defense-in-depth approach ensures authorization cannot be bypassed even if application layer is compromised; single-role model simplifies permission management.

### SEC-008: Supabase Row Level Security on All Tables (REQUIRED)
**Statement:** Row Level Security MUST be enabled on ALL database tables without exception. RLS policies MUST use auth.uid() for user identification. Students SHALL see only their own data. Employers SHALL see only their opportunities and related applications. University Admins SHALL see only their institution's students.
**Scope:** All Supabase PostgreSQL tables
**Rationale:** Database-level access control prevents data leakage even if application logic has bugs; ensures zero unauthorized cross-role data access per PRD success criteria.

### SEC-009: Service Role Key Protection (REQUIRED)
**Statement:** The Supabase service role key MUST only be used in server-side API routes and MUST NEVER be exposed in client-side bundles, browser environment variables, or source code repositories. The anon key SHALL be used for all client-side operations.
**Scope:** All application code, build configurations, and deployment pipelines
**Rationale:** Service role key bypasses all RLS policies; exposure would grant unrestricted database access to attackers.

### SEC-010: Session Management Standards (REQUIRED)
**Statement:** Sessions MUST use 7-day sliding window expiration. Session tokens MUST be stored in httpOnly secure cookies (MUST NOT use localStorage). Sessions MUST be immediately invalidated on password change. Concurrent sessions MUST be limited to maximum 5 devices per user. Admin sessions MUST timeout after 2 hours of inactivity.
**Scope:** All authenticated user sessions across all roles
**Rationale:** httpOnly cookies prevent XSS-based token theft; sliding windows balance security with usability; device limits prevent persistent unauthorized access.

### SEC-011: JWT Token Lifecycle Management (REQUIRED)
**Statement:** Access tokens MUST have maximum 1-hour expiry and be signed with RS256. Refresh tokens SHALL have 7-day expiry with rotation on use. JWT payload MUST contain only user_id, role, and email — no sensitive PII. Token validation MUST occur on every API request via middleware.
**Scope:** All JWT token generation, validation, and refresh operations
**Rationale:** Short-lived tokens limit exposure window if compromised; RS256 provides asymmetric verification; minimal payload reduces data exposure risk.

### SEC-012: Encryption in Transit (REQUIRED)
**Statement:** All connections MUST use TLS 1.3 with HTTPS enforced. No HTTP fallback SHALL be permitted. WebSocket connections MUST use WSS protocol. All server-to-server communications MUST be authenticated and encrypted.
**Scope:** All network communications (client-server, server-server, WebSocket)
**Rationale:** TLS 1.3 provides forward secrecy and protection against eavesdropping and man-in-the-middle attacks; required for GDPR and PCI compliance.

### SEC-013: Encryption at Rest (REQUIRED)
**Statement:** All database data MUST be encrypted at rest using AES-256 (Supabase managed). Storage buckets MUST use encrypted configuration. Passport information and government IDs MUST have additional field-level encryption. API keys and secrets MUST be stored exclusively in environment variables.
**Scope:** All persistent data storage (database, file storage, configuration)
**Rationale:** Protects sensitive data from physical storage compromise; field-level encryption provides defense-in-depth for highest-sensitivity data.

### SEC-014: PII Data Masking (REQUIRED)
**Statement:** Admin views MUST show masked PII by default (passport: last 4 characters only; phone: last 4 digits; email: first 2 characters + domain). Unmasking MUST require explicit action and MUST generate an audit log entry. Academic records SHALL have full access only for the student owner and authorized institution.
**Scope:** All admin interfaces and any display of sensitive data outside owner context
**Rationale:** Reduces risk of insider threats and accidental data exposure; audit trail provides accountability.

### SEC-015: GDPR Compliance (REQUIRED)
**Statement:** The platform MUST implement right to access (export within 30 days), right to rectification, right to erasure (deletion within 30 days), and data portability (JSON/CSV export). Explicit consent MUST be obtained with granular controls. Privacy-by-design principles MUST be followed in all feature development. Data Processing Agreements MUST exist with all third-party processors.
**Scope:** All EU user data processing and storage
**Rationale:** GDPR Articles 15-20 mandate these rights; penalties up to 4% of global annual revenue for non-compliance.

### SEC-016: FERPA Educational Records Protection (REQUIRED)
**Statement:** Educational records of US university partnership students MUST be protected per FERPA requirements. Written consent MUST be obtained before disclosing student records to third parties. Students MUST have right to inspect and review their records. Directory information opt-out MUST be available.
**Scope:** All academic data (transcripts, GPA, enrollment status) for US-affiliated students
**Rationale:** FERPA violations can result in loss of federal funding for partner universities; legal obligation for educational platforms.

### SEC-017: International Data Residency (REQUIRED)
**Statement:** EU user data MUST remain in EU-compliant infrastructure. Cross-border data transfers MUST have documented legal basis (Standard Contractual Clauses or adequacy decisions). Data residency metadata MUST be tracked per user profile. An audit trail MUST exist for all cross-border data movements.
**Scope:** All user data storage and processing across global jurisdictions
**Rationale:** GDPR Chapter V restricts international transfers; UAE PDPL requires data localization; non-compliance results in regulatory penalties and loss of market access.

### SEC-018: CSRF Protection (REQUIRED)
**Statement:** CSRF tokens MUST be required on all state-changing requests. Session cookies MUST use SameSite=Strict attribute. The double-submit cookie pattern SHALL be used for API mutations. Origin and Referer headers MUST be validated on the server for all mutation requests.
**Scope:** All state-changing HTTP requests (POST, PUT, PATCH, DELETE)
**Rationale:** OWASP Top 10 (A01:2021) — CSRF attacks exploit authenticated sessions to perform unauthorized actions.

### SEC-019: XSS Prevention (REQUIRED)
**Statement:** All user input MUST be escaped in templates (leveraging React default behavior). Content Security Policy headers MUST be configured restrictively. dangerouslySetInnerHTML MUST NOT be used without DOMPurify sanitization. All authentication cookies MUST have HttpOnly flag. X-Content-Type-Options MUST be set to nosniff. X-Frame-Options MUST be set to DENY.
**Scope:** All rendered content, HTTP responses, and cookie management
**Rationale:** OWASP Top 10 (A03:2021) — XSS enables session hijacking, credential theft, and defacement.

### SEC-020: Input Validation and Sanitization (REQUIRED)
**Statement:** ALL user inputs MUST be validated on both client and server side using Zod schemas. Requests failing validation MUST be rejected with 400 status without processing. SQL injection MUST be prevented via parameterized queries (Supabase SDK). String concatenation in database queries MUST NOT be used. Maximum input lengths MUST be enforced (names: 100, descriptions: 5000, URLs: 2048).
**Scope:** All API endpoints accepting user input
**Rationale:** OWASP Top 10 (A03:2021) — Input validation is the primary defense against injection attacks and data corruption.

### SEC-021: API Rate Limiting Configuration (REQUIRED)
**Statement:** The following rate limits MUST be enforced: General API — 100 requests per 15 minutes per user; Authentication — 5 attempts per 15 minutes per IP; AI Copilot — 50 messages per day per user; File uploads — 20 per hour per user; Search — 60 per minute per user. Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) MUST be returned. Graduated penalties SHOULD apply for persistent abuse.
**Scope:** All API endpoints
**Rationale:** Prevents DDoS, brute force, and API abuse; ensures fair resource allocation; protects AI service costs.

### SEC-022: File Upload MIME and Size Validation (REQUIRED)
**Statement:** File uploads MUST validate MIME type (not just extension) and verify magic bytes. Maximum size MUST be 10MB for documents and 5MB for images. Allowed types: PDF, DOCX, DOC, TXT for documents; JPEG, PNG, WebP, GIF for images. Executable files (.exe, .sh, .bat, .cmd, .js) MUST be rejected. Filenames MUST be sanitized.
**Scope:** All file upload endpoints (portfolio, certificates, profile photos, documents)
**Rationale:** Prevents malware upload, path traversal attacks, and storage abuse; MIME validation prevents extension spoofing.

### SEC-023: File Storage Access Control (REQUIRED)
**Statement:** Private files MUST use signed URLs with time-limited expiration. Public bucket SHALL only contain explicitly public assets (profile photos with user consent). Academic documents, portfolios, and certificates MUST require authenticated access. Employer access to student documents SHALL only be granted after application submission. Download audit trails MUST be maintained for sensitive documents.
**Scope:** All Supabase Storage buckets and file access patterns
**Rationale:** Prevents unauthorized access to sensitive documents (passports, transcripts, certificates); audit trail supports compliance verification.

### SEC-024: Security Headers Configuration (REQUIRED)
**Statement:** All responses MUST include: Strict-Transport-Security (max-age=31536000; includeSubDomains; preload), Content-Security-Policy (restrictive with allowed sources), X-Content-Type-Options (nosniff), X-Frame-Options (DENY), Referrer-Policy (strict-origin-when-cross-origin), and Permissions-Policy (restricting camera, microphone, geolocation).
**Scope:** All HTTP responses from the application
**Rationale:** Security headers provide defense-in-depth against clickjacking, MIME confusion, and unauthorized feature access; HSTS prevents protocol downgrade attacks.

### SEC-025: AI API Key Protection (REQUIRED)
**Statement:** AI service API keys MUST NEVER be exposed to the client. All AI calls (GX Career Copilot, matching engine) MUST be proxied through server-side API routes. Server-side rate limiting and cost controls MUST be applied to AI service calls.
**Scope:** All AI/ML service integrations (OpenAI, matching algorithms)
**Rationale:** Exposed API keys enable unlimited cost accrual and service abuse; server-side proxy enables rate limiting and monitoring.

### SEC-026: Audit Logging Requirements (REQUIRED)
**Statement:** All authentication events (login, logout, failed attempts, password changes) MUST be logged. Admin actions MUST be logged with actor, target, action, and timestamp. Data access to sensitive fields (PII unmasking, document downloads) MUST be logged. Security events MUST trigger alerts. Audit logs MUST be retained for minimum 2 years. Logs MUST NOT contain PII or credentials.
**Scope:** All security-relevant operations across the platform
**Rationale:** GDPR Article 30 requires processing records; audit logs enable incident investigation and compliance demonstration.

### SEC-027: Sensitive Data in Transit (REQUIRED)
**Statement:** Sensitive data MUST NOT be transmitted in URL parameters. POST body or headers MUST be used for sensitive payloads. Webhook endpoints MUST verify signatures before processing. Email communications MUST use authenticated SMTP with TLS.
**Scope:** All data transmission channels (HTTP, email, webhooks)
**Rationale:** URLs are logged in server logs, browser history, and proxy caches; signature verification prevents webhook spoofing.

### SEC-028: Dependency Security Scanning (REQUIRED)
**Statement:** Regular security dependency scanning MUST be performed using npm audit and/or Snyk. Critical vulnerability patches MUST be applied within 24 hours. High severity patches MUST be applied within 72 hours. Automated scanning SHOULD run on every CI/CD pipeline execution.
**Scope:** All npm dependencies and third-party packages
**Rationale:** Supply chain attacks are increasing; known vulnerabilities in dependencies are the easiest attack vector to exploit.

### SEC-029: Data Breach Notification (REQUIRED)
**Statement:** Data breach notifications MUST be issued within 72 hours as required by GDPR. Security vulnerabilities MUST be classified by severity (Critical, High, Medium, Low). Incident response runbooks MUST be maintained and tested. Post-incident review MUST be conducted for all Critical and High severity incidents.
**Scope:** All security incidents and data breaches
**Rationale:** GDPR Article 33 mandates 72-hour notification; structured incident response minimizes damage and ensures regulatory compliance.

### SEC-030: Cookie Security Configuration (REQUIRED)
**Statement:** All authentication cookies MUST use Secure flag (HTTPS only), HttpOnly flag (no JavaScript access), SameSite=Strict attribute, and appropriate path scoping. Session cookies MUST NOT be accessible via client-side JavaScript.
**Scope:** All cookies set by the application
**Rationale:** Secure cookie attributes prevent session hijacking via XSS, network sniffing, and CSRF attacks.

## 4. Enforcement & Compliance

- **Automated Enforcement**: Supabase RLS policies enforce data isolation at the database level. Next.js middleware enforces route protection. Rate limiting middleware enforces request quotas.
- **Code Review Gates**: All PRs modifying authentication, authorization, or data access patterns require security-focused review.
- **CI/CD Security Checks**: npm audit runs on every build; security header validation in integration tests; RLS policy tests in database migration pipeline.
- **Violation Handling**: Critical security violations block deployment. High severity issues must be resolved before next release. Medium/Low tracked in backlog with SLA.
- **Compliance Audits**: Quarterly internal security audit. Annual third-party penetration test. GDPR compliance review annually.

## 5. Exceptions & Exemptions

- **Process**: Exceptions require written justification with risk assessment, submitted to Platform Admin and security lead.
- **Approval**: Critical rule exceptions require CTO approval. High severity exceptions require security lead approval.
- **Documentation**: All exceptions must be documented with: rule being excepted, justification, compensating controls, expiration date, and approver.
- **Time-Limited**: All exceptions have maximum 90-day validity and must be re-evaluated.
- **Prohibited Exceptions**: No exceptions permitted for SEC-008 (RLS on all tables), SEC-009 (service key protection), SEC-012 (encryption in transit), or SEC-015 (GDPR rights).

## 6. Review & Governance

- **Audit Cadence**: Quarterly security posture review. Monthly dependency vulnerability scan. Weekly automated security test execution.
- **Review Schedule**: This document reviewed every 6 months or upon major platform changes (new role addition, new data type, new jurisdiction).
- **Change Management**: Changes to security rules require security lead approval, documentation of rationale, and communication to all development team members.
- **Ownership**: Platform Admin role owns security rule enforcement. Security lead (when appointed) owns rule evolution and audit.
- **Metrics Tracked**: Failed authentication rate, RLS policy violation attempts, rate limit triggers, time-to-patch for vulnerabilities, GDPR request response times.