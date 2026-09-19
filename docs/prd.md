# Product Requirements Document (PRD)
---

## Executive Summary

**Purpose**: Define the complete product requirements for GlobalXcelerate — a premium B2B2C SaaS platform that enables students to create a single global profile powering internships, global immersion programs, exchange programs, industry projects, scholarships, jobs, employer matching, and global career opportunities.

### Project Overview
- **Project Name**: GlobalXcelerate — Global Talent & Mobility Platform
- **Project Type**: B2B2C SaaS Web Application
- **Brief Description**: A unified platform where ONE STUDENT creates ONE GLOBAL PROFILE that powers access to internships, global immersion programs, exchange programs, industry projects, scholarships, jobs, employer matching, and global career opportunities — connecting students, universities, employers, and program providers worldwide.
- **Owner**: Rajesh globalxcelerate.ae
- **Date**: 2026-08-16

### Problem Statement
**Business Problem**: The global talent mobility and experiential learning ecosystem is fragmented — students must maintain multiple profiles across dozens of platforms, universities lack centralized tools to track student placements abroad, employers cannot efficiently discover globally-ready talent, and program providers struggle to reach qualified candidates.
- **Current Pain Point**: Students aged 18-28 waste hundreds of hours duplicating profiles, applications, and documents across separate internship portals, exchange program websites, scholarship databases, and job boards — each with different requirements, formats, and systems.
- **Impact**: Over 250 million higher education students globally face reduced access to international opportunities, lower employability scores, and missed career development pathways due to fragmented infrastructure. Universities lose visibility into alumni outcomes, and employers miss top global talent.
- **Root Cause**: No single platform exists that unifies the global talent mobility ecosystem — connecting the student's academic profile, skills, experiences, and career preferences with opportunities from universities, employers, and global program providers through intelligent AI matching.

### Proposed Solution
**Solution Overview**: GlobalXcelerate delivers a premium digital platform where students create a comprehensive global profile once, receive AI-powered opportunity matching across 7 categories (internships, global immersion, student exchange, industry projects, research, scholarships, graduate careers), build a measurable Global Employability Score, and connect directly with universities, employers, and program providers worldwide.
- **Approach**: Build a Next.js application with Supabase backend providing multi-role authentication, intelligent onboarding, AI-powered matching engine, a GX Career Copilot, digital portfolio, and comprehensive application management — all powered by a unified student profile.
- **Key Differentiators**:
  - **ONE PROFILE, ENDLESS POSSIBILITIES**: A single, rich student profile powers all opportunity types — eliminating profile duplication across platforms
  - **AI-Powered Matching with Explainability**: 12-dimension matching algorithm with transparent skill-gap analysis and actionable improvement recommendations
  - **Global Employability Score**: Proprietary 0-100 scoring system measuring 12 employability dimensions, giving students a clear benchmark and improvement pathway
  - **GX Career Copilot**: Context-aware AI assistant that guides students through opportunity discovery, profile optimization, interview preparation, and career planning

### Expected Business Benefits
- **Primary Benefit**: Create a network effect connecting 100,000+ students with 5,000+ global opportunities in Year 1, generating platform revenue through B2B subscriptions (universities and employers) and premium student features
- **Secondary Benefits**:
  - Reduce student time-to-opportunity by 70% through single-profile architecture and AI matching
  - Increase university placement rates by 40% through centralized tracking and proactive matching
  - Decrease employer cost-per-hire for global talent by 50% through pre-qualified candidate pools
- **ROI Estimate**: Break-even within 18 months; projected ARR of $2.5M by end of Year 2 through tiered B2B subscriptions and premium features
- **Risk of Not Doing**: Competitors (Handshake, GoinGlobal, iAgora) are moving toward unified platforms; delay risks losing first-mover advantage in the AI-powered global talent mobility category

### Key Success Metrics
- **Metric 1**: Achieve 50,000 active student profiles with >80% profile completion within 12 months of launch
- **Metric 2**: AI matching engine delivers >85% relevance score (student satisfaction with matched opportunities) within 6 months
- **Metric 3**: Platform facilitates 10,000+ successful applications (status: Selected) across all opportunity categories in Year 1

---

## 1. Background & Context

### 1.1 Current Situation
**Description**: The global higher education and talent mobility market relies on disconnected systems. Students use LinkedIn for professional networking, Handshake for campus recruiting, Go Overseas for study abroad, individual university portals for exchanges, and dozens of company career sites for internships and jobs. Each requires separate profiles, applications, and document uploads.
- **Existing Solutions**: LinkedIn (professional networking), Handshake (campus recruiting), Go Overseas/GoAbroad (study abroad directories), WayUp (early-career jobs), individual university international offices, manual scholarship databases
- **Their Limitations**: No solution combines all opportunity types; none offer AI-powered matching across categories; none provide a unified employability scoring system; data is siloed and non-portable; student experience is fragmented and repetitive
- **Previous Attempts**: University consortiums have attempted shared placement systems but failed due to lack of employer buy-in, limited technology investment, and absence of student-centric design

### 1.2 Market & Competitive Context
- **Market Drivers**: Post-pandemic surge in global mobility demand (+45% YoY), employer demand for internationally-experienced graduates, university rankings increasingly tied to global placement outcomes, AI maturity enabling intelligent matching at scale
- **Competitive Landscape**: Handshake (US campus-focused, $3.5B valuation), Symplicity (university career services SaaS), GoAbroad (study abroad directory), iAgora (European internship directory) — none offer unified multi-category global mobility with AI matching
- **Industry Benchmarks**: Leading talent platforms achieve 70%+ profile completion, 20% monthly active rate, 15-25% application-to-interview conversion, and 3-5 minute average session duration

### 1.3 Strategic Alignment
- **Company Strategy**: Position GlobalXcelerate as the definitive global talent mobility infrastructure — the "Stripe for international career development" — starting with student-university-employer triangle and expanding to government agencies, visa services, and career coaching
- **Strategic Initiatives**: Phase 1 focuses on core platform (this PRD), Phase 2 adds advanced analytics and enterprise features, Phase 3 introduces marketplace monetization and white-label capabilities
- **Long-term Vision**: Become the global standard for student employability measurement and talent mobility, with every graduating student worldwide having a GX profile that follows them throughout their career

### 1.4 Regulatory & Compliance Context
- **Regulatory Requirements**: GDPR (EU students), CCPA (California students), FERPA (US educational records), data localization requirements for UAE operations (PDPL)
- **Compliance Standards**: SOC 2 Type II for enterprise customers, ISO 27001 roadmap for Year 2, WCAG 2.1 AA for accessibility
- **Audit Requirements**: Annual security audits, quarterly access reviews, student data portability (right to export/delete), consent management for data sharing between platform roles

---

## 2. Business Objectives & Success Criteria

### 2.1 Primary Business Objective
**Objective**: Launch GlobalXcelerate as a fully functional multi-role platform connecting 50,000 students with 5,000+ opportunities across 7 categories within 12 months of launch, achieving $500K ARR through B2B subscriptions and premium features.

### 2.2 Secondary Objectives
1. **Objective 1**: Onboard 200+ universities as institutional subscribers within 12 months
   - **Rationale**: Universities are the primary B2B revenue channel and provide student volume through institutional onboarding
2. **Objective 2**: Achieve 85%+ average student profile completion rate within 6 months of platform launch
   - **Rationale**: Profile completeness directly correlates with AI matching accuracy and platform value to all stakeholders
3. **Objective 3**: Establish the Global Employability Score as an industry-recognized benchmark adopted by 50+ employers for candidate evaluation
   - **Rationale**: Creates network effects and defensible moat — once employers rely on GX scores, switching costs are high
4. **Objective 4**: Achieve NPS of 50+ from students and 40+ from institutional users within 9 months
   - **Rationale**: High NPS drives organic growth through word-of-mouth and university-to-university referrals

### 2.3 Success Metrics & KPIs

| Metric | Baseline | Target | Timeline | Measurement Method |
|--------|----------|--------|----------|-------------------|
| Active Student Profiles | 0 | 50,000 | 12 months | Monthly active users with >60% profile completion |
| University Subscribers | 0 | 200 | 12 months | Signed institutional contracts |
| Employer Accounts | 0 | 500 | 12 months | Active employer accounts with ≥1 posted opportunity |
| AI Match Relevance Score | N/A | >85% | 6 months | Student satisfaction survey on matched opportunities |
| Application Conversion Rate | N/A | >20% | 9 months | Applications submitted / Opportunities viewed |
| Profile Completion Rate | N/A | >85% | 6 months | Average % across all active student profiles |
| Platform Uptime | N/A | 99.9% | Launch | Monitoring tools (Supabase dashboard + external) |
| Page Load Time (P95) | N/A | <2 seconds | Launch | Performance monitoring (Vercel Analytics) |
| Monthly Active Users | 0 | 25,000 | 12 months | Unique logins per calendar month |
| ARR | $0 | $500K | 12 months | Subscription revenue tracking |

### 2.4 Project Priority
- **Overall Priority**: Critical
- **Business Urgency**: Market window is open — no dominant platform exists for unified global talent mobility with AI matching. Competitors are expanding feature sets rapidly (Handshake raised $200M, Symplicity acquired by Ellucian).
- **Rationale**: First-mover advantage in the AI-powered global talent mobility category with a product-led growth strategy. Every month of delay allows competitors to close the feature gap.

---

## 3. Stakeholder Analysis

### 3.1 Stakeholder Matrix

| Stakeholder Group | Key Representatives | Role | Interest/Concern | Key Requirements | Impact Level |
|-------------------|---------------------|------|------------------|------------------|--------------|
| Students (18-28) | University students, recent graduates | Primary end users | Easy profile creation, quality opportunities, career guidance | Single profile, AI matching, clear progress tracking | Critical |
| Universities | International offices, career services, deans | B2B customers & student pipeline | Placement rates, student tracking, institutional reputation | Dashboard analytics, student management, program posting | Critical |
| Employers | HR teams, campus recruiters, hiring managers | B2B customers & opportunity providers | Access to pre-qualified global talent, reduced hiring time | Talent search, application management, interview scheduling | High |
| Global Program Providers | Study abroad agencies, immersion program operators | Content providers & B2B customers | Student enrollment, program visibility, enrollment management | Program listing, enrollment tracking, student communication | High |
| Mentors / Industry Experts | Professionals, alumni, career coaches | Value-add service providers | Impact on students, platform engagement | Session scheduling, profile review tools, compensation | Medium |
| GX Administrators | Platform operations team | Platform managers | System health, user quality, content moderation | Admin dashboard, approval workflows, analytics | Critical |
| Investors | Seed/Series A investors | Funding stakeholders | Growth metrics, revenue, market positioning | Reporting dashboards, KPI tracking | High |

### 3.2 User Personas

#### Persona 1: Aisha — The Ambitious Student
- **Description**: Third-year Computer Science student at a mid-tier university seeking international internship and exchange program experiences to boost her career prospects
- **Demographics**: 21 years old, based in Dubai (UAE), high digital literacy, active on LinkedIn and Instagram
- **Goals**:
  - Secure a tech internship at a global company in Europe or North America
  - Participate in a semester exchange program to enhance her CV
  - Build a comprehensive digital portfolio showcasing her projects and international exposure
- **Pain Points**:
  - Spends 3+ hours weekly updating profiles across 8 different platforms
  - Cannot easily compare opportunities across internships, exchanges, and research programs
  - No clear understanding of what makes her profile competitive for global opportunities
  - Overwhelmed by volume of options without personalized guidance
- **Needs**:
  - Single profile that works across all opportunity types
  - Clear score/benchmark showing her global employability standing
  - AI-powered recommendations tailored to her skills and goals
  - Guided improvement pathway to strengthen weak areas
- **Behaviors**: Checks opportunities daily on mobile, applies in batches during weekends, shares opportunities with study group
- **Success Criteria**: Receives 5+ high-quality matched opportunities weekly, secures international internship within 3 months of profile completion

#### Persona 2: Dr. Williams — The University International Office Director
- **Description**: Director of International Programs at a research university managing 500+ outbound students annually across exchange, internship, and immersion programs
- **Demographics**: 48 years old, US-based, moderate technical proficiency, manages team of 6 advisors
- **Goals**:
  - Increase international placement rates from 30% to 50% of eligible students
  - Reduce administrative overhead of managing multiple program partnerships
  - Demonstrate ROI of international programs to university leadership through data
- **Pain Points**:
  - Currently uses 4 different systems to manage exchanges, internships, and scholarships
  - Cannot track student outcomes post-placement in a unified way
  - Spends 40% of time on administrative tasks instead of student advising
  - Lacks real-time visibility into student application progress
- **Needs**:
  - Unified dashboard showing all student activities and outcomes
  - Batch student onboarding and program management tools
  - Analytics proving program effectiveness and student outcomes
  - Direct integration with existing student information systems
- **Behaviors**: Reviews dashboards weekly, runs reports monthly for leadership, assigns advisors to student cohorts
- **Success Criteria**: 50% reduction in administrative time, measurable improvement in placement rates, clean executive reports

#### Persona 3: Marcus — The Corporate Campus Recruiter
- **Description**: Senior talent acquisition specialist at a Fortune 500 technology company responsible for early-career hiring across 12 countries
- **Demographics**: 34 years old, London-based, high technical proficiency, manages $2M annual campus recruitment budget
- **Goals**:
  - Identify globally-mobile, pre-qualified candidates with verified skills and experiences
  - Reduce time-to-hire for international internship positions from 45 to 20 days
  - Build a diverse candidate pipeline representing 15+ nationalities
- **Pain Points**:
  - Current platforms show unverified self-reported skills
  - Cannot filter candidates by international mobility readiness or visa flexibility
  - Application volume is high but quality is inconsistent
  - No standardized way to assess "global readiness" across candidates
- **Needs**:
  - AI-powered talent discovery with verified Global Employability Scores
  - Advanced filters for mobility readiness, language proficiency, cultural exposure
  - Streamlined application review and interview scheduling workflow
  - Analytics on candidate pipeline diversity and quality
- **Behaviors**: Searches for candidates weekly, reviews applications daily during hiring cycles, conducts virtual interviews across time zones
- **Success Criteria**: 3x increase in qualified candidate applications, 50% reduction in screening time, improved offer acceptance rate

#### Persona 4: Sofia — The Program Provider Manager
- **Description**: Operations manager at a global immersion program company offering 6-week experiential learning programs across 15 countries
- **Demographics**: 38 years old, Barcelona-based, moderate technical proficiency, manages 30+ program cohorts annually
- **Goals**:
  - Fill program cohorts to 90%+ capacity (currently at 65%)
  - Reach qualified students from universities beyond current partner network
  - Streamline enrollment and pre-departure processes
- **Pain Points**:
  - Limited reach — depends on 20 university partnerships for student pipeline
  - High marketing spend per enrolled student ($450 CAC)
  - Manual enrollment process with email-based document collection
  - No way to pre-qualify students for program-specific requirements
- **Needs**:
  - Platform exposure to thousands of pre-qualified, mobility-ready students
  - Automated enrollment workflow with document collection
  - Student filtering by academic background, language, and mobility preferences
  - Program analytics showing enrollment funnel and student satisfaction
