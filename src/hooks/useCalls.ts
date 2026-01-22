'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Call, CallStats } from '@/types/call';
import { useAuth } from '@/contexts/AuthContext';

interface UseCallsResult {
  calls: Call[];
  stats: CallStats | null;
  loading: boolean;
  error: string | null;
  refreshCalls: () => void;
  toggleHandled: (callId: string) => Promise<void>;
}

// Convert Firestore document data to Call type
function docToCall(docId: string, data: Record<string, unknown>): Call {
  return {
    id: docId,
    callSid: (data.callSid as string) || '',
    phoneNumber: (data.phoneNumber as string) || '',
    callerName: (data.callerName as string) || null,
    status: (data.status as Call['status']) || 'completed',
    isHandled: (data.isHandled as boolean) || false,
    startTime: data.startTime instanceof Timestamp
      ? data.startTime.toDate().toISOString()
      : (data.startTime as string) || new Date().toISOString(),
    endTime: data.endTime instanceof Timestamp
      ? data.endTime.toDate().toISOString()
      : (data.endTime as string) || undefined,
    durationSeconds: (data.durationSeconds as number) || 0,
    aiSummary: (data.aiSummary as string) || '',
    transcript: (data.transcript as Call['transcript']) || [],
    intent: (data.intent as string) || 'Unknown',
    isUrgent: (data.isUrgent as boolean) || false,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string) || new Date().toISOString(),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string) || new Date().toISOString(),
  };
}

// Calculate stats from calls array
function calculateStats(calls: Call[]): CallStats {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalCalls = calls.length;

  const callsToday = calls.filter(call => {
    const callDate = new Date(call.startTime);
    return callDate >= startOfToday;
  }).length;

  const needsAttention = calls.filter(
    call => !call.isHandled && call.status !== 'in_progress'
  ).length;

  const inProgress = calls.filter(call => call.status === 'in_progress').length;

  const completedCalls = calls.filter(
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

export function useCalls(): UseCallsResult {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  // Real-time listener for calls
  useEffect(() => {
    if (!user?.uid) {
      setCalls([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const callsRef = collection(db, 'calls');

      // Query: order by startTime descending, limit to 100
      const q = query(
        callsRef,
        orderBy('startTime', 'desc'),
        limit(100)
      );

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const callsList: Call[] = snapshot.docs.map((doc) =>
            docToCall(doc.id, doc.data() as Record<string, unknown>)
          );
          setCalls(callsList);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching calls:', err);
          setError('Failed to load calls');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up calls listener:', err);
      setError('Failed to load calls');
      setLoading(false);
    }
  }, [user?.uid, refreshKey]);

  // Calculate stats from calls (memoized)
  const stats = useMemo(() => {
    if (calls.length === 0 && loading) return null;
    return calculateStats(calls);
  }, [calls, loading]);

  // Manual refresh function (triggers re-subscription)
  const refreshCalls = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Toggle handled status with optimistic update
  const toggleHandled = useCallback(async (callId: string) => {
    if (!user) return;

    // Find current call to get current handled state
    const call = calls.find(c => c.id === callId);
    if (!call) return;

    const newHandledState = !call.isHandled;

    // Optimistic update - Firestore listener will sync if needed
    setCalls(prevCalls =>
      prevCalls.map(c =>
        c.id === callId ? { ...c, isHandled: newHandledState } : c
      )
    );

    try {
      // Update directly in Firestore (client SDK)
      const callRef = doc(db, 'calls', callId);
      await updateDoc(callRef, {
        isHandled: newHandledState,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error updating call:', err);
      // Revert optimistic update on error
      setCalls(prevCalls =>
        prevCalls.map(c =>
          c.id === callId ? { ...c, isHandled: !newHandledState } : c
        )
      );
    }
  }, [user, calls]);

  return {
    calls,
    stats,
    loading,
    error,
    refreshCalls,
    toggleHandled,
  };
}
