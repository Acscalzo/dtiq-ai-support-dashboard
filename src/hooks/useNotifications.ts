'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/notifications';

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
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { limitCount = 50, unreadOnly = false } = options;
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for notifications
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notificationsRef = collection(db, 'notifications');

      // Build query
      let q = query(
        notificationsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (unreadOnly) {
        q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          where('read', '==', false),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notifs: Notification[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              userId: data.userId,
              type: data.type,
              title: data.title,
              message: data.message,
              read: data.read,
              actionUrl: data.actionUrl,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            };
          });
          setNotifications(notifs);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching notifications:', err);
          setError('Failed to load notifications');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up notifications listener:', err);
      setError('Failed to load notifications');
      setLoading(false);
    }
  }, [user?.uid, limitCount, unreadOnly]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [user?.uid]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter((n) => !n.read);

      unreadNotifs.forEach((notif) => {
        const notificationRef = doc(db, 'notifications', notif.id);
        batch.update(notificationRef, { read: true });
      });

      await batch.commit();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [user?.uid, notifications]);

  // Delete single notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [user?.uid]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const batch = writeBatch(db);
      const readNotifs = notifications.filter((n) => n.read);

      readNotifs.forEach((notif) => {
        const notificationRef = doc(db, 'notifications', notif.id);
        batch.delete(notificationRef);
      });

      await batch.commit();
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      throw err;
    }
  }, [user?.uid, notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  };
}
