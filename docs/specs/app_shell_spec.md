# Module Spec: Application Shell

## 1. Overview & Purpose

The Application Shell module provides the foundational layout skeleton for the entire GlobalXcelerate platform, including the root layout, role-based route group layouts, responsive sidebar navigation, header chrome, bottom tab bar for mobile, breadcrumb system, theme provider, and global CSS configuration. It is the first module loaded and wraps all feature modules with consistent structural chrome, navigation, and theming without containing any feature-specific business logic.

All five user roles (Student, Employer, University Admin, Program Provider, Platform Admin) interact with the shell, each receiving a role-specific navigation configuration, sidebar layout, and header personalization. Unauthenticated users see public and auth route group layouts (no sidebar, centered content).

Key screens/interfaces owned: Root HTML layout, role-specific dashboard layouts (`/(student)`, `/(employer)`, `/(university)`, `/(provider)`, `/(admin)`), auth layout (`/(auth)`), public layout (`/(public)`), sidebar component, header component, mobile bottom tab bar, breadcrumb trail, theme toggle, notification bell badge, and user avatar dropdown.

The shell connects to feature modules by providing named `<Slot>` areas (React `children` prop in layouts) where feature pages render. It reads user session/role from Supabase Auth (server-side) to determine which layout to apply and which navigation items to display. It subscribes to Supabase Realtime for notification badge count updates.

This module does NOT: render any feature page content, manage authentication flows (only reads session), handle notification list/detail views, implement search functionality beyond the search trigger button, manage user profile editing, or contain any business domain logic.

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

Module-specific UI overrides and details:

- **Sidebar background**: Navy `#0F172A` in both light and dark mode; text is white/gray-300
- **Sidebar width**: Expanded 280px (desktop ≥1024px), Collapsed icon-only 64px (tablet 768-1023px), Hidden with hamburger overlay (mobile <768px)
- **Header height**: Fixed 64px on all breakpoints
- **Bottom tab bar height**: Fixed 56px, visible only on mobile (<768px)
- **Logo**: Full wordmark "GlobalXcelerate" in sidebar expanded state; "GX" monogram in collapsed/mobile states
- **Active navigation link**: Left 3px cyan `#06B6D4` border, background `rgba(6, 182, 212, 0.08)`, text white
- **Hover navigation link**: Background `rgba(255, 255, 255, 0.05)`, transition 150ms ease
- **GX Score badge**: Pill shape, cyan background with navy text, displayed in header beside avatar
- **Notification bell**: Lucide `Bell` icon, red `#EF4444` dot indicator (8px) for unread count > 0, count number displayed if ≤ 99, "99+" otherwise
- **User avatar**: 36px circle, fallback to initials on colored background derived from user name hash
- **Breadcrumb separator**: Lucide `ChevronRight` 16px, text-muted-foreground
- **Font loading**: `Satoshi` via next/font/local for headings (font-display: swap), `Inter` via next/font/google for body
- **Z-index layers**: Sidebar overlay z-40, Header z-30, Bottom tab bar z-30, Dropdown menus z-50, Toast notifications z-60

## 3. Features & Functional Requirements

### 3.1 Root Layout & Theme Provider

**User Flow:**
1. User navigates to any URL on the platform.
2. The root layout (`app/layout.tsx`) renders the HTML document structure with correct fonts, metadata, and theme provider wrapping.
3. Theme is read from cookie/localStorage (persisted preference) and applied as a class on `<html>` element.
4. If no preference exists, system preference is detected and applied.
5. User can toggle between light and dark mode via the theme toggle button in the header.
6. Theme change is instant (no flash) due to blocking script injection before hydration.

**UI Layout & Components:**
- `<html>` element with `lang="en"`, `suppressHydrationWarning`, and dynamic class for theme (`dark`/`light`)
- `<body>` with font CSS variables (`--font-heading`, `--font-body`) and antialiased text rendering
- `ThemeProvider` component wrapping all children, using `next-themes` with `attribute="class"`, `defaultTheme="system"`, `enableSystem=true`, `storageKey="gx-theme"`
- `Toaster` component (shadcn/ui Sonner) mounted at root level for global toast notifications
- Global CSS loaded via `globals.css` with Tailwind directives, custom properties, and component layer styles

**Business Rules:**
- Theme must never flash on initial load (FOUC prevention)
- Theme preference persists across sessions via localStorage
- Dark mode uses slate-900 backgrounds; light mode uses white/slate-50
- All CSS custom properties must have both light and dark variants defined in globals.css
- Root layout is a Server Component; ThemeProvider is a Client Component wrapper

**State Machine:**
- States: `system` | `light` | `dark`
- Transitions: User clicks toggle → cycles through light → dark → system
- Persistence: localStorage key `gx-theme`

**Edge Cases:**
- JavaScript disabled: Falls back to light mode (default class)
- Cookie/localStorage mismatch: localStorage takes precedence
- SSR: Server renders without theme class; blocking script applies it before paint
- Embedded iframes: Theme does not leak to parent or child frames

**Acceptance Criteria:**
- No visible theme flash on any page load (including hard refresh)
- Theme toggle changes mode within 16ms (single frame)
- Lighthouse accessibility score ≥ 95 with either theme
- All color contrast ratios meet WCAG 2.1 AA in both modes
- Font files load with swap display, no layout shift from font loading

