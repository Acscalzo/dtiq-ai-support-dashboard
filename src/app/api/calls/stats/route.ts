import { NextRequest, NextResponse } from 'next/server';
import { getCallStats } from '@/lib/firebase/calls';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { getCompany } from '@/lib/config/company';

/**
 * GET /api/calls/stats
 * Get call statistics
 * Multi-tenant: Returns stats from current company's Firebase
 */
export async function GET(request: NextRequest) {
  try {
    // Get current company from subdomain
    const company = getCompany();

    await verifyAuthToken(request);

    const stats = await getCallStats();
    return NextResponse.json({ stats });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching call stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call stats' },
      { status: 500 }
    );
  }
}
