import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserProfile, UserRole } from '@/types/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: UserProfile;
}

/**
 * Verify Firebase token from Authorization header
 * Returns user profile if valid, throws error if invalid
 */
export async function verifyAuthToken(request: NextRequest): Promise<UserProfile> {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Get user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data();

    const userProfile: UserProfile = {
      uid: userData!.uid,
      email: userData!.email,
      displayName: userData!.displayName,
      role: userData!.role,
      createdAt: userData!.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: userData!.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      photoURL: userData!.photoURL || null,
    };

    return userProfile;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Unauthorized');
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: UserProfile, requiredRole: UserRole): boolean {
  // Admins have access to everything
  if (user.role === 'admin') {
    return true;
  }

  return user.role === requiredRole;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: UserProfile, requiredRoles: UserRole[]): boolean {
  // Admins have access to everything
  if (user.role === 'admin') {
    return true;
  }

  return requiredRoles.includes(user.role);
}
