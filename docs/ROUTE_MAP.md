# REP 1 SaaS — Route & API Map

## Public Routes
- `/` — Marketing Home Page
- `/elite-pacific` — Elite Pacific Sports Information & Subscriptions
- `/classroom` — Course Storefront (Public & Authenticated views)
- `/pricing` — Platform Pricing Overview
- `/login` — Sign In
- `/signup` — Account Registration
- `/forgot-password` — Password Reset Request [NEW]
- `/reset-password` — Password Reset Form [NEW]

## Authenticated Platform Routes (Requires `ATHLETE` or `RECRUITER` or `ADMIN`)
- `/dashboard` — Personalized Athlete Dashboard
- `/academy` — Student Academy Classroom Overview
- `/courses/[slug]` — Course Player & Reader [NEW]
- `/interview` — AI Mock Interview Workspace
- `/settings` — Profile Settings & Billing Management
- `/recruiting/search` — Athlete Recruiter Search [NEW]
- `/athletes/[slug]` — Public / Recruiter Athlete Profile [NEW]

## Admin Routes (Requires `ADMIN` or `SUPER_ADMIN`)
- `/admin` — Admin Overview Dashboard
- `/admin/users` — User & Athlete Management [NEW]
- `/admin/courses` — Course & Curriculum Editor [NEW]
- `/admin/enrollments` — Student Enrollments Inspection [NEW]
- `/admin/interviews` — AI Interview Log & Reprocessing [NEW]
- `/admin/billing` — Subscriptions & Purchases Ledger [NEW]
- `/admin/badges` — Badge Definitions & Manual Grants [NEW]
- `/admin/audit` — Security & System Audit Trail [NEW]

## API Endpoints (`/api/*`)
- `/api/auth/*` — Session management & Auth actions
- `/api/profile` — Athlete profile updates
- `/api/courses/[slug]/progress` — Lesson completion & progress tracking
- `/api/interview/start` — Initialize interview attempt
- `/api/interview/answer` — Persist incremental answer
- `/api/interview/submit` — Finalize & grade interview with OpenAI
- `/api/stripe/checkout` — Generate Stripe Checkout Session
- `/api/stripe/portal` — Generate Stripe Billing Portal Session
- `/api/webhooks/stripe` — Process asynchronous Stripe webhook events
- `/api/admin/*` — Server-protected admin management endpoints
