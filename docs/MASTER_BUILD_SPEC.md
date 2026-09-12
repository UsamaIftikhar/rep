# REP 1 SaaS — Master Build Specification for Claude Code

> **Purpose**: Rebuild the current REP 1 Bubble application as a polished, production-ready SaaS in Next.js while preserving the existing REP 1 brand identity and core product flows. The screenshots and current Bubble app are **visual references only**. Do **not** clone them pixel-for-pixel. The goal is to retain the same brand DNA while improving hierarchy, spacing, usability, responsiveness, consistency, perceived quality, and scalability.

---

## 0. Source of Truth

### Existing product reference
- Current Bubble application: `https://rep-1.bubbleapps.io/`
- Use the current application and attached screenshots to understand:
  - brand colors
  - page hierarchy
  - product modules
  - navigation model
  - page density
  - card/button language
  - content grouping
  - user flows
- Do **not** blindly copy Bubble layout or component spacing.
- Preserve the **black / charcoal / red / white** visual identity and athletic recruiting feel.
- New pages must feel like the same product, but more premium, intentional, responsive, and modern.

### Existing screenshots reviewed
The current UI includes these primary patterns:
- dark left sidebar
- black page backgrounds
- bright red primary CTA color
- white headings and muted gray copy
- dark elevated cards with subtle borders
- athletic / condensed display typography for section titles
- large sports imagery and red-tinted hero artwork
- dashboard-oriented application shell
- academy/course list
- Elite Pacific Sports recruiting page
- AI mock interview flow
- admin dashboard with users, billing, course completion, content management

### Visual principle
**Keep the identity. Improve the execution.**

The redesign should feel like:
- premium sports-tech SaaS
- athlete-focused
- confident, bold, modern
- high contrast
- fast and purposeful
- clean enough for recruiters and parents
- not over-designed
- not generic “shadcn SaaS template” styling

---

# 1. Product Vision

REP 1 becomes a full athlete recruiting and education SaaS with four primary experiences:

1. **Public visitor / non-member**
   - discover REP 1
   - browse athlete/recruiting value proposition
   - browse available classroom courses
   - purchase a standalone course
   - create account / sign in
   - choose a membership or paid product

2. **REP 1 student / athlete member**
   - access personal dashboard
   - complete profile
   - access Student Academy
   - enroll in available academy courses
   - consume lesson content
   - track course progress
   - earn completion badges
   - complete AI mock interviews
   - review interview results and feedback
   - manage account and billing

3. **Elite Pacific Sports user / recruiter flow**
   - browse / search athletes according to access permissions
   - use athlete filters
   - view athlete profiles
   - access subscription-gated recruiter functionality

4. **Admin**
   - manage users
   - manage athletes
   - manage courses and lesson content
   - manage academy completion
   - manage badges
   - inspect AI interview attempts
   - inspect revenue, subscriptions and purchases
   - update user status / access
   - manage site-level settings
   - audit product activity

---

# 2. Product Rules Already Established

## Student Academy
- Academy contains approximately 6 core classes in the current implementation.
- Existing examples include:
  - Financial Literacy
  - Athletes for Impact
  - Marketing Playbook
  - Personal Branding
  - Conflict Resolution
  - Behavioral Analysis
- Client discussion also referenced an additional Australia-related course, so data architecture must support any number of courses.
- Students may enroll in multiple courses.
- Academy access can be included in a paid REP 1 membership/product entitlement.
- Completion should award a badge to the athlete profile when the business rule is satisfied.

## Classroom
- Classroom is for users who may not have full REP 1 membership.
- Standalone courses can be purchased individually.
- A user who already has membership entitlement should not be charged again for courses included in their plan.
- Course pricing must be configurable and never hard-coded in UI logic.

## AI Mock Interview
- User chooses a tier / difficulty / interview level.
- Interview contains a sequence of questions.
- User answers one question at a time.
- At completion, AI evaluates each answer and overall performance.
- Results include:
  - per-question score
  - strengths
  - weaknesses
  - improvement suggestions
  - overall score
  - summary
- Every interview attempt should be persisted.

## Elite Pacific Sports
- Existing design presents:
  - recruiting hero
  - athlete search
  - Australian athlete positioning
  - subscription/access CTA
- Subscription / price should be configuration-driven.
- Current references include amounts such as `$75/mo`, but the transcript also contains inconsistent one-time vs recurring wording. Therefore:
  - pricing must be controlled through Stripe products/prices + database settings
  - no business logic should assume a fixed price or fixed billing model

---

# 3. UI / UX Design System

## 3.1 Color direction
Use the screenshots as reference and normalize the palette into reusable design tokens.

Recommended starting tokens:

```css
--background: #070707;
--surface-1: #111111;
--surface-2: #171717;
--surface-3: #202020;
--border: rgba(255,255,255,0.10);
--border-strong: rgba(255,255,255,0.16);
--text: #F5F5F5;
--text-muted: #A3A3A3;
--text-subtle: #737373;
--brand-red: #F21717;
--brand-red-hover: #D90F0F;
--brand-red-soft: rgba(242,23,23,0.12);
--success: #2ECC71;
--warning: #F59E0B;
--danger: #EF4444;
```

Claude should tune final values by comparing against the current visual references.

## 3.2 Typography
Use two families:

- **UI / body font**: Inter, Geist, or equivalent clean sans-serif
- **Athletic display font**: condensed sports-style font for selected headlines only

Rules:
- Do not use condensed display font for long body content.
- Use it for section labels, hero headlines, academy headings, stat callouts, and branding moments.
- Keep body copy highly readable.

## 3.3 Layout system
- Desktop left sidebar: approx. 220–250px
- Main content max width: 1440px where suitable
- Standard content gutters:
  - desktop: 32–40px
  - tablet: 24px
  - mobile: 16px
- Sidebar collapses to drawer on mobile/tablet.
- Header remains sticky where helpful.
- Avoid full-width sections that feel empty; constrain text/card widths intentionally.

## 3.4 Component style
### Buttons
- Primary: red fill / white text
- Secondary: dark surface / light border
- Ghost: transparent / muted text
- Destructive: dark red or destructive style only where required
- Medium radius, not overly rounded
- Consistent heights across app

### Cards
- dark gray surface
- subtle 1px border
- optional soft shadow
- radius 14–18px
- consistent inner padding
- avoid excessive glassmorphism

### Inputs
- dark surface
- clear focus state in brand red
- strong validation states
- accessible labels

### Status badges
Use meaningful colors:
- green = completed/active
- orange = in progress
- gray = not started
- red = failed/canceled/suspended

## 3.5 Visual polish requirements
- consistent icon sizing
- no random font sizes
- no random spacing values
- no arbitrary hard-coded colors in page components
- use design tokens
- skeleton states for async content
- empty states that look intentional
- error states with recovery action
- responsive tables should convert to cards or horizontal scroll appropriately

---

# 4. Core Information Architecture

## Public routes
```text
/
/classroom
/classroom/[courseSlug]
/pricing
/about
/contact
/login
/signup
/forgot-password
/reset-password
```

## Authenticated athlete routes
```text
/dashboard
/profile
/profile/edit
/academy
/academy/[courseSlug]
/academy/[courseSlug]/lesson/[lessonSlug]
/interview
/interview/session/[sessionId]
/interview/results/[sessionId]
/billing
/settings
```

## Elite Pacific Sports routes
```text
/elite-pacific
/elite-pacific/search
/athletes/[athleteId]
```

## Admin routes
```text
/admin
/admin/users
/admin/users/[id]
/admin/athletes
/admin/courses
/admin/courses/new
/admin/courses/[id]
/admin/enrollments
/admin/interviews
/admin/billing
/admin/badges
/admin/settings
/admin/audit-log
```

---

# 5. Recommended Technical Stack

## Frontend / full-stack framework
- Next.js 16+
- App Router
- TypeScript strict mode
- React Server Components where appropriate
- Server Actions for selected mutations
- Route Handlers for webhooks/external API endpoints

## Styling
- Tailwind CSS
- shadcn/ui primitives only where useful
- custom REP 1 component layer on top
- lucide-react for icons unless brand asset requires otherwise

## Database
- PostgreSQL
- Prisma ORM

## Authentication
Recommended:
- Auth.js / NextAuth
- credentials + optional Google OAuth
- role-based authorization

Alternative if speed is the highest priority and external auth is acceptable:
- Clerk

Default for this build: **Auth.js** unless implementation speed is materially improved by Clerk.

## Payments
- Stripe
- Stripe Checkout for speed and PCI safety
- Stripe Customer Portal for subscription management
- Stripe webhooks as source of truth for payment/subscription entitlement state

## AI
- OpenAI API
- Structured JSON output for interview grading
- Zod validation on AI responses
- server-only API key

## Content
For the 12-hour build:
- Course content stored in PostgreSQL as structured rich text / markdown blocks
- Admin course editor can initially use textarea/markdown editor
- architecture should allow replacement with a richer CMS later

## Validation
- Zod shared schemas

## Forms
- React Hook Form where appropriate

## Testing
- Vitest or Jest for unit/service tests
- Playwright for critical E2E flows

## Monitoring
- Vercel logs
- Sentry optional if time permits
- structured server logs

## Deployment
- Vercel
- managed PostgreSQL: Neon / Supabase / Vercel Postgres

---

# 6. Project Folder Architecture

