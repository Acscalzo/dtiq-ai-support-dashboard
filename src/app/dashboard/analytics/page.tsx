'use client';

import { useEffect, useState, Suspense } from 'react';
import {
  RefreshCw,
  Calendar,
  Download,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { authenticatedFetch } from '@/lib/api/client';
import { useTheme } from '@/components/ThemeProvider';
import type {
  AnalyticsTrends,
  ApiResponse
} from '@/types/api';

type TimeRange = '24h' | '7d' | '30d' | '90d';

interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

const timeRangeOptions: TimeRangeOption[] = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

// Mock resolution efficiency data - in production this would come from the API
interface ResolutionEfficiencyData {
  category: string;
  resolved: number;
  pending: number;
  total: number;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
    </div>
  );
}

function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { theme } = useTheme();

  // Mock resolution efficiency data
  const [resolutionData] = useState<ResolutionEfficiencyData[]>([
    { category: 'Technical', resolved: 45, pending: 12, total: 57 },
    { category: 'Billing', resolved: 38, pending: 8, total: 46 },
    { category: 'Account', resolved: 52, pending: 5, total: 57 },
    { category: 'Product', resolved: 30, pending: 15, total: 45 },
    { category: 'Other', resolved: 25, pending: 10, total: 35 },
  ]);

  const fetchData = async () => {
    setIsRefreshing(true);
    setIsLoading(true);

    try {
      const trendsRes = await authenticatedFetch(`/api/analytics/trends?timeRange=${timeRange}`);
      const trendsData: ApiResponse<AnalyticsTrends> = await trendsRes.json();

      if (trendsData.success && trendsData.data) {
        setTrends(trendsData.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExportReport = async () => {
    setIsExporting(true);

    try {
      // Create CSV content
      let csvContent = 'Analytics Report\n\n';
      csvContent += `Time Range: ${timeRangeOptions.find(opt => opt.value === timeRange)?.label}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Response Time Trends
      csvContent += 'Response Time Trends\n';
      csvContent += 'Date,Created,Resolved,AI Resolved\n';
      if (trends?.data) {
        trends.data.forEach(point => {
          csvContent += `${point.date},${point.created},${point.resolved},${point.aiResolved}\n`;
        });
      }

      csvContent += '\nResolution Efficiency by Category\n';
      csvContent += 'Category,Resolved,Pending,Total,Efficiency %\n';
      resolutionData.forEach(item => {
        const efficiency = ((item.resolved / item.total) * 100).toFixed(1);
        csvContent += `${item.category},${item.resolved},${item.pending},${item.total},${efficiency}%\n`;
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track performance metrics, trends, and gain insights into your support operations.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-0 cursor-pointer pr-2"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-white bg-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isExporting ? 'Exporting...' : 'Export Report'}
              </span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRefreshing ? 'border-primary' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid - Side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Response Time Trends Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Response Time Trends</h2>
          </div>

          {trends && trends.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f0f0f0'} />
                <XAxis
                  dataKey="date"
                  stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: theme === 'dark' ? '#fff' : '#000',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '14px' }}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  name="Created"
                  dot={{ fill: 'var(--primary)', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Resolved"
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="aiResolved"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="AI Resolved"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Resolution Efficiency Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resolution Efficiency</h2>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f0f0f0'} />
              <XAxis
                dataKey="category"
                stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: theme === 'dark' ? '#fff' : '#000',
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  const displayName = name === 'resolved' ? 'Resolved' : 'Pending';
                  return [value ?? 0, displayName];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                formatter={(value: string) => {
                  return value === 'resolved' ? 'Resolved' : 'Pending';
                }}
              />
              <Bar
                dataKey="resolved"
                fill="var(--primary)"
                name="resolved"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                fill="#f59e0b"
                name="pending"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Efficiency Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {resolutionData.map((item) => {
            const efficiency = ((item.resolved / item.total) * 100).toFixed(1);
            return (
              <div key={item.category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{item.category}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{efficiency}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.resolved}/{item.total} resolved
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnalyticsContent />
    </Suspense>
  );
}
