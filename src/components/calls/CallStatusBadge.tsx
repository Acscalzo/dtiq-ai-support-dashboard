import type { CallStatus } from '@/data/mockCalls';

interface CallStatusBadgeProps {
  status: CallStatus;
}

const statusConfig: Record<
  CallStatus,
  { label: string; className: string }
> = {
  in_progress: {
    label: 'In Progress',
    className:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  completed: {
    label: 'Completed',
    className:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  failed: {
    label: 'Failed',
    className:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  no_answer: {
    label: 'No Answer',
    className:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  },
};

export function CallStatusBadge({ status }: CallStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

interface HandledBadgeProps {
  isHandled: boolean;
}

export function HandledBadge({ isHandled }: HandledBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        isHandled
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
      }`}
    >
      {isHandled ? 'Handled' : 'Unhandled'}
    </span>
  );
}
