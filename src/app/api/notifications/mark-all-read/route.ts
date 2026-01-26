import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { adminDb } from '@/lib/firebase/admin';
import { getCompany } from '@/lib/config/company';

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 * Multi-tenant: Updates notifications in current company's Firebase
 */
export async function POST(request: NextRequest) {
  try {
    // Get current company from subdomain
    const company = getCompany();

    const user = await verifyAuthToken(request);

    // Get all unread notifications for this user
    const snapshot = await adminDb
      .collection('notifications')
      .where('userId', '==', user.uid)
      .where('read', '==', false)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        data: { updated: 0 },
      });
    }

    // Batch update all unread notifications
    const batch = adminDb.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      data: { updated: snapshot.size },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
