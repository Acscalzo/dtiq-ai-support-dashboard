import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { unauthorizedResponse } from '@/lib/auth/apiErrors';
import { adminDb } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { FieldValue } from 'firebase-admin/firestore';

interface AvatarResponse {
  photoURL: string | null;
}

/**
 * POST /api/user/avatar
 * Upload a new avatar (expects base64 image data or URL)
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AvatarResponse>>> {
  try {
    const user = await verifyAuthToken(request);

    const body = await request.json();
    const { photoURL } = body;

    if (!photoURL) {
      return NextResponse.json(
        {
          success: false,
          error: 'Photo URL is required',
        },
        { status: 400 }
      );
    }

    // Validate URL format (either data URL or Firebase Storage URL)
    if (!photoURL.startsWith('data:image/') && !photoURL.includes('firebasestorage.googleapis.com')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid photo URL format',
        },
        { status: 400 }
      );
    }

    // Update user document with new photo URL
    await adminDb.collection('users').doc(user.uid).update({
      photoURL,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: { photoURL },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload avatar',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Remove the user's avatar
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse<AvatarResponse>>> {
  try {
    const user = await verifyAuthToken(request);

    // Get current photo URL to potentially delete from storage
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const currentPhotoURL = userDoc.data()?.photoURL;

    // If the photo is stored in Firebase Storage, delete it
    if (currentPhotoURL && currentPhotoURL.includes('firebasestorage.googleapis.com')) {
      try {
        const bucket = getStorage().bucket();

        // Extract the file path from the URL
        const urlObj = new URL(currentPhotoURL);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+?)(\?|$)/);
        if (pathMatch) {
          const filePath = decodeURIComponent(pathMatch[1]);
          await bucket.file(filePath).delete();
        }
      } catch (storageError) {
        // Log but don't fail if storage deletion fails
        console.warn('Error deleting avatar from storage:', storageError);
      }
    }

    // Remove photo URL from user document
    await adminDb.collection('users').doc(user.uid).update({
      photoURL: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: { photoURL: null },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error deleting avatar:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete avatar',
      },
      { status: 500 }
    );
  }
}
