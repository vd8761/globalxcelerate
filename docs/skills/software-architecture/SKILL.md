# Software Architecture — GlobalXcelerate

## Overview

Comprehensive architecture standards for the GlobalXcelerate B2B2C Global Talent Mobility & Experiential Learning Platform built with Next.js 14+ (App Router), Supabase (PostgreSQL, Auth, Storage, Realtime), TypeScript, Tailwind CSS, and shadcn/ui. This skill governs component architecture (atomic design), state management, routing, server/client component decisions, data fetching patterns (SSR/SSG/ISR), caching strategies, database schema design, real-time subscriptions, file storage, image optimization, responsive design, layout architecture, search/filter patterns, AI service integration, notification systems, and multi-tenant data isolation.

## When to Use This Skill

- Designing or reviewing component architecture and folder structure
- Making server component vs client component decisions
- Implementing data fetching with SSR, SSG, or ISR
- Designing database schemas in Supabase PostgreSQL
- Setting up real-time subscription architecture
- Implementing file storage with Supabase Storage
- Building responsive layouts across breakpoints
- Designing search and filter systems
- Integrating AI/LLM services
- Implementing notification systems
- Ensuring multi-tenant data isolation

## Component Architecture (Atomic Design)

### Design System Hierarchy
- **Atoms**: Smallest UI elements — Button, Input, Badge, Avatar, Icon, Label, Tooltip
- **Molecules**: Combinations of atoms — SearchBar, FormField, StatCard, SkillTag, ScoreIndicator
- **Organisms**: Complex UI sections — NavigationBar, OpportunityCard, ProfileHeader, MatchBreakdown, CopilotWidget
- **Templates**: Page-level layouts — DashboardTemplate, MarketplaceTemplate, OnboardingTemplate, AdminTemplate
- **Pages**: Route-level components composing templates with data — StudentDashboardPage, MarketplacePage

### File Organization
```
src/
├── components/
│   ├── atoms/           # Button, Input, Badge, Avatar, etc.
│   ├── molecules/       # SearchBar, FormField, StatCard, etc.
│   ├── organisms/       # Navbar, OpportunityCard, ProfileSection, etc.
│   ├── templates/       # DashboardLayout, MarketplaceLayout, etc.
│   └── ui/              # shadcn/ui components (auto-generated)
├── app/                 # Next.js App Router pages
│   ├── (public)/        # Public routes (landing, auth)
│   ├── (dashboard)/     # Protected student dashboard routes
│   ├── (marketplace)/   # Opportunity marketplace routes
│   ├── (admin)/         # Admin panel routes
│   └── api/             # API routes
├── lib/                 # Utilities, configs, helpers
│   ├── supabase/        # Supabase client configs
│   ├── ai/              # AI service integrations
│   └── utils/           # General utilities
├── hooks/               # Custom React hooks
├── stores/              # State management (if needed)
├── types/               # TypeScript type definitions
└── styles/              # Global styles, Tailwind config
```

### Component Conventions
- Each component has its own directory: `ComponentName/index.tsx`, `ComponentName.types.ts`, `ComponentName.test.tsx`
- Components MUST be typed with TypeScript interfaces (never `any`)
- Props interfaces exported separately for reuse
- Default exports for page components; named exports for shared components
- Components MUST NOT exceed 200 lines; extract sub-components when exceeded
- Each component must have a single responsibility

## Server Components vs Client Components

### Server Components (Default)
- All components are Server Components by default in App Router
- Use for: static content, data fetching, accessing backend resources, SEO-critical content
- Pages that primarily display data (profile view, opportunity detail, marketplace listings)
- Layout components, navigation shells, footer
- Any component that does NOT need interactivity, event handlers, or browser APIs

### Client Components ('use client')
- Use ONLY when required: event handlers (onClick, onChange), useState/useEffect, browser APIs, third-party client libraries
- Interactive forms (onboarding wizard, application form, search filters)
- Real-time features (chat widget, live notifications, subscription updates)
- Components with animation/transition states
- ALWAYS mark with 'use client' directive at the top of the file
- Minimize client component tree — push 'use client' boundary as low as possible
- Never wrap an entire page in 'use client'; extract interactive parts into leaf client components

