'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  GraduationCap,
  Award,
  AlertCircle,
  Phone,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getClientBranding } from '@/config/branding';
import { authenticatedFetch } from '@/lib/api/client';
import { useTheme } from '@/components/ThemeProvider';
import type { InsightsSummary, ApiResponse } from '@/types/api';

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const branding = getClientBranding();
  const { theme } = useTheme();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/insights/summary');
      const data: ApiResponse<InsightsSummary> = await response.json();

      if (data.success && data.data) {
        setInsights(data.data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover AI-powered insights, recommendations, and automated response suggestions.
          </p>
        </div>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Failed to load insights. Please try again.
        </div>
      </div>
    );
  }

  // Calculate sentiment breakdown
  const sentimentData = [
    {
      name: 'Positive',
      value: insights.positiveSentiment,
      color: '#10b981', // green
      icon: Smile,
    },
    {
      name: 'Neutral',
      value: 15, // Mock data
      color: '#6b7280', // gray
      icon: Meh,
    },
    {
      name: 'Negative',
      value: 100 - insights.positiveSentiment - 15,
      color: '#ef4444', // red
      icon: Frown,
    },
  ];

  // Revenue opportunity breakdown
  const revenueOpportunities = [
    { type: 'Upgrade Plans', count: 12, value: '$24,000' },
    { type: 'Add-ons', count: 8, value: '$8,400' },
    { type: 'Premium Support', count: 3, value: '$5,600' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Insights</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover AI-powered insights, recommendations, and automated response suggestions.
        </p>
      </div>

      {/* Main Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Opportunities Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${branding.primaryColor}15` }}
            >
              <DollarSign
                className="w-6 h-6"
                style={{ color: branding.primaryColor }}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Revenue Opportunities
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential upsells detected</p>
            </div>
          </div>

          {/* Total Count */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {insights.upsellCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active opportunities</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Breakdown by Type
            </p>
            {revenueOpportunities.map((opp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{opp.type}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{opp.count} opportunities</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-bold"
                    style={{ color: branding.primaryColor }}
                  >
                    {opp.value}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">est. value</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: branding.primaryColor }}
            onClick={() => alert('View detailed revenue opportunities')}
          >
            <TrendingUp className="w-4 h-4" />
            View All Opportunities
          </button>
        </div>

        {/* Sentiment Analysis Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${branding.primaryColor}15` }}
            >
              <Sparkles
                className="w-6 h-6"
                style={{ color: branding.primaryColor }}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Sentiment Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customer mood tracking</p>
            </div>
          </div>

          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                  border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#fff' : '#000',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-3 mt-4">
            {sentimentData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.value}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Trend Indicator */}
          <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
              ↑ 5% improvement in positive sentiment this week
            </p>
          </div>
        </div>

        {/* Training Insights Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Training Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agent performance metrics</p>
            </div>
          </div>

          {/* Quality Score */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">8.4</p>
              <p className="text-lg text-gray-600 dark:text-gray-400">/10</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average quality score</p>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: '84%',
                  backgroundColor: branding.primaryColor,
                }}
              ></div>
            </div>
          </div>

          {/* Training Needed */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Training Needed
                </span>
              </div>
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                {insights.trainingNeeded}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Top Performers
                </span>
              </div>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">12</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Recurring Issues
                </span>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {insights.recurringIssues}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            onClick={() => alert('View training recommendations')}
          >
            <GraduationCap className="w-4 h-4" />
            View Training Plan
          </button>
        </div>
      </div>

      {/* Call Intelligence Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${branding.primaryColor}15` }}
          >
            <Phone
              className="w-6 h-6"
              style={{ color: branding.primaryColor }}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Call Intelligence
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered call analysis and insights
            </p>
          </div>
        </div>

        {/* Placeholder Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MessageSquare
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: branding.primaryColor }}
            />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">234</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Calls Analyzed</p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Clock
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: branding.primaryColor }}
            />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">4:32</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Call Duration</p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Award
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: branding.primaryColor }}
            />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Resolution Rate</p>
          </div>

          <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <TrendingUp
              className="w-8 h-8 mx-auto mb-3"
              style={{ color: branding.primaryColor }}
            />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">+18%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quality Improvement</p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Enhanced Call Intelligence Coming Soon
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Advanced call transcription, keyword extraction, and sentiment tracking
                features will be available in the next release.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
