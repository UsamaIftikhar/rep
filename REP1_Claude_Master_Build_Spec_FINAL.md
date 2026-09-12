# REP 1 SaaS — Final Claude Code Master Build Specification

> **Status:** Final implementation specification after the approved Next.js UI pass.
>
> **Primary rule:** The current Vercel implementation at `https://rep-pied-nu.vercel.app/` and the supplied screenshots are now the **authoritative visual source of truth**. The previous Bubble app is no longer the design target. Preserve this new visual system and extend it carefully. Do **not** redesign completed screens unless a functional SaaS requirement forces a change.
>
> **Build objective:** Convert the approved UI into a production-ready athlete recruiting + education SaaS with real authentication, database-backed courses, entitlements, Stripe billing, AI mock interviews, athlete recruiting/search, admin operations, auditability, testing, and deployment on Vercel.

---

# 0. NON-NEGOTIABLE EXECUTION RULES FOR CLAUDE CODE

Before implementing anything, obey these rules throughout the project:

1. **Inspect the existing repository first.** Do not assume the stack, folder names, routing structure, component library, fonts, or state management. Confirm them from the repo before modifying code.
2. **The existing UI is approved.** Preserve visual hierarchy, page composition, spacing, typography, colors, shell, navigation, card treatment, button language, and imagery.
3. **Do not rebuild completed pages from scratch.** Functionalize them in place.
4. **Reuse existing components and styles.** If a shared component exists, extend it instead of creating a duplicate.
5. **Do not introduce a second design system.** No unrelated generic SaaS template, no default shadcn look, no visual drift.
6. **Do not hard-code business prices or entitlement rules into page components.** Pricing and access must be data/Stripe driven.
7. **Do not trust client state for permissions.** All protected access must be verified server-side.
8. **Every mutation must be validated.** Use schema validation and server-side authorization.
9. **All payment access must be webhook-backed.** Never grant paid access because a client redirects to a success page.
10. **Prefer server components for data fetching where appropriate.** Use client components only for interaction/state that requires them.
11. **Keep secrets server-only.** Never expose Stripe secret keys, OpenAI keys, webhook secrets, database credentials, or admin secrets to the browser.
12. **Every major module must include loading, empty, error, unauthorized, and success states.**
13. **Every completed module must pass lint, typecheck, tests, and production build before moving on.**
14. **Do not silently remove existing functionality while wiring production data.**
15. **Document assumptions in `/docs/IMPLEMENTATION_NOTES.md` instead of making irreversible business decisions silently.**

---

# 1. CURRENT UI — AUTHORITATIVE DESIGN AUDIT

The new UI is already substantially stronger than the old Bubble version. Preserve it.

## 1.1 Brand language

The product now reads as a premium sports-tech / recruiting platform:

- near-black page background
- black/charcoal application shell
- high-contrast white athletic display headings
- bright saturated REP 1 red for CTAs, emphasis, selected states, focus, and brand moments
- muted gray body copy
- thin charcoal borders
- rounded rectangular cards rather than pill-heavy generic SaaS styling
- large sports photography
- restrained use of glow around primary red CTAs and logo blocks
- condensed athletic typography for major headings
- clean sans-serif for readable UI/body copy

The site must feel:

- athletic
- premium
- focused
- performance-oriented
- modern
- recruiter-friendly
- credible to parents and students
- not like a generic dashboard template

## 1.2 Existing visual patterns to preserve

### Public shell
Observed on Home, Elite Pacific, and Mock AI Interview public pages:

- horizontal top navigation
- REP 1 logo left
- center navigation
- Sign In / Sign Up actions right
- strong page container with large breathing room
- footer with REP 1 identity and simple links

### Authenticated application shell
Observed on Dashboard, Academy, Mock Interview, Settings, Admin:

- left sidebar with REP 1 branding
- current user name near top
- main navigation items:
  - Home
  - Elite Pacific Sports
  - Student Academy
  - Mock AI Interview
  - Settings
- Admin Panel and Sign Out near bottom
- top application header with:
  - current section label/title
  - athlete search field
  - Recruit Search button
  - current account avatar/menu
- black main canvas with thin divider/border system

### Buttons
Preserve current language:

- solid red primary CTA
- white text
- soft red glow on important CTAs
- dark/outlined secondary CTA
- compact athletic typography where already used
- clear hover and focus states

### Cards
Preserve:

- dark charcoal surface
- 1px subtle border
- 12–18px radius range
- muted gray secondary copy
- strong condensed white titles
- red eyebrow labels

### Photography/media
Preserve the emphasis on real athletic imagery.
Do not over-process images. Use overlays only to support legibility.

## 1.3 New UI pages already represented

The screenshots confirm these designed views:

- Sign In
- Public Home
- Public Elite Pacific
- Public Mock AI Interview
- Authenticated Dashboard
- Authenticated Elite Pacific Sports
- Student Academy
- Authenticated Mock AI Interview
- Settings
- Admin Portal landing

These are not mockups to discard. These should become functional screens.

## 1.4 Design additions allowed only where SaaS functionality requires them

Claude may add new UI for:

- Sign Up / onboarding
- forgot/reset password
- email verification
- athlete profile editor
- athlete public profile
- recruiter athlete search/results
- recruiter athlete detail view
- course detail / lesson player
- classroom storefront
- checkout outcome states
- course purchase history
- interview in-progress screen
- interview scoring/results screen
- admin users
- admin courses
- admin lessons
- admin enrollments
- admin subscriptions/orders
- admin interview analytics
- admin settings
- audit log
- billing portal redirect states
- system/error pages

Every new screen must inherit the existing visual language.

---

# 2. PRODUCT DEFINITION

REP 1 is a SaaS platform for athlete recruiting, education, development, and interview preparation.

The platform has four primary personas.

## 2.1 Public visitor

Can:

- view the REP 1 marketing site
- understand the recruiting platform
- view Elite Pacific Sports positioning
- view Mock AI Interview offering
- browse selected public course/classroom information
- create an athlete account
- sign in
- purchase eligible standalone products/courses
- start a membership checkout where applicable

Cannot:

- access private athlete data
- access paid recruiter databases
- access member-only Academy content unless entitled
- access admin functionality

## 2.2 Athlete / student member

Can:

- maintain athlete profile
- access dashboard
- access entitled Student Academy courses
- enroll in multiple courses
- consume lessons
- track progress
- complete Academy classes
- earn badges
- use Mock AI Interview based on entitlement/business rules
- review interview attempt history and feedback
- manage billing
- appear in recruiter search only when profile visibility and required conditions permit

## 2.3 Recruiter / Elite Pacific subscriber

Can, depending on product entitlement:

