# Design & Brand Guidelines — GlobalXcelerate

---

## 1. Design Direction

- **App Domain**: B2B2C Global Talent Mobility & Experiential Learning Platform
- **Target Audience**: University students (18-28), university administrators, corporate employers, program providers — primarily in Middle East, South Asia, and international markets
- **Visual Tone**: Premium, professional, globally-minded, aspirational yet approachable — modern tech-forward design conveying trust and opportunity
- **Reference Products**: Clean and focused like Linear; aspirational data visualization like Notion; premium education feel like Coursera; global connectivity feel like Stripe's brand
- **Mood**: Professional sophistication with dynamic energy — the intersection of education, technology, and global opportunity

---

## 2. Color Palette

### Light Mode (Default)

| Token | Value (HSL) | Hex | Usage |
|-------|-------------|-----|-------|
| Primary | hsl(222, 74%, 11%) | #0F172A | Deep navy — headings, primary text, sidebar background |
| Primary Light | hsl(217, 33%, 17%) | #1E293B | Navy lighter — hover states, secondary surfaces |
| Accent | hsl(187, 96%, 42%) | #06B6D4 | Electric cyan — CTAs, links, active states, highlights |
| Accent Light | hsl(187, 80%, 48%) | #22D3EE | Cyan lighter — hover on accent, badges |
| Background | hsl(0, 0%, 100%) | #FFFFFF | Page background, card surfaces |
| Background Alt | hsl(210, 40%, 98%) | #F8FAFC | Subtle gray — section alternates, sidebar items hover |
| Foreground | hsl(222, 74%, 11%) | #0F172A | Primary text |
| Muted | hsl(215, 16%, 47%) | #64748B | Secondary text, placeholders, captions |
| Border | hsl(214, 32%, 91%) | #E2E8F0 | Card borders, dividers, input borders |
| Success | hsl(160, 84%, 39%) | #10B981 | Success states, positive indicators |
| Warning | hsl(38, 92%, 50%) | #F59E0B | Warnings, deadlines approaching |
| Error | hsl(0, 84%, 60%) | #EF4444 | Errors, destructive actions, rejected status |
| Info | hsl(217, 91%, 60%) | #3B82F6 | Informational badges, developing grade |

### Dark Mode (Support Required)

| Token | Value (HSL) | Hex | Usage |
|-------|-------------|-----|-------|
| Primary | hsl(210, 40%, 98%) | #F8FAFC | Text on dark surfaces |
| Background | hsl(222, 47%, 11%) | #0F172A | Dark page background |
| Background Alt | hsl(217, 33%, 17%) | #1E293B | Elevated surfaces |
| Border | hsl(217, 19%, 27%) | #334155 | Borders on dark |
| Muted | hsl(215, 20%, 65%) | #94A3B8 | Secondary text on dark |

### GX Score Grade Colors

| Grade | Color | Hex | Badge Background |
|-------|-------|-----|-----------------|
| Exceptional (90-100) | Gold | #F59E0B | hsl(38, 92%, 50%) |
| Strong (75-89) | Cyan | #06B6D4 | hsl(187, 96%, 42%) |
| Developing (50-74) | Blue | #3B82F6 | hsl(217, 91%, 60%) |
| Emerging (25-49) | Slate | #64748B | hsl(215, 16%, 47%) |
| Beginner (0-24) | Gray | #9CA3AF | hsl(220, 9%, 64%) |

---

## 3. Typography

### Font Families
- **Display / Headings**: `'Satoshi', sans-serif` — geometric, modern, premium feel
- **Body / UI Text**: `'Inter', sans-serif` — highly legible, optimized for screens
- **Monospace / Code**: `'JetBrains Mono', monospace` — for technical content, scores

### Font Scale (using clamp for responsive)

| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height | Letter Spacing |
|-------|---------------|---------------|--------|-------------|----------------|
| H1 (Hero) | 56px / 3.5rem | 36px / 2.25rem | 700 (Bold) | 1.1 | -0.02em |
| H2 (Section) | 40px / 2.5rem | 28px / 1.75rem | 700 (Bold) | 1.2 | -0.01em |
| H3 (Card Title) | 24px / 1.5rem | 20px / 1.25rem | 600 (SemiBold) | 1.3 | -0.005em |
| H4 (Widget Title) | 18px / 1.125rem | 16px / 1rem | 600 (SemiBold) | 1.4 | 0 |
| Body Large | 18px / 1.125rem | 16px / 1rem | 400 (Regular) | 1.6 | 0 |
| Body | 16px / 1rem | 14px / 0.875rem | 400 (Regular) | 1.5 | 0 |
| Body Small | 14px / 0.875rem | 13px / 0.8125rem | 400 (Regular) | 1.5 | 0 |
| Caption | 12px / 0.75rem | 11px / 0.6875rem | 500 (Medium) | 1.4 | 0.02em |
| Overline | 11px / 0.6875rem | 10px / 0.625rem | 600 (SemiBold) | 1.4 | 0.08em |

### Font Loading
- Use `next/font` with `subsets: ['latin']` for optimal loading
- Display: swap (prevent FOIT)
- Preload critical weights: Inter 400, 500, 600; Satoshi 600, 700

---

## 4. Style Direction

### Cards
- **Style**: Elevated with subtle shadow
- **Background**: white (#FFFFFF)
- **Border**: 1px solid var(--border) (#E2E8F0)
- **Border Radius**: 12px (--radius-md)
- **Shadow**: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)
- **Hover Shadow**: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)
- **Padding**: 24px (desktop), 16px (mobile)
- **Transition**: shadow 200ms ease, transform 200ms ease
- **Hover Transform**: translateY(-2px) for clickable cards