- **Behaviors**: Lists new programs quarterly, reviews applications weekly, communicates with cohorts daily during programs
- **Success Criteria**: 40% increase in enrollment, 60% reduction in CAC, automated enrollment reducing admin by 50%

---

## 4. User Stories & Use Cases

### 4.1 User Stories (Extensive List)

> **Format**: As a [actor], I want [feature/capability], so that [benefit/value]

**Core User Stories** (Must Have):
1. As a **student**, I want to create a comprehensive global profile once with my education, skills, experience, and career preferences, so that I can access all opportunity types without re-entering information
2. As a **student**, I want to receive AI-powered opportunity recommendations with match scores, so that I can focus on opportunities where I'm most competitive
3. As a **student**, I want to see my Global Employability Score with a breakdown across 12 dimensions, so that I understand my strengths and know exactly what to improve
4. As a **student**, I want to browse and filter opportunities across 7 categories (internships, immersion, exchange, projects, research, scholarships, careers), so that I can discover relevant global opportunities in one place
5. As a **student**, I want to apply to opportunities directly through the platform with my global profile, so that I don't need to recreate applications for each opportunity
6. As a **student**, I want to track all my applications in one place with status updates, so that I know where each application stands
7. As a **university admin**, I want to view a dashboard showing all my students' profiles, applications, and placement outcomes, so that I can track institutional performance
8. As a **university admin**, I want to post programs (exchanges, internships, research) to the marketplace, so that students from any institution can discover our offerings
9. As an **employer**, I want to search and discover students using advanced filters (skills, GX score, mobility, languages), so that I can find the best globally-ready candidates efficiently
10. As an **employer**, I want to post opportunities and manage applications with status tracking, so that I can run an organized recruitment process
11. As a **program provider**, I want to list my immersion/exchange programs with requirements and availability, so that qualified students can discover and apply
12. As a **platform admin**, I want to approve/reject user registrations and opportunity listings, so that platform quality is maintained
13. As a **student**, I want to authenticate via Email, Google, Microsoft, Apple, LinkedIn, or Mobile, so that I can sign up quickly with my preferred method
14. As a **new user**, I want to select my role (Student, Employer, University, Program Provider) after signup, so that I'm routed to the appropriate onboarding experience

**Secondary User Stories** (Should Have):
15. As a **student**, I want to interact with the GX Career Copilot AI assistant for profile improvement suggestions, so that I can continuously enhance my competitiveness
16. As a **student**, I want a public digital portfolio URL (e.g., /student/rajesh-us) that I can share with employers, so that I have a professional online presence
17. As a **student**, I want the AI Copilot to help me prepare for interviews with practice questions and tips, so that I perform better in assessments
18. As a **student**, I want to control the privacy of each portfolio section (Public/Private/Employer-only), so that I maintain control over my data visibility
19. As a **university admin**, I want to bulk-invite students to the platform via CSV upload or institutional email domains, so that I can efficiently onboard cohorts
20. As an **employer**, I want to schedule interviews with shortlisted candidates through the platform, so that I can manage the hiring process end-to-end
21. As a **mentor**, I want to review student profiles and provide structured feedback, so that students receive expert guidance on improving their profiles
22. As a **student**, I want to download my profile as a formatted resume/CV, so that I can use it outside the platform
23. As a **student**, I want to save opportunities and set deadline reminders, so that I don't miss application windows
24. As a **program provider**, I want to track enrollment status and send communications to enrolled students, so that I can manage program cohorts effectively

**Enhancement User Stories** (Could Have):
25. As a **student**, I want AI-generated skill gap analysis showing what I need for specific opportunities, so that I can create targeted learning plans
26. As a **student**, I want the Copilot to suggest specific courses, certifications, or projects to improve my weak dimensions, so that I have actionable next steps
27. As an **employer**, I want to see AI-recommended candidates for my posted opportunities, so that I can proactively reach out to top matches
28. As a **university admin**, I want comparative analytics benchmarking my institution against peer universities, so that I can demonstrate competitive positioning
29. As a **student**, I want to connect my GitHub, LinkedIn, and portfolio links that auto-sync relevant data, so that my profile stays current without manual updates
30. As a **platform admin**, I want fraud detection alerts for suspicious profiles or applications, so that platform integrity is maintained
31. As a **student**, I want to see which employers viewed my profile, so that I can gauge employer interest and follow up strategically
32. As a **mentor**, I want to schedule mentoring sessions with students through the platform, so that career guidance is accessible and trackable

### 4.2 Key User Journeys

#### Journey 1: Student Profile Creation & First Opportunity Match
- **Actor**: Aisha (Ambitious Student)
- **Trigger**: Student discovers GlobalXcelerate through university email or social media
- **Preconditions**: Student has valid email or social login credentials, internet access
- **Steps**:
  1. **Lands on homepage**: Student views landing page with hero section, opportunity categories, AI matching preview → System displays animated global network, 7 category cards, and GX Score preview
  2. **Initiates signup**: Student clicks "Get Started Free" → System presents multi-provider authentication options (Email, Google, Microsoft, Apple, LinkedIn, Mobile)
  3. **Authenticates**: Student selects preferred auth method and completes authentication → System creates base account and presents role selection
  4. **Selects role**: Student chooses "Student" role → System routes to 8-step onboarding wizard
  5. **Completes onboarding**: Student progresses through Identity → Education → Skills → Experience → Career Goals → Global Preferences → Portfolio → Profile Complete → System saves each step progressively and shows completion percentage
  6. **Views dashboard**: Student arrives at personalized dashboard → System displays GX Score, recommended opportunities (AI-matched), profile completion %, and action items
  7. **Explores matches**: Student clicks a recommended opportunity card (91% match) → System shows opportunity detail with AI match breakdown, skill-level comparison, and eligibility analysis
  8. **Applies**: Student clicks "Apply Now" → System pre-fills application from global profile, student confirms and submits
- **Expected Outcome**: Student has a complete profile, understands their GX score, and has submitted their first application within 30 minutes
- **Success Criteria**: <30 minutes from signup to first application, >80% profile completion on first session
- **Alternative Paths**:
  - **Alt Path 1**: Student abandons onboarding at step 4 — System saves progress, sends reminder email after 24 hours with completion incentive
  - **Alt Path 2**: Student has no prior experience — System adapts onboarding to focus on skills, education, and career goals with "No experience yet" options
- **Error Scenarios**:
  - **Error 1**: Authentication provider unavailable — System shows alternative auth methods with clear error message
  - **Error 2**: University not found in autocomplete — System allows manual entry with verification pending status

#### Journey 2: Employer Discovers and Recruits Global Talent
- **Actor**: Marcus (Corporate Campus Recruiter)
- **Trigger**: Employer needs to fill 10 international internship positions across 3 countries
- **Preconditions**: Employer has active account with verified company profile
- **Steps**:
  1. **Posts opportunity**: Employer creates detailed internship listing with requirements, location, compensation, visa support → System validates and publishes to marketplace
  2. **Receives applications**: AI matching engine sends opportunity to qualified students; students apply → System notifies employer of new applications with match scores
  3. **Reviews candidates**: Employer views applicant list sorted by AI match score → System shows student profiles with GX scores, skill breakdowns, and experience summaries
  4. **Shortlists candidates**: Employer moves top candidates to "Shortlisted" status → System notifies students of status change
  5. **Schedules interviews**: Employer selects interview slots for shortlisted candidates → System sends scheduling invitations and calendar integrations
  6. **Selects candidate**: Employer marks candidate as "Selected" → System notifies student, updates application status, and logs placement for analytics
- **Expected Outcome**: Employer fills positions with globally-ready, pre-qualified candidates in 50% less time than traditional methods
- **Success Criteria**: Time from posting to first shortlist < 5 days, candidate quality rating > 4/5 from employer
- **Alternative Paths**:
  - **Alt Path 1**: No candidates meet minimum requirements — System suggests expanding criteria or similar opportunities that attracted qualified candidates
  - **Alt Path 2**: Employer wants to proactively search rather than post — System provides talent search with advanced filters
- **Error Scenarios**:
  - **Error 1**: Opportunity violates platform policies — System flags for admin review with specific violation details
  - **Error 2**: Student withdraws application — System notifies employer and adjusts pipeline counts

#### Journey 3: University Manages Student Placements
- **Actor**: Dr. Williams (University International Office Director)
- **Trigger**: New academic year begins; university needs to onboard 500 students and track their international placement journey
- **Preconditions**: University has active institutional account with admin privileges
- **Steps**:
  1. **Bulk onboards students**: Admin uploads CSV of student emails or configures institutional email domain → System sends personalized invitation emails to all students
  2. **Monitors onboarding**: Admin views dashboard showing student signup rates, profile completion progress → System displays real-time metrics and identifies students needing nudges
  3. **Posts institutional programs**: Admin creates exchange and research program listings → System publishes to marketplace with institutional branding
  4. **Tracks applications**: Admin views which students have applied where, application statuses, and outcomes → System provides filterable table with export capabilities
  5. **Reviews analytics**: Admin generates placement report showing outcomes by program, department, destination country → System produces visual report suitable for leadership presentations
  6. **Advises students**: Admin identifies at-risk students (low GX scores, no applications) → System suggests intervention actions and enables direct messaging
- **Expected Outcome**: University achieves 50%+ placement rate with full visibility into student journeys and executive-ready reporting
- **Success Criteria**: 80%+ student onboarding conversion within 2 weeks, monthly report generation in <5 minutes
- **Alternative Paths**:
  - **Alt Path 1**: Students already have GX accounts — System links existing profiles to institutional account without requiring re-registration
  - **Alt Path 2**: University wants to restrict which opportunities their students see — System supports institutional opportunity filtering policies
- **Error Scenarios**:
  - **Error 1**: CSV upload contains invalid emails — System processes valid entries and returns error report for invalid rows
  - **Error 2**: Student data conflicts with existing account — System flags for manual review by admin

### 4.3 Use Cases (Detailed Scenarios)

#### UC-01: AI-Powered Opportunity Matching
- **Actor**: Student (any)
- **Goal**: Receive personalized opportunity recommendations ranked by relevance
- **Preconditions**: Student profile is ≥60% complete; opportunities exist in the marketplace
- **Main Flow**:
  1. Student navigates to Dashboard or Opportunity Marketplace
  2. System runs AI matching algorithm against student profile and all active opportunities
  3. System calculates match scores based on 12 dimensions (skills, academic background, experience, graduation year, availability, geography, career preferences, opportunity requirements, international mobility readiness, language match, industry alignment, compensation expectations)
  4. System presents ranked opportunity cards with match percentage, key match factors, and skill gaps
  5. Student views detailed match breakdown showing dimension-by-dimension comparison
- **Postconditions**: Student has actionable list of matched opportunities with clear understanding of fit
- **Alternative Flows**:
  - **Alt 1**: Profile completion is below 60% — System shows limited matches with prompt to complete profile for better results
  - **Alt 2**: No opportunities match above 50% threshold — System shows closest matches with specific improvement suggestions
- **Exception Flows**:
  - **Exc 1**: Matching engine timeout — System shows cached results from last successful run with "Refreshing..." indicator
  - **Exc 2**: New opportunity type has no matching criteria defined — System falls back to keyword and category matching

#### UC-02: Multi-Step Student Onboarding
- **Actor**: New student user
- **Goal**: Complete comprehensive global profile through guided wizard
- **Preconditions**: User has authenticated and selected "Student" role
- **Main Flow**:
  1. System presents 8-step wizard with progress indicator
  2. Step 1 (Identity): Student enters name, photo, location, nationality, date of birth, contact preferences
  3. Step 2 (Education): Student adds university (autocomplete), degree, field of study, graduation year, GPA
  4. Step 3 (Skills): Student selects skills from intelligent skill selector with proficiency levels (Beginner/Intermediate/Advanced/Expert)
  5. Step 4 (Experience): Student adds experiences categorized by type (Internships, Projects, Research, Freelance, Part-time, Volunteering, Entrepreneurship, Competitions, Hackathons)
  6. Step 5 (Career Goals): Student selects preferred industries, functions, company types, and career aspirations
  7. Step 6 (Global Preferences): Student indicates preferred countries/regions, mobility readiness, language proficiencies, visa status
  8. Step 7 (Portfolio): Student uploads project samples, links GitHub/LinkedIn, adds certifications and publications
  9. Step 8 (Profile Complete): System displays completed profile preview, calculated GX Score, and next steps
- **Postconditions**: Student has a complete global profile, initial GX Score is calculated, and AI matching begins
- **Alternative Flows**:
  - **Alt 1**: Student wants to skip non-required steps — System allows skip with "Complete Later" option, marks profile as partial
  - **Alt 2**: Student returns to previous step to edit — System preserves all entered data and allows backward navigation
- **Exception Flows**:
  - **Exc 1**: Session expires mid-onboarding — System saves progress automatically; student resumes from last completed step
  - **Exc 2**: University not found in database — System allows manual entry and flags for admin verification

#### UC-03: Application Lifecycle Management
- **Actor**: Student applying to opportunity
- **Goal**: Submit application and track progress through selection pipeline
- **Preconditions**: Student has ≥60% profile completion; opportunity is active and accepting applications
- **Main Flow**:
  1. Student clicks "Apply Now" on opportunity detail page
  2. System pre-fills application form from student's global profile
  3. Student reviews pre-filled data, adds opportunity-specific information (cover letter, additional documents)
  4. Student submits application — status changes to "Submitted"
  5. System notifies opportunity owner (employer/university/program provider) of new application
  6. Opportunity owner reviews and updates status through pipeline: Under Review → Shortlisted → Assessment → Interview → Selected/Rejected
  7. Student receives real-time notifications at each status change
  8. Upon "Selected" status, system logs successful placement for analytics
- **Postconditions**: Application is tracked end-to-end with full audit trail; placement data contributes to GX Score
- **Alternative Flows**:
  - **Alt 1**: Student saves as draft before submitting — System saves draft with "Resume Application" option
  - **Alt 2**: Opportunity requires additional assessment — System presents assessment link/instructions at "Assessment" stage
- **Exception Flows**:
  - **Exc 1**: Opportunity is closed while application is in draft — System notifies student and archives draft
  - **Exc 2**: Employer account is suspended mid-review — System notifies admin and pauses application pipeline

---

## 5. Scope Definition

### 5.1 In-Scope Features & Capabilities

#### Category 1: Landing & Marketing
**[Feature 1.1]**: World-Class Marketing Landing Page
- **Description**: Premium homepage with animated hero section, opportunity category showcase, AI matching preview, GX Score preview, and role-specific sections (For Universities, For Employers)
- **User Value**: Converts visitors into signups by demonstrating platform value proposition instantly
- **Priority**: Must Have
- **Key Capabilities**:
  - Animated global network/world map visualization
  - "One Profile, Endless Possibilities" value proposition section
  - 7 opportunity category cards with counts/previews
  - AI-Powered Matching preview (91% match example)
  - Global Employability Score radial preview (78/100)
  - University partner section with logos/testimonials
  - Employer section with featured companies
  - Global Experiences destinations with imagery
  - Final CTA "Start Your Global Journey"
  - Fully responsive across all breakpoints

