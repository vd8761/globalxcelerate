# Module Spec: AI Matching Engine

## 1. Overview & Purpose

The AI Matching Engine is the core intelligence layer of GlobalXcelerate, responsible for three interconnected sub-systems: (A) AI Matching — a 6-dimension weighted scoring algorithm that evaluates student-opportunity compatibility with configurable weights, batch processing, caching, and natural-language explanations; (B) GX Career Copilot — a floating assistant widget providing contextual Q&A, profile-aware recommendations, and streaming responses via SSE; and (C) Global Employability Score (GX Score) — a 12-dimension competency assessment producing a composite employability metric with radar visualization, anti-gaming protections, and AI-generated improvement recommendations. Together, these systems power personalized opportunity discovery, conversational guidance, and holistic career readiness measurement.

**Who uses it:**
- **Students** — view match scores on opportunities, interact with Copilot for guidance, monitor GX Score progress, receive skill gap analysis and improvement recommendations
- **Employers** — view ranked candidate lists sorted by match score, filter by dimension scores, use match explanations for hiring decisions
- **Universities** — view aggregate GX Score analytics for their cohorts, identify skill gaps across programs
- **Providers** — understand how their programs impact participant GX Scores
- **Admins** — configure matching weights per opportunity type, monitor Copilot usage, manage score recalculation schedules, review anti-gaming flags

**Key screens/interfaces:**
- Match Score Cards (embedded in opportunity listings and application views)
- Match Explanation Modal (detailed breakdown with dimension scores)
- Skill Gap Analysis Panel (missing skills with priority and action URLs)
- GX Career Copilot Widget (floating bottom-right chat interface)
- GX Score Dashboard (radar chart, dimension cards, history timeline)
- GX Score Recommendations Panel (prioritized improvement actions)
- Admin Matching Configuration Panel (weight tuning, cache management)

**Data flow connections:**
- Reads from `student_onboarding` (profile data: skills, academics, experience, preferences)
- Reads from opportunity data (requirements, location, dates, skill needs)
- Writes match scores to `match_scores` table consumed by Application Management
- GX Score updates triggered by profile changes from `student_onboarding`
- Copilot reads current page context from `app_shell` navigation state
- Notifications sent through platform notification system on score changes

**What this module does NOT do:**
- Does not own opportunity CRUD (owned by Opportunity Management module)
- Does not handle application submission workflow (owned by Application Management)
- Does not manage student profile editing (owned by Student Onboarding)
- Does not send push notifications directly (delegates to Notification module)
- Does not provide real-time video/audio communication
- Does not store or process payment information

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

**Module-specific UI overrides:**

- **Match Score Badge**: Circular progress indicator using gradient from `cyan-400` to `cyan-600` for scores ≥75, `amber-400` to `amber-500` for scores 50-74, `red-400` to `red-500` for scores <50. Inner text displays percentage in `font-bold text-lg`.
- **GX Score Radar Chart**: Uses navy-800 grid lines, cyan-500 fill with 20% opacity, cyan-600 stroke. Dimension labels in `text-xs font-medium text-navy-600`.
- **Copilot Widget**: Fixed positioning `bottom-6 right-6`, navy-900 background with cyan-400 accent, `z-50`, rounded-2xl shadow-2xl. Collapsed state shows 56x56px circular button with robot icon. Expanded state: 380px wide × 520px tall on desktop, full-width on mobile.
- **Dimension Cards**: White background, left border-4 colored by performance bracket (cyan-500 Exceptional, emerald-500 Strong, amber-500 Developing, orange-500 Emerging, red-500 Beginner). Progress bar uses same bracket color.
- **Score History Chart**: Area chart with cyan-500 line, cyan-100 fill, navy-200 grid. Tooltip shows date, score, and change delta.
- **Skill Gap Chips**: Missing skills shown as outlined chips with `border-dashed border-red-300 text-red-600 bg-red-50`. Matched skills use `border-solid border-cyan-300 text-cyan-700 bg-cyan-50`.

## 3. Features & Functional Requirements

### Feature A: AI Matching — 6-Dimension Scoring Algorithm

**User Flow:**
1. Student browses opportunities or views a specific opportunity detail page
2. System checks `match_scores` table for cached score (TTL: 24 hours)
3. If cache valid, display score immediately with dimension breakdown
4. If cache expired or missing, trigger on-demand recalculation
5. Score appears as badge on opportunity card and detailed breakdown on opportunity detail
6. Student clicks "View Match Details" to see full explanation modal
7. Employer views ranked candidate list with match scores for their opportunity
8. Employer clicks candidate to see match explanation and dimension breakdown

**UI Layout & Components:**

*Match Score Badge (Opportunity Card):*
- Circular progress ring (40px diameter) with percentage in center
- Color gradient based on score bracket
- Tooltip on hover: "Match Score: X% — Click for details"

*Match Explanation Modal:*
- Header: "Your Match Analysis" with overall score prominently displayed
- 6 horizontal bar charts, one per dimension, showing individual scores
- Each bar labeled with dimension name, weight percentage, and raw score
- Natural language explanation paragraph below bars (AI-generated)
- "Improve Your Match" CTA button linking to skill gap section
- Loading skeleton while AI explanation generates

*Skill Gap Analysis Panel:*
- Section header: "Skills to Develop"
- Grid of skill chips: matched (solid cyan), missing (dashed red), partial (dashed amber)
- Each missing skill chip has tooltip with priority level (High/Medium/Low)
- "View Learning Resources" links per skill gap
- Priority-sorted list with estimated impact on match score

**Business Rules:**
- Default weights: Skills 20%, Academic 20%, Experience 20%, Geography 15%, Availability 15%, Mobility 10%
- Weight overrides per opportunity_type: `technical_internship` → Skills 30%, Academic 15%, Experience 20%, Geography 15%, Availability 10%, Mobility 10%
- Weight overrides per opportunity_type: `cultural_exchange` → Skills 10%, Academic 10%, Experience 15%, Geography 15%, Availability 20%, Mobility 30%
- Weight overrides per opportunity_type: `research_placement` → Skills 25%, Academic 30%, Experience 20%, Geography 10%, Availability 10%, Mobility 5%
- Scores normalized to 0-100 per dimension before weighted combination
- Skills dimension: Jaccard similarity coefficient between student skills set and opportunity required skills set, with proficiency level bonus (+10% if student proficiency exceeds requirement)
- Academic dimension: GPA threshold check (requirement met = 70 base, exceeds by 0.5+ = 85, exceeds by 1.0+ = 100, below by 0.5 = 40, below by 1.0+ = 20), field of study match (+20 if exact, +10 if related)
- Experience dimension: recency-weighted sum of relevant experiences (last 12 months: 1.0x, 12-24 months: 0.7x, 24-36 months: 0.4x, 36+ months: 0.2x), relevance determined by keyword overlap
- Geography dimension: geo-distance scoring (same city = 100, same country = 80, same continent = 60, different continent with visa eligibility = 40, different continent without visa = 20)
- Availability dimension: date overlap calculation between student available dates and opportunity dates (100% overlap = 100, 75%+ = 80, 50%+ = 60, 25%+ = 40, <25% = 20)
- Mobility dimension: exposure score based on prior international experiences count (0 = 30, 1 = 50, 2 = 70, 3+ = 90), language proficiency bonus (+10 if speaks destination language)
- Match scores cached with 24-hour TTL in `match_scores` table
- Batch processing: top-100 matches calculated per opportunity via Supabase Edge Function
- On-demand recalculation triggered if cache expired when student views opportunity
- AI explanation generated on-demand (not cached by default, cached for 1 hour after generation)