### Buttons
- **Primary**: Solid fill with accent color (#06B6D4), white text, rounded-lg (8px), hover darkens 10%
- **Secondary**: Outline with border color, primary text, transparent background, hover fills with background-alt
- **Ghost**: No border, transparent, muted text, hover shows background-alt
- **Destructive**: Solid fill with error color (#EF4444), white text
- **Sizes**: sm (32px height, 12px padding), md (40px height, 16px padding), lg (48px height, 24px padding)
- **Disabled**: opacity 0.5, cursor not-allowed
- **Loading**: spinner icon replaces text, maintains button width
- **Focus Ring**: 2px solid accent, 2px offset

### Inputs
- **Style**: Bordered with subtle background on focus
- **Border**: 1px solid var(--border) (#E2E8F0)
- **Border Radius**: 8px
- **Focus**: border-color: accent (#06B6D4), ring: 0 0 0 3px rgba(6, 182, 212, 0.1)
- **Error**: border-color: error (#EF4444), ring: 0 0 0 3px rgba(239, 68, 68, 0.1)
- **Height**: 40px (sm), 44px (md), 48px (lg)
- **Placeholder**: muted color (#64748B), font-style normal
- **Disabled**: background #F8FAFC, opacity 0.7

### Spacing Density
- **System**: Comfortable (8px base unit grid)
- **Section spacing**: 64px (desktop), 48px (mobile)
- **Card gap**: 24px (desktop), 16px (mobile)
- **Form field spacing**: 20px between fields
- **Inline element gap**: 8px (sm), 12px (md), 16px (lg)

### Icons
- **Library**: Lucide React (consistent, MIT licensed, tree-shakeable)
- **Default Size**: 20px (in buttons), 24px (standalone), 16px (inline with text)
- **Stroke Width**: 1.5px (default), 2px (for emphasis/navigation)
- **Color**: inherit from parent text color

### Animations
- **Page Transitions**: Fade in 200ms ease-out
- **Card Hover**: Scale(1.01) + shadow elevation, 200ms ease
- **Modal/Drawer**: Slide + fade from bottom/right, 300ms cubic-bezier(0.16, 1, 0.3, 1)
- **Skeleton Loading**: Shimmer animation (background gradient sweep, 1.5s infinite)
- **Counter/Score**: Count-up animation 1000ms ease-out
- **Globe (Landing)**: Continuous slow rotation, 60s linear infinite
- **Stagger Children**: 50ms delay between items in lists

---

## 5. Global UI States

### Loading States
- **Page-level**: Full skeleton layout matching the page structure (not spinner)
- **Widget-level**: Skeleton placeholder matching widget dimensions
- **Button action**: Inline spinner (16px) replacing button icon, text remains
- **Form submission**: Button disabled + spinner, fields disabled
- **Table/List**: 5 skeleton rows with animated shimmer
- **Infinite scroll**: 3 skeleton cards at bottom of list
- **AI operations**: Pulsing brain/sparkle icon + "Analyzing..." text

### Empty States
- **Structure**: Centered illustration (64-96px) + heading + description + CTA button
- **Illustration Style**: Simple line art in muted color with accent highlights
- **Heading**: Short, encouraging (e.g., "No applications yet")
- **Description**: 1-2 sentences explaining what to do (e.g., "Browse the marketplace and apply to opportunities that match your profile")
- **CTA**: Primary button leading to the relevant action page
- **Examples**:
  - Applications empty: "No applications yet" / "Start exploring opportunities" / [Browse Marketplace] button
  - Notifications empty: "All caught up!" / "We'll notify you when something important happens"
  - Search no results: "No opportunities match your search" / "Try adjusting your filters or search terms" / [Clear Filters] button

### Error States
- **Field-level**: Red border + error message below field (14px, error color)
- **Form-level**: Error alert banner at top of form (icon + message + dismiss)
- **Widget-level**: Replace content with error card (retry button)
- **Page-level**: Full-page error with illustration, message, retry + home buttons
- **API-level**: Toast notification (bottom-right, 5s auto-dismiss)
- **Network offline**: Top banner "You're offline. Changes will sync when reconnected."

### Success / Confirmation
- **Form submission**: Success toast (bottom-right, green accent, 4s auto-dismiss) + redirect
- **Destructive action**: Confirmation modal with warning icon, description of consequences, cancel + confirm buttons
- **Application submitted**: Success page with confetti animation + next steps
- **Profile saved**: Inline success indicator (checkmark) next to save button, fades after 2s

### Toast Notifications
- **Position**: Bottom-right (desktop), bottom-center (mobile)
- **Types**: success (green), error (red), warning (amber), info (blue)
- **Duration**: 4s (success/info), 6s (warning), persistent until dismissed (error)
- **Structure**: icon + title + optional description + dismiss X
- **Stacking**: Maximum 3 visible, newest on top

---

## 6. Accessibility & Responsive Guidelines

### Breakpoints
| Name | Min Width | Layout Changes |
|------|-----------|---------------|
| Mobile | 0px (default) | Single column, bottom nav, full-width cards, stacked sections |
| Tablet | 768px | 2-column grid, collapsed sidebar (64px icons), medium cards |
| Desktop | 1024px | Multi-column, expanded sidebar (280px), full cards, side panels |
| Wide | 1440px | Max-width container (1280px), comfortable spacing |

### Responsive Patterns
- **Sidebar**: Expanded (desktop) → Collapsed icons (tablet) → Hamburger overlay (mobile)
- **Navigation**: Sidebar (desktop/tablet) → Bottom tab bar with 5 items (mobile)
- **Cards**: Grid 3-col (desktop) → 2-col (tablet) → 1-col stack (mobile)
- **Filters**: Side panel (desktop) → Collapsible (tablet) → Bottom sheet modal (mobile)
- **Tables**: Full table (desktop) → Horizontal scroll (tablet) → Card list view (mobile)
- **Modals**: Center modal (desktop) → Bottom sheet full-width (mobile)

### Accessibility Requirements
- **WCAG Level**: 2.1 AA compliance mandatory
- **Color Contrast**: 4.5:1 minimum for normal text, 3:1 for large text and UI components
- **Focus Indicators**: 2px solid ring visible on all interactive elements (accent color)
- **Keyboard Navigation**: All interactive elements reachable via Tab; Enter/Space to activate; Escape to close overlays
- **Screen Reader**: All images have alt text; icons-only buttons have aria-label; dynamic content uses aria-live regions
- **ARIA Landmarks**: header (banner), nav (navigation), main (main), aside (complementary), footer (contentinfo)
- **Skip Links**: "Skip to main content" link visible on focus
- **Form Labels**: All inputs have visible associated labels; required fields marked with * and aria-required="true"
- **Error Announcement**: Form errors announced via aria-describedby linking to error message elements
- **Touch Targets**: Minimum 44x44px for all interactive elements on mobile
- **Reduced Motion**: Respect `prefers-reduced-motion` media query; disable animations, use opacity-only transitions
- **Font Scaling**: UI must remain functional at 200% text zoom
- **RTL Support**: Logical properties (margin-inline, padding-block) for future Arabic locale support