export type NotificationType =
  | 'new_ticket'
  | 'ticket_assigned'
  | 'ai_insight'
  | 'mention'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

export const notificationTypeConfig: Record<NotificationType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  new_ticket: {
    icon: 'Ticket',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  ticket_assigned: {
    icon: 'UserPlus',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  ai_insight: {
    icon: 'Sparkles',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  mention: {
    icon: 'AtSign',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  system: {
    icon: 'Bell',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
  },
};
