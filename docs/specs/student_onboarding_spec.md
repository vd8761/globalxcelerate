# Module Spec: Student Onboarding

## 1. Overview & Purpose

The Student Onboarding module provides an 8-step progressive wizard that guides newly registered students through building their complete profile on GlobalXcelerate. It collects identity details, education history, skills inventory, professional experience, career goals, global mobility preferences, and portfolio items — culminating in a profile summary with initial GX Score calculation. The wizard features real-time auto-save on field blur, importance-weighted profile completion tracking, step-level Zod validation, and persistent form state via Zustand so students can leave and resume without data loss.

- **Who uses it:** Students (primary), System (triggers GX Score calculation on completion)
- **Key screens:** `/(student)/onboarding` (wizard container), `/(student)/onboarding/[step]` (individual steps 1-8)
- **Connections:** Reads authenticated user from `authentication` module; renders within `app_shell` layout (minimal chrome variant — no sidebar, only top logo bar); on completion writes to `student_profiles`, `student_education`, `student_skills`, `student_experiences`, `student_career_goals`, `student_global_preferences`, `student_portfolio_items` tables; triggers GX Score engine; redirects to Student Dashboard.
- **Does NOT do:** Does not handle user registration/sign-up (that's `authentication`); does not calculate the full GX Score algorithm (calls the scoring service); does not manage profile editing post-onboarding (that's `student_profile` module); does not handle employer or university onboarding flows.

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

Module-specific UI overrides:
- **Wizard container:** Full-viewport height with centered content area (max-width 720px), subtle navy-50 background
- **Progress bar:** Fixed at top of wizard area, segmented into 8 equal blocks with navy-600 fill for completed, cyan-500 for active, gray-200 for pending. Animated width transitions (300ms ease-in-out). Percentage label right-aligned above bar in `text-sm font-medium text-navy-700`
- **Step titles:** `text-2xl font-bold text-navy-900` with subtitle in `text-base text-gray-600`
- **Form cards:** White background with `rounded-xl shadow-sm border border-gray-100 p-6 md:p-8`
- **Multi-entry sections (Education, Experience, Portfolio):** Each entry in a collapsible card with gray-50 background, drag handle icon for reordering, destructive red delete icon (top-right)
- **Navigation buttons:** "Back" as ghost variant left-aligned, "Next" / "Save & Continue" as primary navy-600 right-aligned, "Skip" as link variant centered below
- **Auto-save indicator:** Small pill in top-right of form area showing "Saving..." (with spinner) / "All changes saved" (with check icon) / "Save failed" (with retry link) — uses `text-xs` with appropriate color coding
- **Completion step (Step 8):** Celebratory layout with confetti animation (lightweight CSS-based), large circular GX Score gauge centered, profile card preview

## 3. Features & Functional Requirements

### 3.1 Wizard Navigation & Progress Tracking

**User Flow:**
1. After first login (when `onboarding_completed === false`), student is redirected to `/(student)/onboarding`
2. The wizard loads the last incomplete step (persisted in `onboarding_progress` record)
3. Student sees the progress bar at top showing 8 segments with current completion percentage
4. Student fills out the current step and clicks "Next" to advance
5. Student can click "Back" to revisit previous steps without losing data
6. Student can click individual completed step indicators to jump back
7. Optional steps show "Skip" link below the navigation buttons
8. On reaching Step 8 and confirming, onboarding is marked complete

**UI Layout & Components:**
- `OnboardingLayout` — minimal app shell wrapper with logo top-left, "Save & Exit" link top-right
- `ProgressBar` — segmented horizontal bar with step numbers inside circles below each segment
- `StepIndicator` — individual step circle (states: completed with checkmark, active with filled dot, pending with empty circle, skipped with dash)
- `NavigationFooter` — fixed bottom bar with Back/Skip/Next buttons, keyboard shortcut hints (Enter for next, Escape for back)
- `AutoSaveIndicator` — floating pill component showing save state

**Business Rules:**
- Steps 1 (Identity), 2 (Education), and 3 (Skills) are mandatory and cannot be skipped
- Steps 4 (Experience), 5 (Career Goals), 6 (Global Preferences), and 7 (Portfolio) are optional and can be skipped
- Skipped steps contribute 0% to profile completion but do not block onboarding completion
- Completion percentage is weighted: Identity 15%, Education 20%, Skills 20%, Experience 15%, Career Goals 10%, Global Preferences 10%, Portfolio 10%
- Within each step, individual field completions contribute proportionally to that step's weight
- Step 8 is a read-only summary and always accessible once all mandatory steps are complete
- Maximum time to complete onboarding: no enforced limit (wizard persists indefinitely)

**State Machine:**
```
States: NOT_STARTED → IN_PROGRESS → COMPLETED
Step States: PENDING → ACTIVE → COMPLETED | SKIPPED

Transitions:
- NOT_STARTED → IN_PROGRESS: User lands on wizard for first time
- IN_PROGRESS → IN_PROGRESS: User completes/skips a step
- IN_PROGRESS → COMPLETED: User confirms on Step 8
- COMPLETED → (no transitions back; redirects to dashboard)

Step Transitions:
- PENDING → ACTIVE: User navigates to step
- ACTIVE → COMPLETED: Validation passes and user clicks Next
- ACTIVE → SKIPPED: User clicks Skip (only optional steps)
- COMPLETED → ACTIVE: User navigates back to edit
- SKIPPED → ACTIVE: User navigates back to fill
```

**Edge Cases:**
- User closes browser mid-step: Auto-saved data persists; on return, step resumes with last saved values
- User has no education yet (incoming freshman): Minimum 1 education entry required; "Expected" status option available
- Network failure during auto-save: Show error indicator, queue retry with exponential backoff (max 3 retries), then show persistent error with manual retry button
- User navigates directly to a step URL beyond their progress: Redirect to their actual current step
- User completes onboarding in one session vs. multiple sessions: Both supported; progress tracked server-side
- User has existing partial data from OAuth profile (name, email, photo): Pre-fill from auth metadata

**Acceptance Criteria:**
- Progress bar accurately reflects weighted completion at all times
- All mandatory steps must be completed before Step 8 is accessible
- Form state persists across browser sessions (verified by closing and reopening)
- URL reflects current step (`/(student)/onboarding/identity`, `/(student)/onboarding/education`, etc.)
- Keyboard navigation works: Tab through fields, Enter to submit step, Escape to go back
- Step transitions animate smoothly (slide-left for forward, slide-right for backward, 200ms)

### 3.2 Step 1: Identity

**User Flow:**
1. Student sees form with personal identity fields
2. Fields are pre-filled from auth provider metadata where available (name, email, photo)
3. Student uploads profile photo (or keeps OAuth-provided one)
4. Student fills required fields and optional bio
5. On "Next", Zod validates all required fields before advancing

**UI Layout & Components:**
- `IdentityForm` — main form component
- `PhotoUploader` — circular avatar upload area with crop modal (1:1 aspect ratio), accepts JPEG/PNG/WebP, max 5MB
- `CountrySelect` — searchable dropdown with flag icons, powered by ISO 3166-1 country list
- `CityAutocomplete` — async typeahead searching cities based on selected country
- `DatePicker` — DOB picker with year/month/day dropdowns, max date = today minus 14 years
- `TextArea` — bio field with character counter (max 500)

**Business Rules:**
- Required fields: first_name, last_name, date_of_birth, nationality, country_of_residence, city
- Optional fields: middle_name, preferred_name, bio, profile_photo, phone_number, gender, pronouns
- First name and last name: 1-50 characters, letters/hyphens/apostrophes/spaces only
- Date of birth: Must be between 14 and 80 years old relative to current date
- Nationality: Valid ISO 3166-1 alpha-2 country code
- Bio: Maximum 500 characters, plain text only
- Profile photo: Stored in Supabase Storage bucket `profile-photos`, path: `{user_id}/avatar.{ext}`
- Photo is resized server-side to 400x400px and a 80x80px thumbnail is generated
- Phone number: Optional, validated with E.164 format if provided

**State Machine:**
```
EMPTY → PARTIAL (any field filled) → VALID (all required pass validation) → SAVED (API confirms)
```

**Edge Cases:**
- OAuth provides a photo URL but it's expired/broken: Show placeholder, prompt upload
- User selects nationality that differs from residence: Valid scenario, no warning needed
- Special characters in names (é, ñ, 李): Full UTF-8 support, no ASCII restriction
- User clears a pre-filled field: Allowed, but validation will catch empty required fields on Next

**Acceptance Criteria:**
- Photo upload shows preview immediately (optimistic) with upload progress indicator
- Country selection filters city options appropriately
- DOB validation shows inline error for invalid ages
- Pre-filled OAuth data is editable
- Auto-save triggers 500ms after last field blur
- Form maintains scroll position on validation error (scrolls to first error)

