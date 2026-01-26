# Local Testing Setup for Multi-Tenant Development

This guide explains how to set up your local environment to test the multi-tenant subdomain functionality.

## Overview

The dashboard uses subdomains to identify which company's branding and data to display:
- `dtiq.localhost:3000` → DTIQ branding
- `qwilt.localhost:3000` → Qwilt branding
- `packetfabric.localhost:3000` → PacketFabric branding
- `welink.localhost:3000` → Welink branding
- `element8.localhost:3000` → Element8 branding

## Step 1: Configure Your Hosts File

You need to add subdomain entries to your computer's hosts file so that `*.localhost` resolves correctly.

### Mac / Linux

1. Open Terminal
2. Edit the hosts file with sudo:
   ```bash
   sudo nano /etc/hosts
   ```
3. Add these lines at the end of the file:
   ```
   # DTIQ AI Support Dashboard - Multi-tenant testing
   127.0.0.1   dtiq.localhost
   127.0.0.1   qwilt.localhost
   127.0.0.1   packetfabric.localhost
   127.0.0.1   welink.localhost
   127.0.0.1   element8.localhost
   ```
4. Save the file:
   - Press `Ctrl + O` to write
   - Press `Enter` to confirm
   - Press `Ctrl + X` to exit
5. Flush DNS cache (optional but recommended):
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemctl restart systemd-resolved
   ```

### Windows

1. Open Notepad **as Administrator**:
   - Right-click Notepad
   - Select "Run as administrator"
2. Open the hosts file:
   - File → Open
   - Navigate to `C:\Windows\System32\drivers\etc\`
   - Change file filter from "Text Documents" to "All Files"
   - Select `hosts` and click Open
3. Add these lines at the end:
   ```
   # DTIQ AI Support Dashboard - Multi-tenant testing
   127.0.0.1   dtiq.localhost
   127.0.0.1   qwilt.localhost
   127.0.0.1   packetfabric.localhost
   127.0.0.1   welink.localhost
   127.0.0.1   element8.localhost
   ```
4. Save the file (File → Save)
5. Flush DNS cache:
   ```cmd
   ipconfig /flushdns
   ```

## Step 2: Set Up Environment Variables

Create or update your `.env.local` file with company-prefixed variables. Each company needs its own set of credentials.

### Minimum Required Variables

```bash
# ===========================================
# SHARED SERVICES (used by all companies)
# ===========================================
OPENAI_API_KEY=sk-your-openai-key

# Twilio (for AI phone receptionist)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# ===========================================
# DTIQ Configuration
# ===========================================

# Firebase (Client-side - must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_DTIQ_FIREBASE_API_KEY=your-dtiq-firebase-api-key
NEXT_PUBLIC_DTIQ_FIREBASE_AUTH_DOMAIN=dtiq-project.firebaseapp.com
NEXT_PUBLIC_DTIQ_FIREBASE_PROJECT_ID=dtiq-project
NEXT_PUBLIC_DTIQ_FIREBASE_STORAGE_BUCKET=dtiq-project.appspot.com
NEXT_PUBLIC_DTIQ_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_DTIQ_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase (Server-side - Admin SDK)
DTIQ_FIREBASE_PROJECT_ID=dtiq-project
DTIQ_FIREBASE_CLIENT_EMAIL=firebase-adminsdk@dtiq-project.iam.gserviceaccount.com
DTIQ_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Database
DTIQ_DATABASE_URL=postgresql://user:password@localhost:5432/dtiq_db

# ===========================================
# QWILT Configuration
# ===========================================

NEXT_PUBLIC_QWILT_FIREBASE_API_KEY=your-qwilt-firebase-api-key
NEXT_PUBLIC_QWILT_FIREBASE_AUTH_DOMAIN=qwilt-project.firebaseapp.com
NEXT_PUBLIC_QWILT_FIREBASE_PROJECT_ID=qwilt-project
NEXT_PUBLIC_QWILT_FIREBASE_STORAGE_BUCKET=qwilt-project.appspot.com
NEXT_PUBLIC_QWILT_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_QWILT_FIREBASE_APP_ID=1:987654321:web:def456

