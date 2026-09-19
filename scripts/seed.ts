import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Test@1234";

interface UserSeed {
  email: string;
  fullName: string;
  role: string;
}

const users: UserSeed[] = [
  // Students
  { email: "student1@gxtest.com", fullName: "Arjun Mehta", role: "student" },
  { email: "student2@gxtest.com", fullName: "Priya Sharma", role: "student" },
  { email: "student3@gxtest.com", fullName: "Liam Chen", role: "student" },

  // Employers
  { email: "employer1@gxtest.com", fullName: "Rajesh Kumar", role: "employer" },
  { email: "employer2@gxtest.com", fullName: "Sarah Johnson", role: "employer" },

  // University Admins
  { email: "university1@gxtest.com", fullName: "Dr. Anita Rao", role: "university_admin" },
  { email: "university2@gxtest.com", fullName: "Prof. James Wilson", role: "university_admin" },

  // Program Providers
  { email: "provider1@gxtest.com", fullName: "Michael Torres", role: "program_provider" },
  { email: "provider2@gxtest.com", fullName: "Aisha Patel", role: "program_provider" },

  // Platform Admin
  { email: "admin1@globalxcelerate.com", fullName: "Vishnu Admin", role: "platform_admin" },
];

async function createUser(user: UserSeed): Promise<string> {
  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: user.fullName, role: user.role },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      const { data: existing } = await admin.auth.admin.listUsers();
      const found = existing.users.find((u) => u.email === user.email);
      if (found) return found.id;
    }
    throw new Error(`Failed to create user ${user.email}: ${error.message}`);
  }

  return data.user.id;
}

async function seedIndustries() {
  const industries = [
    "Technology",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "Engineering",
    "Consulting",
    "Media & Entertainment",
    "Manufacturing",
    "Retail & E-commerce",
    "Energy & Sustainability",
  ];

  const { error } = await admin.from("industries").upsert(
    industries.map((name) => ({ name })),
    { onConflict: "name" }
  );
  if (error) console.error("Industries seed error:", error.message);
  else console.log(`✓ Seeded ${industries.length} industries`);
}

async function seedSkills() {
  const skills = [
    { name: "Python", category: "Programming" },
    { name: "JavaScript", category: "Programming" },
    { name: "TypeScript", category: "Programming" },
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "SQL", category: "Database" },
    { name: "Machine Learning", category: "AI/ML" },
    { name: "Data Analysis", category: "Analytics" },
    { name: "Project Management", category: "Management" },
    { name: "Communication", category: "Soft Skills" },
    { name: "Leadership", category: "Soft Skills" },
    { name: "Critical Thinking", category: "Soft Skills" },
    { name: "Cloud Computing (AWS)", category: "Cloud" },
    { name: "Docker & Kubernetes", category: "DevOps" },
    { name: "UI/UX Design", category: "Design" },
    { name: "Research Methodology", category: "Research" },
    { name: "Financial Modeling", category: "Finance" },
    { name: "Digital Marketing", category: "Marketing" },
    { name: "Cross-cultural Communication", category: "Soft Skills" },
    { name: "Agile/Scrum", category: "Management" },
  ];

  const { error } = await admin.from("skills_master").upsert(skills, { onConflict: "name" });
  if (error) console.error("Skills seed error:", error.message);
  else console.log(`✓ Seeded ${skills.length} skills`);
}