### 3.3 Step 2: Education

**User Flow:**
1. Student sees "Add Education" button and empty state illustration
2. Student clicks to add first education entry (opens inline form card)
3. Student fills institution, degree level, field of study, GPA, dates
4. Student can add multiple education entries (no hard limit, soft guidance max 10)
5. Entries are displayed as collapsible cards sorted by start date descending
6. On "Next", at least one completed education entry is required

**UI Layout & Components:**
- `EducationList` — container managing multiple `EducationEntry` cards
- `EducationEntry` — collapsible card with form fields, expand/collapse toggle, delete button
- `InstitutionAutocomplete` — async search against `institutions` reference table (top universities pre-loaded), with "Add custom" option
- `DegreeSelect` — dropdown with values: High School Diploma, Associate, Bachelor's, Master's, Doctorate/PhD, Professional Degree, Certificate, Diploma
- `FieldOfStudyAutocomplete` — searchable from `fields_of_study` reference table
- `GPAInput` — numeric input with scale selector (4.0, 5.0, 7.0, 10.0, 100, percentage)
- `DateRangeInputs` — month/year pickers for start and end (or "Present" toggle)
- `AddEntryButton` — dashed border card with plus icon at bottom of list

**Business Rules:**
- Minimum 1 education entry required to proceed
- Required per entry: institution_name, degree_level, field_of_study, start_date
- Optional per entry: gpa_value, gpa_scale, end_date, description, is_current, honors, thesis_title
- If `is_current` is true, `end_date` must be null
- If `is_current` is false and `end_date` is null, entry is treated as status "Expected"
- GPA is normalized internally to a 0-4.0 scale for comparison purposes
- Start date cannot be in the future by more than 6 months
- End date must be after start date
- Institution name: 2-200 characters
- Field of study: 2-100 characters
- Description: max 1000 characters
- Each entry gets a UUID `id` on creation (client-generated for optimistic saves)

**State Machine:**
```
Per entry: DRAFTING → VALID → SAVED
List level: EMPTY → HAS_ENTRIES (≥1 valid) → READY_TO_PROCEED
```

**Edge Cases:**
- User adds entry then deletes all entries: Block "Next" with inline message "At least one education entry required"
- Institution not in autocomplete list: Allow free-text entry, flag as "unverified" (no user-facing impact, admin review later)
- User currently enrolled (no end date): Toggle "I'm currently studying here" checkbox
- GPA on unusual scale (e.g., German 1.0-5.0 where 1.0 is best): Scale selector handles inversion
- Overlapping date ranges between entries: Allowed (e.g., dual enrollment)
- Very old education (20+ years ago): Valid, no restriction

**Acceptance Criteria:**
- Adding/removing entries updates the list in real-time without page reload
- Institution autocomplete shows results within 300ms of typing (debounced)
- Each entry auto-saves independently on field blur
- Validation errors show per-entry (not blocking other entries)
- Empty required fields highlighted with red border and helper text on "Next" attempt
- Entries can be reordered via drag handles (updates display_order)
- "Next" button disabled state with tooltip when no valid entries exist

### 3.4 Step 3: Skills

**User Flow:**
1. Student sees a search input to find skills from the master catalog
2. Student types to search, sees matching skills with category tags
3. Student selects skills which appear as tags in a "Selected Skills" area
4. For each selected skill, student sets proficiency level (1-5 stars or labeled slider)
5. Student can add custom skills not in the catalog
6. Minimum 3 skills required to proceed

**UI Layout & Components:**
- `SkillSearch` — input with magnifying glass icon, debounced (200ms) search against `skills_master` table
- `SkillResults` — dropdown list showing matching skills with category badge (Technical, Soft, Language, Tool, Domain)
- `SelectedSkillsList` — grid of skill chips/cards showing name + proficiency control
- `ProficiencySelector` — 5-level selector (Beginner, Elementary, Intermediate, Advanced, Expert) with star or dot visualization
- `CustomSkillInput` — text input + "Add" button for skills not in catalog, triggers creation of pending skill entry
- `SkillCategoryFilter` — horizontal tab filter above search results (All, Technical, Soft Skills, Languages, Tools, Domain-specific)
- `MinimumSkillsIndicator` — subtle text showing "3 of minimum 3 skills selected" counter

**Business Rules:**
- Skills are sourced from `skills_master` table (~2000 pre-loaded skills)
- Minimum 3 skills required, recommended 8-15 (show guidance message)
- Maximum 50 skills allowed
- Each skill must have a proficiency level set (1-5); defaults to 3 (Intermediate) on selection
- Custom skills are created with `is_verified = false` and `source = 'user_submitted'`
- Custom skill names: 2-60 characters, no duplicates (case-insensitive check against existing)
- Proficiency levels: 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert
- Duplicate skills cannot be added (check by skill_id for catalog, name for custom)
- Skills contribute to GX Score and matching algorithm
- Removing a skill removes it from the student's profile entirely (soft delete not needed at this stage)

**State Machine:**
```
EMPTY (0 skills) → BELOW_MINIMUM (1-2 skills) → VALID (3+ skills) → SAVED
```

**Edge Cases:**
- User types skill that has near-matches: Show fuzzy results with "Did you mean..." suggestions using trigram similarity
- User adds same skill twice: Prevent with toast notification "Skill already added"
- User reaches 50 skill limit: Disable search input, show message "Maximum skills reached. Remove one to add another."
- User sets all skills to Beginner (1): Valid but show coaching message "Consider adding skills you're more proficient in for better matching"
- Search returns no results: Show "No matching skills found. Add as custom skill?" CTA
- Skills master catalog is unavailable: Fallback to cached list (stale-while-revalidate), allow custom entry only if cache miss

**Acceptance Criteria:**
- Search results appear within 200ms of typing pause
- Selected skills persist immediately (optimistic update + background save)
- Proficiency changes auto-save on change event
- Skill removal has confirmation for skills with proficiency ≥ 4 ("Are you sure? This is one of your top skills")
- Category filter reduces search scope instantly
- Minimum 3 skills indicator clearly communicates requirement
- Custom skill creation shows success toast and adds to selected list immediately
- Keyboard accessible: Arrow keys navigate results, Enter selects, Backspace removes last added

### 3.5 Step 4: Experience

**User Flow:**
1. Student sees experience type selector (9 types displayed as icon cards)
2. Student selects an experience type to start adding an entry
3. Form expands with fields specific to that experience type
4. Student fills details and can add multiple entries of any type
5. Entries are grouped by type and displayed as timeline cards
6. Step is optional — student can skip

**UI Layout & Components:**
- `ExperienceTypeSelector` — 3x3 grid of icon cards for types: Internship, Full-time Employment, Part-time Employment, Freelance/Contract, Volunteering, Research, Student Organization, Personal Project, Other
- `ExperienceList` — timeline-style layout grouping entries by type
- `ExperienceEntry` — expandable card form with type-specific fields
- `SkillsUsedSelector` — mini version of skills search that links to already-added skills from Step 3 plus ability to add new
- `OutcomesList` — dynamic list input for achievements/outcomes (bullet points)
- `AddExperienceButton` — floating action button or bottom card for new entries

**Business Rules:**
- Experience types enum: `INTERNSHIP`, `FULL_TIME`, `PART_TIME`, `FREELANCE`, `VOLUNTEERING`, `RESEARCH`, `STUDENT_ORG`, `PERSONAL_PROJECT`, `OTHER`
- Required per entry: type, title, organization_name, start_date
- Optional per entry: description (max 2000 chars), end_date, is_current, location, skills_used (array of skill_ids), outcomes (array of strings, max 10), url
- Title: 2-100 characters
- Organization name: 2-150 characters
- If `is_current` is true, `end_date` must be null
- Start date cannot be before user's 14th birthday (derived from DOB in Step 1)
- End date cannot be in the future by more than 1 month
- Maximum 30 experience entries total across all types
- Skills used must reference skills that exist in the student's skill set (from Step 3) or will be auto-added
- Outcomes: each max 200 characters
- Entries sorted by start_date descending within each type group

**State Machine:**
```
EMPTY (no entries) → HAS_ENTRIES (≥1 valid entry) → SAVED
Since optional: EMPTY → SKIPPED is valid transition on "Skip" click
```

**Edge Cases:**
- User references skills not yet in their profile: Auto-add skill to profile with proficiency 3 (show toast notification "Skill X added to your profile")
- User has gaps between experiences: Valid, no gap analysis shown
- Current role without end date at a past organization: Valid (organization may still exist)
- Very short experience (same start/end month): Valid, minimum duration is 0 (same month)
- User deletes all entries after having some: Step reverts to optional-empty state, "Skip" becomes available again
- Experience at same organization with different roles: Allowed as separate entries