### Composition Pattern
- Server component parents can render client component children
- Pass server-fetched data as props to client components (serializable only)
- Use the "donut pattern": server component shell wraps client component island

## Routing Architecture (App Router)

### Route Groups
- `(public)` — Landing page, login, signup, password reset (no auth required)
- `(dashboard)` — Student dashboard, profile, portfolio, GX Score (auth required, student role)
- `(marketplace)` — Opportunity browse, search, detail pages (auth required, all roles)
- `(employer)` — Employer dashboard, opportunity management, candidate review (employer role)
- `(university)` — University admin panel, student analytics (university admin role)
- `(admin)` — Platform administration (admin role only)
- `api/` — API routes for backend logic

### Route Conventions
- Use `layout.tsx` for shared UI (sidebar, navigation) within route groups
- Use `loading.tsx` for Suspense fallbacks on every page
- Use `error.tsx` for error boundaries at route group level
- Use `not-found.tsx` for 404 handling
- Parallel routes (`@modal`, `@sidebar`) for complex layouts
- Intercepting routes for modal patterns (opportunity quick-view from marketplace)

### Dynamic Routes
- `[id]` for entity detail pages (opportunity, student profile)
- `[...slug]` for CMS-like content pages
- Route params validated with Zod before database queries

## Data Fetching Patterns

### Server-Side Rendering (SSR) — `fetch` with no cache
- Student dashboard (personalized, fresh data on every request)
- Application management pages
- Admin panels
- Any page showing user-specific, frequently changing data

### Static Site Generation (SSG) — `fetch` with `force-cache`
- Landing page (marketing content)
- Help/FAQ pages
- Static informational pages

### Incremental Static Regeneration (ISR) — `fetch` with `revalidate`
- Opportunity marketplace listings (revalidate every 60 seconds)
- Public student profiles (revalidate every 300 seconds)
- Organization pages (revalidate every 3600 seconds)
- GX Score leaderboards (revalidate every 900 seconds)

### Client-Side Fetching (SWR/React Query)
- Real-time notification counts
- Chat/Copilot messages
- Infinite scroll pagination
- Optimistic updates (application status changes)
- Polling for background job status

### Data Fetching Rules
- NEVER fetch in client components what can be fetched in server components
- Use Supabase server client in Server Components and API routes
- Use Supabase browser client only in client components with 'use client'
- Implement request deduplication with React cache() for shared data across components
- Database queries must use parameterized inputs (Supabase SDK handles this)

## Caching Strategies

### Next.js Data Cache
- Full Route Cache for ISR pages (marketplace, public profiles)
- Router Cache for client-side navigation (30 seconds for dynamic, 5 minutes for static)
- Use `revalidatePath()` and `revalidateTag()` for on-demand cache invalidation

### Application Caching
- Cache AI matching results for 1 hour (invalidate on profile update)
- Cache GX Score calculations for 15 minutes
- Cache opportunity search results for 60 seconds
- Cache organization metadata for 1 hour
- Use Redis or Vercel KV for cross-request caching at scale

### Cache Invalidation Rules
- Profile update → invalidate: matching cache, GX Score cache, public profile cache
- New opportunity → invalidate: marketplace listings cache, matching suggestions
- Application status change → invalidate: student applications list, employer review list
- NEVER serve stale data for: auth state, application status, payment transactions

## Database Schema Design (Supabase PostgreSQL)

### Schema Principles
- Use UUID for all primary keys (gen_random_uuid())
- Include `created_at` and `updated_at` timestamps on every table (with triggers)
- Soft delete with `deleted_at` column for recoverable entities (profiles, opportunities)
- JSONB columns for semi-structured data (dimension_scores, metadata, preferences)
- Enforce foreign key constraints for referential integrity
- Use CHECK constraints for enum-like values (status, category, role)
- Composite unique constraints to prevent duplicates (student_id + opportunity_id for applications)

### Indexing Strategy
- Index all foreign keys
- Composite indexes for common query patterns (category + status + deadline)
- GIN index on JSONB columns used in queries
- Full-text search index (tsvector) on searchable text fields
- Partial indexes for status-filtered queries (WHERE status = 'active')
- Monitor query performance; add indexes when P95 > 100ms

