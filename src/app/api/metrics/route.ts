import { NextRequest, NextResponse } from 'next/server';
import { DashboardMetrics, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';

/**
 * GET /api/metrics
 * Returns dashboard KPIs based on time range (requires authentication)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DashboardMetrics>>> {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can view metrics
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = (searchParams.get('timeRange') || '7d') as '24h' | '7d' | '30d' | '90d';

    // Validate time range
    if (!['24h', '7d', '30d', '90d'].includes(timeRange)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid timeRange. Must be one of: 24h, 7d, 30d, 90d',
        },
        { status: 400 }
      );
    }

    // Mock metrics based on time range
    const metricsMap: Record<string, DashboardMetrics> = {
      '24h': {
        openTickets: 12,
        avgResponseTime: '1.2h',
        resolutionRate: '94.5%',
        aiAutomation: '68%',
        timeRange: '24h',
      },
      '7d': {
        openTickets: 45,
        avgResponseTime: '2.4h',
        resolutionRate: '92.3%',
        aiAutomation: '65%',
        timeRange: '7d',
      },
      '30d': {
        openTickets: 178,
        avgResponseTime: '3.1h',
        resolutionRate: '89.7%',
        aiAutomation: '62%',
        timeRange: '30d',
      },
      '90d': {
        openTickets: 534,
        avgResponseTime: '3.8h',
        resolutionRate: '87.2%',
        aiAutomation: '58%',
        timeRange: '90d',
      },
    };

    const metrics = metricsMap[timeRange];

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch metrics',
      },
      { status: 500 }
    );
  }
}
