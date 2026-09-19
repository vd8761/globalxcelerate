# Module Spec: Student Dashboard

## 1. Overview & Purpose

The Student Dashboard module provides a personalized command center for authenticated students at the route `/(student)/dashboard`. It aggregates and displays key data points including recommended opportunities based on AI matching, application status tracking, upcoming deadlines, profile completion progress, GX Score visualization, skill improvement suggestions, saved opportunities, and quick action shortcuts. The dashboard serves as the primary landing page after login/onboarding completion, giving students an at-a-glance view of their platform engagement and actionable next steps.

- **Who uses it**: Student role exclusively (role guard enforced)
- **Key screens**: `/(student)/dashboard` — single page with multiple widget sections
- **Data flow**: Consumes data from the aggregated `/api/students/dashboard` endpoint which pulls from `opportunities`, `applications`, `student_profiles`, `saved_opportunities`, `notifications`, `gx_scores`, and `student_skills` tables. Receives real-time notification count updates via Supabase Realtime subscriptions. Sends save/unsave actions to the Opportunity Marketplace module's endpoints.
- **Scope boundaries**: This module does NOT handle opportunity detail viewing (Marketplace module), application submission flows (Marketplace module), profile editing (Onboarding/Profile module), notification detail pages (Notifications module), or GX Score calculation logic (Scoring module). It only renders pre-computed data in widget format.

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

Module-specific UI overrides and considerations:

- **Widget cards**: Use `bg-white dark:bg-navy-900` with `border border-navy-100 dark:border-navy-800` and `rounded-xl shadow-sm` for each dashboard widget container
- **GX Score radial gauge**: Navy-900 track background, Cyan-500 fill arc, score number in `font-bold text-3xl text-navy-900 dark:text-white` centered inside
- **Profile completion ring**: Uses segmented circular progress with Cyan-500 for completed percentage and Navy-100 for remaining
- **Match score badges on opportunity cards**: Green-500 for 80%+, Yellow-500 for 60-79%, Orange-500 for 40-59%, Red-400 for below 40%
- **Greeting banner area**: Subtle gradient from `navy-50` to `white` (light mode) or `navy-950` to `navy-900` (dark mode)
- **Quick action buttons**: Primary CTA uses `bg-cyan-500 hover:bg-cyan-600 text-white`, secondary uses `border-cyan-500 text-cyan-500 hover:bg-cyan-50`
- **Deadline urgency indicators**: Red-500 pulse dot for deadlines within 3 days, Orange-500 for within 7 days, Navy-300 for beyond 7 days
- **Horizontal scroll cards**: Show partial next card (peek effect) with 16px gap, smooth scroll behavior, hide scrollbar with CSS

## 3. Features & Functional Requirements

### 3.1 Top Bar — Greeting & Navigation Strip

**User Flow:**
1. Student lands on dashboard after login or navigation
2. Top bar displays personalized greeting based on time of day
3. Student sees notification bell with unread count badge
4. Student sees their profile avatar (or initials fallback)
5. Student sees their GX Score badge inline

**UI Layout & Components:**
- Full-width horizontal bar at the top of dashboard content area (below app shell nav)
- Left section: Greeting text (`text-2xl font-semibold text-navy-900`)
- Right section: Horizontal flex with gap-4 containing notification bell icon button, GX score badge pill, and profile avatar
- Greeting format: "Good {morning|afternoon|evening}, {firstName}! 👋"
- Notification bell: `Bell` icon from lucide-react, size 20px, relative positioned with absolute badge
- Badge: Red-500 circle with white text, min-width 18px, font-size 11px, shows count (max "99+")
- GX Score badge: Pill shape `bg-cyan-50 border border-cyan-200 text-cyan-700 font-semibold text-sm px-3 py-1` showing "GX: {score}"
- Avatar: 36px circle, `Image` component with fallback to initials in `bg-navy-100 text-navy-700`

**Business Rules:**
- Time-of-day greeting: morning = 5:00-11:59, afternoon = 12:00-16:59, evening = 17:00-4:59 (based on client local time)
- Notification count is real-time via Supabase Realtime subscription on `notifications` table filtered by `student_id` and `read = false`
- GX Score displays the most recent calculated score from `gx_scores` table
- If student has no GX Score yet (pre-calculation), show "GX: --"
- Avatar uses student's `profile_photo_url` from `student_profiles`

**State Machine:**
- Notification count: `idle` → `subscribed` → `updated` (on realtime event) → `error` (on disconnect, auto-retry)
- Avatar image: `loading` → `loaded` | `fallback`

**Edge Cases:**
- Student with no first name: Use "there" as fallback ("Good morning, there!")
- Notification count of 0: Hide badge entirely (not show "0")
- Realtime connection failure: Show last known count, attempt reconnect every 30 seconds
- Very long first name (>20 chars): Truncate with ellipsis on mobile
- Profile photo 404: Graceful fallback to initials avatar

**Acceptance Criteria:**
- Greeting displays correct time-of-day segment based on user's local timezone
- Notification badge updates within 2 seconds of new notification insertion
- Clicking notification bell navigates to `/notifications`
- Clicking avatar navigates to `/profile`
- GX Score badge is visible and accurate to latest calculation
- Top bar is sticky on scroll (below main nav) on desktop, scrolls with content on mobile

---

### 3.2 Recommended Opportunities — Horizontal Scroll Cards

**User Flow:**
1. Student sees "Recommended for You" section with top 5 AI-matched opportunities
2. Student scrolls horizontally through cards
3. Student clicks a card to navigate to opportunity detail
4. Student can save/unsave directly from the card
5. Student clicks "View All" to navigate to marketplace with match sort

**UI Layout & Components:**
- Section header: `text-xl font-semibold text-navy-900` with "Recommended for You" label and "View All →" link (text-cyan-600)
- Horizontal scrollable container with `overflow-x-auto scroll-smooth` and hidden scrollbar CSS
- Cards: Fixed width 320px, min-height 200px, `rounded-xl border border-navy-100 bg-white shadow-sm p-5`
- Card internals (top to bottom):
  - Organization logo (40px square, rounded-lg) + Organization name (text-sm text-navy-500)
  - Opportunity title (text-base font-semibold text-navy-900, max 2 lines with line-clamp-2)
  - Location with MapPin icon (text-sm text-navy-500)
  - Category badge (pill, bg-cyan-50 text-cyan-700 text-xs font-medium px-2 py-0.5)
  - Bottom row: Match percentage (circular mini badge), deadline text, save/bookmark icon button
- Match percentage display: Small 32px circle with percentage inside, color-coded per design rules
- Save icon: `Bookmark` outline when unsaved, `BookmarkFilled` when saved, with optimistic toggle
- Scroll indicators: Left/right chevron buttons appear on hover (desktop only) at container edges when overflow exists
- Gap between cards: 16px
- Peek effect: Container has `padding-right: 48px` to show partial next card

