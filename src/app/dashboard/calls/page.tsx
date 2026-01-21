'use client';

import { useState, useMemo } from 'react';
import {
  Phone,
  PhoneIncoming,
  AlertCircle,
  Clock,
  Search,
} from 'lucide-react';
import { KPICard, EmptyState } from '@/components';
import { CallCard } from '@/components/calls/CallCard';
import { CallDetailsModal } from '@/components/calls/CallDetailsModal';
import { mockCalls, getCallStats, type Call } from '@/data/mockCalls';
import { formatDuration } from '@/lib/utils/callFormatters';
import { getClientBranding } from '@/config/branding';

type FilterTab = 'all' | 'needs_attention' | 'handled' | 'in_progress';

interface FilterTabConfig {
  id: FilterTab;
  label: string;
}

const filterTabs: FilterTabConfig[] = [
  { id: 'all', label: 'All Calls' },
  { id: 'needs_attention', label: 'Needs Attention' },
  { id: 'handled', label: 'Handled' },
  { id: 'in_progress', label: 'In Progress' },
];

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>(mockCalls);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const branding = getClientBranding();

  // Calculate stats
  const stats = useMemo(() => getCallStats(calls), [calls]);

  // Filter calls based on active filter and search
  const filteredCalls = useMemo(() => {
    let filtered = [...calls];

    // Apply filter tab
    switch (activeFilter) {
      case 'needs_attention':
        filtered = filtered.filter(
          (call) => !call.isHandled && call.status !== 'in_progress'
        );
        break;
      case 'handled':
        filtered = filtered.filter((call) => call.isHandled);
        break;
      case 'in_progress':
        filtered = filtered.filter((call) => call.status === 'in_progress');
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (call) =>
          call.phoneNumber.includes(query) ||
          (call.callerName && call.callerName.toLowerCase().includes(query)) ||
          call.aiSummary.toLowerCase().includes(query) ||
          call.intent.toLowerCase().includes(query)
      );
    }

    // Sort by start time (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    return filtered;
  }, [calls, activeFilter, searchQuery]);

  // Get filter counts
  const getFilterCount = (filter: FilterTab): number => {
    switch (filter) {
      case 'all':
        return calls.length;
      case 'needs_attention':
        return calls.filter(
          (call) => !call.isHandled && call.status !== 'in_progress'
        ).length;
      case 'handled':
        return calls.filter((call) => call.isHandled).length;
      case 'in_progress':
        return calls.filter((call) => call.status === 'in_progress').length;
      default:
        return 0;
    }
  };

  // Toggle handled status
  const handleToggleHandled = (callId: string) => {
    setCalls((prevCalls) =>
      prevCalls.map((call) =>
        call.id === callId ? { ...call, isHandled: !call.isHandled } : call
      )
    );

    // Also update selected call if it's the one being toggled
    if (selectedCall && selectedCall.id === callId) {
      setSelectedCall((prev) =>
        prev ? { ...prev, isHandled: !prev.isHandled } : null
      );
    }
  };

  // View call details
  const handleViewDetails = (call: Call) => {
    setSelectedCall(call);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedCall(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Call Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-powered phone receptionist - 24/7 call handling
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total Calls"
          value="147"
          change="+12%"
          icon={Phone}
        />
        <KPICard
          label="Calls Today"
          value="12"
          change="+3"
          icon={PhoneIncoming}
        />
        <KPICard
          label="Needs Attention"
          value={String(stats.needsAttention)}
          change={stats.needsAttention > 0 ? 'Action required' : 'All clear'}
          icon={AlertCircle}
        />
        <KPICard
          label="Avg Duration"
          value="3m 35s"
          change="-15s"
          icon={Clock}
        />
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        {/* Filter Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex gap-1 px-6" aria-label="Call filters">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              const count = getFilterCount(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${
                      isActive
                        ? 'border-current'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  style={
                    isActive
                      ? {
                          color: branding.primaryColor,
                          borderBottomColor: branding.primaryColor,
                        }
                      : undefined
                  }
                >
                  {tab.label}
                  <span
                    className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${
                        isActive
                          ? 'text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }
                    `}
                    style={
                      isActive
                        ? { backgroundColor: branding.primaryColor }
                        : undefined
                    }
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by phone, name, or keyword..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Call Feed */}
      {filteredCalls.length > 0 ? (
        <div className="space-y-4">
          {filteredCalls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              onViewDetails={handleViewDetails}
              onToggleHandled={handleToggleHandled}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Phone}
          title={searchQuery ? 'No Calls Found' : 'No Calls Yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Calls will appear here once they are received by the AI receptionist.'
          }
        />
      )}

      {/* Call Details Modal */}
      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          onClose={handleCloseModal}
          onToggleHandled={handleToggleHandled}
        />
      )}
    </div>
  );
}
