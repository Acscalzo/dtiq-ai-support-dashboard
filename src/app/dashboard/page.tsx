'use client';

import { useEffect, useState, Suspense } from 'react';
import {
  TicketCheck,
  Clock,
  TrendingUp,
  Bot,
  ShoppingCart,
  GraduationCap,
  AlertCircle,
  Smile,
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { KPICard, StatusBadge, PriorityBadge } from '@/components';
import { getClientBranding } from '@/config/branding';
import { authenticatedFetch } from '@/lib/api/client';
import { useTheme } from '@/components/ThemeProvider';
import type {
  DashboardMetrics,
  AnalyticsTrends,
  InsightsSummary,
  Ticket,
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
    </div>
  );
}

function OverviewContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const branding = getClientBranding();
  const { theme } = useTheme();

  const fetchData = async () => {
    setIsRefreshing(true);
    setIsLoading(true);

    try {
      // Fetch all data in parallel with authentication
      const [metricsRes, trendsRes, insightsRes, ticketsRes] = await Promise.all([
        authenticatedFetch(`/api/metrics?timeRange=${timeRange}`),
        authenticatedFetch(`/api/analytics/trends?timeRange=${timeRange}`),
        authenticatedFetch(`/api/insights/summary`),
        authenticatedFetch('/api/tickets'),
      ]);

      const [metricsData, trendsData, insightsData, ticketsData]: [
        ApiResponse<DashboardMetrics>,
        ApiResponse<AnalyticsTrends>,
        ApiResponse<InsightsSummary>,
        ApiResponse<Ticket[]>
      ] = await Promise.all([
        metricsRes.json(),
        trendsRes.json(),
        insightsRes.json(),
        ticketsRes.json(),
      ]);

      if (metricsData.success && metricsData.data) {
        setMetrics(metricsData.data);
      }

      if (trendsData.success && trendsData.data) {
        setTrends(trendsData.data);
      }

      if (insightsData.success && insightsData.data) {
        setInsights(insightsData.data);
      }

      if (ticketsData.success && ticketsData.data) {
        // Sort by most recent and take first 10
        const sortedTickets = ticketsData.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
        setRecentTickets(sortedTickets);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive view of your support dashboard metrics and activity.
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

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: isRefreshing ? branding.primaryColor : undefined,
              }}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                style={{ color: isRefreshing ? branding.primaryColor : undefined }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics && (
          <>
            <KPICard
              label="Open Tickets"
              value={metrics.openTickets.toString()}
              change="+12%"
              icon={TicketCheck}
              color={branding.primaryColor}
            />
            <KPICard
              label="Avg Response Time"
              value={metrics.avgResponseTime}
              change="-8%"
              icon={Clock}
              color={branding.primaryColor}
            />
            <KPICard
              label="Resolution Rate"
              value={metrics.resolutionRate}
              change="+3%"
              icon={TrendingUp}
              color={branding.primaryColor}
            />
            <KPICard
              label="AI Automation"
              value={metrics.aiAutomation}
              change="+15%"
              icon={Bot}
              color={branding.primaryColor}
            />
          </>
        )}
      </div>

      {/* Ticket Trends Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Ticket Trends</h2>
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
                stroke={branding.primaryColor}
                strokeWidth={2}
                name="Created"
                dot={{ fill: branding.primaryColor, r: 4 }}
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

      {/* AI Insights Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${branding.primaryColor}15` }}
                  >
                    <ShoppingCart
                      className="w-6 h-6"
                      style={{ color: branding.primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {insights.upsellCount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Upsell Opportunities</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${branding.primaryColor}15` }}
                  >
                    <GraduationCap
                      className="w-6 h-6"
                      style={{ color: branding.primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {insights.trainingNeeded}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Training Needed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${branding.primaryColor}15` }}
                  >
                    <AlertCircle
                      className="w-6 h-6"
                      style={{ color: branding.primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {insights.recurringIssues}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recurring Issues</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${branding.primaryColor}15` }}
                  >
                    <Smile
                      className="w-6 h-6"
                      style={{ color: branding.primaryColor }}
                    />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {insights.positiveSentiment}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Positive Sentiment</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Tickets</h2>
        {recentTickets.length > 0 ? (
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      {ticket.id}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {ticket.customerName} • {ticket.category}
                  </p>
                  {ticket.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(ticket.createdAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            No recent tickets
          </div>
        )}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OverviewContent />
    </Suspense>
  );
}
