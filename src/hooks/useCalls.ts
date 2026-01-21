import { useState, useEffect, useCallback } from 'react';
import { Call, CallStats } from '@/types/call';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/firebase/auth-helpers';

interface UseCallsResult {
  calls: Call[];
  stats: CallStats | null;
  loading: boolean;
  error: string | null;
  refreshCalls: () => Promise<void>;
  toggleHandled: (callId: string) => Promise<void>;
}

export function useCalls(): UseCallsResult {
  const [calls, setCalls] = useState<Call[]>([]);
  const [stats, setStats] = useState<CallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCalls = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const token = await getAuthToken();

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/calls?includeStats=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }

      const data = await response.json();
      setCalls(data.calls || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Error fetching calls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  // Refresh function
  const refreshCalls = useCallback(async () => {
    setLoading(true);
    await fetchCalls();
  }, [fetchCalls]);

  // Toggle handled status
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

    // Update stats optimistically
    if (stats) {
      setStats(prev => prev ? {
        ...prev,
        needsAttention: newHandledState
          ? prev.needsAttention - 1
          : prev.needsAttention + 1,
      } : null);
    }

    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/calls/${callId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          needsAttention: !newHandledState
            ? prev.needsAttention - 1
            : prev.needsAttention + 1,
        } : null);
      }
    }
  }, [user, calls, stats]);

  return {
    calls,
    stats,
    loading,
    error,
    refreshCalls,
    toggleHandled,
  };
}