async function seedOrganizations() {
  const orgs = [
    {
      name: "TechNova Solutions",
      description: "A leading AI and cloud computing company headquartered in Singapore.",
      industry: "Technology",
      location_country: "Singapore",
      location_city: "Singapore",
      size: "1000-5000",
      website: "https://technova.example.com",
      verified: true,
    },
    {
      name: "Global Finance Corp",
      description: "Multinational investment banking and financial services firm.",
      industry: "Finance & Banking",
      location_country: "United Kingdom",
      location_city: "London",
      size: "5000+",
      website: "https://globalfinance.example.com",
      verified: true,
    },
    {
      name: "University of Melbourne",
      description: "Top-ranked research university in Australia.",
      industry: "Education",
      location_country: "Australia",
      location_city: "Melbourne",
      size: "5000+",
      website: "https://unimelb.example.com",
      verified: true,
    },
    {
      name: "GreenFuture Institute",
      description: "International sustainability and climate research institute.",
      industry: "Energy & Sustainability",
      location_country: "Germany",
      location_city: "Berlin",
      size: "100-500",
      website: "https://greenfuture.example.com",
      verified: true,
    },
    {
      name: "Asia Pacific Exchange Program",
      description: "Non-profit facilitating student exchanges across Asia-Pacific region.",
      industry: "Education",
      location_country: "Japan",
      location_city: "Tokyo",
      size: "50-100",
      website: "https://apexchange.example.com",
      verified: true,
    },
  ];

  const results: { id: string; name: string }[] = [];
  for (const org of orgs) {
    // Check if exists first
    const { data: existing } = await admin.from("organizations").select("id, name").eq("name", org.name).maybeSingle();
    if (existing) {
      results.push(existing);
      continue;
    }
    const { data, error } = await admin.from("organizations").insert(org).select("id, name").single();
    if (error) console.error(`  Org "${org.name}" error:`, error.message);
    else if (data) results.push(data);
  }
  console.log(`✓ Seeded ${results.length} organizations`);
  return results;
}

async function seedStudentProfiles(userIds: Map<string, string>) {
  const students = [
    {
      user_id: userIds.get("student1@gxtest.com")!,
      first_name: "Arjun",
      last_name: "Mehta",
      nationality: "India",
      current_country: "India",
      current_city: "Mumbai",
      onboarding_status: "complete",
      profile_completion: 85,
      gx_score: 72.5,
      open_to_opportunities: true,
    },
    {
      user_id: userIds.get("student2@gxtest.com")!,
      first_name: "Priya",
      last_name: "Sharma",
      nationality: "India",
      current_country: "Singapore",
      current_city: "Singapore",
      onboarding_status: "complete",
      profile_completion: 92,
      gx_score: 81.3,
      open_to_opportunities: true,
    },
    {
      user_id: userIds.get("student3@gxtest.com")!,
      first_name: "Liam",
      last_name: "Chen",
      nationality: "Australia",
      current_country: "Australia",
      current_city: "Sydney",
      onboarding_status: "complete",
      profile_completion: 78,
      gx_score: 68.0,
      open_to_opportunities: true,
    },
  ];

  const { data, error } = await admin
    .from("student_profiles")
    .upsert(students, { onConflict: "user_id" })
    .select("id, user_id");
  if (error) console.error("Student profiles seed error:", error.message);
  else console.log(`✓ Seeded ${students.length} student profiles`);
  return data || [];
}

async function seedEmployerProfiles(userIds: Map<string, string>, orgIds: Map<string, string>) {
  const employers = [
    {
      user_id: userIds.get("employer1@gxtest.com")!,
      company_name: "TechNova Solutions",
      job_title: "Head of Talent Acquisition",
      industry: "Technology",
      company_size: "1000-5000",
      company_website: "https://technova.example.com",
      onboarding_status: "complete",
    },
    {
      user_id: userIds.get("employer2@gxtest.com")!,
      company_name: "Global Finance Corp",
      job_title: "HR Director - Graduate Programs",
      industry: "Finance & Banking",
      company_size: "5000+",
      company_website: "https://globalfinance.example.com",
      onboarding_status: "complete",
    },
  ];

  const { error } = await admin.from("employer_profiles").upsert(employers, { onConflict: "user_id" });
  if (error) console.error("Employer profiles seed error:", error.message);
  else console.log(`✓ Seeded ${employers.length} employer profiles`);
}