### Migration Principles
- Migrations are forward-only (never edit a deployed migration)
- Each migration has a descriptive name with timestamp prefix
- Migrations must be reversible (include down migration)
- RLS policies applied in same migration as table creation
- Test migrations against production-like data volume before deployment

### Row Level Security (RLS)
- RLS MUST be enabled on ALL tables
- Policies use `auth.uid()` for user identification
- Students access only own data (student_id = auth.uid())
- Employers see their organization's opportunities and received applications
- University Admins see their institution's students
- Platform Admins bypass RLS through service role (server-side only)
- RLS policies must be tested with integration tests

## Real-Time Subscription Architecture

### Supabase Realtime Patterns
- Subscribe to notification inserts for logged-in user
- Subscribe to application status changes (student watches their applications)
- Subscribe to new messages in Copilot conversations
- Subscribe to opportunity updates (employer watches their listings)

### Subscription Rules
- Subscriptions ONLY in client components with proper cleanup (useEffect with unsubscribe)
- Filter subscriptions to user-relevant data (never subscribe to entire tables)
- Implement exponential backoff reconnection for dropped connections
- Show connection status indicator when real-time connection is lost
- Maximum 10 concurrent subscriptions per client session
- Unsubscribe on component unmount and route change

### Channel Strategy
- User-specific channel: `user:{userId}` for notifications, messages
- Entity-specific channel: `application:{applicationId}` for status updates
- Room-based channel: `copilot:{conversationId}` for chat messages

## File Storage (Supabase Storage)

### Bucket Architecture
- `avatars` (public) — Profile photos, organization logos
- `portfolios` (private) — Student portfolio documents, certificates
- `opportunity-assets` (private) — Opportunity-related documents
- `resumes` (private) — Generated and uploaded resumes
- `temp` (private) — Temporary uploads during onboarding (auto-cleanup after 24h)

### Storage Rules
- Maximum file sizes: 10MB documents, 5MB images
- Allowed types: PDF, DOCX for documents; JPEG, PNG, WebP for images
- MIME type validation on both client and server
- File names sanitized and UUID-prefixed to prevent conflicts
- Signed URLs with 1-hour expiry for private file access
- CDN delivery for public assets (avatars, logos)
- Virus scanning integration before final storage

### File Upload Pattern
- Client uploads directly to Supabase Storage (signed upload URL from server)
- Server validates file metadata before issuing signed URL
- After successful upload, create database record linking file to entity
- Implement progress indicators for uploads > 1MB
- Retry logic for failed uploads (up to 3 attempts)

## Image Optimization

- Use Next.js `<Image>` component for all images
- Configure remote patterns for Supabase Storage domain
- Implement responsive srcSet for avatar/profile images
- Use WebP format with JPEG fallback
- Lazy load images below the fold
- Priority load for above-the-fold hero images and avatars
- Image dimensions: Avatar (128x128, 256x256), Cards (640x360), Hero (1920x1080)
- Blur placeholder for images during loading (blurDataURL)

## Responsive Design Breakpoints

### Breakpoint System (Tailwind)
- `sm`: 640px — Large phones (landscape)
- `md`: 768px — Tablets
- `lg`: 1024px — Small desktops / tablets landscape
- `xl`: 1280px — Standard desktops
- `2xl`: 1536px — Large desktops

### Layout Behavior
- **Mobile (< 768px)**: Single column, bottom navigation, full-width cards, bottom sheet filters, collapsible sections
- **Tablet (768px – 1023px)**: Two-column grid where appropriate, side sheet navigation, compact cards
- **Desktop (≥ 1024px)**: Full sidebar navigation, multi-column layouts, hover interactions, expanded data tables

### Mobile-First Approach
- Design mobile layout first, then enhance for larger screens
- Touch targets minimum 44x44px on mobile
- Thumb-friendly interaction zones (bottom of screen for primary actions)
- No horizontal scroll on any breakpoint
- Critical actions accessible without scrolling on mobile

## Sidebar Layout Architecture

