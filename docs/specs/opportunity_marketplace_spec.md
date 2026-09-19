# Module Spec: Opportunity Marketplace

## 1. Overview & Purpose

The Opportunity Marketplace module is the primary discovery and browsing interface for all opportunities on the GlobalXcelerate platform. It provides a rich, filterable, searchable grid of opportunity cards across 7 categories (Internships, Global Immersion, Exchange Programs, Industry Projects, Research Collaborations, Scholarships, and Graduate Careers), with full-text search powered by PostgreSQL tsvector/GIN indexes, advanced multi-dimensional filtering with URL-persisted state, and an opportunity detail page featuring AI match scoring, eligibility verification, and an integrated apply flow.

**Who uses it:** Students (primary consumers who browse, save, and apply), Employers (view their posted listings in public context), University Admins (review available opportunities for their students), Program Providers (see their listings alongside competitors), Platform Admins (moderate and manage listings).

**Key screens/interfaces:**
- `/marketplace` — Main browse/search/filter listing page with category tabs, search bar, filter panel, card grid, pagination
- `/marketplace/[id]` — Opportunity detail page with full description, AI match card, eligibility check, apply drawer, save/share

**Data flow connections:**
- Receives opportunity data from the opportunity management module (creation/editing happens elsewhere)
- Reads student profile data (from student onboarding/profile module) for AI match scoring
- Writes to `saved_opportunities` table (save/unsave)
- Writes to `applications` table via apply flow
- Reads from `skills_master` for skill-based filtering
- Connects to app_shell for layout, navigation, and notification system
- Connects to authentication for role-based visibility and student-specific features (save, apply, match score)

**What this module does NOT do:**
- Does not handle opportunity creation, editing, or lifecycle management (that belongs to employer/provider dashboard)
- Does not compute GX scores (consumes pre-computed scores from the scoring engine)
- Does not manage student profiles (reads profile data for matching)
- Does not handle payment processing for paid programs
- Does not manage application review/tracking post-submission (belongs to application management module)

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

**Module-specific UI overrides and notes:**
- Category tab bar uses Navy-800 background with Cyan-400 active indicator underline (3px) and white text for active tab
- Opportunity cards use `bg-white` with `border border-gray-200` in light mode, `bg-navy-900 border-navy-700` in dark mode
- Match score badge uses gradient: ≥85% = `bg-gradient-to-r from-emerald-500 to-cyan-500`, 70-84% = `bg-gradient-to-r from-cyan-500 to-blue-500`, 50-69% = `bg-amber-500`, <50% = `bg-gray-400`
- Deadline urgency: ≤3 days = `text-red-600 font-semibold`, 4-7 days = `text-amber-600`, >7 days = `text-gray-600`
- Filter panel slides in from left on mobile (sheet), fixed sidebar on desktop (280px width)
- Save icon: outlined heart (unsaved), filled heart with Cyan-500 fill (saved), with scale animation on toggle
- Category badges use distinct colors per type: Internships=`bg-blue-100 text-blue-800`, Global Immersion=`bg-purple-100 text-purple-800`, Exchange=`bg-green-100 text-green-800`, Industry Projects=`bg-orange-100 text-orange-800`, Research=`bg-indigo-100 text-indigo-800`, Scholarships=`bg-yellow-100 text-yellow-800`, Graduate Careers=`bg-rose-100 text-rose-800`
- Card grid gap: `gap-6` on desktop, `gap-4` on mobile
- Search input: 48px height, rounded-xl, Navy-50 background, focus ring Cyan-500

## 3. Features & Functional Requirements

### 3.1 Category Navigation Tabs

**User Flow:**
1. User arrives at `/marketplace` and sees horizontal scrollable tab bar below the search section
2. "All" tab is active by default showing all opportunity types
3. User clicks a category tab to filter the grid to that type only
4. Tab state is synced to URL query parameter `?category=internships`
5. Multiple categories can be selected via the advanced filter panel (tab bar reflects first selected or "All" if multiple)

**UI Layout & Components:**
- Horizontal tab bar component using `ScrollArea` from shadcn/ui for overflow handling
- 8 tabs total: "All", "Internships", "Global Immersion", "Exchange", "Industry Projects", "Research", "Scholarships", "Graduate Careers"
- Each tab shows icon (Lucide) + label on desktop, icon-only on mobile with tooltip
- Active tab has bottom border indicator (3px Cyan-400), text-white, font-semibold
- Inactive tabs: text-navy-300, hover:text-white transition
- Tab bar container: `bg-navy-800 rounded-xl px-4 py-2` with `overflow-x-auto` and hidden scrollbar styling
- Count badge (small pill) next to each tab label showing number of results in that category

**Business Rules:**
- Tab selection replaces the `category` filter parameter (single-select from tab bar)
- Advanced filter panel allows multi-select of categories which overrides tab bar visual state
- When multi-select is active, tab bar shows "All" as active with a filter badge indicator
- Tab counts are fetched as part of the main query response (aggregated counts per category)
- Tab counts respect all other active filters (dynamic counts)

**State Machine:**
- States: `idle` → `loading` (on tab click) → `loaded` (results update) → `error` (if fetch fails)
- Tab click triggers URL update → URL change triggers data refetch via `useSearchParams` hook

**Edge Cases:**
- Category with 0 results: tab remains clickable, shows "0" count badge, grid shows empty state
- Rapid tab switching: debounce is NOT applied to tab clicks (immediate navigation), but concurrent fetch requests are cancelled via AbortController
- Browser back/forward: tab state restored from URL params
- Invalid category in URL: fallback to "All" tab, no error shown

**Acceptance Criteria:**
- [ ] All 8 tabs render with correct icons and labels
- [ ] Clicking a tab updates URL parameter and filters results within 500ms
- [ ] Tab counts accurately reflect filtered results
- [ ] Mobile horizontal scroll works without visible scrollbar
- [ ] Browser navigation correctly restores tab state
- [ ] Active tab styling is visually distinct and meets WCAG contrast requirements

---

### 3.2 Full-Text Search

**User Flow:**
1. User focuses the search input at top of the marketplace page
2. User types a query (minimum 2 characters to trigger search)
3. After 300ms of inactivity (debounce), a search request fires
4. Results update in real-time in the card grid below
5. Search query is persisted in URL as `?q=searchterm`
6. User can clear search via the X button in the input or by deleting all text
7. Search works across: opportunity title, description, organization name, skills, location

**UI Layout & Components:**
- Search container: full-width max-w-2xl centered above filter/grid area
- Input component: `h-12 rounded-xl bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-700 px-4 pl-12`
- Left icon: `Search` from Lucide (text-navy-400), 20px
- Right side: clear button (X icon) visible only when input has value
- Below input: search suggestion chips (recent searches from localStorage, max 5)
- Loading state: spinner replaces search icon during fetch
- Result count text below search: "{count} opportunities found" or "No results for '{query}'"

**Business Rules:**
- Minimum 2 characters required before search triggers
- Debounce: 300ms after last keystroke
- Search uses PostgreSQL `to_tsvector('english', ...)` with `ts_rank_cd` for relevance scoring
- Trigram similarity (`pg_trgm`) as fallback for partial/fuzzy matches when tsvector returns <3 results
- Search ranks: title match (weight A, 1.0), organization name (weight B, 0.4), description (weight C, 0.2), skills (weight D, 0.1)
- Empty search (cleared input) resets to default listing (no search filter)
- Search query is sanitized: stripped of special tsquery characters, trimmed, lowercased
- Search term highlighted in result cards (title and description snippet) using `<mark>` element

**State Machine:**
- `idle` → `typing` (user input, no fetch yet) → `searching` (debounce expired, fetch in progress) → `results` (success) or `no_results` (0 hits) or `error` (fetch failed)
- On clear: immediately transition to `idle`, cancel any pending fetch

**Edge Cases:**
- Single character input: no search triggered, show hint text "Type at least 2 characters"
- Special characters (`&`, `|`, `!`, `:`, `*`): stripped before sending to API
- Very long queries (>200 chars): truncated at 200 characters
- XSS vectors in search input: sanitized both client-side and server-side
- Network failure during search: show inline error "Search unavailable, try again" with retry button
- Concurrent searches (fast typing): only latest request result is rendered (race condition handling via request ID or AbortController)

**Acceptance Criteria:**
- [ ] Search triggers after 300ms debounce with ≥2 characters
- [ ] Results update within 500ms of search trigger (P95)
- [ ] URL updates with search query parameter
- [ ] Clear button resets search and shows all results
- [ ] Highlighted terms appear in card titles
- [ ] No results state shows helpful message with suggestions
- [ ] Special characters do not cause errors or injection

---

### 3.3 Advanced Filter Panel