async function seedUniversityProfiles(userIds: Map<string, string>) {
  const uniAdmins = [
    {
      user_id: userIds.get("university1@gxtest.com")!,
      institution_name: "University of Melbourne",
      department: "International Student Programs",
      position: "Director",
      institution_website: "https://unimelb.example.com",
      onboarding_status: "complete",
    },
    {
      user_id: userIds.get("university2@gxtest.com")!,
      institution_name: "National University of Singapore",
      department: "Career Services",
      position: "Associate Director",
      institution_website: "https://nus.example.com",
      onboarding_status: "complete",
    },
  ];

  const { error } = await admin.from("university_admin_profiles").upsert(uniAdmins, { onConflict: "user_id" });
  if (error) console.error("University profiles seed error:", error.message);
  else console.log(`✓ Seeded ${uniAdmins.length} university admin profiles`);
}

async function seedProviderProfiles(userIds: Map<string, string>, orgIds: Map<string, string>) {
  const providers = [
    {
      user_id: userIds.get("provider1@gxtest.com")!,
      organization_name: "GreenFuture Institute",
      program_type: "Research Placement",
      description: "Facilitates research placements in sustainability and climate science.",
      website: "https://greenfuture.example.com",
      onboarding_status: "complete",
      organization_id: orgIds.get("GreenFuture Institute") || null,
    },
    {
      user_id: userIds.get("provider2@gxtest.com")!,
      organization_name: "Asia Pacific Exchange Program",
      program_type: "Student Exchange",
      description: "Manages cultural exchange programs across the Asia-Pacific region.",
      website: "https://apexchange.example.com",
      onboarding_status: "complete",
      organization_id: orgIds.get("Asia Pacific Exchange Program") || null,
    },
  ];

  const { error } = await admin.from("program_provider_profiles").upsert(providers, { onConflict: "user_id" });
  if (error) console.error("Provider profiles seed error:", error.message);
  else console.log(`✓ Seeded ${providers.length} provider profiles`);
}

async function seedPlatformAdminProfiles(userIds: Map<string, string>) {
  const admins = [
    {
      user_id: userIds.get("admin1@globalxcelerate.com")!,
      access_level: "super_admin",
      department: "Platform Operations",
      onboarding_status: "complete",
    },
  ];

  const { error } = await admin.from("platform_admin_profiles").upsert(admins, { onConflict: "user_id" });
  if (error) console.error("Admin profiles seed error:", error.message);
  else console.log(`✓ Seeded ${admins.length} platform admin profiles`);
}

