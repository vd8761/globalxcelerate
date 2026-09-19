# Module Spec: Authentication

## 1. Overview & Purpose

The Authentication module provides the complete identity and access management layer for GlobalXcelerate, handling user registration, login, session lifecycle, role assignment, and route protection across the platform. It integrates six authentication providers (Email/Password, SMS/OTP, Google OAuth 2.0, Microsoft OAuth 2.0, Apple Sign-In, LinkedIn OAuth 2.0) through Supabase Auth, manages post-authentication role selection for new users, enforces brute-force protection and rate limiting, and provides middleware-based route guards that check authentication status, role assignment, and onboarding completion before granting access to protected resources.

- **Who uses it**: All 5 user roles (Student, Employer, University Admin, Program Provider, Platform Admin) plus unauthenticated visitors during registration/login flows.
- **Key screens/interfaces**: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/verify-otp`, `/role-select`, `/auth/callback`, `/auth/mfa-setup`, `/auth/mfa-verify`
- **Connections to other modules**: Provides authenticated user context to `app_shell` (layout, navigation); creates role-specific profile records consumed by onboarding modules; session tokens used by all API route handlers; middleware integrates with every protected route group.
- **Scope boundaries**: This module does NOT handle user profile editing (owned by respective role modules), does NOT manage permissions/RBAC policies beyond role-based route gating (owned by a future authorization module), does NOT handle billing or subscription state, and does NOT manage user preferences or notification settings.

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

Module-specific UI overrides:
- Auth pages use a split-panel layout on desktop (left: branded illustration panel with Navy (#0F172A) background, animated globe SVG, and tagline; right: white form panel).
- On mobile, the illustration panel collapses to a compact branded header (64px height with logo only).
- Form inputs use 12px rounded corners with 2px Cyan (#06B6D4) focus ring.
- Primary action buttons are full-width within the form panel, using Cyan (#06B6D4) background with white text.
- Social/OAuth provider buttons use outlined style with provider brand colors for icons (Google multicolor, Microsoft #00A4EF, Apple #000000, LinkedIn #0A66C2).
- Error states render inline beneath the relevant input with destructive red (#EF4444) text and a left red border.
- Success states (email sent, verification complete) use a centered card layout with a green checkmark icon (#10B981).
- Loading states use a pulsing Cyan spinner (24px) centered on the action button, replacing button text.
- The role-select page uses a 2x3 card grid (desktop) or single-column stack (mobile) with Navy-bordered cards, Cyan highlight on hover/selection, and a role icon + title + description per card.

## 3. Features & Functional Requirements

### 3.1 Email/Password Registration

**User Flow**:
1. User navigates to `/register` (or clicks "Sign Up" CTA from landing page).
2. User fills in: full name, email, password, confirm password.
3. User checks "I agree to Terms of Service and Privacy Policy" checkbox.
4. User clicks "Create Account" button.
5. System validates all fields client-side, then submits to Supabase Auth `signUp`.
6. On success, system displays "Check your email" confirmation screen.
7. User clicks verification link in email → redirected to `/auth/callback?type=email_verification`.
8. Callback handler confirms email, checks if role exists in `user_metadata`; if not, redirects to `/role-select`.

**UI Layout & Components**:
- `RegisterForm` component with fields: `fullName` (text), `email` (email), `password` (password with show/hide toggle), `confirmPassword` (password), `tosAgreement` (checkbox with linked text).
- Below form: divider with "Or continue with" text, then 4 OAuth provider buttons in a 2x2 grid.
- Below OAuth buttons: "Already have an account? Log in" link.
- Password strength indicator bar (4 segments: weak/fair/good/strong) appears below password field on focus.

**Business Rules**:
- Password minimum 8 characters, at least 1 uppercase letter, 1 number, 1 special character (`!@#$%^&*()_+-=[]{}|;:',.<>?/`).
- Email must be valid format and unique in system (Supabase handles uniqueness).
- Full name must be 2-100 characters, no purely numeric values.
- TOS agreement is mandatory; form cannot submit without it.
- Registration timestamp stored as `created_at` in auth.users.
- `email_confirmed_at` remains null until verification link clicked.
- If email already exists and is confirmed, return generic error "Unable to create account. Please try logging in or use a different email." (prevents enumeration).
- If email exists but unconfirmed, resend verification email.

**State Machine**:
```
IDLE → VALIDATING → SUBMITTING → SUCCESS (email sent screen)
                  → ERROR (validation failed, show inline errors)
         SUBMITTING → ERROR (API error, show toast)
```

**Edge Cases**:
- User closes browser before verifying email: on next login attempt, system detects unconfirmed email and offers to resend verification.
- Verification link expired (default 24 hours): show "Link expired" page with "Resend verification email" button.
- User registers with OAuth-linked email then tries email/password: system links accounts if same email, or prompts to use OAuth provider.
- Rapid double-submit: disable button on first click, debounce 2000ms.
- Network failure during submission: show retry prompt with preserved form state.

**Acceptance Criteria**:
- AC1: User can register with valid email/password and receives verification email within 30 seconds.
- AC2: Password that doesn't meet complexity requirements shows inline error with specific missing requirement.
- AC3: Duplicate email returns generic error (no enumeration).
- AC4: Unverified users cannot access any protected route.
- AC5: Verification link works correctly and transitions user to role-select.
- AC6: Form preserves entered data (except password) on validation error.
- AC7: Password strength meter updates in real-time as user types.

### 3.2 Email/Password Login

**User Flow**:
1. User navigates to `/login`.
2. User enters email and password.
3. User optionally checks "Remember me" (extends refresh token display).
4. User clicks "Sign In".
5. System calls Supabase Auth `signInWithPassword`.
6. On success: check `user_metadata.role` — if null, redirect to `/role-select`; if set, check onboarding status — if incomplete, redirect to `/{role}/onboarding`; if complete, redirect to `/{role}/dashboard`.
7. On failure: show inline error, increment failed attempt counter.

**UI Layout & Components**:
- `LoginForm` component with fields: `email` (email), `password` (password with show/hide toggle).
- "Remember me" checkbox and "Forgot password?" link on same row below password.
- Full-width "Sign In" button.
- Divider with "Or continue with" and 4 OAuth provider buttons.
- "Don't have an account? Sign up" link at bottom.
- If MFA enabled for account, after initial auth success, redirect to MFA verification form.

**Business Rules**:
- Failed login attempts tracked per email: 5 failures within 15 minutes triggers account lockout.
- Lockout duration: 15 minutes from last failed attempt.
- Lockout message: "Too many failed attempts. Please try again in X minutes or reset your password."
- Successful login resets failed attempt counter.
- "Remember me" unchecked: session cookie with `SameSite=Lax`, no explicit expiry (browser session). Checked: refresh token TTL remains 30 days (default).
- If user's email is not verified, show specific message with resend option.
- After login, set `last_sign_in_at` in user profile.
- Rate limit: 10 requests per minute per IP for `/api/auth/login`.

**State Machine**:
```
IDLE → VALIDATING → SUBMITTING → MFA_REQUIRED → MFA_VERIFYING → SUCCESS
                                → SUCCESS (no MFA) → REDIRECTING
         SUBMITTING → LOCKED_OUT (show lockout UI)
         SUBMITTING → ERROR (invalid credentials)
         SUBMITTING → UNVERIFIED (show verify prompt)
```

**Edge Cases**:
- User with linked OAuth but no password tries email/password login: show "This email uses [Provider] sign-in. Click here to log in with [Provider]."
- Account locked out and user clicks "Forgot password": allow password reset flow regardless of lockout.
- Concurrent sessions limit (5): if user already has 5 active sessions, terminate oldest session and create new one.
- User is in the middle of onboarding and logs in from new device: resume onboarding from last completed step.
- Browser has stale session cookie: middleware detects expired access token, attempts refresh; if refresh fails, redirect to login.

