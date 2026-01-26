/**
 * Multi-tenant Prisma Client
 *
 * Each company has its own isolated PostgreSQL database for complete data separation.
 * The database URL is determined by the company subdomain:
 *
 * - dtiq.example.com    -> DTIQ_DATABASE_URL
 * - qwilt.example.com   -> QWILT_DATABASE_URL
 * - welink.example.com  -> WELINK_DATABASE_URL
 *
 * This ensures:
 * - Complete data isolation between tenants
 * - Independent database scaling per company
 * - Compliance with data residency requirements
 *
 * Environment variable naming convention:
 * - {COMPANY}_DATABASE_URL (e.g., DTIQ_DATABASE_URL, QWILT_DATABASE_URL)
 * - Fallback: DATABASE_URL (for backward compatibility)
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { getCompanyEnv, getCompanyUpper } from '@/lib/config/company'

/**
 * Error thrown when database configuration is missing for a company
 */
export class DatabaseConfigError extends Error {
  constructor(company: string) {
    super(
      `Database URL not found for company "${company}". ` +
      `Expected environment variable: ${company.toUpperCase()}_DATABASE_URL or DATABASE_URL as fallback. ` +
      `Please ensure the database is configured for this tenant.`
    )
    this.name = 'DatabaseConfigError'
  }
}

/**
 * Gets the database URL for the current company.
 *
 * @returns The PostgreSQL connection string for the current company
 * @throws {DatabaseConfigError} If no database URL is configured
 *
 * @remarks
 * This function uses `getCompanyEnv()` which reads the company from
 * the x-company header set by middleware. It only works in server-side
 * code (API routes, Server Components, Server Actions).
 *
 * Priority order:
 * 1. {COMPANY}_DATABASE_URL (e.g., DTIQ_DATABASE_URL)
 * 2. DATABASE_URL (fallback for backward compatibility)
 */
export function getDatabaseUrl(): string {
  const companyUpper = getCompanyUpper()

  // Try company-specific database URL first
  const companyDbUrl = getCompanyEnv('DATABASE_URL')
  if (companyDbUrl) {
    return companyDbUrl
  }

  // Fallback to generic DATABASE_URL for backward compatibility
  const fallbackDbUrl = process.env.DATABASE_URL
  if (fallbackDbUrl) {
    console.warn(
      `[Database] No company-specific database URL found for "${companyUpper}". ` +
      `Using fallback DATABASE_URL. For multi-tenant isolation, ` +
      `please set ${companyUpper}_DATABASE_URL.`
    )
    return fallbackDbUrl
  }

  // No database URL found at all
  throw new DatabaseConfigError(companyUpper)
}

/**
 * Global cache for Prisma clients per company.
 * Each company gets its own Prisma instance connected to their database.
 */
const prismaClientCache = new Map<string, PrismaClient>()

/**
 * Global cache for connection pools per company.
 * Pools are reused across requests for the same company.
 */
const poolCache = new Map<string, Pool>()

/**
 * Gets or creates a Prisma client for the current company.
 *
 * @returns PrismaClient connected to the current company's database
 * @throws {DatabaseConfigError} If no database URL is configured
 *
 * @remarks
 * - Clients are cached per company to avoid creating multiple connections
 * - Each company has complete data isolation via separate databases
 * - In development, prevents connection exhaustion during hot reloads
 *
 * @example
 * ```tsx
 * // In an API route or Server Component
 * import { getPrisma } from '@/lib/db/prisma'
 *
 * export async function GET() {
 *   const prisma = getPrisma()
 *   const tickets = await prisma.ticket.findMany()
 *   return Response.json(tickets)
 * }
 * ```
 */
export function getPrisma(): PrismaClient {
  const companyUpper = getCompanyUpper()

  // Return cached client if available
  const cachedClient = prismaClientCache.get(companyUpper)
  if (cachedClient) {
    return cachedClient
  }

  // Get database URL for this company
  const databaseUrl = getDatabaseUrl()

  // Create connection pool
  let pool = poolCache.get(companyUpper)
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl })
    poolCache.set(companyUpper, pool)
  }

  // Create Prisma client with pg adapter
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

  // Cache the client
  prismaClientCache.set(companyUpper, prisma)

  console.log(`[Database] Created Prisma client for company: ${companyUpper}`)

  return prisma
}

/**
 * Disconnects all cached Prisma clients.
 * Useful for graceful shutdown or testing.
 */
export async function disconnectAll(): Promise<void> {
  const disconnectPromises: Promise<void>[] = []

  for (const [company, client] of prismaClientCache) {
    console.log(`[Database] Disconnecting Prisma client for company: ${company}`)
    disconnectPromises.push(client.$disconnect())
  }

  for (const [company, pool] of poolCache) {
    console.log(`[Database] Closing connection pool for company: ${company}`)
    disconnectPromises.push(pool.end())
  }

  await Promise.all(disconnectPromises)

  prismaClientCache.clear()
  poolCache.clear()
}

/**
 * Gets information about the current database connection.
 * Useful for debugging and health checks.
 */
export function getDatabaseInfo(): {
  company: string
  hasConnection: boolean
  databaseUrl: string | null
} {
  const companyUpper = getCompanyUpper()

  let databaseUrl: string | null = null
  try {
    databaseUrl = getDatabaseUrl()
    // Mask sensitive parts of connection string for safety
    databaseUrl = databaseUrl.replace(
      /\/\/([^:]+):([^@]+)@/,
      '//$1:***@'
    )
  } catch {
    databaseUrl = null
  }

  return {
    company: companyUpper,
    hasConnection: prismaClientCache.has(companyUpper),
    databaseUrl,
  }
}
