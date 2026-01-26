import { NextRequest, NextResponse } from 'next/server';
import { getCalls, getCallStats } from '@/lib/firebase/calls';
import { verifyAuthToken } from '@/lib/auth/apiAuth';
import { CallFilters, CallStatus } from '@/types/call';
import { getCompany } from '@/lib/config/company';

/**
 * GET /api/calls
 * Get all calls with optional filtering
 * Multi-tenant: Returns calls from current company's Firebase
 */
export async function GET(request: NextRequest) {
  try {
    // Get current company from subdomain
    const company = getCompany();

    // Verify authentication
    await verifyAuthToken(request);

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: CallFilters = {};

    const status = searchParams.get('status');
    if (status && ['in_progress', 'completed', 'failed', 'no_answer'].includes(status)) {
      filters.status = status as CallStatus;
    }

    const isHandled = searchParams.get('isHandled');
    if (isHandled !== null) {
      filters.isHandled = isHandled === 'true';
    }

    const isUrgent = searchParams.get('isUrgent');
    if (isUrgent !== null) {
      filters.isUrgent = isUrgent === 'true';
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    // Check if stats are requested
    const includeStats = searchParams.get('includeStats') === 'true';

    // Fetch calls and optionally stats
    const [calls, stats] = await Promise.all([
      getCalls(filters),
      includeStats ? getCallStats() : null,
    ]);

    return NextResponse.json({
      calls,
      ...(stats && { stats }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}
