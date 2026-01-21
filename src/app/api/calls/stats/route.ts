import { NextRequest, NextResponse } from 'next/server';
import { getCallStats } from '@/lib/firebase/calls';
import { verifyAuthToken } from '@/lib/auth/apiAuth';

// GET /api/calls/stats - Get call statistics
export async function GET(request: NextRequest) {
  try {
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
