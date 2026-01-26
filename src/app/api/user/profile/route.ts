import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { UserProfile } from '@/types/auth';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { unauthorizedResponse } from '@/lib/auth/apiErrors';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getCompany } from '@/lib/config/company';

/**
 * GET /api/user/profile
 * Returns the current user's profile
 * Multi-tenant: Returns profile from current company's Firebase
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserProfile>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    const user = await verifyAuthToken(request);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile',
      },
      { status: 500 }
    );
  }
}

interface UpdateProfileRequest {
  displayName?: string;
  phone?: string | null;
  title?: string | null;
}

/**
 * PATCH /api/user/profile
 * Updates the current user's profile
 * Multi-tenant: Updates profile in current company's Firebase
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<UserProfile>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    const user = await verifyAuthToken(request);

    const body: UpdateProfileRequest = await request.json();

    // Validate displayName if provided
    if (body.displayName !== undefined) {
      const trimmedName = body.displayName.trim();
      if (!trimmedName) {
        return NextResponse.json(
          {
            success: false,
            error: 'Name cannot be empty',
          },
          { status: 400 }
        );
      }
      if (trimmedName.length < 2) {
        return NextResponse.json(
          {
            success: false,
            error: 'Name must be at least 2 characters',
          },
          { status: 400 }
        );
      }
      if (trimmedName.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Name must be less than 100 characters',
          },
          { status: 400 }
        );
      }
    }

    // Validate phone if provided
    if (body.phone !== undefined && body.phone !== null) {
      const trimmedPhone = body.phone.trim();
      if (trimmedPhone && !/^[\d\s\-\+\(\)]+$/.test(trimmedPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please enter a valid phone number',
          },
          { status: 400 }
        );
      }
    }

    // Validate title if provided
    if (body.title !== undefined && body.title !== null) {
      const trimmedTitle = body.title.trim();
      if (trimmedTitle.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Title must be less than 100 characters',
          },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.displayName !== undefined) {
      updateData.displayName = body.displayName.trim();
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null;
    }
    if (body.title !== undefined) {
      updateData.title = body.title?.trim() || null;
    }

    // Update user document
    await adminDb.collection('users').doc(user.uid).update(updateData);

    // Fetch updated profile
    const updatedDoc = await adminDb.collection('users').doc(user.uid).get();
    const updatedData = updatedDoc.data();

    const updatedProfile: UserProfile = {
      uid: updatedData!.uid,
      email: updatedData!.email,
      displayName: updatedData!.displayName,
      role: updatedData!.role,
      createdAt: updatedData!.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: updatedData!.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      photoURL: updatedData!.photoURL || null,
      phone: updatedData!.phone || null,
      title: updatedData!.title || null,
    };

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user profile',
      },
      { status: 500 }
    );
  }
}