**Acceptance Criteria**:
- AC1: Valid credentials produce authenticated session and correct redirect based on role/onboarding status.
- AC2: Invalid credentials show generic "Invalid email or password" (no enumeration).
- AC3: 5th failed attempt triggers lockout with countdown timer displayed.
- AC4: Lockout clears after 15 minutes, allowing login attempts again.
- AC5: MFA-enabled accounts get MFA challenge screen after password verification.
- AC6: Unverified email accounts see verification prompt with resend button.
- AC7: Session cookie is HTTP-only, Secure, SameSite=Lax.

### 3.3 OAuth Provider Authentication (Google, Microsoft, Apple, LinkedIn)

**User Flow**:
1. User clicks provider button on login or register page.
2. System calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })`.
3. User is redirected to provider consent screen.
4. User grants consent.
5. Provider redirects to `/auth/callback` with authorization code.
6. Callback route handler exchanges code for session via `supabase.auth.exchangeCodeForSession(code)`.
7. System checks if user is new (no `user_metadata.role`): redirect to `/role-select`.
8. Existing user with role: redirect to dashboard or onboarding based on status.

**UI Layout & Components**:
- Provider buttons: consistent height (44px), full-width on mobile, 2x2 grid on desktop.
- Each button has: provider icon (20px, left-aligned), provider name text (centered).
- Google: white background, gray border, multicolor "G" icon.
- Microsoft: white background, gray border, Microsoft 4-square icon.
- Apple: black background, white text, Apple logo.
- LinkedIn: white background, gray border, LinkedIn "in" blue icon.
- Loading state: button shows spinner replacing icon, text changes to "Connecting..."
- Error state: toast notification "Authentication with [Provider] failed. Please try again."

**Business Rules**:
- OAuth scopes requested:
  - Google: `openid email profile`
  - Microsoft: `openid email profile User.Read`
  - Apple: `name email`
  - LinkedIn: `openid profile email`
- If OAuth email matches existing account email, Supabase auto-links identities.
- If user denies consent at provider, redirect back to login with `error=access_denied` query param → show "Authentication cancelled" message.
- OAuth users have no password set; if they later want email/password login, they must use "Set password" flow (separate from "Reset password").
- Store `provider` and `provider_id` in auth.identities (managed by Supabase).
- `avatar_url` from provider stored in `raw_user_meta_data` for use in profile creation.
- For Apple Sign-In: name is only provided on first authorization; cache it immediately in `user_metadata`.

**State Machine**:
```
IDLE → REDIRECTING_TO_PROVIDER → (external) → CALLBACK_PROCESSING → SUCCESS → ROLE_CHECK
                                             → CALLBACK_PROCESSING → ERROR
IDLE → ERROR (popup blocked, network issue)
```

**Edge Cases**:
- User has private email relay (Apple): use relay email as primary, note in metadata.
- Provider is temporarily down: show error with "Try another sign-in method" suggestion.
- Callback URL mismatch (misconfigured): log error, show generic auth failure page.
- User revokes app access at provider after linking: next login attempt fails → show "Please re-authorize" message.
- Race condition: user clicks multiple provider buttons rapidly → disable all buttons after first click.
- PKCE code verifier mismatch: show "Authentication session expired. Please try again." and redirect to login.

**Acceptance Criteria**:
- AC1: Each of 4 OAuth providers can complete full sign-in flow from click to dashboard redirect.
- AC2: New OAuth users land on role-select page.
- AC3: Returning OAuth users land on appropriate dashboard.
- AC4: Provider errors display user-friendly messages without exposing technical details.
- AC5: Account linking works when OAuth email matches existing email/password account.
- AC6: Apple Sign-In correctly captures and persists user name on first auth.
- AC7: PKCE flow is used for all OAuth exchanges (code + code_verifier).

### 3.4 SMS/OTP Mobile Authentication

**User Flow**:
1. User clicks "Sign in with Phone" option on login page.
2. System shows phone number input with country code selector.
3. User enters phone number and clicks "Send Code".
4. System calls `supabase.auth.signInWithOtp({ phone })`.
5. User receives 6-digit OTP via SMS.
6. User enters OTP in verification form within 60-second validity window.
7. System calls `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`.
8. On success: same role-check flow as other auth methods.

**UI Layout & Components**:
- Phone input: country code dropdown (flag + code) + phone number field.
- Country code dropdown: searchable list of countries, defaults to user's detected locale.
- "Send Code" button below phone input.
- After code sent: auto-focus to 6-digit OTP input (6 separate single-character inputs).
- Countdown timer "Resend code in 0:XX" below OTP inputs.
- "Resend Code" link appears after timer expires.
- "Use a different number" link to go back to phone input.

**Business Rules**:
- Phone number must be valid E.164 format after country code prepend.
- OTP code is 6 numeric digits.
- OTP expires after 60 seconds.
- Maximum 3 OTP sends per phone number per hour.
- Maximum 5 OTP verification attempts per code (then code invalidated).
- If phone matches existing account, sign in; if new, create account.
- Phone-only accounts still require role selection on first login.
- Rate limit: 3 SMS sends per phone per hour, 10 per phone per 24 hours.
- SMS provider: Supabase built-in (Twilio integration configured via Supabase dashboard).

**State Machine**:
```
PHONE_INPUT → SENDING_OTP → OTP_SENT → VERIFYING_OTP → SUCCESS → ROLE_CHECK
                           → OTP_SENT → RESEND_AVAILABLE (timer expired)
             SENDING_OTP → ERROR (invalid phone, rate limited)
                           VERIFYING_OTP → ERROR (invalid code)
                           VERIFYING_OTP → EXPIRED (code timed out)
```

**Edge Cases**:
- SMS not received: offer "Resend" after 60s, suggest checking spam/blocked numbers after 2nd attempt.
- User enters phone associated with existing email account: Supabase links phone identity to existing user.
- International format issues: strip spaces, dashes, parentheses; validate with libphonenumber.
- User navigates away during OTP entry and returns: OTP remains valid until expiry; show fresh entry form.
- Multiple OTPs sent: only the latest OTP is valid.
- Phone number recycled (new owner): account remains tied to phone; user must use email recovery if locked out.

**Acceptance Criteria**:
- AC1: Valid phone number receives OTP SMS within 10 seconds.
- AC2: Correct 6-digit OTP within validity window authenticates user.
- AC3: Expired OTP shows clear error with resend option.
- AC4: Rate limiting prevents more than 3 sends per phone per hour.
- AC5: Auto-advance focus works between OTP digit inputs.
- AC6: Country code selector correctly formats international numbers.
- AC7: Invalid OTP attempts are counted and code invalidated after 5 failures.

### 3.5 Role Selection Flow

**User Flow**:
1. After first-time authentication (any provider), user arrives at `/role-select`.
2. Page displays 5 role cards with icon, title, and description.
3. User selects one role by clicking a card.
4. Selected card shows visual confirmation (Cyan border, checkmark).
5. User clicks "Continue" button.
6. System calls API route to set role in `user_metadata` and create role-specific profile record.
7. On success, redirect to `/{role}/onboarding/step-1`.

**UI Layout & Components**:
- Page header: "How will you use GlobalXcelerate?" with subtitle "Choose your primary role. You can always contact support to change this later."
- Role cards in responsive grid (3 columns desktop, 2 tablet, 1 mobile):
  - **Student**: Graduation cap icon. "Student / Job Seeker". "Discover global opportunities, build your employability score, and launch your international career."
  - **Employer**: Building icon. "Employer". "Access a pre-vetted global talent pool, post opportunities, and hire candidates with verified international experience."
  - **University Admin**: School icon. "University Administrator". "Track student outcomes, manage program partnerships, and demonstrate global employability metrics."
  - **Program Provider**: Globe icon. "Program Provider". "List your programs, manage applications, and connect with university partners worldwide."
  - **Platform Admin**: Shield icon. "Platform Administrator". "Manage platform operations, users, content, and system configuration." (Only shown if user email is in admin whitelist.)
- "Continue" button (disabled until selection made).
- Logout link in top-right corner.

**Business Rules**:
- Role selection is permanent from user self-service perspective (support/admin can change).
- Platform Admin role card only visible if user's email domain matches configured admin domains OR email is in explicit admin whitelist.
- Role is stored in `auth.users.raw_user_meta_data.role` as string enum.
- Upon role selection, create corresponding profile record:
  - Student → `student_profiles` table
  - Employer → `employer_profiles` table
  - University Admin → `university_admin_profiles` table
  - Program Provider → `program_provider_profiles` table
  - Platform Admin → `platform_admin_profiles` table
- Profile record created with `user_id` FK and `onboarding_status: 'not_started'`.
- If profile creation fails, do NOT persist role in metadata (transaction-like behavior).
- Already-roled users who navigate to `/role-select` are redirected to their dashboard.

**State Machine**:
```
NO_SELECTION → SELECTED (card clicked) → SUBMITTING → SUCCESS → REDIRECTING
             → SELECTED → DIFFERENT_SELECTED (changed mind)
                          SUBMITTING → ERROR (show toast, allow retry)
