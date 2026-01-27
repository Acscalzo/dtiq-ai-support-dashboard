# TODO: Consolidate Firebase to Auth-Only

## Goal
Simplify architecture by using Firebase **only for authentication** and moving all other data to PostgreSQL.

## Current State
- Firebase Auth → authentication
- Firebase Firestore → calls, notifications, user preferences
- Firebase Storage → avatar uploads
- PostgreSQL → tickets, customers, agents, insights, documentation

## Target State
- Firebase Auth → authentication only
- PostgreSQL → all data (tickets, customers, agents, calls, notifications, preferences, insights, docs)
- Vercel Blob or Firebase Storage → file uploads (TBD)

## Migration Tasks

### 1. Add New Prisma Models
```prisma
model Call {
  id visibleString @id @default(cuid())
  phoneNumber     String
  callerName      String?
  status          String    // "ringing", "in-progress", "completed", "missed"
  direction       String    // "inbound", "outbound"
  duration        Int?
  recordingUrl    String?
  transcript      String?
  summary         String?
  sentiment       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "call", "ticket", "system"
  title       String
  message     String
  read        Boolean  @default(false)
  metadata    Json?
  createdAt   DateTime @default(now())
}

model UserPreference {
  id                    String   @id @default(cuid())
  userId                String   @unique
  emailNotifications    Boolean  @default(true)
  pushNotifications     Boolean  @default(true)
  soundEnabled          Boolean  @default(true)
  theme                 String   @default("system")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### 2. Update API Routes
- [ ] `src/app/api/calls/route.ts` - Use Prisma instead of Firestore
- [ ] `src/app/api/calls/[id]/route.ts` - Use Prisma
- [ ] `src/app/api/calls/stats/route.ts` - Use Prisma
- [ ] `src/app/api/notifications/route.ts` - Use Prisma
- [ ] `src/app/api/notifications/mark-all-read/route.ts` - Use Prisma
- [ ] `src/app/api/user/profile/route.ts` - Use Prisma for preferences

### 3. Update Hooks
- [ ] `src/hooks/useCalls.ts` - Fetch from API instead of Firestore
- [ ] `src/hooks/useNotifications.ts` - Fetch from API instead of Firestore
- [ ] `src/hooks/useUserPreferences.ts` - Fetch from API instead of Firestore

### 4. Update WebSocket Server
- [ ] `src/server/websocket-server.ts` - Emit events on Prisma changes instead of Firestore listeners

### 5. Remove Firestore Dependencies
- [ ] Remove `getFirestore` from `src/lib/firebase/client.ts`
- [ ] Delete `src/lib/firebase/firestore.ts`
- [ ] Delete `src/lib/firebase/calls.ts`
- [ ] Update `src/lib/notifications/createNotification.ts`

### 6. File Uploads (Decision Needed)
Options:
- Keep Firebase Storage (simplest)
- Migrate to Vercel Blob (tighter Vercel integration)
- Migrate to S3/Cloudflare R2 (more control)

## Benefits
- Single source of truth for all data
- Simpler queries with SQL joins
- Easier multi-tenant data isolation
- Lower costs (Firestore reads/writes add up)
- No data sync issues between databases
- WebSocket already handles real-time updates

## Notes
- Keep Firebase Auth - it works well and handles OAuth providers
- Real-time updates will come from WebSocket server, not Firestore listeners
- This is a non-breaking change - can be done incrementally