**State Machine:**
```
MatchCalculation States:
  IDLE → CALCULATING (triggered by cache miss or batch job)
  CALCULATING → COMPLETED (score computed and cached)
  CALCULATING → FAILED (error during computation)
  FAILED → CALCULATING (retry, max 3 attempts)
  COMPLETED → STALE (TTL expired, 24 hours)
  STALE → CALCULATING (on-demand recalculation)
```

**Edge Cases:**
- Student has no skills listed → Skills dimension scores 0, system prompts "Add skills to improve matches"
- Opportunity has no required skills → Skills dimension defaults to 50 (neutral)
- Student GPA not provided → Academic dimension uses 40 (below average assumption) with prompt to add
- No date overlap possible → Availability scores 0, opportunity flagged as "Schedule conflict"
- Calculation timeout (>10s) → Return stale cached score with "Updating..." indicator
- Concurrent recalculation requests → Deduplicate using Redis lock on `match:{student_id}:{opportunity_id}`
- Student profile changes → Invalidate all cached match scores for that student (debounced 5 min)
- Opportunity requirements change → Invalidate all cached scores for that opportunity

**Acceptance Criteria:**
- Match scores display within 200ms when cached
- On-demand recalculation completes within 3 seconds for single student-opportunity pair
- Batch calculation processes 100 matches per opportunity within 30 seconds
- Score breakdown shows all 6 dimensions with individual percentages
- AI explanation generates within 5 seconds via streaming
- Scores update within 5 minutes of student profile change
- Weight configuration changes take effect on next calculation (not retroactive until recalculation)
- Skill gap analysis correctly identifies all missing required skills

### Feature B: GX Career Copilot — Floating Assistant Widget

**User Flow:**
1. Copilot widget appears as collapsed circular button (bottom-right) on all authenticated pages
2. Student clicks button → widget expands to chat interface with greeting message
3. Greeting is contextual: "I see you're viewing [opportunity name]. Want me to analyze your fit?"
4. Student types question or clicks suggested prompt chip
5. Response streams in real-time via SSE (character by character)
6. Student can ask follow-up questions (context maintained for session)
7. Student clicks minimize → widget collapses back to button
8. Student clicks X → widget closes entirely (can reopen from nav)
9. Conversation history persists across page navigations within same session
10. New session created after 30 minutes of inactivity

**UI Layout & Components:**

*Collapsed State:*
- Circular button 56x56px, navy-900 background, cyan-400 robot/spark icon
- Subtle pulse animation when Copilot has a contextual suggestion
- Badge dot (red) if there are unread recommendations
- Position: fixed bottom-6 right-6, z-50

*Expanded State:*
- Container: 380px wide × 520px tall (desktop), 100vw × 70vh (mobile)
- Header bar: "GX Career Copilot" title, minimize button, close button
- Message area: scrollable, auto-scroll to bottom on new messages
- User messages: right-aligned, cyan-600 background, white text, rounded-xl
- Copilot messages: left-aligned, navy-50 background, navy-800 text, rounded-xl
- Copilot avatar: small robot icon (24px) beside each response
- Typing indicator: three animated dots while streaming
- Suggested prompts: horizontal scrollable chip row above input (contextual)
- Input area: text input with send button, character count, disabled state during streaming
- Rate limit indicator: "X messages remaining today" in subtle text below input

*Suggested Prompt Chips (contextual):*
- On opportunity page: "Analyze my fit", "What skills am I missing?", "Similar opportunities"
- On GX Score page: "How to improve my score?", "Which dimension needs work?", "Set a goal"
- On applications page: "Track my applications", "Tips for cover letter", "Interview prep"
- On profile page: "Review my profile", "Suggest improvements", "Find skill gaps"

**Business Rules:**
- Rate limit: 50 messages per student per 24-hour rolling window
- Token budget per message: 4000 input tokens (context + query) + 2000 output tokens (response)
- Context injection structure: student profile summary (skills, GPA, experience count, GX Score), current page context (URL, page type, viewed entity), last 10 conversation messages
- System prompt includes: role definition (career advisor), safety boundaries, response format guidelines
- Circuit breaker: 3 consecutive AI API failures within 60 seconds → switch to canned responses for 5 minutes
- Canned responses cover: general greeting, try-again-later, basic FAQ answers (5-10 predefined)
- Safety guardrails: decline financial advice, legal advice, medical advice, personal relationship advice
- Safety response: "I'm focused on career and learning guidance. For [topic], please consult a qualified professional."
- Session timeout: 30 minutes of inactivity → new session created on next message
- Message persistence: all messages stored in `copilot_sessions` table with session grouping
- Streaming: Server-Sent Events via POST /api/v1/copilot/chat endpoint
- Response format: markdown supported (bold, italic, lists, links), rendered in chat bubble
- Maximum message length (user input): 500 characters
- Minimum message length: 2 characters
- Empty or whitespace-only messages rejected client-side

**State Machine:**
```
Copilot Widget States:
  HIDDEN → COLLAPSED (after authentication confirmed)
  COLLAPSED → EXPANDED (user clicks widget button)
  EXPANDED → COLLAPSED (user clicks minimize)
  EXPANDED → HIDDEN (user clicks close)
  HIDDEN → COLLAPSED (user reopens from nav menu)

Copilot Chat States:
  IDLE → SENDING (user submits message)
  SENDING → STREAMING (SSE connection established, tokens arriving)
  STREAMING → IDLE (stream complete, [DONE] received)
  SENDING → ERROR (API failure)
  ERROR → IDLE (error message displayed, user can retry)
  IDLE → RATE_LIMITED (50 messages reached)
  RATE_LIMITED → IDLE (24-hour window resets)

Circuit Breaker States:
  CLOSED → OPEN (3 failures in 60s)
  OPEN → HALF_OPEN (after 5 minute cooldown)
  HALF_OPEN → CLOSED (successful request)
  HALF_OPEN → OPEN (another failure)
```

**Edge Cases:**
- User sends message while previous is still streaming → queue message, process after current completes
- SSE connection drops mid-stream → display partial response with "(Connection interrupted. Tap to retry)" indicator
- User navigates to different page mid-stream → maintain stream, update context for next message
- Rate limit reached → disable input, show "You've used all 50 messages today. Resets in Xh Ym."
- Very long AI response (>2000 tokens) → truncate with "..." and "Show more" button
- User rapidly clicks send → debounce 500ms, prevent duplicate submissions
- Network offline → show "You're offline. Messages will be sent when connection restores."
- Session has 100+ messages → paginate history load (20 messages at a time, load more on scroll up)
- Profile data unavailable → Copilot operates without context, notes "I'd give better advice if you complete your profile"
- Toxic/inappropriate user input → AI system prompt handles gracefully, does not engage

**Acceptance Criteria:**
- Widget loads within 100ms of page mount (lazy-loaded after initial render)
- First token of streamed response appears within 1.5 seconds of send
- Full response completes within 10 seconds for typical queries
- Context injection correctly includes current page data and profile summary
- Rate limiting accurately tracks daily usage and resets at correct time
- Circuit breaker activates after exactly 3 failures within 60-second window
- Safety guardrails successfully decline prohibited topics 100% of the time
- Conversation context correctly maintained across page navigations
- Mobile responsiveness: widget expands to full width below 640px breakpoint
- All messages persisted and retrievable in session history

### Feature C: Global Employability Score (GX Score) — 12-Dimension Assessment