**Acceptance Criteria:**
- Type selector cards show hover state and selected state clearly
- Adding entry scrolls to the new form smoothly
- Timeline visualization shows duration bars proportional to actual time
- Skills used selector only shows skills from the student's profile by default
- Outcomes list supports drag reordering
- Each entry auto-saves independently
- "Skip" button visible and functional when no entries exist
- If entries exist, "Skip" is hidden and "Next" is shown instead

### 3.6 Step 5: Career Goals

**User Flow:**
1. Student sees career preference form sections
2. Student selects preferred industries (multi-select)
3. Student selects preferred job functions (multi-select)
4. Student selects preferred countries for work (multi-select)
5. Student indicates work mode preference and salary expectations
6. Student sets availability date and mobility readiness
7. Step is optional — student can skip

**UI Layout & Components:**
- `IndustrySelector` — searchable multi-select from industries reference list (max 5)
- `FunctionSelector` — searchable multi-select from job functions reference list (max 5)
- `CountryMultiSelect` — searchable multi-select with flag icons (max 10)
- `WorkModeRadio` — radio group: Remote, Hybrid, On-site, No Preference
- `SalaryRangeInput` — currency selector + min/max range inputs with "Prefer not to say" toggle
- `AvailabilityDatePicker` — month/year picker for earliest available date
- `MobilityReadinessSlider` — labeled slider 1-5 (Not Ready → Fully Mobile)
- `VisaNeedsToggle` — toggle with conditional dropdown for visa type needed

**Business Rules:**
- Preferred industries: Select from reference list of ~50 industries, max 5 selections
- Preferred functions: Select from reference list of ~40 functions, max 5 selections
- Preferred countries: Max 10 countries
- Work mode: Single selection from enum: `REMOTE`, `HYBRID`, `ONSITE`, `NO_PREFERENCE`
- Salary range: Optional; if provided, must have currency (ISO 4217) and at least min value; max must be ≥ min
- Salary period: `HOURLY`, `MONTHLY`, `ANNUAL`
- Availability date: Must be today or future, max 2 years in future
- Mobility readiness: Integer 1-5, default null (unset)
- Visa sponsorship needed: Boolean + optional free-text field for specific visa types (max 200 chars)
- All fields optional individually; step itself is optional
- Data feeds into opportunity matching algorithm with high weight

**State Machine:**
```
EMPTY → PARTIAL (any field filled) → SAVED
EMPTY → SKIPPED
```

**Edge Cases:**
- User selects salary in uncommon currency: Support all ISO 4217 currencies
- User sets availability in the past: Validation error "Please select today or a future date"
- User selects "Remote" work mode but no preferred countries: Valid (remote is location-independent)
- User selects max 5 industries and tries to add more: Disabled state with tooltip "Maximum 5 industries. Remove one to add another"
- Salary expectations of 0: Valid (volunteer/unpaid preferences)

**Acceptance Criteria:**
- Multi-select components show selected count badges
- Selections persist immediately with auto-save
- Mobility readiness slider shows descriptive label for each level
- Salary inputs format with thousand separators on blur
- "Skip" visible when form is empty, hidden when any field has value (show "Next" instead)
- All reference lists load within 200ms (cached client-side after first fetch)
- Form sections use accordion-style collapsible groups on mobile

### 3.7 Step 6: Global Preferences

**User Flow:**
1. Student adds languages they speak with proficiency levels
2. Student selects preferred program types for global experiences
3. Student indicates willingness to relocate with conditions
4. Step is optional — student can skip

**UI Layout & Components:**
- `LanguageList` — list of language entries with add/remove
- `LanguageEntry` — row with language searchable dropdown + proficiency dropdown (A1, A2, B1, B2, C1, C2 / Native)
- `ProgramTypeSelector` — checkbox group for: Study Abroad, Exchange Program, International Internship, Global Immersion, Research Abroad, Volunteer Abroad, Short-term Program (< 3 months), Long-term Program (> 6 months)
- `RelocationWillingness` — radio group: Yes (anywhere), Yes (with conditions), No, Undecided
- `RelocationConditions` — conditional textarea (shown when "with conditions" selected), max 500 chars
- `CulturalInterests` — tag input for cultural areas of interest (free-text tags, max 10)
- `TravelExperience` — dropdown: No international travel, 1-2 countries, 3-5 countries, 6-10 countries, 10+ countries

**Business Rules:**
- Languages: Select from ISO 639-1 language list (~200 languages)
- Language proficiency: CEFR scale (A1, A2, B1, B2, C1, C2) plus NATIVE option
- Minimum 1 language if any are added (no empty entries)
- Maximum 15 languages
- Duplicate languages not allowed
- Preferred program types: Multi-select, no limit
- Relocation willingness: Single select from enum: `YES_ANYWHERE`, `YES_WITH_CONDITIONS`, `NO`, `UNDECIDED`
- Relocation conditions: Required if willingness is `YES_WITH_CONDITIONS`, max 500 chars
- Cultural interests: Free-text tags, 2-50 chars each, max 10
- Travel experience: Optional single select, informational only (not used in matching directly)
- All fields contribute to global readiness sub-score of GX Score

**State Machine:**
```
EMPTY → PARTIAL → SAVED
EMPTY → SKIPPED
```

**Edge Cases:**
- User lists language with same proficiency as another: Valid (multiple languages at same level)
- User selects "Native" for 5+ languages: Valid, no restriction
- User marks "No" for relocation but selects global program types: Valid (programs may be virtual)
- Language search finds no match: Allow "Other" option with free-text language name

**Acceptance Criteria:**
- Language proficiency levels show tooltips explaining each CEFR level
- Program types show brief description below each checkbox
- Conditional fields appear/disappear with smooth animation
- Minimum one language entry validation only if user has started adding (skip allows zero)
- Auto-save on each individual field change
- Tags in cultural interests are removable with X button and keyboard (Backspace)

### 3.8 Step 7: Portfolio

**User Flow:**
1. Student sees sections for Projects, Publications, Achievements, Media, External Links
2. Student adds items to any section
3. Each section supports multiple entries with specific field schemas
4. Media items support file uploads (PDF, images, video links)
5. Step is optional — student can skip

**UI Layout & Components:**
- `PortfolioSections` — tabbed or accordion layout for 5 sub-sections
- `ProjectEntry` — title, description, URL, skills used, date, media attachments
- `PublicationEntry` — title, publication venue, date, URL, DOI, co-authors
- `AchievementEntry` — title, issuing org, date, description, credential URL
- `MediaUploader` — drag-and-drop area supporting PDF, JPEG, PNG, MP4 links, max 10MB per file
- `ExternalLinkEntry` — label + URL pairs (GitHub, LinkedIn, personal site, etc.)
- `FilePreview` — thumbnail preview for uploaded files with download/delete actions
- `AddItemButton` — per-section add button with entry type label

**Business Rules:**
- Projects: title (required, 2-150 chars), description (optional, max 2000 chars), project_url (optional, valid URL), skills_used (optional, from profile skills), start_date (optional), end_date (optional), media (optional, max 5 files)
- Publications: title (required, 2-300 chars), venue (optional, 2-200 chars), publication_date (optional), url (optional), doi (optional, validated format), co_authors (optional, comma-separated text max 500 chars)
- Achievements: title (required, 2-200 chars), issuer (optional, 2-150 chars), date_awarded (optional), description (optional, max 1000 chars), credential_url (optional, valid URL)
- Media uploads: Stored in Supabase Storage bucket `portfolio-media`, path: `{user_id}/portfolio/{item_id}/{filename}`
- Supported file types: PDF, JPEG, PNG, WebP, GIF (max 10MB per file, max 20 files total across all entries)
- External links: label (required, 2-50 chars) + url (required, valid URL format), max 10 links
- Maximum entries per section: Projects 20, Publications 20, Achievements 30, External Links 10
- Total portfolio items cap: 80 items across all sections
- Entries within each section can be reordered (display_order field)

**State Machine:**
```
EMPTY → HAS_ITEMS (≥1 item in any section) → SAVED
EMPTY → SKIPPED
```

**Edge Cases:**
- Large file upload on slow connection: Show progress bar, allow cancellation, resume on retry not supported (restart upload)
- File upload fails: Show error on specific file, don't block other operations
- Invalid URL format: Inline validation on blur with "Please enter a valid URL (e.g., https://...)"
- User pastes DOI without "https://doi.org/" prefix: Auto-prepend if bare DOI detected (10.xxxx/xxxx format)
- User uploads non-allowed file type: Show error immediately, don't initiate upload
- Storage quota exceeded: Show clear error "Storage limit reached. Remove files to add more"

**Acceptance Criteria:**
- File drag-and-drop works with visual drop zone indicator
- Upload progress shown per file with percentage
- Successfully uploaded files show thumbnail/icon preview
- Section item counts shown in section headers
- Portfolio items are searchable/filterable within the step (when many items)
- Reordering via drag-and-drop updates display_order
- "Skip" available only when all sections are empty
- File size validation happens client-side before upload attempt