---

### 3.2 Role-Based Route Group Layouts

**User Flow:**
1. Authenticated user's session is read server-side in the route group layout.
2. Based on user role from session, the appropriate layout renders (sidebar + header + content area).
3. If user role does not match the route group (e.g., Student accessing `/(employer)`), redirect to their correct dashboard.
4. Unauthenticated users hitting protected route groups are redirected to `/(auth)/login`.

**UI Layout & Components:**
- `/(student)/layout.tsx` — Student sidebar config, cyan accent highlights
- `/(employer)/layout.tsx` — Employer sidebar config, employer-specific nav items
- `/(university)/layout.tsx` — University Admin sidebar config
- `/(provider)/layout.tsx` — Program Provider sidebar config
- `/(admin)/layout.tsx` — Platform Admin sidebar config, red accent for destructive actions
- `/(auth)/layout.tsx` — Centered card layout, no sidebar, decorative background pattern
- `/(public)/layout.tsx` — Marketing-style layout, public header with CTA buttons, footer

Each protected layout renders:
```
┌─────────────────────────────────────────┐
│ Header (64px)                           │
├──────────┬──────────────────────────────┤
│ Sidebar  │ Main Content Area            │
│ (280px)  │ - Breadcrumbs               │
│          │ - Page Content (children)    │
│          │                              │
│          │                              │
├──────────┴──────────────────────────────┤
│ Bottom Tab Bar (mobile only, 56px)      │
└─────────────────────────────────────────┘
```

**Business Rules:**
- Route group layouts are Server Components that read session via `createServerComponentClient` from Supabase
- Role is extracted from `user_metadata.role` or a custom claim in JWT
- Each route group has exactly one layout file that composes Sidebar, Header, and content slot
- The main content area has `overflow-y: auto` and the sidebar/header remain fixed
- Content area has consistent padding: `p-6` on desktop, `p-4` on tablet, `p-4 pb-20` on mobile (accounting for bottom bar)
- Auth layout uses a split design: left panel with brand illustration (desktop only), right panel with auth form

**State Machine:**
- Route resolution: URL path → Next.js route group → layout.tsx → session check → render or redirect
- Redirect targets: Unauthenticated → `/login`, Wrong role → `/${correctRole}/dashboard`

**Edge Cases:**
- Session expired mid-navigation: Middleware catches and redirects to login with `returnTo` param
- User with multiple roles: Primary role determines route group; secondary roles accessible via role switcher (future feature, shell provides the UI slot)
- Layout hydration mismatch: All role determination happens server-side to prevent mismatch
- Parallel routes: Shell supports parallel route slots for modals (`@modal` slot in layouts)

**Acceptance Criteria:**
- Correct layout renders for each role without client-side flash
- Unauthorized access redirects within 100ms (server-side redirect)
- Layout shift score = 0 (CLS) on navigation between pages within same route group
- Each layout passes lighthouse performance ≥ 90
- Mobile layout correctly hides sidebar and shows bottom tab bar

---

### 3.3 Responsive Sidebar Navigation

**User Flow:**
1. **Desktop (≥1024px):** Sidebar is always visible at 280px width, expanded with icon + label + optional badge count.
2. **Tablet (768-1023px):** Sidebar is collapsed to 64px showing only icons with tooltips on hover.
3. **Mobile (<768px):** Sidebar is hidden; hamburger icon in header opens it as a full-height overlay from the left with backdrop.
4. User clicks a navigation item → navigates to that route → sidebar highlights the active item.
5. Navigation items may have nested children (expandable sections with chevron indicator).
6. User clicks outside mobile sidebar overlay or presses Escape → sidebar closes.

**UI Layout & Components:**
- `Sidebar` — Main wrapper, handles responsive states
- `SidebarHeader` — Logo area (48px height within sidebar)
- `SidebarNav` — Scrollable navigation list
- `SidebarNavItem` — Individual navigation link with icon, label, badge, active state
- `SidebarNavGroup` — Collapsible group with heading and nested items
- `SidebarFooter` — User profile mini-card (avatar, name, role label) with logout button
- `SidebarOverlay` — Dark translucent backdrop for mobile (opacity 0.5, black)
- `SidebarToggle` — Hamburger button in header for mobile, collapse/expand for tablet

Component structure:
```tsx
<aside className="sidebar">
  <SidebarHeader>
    <Logo variant={isCollapsed ? 'monogram' : 'wordmark'} />
  </SidebarHeader>
  <SidebarNav>
    {navigationItems.map(item => (
      <SidebarNavItem key={item.href} {...item} />
      // or <SidebarNavGroup> for grouped items
    ))}
  </SidebarNav>
  <SidebarFooter>
    <UserMiniProfile />
  </SidebarFooter>
</aside>
```