- search eligible athletes
- filter athlete results
- view athlete recruiting profiles
- view verified performance metrics
- save/bookmark athletes if enabled
- use Elite Pacific recruiting access

Recruiter access must be permission-based, not merely hidden by UI.

## 2.4 Admin

Can:

- manage users and roles
- activate/suspend access
- manage athlete profiles
- manage courses and lessons
- publish/unpublish curriculum
- inspect enrollments and completion
- manage badge definitions and awards
- inspect AI interview usage/results
- inspect Stripe customers, orders, subscriptions, and entitlement state
- manage configurable product settings
- inspect system/audit activity

---

# 3. APPROVED CORE PRODUCT FLOWS

## 3.1 Authentication

Required flows:

- sign up
- sign in
- sign out
- forgot password
- reset password
- email verification if supported by chosen auth provider
- protected route handling
- role-aware redirects
- session refresh/expiry behavior

The existing Sign In UI should be preserved.

Recommended roles:

```ts
export enum UserRole {
  ATHLETE = 'ATHLETE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
```

If the product currently only needs ATHLETE + ADMIN initially, keep the schema extensible so RECRUITER can be enabled without a migration rewrite.

## 3.2 Athlete onboarding

After account creation, collect at minimum:

- first name
- last name
- email
- school / club
- graduation year
- location
- primary sport
- position / event
- profile photo
- profile visibility consent

Allow later expansion for:

- height
- weight
- GPA
- verified combine metrics
- social/video links
- achievements
- recruiting bio
- contact preferences

Do not block the whole app if optional fields are missing. Use profile completion percentage where useful.

## 3.3 Dashboard

The existing dashboard design becomes data-driven.

Current visual sections include:

- hero/media banner
- Welcome Back card
- photo carousel
- featured camp video
- “What is REP 1” section
- upcoming events
- subscription section
- athletes of the month
- blog section

Functionalization requirements:

- personalized first name
- profile CTA routes to athlete profile
- current membership state
- Academy progress summary
- upcoming event data or intentional empty state
- featured athletes configurable via admin or seed data
- blog/cards optional if content source is not ready; preserve intentional empty state
- all media configured from data/static content layer rather than duplicated in components

Recommended useful additions without disrupting approved UI:

- Academy completion mini progress indicator
- latest interview score / last attempt
- profile completeness status
- entitlement-aware CTA

Only add these if they fit visually without cluttering the dashboard.

## 3.4 Student Academy

Existing six-class UI:

1. Financial Literacy
2. Athletes for Impact
3. Marketing Playbook
4. Personal Branding
5. Conflict Resolution
6. Behavioral Analysis

Architecture must support unlimited courses because client discussion also referenced an Australia-related course.

Each course requires:

- title
- slug
- short description
- category
- ordering
- cover image optional
- published state
- required/optional state
- included-with-membership flag
- standalone purchasable flag
- Stripe product/price relation if paid standalone
- lessons
- estimated duration optional
- enrollment state
- progress

Academy rules:

- athlete may enroll in multiple classes
- member entitlement can grant included courses
- non-member should not accidentally gain member course access
- completion is based on completed lessons or explicit course completion logic
- Academy badge awarded once all required Academy courses are completed
- user progress must be persistent
- statuses:
  - NOT_STARTED
  - IN_PROGRESS
  - COMPLETED

Existing Academy visual layout should remain intact but use real status/progress data.

## 3.5 Course player / lesson experience

This is one of the necessary new screens.

Do not render entire Markdown documents as one giant block.

Create a focused learning experience containing:

- course title
- current lesson title
- lesson navigation/sidebar
- progress percentage
- completed lesson indicator
- previous / next buttons
- mark complete behavior
- rich Markdown or structured content renderer
- responsive reading width
- optional media/embed support
- completion state

Recommended desktop layout:

- compact course/lesson sidebar
- primary readable content pane
- sticky progress/header where appropriate

Mobile:

- collapsible lesson navigation
- full-width content
- persistent previous/next controls near lesson end

Use typography optimized for reading, not the condensed display font for body text.

## 3.6 Classroom storefront

This module is necessary from the client discussion even if the current new screenshots do not yet include it.

Purpose:

- non-members can purchase standalone classes individually
- members with included entitlement should see “Included” / “Open Course” rather than pay again

Required screen:

`/classroom`

Each course/product card should show:

- course title
- description
- price if standalone purchasable
- membership inclusion status
- current user entitlement
- CTA:
  - Sign In
  - Purchase Course
  - Included in Membership
  - Open Course
  - Continue Course

Recommended detail route:

`/classroom/[slug]`

Do not duplicate course data between Classroom and Academy. They must reference the same Course domain model.

## 3.7 Mock AI Interview

Existing tier UI is approved.

Current tiers:

### Tier 1 — Beginner
- Character & Coachability
- fundamentals
- handling coaching/adversity
- teammate accountability

### Tier 2 — Intermediate
- Tactics & Team Leadership
- tough coaching
- disagreement
- leadership
- school/sport balance

### Tier 3 — Pro
- Executive Poise & NIL Maturity
- high-pressure recruiting
- trade-offs
- public failure

Current UI shows five scenarios per tier.

Required full flow:

1. User selects tier.
2. Backend creates interview attempt.
3. System loads scenario/question set.
4. User answers one question at a time.
5. Each answer is persisted incrementally.
6. User can progress through five questions.
7. On final answer, server sends structured grading request to AI provider.
8. Evaluation is stored.
9. Results page shows:
   - overall score
   - per-question score
   - strengths
   - improvement areas
   - actionable coaching feedback
   - concise summary
10. Attempt appears in interview history.

Important reliability rules:

- never trust browser-only state as the source of interview progress
- use server-side persistence after each answer
- protect against double submission
- use structured JSON output validation from AI
- store model/provider metadata and prompt version for auditability
- enforce reasonable input lengths
- handle provider timeout/error gracefully
- avoid grading the same completed attempt multiple times unless explicitly reprocessed

Suggested scoring range: 0–100.

The UI may include a progress rail such as `Question 2 of 5`, but keep visual styling aligned to the approved design.

## 3.8 Athlete recruiting search

The existing top search input and “Recruit Search” button should become functional.

Recommended routes:

- `/recruiting/search`
- `/athletes/[slug]`

Search/filter capabilities, based on available data:

- athlete name
- sport
- position/event
- graduation year
- school/club
- location
- profile completeness
- combine metrics if present

Search results should use the current dark card language, not a generic white table.

Athlete profile should support:

- identity/basic info
- recruiting summary
- sport/position
- school/grad year
- photos/video
- verified combine metrics
- Academy badge(s)
- relevant training completion
- visibility-safe contact/recruiting details

