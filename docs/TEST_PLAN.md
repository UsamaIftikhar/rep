# REP 1 SaaS — Production QA & Test Plan

## 1. Test Architecture Overview

This test plan defines the automated and manual verification protocols for REP 1 SaaS.

## 2. Test Execution Matrix

### Module 1: Authentication & Authorization
- [x] **Sign Up**: Verify user registration creates `User` and `AthleteProfile` records.
- [x] **Sign In**: Verify valid credentials yield session cookie and `UserStatus.ACTIVE` check.
- [x] **Protected Routes**: Verify unauthenticated requests to `/dashboard`, `/academy`, `/settings`, `/interview`, `/recruiting` redirect to `/login`.
- [x] **Admin Guard**: Verify non-admin role accessing `/admin` redirects to `/dashboard`.

### Module 2: Athlete Profile & Settings
- [x] **Profile Persistence**: Verify patching profile updates `schoolClub`, `graduationYear`, `location`, `sport`, `position`, `bio`, `highlightVideoUrl`.
- [x] **Profile Completeness**: Verify score recalculation formula (0%–100%).
- [x] **Privacy Safe**: Verify `profileVisibility === false` hides profile from unauthenticated/non-owner requests.

### Module 3 & 4: Student Academy & Course Player
- [x] **Curriculum Seeding**: Verify 6 required Academy courses exist with order and published state.
- [x] **Enrollment**: Verify user enrollment creates `Enrollment` with `IN_PROGRESS` status.
- [x] **Lesson Reader**: Verify lesson navigation and progress percentage calculations.
- [x] **Badge Auto-Award**: Verify completing all 6 required classes awards `ACADEMY_GRADUATE` badge.

### Module 5 & 6: Classroom & Entitlement System
- [x] **Centralized Helpers**: Test `canAccessAcademy()`, `canAccessCourse()`, `canAccessElitePacific()`.
- [x] **Classroom Storefront**: Test dynamic CTA rendering based on entitlement status.

### Module 7: Stripe Integration & Webhooks
- [x] **Checkout Creation**: Verify checkout session parameters for `SUBSCRIPTION`, `COURSE`, `ELITE_PACIFIC`.
- [x] **Webhook Idempotency**: Verify duplicate `checkout.session.completed` events do not duplicate purchases or entitlements.

### Module 8: AI Mock Interview
- [x] **Attempt Initialization**: Test creating `InterviewAttempt` for `beginner`, `intermediate`, `pro`.
- [x] **Answer Persistence**: Verify saving answers incrementally per question.
- [x] **Structured AI Grading**: Verify OpenAI response parsing against Zod schema.

### Module 9 & 10: Recruiting Search & Elite Pacific
- [x] **Recruiter Search**: Test searching by name, sport, position, and graduation year.
- [x] **Privacy Filter**: Test excluding hidden profiles from directory search responses.

### Module 11 & 12: Dashboard & Admin Portal
- [x] **Dashboard Metrics**: Test personalized welcome and active completion widgets.
- [x] **Admin Metrics**: Test database aggregation for total users, subscriptions, enrollments, and interviews.
- [x] **Admin Management**: Test role updates (`ATHLETE` -> `ADMIN`) and status toggles (`ACTIVE` -> `SUSPENDED`).
