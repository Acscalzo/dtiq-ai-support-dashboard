import { getPrisma } from '@/lib/db/prisma';
import { Call, CallStats, CallFilters, TranscriptEntry } from '@/types/call';
import { Prisma } from '@prisma/client';

// Convert Prisma Call record to Call type
type PrismaCall = {
  id: string;
  callSid: string;
  phoneNumber: string;
  callerName: string | null;
  status: string;
  isHandled: boolean;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number;
  aiSummary: string;
  transcript: Prisma.JsonValue;
  intent: string;
  isUrgent: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function prismaCallToCall(record: PrismaCall): Call {
  return {
    id: record.id,
    callSid: record.callSid,
    phoneNumber: record.phoneNumber,
    callerName: record.callerName,
    status: record.status as Call['status'],
    isHandled: record.isHandled,
    startTime: record.startTime.toISOString(),
    endTime: record.endTime?.toISOString(),
    durationSeconds: record.durationSeconds,
    aiSummary: record.aiSummary,
    transcript: (record.transcript as unknown as TranscriptEntry[]) || [],
    intent: record.intent,
    isUrgent: record.isUrgent,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

// Get all calls with optional filtering
export async function getCalls(filters?: CallFilters): Promise<Call[]> {
  const prisma = getPrisma();

  const where: Prisma.CallWhereInput = {};

  // Apply filters
  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.isHandled !== undefined) {
    where.isHandled = filters.isHandled;
  }

  if (filters?.isUrgent !== undefined) {
    where.isUrgent = filters.isUrgent;
  }

  // Search filter (case-insensitive)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    where.OR = [
      { phoneNumber: { contains: searchLower, mode: 'insensitive' } },
      { callerName: { contains: searchLower, mode: 'insensitive' } },
      { aiSummary: { contains: searchLower, mode: 'insensitive' } },
      { intent: { contains: searchLower, mode: 'insensitive' } },
    ];
  }

  const calls = await prisma.call.findMany({
    where,
    orderBy: { startTime: 'desc' },
    take: 100,
  });

  return calls.map(prismaCallToCall);
}

// Get a single call by ID
export async function getCallById(callId: string): Promise<Call | null> {
  const prisma = getPrisma();

  const call = await prisma.call.findUnique({
    where: { id: callId },
  });

  if (!call) {
    return null;
  }

  return prismaCallToCall(call);
}

// Update a call (e.g., mark as handled)
export async function updateCall(
  callId: string,
  updates: Partial<Omit<Call, 'id' | 'callSid' | 'createdAt'>>
): Promise<Call | null> {
  const prisma = getPrisma();

  try {
    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: {
        ...(updates.phoneNumber !== undefined && { phoneNumber: updates.phoneNumber }),
        ...(updates.callerName !== undefined && { callerName: updates.callerName }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.isHandled !== undefined && { isHandled: updates.isHandled }),
        ...(updates.endTime !== undefined && { endTime: updates.endTime ? new Date(updates.endTime) : null }),
        ...(updates.durationSeconds !== undefined && { durationSeconds: updates.durationSeconds }),
        ...(updates.aiSummary !== undefined && { aiSummary: updates.aiSummary }),
        ...(updates.transcript !== undefined && { transcript: JSON.parse(JSON.stringify(updates.transcript)) }),
        ...(updates.intent !== undefined && { intent: updates.intent }),
        ...(updates.isUrgent !== undefined && { isUrgent: updates.isUrgent }),
      },
    });

    return prismaCallToCall(updatedCall);
  } catch {
    return null;
  }
}

// Get call statistics
export async function getCallStats(): Promise<CallStats> {
  const prisma = getPrisma();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get counts using efficient queries
  const [totalCalls, callsToday, needsAttention, inProgress, avgResult] = await Promise.all([
    prisma.call.count(),
    prisma.call.count({
      where: {
        startTime: { gte: startOfToday },
      },
    }),
    prisma.call.count({
      where: {
        isHandled: false,
        status: { not: 'in_progress' },
      },
    }),
    prisma.call.count({
      where: { status: 'in_progress' },
    }),
    prisma.call.aggregate({
      _avg: { durationSeconds: true },
      where: {
        status: 'completed',
        durationSeconds: { gt: 0 },
      },
    }),
  ]);

  return {
    totalCalls,
    callsToday,
    needsAttention,
    avgDurationSeconds: Math.round(avgResult._avg.durationSeconds || 0),
    inProgress,
  };
}

// Mark a call as handled/unhandled
export async function markCallHandled(callId: string, isHandled: boolean): Promise<Call | null> {
  return updateCall(callId, { isHandled });
}

// Delete a call (admin only)
export async function deleteCall(callId: string): Promise<boolean> {
  const prisma = getPrisma();

  try {
    await prisma.call.delete({
      where: { id: callId },
    });
    return true;
  } catch {
    return false;
  }
}
