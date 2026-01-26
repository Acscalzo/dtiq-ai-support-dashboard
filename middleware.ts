import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEFAULT_COMPANY = 'dtiq'

export function middleware(request: NextRequest) {
  // Note: Firebase Auth uses localStorage/IndexedDB, not cookies
  // So we rely on client-side ProtectedRoute component for auth checks
  // This middleware handles multi-tenant subdomain detection

  const hostname = request.headers.get('host') || ''

  // Extract subdomain from hostname
  const company = extractSubdomain(hostname)

  // Clone the request headers and set company headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-company', company.toLowerCase())
  requestHeaders.set('x-company-upper', company.toUpperCase())

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

function extractSubdomain(hostname: string): string {
  // Remove port if present (e.g., localhost:3000 -> localhost)
  const hostnameWithoutPort = hostname.split(':')[0]

  // Handle localhost without subdomain
  if (hostnameWithoutPort === 'localhost') {
    return DEFAULT_COMPANY
  }

  // Split hostname into parts
  const parts = hostnameWithoutPort.split('.')

  // Handle cases:
  // - "yourdomain.com" (2 parts) -> default
  // - "www.yourdomain.com" (3 parts, starts with www) -> default
  // - "dtiq.yourdomain.com" (3 parts) -> dtiq
  // - "dtiq.localhost" (2 parts, ends with localhost) -> dtiq

  // Check for subdomain.localhost pattern (local development)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0]
  }

  // No subdomain (e.g., "yourdomain.com")
  if (parts.length <= 2) {
    return DEFAULT_COMPANY
  }

  // Has subdomain
  const subdomain = parts[0]

  // If subdomain is "www", treat as no subdomain
  if (subdomain === 'www') {
    return DEFAULT_COMPANY
  }

  return subdomain
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (e.g., .png, .jpg, .svg, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)).*)',
  ],
}
