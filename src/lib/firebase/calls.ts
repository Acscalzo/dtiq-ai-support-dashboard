import { adminDb } from './admin';
import { Call, CallStats, CallFilters } from '@/types/call';
import admin from 'firebase-admin';

const CALLS_COLLECTION = 'calls';

// Convert Firestore document to Call type
function docToCall(doc: admin.firestore.DocumentSnapshot): Call {
  const data = doc.data();
  if (!data) throw new Error('Document data is undefined');

  return {
    id: doc.id,
    callSid: data.callSid || '',
    phoneNumber: data.phoneNumber || '',
    callerName: data.callerName || null,
    status: data.status || 'completed',
    isHandled: data.isHandled || false,
    startTime: data.startTime?.toDate?.()?.toISOString() || data.startTime || new Date().toISOString(),
    endTime: data.endTime?.toDate?.()?.toISOString() || data.endTime || undefined,
    durationSeconds: data.durationSeconds || 0,
    aiSummary: data.aiSummary || '',
    transcript: data.transcript || [],
    intent: data.intent || 'Unknown',
    isUrgent: data.isUrgent || false,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
  };
}

// Get all calls with optional filtering
export async function getCalls(filters?: CallFilters): Promise<Call[]> {
  let query: admin.firestore.Query = adminDb.collection(CALLS_COLLECTION);

  // Apply filters
  if (filters?.status) {
    query = query.where('status', '==', filters.status);
  }

  if (filters?.isHandled !== undefined) {
    query = query.where('isHandled', '==', filters.isHandled);
  }

  if (filters?.isUrgent !== undefined) {
    query = query.where('isUrgent', '==', filters.isUrgent);
  }

  // Order by start time descending (newest first)
  query = query.orderBy('startTime', 'desc');

  // Limit to recent calls
  query = query.limit(100);

  const snapshot = await query.get();
  const calls = snapshot.docs.map(docToCall);

  // Apply client-side search if provided
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    return calls.filter(call =>
      call.phoneNumber.toLowerCase().includes(searchLower) ||
      call.callerName?.toLowerCase().includes(searchLower) ||
      call.aiSummary.toLowerCase().includes(searchLower) ||
      call.intent.toLowerCase().includes(searchLower)
    );
  }

  return calls;
}

// Get a single call by ID
export async function getCallById(callId: string): Promise<Call | null> {
  const doc = await adminDb.collection(CALLS_COLLECTION).doc(callId).get();

  if (!doc.exists) {
    return null;
  }

  return docToCall(doc);
}

// Update a call (e.g., mark as handled)
export async function updateCall(
  callId: string,
  updates: Partial<Omit<Call, 'id' | 'callSid' | 'createdAt'>>
): Promise<Call | null> {
  const docRef = adminDb.collection(CALLS_COLLECTION).doc(callId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  await docRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedDoc = await docRef.get();
  return docToCall(updatedDoc);
}

// Get call statistics
export async function getCallStats(): Promise<CallStats> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get all calls for stats
  const allCallsSnapshot = await adminDb.collection(CALLS_COLLECTION).get();
  const allCalls = allCallsSnapshot.docs.map(docToCall);

  // Calculate stats
  const totalCalls = allCalls.length;

  const callsToday = allCalls.filter(call => {
    const callDate = new Date(call.startTime);
    return callDate >= startOfToday;
  }).length;

  const needsAttention = allCalls.filter(
    call => !call.isHandled && call.status !== 'in_progress'
  ).length;

  const inProgress = allCalls.filter(call => call.status === 'in_progress').length;

  const completedCalls = allCalls.filter(
    call => call.status === 'completed' && call.durationSeconds > 0
  );

  const avgDurationSeconds = completedCalls.length > 0
    ? Math.round(
        completedCalls.reduce((sum, call) => sum + call.durationSeconds, 0) /
        completedCalls.length
      )
    : 0;

  return {
    totalCalls,
    callsToday,
    needsAttention,
    avgDurationSeconds,
    inProgress,
  };
}

// Mark a call as handled/unhandled
export async function markCallHandled(callId: string, isHandled: boolean): Promise<Call | null> {
  return updateCall(callId, { isHandled });
}

// Delete a call (admin only)
export async function deleteCall(callId: string): Promise<boolean> {
  try {
    await adminDb.collection(CALLS_COLLECTION).doc(callId).delete();
    return true;
  } catch {
    return false;
  }
}
