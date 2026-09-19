# Shared Contracts — GlobalXcelerate

This document defines canonical entities, enums, error shapes, pagination contracts, and auth identity contracts shared across 2+ modules. All module specs MUST reference this document instead of redefining these structures.

---

## 1. Canonical Entity Definitions

### 1.1 User (Owner: authentication module)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, from Supabase auth.users |
| email | text(255) | Required, unique, from auth provider |
| phone | text(20) | Optional, international format |
| role | enum(student, employer, university, provider, admin) | Required, set during role selection |
| avatar_url | text | Optional, Supabase Storage URL |
| display_name | text(200) | Required, computed from first_name + last_name or provider name |
| email_verified | boolean | Default: false, set true after email verification |
| phone_verified | boolean | Default: false, set true after OTP verification |
| raw_user_meta_data | json | Provider metadata, role, onboarding status |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |
| last_sign_in_at | timestamp | Updated on each login |

### 1.2 StudentProfile (Owner: student_onboarding module)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, auto-generated |
| user_id | uuid | FK → auth.users.id, unique, required |
| first_name | text(100) | Required, 2-100 chars, letters only |
| last_name | text(100) | Required, 2-100 chars, letters only |
| username | text(50) | Required, unique, alphanumeric + hyphens, for public URL |
| email | text(255) | Required, from auth, read-only |
| phone | text(20) | Optional, international format |
| date_of_birth | date | Required, age 16-50 |
| nationality | text(100) | Required, from country list |
| current_country | text(100) | Required, from country list |
| current_city | text(100) | Optional |
| profile_photo_url | text | Optional, Supabase Storage signed URL |
| bio | text | Optional, max 1000 chars |
| profile_completion | int | Required, 0-100, importance-weighted calculation |
| gx_score | decimal(5,2) | Optional, 0-100, calculated by AI engine |
| open_to_opportunities | boolean | Default: true |
| visibility | enum(public, private, employer_only) | Required, default: public |
| onboarding_step | int | Required, 1-8, track wizard progress |
| onboarding_completed | boolean | Default: false |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |
| deleted_at | timestamp | Nullable, soft delete |

### 1.3 Organization (Owner: authentication module / admin)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, auto-generated |
| name | text(255) | Required, unique |
| type | enum(employer, university, provider) | Required |
| logo_url | text | Optional, Supabase Storage |
| website | text | Optional, valid URL |
| verified | boolean | Default: false, admin-verified |
| description | text | Optional, max 2000 chars |
| industry | text(100) | Optional |
| location_country | text(100) | Required |
| location_city | text(100) | Optional |
| size_range | enum(1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5000+) | Optional |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |

### 1.4 Opportunity (Owner: opportunity_marketplace module)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, auto-generated |
| organization_id | uuid | FK → organizations.id, required |
| posted_by | uuid | FK → auth.users.id, required |
| title | text(200) | Required, 5-200 chars |
| category | enum(internship, immersion, exchange, project, research, scholarship, career) | Required |
| description | text | Required, 100-10000 chars, rich text HTML |
| requirements | json | Required, structured {skills, gpa_min, year_of_study, languages, certifications} |
| responsibilities | json | Optional, array of strings |
| benefits | json | Optional, array of strings |
| location_country | text(100) | Required, from country list |
| location_city | text(100) | Optional |
| work_mode | enum(remote, hybrid, onsite) | Required |
| duration_months | int | Optional, min: 1, max: 36 |
| compensation_type | enum(paid, unpaid, stipend) | Optional |
| compensation_amount | decimal(10,2) | Optional, ≥ 0 |
| currency | text(3) | Optional, ISO 4217 |
| visa_support | boolean | Default: false |
| start_date | date | Optional, future date |
| deadline | timestamp | Required, future datetime |
| status | enum(draft, active, closed, expired) | Required, default: draft |
| max_applications | int | Optional, ≥ 1 |
| current_applications | int | Default: 0, auto-incremented |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |

### 1.5 Application (Owner: application_management module)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, auto-generated |
| student_id | uuid | FK → student_profiles.id, required |
| opportunity_id | uuid | FK → opportunities.id, required |
| status | enum(draft, submitted, under_review, shortlisted, assessment, interview, selected, rejected, withdrawn) | Required, default: draft |
| cover_letter | text | Optional, max 5000 chars |
| match_score | decimal(5,2) | Optional, 0-100, snapshot at submission time |
| submitted_at | timestamp | Set when status transitions to submitted |
| reviewed_by | uuid | FK → auth.users.id, optional |
| reviewer_notes | text | Optional, internal only, not visible to student |
| rejection_reason | text(500) | Required on rejection |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |
| deleted_at | timestamp | Nullable, soft delete |

### 1.6 MatchScore (Owner: ai_matching_engine module)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, auto-generated |
| student_id | uuid | FK → student_profiles.id, required, indexed |
| opportunity_id | uuid | FK → opportunities.id, required, indexed |
| total_score | decimal(5,2) | Required, 0-100 |
| dimension_scores | json | Required, {skills: number, academic: number, experience: number, geography: number, availability: number, mobility: number} |
| skill_gaps | json | Optional, array of {skill_name: string, required_level: number, current_level: number} |
| explanation | text | Optional, AI-generated natural language |
| calculated_at | timestamp | Required, auto-generated |
| expires_at | timestamp | Required, calculated_at + 24 hours |

### 1.7 GXScoreHistory (Owner: ai_matching_engine module)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, auto-generated |
| student_id | uuid | FK → student_profiles.id, required, indexed |
| total_score | decimal(5,2) | Required, 0-100 |
| dimension_scores | json | Required, 12-dimension object {academic_readiness, technical_skills, communication, leadership, project_experience, internship_experience, international_exposure, certifications, portfolio_quality, interview_readiness, languages, industry_skills} |
| grade | enum(exceptional, strong, developing, emerging, beginner) | Required, derived from total_score |
| calculated_at | timestamp | Auto-generated |

### 1.8 Notification (Owner: app_shell module / shared)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key, auto-generated |
| user_id | uuid | FK → auth.users.id, required, indexed |
| type | enum(application_status, opportunity_match, deadline_reminder, profile_update, system_announcement, copilot_suggestion) | Required |
| title | text(200) | Required |
| body | text(500) | Required |
| metadata | json | Optional, contextual data (entity_id, entity_type, action_url) |
| read | boolean | Default: false |
| action_url | text | Optional, deep link to relevant page |
| created_at | timestamp | Auto-generated, indexed DESC |

---

## 2. Canonical Enums

| Enum Name | Values | Used By |
|-----------|--------|---------|
| user_role | student, employer, university, provider, admin | User.role, middleware, RLS policies |
| opportunity_category | internship, immersion, exchange, project, research, scholarship, career | Opportunity.category, marketplace filters |
| opportunity_status | draft, active, closed, expired | Opportunity.status |
| application_status | draft, submitted, under_review, shortlisted, assessment, interview, selected, rejected, withdrawn | Application.status |
| work_mode | remote, hybrid, onsite | Opportunity.work_mode, filters |
| compensation_type | paid, unpaid, stipend | Opportunity.compensation_type |
| profile_visibility | public, private, employer_only | StudentProfile.visibility |
| gx_grade | exceptional, strong, developing, emerging, beginner | GXScoreHistory.grade |
| experience_type | internship, project, research, volunteering, competition, hackathon, leadership, exchange, work | Experience.type |
| proficiency_level | 1, 2, 3, 4, 5 | StudentSkill.proficiency_level (1=Beginner, 5=Expert) |
| notification_type | application_status, opportunity_match, deadline_reminder, profile_update, system_announcement, copilot_suggestion | Notification.type |
| document_type | resume, cover_letter, transcript, certificate, portfolio, other | ApplicationDocument.document_type |
| portfolio_section | projects, publications, media, achievements | PortfolioItem.section |
| organization_type | employer, university, provider | Organization.type |
| org_member_role | admin, member, viewer | OrganizationMember.role |

