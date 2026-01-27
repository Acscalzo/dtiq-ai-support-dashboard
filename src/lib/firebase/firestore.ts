/**
 * Firestore client operations - DISABLED
 *
 * These functions are being migrated to PostgreSQL.
 * They are stubbed out to prevent Firestore connection attempts.
 */

import { UserProfile, UserRole } from '@/types/auth';

/**
 * Get user profile - DISABLED (migrating to PostgreSQL)
 */
export async function getUserProfile(_uid: string): Promise<UserProfile | null> {
  console.warn('[Firestore] getUserProfile is disabled - migrating to PostgreSQL');
  return null;
}

/**
 * Create user profile - DISABLED (migrating to PostgreSQL)
 */
export async function createUserProfile(
  _uid: string,
  _email: string,
  _displayName: string | null
): Promise<UserProfile> {
  throw new Error('Firestore is disabled. createUserProfile is being migrated to PostgreSQL.');
}

/**
 * Update user role - DISABLED (migrating to PostgreSQL)
 */
export async function updateUserRole(_uid: string, _role: UserRole): Promise<void> {
  throw new Error('Firestore is disabled. updateUserRole is being migrated to PostgreSQL.');
}