#### Category 2: Authentication & Onboarding
**[Feature 2.1]**: Multi-Provider Authentication
- **Description**: Secure authentication supporting 6 providers with role-based routing
- **User Value**: Frictionless signup with preferred identity provider; secure access management
- **Priority**: Must Have
- **Key Capabilities**:
  - Email/password authentication with verification
  - Mobile/SMS OTP authentication
  - OAuth providers: Google, Microsoft, Apple, LinkedIn
  - Post-signup role selection (Student, Employer, University, Program Provider)
  - Separate admin authentication flow
  - Session management with secure token handling
  - Password reset and account recovery flows

**[Feature 2.2]**: Student Onboarding Wizard (8-Step)
- **Description**: Guided multi-step onboarding capturing comprehensive student profile data
- **User Value**: Creates a complete global profile in one guided session without overwhelming the user
- **Priority**: Must Have
- **Key Capabilities**:
  - Visual progress indicator with step labels
  - Profile completion percentage (real-time calculation)
  - Step 1: Identity (name, photo, location, nationality, DOB)
  - Step 2: Education (university autocomplete, degree, field, year, GPA)
  - Step 3: Skills (intelligent selector with proficiency levels)
  - Step 4: Experience (9 experience types with structured data entry)
  - Step 5: Career Goals (industries, functions, aspirations)
  - Step 6: Global Preferences (countries, mobility, languages, visa)
  - Step 7: Portfolio (uploads, links, certifications)
  - Step 8: Profile Complete (preview, GX Score, next steps)
  - Auto-save on each step transition
  - Skip and "Complete Later" for optional steps
  - Backward navigation with data preservation

#### Category 3: Student Dashboard & Profile
**[Feature 3.1]**: Personalized Student Dashboard
- **Description**: Central hub showing personalized metrics, recommendations, and quick actions
- **User Value**: Gives students immediate visibility into their profile strength, matched opportunities, and pending actions
- **Priority**: Must Have
- **Key Capabilities**:
  - Personalized greeting with profile completion percentage
  - Global Employability Score (radial/gauge visualization)
  - Recommended Opportunities widget (AI-matched cards with %)
  - My Applications widget (status counts and recent updates)
  - Upcoming Deadlines widget (calendar-based)
  - Interviews widget (scheduled and upcoming)
  - Skills to Improve widget (AI recommendations)
  - Profile Strength indicator with improvement suggestions
  - Saved Opportunities quick-access
  - Notifications feed (real-time)
  - Upcoming Programs widget

**[Feature 3.2]**: Digital Student Profile
- **Description**: Comprehensive premium profile page serving as the student's global identity
- **User Value**: Professional digital presence that can be shared with employers and used across all applications
- **Priority**: Must Have
- **Key Capabilities**:
  - Premium profile page with photo, university branding, degree, location
  - "Open to Opportunities" status toggle
  - Global Employability Score display with dimension breakdown
  - Sections: About, Education, Skills (with proficiency), Certifications, Internships, Projects, Research, Competitions, Leadership, Volunteering, International Exposure, Languages, Achievements, Career Preferences, Portfolio links
  - Public profile URL (/student/[username])
  - Share Profile (link, QR code, social media)
  - Download as Resume/CV (formatted PDF export)
  - Privacy Settings per section (Public/Private/Employer-only)
  - Edit mode with inline editing
  - Profile views counter

**[Feature 3.3]**: Digital Portfolio
- **Description**: Public-facing portfolio showcasing student's work and achievements with granular visibility controls
- **User Value**: Professional portfolio that students can share externally and customize based on audience
- **Priority**: Should Have
- **Key Capabilities**:
  - Standalone portfolio page with custom URL
  - Visibility controls per section: Public, Private, Employer-only
  - Sections: About, Education, Skills, Projects (with media), Internships, Certifications, Achievements, Publications, Videos, GitHub integration, LinkedIn integration, Research, International Experiences
  - Media uploads (images, PDFs, presentations)
  - Rich text descriptions with formatting
  - Portfolio analytics (views, clicks)

#### Category 4: Opportunity Marketplace
**[Feature 4.1]**: Opportunity Marketplace & Discovery
- **Description**: Comprehensive marketplace for browsing, searching, and filtering opportunities across 7 categories
- **User Value**: Single destination to discover all global opportunities with powerful filtering to find the perfect match
- **Priority**: Must Have
- **Key Capabilities**:
  - 7 opportunity categories: Internships, Global Immersion, Student Exchange, Industry Projects, Research, Scholarships, Graduate Careers
  - Card-based grid layout with key information display
  - Full-text search with relevance ranking
  - Extensive filter panel: Country, City, University, Company, Industry, Function, Skill, Type, Duration, Paid/Unpaid, Work Mode (Remote/Hybrid/On-site), Start Date, Compensation range, Visa Support, Academic Year
  - Filter combinations with URL-persisted state
  - Sort options: Match Score, Date Posted, Deadline, Popularity
  - Save search with notification alerts
  - Mobile-optimized browse experience

**[Feature 4.2]**: Opportunity Detail Page
- **Description**: Comprehensive detail view of a single opportunity with all relevant information and AI-powered insights
- **User Value**: Complete information and AI-assisted decision-making before committing to apply
- **Priority**: Must Have
- **Key Capabilities**:
  - Full opportunity description with rich formatting
  - Requirements, responsibilities, benefits, timeline
  - Company/university/provider profile card
  - Location with map visualization
  - AI Match Score with dimension breakdown
  - Skill comparison: "You have" vs "They require"
  - Skill gap identification with improvement actions
  - "Ask AI: Am I eligible?" conversational feature
  - Apply Now button (with profile completeness check)
  - Save / Share / Report functionality
  - Related opportunities carousel
  - Application deadline countdown

#### Category 5: AI & Intelligence
**[Feature 5.1]**: AI Matching Engine
- **Description**: Intelligent matching algorithm calculating compatibility scores between students and opportunities across 12 dimensions
- **User Value**: Students discover the most relevant opportunities automatically; employers receive the most qualified candidates
- **Priority**: Must Have
- **Key Capabilities**:
  - 12-dimension matching: Skills, Academic background, Experience level, Graduation year, Availability, Geography preferences, Career preferences, Opportunity requirements, International mobility readiness, Language match, Industry alignment, Compensation expectations
  - Match score calculation (0-100%) with weighted dimensions
  - Explainable matching: dimension-by-dimension breakdown visible to students
  - Skill gap identification with specific recommendations
  - Continuous learning from application outcomes (accept/reject feedback loop)
  - Batch matching on new opportunity creation (notify top matches)
  - Real-time matching on profile updates
  - Configurable matching weights per opportunity type

**[Feature 5.2]**: GX Career Copilot (AI Assistant)
- **Description**: Floating AI assistant available throughout the student platform providing personalized career guidance
- **User Value**: 24/7 intelligent career advisor that knows the student's profile and provides contextual, actionable guidance
- **Priority**: Should Have
- **Key Capabilities**:
  - Floating chat widget accessible from any page
  - Context-aware: uses student profile, current page, and interaction history
  - Opportunity recommendations with explanations
  - Profile improvement suggestions (specific, actionable)
  - Skill gap analysis with learning path suggestions
  - Interview preparation with practice questions
  - Resume/CV improvement tips
  - Country/program matching recommendations
  - Eligibility checking for specific opportunities
  - Conversational memory within session
  - Suggested prompts for new users

**[Feature 5.3]**: Global Employability Score
- **Description**: Proprietary 0-100 scoring system evaluating student employability across 12 dimensions with visual breakdown and improvement pathway
- **User Value**: Clear, measurable benchmark of global career readiness with actionable steps to improve
- **Priority**: Must Have
- **Key Capabilities**:
  - Composite score 0-100 with grade brackets (Exceptional 90-100, Strong 75-89, Developing 50-74, Emerging 25-49, Beginner 0-24)
  - 12 scoring dimensions: Academic Readiness, Technical Skills, Communication, Leadership, Project Experience, Internship Experience, International Exposure, Certifications, Portfolio Quality, Interview Readiness, Languages, Industry Skills
  - Visual radial/radar chart showing all dimensions
  - Individual dimension scores with level indicators
  - Improvement recommendations per dimension (specific actions)
  - Score history tracking (progress over time)
  - Peer comparison (anonymous percentile ranking)
  - Score weighting varies by opportunity type (technical roles weight Technical Skills higher)

#### Category 6: Application Management
**[Feature 6.1]**: Application Management System
- **Description**: Full application lifecycle management with multi-stage pipeline, notifications, and document handling
- **User Value**: Transparent, organized application process with real-time status visibility for all parties
- **Priority**: Must Have
- **Key Capabilities**:
  - Application pipeline stages: Draft → Submitted → Under Review → Shortlisted → Assessment → Interview → Selected/Rejected
  - Pre-filled applications from global profile
  - Additional document upload per application (cover letter, supporting docs)
  - Real-time status tracking with timeline view
  - Push notifications at each status change
  - Application history and archive
  - Withdrawal option at any stage
  - Deadline tracking with reminder alerts
  - Bulk application management (for opportunity owners)
  - Application notes and internal comments (for reviewers)
  - Interview scheduling integration

#### Category 7: Platform Administration
**[Feature 7.1]**: Admin Dashboard & Management
- **Description**: Comprehensive administration interface for platform management, approvals, and analytics
- **User Value**: Enables platform team to maintain quality, moderate content, and track business metrics
- **Priority**: Must Have
- **Key Capabilities**:
  - User management (view, approve, suspend, delete accounts)
  - Opportunity moderation (approve, reject, flag listings)
  - Content moderation queue
  - Platform analytics (users, opportunities, applications, placements)
  - Revenue tracking and subscription management
  - Role-based admin access (super admin, moderator, support)
  - Audit logs for all administrative actions
  - System health monitoring
  - Notification management (platform-wide announcements)
  - Report generation and export

### 5.2 Out-of-Scope

**Excluded from This Release**:
1. **Payment Processing & Monetization**
   - **Reason**: Initial launch focuses on user acquisition and product-market fit; monetization introduces friction during growth phase
   - **Future Plans**: Phase 2 — Stripe integration for premium subscriptions, university invoicing, employer per-seat billing

2. **Video Interview Platform (Built-in)**
   - **Reason**: Building video infrastructure is complex and not core differentiator; integrate with existing tools instead
   - **Future Plans**: Phase 2 — Integration with Zoom/Teams for interview scheduling; Phase 3 — Consider built-in video

3. **Mobile Native Applications (iOS/Android)**
   - **Reason**: Responsive web-first approach covers mobile users; native apps require separate development effort and app store management
   - **Future Plans**: Phase 2 — Progressive Web App (PWA) with push notifications; Phase 3 — Native apps if mobile engagement >60%

4. **White-Label / Multi-Tenant Branding**
   - **Reason**: Adds significant complexity to UI architecture; not needed until enterprise sales mature
   - **Future Plans**: Phase 3 — University-branded portals, employer career pages with GX integration

5. **Advanced Analytics & BI Dashboard**
   - **Reason**: Initial analytics cover core metrics; advanced BI requires data maturity and specific customer requests
   - **Future Plans**: Phase 2 — Custom report builder, predictive analytics, cohort analysis tools

6. **Visa Processing & Immigration Services**
   - **Reason**: Regulatory complexity and liability concerns; outside core platform value proposition
   - **Future Plans**: Phase 3 — Partner integrations with visa service providers (directory listing, not processing)

7. **Messaging / Chat System (User-to-User)**
   - **Reason**: Adds moderation complexity and potential misuse risks; email notifications suffice for MVP
   - **Future Plans**: Phase 2 — In-platform messaging with moderation tools for employer-student communication

### 5.3 Future Enhancements

**Phase 2 Candidates**:
- **In-Platform Messaging**: Direct communication between employers and candidates with moderation
- **Payment & Billing**: Subscription management, premium features, enterprise invoicing
- **Advanced Analytics**: Custom reports, predictive placement analytics, cohort comparison
- **API & Integrations**: University SIS integration, LinkedIn data sync, HR system connectors
- **Mentorship Marketplace**: Paid mentoring sessions, scheduling, video calls

**Long-term Vision**:
- **Blockchain Credentials**: Verified credentials and achievements on distributed ledger
- **Virtual Career Fairs**: Live events with employer booths, presentations, speed interviews
- **Government Partnerships**: National talent mobility programs, scholarship fund management
- **Alumni Network**: Post-placement community, career progression tracking, alumni mentoring
- **White-Label Platform**: University and employer branded instances of GX

---

## 6. Functional Requirements

### 6.1 Core Functional Requirements

#### FR-001: Multi-Provider Authentication System **[Must Have]**
- **Requirement**: The system shall support user authentication through Email/Password, Mobile/SMS OTP, Google OAuth, Microsoft OAuth, Apple OAuth, and LinkedIn OAuth
- **Business Value**: Reduces signup friction by 60% by offering familiar auth methods; increases conversion from visitor to registered user
- **User Story Reference**: US-13, US-14
- **Inputs**: User credentials (email+password, phone number, or OAuth token from social provider)
- **Processing**: Validate credentials against Supabase Auth, create session, determine if user has selected role, route accordingly
- **Outputs**: Authenticated session with JWT token; redirect to role selection (new user) or dashboard (returning user)
- **Business Rules**:
  - **Rule 1**: Email addresses must be verified before profile creation begins
  - **Rule 2**: Mobile/SMS requires valid phone number with country code; OTP expires in 5 minutes
  - **Rule 3**: OAuth providers must return email; if email not provided, prompt user to enter manually
  - **Rule 4**: Admin accounts cannot be created through public signup; require invitation link
- **Acceptance Criteria**:
  - [ ] User can sign up and log in with all 6 authentication methods
  - [ ] Email verification flow sends email within 30 seconds and link expires after 24 hours
  - [ ] Session persists across page refreshes with 7-day sliding window
  - [ ] Failed login attempts are rate-limited (5 attempts per 15 minutes)
  - [ ] OAuth flow completes in <5 seconds including provider redirect
  - [ ] Role selection appears only once for new users; subsequent logins go directly to dashboard
- **Priority**: Must Have
- **Success Criteria**: 95%+ signup success rate across all auth methods; <3 second average auth flow completion

#### FR-002: Role-Based User Management **[Must Have]**
- **Requirement**: The system shall support 6 distinct user roles (Student, Employer, University Admin, Program Provider, Mentor, Platform Admin) with role-specific interfaces, permissions, and onboarding flows
- **Business Value**: Ensures each user type has a tailored experience optimized for their goals; prevents unauthorized access to role-specific features
- **User Story Reference**: US-14, US-12
- **Inputs**: User role selection post-signup; admin role assignment for administrative users
- **Processing**: Store role in user metadata; apply role-based access control on all routes and API endpoints; serve role-specific UI layout and navigation
- **Outputs**: Role-appropriate dashboard, navigation, and feature set
- **Business Rules**:
  - **Rule 1**: Users can hold exactly one primary role at any time
  - **Rule 2**: Role selection is permanent; changing role requires admin intervention
  - **Rule 3**: Admin role cannot be self-assigned; requires invitation from existing super-admin
  - **Rule 4**: University admin role requires institutional email verification or admin approval