**Business Rules:**
- Maximum 5 opportunities displayed, ordered by match_score descending
- Only show opportunities with status = 'active' and deadline > current date
- Match score is pre-computed by the AI Matching module and stored in `opportunity_matches` table
- If fewer than 5 matches exist, show all available (minimum 1 to display section)
- If zero matches, show empty state: illustration + "Complete your profile to get personalized recommendations" CTA
- Save action calls `POST /api/students/saved-opportunities` with `opportunity_id`
- Unsave action calls `DELETE /api/students/saved-opportunities/{opportunity_id}`
- Card click navigates to `/marketplace/{opportunity_id}`

**State Machine:**
- Section: `loading` (skeleton) → `loaded` (cards displayed) | `empty` (no matches) | `error` (retry button)
- Individual save: `idle` → `saving` (optimistic update) → `saved` | `error` (rollback)
- Scroll: `start` (left arrow hidden) → `middle` (both arrows) → `end` (right arrow hidden)

**Edge Cases:**
- Organization logo missing: Show generic building icon placeholder in navy-100 circle
- Opportunity title extremely long: line-clamp-2 with ellipsis
- Match score of 0%: Still show card but with grey badge
- Rapid save/unsave clicks: Debounce 500ms, disable button during API call
- Network failure on save: Show toast error "Failed to save. Try again.", rollback optimistic update
- All 5 opportunities already saved: All show filled bookmark (valid state)
- Student has no profile data for matching: Show empty state with profile completion CTA

**Acceptance Criteria:**
- Exactly 5 or fewer cards render in horizontal scroll
- Cards are scrollable via touch/mouse drag and scroll indicators
- Match percentage is color-coded correctly per threshold
- Save toggle works optimistically with proper error rollback
- Empty state renders when no matches available
- Card click navigates correctly to opportunity detail page
- "View All" link navigates to `/marketplace?sort=match_score`
- Skeleton loading state shows 5 placeholder cards during data fetch
- Cards maintain 320px width and do not collapse on any viewport

---

### 3.3 My Applications — Status Summary & Recent Cards

**User Flow:**
1. Student sees "My Applications" section with status summary counts
2. Student sees status breakdown as colored pill counts (Applied, Under Review, Interview, Offered, Rejected)
3. Student sees most recent 3 applications as condensed cards
4. Student clicks a card to navigate to application detail
5. Student clicks "View All" to navigate to `/applications`

**UI Layout & Components:**
- Section container: Widget card with standard card styling
- Section header: "My Applications" + "View All →" link
- Status summary row: Horizontal flex of status pills, each showing icon + count + label
  - Applied: Navy-500, FileText icon
  - Under Review: Yellow-500, Clock icon
  - Interview: Cyan-500, Video icon
  - Offered: Green-500, CheckCircle icon
  - Rejected: Red-400, XCircle icon
  - Each pill: `rounded-full px-3 py-1.5 text-sm font-medium` with respective bg-{color}-50 and text-{color}-700
- Recent applications list: Vertical stack of 3 cards with 12px gap
- Application card: Horizontal layout, 72px height
  - Left: Organization logo (32px)
  - Middle: Title (font-medium text-sm), Organization name (text-xs text-navy-500), submitted date
  - Right: Status badge (colored dot + text), match score mini

**Business Rules:**
- Status counts reflect ALL applications by the student regardless of date
- Recent cards show the 3 most recently submitted (ordered by `submitted_at DESC`)
- Application statuses enum: `draft`, `submitted`, `under_review`, `interview_scheduled`, `offered`, `rejected`, `withdrawn`, `accepted`
- Draft applications are excluded from the summary counts and recent list
- Withdrawn applications show in count but with muted styling
- If student has zero applications, show empty state: "You haven't applied to anything yet" + "Explore Opportunities" button

**State Machine:**
- Section: `loading` → `loaded` | `empty` | `error`
- Status counts update on page load (SSR) — no real-time for this widget

**Edge Cases:**
- Student with 100+ applications in one status: Show count as number (no cap)
- Very recently submitted application not yet processed: Shows as "submitted" status
- Application to a now-deleted opportunity: Show with "[Opportunity Removed]" title, greyed out
- Zero applications: Empty state with CTA button
- All applications in one status: Other status pills show "0" count (still visible)

**Acceptance Criteria:**
- All application status counts are accurate and sum to total
- Recent 3 applications show correct opportunity details and status
- Status pill colors match design specification exactly
- Click on application card navigates to `/applications/{id}`
- Empty state renders correctly with functional CTA
- Status breakdown shows all 5 visible statuses even if count is 0

---

### 3.4 Upcoming Deadlines — Calendar Widget

**User Flow:**
1. Student sees "Upcoming Deadlines" widget showing next 7 deadlines
2. Each deadline shows opportunity title, deadline date, days remaining, and urgency indicator
3. Student clicks a deadline item to navigate to opportunity detail
4. Student can toggle between list view and mini-calendar view

**UI Layout & Components:**
- Widget card with "Upcoming Deadlines" header + view toggle (list/calendar icons)
- List view (default):
  - Vertical stack of deadline items, max 7 visible, scrollable if more
  - Each item: Left urgency dot (colored), title (text-sm font-medium, line-clamp-1), date string, "X days left" badge
  - Date format: "Mon DD" (e.g., "Jan 15")
  - Days left badge: `text-xs font-medium rounded px-1.5 py-0.5`
    - 0-3 days: `bg-red-50 text-red-700` + pulse animation on dot
    - 4-7 days: `bg-orange-50 text-orange-700`
    - 8-14 days: `bg-yellow-50 text-yellow-700`
    - 15+ days: `bg-navy-50 text-navy-500`
- Mini-calendar view:
  - Current month grid (7x5/6), today highlighted with cyan ring
  - Deadline dates marked with colored dots below date number
  - Clicking a date with deadlines shows tooltip with opportunity titles
- Bottom: "See all deadlines" link if more than 7 exist

**Business Rules:**
- Only show deadlines for opportunities the student has saved OR been recommended (match > 60%)
- Only show future deadlines (deadline_date > now)
- Order by deadline_date ASC (soonest first)
- Maximum 7 items in list view
- "Today" deadlines show "Due today!" instead of "0 days left"
- Past-due deadlines for saved opportunities that are still open: Show "Overdue" in red (should be rare)
- Calendar view shows current month only, with navigation arrows disabled (simplified widget)

**State Machine:**
- View toggle: `list` | `calendar` (persisted in localStorage)
- Section: `loading` → `loaded` | `empty` | `error`

