/**
 * Notification creation - DISABLED
 *
 * These functions are being migrated to PostgreSQL.
 * They are stubbed out to prevent Firestore connection attempts.
 */

import { CreateNotificationInput, NotificationType } from '@/types/notifications';

/**
 * Create a new notification - DISABLED (migrating to PostgreSQL)
 */
export async function createNotification(_input: CreateNotificationInput): Promise<string> {
  console.warn('[Firestore] createNotification is disabled - migrating to PostgreSQL');
  return 'stub-notification-id';
}

/**
 * Create a notification for a new ticket - DISABLED
 */
export async function notifyNewTicket(
  _userId: string,
  _ticketId: string,
  _ticketSubject: string
): Promise<string> {
  console.warn('[Firestore] notifyNewTicket is disabled - migrating to PostgreSQL');
  return 'stub-notification-id';
}

/**
 * Create a notification for ticket assignment - DISABLED
 */
export async function notifyTicketAssigned(
  _userId: string,
  _ticketId: string,
  _ticketSubject: string,
  _assignedBy?: string
): Promise<string> {
  console.warn('[Firestore] notifyTicketAssigned is disabled - migrating to PostgreSQL');
  return 'stub-notification-id';
}

/**
 * Create a notification for AI insights - DISABLED
 */
export async function notifyAiInsight(
  _userId: string,
  _insightTitle: string,
  _insightSummary: string,
  _actionUrl?: string
): Promise<string> {
  console.warn('[Firestore] notifyAiInsight is disabled - migrating to PostgreSQL');
  return 'stub-notification-id';
}

/**
 * Create a notification for mentions - DISABLED
 */
export async function notifyMention(
  _userId: string,
  _mentionedBy: string,
  _context: string,
  _actionUrl: string
): Promise<string> {
  console.warn('[Firestore] notifyMention is disabled - migrating to PostgreSQL');
  return 'stub-notification-id';
}

/**
 * Create a system notification - DISABLED
 */
export async function notifySystem(
  _userId: string,
  _title: string,
  _message: string,
  _actionUrl?: string
): Promise<string> {
  console.warn('[Firestore] notifySystem is disabled - migrating to PostgreSQL');
  return 'stub-notification-id';
}

/**
 * Create notifications for multiple users - DISABLED
 */
export async function createBulkNotifications(
  userIds: string[],
  _type: NotificationType,
  _title: string,
  _message: string,
  _actionUrl?: string
): Promise<string[]> {
  console.warn('[Firestore] createBulkNotifications is disabled - migrating to PostgreSQL');
  return userIds.map(() => 'stub-notification-id');
}