- **Acceptance Criteria**:
  - [ ] New user is presented with role selection screen after first authentication
  - [ ] Each role has a distinct dashboard, navigation menu, and available features
  - [ ] Unauthorized access to another role's routes returns 403 error and redirect
  - [ ] Admin can view and modify user roles from admin panel
  - [ ] Role-specific RLS policies enforce data isolation at the database level
- **Priority**: Must Have
- **Success Criteria**: Zero unauthorized cross-role data access in security testing

#### FR-003: 8-Step Student Onboarding Wizard **[Must Have]**
- **Requirement**: The system shall guide new students through an 8-step onboarding wizard that captures comprehensive profile data including identity, education, skills, experience, career goals, global preferences, portfolio, and generates initial profile metrics
- **Business Value**: Drives 85%+ profile completion through guided UX; comprehensive profiles enable accurate AI matching
- **User Story Reference**: US-01
- **Inputs**: Student-provided data across 8 steps (personal info, educational history, skills with proficiency, experiences, career preferences, mobility preferences, portfolio items)
- **Processing**: Validate data at each step, save progressively to database, calculate profile completion percentage in real-time, generate initial GX Score upon completion
- **Outputs**: Complete student profile record, calculated profile completion %, initial GX Score, personalized dashboard ready
- **Business Rules**:
  - **Rule 1**: Steps 1 (Identity) and 2 (Education) are mandatory; steps 3-7 can be skipped
  - **Rule 2**: Profile completion percentage is calculated as (completed fields / total fields) × 100
  - **Rule 3**: Auto-save occurs on every step transition (forward or backward navigation)
  - **Rule 4**: University field uses autocomplete from a pre-loaded database of 10,000+ institutions
  - **Rule 5**: Skills must include proficiency level selection (Beginner/Intermediate/Advanced/Expert)
  - **Rule 6**: Experience entries must be categorized by type (9 types available)
- **Acceptance Criteria**:
  - [ ] All 8 steps render correctly with proper validation per field
  - [ ] Progress indicator shows current step and completion status
  - [ ] Profile completion percentage updates in real-time as data is entered
  - [ ] "Skip" option available on steps 3-7 with clear messaging about impact on matching
  - [ ] Backward navigation preserves all entered data without loss
  - [ ] Session interruption (browser close, timeout) does not lose data — resumes from last step
  - [ ] University autocomplete returns results within 300ms of typing
  - [ ] GX Score is calculated and displayed upon completing step 8
- **Priority**: Must Have
- **Success Criteria**: 85%+ of students who start onboarding complete at least 6 of 8 steps in first session

#### FR-004: Opportunity Marketplace with Search & Filters **[Must Have]**
- **Requirement**: The system shall provide a searchable marketplace displaying opportunities across 7 categories with extensive filtering, sorting, and AI-powered matching integration
- **Business Value**: Central discovery hub that aggregates all opportunity types — differentiator vs. fragmented competitor landscape
- **User Story Reference**: US-04, US-08, US-11
- **Inputs**: User search queries, filter selections, sort preferences, user profile data (for AI matching)
- **Processing**: Execute full-text search against opportunity database, apply filter predicates, calculate/retrieve AI match scores, sort results, paginate
- **Outputs**: Paginated opportunity cards with key information, match scores, and filter state; URL-persisted search state for sharing/bookmarking
- **Business Rules**:
  - **Rule 1**: Only approved, active opportunities with future deadlines appear in marketplace
  - **Rule 2**: AI match scores display only for authenticated students with ≥60% profile completion
  - **Rule 3**: Opportunities can belong to exactly one category but multiple subcategories
  - **Rule 4**: Default sort for authenticated students is "Match Score (High to Low)"
  - **Rule 5**: Expired opportunities are automatically archived and removed from search results
- **Acceptance Criteria**:
  - [ ] All 7 opportunity categories are browsable with accurate counts
  - [ ] Full-text search returns results within 500ms for up to 100,000 opportunities
  - [ ] All 14+ filter dimensions (Country, City, University, Company, Industry, Function, Skill, Type, Duration, Paid/Unpaid, Work Mode, Start Date, Compensation, Visa Support, Academic Year) are functional
  - [ ] Multiple filters combine with AND logic; results update in <1 second
  - [ ] Filter state is persisted in URL for sharing and browser back/forward support
  - [ ] Opportunity cards display: title, company/provider, location, category, AI match %, deadline, key requirements
  - [ ] Pagination loads additional results without full page reload
  - [ ] Mobile-responsive grid adapts from 3 columns (desktop) to 1 column (mobile)
- **Priority**: Must Have
- **Success Criteria**: Average search-to-click time < 30 seconds; filter usage rate > 40%

#### FR-005: AI Matching Engine **[Must Have]**
- **Requirement**: The system shall calculate AI match scores (0-100%) between student profiles and opportunities using a weighted 12-dimension algorithm with explainable breakdowns and skill gap identification
- **Business Value**: Core platform differentiator that delivers personalized recommendations — drives engagement and application quality
- **User Story Reference**: US-02, US-25
- **Inputs**: Student profile data (skills, education, experience, preferences, etc.), opportunity requirements and attributes
- **Processing**: Extract features from both student profile and opportunity, calculate dimensional similarity scores, apply category-specific weights, generate composite match score, identify skill gaps, generate improvement recommendations
- **Outputs**: Match score (0-100%), dimension-by-dimension breakdown, matched skills list, gap skills list, improvement recommendations
- **Business Rules**:
  - **Rule 1**: Minimum profile completion of 60% required for matching to run
  - **Rule 2**: Match scores are recalculated when student profile or opportunity requirements are updated
  - **Rule 3**: Dimension weights vary by opportunity category (e.g., Technical Skills weighted higher for tech internships)
  - **Rule 4**: Students below 50% match are not recommended the opportunity unless explicitly searching
  - **Rule 5**: Top 20 matched students are notified when a new opportunity matching their profile is posted
- **Acceptance Criteria**:
  - [ ] Match scores calculate within 2 seconds per student-opportunity pair
  - [ ] Batch matching for new opportunities (1000 students) completes within 30 seconds
  - [ ] Each match score includes breakdown showing contribution of all 12 dimensions
  - [ ] Skill gap analysis correctly identifies skills required but not present on student profile
  - [ ] Improvement recommendations are specific and actionable (not generic)
  - [ ] Match scores correlate with application success rates (measured over time)
  - [ ] Students with >80% match receive push notification for new matching opportunities
- **Priority**: Must Have
- **Success Criteria**: >85% student satisfaction with match relevance; match score positively correlates (r > 0.5) with application outcomes after 6 months

#### FR-006: Global Employability Score System **[Must Have]**
- **Requirement**: The system shall calculate and display a Global Employability Score (0-100) for each student across 12 dimensions, with visual breakdown, historical tracking, and improvement recommendations
- **Business Value**: Creates measurable career readiness benchmark that drives student engagement (gamification) and provides employers a standardized assessment metric
- **User Story Reference**: US-03
- **Inputs**: Student profile data across all sections (education, skills, experience, certifications, portfolio, languages, international exposure, etc.)
- **Processing**: Calculate individual dimension scores based on defined rubrics, apply dimension weights for composite score, determine percentile ranking, generate dimension-specific improvement recommendations
- **Outputs**: Composite GX Score (0-100), 12 individual dimension scores, grade bracket, radar/radial visualization data, improvement recommendations, historical score data points
- **Business Rules**:
  - **Rule 1**: Score recalculates within 5 minutes of any profile update
  - **Rule 2**: Dimension scoring rubrics are standardized and documented (not arbitrary)
  - **Rule 3**: Score cannot decrease by more than 5 points from a single profile edit (prevents gaming penalties)
  - **Rule 4**: Peer comparison shows anonymous percentile without revealing other students' identities
  - **Rule 5**: Grade brackets: Exceptional (90-100), Strong (75-89), Developing (50-74), Emerging (25-49), Beginner (0-24)
- **Acceptance Criteria**:
  - [ ] Score displays on student dashboard and profile page with radial visualization
  - [ ] All 12 dimensions (Academic Readiness, Technical Skills, Communication, Leadership, Project Experience, Internship Experience, International Exposure, Certifications, Portfolio Quality, Interview Readiness, Languages, Industry Skills) have individual scores
  - [ ] Score history chart shows progression over time (minimum monthly data points)
  - [ ] Each dimension has 3+ specific improvement recommendations
  - [ ] Score calculation is deterministic — same profile produces same score every time
  - [ ] Radar chart visualization renders correctly across all screen sizes
  - [ ] Peer percentile ranking updates daily
- **Priority**: Must Have
- **Success Criteria**: 70%+ of students take at least one action to improve their score within 30 days of first viewing

#### FR-007: Application Lifecycle Management **[Must Have]**
- **Requirement**: The system shall manage the complete application lifecycle through 7 stages (Draft → Submitted → Under Review → Shortlisted → Assessment → Interview → Selected/Rejected) with notifications, document management, and tracking for all parties
- **Business Value**: Provides transparent, organized application process that increases completion rates and reduces time-to-placement
- **User Story Reference**: US-05, US-06, US-10
- **Inputs**: Application submissions from students, status updates from opportunity owners, uploaded documents, interview scheduling data
- **Processing**: Create application record linking student profile to opportunity, manage state machine transitions, trigger notifications on status changes, enforce business rules on transitions, aggregate analytics
- **Outputs**: Application status updates, email/push notifications, application timeline view, analytics for opportunity owners
- **Business Rules**:
  - **Rule 1**: Application requires minimum 60% profile completion to submit
  - **Rule 2**: Status transitions must follow defined pipeline order (cannot skip stages except rejection)
  - **Rule 3**: Rejection is possible from any stage; must include reason category
  - **Rule 4**: Student can withdraw application at any stage before "Selected"
  - **Rule 5**: Opportunity owners can add internal notes visible only to other reviewers
  - **Rule 6**: Deadline enforcement: applications cannot be submitted after opportunity deadline
- **Acceptance Criteria**:
  - [ ] Student can apply to opportunity with pre-filled profile data in <60 seconds
  - [ ] Application status is visible to student in real-time with timeline showing all transitions
  - [ ] Opportunity owner can advance/reject applications with one click + optional notes
  - [ ] Notifications are sent within 60 seconds of status change (email + in-app)
  - [ ] Student receives application confirmation email immediately upon submission
  - [ ] Draft applications are saved and accessible from dashboard
  - [ ] Withdrawal process requires confirmation and notifies opportunity owner
  - [ ] Application count and status aggregation display correctly on opportunity owner's dashboard
- **Priority**: Must Have
- **Success Criteria**: 90%+ of status changes trigger notifications within 60 seconds; application submission rate > 30% of opportunity views

#### FR-008: GX Career Copilot AI Assistant **[Should Have]**
- **Requirement**: The system shall provide a floating AI assistant accessible throughout the student platform that delivers personalized career guidance based on the student's profile, current context, and conversation history
- **Business Value**: Differentiator providing 24/7 personalized career coaching at scale — reduces support costs and increases student engagement and outcomes
- **User Story Reference**: US-15, US-17, US-26
- **Inputs**: Student messages, current page context, student profile data, opportunity data, conversation history
- **Processing**: Contextualize query with student profile and current platform state, generate personalized response using LLM with platform knowledge, provide actionable recommendations with links to relevant platform features
- **Outputs**: Conversational responses with embedded recommendations, links, and actionable steps
- **Business Rules**:
  - **Rule 1**: Copilot has read-only access to student's profile — cannot modify profile data directly
  - **Rule 2**: Responses must be grounded in platform data — no hallucinated opportunities or fake statistics
  - **Rule 3**: Copilot remembers context within a session but resets between sessions (no long-term memory beyond profile)
  - **Rule 4**: Sensitive topics (visa legal advice, financial advice) include appropriate disclaimers
  - **Rule 5**: Rate limit: maximum 50 messages per student per day
- **Acceptance Criteria**:
  - [ ] Floating chat widget is accessible from every page of the student platform
  - [ ] Copilot responds within 3 seconds for standard queries
  - [ ] Responses reference specific student profile data (e.g., "Based on your Python Advanced skill...")
  - [ ] Opportunity recommendations from Copilot link to actual platform opportunities
  - [ ] Profile improvement suggestions are specific and actionable
  - [ ] Interview prep provides relevant practice questions based on opportunity type
  - [ ] Suggested prompts appear for new/inactive users
  - [ ] Conversation persists within session across page navigations
- **Priority**: Should Have
- **Success Criteria**: 40%+ of active students interact with Copilot weekly; Copilot-recommended actions have 25%+ completion rate

#### FR-009: Employer Talent Search & Discovery **[Must Have]**
- **Requirement**: The system shall provide employers with advanced search and filtering capabilities to discover qualified student candidates based on skills, GX score, location, mobility readiness, languages, and other dimensions
- **Business Value**: Key B2B value proposition — employers pay for access to pre-qualified, scored global talent pool
- **User Story Reference**: US-09, US-27
- **Inputs**: Employer search queries, filter selections, saved search preferences
- **Processing**: Execute search against student profiles respecting privacy settings, rank by relevance/GX score, apply filters, present anonymized or full profiles based on subscription level
- **Outputs**: Ranked list of matching student profiles with key data, GX scores, and match indicators
- **Business Rules**:
  - **Rule 1**: Only students with profile visibility set to "Public" or "Employer-only" appear in search results
  - **Rule 2**: Student contact information is hidden until student explicitly responds to employer interest
  - **Rule 3**: GX Score minimum filter is available (e.g., "Only show students with GX Score > 70")
  - **Rule 4**: Employer search history and saved candidates are tracked for analytics
- **Acceptance Criteria**:
  - [ ] Search returns results within 1 second for standard queries
  - [ ] Filters include: Skills, GX Score range, Location, Mobility Readiness, Languages, University, Degree, Graduation Year, Experience Level, Availability
  - [ ] Student privacy preferences are respected — private profiles never appear
  - [ ] Employer can save candidates to shortlists for specific roles
  - [ ] AI-recommended candidates are shown for employer's posted opportunities
- **Priority**: Must Have
- **Success Criteria**: Employers find 5+ relevant candidates per search; 60%+ of shortlisted students respond to employer interest

#### FR-010: University Institutional Dashboard **[Must Have]**
- **Requirement**: The system shall provide university administrators with a comprehensive dashboard showing student onboarding status, application activities, placement outcomes, and institutional analytics
- **Business Value**: Core B2B product for university subscribers — provides visibility and reporting that justifies subscription cost
- **User Story Reference**: US-07, US-19
- **Inputs**: Institutional student data, application statuses, placement outcomes, program enrollments
- **Processing**: Aggregate student data by institution, calculate institutional metrics, generate reports, track cohort progression
- **Outputs**: Dashboard visualizations, student management tables, exportable reports, alert notifications
- **Business Rules**:
  - **Rule 1**: University admin can only view students who have opted-in to institutional visibility or were invited by that university
  - **Rule 2**: Student-level data respects individual privacy settings
  - **Rule 3**: Institutional reports aggregate data — no PII in summary views unless explicitly drilled down
  - **Rule 4**: Bulk student invitation via CSV or institutional email domain matching
