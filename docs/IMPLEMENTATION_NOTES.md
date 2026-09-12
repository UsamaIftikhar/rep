# REP 1 SaaS — Implementation Notes & Architecture Audit

## 1. Confirmed Technology Stack

- **Framework**: Next.js 16.3.5 (App Router, Turbopack)
- **UI & React**: React 19.2.8, React DOM 19.2.8
- **Styling**: Tailwind CSS v4, PostCSS, Lucide Icons (`lucide-react`)
- **Utilities**: `clsx`, `tailwind-merge`
- **Database Target**: PostgreSQL with Prisma ORM
- **Authentication Target**: Server-side Auth (Prisma-backed sessions / NextAuth / JWT) with Zod schema validation
- **Payment Target**: Stripe SDK (`stripe` + `@stripe/stripe-js`) with webhook verification & Billing Portal
- **AI Target**: OpenAI API (`openai`) for structured JSON grading

## 2. Existing Workspace Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx (Public Home)
│   ├── academy/page.tsx (Student Academy)
│   ├── admin/page.tsx (Admin Portal landing)
│   ├── classroom/page.tsx (Classroom Storefront)
│   ├── dashboard/page.tsx (Platform Dashboard)
│   ├── elite-pacific/page.tsx (Elite Pacific Sports)
│   ├── interview/page.tsx (Mock AI Interview)
│   ├── login/page.tsx (Sign In)
│   ├── pricing/page.tsx (Pricing)
│   ├── settings/page.tsx (Settings)
│   └── signup/page.tsx (Sign Up)
├── components/
│   ├── layout/ (AppHeader, AppShell, AppSidebar, PublicFooter, PublicNavbar)
│   └── ui/ (button, card, dialog, empty-state, error-state, input, media-carousel, page-header, select, skeleton, textarea, badge)
└── lib/
    ├── auth-context.tsx (Mock client auth)
    └── utils.ts
```

## 3. Current Data / Auth / Payment State

- **Authentication**: Purely client-side mock (`localStorage` based `AuthContext`). No server-side session checks, no protected API routes, no password hashing.
- **Database**: No Prisma ORM or DB client configured yet.
- **Academy Data**: Hardcoded 6-course list in `src/app/academy/page.tsx`. No persistent lesson progress or completion tracking.
- **Interview Flow**: Client-side state array in `src/app/interview/page.tsx` with mock grading response.
- **Stripe / Billing**: Purely presentation UI in `src/app/settings/page.tsx` and `src/app/elite-pacific/page.tsx`. Hardcoded `$75/mo` text.
- **Admin**: Hardcoded summary stats and non-functional quick action links in `src/app/admin/page.tsx`.

## 4. Required Module Execution Roadmap

1. **Module 0**: Repository Audit & Baseline Lock (Done)
2. **Module 1**: Core Database, Auth & Authorization Foundation (Prisma, PostgreSQL, server auth, Zod, roles, route protection)
3. **Module 2**: Athlete Profile, Settings & Onboarding (AthleteProfile model, onboarding flow, settings update, public recruiter profile)
4. **Module 3**: Student Academy Domain & Progress (Course, Lesson, Enrollment, LessonProgress models, dynamic academy feed)
5. **Module 4**: Course Reader / Lesson Player (`/courses/[slug]`, markdown reader, progress completion, next/prev navigation)
6. **Module 5**: Classroom Storefront & Standalone Course Access (`/classroom`, standalone vs membership purchasing logic)
7. **Module 6**: Entitlement Service & Badge Logic (Centralized entitlement helper `canAccess*`, automatic Academy badge award)
8. **Module 7**: Stripe Checkout, Subscriptions, One-Time Purchases & Webhooks (Stripe SDK, webhooks, billing portal, customer mapping)
9. **Module 8**: Full Mock AI Interview Workflow (OpenAI structured JSON evaluation, attempt persistence, question progression)
10. **Module 9**: Athlete Search, Recruit Search & Recruiter Profiles (`/recruiting/search`, privacy-safe athlete cards)
11. **Module 10**: Elite Pacific Sports Functionalization (Stripe integration, entitlement-aware CTA, prospect data)
12. **Module 11**: Dashboard Functionalization (Dynamic metrics, personalized welcome, active enrollment widgets)
13. **Module 12**: Admin Portal Full Operations (Users management, Course CRUD, Billing view, Interview logs, AuditLog)
14. **Module 13**: Responsive Polish, Accessibility & Error States (Mobile navigation drawer, keyboard nav, skeleton & error screens)
15. **Module 14**: Test Suite & Production QA (Unit & integration test suite, lint/typecheck/build validation)
16. **Module 15**: Vercel Production Deployment & Smoke Tests (Deployment configuration, env vars, post-deploy validation)
