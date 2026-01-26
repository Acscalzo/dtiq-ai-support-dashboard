import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsTrends, TrendDataPoint, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';
import { getCompany } from '@/lib/config/company';

/**
 * Generate mock trend data for the last N days
 */
function generateTrendData(days: number): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate realistic-looking numbers with some variance
    const baseCreated = 15 + Math.floor(Math.random() * 10);
    const baseResolved = Math.floor(baseCreated * (0.8 + Math.random() * 0.15));
    const aiResolved = Math.floor(baseResolved * (0.6 + Math.random() * 0.2));

    data.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      created: baseCreated,
      resolved: baseResolved,
      aiResolved: aiResolved,
    });
  }

  return data;
}

/**
 * GET /api/analytics/trends
 * Returns time-series data for charts (requires authentication)
 * Multi-tenant: Returns trends for the current company's subdomain
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AnalyticsTrends>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can view analytics
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';

    // Determine number of days based on time range
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const days = daysMap[timeRange] || 7;

    // Generate trend data
    const trendData = generateTrendData(days);

    const response: AnalyticsTrends = {
      data: trendData,
      timeRange,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching analytics trends:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics trends',
      },
      { status: 500 }
    );
  }
}