- **Acceptance Criteria**:
  - [ ] Dashboard shows: total students, active profiles, application counts, placement rates, GX score distribution
  - [ ] Student management table with search, filter, and bulk actions
  - [ ] CSV/Excel export of student data (respecting privacy settings)
  - [ ] Program management: create, edit, publish institutional programs
  - [ ] Cohort tracking by academic year, department, or program
  - [ ] Executive summary report generation suitable for leadership presentations
- **Priority**: Must Have
- **Success Criteria**: University admins log in at least weekly; report generation time < 10 seconds

### 6.2 User Interface Requirements

#### UI-001: Landing Page / Marketing Homepage
- **Description**: Premium marketing homepage that communicates the GlobalXcelerate value proposition and drives signups across all user roles
- **User Interactions**:
  - Scroll through content sections with smooth parallax/scroll animations
  - Hover on opportunity category cards for expanded preview
  - Click "Get Started Free" / "Sign Up" CTAs
  - Navigate to role-specific sections (For Universities / For Employers)
  - View animated global network/world map visualization
- **Layout Requirements**:
  - Hero section: Full-width with gradient background, animated globe/network, headline, tagline, dual CTA buttons
  - Opportunity Categories: Grid of 7 cards with icons, titles, and opportunity counts
  - AI Matching Preview: Split layout showing student profile + opportunity with 91% match visualization
  - GX Score Preview: Radial progress visualization showing 78/100 with dimension labels
  - University Section: Logo carousel + testimonials + features list
  - Employer Section: Featured company logos + value proposition + features
  - Global Experiences: Image gallery of destinations with country labels
  - Final CTA: Full-width gradient section with "Start Your Global Journey" and signup buttons
