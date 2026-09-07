# Deployment Guide

## Pre-Deploy Checklist

- [ ] All environment variables are set
- [ ] Database migrations are applied
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:run` passes
- [ ] Sentry is configured (optional)
- [ ] Stripe webhook endpoint is set
- [ ] Custom domain is configured (optional)

## Vercel Setup

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Next.js framework
4. Click "Deploy"

## Environment Variables

Set the following in Vercel → Settings → Environment Variables:

### Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APIFY_API_TOKEN
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL (set to your production URL)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_YEARLY_PRICE_ID
```

### Optional
```
RESEND_API_KEY
FEEDBACK_ALERT_FROM
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
GOOGLE_GBP_CLIENT_ID
GOOGLE_GBP_CLIENT_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_ANALYTICS_ID
```

## Domain Configuration

### Using Vercel Domain
1. Vercel provides a `.vercel.app` domain by default
2. Update `NEXT_PUBLIC_APP_URL` to your domain

### Custom Domain
1. Go to Vercel → Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## DNS Setup

### For apex domain (e.g., starpress.app)
Add these DNS records at your registrar:
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

### For subdomain (e.g., app.starpress.app)
Add these DNS records:
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

## SSL Verification

Vercel automatically provisions SSL certificates for all domains. Verify:
1. Check Vercel dashboard → your project → Domains
2. SSL status should show "Valid"
3. Visit your site with `https://` prefix

## Post-Deploy Verification

1. **Health Check**: Visit `/api/health` - should return `{"status":"ok"}`
2. **Authentication**: Test login/signup flow
3. **Widget**: Test public widget endpoint `/api/widget/{locationId}`
4. **Stripe**: Test checkout and webhook
5. **Email**: Verify welcome emails are sent
6. **AI Analysis**: Test analysis endpoint (requires Pro plan)

## Updating Environment Variables

1. Go to Vercel → Settings → Environment Variables
2. Update the variable value
3. Click "Save"
4. Redeploy the project

## Troubleshooting

### Build Fails
- Check environment variables are set
- Ensure all dependencies are installed
- Check build logs in Vercel dashboard

### 500 Errors
- Check Sentry for error details
- Verify Supabase connection
- Check API keys are correct

### Widget Not Loading
- Verify `/api/widget/[locationId]` endpoint is accessible
- Check CORS settings if embedding on external sites