async function seedOpportunities(orgIds: Map<string, string>, userIds: Map<string, string>) {
  const opportunities = [
    {
      title: "AI/ML Engineering Intern",
      slug: "ai-ml-engineering-intern-technova",
      description: "Join our AI research team to work on cutting-edge machine learning models for enterprise solutions. You will work alongside senior engineers on real production systems.",
      description_plain: "Join our AI research team to work on cutting-edge machine learning models for enterprise solutions.",
      category: "internships" as const,
      organization_id: orgIds.get("TechNova Solutions")!,
      location_country: "Singapore",
      location_city: "Singapore",
      work_mode: "hybrid" as const,
      duration_value: 6,
      duration_unit: "months" as const,
      compensation_type: "paid" as const,
      compensation_min: 3000,
      compensation_max: 4500,
      compensation_currency: "SGD",
      compensation_period: "monthly" as const,
      start_date: "2026-10-01",
      end_date: "2027-03-31",
      application_deadline: "2026-09-15",
      spots_available: 5,
      spots_filled: 1,
      status: "published" as const,
      published_at: "2026-08-01T00:00:00Z",
      featured: true,
      visa_support: true,
      requirements: JSON.stringify(["Currently enrolled in CS/AI/ML degree", "Strong Python skills", "Familiarity with PyTorch or TensorFlow"]),
      responsibilities: JSON.stringify(["Develop and fine-tune ML models", "Write production-ready code", "Participate in code reviews"]),
      benefits: JSON.stringify(["Housing allowance", "Flight tickets covered", "Mentorship program"]),
      posted_by: userIds.get("employer1@gxtest.com"),
    },
    {
      title: "Graduate Analyst - Investment Banking",
      slug: "graduate-analyst-investment-banking-gfc",
      description: "Fast-track graduate program in our London investment banking division. Rotational program across M&A, Capital Markets, and Advisory.",
      description_plain: "Fast-track graduate program in our London investment banking division.",
      category: "graduate_careers" as const,
      organization_id: orgIds.get("Global Finance Corp")!,
      location_country: "United Kingdom",
      location_city: "London",
      work_mode: "on_site" as const,
      duration_value: 2,
      duration_unit: "years" as const,
      compensation_type: "paid" as const,
      compensation_min: 55000,
      compensation_max: 65000,
      compensation_currency: "GBP",
      compensation_period: "annual" as const,
      start_date: "2027-01-15",
      application_deadline: "2026-10-30",
      spots_available: 10,
      spots_filled: 0,
      status: "published" as const,
      published_at: "2026-08-15T00:00:00Z",
      featured: true,
      visa_support: true,
      requirements: JSON.stringify(["Bachelor's degree in Finance, Economics, or STEM", "Strong analytical skills", "Proficiency in Excel and financial modeling"]),
      responsibilities: JSON.stringify(["Financial analysis and modeling", "Client pitch preparation", "Due diligence research"]),
      benefits: JSON.stringify(["Signing bonus", "Relocation package", "Professional certifications funded"]),
      posted_by: userIds.get("employer2@gxtest.com"),
    },
    {
      title: "Semester Exchange - University of Melbourne",
      slug: "semester-exchange-unimelb",
      description: "Full semester exchange at the University of Melbourne. Study alongside Australian students and earn credits transferable to your home university.",
      description_plain: "Full semester exchange at the University of Melbourne.",
      category: "exchange" as const,
      organization_id: orgIds.get("University of Melbourne")!,
      location_country: "Australia",
      location_city: "Melbourne",
      work_mode: "on_site" as const,
      duration_value: 6,
      duration_unit: "months" as const,
      compensation_type: "scholarship" as const,
      compensation_min: 5000,
      compensation_max: 10000,
      compensation_currency: "AUD",
      compensation_period: "total" as const,
      start_date: "2027-02-20",
      end_date: "2027-07-30",
      application_deadline: "2026-11-01",
      spots_available: 20,
      spots_filled: 3,
      status: "published" as const,
      published_at: "2026-08-10T00:00:00Z",
      featured: false,
      visa_support: true,
      requirements: JSON.stringify(["Minimum GPA 3.0/4.0", "English proficiency (IELTS 6.5+)", "Completed at least 2 years of undergraduate study"]),
      responsibilities: JSON.stringify(["Full-time course load (4 subjects)", "Participate in campus activities", "Submit exchange report"]),
      benefits: JSON.stringify(["Partial tuition waiver", "On-campus housing", "Airport pickup service"]),
      posted_by: userIds.get("university1@gxtest.com"),
    },
    {
      title: "Climate Research Placement",
      slug: "climate-research-placement-greenfuture",
      description: "Join a multidisciplinary team researching the impact of urbanization on local climate systems. Hands-on lab and field work in Berlin.",
      description_plain: "Research placement studying urbanization impact on local climate systems.",
      category: "research" as const,
      organization_id: orgIds.get("GreenFuture Institute")!,
      location_country: "Germany",
      location_city: "Berlin",
      work_mode: "on_site" as const,
      duration_value: 3,
      duration_unit: "months" as const,
      compensation_type: "stipend" as const,
      compensation_min: 1500,
      compensation_max: 1500,
      compensation_currency: "EUR",
      compensation_period: "monthly" as const,
      start_date: "2027-03-01",
      end_date: "2027-05-31",
      application_deadline: "2026-12-15",
      spots_available: 4,
      spots_filled: 0,
      status: "published" as const,
      published_at: "2026-08-20T00:00:00Z",
      featured: false,
      visa_support: true,
      requirements: JSON.stringify(["Enrolled in Environmental Science, Geography, or related field", "Research methodology experience", "Basic statistics knowledge"]),
      responsibilities: JSON.stringify(["Data collection and fieldwork", "Literature review", "Co-author research paper"]),
      benefits: JSON.stringify(["Published research credit", "Conference attendance", "Letter of recommendation"]),
      posted_by: userIds.get("provider1@gxtest.com"),
    },
    {
      title: "Cultural Immersion - Tokyo Summer Program",
      slug: "cultural-immersion-tokyo-summer",
      description: "4-week intensive cultural immersion program in Tokyo. Japanese language classes, industry visits, and homestay experience.",
      description_plain: "4-week cultural immersion program in Tokyo with language classes and industry visits.",
      category: "global_immersion" as const,
      organization_id: orgIds.get("Asia Pacific Exchange Program")!,
      location_country: "Japan",
      location_city: "Tokyo",
      work_mode: "on_site" as const,
      duration_value: 4,
      duration_unit: "weeks" as const,
      compensation_type: "unpaid" as const,
      start_date: "2027-06-15",
      end_date: "2027-07-13",
      application_deadline: "2027-03-01",
      spots_available: 15,
      spots_filled: 0,
      status: "published" as const,
      published_at: "2026-08-25T00:00:00Z",
      featured: true,
      visa_support: true,
      requirements: JSON.stringify(["Open to all disciplines", "Genuine interest in Japanese culture", "No prior Japanese language required"]),
      responsibilities: JSON.stringify(["Attend daily language classes", "Participate in cultural activities", "Complete reflective journal"]),
      benefits: JSON.stringify(["Homestay accommodation", "Cultural excursions included", "Certificate of completion"]),
      posted_by: userIds.get("provider2@gxtest.com"),
    },
    {
      title: "Industry Collaboration Project - FinTech Innovation",
      slug: "fintech-innovation-project-gfc",
      description: "8-week team project working on a real FinTech challenge. Teams of 4 students paired with industry mentors to develop a prototype solution.",
      description_plain: "8-week team project on a real FinTech challenge with industry mentors.",
      category: "industry_projects" as const,
      organization_id: orgIds.get("Global Finance Corp")!,
      location_country: "United Kingdom",
      location_city: "London",
      work_mode: "remote" as const,
      duration_value: 8,
      duration_unit: "weeks" as const,
      compensation_type: "unpaid" as const,
      start_date: "2027-01-10",
      end_date: "2027-03-07",
      application_deadline: "2026-11-30",
      spots_available: 16,
      spots_filled: 4,
      status: "published" as const,
      published_at: "2026-08-18T00:00:00Z",
      featured: false,
      visa_support: false,
      requirements: JSON.stringify(["Knowledge of fintech concepts", "Programming experience", "Team collaboration skills"]),
      responsibilities: JSON.stringify(["Weekly sprints", "Mentor check-ins", "Final pitch presentation"]),
      benefits: JSON.stringify(["Certificate from Global Finance Corp", "Top team gets internship offer", "Portfolio project"]),
      posted_by: userIds.get("employer2@gxtest.com"),
    },
    {
      title: "STEM Scholarship - Women in Technology",
      slug: "stem-scholarship-women-in-tech",
      description: "Full scholarship for women pursuing STEM degrees. Covers tuition, living expenses, and includes a mentorship program with industry leaders.",
      description_plain: "Full scholarship for women in STEM with tuition, living expenses, and mentorship.",
      category: "scholarships" as const,
      organization_id: orgIds.get("TechNova Solutions")!,
      location_country: "Singapore",
      location_city: "Singapore",
      work_mode: "on_site" as const,
      duration_value: 1,
      duration_unit: "years" as const,
      compensation_type: "scholarship" as const,
      compensation_min: 30000,
      compensation_max: 30000,
      compensation_currency: "SGD",
      compensation_period: "annual" as const,
      start_date: "2027-08-01",
      application_deadline: "2027-03-31",
      spots_available: 3,
      spots_filled: 0,
      status: "published" as const,
      published_at: "2026-08-22T00:00:00Z",
      featured: true,
      visa_support: true,
      requirements: JSON.stringify(["Identify as woman/non-binary", "Enrolled in STEM degree", "Minimum GPA 3.5/4.0"]),
      responsibilities: JSON.stringify(["Maintain GPA above 3.5", "Participate in quarterly mentorship sessions", "Present at annual conference"]),
      benefits: JSON.stringify(["Full tuition coverage", "Monthly living stipend", "Laptop provided", "Annual conference sponsorship"]),
      posted_by: userIds.get("employer1@gxtest.com"),
    },
  ];

  const results: { id: string; slug: string; organization_id: string }[] = [];
  for (const opp of opportunities) {
    const { data: existing } = await admin.from("opportunities").select("id, slug, organization_id").eq("slug", opp.slug).maybeSingle();
    if (existing) {
      results.push(existing);
      continue;
    }
    const { data, error: err } = await admin.from("opportunities").insert(opp).select("id, slug, organization_id").single();
    if (err) console.error(`  Opp "${opp.slug}" error:`, err.message);
    else if (data) results.push(data);
  }
  console.log(`✓ Seeded ${results.length} opportunities (all 7 categories covered)`);
  return results;
}

