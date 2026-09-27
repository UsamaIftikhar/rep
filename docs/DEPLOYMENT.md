# REP 1 SaaS — DigitalOcean Droplet & Production Deployment Guide

## 1. Quick Start: Deploying from Any New Device / Laptop

To deploy the latest code to production from any laptop or environment:

1. **Clone the repository**:
   ```bash
   git clone git@github.com:UsamaIftikhar/rep.git
   cd rep
   ```

2. **Pull the latest `main` branch**:
   ```bash
   git pull origin main
   ```

3. **Install Python dependencies (if needed)**:
   ```bash
   pip3 install paramiko
   ```

4. **Ensure your local `.env` file exists** (copy `.env.example` to `.env` if needed).

5. **Run the Automated One-Command Deployer**:
   ```bash
   python3 scripts/deploy.py
   ```
   *This script automatically connects to the production DigitalOcean Droplet via SSH, uploads the codebase, syncs environment variables, updates the PostgreSQL database with Prisma, builds the Next.js production bundle, and restarts the PM2 service.*

---

## 2. Production Server Details

| Property | Value |
| :--- | :--- |
| **Provider** | DigitalOcean |
| **Server Host IP** | `192.81.211.174` |
| **SSH User** | `root` |
| **SSH Password** | `qz2@WC2G8YcXmVd` |
| **Web Root Path** | `/var/www/rep1` |
| **PM2 Process Name** | `rep1-saas` |
| **Production Domain** | `https://rep1exposure.com` |

---

## 3. Production Environment Variables Reference (`.env`)

Below is the structure of environment variables used by the application and synced during deployment:

```bash
# PostgreSQL Database Connection String
DATABASE_URL="postgresql://rep1_user:REP1_Secure_Db_Pass_2026!@localhost:5432/rep1_db?schema=public"

# Auth & Security
JWT_SECRET="<YOUR_PRODUCTION_JWT_SECRET>"
NEXTAUTH_URL="https://rep1exposure.com"

# OpenAI API (For AI Interview Prep & Evaluations)
OPENAI_API_KEY="<YOUR_OPENAI_API_KEY>"

# Stripe Live Configuration
STRIPE_SECRET_KEY="<YOUR_STRIPE_SECRET_KEY>"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="<YOUR_STRIPE_PUBLISHABLE_KEY>"
STRIPE_WEBHOOK_SECRET="<YOUR_STRIPE_WEBHOOK_SECRET>"

# Live Stripe Price IDs
STRIPE_PRICE_ATHLETE="price_1UFcWc9kvZo5XvSYDIsfI2Jd"        # $29.99 US Athlete Pass
STRIPE_PRICE_ELITE_PACIFIC="price_1UGhDP9kvZo5XvSYLi8PsBfY"   # $75.00 International Athlete Pass
STRIPE_PRICE_RECRUITER="price_1UJwRd9kvZo5XvSYcqTWSDnT"       # $49.99 College Coach / Recruiter Pass (Product ID: prod_VKbeDGxYQN3XVj)
STRIPE_PRICE_COURSE="price_1UFcTq9kvZo5XvSYon8PPFaF"          # $9.99 Standalone Course

# Miro OAuth Integration
MIRO_CLIENT_ID="3458764684783681395"
MIRO_CLIENT_SECRET="<YOUR_MIRO_CLIENT_SECRET>"
MIRO_REDIRECT_URI="https://rep1exposure.com/api/integrations/miro/callback"

# Zoom OAuth & Webhook Integration
ZOOM_CLIENT_ID="XJbicRe0T8WXEOX0K1hnNg"
ZOOM_CLIENT_SECRET="<YOUR_ZOOM_CLIENT_SECRET>"
ZOOM_REDIRECT_URI="https://rep1exposure.com/api/integrations/zoom/callback"
ZOOM_WEBHOOK_SECRET="SyAFBlymRKGqe-mPLOWDHg"
ZOOM_DELETE_AFTER_UPLOAD="false"
ZOOM_SDK_KEY="XJbicRe0T8WXEOX0K1hnNg"
ZOOM_SDK_SECRET="<YOUR_ZOOM_SDK_SECRET>"

# DigitalOcean Spaces Object Storage (CDN: https://rep1.nyc3.digitaloceanspaces.com)
SPACES_KEY="DO00DTMD2MR9RDBK4ZMZ"
SPACES_SECRET="<YOUR_SPACES_SECRET>"
SPACES_ENDPOINT="https://nyc3.digitaloceanspaces.com"
SPACES_BUCKET="rep1"
SPACES_REGION="nyc3"
SPACES_PUBLIC_URL="https://rep1.nyc3.digitaloceanspaces.com"

# Email Configuration (Gmail SMTP & Resend API)
NOTIFICATION_EMAIL="jrmarvinconstant@gmail.com, usamaiftikhar59@gmail.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="jrmarvinconstant@gmail.com"
SMTP_PASS="<YOUR_SMTP_PASS>"
SMTP_FROM="\"REP 1 Sports\" <noreply@rep1exposure.com>"
RESEND_API_KEY="<YOUR_RESEND_API_KEY>"
RESEND_FROM="REP 1 Sports <noreply@rep1exposure.com>"
```

---

## 4. Manual Deployment Workflow (Optional Alternative)

If you prefer deploying manually via SSH instead of `scripts/deploy.py`:

```bash
# 1. Connect to production server
ssh root@192.81.211.174

# 2. Go to production web root
cd /var/www/rep1

# 3. Pull latest changes
git pull origin main

# 4. Install dependencies & sync database
npm install --legacy-peer-deps
npx prisma db push

# 5. Build Next.js production bundle
npm run build

# 6. Restart PM2 service
pm2 restart rep1-saas --update-env
```

---

## 5. Post-Deployment Verification Checklist

1. **Public Site**: Open `https://rep1exposure.com/` and confirm landing page renders cleanly.
2. **Recruiter Signup Flow**: Visit `https://rep1exposure.com/signup?plan=recruiter` and confirm Recruiter Pass is preselected at **$49.99/yr**.
3. **Shareable Profiles**: Open an athlete profile link (e.g., `https://rep1exposure.com/athletes/[slug]`) and verify that unauthenticated visitors are prompted to join as a recruiter for $49.99/yr.
4. **Academy & Courses**: Access `/academy` and confirm video player / Zoom embeds render without module resolution errors.