**User Flow:**
1. Student navigates to GX Score dashboard (/(student)/gx-score)
2. System displays current composite score with grade bracket and radar chart
3. 12 dimension cards show individual scores with progress bars
4. Student clicks dimension card → expands to show rubric details and score justification
5. "History" tab shows score progression over time (area chart)
6. "Recommendations" tab shows AI-generated improvement actions sorted by priority
7. Student clicks recommendation → navigates to relevant action (e.g., skill assessment, profile edit)
8. Score recalculates automatically on profile update (5-minute debounce)
9. Nightly batch recalculation ensures all scores are current

**UI Layout & Components:**

*GX Score Dashboard Header:*
- Large circular score display (120px diameter) with composite score in center
- Grade bracket label below: "Exceptional", "Strong", "Developing", "Emerging", "Beginner"
- Score change indicator: "+3 this week" with green/red arrow
- Last calculated timestamp: "Updated 2 hours ago"

*Radar Chart (Recharts RadarChart):*
- 12-axis radar/radial chart
- Navy-800 grid lines (4 concentric rings at 25, 50, 75, 100)
- Cyan-500 stroke for current scores polygon
- Cyan-100 fill with 30% opacity
- Optional secondary polygon (lighter, dashed) showing previous month scores for comparison
- Axis labels truncated to abbreviations on mobile: "Acad", "Tech", "Comm", "Lead", "Proj", "Intern", "Intl", "Cert", "Port", "Intv", "Lang", "Ind"
- Interactive: hover on axis shows full dimension name and score tooltip

*Dimension Cards Grid:*
- 3-column grid on desktop, 2-column on tablet, 1-column on mobile
- Each card: dimension icon (24px), name, score/100, progress bar, bracket color left-border
- Expandable: click to reveal rubric breakdown and scoring justification
- Sort options: by score (high-low, low-high), alphabetical, by improvement potential

*Score History Chart:*
- Recharts AreaChart, x-axis: dates (last 90 days), y-axis: 0-100
- Cyan-500 line, cyan-50 fill
- Hover tooltip: date, score, change from previous
- Filter: 7 days, 30 days, 90 days, All time
- Milestone markers: profile updates, certifications added, etc.

*Recommendations Panel:*
- List of 5-10 AI-generated recommendations
- Each item: priority badge (High/Medium/Low), title, description, estimated score impact, action button
- Priority badges: High = red-500, Medium = amber-500, Low = cyan-500
- Action buttons: "Add Skills", "Upload Certificate", "Complete Assessment", etc.
- Each links to specific page/action (action_url field)

**Business Rules:**
- 12 dimensions, each equally weighted at ~8.33%:
  1. **Academic Readiness** (0-100): GPA normalization (4.0 scale → 0-100), degree level bonus (Bachelor=0, Master=+10, PhD=+20), relevant coursework count
  2. **Technical Skills** (0-100): Number of verified skills × proficiency level weighting (Beginner=1, Intermediate=2, Advanced=3, Expert=4), normalized to 100
  3. **Communication** (0-100): Writing samples quality, language test scores, presentation count, Copilot interaction quality assessment
  4. **Leadership** (0-100): Leadership roles count × duration weight, team size managed, initiative descriptions quality
  5. **Project Experience** (0-100): Number of projects × complexity weight (Simple=1, Medium=2, Complex=3), outcomes documented bonus
  6. **Internship Experience** (0-100): Total internship months (capped at 24), relevance to target industry, employer rating if available
  7. **International Exposure** (0-100): Countries lived/worked count × duration, cross-cultural experiences, international programs participated
  8. **Certifications** (0-100): Number of verified certifications × relevance weight, issuer prestige factor (major platform=1.5x, other=1.0x)
  9. **Portfolio Quality** (0-100): Portfolio items count, variety of types, recency, descriptions quality (AI-assessed)
  10. **Interview Readiness** (0-100): Mock interviews completed, assessment scores, behavioral question bank completion
  11. **Languages** (0-100): Number of languages × proficiency level (A1=10, A2=20, B1=40, B2=60, C1=80, C2=100, Native=100), capped at 100
  12. **Industry Skills** (0-100): Industry-specific skills matched against market demand data, trending skills bonus

- Composite score = AVERAGE of all 12 dimension scores (0-100)
- Grade brackets: Exceptional 90-100, Strong 75-89, Developing 50-74, Emerging 25-49, Beginner 0-24
- Anti-gaming cap: maximum +15 points change per dimension per day, maximum -15 points per dimension per day
- If calculated change exceeds ±15, cap at ±15 and flag for review
- Recalculation triggers: profile update (debounced 5 minutes), nightly batch (02:00 UTC)
- History tracked per recalculation event in `gx_score_history` table
- Recommendations refreshed: on score change >5 points in any dimension, or weekly minimum
- Recommendation generation uses GPT-4/Claude with student profile context and current scores
- Each recommendation includes: title, description, estimated_impact (1-10 scale), priority (high/medium/low), action_url, dimension_targeted

**State Machine:**
```
GX Score Calculation States:
  CURRENT → PENDING_RECALC (profile updated, debounce timer started)
  PENDING_RECALC → CALCULATING (debounce timer expired, 5 minutes)
  CALCULATING → CURRENT (new score computed and stored)
  CALCULATING → FAILED (error, retains previous score)
  CURRENT → STALE (nightly batch due)
  STALE → CALCULATING (batch job picks up)

Anti-Gaming States:
  NORMAL → CAPPED (daily change exceeds ±15)
  CAPPED → FLAGGED (multiple consecutive days hitting cap)
  FLAGGED → REVIEWED (admin reviews)
  REVIEWED → NORMAL (admin clears)
  REVIEWED → SUSPENDED (admin suspends score updates)
```

**Edge Cases:**
- New student with no profile data → all dimensions score 0, grade "Beginner", prominent CTA to complete profile
- Student fills one dimension fully but others empty → composite reflects accurately (low average)
- Rapid profile updates within 5 minutes → single recalculation after debounce
- Nightly batch overlaps with on-demand calculation → use distributed lock, skip if already calculating
- Anti-gaming cap triggered → store actual calculated value in metadata but display capped value
- Student removes profile data (e.g., deletes skills) → score decreases, capped at -15/day per dimension
- Historical data point missing for chart → interpolate between adjacent points
- AI recommendation generation fails → show cached recommendations with "Last updated X ago" notice
- Dimension score exceeds 100 due to bonuses → cap at 100
- Multiple dimensions tie for lowest → recommend improvement for dimension with highest potential impact

**Acceptance Criteria:**
- GX Score dashboard loads within 1 second with all 12 dimension scores
- Radar chart renders correctly with all 12 axes and accurate data points
- Score recalculates within 30 seconds of debounce timer expiration
- Anti-gaming cap correctly limits daily changes to ±15 per dimension
- History chart accurately displays up to 90 days of score data
- Recommendations are relevant, actionable, and link to correct pages
- Grade bracket updates immediately when composite crosses threshold
- Nightly batch processes all active students within 2-hour window
- Score change notifications sent when composite changes by ≥5 points
- Mobile layout correctly adapts radar chart and dimension cards

## 4. Data Models