```

**Edge Cases**:
- User refreshes during submission: idempotent API (if role already set, skip).
- User navigates directly to `/role-select` with existing role: redirect to dashboard.
- Admin whitelist check: done server-side in API route, not just UI hiding.
- Simultaneous role-select from two browser tabs: first write wins, second detects existing role and redirects.
- User signs out from role-select page: clear session, redirect to login.
- Browser back button after role selection: middleware catches and redirects to onboarding.

**Acceptance Criteria**:
- AC1: All 5 role cards render with correct icons, titles, descriptions.
- AC2: Platform Admin card hidden for non-whitelisted emails.
- AC3: Selection highlights card and enables Continue button.
- AC4: Successful submission sets role in user_metadata AND creates profile record.
- AC5: Failed profile creation does not orphan role in metadata.
- AC6: Already-roled users are redirected away from this page.
- AC7: Role value is validated server-side against allowed enum values.

### 3.6 Password Recovery (Forgot Password / Reset Password)

**User Flow**:
1. User clicks "Forgot password?" on login page → navigates to `/forgot-password`.
2. User enters email and clicks "Send Reset Link".
3. System calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.
4. User sees "Check your email" confirmation (shown regardless of whether email exists — prevents enumeration).
5. User clicks link in email → redirected to `/reset-password` with recovery token.
6. User enters new password + confirm password.
7. System calls `supabase.auth.updateUser({ password })` (user is in recovery session).
8. On success: show "Password updated" confirmation, auto-redirect to login after 3 seconds.

**UI Layout & Components**:
- `/forgot-password`: Single email input, "Send Reset Link" button, "Back to login" link.
- Success state: checkmark icon, "If an account exists with that email, we've sent a password reset link."
- `/reset-password`: New password input (with strength meter), confirm password input, "Update Password" button.
- Success state: checkmark icon, "Password updated successfully. Redirecting to login...", with manual "Go to login" link.

**Business Rules**:
- Reset link expires after 1 hour.
- New password must meet same complexity rules as registration.
- New password cannot be the same as current password (Supabase may not enforce this; validate client-side by comparing hash if possible, or accept Supabase's behavior).
- Rate limit: 3 password reset emails per email address per hour.
- Reset link is single-use: once clicked and page loaded, the recovery session is active; a second click on same link shows "Link already used" error.
- User in lockout can still request password reset.
- Successful password reset clears all existing sessions for that user (security measure).
- If user has only OAuth identities (no password), reset email is not sent but same generic confirmation shown.

**State Machine**:
```
FORGOT_IDLE → SUBMITTING → SUCCESS_SCREEN
             SUBMITTING → ERROR (rate limited, show message)

RESET_IDLE → VALIDATING → SUBMITTING → SUCCESS → REDIRECTING_TO_LOGIN
            VALIDATING → ERROR (password requirements)
            SUBMITTING → ERROR (token expired/invalid)
```

**Edge Cases**:
- Expired reset token: show "This link has expired" with option to request new one.
- User requests multiple resets: only latest link is valid.
- User changes email between reset request and reset completion: token tied to original email.
- Password reset for OAuth-only account: no error exposed, no email sent.
- Network failure during password update: preserve form state, allow retry.

**Acceptance Criteria**:
- AC1: Generic confirmation shown regardless of email existence.
- AC2: Valid reset link loads password reset form.
- AC3: Expired link shows clear error with resend option.
- AC4: New password meeting requirements is accepted and sessions invalidated.
- AC5: Rate limiting enforced (3 per hour per email).
- AC6: Password strength meter reflects complexity rules.
- AC7: Auto-redirect to login after successful reset.

### 3.7 Email Verification

**User Flow**:
1. User registers via email/password → system sends verification email automatically.
2. User clicks verification link → hits `/auth/callback?type=signup` or similar.
3. Callback handler calls `supabase.auth.exchangeCodeForSession(code)`.
4. Email is marked as confirmed.
5. User is redirected to role-select (new user) or dashboard (if role already set via another identity).

**UI Layout & Components**:
- `/verify-email` page (shown when user tries to access protected route without verified email):
  - Message: "Please verify your email address"
  - Subtext: "We sent a verification link to [email]. Check your inbox and spam folder."
  - "Resend Verification Email" button.
  - "Use a different email" link (signs out and redirects to register).
- After resend: success toast "Verification email sent" with 60-second cooldown on button.

**Business Rules**:
- Verification link expires after 24 hours.
- Unverified users can authenticate but cannot access protected routes (middleware blocks with redirect to `/verify-email`).
- Maximum 5 resend requests per email per 24 hours.
- Email verification is required for email/password accounts only; OAuth providers pre-verify email.
- Phone/OTP accounts without email skip email verification.
- Verification automatically confirms the email identity in Supabase Auth.

**State Machine**:
```
UNVERIFIED → RESEND_REQUESTED → COOLDOWN (60s) → RESEND_AVAILABLE
           → VERIFIED (link clicked externally) → REDIRECT
