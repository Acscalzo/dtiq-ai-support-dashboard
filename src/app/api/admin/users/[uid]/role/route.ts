import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { UserRole } from '@/types/auth';
import { verifyAuthToken, hasRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';
import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { getCompany } from '@/lib/config/company';

/**
 * PATCH /api/admin/users/[uid]/role
 * Update user role (admin only)
 * Multi-tenant: Updates user in current company's Firebase
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    // Verify authentication and admin role
    const user = await verifyAuthToken(request);

    if (!hasRole(user, 'admin')) {
      return forbiddenResponse('Admin access required');
    }

    const { role } = await request.json() as { role: UserRole };
    const targetUid = params.uid;

    // Validate role
    if (!['admin', 'manager', 'agent'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role. Must be one of: admin, manager, agent',
        },
        { status: 400 }
      );
    }

    // Prevent self-demotion
    if (targetUid === user.uid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot change your own role',
        },
        { status: 400 }
      );
    }

    // Update user role in Firestore
    await adminDb.collection('users').doc(targetUid).update({
      role,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      data: { success: true },
      message: 'User role updated successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error updating user role:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user role',
      },
      { status: 500 }
    );
  }
}
