import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getPrisma } from '@/lib/db/prisma';
import { UserProfile, UserRole } from '@/types/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: UserProfile;
}

/**
 * Verify Firebase token from Authorization header
 * Returns user profile if valid, throws error if invalid
 *
 * Uses Firebase Auth for token verification, PostgreSQL for user data storage.
 * Creates user in PostgreSQL if they don't exist (first login after migration).
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
    const prisma = getPrisma();

    // Get or create user profile in PostgreSQL
    let user = await prisma.user.findUnique({
      where: { id: decodedToken.uid },
    });

    // If user doesn't exist in PostgreSQL, create them (handles migration from Firestore)
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name || decodedToken.email?.split('@')[0] || null,
          role: 'agent', // Default role for new users
          photoURL: decodedToken.picture || null,
        },
      });
    }

    const userProfile: UserProfile = {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      photoURL: user.photoURL || null,
      phone: user.phone || null,
      title: user.title || null,
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
