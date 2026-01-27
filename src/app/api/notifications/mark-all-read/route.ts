import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { getPrisma } from '@/lib/db/prisma';

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 * Multi-tenant: Updates notifications in current company's PostgreSQL database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const prisma = getPrisma();

    // Update all unread notifications for this user
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.uid,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { updated: result.count },
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
