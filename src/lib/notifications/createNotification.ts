import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { CreateNotificationInput, NotificationType } from '@/types/notifications';

/**
 * Create a new notification in Firestore
 */
export async function createNotification(input: CreateNotificationInput): Promise<string> {
  try {
    const notificationsRef = collection(db, 'notifications');

    const docRef = await addDoc(notificationsRef, {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl || null,
      read: false,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create a notification for a new ticket
 */
export async function notifyNewTicket(
  userId: string,
  ticketId: string,
  ticketSubject: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'new_ticket',
    title: 'New Support Ticket',
    message: `A new ticket has been created: "${ticketSubject}"`,
    actionUrl: `/dashboard/tickets/${ticketId}`,
  });
}

/**
 * Create a notification for ticket assignment
 */
export async function notifyTicketAssigned(
  userId: string,
  ticketId: string,
  ticketSubject: string,
  assignedBy?: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'ticket_assigned',
    title: 'Ticket Assigned to You',
    message: assignedBy
      ? `${assignedBy} assigned you to: "${ticketSubject}"`
      : `You have been assigned to: "${ticketSubject}"`,
    actionUrl: `/dashboard/tickets/${ticketId}`,
  });
}

/**
 * Create a notification for AI insights
 */
export async function notifyAiInsight(
  userId: string,
  insightTitle: string,
  insightSummary: string,
  actionUrl?: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'ai_insight',
    title: insightTitle,
    message: insightSummary,
    actionUrl: actionUrl || '/dashboard/ai-insights',
  });
}

/**
 * Create a notification for mentions
 */
export async function notifyMention(
  userId: string,
  mentionedBy: string,
  context: string,
  actionUrl: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'mention',
    title: `${mentionedBy} mentioned you`,
    message: context,
    actionUrl,
  });
}

/**
 * Create a system notification
 */
export async function notifySystem(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<string> {
  return createNotification({
    userId,
    type: 'system',
    title,
    message,
    actionUrl,
  });
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string
): Promise<string[]> {
  const promises = userIds.map((userId) =>
    createNotification({
      userId,
      type,
      title,
      message,
      actionUrl,
    })
  );

  return Promise.all(promises);
}
