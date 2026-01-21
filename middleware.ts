import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Note: Firebase Auth uses localStorage/IndexedDB, not cookies
  // So we rely on client-side ProtectedRoute component for auth checks
  // This middleware just handles API route protection (which uses Bearer tokens)

  // All routes are allowed to pass through
  // Client-side ProtectedRoute component handles dashboard protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (protected separately with token verification)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