**Edge Cases:**
- No upcoming deadlines: Show "No upcoming deadlines. Save opportunities to track their deadlines." with Bookmark icon
- Deadline is today: Special "Due today!" red styling with urgency
- Multiple deadlines same day in calendar view: Stack dots (max 3 visible + "+N" overflow)
- Opportunity deadline extended: Reflects updated date on next page load
- Timezone handling: Deadlines compared in UTC, displayed in user's local timezone
- Very long opportunity title: line-clamp-1 with ellipsis

**Acceptance Criteria:**
- Deadlines ordered by soonest first
- Urgency colors and animations match spec exactly
- View toggle persists across page loads
- Click navigates to correct opportunity detail page
- Maximum 7 items displayed in list view
- "Due today" special formatting applies correctly
- Empty state displays when no deadlines exist
- Calendar view marks deadline dates with colored dots

---

### 3.5 Profile Completion — Circular Progress Widget

**User Flow:**
1. Student sees circular progress indicator with percentage
2. Below the ring, student sees which sections are incomplete
3. Student clicks an incomplete section link to navigate directly to that onboarding step
4. Once 100%, widget shows congratulatory state

**UI Layout & Components:**
- Widget card (right column, 30% width on desktop)
- Circular progress ring: 120px diameter, 8px stroke width
  - Track: `stroke-navy-100`
  - Fill: `stroke-cyan-500` with animated transition on mount
  - Center: Percentage number `text-2xl font-bold text-navy-900` + "complete" text below in `text-xs text-navy-500`
- Below ring: Section checklist
  - Each section: Checkbox icon (green check if complete, empty circle if not) + section label + weight percentage
  - Incomplete sections are clickable links (text-cyan-600 underline on hover)
  - Section labels: Identity, Education, Skills, Experience, Career Goals, Global Preferences, Portfolio
- Weights shown as subtle text: "(15%)", "(20%)", etc.
- At 100%: Ring is fully Cyan-500, confetti micro-animation once, "Profile Complete! 🎉" text
- Below 50%: Additional nudge text "A complete profile gets 3x more matches"

**Business Rules:**
- Profile completion weights (from onboarding spec):
  - Identity: 15%
  - Education: 20%
  - Skills: 20%
  - Experience: 15%
  - Career Goals: 10%
  - Global Preferences: 10%
  - Portfolio: 10%
- Each section is binary complete/incomplete based on minimum required fields:
  - Identity: name, DOB, nationality filled
  - Education: at least 1 education entry
  - Skills: at least 3 skills selected
  - Experience: at least 1 experience entry
  - Career Goals: at least 1 preferred industry + 1 preferred function
  - Global Preferences: at least 1 language added
  - Portfolio: at least 1 item in any portfolio section
- Total percentage = sum of weights for completed sections
- Clicking incomplete section navigates to `/(student)/onboarding?step={stepNumber}`

**State Machine:**
- Widget: `loading` → `loaded` | `error`
- Ring animation: `initial` (0%) → `animated` (actual %) over 1s ease-out on mount
- Confetti: triggers once when percentage first reaches 100% (tracked in localStorage)

**Edge Cases:**
- Student at 0%: Show 0% with all sections incomplete, strong CTA "Get Started" button
- Student at 100%: Celebratory state, hide checklist, show "Your profile is complete!" + "Edit Profile" link
- Section partially filled (e.g., 2 of 3 required fields): Section counts as incomplete
- Navigation from incomplete link returns student to dashboard after completion: Fresh data on return
- Percentage arithmetic: Always round to nearest integer for display

**Acceptance Criteria:**
- Circular progress visually represents accurate percentage
- Animation plays on initial mount (not on re-renders)
- All 7 sections listed with correct complete/incomplete status
- Clicking incomplete section navigates to correct onboarding step
- 100% state shows congratulatory UI
- Below 50% shows motivational nudge text
- Weight percentages visible next to each section label
- Ring uses CSS transition/animation (not JS-driven frame-by-frame)

---

### 3.6 GX Score — Radial Gauge Widget

**User Flow:**
1. Student sees their GX Score as a radial gauge visualization
2. Score is accompanied by a grade badge (A+, A, B+, B, C+, C, D)
3. Student sees score trend (up/down/stable from last calculation)
4. Student clicks "Improve Score" to navigate to score improvement page

**UI Layout & Components:**
- Widget card (right column, below Profile Completion)
- Radial gauge: 140px diameter arc (270° sweep), 10px stroke
  - Background track: `stroke-navy-100`
  - Score fill: Gradient from Cyan-400 to Cyan-600, proportional to score/100
  - Center: Score number `text-3xl font-bold text-navy-900` + "/100" in `text-sm text-navy-400`
- Grade badge: Below gauge, pill shape `bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold text-lg px-4 py-1`
- Trend indicator: Small arrow icon + text ("↑ 5 pts" in green, "↓ 3 pts" in red, "→ Stable" in navy)
- "Improve Your Score →" link button below
- Score breakdown mini-list (3-4 top contributing dimensions):
  - Each: Dimension label + mini progress bar + score
  - Example dimensions: Academic Profile, Skills Breadth, Experience Diversity, Global Readiness

**Business Rules:**
- GX Score range: 0-100
- Grade mapping:
  - 90-100: A+
  - 80-89: A
  - 70-79: B+
  - 60-69: B
  - 50-59: C+
  - 40-49: C
  - 0-39: D
- Trend calculated as difference between current score and previous score (from `gx_scores` history)
- If no previous score exists (first calculation), show "New!" badge instead of trend
- Score dimensions from `gx_score_dimensions` JSONB field in latest score record
- "Improve Score" navigates to `/(student)/gx-score`
- Score updates only on specific triggers (profile update, new application, etc.) — not real-time

**State Machine:**
- Widget: `loading` → `loaded` | `no_score` | `error`
- Gauge animation: Animate from 0 to actual score over 1.2s with ease-out-cubic on mount

**Edge Cases:**
- No GX Score calculated yet: Show empty gauge with "Complete your profile to unlock your GX Score" + CTA
- Score of 0: Show empty gauge with "D" grade (valid state for empty profile)
- Score decreased: Show red down arrow, no negative messaging beyond the indicator
- Score dimensions missing from data: Show gauge without breakdown list
- Very rapid score changes (unlikely): Always show latest calculation

**Acceptance Criteria:**
- Gauge visually fills proportional to score out of 100
- Grade badge displays correct letter grade per mapping
- Trend arrow direction and color are correct
- Gauge animates on mount
- "No score" state renders with clear CTA
- Score breakdown shows top dimensions with mini bars
- "Improve Score" link navigates correctly
- Gauge arc uses SVG path with stroke-dasharray/dashoffset technique

---

### 3.7 Skills to Improve — AI Suggestion List

**User Flow:**
1. Student sees "Skills to Improve" section suggesting 3-5 skills based on AI analysis
2. Each skill shows why it's recommended (tied to career goals or opportunity matches)
3. Student can dismiss a suggestion or click to learn more

