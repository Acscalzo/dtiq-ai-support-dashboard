import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { UserProfile } from '@/types/auth';
import { verifyAuthToken, hasRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';
import { adminDb } from '@/lib/firebase/admin';
import { getCompany } from '@/lib/config/company';

/**
 * GET /api/admin/users
 * Returns list of all users (admin only)
 * Multi-tenant: Returns users from current company's Firebase
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserProfile[]>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    // Verify authentication and admin role
    const user = await verifyAuthToken(request);

    if (!hasRole(user, 'admin')) {
      return forbiddenResponse('Admin access required');
    }

    // Fetch all users from Firestore
    const usersSnapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();

    const users: UserProfile[] = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        photoURL: data.photoURL || null,
        phone: data.phone || null,
        title: data.title || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}
