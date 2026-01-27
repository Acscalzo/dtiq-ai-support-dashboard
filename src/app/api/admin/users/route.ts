import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { UserProfile } from '@/types/auth';
import { verifyAuthToken, hasRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';
import { getPrisma } from '@/lib/db/prisma';

/**
 * GET /api/admin/users
 * Returns list of all users (admin only)
 * Multi-tenant: Returns users from current company's PostgreSQL database
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserProfile[]>>> {
  try {
    // Verify authentication and admin role
    const user = await verifyAuthToken(request);

    if (!hasRole(user, 'admin')) {
      return forbiddenResponse('Admin access required');
    }

    const prisma = getPrisma();

    // Fetch all users from PostgreSQL
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const users: UserProfile[] = dbUsers.map(u => ({
      uid: u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role as UserProfile['role'],
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      photoURL: u.photoURL || null,
      phone: u.phone || null,
      title: u.title || null,
    }));

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