### 3.9 Step 8: Profile Complete

**User Flow:**
1. Student arrives at summary page showing their completed profile overview
2. GX Score is calculated and displayed with animated counter
3. Profile completion percentage shown with breakdown by section
4. Student sees "Share Profile" CTA and "Go to Dashboard" primary action
5. On clicking "Complete Onboarding", onboarding_completed flag is set to true
6. Student is redirected to dashboard

**UI Layout & Components:**
- `ProfileSummaryCard` — compact profile card with photo, name, headline, top skills
- `GXScoreGauge` — animated radial gauge showing initial score (0-100) with grade badge (A+/A/B+/B/C+/C/D)
- `CompletionBreakdown` — horizontal stacked bar showing per-section completion percentages
- `SectionSummaries` — collapsible sections showing what was entered in each step
- `ImprovementTips` — list of suggestions for improving the profile/score
- `ShareProfileModal` — modal with shareable link, social sharing buttons, QR code
- `ConfettiAnimation` — CSS confetti burst on initial load of this step
- `CompleteButton` — prominent primary CTA "Complete Onboarding & Go to Dashboard"

**Business Rules:**
- GX Score calculation is triggered server-side on reaching Step 8
- Score dimensions: Academic Strength (25%), Skills Depth (25%), Experience Breadth (20%), Global Readiness (15%), Profile Quality (15%)
- Grade mapping: A+ (90-100), A (80-89), B+ (70-79), B (60-69), C+ (50-59), C (40-49), D (0-39)
- Improvement tips are generated based on sections with lowest completion or missing high-weight items
- Maximum 5 improvement tips shown
- Share link format: `https://app.globalxcelerate.com/profile/{student_slug}`
- Profile slug generated from first_name-last_name-random4chars (collision-resistant)
- Confirmation button triggers: set `onboarding_completed = true`, set `onboarding_completed_at = NOW()`, record initial GX score snapshot
- After completion, direct URL access to `/onboarding` redirects to dashboard
- Profile is publicly shareable only after onboarding completion

**State Machine:**
```
VIEWING → CONFIRMED → REDIRECTING (to dashboard)
```

**Edge Cases:**
- GX Score calculation takes > 3 seconds: Show skeleton loading state for score gauge, don't block page render
- Score calculation fails: Show "Score calculating..." message with retry, allow completion without score display
- User refreshes Step 8 multiple times: Idempotent — doesn't re-trigger score calculation if already computed
- User tries to go "Back" from Step 8: Allowed, can edit previous steps, Step 8 recalculates on return
- Profile slug collision: Append additional random characters until unique

**Acceptance Criteria:**
- Confetti animation plays once on first visit (tracked in session state)
- GX Score gauge animates from 0 to final value over 1.5 seconds
- Profile summary accurately reflects all entered data
- Improvement tips are actionable with links to relevant editing sections
- "Complete Onboarding" button requires single click (debounced to prevent double-submission)
- Redirect to dashboard happens within 1 second of confirmation
- Share modal generates working preview link

### 3.10 Auto-Save System

**User Flow:**
1. Student fills in any form field
2. On field blur (or 2 seconds after last keystroke for text areas), data is queued for save
3. Auto-save indicator shows "Saving..." state
4. On success, indicator shows "All changes saved" with timestamp
5. On failure, indicator shows "Save failed" with retry option

**UI Layout & Components:**
- `AutoSaveProvider` — context provider wrapping entire wizard
- `AutoSaveIndicator` — positioned top-right of form area, compact pill design
- `SaveQueueManager` — internal service managing batched saves

**Business Rules:**
- Debounce interval: 500ms after last field blur event
- For long text fields (description, bio): Save 2000ms after last keystroke (while typing indicator shows "Unsaved changes")
- Batch multiple field changes into single API call per step
- Queue persists in Zustand store (survives component unmounts within session)
- On network recovery, flush pending queue immediately
- Save payload includes only changed fields (diff against last saved state)
- Optimistic UI: Form never blocks on save completion
- Failed saves are retried: 3 attempts with exponential backoff (1s, 2s, 4s)
- After 3 failures: Stop auto-retry, show persistent error, require manual retry
- localStorage backup: Critical form data backed up to localStorage every 10 seconds as crash recovery
- On page load: Check localStorage for newer data than server state, prompt "Unsaved changes found. Restore?"

**State Machine:**
```
IDLE → DIRTY (field changed) → DEBOUNCING (timer running) → SAVING (API call in flight) → IDLE (success) | ERROR (failure)
ERROR → RETRYING → IDLE | ERROR
```

**Edge Cases:**
- User navigates to next step with unsaved changes: Flush save queue before navigation (await with 3s timeout, proceed anyway on timeout)
- Concurrent saves for same step: Queue ensures sequential execution (no parallel saves for same step)
- User goes offline mid-session: Detect offline state, pause save queue, show "Offline - changes saved locally" indicator
- Browser crashes: localStorage backup enables recovery on next visit
- User has two tabs open: Last-write-wins with timestamp comparison, show "Data updated in another tab" notification

**Acceptance Criteria:**
- Auto-save triggers within 500ms of field blur
- Indicator accurately reflects current save state at all times
- No data loss when closing browser (verified by localStorage backup)
- Failed save shows clear error with actionable retry button
- Network recovery triggers automatic queue flush
- Save operations don't block form interactions
- Batching reduces API calls (multiple fields changed rapidly = single call)

### 3.11 Profile Completion Calculation

**User Flow (Background):**
1. As student fills each step, completion percentage updates in real-time in progress bar
2. Completion is weighted by step importance
3. Within each step, individual fields contribute proportionally

**Business Rules:**
- Step weights: Identity 15%, Education 20%, Skills 20%, Experience 15%, Career Goals 10%, Global Preferences 10%, Portfolio 10%
- Per-step internal field weights (Identity example):
  - first_name: 20%, last_name: 20%, dob: 15%, nationality: 15%, country: 10%, city: 10%, photo: 5%, bio: 5%
- Education step: Each entry contributes equally; having 1 complete entry = 60% of step, 2 entries = 80%, 3+ = 100%
- Skills step: 3 skills = 50%, 5 skills = 70%, 8 skills = 85%, 12+ skills = 100% (with proficiency set for all)
- Experience step: 0 entries = 0%, 1 entry = 50%, 2 entries = 75%, 3+ entries = 100%
- Career Goals: Each section within has equal weight (industries, functions, countries, work mode, salary, availability, mobility, visa = 12.5% each)
- Global Preferences: Languages 40%, program types 30%, relocation 20%, other 10%
- Portfolio: Any 1 item = 30%, 3 items = 60%, 5+ items = 100%
- Overall formula: `sum(step_weight * step_completion_percentage)` for all steps
- Skipped steps count as 0% completion for that step's weight
- Completion percentage is persisted server-side on each save and recalculated client-side for instant feedback

**Edge Cases:**
- User completes step then goes back and deletes entries: Completion decreases in real-time
- Rounding: Display rounded to nearest integer, store as float with 2 decimal places
- Maximum 100%: Exceeding entries beyond threshold doesn't exceed 100% for that step

**Acceptance Criteria:**
- Progress bar updates within 100ms of field change (client-side calculation)
- Server-side and client-side calculations produce identical results (tested with shared algorithm)
- Completion percentage matches expectations for standard profiles (test fixtures provided)
- Percentage always between 0 and 100, never NaN or negative

## 4. Data Models