```text
src/
  app/
    (public)/
    (auth)/
    (app)/
    admin/
    api/

  components/
    ui/
    layout/
    dashboard/
    academy/
    classroom/
    interview/
    elite-pacific/
    admin/

  features/
    auth/
    users/
    athlete-profile/
    courses/
    enrollments/
    progress/
    entitlements/
    billing/
    interviews/
    badges/
    admin/

  lib/
    auth/
    db/
    stripe/
    openai/
    security/
    logger/
    constants/
    validators/

  server/
    services/
    repositories/
    policies/

  types/

prisma/
  schema.prisma
  seed.ts

tests/
  e2e/
  unit/

docs/
  MASTER_BUILD_SPEC.md
```

### Architectural rule
Page components must not contain business logic that belongs in services.

Preferred flow:

```text
UI -> server action / route -> service -> repository / Prisma
```

External integrations:

```text
service -> Stripe/OpenAI adapter
```

---

# 7. Database Model Blueprint

Exact Prisma implementation may vary, but domain separation must remain clear.

## User
```text
id
email
name
passwordHash / auth provider fields
role: USER | ADMIN | RECRUITER
status: ACTIVE | SUSPENDED | DEACTIVATED
createdAt
updatedAt
```

## AthleteProfile
```text
id
userId
firstName
lastName
avatarUrl
bio
sport
position
graduationYear
school
city
state
country
height
weight
stats JSON
socialLinks JSON
isPublic
createdAt
updatedAt
```

## Course
```text
id
slug
title
shortDescription
description
category
thumbnailUrl
status: DRAFT | PUBLISHED | ARCHIVED
isAcademyCourse
isStandalonePurchasable
sortOrder
createdAt
updatedAt
```

## Lesson
```text
id
courseId
slug
title
content
sortOrder
estimatedMinutes
createdAt
updatedAt
```

## Enrollment
```text
id
userId
courseId
source: MEMBERSHIP | PURCHASE | ADMIN
status: NOT_STARTED | IN_PROGRESS | COMPLETED
progressPercent
startedAt
completedAt
createdAt
updatedAt
```

## LessonProgress
```text
id
userId
lessonId
completed
completedAt
lastViewedAt
```

## Badge
```text
id
slug
name
description
iconUrl
criteriaType
createdAt
updatedAt
```

## UserBadge
```text
id
userId
badgeId
awardedAt
metadata JSON
```

## ProductEntitlement
Represents what a user is allowed to access.

```text
id
userId
type: MEMBERSHIP | COURSE | RECRUITER_ACCESS
referenceId
source
status: ACTIVE | EXPIRED | REVOKED
startsAt
endsAt
createdAt
updatedAt
```

## StripeCustomer
May be fields on User or separate model.

```text
userId
stripeCustomerId
```

## Order
```text
id
userId
stripeCheckoutSessionId
stripePaymentIntentId
status
currency
amountTotal
createdAt
updatedAt
```

## OrderItem
```text
id
orderId
productType
referenceId
quantity
unitAmount
```

## Subscription
```text
id
userId
stripeSubscriptionId
stripePriceId
status
cancelAtPeriodEnd
currentPeriodStart
currentPeriodEnd
createdAt
updatedAt
```

## InterviewTemplate
```text
id
name
tier
status
createdAt
updatedAt
```

## InterviewQuestion
```text
id
templateId
question
sortOrder
```

## InterviewSession
```text
id
userId
templateId
status: STARTED | COMPLETED | FAILED
overallScore
summary
startedAt
completedAt
createdAt
```

## InterviewAnswer
```text
id
sessionId
questionId
answerText
score
strengths
weaknesses
feedback
createdAt
```

## AuditLog
```text
id
actorUserId
action
entityType
entityId
metadata JSON
createdAt
```

---

# 8. Authorization Rules

Use centralized authorization policies.

## Guest
Can:
- view public pages
- view published standalone classroom courses
- sign up
- sign in
- begin checkout

Cannot:
- access private course content
- access athlete dashboard
- access admin

## Athlete/member
Can:
- access own profile
- update own allowed fields
- access courses for which entitlement exists
- access Academy if membership entitlement exists
- purchase standalone course
- complete own lessons
- access own interview history

Cannot:
- access other users' private data
- manage course catalog
- access admin

## Recruiter
Can:
- access athlete search if recruiter entitlement is active
- view permitted athlete profiles

## Admin
Can:
- access all admin pages
- manage users
- manage courses
- inspect enrollments/interviews/orders/subscriptions
- update access/status according to explicit admin actions

### Security rule
Never rely on client-side hidden UI for authorization. Every server-side data operation must verify permission.

---

# 9. Module-by-Module Implementation Plan

---

## MODULE 1 — Foundation, Design System, App Shell

### Goal
Build the complete application shell and reusable REP 1 visual system before individual pages.

### Deliverables
- Next.js setup
- TypeScript strict mode
- Tailwind
- linting / formatting
- fonts
- design tokens
- sidebar
- top bar
- public header
- mobile navigation
- `PageHeader`
- `Card`
- button system
- badge/status components
- empty/loading/error states
- responsive content container