**Business Rules:**
- Navigation items are defined in `src/lib/config/navigation.ts` and filtered by role
- Each nav item has: `id`, `label`, `href`, `icon` (Lucide icon name), `badge?` (number), `children?` (sub-items), `roles` (which roles see it)
- Active state is determined by comparing current pathname with item href using `startsWith` for nested routes
- Exactly one item can be active at a time (deepest match wins)
- Collapsed sidebar shows tooltip (shadcn Tooltip) with label on icon hover (200ms delay)
- Mobile overlay animates with `transform: translateX` (300ms ease-in-out)
- Sidebar state (expanded/collapsed for tablet) persists in localStorage key `gx-sidebar-state`
- Keyboard navigation: Tab through items, Enter/Space to activate, Escape to close mobile overlay
- Badge counts update in real-time via Supabase Realtime subscription (e.g., unread messages count)

**Navigation Configuration Structure:**
```typescript
type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIconName;
  badge?: number;
  roles: UserRole[];
  children?: NavItem[];
  isNew?: boolean; // shows "NEW" pill badge
};
```

**Role-specific navigation items:**

Student: Dashboard, Programs (Browse, My Applications, Saved), Learning (Courses, Certifications, Portfolio), Career (Job Board, My Applications, Interview Prep), Community (Forums, Mentors, Events), Profile, Settings

Employer: Dashboard, Talent Pool (Search, Saved Candidates, Pipelines), Job Postings (Active, Drafts, Archived), Programs (Partner Programs, Assessments), Analytics (Hiring Metrics, Diversity), Company Profile, Settings

University Admin: Dashboard, Students (Directory, Cohorts, Progress), Programs (Manage, Applications, Partners), Analytics (Outcomes, Engagement), Faculty, Settings

Program Provider: Dashboard, Programs (My Programs, Applications, Content), Participants (Active, Alumni), Analytics (Enrollment, Feedback), Billing, Settings

Platform Admin: Dashboard, Users (All Users, Roles, Permissions), Programs (All Programs, Approval Queue), Content (CMS, Templates), Analytics (Platform Metrics, Revenue), System (Configuration, Integrations, Logs), Billing

**State Machine:**
- States: `expanded` | `collapsed` | `hidden` | `overlay-open`
- Transitions:
  - Desktop resize → `expanded`
  - Tablet resize → `collapsed`
  - Mobile resize → `hidden`
  - Hamburger click (mobile) → `overlay-open`
  - Backdrop click / Escape / nav item click (mobile) → `hidden`
  - Toggle button (tablet) → `collapsed` ↔ `expanded`

**Edge Cases:**
- Window resize while mobile overlay is open: Close overlay, apply new responsive state
- Navigation during route transition: Show loading indicator on clicked item (subtle opacity pulse)
- Very long navigation labels: Truncate with ellipsis at item width, full label in tooltip
- Deep nesting (3+ levels): Not supported; max 2 levels (group → items)
- Right-to-left (RTL) languages: Sidebar flips to right side (future, but CSS should use logical properties `inset-inline-start`)
- Screen readers: Sidebar is `<nav aria-label="Main navigation">`, items use `aria-current="page"` for active

**Acceptance Criteria:**
- Sidebar renders correct items for each role (verified by role-specific test)
- Active item highlight matches current route on initial load and after navigation
- Mobile overlay opens/closes with smooth animation (no jank, 60fps)
- Collapsed tooltip appears within 200ms of hover, disappears immediately on mouse leave
- All navigation items are keyboard-accessible (Tab, Enter, Escape)
- Sidebar width transition on tablet toggle is 200ms with no layout jump in content area
- Badge counts update within 2 seconds of server-side change

---

### 3.4 Header Chrome

**User Flow:**
1. Header is always visible at the top of the page (64px height, sticky).
2. Left section shows: Hamburger menu (mobile only), Greeting text ("Good morning, {firstName}"), or breadcrumb on non-dashboard pages.
3. Center/right section shows: Search trigger button, Notification bell with badge, GX Score pill (students only), User avatar with dropdown.
4. User clicks notification bell → navigates to notifications page (owned by notifications module).
5. User clicks avatar → dropdown menu appears with: Profile, Settings, Theme toggle, Logout.
6. User clicks search → opens command palette (owned by search module, shell only provides trigger button).

**UI Layout & Components:**
- `Header` — Fixed top bar, full width of content area (not overlapping sidebar)
- `HeaderGreeting` — Dynamic greeting based on time of day + user first name
- `HeaderBreadcrumb` — Shows on non-dashboard pages (see 3.6)
- `SearchTrigger` — Button with search icon + "Search..." text + keyboard shortcut hint (⌘K)
- `NotificationBell` — Bell icon with red dot/count badge
- `GXScoreBadge` — Pill showing score number with small chart icon
- `UserAvatarMenu` — Avatar button that opens dropdown menu
- `HeaderMobileMenu` — Hamburger button (mobile only, triggers sidebar overlay)

Header layout:
```
┌──────────────────────────────────────────────────────────────┐
│ [☰] Good morning, Alex          [🔍 Search... ⌘K] [🔔3] [👤]│
└──────────────────────────────────────────────────────────────┘
```