**UI Layout & Components:**
- Widget card (right column, below GX Score)
- Header: "Skills to Improve" + "AI" badge (small pill, `bg-purple-50 text-purple-700 text-xs`)
- List of 3-5 skill items:
  - Each item: Skill name (font-medium text-sm), reason text (text-xs text-navy-500, line-clamp-2)
  - Right side: "×" dismiss button (icon only, text-navy-400 hover:text-navy-700)
  - Left side: Small trending-up icon in orange-500
- Example reasons: "Required by 4 of your matched opportunities", "Common in your target industry"
- Bottom: "See all suggestions →" link

**Business Rules:**
- Suggestions sourced from `skill_suggestions` table, pre-computed by AI module
- Maximum 5 displayed, ordered by relevance_score DESC
- Dismissing removes from view and marks `dismissed = true` in database
- Dismissed skills don't reappear for 30 days
- If fewer than 3 suggestions available, show section with available ones
- If zero suggestions, hide section entirely (don't show empty state)
- Reason text is pre-generated by AI and stored with the suggestion

**State Machine:**
- Section: `loading` → `loaded` | `hidden` (no suggestions)
- Individual item dismiss: `visible` → `dismissing` (fade out animation 300ms) → `removed`

**Edge Cases:**
- All suggestions dismissed: Section hides
- AI module hasn't generated suggestions yet: Section hides
- Suggestion for a skill already added to profile: Should be filtered out server-side
- Very long skill name: Truncate with ellipsis at 25 characters
- Rapid dismiss clicks: Disable button during API call

**Acceptance Criteria:**
- 3-5 skill suggestions display with reason text
- Dismiss removes item with animation and persists to database
- Section hidden when no suggestions available
- "AI" badge clearly indicates AI-generated content
- "See all suggestions" navigates to dedicated page
- Dismissed items don't reappear within 30-day window

---

### 3.8 Quick Actions — Button Group

**User Flow:**
1. Student sees quick action buttons for common tasks
2. Student clicks a button to navigate to the relevant section

**UI Layout & Components:**
- Widget card (right column, below Skills to Improve)
- Header: "Quick Actions"
- Vertical stack of action buttons with 8px gap:
  - "Complete Profile" — `UserCircle` icon — navigates to onboarding (only shown if profile < 100%)
  - "Explore Opportunities" — `Search` icon — navigates to `/marketplace`
  - "Improve Score" — `TrendingUp` icon — navigates to `/(student)/gx-score`
  - "My Applications" — `FileText` icon — navigates to `/(student)/applications`
  - "Upload Documents" — `Upload` icon — navigates to `/(student)/documents`
- Button styling: Full-width, `h-10 text-sm font-medium rounded-lg` with icon left-aligned
  - Primary action (first incomplete CTA): `bg-cyan-500 text-white hover:bg-cyan-600`
  - Secondary actions: `bg-navy-50 text-navy-700 hover:bg-navy-100 border border-navy-200`

**Business Rules:**
- "Complete Profile" only visible if `profile_completion_percentage < 100`
- Primary styling applied to the most important action contextually:
  - If profile < 100%: "Complete Profile" is primary
  - If profile = 100% and 0 applications: "Explore Opportunities" is primary
  - Otherwise: "Explore Opportunities" is primary
- Maximum 5 quick action buttons visible
- Order is fixed as listed above (after conditional visibility)

**State Machine:**
- Buttons are stateless navigation triggers — no loading states needed

**Edge Cases:**
- All quick actions applicable: Show all 5
- Profile complete: "Complete Profile" hidden, remaining 4 shown
- Mobile viewport: Buttons stack full-width as expected

**Acceptance Criteria:**
- Correct buttons visible based on profile completion state
- Primary button styling applied to contextually correct action
- All navigation targets are correct
- Buttons are full-width within widget
- "Complete Profile" hidden when profile is 100%
- Icons render correctly aligned with text

---

### 3.9 Saved Opportunities — Bottom Section

**User Flow:**
1. Student sees "Saved Opportunities" section at bottom of dashboard
2. Shows grid of saved opportunity cards (max 6)
3. Student can unsave directly from this view
4. Student clicks card to view opportunity detail
5. "View All Saved" link navigates to full saved list

**UI Layout & Components:**
- Full-width section below main columns
- Header: "Saved Opportunities" + count badge + "View All →" link
- Grid layout: 3 columns desktop, 2 tablet, 1 mobile
- Cards: Compact version of marketplace opportunity cards
  - Org logo (32px) + title + location + deadline + match % + unsave button (filled bookmark)
  - Card height: auto, min ~120px
- Maximum 6 cards displayed
- Empty state: "No saved opportunities yet" + "Browse Marketplace" button

**Business Rules:**
- Ordered by `saved_at DESC` (most recently saved first)
- Maximum 6 displayed; "View All" shows if count > 6
- Unsave triggers `DELETE /api/students/saved-opportunities/{id}` with optimistic removal
- Cards for expired opportunities (past deadline) show "Expired" badge in red and are greyed slightly
- Count badge shows total saved count (not just displayed 6)

**State Machine:**
- Section: `loading` → `loaded` | `empty` | `error`
- Unsave: `saved` → `unsaving` (optimistic removal from grid) → `removed` | `error` (re-add to grid)

**Edge Cases:**
- Rapid unsave multiple: Each removal animates independently with layout shift animation
- Opportunity deleted by provider: Card shows "No longer available" greyed out with option to remove
- All 6 unsaved: Section transitions to empty state
- Student has exactly 6 saved: "View All" link still shown (they navigate and see the same 6)
- Card data partially missing (e.g., org deleted): Show with fallback placeholder data

**Acceptance Criteria:**
- Grid responsive layout works at all breakpoints
- Maximum 6 cards rendered
- Unsave works optimistically with rollback on error
- Expired opportunities clearly indicated
- Empty state shows with marketplace CTA
- Count badge accurately reflects total saved count

---

### 3.10 Responsive Layout & Collapsibility

**User Flow:**
1. Desktop: Two-column layout (70/30 split)
2. Tablet: Two-column grid with widgets rearranged
3. Mobile: Single column with collapsible widget sections

**UI Layout & Components:**
- Desktop (≥1024px): CSS Grid `grid-cols-[1fr_340px]` gap-6
  - Left column: Top bar, Recommended Opportunities, My Applications, Upcoming Deadlines
  - Right column: Profile Completion, GX Score, Skills to Improve, Quick Actions
  - Bottom (full width): Saved Opportunities
- Tablet (768-1023px): `grid-cols-2` gap-4
  - Widgets arranged in 2-col masonry-like grid
  - Order: Top bar (full), Recommended (full), Profile Completion + GX Score (side by side), Applications + Deadlines (side by side), Skills + Quick Actions (side by side), Saved (full)
- Mobile (<768px): Single column, gap-4
  - All widgets stack vertically
  - Collapsible: Each widget has chevron toggle to collapse/expand body
  - Default expanded: Top bar, Recommended, Profile Completion
  - Default collapsed: Applications, Deadlines, GX Score, Skills, Quick Actions, Saved
  - Collapse state persisted in localStorage

**Business Rules:**
- Collapse state key: `dashboard_widget_collapse_{widgetId}`
- Top bar is never collapsible
- Recommended Opportunities section always shows on initial load (not collapsed)
- Widget collapse animation: 200ms ease-in-out height transition
- Saved Opportunities section only collapses on mobile

**State Machine:**
- Each collapsible widget: `expanded` | `collapsed` (toggled by chevron click)
- Transition: `expanded` → animating(200ms) → `collapsed` (and vice versa)

**Edge Cases:**
- Orientation change on tablet: Layout recalculates without losing scroll position
- Very small mobile (320px): All widgets fit with horizontal padding 16px
- Widget content loading while collapsed: Load state maintained, content ready when expanded
- Keyboard accessibility: Collapse toggle activatable with Enter/Space

**Acceptance Criteria:**
- Desktop shows 70/30 two-column layout
- Tablet shows 2-column grid layout
- Mobile shows single column with collapsible sections
- Collapse/expand animates smoothly
- Collapse state persists across page loads on mobile
- All widgets render correctly at 320px minimum width
- No horizontal overflow at any breakpoint

---

### 3.11 Widget-Level Error Boundaries

**User Flow:**
1. If any individual widget fails to load/render, it shows error state independently
2. Other widgets continue functioning normally
3. Student can retry failed widget without full page reload

**UI Layout & Components:**
- Error state per widget: Replace widget content with centered error UI
  - AlertTriangle icon (orange-500, 24px)
  - "Something went wrong" text (text-sm text-navy-500)
  - "Retry" button (text-sm text-cyan-600 underline)
- Error boundary wraps each widget's content area (not header)
- Widget header/title remains visible even in error state

**Business Rules:**
- Error boundaries catch render errors AND failed data fetches
- Retry triggers re-fetch of that widget's specific data
- Maximum 3 automatic retries with exponential backoff (1s, 2s, 4s)
- After 3 retries, show manual retry button only
- Log errors to monitoring service (error boundary captures component stack)
- If ALL widgets error: Show page-level error with "Reload Dashboard" button

**State Machine:**
- Per widget: `loading` → `loaded` | `error(retry_count)` → `retrying` → `loaded` | `error(retry_count+1)`
- After retry_count = 3: `error_final` (manual retry only)

**Edge Cases:**
- Partial API response (some widget data present, some missing): Only affected widgets error
- Network timeout: Treated as error, triggers retry
- Auth token expired mid-page: All widgets error simultaneously → redirect to login
- Widget errors after successful load (runtime error): Error boundary catches, shows retry

**Acceptance Criteria:**
- Individual widget failure doesn't crash entire dashboard
- Error UI shows with retry button
- Retry re-fetches widget data successfully
- Maximum 3 automatic retries before requiring manual action
- Error logging captures widget identity and error details
- Auth errors redirect to login page

## 4. Data Models

### Dashboard Aggregated Response (API response shape, not a table)

```typescript
interface DashboardData {
  greeting: {
    first_name: string;
    gx_score: number | null;
    unread_notification_count: number;
    profile_photo_url: string | null;
  };
  recommended_opportunities: RecommendedOpportunity[];
  applications_summary: ApplicationsSummary;
  upcoming_deadlines: UpcomingDeadline[];
  profile_completion: ProfileCompletion;
  gx_score_detail: GxScoreDetail | null;
  skill_suggestions: SkillSuggestion[];
  saved_opportunities: SavedOpportunityCard[];
  saved_opportunities_total_count: number;
}
```

### RecommendedOpportunity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | NOT NULL | Opportunity ID |
| title | string | NOT NULL, max 200 | Opportunity title |
| organization_name | string | NOT NULL | Org name |
| organization_logo_url | string | nullable | Logo URL |
| location_country | string | NOT NULL | Country |
| location_city | string | nullable | City |
| work_mode | enum | 'onsite','remote','hybrid' | Work mode |
| category | enum | 7 types | Opportunity category |
| deadline | ISO 8601 string | NOT NULL | Application deadline |
| match_score | number | 0-100 | AI match percentage |
| key_skills | string[] | max 5 | Top relevant skills |
| is_saved | boolean | NOT NULL | Whether student saved it |
| compensation_type | enum | nullable | Compensation type |

### ApplicationsSummary

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| total_count | number | ≥ 0 | Total applications |
| status_counts | Record<ApplicationStatus, number> | all statuses | Count per status |
| recent_applications | RecentApplication[] | max 3 | Most recent apps |

### RecentApplication

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | NOT NULL | Application ID |
| opportunity_id | uuid | NOT NULL | Opportunity ID |
| opportunity_title | string | NOT NULL | Title |
| organization_name | string | NOT NULL | Org name |
| organization_logo_url | string | nullable | Logo URL |
| status | ApplicationStatus | NOT NULL | Current status |
| submitted_at | ISO 8601 string | NOT NULL | Submission timestamp |
| match_score | number | 0-100, nullable | Match score |

### ApplicationStatus Enum
`draft` | `submitted` | `under_review` | `interview_scheduled` | `offered` | `rejected` | `withdrawn` | `accepted`

### UpcomingDeadline

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | NOT NULL | Opportunity ID |
| title | string | NOT NULL, max 200 | Opportunity title |
| organization_name | string | NOT NULL | Org name |
| deadline | ISO 8601 string | NOT NULL | Deadline date |
| days_remaining | number | integer | Days until deadline |
| urgency | enum | 'critical','warning','moderate','normal' | Urgency level |
| category | enum | 7 types | Opportunity category |
| source | enum | 'saved','recommended' | How student relates |

### ProfileCompletion

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| total_percentage | number | 0-100 | Overall completion |
| sections | ProfileSection[] | exactly 7 | Each section status |

### ProfileSection

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| key | string | NOT NULL | Section identifier |
| label | string | NOT NULL | Display label |
| weight | number | percentage weight | Weight toward total |
| is_complete | boolean | NOT NULL | Completion status |
| step_number | number | 1-7 | Onboarding step |
| navigation_url | string | NOT NULL | Direct link to section |

### GxScoreDetail

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| current_score | number | 0-100 | Latest score |
| previous_score | number | 0-100, nullable | Previous score |
| grade | string | NOT NULL | Letter grade |
| trend_direction | enum | 'up','down','stable','new' | Score trend |
| trend_value | number | ≥ 0 | Point difference |
| calculated_at | ISO 8601 string | NOT NULL | Last calculation |
| dimensions | ScoreDimension[] | max 6 | Score breakdown |

### ScoreDimension

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| key | string | NOT NULL | Dimension identifier |
| label | string | NOT NULL | Display name |
| score | number | 0-100 | Dimension score |
| max_score | number | always 100 | Max possible |
| weight | number | 0-1 | Weight in total |

### SkillSuggestion

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | NOT NULL | Suggestion ID |
| skill_name | string | NOT NULL, max 50 | Skill name |
| skill_id | uuid | NOT NULL | Reference to skills_master |
| reason | string | NOT NULL, max 200 | AI-generated reason |
| relevance_score | number | 0-1 | Relevance ranking |
| related_opportunity_count | number | ≥ 0 | How many opps need it |
| dismissed | boolean | default false | If dismissed |
| dismissed_at | ISO 8601 string | nullable | Dismiss timestamp |
| created_at | ISO 8601 string | NOT NULL | Creation time |

### SavedOpportunityCard

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | NOT NULL | Saved record ID |
| opportunity_id | uuid | NOT NULL | Opportunity ID |
| title | string | NOT NULL | Opportunity title |
| organization_name | string | NOT NULL | Org name |
| organization_logo_url | string | nullable | Logo URL |
| location_country | string | NOT NULL | Country |
| location_city | string | nullable | City |
| category | enum | 7 types | Category |
| deadline | ISO 8601 string | NOT NULL | Deadline |
| is_expired | boolean | NOT NULL | Past deadline |
| match_score | number | 0-100, nullable | Match score |
| saved_at | ISO 8601 string | NOT NULL | When saved |

### Database Tables Referenced (not redefined — see shared_contracts.md)
- `student_profiles` — profile data
- `opportunities` — opportunity listings
- `applications` — student applications
- `saved_opportunities` — save records
- `notifications` — notification records
- `gx_scores` — score history
- `skill_suggestions` — AI skill recommendations
- `opportunity_matches` — precomputed matches
- `skills_master` — skill catalog

### Indexes Used by Dashboard Queries
- `idx_opportunity_matches_student_score` — `(student_id, match_score DESC)` on `opportunity_matches`
- `idx_applications_student_submitted` — `(student_id, submitted_at DESC)` on `applications`
- `idx_saved_opportunities_student_saved` — `(student_id, saved_at DESC)` on `saved_opportunities`
- `idx_notifications_student_unread` — `(student_id, read)` WHERE `read = false` on `notifications`
- `idx_skill_suggestions_student_active` — `(student_id, dismissed, relevance_score DESC)` on `skill_suggestions`

## 5. API Contracts

### GET /api/students/dashboard

Aggregated endpoint returning all dashboard widget data in a single request.

**Request:**
```
GET /api/students/dashboard
Authorization: Bearer {access_token}
```

No query parameters — all filtering is server-side based on authenticated student.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "greeting": {
      "first_name": "Alex",
      "gx_score": 73,
      "unread_notification_count": 5,
      "profile_photo_url": "https://storage.example.com/photos/abc.jpg"
    },
    "recommended_opportunities": [
      {
        "id": "uuid-1",
        "title": "Software Engineering Intern",
        "organization_name": "TechCorp",
        "organization_logo_url": "https://...",
        "location_country": "Singapore",
        "location_city": "Singapore",
        "work_mode": "hybrid",
        "category": "internship",
        "deadline": "2024-03-15T23:59:59Z",
        "match_score": 87,
        "key_skills": ["Python", "React", "AWS"],
        "is_saved": false,
        "compensation_type": "paid"
      }
    ],
    "applications_summary": {
      "total_count": 12,
      "status_counts": {
        "submitted": 3,
        "under_review": 4,
        "interview_scheduled": 2,
        "offered": 1,
        "rejected": 2,
        "withdrawn": 0,
        "accepted": 0
      },
      "recent_applications": [
        {
          "id": "uuid-app-1",
          "opportunity_id": "uuid-opp-1",
          "opportunity_title": "Data Analyst Intern",
          "organization_name": "DataCo",
          "organization_logo_url": "https://...",
          "status": "under_review",
          "submitted_at": "2024-02-01T10:30:00Z",
          "match_score": 82
        }
      ]
    },
    "upcoming_deadlines": [
      {
        "id": "uuid-opp-2",
        "title": "Global Immersion: Tokyo",
        "organization_name": "UniX",
        "deadline": "2024-02-10T23:59:59Z",
        "days_remaining": 3,
        "urgency": "critical",
        "category": "global_immersion",
        "source": "saved"
      }
    ],
    "profile_completion": {
      "total_percentage": 65,
      "sections": [
        {
          "key": "identity",
          "label": "Identity",
          "weight": 15,
          "is_complete": true,
          "step_number": 1,
          "navigation_url": "/(student)/onboarding?step=1"
        },
        {
          "key": "education",
          "label": "Education",
          "weight": 20,
          "is_complete": true,
          "step_number": 2,
          "navigation_url": "/(student)/onboarding?step=2"
        },
        {
          "key": "skills",
          "label": "Skills",
          "weight": 20,
          "is_complete": true,
          "step_number": 3,
          "navigation_url": "/(student)/onboarding?step=3"
        },
        {
          "key": "experience",
          "label": "Experience",
          "weight": 15,
          "is_complete": false,
          "step_number": 4,
          "navigation_url": "/(student)/onboarding?step=4"
        },
        {
          "key": "career_goals",
          "label": "Career Goals",
          "weight": 10,
          "is_complete": true,
          "step_number": 5,
          "navigation_url": "/(student)/onboarding?step=5"
        },
        {
          "key": "global_preferences",
          "label": "Global Preferences",
          "weight": 10,
          "is_complete": false,
          "step_number": 6,
          "navigation_url": "/(student)/onboarding?step=6"
        },
        {
          "key": "portfolio",
          "label": "Portfolio",
          "weight": 10,
          "is_complete": false,
          "step_number": 7,
          "navigation_url": "/(student)/onboarding?step=7"
        }
      ]
    },
    "gx_score_detail": {
      "current_score": 73,
      "previous_score": 68,
      "grade": "B+",
      "trend_direction": "up",
      "trend_value": 5,
      "calculated_at": "2024-02-01T00:00:00Z",
      "dimensions": [
        {"key": "academic", "label": "Academic Profile", "score": 82, "max_score": 100, "weight": 0.25},
        {"key": "skills", "label": "Skills Breadth", "score": 70, "max_score": 100, "weight": 0.25},
        {"key": "experience", "label": "Experience Diversity", "score": 65, "max_score": 100, "weight": 0.25},
        {"key": "global_readiness", "label": "Global Readiness", "score": 75, "max_score": 100, "weight": 0.25}
      ]
    },
    "skill_suggestions": [
      {
        "id": "uuid-sug-1",
        "skill_name": "Machine Learning",
        "skill_id": "uuid-skill-1",
        "reason": "Required by 4 of your matched opportunities",
        "relevance_score": 0.92,
        "related_opportunity_count": 4,
        "dismissed": false,
        "dismissed_at": null,
        "created_at": "2024-01-28T00:00:00Z"
      }
    ],
    "saved_opportunities": [
      {
        "id": "uuid-saved-1",
        "opportunity_id": "uuid-opp-3",
        "title": "Research Assistant - AI Lab",
        "organization_name": "MIT",
        "organization_logo_url": "https://...",
        "location_country": "United States",
        "location_city": "Boston",
        "category": "research",
        "deadline": "2024-04-01T23:59:59Z",
        "is_expired": false,
        "match_score": 75,
        "saved_at": "2024-02-02T14:30:00Z"
      }
    ],
    "saved_opportunities_total_count": 12
  },
  "meta": {
    "timestamp": "2024-02-05T10:00:00Z"
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": null
  }
}