RESEND_REQUESTED → ERROR (rate limited)
```

**Edge Cases**:
- Multiple verification emails sent: all valid until expiry or one is used.
- User changes email before verifying: new verification sent to new email, old link invalidated.
- Verification link opened in different browser: creates session in that browser, original browser remains unverified until refresh.
- User's email client prefetches links: Supabase uses POST-based confirmation to prevent this (handled by callback route).

**Acceptance Criteria**:
- AC1: Unverified users are redirected to `/verify-email` from any protected route.
- AC2: Resend button sends new verification email.
- AC3: 60-second cooldown prevents rapid resending.
- AC4: Valid verification link confirms email and redirects correctly.
- AC5: Expired verification link shows error with resend option.
- AC6: OAuth-authenticated users bypass email verification requirement.

### 3.8 Multi-Factor Authentication (MFA/TOTP)

**User Flow (Setup)**:
1. Admin or Employer user navigates to `/auth/mfa-setup` (linked from security settings).
2. System calls `supabase.auth.mfa.enroll({ factorType: 'totp' })`.
3. QR code displayed with TOTP secret; manual entry code shown below.
4. User scans QR with authenticator app.
5. User enters 6-digit verification code from app.
6. System calls `supabase.auth.mfa.challengeAndVerify({ factorId, code })`.
7. On success: MFA enabled, show recovery codes (8 codes, one-time use).
8. User must acknowledge recovery codes saved before completing setup.

**User Flow (Login Verification)**:
1. User completes email/password or OAuth login.
2. System detects MFA enrolled: redirects to `/auth/mfa-verify`.
3. User enters 6-digit TOTP code from authenticator app.
4. System verifies via `supabase.auth.mfa.challengeAndVerify`.
5. On success: complete session establishment, redirect per role.
6. On failure: "Invalid code" error, allow retry.

**UI Layout & Components**:
- MFA Setup page: QR code (200x200px) centered, text secret below in monospace copyable field, 6-digit input, "Verify & Enable" button.
- Recovery codes display: 8 codes in 2x4 grid, monospace font, "Copy All" button, checkbox "I have saved these codes", "Complete Setup" button (disabled until checkbox).
- MFA Verify page: Clean centered card, authenticator app icon, "Enter your 6-digit code" label, 6-digit input, "Verify" button, "Use recovery code" link, "Lost access to authenticator?" help link.
- Recovery code entry: single text input, "Verify Recovery Code" button.

**Business Rules**:
- MFA mandatory for Platform Admin role (enforced at login, forced setup on first login).
- MFA optional but recommended for Employer role (prompt shown, dismissible).
- MFA not available for Student, University Admin, Program Provider (v1 scope).
- Recovery codes: 8 codes, alphanumeric, 10 characters each, single-use.
- Each recovery code use marks it as consumed; when 6/8 used, prompt to regenerate.
- TOTP time window: 30 seconds, ±1 step tolerance (90-second effective window).
- MFA can be disabled from security settings (requires current TOTP verification).
- Factor limit: 1 TOTP factor per user (v1 scope).

**State Machine**:
```
MFA_SETUP: NOT_ENROLLED → ENROLLING → QR_DISPLAYED → CODE_VERIFYING → RECOVERY_CODES_SHOWN → SETUP_COMPLETE
                                      QR_DISPLAYED → CODE_VERIFYING → ERROR (invalid code)

MFA_LOGIN: CHALLENGE_PRESENTED → CODE_ENTERED → VERIFYING → SUCCESS
                                              → VERIFYING → ERROR (invalid)
                                              → RECOVERY_MODE → VERIFYING_RECOVERY → SUCCESS
