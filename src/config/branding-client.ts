/**
 * Client-safe Company Branding Configuration
 *
 * This file contains branding utilities that are safe to use in Client Components.
 * It does not import any server-only dependencies like next/headers.
 *
 * For Server Components, you can also import from '@/config/branding' which
 * includes the server-side `getBranding()` function.
 */

import { getClientCompany } from '@/lib/config/company-client'

/**
 * Branding configuration for a company
 */
export interface BrandingConfig {
  /** Full company name (e.g., "DTIQ") */
  companyName: string
  /** URL-safe company slug (e.g., "dtiq") */
  companySlug: string
  /** Primary brand color in hex format (e.g., "#0066CC") */
  primaryColor: string
  /** Short text for logo display (e.g., "DTIQ", "Q", "E8") */
  logoText: string
  /** Company tagline or description */
  tagline: string
  /** Optional URL to company logo image */
  logoUrl?: string
}

/**
 * Type for valid company slugs
 */
export type CompanySlug = 'dtiq' | 'qwilt' | 'packetfabric' | 'welink' | 'element8'

/**
 * Branding configurations for all supported companies
 */
export const brandingConfigs: Record<CompanySlug, BrandingConfig> = {
  dtiq: {
    companyName: 'DTIQ',
    companySlug: 'dtiq',
    primaryColor: '#0066CC',
    logoText: 'DTIQ',
    tagline: 'Video Intelligence Solutions',
    logoUrl: '/DTiQ-Logo.svg',
  },
  qwilt: {
    companyName: 'Qwilt',
    companySlug: 'qwilt',
    primaryColor: '#8B5CF6',
    logoText: 'Q',
    tagline: 'Content Delivery Network',
    logoUrl: '/qwilt.png',
  },
  packetfabric: {
    companyName: 'PacketFabric',
    companySlug: 'packetfabric',
    primaryColor: '#10B981',
    logoText: 'PF',
    tagline: 'Network as a Service',
    logoUrl: '/packetfabric-logo-v2-dark.svg',
  },
  welink: {
    companyName: 'Welink',
    companySlug: 'welink',
    primaryColor: '#F59E0B',
    logoText: 'W',
    tagline: 'Connectivity Solutions',
    logoUrl: '/welink.svg',
  },
  element8: {
    companyName: 'Element8',
    companySlug: 'element8',
    primaryColor: '#EF4444',
    logoText: 'E8',
    tagline: 'Data Center Services',
    logoUrl: '/element8.png',
  },
}

/**
 * Default company to use when company is not found
 */
const DEFAULT_COMPANY: CompanySlug = 'dtiq'

/**
 * Gets the branding configuration for a specific company slug.
 *
 * This is a pure function that can be used anywhere (server or client).
 *
 * @param slug - The company slug to get branding for
 * @returns The branding configuration for the specified company
 */
export function getBrandingBySlug(slug: string): BrandingConfig {
  const normalizedSlug = slug.toLowerCase() as CompanySlug

  if (normalizedSlug in brandingConfigs) {
    return brandingConfigs[normalizedSlug]
  }

  // Fall back to default company if slug not found
  return brandingConfigs[DEFAULT_COMPANY]
}

/**
 * Checks if a company slug is valid/supported
 *
 * @param slug - The company slug to validate
 * @returns True if the slug is a supported company
 */
export function isValidCompanySlug(slug: string): slug is CompanySlug {
  return slug.toLowerCase() in brandingConfigs
}

/**
 * Gets all available company slugs
 *
 * @returns Array of all supported company slugs
 */
export function getAllCompanySlugs(): CompanySlug[] {
  return Object.keys(brandingConfigs) as CompanySlug[]
}

/**
 * Gets the branding configuration for the current company in Client Components.
 *
 * Uses `getClientCompany()` which detects the company from `window.location`.
 * This function is designed for use in Client Components and browser code.
 *
 * @returns The branding configuration for the current company
 *
 * @remarks
 * For Server Components, use `getBranding()` from `@/config/branding` instead.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { getClientBranding } from '@/config/branding-client'
 *
 * export function Header() {
 *   const branding = getClientBranding()
 *   return <h1 style={{ color: branding.primaryColor }}>{branding.companyName}</h1>
 * }
 * ```
 */
export function getClientBranding(): BrandingConfig {
  const company = getClientCompany()
  return getBrandingBySlug(company)
}