### UI rules
- visually derived from current REP 1 application
- not pixel-copy
- stronger spacing and proportions
- cohesive red/black sports-tech identity

### Claude Code command
```text
Implement Module 1: REP 1 foundation and design system.

First inspect the existing repository. Do not duplicate existing infrastructure unnecessarily.

Set up or normalize Next.js App Router + TypeScript strict mode + Tailwind. Create a reusable REP 1 design system based on the provided reference screenshots: black background, charcoal surfaces, strong REP 1 red, white text, muted gray supporting text, subtle borders, athletic condensed display typography for selected headings, and clean readable body typography.

Do NOT copy the Bubble UI pixel-for-pixel. Improve spacing, hierarchy, responsive behavior, component consistency and accessibility while preserving the visual identity.

Create reusable components for app sidebar, top navigation, public header, page shell, page header, section label, cards, buttons, status badges, inputs, selects, modal/dialog primitives, skeleton loaders, empty states and error states.

Create centralized design tokens. Do not place arbitrary colors or repeated hard-coded spacing throughout page components.

The app sidebar should support Home, Elite Pacific Sports, Student Academy, Mock AI Interview and Settings, plus Admin only for admins. It must collapse to a mobile drawer.

Ensure keyboard navigation, visible focus states and reasonable WCAG contrast.

Do not implement business modules yet. Finish by running lint, typecheck and production build. Fix all errors before stopping.
```

### Completion gate
- app shell looks polished on desktop and mobile
- no TypeScript errors
- no lint errors
- production build passes

---

## MODULE 2 — Authentication, Users, Roles, Profile Base

### Goal
Add production-safe authentication and role-aware routing.

### Deliverables
- login
- signup
- logout
- forgot/reset password if feasible within selected auth implementation
- User model
- AthleteProfile model
- role support
- server-side authorization helpers
- protected layouts
- profile base page

### Claude Code command
```text
Implement Module 2: authentication, users, roles and athlete profile foundation.

Read and preserve Module 1 architecture and visual components. Do not create a second UI system.

Use Auth.js unless the existing repository already contains a production-ready authentication provider that should be preserved. Add Prisma User and AthleteProfile models, migrations, secure password hashing if credentials auth is used, session handling and role support for USER, RECRUITER and ADMIN.

Create login, signup and account/profile flows matching the REP 1 design language.

Create reusable authorization policies and protected layouts. Authorization must be enforced server-side, not only by hiding buttons.

Add a profile foundation that supports athlete information such as sport, position, graduation year, school, location, height, weight, biography, avatar and structured performance metadata without overbuilding the form.

Ensure admin routes reject non-admin users and private app routes reject unauthenticated users.

Add validation with Zod and clear form error states.

Run database migration, lint, typecheck and production build. Fix all issues before stopping.
```

---

## MODULE 3 — Dashboard UI and Athlete Home Experience

### Goal
Replace the current functional-but-basic dashboard with a polished athlete command center.

### Required sections
- personalized hero / welcome panel
- profile completion / view profile CTA
- Academy progress
- latest interview score or CTA
- subscription/access status
- upcoming events placeholder/module
- athlete/recruiter activity placeholder where data exists
- featured content/blog placeholder
- badges earned

### Design direction
Retain the dramatic sports imagery and red tint from the current dashboard, but make content density, card spacing and hierarchy significantly more intentional.

### Claude Code command
```text
Implement Module 3: athlete dashboard.

Use the current Bubble dashboard only as a content and brand reference. Build a cleaner, more premium dashboard using the design system from Module 1.

Include a strong athlete hero/welcome section with dramatic sports imagery treatment, a profile CTA, Academy progress summary, latest mock interview result/CTA, active subscription or entitlement summary, earned badges and structured placeholders for upcoming events and featured content.

Avoid giant empty cards. Every module should have a clear purpose, useful empty state and responsive layout.

Connect only to data already available from Modules 1-2. Where future modules will supply data, create typed interfaces and intentional empty states rather than hard-coded fake production data.

Ensure the page works at desktop, tablet and mobile widths.

Run lint, typecheck and build before stopping.
```

---

## MODULE 4 — Course Domain, Student Academy, Course Reader

### Goal
Build the complete Academy experience.

### Deliverables
- Course
- Lesson
- Enrollment
- LessonProgress
- Academy catalog
- course detail
- lesson reader
- progress tracking
- completion
- badges trigger architecture

### Academy UX
Replace the sparse current list with polished course cards/list rows containing:
- class number
- title
- category
- short description
- progress
- status
- estimated time or lesson count where available
- CTA

### Course reader UX
- course sidebar / lesson navigation
- progress indicator
- readable content width
- previous / next lesson
- mark complete
- automatic last-view tracking
- mobile lesson drawer

