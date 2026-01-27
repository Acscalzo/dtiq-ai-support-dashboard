import { NextResponse } from 'next/server'

export function middleware() {
  // Just pass through for now
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
}
