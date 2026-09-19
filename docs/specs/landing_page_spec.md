# Module Spec: Landing Page

## 1. Overview & Purpose

- The Landing Page module is the primary public-facing marketing page for the GlobalXcelerate platform, designed to convert visitors into registered users by showcasing the platform's core value propositions: global career opportunities, AI-powered matching, and employability scoring.
- It serves all anonymous visitors (prospective Students, Employers, University Admins, Program Providers) as well as returning authenticated users who navigate to the root URL.
- Key screens/interfaces: Single-page layout at `src/app/(public)/page.tsx` with 9 distinct sections (Hero, Opportunity Discovery Cards, AI Matching Preview, Global Employability Score Visualization, University Partners, Employer Partners, Statistics Counter, Testimonials Carousel, Final CTA Block), plus shared header/footer.
- Connects to the App Shell module for shared layout chrome (navigation header, footer); all content is statically generated at build time with no runtime data fetching; CTA buttons link to the Authentication module's signup flow at `/signup`.
- This module does NOT handle user authentication, dynamic user-specific content, actual AI matching logic, real score calculations, or any server-side data mutations. It is purely a presentational SSG page with minimal client-side interactivity (animations, carousel controls).

## 2. Visual Design & Brand Guidelines

Reference design.md for all design and brand guidelines.

Module-specific UI overrides:

| Property | Override Value | Reason |
|----------|---------------|--------|
| Hero background | Gradient from Navy (#0F172A) to Slate (#1E293B) | Full-bleed dark hero section for maximum visual impact |
| Hero CTA button | Cyan (#06B6D4) fill, white text, `px-8 py-4 text-lg rounded-xl` | Oversized for primary conversion action |
| Section padding | `py-20 lg:py-28` | Generous vertical spacing between landing sections |
| Card border-radius | `rounded-2xl` (16px) | Softer, more premium feel for marketing cards |
| Typography scale | Hero H1: `text-5xl lg:text-7xl font-bold`, Section H2: `text-3xl lg:text-4xl font-semibold` | Larger display typography for marketing context |
| Animated globe | CSS keyframe animations + SVG paths only; no Three.js, Globe.gl, or WebGL | Performance constraint for LCP < 2.0s |
| Statistics counter | Cyan (#06B6D4) number text, Navy body text | Visual highlight for impact numbers |
| Partner logos | Grayscale by default, color on hover with `transition-all duration-300` | Subtle elegance, draw attention on interaction |
| Testimonial cards | White background, soft shadow `shadow-md`, left cyan border `border-l-4 border-cyan-500` | Visual consistency with brand accent |

## 3. Features & Functional Requirements

### 3.1 Hero Section

**User Flow:**
1. Visitor lands on the page and immediately sees the hero section filling the viewport.
2. The animated globe/world map renders with pulsing connection lines between global nodes.
3. Headline "Launch Your Global Career" and subheadline are visible without scrolling.
4. Primary CTA "Get Started Free" button is prominently displayed.
5. Secondary CTA "Watch Demo" link is available below primary CTA.
6. On click of primary CTA, visitor is navigated to `/signup`.
7. On click of secondary CTA, a lightweight modal or scroll-to-section shows the AI Matching Preview.

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│  [Nav Header from App Shell]                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │  "Launch Your        │  │                         │ │
│  │   Global Career"     │  │   [Animated Globe SVG]  │ │
│  │                      │  │   - Pulsing nodes       │ │
│  │  Subheadline text    │  │   - Connection arcs     │ │
│  │  describing value    │  │   - Rotating motion     │ │
│  │                      │  │                         │ │
│  │  [Get Started Free]  │  │                         │ │
│  │  Watch Demo ↓        │  │                         │ │
│  └──────────────────────┘  └─────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Desktop: Two-column layout (55% text / 45% globe), vertically centered.
- Tablet (768px): Stacked with text above, globe below at reduced size (max 400px width).
- Mobile (<640px): Single column, text only with globe hidden or replaced with a static simplified SVG.

**Components:**
- `HeroSection` — Server Component, renders static HTML/SVG
- `AnimatedGlobe` — Client Component (minimal JS for CSS animation triggers), uses `"use client"` directive
- `HeroCTA` — Server Component wrapping `<Link>` to `/signup`

**Business Rules:**
- The hero section must render entirely above the fold on 1440px desktop displays (max height 100vh).
- The globe animation must not block the main thread; all animations use CSS `transform` and `opacity` only (GPU-composited properties).
- The globe SVG must be inlined (no external fetch) to avoid render-blocking requests.
- Primary CTA text is "Get Started Free" for anonymous visitors.
- If a user is authenticated (detected via cookie in middleware), the CTA text changes to "Go to Dashboard" and links to `/dashboard`.

**State Machine:**
```
HERO_STATES:
  STATIC → initial server-rendered state, globe not animated
  ANIMATED → after hydration, globe CSS animations activate via class toggle
  REDUCED_MOTION → if prefers-reduced-motion, globe shows static state with no animation
```

**Edge Cases:**
- User has `prefers-reduced-motion: reduce` media query active → globe displays as a static SVG with visible connection lines but no animation.
- JavaScript disabled → hero renders fully as static HTML/SVG; CTA links still functional as standard `<a>` tags.
- Very slow connection → globe SVG is inlined in HTML, no external resources needed.
- Screen readers → globe has `aria-hidden="true"` and descriptive `aria-label` on the section.

**Acceptance Criteria:**
- Hero section LCP element (headline text) renders in < 1.5s on 4G connection.
- Globe animation runs at 60fps with no layout shifts (CLS = 0 for hero section).
- Primary CTA navigates to `/signup` within 100ms of click.
- Hero is fully accessible: heading hierarchy correct (h1), color contrast ratio ≥ 4.5:1 for all text.
- Responsive layout transitions smoothly between breakpoints with no content overflow.
- Total hero section HTML + inline SVG weight < 50KB gzip.

---

### 3.2 Opportunity Discovery Cards

**User Flow:**
1. User scrolls past hero into the opportunity discovery section.
2. Seven category cards are displayed in a responsive grid.
3. Each card shows an icon, category name, brief description, and opportunity count.
4. Cards have hover effects (elevation, border color change).
5. Clicking a card navigates to `/signup` with a query parameter indicating interest category.

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│  Section Header: "Discover Global Opportunities"        │
│  Subheader: "Explore 7 categories..."                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │ 🌍      │ │ 💼      │ │ 🎓      │ │ 🔬      │     │
│  │Internsh.│ │Graduate │ │Exchange │ │Research │     │
│  │ 2,400+  │ │ 1,850+  │ │ 960+    │ │ 520+    │     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ 🏢      │ │ 🌐      │ │ 📚      │                  │
│  │Fellowsh.│ │Volunteer│ │Short    │                  │
│  │ 340+    │ │ 780+    │ │Course   │                  │
│  └─────────┘ └─────────┘ │ 1,200+  │                  │
│                           └─────────┘                  │
└─────────────────────────────────────────────────────────┘
```

- Desktop: 4-column grid for first row, 3 centered for second row.
- Tablet: 3-column grid wrapping to 2+2+2+1.
- Mobile: 2-column grid, scrollable if needed.

**Components:**
- `OpportunityDiscoverySection` — Server Component
- `OpportunityCategoryCard` — Server Component (static content, hover via CSS only)

**Seven Categories (exhaustive list):**

| Category | Icon (Lucide) | Count Display | Description |
|----------|---------------|---------------|-------------|
| International Internships | `Globe` | 2,400+ | Gain hands-on experience at global companies |
| Graduate Programs | `Briefcase` | 1,850+ | Launch your career with top employers worldwide |
| Student Exchange | `GraduationCap` | 960+ | Study at partner universities across 50+ countries |
| Research Positions | `FlaskConical` | 520+ | Collaborate on cutting-edge research globally |
| Fellowships | `Building2` | 340+ | Prestigious funded programs for future leaders |
| Volunteer Programs | `Globe2` | 780+ | Make an impact while developing global skills |
| Short Courses & Certifications | `BookOpen` | 1,200+ | Build skills with accredited micro-credentials |

**Business Rules:**
- Counts are hardcoded at build time (updated via CMS or environment variables during rebuild).
- Cards link to `/signup?interest={category_slug}` where category_slug is kebab-case of category name.
- All 7 cards must be visible without horizontal scrolling on tablet and desktop.
- Card hover state: `translateY(-4px)` elevation, cyan border-left appears, shadow increases.

**State Machine:**
```
CARD_STATES:
  DEFAULT → white background, subtle shadow, gray icon
  HOVERED → elevated, cyan accent border, colored icon, increased shadow
  FOCUSED → same as HOVERED + visible focus ring (2px cyan outline offset 2px)
  PRESSED → slight scale down (0.98), darker shadow
```

**Edge Cases:**
- Touch devices: hover state not applicable; cards show default state with active press feedback.
- Cards must not shift layout on hover (use `transform` only, no dimension changes).
- If environment variable for counts is missing, display "Many" as fallback text.
- Screen readers: each card is a `<a>` element with full descriptive text including count.

**Acceptance Criteria:**
- All 7 categories render with correct icon, name, description, and count.
- Grid layout adapts correctly at 1440px, 1024px, 768px, and 375px breakpoints.
- Each card is keyboard-navigable and has visible focus indicator.
- Hover animation completes in ≤ 200ms with `ease-out` timing.
- No CLS from card hover effects.
- Color contrast of card text meets WCAG 2.1 AA (≥ 4.5:1).

---

### 3.3 AI Matching Preview

**User Flow:**
1. User scrolls to the AI Matching section.
2. A visual mockup demonstrates how the platform's AI matches students to opportunities.
3. Left side shows a simplified "student profile" card with skills/interests.
4. Center shows an animated connection/matching visualization (flowing dots or lines).
5. Right side shows 3 "matched opportunity" cards with match percentage badges.
6. A CTA below invites users to "See Your Matches" (links to `/signup`).

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│  "AI-Powered Matching"                                  │
│  "Our algorithm analyzes 50+ data points..."            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ╌╌╌╌╌╌╌╌╌╌    ┌──────────────────┐  │
│  │ Student  │    →  ●  →  →    │ 98% Internship A │  │
│  │ Profile  │    →    ●   →    │ 94% Exchange B   │  │
│  │ ────────│    →  ●     →    │ 91% Research C   │  │
│  │ Skills: │    ╌╌╌╌╌╌╌╌╌╌    └──────────────────┘  │
│  │ JS, Py  │                                          │
│  │ Goals:  │                                          │
│  │ London  │                                          │
│  └──────────┘                                          │
│                                                         │
│            [See Your Matches →]                         │
└─────────────────────────────────────────────────────────┘
```

- Desktop: Three-column layout with animated center connector.
- Tablet: Same layout, reduced padding.
- Mobile: Vertical stack — profile card → arrow down → matched cards stacked.

**Components:**
- `AIMatchingSection` — Server Component (outer wrapper)
- `MockStudentProfile` — Server Component (static profile card)
- `MatchingAnimation` — Client Component (`"use client"`) for flowing dot animation
- `MatchedOpportunityCard` — Server Component (renders 3 static cards)
- `MatchPercentageBadge` — Server Component (displays percentage with cyan background)

**Mock Data (hardcoded):**

Student Profile:
- Name: "Sarah Chen"
- University: "University of Melbourne"
- Skills: ["JavaScript", "Python", "Data Analysis", "UX Research"]
- Interests: ["FinTech", "Sustainability"]
- Preferred Locations: ["London", "Singapore", "Berlin"]

Matched Opportunities:
1. Title: "FinTech Innovation Intern", Company: "Revolut", Location: "London", Match: 98%
2. Title: "Sustainability Research Exchange", University: "NUS Singapore", Match: 94%
3. Title: "Data Science Fellow", Company: "Zalando", Location: "Berlin", Match: 91%

**Business Rules:**
- Animation shows 3-5 dots flowing from left profile to right cards at staggered intervals.
- Dots follow a bezier curve path (CSS `offset-path` or SVG `<animateMotion>`).
- Animation loops infinitely with a 4-second cycle.
- Match percentage badges use color coding: ≥95% = green (#10B981), 90-94% = cyan (#06B6D4), <90% = blue (#3B82F6).
- All content is static/hardcoded; no API calls.

**State Machine:**
```
ANIMATION_STATES:
  IDLE → before component enters viewport
  PLAYING → dots are flowing (triggered by IntersectionObserver)
  PAUSED → user has prefers-reduced-motion OR tab is not visible (Page Visibility API)
```

**Edge Cases:**
- `prefers-reduced-motion: reduce` → dots are statically positioned along the path (no animation), connection lines visible as dashed lines.
- Mobile viewport → center animation replaced with a simple downward arrow icon between stacked cards.
- IntersectionObserver not supported (very old browsers) → animation plays immediately on mount.
- Tab hidden (Page Visibility API) → animation pauses to save CPU.

**Acceptance Criteria:**
- Animation renders at 60fps with no jank on mid-range devices.
- Total JS for this section's client component < 3KB gzip.
- Mockup clearly communicates the concept of AI matching to first-time visitors.
- All text in the mockup is real (not lorem ipsum) and contextually appropriate.
- Section is fully readable and understandable without animation (graceful degradation).
- CTA button navigates to `/signup`.

---

### 3.4 Global Employability Score Visualization

**User Flow:**
1. User scrolls to the GES section.
2. A radial/donut chart shows a sample employability score (e.g., 78/100).
3. Surrounding the chart are 6 dimension labels with individual scores.
4. Brief explanation text describes what the score measures.
5. CTA: "Calculate Your Score" links to `/signup`.

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│  "Your Global Employability Score"                      │
│  "Understand your readiness for international careers"  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │                      │  │ Dimensions:             │ │
│  │    ╭───────────╮     │  │ • Language: 85/100      │ │
│  │   │    78     │     │  │ • Cultural: 72/100     │ │
│  │   │   /100    │     │  │ • Technical: 90/100    │ │
│  │    ╰───────────╯     │  │ • Experience: 65/100   │ │
│  │   [radial chart]     │  │ • Network: 70/100      │ │
│  │                      │  │ • Adaptability: 80/100 │ │
│  └──────────────────────┘  └─────────────────────────┘ │
│                                                         │
│            [Calculate Your Score →]                     │
└─────────────────────────────────────────────────────────┘
```

- Desktop: Two-column, chart left, dimensions right.
- Tablet: Same layout with reduced chart size (240px → 200px).
- Mobile: Stacked — chart on top (180px), dimensions below in 2-column mini-grid.

**Components:**
- `GESPreviewSection` — Server Component
- `RadialScoreChart` — Client Component (`"use client"`) for animated fill on scroll-into-view
- `ScoreDimensionList` — Server Component
- `ScoreDimensionItem` — Server Component (individual dimension with progress bar)

**Score Dimensions (exhaustive):**

| Dimension | Sample Score | Color | Icon (Lucide) |
|-----------|-------------|-------|----------------|
| Language Proficiency | 85 | #06B6D4 (Cyan) | `Languages` |
| Cultural Intelligence | 72 | #8B5CF6 (Purple) | `Users` |
| Technical Skills | 90 | #10B981 (Green) | `Code2` |
| International Experience | 65 | #F59E0B (Amber) | `Plane` |
| Professional Network | 70 | #3B82F6 (Blue) | `Network` |
| Adaptability | 80 | #EC4899 (Pink) | `Shuffle` |

**Business Rules:**
- Radial chart uses SVG `<circle>` with `stroke-dasharray` and `stroke-dashoffset` for the fill animation.
- Animation triggers when section enters viewport (IntersectionObserver with threshold 0.3).
- Fill animation duration: 1.5 seconds with `ease-out` easing.
- Overall score (78) is the weighted average displayed in the center of the radial chart.
- Each dimension shows a horizontal progress bar filled to its respective percentage.
- Chart size: 280px diameter on desktop, 200px tablet, 180px mobile.
- Stroke width: 12px.
- Background stroke: slate-200 (#E2E8F0).
- Progress stroke: cyan gradient from #06B6D4 to #0891B2.

**State Machine:**
```
CHART_STATES:
  EMPTY → stroke-dashoffset equals full circumference (no fill visible)
  ANIMATING → stroke-dashoffset transitions from full to calculated value
  FILLED → final state, score visible, animation complete
  STATIC → prefers-reduced-motion: show final filled state immediately
```

**Edge Cases:**
- `prefers-reduced-motion` → chart renders in final filled state immediately, no animation.
- SVG not supported (extremely rare) → fallback to a large text display "78/100" with colored background.
- Very narrow viewport (<320px) → chart scales down proportionally using `viewBox` preservation.
- Screen readers → chart has `role="img"` with `aria-label="Global Employability Score: 78 out of 100"`.

**Acceptance Criteria:**
- Radial chart animates smoothly at 60fps.
- Chart renders correctly at all breakpoints without overflow or clipping.
- All 6 dimensions are visible with correct labels, scores, and colors.
- ARIA attributes provide full accessibility for the visualization.
- Client-side JS for this section < 2KB gzip.
- CTA links to `/signup`.

---

### 3.5 University Partners Section

**User Flow:**
1. User scrolls to "Trusted by Leading Universities" section.
2. A horizontally scrolling logo carousel displays university partner logos.
3. Carousel auto-scrolls continuously (marquee-style) without user interaction.
4. Logos are grayscale by default, full color on hover.
5. Below logos, a count indicator: "200+ University Partners in 50+ Countries".

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│  "Trusted by Leading Universities Worldwide"            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ← [Logo] [Logo] [Logo] [Logo] [Logo] [Logo] →        │
│     (continuous scroll marquee)                         │
│                                                         │
│  "200+ University Partners in 50+ Countries"            │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `UniversityPartnersSection` — Server Component
- `LogoCarousel` — Client Component (`"use client"`) for infinite scroll animation
- `PartnerLogo` — Server Component (individual logo image with Next.js Image optimization)

**Partner Logos (placeholder set of 12):**

| University | Logo Filename | Alt Text |
|-----------|---------------|----------|
| University of Melbourne | `unimelb.svg` | University of Melbourne logo |
| National University of Singapore | `nus.svg` | NUS logo |
| University of Toronto | `utoronto.svg` | University of Toronto logo |
| ETH Zurich | `ethz.svg` | ETH Zurich logo |
| University of Cape Town | `uct.svg` | University of Cape Town logo |
| Peking University | `pku.svg` | Peking University logo |
| University College London | `ucl.svg` | UCL logo |
| University of Tokyo | `utokyo.svg` | University of Tokyo logo |
| TU Munich | `tum.svg` | TU Munich logo |
| University of São Paulo | `usp.svg` | University of São Paulo logo |
| KAIST | `kaist.svg` | KAIST logo |
| University of Sydney | `usyd.svg` | University of Sydney logo |

**Business Rules:**
- Carousel scrolls left-to-right at 30px/second using CSS `animation: scroll linear infinite`.
- Logos are duplicated in the DOM to create seamless infinite loop (2x array).
- Logo height: 48px on desktop, 36px on mobile. Width auto-proportioned.
- Grayscale filter: `filter: grayscale(100%)` default, `filter: grayscale(0%)` on hover with 300ms transition.
- Carousel pauses on hover (`:hover` on container pauses animation via `animation-play-state: paused`).
- No navigation arrows or dots (pure auto-scroll marquee).

**State Machine:**
```
CAROUSEL_STATES:
  SCROLLING → default continuous scroll
  PAUSED → user hovers over carousel container
  STATIC → prefers-reduced-motion: logos displayed in a static grid (no scrolling)
```

**Edge Cases:**
- `prefers-reduced-motion` → logos render in a static responsive grid (4 per row desktop, 3 tablet, 2 mobile) with no animation.
- Logo images fail to load → show university name as text in a styled placeholder box.
- Touch devices → no hover grayscale effect; logos show in full color always.
- Very narrow viewport → carousel still scrolls but shows 2-3 logos at a time.

**Acceptance Criteria:**
- Carousel scrolls smoothly at 60fps using CSS-only animation (no JS RAF loop).
- All 12 logos render with correct alt text.
- Carousel creates seamless infinite loop with no visible gap or jump.
- Pause on hover works correctly.
- Reduced motion preference respected.
- Logos optimized via Next.js Image component (WebP, responsive sizes).

---

### 3.6 Employer Partners Section

**User Flow:**
1. User scrolls to "Where Our Students Work" section.
2. Similar to university section but showcases employer brand logos.
3. Carousel scrolls in opposite direction (right-to-left) for visual variety.
4. Count: "500+ Employer Partners Across 80+ Countries".

**UI Layout & Components:**

Same layout structure as University Partners section but with different content and reverse scroll direction.

**Components:**
- `EmployerPartnersSection` — Server Component
- Reuses `LogoCarousel` component with `direction="reverse"` prop
- Reuses `PartnerLogo` component

**Partner Logos (placeholder set of 12):**

| Employer | Logo Filename | Alt Text |
|----------|---------------|----------|
| Google | `google.svg` | Google logo |
| McKinsey & Company | `mckinsey.svg` | McKinsey logo |
| Unilever | `unilever.svg` | Unilever logo |
| Siemens | `siemens.svg` | Siemens logo |
| Deloitte | `deloitte.svg` | Deloitte logo |
| Samsung | `samsung.svg` | Samsung logo |
| JPMorgan Chase | `jpmorgan.svg` | JPMorgan Chase logo |
| Spotify | `spotify.svg` | Spotify logo |
| Accenture | `accenture.svg` | Accenture logo |
| BMW Group | `bmw.svg` | BMW Group logo |
| Shopify | `shopify.svg` | Shopify logo |
| Nestlé | `nestle.svg` | Nestlé logo |

**Business Rules:**
- Same as University Partners section except:
  - Scroll direction is reversed (`animation-direction: reverse` or negative translate).
  - Count text: "500+ Employer Partners Across 80+ Countries".
  - Section background: subtle slate-50 (#F8FAFC) to differentiate from university section.

**Edge Cases:**
- Same as University Partners section.

**Acceptance Criteria:**
- Same as University Partners section with reverse direction verification.
- Visual distinction from university section is clear (different background, heading).

---

### 3.7 Statistics Counter Section

**User Flow:**
1. User scrolls to the statistics section.
2. Four large numbers animate from 0 to their final values (count-up animation).
3. Animation triggers when section enters viewport.
4. Numbers display with "+" suffix and comma formatting.

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  50,000+ │ │   8,000+ │ │     80+  │ │    500+  │ │
│  │ Students │ │Opportun. │ │Countries │ │Employers │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Desktop: 4-column row, evenly spaced.
- Tablet: 2x2 grid.
- Mobile: 2x2 grid with smaller font sizes.

**Components:**
- `StatisticsSection` — Server Component (wrapper with background)
- `StatCounter` — Client Component (`"use client"`) for count-up animation
- `StatItem` — receives `targetValue`, `label`, and `suffix` props

**Statistics Data:**

| Metric | Target Value | Label | Suffix |
|--------|-------------|-------|--------|
| Students | 50000 | Students Placed Globally | + |
| Opportunities | 8000 | Active Opportunities | + |
| Countries | 80 | Countries Represented | + |
| Employers | 500 | Employer Partners | + |

**Business Rules:**
- Count-up animation duration: 2 seconds.
- Easing: `easeOutCubic` for natural deceleration.
- Numbers formatted with locale-aware thousand separators (e.g., "50,000").
- Animation uses `requestAnimationFrame` for smooth counting.
- Animation triggers once when IntersectionObserver fires (threshold: 0.5).
- After animation completes, values remain static (no re-animation on scroll back).
- Section background: Navy (#0F172A) with white text for contrast and visual break.

**State Machine:**
```
COUNTER_STATES:
  WAITING → section not yet in viewport, displays "0" or final value (if reduced motion)
  COUNTING → numbers incrementing from 0 to target
  COMPLETE → final values displayed, no further animation
```

**Edge Cases:**
- `prefers-reduced-motion` → numbers display immediately at final values, no counting animation.
- User scrolls past section very quickly → animation still completes fully once triggered.
- JavaScript disabled → server-rendered HTML shows final values (no "0" flash).
- Very large numbers → ensure no text wrapping within stat blocks.

**Acceptance Criteria:**
- All 4 statistics animate smoothly from 0 to target value in 2 seconds.
- Numbers are properly formatted with thousand separators.
- Animation triggers only once and does not re-trigger.
- Dark background section meets WCAG AA contrast for white text (confirmed: white on #0F172A = 16.5:1).
- Client JS for counter < 1.5KB gzip.
- SSR renders final values (no flash of "0" before hydration for reduced-motion users).

---

### 3.8 Testimonials Carousel

**User Flow:**
1. User scrolls to testimonials section.
2. Three testimonial cards are visible on desktop (one on mobile).
3. Navigation dots and prev/next arrows allow manual carousel control.
4. Auto-advances every 5 seconds.
5. Pauses on hover or focus within.

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│  "What Our Community Says"                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [←] ┌──────────┐ ┌──────────┐ ┌──────────┐ [→]      │
│      │ "Quote.."│ │ "Quote.."│ │ "Quote.."│          │
│      │          │ │          │ │          │          │
│      │ 👤 Name  │ │ 👤 Name  │ │ 👤 Name  │          │
│      │ Role     │ │ Role     │ │ Role     │          │
│      └──────────┘ └──────────┘ └──────────┘          │
│                                                         │
│              ● ● ○ ○ ○ ○                               │
└─────────────────────────────────────────────────────────┘
```

- Desktop: 3 cards visible at once, arrows on sides.
- Tablet: 2 cards visible.
- Mobile: 1 card visible, swipe-enabled.

**Components:**
- `TestimonialsSection` — Server Component
- `TestimonialsCarousel` — Client Component (`"use client"`) for carousel logic
- `TestimonialCard` — Server Component (individual card)
- `CarouselDots` — Client Component (navigation indicators)
- `CarouselArrow` — Client Component (prev/next buttons)

**Testimonial Data (6 testimonials):**

| # | Quote | Name | Role | University/Company | Avatar Initials |
|---|-------|------|------|-------------------|-----------------|
| 1 | "GlobalXcelerate matched me with my dream internship at Revolut in London. The AI matching was incredibly accurate — it understood my skills and aspirations perfectly." | Sarah Chen | Student | University of Melbourne | SC |
| 2 | "We've hired 40+ exceptional international interns through GlobalXcelerate. The quality of candidates and the matching accuracy saves our recruitment team weeks of screening." | James Morrison | Head of Talent | Deloitte UK | JM |
| 3 | "The Global Employability Score gave me a clear roadmap. I improved from 62 to 89 in six months and landed a graduate role at Siemens in Munich." | Raj Patel | Graduate | IIT Delhi | RP |
| 4 | "As a university admin, this platform has transformed how we connect our students to global opportunities. Placement rates increased by 35% in the first year." | Dr. Maria Santos | Director of Global Programs | University of São Paulo | MS |
| 5 | "The program management tools are exceptional. We can run exchange programs across 12 countries from a single dashboard with full visibility." | Thomas Weber | Program Director | DAAD Germany | TW |
| 6 | "I never thought I could afford an international experience. GlobalXcelerate connected me with a fully-funded fellowship in Singapore that changed my career trajectory." | Amara Okafor | Fellow | University of Lagos | AO |

**Business Rules:**
- Carousel auto-advances every 5000ms.
- Auto-advance pauses when user hovers over carousel or focuses within it.
- Manual navigation (arrows/dots/swipe) resets the auto-advance timer.
- Transition between slides: 400ms `ease-in-out` horizontal slide.
- Navigation dots: filled circle for active set, outline for inactive.
- Cards show max 3 lines of quote text on desktop with "read more" if truncated (expanding inline on click).
- Avatar shows initials in a colored circle (color derived from name hash).
- Swipe gesture support on touch devices (threshold: 50px horizontal movement).

**State Machine:**
```
CAROUSEL_STATES:
  AUTO_PLAYING → advances every 5s
  USER_INTERACTING → paused, waiting for inactivity (resumes after 8s of no interaction)
  TRANSITIONING → slide animation in progress (300-400ms), inputs debounced
  STATIC → prefers-reduced-motion, no auto-advance, instant transitions
```

**Edge Cases:**
- Only 1 testimonial would fit on screen → arrows hidden, dots hidden, single card displayed.
- Touch swipe conflicts with page scroll → only register horizontal swipes where horizontal distance > vertical distance.
- Rapid arrow clicks → debounce to prevent overlapping transitions (ignore clicks during TRANSITIONING state).
- `prefers-reduced-motion` → no auto-advance, no slide animation (instant card swap), arrows/dots still functional.
- Screen readers → carousel has `role="region"` with `aria-label="Testimonials"`, `aria-roledescription="carousel"`, live region announces current slide.

**Acceptance Criteria:**
- All 6 testimonials are accessible through carousel navigation.
- Auto-advance works and pauses correctly on hover/focus.
- Touch swipe navigation works on mobile.
- Carousel meets WCAG 2.1 AA: keyboard navigable, screen reader announces slides, pause control available.
- No layout shift during slide transitions.
- Testimonial text is real and representative of all 5 user roles.

---

### 3.9 Final CTA Block

**User Flow:**
1. User has scrolled through entire page and reaches the final CTA section.
2. Bold headline "Start Your Global Journey Today" with supporting text.
3. Primary CTA button "Create Free Account" links to `/signup`.
4. Secondary text: "Already have an account? Sign in" links to `/login`.

**UI Layout & Components:**

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │  "Start Your Global Journey Today"              │    │
│  │                                                 │    │
│  │  "Join 50,000+ students and 500+ employers      │    │
│  │   already on GlobalXcelerate"                   │    │
│  │                                                 │    │
│  │  [Create Free Account]                          │    │
│  │                                                 │    │
│  │  Already have an account? Sign in               │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

- All breakpoints: Centered text block, full-width section with navy gradient background.
- CTA button: Extra large (px-10 py-5 text-xl), cyan background, white text, rounded-xl.
- Background: Same gradient as hero (Navy to Slate) for visual bookending.

**Components:**
- `FinalCTASection` — Server Component
- Reuses button styles from hero CTA.

**Business Rules:**
- This section visually mirrors the hero to create a cohesive "bookend" effect.
- Statistics mentioned in the supporting text must match the Statistics Counter section values.
- "Sign in" link uses standard text link styling (underline, cyan color).
- Section includes subtle background pattern (dot grid or similar CSS pattern) for visual depth.
- Authenticated users: CTA text changes to "Go to Dashboard", links to `/dashboard`.

**Edge Cases:**
- Authenticated state detection: performed via server-side cookie check in the RSC, not client-side.
- If user is authenticated but has no role → CTA links to `/role-select`.
- If user is authenticated with role but incomplete onboarding → CTA links to `/onboarding`.

**Acceptance Criteria:**
- CTA button is the most prominent interactive element on the page.
- Links are correct for both anonymous and authenticated states.
- Visual consistency with hero section confirmed.
- Color contrast ratio ≥ 4.5:1 for all text on dark background.
- Button has hover, focus, and active states defined.

---

## 4. Data Models

This module does NOT use database-backed data models. All content is statically defined at build time. However, the following TypeScript interfaces define the shape of static content used within the module:

### OpportunityCategory

```typescript
interface OpportunityCategory {
  id: string;                    // kebab-case slug, e.g., "international-internships"
  name: string;                  // Display name, e.g., "International Internships"
  description: string;           // Brief 8-12 word description
  count: number;                 // Number of opportunities (static)
  countDisplay: string;          // Formatted display, e.g., "2,400+"
  icon: LucideIconName;          // Lucide icon component name
  href: string;                  // Link target, e.g., "/signup?interest=international-internships"
  color: string;                 // Accent color for hover state (Tailwind class)
}
```

### Testimonial

```typescript
interface Testimonial {
  id: string;                    // Unique identifier, e.g., "testimonial-1"
  quote: string;                 // Full quote text (50-150 words)
  authorName: string;            // Full name of the author
  authorRole: string;            // Job title or student status
  authorOrganization: string;    // University or company name
  authorInitials: string;        // 2-letter initials for avatar
  authorAvatarColor: string;     // Tailwind bg color class for avatar circle
  userRole: UserRole;            // One of the 5 platform roles
}
```

### StatisticItem

```typescript
interface StatisticItem {
  id: string;                    // e.g., "stat-students"
  targetValue: number;           // Final number value, e.g., 50000
  displayValue: string;          // Formatted final value, e.g., "50,000+"
  label: string;                 // Description label, e.g., "Students Placed Globally"
  suffix: string;                // Appended to number, e.g., "+"
  icon: LucideIconName;          // Optional icon for the stat
}
```

### PartnerLogo

```typescript
interface PartnerLogo {
  id: string;                    // kebab-case, e.g., "university-of-melbourne"
  name: string;                  // Full institution name
  logoSrc: string;               // Path to SVG in /public/logos/
  altText: string;               // Descriptive alt text
  type: 'university' | 'employer'; // Partner category
  country: string;               // Country of origin
  websiteUrl: string;            // External link (not used on landing, for data completeness)
}
```

### ScoreDimension

```typescript
interface ScoreDimension {
  id: string;                    // e.g., "language-proficiency"
  name: string;                  // Display name
  score: number;                 // 0-100 sample score
  color: string;                 // Hex color for the progress bar
  icon: LucideIconName;          // Lucide icon name
  description: string;           // Brief explanation of what this measures
}
```

### HeroContent

```typescript
interface HeroContent {
  headline: string;              // "Launch Your Global Career"
  subheadline: string;           // Supporting paragraph
  primaryCTA: {
    text: string;                // "Get Started Free"
    href: string;                // "/signup"
    authenticatedText: string;   // "Go to Dashboard"
    authenticatedHref: string;   // "/dashboard"
  };
  secondaryCTA: {
    text: string;                // "Watch Demo"
    href: string;                // "#ai-matching" (scroll anchor)
  };
}
```

### LandingPageContent (aggregate)

```typescript
interface LandingPageContent {
  hero: HeroContent;
  categories: OpportunityCategory[];        // 7 items
  testimonials: Testimonial[];              // 6 items
  statistics: StatisticItem[];              // 4 items
  universityPartners: PartnerLogo[];        // 12 items
  employerPartners: PartnerLogo[];          // 12 items
  scoreDimensions: ScoreDimension[];        // 6 items
  overallScore: number;                     // 78
  finalCTA: {
    headline: string;
    subheadline: string;
    primaryCTA: { text: string; href: string };
    signInLink: { text: string; href: string };
  };
}
```

### Enums

```typescript
type UserRole = 'student' | 'employer' | 'university_admin' | 'program_provider' | 'platform_admin';

type PartnerType = 'university' | 'employer';

type CarouselDirection = 'normal' | 'reverse';

type AnimationState = 'idle' | 'playing' | 'paused' | 'complete' | 'static';
```

## 5. API Contracts

This module is entirely statically generated (SSG) and makes **zero API calls at runtime**. All content is defined in static data files imported at build time.

### Build-Time Data Source

**File:** `src/app/(public)/_data/landing-content.ts`

Exports a `LandingPageContent` object consumed by the page component during static generation.

### No Runtime Endpoints

This module does not own or consume any API endpoints. The page is generated at build time via Next.js `generateStaticParams` / static rendering.

### Navigation Targets (outbound links)

| CTA | Target URL | Condition |
|-----|-----------|-----------|
| Hero Primary CTA | `/signup` | Anonymous visitor |
| Hero Primary CTA | `/dashboard` | Authenticated user |
| Category Card | `/signup?interest={slug}` | Always |
| AI Matching CTA | `/signup` | Always |
| GES Preview CTA | `/signup` | Always |
| Final CTA Primary | `/signup` | Anonymous |
| Final CTA Primary | `/dashboard` | Authenticated |
| Final CTA Secondary | `/login` | Always |

### Authenticated User Detection

The page detects auth status via server-side cookie inspection in the RSC (no API call):

```typescript
// In page.tsx (Server Component)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export default async function LandingPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(/* config */, { cookies: { get: (name) => cookieStore.get(name)?.value } });
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  const userRole = user?.user_metadata?.role;
  // Pass auth state to CTAs
}
```

**Note:** This makes the page dynamically rendered for authenticated users. For pure SSG, implement conditional CTA rendering via a small client component that checks auth state client-side after hydration, with the anonymous version as the default SSR output.

### Alternative Pure SSG Strategy

To maintain SSG, CTAs render as anonymous by default. A lightweight client component `<AuthAwareCTA>` hydrates and checks session client-side:

```typescript
// Request: Client-side session check (no API, uses existing cookie)
// Uses createBrowserClient().auth.getSession()
// Response: Updates CTA text/href if user is authenticated
// Fallback: Anonymous CTA remains visible during check (no flash)
```

## 6. Module Dependencies

| Dependency | What's Needed | How It's Used | Failure Handling |
|-----------|---------------|---------------|------------------|
| App Shell (`app_shell`) | Shared header/footer layout, navigation component, theme provider | Landing page renders inside `(public)` layout group which includes AppShell's PublicHeader and Footer components | If AppShell unavailable, page renders without header/footer; core content still displays |
| Next.js Image (`next/image`) | Image optimization for partner logos | All logo images use Next.js Image with WebP format, lazy loading, and responsive sizes | If image fails to load, `onError` handler shows text-based fallback with partner name |
| Lucide React (`lucide-react`) | Icon components for category cards, dimensions | Tree-shaken imports of specific icons (Globe, Briefcase, etc.) | If icon fails, hidden gracefully with `aria-hidden`; text labels remain |
| Tailwind CSS | Utility classes for all styling | All component styles via Tailwind utility classes | Build-time dependency; if missing, build fails (caught in CI) |
| @supabase/ssr | Auth state detection for conditional CTAs | `createServerClient` or `createBrowserClient` checks session | If Supabase unreachable, default to anonymous CTA (graceful degradation) |
| shadcn/ui Button | Consistent button component for CTAs | Import Button component with variant props | If unavailable, fallback to styled `<a>` tags with same Tailwind classes |
| IntersectionObserver API | Scroll-triggered animations | Used in client components for animation triggers | Polyfill not needed (96%+ support); fallback: show final animated state immediately |

## 7. Non-Functional Requirements

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Largest Contentful Paint (LCP) | < 2.0s (target 1.5s) | Lighthouse, Web Vitals |
| First Input Delay (FID) | < 100ms | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.05 | Lighthouse |
| Time to First Byte (TTFB) | < 200ms | Vercel Edge CDN |
| Total Page Weight (HTML) | < 150KB gzip | Build analysis |
| Total Client JS | < 25KB gzip (all client components combined) | Bundle analyzer |
| Total Images | < 200KB (all logos combined, WebP) | Build analysis |
| First Contentful Paint (FCP) | < 1.0s | Lighthouse |

### Caching Strategy

| Resource | Cache Policy | TTL |
|----------|-------------|-----|
| HTML page | SSG + ISR (optional) | Indefinite (rebuild to update) |
| Static assets (logos, SVGs) | Immutable + CDN | 1 year (`max-age=31536000, immutable`) |
| Fonts (Satoshi, Inter) | Preload + CDN cache | 1 year |
| CSS (Tailwind) | Immutable hash | 1 year |
| Client JS bundles | Immutable hash | 1 year |

### SEO Requirements

| Element | Value |
|---------|-------|
| Title | "GlobalXcelerate - Launch Your Global Career | International Internships & Programs" |
| Meta Description | "Connect with 8,000+ global opportunities across 80+ countries. AI-powered matching for international internships, exchanges, and graduate programs." |
| Canonical URL | `https://globalxcelerate.com` |
| Open Graph Image | `/og/landing.png` (1200x630) |
| Twitter Card | `summary_large_image` |
| Structured Data | Organization + WebSite JSON-LD |
| Sitemap | Included in `/sitemap.xml` |
| Robots | `index, follow` |

### Accessibility (WCAG 2.1 AA)

- All interactive elements keyboard accessible with visible focus indicators.
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
- All images have descriptive alt text.
- Heading hierarchy: single H1, logical H2/H3 structure.
- Carousel has pause control, accessible navigation, and live region announcements.
- `prefers-reduced-motion` respected for all animations.
- Skip-to-content link available.
- Language attribute set (`lang="en"`).
- No autoplay audio/video.

### Rate Limiting

- Not applicable (static page served from CDN).
- Auth state check (client-side) uses existing session cookie — no additional API calls.

### Data Retention

- No user data collected on this page.
- No cookies set by this page (auth cookies managed by Auth module).
- No analytics tracking implemented in this module (handled by separate analytics module if needed).

### Concurrency

- Static page handles unlimited concurrent reads via CDN.
- No server-side computation per request (pure static).

## 8. Key Implementation Notes

1. **Static Generation Strategy:** The page MUST be statically generated at build time. Use Next.js App Router's default static rendering. The `page.tsx` should NOT use `export const dynamic = 'force-dynamic'`. For auth-aware CTAs, use a client component that renders the anonymous version during SSR and conditionally updates after hydration — this preserves SSG for the page shell while personalizing CTAs.

2. **Globe SVG Implementation:** The animated globe must be implemented as an inline SVG with CSS animations — NOT using Three.js, Globe.gl, react-globe, or any WebGL library. Use 15-20 `<circle>` elements for nodes positioned on an SVG world map outline, with `<path>` elements for connection arcs. Animate using `@keyframes` for pulsing opacity on nodes and dashed stroke animation on arcs. Total SVG markup should be < 15KB.

3. **Client Component Boundaries:** Minimize client components. Only these sections need `"use client"`: `AnimatedGlobe` (animation class toggle), `MatchingAnimation` (flowing dots), `RadialScoreChart` (fill animation trigger), `StatCounter` (count-up), `TestimonialsCarousel` (interaction handling), `LogoCarousel` (pause on hover). All other components remain Server Components. Each client component should be code-split via dynamic import with `{ ssr: true }` to ensure server rendering of initial state.

4. **Font Loading Strategy:** Use `next/font` to load Satoshi (display headings) and Inter (body text) with `display: 'swap'` and `preload: true`. Define font variables in the root layout (`--font-satoshi`, `--font-inter`) and reference via Tailwind's font-family configuration. This eliminates FOUT and avoids external font requests blocking render.

5. **Image Optimization for Logos:** All partner logos must be SVG format for crisp rendering at any size. Store in `/public/logos/partners/` directory. Use Next.js `<Image>` component with `width` and `height` explicitly set to prevent CLS. For the logo carousel, preload the first visible set of logos and lazy-load the duplicated set.

6. **Intersection Observer Pattern:** Create a shared custom hook `useInViewAnimation` that wraps IntersectionObserver with `{ threshold, triggerOnce: true }` options. This hook is used by StatCounter, RadialScoreChart, and MatchingAnimation. The hook returns a ref and a boolean `isInView`. When `prefers-reduced-motion` is active, `isInView` returns `true` immediately to skip animation.

7. **CSS-Only Carousel for Logos:** The partner logo carousels (university and employer) should use pure CSS animation with `@keyframes translateX` rather than JavaScript-based scrolling. The DOM structure duplicates the logo array to create seamless looping. Pause on hover uses `:hover` targeting the container with `animation-play-state: paused`. This results in zero JS for these carousels.

8. **Metadata and JSON-LD:** Implement `generateMetadata()` in the page file to set all SEO metadata. Include a JSON-LD script for Organization schema and WebSite schema with SearchAction. Open Graph image should be generated using Next.js OG image generation (`/app/api/og/landing/route.tsx`) or provided as a pre-built static image.

## 9. File Map

```
src/app/(public)/
├── page.tsx                                    # Main landing page (Server Component, SSG entry)
├── _data/
│   └── landing-content.ts                     # All static content data (categories, testimonials, stats, partners)
├── _components/
│   ├── hero/
│   │   ├── HeroSection.tsx                    # Hero section layout (Server Component)
│   │   ├── AnimatedGlobe.tsx                  # SVG globe with CSS animations (Client Component)
│   │   ├── HeroCTA.tsx                        # Primary/secondary CTA buttons (Server Component)
│   │   └── AuthAwareCTA.tsx                   # Client wrapper for auth-conditional CTA text
│   ├── opportunities/
│   │   ├── OpportunityDiscoverySection.tsx    # Section wrapper with heading (Server Component)
│   │   └── OpportunityCategoryCard.tsx        # Individual category card (Server Component)
│   ├── ai-matching/
│   │   ├── AIMatchingSection.tsx              # Section wrapper (Server Component)
│   │   ├── MockStudentProfile.tsx             # Static student profile card (Server Component)
│   │   ├── MatchingAnimation.tsx             # Flowing dots animation (Client Component)
│   │   ├── MatchedOpportunityCard.tsx        # Matched opportunity card (Server Component)
│   │   └── MatchPercentageBadge.tsx          # Percentage badge component (Server Component)
│   ├── ges-preview/
│   │   ├── GESPreviewSection.tsx             # Section wrapper (Server Component)
│   │   ├── RadialScoreChart.tsx              # Animated radial/donut chart (Client Component)
│   │   ├── ScoreDimensionList.tsx            # List of score dimensions (Server Component)
│   │   └── ScoreDimensionItem.tsx            # Individual dimension with progress bar (Server Component)
│   ├── partners/
│   │   ├── UniversityPartnersSection.tsx     # University partners wrapper (Server Component)
│   │   ├── EmployerPartnersSection.tsx       # Employer partners wrapper (Server Component)
│   │   ├── LogoCarousel.tsx                  # CSS-animated logo marquee (Client Component)
│   │   └── PartnerLogo.tsx                   # Individual logo with Image optimization (Server Component)
│   ├── statistics/
│   │   ├── StatisticsSection.tsx             # Dark background stats section (Server Component)
│   │   └── StatCounter.tsx                   # Count-up animation component (Client Component)
│   ├── testimonials/
│   │   ├── TestimonialsSection.tsx           # Section wrapper (Server Component)
│   │   ├── TestimonialsCarousel.tsx          # Carousel with auto-advance (Client Component)
│   │   ├── TestimonialCard.tsx               # Individual testimonial card (Server Component)
│   │   └── CarouselControls.tsx              # Dots and arrows (Client Component)
│   └── final-cta/
│       └── FinalCTASection.tsx               # Final CTA block (Server Component)
├── _hooks/
│   ├── useInViewAnimation.ts                 # Shared IntersectionObserver hook
│   ├── useCountUp.ts                         # Count-up animation logic hook
│   └── useReducedMotion.ts                   # prefers-reduced-motion detection hook
├── _styles/
│   └── globe-animations.css                  # CSS keyframes for globe SVG animations
└── _assets/
    └── globe.svg                             # SVG world map outline (static, imported inline)

public/
├── logos/
│   ├── partners/
│   │   ├── universities/
│   │   │   ├── unimelb.svg
│   │   │   ├── nus.svg
│   │   │   ├── utoronto.svg
│   │   │   ├── ethz.svg
│   │   │   ├── uct.svg
│   │   │   ├── pku.svg
│   │   │   ├── ucl.svg
│   │   │   ├── utokyo.svg
│   │   │   ├── tum.svg
│   │   │   ├── usp.svg
│   │   │   ├── kaist.svg
│   │   │   └── usyd.svg
│   │   └── employers/
│   │       ├── google.svg
│   │       ├── mckinsey.svg
│   │       ├── unilever.svg
│   │       ├── siemens.svg
│   │       ├── deloitte.svg
│   │       ├── samsung.svg
│   │       ├── jpmorgan.svg
│   │       ├── spotify.svg
│   │       ├── accenture.svg
│   │       ├── bmw.svg
│   │       ├── shopify.svg
│   │       └── nestle.svg
├── og/
│   └── landing.png                           # Open Graph image (1200x630)
└── images/
    └── landing/
        └── dot-pattern.svg                   # Background pattern for CTA sections

src/app/api/og/
└── landing/
    └── route.tsx                              # OG image generation endpoint (optional)
```