**User Flow:**
1. User clicks "Filters" button (with active filter count badge) to open the filter panel
2. On desktop: panel is a persistent left sidebar (280px). On mobile: slides in as a sheet from left
3. User selects/adjusts any combination of filters
4. Each filter change immediately updates URL parameters and triggers a new data fetch
5. Active filters shown as removable chips above the card grid
6. "Clear all filters" button resets all filters
7. Filter state is fully URL-driven for shareability (copy URL = share exact filter state)

**UI Layout & Components:**
- Desktop: sticky sidebar (`position: sticky; top: 80px; max-height: calc(100vh - 100px); overflow-y: auto`)
- Mobile: `Sheet` component from shadcn/ui, slides from left, full-height
- Filter trigger button (mobile): `Button` with `SlidersHorizontal` icon + count badge
- Filter sections (collapsible `Collapsible` from shadcn/ui):
  1. **Category** — Multi-select checkbox list (7 items)
  2. **Location** — Country: searchable `Combobox` with 195 countries; City: dependent searchable `Combobox` (filtered by country)
  3. **Work Mode** — Radio group: "On-site", "Remote", "Hybrid", "Any"
  4. **Duration** — Dual range slider: min 1 week, max 24 months, step varies (weeks for <3mo, months for ≥3mo)
  5. **Compensation** — Type: checkboxes ("Paid", "Stipend", "Unpaid", "Scholarship"); Range: dual slider ($0-$10,000/mo) only visible when Paid/Stipend selected
  6. **Start Date** — Date range picker (from/to) using `Calendar` component
  7. **Deadline** — Toggle: "Expiring within 7 days"; Date range picker for custom
  8. **Match Score Minimum** — Single slider: 0-100%, step 5%, shows percentage label
  9. **Required Skills** — Tag input with autocomplete from skills_master, max 10 skills
  10. **Visa Support** — Toggle switch: "Visa sponsorship available"
  11. **Industry** — Searchable dropdown, multi-select, from industries enum
- Active filter chips bar: horizontal scrollable row above grid showing all active filters as removable chips
- "Clear all" button: right-aligned in chips bar, `variant="ghost"` with `X` icon

**Business Rules:**
- All filters are AND-combined (narrowing)
- Category filter: OR within (any of selected categories)
- Skills filter: OR within (opportunity must have at least one of the selected skills)
- Location: country is required before city becomes available
- Duration slider: displays human-readable labels ("2 weeks", "3 months", "1 year")
- Match Score filter only visible to authenticated Students (requires profile for scoring)
- Compensation range only activates when "Paid" or "Stipend" type is selected
- URL parameter encoding: `?category=internships,exchange&country=US&city=New+York&workMode=remote&durationMin=4&durationMax=12&durationUnit=months&compensationType=paid,stipend&compensationMin=2000&compensationMax=8000&startDateFrom=2025-03-01&startDateTo=2025-06-30&deadlineWithin=7&matchMin=70&skills=python,react&visaSupport=true&industry=technology,finance`
- Empty/default filter values are NOT included in URL (clean URLs)
- Maximum 10 skills in filter, maximum 5 industries

**State Machine:**
- Panel states: `collapsed` (mobile) / `expanded` (desktop default)
- Each filter section: `expanded` / `collapsed` (default: first 3 expanded, rest collapsed)
- Filter application: `idle` → `applying` (URL update + fetch) → `applied` (results loaded)
- Skills autocomplete: `idle` → `searching` (typing) → `results` (suggestions shown) → `selected` (skill added)

**Edge Cases:**
- Conflicting filters resulting in 0 results: show empty state with "Try removing some filters" message and suggest which filter to relax
- Invalid URL parameters (e.g., `durationMin=abc`): silently ignored, treated as no filter
- Location city without country in URL: city filter ignored
- Duration min > max: swap values automatically
- Compensation range when no type selected: range ignored
- Filter panel scroll position preserved when results update
- Browser back with filter changes: full filter state restored from URL
- Skills that no longer exist in catalog: shown with strikethrough, auto-removed on next interaction

**Acceptance Criteria:**
- [ ] All 11 filter types render and function correctly
- [ ] URL updates reflect all active filters accurately
- [ ] Shared URL reproduces exact same filter state for another user
- [ ] Active filter chips appear and are individually removable
- [ ] "Clear all" resets all filters and URL to base state
- [ ] Mobile sheet opens/closes smoothly with gesture support
- [ ] Dependent filters (city on country, compensation range on type) behave correctly
- [ ] Match Score filter hidden for unauthenticated users
- [ ] P95 filter application + results render < 800ms

---

### 3.4 Opportunity Card Grid

**User Flow:**
1. User sees a responsive grid of opportunity cards after loading the marketplace
2. Each card displays key information at a glance for quick scanning
3. User can hover a card for subtle elevation effect
4. Clicking anywhere on the card (except save icon) navigates to the detail page
5. User can click the save/heart icon to toggle save status without navigating away
6. Cards show skeleton loading states during data fetch

**UI Layout & Components:**
- Grid container: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Card component structure (top to bottom):
  - Header row: Org logo (40x40 rounded-lg) | Org name (text-sm text-gray-500) | Save icon (top-right)
  - Title: `text-lg font-semibold text-navy-900 dark:text-white` (max 2 lines, line-clamp-2)
  - Location row: MapPin icon + "City, Country" | Work mode badge (small pill)
  - Category badge: colored pill per category type (colors defined in Section 2)
  - Key stats row: Duration icon + "3 months" | Calendar icon + "Starts Jun 2025"
  - Skills row: up to 3 skill tags (small pills, `bg-navy-50 text-navy-700`) + "+N more" if overflow
  - Footer row: Deadline text (with urgency color) | Match score badge (circular, percentage)
- Card dimensions: min-height 280px, padding 20px
- Hover state: `shadow-md` → `shadow-lg` transition, translateY(-2px)
- Save icon: `Heart` from Lucide, 20px, positioned absolute top-4 right-4
- Skeleton: same card dimensions with `Skeleton` components matching each row

**Business Rules:**
- Default page size: 20 cards per page
- Cards without match scores (unauthenticated or no profile): show "Complete profile for match score" link instead of percentage
- Expired opportunities (past deadline): shown with reduced opacity (0.6), "Expired" badge overlaid, not clickable for apply but still viewable
- Logo fallback: if org has no logo, show first letter of org name in a colored circle (color derived from org name hash)
- Skills shown: top 3 most relevant to student's profile (if authenticated), otherwise first 3 from opportunity skills list
- Deadline display: "Due in X days" for ≤14 days, full date "Mar 15, 2025" for >14 days, "No deadline" if null
- Match score: only computed and shown for authenticated students with completed profiles
- Cards maintain consistent height in grid via `min-h` and flexible internal spacing

**State Machine:**
- Card states: `loading` (skeleton) → `loaded` (data rendered) → `error` (card-level error placeholder)
- Save states per card: `unsaved` → `saving` (optimistic UI, icon filled immediately) → `saved` | `save_error` (revert icon)
- Grid states: `loading` (full skeleton grid) → `loaded` → `empty` (no results) → `error` (fetch failure)

