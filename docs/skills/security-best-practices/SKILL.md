# Security Best Practices — GlobalXcelerate

## Overview

Comprehensive security standards for the GlobalXcelerate B2B2C Global Talent Mobility & Experiential Learning Platform. This skill governs authentication, authorization, data protection, session management, CSRF/XSS prevention, input validation, API rate limiting, sensitive data handling, file upload security, Supabase Row Level Security (RLS), JWT token management, and secure communication for a platform serving students, employers, universities, program providers, mentors, and platform administrators across multiple jurisdictions.

## When to Use This Skill

- Implementing or reviewing authentication flows (OAuth 2.0, email/password, SMS OTP)
- Designing or auditing authorization and RBAC policies
- Handling sensitive data (passport info, academic records, personal documents)
- Implementing Supabase RLS policies
- Managing JWT tokens and sessions
- Securing file uploads (portfolio documents, certificates)
- Implementing API rate limiting and throttling
- Ensuring GDPR, FERPA, CCPA, UAE PDPL compliance
- Conducting security code reviews
- Addressing international data residency requirements

## Authentication Standards

### Multi-Provider Authentication
- Support 6 authentication methods: Email/Password, Mobile/SMS OTP, Google OAuth, Microsoft OAuth, Apple OAuth, LinkedIn OAuth
- Use Supabase Auth with JWT tokens signed using RS256
- Email addresses MUST be verified before profile creation
- Mobile/SMS OTP expires in 5 minutes with valid country code
- OAuth providers must return email; if unavailable, prompt user
- Admin accounts MUST NOT be created through public signup (invitation-only)
- Failed login attempts rate-limited: 5 attempts per 15 minutes per IP/user

### Password Policy
- Minimum 8 characters
- At least one uppercase letter, one lowercase letter, one number
- Breach password detection (check against known compromised passwords)
- Password hashing via bcrypt with minimum 10 salt rounds
- Password changes immediately invalidate all existing sessions

### Multi-Factor Authentication
- TOTP-based MFA mandatory for admin accounts
- Optional MFA available for all user roles
- Backup codes generated on MFA enrollment (single-use, 10 codes)

## Authorization & Access Control

### Role-Based Access Control (RBAC)
- 6 roles: Student, Employer, University Admin, Program Provider, Mentor, Platform Admin
- Users hold exactly one primary role at any time
- Role selection is permanent; changes require admin intervention
- Admin role requires invitation from existing super-admin
- University Admin role requires institutional email verification or admin approval
- RBAC enforced at both application layer (middleware) AND database layer (RLS)

### Route Protection
- All authenticated routes protected via Next.js middleware
- Unauthorized access to another role's routes returns 403 and redirect
- API endpoints validate role from JWT claims before processing
- Server-side rendering must verify session before rendering protected pages

### Supabase Row Level Security (RLS)
- RLS MUST be enabled on ALL tables without exception
- Students see only their own data
- Employers see only their opportunities and related applications
- University Admins see only their institution's students
- Program Providers see only their programs and enrollments
- Platform Admins have full access with audit logging
- RLS policies use auth.uid() for user identification
- Service role key used only in server-side API routes (never client-side)

## Session Management

- 7-day sliding window sessions
- Immediate session invalidation on password change
- Concurrent session limit: maximum 5 devices per user
- Session tokens stored in httpOnly secure cookies (not localStorage)
- Session refresh occurs automatically before expiration
- Logout must invalidate session on server (not just client deletion)
- Admin sessions have shorter timeout: 2 hours of inactivity

## JWT Token Management

- Access tokens signed with RS256 algorithm
- Short-lived access tokens: 1 hour maximum
- Refresh tokens: 7-day expiry with rotation
- JWT payload contains: user_id, role, email (no sensitive PII)
- Token validation on every API request (middleware)
- Supabase anon key for client operations; service key for server only
- Never expose service role key in client bundles or environment
- Implement token blacklisting for forced logout scenarios

## Data Protection & Encryption

### Encryption Standards
- TLS 1.3 for all connections (HTTPS enforced, no HTTP fallback)
- AES-256 encryption at rest for database (Supabase managed)
- Encrypted storage buckets for file uploads
- API keys and secrets stored in environment variables only

### Sensitive Data Handling
- PII (DOB, phone, address, passport) stored in designated columns with access logging
- Admin views show masked PII by default; unmasking requires explicit action with audit log
- Passport information and government IDs encrypted at field level
- Academic records (transcripts, GPA) treated as protected under FERPA
- Payment information never stored locally (use payment processor tokenization)
- Data classification: Public, Internal, Confidential, Restricted

### Data Masking Rules
- Passport numbers: Show only last 4 characters
- Phone numbers: Show only last 4 digits in admin views
- Email: Show first 2 chars + domain in public contexts
- Academic records: Full access only to student owner and authorized institution

## Compliance Requirements