### Claude Code command
```text
Implement Module 4: course domain, Student Academy and course reader.

Extend the existing architecture; do not create duplicate user or entitlement concepts.

Add Prisma models for Course, Lesson, Enrollment and LessonProgress. Support any number of courses and lessons. Seed the six known Academy course titles as editable data, not hard-coded page content.

Build /academy as a polished curriculum experience based on the existing REP 1 Academy reference, but improve visual density, hierarchy, progress visibility and responsiveness. Each course should show title, category/summary, progress status and a clear action.

Build a course detail and lesson reader experience that feels like a real learning product: lesson navigation, current progress, previous/next navigation, readable content width, persisted last-view state and explicit lesson completion.

Enrollment rules:
- a user may enroll in multiple courses
- course access must be permission/entitlement checked server-side
- prevent duplicate enrollments
- progress must be derived consistently from lesson completion
- course completion must be idempotent

Create service-layer functions for enrollment and progress rather than placing Prisma logic directly inside React components.

Add unit tests for enrollment duplication prevention and progress/completion calculations.

Run migration, seed, tests, lint, typecheck and production build before stopping.
```

---

## MODULE 5 — Classroom + Standalone Course Commerce

### Goal
Allow non-members to purchase individual courses while members automatically receive included access.

### Deliverables
- public classroom catalog
- course product page
- access-aware CTA
- standalone purchase integration hook
- post-purchase enrollment

### Rules
CTA should resolve to one of:
- `Start Course`
- `Continue Course`
- `Included in Membership`
- `Purchase Course`
- `Sign In to Continue`

### Claude Code command
```text
Implement Module 5: public Classroom and standalone course access logic.

Use the existing Course model. Do not create a separate duplicate classroom-course model.

Add fields/configuration necessary for a course to be publicly purchasable, membership-included, both, or neither.

Build /classroom and /classroom/[courseSlug] as polished public-facing pages using the REP 1 brand. The experience should be stronger than the current Academy list and suitable for prospective customers.

Implement entitlement-aware CTAs:
- entitled user -> Start/Continue Course
- active membership with included course -> Included / Start Course
- logged-in non-entitled user -> Purchase Course
- guest -> Sign In or Purchase flow as appropriate

Keep price configuration abstracted so Stripe price IDs and display amounts are not hard-coded into React components.

Do not implement insecure direct course access. Every lesson request must verify entitlement/enrollment server-side.

Run lint, typecheck, tests and build before stopping.
```

---

## MODULE 6 — Stripe Payments, Memberships, Orders, Entitlements

### Goal
Build real, secure payment flows.

### Payment architecture
Use Stripe Checkout for maximum implementation speed and PCI safety.

### Required flows
- create Stripe customer
- standalone course checkout
- membership/subscription checkout
- Elite Pacific access checkout
- verified webhook processing
- entitlement creation
- order records
- subscription records
- customer portal
- canceled/failed/expired handling

### Critical rule
**Never grant access based solely on the checkout success page.**
Access is granted from verified Stripe state / webhook processing.

### Required webhook events
At minimum evaluate and handle relevant events from:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Webhook handlers must be idempotent.

### Claude Code command
```text
Implement Module 6: Stripe billing, orders, subscriptions and entitlements.

Use Stripe Checkout and Stripe Customer Portal. Never collect card numbers in normal HTML inputs.

Add/normalize Prisma models for Order, OrderItem, Subscription and ProductEntitlement. Store Stripe customer IDs safely and keep business access state synchronized from verified Stripe events.

Implement checkout creation for:
1. standalone course purchase
2. REP 1 membership/subscription products
3. Elite Pacific recruiter access product

Pricing and recurring-vs-one-time behavior must come from Stripe configuration/database records, never hard-coded assumptions. The client discussion contains inconsistent pricing language, so architecture must remain flexible.

Implement Stripe webhook signature verification and idempotent event processing. Grant or revoke entitlements based on verified payment/subscription state. Never grant access merely because the user reached a success URL.

Implement Customer Portal access for subscription management.

Make webhook processing resilient to out-of-order and duplicate events. Prefer retrieving current Stripe object state when event ordering could produce stale local state.

Add tests for duplicate webhook processing, completed course purchase entitlement, active subscription entitlement and canceled subscription behavior.

Run migration, tests, lint, typecheck and build before stopping.
```

---

## MODULE 7 — Badge and Academy Completion System

### Goal
Award visible athlete achievements based on completion rules.

### Initial business rule
- completing required Academy courses can award an Academy badge
- course-specific badges should be supported later without schema changes

### Claude Code command
```text
Implement Module 7: badge and achievement system.

Add Badge and UserBadge models and a small criteria/evaluation service. Avoid hard-coding badge awards inside page components.

Implement an Academy completion rule that awards the configured Academy badge when the user has completed all required published Academy courses.

Badge awarding must be idempotent and safe to re-evaluate multiple times.

Display earned badges on the athlete dashboard and profile.

Create admin visibility for who earned which badge and when.

Add unit tests proving duplicate badge awards cannot occur and Academy badge qualification works correctly.

Run tests, lint, typecheck and build before stopping.
```

