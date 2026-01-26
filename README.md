# DTIQ AI Support Dashboard

AI-powered customer support platform with **multi-tenant architecture**, built with Next.js 14 and Claude AI. Supports multiple companies with isolated data, branding, and authentication via subdomain routing.

## Features

- **Multi-tenant architecture** - One codebase, multiple companies via subdomains
- Real-time ticket management and tracking
- AI-powered insights and analytics
- Intelligent search across tickets and documentation
- Customer support documentation hub
- Advanced analytics and trend analysis
- Dark mode support
- Firebase authentication (per-tenant)
- Responsive dashboard interface
- AI phone receptionist (Twilio + OpenAI Realtime)

## Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM (per-tenant)
- **Authentication:** Firebase Auth (per-tenant)
- **AI:** Claude API (Anthropic), OpenAI Realtime
- **Phone:** Twilio Voice
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

---

## Multi-Tenant Architecture

This application uses **subdomain-based multi-tenancy** to serve multiple companies from a single deployment.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Request Flow                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Browser: https://qwilt.example.com/dashboard                  │
│                         │                                        │
│                         ▼                                        │
│   ┌─────────────────────────────────────────┐                   │
│   │           Next.js Middleware            │                   │
│   │  • Extracts subdomain: "qwilt"          │                   │
│   │  • Sets header: x-company: qwilt        │                   │
│   └─────────────────────────────────────────┘                   │
│                         │                                        │
│                         ▼                                        │
│   ┌─────────────────────────────────────────┐                   │
│   │          Application Layer              │                   │
│   │  • getCompany() → "qwilt"               │                   │
│   │  • getBranding() → Qwilt colors/logo    │                   │
│   └─────────────────────────────────────────┘                   │
│                         │                                        │
│            ┌────────────┼────────────┐                          │
│            ▼            ▼            ▼                          │
│   ┌─────────────┐ ┌──────────┐ ┌──────────┐                    │
│   │  Database   │ │ Firebase │ │ Branding │                    │
│   │ QWILT_DB_URL│ │ QWILT_*  │ │ Purple   │                    │
│   └─────────────┘ └──────────┘ └──────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Subdomain Routing

The middleware (`middleware.ts`) detects the company from the subdomain:
- `dtiq.example.com` → Company: `dtiq`
- `qwilt.example.com` → Company: `qwilt`
- `example.com` (no subdomain) → Default: `dtiq`

### Data Isolation

Each company has completely isolated:
- **Database** - Separate PostgreSQL database per company
- **Authentication** - Separate Firebase project per company
- **Storage** - Separate Firebase Storage per company

### Environment Variable Prefixing

Company-specific configuration uses prefixed environment variables:

```bash
# DTIQ's database
DTIQ_DATABASE_URL=postgresql://...

# Qwilt's database
QWILT_DATABASE_URL=postgresql://...

# DTIQ's Firebase (client-side needs NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_DTIQ_FIREBASE_API_KEY=...
DTIQ_FIREBASE_PRIVATE_KEY=...

# Qwilt's Firebase
NEXT_PUBLIC_QWILT_FIREBASE_API_KEY=...
QWILT_FIREBASE_PRIVATE_KEY=...
```

The application automatically selects the correct variables based on the detected company.

---

## Supported Companies