Data privacy rule:
Only information explicitly intended for recruiter visibility may appear on public/recruiter-facing profiles.

## 3.9 Elite Pacific Sports

Preserve the approved new visual design:

- Australian Recruiting header card
- large prospect image carousel
- Recruit Search CTA
- Admin Login secondary CTA where appropriate
- About section
- Australian Athletes / Get Full Access section
- Elite Pacific Sports pricing card
- Subscribe & Pay CTA

Current UI shows `$75/mo`, but this must come from Stripe/config, not hard-coded logic.

Functional requirements:

- public page can display plan price and benefits
- authenticated entitled users should not see a misleading purchase CTA
- Stripe checkout for access product
- access granted by verified Stripe state
- recruiter database protected server-side
- subscription status reflected in Settings/Admin

## 3.10 Settings

Current Settings UI is approved and includes:

- Personal Information
- Membership & Billing
- Stripe Portal management

Functionalize:

- update first name
- last name
- school/club
- graduation year
- additional profile fields as needed
- save server-side with validation
- display current membership
- create Stripe Billing Portal session server-side
- redirect to Stripe-hosted portal
- show no-subscription state gracefully

Optional additions, if low-risk:

- avatar upload
- profile visibility toggle
- password change link
- email verification status

## 3.11 Admin portal

Existing Admin Portal landing screen is strong and approved.

Current stat cards:

- Total Registered Users
- Active Memberships
- Course Enrollments
- AI Interview Attempts

Current quick modules:

- Manage Users & Athletes
- Curriculum & Lessons Editor
- Stripe Orders & Subscriptions

Add production modules behind these cards/routes.

Recommended admin IA:

- `/admin`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/courses`
- `/admin/courses/[id]`
- `/admin/enrollments`
- `/admin/interviews`
- `/admin/billing`
- `/admin/badges`
- `/admin/settings`
- `/admin/audit`

Admin capabilities:

### Users & Athletes
- search
- filter by role/status/membership
- inspect profile
- activate/suspend
- update role with strict authorization
- inspect course progress
- inspect interview attempts
- inspect entitlement summary

### Curriculum
- create/edit/delete/archive course
- publish/unpublish
- order courses
- create/edit lessons
- reorder lessons
- rich Markdown content
- preview lesson
- mark course membership-included
- configure standalone purchase relation

### Enrollments
- filter course/status
- inspect completion
- manual admin grant/revoke only with audit log

### AI Interviews
- attempts count
- tier distribution
- average score
- inspect individual result
- failed grading jobs
- optional reprocess action for admins only

### Billing
- Stripe customer ID
- product/price
- subscription status
- entitlement status
- one-time course purchases
- timestamps
- links to Stripe Dashboard where safe/useful

### Badges
- badge definitions
- automatic award rules
- manual award/revoke with audit trail

### Audit
- actor
- action
- entity
- entity ID
- timestamp
- metadata

Admin routes must be authorization-protected on the server, not only hidden in navigation.

---

# 4. RECOMMENDED TECHNICAL ARCHITECTURE

First inspect the current repo and preserve what is already working. If the repo is already Next.js App Router, continue with it.

Recommended production stack:

- Next.js App Router
- TypeScript strict mode
- React
- Tailwind CSS or the current styling solution already present
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth or current proven auth solution
- Stripe
- OpenAI for interview grading
- Zod for validation
- React Hook Form where client-side form state is useful
- Vercel deployment

Do not add large dependencies when a small utility will do.

## 4.1 Suggested code organization

Use existing conventions if they are already clean. Otherwise converge toward:

```txt
app/
  (public)/
    page.tsx
    elite-pacific/
    interview/
    classroom/
    sign-in/
    sign-up/
  (platform)/
    dashboard/
    academy/
    courses/[slug]/
    settings/
    recruiting/
  admin/
    page.tsx
    users/
    courses/
    enrollments/
    interviews/
    billing/
    badges/
    settings/
    audit/
  api/
    auth/
    stripe/
    webhooks/
    interview/

components/
  layout/
  ui/
  dashboard/
  academy/
  classroom/
  interview/
  recruiting/
  admin/

lib/
  auth/
  db/
  stripe/
  ai/
  permissions/
  validation/
  entitlements/
  courses/
  audit/

prisma/
  schema.prisma
  seed.ts

docs/
  IMPLEMENTATION_NOTES.md
  TEST_PLAN.md
  DEPLOYMENT.md
```

Do not force this tree if the existing codebase already has an equivalent coherent structure.

---

# 5. DATABASE DOMAIN MODEL

Use the current schema if present and migrate carefully. Do not duplicate equivalent models.

A production-ready conceptual model follows.

## 5.1 User

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  firstName         String?
  lastName          String?
  passwordHash      String?
  role              UserRole @default(ATHLETE)
  status            UserStatus @default(ACTIVE)
  emailVerified     DateTime?
  image             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  athleteProfile    AthleteProfile?
  enrollments       Enrollment[]
  lessonProgress    LessonProgress[]
  interviewAttempts InterviewAttempt[]
  entitlements      Entitlement[]
  purchases         Purchase[]
  badges            UserBadge[]
}
```

## 5.2 AthleteProfile

Fields should support current Settings and recruiting needs:

- userId unique
- slug unique
- schoolClub
- graduationYear
- location
- sport
- position
- bio
- profilePhoto
- highlightVideoUrl
- profileVisibility
- profileCompleteness
- optional metrics JSON or normalized metric model

Prefer normalized metrics if they become heavily filtered.

## 5.3 Course

Suggested fields:

- id
- title
- slug
- description
- category
- order
- isPublished
- isRequiredForAcademy
- includedWithMembership
- standalonePurchasable
- stripeProductId optional
- stripePriceId optional
- coverImage optional
- createdAt
- updatedAt

## 5.4 Lesson

- id
- courseId
- title
- slug
- content
- order
- isPublished
- estimatedMinutes optional
- createdAt
- updatedAt

## 5.5 Enrollment

Unique `(userId, courseId)`.

Fields:

- status
- enrolledAt
- startedAt
- completedAt
- progressPercent cached optional
- source (`MEMBERSHIP`, `PURCHASE`, `ADMIN_GRANT`)

## 5.6 LessonProgress

Unique `(userId, lessonId)`.

Fields:

- completed
- completedAt
- lastViewedAt

## 5.7 Badge / UserBadge

Badge:

- key unique
- title
- description
- image/icon optional
- active

UserBadge:

- userId
- badgeId
- awardedAt
- source/reason

Unique `(userId, badgeId)`.

## 5.8 InterviewAttempt

Fields:

- userId
- tier
- status
- startedAt
- completedAt
- overallScore
- summary
- strengths JSON
- improvements JSON
- model
- promptVersion
- gradingError optional