### match_scores
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Unique match score record ID |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Student being matched |
| opportunity_id | uuid | FK → opportunities.id, NOT NULL | — | Opportunity being matched against |
| composite_score | decimal(5,2) | NOT NULL, CHECK (0-100) | — | Weighted composite match percentage |
| skills_score | decimal(5,2) | NOT NULL, CHECK (0-100) | — | Skills dimension raw score |
| academic_score | decimal(5,2) | NOT NULL, CHECK (0-100) | — | Academic dimension raw score |
| experience_score | decimal(5,2) | NOT NULL, CHECK (0-100) | — | Experience dimension raw score |
| geography_score | decimal(5,2) | NOT NULL, CHECK (0-100) | — | Geography dimension raw score |
| availability_score | decimal(5,2) | NOT NULL, CHECK (0-100) | — | Availability dimension raw score |
| mobility_score | decimal(5,2) | NOT NULL, CHECK (0-100) | — | Mobility dimension raw score |
| weights_used | jsonb | NOT NULL | — | Snapshot of weights applied: {skills: 0.20, academic: 0.20, ...} |
| skill_gaps | jsonb | — | '[]' | Array of {skill_name, priority, proficiency_required, proficiency_current} |
| explanation_text | text | — | NULL | AI-generated natural language explanation (cached) |
| explanation_generated_at | timestamptz | — | NULL | When explanation was generated |
| opportunity_type | varchar(50) | NOT NULL | — | Snapshot of opportunity type for weight selection |
| calculation_version | integer | NOT NULL | 1 | Algorithm version for cache invalidation |
| calculated_at | timestamptz | NOT NULL | now() | When score was last calculated |
| expires_at | timestamptz | NOT NULL | now() + interval '24 hours' | Cache expiration time |
| created_at | timestamptz | NOT NULL | now() | Record creation time |
| updated_at | timestamptz | NOT NULL | now() | Last update time |

**Indexes:**
- UNIQUE(student_id, opportunity_id)
- INDEX(opportunity_id, composite_score DESC) — for ranked candidate lists
- INDEX(student_id, expires_at) — for cache invalidation queries
- INDEX(expires_at) — for batch cleanup of expired records

### match_weight_configs
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Config record ID |
| opportunity_type | varchar(50) | UNIQUE, NOT NULL | — | Opportunity type this config applies to |
| skills_weight | decimal(3,2) | NOT NULL, CHECK (0-1) | 0.20 | Skills dimension weight |
| academic_weight | decimal(3,2) | NOT NULL, CHECK (0-1) | 0.20 | Academic dimension weight |
| experience_weight | decimal(3,2) | NOT NULL, CHECK (0-1) | 0.20 | Experience dimension weight |
| geography_weight | decimal(3,2) | NOT NULL, CHECK (0-1) | 0.15 | Geography dimension weight |
| availability_weight | decimal(3,2) | NOT NULL, CHECK (0-1) | 0.15 | Availability dimension weight |
| mobility_weight | decimal(3,2) | NOT NULL, CHECK (0-1) | 0.10 | Mobility dimension weight |
| is_active | boolean | NOT NULL | true | Whether this config is active |
| created_by | uuid | FK → profiles.id, NOT NULL | — | Admin who created config |
| created_at | timestamptz | NOT NULL | now() | Creation timestamp |
| updated_at | timestamptz | NOT NULL | now() | Last update timestamp |

**Constraint:** CHECK (skills_weight + academic_weight + experience_weight + geography_weight + availability_weight + mobility_weight = 1.00)

### copilot_sessions
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Session ID |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Student who owns this session |
| started_at | timestamptz | NOT NULL | now() | Session start time |
| last_activity_at | timestamptz | NOT NULL | now() | Last message timestamp |
| is_active | boolean | NOT NULL | true | Whether session is still active |
| message_count | integer | NOT NULL | 0 | Total messages in session |
| context_snapshot | jsonb | — | '{}' | Profile summary at session start |
| metadata | jsonb | — | '{}' | Additional session metadata |
| created_at | timestamptz | NOT NULL | now() | Record creation timestamp |
| updated_at | timestamptz | NOT NULL | now() | Last update timestamp |

**Indexes:**
- INDEX(student_id, is_active)
- INDEX(student_id, last_activity_at DESC)

### copilot_messages
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Message ID |
| session_id | uuid | FK → copilot_sessions.id, NOT NULL | — | Parent session |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Student (denormalized for RLS) |
| role | copilot_message_role | NOT NULL | — | 'user' or 'assistant' |
| content | text | NOT NULL, max 10000 chars | — | Message content (markdown) |
| page_context | varchar(255) | — | NULL | URL/page type when message sent |
| tokens_used | integer | — | 0 | Total tokens consumed for this exchange |
| model_used | varchar(50) | — | NULL | AI model used (e.g., 'gpt-4', 'claude-3') |
| response_time_ms | integer | — | NULL | Time to complete response |
| is_canned | boolean | NOT NULL | false | Whether this was a circuit-breaker canned response |
| created_at | timestamptz | NOT NULL | now() | Message timestamp |

**Indexes:**
- INDEX(session_id, created_at ASC)
- INDEX(student_id, created_at DESC) — for daily rate limit counting

### copilot_rate_limits
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Record ID |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Student being rate limited |
| window_start | timestamptz | NOT NULL | — | Start of 24-hour window |
| message_count | integer | NOT NULL | 0 | Messages sent in window |
| window_end | timestamptz | NOT NULL | — | End of 24-hour window |
| created_at | timestamptz | NOT NULL | now() | Record creation |
| updated_at | timestamptz | NOT NULL | now() | Last update |

**Indexes:**
- UNIQUE(student_id, window_start)
- INDEX(window_end) — for cleanup

### gx_scores
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Score record ID |
| student_id | uuid | FK → profiles.id, UNIQUE, NOT NULL | — | One active score per student |
| composite_score | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Overall GX Score |
| grade_bracket | gx_grade_bracket | NOT NULL | 'beginner' | Current grade bracket |
| academic_readiness | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 1 score |
| technical_skills | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 2 score |
| communication | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 3 score |
| leadership | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 4 score |
| project_experience | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 5 score |
| internship_experience | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 6 score |
| international_exposure | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 7 score |
| certifications | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 8 score |
| portfolio_quality | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 9 score |
| interview_readiness | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 10 score |
| languages | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 11 score |
| industry_skills | decimal(5,2) | NOT NULL, CHECK (0-100) | 0 | Dimension 12 score |
| last_calculated_at | timestamptz | NOT NULL | now() | Last calculation timestamp |
| calculation_version | integer | NOT NULL | 1 | Algorithm version |
| daily_change_applied | decimal(5,2) | — | 0 | Net change applied today |
| daily_change_date | date | — | CURRENT_DATE | Date of daily change tracking |
| anti_gaming_flagged | boolean | NOT NULL | false | Whether anti-gaming cap was hit |
| created_at | timestamptz | NOT NULL | now() | Record creation |
| updated_at | timestamptz | NOT NULL | now() | Last update |

**Indexes:**
- UNIQUE(student_id)
- INDEX(composite_score DESC) — for leaderboards
- INDEX(grade_bracket) — for filtering
- INDEX(anti_gaming_flagged) — for admin review

### gx_score_history
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | History entry ID |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Student |
| composite_score | decimal(5,2) | NOT NULL | — | Composite at this point |
| grade_bracket | gx_grade_bracket | NOT NULL | — | Grade at this point |
| dimension_scores | jsonb | NOT NULL | — | All 12 dimensions snapshot |
| change_delta | decimal(5,2) | NOT NULL | 0 | Change from previous entry |
| trigger_type | score_trigger_type | NOT NULL | — | What caused recalculation |
| trigger_details | jsonb | — | '{}' | Details about the trigger |
| capped | boolean | NOT NULL | false | Whether anti-gaming cap was applied |
| original_delta | decimal(5,2) | — | NULL | What delta would have been without cap |
| created_at | timestamptz | NOT NULL | now() | When this history entry was created |