### GDPR (EU Students)
- Right to access personal data (export within 30 days)
- Right to rectification
- Right to erasure (account deletion within 30 days)
- Data portability (JSON/CSV export)
- Explicit consent management with granular controls
- Privacy-by-design in all feature development
- Data Processing Agreement with all third-party processors
- Cookie consent banner with granular opt-in

### CCPA (California Students)
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of data sale (platform does not sell data — document this)
- Non-discrimination for exercising privacy rights

### FERPA (US Educational Records)
- Educational records protection for US university partnerships
- Written consent required before disclosing student records
- Students have right to inspect and review records
- Directory information opt-out available

### UAE PDPL
- Data localization considerations for UAE-based operations
- Cross-border transfer mechanisms documented
- Data processor obligations fulfilled

## International Data Residency

- User data stored in primary region with compliance considerations
- EU user data must remain in EU-compliant infrastructure
- Cross-border data transfer requires legal basis (SCCs, adequacy decisions)
- Data residency metadata tracked per user profile
- Configurable data regions as platform scales globally
- Audit trail for all cross-border data movements

## CSRF & XSS Prevention

### CSRF Protection
- CSRF tokens required on all state-changing requests
- SameSite=Strict cookies for session management
- Double-submit cookie pattern for API mutations
- Origin/Referer header validation on server

### XSS Prevention
- All user input escaped in templates (React default behavior)
- Content Security Policy (CSP) headers configured
- No use of dangerouslySetInnerHTML without sanitization
- DOMPurify for any user-generated HTML rendering
- HttpOnly flag on all authentication cookies
- X-Content-Type-Options: nosniff header
- X-Frame-Options: DENY header

## Input Validation & Sanitization

- Validate ALL user inputs on both client and server side
- Use Zod schemas for API request validation
- Reject requests that fail validation with 400 status (no processing)
- SQL injection prevention via parameterized queries (Supabase SDK handles this)
- No string concatenation in database queries
- Maximum input lengths enforced (names: 100, descriptions: 5000, URLs: 2048)
- Email format validation with RFC 5322 compliance
- Phone number validation with libphonenumber
- URL validation with allowlisted protocols (https only)
- File path traversal prevention in all file operations
- Unicode normalization before validation

## API Rate Limiting

- General API: 100 requests per 15-minute window per user
- Authentication endpoints: 5 attempts per 15 minutes per IP
- AI Copilot: 50 messages per day per user
- File upload: 20 uploads per hour per user
- Search/filter: 60 requests per minute per user
- Admin endpoints: 200 requests per 15 minutes
- Rate limit headers returned: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- 429 response with Retry-After header on limit exceeded
- Graduated penalties for persistent abuse (progressive delays)

## File Upload Security

### Validation Rules
- Maximum file size: 10MB for documents, 5MB for images
- Allowed document types: PDF, DOCX, DOC, TXT
- Allowed image types: JPEG, PNG, WebP, GIF
- MIME type validation (not just extension checking)
- Magic bytes verification for file type confirmation
- No executable files permitted (.exe, .sh, .bat, .cmd, .js)
- Filename sanitization (remove special characters, limit length)

### Storage Security
- Files stored in Supabase Storage with bucket-level policies
- Signed URLs with time-limited expiration for private files
- Public bucket only for explicitly public assets (profile photos with user consent)
- Authenticated access required for academic documents, portfolios, certificates
- Virus/malware scanning before file storage
- Original filename stored as metadata (not used in storage path)

### Access Control
- Portfolio documents accessible only to student owner and authorized viewers
- Certificates verified by admin before public display
- Employer access to student documents only after application submission
- Download audit trail for sensitive documents

## Secure Communication

- All external API calls over HTTPS (TLS 1.2 minimum, TLS 1.3 preferred)
- WebSocket connections (Supabase Realtime) secured with WSS protocol
- Server-to-server communication authenticated with service keys
- AI API keys never exposed to client; all AI calls proxied through server
- Email communications use authenticated SMTP with TLS
- Webhook endpoints verify signatures before processing
- No sensitive data in URL parameters (use POST body or headers)

## Security Headers

- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Content-Security-Policy: Restrictive CSP with allowed sources
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 0 (rely on CSP instead)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restrict camera, microphone, geolocation access

## Audit & Monitoring

- All authentication events logged (login, logout, failed attempts, password changes)
- Admin actions logged with actor, target, action, timestamp
- Data access to sensitive fields logged (PII unmasking, document downloads)
- Security events trigger alerts (multiple failed logins, privilege escalation attempts)
- Audit logs retained for minimum 2 years
- Logs must not contain PII or credentials
- Regular security dependency scanning (npm audit, Snyk)

## Incident Response

- Security vulnerabilities classified by severity (Critical, High, Medium, Low)
- Critical vulnerabilities must be patched within 24 hours
- High severity within 72 hours
- Data breach notification within 72 hours (GDPR requirement)
- Incident response runbooks maintained and tested
- Post-incident review required for all Critical/High incidents