**Edge Cases:**
- Very long titles: truncated with line-clamp-2 (CSS) and full title in tooltip on hover
- Missing data fields: conditionally render rows; never show empty rows or "N/A"
- Image load failure for org logo: fallback to letter avatar, no broken image icon
- Rapid save/unsave clicking: debounce save API calls by 500ms, use optimistic UI
- Grid with 1-2 results on desktop: cards maintain their width (don't stretch full row)
- Stale data after save: optimistic update in local state, background revalidation

**Acceptance Criteria:**
- [ ] Grid renders correctly at all 3 breakpoints (1/2/3 columns)
- [ ] All card information renders without layout shift after hydration
- [ ] Skeleton loading matches final card dimensions precisely
- [ ] Save toggle works with optimistic UI (no perceptible delay)
- [ ] Expired opportunities visually distinct and non-applicable
- [ ] Match score badge shows correct gradient color per range
- [ ] Card click navigates to detail page; save icon click does NOT navigate
- [ ] Empty state renders when no results match filters

---

### 3.5 Sorting

**User Flow:**
1. User sees sort dropdown to the right of the results count text above the grid
2. Default sort is "Relevance" (when search is active) or "Newest" (when browsing)
3. User clicks dropdown and selects a sort option
4. Grid immediately re-fetches with new sort order
5. Sort state persisted in URL as `?sort=match_score&order=desc`

**UI Layout & Components:**
- Sort container: flex row with results count on left, sort dropdown on right
- Results count: "Showing 1-20 of 342 opportunities"
- Sort dropdown: `Select` from shadcn/ui, width 200px, with sort icon prefix
- Options:
  - "Relevance" (only when search query active, default in search mode)
  - "Best Match" (match score descending, only for authenticated students)
  - "Deadline: Soonest" (ascending, nulls last)
  - "Newest" (created_at descending, default in browse mode)
  - "Compensation: High to Low" (descending, nulls last)

**Business Rules:**
- "Relevance" sort uses ts_rank_cd score from full-text search; hidden when no search query
- "Best Match" uses pre-computed match_score; hidden for unauthenticated users
- "Deadline: Soonest" excludes expired opportunities from top (pushed to end)
- "Newest" is the universal default when no search is active
- "Compensation: High to Low" treats unpaid/null as 0, sorts by monthly normalized amount
- Sort selection resets pagination to page 1
- If selected sort becomes unavailable (e.g., "Relevance" when search cleared), auto-switch to "Newest"

**State Machine:**
- `idle` → `sorting` (fetch with new sort) → `sorted` (results updated)

**Edge Cases:**
- Tie-breaking: secondary sort is always `created_at DESC` for stable ordering
- Sort option becomes invalid (clear search removes "Relevance"): graceful fallback
- URL has invalid sort value: default to "Newest"

**Acceptance Criteria:**
- [ ] All 5 sort options available in correct conditions
- [ ] Sort change triggers re-fetch and resets to page 1
- [ ] URL parameter accurately reflects current sort
- [ ] Conditional sort options (Relevance, Best Match) show/hide correctly
- [ ] Stable sort order (no flickering between re-renders)

---

### 3.6 Pagination

**User Flow:**
1. User scrolls to bottom of card grid and sees pagination controls
2. Controls show: Previous/Next buttons, page numbers (1, 2, 3 ... N), and page size selector
3. User clicks a page number or Next to load the next set of results
4. Page scrolls to top of grid smoothly on page change
5. URL updates with `?page=2` parameter

**UI Layout & Components:**
- Pagination container: centered below grid, `flex items-center justify-center gap-2 py-8`
- Previous button: `Button variant="outline"` with ChevronLeft icon, disabled on page 1
- Next button: `Button variant="outline"` with ChevronRight icon, disabled on last page
- Page numbers: numbered buttons, max 7 visible with ellipsis for gaps (e.g., 1 2 3 ... 15 16 17)
- Active page: `Button variant="default"` with Navy-800 bg
- Page size selector: small `Select` with options [12, 20, 50, 100], default 20
- Results info: "Showing 21-40 of 342 results" text above pagination

**Business Rules:**
- Offset-based pagination: `offset = (page - 1) * pageSize`
- Default page size: 20. Options: 12, 20, 50, 100. Max enforced server-side: 100
- Page number display logic:
  - ≤7 total pages: show all numbers
  - >7 pages: show first, last, current ±1, with ellipsis for gaps
- Changing page size resets to page 1
- Invalid page numbers in URL (>max, 0, negative): redirect to page 1
- Total count included in response for calculating total pages
- Page change triggers scroll to top of results grid (smooth scroll)

**State Machine:**
- `idle` → `navigating` (fetch new page) → `loaded` (new page rendered)
- Grid shows skeleton loading during page navigation

**Edge Cases:**
- 0 results: pagination controls hidden entirely
- 1 page of results: pagination controls hidden
- Rapid page clicking: cancel previous request, only render latest
- Page beyond available results (e.g., page 100 when only 5 pages exist): redirect to last valid page
- Filters reduce results during pagination (user was on page 5, now only 2 pages): redirect to page 1

**Acceptance Criteria:**
- [ ] Pagination renders correct number of pages based on total count
- [ ] Page navigation updates URL and fetches new data
- [ ] Scroll to top occurs on page change
- [ ] Page size change resets to page 1
- [ ] Ellipsis logic correct for large page counts
- [ ] Hidden when ≤1 page of results
- [ ] Disabled states for prev/next at boundaries

---

### 3.7 Save/Unsave Opportunities

**User Flow:**
1. Authenticated student sees heart icon on each opportunity card and on detail page
2. Clicking heart saves the opportunity (icon fills with cyan, brief scale animation)
3. Clicking again unsaves (icon returns to outline, brief animation)
4. Unauthenticated users clicking save see a login prompt modal
5. Saved opportunities appear in student dashboard "Saved Opportunities" section
6. Toast notification confirms save/unsave action

**UI Layout & Components:**
- Card save button: `Button variant="ghost" size="icon"` positioned absolute top-4 right-4 in card
- Detail page save button: full `Button` with Heart icon + "Save" / "Saved" text
- Heart icon states: outlined (unsaved), filled Cyan-500 (saved)
- Animation: scale(1.2) → scale(1.0) transition 200ms on toggle
- Toast: "Opportunity saved!" / "Opportunity removed from saved" — auto-dismiss 3s
- Login prompt: `AlertDialog` with message "Sign in to save opportunities" and Sign In / Cancel buttons

**Business Rules:**
- Only authenticated users with role "student" can save opportunities
- A student can save maximum 100 opportunities (soft limit, show warning at 90)
- Saving is idempotent: saving an already-saved opportunity is a no-op (no error)
- Unsaving removes the record from `saved_opportunities` table (hard delete)
- Save state is loaded in bulk with the opportunity list (single query with LEFT JOIN)
- Optimistic UI: icon updates immediately, API call fires in background
- If API fails: revert icon state, show error toast "Failed to save. Try again."
- Saved timestamp recorded for ordering in dashboard

**State Machine:**
- Per opportunity: `unsaved` → `saving` (API call) → `saved` | `save_failed` (revert)
- Reverse: `saved` → `unsaving` (API call) → `unsaved` | `unsave_failed` (revert)

**Edge Cases:**
- Network failure during save: revert optimistic UI, show error toast with retry action
- User saves then immediately navigates away: save still processes (fire-and-forget after optimistic update)
- Concurrent save on same opportunity from different devices: idempotent, no conflict
- Opportunity gets deleted/archived after being saved: remove from saved list on next fetch, no error
- 100 save limit reached: show modal "You've reached the save limit. Remove some saved opportunities to add more."

**Acceptance Criteria:**
- [ ] Save/unsave works with optimistic UI (instant visual feedback)
- [ ] Unauthenticated users see login prompt on save attempt
- [ ] Save state persists across page navigation and refresh
- [ ] Toast notifications appear for save/unsave actions
- [ ] Error handling reverts UI and shows error message
- [ ] Bulk save state loaded efficiently (no N+1 queries)
- [ ] Save limit enforced with clear user messaging

---

### 3.8 Opportunity Detail Page

**User Flow:**
1. User clicks an opportunity card and navigates to `/marketplace/[id]`
2. Page loads with full opportunity information, organization details, and (for students) AI match analysis
3. User can read description, requirements, benefits, and check eligibility
4. User can apply via drawer, save the opportunity, or share it
5. Related opportunities shown at bottom

**UI Layout & Components:**
- Page layout: 2-column on desktop (content 65% left, sidebar 35% right), single column mobile
- **Left column (Content):**
  - Breadcrumb: Marketplace > [Category] > [Title]
  - Header: Org logo (64x64) + Org name (link to org profile) + Posted date
  - Title: `text-3xl font-bold text-navy-900`
  - Meta row: Location (MapPin) | Work mode (Building/Globe) | Duration (Clock) | Category badge
  - Tab sections (using shadcn `Tabs`):
    - "Overview" — Full description (rendered Markdown), key highlights list
    - "Requirements" — Bulleted list with eligibility indicators (✓/✗ for students)
    - "Benefits" — Compensation details, perks, learning outcomes
    - "How to Apply" — Application process steps, required documents
  - Skills section: all required and preferred skills as tags (color-coded: met=green, unmet=gray for students)
  - Related opportunities: 3-card horizontal row at bottom

- **Right column (Sidebar):**
  - Action card (sticky, top-4): Apply button (primary, full-width), Save button, Share button
  - Deadline card: countdown timer if ≤7 days, date display otherwise
  - AI Match Score card (students only):
    - Circular progress (large, 120px) with percentage in center
    - Grade badge: "Excellent Match" / "Good Match" / "Fair Match" / "Low Match"
    - Dimension breakdown (4-5 bars): Skills match, Education match, Experience match, Location preference, Career alignment
    - "Why this score?" expandable explanation (AI-generated text, 2-3 sentences)
  - Eligibility checklist card:
    - Each requirement as a row: icon (CheckCircle green / XCircle red / AlertCircle amber) + text
    - Summary: "You meet X of Y requirements"
  - Organization info card: logo, name, industry, size, location, "View all opportunities" link

**Business Rules:**
- Page uses ISR with 120-second revalidation for public content
- AI match score fetched client-side (dynamic, user-specific) after initial page load
- Eligibility check is computed client-side by comparing student profile data against opportunity requirements JSONB
- Requirements JSONB structure: `{ "min_gpa": 3.0, "degree_levels": ["bachelor", "master"], "required_skills": ["python"], "nationality_restrictions": [], "language_requirements": [{"language": "english", "proficiency": 3}] }`
- Share functionality: copy link, share to LinkedIn, share to email (pre-filled subject)
- Related opportunities: same category, same industry, excluding current, limit 3, sorted by match score
- View count tracked (increment on page load, debounced, not shown to students)
- Organization links open in new context (no navigation away from detail)

**State Machine:**
- Page load: `loading` → `loaded` (ISR content) → `enriching` (client-side match score fetch) → `complete`
- Apply drawer: `closed` → `open` → `submitting` → `submitted` | `error`
- Share modal: `closed` → `open` → `copied` (toast) → `closed`

**Edge Cases:**
- Opportunity not found (deleted/archived): 404 page with "This opportunity is no longer available" message and back to marketplace link
- Opportunity expired: page renders with banner "This opportunity has closed" — apply button disabled, grey
- Student without completed profile: match score card shows "Complete your profile to see match analysis" with CTA
- Very long descriptions: rendered with proper Markdown styling, images lazy-loaded
- Match score computation timeout: show "Score unavailable" with retry button
- Concurrent access spike on popular opportunity: ISR handles via stale-while-revalidate

**Acceptance Criteria:**
- [ ] All content sections render with proper formatting
- [ ] AI match score loads within 2s of page load (client-side)
- [ ] Eligibility check accurately reflects student profile vs requirements
- [ ] Apply button only enabled for eligible, non-expired, authenticated students
- [ ] Share modal provides copy link, LinkedIn, and email options
- [ ] Related opportunities load and are relevant
- [ ] 404 handling for invalid opportunity IDs
- [ ] ISR serves cached content with 120s revalidation
- [ ] Responsive layout works correctly at all breakpoints
- [ ] Breadcrumb navigation functional

---

### 3.9 Apply Flow

**User Flow:**
1. Student clicks "Apply Now" button on detail page
2. Drawer slides in from right (desktop) or bottom sheet (mobile)
3. Drawer shows: opportunity title, application form (cover letter textarea, document uploads, optional additional fields from opportunity config)
4. Student writes cover letter (or uses AI-assisted draft)
5. Student uploads required documents (resume, transcript, etc.)
6. Student reviews and submits
7. Success state: confirmation with application ID, next steps info

**UI Layout & Components:**
- Drawer: `Sheet` from shadcn/ui, side="right" on desktop (480px width), side="bottom" on mobile (90vh)
- Header: opportunity title + org name, close button
- Form sections:
  - Cover letter: `Textarea` with character count (min 100, max 2000 chars), AI assist button
  - Documents: File upload zone (`react-dropzone` style), shows required docs list with status
  - Additional questions: dynamic form fields based on opportunity's `application_fields` JSONB
- Document upload: drag-and-drop zone, accepted types: PDF, DOC, DOCX, max 10MB per file, max 5 files
- Progress: step indicator if multi-section (cover letter → documents → review)
- Submit button: `Button` variant="default" size="lg", full-width at bottom
- Success state: CheckCircle icon, "Application Submitted!" heading, application reference #, timeline expectations

**Business Rules:**
- Cover letter required (minimum 100 characters) unless opportunity explicitly marks optional
- At least one document upload required if opportunity specifies required documents
- File uploads go to Supabase Storage bucket `applications/{student_id}/{opportunity_id}/`
- Application is atomic: either all parts succeed or none are saved (transaction)
- Duplicate application prevention: check if student already applied (show "Already Applied" state)
- Draft auto-save: cover letter text saved to localStorage every 10 seconds
- Application status set to "submitted" on creation
- Student receives email confirmation (triggered server-side)
- Application records: opportunity_id, student_id, cover_letter, documents (array of storage URLs), additional_answers (JSONB), status, submitted_at

**State Machine:**
- Drawer: `closed` → `open` → `filling` → `validating` → `uploading_files` → `submitting` → `success` | `error`
- File upload per file: `idle` → `uploading` (progress bar) → `uploaded` (checkmark) | `failed` (retry button)

**Edge Cases:**
- Network failure during file upload: show per-file error with retry button, don't lose other uploads
- Network failure during submission: show error with retry, preserve all form data
- Session expires during long application: detect 401, show re-auth modal, preserve draft
- Very large file upload (approaching 10MB): show warning at 8MB, hard reject at 10MB
- Opportunity closes while user is filling application: check deadline before submit, show "Deadline passed" if expired
- User closes drawer accidentally: confirm dialog "Discard application draft?", offer to save draft
- Multiple file uploads simultaneously: queue with max 2 concurrent, show progress for each

**Acceptance Criteria:**
- [ ] Drawer opens smoothly with correct form fields
- [ ] Cover letter validation (min 100, max 2000 chars) with character count
- [ ] File upload works via drag-and-drop and click
- [ ] File size and type validation with clear error messages
- [ ] Submission creates application record and uploads all files
- [ ] Success state shows confirmation with reference number
- [ ] Duplicate application prevented with clear messaging
- [ ] Draft auto-saved and recovered on re-open
- [ ] Error states are recoverable without data loss
- [ ] Accessibility: drawer traps focus, escape closes with confirmation

---

### 3.10 Share Functionality

**User Flow:**
1. User clicks "Share" button on opportunity detail page
2. Modal opens with sharing options: Copy Link, LinkedIn, Email, Twitter/X
3. User selects an option
4. Copy Link: copies URL to clipboard, shows "Copied!" confirmation
5. Social shares: opens new window with pre-populated share content
6. Modal closes after action

**UI Layout & Components:**
- Trigger: `Button variant="outline"` with Share2 icon
- Modal: `Dialog` from shadcn/ui, max-w-sm, centered
- Share options grid (2x2): each as a button card with icon + label
  - Copy Link: Link icon, "Copy Link" — primary action
  - LinkedIn: LinkedIn icon, "LinkedIn"
  - Email: Mail icon, "Email"
  - Twitter/X: Twitter icon, "Twitter/X"
- Copy confirmation: button text changes to "Copied!" with CheckCircle icon for 2 seconds
- Share preview: small card showing opportunity title + description snippet + image

**Business Rules:**
- Share URL is the canonical opportunity detail URL: `https://globalxcelerate.com/marketplace/{id}`
- LinkedIn share: `https://www.linkedin.com/sharing/share-offsite/?url={encoded_url}`
- Email share: `mailto:?subject={encoded_title}&body={encoded_description_snippet + url}`
- Twitter/X share: `https://twitter.com/intent/tweet?text={encoded_title}&url={encoded_url}`
- Track share events for analytics (event: `opportunity_shared`, metadata: `{opportunity_id, method}`)
- No authentication required to share (share button visible to all users)
- OG meta tags on detail page for rich previews when shared

**Edge Cases:**
- Clipboard API not available (older browsers): fallback to select-all input field with manual copy instruction
- Popup blocker prevents social share window: show fallback text "If popup was blocked, right-click and open: {url}"
- Very long opportunity titles: truncated at 100 chars for social share text

**Acceptance Criteria:**
- [ ] Share modal opens with all 4 options
- [ ] Copy Link works and shows confirmation
- [ ] Social share links open correctly formatted
- [ ] OG meta tags render correct preview data
- [ ] Share events tracked for analytics
- [ ] Clipboard API fallback works for older browsers

## 4. Data Models

### 4.1 `opportunities` Table

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | `gen_random_uuid()` | Unique identifier |
| title | VARCHAR(255) | NOT NULL | — | Opportunity title |
| slug | VARCHAR(300) | UNIQUE, NOT NULL | — | URL-friendly slug |
| description | TEXT | NOT NULL | — | Full description (Markdown) |
| description_plain | TEXT | NOT NULL | — | Plain text version for search |
| category | opportunity_category_enum | NOT NULL | — | One of 7 categories |
| organization_id | UUID | FK → organizations(id), NOT NULL | — | Posting organization |
| location_country | VARCHAR(2) | — | NULL | ISO 3166-1 alpha-2 code |
| location_city | VARCHAR(100) | — | NULL | City name |
| work_mode | work_mode_enum | NOT NULL | 'on_site' | Work arrangement |
| duration_value | INTEGER | CHECK(>0) | NULL | Duration numeric value |
| duration_unit | duration_unit_enum | — | NULL | weeks/months/years |
| compensation_type | compensation_type_enum | NOT NULL | 'unpaid' | Payment type |
| compensation_amount_min | DECIMAL(10,2) | CHECK(>=0) | NULL | Minimum compensation |
| compensation_amount_max | DECIMAL(10,2) | CHECK(>=0) | NULL | Maximum compensation |
| compensation_currency | VARCHAR(3) | — | 'USD' | ISO 4217 currency code |
| compensation_period | compensation_period_enum | — | 'monthly' | Payment frequency |
| start_date | DATE | — | NULL | Program start date |
| end_date | DATE | — | NULL | Program end date |
| application_deadline | TIMESTAMPTZ | — | NULL | Application cutoff |
| requirements | JSONB | NOT NULL | '{}' | Structured eligibility requirements |
| benefits | JSONB | — | '[]' | Benefits list |
| application_fields | JSONB | — | '[]' | Custom application form fields |
| industry | VARCHAR(100) | — | NULL | Primary industry |
| visa_support | BOOLEAN | NOT NULL | false | Visa sponsorship available |
| spots_available | INTEGER | CHECK(>=0) | NULL | Number of positions |
| spots_filled | INTEGER | CHECK(>=0) | 0 | Positions already filled |
| status | opportunity_status_enum | NOT NULL | 'draft' | Publication status |
| featured | BOOLEAN | NOT NULL | false | Featured listing |
| view_count | INTEGER | NOT NULL | 0 | Total page views |
| search_vector | TSVECTOR | — | — | Generated search index |
| published_at | TIMESTAMPTZ | — | NULL | When made public |
| created_at | TIMESTAMPTZ | NOT NULL | `now()` | Record creation |
| updated_at | TIMESTAMPTZ | NOT NULL | `now()` | Last modification |
| archived_at | TIMESTAMPTZ | — | NULL | Soft archive timestamp |

### 4.2 `opportunity_skills` Junction Table

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | `gen_random_uuid()` | Row identifier |
| opportunity_id | UUID | FK → opportunities(id) ON DELETE CASCADE, NOT NULL | — | Parent opportunity |
| skill_id | UUID | FK → skills_master(id), NOT NULL | — | Referenced skill |
| importance | skill_importance_enum | NOT NULL | 'required' | Required vs preferred |
| min_proficiency | INTEGER | CHECK(1-5) | 1 | Minimum proficiency level |
| created_at | TIMESTAMPTZ | NOT NULL | `now()` | Record creation |

**Unique constraint:** `(opportunity_id, skill_id)`

### 4.3 `saved_opportunities` Table

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | `gen_random_uuid()` | Row identifier |
| student_id | UUID | FK → students(id) ON DELETE CASCADE, NOT NULL | — | Student who saved |
| opportunity_id | UUID | FK → opportunities(id) ON DELETE CASCADE, NOT NULL | — | Saved opportunity |
| saved_at | TIMESTAMPTZ | NOT NULL | `now()` | When saved |
| notes | TEXT | — | NULL | Student's private notes |

**Unique constraint:** `(student_id, opportunity_id)`

### 4.4 `applications` Table

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | `gen_random_uuid()` | Application identifier |
| reference_number | VARCHAR(20) | UNIQUE, NOT NULL | — | Human-readable reference (GX-APP-XXXXXX) |
| student_id | UUID | FK → students(id), NOT NULL | — | Applicant |
| opportunity_id | UUID | FK → opportunities(id), NOT NULL | — | Target opportunity |
| cover_letter | TEXT | — | NULL | Cover letter content |
| documents | JSONB | NOT NULL | '[]' | Array of {name, url, type, size} |
| additional_answers | JSONB | — | '{}' | Responses to custom questions |
| status | application_status_enum | NOT NULL | 'submitted' | Application status |
| submitted_at | TIMESTAMPTZ | NOT NULL | `now()` | Submission timestamp |
| reviewed_at | TIMESTAMPTZ | — | NULL | When first reviewed |
| updated_at | TIMESTAMPTZ | NOT NULL | `now()` | Last status change |
| withdrawn_at | TIMESTAMPTZ | — | NULL | Withdrawal timestamp |
| match_score_at_submission | INTEGER | CHECK(0-100) | NULL | Snapshot of match score |

**Unique constraint:** `(student_id, opportunity_id)` — one application per student per opportunity

### 4.5 `opportunity_analytics` Table

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | `gen_random_uuid()` | Row identifier |
| opportunity_id | UUID | FK → opportunities(id) ON DELETE CASCADE, NOT NULL | — | Tracked opportunity |
| event_type | analytics_event_enum | NOT NULL | — | Event type |
| user_id | UUID | — | NULL | User who triggered (nullable for anon) |
| metadata | JSONB | — | '{}' | Event metadata |
| created_at | TIMESTAMPTZ | NOT NULL | `now()` | Event timestamp |

### 4.6 Enums

```sql
CREATE TYPE opportunity_category_enum AS ENUM (
  'internships',
  'global_immersion',
  'exchange',
  'industry_projects',
  'research',
  'scholarships',
  'graduate_careers'
);

CREATE TYPE work_mode_enum AS ENUM (
  'on_site',
  'remote',
  'hybrid'
);

CREATE TYPE duration_unit_enum AS ENUM (
  'weeks',
  'months',
  'years'
);

CREATE TYPE compensation_type_enum AS ENUM (
  'paid',
  'stipend',
  'unpaid',
  'scholarship'
);

CREATE TYPE compensation_period_enum AS ENUM (
  'hourly',
  'weekly',
  'monthly',
  'annual',
  'total'
);

CREATE TYPE opportunity_status_enum AS ENUM (
  'draft',
  'pending_review',
  'published',
  'closed',
  'archived'
);

CREATE TYPE skill_importance_enum AS ENUM (
  'required',
  'preferred',
  'nice_to_have'
);

CREATE TYPE application_status_enum AS ENUM (
  'submitted',
  'under_review',
  'shortlisted',
  'interview',
  'offered',
  'accepted',
  'rejected',
  'withdrawn'
);

CREATE TYPE analytics_event_enum AS ENUM (
  'view',
  'save',
  'unsave',
  'share',
  'apply_start',
  'apply_submit',
  'click_from_card'
);
```

### 4.7 Indexes

```sql
-- Full-text search
CREATE INDEX idx_opportunities_search_vector ON opportunities USING GIN(search_vector);

-- Trigram for fuzzy search
CREATE INDEX idx_opportunities_title_trgm ON opportunities USING GIN(title gin_trgm_ops);
CREATE INDEX idx_opportunities_description_trgm ON opportunities USING GIN(description_plain gin_trgm_ops);

-- Filter indexes
CREATE INDEX idx_opportunities_category ON opportunities(category) WHERE status = 'published';
CREATE INDEX idx_opportunities_country ON opportunities(location_country) WHERE status = 'published';
CREATE INDEX idx_opportunities_work_mode ON opportunities(work_mode) WHERE status = 'published';
CREATE INDEX idx_opportunities_deadline ON opportunities(application_deadline) WHERE status = 'published';
CREATE INDEX idx_opportunities_status_published ON opportunities(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_opportunities_compensation ON opportunities(compensation_type, compensation_amount_max DESC) WHERE status = 'published';
CREATE INDEX idx_opportunities_industry ON opportunities(industry) WHERE status = 'published';
CREATE INDEX idx_opportunities_visa ON opportunities(visa_support) WHERE status = 'published' AND visa_support = true;

-- Junction table indexes
CREATE INDEX idx_opportunity_skills_opportunity ON opportunity_skills(opportunity_id);
CREATE INDEX idx_opportunity_skills_skill ON opportunity_skills(skill_id);

-- Saved opportunities
CREATE INDEX idx_saved_opportunities_student ON saved_opportunities(student_id, saved_at DESC);
CREATE INDEX idx_saved_opportunities_opportunity ON saved_opportunities(opportunity_id);

-- Applications
CREATE INDEX idx_applications_student ON applications(student_id, submitted_at DESC);
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Analytics
CREATE INDEX idx_analytics_opportunity ON opportunity_analytics(opportunity_id, event_type);
CREATE INDEX idx_analytics_created ON opportunity_analytics(created_at DESC);
```

### 4.8 Search Vector Trigger

```sql
CREATE OR REPLACE FUNCTION update_opportunity_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE((SELECT name FROM organizations WHERE id = NEW.organization_id), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description_plain, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.location_city, '') || ' ' || COALESCE(NEW.location_country, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunity_search_vector
  BEFORE INSERT OR UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_search_vector();
```

## 5. API Contracts

### 5.1 GET `/api/opportunities` — List/Search Opportunities

**Purpose:** Fetch paginated, filtered, sorted opportunities for the marketplace grid.

**Request:**
```
GET /api/opportunities?q=&category=&country=&city=&workMode=&durationMin=&durationMax=&durationUnit=&compensationType=&compensationMin=&compensationMax=&startDateFrom=&startDateTo=&deadlineWithin=&matchMin=&skills=&visaSupport=&industry=&sort=&order=&page=&pageSize=
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | No | Search query (min 2 chars) |
| category | string | No | Comma-separated categories |
| country | string | No | ISO 3166-1 alpha-2 code |
| city | string | No | City name |
| workMode | string | No | on_site, remote, hybrid |
| durationMin | integer | No | Minimum duration value |
| durationMax | integer | No | Maximum duration value |
| durationUnit | string | No | weeks, months, years |
| compensationType | string | No | Comma-separated types |
| compensationMin | number | No | Minimum amount |
| compensationMax | number | No | Maximum amount |
| startDateFrom | string | No | ISO 8601 date |
| startDateTo | string | No | ISO 8601 date |
| deadlineWithin | integer | No | Days until deadline (e.g., 7) |
| matchMin | integer | No | Minimum match score (0-100) |
| skills | string | No | Comma-separated skill slugs (max 10) |
| visaSupport | boolean | No | true to filter visa-supporting |
| industry | string | No | Comma-separated industry slugs |
| sort | string | No | relevance, match_score, deadline, newest, compensation |
| order | string | No | asc, desc (default: desc) |
| page | integer | No | Page number (default: 1) |
| pageSize | integer | No | Items per page (default: 20, max: 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "id": "uuid",
        "title": "Software Engineering Intern",
        "slug": "software-engineering-intern-google-2025",
        "category": "internships",
        "organization": {
          "id": "uuid",
          "name": "Google",
          "logo_url": "https://storage.../google-logo.png"
        },
        "location_country": "US",
        "location_city": "Mountain View",
        "work_mode": "hybrid",
        "duration_value": 3,
        "duration_unit": "months",
        "compensation_type": "paid",
        "compensation_amount_min": 7000,
        "compensation_amount_max": 9000,
        "compensation_currency": "USD",
        "compensation_period": "monthly",
        "start_date": "2025-06-01",
        "application_deadline": "2025-04-15T23:59:59Z",
        "visa_support": true,
        "industry": "technology",
        "skills": [
          { "id": "uuid", "name": "Python", "importance": "required" },
          { "id": "uuid", "name": "React", "importance": "preferred" },
          { "id": "uuid", "name": "System Design", "importance": "nice_to_have" }
        ],
        "match_score": 87,
        "is_saved": true,
        "spots_available": 10,
        "spots_filled": 3,
        "featured": false,
        "published_at": "2025-01-15T10:00:00Z"
      }
    ],
    "category_counts": {
      "all": 342,
      "internships": 128,
      "global_immersion": 45,
      "exchange": 32,
      "industry_projects": 56,
      "research": 28,
      "scholarships": 31,
      "graduate_careers": 22
    },
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 342,
      "totalPages": 18,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid query parameters (validation errors)
- 429: Rate limit exceeded
- 500: Internal server error

---

### 5.2 GET `/api/opportunities/:id` — Opportunity Detail

**Request:**
```
GET /api/opportunities/{id}
```

**Headers:**
```
Authorization: Bearer {token} (optional, enables match score & eligibility)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Software Engineering Intern",
    "slug": "software-engineering-intern-google-2025",
    "description": "## About the Role\n\nMarkdown content...",
    "category": "internships",
    "organization": {
      "id": "uuid",
      "name": "Google",
      "logo_url": "https://storage.../google-logo.png",
      "industry": "technology",
      "size": "10000+",
      "location": "Mountain View, CA",
      "description": "Organization description...",
      "opportunities_count": 15
    },
    "location_country": "US",
    "location_city": "Mountain View",
    "work_mode": "hybrid",
    "duration_value": 3,
    "duration_unit": "months",
    "compensation_type": "paid",
    "compensation_amount_min": 7000,
    "compensation_amount_max": 9000,
    "compensation_currency": "USD",
    "compensation_period": "monthly",
    "start_date": "2025-06-01",
    "end_date": "2025-08-31",
    "application_deadline": "2025-04-15T23:59:59Z",
    "requirements": {
      "min_gpa": 3.5,
      "degree_levels": ["bachelor", "master"],
      "fields_of_study": ["computer_science", "software_engineering", "data_science"],
      "required_skills": ["python", "data_structures"],
      "preferred_skills": ["react", "system_design"],
      "min_experience_months": 0,
      "nationality_restrictions": [],
      "language_requirements": [
        { "language": "english", "min_proficiency": 4 }
      ],
      "other": ["Must be enrolled in a degree program", "Available for full 3-month duration"]
    },
    "benefits": [
      { "type": "compensation", "description": "$7,000-$9,000/month" },
      { "type": "housing", "description": "Corporate housing provided" },
      { "type": "travel", "description": "Relocation assistance" },
      { "type": "learning", "description": "Access to internal learning platforms" },
      { "type": "networking", "description": "Mentorship program with senior engineers" }
    ],
    "application_fields": [
      { "id": "motivation", "label": "Why are you interested in this role?", "type": "textarea", "required": true, "max_length": 500 },
      { "id": "availability", "label": "Confirm your availability for June-August 2025", "type": "radio", "options": ["Yes", "No"], "required": true }
    ],
    "skills": [
      { "id": "uuid", "name": "Python", "importance": "required", "min_proficiency": 3 },
      { "id": "uuid", "name": "Data Structures", "importance": "required", "min_proficiency": 3 },
      { "id": "uuid", "name": "React", "importance": "preferred", "min_proficiency": 2 },
      { "id": "uuid", "name": "System Design", "importance": "nice_to_have", "min_proficiency": 1 }
    ],
    "visa_support": true,
    "industry": "technology",
    "spots_available": 10,
    "spots_filled": 3,
    "featured": false,
    "published_at": "2025-01-15T10:00:00Z",
    "match_analysis": {
      "overall_score": 87,
      "grade": "excellent",
      "dimensions": [
        { "name": "Skills Match", "score": 92, "max": 100 },
        { "name": "Education", "score": 85, "max": 100 },
        { "name": "Experience", "score": 78, "max": 100 },
        { "name": "Location Fit", "score": 90, "max": 100 },
        { "name": "Career Alignment", "score": 88, "max": 100 }
      ],
      "explanation": "Your strong Python skills and computer science degree align well with this role. Your GPA of 3.8 exceeds the 3.5 requirement. Consider strengthening your system design knowledge for an even better fit.",
      "strengths": ["Python proficiency exceeds requirement", "GPA well above minimum", "Previous internship experience"],
      "gaps": ["No React experience listed", "System design not demonstrated"]
    },
    "eligibility": {
      "overall": "eligible",
      "checks": [
        { "requirement": "Minimum GPA 3.5", "status": "pass", "detail": "Your GPA: 3.8" },
        { "requirement": "Bachelor's or Master's student", "status": "pass", "detail": "Your degree: Bachelor's" },
        { "requirement": "Computer Science or related field", "status": "pass", "detail": "Your field: Computer Science" },
        { "requirement": "Python proficiency", "status": "pass", "detail": "Your level: 4/5" },
        { "requirement": "English proficiency level 4+", "status": "pass", "detail": "Your level: 5/5" }
      ],
      "met_count": 5,
      "total_count": 5
    },
    "is_saved": true,
    "has_applied": false,
    "related_opportunities": [
      {
        "id": "uuid",
        "title": "Backend Engineering Intern",
        "organization": { "name": "Meta", "logo_url": "..." },
        "category": "internships",
        "location_city": "Menlo Park",
        "location_country": "US",
        "match_score": 82,
        "application_deadline": "2025-04-20T23:59:59Z"
      }
    ]
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- 404: Opportunity not found `{ "success": false, "error": { "code": "NOT_FOUND", "message": "Opportunity not found or no longer available" } }`
- 500: Internal server error

---

### 5.3 POST `/api/students/saved-opportunities` — Save Opportunity

**Request:**
```json
POST /api/students/saved-opportunities
Authorization: Bearer {token}
Content-Type: application/json

{
  "opportunity_id": "uuid"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "opportunity_id": "uuid",
    "saved_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not a student role)
- 404: Opportunity not found
- 409: Already saved (idempotent — returns existing record)
- 422: Save limit reached (100 max) `{ "success": false, "error": { "code": "LIMIT_REACHED", "message": "Maximum 100 saved opportunities. Remove some to add more." } }`
- 429: Rate limited

---

### 5.4 DELETE `/api/students/saved-opportunities/:opportunityId` — Unsave Opportunity

**Request:**
```
DELETE /api/students/saved-opportunities/{opportunityId}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "removed": true,
    "opportunity_id": "uuid"
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (not student role)
- 404: Save record not found (already removed — treated as success for idempotency)

---

### 5.5 POST `/api/opportunities/:id/apply` — Submit Application

**Request:**
```json
POST /api/opportunities/{id}/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "cover_letter": "Dear hiring team, I am writing to express...",
  "documents": [
    { "name": "resume.pdf", "storage_path": "applications/{student_id}/{opportunity_id}/resume.pdf", "type": "resume", "size_bytes": 245000 },
    { "name": "transcript.pdf", "storage_path": "applications/{student_id}/{opportunity_id}/transcript.pdf", "type": "transcript", "size_bytes": 189000 }
  ],
  "additional_answers": {
    "motivation": "I am passionate about...",
    "availability": "Yes"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reference_number": "GX-APP-7K9X2M",
    "opportunity_id": "uuid",
    "status": "submitted",
    "submitted_at": "2025-01-20T10:00:00Z",
    "match_score_at_submission": 87
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- 400: Validation errors (missing cover letter, invalid documents, etc.)
- 401: Unauthorized
- 403: Forbidden (not student, or not eligible)
- 404: Opportunity not found
- 409: Already applied `{ "success": false, "error": { "code": "ALREADY_APPLIED", "message": "You have already applied to this opportunity" } }`
- 410: Opportunity closed/expired `{ "success": false, "error": { "code": "OPPORTUNITY_CLOSED", "message": "This opportunity is no longer accepting applications" } }`
- 422: Validation failed (cover letter too short, missing required documents)

---

### 5.6 POST `/api/opportunities/:id/upload` — Upload Application Document

**Request:**
```
POST /api/opportunities/{id}/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
document_type: "resume" | "transcript" | "cover_letter_pdf" | "portfolio" | "other"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "storage_path": "applications/{student_id}/{opportunity_id}/resume_1705744800.pdf",
    "public_url": "https://supabase-storage.../file.pdf",
    "file_name": "resume.pdf",
    "file_size": 245000,
    "mime_type": "application/pdf"
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid file type or exceeds 10MB
- 401: Unauthorized
- 413: File too large
- 429: Rate limited (max 10 uploads per minute)

---

### 5.7 GET `/api/opportunities/:id/match` — Get AI Match Score (Client-side fetch)

**Request:**
```
GET /api/opportunities/{id}/match
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overall_score": 87,
    "grade": "excellent",
    "dimensions": [
      { "name": "Skills Match", "score": 92, "max": 100, "weight": 0.30 },
      { "name": "Education", "score": 85, "max": 100, "weight": 0.25 },
      { "name": "Experience", "score": 78, "max": 100, "weight": 0.20 },
      { "name": "Location Fit", "score": 90, "max": 100, "weight": 0.15 },
      { "name": "Career Alignment", "score": 88, "max": 100, "weight": 0.10 }
    ],
    "explanation": "Your strong Python skills and computer science degree align well...",
    "strengths": ["Python proficiency exceeds requirement", "GPA well above minimum"],
    "gaps": ["No React experience listed", "System design not demonstrated"],
    "computed_at": "2025-01-20T10:00:00Z"
  },
  "error": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2025-01-20T10:00:00Z"
  }
}
```

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (profile not complete enough for scoring)
- 404: Opportunity not found
- 503: Scoring service unavailable (retry after header included)

## 6. Module Dependencies

| Dependency | What's Needed | How It's Used | Failure Handling |
|---|---|---|---|
| **app_shell** | Layout wrapper, navigation, header, sidebar | Marketplace pages render within app shell layout, breadcrumbs integrate with shell navigation | Graceful degradation — marketplace content renders in minimal layout if shell fails |
| **authentication** | Session, user role, JWT token | Determines visibility of match scores, save buttons, apply flow; provides auth headers for API calls | Unauthenticated mode: hide personalized features, show login prompts on protected actions |
| **student_profile** | Student profile data (skills, education, experience, preferences) | Used for AI match score computation, eligibility checking, skill-based result personalization | Match score shows "Complete profile" CTA; eligibility shows "Profile needed" state |
| **organizations** | Organization details (name, logo, industry) | Displayed on cards and detail pages, linked from opportunity data | Show opportunity with fallback org info (name only, placeholder logo) |
| **skills_master** | Skills catalog (name, slug, category) | Powers skill filter autocomplete, displays skill tags on cards/detail | Filter degrades to text input; tags show raw skill names without enrichment |
| **scoring_engine** | AI match computation service | Called to compute match scores for authenticated students | Score section shows "Unavailable" with retry; rest of page functions normally |
| **supabase_storage** | File upload bucket (applications) | Document uploads during apply flow stored in Supabase Storage | Upload failure shown per-file with retry; application submission blocked until uploads complete |
| **notification_service** | Email sending capability | Sends application confirmation email to student after submission | Application succeeds even if email fails; email queued for retry |

## 7. Non-Functional Requirements

### Pagination
- Default page size: 20 items
- Allowed page sizes: 12, 20, 50, 100
- Maximum page size enforced server-side: 100
- Offset-based pagination with total count
- Total count uses `COUNT(*) OVER()` window function for single-query efficiency

### Rate Limiting
- List endpoint: 60 requests/minute per IP (unauthenticated), 120 requests/minute per user (authenticated)
- Detail endpoint: 120 requests/minute per IP
- Save/unsave: 30 requests/minute per user
- Apply: 5 requests/minute per user
- File upload: 10 requests/minute per user
- Search: 40 requests/minute per IP

### Caching
- Marketplace listing page: ISR with 60-second revalidation
- Opportunity detail page: ISR with 120-second revalidation
- Category counts: cached 30 seconds in-memory (per edge node)
- Skills autocomplete: cached 5 minutes (CDN edge)
- Country/city lists: cached 24 hours (static data)
- Match scores: cached 10 minutes per student-opportunity pair (invalidated on profile update)
- Organization data: cached 1 hour

### Concurrency
- Optimistic UI for save/unsave with background reconciliation
- AbortController for in-flight search/filter requests on new input
- File uploads: max 2 concurrent uploads per session
- Application submission: database-level unique constraint prevents duplicates
- View count increment: fire-and-forget, no blocking

### Performance Targets
- Initial page load (LCP): < 1.5s (P95)
- Search results update: < 500ms (P95) after debounce
- Filter application: < 800ms (P95)
- Card interaction (save): < 100ms perceived (optimistic)
- Detail page load: < 1.0s (P95, cached) / < 2.0s (P95, cold)
- Match score computation: < 2.0s (P95)
- File upload (5MB): < 5s (P95)
- Application submission: < 3s (P95)
- Time to interactive: < 2.5s (P95)

### Data Retention
- Published opportunities: retained indefinitely
- Archived opportunities: retained 2 years, then soft-deleted
- Saved opportunities: retained until user removes or account deleted
- Applications: retained 5 years (legal compliance)
- Analytics events: retained 1 year, then aggregated
- Upload files: retained as long as application exists

### Accessibility
- WCAG 2.1 AA compliance
- Full keyboard navigation (tab through cards, filters, pagination)
- Screen reader: ARIA labels on all interactive elements, live regions for results updates
- Focus management: trap in modals/drawers, return focus on close
- Color contrast: all text/badge combinations meet 4.5:1 ratio
- Reduced motion: respect `prefers-reduced-motion` for animations

## 8. Key Implementation Notes

1. **Search Vector Update Strategy:** The `search_vector` column is updated via a PostgreSQL trigger on INSERT/UPDATE of the opportunities table. Additionally, skill names are concatenated into the vector via a scheduled function that runs every 5 minutes, since skills are in a junction table. Consider a materialized view for complex search scenarios.

2. **URL State Synchronization:** Use `nuqs` (Next.js URL query state) library for type-safe URL parameter management. Define a parser schema matching all filter parameters. The URL is the single source of truth — component state derives from URL params via `useSearchParams`, and all filter changes push to URL via `router.replace` with `{ scroll: false }`.

3. **Match Score Computation Isolation:** Match scores should NOT be computed in the list endpoint (too expensive for 20+ items). Instead: (a) for the list, use a pre-computed `match_scores` table updated asynchronously when student profiles change or opportunities are published, (b) for the detail page, compute fresh on-demand via the `/match` endpoint. The list endpoint LEFT JOINs the pre-computed table.

4. **Optimistic Save Pattern:** Use React Query's `useMutation` with `onMutate` for optimistic updates. Maintain a local Set of saved opportunity IDs in a Zustand store, updated optimistically. On error, rollback using the `onError` callback's context. This avoids full list refetch on every save toggle.

5. **ISR + Dynamic Personalization Pattern:** The marketplace page uses ISR (60s) for the opportunity data shell, but match scores and save states are injected client-side after hydration. Use `Suspense` boundaries around personalized components with skeleton fallbacks. This ensures fast initial paint for all users while progressive enhancement adds personalization.

6. **Filter Query Construction:** Build the Supabase query dynamically using a query builder pattern. Each active filter appends a `.filter()` chain. For skill-based filtering, use a subquery: `.in('id', supabase.from('opportunity_skills').select('opportunity_id').in('skill_id', selectedSkillIds))`. For duration ranges, normalize all durations to weeks for comparison.

7. **Debounced Search with AbortController:** Create a custom `useDebouncedSearch` hook that combines lodash's `debounce` (300ms) with an `AbortController` ref. Each new search call aborts the previous in-flight request. The hook returns `{ query, setQuery, results, isLoading, error }` and handles the race condition of fast typing.

8. **Application Reference Number Generation:** Reference numbers follow format `GX-APP-XXXXXX` where X is alphanumeric (uppercase). Generate using `nanoid` with custom alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ` and length 6. Check uniqueness via database constraint; retry with new ID on conflict (extremely rare with 2.1B combinations).

9. **Responsive Filter Panel Architecture:** The filter panel is a single `FilterPanel` component rendered in two modes: on desktop it's rendered inline in the page layout (always visible, left column), on mobile it's rendered inside a `Sheet` component. Use a `useMediaQuery` hook to determine mode, but render both in the DOM (one hidden via CSS) to preserve filter state without re-mounting.

10. **Category Count Optimization:** Instead of running 7 separate COUNT queries, use a single query with `GROUP BY category` and a filter matching all current non-category filters. Return counts as a map in the API response. Cache this for 30 seconds since it's expensive with complex filters.

## 9. File Map

```
src/
├── app/
│   ├── marketplace/
│   │   ├── page.tsx                          # Main marketplace listing page (ISR, 60s)
│   │   ├── loading.tsx                       # Full-page skeleton loading state
│   │   ├── error.tsx                         # Error boundary for marketplace page
│   │   ├── not-found.tsx                     # 404 for invalid marketplace routes
│   │   ├── layout.tsx                        # Marketplace layout (wraps filter sidebar on desktop)
│   │   └── [id]/
│   │       ├── page.tsx                      # Opportunity detail page (ISR, 120s)
│   │       ├── loading.tsx                   # Detail page skeleton
│   │       ├── error.tsx                     # Detail page error boundary
│   │       └── not-found.tsx                 # 404 for invalid opportunity ID
│   └── api/
│       └── opportunities/
│           ├── route.ts                      # GET /api/opportunities (list + search)
│           ├── [id]/
│           │   ├── route.ts                  # GET /api/opportunities/:id (detail)
│           │   ├── apply/
│           │   │   └── route.ts              # POST /api/opportunities/:id/apply
│           │   ├── upload/
│           │   │   └── route.ts              # POST /api/opportunities/:id/upload
│           │   └── match/
│           │       └── route.ts              # GET /api/opportunities/:id/match
│           └── saved/
│               └── route.ts                  # POST & DELETE /api/students/saved-opportunities
├── components/
│   └── marketplace/
│       ├── category-tabs.tsx                 # Category navigation tab bar component
│       ├── search-bar.tsx                    # Full-text search input with debounce
│       ├── search-suggestions.tsx            # Recent search chips below search input
│       ├── filter-panel.tsx                  # Advanced filter panel (sidebar/sheet)
│       ├── filter-section.tsx                # Collapsible filter section wrapper
│       ├── filter-category.tsx               # Category multi-select checkbox filter
│       ├── filter-location.tsx               # Country/city searchable combobox filter
│       ├── filter-work-mode.tsx              # Work mode radio group filter
│       ├── filter-duration.tsx               # Duration dual range slider filter
│       ├── filter-compensation.tsx           # Compensation type + range filter
│       ├── filter-date-range.tsx             # Start date / deadline date range filter
│       ├── filter-match-score.tsx            # Match score minimum slider filter
│       ├── filter-skills.tsx                 # Skill tag input with autocomplete filter
│       ├── filter-visa.tsx                   # Visa support toggle filter
│       ├── filter-industry.tsx               # Industry multi-select dropdown filter
│       ├── active-filter-chips.tsx           # Horizontal row of active filter chips
│       ├── opportunity-grid.tsx              # Responsive card grid container
│       ├── opportunity-card.tsx              # Individual opportunity card component
│       ├── opportunity-card-skeleton.tsx     # Skeleton loading state for card
│       ├── sort-dropdown.tsx                 # Sort selection dropdown
│       ├── results-count.tsx                 # "Showing X-Y of Z results" text
│       ├── pagination-controls.tsx           # Pagination buttons and page numbers
│       ├── page-size-selector.tsx            # Page size dropdown (12/20/50/100)
│       ├── save-button.tsx                   # Save/unsave heart button (card variant)
│       ├── empty-state.tsx                   # No results empty state with suggestions
│       ├── detail/
│       │   ├── detail-header.tsx             # Title, org, meta row on detail page
│       │   ├── detail-content-tabs.tsx       # Overview/Requirements/Benefits/How to Apply tabs
│       │   ├── detail-description.tsx        # Markdown rendered description
│       │   ├── detail-requirements.tsx       # Requirements list with eligibility indicators
│       │   ├── detail-benefits.tsx           # Benefits section
│       │   ├── detail-skills-list.tsx        # All skills with proficiency and met/unmet state
│       │   ├── detail-sidebar.tsx            # Right sidebar container (sticky)
│       │   ├── detail-action-card.tsx        # Apply/Save/Share action buttons card
│       │   ├── detail-deadline-card.tsx      # Deadline countdown/display card
│       │   ├── match-score-card.tsx          # AI match score with dimensions
│       │   ├── eligibility-card.tsx          # Eligibility checklist card
│       │   ├── organization-card.tsx         # Organization info card
│       │   ├── related-opportunities.tsx     # Related opportunities row
│       │   ├── apply-drawer.tsx              # Apply flow sheet/drawer
│       │   ├── apply-cover-letter.tsx        # Cover letter textarea with char count
│       │   ├── apply-document-upload.tsx     # Document upload zone
│       │   ├── apply-additional-fields.tsx   # Dynamic additional question fields
│       │   ├── apply-review.tsx              # Review step before submission
│       │   ├── apply-success.tsx             # Submission success state
│       │   ├── share-modal.tsx               # Share dialog with copy/social options
│       │   └── expired-banner.tsx            # Banner for closed opportunities
│       └── login-prompt-dialog.tsx           # Dialog prompting unauthenticated users to sign in
├── hooks/
│   └── marketplace/
│       ├── use-opportunity-filters.ts        # URL-based filter state management hook
│       ├── use-debounced-search.ts           # Search with debounce + abort controller
│       ├── use-opportunities-query.ts        # React Query hook for fetching opportunity list
│       ├── use-opportunity-detail.ts         # React Query hook for single opportunity
│       ├── use-match-score.ts                # React Query hook for match score fetch
│       ├── use-save-opportunity.ts           # Mutation hook for save/unsave with optimistic UI
│       ├── use-apply-mutation.ts             # Mutation hook for application submission
│       ├── use-file-upload.ts                # File upload hook with progress tracking
│       ├── use-category-counts.ts            # Hook for category tab counts
│       └── use-filter-options.ts             # Hook for loading filter option data (countries, skills, industries)
├── stores/
│   └── marketplace/
│       ├── saved-opportunities-store.ts      # Zustand store for saved opportunity IDs (optimistic)
│       └── apply-draft-store.ts              # Zustand store for application draft persistence
├── lib/
│   └── marketplace/
│       ├── search-utils.ts                   # Search query sanitization, highlight generation
│       ├── filter-utils.ts                   # URL param parsing, filter serialization/deserialization
│       ├── duration-utils.ts                 # Duration normalization, display formatting
│       ├── deadline-utils.ts                 # Deadline urgency calculation, display formatting
│       ├── match-score-utils.ts              # Score grade determination, color mapping
│       ├── eligibility-utils.ts              # Client-side eligibility check logic
│       ├── reference-number.ts               # Application reference number generation
│       ├── query-builder.ts                  # Dynamic Supabase query construction from filters
│       └── constants.ts                      # Category definitions, sort options, filter defaults, limits
├── types/
│   └── marketplace/
│       ├── opportunity.ts                    # TypeScript types for opportunity entities
│       ├── filters.ts                        # Filter state types, URL param types
│       ├── search.ts                         # Search-related types
│       ├── application.ts                    # Application entity and form types
│       └── match-score.ts                    # Match score response types
├── validators/
│   └── marketplace/
│       ├── filter-params.schema.ts           # Zod schema for validating filter query params
│       ├── application.schema.ts             # Zod schema for application submission
│       └── upload.schema.ts                  # Zod schema for file upload validation
└── __tests__/
    └── marketplace/
        ├── category-tabs.test.tsx            # Category tab rendering and interaction tests
        ├── search-bar.test.tsx               # Search debounce, clear, edge case tests
        ├── filter-panel.test.tsx             # Filter application, URL sync tests
        ├── opportunity-card.test.tsx         # Card rendering, save interaction tests
        ├── pagination.test.tsx               # Pagination logic and boundary tests
        ├── detail-page.test.tsx              # Detail page rendering and state tests
        ├── apply-drawer.test.tsx             # Apply flow validation and submission tests
        ├── use-debounced-search.test.ts      # Hook unit tests
        ├── use-save-opportunity.test.ts      # Optimistic save hook tests
        ├── filter-utils.test.ts              # URL serialization/deserialization tests
        ├── eligibility-utils.test.ts         # Eligibility logic tests
        └── query-builder.test.ts             # Dynamic query construction tests
```