**Business Rules:**
- Greeting changes by time: "Good morning" (5-12), "Good afternoon" (12-17), "Good evening" (17-21), "Good night" (21-5)
- Greeting uses user's first name from session; falls back to "there" if no name
- GX Score badge only displays for Student role; sourced from user profile data
- Notification badge count comes from Supabase Realtime channel `notifications:{userId}`
- Avatar dropdown items: "View Profile" (→ /profile), "Settings" (→ /settings), "Theme" (sub-menu: Light/Dark/System), "Sign out" (triggers logout)
- Search trigger emits a global event or sets Zustand state to open command palette (implemented by search module)
- Header background: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm` with subtle bottom border
- On scroll, header gains a shadow (`shadow-sm`) for depth perception

**State Machine:**
- NotificationBell: `idle` | `has-unread` (shows badge)
- UserAvatarMenu: `closed` | `open`
- Header shadow: `flat` (at top) | `elevated` (scrolled > 0)

**Edge Cases:**
- User has no avatar image: Show initials in colored circle (color derived from `hashCode(fullName) % colorPalette.length`)
- Notification count > 99: Display "99+"
- Notification count = 0: Hide badge entirely (no dot)
- Very long user name in greeting: Truncate with ellipsis (max-width constraint)
- Network disconnection: Notification badge shows last known count, no error shown in header
- Multiple tabs: Notification count syncs across tabs via Supabase Realtime

**Acceptance Criteria:**
- Header renders in under 50ms after layout mount
- Notification badge updates within 2 seconds of new notification
- Avatar dropdown opens within 100ms of click
- Search trigger responds to both click and ⌘K/Ctrl+K keyboard shortcut
- Header remains fixed during content scroll with no z-index conflicts
- Greeting time calculation uses client timezone (client component for this piece)
- Backdrop blur renders correctly in all supported browsers (Safari, Chrome, Firefox, Edge)

---

### 3.5 Mobile Bottom Tab Bar

**User Flow:**
1. On mobile viewports (<768px), a bottom tab bar appears fixed to the bottom of the screen.
2. Tab bar shows 4-5 most important navigation items for the current role (subset of sidebar items).
3. Active tab is highlighted with cyan color and filled icon variant.
4. Tapping a tab navigates to that section.
5. The "More" tab (if present) opens the full sidebar overlay.

**UI Layout & Components:**
- `BottomTabBar` — Fixed bottom container, 56px height, white/dark background with top border
- `BottomTabItem` — Individual tab with icon (24px) and label (10px text)
- Layout: Evenly spaced items across full width with safe-area-inset-bottom padding for notched devices

```
┌────────────────────────────────────────┐
│  🏠    📋    💼    👥    ⋯           │
│ Home  Programs Career Community More   │
└────────────────────────────────────────┘
```

**Business Rules:**
- Maximum 5 tabs displayed; if role has more than 5 primary sections, last tab is "More" (opens sidebar)
- Tab items per role:
  - Student: Home, Programs, Career, Community, More
  - Employer: Home, Talent, Jobs, Analytics, More
  - University: Home, Students, Programs, Analytics, More
  - Provider: Home, Programs, Participants, Analytics, More
  - Admin: Home, Users, Programs, System, More
- Active tab determined by current route prefix matching
- Tab bar hidden when keyboard is open on mobile (detected via viewport height change)
- Safe area insets respected for iPhone notch/home indicator: `pb-[env(safe-area-inset-bottom)]`
- Tab bar animates in from bottom on initial page load (200ms slide-up)
- Haptic feedback on tab press (if supported via navigator.vibrate)

**State Machine:**
- States: `visible` | `hidden` (keyboard open or non-mobile viewport)
- Active tab: Determined by `pathname.startsWith(tab.href)`

**Edge Cases:**
- Landscape mobile orientation: Tab bar still shows but with reduced label size
- iOS Safari bouncy scroll: Tab bar remains fixed, does not bounce
- Android back button: Does not interfere with tab navigation
- Notched devices (iPhone X+): Content does not render behind home indicator
- Rapid tab switching: Debounce not needed (Next.js handles navigation)
- Tab bar on auth/public pages: Not rendered (only in protected route group layouts)

**Acceptance Criteria:**
- Tab bar only renders on viewports < 768px
- Active state updates immediately on navigation (no flicker)
- Tab bar does not obscure content (content area has bottom padding to account for bar height)
- Touch targets meet minimum 44x44px accessibility requirement
- Tab bar respects safe-area-inset-bottom on all iOS devices
- Animation is smooth (60fps) on initial mount

---

### 3.6 Breadcrumb Navigation

**User Flow:**
1. On non-dashboard pages, breadcrumbs appear below the header (within the content area) showing the navigation path.
2. Each segment is a clickable link except the last (current page).
3. On mobile, only the immediate parent + current page are shown (collapsed breadcrumb).
4. Breadcrumbs auto-generate from the URL path segments with human-readable labels.

**UI Layout & Components:**
- `Breadcrumbs` — Horizontal list of breadcrumb items with separators
- `BreadcrumbItem` — Link or span with text label
- `BreadcrumbSeparator` — Lucide ChevronRight icon (16px)
- `BreadcrumbCollapsed` — Ellipsis button for mobile that expands to show all segments

```
Home > Programs > Browse > Program Detail
(mobile: ... > Browse > Program Detail)
```

**Business Rules:**
- Dashboard pages (e.g., `/(student)/dashboard`) do not show breadcrumbs
- Path segments are converted to human-readable labels via a mapping in `src/lib/config/breadcrumbs.ts`
- Dynamic segments (e.g., `[id]`) show the entity name (fetched from page-level metadata or a context)
- Maximum depth: 5 levels; beyond that, middle segments are collapsed
- Breadcrumb labels: Title case, max 30 characters, truncated with ellipsis
- Structured data: Breadcrumbs emit `BreadcrumbList` JSON-LD for SEO
- The shell provides the Breadcrumb component; individual pages provide their breadcrumb data via a `generateBreadcrumbs` function or metadata

**State Machine:**
- Breadcrumb data derived from: URL segments + optional page-provided overrides
- Collapsed state (mobile): `collapsed` (shows ellipsis) | `expanded` (shows all, triggered by click)

**Edge Cases:**
- Page with no matching breadcrumb label: Use URL segment with dashes replaced by spaces, title-cased
- Very long breadcrumb trail on mobile: Show only last 2 items with ellipsis for rest
- Dynamic route with slow data fetch: Show URL segment as fallback until entity name loads
- Home/root segment: Always "Home" pointing to role dashboard
- Parallel routes or intercepted routes: Breadcrumb shows the apparent path, not internal routing path

**Acceptance Criteria:**
- Breadcrumbs render correctly for all tested URL patterns
- Last item is not a link (aria-current="page")
- Mobile collapsed view shows maximum 2 visible items + ellipsis
- JSON-LD structured data is valid per Google's Rich Results Test
- Clicking a breadcrumb navigates correctly without full page reload
- Breadcrumb does not render on dashboard pages

---

### 3.7 Global CSS & Tailwind Configuration

**User Flow:**
Not user-facing directly, but all components rely on the global styling system.

**UI Layout & Components:**
- `globals.css` — Tailwind directives, CSS custom properties for light/dark themes, base resets, scrollbar styling, selection colors, focus ring styles
- `tailwind.config.ts` — Extended theme with brand colors, fonts, breakpoints, animations, and shadcn/ui preset

**Business Rules:**
- CSS custom properties define all color tokens used by shadcn/ui components:
  - `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`
  - `--primary` (navy #0F172A), `--primary-foreground` (white)
  - `--secondary`, `--secondary-foreground`
  - `--muted`, `--muted-foreground`
  - `--accent` (cyan #06B6D4), `--accent-foreground`
  - `--destructive` (#EF4444), `--destructive-foreground`
  - `--border`, `--input`, `--ring`
  - `--radius` (0.5rem default)
- Custom animations defined: `fade-in`, `slide-in-left`, `slide-in-right`, `slide-up`, `scale-in`, `pulse-subtle`
- Scrollbar styling: Thin (8px), thumb matches `--muted`, track transparent
- Selection color: Cyan/navy combination
- Focus-visible ring: 2px offset, cyan color, all interactive elements
- Smooth scroll behavior on `html` element, `prefers-reduced-motion` respected
- Font stacks: `--font-heading: 'Satoshi', sans-serif`, `--font-body: 'Inter', sans-serif`

**Tailwind Extensions:**
```typescript
colors: {
  navy: { 50: '...', ..., 900: '#0F172A', 950: '#020617' },
  cyan: { 50: '...', ..., 500: '#06B6D4', ..., 950: '...' },
  brand: { primary: 'hsl(var(--primary))', accent: 'hsl(var(--accent))' }
},
fontFamily: {
  heading: ['var(--font-heading)', 'sans-serif'],
  body: ['var(--font-body)', 'sans-serif'],
},
screens: {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
  ultrawide: '1536px',
}
```

**Edge Cases:**
- High contrast mode: CSS custom properties adapt via `@media (prefers-contrast: high)`
- Print styles: Hide sidebar, header, bottom bar; content fills page
- Reduced motion: All transitions/animations replaced with instant changes
- RTL: Logical properties used where applicable (`ms-`, `me-`, `ps-`, `pe-`)

**Acceptance Criteria:**
- All shadcn/ui components render correctly with custom theme tokens
- No Tailwind class conflicts or specificity issues
- Bundle size of globals.css < 15KB gzipped
- All animations respect `prefers-reduced-motion`
- Custom properties switch correctly between light/dark without flash
- Print stylesheet produces readable output

---

## 4. Data Models

The app_shell module does not own any database tables. It reads from the following entities (defined in shared_contracts.md or by other modules):

**Session/User data consumed (read-only from Supabase Auth):**

| Field | Type | Usage in Shell |
|-------|------|---------------|
| `id` | `uuid` | Realtime channel subscription key |
| `email` | `string` | Avatar fallback, dropdown display |
| `user_metadata.first_name` | `string` | Header greeting |
| `user_metadata.last_name` | `string` | Avatar initials |
| `user_metadata.role` | `UserRole` | Route group selection, nav filtering |
| `user_metadata.avatar_url` | `string \| null` | Avatar image |
| `user_metadata.gx_score` | `number \| null` | GX Score badge (students) |

**UserRole Enum (reference shared_contracts.md):**
```typescript
enum UserRole {
  STUDENT = 'student',
  EMPLOYER = 'employer',
  UNIVERSITY_ADMIN = 'university_admin',
  PROGRAM_PROVIDER = 'program_provider',
  PLATFORM_ADMIN = 'platform_admin',
}
```

**NavigationItem (local config type, not DB entity):**
```typescript
type NavigationItem = {
  id: string;                    // unique identifier, e.g., 'student-dashboard'
  label: string;                 // display text, e.g., 'Dashboard'
  href: string;                  // route path, e.g., '/dashboard'
  icon: string;                  // Lucide icon name, e.g., 'LayoutDashboard'
  roles: UserRole[];             // which roles see this item
  badge?: number;                // dynamic count badge
  children?: NavigationItem[];   // nested sub-navigation
  isNew?: boolean;               // shows "NEW" indicator
  external?: boolean;            // opens in new tab
  disabled?: boolean;            // grayed out, not clickable
  matchExact?: boolean;          // active only on exact match (default: startsWith)
};
```

**BottomTabItem (local config type):**
```typescript
type BottomTabItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  activeIcon: string;            // filled variant when active
  roles: UserRole[];
};
```

**BreadcrumbSegment (local type):**
```typescript
type BreadcrumbSegment = {
  label: string;
  href: string;
  isCurrent: boolean;
};
```

**ThemePreference (local type):**
```typescript
type ThemePreference = 'light' | 'dark' | 'system';
```

**NotificationBadgeState (Zustand store slice):**
```typescript
type NotificationBadgeState = {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
};
```

**SidebarState (Zustand store slice):**
```typescript
type SidebarState = {
  isOpen: boolean;           // mobile overlay open
  isCollapsed: boolean;      // tablet collapsed state
  toggle: () => void;
  open: () => void;
  close: () => void;
  setCollapsed: (collapsed: boolean) => void;
};
```

## 5. API Contracts

The app_shell module makes no direct API calls to backend endpoints. It consumes data through:

### 5.1 Supabase Auth Session (Server-Side)

**Method:** `createServerComponentClient` from `@supabase/auth-helpers-nextjs`

**Usage in Layout:**
```typescript
const supabase = createServerComponentClient({ cookies });
const { data: { session } } = await supabase.auth.getSession();
```

**Response Shape:**
```typescript
{
  session: {
    user: {
      id: string;
      email: string;
      user_metadata: {
        first_name: string;
        last_name: string;
        role: UserRole;
        avatar_url: string | null;
        gx_score: number | null;
      };
    };
    access_token: string;
    expires_at: number;
  } | null;
}
```

**Failure Handling:** If session is null in protected layouts, redirect to `/(auth)/login?returnTo={currentPath}`.

### 5.2 Supabase Realtime Subscription (Client-Side)

**Channel:** `notifications:{userId}`

**Event:** `broadcast` with event name `badge_update`

**Payload:**
```typescript
{
  event: 'badge_update';
  payload: {
    unread_count: number;
  };
}
```

**Subscribe Pattern:**
```typescript
const channel = supabase
  .channel(`notifications:${userId}`)
  .on('broadcast', { event: 'badge_update' }, (payload) => {
    setUnreadCount(payload.payload.unread_count);
  })
  .subscribe();
