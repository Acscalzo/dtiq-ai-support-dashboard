'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Call, CallStats } from '@/types/call';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/api/client';

interface UseCallsResult {
  calls: Call[];
  stats: CallStats | null;
  loading: boolean;
  error: string | null;
  refreshCalls: () => void;
  toggleHandled: (callId: string) => Promise<void>;
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

  // Fetch calls from API
  useEffect(() => {
    if (!user?.uid) {
      setCalls([]);
      setLoading(false);
      return;
    }

    const fetchCalls = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authenticatedFetch('/api/calls');

        if (!response.ok) {
          throw new Error('Failed to fetch calls');
        }

        const data = await response.json();
        setCalls(data.calls || []);
      } catch (err) {
        console.error('Error fetching calls:', err);
        setError('Failed to load calls');
        setCalls([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, [user?.uid, refreshKey]);

  // Calculate stats from calls (memoized)
  const stats = useMemo(() => {
    if (calls.length === 0 && loading) return null;
    return calculateStats(calls);
  }, [calls, loading]);

  // Manual refresh function
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

    // Optimistic update
    setCalls(prevCalls =>
      prevCalls.map(c =>
        c.id === callId ? { ...c, isHandled: newHandledState } : c
      )
    );

    try {
      const response = await authenticatedFetch(`/api/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHandled: newHandledState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update call');
      }
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
