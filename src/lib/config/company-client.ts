/**
 * Client-side company detection utilities.
 *
 * These functions are safe to use in Client Components and browser code.
 * They do not import any server-only dependencies.
 */

export const DEFAULT_COMPANY = 'dtiq'
export const DEFAULT_COMPANY_UPPER = 'DTIQ'

/**
 * Extracts the company slug from a hostname string.
 *
 * @param hostname - The hostname to extract from (e.g., "dtiq.example.com")
 * @returns The lowercase company slug
 *
 * @remarks
 * This is a pure function that can be used anywhere (server or client).
 * It mirrors the logic in middleware.ts for consistency.
 */
export function extractCompanyFromHostname(hostname: string): string {
  // Remove port if present (e.g., localhost:3000 -> localhost)
  const hostnameWithoutPort = hostname.split(':')[0]

  // Handle localhost without subdomain
  if (hostnameWithoutPort === 'localhost') {
    return DEFAULT_COMPANY
  }

  // Split hostname into parts
  const parts = hostnameWithoutPort.split('.')

  // Check for subdomain.localhost pattern (local development)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0].toLowerCase()
  }

  // No subdomain (e.g., "yourdomain.com")
  if (parts.length <= 2) {
    return DEFAULT_COMPANY
  }

  // Has subdomain
  const subdomain = parts[0].toLowerCase()

  // If subdomain is "www", treat as no subdomain
  if (subdomain === 'www') {
    return DEFAULT_COMPANY
  }

  // Handle Vercel preview/production URLs (e.g., "ai-support-dashboard-xxx.vercel.app")
  // These should use the default company, not try to parse a company from the subdomain
  if (parts.includes('vercel') && parts.includes('app')) {
    return DEFAULT_COMPANY
  }

  return subdomain
}

/**
 * Gets the company slug on the client side from window.location.
 *
 * @returns The lowercase company slug detected from the current URL
 *
 * @remarks
 * This function is designed for use in Client Components and browser code.
 * It extracts the company from the browser's current hostname.
 *
 * For Server Components, use `getCompany()` from `@/lib/config/company` instead.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { getClientCompany } from '@/lib/config/company-client'
 *
 * export function ClientComponent() {
 *   const company = getClientCompany()
 *   return <div>Company: {company}</div>
 * }
 * ```
 */
export function getClientCompany(): string {
  if (typeof window === 'undefined') {
    // Not in browser, return default
    return DEFAULT_COMPANY
  }
  return extractCompanyFromHostname(window.location.hostname)
}

/**
 * Gets the company slug in uppercase on the client side.
 *
 * @returns The uppercase company slug detected from the current URL
 */
export function getClientCompanyUpper(): string {
  return getClientCompany().toUpperCase()
}
