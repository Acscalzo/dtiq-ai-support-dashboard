/**
 * Date formatting utilities
 */

/**
 * Formats a date to relative time (e.g., "2 hours ago", "Just now")
 */
export function formatDistanceToNow(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Less than a minute
  if (diffSeconds < 60) {
    return 'Just now';
  }

  // Less than an hour
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Less than 30 days
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  }

  // Older - show date
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  return targetDate.toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Formats a date to include time
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  return targetDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