async function seedOpportunitySkills(opportunityIds: Map<string, string>) {
  const { data: skills } = await admin.from("skills_master").select("id, name");
  if (!skills) return;

  const skillMap = new Map(skills.map((s) => [s.name, s.id]));

  const oppSkills = [
    { opp: "ai-ml-engineering-intern-technova", skill: "Python", importance: "required" as const, min_proficiency: 4 },
    { opp: "ai-ml-engineering-intern-technova", skill: "Machine Learning", importance: "required" as const, min_proficiency: 3 },
    { opp: "ai-ml-engineering-intern-technova", skill: "TypeScript", importance: "preferred" as const, min_proficiency: 2 },
    { opp: "graduate-analyst-investment-banking-gfc", skill: "Financial Modeling", importance: "required" as const, min_proficiency: 3 },
    { opp: "graduate-analyst-investment-banking-gfc", skill: "Data Analysis", importance: "required" as const, min_proficiency: 3 },
    { opp: "graduate-analyst-investment-banking-gfc", skill: "Communication", importance: "required" as const, min_proficiency: 4 },
    { opp: "climate-research-placement-greenfuture", skill: "Research Methodology", importance: "required" as const, min_proficiency: 3 },
    { opp: "climate-research-placement-greenfuture", skill: "Data Analysis", importance: "preferred" as const, min_proficiency: 2 },
    { opp: "climate-research-placement-greenfuture", skill: "Python", importance: "nice_to_have" as const, min_proficiency: 2 },
    { opp: "fintech-innovation-project-gfc", skill: "JavaScript", importance: "required" as const, min_proficiency: 3 },
    { opp: "fintech-innovation-project-gfc", skill: "React", importance: "preferred" as const, min_proficiency: 2 },
    { opp: "fintech-innovation-project-gfc", skill: "Financial Modeling", importance: "preferred" as const, min_proficiency: 2 },
    { opp: "stem-scholarship-women-in-tech", skill: "Critical Thinking", importance: "required" as const, min_proficiency: 3 },
    { opp: "stem-scholarship-women-in-tech", skill: "Leadership", importance: "preferred" as const, min_proficiency: 2 },
  ];

  const rows = oppSkills
    .filter((os) => opportunityIds.has(os.opp) && skillMap.has(os.skill))
    .map((os) => ({
      opportunity_id: opportunityIds.get(os.opp)!,
      skill_id: skillMap.get(os.skill)!,
      importance: os.importance,
      min_proficiency: os.min_proficiency,
    }));

  const { error } = await admin.from("opportunity_skills").upsert(rows, { onConflict: "opportunity_id,skill_id" });
  if (error) console.error("Opportunity skills seed error:", error.message);
  else console.log(`✓ Seeded ${rows.length} opportunity-skill mappings`);
}