## 5.9 InterviewAnswer

- attemptId
- questionIndex
- question
- answer
- score optional
- feedback optional
- strengths JSON optional
- improvements JSON optional

Unique `(attemptId, questionIndex)`.

## 5.10 Purchase

For one-time products/courses:

- userId
- courseId optional
- stripeCheckoutSessionId unique
- stripePaymentIntentId optional
- stripeCustomerId optional
- amount
- currency
- status
- purchasedAt

## 5.11 Subscription

If not represented directly on User, create normalized record:

- userId
- stripeCustomerId
- stripeSubscriptionId unique
- stripePriceId
- status
- currentPeriodEnd
- cancelAtPeriodEnd
- canceledAt
- createdAt
- updatedAt

## 5.12 Entitlement

This is important. Do not base access solely on UI or raw Stripe status scattered around the app.

Suggested fields:

- userId
- type (`ACADEMY`, `ELITE_PACIFIC`, `COURSE`, `INTERVIEW`, etc.)
- referenceId optional (e.g. course ID)
- source (`SUBSCRIPTION`, `PURCHASE`, `ADMIN`, `SYSTEM`)
- sourceReferenceId optional
- startsAt
- endsAt optional
- revokedAt optional

Access checks should go through a central entitlement service.

## 5.13 AuditLog

- actorUserId optional
- action
- entityType
- entityId
- metadata JSON
- createdAt

---

# 6. ENTITLEMENT ARCHITECTURE

Create a centralized access service, for example:

```ts
canAccessAcademy(userId)
canAccessCourse(userId, courseId)
canAccessElitePacific(userId)
canUseInterviewTier(userId, tier)
```

Rules must be evaluated server-side.

Examples:

- active REP 1 membership → Academy entitlement
- one-time standalone course purchase → that course only
- active Elite Pacific subscription → recruiter database entitlement
- admin grant → explicit entitlement with audit record

Do not scatter checks like:

```ts
if (user.subscriptionStatus === 'active')
```

through dozens of components.

Centralization avoids future pricing/product changes breaking access logic.

---

# 7. STRIPE PAYMENT ARCHITECTURE

## 7.1 Required payment types

Support both:

- recurring subscription products
- one-time standalone purchases

because the client discussion contains both models.

## 7.2 Source of truth

Use Stripe Product/Price IDs and environment/configuration mappings.
Do not hard-code `$75`, `$29.99`, `$24.99`, `$5.99`, etc. as business logic.

Displaying a fallback marketing price is acceptable only if clearly controlled in configuration and kept synchronized.

## 7.3 Checkout

Create server-side Checkout Sessions.

Examples:

- Elite Pacific subscription
- REP 1 membership
- standalone course purchase

Always associate checkout to authenticated user where applicable via metadata and customer mapping.

## 7.4 Webhooks

At minimum handle relevant events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- one-time payment events as required

Webhook rules:

- verify signature
- use raw body where required by framework
- idempotent processing
- never create duplicate purchases/entitlements
- retrieve canonical Stripe object where event ordering can produce stale data
- log failures safely

## 7.5 Billing portal

Settings → “Manage in Stripe Portal” should create a Stripe Billing Portal session on the server and redirect.

## 7.6 Payment success behavior

Success page should display purchase outcome, but access must come from webhook-synchronized state.

Use temporary “Payment processing” state if webhook is still catching up.

---

# 8. AI MOCK INTERVIEW ARCHITECTURE

## 8.1 Question sets

Store question sets in database or versioned configuration.

Each tier should support:

- title
- subtitle/category
- description
- question/scenario list
- active/version

Avoid hard-coding questions directly into view components.

## 8.2 Grading prompt

Use a strict structured response schema.

Expected shape conceptually:

```ts
{
  overallScore: number,
  summary: string,
  strengths: string[],
  improvements: string[],
  questions: [
    {
      index: number,
      score: number,
      feedback: string,
      strengths: string[],
      improvements: string[]
    }
  ]
}
```

Validate AI output before writing to DB.

## 8.3 Safety/reliability

- cap response size
- sanitize user-supplied rendered content
- time out provider requests gracefully
- preserve attempt if grading fails
- allow admin reprocess if necessary
- never expose OpenAI key client-side
- avoid sending unnecessary PII to AI provider

---

# 9. SECURITY REQUIREMENTS

Production SaaS requirements:

- server-side route protection
- role checks
- input validation
- CSRF-safe auth/payment flows according to library defaults
- no secrets in client bundles
- webhook signature verification
- password hashing if credentials auth is used
- secure reset token handling
- rate limiting on auth-sensitive and AI-expensive endpoints where practical
- server-side entitlement checks
- no IDOR: verify ownership when reading/updating profile, interview, enrollment, etc.
- admin actions authorization
- audit sensitive admin actions
- safe error messages
- avoid logging secrets or raw card/payment details
- never collect raw card numbers in custom inputs; use Stripe-hosted/tokenized payment UI

---

# 10. PERFORMANCE & UX REQUIREMENTS

- responsive desktop/tablet/mobile
- optimized Next/Image where applicable
- avoid layout shifts
- avoid giant client bundles
- lazy-load heavy media/components
- paginate or virtualize large admin/user search results
- debounce athlete search
- cache public content where appropriate
- avoid caching personalized private data incorrectly
- skeletons for async modules
- intentional empty states
- toast or inline success/error feedback
- keyboard-accessible navigation/forms
- visible focus states
- sufficient contrast

---

# 11. SEO REQUIREMENTS FOR PUBLIC PAGES

Public routes should include:

- metadata title/description
- canonical URL where appropriate
- Open Graph
- favicon/site icon
- semantic headings
- descriptive image alt text
- crawlable public content

Private dashboard/admin routes should not be indexed.

---

# 12. MODULE-BY-MODULE CLAUDE CODE EXECUTION PROMPTS

The following commands are designed to be pasted into Claude Code sequentially.

Do not run all modules blindly in one giant prompt. Finish, verify, and commit/checkpoint after each major module.

---

## MODULE 0 — Repository Audit & Architecture Lock

### Claude Code command

```text
You are working on the REP 1 SaaS repository. The current UI is already approved and must be preserved.

Do not implement new features yet.

First perform a full repository audit:
1. Identify Next.js version and whether App Router is used.
2. Identify current auth implementation, if any.
3. Identify current database/ORM, if any.
4. Identify styling system, fonts, icon library, shared UI components, route groups, server actions/API routes, and existing mock/static data.
5. Map all existing public and authenticated pages.
6. Identify which supplied UI screens already exist in code and which are only static/mock-data powered.
7. Identify technical debt, duplicate components, hard-coded data, hard-coded prices, fake auth, fake billing, fake admin stats, and any unsafe payment fields.
8. Identify the minimum architectural changes required to productionize this app without redesigning the UI.

Create or update:
- docs/IMPLEMENTATION_NOTES.md
- docs/ROUTE_MAP.md

In IMPLEMENTATION_NOTES.md document:
- confirmed stack
- existing folder structure
- current data/auth/payment state
- migration risks
- proposed module boundaries
- assumptions that require configuration

Do not alter visual styling except for obvious build-breaking defects.

Then run the existing lint/typecheck/build commands and report the baseline result.
```

