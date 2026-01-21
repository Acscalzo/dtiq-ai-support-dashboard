export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface NotificationPreferences {
  emailNewTickets: boolean;
  emailAssignedTickets: boolean;
  emailAiInsights: boolean;
  browserPushNotifications: boolean;
}

export interface DisplayPreferences {
  timezone: string;
  dateFormat: DateFormat;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  updatedAt: string;
}

export const defaultPreferences: UserPreferences = {
  notifications: {
    emailNewTickets: true,
    emailAssignedTickets: true,
    emailAiInsights: false,
    browserPushNotifications: false,
  },
  display: {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
  },
  updatedAt: new Date().toISOString(),
};

export interface IntegrationStatus {
  name: string;
  connected: boolean;
  lastChecked?: string;
  usage?: {
    current: number;
    limit: number;
    unit: string;
  };
  error?: string;
}
