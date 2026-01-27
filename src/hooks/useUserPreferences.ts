'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/api/client';
import { UserPreferences, defaultPreferences } from '@/types/settings';

interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  updateNotifications: (updates: Partial<UserPreferences['notifications']>) => Promise<void>;
  updateDisplay: (updates: Partial<UserPreferences['display']>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch('/api/user/preferences');
      const result = await response.json();

      if (response.ok && result.success) {
        setPreferences(result.data);
      } else {
        // Use defaults if fetch fails
        setPreferences(defaultPreferences);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await authenticatedFetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save preferences');
      }

      setPreferences(result.data);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to save preferences');
      throw err;
    }
  }, [user?.uid]);

  const updateNotifications = useCallback(async (updates: Partial<UserPreferences['notifications']>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await authenticatedFetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: updates }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save notification preferences');
      }

      setPreferences(result.data);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('Failed to save notification preferences');
      throw err;
    }
  }, [user?.uid]);

  const updateDisplay = useCallback(async (updates: Partial<UserPreferences['display']>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await authenticatedFetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display: updates }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save display preferences');
      }

      setPreferences(result.data);
    } catch (err) {
      console.error('Error updating display preferences:', err);
      setError('Failed to save display preferences');
      throw err;
    }
  }, [user?.uid]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateNotifications,
    updateDisplay,
    refetch: fetchPreferences,
  };
}