### Exit criteria

- stack confirmed
- routes mapped
- mock data identified
- no feature implementation yet
- baseline build status known

---

## MODULE 1 — Core Database, Auth & Authorization Foundation

### Claude Code command

```text
Implement the production foundation for REP 1 while preserving all approved UI.

Before coding, inspect docs/IMPLEMENTATION_NOTES.md and the current repo conventions.

Goals:
1. Configure PostgreSQL + Prisma if not already present, or extend the existing data layer if it already exists.
2. Implement/complete authentication using the existing proven auth choice where possible.
3. Implement roles with at least ATHLETE and ADMIN, keeping room for RECRUITER and SUPER_ADMIN.
4. Protect authenticated platform routes server-side.
5. Protect /admin server-side by role.
6. Functionalize the current Sign In UI without redesigning it.
7. Add Sign Up, forgot-password and reset-password flows matching the current REP 1 visual design.
8. Create core user + athlete profile models.
9. Add Zod validation for auth/profile inputs.
10. Add centralized permission helpers.

Important:
- Do not expose secrets client-side.
- Do not rely on hidden navigation for authorization.
- Preserve current sidebar/topbar/public navigation visuals.
- Add loading/error states consistent with the current design.

Add seed/dev test accounts only through clearly development-only logic.

After implementation:
- run database generation/migration checks
- run lint
- run typecheck
- run relevant tests
- run production build
Fix all errors before stopping.
```

---

## MODULE 2 — Athlete Profile, Settings & Onboarding

### Claude Code command

```text
Functionalize athlete onboarding, profile data, and the existing Settings screen.

Preserve the approved Settings UI.

Implement:
1. AthleteProfile persistence linked 1:1 to User.
2. Existing fields: first name, last name, school/club, graduation year.
3. Add production-needed fields in a non-disruptive way: location, sport, position/event, profile image, short recruiting bio, profile visibility.
4. Server-side validated profile update flow.
5. Onboarding for new athletes after sign-up.
6. Profile completeness calculation.
7. Public/recruiter-safe athlete profile route, with privacy-safe field selection.
8. Ownership checks so users can only edit their own profile.
9. Admin can inspect athlete profiles but normal users cannot inspect private profile data.

Do not redesign existing approved cards/forms. Any new onboarding/profile screens must inherit the same black/charcoal/red/white design system and athletic heading typography.

After implementation run lint, typecheck, tests and production build.
```

---

## MODULE 3 — Student Academy Domain & Progress

### Claude Code command

```text
Convert the existing Student Academy UI from static/mock data into a production-backed curriculum system.

Do not redesign the approved Academy page.

Implement domain models/services for:
- Course
- Lesson
- Enrollment
- LessonProgress

Seed the current six Academy courses:
1. Financial Literacy
2. Athletes for Impact
3. Marketing Playbook
4. Personal Branding
5. Conflict Resolution
6. Behavioral Analysis

Requirements:
1. Architecture must support unlimited future courses.
2. Preserve current class ordering and display labels.
3. Support NOT_STARTED, IN_PROGRESS, COMPLETED states.
4. User can enroll in multiple courses.
5. Current 0 of 6 completed header must become live data.
6. Enroll/Open buttons must become entitlement-aware and data-driven.
7. Do not grant protected course access merely because the page is visible.
8. Add required-course flag for Academy badge logic.
9. Add loading, empty, unauthorized and error states.
10. Avoid duplicate enrollment rows using unique constraints and idempotent server logic.

Preserve current visuals and spacing as closely as possible.

After implementation run Prisma checks, lint, typecheck, tests and production build.
```

---

## MODULE 4 — Course Reader / Lesson Player

### Claude Code command

```text
Build the missing production course-learning experience for REP 1.

This is a new screen, so use the current REP 1 application visual system as the design source of truth.

Create route(s) such as:
- /courses/[slug]
- /courses/[slug]/lessons/[lessonSlug] if beneficial

Implement:
1. Course title and progress.
2. Lesson list/navigation.
3. Rich lesson content renderer supporting Markdown/structured content.
4. Readable content width and typography.
5. Previous/Next lesson controls.
6. Mark lesson complete.
7. Automatic course progress calculation.
8. Automatic course COMPLETED status when all required lessons are complete.
9. Resume from last viewed lesson.
10. Server-side entitlement check before content is returned.
11. Mobile collapsible lesson navigation.
12. Completion celebration/status that remains visually restrained and on-brand.

Do not dump entire course files into one huge page.
Do not use condensed headline typography for lesson body content.

After implementation run lint, typecheck, tests and production build.
```

---

## MODULE 5 — Classroom Storefront & Standalone Course Access

### Claude Code command

```text
Implement REP 1 Classroom as a storefront/access layer over the same Course models used by Student Academy.

Create/complete:
- /classroom
- optional /classroom/[slug]

Requirements:
1. Show purchasable course cards using REP 1 visual language.
2. Do not duplicate course records between Academy and Classroom.
3. Each course can independently be:
   - included with membership
   - standalone purchasable
   - both
   - neither/publicly hidden
4. Display price from configured Stripe product/price data or synchronized product metadata, never hard-coded business logic.
5. CTA logic:
   - unauthenticated => Sign In/Create Account
   - entitled => Open/Continue Course
   - membership includes it => Included with Membership
   - standalone eligible and not entitled => Purchase Course
6. Prevent duplicate charging for users who already have entitlement.
7. Add intentional empty/loading/error states.

Do not visually invent a different brand. Extend the existing red/black sports-tech system.

After implementation run lint, typecheck, tests and production build.
```

---

## MODULE 6 — Entitlement Service & Badge Logic

### Claude Code command

```text
Create a centralized entitlement and achievement layer for REP 1.

Implement an Entitlement service/model or equivalent robust abstraction.

Required access helpers:
- canAccessAcademy(userId)
- canAccessCourse(userId, courseId)
- canAccessElitePacific(userId)
- canUseInterviewTier(userId, tier) if tier limits apply

Sources of entitlement:
- active subscription
- one-time course purchase
- admin grant
- system grant

Implement badges:
1. Badge definition model.
2. UserBadge award model.
3. Academy badge automatically awarded when all required Academy courses are completed.
4. Awarding must be idempotent.
5. Badge should surface on athlete/recruiter profile where appropriate.
6. Admin manual award/revoke must be auditable.

Do not scatter subscription checks throughout page components. Replace access decisions with centralized entitlement calls.

Add unit/integration tests for entitlement decisions and Academy badge award behavior.
Run lint, typecheck, tests and production build.
```

