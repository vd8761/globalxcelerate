{
  "generated_at": "2026-08-17T02:07:39Z",
  "modules": [
    {
      "category": "frontend",
      "depends_on": [],
      "description": "Main application layout skeleton with role-based sidebar navigation, header chrome, routing structure, theme provider, and global CSS setup for all route groups",
      "files": [
        "src/app/layout.tsx",
        "src/app/(student)/layout.tsx",
        "src/app/(employer)/layout.tsx",
        "src/app/(university)/layout.tsx",
        "src/app/(provider)/layout.tsx",
        "src/app/(admin)/layout.tsx",
        "src/app/(auth)/layout.tsx",
        "src/app/(public)/layout.tsx",
        "src/components/layout/sidebar.tsx",
        "src/components/layout/header.tsx",
        "src/components/layout/mobile-nav.tsx",
        "src/components/layout/breadcrumbs.tsx",
        "src/lib/config/navigation.ts",
        "src/lib/config/site.ts",
        "src/styles/globals.css",
        "src/components/ui/theme-provider.tsx"
      ],
      "name": "app_shell",
      "priority": 1,
      "spec_file": "app_shell_spec.md"
    },
    {
      "category": "auth",
      "depends_on": [
        "app_shell"
      ],
      "description": "Multi-provider authentication system with email, mobile OTP, Google, Microsoft, Apple, LinkedIn OAuth, role selection flow, Supabase Auth integration, session management, and middleware route protection",
      "files": [
        "src/app/(auth)/login/page.tsx",
        "src/app/(auth)/register/page.tsx",
        "src/app/(auth)/role-select/page.tsx",
        "src/app/(auth)/forgot-password/page.tsx",
        "src/app/(auth)/verify-email/page.tsx",
        "src/app/api/v1/auth/callback/route.ts",
        "src/app/api/v1/auth/role/route.ts",
        "src/lib/supabase/client.ts",
        "src/lib/supabase/server.ts",
        "src/lib/supabase/middleware.ts",
        "src/middleware.ts",
        "src/hooks/use-auth.ts",
        "src/lib/auth/providers.ts",
        "src/lib/auth/guards.ts"
      ],
      "name": "authentication",
      "priority": 2,
      "spec_file": "authentication_spec.md"
    },
    {
      "category": "frontend",
      "depends_on": [
        "app_shell"
      ],
      "description": "Public marketing landing page with hero section, opportunity discovery cards, AI matching preview, global employability score visualization, university/employer partner sections, CTA blocks, and animated global network world map",
      "files": [
        "src/app/(public)/page.tsx",
        "src/components/landing/hero-section.tsx",
        "src/components/landing/opportunity-discovery.tsx",
        "src/components/landing/ai-matching-preview.tsx",
        "src/components/landing/gx-score-preview.tsx",
        "src/components/landing/partners-section.tsx",
        "src/components/landing/cta-section.tsx",
        "src/components/landing/animated-globe.tsx",
        "src/components/landing/stats-counter.tsx",
        "src/components/landing/testimonials.tsx",
        "src/components/landing/footer.tsx"
      ],
      "name": "landing_page",
      "priority": 3,
      "spec_file": "landing_page_spec.md"
    },
    {
      "category": "frontend",
      "depends_on": [
        "app_shell",
        "authentication"
      ],
      "description": "Opportunity discovery marketplace with card-based browsing, full-text search, advanced filters (country, city, industry, skill, duration, work mode, compensation), category navigation across 7 types, sorting, pagination, save functionality, and opportunity detail page with AI match score, apply flow, eligibility check, and share features",
      "files": [
        "src/app/(student)/marketplace/page.tsx",
        "src/app/(student)/marketplace/[id]/page.tsx",
        "src/components/marketplace/search-bar.tsx",
        "src/components/marketplace/filter-panel.tsx",
        "src/components/marketplace/category-tabs.tsx",
        "src/components/marketplace/opportunity-card.tsx",
        "src/components/marketplace/opportunity-grid.tsx",
        "src/components/marketplace/sort-dropdown.tsx",
        "src/components/marketplace/detail/opportunity-header.tsx",
        "src/components/marketplace/detail/match-score-card.tsx",
        "src/components/marketplace/detail/apply-drawer.tsx",
        "src/components/marketplace/detail/eligibility-check.tsx",
        "src/components/marketplace/detail/share-modal.tsx",
        "src/app/api/v1/opportunities/route.ts",
        "src/app/api/v1/opportunities/[id]/route.ts",
        "src/app/api/v1/opportunities/search/route.ts",
        "src/app/api/v1/students/saved-opportunities/route.ts",
        "src/lib/hooks/use-marketplace-filters.ts"
      ],
      "name": "opportunity_marketplace",
      "priority": 4,
      "spec_file": "opportunity_marketplace_spec.md"
    },
    {
      "category": "frontend",
      "depends_on": [
        "app_shell",
        "authentication"
      ],
      "description": "Personalized student command center with greeting, profile completion widget, GX Score gauge, recommended opportunities, application status tracking, upcoming deadlines, notifications feed, quick actions, and saved opportunities",
      "files": [
        "src/app/(student)/dashboard/page.tsx",
        "src/components/dashboard/greeting-header.tsx",
        "src/components/dashboard/profile-completion-widget.tsx",
        "src/components/dashboard/gx-score-widget.tsx",
        "src/components/dashboard/recommended-opportunities.tsx",
        "src/components/dashboard/applications-summary.tsx",
        "src/components/dashboard/deadlines-widget.tsx",
        "src/components/dashboard/notifications-feed.tsx",
        "src/components/dashboard/quick-actions.tsx",
        "src/components/dashboard/saved-opportunities.tsx",
        "src/app/api/v1/students/dashboard/route.ts"
      ],
      "name": "student_dashboard",
      "priority": 5,
      "spec_file": "student_dashboard_spec.md"
    },
    {
      "category": "frontend",
      "depends_on": [
        "app_shell",
        "authentication"
      ],
      "description": "Multi-step onboarding wizard with 8 steps (Identity, Education, Skills, Experience, Career Goals, Global Preferences, Portfolio, Profile Complete), progress indicator, auto-save, profile completion percentage calculation, and step validation",
      "files": [
        "src/app/(student)/onboarding/page.tsx",
        "src/components/onboarding/wizard-container.tsx",
        "src/components/onboarding/progress-indicator.tsx",
        "src/components/onboarding/steps/identity-step.tsx",
        "src/components/onboarding/steps/education-step.tsx",
        "src/components/onboarding/steps/skills-step.tsx",
        "src/components/onboarding/steps/experience-step.tsx",
        "src/components/onboarding/steps/career-goals-step.tsx",
        "src/components/onboarding/steps/global-preferences-step.tsx",
        "src/components/onboarding/steps/portfolio-step.tsx",
        "src/components/onboarding/steps/profile-complete-step.tsx",
        "src/app/api/v1/students/onboarding/route.ts",
        "src/lib/validation/onboarding-schemas.ts",
        "src/stores/onboarding-store.ts"
      ],
      "name": "student_onboarding",
      "priority": 6,
      "spec_file": "student_onboarding_spec.md"
    },
    {
      "category": "core",
      "depends_on": [
        "app_shell",
        "authentication",
        "student_onboarding"
      ],
      "description": "AI-powered matching system with 12-dimension scoring algorithm, skill matching with proficiency comparison, eligibility verification, explainable AI match results with natural language explanations, skill gap analysis, recommended improvement actions, GX Career Copilot floating assistant with contextual Q\u0026A and SSE streaming, and Global Employability Score with multi-dimensional radial visualization",
      "files": [
        "src/lib/ai/matching.ts",
        "src/lib/ai/scoring.ts",
        "src/lib/ai/copilot.ts",
        "src/lib/ai/provider.ts",
        "src/lib/ai/prompts/matching.ts",
        "src/lib/ai/prompts/copilot.ts",
        "src/lib/ai/prompts/scoring.ts",
        "src/lib/ai/prompts/skill-gap.ts",
        "src/lib/ai/types.ts",
        "src/app/api/v1/matching/score/route.ts",
        "src/app/api/v1/matching/explain/route.ts",
        "src/app/api/v1/matching/batch/route.ts",
        "src/app/api/v1/copilot/chat/route.ts",
        "src/app/api/v1/copilot/sessions/route.ts",
        "src/app/api/v1/gx-score/route.ts",
        "src/app/api/v1/gx-score/history/route.ts",
        "src/app/api/v1/gx-score/recommendations/route.ts",
        "src/components/copilot/copilot-widget.tsx",
        "src/components/copilot/chat-panel.tsx",
        "src/components/copilot/message-bubble.tsx",
        "src/components/gx-score/radar-chart.tsx",
        "src/components/gx-score/dimension-card.tsx",
        "src/components/gx-score/score-badge.tsx",
        "src/app/(student)/gx-score/page.tsx",
        "src/stores/copilot-store.ts",
        "src/lib/config/scoring.ts"
      ],
      "name": "ai_matching_engine",
      "priority": 7,
      "spec_file": "ai_matching_engine_spec.md"
    },
    {
      "category": "frontend",
      "depends_on": [
        "app_shell",
        "authentication",
        "opportunity_marketplace"
      ],
      "description": "Full application lifecycle management with 7-stage pipeline (Draft, Submitted, Under Review, Shortlisted, Assessment, Interview, Selected/Rejected), status tracking with history, document upload/management, cover letter, application withdrawal, employer review interface, and real-time status notifications",
      "files": [
        "src/app/(student)/applications/page.tsx",
        "src/app/(student)/applications/[id]/page.tsx",
        "src/components/applications/application-list.tsx",
        "src/components/applications/application-card.tsx",
        "src/components/applications/status-timeline.tsx",
        "src/components/applications/document-upload.tsx",
        "src/components/applications/cover-letter-editor.tsx",
        "src/components/applications/withdraw-dialog.tsx",
        "src/app/api/v1/applications/route.ts",
        "src/app/api/v1/applications/[id]/route.ts",
        "src/app/api/v1/applications/[id]/status/route.ts",
        "src/app/api/v1/applications/[id]/documents/route.ts",
        "src/lib/validation/application-schemas.ts"
      ],
      "name": "application_management",
      "priority": 8,
      "spec_file": "application_management_spec.md"
    }
  ],
  "project_name": "globalxcelerate",
  "version": 1
}