// 403 Forbidden (non-student role)
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Student role required",
    "details": null
  }
}

// 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to load dashboard data",
    "details": null
  }
}
```

---

### POST /api/students/saved-opportunities

Save an opportunity (used by Recommended Opportunities cards).

**Request:**
```json
POST /api/students/saved-opportunities
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "opportunity_id": "uuid-opp-1"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-saved-new",
    "opportunity_id": "uuid-opp-1",
    "saved_at": "2024-02-05T10:05:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid opportunity_id format
- 401: Unauthorized
- 404: Opportunity not found
- 409: Already saved

---

### DELETE /api/students/saved-opportunities/{opportunity_id}

Unsave an opportunity.

**Request:**
```
DELETE /api/students/saved-opportunities/uuid-opp-1
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "removed": true
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 404: Saved record not found

---

### PATCH /api/students/skill-suggestions/{id}/dismiss

Dismiss a skill suggestion.

**Request:**
```
PATCH /api/students/skill-suggestions/uuid-sug-1/dismiss
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-sug-1",
    "dismissed": true,
    "dismissed_at": "2024-02-05T10:10:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 404: Suggestion not found or not owned by student

## 6. Module Dependencies

| Dependency | What's Needed | How It's Used | Failure Handling |
|---|---|---|---|
| app_shell | Layout wrapper, navigation, theme context | Dashboard renders inside student app shell with sidebar/topnav | If shell fails, entire page fails — handled by root error boundary |
| authentication | Supabase Auth session, access token, user role | Validates student role, provides user ID for data queries | Missing/expired session → redirect to /login |
| supabase_client | Supabase JS client (browser + server) | Server-side data fetching, real-time subscriptions for notifications | Connection failure → widget-level error boundaries, retry logic |
| opportunity_marketplace | Save/unsave API endpoints, opportunity data types | Save/unsave from recommended cards and saved opportunities section | Optimistic UI with rollback on API failure |
| student_onboarding | Profile completion calculation logic, step navigation | Profile completion widget navigates to specific onboarding steps | Stale completion data acceptable; refreshed on dashboard load |
| gx_scoring | GX Score calculation results, dimensions data | GX Score gauge widget displays pre-computed scores | No score → "Complete profile" CTA shown instead |
| ai_matching | Match scores, skill suggestions | Recommended opportunities ranking, skill improvement suggestions | No matches → empty state; no suggestions → section hidden |
| notifications_system | Notification count, Realtime channel | Real-time unread badge count on notification bell | Realtime disconnect → show last known count, auto-reconnect |