### Sidebar Structure
- Fixed sidebar on desktop (≥ 1024px), width: 280px collapsed / 64px icons-only
- Sidebar collapsible with toggle button and keyboard shortcut
- Slide-over sidebar on tablet and mobile (overlay with backdrop)
- Sidebar sections: Main navigation, Quick actions, User profile summary
- Active route highlighted with visual indicator
- Role-based menu items (show only permitted routes)

### Layout Composition
- Root layout: Theme provider, font loading, metadata
- Route group layout: Auth check + sidebar + header + main content area
- Main content area has maximum width constraint (max-w-7xl) with padding
- Sticky header within content area (breadcrumbs, page title, actions)

## Search and Filter Architecture

### Search Implementation
- Full-text search using PostgreSQL `tsvector` + `tsquery` (via Supabase)
- Search index on: opportunity title, description, skills, organization name
- Debounced search input (300ms) to reduce API calls
- Minimum 2 characters before triggering search
- Search suggestions/autocomplete from recent searches and popular terms

### Filter Architecture
- Filter state managed in URL search params (shareable, bookmarkable)
- Filter components update URL params; server reads params for queries
- Available filters for marketplace: category, location, work_mode, duration, deadline, match_score_min
- Faceted search: show count per filter option
- Clear all / clear individual filters
- Mobile: filters in bottom sheet; Desktop: filters in sidebar panel

### Pagination
- Cursor-based pagination for infinite scroll (marketplace)
- Offset pagination for admin tables (with page numbers)
- Default page size: 20 items (marketplace), 50 items (admin)
- Load more button + infinite scroll hybrid pattern
- Total count displayed for user awareness

## AI Service Integration Patterns

### Architecture
- All AI calls routed through Next.js API routes (never direct from client)
- AI service abstraction layer (`lib/ai/`) with provider-agnostic interface
- Support for streaming responses (Server-Sent Events for Copilot)
- Request queuing and rate limiting per user
- Fallback responses when AI service is unavailable

### AI Service Modules
- **Matching Engine**: Batch scoring with caching; deterministic rule-based scoring + AI explanations
- **Career Copilot**: Streaming chat with context injection (student profile + opportunities)
- **Score Explanations**: Generate human-readable explanations for GX Score dimensions
- **Skill Gap Analysis**: Identify missing skills and suggest learning paths

### AI Integration Rules
- API keys stored in environment variables only (never in client code)
- Implement circuit breaker pattern (fail open with cached/default response)
- Maximum token limits per request (4000 input, 2000 output for Copilot)
- Log AI requests/responses for quality monitoring (no PII in logs)
- A/B test AI model versions without code changes (config-driven)
- Timeout: 30 seconds maximum for AI requests; show progressive loading

## Notification System Architecture

### Notification Types
- **In-app**: Badge counts, notification center dropdown, toast messages
- **Email**: Application status changes, new matches, weekly digest
- **Push** (future): Mobile push notifications

### Architecture
- Notifications stored in `notifications` table (user_id, type, title, body, read, metadata)
- Real-time delivery via Supabase Realtime subscription
- Unread count badge in header (client component with subscription)
- Notification preferences per user (opt-in/out per type and channel)
- Batch notifications for high-frequency events (new opportunities digest)

### Notification Rules
- Never send more than 5 notifications per hour per user (batch excess)
- Critical notifications (security, application accepted) always delivered
- Read status tracked per notification; bulk mark-as-read supported
- Notification center shows last 50 notifications with infinite scroll for older
- Email notifications include unsubscribe link (compliance)

## Multi-Tenant Data Isolation

### Tenant Model
- Organizations (universities, employers, program providers) are logical tenants
- Data isolated at row level using RLS policies (not schema-per-tenant)
- Organization membership table links users to organizations
- Cross-organization data sharing only through platform-mediated features (marketplace)

### Isolation Rules
- Organization members see only their organization's resources
- Students belong to one university (through verified institutional email)
- Employers see only their posted opportunities and received applications
- University admins see only their institution's students (with consent)
- Platform-level analytics aggregate anonymized data across tenants
- API routes validate organization membership before returning data

### Implementation
- `organization_id` column on organization-scoped tables
- RLS policy: `organization_id = (SELECT organization_id FROM org_members WHERE user_id = auth.uid())`
- Service role bypasses for platform admin operations (server-side only)
- Audit logging for cross-tenant data access attempts