---

## MODULE 8 — AI Mock Interview

### Goal
Build an end-to-end interview product using OpenAI.

### Flow
1. select tier/template
2. create session
3. show one question at a time
4. save each answer
5. finalize
6. server sends interview data to OpenAI
7. validate structured response
8. persist per-answer grading + overall result
9. render results page

### AI output schema
```json
{
  "overallScore": 0,
  "summary": "",
  "questionResults": [
    {
      "questionId": "",
      "score": 0,
      "strengths": [],
      "weaknesses": [],
      "feedback": ""
    }
  ]
}
```

### Claude Code command
```text
Implement Module 8: AI Mock Interview.

Preserve the approved product concept from the existing mock interview screen, but redesign it into a polished step-by-step experience.

Add InterviewTemplate, InterviewQuestion, InterviewSession and InterviewAnswer models. Seed a small set of templates/tiers in a configurable way.

Interview sessions must persist as the user progresses. Show one question at a time with visible progress. Save answers server-side before moving forward.

At completion, call OpenAI from the server only. Request strict structured JSON containing an overall score, summary and per-question score/strengths/weaknesses/feedback. Validate the AI response with Zod before saving.

Never expose the OpenAI API key to the client. Add graceful timeout/error handling and a retry path if grading fails.

Create a polished results page with:
- overall score
- overall summary
- question-by-question scores
- strengths
- improvement areas
- actionable feedback
- CTA to retry another interview

Add interview history to the user experience.

Add tests around response validation and session ownership permissions.

Run tests, lint, typecheck and build before stopping.
```

---

## MODULE 9 — Elite Pacific Sports / Athlete Search

### Goal
Rebuild the Elite Pacific section into a polished recruiting experience.

### Required UI
- strong recruiting hero
- organization/about section
- recruiter access card
- athlete search
- filters
- athlete results cards/table
- athlete profile detail
- gated recruiter access

### Claude Code command
```text
Implement Module 9: Elite Pacific Sports recruiting module.

Use the existing Elite Pacific Bubble page as a brand/content reference only. Preserve the bold image-driven sports identity while improving hierarchy, responsiveness and conversion flow.

Build the main Elite Pacific page, recruiter access CTA, athlete search and athlete result cards. Reuse AthleteProfile data rather than creating a second athlete model.

Search should support sensible initial filters such as name, sport, position, graduation year and location if the data exists.

Enforce recruiter/paid-access permissions on server-side profile/search data where required. Do not rely only on hiding UI.

Build polished empty, loading and no-results states.

Run lint, typecheck, tests and build before stopping.
```

---

## MODULE 10 — Admin Panel

### Goal
Provide Marvin with an operational back office, not merely an analytics page.

### Admin dashboard
Show:
- total users
- active members
- recruiter subscriptions/access
- total course enrollments
- course completions
- interview attempts
- recent revenue
- recent signups

### Admin users
- search
- filters
- user detail
- suspend/reactivate
- inspect role/access
- inspect enrollments
- inspect badges
- inspect billing

### Admin academy
- create course
- edit course
- publish/unpublish
- create/reorder lessons
- pricing/access configuration
- inspect enrollments/completions

### Admin interviews
- templates
- questions
- attempts/results

### Admin billing
- orders
- subscriptions
- statuses
- Stripe identifiers
- no manual fake “paid” state

### Admin content
- badge management
- future content areas as required

### Claude Code command
```text
Implement Module 10: full REP 1 admin panel.

Use the current Bubble admin screen only as functional reference. Do not reproduce its extremely dense long-page layout. Redesign it into a proper admin information architecture with sidebar/subnavigation, dashboard overview and dedicated pages for users, courses, enrollments, interviews, billing, badges and settings.

Admin dashboard should show useful real metrics from the database.

Users page must provide search/filter, user status, role, membership/access, enrollments and detail view. Suspend/reactivate actions must be permission-checked and audited.

Courses admin must allow creating/editing courses, lesson content, ordering, publishing status and access configuration.

Billing admin must be read-oriented around Stripe-backed truth. Do not create fake paid records or let a local status override Stripe truth without an explicit safe admin workflow.

Create AuditLog records for meaningful admin mutations such as status changes, course publication changes and entitlement overrides.

Ensure all admin routes are server-protected.

Run tests, lint, typecheck and production build before stopping.
```

---

## MODULE 11 — Settings, Billing UI, Profile Polish

### Goal
Complete normal account management.

### User settings
- profile
- account
- password/auth-related controls where applicable
- billing
- subscription status
- customer portal CTA
- logout

