/**
 * Client-side company detection utilities.
 *
 * Company is determined by the NEXT_PUBLIC_COMPANY_SLUG environment variable,
 * which should be set per deployment (e.g., "dtiq", "quilt", "welink").
 */

export const DEFAULT_COMPANY = 'dtiq'
export const DEFAULT_COMPANY_UPPER = 'DTIQ'

/**
 * Gets the company slug on the client side from environment variable.
 *
 * @returns The lowercase company slug
 * @default "dtiq"
 */
export function getClientCompany(): string {
  return process.env.NEXT_PUBLIC_COMPANY_SLUG?.toLowerCase() || DEFAULT_COMPANY
}

/**
 * Gets the company slug in uppercase on the client side.
 *
 * @returns The uppercase company slug
 * @default "DTIQ"
 */
export function getClientCompanyUpper(): string {
  return process.env.NEXT_PUBLIC_COMPANY_SLUG?.toUpperCase() || DEFAULT_COMPANY_UPPER
}