---

## 3. Standard Error Envelope

All API endpoints MUST return errors in this exact shape:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": [
      { "field": "string", "message": "string" }
    ],
    "request_id": "string"
  }
}
```

**Error Code Taxonomy:**
| Prefix | Domain | Example Codes |
|--------|--------|---------------|
| VAL_ | Validation errors | VAL_001 (required field), VAL_002 (format invalid), VAL_003 (out of range) |
| AUTH_ | Authentication/Authorization | AUTH_001 (token expired), AUTH_002 (invalid credentials), AUTH_003 (insufficient role) |
| RES_ | Resource errors | RES_001 (not found), RES_002 (already exists), RES_003 (deleted) |
| BIZ_ | Business rule violations | BIZ_001 (invalid transition), BIZ_002 (deadline passed), BIZ_003 (limit reached) |
| SYS_ | System errors | SYS_001 (internal error), SYS_002 (service unavailable), SYS_003 (timeout) |
| AI_ | AI service errors | AI_001 (provider unavailable), AI_002 (token budget exceeded), AI_003 (rate limited) |

**Standard HTTP Status Code Meanings:**
| Status | Meaning | When Used |
|--------|---------|-----------|
| 200 | Success | Successful GET, PATCH, PUT |
| 201 | Created | Successful POST creating a resource |
| 202 | Accepted | Async operation queued (AI calculations) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error (malformed input, constraint violation) |
| 401 | Unauthorized | No valid auth token / session expired |
| 403 | Forbidden | Authenticated but insufficient role/permission |
| 404 | Not Found | Resource does not exist or is soft-deleted |
| 409 | Conflict | Duplicate (unique constraint), invalid state transition |
| 422 | Unprocessable Entity | Semantically invalid (e.g., referenced entity missing) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server failure |
| 503 | Service Unavailable | AI provider down, maintenance mode |

---

## 4. Standard Pagination Envelope

### 4.1 Offset-Based Pagination (Marketplace, Lists)

**Request Parameters:**
| Param | Type | Default | Constraints |
|-------|------|---------|-------------|
| page | int | 1 | Min: 1, max: 1000 |
| per_page | int | 20 | Min: 1, max: 100 |
| sort_by | string | "created_at" | Must be a valid sortable field |
| sort_order | string | "desc" | "asc" or "desc" |

**Response Shape:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

### 4.2 Cursor-Based Pagination (Feeds, Notifications)

**Request Parameters:**
| Param | Type | Default | Constraints |
|-------|------|---------|-------------|
| cursor | string | null | Opaque cursor from previous response |
| limit | int | 20 | Min: 1, max: 50 |
| direction | string | "after" | "after" or "before" |

**Response Shape:**
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6...",
    "prev_cursor": "eyJpZCI6...",
    "has_more": true,
    "limit": 20
  }
}
```

---

## 5. Auth / Identity Contract

### 5.1 Session Object Shape

Every authenticated request contains a session accessible via Supabase server client:

```typescript
interface AuthSession {
  user: {
    id: string;           // UUID from auth.users
    email: string;
    phone?: string;
    role: UserRole;       // 'student' | 'employer' | 'university' | 'provider' | 'admin'
    email_confirmed_at?: string;
    user_metadata: {
      role: UserRole;
      display_name: string;
      avatar_url?: string;
      organization_id?: string;   // For employer/university/provider roles
      onboarding_completed?: boolean;
    };
  };
  access_token: string;   // JWT, 1-hour TTL
  refresh_token: string;  // 30-day TTL
  expires_at: number;     // Unix timestamp
}
```

### 5.2 Reading Current User Identity

**Server Components / Route Handlers:**
```typescript
import { createServerClient } from '@/lib/supabase/server';

const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();
// user.id → UUID
// user.user_metadata.role → UserRole
// user.user_metadata.organization_id → org UUID (for non-student roles)
```

**Client Components:**
```typescript
import { useAuth } from '@/hooks/use-auth';

const { user, session, isLoading } = useAuth();
// user.id, user.role, user.organization_id
```