**Indexes:**
- INDEX(student_id, created_at DESC)
- INDEX(student_id, created_at) — for time range queries
- INDEX(trigger_type)

### gx_score_recommendations
| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | Recommendation ID |
| student_id | uuid | FK → profiles.id, NOT NULL | — | Target student |
| title | varchar(200) | NOT NULL | — | Short recommendation title |
| description | text | NOT NULL | — | Detailed recommendation text |
| dimension_targeted | gx_dimension | NOT NULL | — | Which dimension this improves |
| priority | recommendation_priority | NOT NULL | — | High, Medium, Low |
| estimated_impact | integer | NOT NULL, CHECK (1-10) | — | Estimated score improvement (1-10 scale) |
| action_url | varchar(500) | — | NULL | Deep link to action |
| action_type | varchar(50) | NOT NULL | — | Type: 'add_skill', 'upload_cert', 'complete_assessment', etc. |
| is_completed | boolean | NOT NULL | false | Whether student completed this action |
| completed_at | timestamptz | — | NULL | When completed |
| is_dismissed | boolean | NOT NULL | false | Whether student dismissed this |
| dismissed_at | timestamptz | — | NULL | When dismissed |
| generated_at | timestamptz | NOT NULL | now() | When AI generated this |
| expires_at | timestamptz | NOT NULL | now() + interval '30 days' | Recommendation expiry |
| created_at | timestamptz | NOT NULL | now() | Record creation |
| updated_at | timestamptz | NOT NULL | now() | Last update |

**Indexes:**
- INDEX(student_id, is_completed, is_dismissed, priority)
- INDEX(student_id, dimension_targeted)
- INDEX(expires_at)

### Enums

```sql
CREATE TYPE copilot_message_role AS ENUM ('user', 'assistant', 'system');

CREATE TYPE gx_grade_bracket AS ENUM ('beginner', 'emerging', 'developing', 'strong', 'exceptional');

CREATE TYPE gx_dimension AS ENUM (
  'academic_readiness', 'technical_skills', 'communication', 'leadership',
  'project_experience', 'internship_experience', 'international_exposure',
  'certifications', 'portfolio_quality', 'interview_readiness', 'languages', 'industry_skills'
);

CREATE TYPE recommendation_priority AS ENUM ('high', 'medium', 'low');

CREATE TYPE score_trigger_type AS ENUM ('profile_update', 'nightly_batch', 'manual_recalc', 'admin_override');

CREATE TYPE match_calculation_status AS ENUM ('idle', 'calculating', 'completed', 'failed', 'stale');
```

## 5. API Contracts

### POST /api/v1/matching/score
Calculate or retrieve match score for a student-opportunity pair.

**Request:**
```json
{
  "student_id": "uuid",
  "opportunity_id": "uuid",
  "force_recalculate": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "opportunity_id": "uuid",
    "composite_score": 78.50,
    "dimensions": {
      "skills": { "score": 85.00, "weight": 0.20, "weighted_score": 17.00 },
      "academic": { "score": 72.00, "weight": 0.20, "weighted_score": 14.40 },
      "experience": { "score": 65.00, "weight": 0.20, "weighted_score": 13.00 },
      "geography": { "score": 90.00, "weight": 0.15, "weighted_score": 13.50 },
      "availability": { "score": 100.00, "weight": 0.15, "weighted_score": 15.00 },
      "mobility": { "score": 56.00, "weight": 0.10, "weighted_score": 5.60 }
    },
    "skill_gaps": [
      { "skill_name": "React", "priority": "high", "proficiency_required": "advanced", "proficiency_current": null },
      { "skill_name": "TypeScript", "priority": "medium", "proficiency_required": "intermediate", "proficiency_current": "beginner" }
    ],
    "opportunity_type": "technical_internship",
    "calculated_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-16T10:30:00Z",
    "from_cache": true
  },
  "error": null
}
```

**Error (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Student or opportunity not found",
    "details": { "missing": "opportunity_id" }
  }
}
```

### GET /api/v1/matching/score?student_id={uuid}&opportunity_id={uuid}
Retrieve cached match score without triggering recalculation.

**Response (200):** Same as POST response with `from_cache: true`
**Response (404):** If no cached score exists

### GET /api/v1/matching/explain?student_id={uuid}&opportunity_id={uuid}
Generate or retrieve AI natural-language explanation for a match score.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student_id": "uuid",
    "opportunity_id": "uuid",
    "composite_score": 78.50,
    "explanation": "You're a strong match for this Technical Internship at Acme Corp! Your Python and JavaScript skills align well with their requirements (85% skills match). Your GPA of 3.7 exceeds their 3.5 minimum. While you have relevant project experience, gaining more hands-on internship exposure would strengthen your profile. Great news — you're available for the full duration and located in the same city!",
    "improvement_suggestions": [
      "Learn React to fill the top skill gap — this alone could boost your match by ~5%",
      "Consider upgrading your TypeScript proficiency from beginner to intermediate",
      "Adding one more relevant internship would significantly boost your experience score"
    ],
    "generated_at": "2024-01-15T10:35:00Z"
  },
  "error": null
}
```

### POST /api/v1/matching/batch
Trigger batch calculation of top matches for an opportunity. (Admin/Employer only)

**Request:**
```json
{
  "opportunity_id": "uuid",
  "limit": 100,
  "min_score_threshold": 30
}
```

**Response (202):**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "opportunity_id": "uuid",
    "status": "queued",
    "estimated_completion_seconds": 30,
    "candidates_to_process": 250
  },
  "error": null
}
```

### GET /api/v1/matching/batch/{job_id}
Check batch calculation job status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "completed",
    "opportunity_id": "uuid",
    "matches_calculated": 100,
    "top_score": 95.20,
    "median_score": 62.40,
    "completed_at": "2024-01-15T10:31:00Z"
  },
  "error": null
}
```

### GET /api/v1/matching/candidates?opportunity_id={uuid}&page=1&per_page=20&min_score=50
Get ranked candidate list for an opportunity. (Employer only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "student_id": "uuid",
      "student_name": "Jane Doe",
      "composite_score": 92.30,
      "dimensions": { "skills": 95, "academic": 88, "experience": 90, "geography": 100, "availability": 95, "mobility": 80 },
      "top_skills_matched": ["Python", "React", "Machine Learning"],
      "skill_gaps_count": 1,
      "calculated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 85,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  },
  "error": null
}
```

### POST /api/v1/copilot/chat
Send a message to GX Career Copilot. Returns SSE stream.

**Request:**
```json
{
  "session_id": "uuid | null",
  "message": "What skills am I missing for this internship?",
  "page_context": "/opportunities/uuid-123",
  "page_type": "opportunity_detail",
  "entity_id": "uuid-123"
}
```

**Response (200, Content-Type: text/event-stream):**
```
data: {"type":"session","session_id":"uuid-456"}

data: {"type":"token","content":"Based"}

data: {"type":"token","content":" on"}

data: {"type":"token","content":" your"}

data: {"type":"token","content":" profile"}

...

data: {"type":"done","message_id":"uuid-789","tokens_used":1250}

```

**Error Response (429):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily message limit reached (50/50)",
    "details": { "resets_at": "2024-01-16T00:00:00Z", "messages_used": 50, "messages_limit": 50 }
  }
}
```

