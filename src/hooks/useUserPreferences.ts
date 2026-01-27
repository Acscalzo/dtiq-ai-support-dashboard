'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
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

  // Check if Firestore is disabled (stubbed)
  const isFirestoreDisabled = (db as any)?._stub === true;

  const fetchPreferences = useCallback(async () => {
    // If Firestore is disabled, use defaults
    if (isFirestoreDisabled) {
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const prefsDoc = await getDoc(doc(db, 'users', user.uid, 'preferences', 'settings'));

      if (prefsDoc.exists()) {
        const data = prefsDoc.data();
        setPreferences({
          notifications: {
            emailNewTickets: data.notifications?.emailNewTickets ?? defaultPreferences.notifications.emailNewTickets,
            emailAssignedTickets: data.notifications?.emailAssignedTickets ?? defaultPreferences.notifications.emailAssignedTickets,
            emailAiInsights: data.notifications?.emailAiInsights ?? defaultPreferences.notifications.emailAiInsights,
            browserPushNotifications: data.notifications?.browserPushNotifications ?? defaultPreferences.notifications.browserPushNotifications,
          },
          display: {
            timezone: data.display?.timezone ?? defaultPreferences.display.timezone,
            dateFormat: data.display?.dateFormat ?? defaultPreferences.display.dateFormat,
          },
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        });
      } else {
        // Create default preferences document
        await setDoc(doc(db, 'users', user.uid, 'preferences', 'settings'), {
          ...defaultPreferences,
          updatedAt: Timestamp.now(),
        });
        setPreferences(defaultPreferences);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, isFirestoreDisabled]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (isFirestoreDisabled) {
      // Update local state only when Firestore is disabled
      setPreferences(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
      return;
    }

    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const prefsRef = doc(db, 'users', user.uid, 'preferences', 'settings');

      await updateDoc(prefsRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      setPreferences(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Failed to save preferences');
      throw err;
    }
  }, [user?.uid, isFirestoreDisabled]);

  const updateNotifications = useCallback(async (updates: Partial<UserPreferences['notifications']>) => {
    if (isFirestoreDisabled) {
      // Update local state only when Firestore is disabled
      setPreferences(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...updates },
        updatedAt: new Date().toISOString(),
      }));
      return;
    }

    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const prefsRef = doc(db, 'users', user.uid, 'preferences', 'settings');

      const newNotifications = {
        ...preferences.notifications,
        ...updates,
      };

      await updateDoc(prefsRef, {
        notifications: newNotifications,
        updatedAt: Timestamp.now(),
      });

      setPreferences(prev => ({
        ...prev,
        notifications: newNotifications,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('Failed to save notification preferences');
      throw err;
    }
  }, [user?.uid, preferences.notifications, isFirestoreDisabled]);

  const updateDisplay = useCallback(async (updates: Partial<UserPreferences['display']>) => {
    if (isFirestoreDisabled) {
      // Update local state only when Firestore is disabled
      setPreferences(prev => ({
        ...prev,
        display: { ...prev.display, ...updates },
        updatedAt: new Date().toISOString(),
      }));
      return;
    }

    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const prefsRef = doc(db, 'users', user.uid, 'preferences', 'settings');

      const newDisplay = {
        ...preferences.display,
        ...updates,
      };

      await updateDoc(prefsRef, {
        display: newDisplay,
        updatedAt: Timestamp.now(),
      });

      setPreferences(prev => ({
        ...prev,
        display: newDisplay,
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error updating display preferences:', err);
      setError('Failed to save display preferences');
      throw err;
    }
  }, [user?.uid, preferences.display, isFirestoreDisabled]);

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
