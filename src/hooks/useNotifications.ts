'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/notifications';
import { authenticatedFetch } from '@/lib/api/client';

interface UseNotificationsOptions {
  limitCount?: number;
  unreadOnly?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refetch: () => void;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { limitCount = 50, unreadOnly = false } = options;
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch notifications from API
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: limitCount.toString(),
          ...(unreadOnly && { unreadOnly: 'true' }),
        });

        const response = await authenticatedFetch(`/api/notifications?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const result = await response.json();
        setNotifications(result.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.uid, limitCount, unreadOnly, refreshKey]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Refetch function
  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );

    try {
      const response = await authenticatedFetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert on error
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
      throw err;
    }
  }, [user?.uid]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    const unreadNotifs = notifications.filter(n => !n.read);
    if (unreadNotifs.length === 0) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const response = await authenticatedFetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Revert on error - refetch to get actual state
      refetch();
      throw err;
    }
  }, [user?.uid, notifications, refetch]);

  // Delete single notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    try {
      const response = await authenticatedFetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      // Refetch on error
      refetch();
      throw err;
    }
  }, [user?.uid, refetch]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    if (!user?.uid) return;

    const readNotifs = notifications.filter(n => n.read);
    if (readNotifs.length === 0) return;

    // Optimistic update
    setNotifications(prev => prev.filter(n => !n.read));

    try {
      // Delete each read notification
      await Promise.all(
        readNotifs.map(n =>
          authenticatedFetch(`/api/notifications?id=${n.id}`, { method: 'DELETE' })
        )
      );
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      // Refetch on error
      refetch();
      throw err;
    }
  }, [user?.uid, notifications, refetch]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refetch,
  };
}