### GET /api/v1/copilot/sessions?page=1&per_page=10
Get student's copilot session history.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "started_at": "2024-01-15T09:00:00Z",
      "last_activity_at": "2024-01-15T09:15:00Z",
      "message_count": 12,
      "is_active": false,
      "preview": "What skills am I missing for..."
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_count": 23,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  },
  "error": null
}
```

### GET /api/v1/copilot/sessions/{session_id}/messages?page=1&per_page=20
Get messages for a specific session.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "role": "user",
      "content": "What skills am I missing for this internship?",
      "page_context": "/opportunities/uuid-123",
      "created_at": "2024-01-15T09:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Based on your profile and the **Technical Internship** requirements...",
      "tokens_used": 1250,
      "created_at": "2024-01-15T09:00:05Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 12,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  },
  "error": null
}
```

### GET /api/v1/gx-score
Get current student's GX Score with all dimensions.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "composite_score": 67.50,
    "grade_bracket": "developing",
    "dimensions": {
      "academic_readiness": 82.00,
      "technical_skills": 75.00,
      "communication": 60.00,
      "leadership": 45.00,
      "project_experience": 70.00,
      "internship_experience": 55.00,
      "international_exposure": 80.00,
      "certifications": 65.00,
      "portfolio_quality": 50.00,
      "interview_readiness": 40.00,
      "languages": 90.00,
      "industry_skills": 68.00
    },
    "last_calculated_at": "2024-01-15T02:00:00Z",
    "daily_change": 3.20,
    "anti_gaming_flagged": false
  },
  "error": null
}
```

### GET /api/v1/gx-score/history?period=30d&page=1&per_page=30
Get GX Score history for trend visualization.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "composite_score": 67.50,
      "grade_bracket": "developing",
      "dimension_scores": { "academic_readiness": 82, "technical_skills": 75, "...": "..." },
      "change_delta": 2.30,
      "trigger_type": "profile_update",
      "trigger_details": { "field_changed": "skills", "skill_added": "Docker" },
      "capped": false,
      "created_at": "2024-01-15T02:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 30,
    "total_count": 28,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  },
  "error": null
}
```

### GET /api/v1/gx-score/recommendations
Get AI-generated improvement recommendations.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Add React to your technical skills",
      "description": "React is the most requested skill for technical internships in your target geography. Adding it with at least intermediate proficiency could boost your Technical Skills dimension by ~8 points.",
      "dimension_targeted": "technical_skills",
      "priority": "high",
      "estimated_impact": 8,
      "action_url": "/profile/skills?add=react",
      "action_type": "add_skill",
      "is_completed": false,
      "is_dismissed": false,
      "generated_at": "2024-01-15T02:00:00Z"
    }
  ],
  "error": null
}
```

### POST /api/v1/gx-score/recommendations/{id}/complete
Mark a recommendation as completed.

**Request:** (empty body)

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "is_completed": true, "completed_at": "2024-01-15T12:00:00Z" },
  "error": null
}
```

### POST /api/v1/gx-score/recommendations/{id}/dismiss
Dismiss a recommendation.

**Request:**
```json
{ "reason": "not_relevant" }
```

**Response (200):**
```json
{
  "success": true,
  "data": { "id": "uuid", "is_dismissed": true, "dismissed_at": "2024-01-15T12:00:00Z" },
  "error": null
}
```

### POST /api/v1/gx-score/recalculate
Manually trigger GX Score recalculation (admin or student).

**Request:**
```json
{ "student_id": "uuid" }
```

**Response (202):**
```json
{
  "success": true,
  "data": { "status": "queued", "estimated_seconds": 10 },
  "error": null
}
```

## 6. Module Dependencies

| Dependency | What's Needed | How It's Used | Failure Handling |
|---|---|---|---|
| app_shell | Navigation context, page metadata, authenticated layout | Copilot reads current page URL/type for context injection; widget mounted inside app shell layout | Copilot operates without page context, uses generic prompts |
| authentication | Current user session, role, student_id | All APIs validate auth token; RLS enforces data access | Return 401, redirect to login |
| student_onboarding | Student profile data (skills, GPA, experience, preferences, languages, certifications) | Matching reads profile for scoring; GX Score reads all profile dimensions for calculation | Score dimensions with missing data default to 0; prompt user to complete profile |
| opportunities (external) | Opportunity requirements, skills, dates, location, type | Matching compares student against opportunity requirements | Return error if opportunity not found; cached scores remain valid |
| OpenAI/Anthropic API | GPT-4 or Claude model access | Match explanations, Copilot responses, GX Score recommendations | Circuit breaker → canned responses; cached explanations served; retry with exponential backoff |
| Supabase Realtime | WebSocket subscriptions | Score change notifications pushed to client | Fallback to polling every 30 seconds |
| Supabase Edge Functions | Serverless compute for batch operations | Batch match calculation, nightly GX Score recalculation | Retry failed jobs up to 3 times; alert admin after persistent failure |
| Supabase Storage | N/A for this module | Not directly used | N/A |
| Vercel Edge Runtime | Low-latency API routing, SSE support | Copilot SSE streaming, score API responses | Fallback to standard serverless if edge unavailable |

## 7. Non-Functional Requirements

**Pagination:**
- All list endpoints use cursor-based pagination with `page` and `per_page` parameters
- Default per_page: 20, maximum: 100
- Response includes `pagination` object per shared_contracts.md

**Rate Limiting:**
- Copilot: 50 messages per student per 24-hour rolling window
- Match score API: 100 requests per student per minute
- Match explanation API: 20 requests per student per hour (AI generation cost)
- Batch calculation: 5 concurrent jobs per organization
- GX Score recalculate: 1 manual trigger per student per hour

**Caching:**
- Match scores: 24-hour TTL in database, 5-minute TTL in edge cache (CDN)
- Match explanations: 1-hour TTL after generation
- GX Score: no TTL (always current), but cached in-memory on client for 5 minutes
- Copilot context: session-level cache of profile summary (refreshed on session start)
- Weight configs: cached in-memory with 1-hour TTL (rarely changes)

**Concurrency:**
- Distributed lock (Redis/Supabase advisory lock) prevents duplicate match calculations for same pair
- GX Score recalculation uses optimistic locking with version field
- Copilot messages processed sequentially per session (queue if concurrent)
- Batch jobs use work-stealing pattern for parallel candidate processing

**Performance Targets:**
- Cached match score retrieval: <100ms (p95)
- On-demand match calculation: <3 seconds (p95)
- Batch calculation (100 candidates): <30 seconds
- Copilot first token: <1.5 seconds (p95)
- Copilot full response: <10 seconds (p95)
- GX Score dashboard load: <1 second (p95)
- GX Score recalculation: <10 seconds per student
- Nightly batch (all students): <2 hours for 10,000 students

**Data Retention:**
- Match scores: retained while opportunity is active + 90 days after closure
- Copilot sessions/messages: 12 months, then archived to cold storage
- GX Score current: retained indefinitely while student account active
- GX Score history: 24 months detailed, then aggregated to weekly summaries
- Recommendations: 90 days after expiration, then deleted

**Availability:**
- Match scoring: 99.9% uptime (graceful degradation to cached scores)
- Copilot: 99.5% uptime (circuit breaker provides canned responses)
- GX Score read: 99.9% (read from database, always available)
- GX Score write/recalculate: 99.5% (can be delayed, not lost)

## 8. Key Implementation Notes