### student_profiles (extends auth.users)

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK, FK → auth.users.id | - |
| first_name | VARCHAR(50) | NOT NULL | - |
| last_name | VARCHAR(50) | NOT NULL | - |
| middle_name | VARCHAR(50) | NULLABLE | NULL |
| preferred_name | VARCHAR(50) | NULLABLE | NULL |
| date_of_birth | DATE | NOT NULL | - |
| gender | VARCHAR(20) | NULLABLE | NULL |
| pronouns | VARCHAR(30) | NULLABLE | NULL |
| nationality | CHAR(2) | NOT NULL, FK → countries.code | - |
| country_of_residence | CHAR(2) | NOT NULL, FK → countries.code | - |
| city | VARCHAR(100) | NOT NULL | - |
| phone_number | VARCHAR(20) | NULLABLE | NULL |
| bio | TEXT | NULLABLE, max 500 | NULL |
| profile_photo_url | TEXT | NULLABLE | NULL |
| profile_photo_thumbnail_url | TEXT | NULLABLE | NULL |
| profile_slug | VARCHAR(80) | UNIQUE, NOT NULL | - |
| onboarding_completed | BOOLEAN | NOT NULL | false |
| onboarding_completed_at | TIMESTAMPTZ | NULLABLE | NULL |
| current_onboarding_step | SMALLINT | NOT NULL | 1 |
| profile_completion_percentage | DECIMAL(5,2) | NOT NULL | 0.00 |
| gx_score | DECIMAL(5,2) | NULLABLE | NULL |
| gx_grade | VARCHAR(2) | NULLABLE | NULL |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_profiles_slug` UNIQUE on `profile_slug`
- `idx_student_profiles_nationality` on `nationality`
- `idx_student_profiles_onboarding` on `onboarding_completed`
- `idx_student_profiles_gx_score` on `gx_score DESC NULLS LAST`

### student_education

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| institution_name | VARCHAR(200) | NOT NULL | - |
| institution_id | UUID | NULLABLE, FK → institutions.id | NULL |
| degree_level | degree_level_enum | NOT NULL | - |
| field_of_study | VARCHAR(100) | NOT NULL | - |
| field_of_study_id | UUID | NULLABLE, FK → fields_of_study.id | NULL |
| gpa_value | DECIMAL(5,2) | NULLABLE | NULL |
| gpa_scale | DECIMAL(5,2) | NULLABLE | NULL |
| gpa_normalized | DECIMAL(3,2) | NULLABLE, computed | NULL |
| start_date | DATE | NOT NULL | - |
| end_date | DATE | NULLABLE | NULL |
| is_current | BOOLEAN | NOT NULL | false |
| description | TEXT | NULLABLE, max 1000 | NULL |
| honors | VARCHAR(200) | NULLABLE | NULL |
| thesis_title | VARCHAR(300) | NULLABLE | NULL |
| display_order | SMALLINT | NOT NULL | 0 |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_education_student` on `student_id`
- `idx_student_education_order` on `(student_id, display_order)`

### student_skills

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| skill_id | UUID | NULLABLE, FK → skills_master.id | NULL |
| skill_name | VARCHAR(60) | NOT NULL | - |
| category | skill_category_enum | NOT NULL | - |
| proficiency | SMALLINT | NOT NULL, CHECK(1-5) | 3 |
| is_custom | BOOLEAN | NOT NULL | false |
| is_verified | BOOLEAN | NOT NULL | true |
| source | VARCHAR(20) | NOT NULL | 'onboarding' |
| endorsed_count | INTEGER | NOT NULL | 0 |
| display_order | SMALLINT | NOT NULL | 0 |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_skills_student` on `student_id`
- `idx_student_skills_unique` UNIQUE on `(student_id, skill_id)` WHERE skill_id IS NOT NULL
- `idx_student_skills_custom_unique` UNIQUE on `(student_id, LOWER(skill_name))` WHERE is_custom = true
- `idx_student_skills_proficiency` on `(student_id, proficiency DESC)`

### student_experiences

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| type | experience_type_enum | NOT NULL | - |
| title | VARCHAR(100) | NOT NULL | - |
| organization_name | VARCHAR(150) | NOT NULL | - |
| description | TEXT | NULLABLE, max 2000 | NULL |
| location | VARCHAR(150) | NULLABLE | NULL |
| start_date | DATE | NOT NULL | - |
| end_date | DATE | NULLABLE | NULL |
| is_current | BOOLEAN | NOT NULL | false |
| skills_used | UUID[] | NULLABLE | NULL |
| outcomes | TEXT[] | NULLABLE, max 10 elements | NULL |
| url | TEXT | NULLABLE | NULL |
| display_order | SMALLINT | NOT NULL | 0 |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_experiences_student` on `student_id`
- `idx_student_experiences_type` on `(student_id, type)`
- `idx_student_experiences_dates` on `(student_id, start_date DESC)`

### student_career_goals

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | UNIQUE, NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| preferred_industries | VARCHAR(100)[] | NULLABLE, max 5 | NULL |
| preferred_functions | VARCHAR(100)[] | NULLABLE, max 5 | NULL |
| preferred_countries | CHAR(2)[] | NULLABLE, max 10 | NULL |
| work_mode | work_mode_enum | NULLABLE | NULL |
| salary_min | INTEGER | NULLABLE | NULL |
| salary_max | INTEGER | NULLABLE | NULL |
| salary_currency | CHAR(3) | NULLABLE | NULL |
| salary_period | salary_period_enum | NULLABLE | NULL |
| availability_date | DATE | NULLABLE | NULL |
| mobility_readiness | SMALLINT | NULLABLE, CHECK(1-5) | NULL |
| visa_sponsorship_needed | BOOLEAN | NULLABLE | NULL |
| visa_details | VARCHAR(200) | NULLABLE | NULL |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_career_goals_student` UNIQUE on `student_id`

### student_global_preferences

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | UNIQUE, NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| preferred_program_types | program_type_enum[] | NULLABLE | NULL |
| relocation_willingness | relocation_enum | NULLABLE | NULL |
| relocation_conditions | TEXT | NULLABLE, max 500 | NULL |
| cultural_interests | VARCHAR(50)[] | NULLABLE, max 10 | NULL |
| travel_experience | travel_experience_enum | NULLABLE | NULL |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_global_prefs_student` UNIQUE on `student_id`

### student_languages

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| language_code | VARCHAR(10) | NOT NULL | - |
| language_name | VARCHAR(60) | NOT NULL | - |
| proficiency | language_proficiency_enum | NOT NULL | - |
| is_native | BOOLEAN | NOT NULL | false |
| display_order | SMALLINT | NOT NULL | 0 |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_languages_student` on `student_id`
- `idx_student_languages_unique` UNIQUE on `(student_id, language_code)`

### student_portfolio_items

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| section | portfolio_section_enum | NOT NULL | - |
| title | VARCHAR(300) | NOT NULL | - |
| description | TEXT | NULLABLE, max 2000 | NULL |
| url | TEXT | NULLABLE | NULL |
| doi | VARCHAR(100) | NULLABLE | NULL |
| venue | VARCHAR(200) | NULLABLE | NULL |
| issuer | VARCHAR(150) | NULLABLE | NULL |
| co_authors | TEXT | NULLABLE, max 500 | NULL |
| date_value | DATE | NULLABLE | NULL |
| end_date | DATE | NULLABLE | NULL |
| skills_used | UUID[] | NULLABLE | NULL |
| credential_url | TEXT | NULLABLE | NULL |
| media_urls | TEXT[] | NULLABLE, max 5 | NULL |
| display_order | SMALLINT | NOT NULL | 0 |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_portfolio_student` on `student_id`
- `idx_student_portfolio_section` on `(student_id, section, display_order)`

### student_external_links

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| label | VARCHAR(50) | NOT NULL | - |
| url | TEXT | NOT NULL | - |
| display_order | SMALLINT | NOT NULL | 0 |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |

**Indexes:**
- `idx_student_ext_links_student` on `student_id`

### onboarding_progress (tracks step-level state)

| Field | Type | Constraints | Default |
|-------|------|-------------|---------|
| id | UUID | PK | gen_random_uuid() |
| student_id | UUID | UNIQUE, NOT NULL, FK → student_profiles.id, ON DELETE CASCADE | - |
| step_1_status | step_status_enum | NOT NULL | 'pending' |
| step_2_status | step_status_enum | NOT NULL | 'pending' |
| step_3_status | step_status_enum | NOT NULL | 'pending' |
| step_4_status | step_status_enum | NOT NULL | 'pending' |
| step_5_status | step_status_enum | NOT NULL | 'pending' |
| step_6_status | step_status_enum | NOT NULL | 'pending' |
| step_7_status | step_status_enum | NOT NULL | 'pending' |
| step_8_status | step_status_enum | NOT NULL | 'pending' |
| current_step | SMALLINT | NOT NULL, CHECK(1-8) | 1 |
| last_saved_at | TIMESTAMPTZ | NULLABLE | NULL |
| completion_percentage | DECIMAL(5,2) | NOT NULL | 0.00 |
| started_at | TIMESTAMPTZ | NOT NULL | NOW() |
| completed_at | TIMESTAMPTZ | NULLABLE | NULL |

**Indexes:**
- `idx_onboarding_progress_student` UNIQUE on `student_id`

### Enums

