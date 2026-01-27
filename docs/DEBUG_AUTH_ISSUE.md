# Auth Issue Debugging Plan

## Current Problem
Sign-in button loads indefinitely and then resets to login page. The app deploys successfully but authentication doesn't work on Vercel.

## What We Know
1. Firebase Auth is partially working (incorrect passwords show error messages)
2. Firestore was causing "client is offline" errors - we removed it
3. The Vercel URL was being parsed incorrectly as a company subdomain - we fixed this
4. Login still doesn't complete after these fixes

## Systematic Debugging Steps for Tomorrow

### Step 1: Test Locally First
Before touching Vercel, confirm auth works locally:
```bash
npm run dev
# Visit http://localhost:3000/login
# Try to sign in
```
If local works but Vercel doesn't → environment variable issue
If local also fails → code issue

### Step 2: Check Browser Console on Vercel
Open the deployed site, open DevTools Console, try to sign in, and capture:
- Any JavaScript errors
- Network tab - check the Firebase auth requests
- What URL is Firebase trying to authenticate against?

### Step 3: Verify Firebase Config is Correct on Vercel
The app detects company from subdomain and loads corresponding Firebase config.
On Vercel URL, it should fall back to `NEXT_PUBLIC_FIREBASE_*` (legacy) variables.

**Check these are set correctly in Vercel:**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Verify they match the Firebase project `dadashboard-cd722`**

### Step 4: Add Debug Logging
Temporarily add console.log statements to see what's happening:

In `src/lib/firebase/client.ts`:
```typescript
console.log('[Firebase] Config being used:', {
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});
```

In `src/contexts/AuthContext.tsx`:
```typescript
// In onAuthStateChanged callback
console.log('[Auth] State changed:', firebaseUser ? 'logged in' : 'logged out');

// In signIn function
console.log('[Auth] Attempting sign in...');
```

### Step 5: Check Firebase Auth Domain Setting
In Firebase Console → Authentication → Settings → Authorized domains:
- Must include `vercel.app` ✓ (we did this)
- Also check if it needs the full deployment URL

### Step 6: Simplify to Isolate the Issue
Create a minimal test - temporarily replace login page with:
```typescript
'use client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export default function LoginPage() {
  const handleTest = async () => {
    try {
      console.log('Auth object:', auth);
      const result = await signInWithEmailAndPassword(auth, 'test@test.com', 'password');
      console.log('Success:', result);
      alert('Login worked!');
    } catch (e: any) {
      console.error('Error:', e);
      alert('Error: ' + e.message);
    }
  };

  return <button onClick={handleTest}>Test Firebase Auth</button>;
}
```

This removes all complexity and tests just Firebase Auth directly.

## Likely Root Causes (in order of probability)

1. **Environment variables not reaching the client** - NEXT_PUBLIC_ vars might not be set for production
2. **Firebase project mismatch** - Config pointing to wrong project
3. **Auth state listener issue** - The Promise-based auth waiting might be hanging
4. **CORS/domain issue** - Firebase rejecting requests from Vercel domain

## Quick Wins to Try First

1. Run `vercel env pull` and compare with local `.env.local`
2. Check Vercel deployment logs for any Firebase-related errors
3. Try creating a brand new test user in Firebase Console and logging in with those credentials

## Files Involved
- `src/lib/firebase/client.ts` - Firebase initialization
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/app/login/page.tsx` - Login UI
- `src/lib/config/company-client.ts` - Company/subdomain detection
