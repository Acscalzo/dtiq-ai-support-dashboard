import { NextRequest, NextResponse } from 'next/server';
import { InsightsSummary, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';

/**
 * GET /api/insights/summary
 * Returns AI insight counts and statistics (requires authentication)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<InsightsSummary>>> {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can view insights
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    // Mock AI insights data
    const insights: InsightsSummary = {
      upsellCount: 23,
      trainingNeeded: 8,
      recurringIssues: 12,
      positiveSentiment: 78,
    };

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching insights summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch insights summary',
      },
      { status: 500 }
    );
  }
}