| Company | Subdomain | Primary Color | Logo | Tagline |
|---------|-----------|---------------|------|---------|
| **DTIQ** | `dtiq.*` | ![#0066CC](https://via.placeholder.com/15/0066CC/0066CC.png) `#0066CC` | DTIQ | Video Intelligence Solutions |
| **Qwilt** | `qwilt.*` | ![#8B5CF6](https://via.placeholder.com/15/8B5CF6/8B5CF6.png) `#8B5CF6` | Q | Content Delivery Network |
| **PacketFabric** | `packetfabric.*` | ![#10B981](https://via.placeholder.com/15/10B981/10B981.png) `#10B981` | PF | Network as a Service |
| **Welink** | `welink.*` | ![#F59E0B](https://via.placeholder.com/15/F59E0B/F59E0B.png) `#F59E0B` | W | Connectivity Solutions |
| **Element8** | `element8.*` | ![#EF4444](https://via.placeholder.com/15/EF4444/EF4444.png) `#EF4444` | E8 | Data Center Services |

Each company gets:
- Custom branding (colors, logo, tagline)
- Isolated Firebase project (auth, storage)
- Isolated PostgreSQL database
- Same feature set and UI

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (one per company, or one for development)
- Firebase project (one per company, or one for development)
- OpenAI API key
- Twilio account (optional, for phone features)

### Quick Start (Single Company)

1. **Clone and install:**
   ```bash
   git clone https://github.com/Acscalzo/dtiq-ai-support-dashboard.git
   cd dtiq-ai-support-dashboard
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up database:**
   ```bash
   npm run db:push
   npm run db:seed  # Optional: sample data
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

---

## Local Development (Multi-Tenant)

To test multi-tenant subdomain routing locally, you need to configure your hosts file.

**Quick setup:**

1. Add to `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
   ```
   127.0.0.1   dtiq.localhost
   127.0.0.1   qwilt.localhost
   127.0.0.1   packetfabric.localhost
   127.0.0.1   welink.localhost
   127.0.0.1   element8.localhost
   ```

2. Visit `http://dtiq.localhost:3000` or `http://qwilt.localhost:3000`

**Full guide:** See [docs/LOCAL_TESTING.md](docs/LOCAL_TESTING.md) for:
- Detailed hosts file setup (Mac/Linux/Windows)
- Environment variable configuration
- Testing checklist
- Troubleshooting tips

---

## Deployment

### Vercel (Recommended)

1. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Add environment variables** for all companies in Vercel dashboard

3. **Configure DNS** with wildcard CNAME:
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   ```

4. **Test each subdomain:**
   - `https://dtiq.yourdomain.com`
   - `https://qwilt.yourdomain.com`
   - etc.

**Full guide:** See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Complete Vercel CLI commands
- Environment variables checklist
- DNS configuration details
- Post-deployment testing
- Troubleshooting

---

## Adding a New Company

To add a 6th company (e.g., "Acme Corp"):

### 1. Update Branding Configuration

Edit `src/config/branding.ts`:

```typescript
// Add to CompanySlug type
export type CompanySlug = 'dtiq' | 'qwilt' | 'packetfabric' | 'welink' | 'element8' | 'acme'

// Add to brandingConfigs
export const brandingConfigs: Record<CompanySlug, BrandingConfig> = {
  // ... existing companies ...
  acme: {
    companyName: 'Acme Corp',
    companySlug: 'acme',
    primaryColor: '#FF6B6B',  // Choose a unique color
    logoText: 'AC',
    tagline: 'Innovation Solutions',
  },
}
```

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: `acme-support`
3. Enable Authentication (Email/Password, Google, etc.)
4. Create Firestore database
5. Generate service account key

### 3. Create PostgreSQL Database

Create a new database for Acme:
```sql
CREATE DATABASE acme_support;
```

### 4. Add Environment Variables

Add to `.env.local` (development) and Vercel (production):

```bash
# Acme - Firebase Client
NEXT_PUBLIC_ACME_FIREBASE_API_KEY=...
NEXT_PUBLIC_ACME_FIREBASE_AUTH_DOMAIN=acme-support.firebaseapp.com
NEXT_PUBLIC_ACME_FIREBASE_PROJECT_ID=acme-support
NEXT_PUBLIC_ACME_FIREBASE_STORAGE_BUCKET=acme-support.appspot.com
NEXT_PUBLIC_ACME_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_ACME_FIREBASE_APP_ID=...

# Acme - Firebase Admin
ACME_FIREBASE_PROJECT_ID=acme-support
ACME_FIREBASE_CLIENT_EMAIL=firebase-adminsdk@acme-support.iam.gserviceaccount.com
ACME_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Acme - Database
ACME_DATABASE_URL=postgresql://user:pass@host:5432/acme_support
```

### 5. Update Local Testing (Optional)

Add to hosts file:
```
127.0.0.1   acme.localhost
```

### 6. Deploy

```bash
# Add env vars to Vercel
vercel env add NEXT_PUBLIC_ACME_FIREBASE_API_KEY production
# ... add all other vars ...

# Redeploy
vercel --prod
```

### 7. Configure DNS

Add DNS record (if not using wildcard):
```
Type: CNAME
Name: acme
Value: cname.vercel-dns.com
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Generate Prisma client |

---

## Project Structure

```
/dtiq-ai-support-dashboard
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes (multi-tenant aware)
│   │   ├── dashboard/         # Dashboard pages
│   │   └── ...
│   ├── components/            # React components
│   ├── config/
│   │   └── branding.ts       # Multi-tenant branding config
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/
│   │   ├── config/
│   │   │   └── company.ts    # Company detection utilities
│   │   ├── db/
│   │   │   └── prisma.ts     # Multi-tenant Prisma client
│   │   ├── firebase/
│   │   │   ├── admin.ts      # Multi-tenant Firebase Admin
│   │   │   └── client.ts     # Multi-tenant Firebase Client
│   │   └── ...
│   └── types/                # TypeScript types
├── docs/
│   ├── LOCAL_TESTING.md      # Local multi-tenant testing guide
│   └── DEPLOYMENT.md         # Vercel deployment guide
├── middleware.ts             # Subdomain detection middleware
├── prisma/                   # Database schema
└── ...
```

---

## Security Notes

- Never commit `.env.local` or files containing secrets
- Each company's data is isolated by design
- Firebase security rules should restrict cross-tenant access
- Database connections are per-tenant (no shared credentials)
- Rotate API keys regularly
- Use environment-specific configurations

---

## Documentation

- [Local Testing Guide](docs/LOCAL_TESTING.md) - Set up multi-tenant development
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to Vercel with subdomains

---

## Support

For issues or questions, please contact the development team or open an issue.

## License

Proprietary - Internal Use Only
