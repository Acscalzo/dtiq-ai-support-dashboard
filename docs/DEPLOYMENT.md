# Vercel Deployment Guide

This guide walks you through deploying the DTIQ AI Support Dashboard to Vercel with multi-tenant subdomain support.

## Prerequisites

Before deploying, ensure you have:

### Accounts & Access
- [ ] **Vercel account** - Sign up at [vercel.com](https://vercel.com)
- [ ] **GitHub/GitLab/Bitbucket** - Repository connected to Vercel
- [ ] **Domain name** - A domain you control (e.g., `yourdomain.com`)
- [ ] **DNS access** - Ability to add DNS records for your domain

### Firebase Projects (one per company)
- [ ] DTIQ Firebase project created and configured
- [ ] Qwilt Firebase project created and configured
- [ ] PacketFabric Firebase project created and configured
- [ ] Welink Firebase project created and configured
- [ ] Element8 Firebase project created and configured

Each Firebase project needs:
- Authentication enabled (Email/Password, Google, etc.)
- Firestore database created
- Service account key generated (for Admin SDK)

### PostgreSQL Databases (one per company)
- [ ] DTIQ database provisioned
- [ ] Qwilt database provisioned
- [ ] PacketFabric database provisioned
- [ ] Welink database provisioned
- [ ] Element8 database provisioned

Recommended providers:
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com)
- [PlanetScale](https://planetscale.com)
- [Neon](https://neon.tech)

---

## Step 1: Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate via browser or email.

## Step 3: Link Your Project

Navigate to your project directory and link it to Vercel:

```bash
cd /path/to/dtiq-ai-support-dashboard

# Link to existing Vercel project or create new one
vercel link
```

Follow the prompts:
- Select your Vercel account/team
- Link to existing project or create new one
- Confirm the project settings

## Step 4: Configure Environment Variables

### Option A: Via Vercel CLI (Recommended)

Add each environment variable using the CLI:

```bash
# Shared services
vercel env add OPENAI_API_KEY production
vercel env add TWILIO_ACCOUNT_SID production
vercel env add TWILIO_AUTH_TOKEN production
vercel env add TWILIO_PHONE_NUMBER production

# DTIQ - Firebase Client (public)
vercel env add NEXT_PUBLIC_DTIQ_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_DTIQ_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_DTIQ_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_DTIQ_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_DTIQ_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_DTIQ_FIREBASE_APP_ID production

# DTIQ - Firebase Admin (server)
vercel env add DTIQ_FIREBASE_PROJECT_ID production
vercel env add DTIQ_FIREBASE_CLIENT_EMAIL production
vercel env add DTIQ_FIREBASE_PRIVATE_KEY production

# DTIQ - Database
vercel env add DTIQ_DATABASE_URL production

# Repeat for each company...
```

### Option B: Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the appropriate environment (Production, Preview, Development)

### Option C: Bulk Import from .env file

```bash
# Pull existing env vars (if any)
vercel env pull .env.production.local

# After editing, push all vars
vercel env add < .env.production
```

---

## Environment Variables Checklist

### Shared Variables (All Companies)

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes (if using phone) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes (if using phone) |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Yes (if using phone) |

### Per-Company Variables

Replace `{COMPANY}` with: `DTIQ`, `QWILT`, `PACKETFABRIC`, `WELINK`, `ELEMENT8`

#### Firebase Client-Side (Public)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_{COMPANY}_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_{COMPANY}_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_{COMPANY}_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_{COMPANY}_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_{COMPANY}_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_{COMPANY}_FIREBASE_APP_ID` | Firebase app ID |

#### Firebase Server-Side (Private)

| Variable | Description |
|----------|-------------|
| `{COMPANY}_FIREBASE_PROJECT_ID` | Firebase project ID |
| `{COMPANY}_FIREBASE_CLIENT_EMAIL` | Service account email |
| `{COMPANY}_FIREBASE_PRIVATE_KEY` | Service account private key |

#### Database

| Variable | Description |
|----------|-------------|
| `{COMPANY}_DATABASE_URL` | PostgreSQL connection string |

### Quick Copy-Paste Template

```bash
# ============================================
# SHARED SERVICES
# ============================================
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ============================================
# DTIQ
# ============================================
NEXT_PUBLIC_DTIQ_FIREBASE_API_KEY=
NEXT_PUBLIC_DTIQ_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_DTIQ_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_DTIQ_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_DTIQ_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_DTIQ_FIREBASE_APP_ID=
DTIQ_FIREBASE_PROJECT_ID=
DTIQ_FIREBASE_CLIENT_EMAIL=
DTIQ_FIREBASE_PRIVATE_KEY=
DTIQ_DATABASE_URL=

# ============================================
# QWILT
# ============================================
NEXT_PUBLIC_QWILT_FIREBASE_API_KEY=
NEXT_PUBLIC_QWILT_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_QWILT_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_QWILT_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_QWILT_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_QWILT_FIREBASE_APP_ID=
QWILT_FIREBASE_PROJECT_ID=
QWILT_FIREBASE_CLIENT_EMAIL=
QWILT_FIREBASE_PRIVATE_KEY=
QWILT_DATABASE_URL=

# ============================================
# PACKETFABRIC
# ============================================
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_API_KEY=
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_APP_ID=
PACKETFABRIC_FIREBASE_PROJECT_ID=
PACKETFABRIC_FIREBASE_CLIENT_EMAIL=
PACKETFABRIC_FIREBASE_PRIVATE_KEY=
PACKETFABRIC_DATABASE_URL=

# ============================================
# WELINK
# ============================================
NEXT_PUBLIC_WELINK_FIREBASE_API_KEY=
NEXT_PUBLIC_WELINK_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_WELINK_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_WELINK_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_WELINK_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_WELINK_FIREBASE_APP_ID=
WELINK_FIREBASE_PROJECT_ID=
WELINK_FIREBASE_CLIENT_EMAIL=
WELINK_FIREBASE_PRIVATE_KEY=
WELINK_DATABASE_URL=

# ============================================
# ELEMENT8
# ============================================
NEXT_PUBLIC_ELEMENT8_FIREBASE_API_KEY=
NEXT_PUBLIC_ELEMENT8_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_ELEMENT8_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_ELEMENT8_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_ELEMENT8_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_ELEMENT8_FIREBASE_APP_ID=
ELEMENT8_FIREBASE_PROJECT_ID=
ELEMENT8_FIREBASE_CLIENT_EMAIL=
ELEMENT8_FIREBASE_PRIVATE_KEY=
ELEMENT8_DATABASE_URL=
```

---

## Step 5: Deploy to Production

```bash
# Deploy to production
vercel --prod
```

This will:
1. Build your Next.js application
2. Deploy to Vercel's edge network
3. Assign a `.vercel.app` URL

Note the deployment URL (e.g., `your-project.vercel.app`).

---

## Step 6: Configure Custom Domain

### Add Domain in Vercel

```bash
# Add your root domain
vercel domains add yourdomain.com

# Add wildcard subdomain for multi-tenant support
vercel domains add "*.yourdomain.com"
```

Or via Dashboard:
1. Go to **Project Settings** → **Domains**
2. Add `yourdomain.com`
3. Add `*.yourdomain.com` (wildcard)

### DNS Configuration

Add these DNS records at your domain registrar/DNS provider:

#### For Root Domain

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 3600 |

#### For Wildcard Subdomain (Multi-tenant)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | * | `cname.vercel-dns.com` | 3600 |

**Alternative:** If your DNS provider doesn't support wildcard CNAME, add individual subdomains:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | dtiq | `cname.vercel-dns.com` | 3600 |
| CNAME | qwilt | `cname.vercel-dns.com` | 3600 |
| CNAME | packetfabric | `cname.vercel-dns.com` | 3600 |
| CNAME | welink | `cname.vercel-dns.com` | 3600 |
| CNAME | element8 | `cname.vercel-dns.com` | 3600 |

### Verify DNS Propagation

Check if DNS records have propagated:

```bash
# Check A record
dig yourdomain.com A

# Check CNAME wildcard
dig dtiq.yourdomain.com CNAME
dig qwilt.yourdomain.com CNAME

# Or use nslookup
nslookup dtiq.yourdomain.com
```

Online tools:
- [DNS Checker](https://dnschecker.org)
- [What's My DNS](https://whatsmydns.net)

DNS propagation typically takes 5-30 minutes but can take up to 48 hours.

### Verify Domain in Vercel

```bash
vercel domains inspect yourdomain.com
```

Or check the Vercel Dashboard for green checkmarks next to your domains.

---

## Step 7: Post-Deployment Testing

### Test Each Subdomain

| Company | URL | Expected Color |
|---------|-----|----------------|
| DTIQ | https://dtiq.yourdomain.com | Blue (#0066CC) |
| Qwilt | https://qwilt.yourdomain.com | Purple (#8B5CF6) |
| PacketFabric | https://packetfabric.yourdomain.com | Green (#10B981) |
| Welink | https://welink.yourdomain.com | Amber (#F59E0B) |
| Element8 | https://element8.yourdomain.com | Red (#EF4444) |

### Verification Checklist

For each subdomain, verify:

#### Branding
- [ ] Correct company name in header
- [ ] Correct logo text/initials
- [ ] Correct tagline
- [ ] Correct primary color throughout UI
- [ ] CSS variables applied (check DevTools)

#### Authentication
- [ ] Login page loads
- [ ] Can create new account
- [ ] Can sign in with existing account
- [ ] Can sign out
- [ ] Auth state persists on refresh

#### Database
- [ ] Data loads correctly
- [ ] Can create new records
- [ ] Can update existing records
- [ ] Data is isolated per company (records from Company A don't appear in Company B)

#### API Endpoints
- [ ] `/api/health` returns 200
- [ ] `/api/tickets` returns tickets
- [ ] `/api/search` works
- [ ] API errors handled gracefully

### Quick Smoke Test Script

```bash
#!/bin/bash
DOMAIN="yourdomain.com"
COMPANIES=("dtiq" "qwilt" "packetfabric" "welink" "element8")

for company in "${COMPANIES[@]}"; do
  echo "Testing $company.$DOMAIN..."

  # Check if site loads
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$company.$DOMAIN")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Site loads (HTTP $HTTP_CODE)"
  else
    echo "  ✗ Site failed (HTTP $HTTP_CODE)"
  fi

  # Check API health
  API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$company.$DOMAIN/api/health")

  if [ "$API_CODE" = "200" ]; then
    echo "  ✓ API healthy (HTTP $API_CODE)"
  else
    echo "  ✗ API unhealthy (HTTP $API_CODE)"
  fi

  echo ""
done
```

---

## Troubleshooting

### Wrong Branding Showing

**Symptom:** Visiting `qwilt.yourdomain.com` shows DTIQ branding

**Causes & Solutions:**

1. **DNS not propagated yet**
   ```bash
   # Check current DNS resolution
   dig qwilt.yourdomain.com
   ```
   Wait for DNS propagation or flush local DNS cache.

2. **Middleware not detecting subdomain**
   - Check Vercel function logs for `x-company` header value
   - Ensure `middleware.ts` is deployed (check build output)

3. **Browser caching old version**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Clear browser cache
   - Test in incognito mode

4. **Vercel edge caching**
   ```bash
   # Trigger redeployment
   vercel --prod --force
   ```

### Database Connection Errors

**Symptom:** "Failed to connect to database" or Prisma errors

**Causes & Solutions:**

1. **Environment variable not set**
   ```bash
   # Verify env var exists
   vercel env ls | grep DATABASE_URL
   ```

2. **Wrong company prefix**
   - Ensure using `{COMPANY}_DATABASE_URL` format
   - Example: `DTIQ_DATABASE_URL`, not `DTIQ_DB_URL`

3. **Database not accessible from Vercel**
   - Check database firewall/allowlist settings
   - Add Vercel's IP ranges if needed
   - For Vercel Postgres, this is automatic

4. **Connection string format**
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```
   Ensure `sslmode=require` for production databases.

5. **Connection pool exhaustion**
   - Use connection pooling (PgBouncer, Prisma Accelerate)
   - Check `src/lib/db/prisma.ts` pool settings

### Authentication Not Working

**Symptom:** Can't sign in, Firebase errors in console

**Causes & Solutions:**

1. **Firebase environment variables missing**
   ```bash
   vercel env ls | grep FIREBASE
   ```
   Ensure both `NEXT_PUBLIC_*` (client) and server-side vars are set.

2. **Firebase authorized domains**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add: `yourdomain.com`, `*.yourdomain.com`, `*.vercel.app`

3. **Firebase private key formatting**
   The private key must include newlines. In Vercel, paste the entire key including:
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvgIBADANBg...
   -----END PRIVATE KEY-----
   ```

4. **Wrong Firebase project for subdomain**
   - Check browser console for Firebase project ID being used
   - Verify `NEXT_PUBLIC_{COMPANY}_FIREBASE_*` vars match correct project

### 500 Errors on API Routes

**Symptom:** API calls return 500 Internal Server Error

**Debugging steps:**

1. **Check Vercel function logs**
   ```bash
   vercel logs --follow
   ```
   Or via Dashboard: **Deployments** → Select deployment → **Functions** tab

2. **Check for missing environment variables**
   - API routes may fail silently if env vars are missing
   - Verify all required vars are set for all environments

3. **Check Prisma schema sync**
   ```bash
   # Ensure schema is in sync with database
   npx prisma db push
   ```

4. **Memory/timeout limits**
   - Default Vercel function timeout: 10s (Hobby), 60s (Pro)
   - Upgrade plan or optimize slow operations

### SSL/HTTPS Issues

**Symptom:** SSL certificate errors, mixed content warnings

**Solutions:**

1. **Wait for certificate provisioning**
   - Vercel auto-provisions SSL certificates
   - Can take up to 24 hours for new domains

2. **Check domain configuration**
   ```bash
   vercel domains inspect yourdomain.com
   ```
   Ensure "Valid Configuration" and "SSL Certificate" show green.

3. **Force HTTPS in middleware** (already handled by Vercel)

### Deployment Fails

**Symptom:** Build or deployment errors

**Solutions:**

1. **Check build logs**
   ```bash
   vercel logs
   ```

2. **Test build locally**
   ```bash
   npm run build
   ```

3. **Check Node.js version**
   - Ensure `package.json` specifies compatible Node version
   - Or add to `vercel.json`:
   ```json
   {
     "functions": {
       "api/**/*.ts": {
         "runtime": "nodejs20.x"
       }
     }
   }
   ```

4. **Check for TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

---

## Monitoring & Maintenance

### Set Up Alerts

1. Go to Vercel Dashboard → **Project Settings** → **Notifications**
2. Configure alerts for:
   - Deployment failures
   - Function errors
   - Domain issues

### View Analytics

Vercel provides built-in analytics:
- **Analytics** tab: Page views, performance metrics
- **Speed Insights**: Core Web Vitals
- **Logs**: Real-time function logs

### Updating Environment Variables

When updating env vars:

```bash
# Update a variable
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production

# Redeploy to apply changes
vercel --prod
```

**Important:** Changes to `NEXT_PUBLIC_*` variables require a full rebuild since they're embedded at build time.

### Rolling Back Deployments

If a deployment causes issues:

```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote [deployment-url]
```

Or via Dashboard: **Deployments** → Select deployment → **...** → **Promote to Production**

---

## Security Checklist

Before going live:

- [ ] All sensitive env vars are marked as "Sensitive" in Vercel
- [ ] Firebase security rules are configured (not in test mode)
- [ ] Database user has minimal required permissions
- [ ] CORS is properly configured
- [ ] Rate limiting is in place for API routes
- [ ] Error messages don't leak sensitive information
- [ ] Audit logging is enabled

---

## Quick Reference

### Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs --follow

# List deployments
vercel ls

# Add environment variable
vercel env add NAME production

# List environment variables
vercel env ls

# Pull env vars to local file
vercel env pull .env.local

# Add domain
vercel domains add example.com

# Inspect domain status
vercel domains inspect example.com

# Promote deployment
vercel promote [url]
```

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
- [GitHub Issues](https://github.com/your-repo/issues)