```

**Edge Cases**:
- User loses authenticator device: use recovery code, then re-enroll new device.
- All recovery codes used: user must contact support for manual MFA reset.
- TOTP clock drift: ±1 step tolerance handles minor clock differences.
- MFA setup interrupted (browser closed after QR shown but before verification): factor remains unenrolled, can retry.
- Platform Admin without MFA tries to access admin routes: forced to `/auth/mfa-setup`.
- User uninstalls authenticator app but MFA still enabled: recovery codes are only self-service option.

**Acceptance Criteria**:
- AC1: QR code correctly encodes TOTP secret in standard otpauth:// URI format.
- AC2: Valid TOTP code enables MFA and shows recovery codes.
- AC3: MFA-enabled users must verify TOTP on every login.
- AC4: Recovery codes work as alternative to TOTP.
- AC5: Platform Admin users are forced to set up MFA.
- AC6: MFA can be disabled with valid TOTP verification.
- AC7: Recovery codes are displayed only once and cannot be retrieved again (only regenerated).
- AC8: Used recovery codes are marked and cannot be reused.

### 3.9 Session Management & Middleware Route Protection

**User Flow**:
- Automatic/invisible: middleware runs on every request to protected routes.
- User experiences seamless navigation while authenticated.
- Token refresh happens transparently.
- Session expiry results in redirect to login with return URL preserved.

**UI Layout & Components**:
- No dedicated UI (middleware is invisible).
- Session expiry toast: "Your session has expired. Please log in again."
- Concurrent session limit notification: "You've been signed out because your account is active on another device."

**Business Rules**:
- Access token TTL: 1 hour (Supabase default, configurable).
- Refresh token TTL: 30 days.
- Maximum concurrent sessions: 5 per user.
- When 6th session created, terminate oldest session.
- Session stored as HTTP-only secure cookie via `@supabase/ssr` `createServerClient`.
- Middleware checks on every protected route:
  1. Valid session exists (access token not expired, or refreshable).
  2. Email is verified (for email/password accounts).
  3. Role is assigned (if not, redirect to `/role-select`).
  4. Onboarding is complete for target route group (if not, redirect to onboarding).
  5. Route is accessible by user's role (e.g., `/admin/*` only for Platform Admin).
- Middleware sets `x-user-id`, `x-user-role` headers for downstream route handlers.
- Session refresh: middleware refreshes access token if within 5 minutes of expiry.
- CSRF protection via SameSite cookie attribute and origin checking for mutations.

**Route Protection Matrix**:
| Route Pattern | Auth Required | Email Verified | Role Required | Onboarding Required |
|---|---|---|---|---|
| `/(public)/*` | No | No | No | No |
| `/login, /register, /forgot-password` | No (redirect if authed) | No | No | No |
| `/role-select` | Yes | Yes* | No (must not have role) | No |
| `/student/*` | Yes | Yes | student | Yes |
| `/employer/*` | Yes | Yes | employer | Yes |
| `/university/*` | Yes | Yes | university_admin | Yes |
| `/provider/*` | Yes | Yes | program_provider | Yes |
| `/admin/*` | Yes | Yes | platform_admin | Yes + MFA |
| `/api/auth/*` | No | No | No | No |
| `/api/*` (other) | Yes | Yes | Varies | Yes |

*Phone-only accounts exempt from email verification requirement.

**State Machine**:
```
REQUEST_RECEIVED → CHECK_SESSION → NO_SESSION → REDIRECT_LOGIN
                                 → SESSION_VALID → CHECK_EMAIL_VERIFIED
                                 → SESSION_EXPIRED → ATTEMPT_REFRESH → REFRESHED → CHECK_EMAIL_VERIFIED
                                                                     → REFRESH_FAILED → REDIRECT_LOGIN
CHECK_EMAIL_VERIFIED → NOT_VERIFIED → REDIRECT_VERIFY_EMAIL
                     → VERIFIED → CHECK_ROLE
CHECK_ROLE → NO_ROLE → REDIRECT_ROLE_SELECT
           → HAS_ROLE → CHECK_ROUTE_PERMISSION
CHECK_ROUTE_PERMISSION → FORBIDDEN → REDIRECT_UNAUTHORIZED
                       → ALLOWED → CHECK_ONBOARDING
CHECK_ONBOARDING → INCOMPLETE → REDIRECT_ONBOARDING
                 → COMPLETE → ALLOW_REQUEST
```

**Edge Cases**:
- Token refresh race condition: multiple simultaneous requests trigger refresh; use lock mechanism or accept idempotent refresh.
- Middleware performance: all checks must complete within 50ms to avoid perceived latency.
- User role changed by admin while user has active session: next middleware check picks up new role from refreshed token.
- Cookie size limits: JWT in cookie approaching 4KB limit; use chunked cookies if needed.
- Supabase outage: middleware should have graceful degradation (cache last-known session state briefly? or fail-closed with error page).

**Acceptance Criteria**:
- AC1: Unauthenticated users cannot access any protected route.
- AC2: Authenticated users are redirected away from login/register pages.
- AC3: Role-based route protection correctly blocks cross-role access.
- AC4: Token auto-refresh is transparent to user.
- AC5: Session expiry redirects to login with `returnUrl` query parameter.
- AC6: Maximum 5 concurrent sessions enforced.
- AC7: Middleware adds no more than 50ms latency to requests.
- AC8: Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) set on all responses.

### 3.10 Brute Force Protection & Rate Limiting

**User Flow**:
- Invisible to legitimate users.
- Attackers experience increasingly hostile responses.

**Business Rules**:
- Login attempts: 5 failures per email per 15-minute window → 15-minute lockout.
- Lockout applies to specific email, not IP (prevents IP-based lockout of shared networks).
- Rate limiting on auth endpoints: 10 requests per minute per IP address.
- OTP send: 3 per phone per hour, 10 per phone per 24 hours.
- Password reset: 3 per email per hour.
- Registration: 5 per IP per hour.
- Rate limit response: HTTP 429 with `Retry-After` header.
- Rate limit tracking: Redis/Upstash Redis or Vercel KV for edge-compatible rate limiting.
- Lockout tracking: stored in `login_attempts` table in Supabase.
- Security event logging: all auth events (login success, failure, lockout, password reset, MFA events) logged to `auth_events` table.

**Edge Cases**:
- Distributed attack from multiple IPs: per-email lockout handles this for targeted attacks.
- Legitimate user behind corporate proxy triggering IP rate limit: 10/min is generous enough for normal use; if hit, show friendly "Please slow down" message.
- Rate limit counter reset on success: only login attempt counter resets; IP rate limit uses sliding window.

**Acceptance Criteria**:
- AC1: 5th failed login attempt triggers lockout visible to user.
- AC2: Lockout clears automatically after 15 minutes.
- AC3: Rate-limited requests receive 429 status with Retry-After header.
- AC4: All auth events are logged with timestamp, IP, user agent, outcome.
- AC5: Rate limits apply at edge (before hitting Supabase).

## 4. Data Models

### 4.1 `login_attempts` Table

| Field | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | uuid | PK | `gen_random_uuid()` | Unique identifier |
| `email` | text | NOT NULL, indexed | — | Target email address |
| `ip_address` | inet | NOT NULL | — | Requester IP |
| `user_agent` | text | — | — | Browser user agent string |
| `attempted_at` | timestamptz | NOT NULL | `now()` | When attempt occurred |
| `was_successful` | boolean | NOT NULL | `false` | Whether login succeeded |
| `failure_reason` | text | — | — | Reason code: 'invalid_password', 'account_locked', 'unverified_email', 'mfa_failed' |
| `lockout_until` | timestamptz | — | — | If locked, when lockout expires |
| `metadata` | jsonb | — | `'{}'` | Additional context (country, device type) |

**Indexes**: `idx_login_attempts_email_time` on `(email, attempted_at DESC)`, `idx_login_attempts_ip_time` on `(ip_address, attempted_at DESC)`.

### 4.2 `auth_events` Table

| Field | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | uuid | PK | `gen_random_uuid()` | Unique identifier |
| `user_id` | uuid | FK → auth.users, nullable | — | User ID (null for failed registrations) |
| `event_type` | auth_event_type | NOT NULL | — | Type of auth event |
| `ip_address` | inet | NOT NULL | — | Requester IP |
| `user_agent` | text | — | — | Browser user agent |
| `provider` | text | — | — | Auth provider used |
| `success` | boolean | NOT NULL | — | Whether event was successful |
| `error_code` | text | — | — | Error code if failed |
| `error_message` | text | — | — | Human error message if failed |
| `metadata` | jsonb | — | `'{}'` | Event-specific data (country, device, factor_id) |
| `session_id` | uuid | — | — | Associated session if applicable |
| `created_at` | timestamptz | NOT NULL | `now()` | Event timestamp |

**Indexes**: `idx_auth_events_user_time` on `(user_id, created_at DESC)`, `idx_auth_events_type` on `(event_type)`, `idx_auth_events_created` on `(created_at DESC)`.

### 4.3 `user_sessions` Table

| Field | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | uuid | PK | `gen_random_uuid()` | Unique identifier |
| `user_id` | uuid | FK → auth.users, NOT NULL | — | Owner user |
| `session_token_hash` | text | NOT NULL, UNIQUE | — | SHA-256 hash of refresh token (for tracking, not verification) |
| `ip_address` | inet | NOT NULL | — | IP at session creation |
| `user_agent` | text | — | — | User agent at creation |
| `device_name` | text | — | — | Parsed device name from UA |
| `last_active_at` | timestamptz | NOT NULL | `now()` | Last activity timestamp |
| `expires_at` | timestamptz | NOT NULL | — | When refresh token expires |
| `is_active` | boolean | NOT NULL | `true` | Whether session is still valid |
| `terminated_reason` | text | — | — | 'logout', 'expired', 'concurrent_limit', 'password_changed', 'admin_revoked' |
| `created_at` | timestamptz | NOT NULL | `now()` | Session creation time |
| `country` | text | — | — | GeoIP country code |

**Indexes**: `idx_user_sessions_user_active` on `(user_id, is_active) WHERE is_active = true`, `idx_user_sessions_expires` on `(expires_at) WHERE is_active = true`.

### 4.4 `mfa_recovery_codes` Table

| Field | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | uuid | PK | `gen_random_uuid()` | Unique identifier |
| `user_id` | uuid | FK → auth.users, NOT NULL | — | Owner user |
| `code_hash` | text | NOT NULL | — | bcrypt hash of recovery code |
| `code_index` | smallint | NOT NULL | — | Position 1-8 for display ordering |
| `is_used` | boolean | NOT NULL | `false` | Whether code has been consumed |
| `used_at` | timestamptz | — | — | When code was used |
| `created_at` | timestamptz | NOT NULL | `now()` | When code was generated |

**Indexes**: `idx_mfa_recovery_user` on `(user_id, is_used)`. **Constraints**: UNIQUE on `(user_id, code_index)`.

### 4.5 `admin_email_whitelist` Table

| Field | Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | uuid | PK | `gen_random_uuid()` | Unique identifier |
| `email` | text | UNIQUE, NOT NULL | — | Specific email allowed as admin |
| `domain` | text | — | — | Domain allowed (e.g., '@globalxcelerate.com') |
| `added_by` | uuid | FK → auth.users | — | Who added this entry |
| `is_active` | boolean | NOT NULL | `true` | Whether entry is active |
| `created_at` | timestamptz | NOT NULL | `now()` | When entry was added |
| `notes` | text | — | — | Admin notes |

**Indexes**: `idx_whitelist_email` on `(email) WHERE is_active = true`, `idx_whitelist_domain` on `(domain) WHERE is_active = true`.

### 4.6 Enums

```sql
CREATE TYPE auth_event_type AS ENUM (
  'register_email',
  'register_oauth',
  'register_phone',
  'login_email',
  'login_oauth',
  'login_phone',
  'login_mfa',
  'logout',
  'password_reset_request',
  'password_reset_complete',
  'email_verification_sent',
  'email_verification_complete',
  'mfa_enrolled',
  'mfa_disabled',
  'mfa_recovery_used',
  'session_refresh',
  'session_terminated',
  'account_locked',
  'account_unlocked',
  'role_selected',
  'profile_created'
);

CREATE TYPE user_role AS ENUM (
  'student',
  'employer',
  'university_admin',
  'program_provider',
  'platform_admin'
);

CREATE TYPE onboarding_status AS ENUM (
  'not_started',
  'in_progress',
  'complete'
);

CREATE TYPE session_termination_reason AS ENUM (
  'logout',
  'expired',
  'concurrent_limit',
  'password_changed',
  'admin_revoked',
  'mfa_reset'
);
```

### 4.7 Role-Specific Profile Tables (Minimal Schema — Owned by Respective Modules)

Created by authentication module but populated by onboarding modules:

**`student_profiles`**:
| Field | Type | Constraints | Default |
|---|---|---|---|
| `id` | uuid | PK | `gen_random_uuid()` |
| `user_id` | uuid | FK → auth.users, UNIQUE, NOT NULL | — |
| `onboarding_status` | onboarding_status | NOT NULL | `'not_started'` |
| `created_at` | timestamptz | NOT NULL | `now()` |
| `updated_at` | timestamptz | NOT NULL | `now()` |

(Same minimal structure for `employer_profiles`, `university_admin_profiles`, `program_provider_profiles`, `platform_admin_profiles` — additional fields owned by respective modules.)

## 5. API Contracts

### 5.1 POST `/api/auth/register`

**Purpose**: Register new user with email/password.

**Request**:
```typescript
{
  fullName: string;       // 2-100 chars
  email: string;          // valid email format
  password: string;       // meets complexity requirements
  confirmPassword: string; // must match password
  tosAgreed: boolean;     // must be true
}
```

**Response (201)**:
```typescript
{
  success: true;
  data: {
    userId: string;
    email: string;
    emailConfirmationSent: boolean;
    message: "Registration successful. Please check your email to verify your account.";
  };
  meta: {
    timestamp: string; // ISO 8601
    requestId: string;
  };
}
```

**Error Responses**:
- `400` — Validation error:
```typescript
{
  success: false;
  error: {
    code: "VALIDATION_ERROR";
    message: "Request validation failed";
    details: [
      { field: "password"; message: "Password must contain at least 1 uppercase letter" },
      { field: "confirmPassword"; message: "Passwords do not match" }
    ];
  };
  meta: { timestamp: string; requestId: string; };
}
```
- `409` — Email conflict (generic):
```typescript
{
  success: false;
  error: {
    code: "REGISTRATION_FAILED";
    message: "Unable to create account. Please try logging in or use a different email.";
    details: [];
  };
  meta: { timestamp: string; requestId: string; };
}
```
- `429` — Rate limited:
```typescript
{
  success: false;
  error: {
    code: "RATE_LIMITED";
    message: "Too many registration attempts. Please try again later.";
    details: [];
    retryAfter: 3600; // seconds
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.2 POST `/api/auth/login`

**Purpose**: Authenticate user with email/password.

**Request**:
```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean; // default false
}
```

**Response (200)**:
```typescript
{
  success: true;
  data: {
    userId: string;
    email: string;
    role: user_role | null;
    emailVerified: boolean;
    mfaRequired: boolean;
    onboardingComplete: boolean;
    redirectTo: string; // computed redirect path
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `401` — Invalid credentials:
```typescript
{
  success: false;
  error: {
    code: "INVALID_CREDENTIALS";
    message: "Invalid email or password.";
    details: [];
    remainingAttempts?: number; // shown when 2 or fewer remain
  };
  meta: { timestamp: string; requestId: string; };
}
```
- `403` — Account locked:
```typescript
{
  success: false;
  error: {
    code: "ACCOUNT_LOCKED";
    message: "Too many failed attempts. Please try again in 12 minutes or reset your password.";
    details: [];
    lockoutEndsAt: string; // ISO 8601
  };
  meta: { timestamp: string; requestId: string; };
}
```
- `403` — Email unverified:
```typescript
{
  success: false;
  error: {
    code: "EMAIL_NOT_VERIFIED";
    message: "Please verify your email address before logging in.";
    details: [];
    email: string;
    canResend: boolean;
  };
  meta: { timestamp: string; requestId: string; };
}
```
- `429` — Rate limited (same format as registration).

### 5.3 POST `/api/auth/otp/send`

**Purpose**: Send OTP to phone number.

**Request**:
```typescript
{
  phone: string; // E.164 format, e.g., "+14155551234"
}
```

**Response (200)**:
```typescript
{
  success: true;
  data: {
    messageId: string;
    expiresIn: 60; // seconds
    phone: string; // masked, e.g., "+1***5551234"
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `400` — Invalid phone format.
- `429` — Rate limited (3/hour per phone).

### 5.4 POST `/api/auth/otp/verify`

**Purpose**: Verify OTP code.

**Request**:
```typescript
{
  phone: string; // E.164 format
  code: string;  // 6 digits
}
```

**Response (200)**:
```typescript
{
  success: true;
  data: {
    userId: string;
    phone: string;
    role: user_role | null;
    isNewUser: boolean;
    redirectTo: string;
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `400` — Invalid/expired OTP:
```typescript
{
  success: false;
  error: {
    code: "INVALID_OTP";
    message: "Invalid or expired code. Please try again.";
    details: [];
    attemptsRemaining: number;
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.5 POST `/api/auth/role-select`

**Purpose**: Set user role and create profile record.

**Request**:
```typescript
{
  role: "student" | "employer" | "university_admin" | "program_provider" | "platform_admin";
}
```

**Headers**: Requires authenticated session.

**Response (200)**:
```typescript
{
  success: true;
  data: {
    userId: string;
    role: user_role;
    profileId: string;
    redirectTo: string; // e.g., "/student/onboarding/step-1"
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `400` — Invalid role value.
- `403` — User already has role:
```typescript
{
  success: false;
  error: {
    code: "ROLE_ALREADY_SET";
    message: "Role has already been assigned to this account.";
    details: [];
    existingRole: user_role;
  };
  meta: { timestamp: string; requestId: string; };
}
```
- `403` — Unauthorized for platform_admin (not whitelisted):
```typescript
{
  success: false;
  error: {
    code: "UNAUTHORIZED_ROLE";
    message: "You are not authorized to select this role.";
    details: [];
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.6 POST `/api/auth/forgot-password`

**Purpose**: Initiate password reset flow.

**Request**:
```typescript
{
  email: string;
}
```

**Response (200)** (always, regardless of email existence):
```typescript
{
  success: true;
  data: {
    message: "If an account exists with that email, a password reset link has been sent.";
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `429` — Rate limited.

### 5.7 POST `/api/auth/reset-password`

**Purpose**: Set new password using recovery session.

**Request**:
```typescript
{
  password: string;
  confirmPassword: string;
}
```

**Headers**: Requires recovery session (established via reset link callback).

**Response (200)**:
```typescript
{
  success: true;
  data: {
    message: "Password updated successfully.";
    sessionsTerminated: number;
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `400` — Password validation failure.
- `401` — No recovery session / expired.

### 5.8 POST `/api/auth/resend-verification`

**Purpose**: Resend email verification link.

**Request**:
```typescript
{
  email: string;
}
```

**Response (200)**:
```typescript
{
  success: true;
  data: {
    message: "Verification email sent.";
    cooldownSeconds: 60;
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `429` — Rate limited (5/day per email).

### 5.9 POST `/api/auth/mfa/enroll`

**Purpose**: Start MFA enrollment.

**Request**: Empty body. Requires authenticated session.

**Response (200)**:
```typescript
{
  success: true;
  data: {
    factorId: string;
    qrCode: string;      // SVG data URI
    secret: string;       // Base32 TOTP secret
    uri: string;          // otpauth:// URI
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.10 POST `/api/auth/mfa/verify`

**Purpose**: Verify TOTP code (for enrollment completion or login challenge).

**Request**:
```typescript
{
  factorId: string;
  code: string; // 6 digits
}
```

**Response (200)**:
```typescript
{
  success: true;
  data: {
    verified: true;
    recoveryCodes?: string[]; // only on enrollment (8 codes)
  };
  meta: { timestamp: string; requestId: string; };
}
```

**Error Responses**:
- `400` — Invalid code.
- `401` — Factor not found / unauthorized.

### 5.11 POST `/api/auth/mfa/recovery`

**Purpose**: Authenticate using recovery code.

**Request**:
```typescript
{
  code: string; // recovery code
}
```

**Response (200)**:
```typescript
{
  success: true;
  data: {
    verified: true;
    remainingCodes: number;
    shouldRegenerate: boolean; // true when ≤2 remaining
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.12 POST `/api/auth/logout`

**Purpose**: Terminate current session.

**Request**: Empty body. Requires authenticated session.

**Response (200)**:
```typescript
{
  success: true;
  data: {
    message: "Logged out successfully.";
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.13 GET `/api/auth/sessions`

**Purpose**: List user's active sessions.

**Response (200)**:
```typescript
{
  success: true;
  data: {
    sessions: Array<{
      id: string;
      deviceName: string;
      ipAddress: string;
      country: string;
      lastActiveAt: string;
      isCurrent: boolean;
      createdAt: string;
    }>;
    totalCount: number;
    maxAllowed: 5;
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.14 DELETE `/api/auth/sessions/:sessionId`

**Purpose**: Terminate a specific session.

**Response (200)**:
```typescript
{
  success: true;
  data: {
    message: "Session terminated.";
    terminatedSessionId: string;
  };
  meta: { timestamp: string; requestId: string; };
}
```

### 5.15 GET `/auth/callback` (Route Handler — Not API)

**Purpose**: Handle OAuth and email verification redirects from Supabase.

**Query Parameters**: `code` (authorization code), `next` (optional redirect), `error` (optional error from provider), `error_description`.

**Behavior**: Exchanges code for session, sets cookies, determines redirect target, issues 302 redirect.

## 6. Module Dependencies

| Dependency | What's Needed | How It's Used | Failure Handling |
|---|---|---|---|
| Supabase Auth | Authentication service | All auth operations (signUp, signIn, signOut, resetPassword, MFA) | Show "Authentication service unavailable" error page; retry with exponential backoff for background operations |
| Supabase PostgreSQL | Database | login_attempts, auth_events, user_sessions, mfa_recovery_codes, admin_whitelist, profile tables | Fail-closed: deny auth operations if DB unreachable; queue auth_events for async write |
| Upstash Redis (Vercel KV) | Edge-compatible key-value store | Rate limiting counters, session tracking at edge | Fail-open for rate limiting (allow request but log), fail-closed for session validation |
| `app_shell` module | Layout wrapper, navigation context | Auth pages rendered within app shell public layout; authenticated layout receives user context | Auth pages must render independently if shell fails |
| Vercel Edge Runtime | Middleware execution | Route protection middleware runs at edge | If edge function fails, request falls through to origin (fail-open risk); mitigate with redundant checks in server components |
| Email Provider (Supabase/SMTP) | Transactional email | Verification emails, password reset emails | Show "Email may be delayed" warning; implement retry queue; alert ops if delivery rate drops |
| SMS Provider (Twilio via Supabase) | SMS delivery | OTP codes | Show "SMS may be delayed, check in 30 seconds" message; offer email alternative if phone auth fails |
| GeoIP Service | IP geolocation | Country detection for session management, security logging | Graceful degradation: store "unknown" for country; non-blocking |

## 7. Non-Functional Requirements

### Rate Limiting
- Auth endpoints: 10 requests/minute per IP (sliding window)
- Login attempts: 5 failures/15 min per email (tumbling window)
- OTP sends: 3/hour per phone, 10/24hr per phone
- Password reset: 3/hour per email
- Email verification resend: 5/24hr per email
- Registration: 5/hour per IP
- Implementation: Upstash Redis with sliding window algorithm at edge

### Caching
- Admin email whitelist: cached in memory for 5 minutes (invalidated on write)
- Public auth pages (login, register): edge-cached with `s-maxage=3600, stale-while-revalidate=86400`
- No caching of session data or auth tokens (always fresh)
- Rate limit counters: Redis TTL matches window duration

### Performance Targets
- Login flow (click to redirect): < 800ms total (client validation + API + redirect)
- OAuth redirect initiation: < 200ms
- Middleware execution: < 50ms per request
- Token refresh: < 300ms
- Page load (login/register): LCP < 1.5s
- OTP delivery: < 10 seconds (90th percentile)

### Concurrency
- Maximum 5 concurrent sessions per user
- Concurrent login attempts: handled via database-level constraints (no race conditions on attempt counter)
- Role selection: database transaction with row-level lock on user record
- Token refresh: optimistic with retry on conflict

### Data Retention
- Login attempts: 90 days, then archived to cold storage
- Auth events: 1 year for active users, 30 days post-deletion
- Terminated sessions: 90 days
- Recovery codes: until regenerated or account deleted
- Rate limit counters: auto-expire via Redis TTL

### Security
- All auth cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- CSP header: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co`
- HSTS: `max-age=31536000; includeSubDomains; preload`
- X-Frame-Options: `DENY`
- X-Content-Type-Options: `nosniff`
- Referrer-Policy: `strict-origin-when-cross-origin`
- PKCE flow for all OAuth exchanges
- No sensitive data in URL query parameters (tokens in fragment or POST body)
- Password never logged, even in error payloads
- Rate limit headers in responses: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Availability
- Auth module is critical path: target 99.9% uptime
- Graceful degradation: if Supabase Auth is down, show maintenance page; do not expose error details
- Health check endpoint: `GET /api/auth/health` returns 200 if Supabase reachable

## 8. Key Implementation Notes

1. **Supabase Client Instantiation Patterns**: Three distinct client creation functions must be used:
   - `createBrowserClient()` from `@supabase/ssr` for client components (login forms, etc.)
   - `createServerClient(cookies())` for Server Components and Route Handlers (reading session, API logic)
   - `createServerClient()` with request/response cookie manipulation for Middleware
   Never import the browser client in server code or vice versa. Each has different cookie handling strategies.

2. **Middleware Cookie Refresh Strategy**: The middleware must call `supabase.auth.getUser()` (not `getSession()`) on every request to validate the session server-side. `getSession()` only reads from the cookie without verification. The middleware must write updated cookies back to the response using the `cookies.set()` callback in `createServerClient`. This ensures token refresh propagates correctly.

3. **PKCE Code Verifier Storage**: For OAuth flows, the PKCE `code_verifier` is stored in a server-side cookie before redirect. The `/auth/callback` route reads this cookie to complete the exchange. This cookie must have `HttpOnly`, `Secure`, `SameSite=Lax`, short TTL (10 minutes), and must be deleted after use.

4. **Role Selection Atomicity**: The role selection API must perform the following in a single database transaction: (a) verify user has no existing role, (b) update `auth.users.raw_user_meta_data` via Supabase Admin API, (c) insert role-specific profile record. Use Supabase's `rpc()` to call a PostgreSQL function that performs all steps atomically. The Admin API call (`supabase.auth.admin.updateUserById`) must use the service role key, only available in server-side route handlers.

5. **Concurrent Session Enforcement**: On each new session creation, query `user_sessions` for `is_active = true AND user_id = X`. If count >= 5, mark the oldest session as `is_active = false` with `terminated_reason = 'concurrent_limit'`. This is done asynchronously (non-blocking for login) but must happen before the response. Use Supabase Realtime or a webhook to notify the terminated session's client.

6. **Brute Force Counter Implementation**: Use Redis INCR with TTL for rate limiting (edge-fast), but write to `login_attempts` table asynchronously for audit trail. The lockout check reads from Redis first (fast path); if Redis is unavailable, fall back to database query. Redis key format: `auth:attempts:{email}` with 900-second TTL (15 min).

7. **MFA Recovery Codes**: Generate 8 cryptographically random codes using `crypto.getRandomValues()`. Each code is 10 alphanumeric characters (base32 alphabet for readability). Store bcrypt hashes in database, display plaintext only once to user. Verification compares submitted code against all unused hashes for the user (max 8 comparisons).

8. **Auth Callback Route Handler Redirect Logic**: The `/auth/callback/route.ts` handler must determine the correct post-auth redirect by checking (in order):
   - Is `error` query parameter present? → Redirect to `/login?error={error}`
   - Is session established? If no → Redirect to `/login?error=session_failed`
   - Is email verified? If no → Redirect to `/verify-email`
   - Is MFA enrolled? If yes → Redirect to `/auth/mfa-verify`
   - Is role set? If no → Redirect to `/role-select`
   - Is onboarding complete? If no → Redirect to `/{role}/onboarding`
   - Default → Redirect to `/{role}/dashboard`
   The `next` query parameter, if present and validated against allowed paths, overrides the default dashboard redirect.

9. **Security Headers in Middleware**: Rather than configuring headers in `next.config.js` (which doesn't apply to edge middleware responses), set all security headers in the middleware itself using `NextResponse.headers.set()`. This ensures consistent headers regardless of route type (static, dynamic, API).

10. **Apple Sign-In Name Persistence**: Apple only provides the user's name on the very first authorization. The callback handler must check if `user_metadata.full_name` is empty AND the identity provider is Apple AND the raw identity data contains `name`. If all true, immediately persist the name to `user_metadata`. On subsequent logins, Apple won't provide the name again.

## 9. File Map

```
src/
├── app/
│   ├── (auth)/                              # Auth route group (public layout)
│   │   ├── layout.tsx                       # Split-panel layout (illustration + form)
│   │   ├── login/
│   │   │   └── page.tsx                     # Login page (Server Component shell)
│   │   ├── register/
│   │   │   └── page.tsx                     # Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx                     # Forgot password page
│   │   ├── reset-password/
│   │   │   └── page.tsx                     # Password reset form page
│   │   ├── verify-email/
│   │   │   └── page.tsx                     # Email verification pending page
│   │   ├── verify-otp/
│   │   │   └── page.tsx                     # OTP verification page
│   │   └── role-select/
│   │       └── page.tsx                     # Role selection page
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts                    # OAuth/email callback handler (GET)
│   │   ├── mfa-setup/
│   │   │   └── page.tsx                    # MFA enrollment page
│   │   └── mfa-verify/
│   │       └── page.tsx                    # MFA challenge page during login
│   └── api/
│       └── auth/
│           ├── register/
│           │   └── route.ts                # POST registration endpoint
│           ├── login/
│           │   └── route.ts                # POST login endpoint
│           ├── logout/
│           │   └── route.ts                # POST logout endpoint
│           ├── forgot-password/
│           │   └── route.ts                # POST forgot password endpoint
│           ├── reset-password/
│           │   └── route.ts                # POST reset password endpoint
│           ├── resend-verification/
│           │   └── route.ts                # POST resend verification endpoint
│           ├── role-select/
│           │   └── route.ts                # POST role selection endpoint
│           ├── otp/
│           │   ├── send/
│           │   │   └── route.ts            # POST send OTP endpoint
│           │   └── verify/
│           │       └── route.ts            # POST verify OTP endpoint
│           ├── mfa/
│           │   ├── enroll/
│           │   │   └── route.ts            # POST MFA enrollment endpoint
│           │   ├── verify/
│           │   │   └── route.ts            # POST MFA verify endpoint
│           │   └── recovery/
│           │       └── route.ts            # POST MFA recovery code endpoint
│           ├── sessions/
│           │   ├── route.ts                # GET list sessions
│           │   └── [sessionId]/
│           │       └── route.ts            # DELETE terminate session
│           └── health/
│               └── route.ts                # GET health check
├── middleware.ts                            # Root middleware (auth + routing logic)
├── components/
│   └── auth/
│       ├── login-form.tsx                   # Client component: email/password login form
│       ├── register-form.tsx                # Client component: registration form
│       ├── forgot-password-form.tsx         # Client component: forgot password form
│       ├── reset-password-form.tsx          # Client component: reset password form
│       ├── otp-phone-form.tsx              # Client component: phone number input + send
│       ├── otp-verify-form.tsx             # Client component: 6-digit OTP entry
│       ├── oauth-buttons.tsx               # Client component: 4 OAuth provider buttons
│       ├── role-select-grid.tsx            # Client component: role selection cards
│       ├── mfa-setup-form.tsx              # Client component: QR display + verify
│       ├── mfa-verify-form.tsx             # Client component: TOTP entry for login
│       ├── mfa-recovery-form.tsx           # Client component: recovery code entry
│       ├── password-strength-meter.tsx     # Client component: password strength indicator
│       ├── auth-illustration-panel.tsx     # Server component: branded left panel
│       ├── verification-success.tsx        # Client component: success state display
│       └── session-expired-toast.tsx       # Client component: session expiry notification
├── lib/
│   └── auth/
│       ├── supabase-browser.ts             # createBrowserClient factory
│       ├── supabase-server.ts              # createServerClient factory for RSC/routes
│       ├── supabase-middleware.ts          # createServerClient factory for middleware
│       ├── supabase-admin.ts              # Service role client (server-only)
│       ├── password-validation.ts          # Password complexity checker + strength scorer
│       ├── phone-validation.ts            # E.164 phone number validation (libphonenumber-js)
│       ├── rate-limiter.ts                # Redis-based rate limiting utilities
│       ├── brute-force.ts                 # Login attempt tracking + lockout logic
│       ├── session-manager.ts             # Concurrent session enforcement logic
│       ├── mfa-helpers.ts                 # Recovery code generation + verification
│       ├── auth-redirect.ts               # Post-auth redirect logic (role/onboarding check)
│       ├── admin-whitelist.ts             # Admin email/domain whitelist checker
│       ├── security-headers.ts            # Security header constants and setter
│       ├── auth-event-logger.ts           # Auth event logging utility
│       └── constants.ts                   # Auth-related constants (TTLs, limits, routes)
├── hooks/
│   └── auth/
│       ├── use-auth.ts                    # React hook: current user context, login state
│       ├── use-login-form.ts              # React hook: login form state + validation
│       ├── use-register-form.ts           # React hook: register form state + validation
│       ├── use-otp.ts                     # React hook: OTP send/verify + countdown timer
│       └── use-password-strength.ts       # React hook: real-time password strength
├── types/
│   └── auth/
│       ├── index.ts                       # All auth-related TypeScript types
│       ├── api.ts                         # API request/response types
│       ├── forms.ts                       # Form state types
│       └── enums.ts                       # Role, event type enums (TypeScript)
└── supabase/
    └── migrations/
        ├── 001_create_login_attempts.sql   # login_attempts table + indexes
        ├── 002_create_auth_events.sql      # auth_events table + indexes
        ├── 003_create_user_sessions.sql    # user_sessions table + indexes
        ├── 004_create_mfa_recovery.sql     # mfa_recovery_codes table + indexes
        ├── 005_create_admin_whitelist.sql  # admin_email_whitelist table + indexes
        ├── 006_create_profile_tables.sql   # All 5 role profile tables (minimal)
        ├── 007_create_enums.sql            # auth_event_type, user_role, onboarding_status enums
        ├── 008_create_role_select_fn.sql   # Atomic role selection PostgreSQL function
        └── 009_create_rls_policies.sql     # Row Level Security policies for auth tables
```