- **Responsive Behavior**: Desktop (1440px+) full layout; Tablet (768px-1439px) stacked sections with reduced animations; Mobile (320px-767px) single-column with optimized imagery
- **Accessibility Requirements**: WCAG 2.1 AA, aria-labels on all interactive elements, sufficient color contrast (4.5:1), keyboard-navigable CTAs, alt text on all images
- **Visual Design Notes**: Navy/midnight blue (#0F172A) primary, electric blue/cyan (#06B6D4) accents, white backgrounds (#FFFFFF), soft shadows (box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)), rounded corners (8px-16px), Inter/Satoshi typography

#### UI-002: Student Dashboard
- **Description**: Personalized command center showing metrics, recommendations, and quick actions for the authenticated student
- **User Interactions**:
  - View personalized greeting and profile completion percentage
  - Interact with GX Score gauge (click for detail)
  - Click opportunity recommendation cards (navigate to detail)
  - View and manage application statuses
  - Access quick actions (complete profile, explore opportunities, improve score)
  - Dismiss notifications from feed
- **Layout Requirements**:
  - Top bar: Greeting, notification bell, profile avatar, GX Score badge
  - Left column (70%): Recommended Opportunities (horizontal scroll cards), My Applications (status summary + recent), Upcoming Deadlines (calendar widget)
  - Right column (30%): Profile Completion (circular progress), GX Score (radial gauge), Skills to Improve (list), Quick Actions (buttons)
  - Bottom section: Saved Opportunities, Upcoming Programs
- **Responsive Behavior**: Desktop (side-by-side columns); Tablet (stacked, 2-column grid for widgets); Mobile (single column, collapsible sections)
- **Accessibility Requirements**: Dashboard widgets have ARIA landmark roles, score visualizations have text equivalents, all cards are keyboard-focusable

#### UI-003: Opportunity Marketplace
- **Description**: Browse and search interface for discovering opportunities across all categories with filtering
- **User Interactions**:
  - Toggle between opportunity categories (tab/chip navigation)
  - Type in search bar with instant results
  - Open/close filter panel (left sidebar on desktop, bottom sheet on mobile)
  - Select/deselect filter options
  - Click opportunity cards to navigate to detail
  - Sort results dropdown
  - Paginate through results (infinite scroll or pagination)
- **Layout Requirements**:
  - Top: Category tabs/chips + search bar
  - Left sidebar (desktop): Filter panel with collapsible sections
  - Main content: Responsive card grid (3-col desktop, 2-col tablet, 1-col mobile)
  - Cards: Company logo, title, location, category badge, deadline, match %, key requirements (tags), Save icon
- **Responsive Behavior**: Filter panel becomes full-screen overlay/bottom sheet on mobile; cards stack single-column; search becomes expandable on mobile
- **Accessibility Requirements**: Filter selections announced by screen readers, search results count announced on update, opportunity cards have descriptive aria-labels

### 6.3 Data Requirements

#### DR-001: Student Profile
- **Description**: Comprehensive student identity and professional data forming the basis of the global profile

  | Field Name | Data Type | Required | Validation Rules | Notes |
  |------------|-----------|----------|------------------|-------|
  | `id` | UUID | Yes | Auto-generated | Primary key |
  | `user_id` | UUID | Yes | Foreign key to auth.users | Links to Supabase auth |
  | `first_name` | VARCHAR(100) | Yes | 2-100 chars, letters only | |
  | `last_name` | VARCHAR(100) | Yes | 2-100 chars, letters only | |
  | `email` | VARCHAR(255) | Yes | Valid email format | From auth |
  | `phone` | VARCHAR(20) | No | International format | |
  | `date_of_birth` | DATE | Yes | Age 16-50 | Privacy-sensitive |
  | `nationality` | VARCHAR(100) | Yes | From country list | |
  | `current_country` | VARCHAR(100) | Yes | From country list | |
  | `current_city` | VARCHAR(100) | No | Free text | |
  | `profile_photo_url` | TEXT | No | Valid URL or storage path | Supabase Storage |
  | `bio` | TEXT | No | Max 1000 chars | |
  | `username` | VARCHAR(50) | Yes | Unique, alphanumeric + hyphens | For public URL |
  | `profile_completion` | INTEGER | Yes | 0-100 | Calculated field |
  | `gx_score` | DECIMAL(5,2) | No | 0-100 | Calculated field |
  | `open_to_opportunities` | BOOLEAN | Yes | Default true | |
  | `visibility` | ENUM | Yes | 'public','private','employer_only' | Privacy control |
  | `onboarding_step` | INTEGER | Yes | 1-8 | Track onboarding progress |
  | `created_at` | TIMESTAMPTZ | Yes | Auto-generated | |
  | `updated_at` | TIMESTAMPTZ | Yes | Auto-updated | |

- **Data Relationships**: Has many: educations, skills, experiences, applications, saved_opportunities. Belongs to: auth.users. Has one: career_preferences, global_preferences
- **Data Volume**: Expected 50,000-200,000 profiles in Year 1; 1M+ in Year 3
- **Data Retention**: Active profiles retained indefinitely; inactive (no login 2+ years) marked dormant; deleted on request within 30 days (GDPR)
- **Data Privacy**: PII fields (DOB, phone, email) encrypted at rest; profile visibility controls enforce data access; right to export and delete

#### DR-002: Opportunities
- **Description**: Listings posted by employers, universities, and program providers across 7 categories

  | Field Name | Data Type | Required | Validation Rules | Notes |
  |------------|-----------|----------|------------------|-------|
  | `id` | UUID | Yes | Auto-generated | Primary key |
  | `posted_by` | UUID | Yes | FK to users | Opportunity owner |
  | `organization_id` | UUID | Yes | FK to organizations | Company/university |
  | `title` | VARCHAR(200) | Yes | 5-200 chars | |
  | `category` | ENUM | Yes | 7 categories | Internship, Immersion, Exchange, etc. |
  | `description` | TEXT | Yes | 100-10000 chars | Rich text (HTML) |
  | `requirements` | JSONB | Yes | Structured requirements | Skills, GPA, year, etc. |
  | `location_country` | VARCHAR(100) | Yes | From country list | |
  | `location_city` | VARCHAR(100) | No | Free text | |
  | `work_mode` | ENUM | Yes | 'remote','hybrid','onsite' | |
  | `duration` | VARCHAR(100) | No | Free text | e.g., "3 months" |
  | `compensation_type` | ENUM | No | 'paid','unpaid','stipend' | |
  | `compensation_amount` | DECIMAL(10,2) | No | ≥0 | |
  | `compensation_currency` | VARCHAR(3) | No | ISO 4217 | |
  | `visa_support` | BOOLEAN | No | Default false | |
  | `start_date` | DATE | No | Future date | |
  | `deadline` | TIMESTAMPTZ | Yes | Future date | Application deadline |
  | `status` | ENUM | Yes | 'draft','active','closed','archived' | |
  | `max_applications` | INTEGER | No | ≥1 | |
  | `created_at` | TIMESTAMPTZ | Yes | Auto-generated | |
  | `updated_at` | TIMESTAMPTZ | Yes | Auto-updated | |

- **Data Relationships**: Belongs to: organizations, users (posted_by). Has many: applications, saved_by_students. Has many: required_skills (through junction table)
- **Data Volume**: Expected 5,000-20,000 active opportunities at any time in Year 1
- **Data Retention**: Active opportunities until deadline + 30 days; then archived; archived data retained for 3 years for analytics
- **Data Privacy**: Opportunity data is public (no PII); organization contact details visible only to applicants

#### DR-003: Applications
- **Description**: Student applications linking profiles to opportunities with lifecycle tracking

  | Field Name | Data Type | Required | Validation Rules | Notes |
  |------------|-----------|----------|------------------|-------|
  | `id` | UUID | Yes | Auto-generated | Primary key |
  | `student_id` | UUID | Yes | FK to student_profiles | Applicant |
  | `opportunity_id` | UUID | Yes | FK to opportunities | Target opportunity |
  | `status` | ENUM | Yes | 7 stages | Draft, Submitted, Under Review, Shortlisted, Assessment, Interview, Selected, Rejected |
  | `cover_letter` | TEXT | No | Max 5000 chars | |
  | `additional_documents` | JSONB | No | Array of file URLs | Supabase Storage |
  | `match_score` | DECIMAL(5,2) | No | 0-100 | At time of application |
  | `submitted_at` | TIMESTAMPTZ | No | Auto on submit | |
  | `reviewer_notes` | TEXT | No | Internal only | Not visible to student |
  | `rejection_reason` | VARCHAR(200) | No | Required on rejection | Category-based |
  | `status_history` | JSONB | Yes | Array of status changes | Timestamp + status + actor |
  | `created_at` | TIMESTAMPTZ | Yes | Auto-generated | |
  | `updated_at` | TIMESTAMPTZ | Yes | Auto-updated | |

- **Data Relationships**: Belongs to: student_profiles, opportunities. Has many: status_history_entries (embedded JSONB)
- **Data Volume**: Expected 100,000-500,000 applications in Year 1
- **Data Retention**: Active applications retained for lifecycle; completed/rejected archived after 1 year; student can delete their applications at any time
- **Data Privacy**: Application data visible to: student (own), opportunity owner (all for their opportunity), platform admin (all); reviewer notes never visible to student

### 6.4 Integration Requirements

#### INT-001: Supabase Authentication
- **Description**: Integration with Supabase Auth for multi-provider user authentication and session management
- **Integration Type**: Native SDK (supabase-js)
- **Data Flow**: Bidirectional — signup/login requests flow to Supabase; session tokens and user data flow back
- **Data Exchanged**: User credentials, OAuth tokens, JWT sessions, user metadata, email verification status
- **Frequency**: Every auth event (signup, login, token refresh, logout)
- **Authentication**: Supabase project API keys (anon key for client, service key for server)
- **Error Handling**: Retry with exponential backoff for network errors; display user-friendly messages for auth failures; fallback to email if social provider is unavailable
- **Fallback Strategy**: Email/password always available as baseline auth; if Supabase is unreachable, show maintenance page with status check

#### INT-002: Supabase Database (PostgreSQL)
- **Description**: Primary data store for all platform entities using Supabase's managed PostgreSQL with Row Level Security
- **Integration Type**: Native SDK + REST API (PostgREST)
- **Data Flow**: Bidirectional — CRUD operations from application; real-time subscriptions for live updates
- **Data Exchanged**: All platform entities (profiles, opportunities, applications, organizations, etc.)
- **Frequency**: Continuous — every user interaction triggers database operations
- **Authentication**: JWT-based with RLS policies enforcing per-user data access
- **Error Handling**: Transaction-level error handling; retry on transient failures; connection pooling for performance
- **Fallback Strategy**: Read replicas for query failover; cached data for read-heavy operations

#### INT-003: Supabase Storage
- **Description**: File storage for profile photos, portfolio items, documents, and application attachments
- **Integration Type**: Native SDK (Supabase Storage API)
- **Data Flow**: Upload from client → Storage bucket; download URLs served to client
- **Data Exchanged**: Images (profile photos, portfolio), PDFs (resumes, certificates, documents), videos (portfolio)
- **Frequency**: Per file upload/download event (estimated 10,000+ uploads/day at scale)
- **Authentication**: Signed URLs with expiration; bucket-level policies for public vs. authenticated access
- **Error Handling**: Client-side retry on upload failure; file size validation before upload (max 10MB images, 25MB documents); format validation
- **Fallback Strategy**: Optimistic UI with local preview before upload confirmation; queued retry for failed uploads

#### INT-004: AI/LLM Service (for Copilot & Matching)
- **Description**: Integration with AI language model service for the GX Career Copilot conversational AI and intelligent matching explanations
- **Integration Type**: REST API (OpenAI-compatible or similar)
- **Data Flow**: Outbound — user queries + profile context sent to AI; inbound — AI responses returned
- **Data Exchanged**: Student profile context, conversation history, opportunity data, AI-generated responses and recommendations
- **Frequency**: Per Copilot interaction (estimated 5,000-20,000 messages/day at scale)
- **Authentication**: API key stored in environment variables; server-side proxy (never exposed client-side)
- **Error Handling**: Timeout after 10 seconds; graceful fallback message ("I'm having trouble responding. Please try again."); rate limiting per user
- **Fallback Strategy**: Pre-defined response templates for common queries if AI service is unavailable; queue requests for retry

### 6.5 Business Rules

1. **BR-001: Profile Completion Threshold for Matching**
   - **Rule**: AI matching and opportunity recommendations are only activated when student profile completion reaches 60% or higher
   - **Conditions**: Student has completed fewer than 60% of weighted profile fields
   - **Actions**: Show "Complete your profile to unlock AI matching" prompt; display generic popular opportunities without personalized scores
   - **Exceptions**: Students can still browse marketplace and view opportunities without match scores
   - **Example**: Student completes Identity + Education only (40%) → sees marketplace without match scores; adds Skills + Experience (reaches 65%) → AI matching activates and scores appear

2. **BR-002: Application Submission Requirements**
   - **Rule**: Students must have minimum 60% profile completion and the opportunity must be active with a future deadline to submit an application
   - **Conditions**: Profile completion < 60%, OR opportunity status ≠ 'active', OR current time > opportunity deadline
   - **Actions**: Display specific error message explaining what's blocking submission; for profile completion, show exactly which steps to complete; for expired deadlines, suggest similar active opportunities
   - **Exceptions**: Draft applications can be created regardless of profile completion (saves progress)
   - **Example**: Student with 55% profile tries to apply → system shows "Complete your Skills section to reach 60% and unlock applications" with direct link to skills step

3. **BR-003: Application Status Transition Rules**
   - **Rule**: Application status transitions must follow the defined pipeline order; only backward-compatible transitions (rejection) are allowed from any stage
   - **Conditions**: Status change request violates pipeline order (e.g., Draft → Interview without going through intermediate stages)
   - **Actions**: Reject invalid transition; log attempted invalid transitions for admin review
   - **Exceptions**: Rejection can occur from any stage; withdrawal by student can occur from any stage before "Selected"
   - **Example**: Valid: Submitted → Under Review → Shortlisted → Interview → Selected. Invalid: Submitted → Selected (skipping stages). Valid exception: Under Review → Rejected

4. **BR-004: Opportunity Visibility & Expiration**
   - **Rule**: Only approved, active opportunities with future deadlines appear in the marketplace; expired opportunities are automatically archived
   - **Conditions**: Opportunity status is 'draft' or 'closed', OR deadline has passed, OR admin has not approved
   - **Actions**: Hide from marketplace search results; notify opportunity owner of expiration; archive automatically 30 days after deadline
   - **Exceptions**: Opportunity owners can still view their own draft/expired listings in their management panel
   - **Example**: Opportunity deadline was yesterday → automatically moves to 'closed' status → removed from search results → owner notified → archived after 30 days

5. **BR-005: Data Privacy & Visibility Controls**
   - **Rule**: Student data visibility respects per-section privacy settings; "Private" sections are never shown to any external party; "Employer-only" sections visible only to authenticated employer accounts
   - **Conditions**: External entity (employer, program provider, public visitor) requests student profile data
   - **Actions**: Filter response to include only sections matching or exceeding the requester's access level
   - **Exceptions**: Platform admins can view all data regardless of privacy settings (for moderation/support); student always sees their own complete profile
   - **Example**: Student sets Portfolio to "Employer-only" and Education to "Public" → Public profile URL shows Education but not Portfolio → Authenticated employer viewing same profile sees both

6. **BR-006: GX Score Calculation Integrity**
   - **Rule**: Global Employability Score is calculated deterministically from profile data using standardized rubrics; the same profile data must always produce the same score
   - **Conditions**: Profile data changes (addition, modification, deletion of any scored field)
   - **Actions**: Recalculate affected dimension scores and composite GX Score within 5 minutes; log score change in history
   - **Exceptions**: Score cannot decrease by more than 5 points from a single edit (anti-gaming protection); manual admin override available for special cases
   - **Example**: Student adds AWS certification → Certifications dimension increases from 45 to 62 → composite GX Score increases from 72 to 75 → score history records new data point

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance Requirements

#### NFR-P-001: Response Time
- **Requirement**: The platform must deliver fast, responsive experiences across all user interactions
- **Details**:
  - **Page Load Time**: < 2 seconds for initial page load (LCP) on 4G connection; < 1 second for subsequent navigations (SPA routing)
  - **API Response Time**: < 500ms for 95th percentile of API requests; < 200ms for cached queries
  - **Database Query Time**: < 100ms for indexed queries; < 1 second for complex aggregate queries
  - **Search Results**: < 500ms for full-text search with filters across 100K+ opportunities
  - **AI Copilot Response**: < 3 seconds for initial response; streaming for longer responses
- **Measurement Method**: Vercel Analytics for frontend performance; Supabase Dashboard for database; custom instrumentation for API endpoints
- **Test Conditions**: Measured under normal load (1,000 concurrent users) with standard 4G network simulation

#### NFR-P-002: Throughput
- **Requirement**: The platform must handle expected user load with headroom for growth
- **Details**:
  - **Concurrent Users**: Support 5,000 concurrent users at launch; scalable to 25,000
  - **Transactions Per Second**: Handle 500 TPS for read operations; 100 TPS for write operations
  - **Peak Load**: Handle 3x normal load during peak hours (application deadlines, program launches) without degradation
- **Measurement Method**: Load testing with k6 or similar tool; production monitoring via Supabase metrics

#### NFR-P-003: Scalability
- **Requirement**: Platform architecture must support 10x growth without architectural changes
- **Details**:
  - **Horizontal Scaling**: Next.js deployed on Vercel with automatic scaling; Supabase scales compute independently
  - **Vertical Scaling**: Database can be upgraded to larger Supabase tiers without migration
  - **Data Volume**: Support 1M+ student profiles, 100K+ opportunities, 5M+ applications without performance degradation
  - **User Growth**: Architecture supports 500K MAU without redesign

### 7.2 Security Requirements

#### NFR-S-001: Authentication Security
- **Requirement**: All authentication mechanisms must meet industry security standards
- **Details**:
  - **Method**: Supabase Auth with JWT tokens (RS256 signing)
  - **Multi-factor Authentication**: Available for admin accounts (TOTP-based); optional for all users
  - **Session Management**: 7-day sliding window sessions; immediate invalidation on password change; concurrent session limit of 5 devices
  - **Password Policy**: Minimum 8 characters, at least one uppercase, one lowercase, one number; breach password detection

#### NFR-S-002: Authorization & Access Control
- **Requirement**: Role-based access control must be enforced at both application and database levels
- **Details**:
  - **Access Control Model**: RBAC with 6 roles (Student, Employer, University Admin, Program Provider, Mentor, Platform Admin)
  - **Roles & Permissions**: Defined per route and per database table; enforced via Supabase RLS policies
  - **Data-level Security**: Row Level Security on all tables; students see only their data; employers see only their opportunities and applications; university admins see only their institution's students

#### NFR-S-003: Data Protection
- **Requirement**: All sensitive data must be encrypted and protected according to compliance standards
- **Details**:
  - **Encryption in Transit**: TLS 1.3 for all connections (HTTPS enforced)
  - **Encryption at Rest**: AES-256 encryption for database (Supabase managed); encrypted storage buckets
  - **PII Handling**: Personal data (DOB, phone, address) stored in designated columns with additional access logging
  - **Data Masking**: Admin views show masked PII by default; unmasking requires explicit action with audit log

#### NFR-S-004: Compliance
- **Requirement**: Platform must comply with applicable data protection regulations
- **Standards**:
  - **GDPR**: Right to access, right to rectification, right to erasure, data portability, consent management, privacy-by-design
  - **CCPA**: California resident data rights, opt-out of data sale (platform does not sell data)
  - **FERPA**: Educational records protection for US university partnerships
  - **UAE PDPL**: Data localization considerations for UAE-based operations

### 7.3 Reliability & Availability

#### NFR-R-001: Uptime
- **Requirement**: Platform must maintain high availability for all user-facing services
- **Details**:
  - **SLA**: 99.9% uptime (approximately 8.76 hours maximum downtime per year)
  - **Downtime Allowance**: < 45 minutes per month unplanned; maintenance windows scheduled outside peak hours (2-5 AM UTC)
  - **Maintenance Windows**: Zero-downtime deployments via Vercel; database migrations during low-traffic windows

#### NFR-R-002: Fault Tolerance
- **Requirement**: System must gracefully handle component failures without complete service disruption
- **Details**:
  - **Redundancy**: Vercel edge network with global CDN; Supabase managed infrastructure with automatic failover
  - **Failover**: Database automatic failover within Supabase managed service; application auto-recovery on Vercel
  - **Geographic Distribution**: CDN edge caching for static assets; database in primary region with read replicas as needed

#### NFR-R-003: Disaster Recovery
- **Requirement**: System must be recoverable from catastrophic failures with minimal data loss
- **Details**:
  - **RTO (Recovery Time Objective)**: < 4 hours for full system recovery
  - **RPO (Recovery Point Objective)**: < 1 hour of data loss (point-in-time recovery)
  - **Backup Strategy**: Supabase daily backups with point-in-time recovery; application code in Git; storage bucket versioning enabled
  - **Recovery Procedures**: Documented runbooks for database restore, application redeployment, and DNS failover

### 7.4 Usability & Accessibility

#### NFR-U-001: User Experience
- **Requirement**: Platform must be intuitive and efficient for all user roles without extensive training
- **Details**:
  - **Intuitiveness**: New student should complete onboarding without external help; task completion time for common actions < 30 seconds
  - **Consistency**: Unified design system applied across all roles and pages; consistent component behavior
  - **Feedback**: Loading states for all async operations; success/error toasts for all actions; progress indicators for multi-step processes
  - **Error Messages**: Specific, actionable error messages with suggested next steps (never generic "Something went wrong")

#### NFR-U-002: Accessibility
- **Requirement**: Platform must be accessible to users with disabilities per WCAG standards
- **Details**:
  - **WCAG Compliance**: Level AA compliance (WCAG 2.1)
  - **Screen Reader Support**: All interactive elements properly labeled; dynamic content changes announced; form validation errors linked to fields
  - **Keyboard Navigation**: Full keyboard accessibility for all features; visible focus indicators; skip navigation links
  - **Color Contrast**: Minimum 4.5:1 contrast ratio for text; 3:1 for large text and UI components
  - **Alternative Text**: Descriptive alt text for all meaningful images; decorative images marked as aria-hidden

#### NFR-U-003: Internationalization
- **Requirement**: Platform architecture must support future multi-language expansion
- **Details**:
  - **Languages Supported**: English (primary at launch); architecture ready for Arabic, French, Spanish, Mandarin
  - **Locale Support**: Date/time formatting, currency display, number formatting based on user locale
  - **Right-to-Left Support**: Architecture accommodates RTL layouts for future Arabic language support

### 7.5 Compatibility

#### NFR-C-001: Browser Compatibility
- **Requirement**: Platform must function correctly on modern browsers
- **Platforms**:
  - **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
  - **Mobile**: iOS Safari 14+, Chrome for Android 90+, Samsung Internet 15+
  - **Minimum Resolution**: 320px width (mobile) to 2560px (ultra-wide desktop)

#### NFR-C-002: Device Compatibility
- **Requirement**: Responsive design must provide optimal experience across device categories
- **Devices**:
  - **Desktop**: Full feature set, multi-column layouts, hover interactions
  - **Tablet**: Full feature set, adapted layouts, touch-optimized interactions
  - **Mobile**: Full feature set, single-column layouts, thumb-friendly interactions, bottom sheet patterns for filters

### 7.6 Maintainability

#### NFR-M-001: Code Quality
- **Requirement**: Codebase must be maintainable, well-documented, and consistently formatted
- **Details**:
  - **Code Coverage**: > 70% test coverage for critical business logic (matching engine, scoring, application lifecycle)
  - **Code Review**: All changes require at least one peer review before merge
  - **Documentation**: API endpoints documented with OpenAPI/Swagger; component documentation with Storybook or similar
  - **Linting**: ESLint + Prettier enforced on pre-commit; TypeScript strict mode enabled

#### NFR-M-002: Monitoring & Observability
- **Requirement**: Platform must provide comprehensive monitoring for proactive issue detection
- **Details**:
  - **Logging**: Structured JSON logging with correlation IDs; log levels: ERROR, WARN, INFO, DEBUG
  - **Metrics**: Page load times, API response times, error rates, auth success rates, matching engine latency
  - **Alerts**: PagerDuty/Slack alerts for: error rate > 5%, P95 latency > 5s, auth failure rate > 10%, service unavailability
  - **Tracing**: Request tracing from client through API to database for debugging

---

## 8. Implementation Decisions

### 8.1 Architectural Decisions

#### AD-001: Next.js Full-Stack Architecture
- **Decision**: Use Next.js as the full-stack framework handling both frontend rendering and API routes
- **Context**: Need a framework that supports SSR for SEO (landing page), client-side interactivity (dashboard), and API routes (backend logic) in a unified codebase
- **Options Considered**:
  - **Option 1**: Next.js (monolithic) — Single codebase for frontend + API routes
  - **Option 2**: Separate React frontend + Node.js backend — More separation but more infrastructure
  - **Option 3**: Next.js frontend + separate Python backend — Better for ML but adds complexity
- **Selected Option**: Option 1 — Next.js monolithic approach
- **Consequences**: Faster development velocity, simpler deployment (Vercel), unified TypeScript codebase; may need to extract services later if scaling demands it
- **Trade-offs**: Simpler architecture and faster time-to-market vs. potential need to decompose services at very high scale

#### AD-002: Supabase as Backend-as-a-Service
- **Decision**: Use Supabase for authentication, database, storage, and real-time features
- **Context**: Need rapid development with managed infrastructure; team should focus on product logic, not infrastructure management
- **Options Considered**:
  - **Option 1**: Supabase (managed PostgreSQL + Auth + Storage + Realtime)
  - **Option 2**: Firebase (NoSQL, Google ecosystem)
  - **Option 3**: Self-hosted PostgreSQL + custom auth + S3
- **Selected Option**: Option 1 — Supabase
- **Consequences**: Relational data model (PostgreSQL) suits complex relationships between students/opportunities/applications; Row Level Security for data isolation; managed scaling; real-time subscriptions for live updates
- **Trade-offs**: Vendor dependency on Supabase vs. full control of self-hosted; PostgreSQL portability mitigates lock-in risk

#### AD-003: Server-Side AI Integration
- **Decision**: AI services (matching engine, Copilot) are called exclusively from server-side (API routes/server components), never from client
- **Context**: AI API keys must not be exposed to browsers; server-side allows request aggregation, caching, and rate limiting
- **Options Considered**:
  - **Option 1**: Server-side only (API routes proxy all AI calls)
  - **Option 2**: Direct client-side calls with restricted API keys
  - **Option 3**: Edge functions for AI calls
- **Selected Option**: Option 1 — Server-side API routes
- **Consequences**: Better security, easier rate limiting and cost control, ability to cache responses; slight latency addition from extra hop
- **Trade-offs**: Additional server load for proxying vs. security and cost control benefits

### 8.2 Technology Stack Decisions

| Component | Technology | Version | Rationale |
|-----------|------------|---------|-----------|
| Frontend Framework | Next.js | 14+ (App Router) | SSR, API routes, file-based routing, React Server Components |
| UI Library | React | 18+ | Component-based UI, server components support |
| Language | TypeScript | 5+ | Type safety, better DX, fewer runtime errors |
| Styling | Tailwind CSS | 3+ | Utility-first, design system consistency, performance |
| UI Components | shadcn/ui | Latest | Accessible, customizable, Tailwind-native components |
| Database | PostgreSQL (Supabase) | 15+ | Relational data model, JSONB support, RLS, full-text search |
| Authentication | Supabase Auth | Latest | Multi-provider OAuth, JWT sessions, magic links |
| File Storage | Supabase Storage | Latest | S3-compatible, integrated auth, CDN delivery |
| Real-time | Supabase Realtime | Latest | WebSocket subscriptions for live updates |
| Hosting | Vercel | Latest | Edge network, auto-scaling, Next.js optimized |
| AI/LLM | OpenAI API (or similar) | Latest | GPT-4 class model for Copilot and matching explanations |
| Charts/Visualization | Recharts or Chart.js | Latest | Responsive charts for GX Score, analytics |
| Form Management | React Hook Form + Zod | Latest | Performant forms with schema validation |
| State Management | React Context + Server State (SWR/React Query) | Latest | Minimal client state; server as source of truth |

### 8.3 Modules & Components

#### Module 1: Authentication & Authorization
- **Purpose**: Manage user identity, session lifecycle, and access control
- **Responsibilities**: Multi-provider auth flows, session management, role assignment, RLS policy enforcement, password reset, email verification
- **Interfaces**: Supabase Auth SDK, auth middleware, protected route wrappers
- **Dependencies**: Supabase Auth, Next.js middleware

#### Module 2: Student Profile & Onboarding
- **Purpose**: Capture, store, and manage comprehensive student profile data
- **Responsibilities**: 8-step onboarding wizard, profile CRUD operations, profile completion calculation, public profile rendering, resume export
- **Interfaces**: Profile API routes, onboarding UI components, public profile pages
- **Dependencies**: Auth module, Supabase Database, Supabase Storage (photos/documents)

#### Module 3: Opportunity Marketplace
- **Purpose**: Enable discovery, search, and browsing of opportunities across all categories
- **Responsibilities**: Opportunity CRUD, full-text search, filtering, categorization, detail pages, save/share functionality
- **Interfaces**: Marketplace API routes, search endpoint, filter components, opportunity cards
- **Dependencies**: Auth module, Database, AI Matching module (for scores)

#### Module 4: AI Matching Engine
- **Purpose**: Calculate compatibility scores between students and opportunities
- **Responsibilities**: 12-dimension matching algorithm, score calculation, batch matching, explainable breakdowns, skill gap analysis
- **Interfaces**: Matching API routes, score calculation functions, recommendation endpoints
- **Dependencies**: Student Profile module, Opportunity module, AI service (for explanations)

#### Module 5: Global Employability Score
- **Purpose**: Calculate, display, and track the GX Score across 12 dimensions
- **Responsibilities**: Score calculation rubrics, dimension scoring, composite score, history tracking, peer comparison, improvement recommendations
- **Interfaces**: Score API routes, score visualization components, history endpoint
- **Dependencies**: Student Profile module, Database

#### Module 6: Application Management
- **Purpose**: Manage the full application lifecycle from draft to selection
- **Responsibilities**: Application CRUD, status state machine, notification triggers, document management, timeline tracking
- **Interfaces**: Application API routes, status management endpoints, notification hooks
- **Dependencies**: Auth module, Student Profile, Opportunity module, Notification module

#### Module 7: GX Career Copilot
- **Purpose**: Provide AI-powered conversational career guidance
- **Responsibilities**: Context assembly, LLM interaction, response streaming, conversation management, suggestion generation
- **Interfaces**: Copilot API route (streaming), chat widget component, suggested prompts
- **Dependencies**: Student Profile module, AI service, Opportunity module

#### Module 8: Platform Administration
- **Purpose**: Enable platform team to manage users, content, and system health
- **Responsibilities**: User management, content moderation, analytics dashboards, system monitoring, approval workflows
- **Interfaces**: Admin API routes, admin dashboard pages, moderation queue
- **Dependencies**: All other modules (read access for management)

### 8.4 API Contracts

#### API Endpoint 1: Student Profile
- **Method & Path**: `GET /api/students/[id]`, `PUT /api/students/[id]`, `POST /api/students/onboarding`
- **Purpose**: Retrieve, update, and create student profile data through the onboarding process
- **Request Format**: JSON body with profile fields matching schema; multipart for file uploads
- **Response Format**: `{ data: StudentProfile, meta: { completion: number, gx_score: number } }`
- **Error Handling**: 400 (validation), 401 (unauthenticated), 403 (wrong role/not owner), 404 (not found), 500 (server error)

#### API Endpoint 2: Opportunity Marketplace
- **Method & Path**: `GET /api/opportunities`, `GET /api/opportunities/[id]`, `POST /api/opportunities`
- **Purpose**: Search/browse opportunities with filters; retrieve detail; create new listings
- **Request Format**: Query params for search/filter; JSON body for creation
- **Response Format**: `{ data: Opportunity[], meta: { total: number, page: number, per_page: number } }`
- **Error Handling**: 400 (invalid filters), 401 (unauthenticated for creation), 403 (wrong role), 404 (not found)

#### API Endpoint 3: AI Matching
- **Method & Path**: `GET /api/matching/opportunities` (for student), `GET /api/matching/candidates/[opportunity_id]` (for employer)
- **Purpose**: Get AI-matched opportunities for a student, or matched candidates for an opportunity
- **Request Format**: Query params for pagination and minimum score threshold
- **Response Format**: `{ data: { item: Opportunity|Student, match_score: number, breakdown: DimensionScore[], gaps: SkillGap[] }[] }`
- **Error Handling**: 400 (profile incomplete < 60%), 401 (unauthenticated), 503 (matching service unavailable)

#### API Endpoint 4: Applications
- **Method & Path**: `POST /api/applications`, `PUT /api/applications/[id]/status`, `GET /api/applications`
- **Purpose**: Submit applications, update status, list applications (filtered by role)
- **Request Format**: JSON body with opportunity_id and optional cover_letter/documents for submission; status + notes for update
- **Response Format**: `{ data: Application, meta: { status_history: StatusChange[] } }`
- **Error Handling**: 400 (invalid status transition, profile incomplete), 401, 403 (not application owner/opportunity owner), 409 (duplicate application)

#### API Endpoint 5: GX Career Copilot
- **Method & Path**: `POST /api/copilot/chat`
- **Purpose**: Send message to AI Copilot and receive streaming response
- **Request Format**: `{ message: string, context?: { page: string, opportunity_id?: string }, history: Message[] }`
- **Response Format**: Server-Sent Events (SSE) streaming text response with metadata
- **Error Handling**: 429 (rate limit: 50 messages/day), 401 (unauthenticated), 503 (AI service unavailable)

### 8.5 Database Schema Decisions

#### Entity 1: `student_profiles`
- **Purpose**: Core student identity and profile data
- **Key Fields**: id, user_id, first_name, last_name, username, profile_completion, gx_score, visibility, onboarding_step
- **Relationships**: FK to auth.users; referenced by educations, skills, experiences, applications
- **Indexes**: user_id (unique), username (unique), gx_score (for employer search ranking), profile_completion

#### Entity 2: `opportunities`
- **Purpose**: All opportunity listings across 7 categories
- **Key Fields**: id, posted_by, organization_id, title, category, status, deadline, location_country, work_mode
- **Relationships**: FK to users (posted_by), organizations; referenced by applications, opportunity_skills
- **Indexes**: category + status + deadline (marketplace queries), full-text index on title + description, location_country, status

#### Entity 3: `applications`
- **Purpose**: Student applications with full lifecycle tracking
- **Key Fields**: id, student_id, opportunity_id, status, match_score, submitted_at, status_history
- **Relationships**: FK to student_profiles, opportunities
- **Indexes**: student_id + status (student dashboard), opportunity_id + status (employer review), composite (student_id, opportunity_id) unique constraint

#### Entity 4: `student_skills`
- **Purpose**: Student skills with proficiency levels
- **Key Fields**: id, student_id, skill_name, proficiency_level, verified
- **Relationships**: FK to student_profiles
- **Indexes**: student_id, skill_name (for matching queries)

#### Entity 5: `organizations`
- **Purpose**: Employer companies, universities, and program providers
- **Key Fields**: id, name, type (employer/university/provider), logo_url, verified, description
- **Relationships**: Referenced by opportunities, user memberships
- **Indexes**: type, name, verified

#### Entity 6: `gx_score_history`
- **Purpose**: Track GX Score changes over time for each student
- **Key Fields**: id, student_id, total_score, dimension_scores (JSONB), calculated_at
- **Relationships**: FK to student_profiles
- **Indexes**: student_id + calculated_at (time-series queries)

---

## 9. Testing Strategy & Decisions

### 9.1 Testing Philosophy

**What Makes a Good Test**:
- Tests external behavior from the user's perspective, not implementation details
- Tests are independent and can run in any order without shared state
- Tests are fast and deterministic (no flaky tests from timing issues)
- Test names describe the business scenario being validated
- Failures produce clear, actionable messages indicating what broke and why

### 9.2 Testing Levels

#### 9.2.1 Unit Testing
- **Scope**: Individual functions, utility modules, business logic, React components
- **Coverage Target**: > 80% for business logic (matching algorithm, GX Score calculation, status transitions); > 60% for UI components
- **Modules to Test**:
  - AI Matching Engine: Score calculation accuracy, dimension weighting, edge cases
  - GX Score Calculator: Dimension scoring rubrics, composite calculation, boundary conditions
  - Application State Machine: Valid/invalid transitions, rejection from any stage, withdrawal rules
  - Form Validation: All Zod schemas, custom validators, edge cases
  - UI Components: Rendering, interaction handlers, conditional display logic

#### 9.2.2 Integration Testing
- **Scope**: API routes with database, authentication flows, multi-module interactions
- **Coverage Target**: All API endpoints tested with success and error cases
- **Modules to Test**:
  - Auth flows: Signup → role selection → onboarding (full flow with Supabase)
  - Application submission: Profile check → opportunity validation → application creation → notification
  - Matching integration: Profile update → score recalculation → recommendation refresh
  - RLS policies: Verify data isolation between roles (student can't see other student's data)

#### 9.2.3 End-to-End Testing
- **Scope**: Complete user journeys through the application
- **Coverage Target**: All critical user journeys from section 4.2
- **User Journeys to Test**:
  - Student: Signup → Onboarding → Dashboard → Browse Opportunities → Apply → Track Application
  - Employer: Login → Post Opportunity → Review Applications → Update Status → Select Candidate
  - University Admin: Login → Invite Students → View Dashboard → Generate Report
  - Cross-role: Employer posts opportunity → Student receives match notification → Student applies → Employer reviews

#### 9.2.4 Performance Testing
- **Scope**: System performance under realistic and peak load conditions
- **Test Scenarios**:
  - **Load Testing**: 1,000 concurrent users performing typical actions (browse, search, apply) — verify < 2s response times
  - **Stress Testing**: 5,000 concurrent users with 50% doing searches — identify breaking points
  - **Endurance Testing**: 500 concurrent users over 4 hours — identify memory leaks or degradation
- **Tools**: k6 for API load testing; Lighthouse for frontend performance; Supabase performance insights

#### 9.2.5 Security Testing
- **Scope**: Authentication bypass, authorization violations, data exposure
- **Test Types**:
  - **Authorization Testing**: Verify RLS policies block cross-role data access (automated)
  - **Input Validation**: SQL injection, XSS, CSRF on all form inputs (automated scan)
  - **API Security**: Rate limiting, authentication bypass attempts, invalid token handling
  - **Data Privacy**: Verify private profile sections are not leaked in API responses

### 9.3 Test Seams

**Seam 1: API Route Layer**
- **Location**: `/api/*` route handlers — boundary between client and server
- **Type**: Integration
- **Rationale**: All business logic passes through API routes; testing here validates auth, validation, and database operations together

**Seam 2: Matching Algorithm**
- **Location**: Matching engine utility functions — pure computation
- **Type**: Unit
- **Rationale**: Core business logic that must be deterministic and well-tested; input/output clearly defined

**Seam 3: Supabase RLS Policies**
- **Location**: Database row-level security policies
- **Type**: Integration
- **Rationale**: Security boundary that prevents unauthorized data access; must be tested with different role contexts

**Seam 4: User Interface Components**
- **Location**: React components in `/components/`
- **Type**: Unit (component testing)
- **Rationale**: UI correctness from user perspective; interaction handling; accessibility compliance

### 9.4 Test Data Strategy
- **Test Data Source**: Factory functions generating realistic fake data using Faker.js; seed scripts for local development; snapshot of anonymized production data for performance testing
- **Data Refresh Strategy**: Test database reset before each integration test suite; seed data recreated on each CI run
- **PII Handling**: All test data uses synthetic/fake PII; production data is anonymized before use in testing environments; no real student data in non-production environments

---

## 10. Assumptions & Constraints

### 10.1 Assumptions

1. **Assumption 1**: Students will be motivated to complete comprehensive profiles if they see immediate value (AI matching, GX Score)
   - **Impact if Wrong**: Low profile completion rates → poor matching quality → reduced platform value for all stakeholders
   - **Validation Method**: A/B test onboarding flows with different value messaging; track completion rates by cohort; implement gamification elements if completion drops below 70%

2. **Assumption 2**: Universities will subscribe if the platform demonstrably improves their international placement rates and reduces administrative burden
   - **Impact if Wrong**: Low B2B revenue; reduced student pipeline from institutional onboarding
   - **Validation Method**: Pilot with 5-10 universities in Phase 1; measure placement rate improvement and admin time reduction; gather NPS feedback

3. **Assumption 3**: Employers will post opportunities on the platform if they receive high-quality, pre-qualified candidate applications
   - **Impact if Wrong**: Insufficient opportunity supply → reduced student engagement → platform value diminishes
   - **Validation Method**: Seed marketplace with partner opportunities initially; measure employer satisfaction and re-posting rates; track application-to-hire conversion

4. **Assumption 4**: AI matching with 12 dimensions will produce meaningfully better recommendations than simple keyword matching
   - **Impact if Wrong**: Platform's core differentiator fails to deliver; matches are no better than competitors
   - **Validation Method**: Compare AI match scores with actual application outcomes (accept/reject); iterate on dimension weights based on data; user satisfaction surveys on match quality

5. **Assumption 5**: Supabase infrastructure is reliable and performant enough for a production B2B2C SaaS platform at scale
   - **Impact if Wrong**: Performance issues, downtime, or data loss affecting user trust and retention
   - **Validation Method**: Stress test Supabase instance during development; maintain migration readiness to self-hosted PostgreSQL if needed; monitor SLA compliance

### 10.2 Constraints

#### 10.2.1 Technical Constraints
- **Constraint 1**: Must use Next.js (App Router) and Supabase as the core technology stack
  - **Reason**: Organizational technology decision made prior to this PRD; team expertise aligned
  - **Workaround**: Leverage Next.js App Router features (RSC, streaming) and Supabase edge functions for any server-side processing needs

- **Constraint 2**: AI matching must work with deterministic scoring (not purely ML-based black box)
  - **Reason**: Regulatory requirement for explainable AI; users must understand why they received specific scores
  - **Workaround**: Use rule-based weighted scoring with AI-generated explanations; avoid opaque neural network scoring

- **Constraint 3**: All data must be stored in Supabase's managed PostgreSQL (no external databases)
  - **Reason**: Simplicity of architecture; single data layer; integrated RLS with auth
  - **Workaround**: Use PostgreSQL JSONB for semi-structured data; leverage materialized views for complex analytics

#### 10.2.2 Budget Constraints
- **Total Budget**: TBD (to be determined based on investor/stakeholder approval)
- **Budget Allocation**:
  - **Development**: Primary allocation (60-70%)
  - **Design**: UI/UX design system creation (10-15%)
  - **Infrastructure**: Supabase Pro plan, Vercel Pro, AI API costs (10-15%)
  - **Contingency**: 10-15% buffer for unexpected complexity

#### 10.2.3 Timeline Constraints
- **Project Duration**: Phase 1 (this PRD) targets 16-20 weeks for MVP launch
- **Hard Deadlines**: University academic calendar alignment — ideally launch before fall semester enrollment
- **Milestones**: Landing page (Week 4), Auth + Onboarding (Week 8), Marketplace + Matching (Week 12), Full MVP (Week 16-20)

#### 10.2.4 Resource Constraints
- **Team Size**: Small development team (estimated 3-5 developers)
- **Skill Availability**: Full-stack Next.js/React developers; Supabase/PostgreSQL experience; AI/ML integration capability needed
- **Third-party Dependencies**: Supabase service availability; AI API provider (OpenAI or equivalent) availability and pricing

#### 10.2.5 Regulatory Constraints
- **Regulations**: GDPR compliance for EU students; UAE data protection law (PDPL) for local operations; FERPA consideration for US university partnerships
- **Compliance Deadlines**: Must be compliant from launch day — no grace period for data protection

#### 10.2.6 Business Constraints
- **Business Rules**: Platform must support multi-tenant model (universities, employers) from Day 1; cannot launch student-facing features without at least 100 seeded opportunities
- **Operational Constraints**: Initial support handled by founding team; no dedicated support staff until ARR > $200K

---

## 11. Dependencies & Risks

### 11.1 Dependencies

| ID | Dependency | Description | Owner | Status | Due Date | Impact if Delayed | Mitigation |
|----|------------|-------------|-------|--------|----------|-------------------|------------|
| DEP-001 | Supabase Infrastructure | Production Supabase project with Auth, Database, Storage, Realtime configured | Platform Team | Pending | Week 1 | Blocks all development | Set up immediately; use local Supabase for development |
| DEP-002 | AI/LLM API Access | Access to GPT-4 or equivalent API for Copilot and matching explanations | Platform Team | Pending | Week 6 | Blocks AI features | Develop with mocked responses; switch to live API when ready |
| DEP-003 | Design System | Complete UI design system with component specifications, colors, typography | Design Team | Pending | Week 2 | Slows frontend development | Use shadcn/ui defaults + Tailwind; refine later |
| DEP-004 | University Partnerships | Initial 5-10 universities committed to pilot | Business Team | Pending | Week 12 | Limited student pipeline at launch | Seed platform with self-service signups; offer free trials |
| DEP-005 | Opportunity Content | Minimum 100 seeded opportunities across 7 categories | Content Team | Pending | Week 14 | Empty marketplace at launch | Partner with aggregator APIs; manual content creation; employer outreach |
| DEP-006 | Domain & Hosting Setup | globalxcelerate.ae domain, Vercel deployment, SSL certificates | DevOps | Pending | Week 1 | Blocks deployment | Use Vercel preview deployments for development |

### 11.2 Risks & Mitigation Strategies

| Risk ID | Risk Description | Impact | Probability | Risk Score | Mitigation Strategy | Contingency Plan | Owner |
|---------|------------------|--------|-------------|------------|---------------------|------------------|-------|
| RISK-001 | Low student profile completion rates (<60%) | High | Medium | 8 | Gamification, progress rewards, clear value messaging at each step | Reduce minimum required fields; simplify onboarding to 5 steps | Product |
| RISK-002 | AI matching produces low-relevance recommendations | High | Medium | 8 | Iterative algorithm tuning with user feedback; A/B test matching versions | Fall back to category + keyword matching; add manual curation | Engineering |
| RISK-003 | Insufficient opportunity supply at launch | High | High | 9 | Pre-launch employer outreach; partner with opportunity aggregators; seed content | Curate external opportunities with "Apply on External Site" links | Business |
| RISK-004 | Supabase performance issues at scale | Medium | Low | 4 | Load testing during development; monitor query performance; optimize indexes | Migrate to dedicated PostgreSQL if needed; use connection pooling | Engineering |
| RISK-005 | Data privacy/GDPR compliance gaps | High | Low | 6 | Privacy-by-design approach; legal review of data flows; consent management from Day 1 | Engage external compliance consultant; conduct privacy impact assessment | Legal/Compliance |
| RISK-006 | Competitor launches similar unified platform | Medium | Medium | 6 | Accelerate development timeline; focus on unique differentiators (GX Score, Copilot) | Differentiate on UX quality and specific market focus (UAE/MENA initially) | Strategy |
| RISK-007 | Team bandwidth insufficient for 16-week timeline | High | Medium | 8 | Strict MoSCoW prioritization; cut "Could Have" features early; avoid scope creep | Extend timeline to 20 weeks; hire contractor for specific modules | Project Manager |
| RISK-008 | AI API costs exceed budget at scale | Medium | Medium | 6 | Implement aggressive caching; batch API calls; set per-user rate limits | Switch to cheaper model (GPT-3.5); reduce Copilot to static responses | Engineering |

---

## 12. Timeline & Milestones

### 12.1 Project Phases

| Phase | Milestone | Duration | Start Date | Target Date | Status | Dependencies |
|-------|-----------|----------|------------|-------------|--------|--------------|
| Planning | PRD + Architecture Approval | 2 weeks | Week 1 | Week 2 | In Progress | None |
| Foundation | Project Setup + Auth + Landing | 4 weeks | Week 3 | Week 6 | Pending | DEP-001, DEP-003, DEP-006 |
| Core Features | Onboarding + Dashboard + Marketplace | 4 weeks | Week 7 | Week 10 | Pending | Foundation complete |
| Intelligence | AI Matching + GX Score + Copilot | 4 weeks | Week 11 | Week 14 | Pending | Core Features, DEP-002 |
| Completion | Applications + Admin + Polish | 4 weeks | Week 15 | Week 18 | Pending | Intelligence, DEP-005 |
| Launch | UAT + Bug Fixes + Production Deploy | 2 weeks | Week 19 | Week 20 | Pending | All features, DEP-004 |

### 12.2 Detailed Milestone Breakdown

#### Phase 1: Planning & Architecture (Weeks 1-2)
- **Week 1**: PRD finalization, architecture document, database schema design
- **Week 2**: Technical architecture approval, development environment setup, CI/CD pipeline, design system kickoff

#### Phase 2: Foundation (Weeks 3-6)
- **Week 3-4**: Next.js project scaffold, Supabase setup, authentication system (all 6 providers), role selection flow
- **Week 5-6**: Landing page development (all sections), responsive design, basic navigation structure, deployment pipeline to Vercel

#### Phase 3: Core Features (Weeks 7-10)
- **Week 7-8**: Student onboarding wizard (8 steps), profile data model, auto-save, progress tracking
- **Week 9-10**: Student dashboard, opportunity marketplace, search & filters, opportunity detail page

#### Phase 4: Intelligence (Weeks 11-14)
- **Week 11-12**: AI matching engine (12-dimension algorithm), score calculation, batch matching
- **Week 13**: Global Employability Score system (scoring rubrics, visualization, recommendations)
- **Week 14**: GX Career Copilot (chat interface, context assembly, LLM integration, streaming responses)

#### Phase 5: Completion (Weeks 15-18)
- **Week 15-16**: Application management system (full lifecycle, notifications, document handling)
- **Week 17**: Employer talent search, university dashboard, admin panel (basic)
- **Week 18**: Polish, performance optimization, accessibility audit, security hardening

#### Phase 6: Launch (Weeks 19-20)
- **Week 19**: UAT with pilot users, bug fixing, content seeding, final security review
- **Week 20**: Production deployment, monitoring setup, soft launch with pilot universities

---

## 13. Budget & Resources

### 13.1 Budget Breakdown

| Category | Item | Cost | Notes |
|----------|------|------|-------|
| **Development** | Full-stack development (3-5 developers × 20 weeks) | TBD | Primary cost center |
| | AI/ML integration specialist (part-time) | TBD | Matching engine + Copilot |
| **Design** | UX/UI design (design system + all screens) | TBD | Can use pre-built components to reduce |
| | Brand assets (illustrations, animations) | TBD | Landing page visuals |
| **Infrastructure** | Supabase Pro Plan (monthly) | ~$25-$599/mo | Scales with usage |
| | Vercel Pro (hosting + analytics) | ~$20-$150/mo | Includes team features |
| | AI API costs (OpenAI or equivalent) | ~$500-$2,000/mo | Based on usage; rate limited |
| | Domain + DNS | ~$50/year | globalxcelerate.ae |
| **Testing** | Testing tools (Playwright, k6) | Free-$200/mo | Open source + cloud runners |
| **Contingency** | Risk buffer (15%) | TBD | For scope changes, unexpected issues |
| **TOTAL** | | **TBD** | Subject to stakeholder approval |

### 13.2 Resource Allocation

| Role | FTE | Duration | Availability | Notes |
|------|-----|----------|--------------|-------|
| Product Owner / Founder | 1.0 | Full project | Weeks 1-20 | Vision, priorities, stakeholder management |
| Full-Stack Developer (Senior) | 1.0 | Full project | Weeks 1-20 | Architecture lead, critical features |
| Full-Stack Developer (Mid) | 1-2 | Core development | Weeks 3-18 | Feature development, testing |
| UI/UX Designer | 0.5 | Design phases | Weeks 1-6, 15-18 | Design system, screens, polish |
| AI/ML Engineer | 0.5 | Intelligence phase | Weeks 9-14 | Matching algorithm, Copilot integration |
| QA Engineer | 0.5 | Testing phases | Weeks 12-20 | Test planning, automation, UAT coordination |

---

## 14. Open Questions

| # | Question | Owner | Target Resolution Date | Status | Resolution |
|---|----------|-------|------------------------|--------|------------|
| 1 | Which AI/LLM provider will be used for the Career Copilot? (OpenAI, Anthropic, open-source?) | Engineering Lead | Week 4 | Open | |
| 2 | What is the specific GX Score rubric for each of the 12 dimensions? (scoring weights and thresholds) | Product Owner | Week 8 | Open | |
| 3 | Will the platform launch in UAE market first or globally? (impacts compliance requirements) | Founder | Week 2 | Open | |
| 4 | How will initial opportunities be seeded? (partnerships, aggregation, manual entry?) | Business Team | Week 10 | Open | |
| 5 | What subscription pricing tiers will be offered to universities and employers? | Founder / Finance | Week 12 | Open | |
| 6 | Is university email domain verification sufficient for institutional admin access, or is manual approval needed? | Product Owner | Week 4 | Open | |
| 7 | Will student profiles be verified by universities, or self-reported with optional verification? | Product Owner | Week 6 | Open | |
| 8 | What is the data residency requirement for UAE-based operations? (local data center needed?) | Legal / Compliance | Week 4 | Open | |
| 9 | How will the AI matching algorithm be initially trained/configured without historical application data? | Engineering Lead | Week 8 | Open | |
| 10 | What is the maximum acceptable AI API cost per student per month for sustainable unit economics? | Finance / Engineering | Week 6 | Open | |

---

## 15. Domain-Specific Considerations

### 15.1 EdTech & Talent Mobility Specific Requirements

**Student Data Portability**:
- Students must be able to export their complete profile in machine-readable format (JSON/PDF)
- Profile data remains student-owned; platform has license to use for matching purposes only
- Students can delete account and all data within 30 days (right to be forgotten)

**Academic Calendar Alignment**:
- Opportunity deadlines should align with academic calendars (fall/spring semesters)
- Platform should support hemisphere-specific academic year awareness (Jan-Dec vs Sep-Aug)
- Seasonal opportunity surges (summer internships, fall exchanges) should be anticipated in infrastructure planning

**Credential Verification Strategy**:
- Phase 1: Self-reported data with university email domain verification
- Phase 2: University admin verification of enrolled students
- Phase 3: Digital credential verification (Open Badges, blockchain credentials)
- Verified badges displayed on profile to increase employer trust

**Global Mobility Considerations**:
- Visa support indicator on opportunities (critical filter for international students)
- Language requirements clearly displayed
- Time zone awareness for interview scheduling
- Cultural competency indicators as part of GX Score
- Country-specific opportunity compliance (work permit requirements)

### 15.2 AI/ML Specific Requirements

**Training Data Strategy**:
- Initial matching weights based on industry research and expert heuristics (no historical data available)
- Feedback loop: track which matched opportunities students apply to and succeed in
- Monthly recalibration of dimension weights based on application outcome data
- A/B testing of weight configurations to optimize match relevance

**Model Performance Targets**:
- Match score accuracy: >85% correlation with student satisfaction surveys
- False positive rate: <15% (students shouldn't waste time on irrelevant matches)
- Copilot response quality: >4/5 average user rating on helpfulness
- Response latency: <3 seconds for Copilot; <2 seconds for match score calculation

**Explainability Requirements**:
- Every match score must show dimension-by-dimension breakdown
- Skill gaps must list specific missing skills with actionable improvement steps
- GX Score changes must log exactly which profile change caused the score to move
- No "black box" scoring — students must understand how to improve

**Bias Mitigation**:
- Matching algorithm must not discriminate based on protected characteristics (gender, nationality, ethnicity, age within eligible range, disability)
- Regular audit of match distributions across demographic groups
- Diverse training data if ML components are introduced later
- Transparent scoring rubrics published for student review

---

## 16. Approval & Sign-off

### 16.1 Approval Requirements

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Founder / Product Owner | Rajesh | | | Pending |
| Technical Lead | | | | Pending |
| Design Lead | | | | Pending |
| Business Development | | | | Pending |
| Legal / Compliance | | | | Pending |

### 16.2 Approval Criteria

**This PRD is considered approved when**:
- [ ] Founder/Product Owner has reviewed and confirmed product vision alignment
- [ ] Technical lead has confirmed feasibility within stated timeline and tech stack
- [ ] Design lead has confirmed UX approach and design system requirements
- [ ] All critical open questions (items 1-4) are resolved or have acceptable interim answers
- [ ] Budget is estimated and approved at order-of-magnitude level
- [ ] Timeline is agreed upon with clear Phase 1 scope boundary
- [ ] Compliance requirements are validated by legal counsel

---

## Appendices

### Appendix A: Glossary
| Term | Definition |
|------|------------|
| **GX Score** | Global Employability Score — proprietary 0-100 metric measuring student's global career readiness across 12 dimensions |
| **B2B2C** | Business-to-Business-to-Consumer — platform sells to institutions (B2B) who bring their students/employees (B2C) |
| **Global Mobility** | A student's readiness and willingness to work/study in international locations |
| **AI Match Score** | Percentage (0-100%) indicating compatibility between a student profile and an opportunity |
| **Opportunity** | Any listing on the platform: internship, exchange, immersion, project, research, scholarship, or career |
| **Onboarding Wizard** | 8-step guided process for new students to complete their global profile |
| **Career Copilot** | AI-powered conversational assistant providing personalized career guidance |
| **RLS** | Row Level Security — PostgreSQL feature enforcing data access policies at database level |
| **MoSCoW** | Prioritization framework: Must Have, Should Have, Could Have, Won't Have |
| **Pipeline** | Application lifecycle stages from Draft through to Selected/Rejected |
| **Profile Completion** | Percentage of required and optional profile fields a student has filled |
| **Dimension** | One of 12 categories used to calculate the Global Employability Score |

### Appendix B: References
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **GDPR Requirements**: https://gdpr.eu/
- **Competitor Analysis**: Handshake, Symplicity, GoAbroad, iAgora, WayUp

### Appendix C: Related Documents
- **Architecture Document**: `.agents/docs/architecture.md` (Phase 3)
- **Governance Rules**: `.agents/rules/` (Phase 2)
- **Module Specifications**: `.agents/specs/` (Phase 4)
- **Flow Diagrams**: Phase 6 deliverable
- **Design System**: TBD (to be created in parallel)