## 7. Non-Functional Requirements

### Performance Targets
- **Initial page load (SSR)**: < 800ms Time to First Byte (TTFB)
- **Largest Contentful Paint (LCP)**: < 1.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Dashboard API response**: < 500ms at P95
- **Widget render time**: < 200ms per widget after data available

### Caching Strategy
- **SSR**: No cache (`cache: 'no-store'`, `dynamic = 'force-dynamic'`) — fresh data every request
- **Client-side**: React Query/SWR not used for initial load (SSR handles it); used only for mutation responses
- **Realtime**: WebSocket subscription with Supabase Realtime for notification count only
- **Collapse state**: localStorage, no server persistence
- **CDN**: Static assets (images, icons) cached via Vercel CDN with immutable headers

### Rate Limiting
- Dashboard API: 60 requests/minute per student (prevents refresh spam)
- Save/Unsave: 30 requests/minute per student
- Dismiss suggestion: 20 requests/minute per student

### Concurrency
- Dashboard load: Single aggregated query (no N+1; uses CTEs or parallel queries server-side)
- Save/unsave: Optimistic locking via unique constraint on `(student_id, opportunity_id)`
- Realtime subscription: Single channel per student session

### Data Retention
- Dashboard data is transient (aggregated from other tables, not stored separately)
- Skill suggestion dismissals retained for 30 days then reset
- Collapse preferences in localStorage — no expiry