### Claude Code command
```text
Implement Module 11: user settings, billing UI and profile polish.

Create clean settings sections for account/profile and billing. Display the user's current access/membership state using the entitlement/subscription system rather than hard-coded plan names.

Add Stripe Customer Portal action for eligible users. Show sensible states for no subscription, active, trialing, past due, canceled and access ending at period end where applicable.

Finish athlete profile presentation so badges and recruiting information are visually polished and consistent with the REP 1 design system.

Ensure all forms use validation, loading states and clear success/error feedback.

Run lint, typecheck, tests and build before stopping.
```

---

## MODULE 12 — Production Hardening, QA, Accessibility, Performance

### Goal
Make the application deployable and safe enough for production handoff.

### Required QA matrix
Test these flows:

#### Authentication
- signup
- login
- logout
- invalid credentials
- protected route redirect
- admin access rejection

#### Academy
- entitled user opens Academy
- enrollment
- course continuation
- lesson completion
- progress calculation
- full course completion
- badge award

#### Classroom
- guest browses
- user purchases standalone course
- entitlement becomes active after verified payment
- entitled user does not pay twice

#### Stripe
- successful checkout
- canceled checkout
- duplicate webhook
- subscription activation
- subscription cancellation
- payment failure handling
- customer portal

#### Interview
- start session
- answer all questions
- invalid AI response
- successful grading
- result persistence
- session ownership

#### Admin
- user listing
- filtering
- suspend/reactivate
- course CRUD
- billing visibility
- non-admin blocked

### Claude Code command
```text
Implement Module 12: production hardening and QA.

Perform a repository-wide review instead of adding unrelated features.

Fix inconsistent spacing, duplicate components, dead code, unsafe server/client boundaries, missing loading states, missing error states, permission gaps and obvious accessibility problems.

Add Playwright E2E coverage for the critical happy paths: authentication, Academy course access/progress, mock interview completion using a mocked AI layer where appropriate, admin authorization, and checkout redirect creation using a safe test strategy.

Verify all forms are validated server-side where required. Confirm all privileged mutations perform authorization checks.

Review pages at common desktop, tablet and mobile widths. Fix overflow, unusable tables, clipped controls and sidebar problems.

Run the complete test suite, lint, typecheck and `next build`. Do not stop with known build errors or ignored TypeScript errors.
```

---

## MODULE 13 — Vercel Deployment

### Required environment variables
Example categories:

```text
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

OPENAI_API_KEY=

NEXT_PUBLIC_APP_URL=
```

Provider-specific OAuth variables as required.

### Production tasks
- create production DB
- apply Prisma migration
- run seed only if safe
- configure Vercel project
- add environment variables
- deploy
- configure Stripe webhook URL
- verify webhook signing
- update Stripe success/cancel URLs if configuration requires
- smoke test production

### Claude Code command
```text
Prepare Module 13: production deployment for Vercel.

Do not expose secrets in committed files. Produce a complete `.env.example` containing variable names only.

Verify Prisma is production-compatible and migrations are committed. Add safe build/deployment scripts if needed.

Confirm Stripe webhook endpoint works with raw signed payload verification under the deployed Next.js runtime.

Run final local production build before deployment.

After deployment, perform a production smoke-test checklist covering homepage, login, dashboard protection, Academy access, Classroom, interview page, admin protection and Stripe webhook endpoint health.

Document any manual dashboard configuration still required in a concise DEPLOYMENT.md file.
```

---

# 10. 12-Hour Execution Schedule

The schedule is intentionally aggressive. Prioritize production-critical flows over secondary polish.

## Hour 0–0.5 — Repository + architecture bootstrap
- initialize project
- database
- environment setup
- base dependencies

## Hour 0.5–2.5 — UI foundation + high-priority screens
Complete:
- design system
- app shell
- public shell
- dashboard
- Academy visual structure
- Mock Interview visual structure
- Elite Pacific visual structure
- Admin shell

**Client checkpoint:** a polished static / semi-static demo should be available.

## Hour 2.5–4 — Auth + data models
- auth
- roles
- Prisma schema
- user/profile
- course domain

## Hour 4–6 — Academy + Classroom
- enrollments
- lesson reader
- progress
- course access
- classroom catalog

## Hour 6–7.5 — Stripe
- checkout
- webhook
- orders
- subscriptions
- entitlements
- customer portal

## Hour 7.5–9 — AI Interview
- sessions
- questions
- persistence
- OpenAI grading
- results

## Hour 9–10 — Admin
- metrics
- users
- course management
- billing visibility
- academy completion visibility

## Hour 10–11 — Integration QA
- authorization
- payment edge cases
- mobile responsiveness
- loading/error states
- tests

## Hour 11–12 — Deployment + production smoke test
- Vercel
- DB migrations
- Stripe webhook
- environment
- smoke tests
- emergency fixes