```

**Failure Handling:** On subscription error, log warning, display last known count, retry with exponential backoff (1s, 2s, 4s, max 30s).

### 5.3 Initial Notification Count (Server-Side)

**Endpoint consumed:** `GET /api/notifications/unread-count`

**Response:**
```typescript
{
  success: true;
  data: {
    count: number;
  };
  error: null;
  meta: null;
}
```

**Failure Handling:** On error, default to 0 unread count, no visual error displayed in header.

## 6. Module Dependencies

| Dependency | What's Needed | How It's Used | Failure Handling |
|-----------|--------------|---------------|------------------|
| `next` (14+) | App Router, `next/font`, `next/image`, `next/navigation` | Route layouts, font loading, optimized avatar images, programmatic navigation | Build-time failure; app won't compile |
| `next-themes` | Theme provider, `useTheme` hook | Dark/light mode toggling and persistence | Falls back to light mode if package fails |
| `@supabase/auth-helpers-nextjs` | Server/client Supabase clients | Session reading in layouts, Realtime subscriptions | Redirect to login on auth failure |
| `@supabase/supabase-js` | Realtime client | Notification badge count subscription | Retry with backoff; show stale count |
| `zustand` | State management | Sidebar open/collapsed state, notification count | App still renders; state defaults to initial values |
| `lucide-react` | Icon components | All navigation icons, header icons | Missing icon renders empty span; logged in dev |
| `tailwindcss` | Utility CSS framework | All styling | Build-time failure |
| `shadcn/ui` components | Button, DropdownMenu, Tooltip, Avatar, Sheet, Separator, Badge | Header dropdown, sidebar tooltips, mobile sheet overlay, user avatar | Individual component failure contained |
| `class-variance-authority` | Component variant management | Sidebar item active/inactive/disabled variants | Falls back to base styles |
| `clsx` + `tailwind-merge` | Conditional class merging | Dynamic class application throughout shell | Styles may conflict; non-critical |

## 7. Non-Functional Requirements

### Performance Targets
- **First Contentful Paint (FCP):** < 1.2s on 4G connection
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** 0 (no layout shifts from shell components)
- **First Input Delay (FID):** < 100ms
- **Time to Interactive (TTI):** < 3.5s
- **Shell JS bundle size:** < 45KB gzipped (shell-specific client components)
- **CSS bundle size:** < 15KB gzipped (globals.css + component styles)

### Caching Strategy
- **Layout components:** Cached at build time (static where possible)
- **Session check:** Cached per-request (no `cache: 'force-cache'`; always validate session)
- **Navigation config:** Static import, no runtime fetch; tree-shaken per role
- **Font files:** Immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`)
- **Theme preference:** localStorage (instant access, no network)
- **Sidebar collapsed state:** localStorage (persists across sessions)

