'use client';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
}

export function NotificationBadge({ count, maxCount = 99 }: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-in fade-in zoom-in duration-200">
      {displayCount}
    </span>
  );
}
