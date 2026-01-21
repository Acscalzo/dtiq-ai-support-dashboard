import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color?: string; // Optional for backward compatibility
}

export function KPICard({ label, value, change, icon: Icon }: KPICardProps) {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`text-sm font-medium px-2 py-1 rounded ${
          isPositive ? 'text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400' :
          isNegative ? 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400' :
          'text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {change}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