async function seedStudentSkills(studentProfiles: { id: string; user_id: string }[]) {
  const { data: skills } = await admin.from("skills_master").select("id, name");
  if (!skills) return;

  const skillMap = new Map(skills.map((s) => [s.name, s.id]));

  const studentSkills = [
    // Arjun - strong in tech
    { studentIdx: 0, skill: "Python", proficiency: 4 },
    { studentIdx: 0, skill: "Machine Learning", proficiency: 3 },
    { studentIdx: 0, skill: "JavaScript", proficiency: 3 },
    { studentIdx: 0, skill: "SQL", proficiency: 4 },
    { studentIdx: 0, skill: "Cloud Computing (AWS)", proficiency: 2 },
    // Priya - well-rounded
    { studentIdx: 1, skill: "Data Analysis", proficiency: 5 },
    { studentIdx: 1, skill: "Python", proficiency: 4 },
    { studentIdx: 1, skill: "Financial Modeling", proficiency: 3 },
    { studentIdx: 1, skill: "Communication", proficiency: 4 },
    { studentIdx: 1, skill: "Leadership", proficiency: 3 },
    // Liam - research oriented
    { studentIdx: 2, skill: "Research Methodology", proficiency: 4 },
    { studentIdx: 2, skill: "Critical Thinking", proficiency: 4 },
    { studentIdx: 2, skill: "Data Analysis", proficiency: 3 },
    { studentIdx: 2, skill: "Cross-cultural Communication", proficiency: 3 },
    { studentIdx: 2, skill: "Python", proficiency: 2 },
  ];

  const rows = studentSkills
    .filter((ss) => studentProfiles[ss.studentIdx] && skillMap.has(ss.skill))
    .map((ss) => ({
      student_id: studentProfiles[ss.studentIdx].id,
      skill_id: skillMap.get(ss.skill)!,
      proficiency_level: ss.proficiency,
    }));

  const { error } = await admin.from("student_skills").upsert(rows, { onConflict: "student_id,skill_id" });
  if (error) console.error("Student skills seed error:", error.message);
  else console.log(`✓ Seeded ${rows.length} student-skill mappings`);
}