---

## MODULE 7 — Stripe Checkout, Subscriptions, One-Time Purchases & Portal

### Claude Code command

```text
Implement production-grade Stripe integration for REP 1.

Preserve existing payment-related UI. Never build raw card-number inputs.

Support:
1. Recurring products/subscriptions (e.g. Elite Pacific and/or REP 1 membership as configured).
2. One-time standalone course purchases.
3. Stripe Checkout Sessions created server-side.
4. Stripe Customer mapping to authenticated users.
5. Verified webhooks.
6. Idempotent purchase/subscription synchronization.
7. Entitlement creation/revocation/update from canonical Stripe state.
8. Stripe Billing Portal from the existing Settings button.
9. Payment success/cancel states.
10. Admin billing records.

Important business rule:
Do not hard-code $75/mo or any other historical price into permission logic. Use Stripe price/product IDs and configuration.

Webhook implementation must safely handle relevant events such as:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed

Where event ordering may be stale, retrieve the latest subscription from Stripe before persisting final entitlement/subscription state.

Never grant access solely because the browser reached a success URL.

Add tests for:
- duplicate webhook delivery
- existing entitlement purchase prevention
- active subscription entitlement
- cancellation/payment failure behavior according to configured access policy

Run lint, typecheck, tests and production build.
```

---

## MODULE 8 — Full Mock AI Interview Workflow

### Claude Code command

```text
Functionalize the approved REP 1 Mock AI Interview UI into a complete persisted workflow.

Preserve the existing tier selection visuals exactly unless small UX changes are required for functionality.

Implement:
1. Tier definitions for Beginner, Intermediate, Pro.
2. Five scenario/questions per configured tier using versioned data, not hard-coded inside UI components.
3. Create InterviewAttempt when session begins.
4. Persist every answer server-side as the user progresses.
5. Interview screen with question number, question/scenario, answer input, Back/Next/Submit as appropriate.
6. Prevent duplicate final submission.
7. OpenAI server-side grading after final question.
8. Structured validated JSON output.
9. Store overall score, per-question score, feedback, strengths, improvements, summary, model, prompt version.
10. Results page styled in REP 1 design system.
11. Interview history on profile/dashboard or a clean history subsection.
12. Graceful AI timeout/error behavior; preserve completed answers even if grading fails.
13. Admin ability to inspect failed attempts and optionally reprocess.

Do not send unnecessary personal data to OpenAI.
Do not expose API keys client-side.
Do not trust client-generated scores.

Add tests around attempt ownership, answer persistence, finalization idempotency and structured grading parsing.
Run lint, typecheck, tests and production build.
```

---

## MODULE 9 — Athlete Search, Recruit Search & Recruiter Profiles

### Claude Code command

```text
Make the existing top athlete search and Recruit Search CTA functional.

Implement:
- /recruiting/search
- /athletes/[slug]

Requirements:
1. Search by athlete name.
2. Filters for available fields such as sport, position/event, graduation year, school/club, and location.
3. Search results must use the current REP 1 dark card design language.
4. Athlete profile must show only recruiter/public-safe fields.
5. Include profile photo/media, sport details, school/grad year, recruiting bio, verified metrics when available, and earned badges.
6. Add pagination for larger datasets.
7. Debounce search UI where appropriate.
8. Protect any recruiter-only data with server-side entitlement checks.
9. Never leak private athlete fields through API responses.
10. Empty search states should be intentional and on-brand.

If recruiter access levels are not yet finalized, implement a clean permission abstraction and default to the safer restricted behavior.

Run lint, typecheck, tests and production build.
```

---

## MODULE 10 — Elite Pacific Sports Functionalization

### Claude Code command

```text
Functionalize the approved Elite Pacific Sports public and authenticated pages without redesigning them.

Implement:
1. Config/data-backed hero/prospect carousel.
2. Recruit Search CTA routing.
3. Current configured Elite Pacific plan price from Stripe/config.
4. Subscribe & Pay Stripe flow.
5. Entitlement-aware page states:
   - visitor
   - signed-in not entitled
   - entitled subscriber
   - admin
6. Protect Australian athlete/recruiter database server-side.
7. Show subscriber status in Settings.
8. Admin billing visibility.
9. If current carousel/media is static, centralize it into a content configuration so it is not duplicated across Dashboard and public page.

Keep the existing page composition, imagery, typography, card language and red CTA treatment.

Run lint, typecheck, tests and production build.
```

---

## MODULE 11 — Dashboard Functionalization & Cross-Module Integration

### Claude Code command

```text
Convert the existing authenticated Dashboard from presentation/static content into a live personalized dashboard without changing its approved composition.

Wire:
1. Welcome name from authenticated user.
2. View Full Profile button.
3. Photo/media showcase from shared content configuration.
4. Featured video.
5. Subscription summary from synchronized billing state.
6. Manage Subscription to Stripe Portal.
7. Academy progress summary where it can be added without clutter.
8. Latest interview attempt/score where it can be added cleanly.
9. Upcoming events data or intentional empty state.
10. Athletes of the Month data/config or intentional empty state.
11. Blog cards/data if source exists; otherwise keep intentional empty state.

Important:
- Do not fabricate data.
- Do not display fake admin/demo statistics in production.
- Keep all currently approved visual spacing and hero/media balance.

Run lint, typecheck, tests and production build.
```

---

## MODULE 12 — Admin Portal Full Operations

### Claude Code command

```text
Turn the approved REP 1 Admin Portal landing page into a complete production operations console while preserving the current visual system.

Existing landing page stat cards must become real database-backed metrics:
- Total Registered Users
- Active Memberships
- Course Enrollments
- AI Interview Attempts

Implement admin routes/modules:
1. Users & Athletes
   - search/filter
   - inspect profile
   - role/status
   - activate/suspend
   - course progress
   - interview history
   - entitlements
2. Curriculum & Lessons
   - CRUD courses
   - publish/unpublish
   - reorder
   - CRUD lessons
   - Markdown content editor/textarea with preview
   - membership inclusion and standalone purchase configuration
3. Enrollments
   - filters
   - progress inspection
   - admin grant/revoke with audit trail
4. AI Interviews
   - attempt list
   - tier
   - score
   - status
   - failed grading
   - detail view
5. Billing
   - user
   - Stripe customer
   - subscriptions
   - purchases
   - statuses
   - entitlement state
6. Badges
   - definitions
   - user awards
7. Admin Settings
   - safe configurable product/content settings
8. Audit Log
   - sensitive admin actions

Security:
- all admin data access must verify admin role server-side
- protect mutations
- audit activation/suspension, entitlement grants, role changes, badge changes, and manual billing-related overrides

UX:
- paginate large datasets
- use responsive tables/cards
- preserve current black/charcoal/red design
- no giant unpaginated user list
- confirmations for destructive actions

Run lint, typecheck, tests and production build.
```