### Rate Limiting
- Not applicable (shell makes no direct API calls beyond auth check)
- Realtime subscription: Single connection per authenticated session

### Concurrency
- Multiple tabs: Sidebar state is per-tab (not synced); theme and notification count sync via storage events / Realtime
- Parallel navigation: Next.js handles; shell does not add concurrent navigation guards

### Accessibility
- WCAG 2.1 AA compliance minimum
- All interactive elements have focus indicators (2px cyan ring)
- Sidebar: `<nav aria-label="Main navigation">`
- Header: `<header role="banner">`
- Bottom tabs: `<nav aria-label="Quick navigation">`
- Skip-to-content link: Hidden link at top of page, visible on focus, targets `<main id="main-content">`
- Reduced motion: All animations have `@media (prefers-reduced-motion: reduce)` fallback
- Screen reader: Notification count announced as `aria-label="${count} unread notifications"`
- Color contrast: All text meets 4.5:1 ratio minimum

### Data Retention
- Theme preference: Indefinite (localStorage)
- Sidebar state: Indefinite (localStorage)
- Session: Managed by Supabase Auth (refresh token expiry configured in Supabase dashboard)
- No PII stored by shell module directly

### Browser Support
- Chrome 90+, Firefox 88+, Safari 15+, Edge 90+
- iOS Safari 15+, Chrome for Android 90+
- No IE11 support