```sql
CREATE TYPE degree_level_enum AS ENUM (
  'high_school', 'associate', 'bachelor', 'master', 'doctorate', 'professional', 'certificate', 'diploma'
);

CREATE TYPE skill_category_enum AS ENUM (
  'technical', 'soft_skill', 'language', 'tool', 'domain'
);

CREATE TYPE experience_type_enum AS ENUM (
  'internship', 'full_time', 'part_time', 'freelance', 'volunteering', 'research', 'student_org', 'personal_project', 'other'
);

CREATE TYPE work_mode_enum AS ENUM (
  'remote', 'hybrid', 'onsite', 'no_preference'
);

CREATE TYPE salary_period_enum AS ENUM (
  'hourly', 'monthly', 'annual'
);

CREATE TYPE relocation_enum AS ENUM (
  'yes_anywhere', 'yes_with_conditions', 'no', 'undecided'
);

CREATE TYPE travel_experience_enum AS ENUM (
  'none', '1_2_countries', '3_5_countries', '6_10_countries', '10_plus_countries'
);

CREATE TYPE language_proficiency_enum AS ENUM (
  'a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native'
);

CREATE TYPE portfolio_section_enum AS ENUM (
  'project', 'publication', 'achievement', 'media', 'external_link'
);

CREATE TYPE step_status_enum AS ENUM (
  'pending', 'active', 'completed', 'skipped'
);

CREATE TYPE program_type_enum AS ENUM (
  'study_abroad', 'exchange_program', 'international_internship', 'global_immersion', 'research_abroad', 'volunteer_abroad', 'short_term', 'long_term'
);
```

## 5. API Contracts

### GET /api/students/onboarding/progress

Returns current onboarding state and step statuses.

**Request:**
- Headers: `Authorization: Bearer <token>`
- No query parameters

**Response 200:**
```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "current_step": 2,
    "step_statuses": {
      "identity": "completed",
      "education": "active",
      "skills": "pending",
      "experience": "pending",
      "career_goals": "pending",
      "global_preferences": "pending",
      "portfolio": "pending",
      "profile_complete": "pending"
    },
    "completion_percentage": 22.50,
    "started_at": "2024-01-15T10:30:00Z",
    "last_saved_at": "2024-01-15T11:45:00Z",
    "completed_at": null
  },
  "error": null,
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-15T12:00:00Z"
  }
}
```

**Response 404 (no onboarding record):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ONBOARDING_NOT_FOUND",
    "message": "No onboarding progress found. Initializing.",
    "details": null
  },
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### PATCH /api/students/onboarding

Saves step data and updates progress. Handles all 7 data steps.

**Request:**
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body:
```json
{
  "step": "identity",
  "data": {
    "first_name": "Jane",
    "last_name": "Doe",
    "date_of_birth": "2000-05-15",
    "nationality": "US",
    "country_of_residence": "GB",
    "city": "London",
    "bio": "Aspiring data scientist...",
    "phone_number": "+447911123456",
    "gender": "female",
    "pronouns": "she/her"
  },
  "action": "save"
}
```

Valid `step` values: `identity`, `education`, `skills`, `experience`, `career_goals`, `global_preferences`, `portfolio`

Valid `action` values: `save` (auto-save, no step advancement), `next` (validate + advance), `skip` (mark skipped + advance)

**Education step data example:**
```json
{
  "step": "education",
  "data": {
    "entries": [
      {
        "id": "uuid-or-null-for-new",
        "institution_name": "University of Oxford",
        "institution_id": "uuid-or-null",
        "degree_level": "master",
        "field_of_study": "Computer Science",
        "gpa_value": 3.8,
        "gpa_scale": 4.0,
        "start_date": "2022-09-01",
        "end_date": null,
        "is_current": true,
        "description": "Focus on AI/ML",
        "honors": "Distinction",
        "thesis_title": null,
        "display_order": 0
      }
    ]
  },
  "action": "next"
}
```

**Skills step data example:**
```json
{
  "step": "skills",
  "data": {
    "skills": [
      {
        "id": "uuid-or-null",
        "skill_id": "uuid-from-master",
        "skill_name": "Python",
        "category": "technical",
        "proficiency": 4,
        "is_custom": false,
        "display_order": 0
      },
      {
        "id": null,
        "skill_id": null,
        "skill_name": "Geospatial Analysis",
        "category": "domain",
        "proficiency": 3,
        "is_custom": true,
        "display_order": 1
      }
    ]
  },
  "action": "next"
}
```

**Experience step data example:**
```json
{
  "step": "experience",
  "data": {
    "entries": [
      {
        "id": "uuid-or-null",
        "type": "internship",
        "title": "Data Science Intern",
        "organization_name": "Google DeepMind",
        "description": "Worked on...",
        "location": "London, UK",
        "start_date": "2023-06-01",
        "end_date": "2023-08-31",
        "is_current": false,
        "skills_used": ["skill-uuid-1", "skill-uuid-2"],
        "outcomes": ["Improved model accuracy by 12%", "Published internal paper"],
        "url": "https://...",
        "display_order": 0
      }
    ]
  },
  "action": "next"
}
```

**Career Goals step data example:**
```json
{
  "step": "career_goals",
  "data": {
    "preferred_industries": ["Technology", "Healthcare", "Finance"],
    "preferred_functions": ["Data Science", "Product Management"],
    "preferred_countries": ["US", "GB", "SG", "DE"],
    "work_mode": "hybrid",
    "salary_min": 60000,
    "salary_max": 90000,
    "salary_currency": "USD",
    "salary_period": "annual",
    "availability_date": "2024-09-01",
    "mobility_readiness": 4,
    "visa_sponsorship_needed": true,
    "visa_details": "H-1B or O-1 visa required for US"
  },
  "action": "next"
}
```

**Global Preferences step data example:**
```json
{
  "step": "global_preferences",
  "data": {
    "languages": [
      { "id": "uuid-or-null", "language_code": "en", "language_name": "English", "proficiency": "native", "is_native": true, "display_order": 0 },
      { "id": "uuid-or-null", "language_code": "fr", "language_name": "French", "proficiency": "b2", "is_native": false, "display_order": 1 }
    ],
    "preferred_program_types": ["exchange_program", "international_internship", "global_immersion"],
    "relocation_willingness": "yes_with_conditions",
    "relocation_conditions": "Prefer English-speaking countries or EU",
    "cultural_interests": ["sustainability", "fintech", "social innovation"],
    "travel_experience": "3_5_countries"
  },
  "action": "next"
}
```

**Portfolio step data example:**
```json
{
  "step": "portfolio",
  "data": {
    "items": [
      {
        "id": "uuid-or-null",
        "section": "project",
        "title": "ML Pipeline for Climate Data",
        "description": "Built an end-to-end...",
        "url": "https://github.com/...",
        "skills_used": ["skill-uuid-1"],
        "date_value": "2023-11-01",
        "end_date": "2024-01-15",
        "media_urls": [],
        "display_order": 0
      },
      {
        "id": "uuid-or-null",
        "section": "publication",
        "title": "Deep Learning for Satellite Imagery",
        "venue": "NeurIPS Workshop",
        "date_value": "2023-12-01",
        "url": "https://arxiv.org/...",
        "doi": "10.1234/5678",
        "co_authors": "J. Smith, A. Johnson",
        "display_order": 0
      }
    ],
    "external_links": [
      { "id": "uuid-or-null", "label": "GitHub", "url": "https://github.com/janedoe", "display_order": 0 },
      { "id": "uuid-or-null", "label": "LinkedIn", "url": "https://linkedin.com/in/janedoe", "display_order": 1 }
    ]
  },
  "action": "next"
}
```

**Response 200 (success):**
```json
{
  "success": true,
  "data": {
    "step": "identity",
    "status": "completed",
    "next_step": "education",
    "completion_percentage": 15.00,
    "saved_at": "2024-01-15T12:00:00Z",
    "validation_errors": null
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

**Response 422 (validation failure on `action: next`):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Step validation failed",
    "details": {
      "field_errors": [
        { "field": "date_of_birth", "message": "Date of birth is required", "code": "required" },
        { "field": "nationality", "message": "Please select a valid country", "code": "invalid" }
      ]
    }
  },
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

**Response 200 (auto-save with `action: save`):**
```json
{
  "success": true,
  "data": {
    "step": "education",
    "status": "active",
    "next_step": null,
    "completion_percentage": 27.50,
    "saved_at": "2024-01-15T12:05:00Z",
    "validation_errors": null
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### POST /api/students/onboarding/complete

Finalizes onboarding, triggers GX Score calculation, generates profile slug.

**Request:**
- Headers: `Authorization: Bearer <token>`
- Body: `{}` (empty, confirmation action)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "onboarding_completed": true,
    "completed_at": "2024-01-15T14:00:00Z",
    "profile_slug": "jane-doe-a4f2",
    "gx_score": 72.50,
    "gx_grade": "B+",
    "gx_score_dimensions": {
      "academic_strength": 85.0,
      "skills_depth": 70.0,
      "experience_breadth": 65.0,
      "global_readiness": 60.0,
      "profile_quality": 80.0
    },
    "improvement_tips": [
      { "category": "experience", "message": "Add more professional experiences to improve your score", "priority": 1 },
      { "category": "global_preferences", "message": "Adding more languages can boost your global readiness score", "priority": 2 },
      { "category": "portfolio", "message": "Upload project samples to showcase your work", "priority": 3 }
    ],
    "redirect_url": "/dashboard"
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

**Response 400 (incomplete mandatory steps):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ONBOARDING_INCOMPLETE",
    "message": "Cannot complete onboarding. Mandatory steps are incomplete.",
    "details": {
      "incomplete_steps": ["skills"]
    }
  },
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### POST /api/students/onboarding/upload-photo

Handles profile photo upload with resizing.

**Request:**
- Headers: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- Body: `file` field (JPEG, PNG, WebP; max 5MB)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "photo_url": "https://storage.supabase.co/profile-photos/uuid/avatar.jpg",
    "thumbnail_url": "https://storage.supabase.co/profile-photos/uuid/avatar_thumb.jpg",
    "file_size": 245000,
    "dimensions": { "width": 400, "height": 400 }
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

**Response 413 (file too large):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File exceeds maximum size of 5MB",
    "details": { "max_size_bytes": 5242880, "actual_size_bytes": 8500000 }
  },
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### POST /api/students/onboarding/upload-portfolio