### If timeline slips
Cut in this order:
1. rich admin analytics charts
2. blog/events management
3. advanced recruiter filtering
4. sophisticated course editor
5. OAuth providers beyond essential auth

Never cut:
- auth security
- Stripe webhook verification
- entitlement enforcement
- database migrations
- responsive core flows
- build/typecheck

---

# 11. Claude Code Working Rules

These rules apply to every module.

```text
1. Inspect the repository before changing architecture.
2. Extend existing modules; do not create duplicate concepts.
3. Preserve the REP 1 design system created in Module 1.
4. Do not hard-code Stripe prices, user IDs, course IDs or API secrets.
5. Keep business logic in services/policies, not React components.
6. Validate input with Zod.
7. Authorize every privileged server action/route.
8. Use TypeScript strict mode. Do not solve errors with `any` unless unavoidable and documented.
9. Do not disable ESLint or TypeScript checks to make the build pass.
10. Add useful loading, empty and error states.
11. Avoid duplicating UI components.
12. Prefer server components for read-heavy pages where appropriate.
13. Keep client components as small as possible.
14. Never expose secret keys to browser code.
15. Run tests + lint + typecheck + production build at the end of every major module.
16. If an implementation conflicts with an earlier module, refactor the earlier abstraction rather than layering hacks.
17. Make database writes idempotent where duplicate external events are possible.
18. Keep future configurability in mind, but do not overengineer the 12-hour MVP.
```

---

# 12. Required Scripts

Claude should normalize scripts so these commands are available:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
```

---

# 13. Seed Data

Seed development with:
- one admin user
- one sample athlete
- six Academy courses
- lessons for at least one course to test full flow
- interview templates / sample questions
- Academy badge

Seed data must never expose production passwords or secrets.

---

# 14. Minimum Acceptance Criteria

The product is considered release-ready only when all of the following are true:

### Design
- UI clearly preserves REP 1's red/black athletic identity
- design is visibly more polished than Bubble reference
- desktop and mobile are usable
- new modules feel like one coherent product

### Authentication
- user can register/sign in/sign out
- routes are protected correctly
- admin access is server-enforced

### Academy
- user can enroll
- user can read lessons
- progress persists
- completion works
- badge award works

### Classroom
- standalone course can be browsed
- user can purchase
- verified payment grants access

### Stripe
- no raw card inputs
- webhook signatures verified
- duplicate webhook does not duplicate access/orders
- subscription/access status remains consistent

### Interview
- user can complete a full interview
- AI output is structured and validated
- results persist
- results can be viewed later

### Admin
- admin can inspect users
- admin can manage courses
- admin can inspect enrollments
- admin can inspect interviews
- admin can inspect orders/subscriptions

### Engineering
- `npm run lint` passes
- `npm run typecheck` passes
- `npm run test` passes
- `npm run build` passes
- no secrets committed

### Deployment
- production runs on Vercel
- production DB connected
- Stripe webhook configured
- OpenAI configured
- core smoke tests pass in production

---

# 15. Final Product Quality Bar

Claude must not treat this as a simple website conversion.

This is a SaaS rebuild with:
- authenticated users
- memberships
- paid course access
- learning progress
- AI workflows
- athlete/recruiter workflows
- Stripe-backed entitlements
- administration

The Bubble application is the **functional and brand reference**, not the final quality bar.

The final interface should feel like REP 1 was rebuilt by a modern product team while keeping the identity the client already recognizes.

---

# 16. Recommended First Command to Claude Code

Use this after the repository is created and all reference screenshots are placed in a visible project folder such as `/reference`:

```text
Read docs/MASTER_BUILD_SPEC.md completely before writing code.

Then inspect every image inside /reference and inspect the current repository.

Your first task is ONLY Module 1: Foundation, Design System and App Shell.

The Bubble screenshots are references for REP 1's brand identity and product hierarchy, not pixel-perfect mockups. Preserve the black/charcoal/red/white sports-tech identity while materially improving polish, spacing, typography, responsiveness and component consistency.

Do not implement later business modules yet.

Before finishing Module 1, run lint, typecheck and production build and fix every issue. Then give a concise summary of files created/changed, design tokens established and anything that needs a human product decision.
```

---

# 17. Human Decisions Still To Confirm

These should not block architecture, but should be confirmed before final production launch:

1. Exact REP 1 membership price(s)
2. Which payments are one-time vs recurring
3. Exact Elite Pacific Sports pricing/billing interval
4. Exact standalone course prices
5. Whether all Academy courses are included in membership
6. Whether Australian course is part of Academy, Classroom, or Elite Pacific
7. Exact Academy badge completion rule if not all published Academy courses are required
8. Final course content and lesson breakdown
9. Final interview tiers/questions
10. Recruiter visibility/privacy rules for athlete data
11. Whether users can self-delete accounts
12. Whether social login is required at launch

Architecture must allow these decisions to change without rewriting major modules.