1. **Jaccard Similarity with Proficiency Weighting**: The skills dimension doesn't use simple Jaccard. Each skill match is weighted by proficiency proximity: exact match = 1.0, one level above = 1.1 (bonus), one below = 0.7, two below = 0.4. The modified Jaccard formula is: `Σ(matched_skill_weights) / (|required_skills| + |student_extra_skills| * 0.1)`. Extra student skills contribute minimally to avoid gaming by adding irrelevant skills.

2. **SSE Streaming Implementation**: The Copilot endpoint uses the Web Streams API on Vercel Edge Runtime. Create a `TransformStream`, write SSE-formatted chunks as tokens arrive from the AI provider. Include heartbeat events every 15 seconds to keep the connection alive. Client uses `EventSource` polyfill that supports POST method (native EventSource is GET-only). Use `@microsoft/fetch-event-source` on client side.

3. **Anti-Gaming Debounce Implementation**: Use a Supabase database trigger on profile-related tables that inserts into a `gx_score_recalc_queue` table with `scheduled_for = NOW() + INTERVAL '5 minutes'`. A cron job (Supabase pg_cron) checks every minute for due recalculations. If multiple queue entries exist for same student within the window, collapse to single recalculation. The anti-gaming cap is enforced at write time: before updating `gx_scores`, compare new values against `daily_change_applied` and cap each dimension's change.

4. **Context Injection Strategy for Copilot**: Build the context window in layers with priority. Layer 1 (always included, ~500 tokens): student name, GX Score, top 5 skills, current GPA, target role. Layer 2 (if space, ~1000 tokens): last 10 messages. Layer 3 (page-specific, ~500 tokens): if on opportunity page, include opportunity requirements summary; if on GX Score page, include dimension scores; if on application page, include application status. Layer 4 (remaining budget): extended profile details. Use tiktoken to count tokens and trim from Layer 4 → Layer 3 → Layer 2 if exceeding 4000 input budget.

5. **Batch Match Calculation Architecture**: Implemented as a Supabase Edge Function triggered by HTTP call or cron schedule. Uses PostgreSQL `FOR UPDATE SKIP LOCKED` pattern on a jobs queue table for distributed processing. Processes students in chunks of 10 with `Promise.allSettled()`. Each chunk calculates all 6 dimensions, computes weighted composite, and upserts to `match_scores`. Failed individual calculations are logged and retried once. Final job status updated with statistics.

6. **GX Score Dimension Rubrics as Configuration**: Store scoring rubrics in a `gx_score_rubrics` JSONB configuration table, not hardcoded. Each dimension has a rubric document defining how raw profile data maps to 0-100 score. This allows admins to adjust scoring criteria without code deployment. Example rubric for Technical Skills: `{"per_skill_base": 5, "proficiency_multiplier": {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}, "cap": 100, "verified_bonus": 1.5}`.

7. **Circuit Breaker Implementation**: Use an in-memory circuit breaker (per Edge Function instance) with shared state in Redis/Supabase. Track failure timestamps in a sorted set. On each AI API call: check if 3+ failures exist within last 60 seconds → if yes, return canned response immediately without calling AI. After 5 minutes (OPEN → HALF_OPEN), allow one test request through. Success resets the breaker. Store breaker state in a lightweight key-value table for cross-instance coordination.

8. **Match Score Invalidation Cascade**: When a student updates their profile, a Supabase database trigger fires a `pg_notify` event on channel `profile_changes` with payload `{student_id, changed_fields}`. A listener process receives this and: (a) marks all `match_scores` for that student where `expires_at > NOW()` as expired by setting `expires_at = NOW()`, (b) inserts a debounced GX Score recalculation job. When an opportunity's requirements change, similarly invalidate all cached scores for that opportunity_id. This ensures no stale data is served.

## 9. File Map

