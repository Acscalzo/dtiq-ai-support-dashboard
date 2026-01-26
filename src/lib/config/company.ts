/**
 * Server-side company detection utilities.
 *
 * These functions use Next.js `headers()` and can only be called in:
 * - Server Components
 * - Route Handlers
 * - Server Actions
 *
 * For Client Components, use functions from `@/lib/config/company-client` instead.
 */

import { headers } from 'next/headers'

export const DEFAULT_COMPANY = 'dtiq'
export const DEFAULT_COMPANY_UPPER = 'DTIQ'

/**
 * Gets the current company slug from the request headers.
 *
 * @returns The lowercase company slug (e.g., "dtiq", "qwilt")
 * @default "dtiq"
 *
 * @remarks
 * This function uses Next.js `headers()` and can only be called in:
 * - Server Components
 * - Route Handlers
 * - Server Actions
 *
 * For Client Components, use `getClientCompany()` from `@/lib/config/company-client`.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { getCompany } from '@/lib/config/company'
 *
 * export default function Page() {
 *   const company = getCompany()
 *   return <div>Company: {company}</div>
 * }
 * ```
 */
export function getCompany(): string {
  try {
    const headersList = headers()
    return headersList.get('x-company') || DEFAULT_COMPANY
  } catch {
    // headers() throws when called outside of a request context
    // (e.g., during static generation or in client components)
    return DEFAULT_COMPANY
  }
}

/**
 * Gets the current company slug in uppercase from the request headers.
 *
 * @returns The uppercase company slug (e.g., "DTIQ", "QWILT")
 * @default "DTIQ"
 */
export function getCompanyUpper(): string {
  try {
    const headersList = headers()
    return headersList.get('x-company-upper') || DEFAULT_COMPANY_UPPER
  } catch {
    // headers() throws when called outside of a request context
    return DEFAULT_COMPANY_UPPER
  }
}

/**
 * Gets an environment variable with the current company prefix.
 *
 * @param varName - The base environment variable name (without company prefix)
 * @returns The value of the prefixed environment variable, or undefined if not set
 *
 * @remarks
 * This function constructs the environment variable name by prefixing
 * the company slug in uppercase. For example:
 * - Company "dtiq" + varName "DATABASE_URL" = "DTIQ_DATABASE_URL"
 * - Company "qwilt" + varName "API_KEY" = "QWILT_API_KEY"
 *
 * @example
 * ```tsx
 * // In a Route Handler
 * import { getCompanyEnv } from '@/lib/config/company'
 *
 * // If current company is "dtiq", this returns process.env.DTIQ_DATABASE_URL
 * const dbUrl = getCompanyEnv('DATABASE_URL')
 * ```
 */
export function getCompanyEnv(varName: string): string | undefined {
  const companyPrefix = getCompanyUpper()
  const fullVarName = `${companyPrefix}_${varName}`
  return process.env[fullVarName]
}

/**
 * Type representing the company configuration values.
 */
export interface CompanyConfig {
  /** Lowercase company slug (e.g., "dtiq") */
  company: string
  /** Uppercase company slug (e.g., "DTIQ") */
  companyUpper: string
}

/**
 * Gets both company slug variants in a single call.
 *
 * @returns Object containing both lowercase and uppercase company slugs
 */
export function getCompanyConfig(): CompanyConfig {
  return {
    company: getCompany(),
    companyUpper: getCompanyUpper(),
  }
}