Handles portfolio media file uploads.

**Request:**
- Headers: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- Body: `file` field (PDF, JPEG, PNG, WebP, GIF; max 10MB), `item_id` field (UUID of portfolio item)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "file_url": "https://storage.supabase.co/portfolio-media/uuid/item-uuid/filename.pdf",
    "file_type": "application/pdf",
    "file_size": 1500000,
    "file_name": "project-report.pdf"
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### GET /api/reference/skills

Search skills master catalog.

**Request:**
- Headers: `Authorization: Bearer <token>`
- Query: `q=python&category=technical&limit=20`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "skills": [
      { "id": "uuid", "name": "Python", "category": "technical", "usage_count": 15420 },
      { "id": "uuid", "name": "Python Data Science", "category": "technical", "usage_count": 8200 }
    ],
    "total": 2
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### GET /api/reference/institutions

Search institutions.

**Request:**
- Query: `q=oxford&limit=10`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "institutions": [
      { "id": "uuid", "name": "University of Oxford", "country": "GB", "type": "university" },
      { "id": "uuid", "name": "Oxford Brookes University", "country": "GB", "type": "university" }
    ],
    "total": 2
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### GET /api/reference/countries

Returns full country list.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "countries": [
      { "code": "US", "name": "United States", "flag": "🇺🇸" },
      { "code": "GB", "name": "United Kingdom", "flag": "🇬🇧" }
    ]
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

### GET /api/reference/languages