### Accessibility
- All widgets keyboard navigable (Tab order follows visual layout)
- ARIA roles: `region` for each widget, `progressbar` for gauges, `list` for card lists
- Screen reader announcements for real-time notification count changes
- Minimum contrast ratio 4.5:1 for all text
- Focus visible styles on all interactive elements
- Reduced motion: Disable gauge animations and collapse transitions when `prefers-reduced-motion`

### Bundle Size
- Dashboard page JS bundle: < 80KB gzipped (excluding shared chunks)
- Code-split: Calendar view loaded lazily (only on toggle)
- SVG gauge: Inline SVG, not external library

## 8. Key Implementation Notes

1. **Aggregated API Query Pattern**: The `/api/students/dashboard` endpoint executes a single PostgreSQL function (`get_student_dashboard`) using CTEs to parallelize sub-queries for recommendations, applications, deadlines, profile completion, score, suggestions, and saved items. This avoids waterfall queries and keeps response time under 500ms.

2. **Supabase Realtime Subscription Lifecycle**: Initialize the Realtime subscription in a `useEffect` with cleanup on unmount. Subscribe to the `notifications` table filtered by `student_id` column and `INSERT` events. On event, increment local count state. Handle reconnection with Supabase's built-in retry mechanism (exponential backoff). Unsubscribe on component unmount to prevent memory leaks.

3. **SVG Radial Gauge Implementation**: Use SVG `<circle>` with `stroke-dasharray` and `stroke-dashoffset` for both profile completion ring and GX Score gauge. Calculate dashoffset as `circumference - (percentage / 100) * circumference`. Animate with CSS `transition: stroke-dashoffset 1.2s ease-out` triggered by adding a class after mount (useEffect with requestAnimationFrame).

4. **Optimistic Save/Unsave with Rollback**: When student clicks save/unsave, immediately update local state (React state or Zustand), then fire API call. On success: no action needed (already updated). On failure: revert state to previous value AND show error toast. Use a `previousState` ref to track pre-mutation state for rollback.

