# REP 1 SaaS — DigitalOcean Droplet & Production Deployment Guide

## 1. Target Architecture & Environment

- **Host**: DigitalOcean Droplet (Ubuntu 22.04 LTS, 2GB+ RAM recommended)
- **Runtime**: Node.js 20.x LTS, PM2 Process Manager, Nginx Reverse Proxy
- **Database Engine**: PostgreSQL 15+ (DigitalOcean Managed PostgreSQL or local PostgreSQL instance)
- **SSL / HTTPS**: Certbot (Let's Encrypt)
- **Domain & Webhooks**: Production domain pointing to Droplet IP with Stripe webhook receiver at `/api/webhooks/stripe`.

---

## 2. Environment Variables Checklist (`.env.production`)

Create `.env.production` on your server with the following required variables:

```bash
# Server Environment
NODE_ENV="production"
PORT="3000"
NEXTAUTH_URL="https://your-domain.com" # Or public production URL

# PostgreSQL Database Connection String
DATABASE_URL="postgresql://username:password@localhost:5432/rep1_db?schema=public&sslmode=prefer"

# Server JWT Security Secret (Minimum 32 random characters)
JWT_SECRET="your_production_secure_jwt_secret_32_characters_min"

# Stripe Payments Configuration
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# OpenAI API Key (For AI Interview Evaluation)
OPENAI_API_KEY="sk-proj-..."
```

---

## 3. Server Setup Instructions (DigitalOcean Droplet)

### Step 1: Install Node.js 20, PostgreSQL & PM2
```bash
# Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Database Initialization
```bash
# Log into PostgreSQL
sudo -u postgres psql

# Create Database and User
CREATE DATABASE rep1_db;
CREATE USER rep1_user WITH PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE rep1_db TO rep1_user;
\q
```

### Step 3: Clone Repository & Deploy Build
```bash
# Clone project into /var/www/rep1
sudo mkdir -p /var/www/rep1
sudo chown -R $USER:$USER /var/www/rep1
cd /var/www/rep1

# Copy project files & install production dependencies
npm install

# Run Prisma Database Schema Sync & Seed
npx prisma db push
npx tsx prisma/seed.ts

# Build Next.js Production Bundle
npm run build
```

### Step 4: Start App with PM2
```bash
# Start Next.js with PM2
pm2 start npm --name "rep1-saas" -- start

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

### Step 5: Configure Nginx & Let's Encrypt SSL
```nginx
# /etc/nginx/sites-available/rep1
server {
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site & apply SSL certificate
sudo ln -s /etc/nginx/sites-available/rep1 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtain free SSL Certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 4. Post-Deployment Verification & Smoke Test

1. Navigate to `https://your-domain.com/` and confirm public home page renders with imagery.
2. Sign up a test athlete account and confirm `AthleteProfile` and session cookie creation.
3. Test Student Academy course player at `/courses/financial-literacy`.
4. Test Mock AI Interview tier attempt at `/interview`.
5. Test Admin panel role enforcement at `/admin`.