```
src/
├── modules/
│   └── ai-matching-engine/
│       ├── index.ts                                    # Module barrel export
│       │
│       ├── types/
│       │   ├── matching.types.ts                       # Match score, dimension, weight interfaces
│       │   ├── copilot.types.ts                        # Session, message, context interfaces
│       │   ├── gx-score.types.ts                       # GX Score, dimension, history interfaces
│       │   └── enums.ts                                # All module enums (TypeScript mirrors of DB enums)
│       │
│       ├── constants/
│       │   ├── matching-weights.ts                     # Default weights and per-type overrides
│       │   ├── gx-dimensions.ts                        # Dimension definitions, labels, icons
│       │   ├── grade-brackets.ts                       # Grade bracket thresholds and labels
│       │   ├── copilot-prompts.ts                      # System prompts, canned responses, safety rules
│       │   └── scoring-rubrics.ts                      # Default rubric configurations
│       │
│       ├── lib/
│       │   ├── matching/
│       │   │   ├── calculate-match-score.ts            # Main orchestrator for 6-dimension calculation
│       │   │   ├── dimensions/
│       │   │   │   ├── skills-scorer.ts                # Jaccard + proficiency weighting
│       │   │   │   ├── academic-scorer.ts              # GPA threshold + field match
│       │   │   │   ├── experience-scorer.ts            # Recency-weighted relevance
│       │   │   │   ├── geography-scorer.ts             # Geo-distance + visa scoring
│       │   │   │   ├── availability-scorer.ts          # Date overlap calculation
│       │   │   │   └── mobility-scorer.ts              # International exposure scoring
│       │   │   ├── weight-resolver.ts                  # Resolve weights for opportunity type
│       │   │   ├── skill-gap-analyzer.ts               # Identify missing/partial skills
│       │   │   ├── explanation-generator.ts            # AI explanation via GPT-4/Claude
│       │   │   ├── batch-processor.ts                  # Batch match calculation logic
│       │   │   └── cache-manager.ts                    # TTL check, invalidation, upsert
│       │   │
│       │   ├── copilot/
│       │   │   ├── context-builder.ts                  # Multi-layer context injection with token counting
│       │   │   ├── message-handler.ts                  # Process incoming messages, validate, route
│       │   │   ├── stream-handler.ts                   # SSE stream creation and management
│       │   │   ├── circuit-breaker.ts                  # Circuit breaker state machine
│       │   │   ├── rate-limiter.ts                     # Daily message quota tracking
│       │   │   ├── safety-filter.ts                    # Input/output safety validation
│       │   │   ├── session-manager.ts                  # Session creation, timeout, retrieval
│       │   │   └── canned-responses.ts                 # Fallback response selection logic
│       │   │
│       │   ├── gx-score/
│       │   │   ├── calculate-gx-score.ts               # Main orchestrator for 12-dimension calculation
│       │   │   ├── dimensions/
│       │   │   │   ├── academic-readiness.ts           # GPA normalization, degree bonus
│       │   │   │   ├── technical-skills.ts             # Verified skills × proficiency
│       │   │   │   ├── communication.ts                # Writing + language test scoring
│       │   │   │   ├── leadership.ts                   # Role duration × team size
│       │   │   │   ├── project-experience.ts           # Projects × complexity
│       │   │   │   ├── internship-experience.ts        # Months × relevance
│       │   │   │   ├── international-exposure.ts       # Countries × duration
│       │   │   │   ├── certifications.ts               # Certs × issuer weight
│       │   │   │   ├── portfolio-quality.ts            # Items × variety × recency
│       │   │   │   ├── interview-readiness.ts          # Mock interviews + assessments
│       │   │   │   ├── languages.ts                    # Language count × proficiency
│       │   │   │   └── industry-skills.ts              # Market demand matching
│       │   │   ├── anti-gaming-guard.ts                # Daily cap enforcement and flagging
│       │   │   ├── grade-bracket-resolver.ts           # Composite → grade bracket mapping
│       │   │   ├── recommendation-generator.ts         # AI recommendation generation
│       │   │   └── history-tracker.ts                  # Score history recording
│       │   │
│       │   └── shared/
│       │       ├── ai-client.ts                        # Unified OpenAI/Anthropic client with fallback
│       │       ├── token-counter.ts                    # Tiktoken-based token counting utility
│       │       └── distributed-lock.ts                 # Advisory lock / Redis lock utility
│       │
│       ├── hooks/
│       │   ├── use-match-score.ts                      # Fetch/cache match score for opportunity
│       │   ├── use-match-explanation.ts                # Fetch AI explanation on demand
│       │   ├── use-skill-gaps.ts                       # Extract and format skill gaps
│       │   ├── use-copilot.ts                          # Main Copilot state management hook
│       │   ├── use-copilot-stream.ts                   # SSE stream connection and parsing
│       │   ├── use-copilot-session.ts                  # Session lifecycle management
│       │   ├── use-gx-score.ts                         # Fetch current GX Score
│       │   ├── use-gx-score-history.ts                 # Fetch score history for charts
│       │   ├── use-gx-recommendations.ts              # Fetch and manage recommendations
│       │   └── use-gx-score-realtime.ts               # Realtime subscription for score changes
│       │
│       ├── components/
│       │   ├── matching/
│       │   │   ├── match-score-badge.tsx               # Circular score indicator (card-level)
│       │   │   ├── match-score-breakdown.tsx           # 6-dimension horizontal bars
│       │   │   ├── match-explanation-modal.tsx         # Full explanation with AI text
│       │   │   ├── skill-gap-panel.tsx                 # Skill gap chips and priority list
│       │   │   ├── skill-chip.tsx                      # Individual skill chip (matched/missing/partial)
│       │   │   ├── candidate-rank-list.tsx             # Employer view: ranked candidates table
│       │   │   └── candidate-match-card.tsx            # Individual candidate card with score
│       │   │
│       │   ├── copilot/
│       │   │   ├── copilot-widget.tsx                  # Main widget container (collapsed/expanded)
│       │   │   ├── copilot-button.tsx                  # Collapsed circular trigger button
│       │   │   ├── copilot-chat-panel.tsx              # Expanded chat interface
│       │   │   ├── copilot-header.tsx                  # Chat panel header with controls
│       │   │   ├── copilot-message-list.tsx            # Scrollable message container
│       │   │   ├── copilot-message-bubble.tsx          # Individual message (user or assistant)
│       │   │   ├── copilot-typing-indicator.tsx        # Animated dots during streaming
│       │   │   ├── copilot-suggested-prompts.tsx       # Contextual prompt chips
│       │   │   ├── copilot-input.tsx                   # Text input with send button
│       │   │   └── copilot-rate-limit-banner.tsx       # Rate limit warning/exhausted display
│       │   │
│       │   └── gx-score/
│       │       ├── gx-score-dashboard.tsx              # Main dashboard layout
│       │       ├── gx-score-header.tsx                 # Large score display with grade
│       │       ├── gx-score-radar-chart.tsx            # Recharts radar visualization
│       │       ├── gx-score-dimension-grid.tsx         # 12-card grid layout
│       │       ├── gx-score-dimension-card.tsx         # Individual dimension card
│       │       ├── gx-score-history-chart.tsx          # Area chart for score trends
│       │       ├── gx-score-recommendations.tsx        # Recommendations list panel
│       │       ├── gx-score-recommendation-card.tsx    # Individual recommendation card
│       │       ├── gx-score-grade-badge.tsx            # Grade bracket label badge
│       │       └── gx-score-change-indicator.tsx       # Delta arrow with value
│       │
│       ├── api/
│       │   ├── matching/
│       │   │   ├── route.ts                            # GET/POST /api/v1/matching/score
│       │   │   ├── explain/route.ts                    # GET /api/v1/matching/explain
│       │   │   ├── batch/route.ts                      # POST /api/v1/matching/batch
│       │   │   ├── batch/[jobId]/route.ts              # GET /api/v1/matching/batch/:jobId
│       │   │   └── candidates/route.ts                 # GET /api/v1/matching/candidates
│       │   │
│       │   ├── copilot/
│       │   │   ├── chat/route.ts                       # POST /api/v1/copilot/chat (SSE)
│       │   │   ├── sessions/route.ts                   # GET /api/v1/copilot/sessions
│       │   │   └── sessions/[sessionId]/
│       │   │       └── messages/route.ts               # GET /api/v1/copilot/sessions/:id/messages
│       │   │
│       │   └── gx-score/
│       │       ├── route.ts                            # GET /api/v1/gx-score
│       │       ├── history/route.ts                    # GET /api/v1/gx-score/history
│       │       ├── recommendations/route.ts            # GET /api/v1/gx-score/recommendations
│       │       ├── recommendations/[id]/
│       │       │   ├── complete/route.ts               # POST .../complete
│       │       │   └── dismiss/route.ts                # POST .../dismiss
│       │       └── recalculate/route.ts                # POST /api/v1/gx-score/recalculate
│       │
│       ├── pages/
│       │   └── gx-score/
│       │       ├── page.tsx                            # /(student)/gx-score main page
│       │       └── loading.tsx                         # Loading skeleton for GX Score page
│       │
│       ├── edge-functions/
│       │   ├── batch-match-calculation.ts              # Supabase Edge Function for batch matching
│       │   ├── nightly-gx-score-recalc.ts             # Nightly cron for all student GX recalculation
│       │   └── profile-change-handler.ts              # Webhook handler for profile change events
│       │
│       └── __tests__/
│           ├── matching/
│           │   ├── skills-scorer.test.ts               # Unit tests for Jaccard + proficiency
│           │   ├── academic-scorer.test.ts             # Unit tests for GPA thresholds
│           │   ├── calculate-match-score.test.ts       # Integration test for full scoring
│           │   └── batch-processor.test.ts             # Batch job tests
│           ├── copilot/
│           │   ├── context-builder.test.ts             # Context injection token management
│           │   ├── circuit-breaker.test.ts             # State transition tests
│           │   ├── rate-limiter.test.ts                # Daily limit enforcement
│           │   └── safety-filter.test.ts               # Prohibited topic detection
│           └── gx-score/
│               ├── calculate-gx-score.test.ts          # Full GX Score calculation
│               ├── anti-gaming-guard.test.ts           # Cap enforcement
│               └── dimension-scorers.test.ts           # Individual dimension tests

supabase/
├── migrations/
│   ├── 20240115_001_create_match_scores.sql            # match_scores table + indexes
│   ├── 20240115_002_create_match_weight_configs.sql    # Weight configuration table
│   ├── 20240115_003_create_copilot_tables.sql          # Sessions, messages, rate_limits
│   ├── 20240115_004_create_gx_score_tables.sql         # gx_scores, history, recommendations
│   ├── 20240115_005_create_enums.sql                   # All custom enum types
│   ├── 20240115_006_create_rls_policies.sql            # Row-level security policies
│   ├── 20240115_007_create_triggers.sql                # Profile change triggers, debounce queue
│   └── 20240115_008_create_indexes.sql                 # Additional performance indexes
└── functions/
    ├── batch-match-calculation/index.ts                 # Deployed Edge Function
    ├── nightly-gx-recalc/index.ts                      # Deployed Edge Function
    └── profile-change-webhook/index.ts                  # Deployed Edge Function
```