---

## MODULE 13 — Responsive Polish, Accessibility & Error States

### Claude Code command

```text
Perform a dedicated UX hardening pass across REP 1.

Do not redesign the approved desktop UI.

Check all public, authenticated, course, interview and admin routes at mobile, tablet and desktop widths.

Fix:
1. Sidebar => mobile drawer/menu.
2. Top search/account actions on small screens.
3. Heading wrapping and oversized condensed typography.
4. Academy row actions on mobile.
5. Elite Pacific carousel responsiveness.
6. Course player navigation on mobile.
7. Admin table overflow/pagination.
8. Form field spacing and keyboard behavior.
9. Focus visibility.
10. Color contrast.
11. Accessible labels.
12. Button disabled/loading states.
13. Skeleton/loading states.
14. Empty states.
15. 404/unauthorized/error pages.
16. Reduced-motion friendliness where animations/glows exist.

Do not introduce random breakpoint-specific redesigns.
Maintain the current REP 1 brand system.

Run lint, typecheck, tests and production build.
```

---

## MODULE 14 — Test Suite & Production QA

### Claude Code command

```text
Create and execute the REP 1 production QA plan.

Add/update docs/TEST_PLAN.md.

Test at minimum:

AUTH
- sign up
- sign in
- sign out
- invalid credentials
- protected route redirects
- admin rejection for non-admin

PROFILE
- athlete can update own profile
- cannot update another athlete
- visibility rules

ACADEMY
- enroll
- duplicate enrollment prevention
- lesson completion
- progress calculation
- course completion
- Academy badge auto-award

ENTITLEMENTS
- active member access
- non-member denial
- standalone course purchase access
- admin grant
- revoked access

STRIPE
- Checkout creation authorization
- webhook signature path
- duplicate webhook idempotency
- subscription update/delete
- one-time purchase
- Billing Portal

INTERVIEW
- create attempt
- answer progression
- attempt ownership
- final submit once
- grading success
- grading parse failure
- provider failure recovery

RECRUITING
- search
- filters
- recruiter access restrictions
- privacy-safe profile payload

ADMIN
- role protection
- user search/filter
- course management
- destructive confirmation
- audit entries

UI
- mobile/tablet/desktop key routes
- no obvious horizontal overflow
- no broken empty states
- no inaccessible form labels

Also run:
- lint
- strict typecheck
- tests
- production build

Fix all failures before deployment.
```

---

## MODULE 15 — Vercel Production Deployment

### Claude Code command

```text
Prepare REP 1 for production deployment on Vercel.

Do not change visual design.

Create/update docs/DEPLOYMENT.md with exact environment variables and deployment steps.

Verify:
1. Production PostgreSQL connection.
2. Prisma migrations are safe and applied.
3. Authentication production URL/secret configuration.
4. Stripe public/secret keys.
5. Stripe webhook secret and production webhook endpoint.
6. Stripe Product/Price mappings.
7. OpenAI API key.
8. App/public base URL.
9. Any storage/media configuration.
10. No development secrets committed.
11. No localhost URLs in production code.
12. Production build passes locally/CI.
13. Database seed does not overwrite production data.
14. Public pages render.
15. Authenticated redirects work.
16. Stripe checkout works in target environment.
17. Webhook receives events.
18. Interview grading works.
19. Admin route is protected.
20. Core smoke test passes after deployment.

Document rollback strategy for database migration and deployment.

Do not claim deployment is complete until post-deploy smoke tests are executed.
```

---

# 13. OPTIONAL MODULE — CONTENT / EVENTS / ATHLETES OF THE MONTH

This should be implemented only if time remains after the core SaaS is stable.

### Claude Code command

```text
Implement lightweight content management for existing Dashboard/Home sections that currently show events, athletes of the month, or blog content.

Priority is low compared to auth, payments, Academy, interview, recruiting and admin.

Add only if core production flows are already stable.

Prefer simple database-backed admin-managed records:
- Event
- FeaturedAthlete
- BlogPost or external CMS adapter

Do not introduce a full CMS dependency unless already present.
Preserve current visual sections.
```

---

# 14. RECOMMENDED 12-HOUR IMPLEMENTATION ORDER

Because the UI is already built, do **not** spend the first 2–3 hours recreating screens.

This schedule is aggressive and assumes Claude Code is working directly in a reasonably clean codebase.

## Hour 0:00–0:45 — Audit and architecture lock

- Module 0
- confirm stack
- find mock data
- find auth/payment/database gaps
- establish routes/models

## Hour 0:45–2:00 — Auth + database + permissions

- Module 1
- user/profile foundation
- protected platform/admin routes

## Hour 2:00–3:00 — Profile + Settings

- Module 2
- functional account/profile data

## Hour 3:00–4:30 — Academy + course reader

- Modules 3 and 4
- enrollment/progress/lesson completion

## Hour 4:30–5:15 — Classroom + entitlement core

- Modules 5 and 6

## Hour 5:15–6:45 — Stripe

- Module 7
- subscription + one-time course checkout
- webhook + portal

## Hour 6:45–8:15 — AI Interview

- Module 8

## Hour 8:15–9:15 — Recruiting + Elite Pacific

- Modules 9 and 10

## Hour 9:15–10:00 — Dashboard integration

- Module 11

## Hour 10:00–10:45 — Admin critical paths

- Module 12
- focus on real stats, users, curriculum, billing visibility first

## Hour 10:45–11:30 — Responsive/accessibility/QA

- Modules 13 and 14

## Hour 11:30–12:00 — Vercel deploy + smoke test

- Module 15

### Reality constraint

If the existing repo has no real backend/auth/database/payment foundation, a flawless full SaaS in 12 hours is high-risk. In that case prioritize **correct core transactional flows** over optional content management and cosmetic extras.

Production-critical order is:

1. auth/security
2. database integrity
3. entitlements
4. Academy access/progress
5. payments/webhooks
6. AI interview persistence/grading
7. recruiting privacy/access
8. admin safety
9. polish
10. optional content

---

# 15. DEFINITION OF DONE

REP 1 is not “done” because pages look correct. It is done when:

- approved UI remains visually consistent
- sign up/sign in/sign out work
- protected routes cannot be bypassed
- admin routes reject non-admin users
- profile data persists
- Academy uses real database data
- multiple course enrollment works
- lesson progress persists
- course completion works
- Academy badge auto-awards correctly
- standalone Classroom purchase works
- member entitlement prevents duplicate charging
- Stripe subscription works
- webhook-backed access works
- billing portal works
- Mock AI Interview persists attempts/answers
- AI grading returns validated structured results
- athlete search works
- recruiter/private data is permission-safe
- Elite Pacific entitlement works
- Admin stats are real, not fake
- admin can manage users/curriculum/billing visibility
- all sensitive mutations are authorized
- core admin actions are audited
- mobile/tablet/desktop layouts remain usable
- lint passes
- typecheck passes
- tests pass
- production build passes
- Vercel deployment succeeds
- post-deploy smoke tests pass

---

# 16. CLAUDE CODE GLOBAL MASTER PROMPT

Use this once at the start of the implementation session before executing modules.

```text
You are the lead engineer responsible for productionizing REP 1, an athlete recruiting and education SaaS.

The current repository already contains the approved UI. The deployed visual reference is:
https://rep-pied-nu.vercel.app/

The existing UI is the source of truth for branding and layout. Do not redesign finished screens. Preserve the black/charcoal background, bright REP 1 red CTA system, white condensed athletic headings, muted gray body copy, bordered dark cards, real sports imagery, application sidebar, public top navigation, and current spacing/composition.

Your job is to turn this UI into a secure, production-ready SaaS without visual regression.

Core product areas:
- Authentication and athlete onboarding
- Athlete profile and Settings
- Student Academy
- Course reader and persistent progress
- Classroom standalone course purchases
- Centralized entitlements
- Academy badges
- Stripe recurring subscriptions and one-time purchases
- Stripe webhooks and Billing Portal
- Mock AI Interview with persistent answers and OpenAI scoring
- Athlete recruiting search and profile visibility
- Elite Pacific Sports subscription/access
- Personalized Dashboard
- Full Admin Portal
- Auditability, testing and Vercel deployment

Engineering rules:
1. Audit before changing architecture.
2. Reuse existing components and styles.
3. Do not introduce a duplicate design system.
4. Do not hard-code prices into access logic.
5. Do not trust browser state for authorization, payments, progress, or grading.
6. Use server-side permission and entitlement checks.
7. Keep secrets server-only.
8. Validate all mutations.
9. Stripe access must be webhook-backed and idempotent.
10. OpenAI output must be structured and validated.
11. Preserve user work if AI grading fails.
12. Use strict TypeScript.
13. Avoid `any` unless there is a documented unavoidable reason.
14. Never collect raw card data in custom inputs.
15. Add loading, empty, error and unauthorized states.
16. Run lint, typecheck, tests and production build after each major module.
17. Fix failures before moving forward.
18. Document assumptions in docs/IMPLEMENTATION_NOTES.md.
19. Do not fabricate production data or fake admin stats.
20. Prioritize data integrity and security over optional visual extras.

Before implementation, read the complete REP1_Claude_Master_Build_Spec_FINAL.md and execute the modules in order. Do not skip module exit criteria. If the existing codebase already implements part of a module correctly, preserve it and only fill the verified gaps.
```

---

# 17. FINAL VISUAL GUIDANCE FOR NEW SCREENS

When adding missing SaaS screens, use these principles inferred from the approved UI:

## Page headers

Use the existing pattern:

- small red uppercase eyebrow
- large condensed uppercase white heading
- short muted gray description

## Section cards

Use:

- very dark charcoal surface
- thin neutral border
- 14–18px radius
- strong spacing
- red eyebrow labels where appropriate

## Forms

Match Sign In and Settings:

- dark inputs
- gray labels
- clear focus border
- red action button
- no excessive rounding

## Status treatment

- completed/active → green restrained indicator
- in progress → red/white or amber depending semantic fit
- inactive/not started → muted gray
- canceled/error → red/danger

Do not make the product rainbow-colored. REP 1 red remains the dominant action color.

## Course reader

Should feel like REP 1, but prioritize readability:

- white clean sans-serif body text
- condensed font only for titles/headings
- subtle divider lines
- active lesson in red
- progress visible but restrained

## Interview result screen

Recommended hierarchy:

- overall score prominently displayed
- short summary
- strengths
- improvements
- per-question feedback accordion/cards
- “Try Again” / “Back to Dashboard” actions

Avoid gamified neon visuals that conflict with current branding.

## Admin data screens

Use dark tables/cards with:

- sticky/search/filter toolbar
- clear column hierarchy
- row actions
- pagination
- no massive full-page dense list without grouping

---

# 18. BUSINESS DECISIONS THAT MUST REMAIN CONFIGURABLE

Do not freeze these in code because current client discussion has ambiguity:

- whether REP 1 core membership is one-time or recurring
- Elite Pacific billing interval
- exact prices
- which courses are membership-included
- which courses are individually purchasable
- whether interview tiers require different entitlement levels
- whether recruiter accounts are standalone subscriptions or manually provisioned

Represent these using Stripe products/prices, product configuration, database flags, and entitlement rules.

---

# 19. PRIORITY CUT LIST IF THE 12-HOUR WINDOW BECOMES TIGHT

Never cut:

- auth
- route protection
- database integrity
- payments/webhooks
- entitlement checks
- Academy persistence
- course progress
- AI interview persistence
- admin authorization
- deploy smoke test

Can defer if necessary:

- blog management
- complex events CMS
- athlete-of-the-month management
- recruiter saved lists
- advanced analytics charts
- avatar upload if it introduces storage complexity
- elaborate animations
- deep SEO enhancements beyond basics
- noncritical admin conveniences

---

# 20. FINAL HANDOFF CHECKLIST

Before handing the project to the client, provide:

- production URL
- admin login instructions through a secure channel
- Stripe Dashboard/webhook configuration notes
- required environment variable list
- database migration notes
- OpenAI configuration notes
- how to create/edit courses
- how to inspect users and memberships
- how to update Stripe prices/products
- how entitlements are granted
- test checklist
- known deferred/noncritical items

Never place secrets inside handoff documentation committed to git.

---

# FINAL DIRECTIVE

The new REP 1 UI is already visually approved and is now the foundation. The engineering task is to **make it real**.

Do not spend the implementation window reimagining the interface. Preserve the design, make the screens data-driven, add the missing transactional screens required by a SaaS, centralize access rules, ensure real Stripe-backed entitlements, persist course/interview state correctly, protect athlete data, and deliver a production-safe admin and deployment.

The successful result should look like the current Vercel UI but behave like a mature commercial SaaS.