Returns language list for selection.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "languages": [
      { "code": "en", "name": "English" },
      { "code": "fr", "name": "French" },
      { "code": "es", "name": "Spanish" }
    ]
  },
  "error": null,
  "meta": { "request_id": "uuid", "timestamp": "..." }
}
```

## 6. Module Dependencies

| Dependency | What's Needed | How Used | Failure Handling |
|------------|---------------|----------|------------------|
| `authentication` | Authenticated user session, user metadata (name, email, photo from OAuth) | Verify JWT on every API call; pre-fill identity fields from auth metadata; redirect unauthenticated users to login | Redirect to /login on 401; show session expired modal on token refresh failure |
| `app_shell` | Minimal layout variant (logo bar only, no sidebar) | Wraps onboarding pages with minimal chrome | Render onboarding without shell if app_shell fails to load (standalone fallback) |
| Supabase Auth | User ID, session tokens | All API calls authenticated against Supabase Auth | Use refresh token rotation; redirect on permanent auth failure |
| Supabase Storage | File upload buckets (`profile-photos`, `portfolio-media`) | Upload profile photos and portfolio files | Show upload error with retry button; don't block form progression on upload failure |
| Supabase Database | PostgreSQL for all data tables | CRUD operations for all onboarding data | Show save error indicator; queue for retry; localStorage fallback |
| `skills_master` reference table | Pre-populated skill catalog (~2000 entries) | Skill search autocomplete in Step 3 | Allow custom skill entry if catalog unavailable; cache last-known list |
| `institutions` reference table | Pre-populated institution list | Institution autocomplete in Step 2 | Allow free-text entry if lookup unavailable |
| `countries` reference table | ISO 3166-1 country list | Country selection dropdowns | Bundle static country list as fallback JSON |
| GX Score Service | Score calculation algorithm | Triggered on onboarding completion (Step 8) | Show "Score calculating..." with polling; allow completion without score display |

## 7. Non-Functional Requirements

### Performance
- Initial wizard page load: < 1.5 seconds (including progress state fetch)
- Step transition animation: < 200ms
- Auto-save round trip: < 500ms (p95)
- Skill search response: < 300ms (p95)
- File upload: progress feedback within 100ms of start
- Profile photo resize (server-side): < 2 seconds
- GX Score calculation: < 5 seconds (async, non-blocking)
- Client-side completion percentage recalculation: < 50ms

### Caching
- Reference data (countries, languages, fields of study): Cache in React Query with 24-hour stale time
- Skills master: Cache with 1-hour stale time, invalidate on new custom skill creation
- Institutions: Cache with 6-hour stale time
- Onboarding progress: No cache (always fresh from server on page load), client state managed by Zustand
- Form data: Zustand store as source of truth, synced to server via auto-save, localStorage backup every 10s

### Rate Limiting
- Auto-save endpoint: 60 requests/minute per user (burst-friendly)
- File upload: 10 uploads/minute per user
- Reference search endpoints: 120 requests/minute per user
- Onboarding complete: 5 requests/minute per user (prevent spam)

### Concurrency
- Optimistic locking on step saves using `updated_at` timestamp comparison
- If server `updated_at` is newer than client's last known value, show conflict resolution dialog
- File uploads: Max 3 concurrent uploads per user session
- Auto-save queue: Sequential execution (no parallel saves for same step)

### Data Retention
- Incomplete onboarding data: Retained for 12 months from last activity, then purged with warning email at 11 months
- Uploaded files for abandoned onboarding: Purged after 6 months of inactivity
- Completed profiles: Retained indefinitely per platform policy
- localStorage backup data: Cleared on successful server sync or after 7 days

### Accessibility
- WCAG 2.1 Level AA compliance
- All form fields have associated labels and aria-describedby for errors
- Progress bar has aria-valuenow, aria-valuemin, aria-valuemax
- Focus management: Focus moves to first field of new step on navigation
- Skip links: "Skip to form content" link available
- Screen reader announcements for: step changes, save status, validation errors
- Reduced motion: Respect `prefers-reduced-motion` for all animations

### Security
- All file uploads scanned for malware via Supabase Storage policies
- Photo uploads stripped of EXIF GPS data
- Bio and text fields sanitized (XSS prevention via DOMPurify before rendering, parameterized queries for storage)
- File type validated both client-side (extension + MIME) and server-side (magic bytes)
- Rate limiting prevents enumeration of reference data
- RLS policies ensure students can only access their own onboarding data

## 8. Key Implementation Notes

1. **Zustand Store Architecture:** Create a single `useOnboardingStore` with slices per step. Each slice holds form data, dirty flags, and validation state. The store persists to localStorage via Zustand's `persist` middleware with a custom storage adapter that compresses data with LZ-string for large portfolios. Rehydrate on mount and compare timestamps with server data.

2. **React Hook Form Integration:** Each step component uses its own `useForm` instance initialized from the Zustand store. On mount, `reset()` is called with store data. On field change, values sync back to Zustand via `watch()` subscription. This dual-layer approach gives us form-level validation (React Hook Form + Zod resolver) while maintaining cross-step persistence (Zustand).

3. **Auto-Save Debouncing Strategy:** Use a custom `useAutoSave` hook that watches the Zustand store's dirty flag per step. When dirty becomes true, start a 500ms debounce timer. On timer expiry, diff current store data against `lastSavedData` ref, and only PATCH changed fields. Mark dirty as false on successful save. For text areas specifically, use a separate 2000ms timer that resets on each keystroke.

4. **Step URL Synchronization:** Use Next.js parallel routes or intercepting routes to maintain URLs like `/(student)/onboarding/identity`. On direct URL access, the layout component fetches progress and validates that the requested step is accessible (completed prior steps or current step). If not, redirect to the actual current step. Use `router.replace` (not `push`) for step transitions to avoid polluting browser history.

5. **Completion Percentage Algorithm (Client-Side):** Implement as a pure function `calculateCompletion(storeState)` that mirrors the server calculation exactly. Import from a shared `lib/onboarding/completion.ts` file used by both client components and the API route handler. Unit test with fixtures covering edge cases (empty profile, partial steps, maximum entries).

6. **Photo Upload with Crop:** Use `react-cropper` or `react-image-crop` for client-side cropping to 1:1 aspect ratio. After crop, convert to Blob, upload via the dedicated endpoint. Server-side (Supabase Edge Function or API route) uses `sharp` to resize to 400x400 and generate 80x80 thumbnail. Store both URLs in profile. Show optimistic preview using `URL.createObjectURL` before upload completes.

7. **Skill Search with Fuzzy Matching:** The `/api/reference/skills` endpoint uses PostgreSQL's `pg_trgm` extension for trigram similarity search combined with `ts_rank` for full-text relevance. Client-side, debounce at 200ms and show a loading skeleton in the dropdown during fetch. Cache search results by query string in React Query with 30-second stale time to avoid redundant searches for common terms.

8. **GX Score Calculation Trigger:** On calling `/api/students/onboarding/complete`, the API route sets `onboarding_completed = true` synchronously, then triggers score calculation as a background job (Supabase Edge Function or database function). The client polls `/api/students/onboarding/progress` every 2 seconds (max 10 attempts) until `gx_score` is populated. Show animated placeholder during calculation. If timeout, proceed to dashboard with "Score calculating..." badge.

9. **Multi-Entry Form Pattern:** For Education, Experience, and Portfolio steps, use a reducer-based state pattern. Each entry has a client-generated UUID (via `crypto.randomUUID()`). New entries start in "draft" mode (expanded form). Saved entries collapse to summary cards. Deletion shows confirmation modal for entries with data, immediate remove for empty entries. Server receives the full entries array and performs upsert (INSERT ON CONFLICT UPDATE) with deletion of entries not in the array.

10. **Animated Step Transitions:** Use Framer Motion's `AnimatePresence` with variants: `slideLeft` (entering from right for forward navigation) and `slideRight` (entering from left for backward navigation). Direction is determined by comparing current step index to previous. Duration: 200ms with easeInOut. Wrap each step component in `motion.div` with layout animation for smooth content height transitions.

## 9. File Map

```
src/
├── app/(student)/onboarding/
│   ├── layout.tsx                          # Minimal layout with logo bar, progress bar, auto-save provider
│   ├── page.tsx                            # Root redirect to current step based on progress
│   ├── identity/page.tsx                   # Step 1 page component
│   ├── education/page.tsx                  # Step 2 page component
│   ├── skills/page.tsx                     # Step 3 page component
│   ├── experience/page.tsx                 # Step 4 page component
│   ├── career-goals/page.tsx               # Step 5 page component
│   ├── global-preferences/page.tsx         # Step 6 page component
│   ├── portfolio/page.tsx                  # Step 7 page component
│   └── complete/page.tsx                   # Step 8 page component (profile summary)
│
├── components/onboarding/
│   ├── OnboardingLayout.tsx                # Wizard container with animation wrappers
│   ├── ProgressBar.tsx                     # Segmented progress bar with step indicators
│   ├── StepIndicator.tsx                   # Individual step circle (completed/active/pending/skipped)
│   ├── NavigationFooter.tsx                # Back/Skip/Next buttons bar
│   ├── AutoSaveIndicator.tsx               # Save status pill (saving/saved/error)
│   ├── StepTransition.tsx                  # Framer Motion wrapper for step animations
│   │
│   ├── identity/
│   │   ├── IdentityForm.tsx                # Main Step 1 form
│   │   └── PhotoUploader.tsx               # Avatar upload with crop modal
│   │
│   ├── education/
│   │   ├── EducationList.tsx               # Multi-entry education container
│   │   ├── EducationEntry.tsx              # Single education entry form card
│   │   └── InstitutionAutocomplete.tsx     # Institution search typeahead
│   │
│   ├── skills/
│   │   ├── SkillSearch.tsx                 # Skill search input with results dropdown
│   │   ├── SkillResults.tsx                # Search results list with category badges
│   │   ├── SelectedSkillsList.tsx          # Grid of selected skill cards
│   │   ├── ProficiencySelector.tsx         # 5-level proficiency input (stars/dots)
│   │   ├── CustomSkillInput.tsx            # Custom skill creation input
│   │   └── SkillCategoryFilter.tsx         # Category tab filter for search
│   │
│   ├── experience/
│   │   ├── ExperienceTypeSelector.tsx      # 3x3 type selection grid
│   │   ├── ExperienceList.tsx              # Timeline-style experience container
│   │   ├── ExperienceEntry.tsx             # Single experience entry form card
│   │   └── OutcomesList.tsx                # Dynamic bullet point list input
│   │
│   ├── career-goals/
│   │   ├── CareerGoalsForm.tsx             # Main Step 5 form
│   │   ├── IndustrySelector.tsx            # Multi-select industry picker
│   │   ├── FunctionSelector.tsx            # Multi-select function picker
│   │   ├── SalaryRangeInput.tsx            # Currency + min/max salary inputs
│   │   └── MobilityReadinessSlider.tsx     # Labeled 1-5 slider
│   │
│   ├── global-preferences/
│   │   ├── GlobalPreferencesForm.tsx       # Main Step 6 form
│   │   ├── LanguageList.tsx                # Multi-entry language container
│   │   ├── LanguageEntry.tsx               # Language + proficiency row
│   │   ├── ProgramTypeSelector.tsx         # Checkbox group for program types
│   │   └── RelocationSection.tsx           # Relocation willingness + conditions
│   │
│   ├── portfolio/
│   │   ├── PortfolioSections.tsx           # Tabbed/accordion section container
│   │   ├── ProjectEntry.tsx                # Project item form
│   │   ├── PublicationEntry.tsx            # Publication item form
│   │   ├── AchievementEntry.tsx            # Achievement item form
│   │   ├── MediaUploader.tsx               # Drag-and-drop file upload zone
│   │   ├── FilePreview.tsx                 # File thumbnail with actions
│   │   └── ExternalLinkEntry.tsx           # Label + URL pair input
│   │
│   └── complete/
│       ├── ProfileSummaryCard.tsx           # Compact profile preview card
│       ├── GXScoreGauge.tsx                # Animated radial score gauge
│       ├── CompletionBreakdown.tsx          # Stacked bar chart of section scores
│       ├── ImprovementTips.tsx             # Suggestion cards list
│       ├── ShareProfileModal.tsx           # Share link + social + QR modal
│       └── ConfettiAnimation.tsx           # CSS confetti burst effect
│
├── lib/onboarding/
│   ├── completion.ts                       # Shared completion percentage algorithm
│   ├── validation-schemas.ts              # Zod schemas for all 7 steps
│   ├── step-config.ts                     # Step metadata (names, paths, weights, required flags)
│   ├── constants.ts                       # Step enums, limits, field weights
│   └── types.ts                           # TypeScript interfaces for all step data shapes
│
├── stores/
│   └── onboarding-store.ts                # Zustand store with per-step slices + persist middleware
│
├── hooks/
│   ├── useOnboardingProgress.ts           # Fetches and manages onboarding progress state
│   ├── useAutoSave.ts                     # Auto-save debounce + queue logic
│   ├── useStepNavigation.ts              # Step forward/back/skip navigation logic
│   ├── useStepValidation.ts              # Per-step Zod validation trigger
│   ├── useSkillSearch.ts                  # Debounced skill search with React Query
│   ├── useInstitutionSearch.ts           # Debounced institution search
│   ├── useFileUpload.ts                   # Upload progress, retry, cancellation logic
│   └── useCompletionPercentage.ts        # Real-time completion calculation from store
│
├── api/
│   ├── students/onboarding/
│   │   ├── route.ts                       # PATCH handler - save step data
│   │   ├── progress/route.ts             # GET handler - fetch progress
│   │   ├── complete/route.ts             # POST handler - finalize onboarding
│   │   ├── upload-photo/route.ts         # POST handler - profile photo upload
│   │   └── upload-portfolio/route.ts     # POST handler - portfolio file upload
│   └── reference/
│       ├── skills/route.ts               # GET handler - skill catalog search
│       ├── institutions/route.ts         # GET handler - institution search
│       ├── countries/route.ts            # GET handler - country list
│       └── languages/route.ts            # GET handler - language list
│
├── data/
│   ├── countries.json                     # Static fallback country list
│   └── languages.json                     # Static fallback language list
│
└── __tests__/onboarding/
    ├── completion.test.ts                 # Unit tests for completion algorithm
    ├── validation-schemas.test.ts        # Unit tests for all Zod schemas
    ├── onboarding-store.test.ts          # Zustand store behavior tests
    ├── auto-save.test.ts                 # Auto-save hook behavior tests
    ├── identity-form.test.tsx            # Component test for Step 1
    ├── education-form.test.tsx           # Component test for Step 2
    ├── skills-form.test.tsx              # Component test for Step 3
    ├── experience-form.test.tsx          # Component test for Step 4
    ├── career-goals-form.test.tsx        # Component test for Step 5
    ├── global-preferences-form.test.tsx  # Component test for Step 6
    ├── portfolio-form.test.tsx           # Component test for Step 7
    ├── complete-page.test.tsx            # Component test for Step 8
    └── navigation.test.tsx               # Integration test for step navigation flow
```