/**
 * Server-side Company Branding Configuration
 *
 * This file contains branding utilities for Server Components.
 * It imports next/headers for server-side company detection.
 *
 * For Client Components, use '@/config/branding-client' instead.
 */

import { getCompany } from '@/lib/config/company'

// Re-export client-safe utilities for convenience in server components
export {
  brandingConfigs,
  getBrandingBySlug,
  isValidCompanySlug,
  getAllCompanySlugs,
  type BrandingConfig,
  type CompanySlug,
} from './branding-client'

import { getBrandingBySlug, type BrandingConfig } from './branding-client'

/**
 * Gets the branding configuration for the current company.
 *
 * Uses the subdomain from the request to determine which company's
 * branding to return. Falls back to DTIQ if company not found.
 *
 * @returns The branding configuration for the current company
 *
 * @remarks
 * This function uses `getCompany()` which relies on Next.js `headers()`.
 * It can only be called in:
 * - Server Components
 * - Route Handlers
 * - Server Actions
 *
 * For Client Components, use `getClientBranding()` from `@/config/branding-client`.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { getBranding } from '@/config/branding'
 *
 * export default function Header() {
 *   const branding = getBranding()
 *   return <h1 style={{ color: branding.primaryColor }}>{branding.companyName}</h1>
 * }
 * ```
 */
export function getBranding(): BrandingConfig {
  const company = getCompany()
  return getBrandingBySlug(company)
}
