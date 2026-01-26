import { NextRequest, NextResponse } from 'next/server';
import { DocumentationStats, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';
import { getCompany } from '@/lib/config/company';

/**
 * GET /api/documentation/stats
 * Returns documentation statistics by category (requires authentication)
 * Multi-tenant: Returns stats for the current company's subdomain
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DocumentationStats>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can view documentation stats
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    // Mock documentation statistics
    const stats: DocumentationStats = {
      totalArticles: 47,
      totalViews: 12543,
      categories: [
        {
          name: 'Getting Started',
          count: 8,
          viewCount: 3421,
        },
        {
          name: 'API',
          count: 12,
          viewCount: 2876,
        },
        {
          name: 'Troubleshooting',
          count: 15,
          viewCount: 4234,
        },
        {
          name: 'Billing',
          count: 6,
          viewCount: 1234,
        },
        {
          name: 'Security',
          count: 6,
          viewCount: 778,
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching documentation stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch documentation stats',
      },
      { status: 500 }
    );
  }
}
