import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { adminDb } from '@/lib/firebase/admin';
import { Notification, CreateNotificationInput } from '@/types/notifications';
import { FieldValue } from 'firebase-admin/firestore';
import { getCompany } from '@/lib/config/company';

/**
 * GET /api/notifications
 * Get notifications for the current user
 * Multi-tenant: Returns notifications from current company's Firebase
 * Query params:
 *   - unreadOnly: boolean (default: false)
 *   - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // Get current company from subdomain
    const company = getCompany();

    const user = await verifyAuthToken(request);

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(1, limitParam), 100);

    let query = adminDb
      .collection('notifications')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (unreadOnly) {
      query = adminDb
        .collection('notifications')
        .where('userId', '==', user.uid)
        .where('read', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(limit);
    }

    const snapshot = await query.get();

    const notifications: Notification[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read,
        actionUrl: data.actionUrl,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (internal use / admin only)
 * Multi-tenant: Creates notification in current company's Firebase
 */
export async function POST(request: NextRequest) {
  try {
    // Get current company from subdomain
    const company = getCompany();

    const user = await verifyAuthToken(request);

    // Only admins can create notifications via API
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body: CreateNotificationInput = await request.json();

    if (!body.userId || !body.type || !body.title || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection('notifications').add({
      userId: body.userId,
      type: body.type,
      title: body.title,
      message: body.message,
      actionUrl: body.actionUrl || null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
    });
  } catch (error) {
    console.error('Error creating notification:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark a notification as read
 * Multi-tenant: Updates notification in current company's Firebase
 * Body: { id: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get current company from subdomain
    const company = getCompany();

    const user = await verifyAuthToken(request);

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notificationRef = adminDb.collection('notifications').doc(id);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (notificationDoc.data()?.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await notificationRef.update({ read: true });

    return NextResponse.json({
      success: true,
      data: { id, read: true },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete a notification
 * Multi-tenant: Deletes notification from current company's Firebase
 * Query params: id
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get current company from subdomain
    const company = getCompany();

    const user = await verifyAuthToken(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notificationRef = adminDb.collection('notifications').doc(id);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (notificationDoc.data()?.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await notificationRef.delete();

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
    });
  } catch (error) {
    console.error('Error deleting notification:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