### 5.3 Role-Based Access Pattern

All API route handlers must check role before processing:
```typescript
// Pattern: Extract user and verify role
const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) return NextResponse.json({ error: { code: 'AUTH_001', message: 'Authentication required' } }, { status: 401 });
if (!allowedRoles.includes(user.user_metadata.role)) return NextResponse.json({ error: { code: 'AUTH_003', message: 'Insufficient permissions' } }, { status: 403 });
```

### 5.4 Middleware Route Protection Matrix

| Route Pattern | Requires Auth | Allowed Roles | Onboarding Required |
|---------------|---------------|---------------|---------------------|
| /(public)/* | No | All | No |
| /(auth)/* | No (redirect if authed) | All | No |
| /(student)/* | Yes | student | Yes (redirect to /onboarding) |
| /(employer)/* | Yes | employer | Yes (redirect to /employer/setup) |
| /(university)/* | Yes | university | Yes |
| /(provider)/* | Yes | provider | Yes |
| /(admin)/* | Yes | admin | No |
| /api/v1/* | Yes (except public endpoints) | Varies per endpoint | No (partial access) |

---

## 6. Shared Type Definitions

### 6.1 API Response Wrapper
```typescript
type ApiResponse<T> = {
  data: T;
  pagination?: OffsetPagination | CursorPagination;
};

type ApiError = {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
    request_id: string;
  };
};
```

### 6.2 Common Field Patterns
- **All UUIDs**: v4 format, lowercase, 36 characters
- **All timestamps**: ISO 8601 format with timezone (e.g., "2024-01-15T10:30:00Z")
- **All dates**: ISO 8601 date format (e.g., "2024-01-15")
- **All currency amounts**: decimal(10,2), stored as string in JSON responses for precision
- **All URLs**: absolute URLs, validated with URL constructor
- **All text arrays**: JSONB arrays in PostgreSQL, string[] in TypeScript

---

## 7. Supabase RLS Policy Patterns

All modules MUST follow these RLS patterns:

```sql
-- Pattern 1: Owner-only CRUD
CREATE POLICY "owner_all" ON {table}
  FOR ALL USING (auth.uid() = user_id);

-- Pattern 2: Public read + owner write
CREATE POLICY "public_read" ON {table}
  FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);
CREATE POLICY "owner_write" ON {table}
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON {table}
  FOR UPDATE USING (auth.uid() = user_id);

-- Pattern 3: Organization-scoped
CREATE POLICY "org_access" ON {table}
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Pattern 4: Admin full access
CREATE POLICY "admin_all" ON {table}
  FOR ALL USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );
```

---

## 8. File Upload Contract

All modules handling file uploads MUST use this contract:

**Upload Flow:**
1. Client requests signed upload URL via `POST /api/v1/storage/upload-url`
2. Server validates file metadata (type, size) and returns signed URL + file path
3. Client uploads directly to Supabase Storage via signed URL
4. Client confirms upload by sending file path to the relevant API endpoint

**File Constraints:**
| File Type | Allowed MIME | Max Size | Bucket |
|-----------|-------------|----------|--------|
| Profile photo | image/jpeg, image/png, image/webp | 5MB | avatars |
| Document (resume, transcript) | application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document | 10MB | documents |
| Portfolio media | image/*, video/mp4, video/webm | 100MB (video), 10MB (image) | portfolio |
| Certificate | image/jpeg, image/png, application/pdf | 5MB | certificates |

---

## 9. Real-time Subscription Channels

| Channel Pattern | Filter | Purpose | Consumers |
|----------------|--------|---------|-----------|
| notifications:{userId} | user_id = current | New notifications, badge count | Header bell, dashboard feed |
| applications:{studentId} | student_id = current | Application status changes | Student dashboard, application list |
| applications:{opportunityId} | opportunity_id = current | New applications | Employer dashboard |
| messages:{conversationId} | conversation_id = current | New messages | Chat panel |
| opportunities:new | status = 'active' | New opportunity posted | Marketplace (optional) |