QWILT_FIREBASE_PROJECT_ID=qwilt-project
QWILT_FIREBASE_CLIENT_EMAIL=firebase-adminsdk@qwilt-project.iam.gserviceaccount.com
QWILT_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

QWILT_DATABASE_URL=postgresql://user:password@localhost:5432/qwilt_db

# ===========================================
# PACKETFABRIC Configuration
# ===========================================

NEXT_PUBLIC_PACKETFABRIC_FIREBASE_API_KEY=your-packetfabric-firebase-api-key
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_AUTH_DOMAIN=packetfabric-project.firebaseapp.com
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_PROJECT_ID=packetfabric-project
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_STORAGE_BUCKET=packetfabric-project.appspot.com
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_MESSAGING_SENDER_ID=111222333
NEXT_PUBLIC_PACKETFABRIC_FIREBASE_APP_ID=1:111222333:web:ghi789

PACKETFABRIC_FIREBASE_PROJECT_ID=packetfabric-project
PACKETFABRIC_FIREBASE_CLIENT_EMAIL=firebase-adminsdk@packetfabric-project.iam.gserviceaccount.com
PACKETFABRIC_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

PACKETFABRIC_DATABASE_URL=postgresql://user:password@localhost:5432/packetfabric_db

# ===========================================
# WELINK Configuration
# ===========================================

NEXT_PUBLIC_WELINK_FIREBASE_API_KEY=your-welink-firebase-api-key
NEXT_PUBLIC_WELINK_FIREBASE_AUTH_DOMAIN=welink-project.firebaseapp.com
NEXT_PUBLIC_WELINK_FIREBASE_PROJECT_ID=welink-project
NEXT_PUBLIC_WELINK_FIREBASE_STORAGE_BUCKET=welink-project.appspot.com
NEXT_PUBLIC_WELINK_FIREBASE_MESSAGING_SENDER_ID=444555666
NEXT_PUBLIC_WELINK_FIREBASE_APP_ID=1:444555666:web:jkl012

WELINK_FIREBASE_PROJECT_ID=welink-project
WELINK_FIREBASE_CLIENT_EMAIL=firebase-adminsdk@welink-project.iam.gserviceaccount.com
WELINK_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

WELINK_DATABASE_URL=postgresql://user:password@localhost:5432/welink_db

# ===========================================
# ELEMENT8 Configuration
# ===========================================

NEXT_PUBLIC_ELEMENT8_FIREBASE_API_KEY=your-element8-firebase-api-key
NEXT_PUBLIC_ELEMENT8_FIREBASE_AUTH_DOMAIN=element8-project.firebaseapp.com
NEXT_PUBLIC_ELEMENT8_FIREBASE_PROJECT_ID=element8-project
NEXT_PUBLIC_ELEMENT8_FIREBASE_STORAGE_BUCKET=element8-project.appspot.com
NEXT_PUBLIC_ELEMENT8_FIREBASE_MESSAGING_SENDER_ID=777888999
NEXT_PUBLIC_ELEMENT8_FIREBASE_APP_ID=1:777888999:web:mno345

ELEMENT8_FIREBASE_PROJECT_ID=element8-project
ELEMENT8_FIREBASE_CLIENT_EMAIL=firebase-adminsdk@element8-project.iam.gserviceaccount.com
ELEMENT8_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

ELEMENT8_DATABASE_URL=postgresql://user:password@localhost:5432/element8_db
```

### Quick Start (Single Company)

If you only need to test one company initially, you can use legacy (non-prefixed) variables as a fallback:

```bash
# Legacy fallback - works when company-specific vars are not set
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