## 8. Key Implementation Notes

1. **Server Component Boundary Strategy:** Route group layouts (`layout.tsx`) are Server Components that read the session and pass user data as props to a thin Client Component wrapper (`ShellClientLayout`) that manages sidebar state and Realtime subscriptions. This minimizes client bundle while enabling interactivity.

2. **Font Loading with next/font:** Satoshi is loaded via `next/font/local` (self-hosted woff2 files in `/public/fonts/`), Inter via `next/font/google`. Both are assigned to CSS variables (`--font-heading`, `--font-body`) on `<body>` and referenced in `tailwind.config.ts` via `fontFamily` extend. This ensures zero-CLS font loading.

3. **Sidebar Animation on Mobile:** Use shadcn/ui `Sheet` component (which wraps Radix Dialog) for mobile sidebar overlay rather than custom animation. This provides free accessibility (focus trap, Escape key, aria attributes) and smooth animations via CSS transforms with `will-change: transform`.

4. **Notification Badge Realtime Pattern:** The `NotificationBadgeProvider` (client component) subscribes to Realtime on mount, stores count in Zustand, and unsubscribes on unmount. Initial count is passed as a prop from the server layout (fetched during SSR). This avoids a loading flash for the badge on initial render.

5. **Breadcrumb Generation from Pathname:** Use a `useBreadcrumbs` hook that reads `usePathname()` and splits segments. A static map (`breadcrumbLabels`) maps path segments to human-readable labels. For dynamic `[id]` segments, the page can provide an override via React context (`BreadcrumbContext`) populated by page-level server components.

6. **CSS Custom Properties Architecture:** All colors in `globals.css` are defined as HSL values without the `hsl()` wrapper (e.g., `--primary: 222 47% 11%`), allowing Tailwind's opacity modifier syntax to work (e.g., `bg-primary/50`). This is the shadcn/ui convention and must be maintained precisely.

7. **Middleware for Route Protection:** While the shell layouts do session checks, a Next.js middleware (`middleware.ts`) at the root provides a first line of defense: it checks for auth cookies on protected route groups and redirects to login if absent. This prevents the layout from rendering at all for unauthenticated users, reducing unnecessary server work.

8. **Responsive Detection Strategy:** Use a `useMediaQuery` hook (with SSR-safe initial value) for responsive logic in client components. The sidebar and bottom tab bar use this hook rather than CSS-only hiding to avoid rendering unnecessary DOM nodes. Server components render all variants; hydration picks the correct one based on initial viewport.

9. **Skip Navigation Link:** A visually-hidden-until-focused `<a href="#main-content">Skip to main content</a>` is the first focusable element in the DOM. The main content area has `<main id="main-content" tabIndex={-1}>` to receive focus programmatically after skip-link activation.

10. **Error Boundary at Shell Level:** A React Error Boundary wraps the children slot in each layout. If a feature module crashes, the shell remains intact and displays a fallback UI ("Something went wrong" with retry button) without losing navigation ability.

## 9. File Map

