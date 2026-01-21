export type CallStatus = 'in_progress' | 'completed' | 'failed' | 'no_answer';

export interface TranscriptEntry {
  speaker: 'Caller' | 'AI';
  text: string;
  timestamp?: string;
}

export interface Call {
  id: string;
  callSid: string;
  phoneNumber: string;
  callerName: string | null;
  status: CallStatus;
  isHandled: boolean;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  aiSummary: string;
  transcript: TranscriptEntry[];
  intent: string;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CallStats {
  totalCalls: number;
  callsToday: number;
  needsAttention: number;
  avgDurationSeconds: number;
  inProgress: number;
}

export interface CallFilters {
  status?: CallStatus;
  isHandled?: boolean;
  isUrgent?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}
