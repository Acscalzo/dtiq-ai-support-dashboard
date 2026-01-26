/**
 * Firebase Client SDK Configuration
 *
 * Multi-tenant Firebase initialization that supports company-specific Firebase projects.
 *
 * How it works:
 * - Each company can have its own Firebase project with separate auth, database, etc.
 * - The company is detected from the subdomain (e.g., dtiq.example.com -> dtiq)
 * - Environment variables are prefixed with company name (e.g., NEXT_PUBLIC_DTIQ_FIREBASE_API_KEY)
 *
 * This file is client-safe and can be imported in Client Components.
 * For server-side Firebase operations, use firebase/admin.ts instead.
 *
 * Environment variable naming convention:
 * - Client: NEXT_PUBLIC_{COMPANY}_FIREBASE_API_KEY, etc.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import {
  getClientCompanyUpper,
  DEFAULT_COMPANY_UPPER,
} from '@/lib/config/company-client'

/**
 * Firebase configuration object type
 */
interface FirebaseConfig {
  apiKey: string | undefined
  authDomain: string | undefined
  projectId: string | undefined
  storageBucket: string | undefined
  messagingSenderId: string | undefined
  appId: string | undefined
}

/**
 * Gets Firebase config using client-side company detection.
 * Detects company from window.location hostname and reads NEXT_PUBLIC_ env vars.
 */
function getClientFirebaseConfig(): FirebaseConfig {
  const companyUpper = typeof window !== 'undefined'
    ? getClientCompanyUpper()
    : DEFAULT_COMPANY_UPPER

  // Client-side env vars must be prefixed with NEXT_PUBLIC_ to be available in browser
  // Format: NEXT_PUBLIC_{COMPANY}_FIREBASE_{VAR}
  return {
    apiKey: process.env[`NEXT_PUBLIC_${companyUpper}_FIREBASE_API_KEY`],
    authDomain: process.env[`NEXT_PUBLIC_${companyUpper}_FIREBASE_AUTH_DOMAIN`],
    projectId: process.env[`NEXT_PUBLIC_${companyUpper}_FIREBASE_PROJECT_ID`],
    storageBucket: process.env[`NEXT_PUBLIC_${companyUpper}_FIREBASE_STORAGE_BUCKET`],
    messagingSenderId: process.env[`NEXT_PUBLIC_${companyUpper}_FIREBASE_MESSAGING_SENDER_ID`],
    appId: process.env[`NEXT_PUBLIC_${companyUpper}_FIREBASE_APP_ID`],
  }
}

/**
 * Gets the Firebase configuration for the current company.
 */
function getFirebaseConfig(): FirebaseConfig {
  // Use client-side config (works in browser)
  const clientConfig = getClientFirebaseConfig()
  if (clientConfig.apiKey && clientConfig.projectId) {
    return clientConfig
  }

  // Fallback: try legacy non-prefixed env vars for backward compatibility
  const legacyConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  if (!legacyConfig.apiKey || !legacyConfig.projectId) {
    console.warn(
      '[Firebase] No company-specific Firebase config found. ' +
      'Expected env vars like NEXT_PUBLIC_{COMPANY}_FIREBASE_API_KEY. ' +
      'Falling back to legacy NEXT_PUBLIC_FIREBASE_* vars.'
    )
  }

  return legacyConfig
}

// Get the Firebase configuration
const firebaseConfig = getFirebaseConfig()

// Validate required config
if (!firebaseConfig.apiKey) {
  console.error('[Firebase] Missing API key. Check your environment variables.')
}
if (!firebaseConfig.projectId) {
  console.error('[Firebase] Missing project ID. Check your environment variables.')
}

// Initialize Firebase only once
let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)

// Set auth persistence to LOCAL (survives browser restarts)
// This prevents auth state from being lost on page refresh
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error)
  })
}

export { app }

/**
 * Re-export config getter for components that need to know the current config
 */
export { getFirebaseConfig }