```
src/
├── app/
│   ├── layout.tsx                          # Root layout: HTML, fonts, ThemeProvider, Toaster
│   ├── globals.css                         # Tailwind directives, CSS custom properties, base styles
│   ├── not-found.tsx                       # Global 404 page
│   ├── error.tsx                           # Global error boundary page
│   ├── loading.tsx                         # Global loading skeleton
│   ├── middleware.ts                       # Route protection, session validation, redirects
│   ├── (auth)/
│   │   └── layout.tsx                      # Auth pages layout: centered card, no sidebar
│   ├── (public)/
│   │   └── layout.tsx                      # Public pages layout: public header, footer
│   ├── (student)/
│   │   └── layout.tsx                      # Student route group layout
│   ├── (employer)/
│   │   └── layout.tsx                      # Employer route group layout
│   ├── (university)/
│   │   └── layout.tsx                      # University Admin route group layout
│   ├── (provider)/
│   │   └── layout.tsx                      # Program Provider route group layout
│   └── (admin)/
│       └── layout.tsx                      # Platform Admin route group layout
├── components/
│   ├── shell/
│   │   ├── ShellClientLayout.tsx           # Client wrapper: sidebar state, Realtime, responsive logic
│   │   ├── Sidebar.tsx                     # Main sidebar component (server-renderable structure)
│   │   ├── SidebarHeader.tsx               # Logo section of sidebar
│   │   ├── SidebarNav.tsx                  # Navigation list wrapper
│   │   ├── SidebarNavItem.tsx              # Individual nav item (link, icon, label, badge)
│   │   ├── SidebarNavGroup.tsx             # Collapsible group of nav items
│   │   ├── SidebarFooter.tsx              # User mini-profile and logout in sidebar
│   │   ├── SidebarMobileOverlay.tsx        # Mobile sheet/overlay for sidebar
│   │   ├── Header.tsx                      # Main header bar component
│   │   ├── HeaderGreeting.tsx              # Time-based greeting (client component)
│   │   ├── SearchTrigger.tsx               # Search button in header
│   │   ├── NotificationBell.tsx            # Bell icon with badge count (client component)
│   │   ├── GXScoreBadge.tsx               # Score pill badge for students
│   │   ├── UserAvatarMenu.tsx              # Avatar with dropdown menu (client component)
│   │   ├── BottomTabBar.tsx                # Mobile bottom navigation tabs
│   │   ├── BottomTabItem.tsx               # Individual bottom tab
│   │   ├── Breadcrumbs.tsx                 # Breadcrumb trail component
│   │   ├── BreadcrumbItem.tsx              # Individual breadcrumb segment
│   │   ├── SkipToContent.tsx               # Accessibility skip link
│   │   ├── ThemeToggle.tsx                 # Theme switch button/menu
│   │   ├── Logo.tsx                        # Logo component (wordmark and monogram variants)
│   │   ├── ShellErrorBoundary.tsx          # Error boundary for content area
│   │   └── ShellLoadingSkeleton.tsx        # Loading skeleton for content transitions
│   └── ui/                                 # shadcn/ui component directory (shared)
│       ├── button.tsx
│       ├── dropdown-menu.tsx
│       ├── tooltip.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── sheet.tsx
│       ├── separator.tsx
│       └── skeleton.tsx
├── lib/
│   ├── config/
│   │   ├── navigation.ts                  # All navigation items by role
│   │   ├── bottom-tabs.ts                 # Bottom tab bar items by role
│   │   └── breadcrumbs.ts                 # Breadcrumb label mappings
│   ├── stores/
│   │   ├── sidebar-store.ts               # Zustand store: sidebar open/collapsed state
│   │   └── notification-store.ts          # Zustand store: notification badge count
│   ├── hooks/
│   │   ├── use-media-query.ts             # Responsive breakpoint hook
│   │   ├── use-breadcrumbs.ts             # Breadcrumb generation from pathname
│   │   ├── use-active-nav.ts             # Determine active navigation item
│   │   ├── use-scroll-position.ts         # Header shadow on scroll
│   │   └── use-notification-realtime.ts   # Supabase Realtime subscription for notifications
│   ├── contexts/
│   │   ├── breadcrumb-context.tsx          # Context for page-level breadcrumb overrides
│   │   └── shell-context.tsx              # Context providing user data to shell client components
│   ├── utils/
│   │   ├── cn.ts                           # clsx + tailwind-merge utility
│   │   ├── get-initials.ts               # Extract initials from name for avatar fallback
│   │   ├── get-greeting.ts               # Time-based greeting text
│   │   └── hash-color.ts                 # Deterministic color from string for avatar backgrounds
│   └── supabase/
│       ├── server.ts                       # Server-side Supabase client factory
│       └── client.ts                       # Client-side Supabase client factory
├── public/
│   └── fonts/
│       ├── Satoshi-Variable.woff2         # Satoshi variable font file
│       ├── Satoshi-Bold.woff2             # Satoshi bold fallback
│       └── Satoshi-Medium.woff2           # Satoshi medium fallback
├── tailwind.config.ts                      # Extended Tailwind configuration
├── postcss.config.js                       # PostCSS config with Tailwind plugin
└── next.config.js                          # Next.js configuration (font domains, headers)
```