DATABASE_URL=postgresql://user:password@localhost:5432/your_db
```

## Step 3: Start the Development Server

```bash
npm run dev
```

The server will start on port 3000 by default.

## Step 4: Test Each Company

Open your browser and visit each subdomain:

| Company | URL | Expected Branding |
|---------|-----|-------------------|
| DTIQ | http://dtiq.localhost:3000 | Blue theme (#0066CC), "Video Intelligence Solutions" |
| Qwilt | http://qwilt.localhost:3000 | Purple theme (#8B5CF6), "Content Delivery Network" |
| PacketFabric | http://packetfabric.localhost:3000 | Green theme (#10B981), "Network as a Service" |
| Welink | http://welink.localhost:3000 | Amber theme (#F59E0B), "Connectivity Solutions" |
| Element8 | http://element8.localhost:3000 | Red theme (#EF4444), "Data Center Services" |

## What to Verify

### Visual Branding
- [ ] Company name appears in the header
- [ ] Logo text/badge shows correct initials
- [ ] Tagline displays correctly
- [ ] Primary color is applied to:
  - Logo badge background
  - Focus rings on inputs
  - Primary buttons
  - Accent elements

### Data Isolation
- [ ] Firebase connects to the correct project (check browser console for project ID)
- [ ] Database queries use the correct company's database
- [ ] User authentication is isolated per company

### CSS Variables
Open browser DevTools and inspect the `<body>` element. You should see inline styles like:
```css
--primary-color: #0066CC;
--primary-color-light: #4d94db;
--primary-color-dark: #0052a3;
--primary-color-rgb: 0, 102, 204;
```

The values should change based on which subdomain you visit.

## Troubleshooting

### "Site can't be reached" or DNS errors

**Problem:** Browser can't resolve `dtiq.localhost`

**Solutions:**
1. Verify hosts file entries are correct
2. Flush DNS cache (see Step 1)
3. Try restarting your browser
4. Some browsers (like Chrome) may need `http://` prefix explicitly

### Wrong company branding appears

**Problem:** Visiting `qwilt.localhost` shows DTIQ branding

**Solutions:**
1. Check that the subdomain is spelled correctly in the URL
2. Clear browser cache and hard refresh (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows)
3. Check server logs for the `x-company` header value

### Firebase errors in console

**Problem:** Firebase initialization fails

**Solutions:**
1. Verify environment variables are set for the correct company
2. Check that `NEXT_PUBLIC_` prefix is used for client-side Firebase vars
3. Ensure the Firebase project exists and has the correct configuration
4. Check that you've restarted the dev server after changing `.env.local`

### Database connection errors

**Problem:** Prisma can't connect to the database

**Solutions:**
1. Verify `{COMPANY}_DATABASE_URL` is set correctly
2. Ensure the PostgreSQL database exists and is running
3. Check that the database user has proper permissions
4. Run `npx prisma db push` to sync schema if needed

### Changes to .env.local not taking effect

**Problem:** Updated environment variables aren't being used

**Solutions:**
1. Stop and restart the development server (`npm run dev`)
2. Next.js caches environment variables at build time
3. Clear Next.js cache: `rm -rf .next`

### Port 3000 already in use

**Problem:** Server won't start because port is occupied

**Solutions:**
1. Kill the process using port 3000:
   ```bash
   # Mac/Linux
   lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Or use a different port:
   ```bash
   npm run dev -- -p 3001
   ```
   (Update hosts file entries if using a different port)

## Testing Tips

1. **Use incognito/private windows** to test different companies simultaneously without cookie conflicts

2. **Check browser console** for helpful debug information about which company is detected

3. **Test the full flow:**
   - Login/logout
   - Create a support ticket
   - Search functionality
   - Notifications
   - All API endpoints

4. **Compare side-by-side:** Open two browser windows with different company subdomains to visually compare branding

## Architecture Reference

```
Request Flow:
┌─────────────────┐
│ Browser Request │
│ qwilt.localhost │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Middleware    │
│ Sets x-company  │
│ header: "qwilt" │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Routes    │
│ getCompany() →  │
│ "qwilt"         │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────────┐
│Prisma │ │ Firebase  │
│QWILT_ │ │QWILT_     │
│DB_URL │ │FIREBASE_* │
└───────┘ └───────────┘
```

The middleware extracts the subdomain, sets headers, and downstream code uses these headers to load the correct company's configuration, branding, database, and Firebase project.
