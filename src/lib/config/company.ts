/**
 * Server-side company detection utilities.
 *
 * Company is determined by the COMPANY_SLUG environment variable,
 * which should be set per deployment (e.g., "dtiq", "quilt", "welink").
 */

export const DEFAULT_COMPANY = 'dtiq'
export const DEFAULT_COMPANY_UPPER = 'DTIQ'

/**
 * Gets the current company slug from the COMPANY_SLUG environment variable.
 *
 * @returns The lowercase company slug (e.g., "dtiq", "quilt")
 * @default "dtiq"
 */
export function getCompany(): string {
  return process.env.COMPANY_SLUG?.toLowerCase() || DEFAULT_COMPANY
}

/**
 * Gets the current company slug in uppercase.
 *
 * @returns The uppercase company slug (e.g., "DTIQ", "QUILT")
 * @default "DTIQ"
 */
export function getCompanyUpper(): string {
  return process.env.COMPANY_SLUG?.toUpperCase() || DEFAULT_COMPANY_UPPER
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
