# GlobalXcelerate

GlobalXcelerate is a multi-role global talent mobility and experiential-learning platform. Students create one profile and discover opportunities; employers, universities and programme providers manage opportunities and applications; platform administrators govern users, access and operations.

## Documentation

- [Functional Requirements Specification](docs/frs.md)
- [Software Requirements Specification](docs/srs.md)
- [Module status and readiness](docs/module-status.md)
- [Product requirements](docs/prd.md)
- [Architecture](docs/architecture.md)
- [Application management specification](docs/specs/application_management_spec.md)
- [Issues and solutions tracker](docs/issues-and-solutions.md)

## Roles

Student · Employer · University administrator · Programme provider · Platform administrator

## Main capabilities

- Registration, login, email verification, password reset and MFA
- Student onboarding and unified profile management
- Opportunity marketplace and saved opportunities
- Applications, documents, status history and reviewer notes
- Employer opportunity and applicant management
- University and programme-provider workspaces
- AI matching, explanations and skill-gap recommendations
- GX Score, history and recommendations
- GX Career Copilot
- Platform administration, reports and governance

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The application uses Next.js, TypeScript, Supabase Auth/PostgreSQL/Storage/Realtime, Tailwind CSS, React Hook Form and Zod.

## Documentation status convention

**Implemented** means code/routes exist; it does not by itself mean production readiness. **Partial** means the feature exists but has material gaps. **Unverified** means code exists but requires acceptance/security testing.