async function seedApplications(
  studentProfiles: { id: string; user_id: string }[],
  opportunityIds: Map<string, string>,
  orgIdsByOpp: Map<string, string>
) {
  const appData = [
    {
      student_id: studentProfiles[0]?.user_id,
      opportunity_id: opportunityIds.get("ai-ml-engineering-intern-technova")!,
      organization_id: orgIdsByOpp.get("ai-ml-engineering-intern-technova")!,
      status: "under_review" as const,
      cover_letter: "I am passionate about AI/ML and have been building models since my second year. I believe this internship at TechNova aligns perfectly with my career goals.",
      submitted_at: "2026-08-20T10:30:00Z",
      match_score: 82,
    },
    {
      student_id: studentProfiles[1]?.user_id,
      opportunity_id: opportunityIds.get("graduate-analyst-investment-banking-gfc")!,
      organization_id: orgIdsByOpp.get("graduate-analyst-investment-banking-gfc")!,
      status: "shortlisted" as const,
      cover_letter: "With my strong foundation in data analysis and financial modeling, I am eager to contribute to Global Finance Corp's graduate program.",
      submitted_at: "2026-08-18T14:00:00Z",
      match_score: 88,
    },
    {
      student_id: studentProfiles[2]?.user_id,
      opportunity_id: opportunityIds.get("climate-research-placement-greenfuture")!,
      organization_id: orgIdsByOpp.get("climate-research-placement-greenfuture")!,
      status: "submitted" as const,
      cover_letter: "My research background in environmental science and passion for sustainability make me an ideal candidate for this placement.",
      submitted_at: "2026-08-25T09:15:00Z",
      match_score: 76,
    },
    {
      student_id: studentProfiles[0]?.user_id,
      opportunity_id: opportunityIds.get("fintech-innovation-project-gfc")!,
      organization_id: orgIdsByOpp.get("fintech-innovation-project-gfc")!,
      status: "submitted" as const,
      cover_letter: "I have experience in building full-stack applications and am excited about the intersection of finance and technology.",
      submitted_at: "2026-08-26T16:45:00Z",
      match_score: 71,
    },
  ];

  const { error } = await admin.from("applications").upsert(appData, { onConflict: "student_id,opportunity_id" });
  if (error) console.error("Applications seed error:", error.message);
  else console.log(`✓ Seeded ${appData.length} applications`);
}

