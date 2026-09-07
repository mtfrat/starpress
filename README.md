# StarPress

Turn Google Reviews Into Revenue. Embed reviews on your website, get AI-powered insights, and grow your business.

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Apify (Review scraping)
- OpenAI GPT-4o (AI analysis)
- Stripe (Payments)
- Resend (Emails)
- Sentry (Error tracking)

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Apify account
- OpenAI account
- Stripe account
- Resend account (optional)
- Sentry account (optional)

## Setup

1. Clone the repo
   git clone https://github.com/mtfrat/starpress.git

2. Install dependencies
   npm install

3. Copy .env.example to .env.local
   cp .env.example .env.local

4. Fill in your API keys in .env.local

5. Run database migrations in Supabase SQL Editor
   - supabase/migrations/001_initial_schema.sql
   - supabase/migrations/002_add_widget_type.sql
   - supabase/migrations/003_add_feedback.sql
   - supabase/migrations/004_add_gbp_tokens.sql
   - supabase/migrations/005_add_webhooks.sql
   - supabase/migrations/006_add_sort_by.sql

6. Start development server
   npm run dev

## Scripts
- npm run dev - Start development server
- npm run build - Build for production
- npm run start - Start production server
- npm run test - Run tests in watch mode
- npm run test:run - Run tests once
- npm run lint - Run linter
- npm run check:stripe - Verify Stripe configuration

## Project Structure

```
starpress/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── analyze/        # AI review analysis
│   │   │   ├── alerts/         # Review alerts
│   │   │   ├── email/          # Email endpoints
│   │   │   ├── gbp/            # Google Business Profile
│   │   │   ├── health/         # Health check
│   │   │   ├── locations/      # Location management
│   │   │   ├── stripe/         # Payment processing
│   │   │   └── widget/         # Public widget API
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── onboarding/         # Onboarding wizard
│   │   ├── pricing/            # Pricing page
│   │   ├── settings/           # Settings page
│   │   └── widget-config/      # Widget configuration
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard tabs
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utility functions
│   │   ├── supabase/           # Supabase client setup
│   │   ├── email-templates/    # Email templates
│   │   ├── rate-limit.ts       # Rate limiting
│   │   ├── retry.ts            # Retry logic
│   │   └── stripe.ts           # Stripe helpers
│   ├── types/                  # TypeScript types
│   └── middleware.ts           # Auth middleware
├── public/                     # Static assets
├── scripts/                    # Utility scripts
└── supabase/                   # Database migrations
```

## Deployment
See docs/DEPLOYMENT.md
