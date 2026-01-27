import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import { UserPreferences, defaultPreferences } from '@/types/settings';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { unauthorizedResponse } from '@/lib/auth/apiErrors';
import { getPrisma } from '@/lib/db/prisma';

/**
 * GET /api/user/preferences
 * Returns the current user's preferences
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserPreferences>>> {
  try {
    const user = await verifyAuthToken(request);
    const prisma = getPrisma();

    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: user.uid },
    });

    if (!prefs) {
      // Return defaults if no preferences saved
      return NextResponse.json({
        success: true,
        data: defaultPreferences,
      });
    }

    const preferences: UserPreferences = {
      notifications: {
        emailNewTickets: prefs.emailNewTickets,
        emailAssignedTickets: prefs.emailAssignedTickets,
        emailAiInsights: prefs.emailAiInsights,
        browserPushNotifications: prefs.browserPushNotifications,
      },
      display: {
        timezone: prefs.timezone,
        dateFormat: prefs.dateFormat as UserPreferences['display']['dateFormat'],
      },
      updatedAt: prefs.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user preferences',
      },
      { status: 500 }
    );
  }
}

interface UpdatePreferencesRequest {
  notifications?: Partial<UserPreferences['notifications']>;
  display?: Partial<UserPreferences['display']>;
}

/**
 * PATCH /api/user/preferences
 * Updates the current user's preferences
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<UserPreferences>>> {
  try {
    const user = await verifyAuthToken(request);
    const prisma = getPrisma();

    const body: UpdatePreferencesRequest = await request.json();

    // Build update data
    const updateData: {
      emailNewTickets?: boolean;
      emailAssignedTickets?: boolean;
      emailAiInsights?: boolean;
      browserPushNotifications?: boolean;
      timezone?: string;
      dateFormat?: string;
    } = {};

    if (body.notifications) {
      if (body.notifications.emailNewTickets !== undefined) {
        updateData.emailNewTickets = body.notifications.emailNewTickets;
      }
      if (body.notifications.emailAssignedTickets !== undefined) {
        updateData.emailAssignedTickets = body.notifications.emailAssignedTickets;
      }
      if (body.notifications.emailAiInsights !== undefined) {
        updateData.emailAiInsights = body.notifications.emailAiInsights;
      }
      if (body.notifications.browserPushNotifications !== undefined) {
        updateData.browserPushNotifications = body.notifications.browserPushNotifications;
      }
    }

    if (body.display) {
      if (body.display.timezone !== undefined) {
        updateData.timezone = body.display.timezone;
      }
      if (body.display.dateFormat !== undefined) {
        // Validate date format
        const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
        if (!validFormats.includes(body.display.dateFormat)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid date format',
            },
            { status: 400 }
          );
        }
        updateData.dateFormat = body.display.dateFormat;
      }
    }

    // Upsert preferences
    const prefs = await prisma.userPreferences.upsert({
      where: { userId: user.uid },
      update: updateData,
      create: {
        userId: user.uid,
        ...updateData,
      },
    });

    const preferences: UserPreferences = {
      notifications: {
        emailNewTickets: prefs.emailNewTickets,
        emailAssignedTickets: prefs.emailAssignedTickets,
        emailAiInsights: prefs.emailAiInsights,
        browserPushNotifications: prefs.browserPushNotifications,
      },
      display: {
        timezone: prefs.timezone,
        dateFormat: prefs.dateFormat as UserPreferences['display']['dateFormat'],
      },
      updatedAt: prefs.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user preferences',
      },
      { status: 500 }
    );
  }
}
