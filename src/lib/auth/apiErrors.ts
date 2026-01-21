import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
}
