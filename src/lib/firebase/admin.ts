/**
 * Firebase Admin SDK Configuration
 *
 * Multi-tenant Firebase Admin initialization for server-side operations.
 *
 * How it works:
 * - Each company has its own Firebase project with separate service account
 * - The company is detected from the subdomain via x-company header
 * - Environment variables are prefixed with company name (e.g., DTIQ_FIREBASE_PROJECT_ID)
 *
 * Environment variable naming convention:
 * - {COMPANY}_FIREBASE_PROJECT_ID
 * - {COMPANY}_FIREBASE_CLIENT_EMAIL
 * - {COMPANY}_FIREBASE_PRIVATE_KEY
 *
 * Note: This file should only be imported in server-side code (API routes, Server Components)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getCompanyEnv } from '@/lib/config/company'

/**
 * Firebase Admin configuration type
 */
interface AdminConfig {
  projectId: string | undefined
  clientEmail: string | undefined
  privateKey: string | undefined
}

/**
 * Gets Firebase Admin config for the current company.
 * Uses getCompanyEnv() which reads the x-company header set by middleware.
 */
function getAdminConfig(): AdminConfig {
  // Try company-specific env vars first
  let projectId = getCompanyEnv('FIREBASE_PROJECT_ID')
  let clientEmail = getCompanyEnv('FIREBASE_CLIENT_EMAIL')
  let privateKey = getCompanyEnv('FIREBASE_PRIVATE_KEY')

  // Fallback to legacy non-prefixed env vars for backward compatibility
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '[Firebase Admin] No company-specific config found. ' +
      'Expected env vars like {COMPANY}_FIREBASE_PROJECT_ID. ' +
      'Falling back to legacy FIREBASE_* vars.'
    )
    projectId = projectId || process.env.FIREBASE_PROJECT_ID
    clientEmail = clientEmail || process.env.FIREBASE_CLIENT_EMAIL
    privateKey = privateKey || process.env.FIREBASE_PRIVATE_KEY
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey?.replace(/\\n/g, '\n'),
  }
}

// Get the admin configuration
const adminConfig = getAdminConfig()

// Validate required config
if (!adminConfig.projectId) {
  console.error('[Firebase Admin] Missing project ID. Check your environment variables.')
}
if (!adminConfig.clientEmail) {
  console.error('[Firebase Admin] Missing client email. Check your environment variables.')
}
if (!adminConfig.privateKey) {
  console.error('[Firebase Admin] Missing private key. Check your environment variables.')
}

// Initialize Firebase Admin only once
let adminApp: App

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: adminConfig.projectId,
      clientEmail: adminConfig.clientEmail,
      privateKey: adminConfig.privateKey,
    }),
  })
} else {
  adminApp = getApps()[0]
}

export const adminAuth: Auth = getAuth(adminApp)
export const adminDb: Firestore = getFirestore(adminApp)

/**
 * Re-export config getter for debugging/testing
 */
export { getAdminConfig }