5. **Widget Error Boundaries with Retry**: Create a reusable `<WidgetErrorBoundary>` component that wraps each widget. It catches both render errors (React error boundary) and handles rejected promises from data fetching (via error state in async components). Each boundary maintains its own retry count and exponential backoff timer. Reset error state on successful retry.

6. **Mobile Collapse Persistence**: Store collapse state in localStorage under key `gx_dashboard_collapse` as JSON object `{widgetId: boolean}`. Read on mount (client-only via useEffect to avoid hydration mismatch). Use `useMediaQuery` hook to only enable collapse behavior below 768px. On desktop, widgets are always expanded regardless of stored state.

7. **Server Component + Client Component Split**: The dashboard page (`page.tsx`) is a Server Component that fetches data via the aggregated API. It passes data as props to individual Client Components (widgets) that handle interactivity (save/unsave, collapse, realtime, animations). This maximizes SSR benefits while enabling client interactivity where needed.

8. **Skeleton Loading States**: Each widget has a corresponding Skeleton component (e.g., `RecommendedOpportunitiesSkeleton`) that matches the exact dimensions of loaded content to prevent CLS. Skeletons use `animate-pulse bg-navy-100 rounded` blocks. Page-level Suspense boundaries wrap each widget for streaming SSR.

9. **Time-of-Day Greeting Hydration Safety**: Calculate greeting time segment on the server using UTC, then recalculate on client mount with local timezone. Use `suppressHydrationWarning` on the greeting text element to prevent hydration mismatch. This ensures the greeting is always accurate to the user's local time after mount.

10. **Dashboard Data Freshness Strategy**: Since the dashboard uses `dynamic = 'force-dynamic'`, every page navigation fetches fresh data. However, for client-side navigation (Next.js router), use `router.refresh()` pattern. Add a `lastFetched` timestamp to detect stale data if user leaves tab open. After 5 minutes of tab inactivity, show subtle "Dashboard may be outdated. Refresh?" banner.

## 9. File Map

```
src/app/(student)/dashboard/
├── page.tsx                              # Server Component: data fetching, layout composition
├── loading.tsx                           # Streaming fallback with full-page skeleton
├── error.tsx                             # Page-level error boundary
├── layout.tsx                            # Dashboard-specific metadata, title
│
├── components/
│   ├── TopBar.tsx                        # Greeting, notification bell, GX badge, avatar
│   ├── TopBarSkeleton.tsx               # Skeleton for top bar during loading
│   ├── RecommendedOpportunities.tsx     # Horizontal scroll cards with save functionality
│   ├── RecommendedOpportunitiesSkeleton.tsx  # Skeleton for recommended section
│   ├── OpportunityCard.tsx              # Individual opportunity card in scroll container
│   ├── ApplicationsSummary.tsx          # Status counts + recent applications list
│   ├── ApplicationsSummarySkeleton.tsx  # Skeleton for applications widget
│   ├── ApplicationCard.tsx              # Individual application card
│   ├── StatusBadge.tsx                  # Colored status pill component
│   ├── UpcomingDeadlines.tsx            # Deadline list/calendar widget
│   ├── UpcomingDeadlinesSkeleton.tsx    # Skeleton for deadlines widget
│   ├── DeadlineItem.tsx                 # Individual deadline row
│   ├── MiniCalendar.tsx                 # Mini calendar view (lazy loaded)
│   ├── ProfileCompletion.tsx            # Circular progress ring + section checklist
│   ├── ProfileCompletionSkeleton.tsx    # Skeleton for profile completion
│   ├── CircularProgress.tsx             # Reusable SVG circular progress component
│   ├── GxScoreGauge.tsx                 # Radial gauge + grade + trend + dimensions
│   ├── GxScoreGaugeSkeleton.tsx         # Skeleton for GX score widget
│   ├── RadialGauge.tsx                  # Reusable SVG radial gauge component
│   ├── SkillSuggestions.tsx             # AI skill improvement list with dismiss
│   ├── SkillSuggestionsSkeleton.tsx     # Skeleton for suggestions widget
│   ├── SkillSuggestionItem.tsx          # Individual suggestion row
│   ├── QuickActions.tsx                 # Quick action button group
│   ├── SavedOpportunities.tsx           # Bottom grid of saved opportunities
│   ├── SavedOpportunitiesSkeleton.tsx   # Skeleton for saved section
│   ├── SavedOpportunityCard.tsx         # Individual saved opportunity card
│   ├── WidgetCard.tsx                   # Shared widget container (header, body, collapse)
│   ├── WidgetErrorBoundary.tsx          # Error boundary wrapper for each widget
│   ├── CollapsibleWidget.tsx            # Mobile collapse logic + animation
│   ├── EmptyState.tsx                   # Reusable empty state (icon, message, CTA)
│   ├── NotificationBell.tsx             # Bell icon with realtime badge count
│   ├── MatchScoreBadge.tsx              # Color-coded circular match percentage
│   ├── UrgencyDot.tsx                   # Colored dot with optional pulse animation
│   └── ScrollIndicators.tsx             # Left/right chevron buttons for scroll containers
│
├── hooks/
│   ├── useNotificationCount.ts          # Supabase Realtime subscription for unread count
│   ├── useSaveOpportunity.ts            # Save/unsave with optimistic updates
│   ├── useDismissSuggestion.ts          # Dismiss skill suggestion mutation
│   ├── useCollapseState.ts              # localStorage-based collapse state management
│   ├── useTimeOfDay.ts                  # Client-side time-of-day greeting calculation
│   └── useWidgetRetry.ts               # Retry logic with exponential backoff
│
├── actions/
│   ├── getDashboardData.ts              # Server action: fetch aggregated dashboard data
│   ├── saveOpportunity.ts               # Server action: save opportunity
│   ├── unsaveOpportunity.ts             # Server action: unsave opportunity
│   └── dismissSuggestion.ts            # Server action: dismiss skill suggestion
│
├── types/
│   └── dashboard.types.ts               # TypeScript interfaces for all dashboard data
│
└── utils/
    ├── gradeMapping.ts                  # Score-to-grade conversion logic
    ├── urgencyLevel.ts                  # Days-to-urgency classification
    ├── completionCalculator.ts          # Profile completion percentage logic
    └── constants.ts                     # Widget IDs, animation durations, breakpoints

src/api/students/dashboard/
└── route.ts                             # GET handler: aggregated dashboard API endpoint

src/api/students/saved-opportunities/
├── route.ts                             # POST handler: save opportunity
└── [opportunity_id]/
    └── route.ts                         # DELETE handler: unsave opportunity

src/api/students/skill-suggestions/
└── [id]/
    └── dismiss/
        └── route.ts                     # PATCH handler: dismiss suggestion
```