async function seedGxScores(studentProfiles: { id: string; user_id: string }[]) {
  const gxScores = studentProfiles.map((sp, idx) => ({
    student_id: sp.user_id,
    composite_score: [72.5, 81.3, 68.0][idx],
    grade_bracket: (["developing", "strong", "developing"] as const)[idx],
    academic_readiness: [78, 85, 72][idx],
    technical_skills: [75, 82, 55][idx],
    communication: [70, 80, 72][idx],
    leadership: [68, 78, 62][idx],
    project_experience: [65, 80, 60][idx],
    internship_experience: [50, 75, 40][idx],
    international_exposure: [60, 88, 75][idx],
    certifications: [55, 70, 45][idx],
    portfolio_quality: [72, 76, 70][idx],
    interview_readiness: [68, 82, 60][idx],
    languages: [80, 90, 65][idx],
    industry_skills: [70, 78, 55][idx],
  }));

  const { error } = await admin.from("gx_scores").upsert(gxScores, { onConflict: "student_id" });
  if (error) console.error("GX scores seed error:", error.message);
  else console.log(`✓ Seeded ${gxScores.length} GX scores`);
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Step 1: Create auth users
  console.log("--- Creating Auth Users ---");
  const userIds = new Map<string, string>();
  for (const user of users) {
    try {
      const id = await createUser(user);
      userIds.set(user.email, id);
      console.log(`✓ ${user.role.padEnd(18)} | ${user.email} (${id.slice(0, 8)}...)`);
    } catch (err: any) {
      console.error(`✗ Failed: ${user.email} - ${err.message}`);
    }
  }

  console.log("\n--- Seeding Reference Data ---");
  await seedIndustries();
  await seedSkills();

  console.log("\n--- Seeding Organizations ---");
  const orgs = await seedOrganizations();
  const orgIds = new Map(orgs.map((o) => [o.name, o.id]));

  console.log("\n--- Seeding Profiles ---");
  const studentProfiles = await seedStudentProfiles(userIds);
  await seedEmployerProfiles(userIds, orgIds);
  await seedUniversityProfiles(userIds);
  await seedProviderProfiles(userIds, orgIds);
  await seedPlatformAdminProfiles(userIds);

  console.log("\n--- Seeding Opportunities (All 7 Categories) ---");
  const opportunities = await seedOpportunities(orgIds, userIds);
  const oppIds = new Map(opportunities.map((o) => [o.slug, o.id]));
  const orgIdsByOpp = new Map(opportunities.map((o) => [o.slug, o.organization_id]));

  console.log("\n--- Seeding Relationships ---");
  await seedOpportunitySkills(oppIds);
  await seedStudentSkills(studentProfiles);

  console.log("\n--- Seeding Applications ---");
  await seedApplications(studentProfiles, oppIds, orgIdsByOpp);

  console.log("\n--- Seeding GX Scores ---");
  await seedGxScores(studentProfiles);

  console.log("\n\n========================================");
  console.log("  SEED COMPLETE - LOGIN CREDENTIALS");
  console.log("========================================\n");
  console.log(`Password for ALL accounts: ${PASSWORD}\n`);
  console.log("┌─────────────────────┬─────────────────────────────────────┬──────────────────┐");
  console.log("│ Role                │ Email                               │ Name             │");
  console.log("├─────────────────────┼─────────────────────────────────────┼──────────────────┤");
  for (const user of users) {
    console.log(`│ ${user.role.padEnd(19)} │ ${user.email.padEnd(35)} │ ${user.fullName.padEnd(16)} │`);
  }
  console.log("└─────────────────────┴─────────────────────────────────────┴──────────────────┘");
}

main().catch(console.error);
