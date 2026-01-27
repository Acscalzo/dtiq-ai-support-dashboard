import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { getPrisma } from '@/lib/db/prisma';
import { Notification, CreateNotificationInput } from '@/types/notifications';

/**
 * GET /api/notifications
 * Get notifications for the current user
 * Multi-tenant: Returns notifications from current company's PostgreSQL database
 * Query params:
 *   - unreadOnly: boolean (default: false)
 *   - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const prisma = getPrisma();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(1, limitParam), 100);

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.uid,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const formattedNotifications: Notification[] = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as Notification['type'],
      title: n.title,
      message: n.message,
      read: n.read,
      actionUrl: n.actionUrl ?? undefined,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedNotifications,
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
 * Multi-tenant: Creates notification in current company's PostgreSQL database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const prisma = getPrisma();

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

    const notification = await prisma.notification.create({
      data: {
        userId: body.userId,
        type: body.type,
        title: body.title,
        message: body.message,
        actionUrl: body.actionUrl || null,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: notification.id },
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
 * Multi-tenant: Updates notification in current company's PostgreSQL database
 * Body: { id: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const prisma = getPrisma();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (notification.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

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
 * Multi-tenant: Deletes notification from current company's PostgreSQL database
 * Query params: id
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const prisma = getPrisma();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (notification.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

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
