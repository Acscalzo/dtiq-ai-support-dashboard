'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Search,
  Filter,
  Download,
  Bot,
  AlertCircle,
  X,
} from 'lucide-react';
import { EmptyState, StatusBadge, PriorityBadge } from '@/components';
import { getClientBranding } from '@/config/branding-client';
import { authenticatedFetch } from '@/lib/api/client';
import type { Ticket, ApiResponse } from '@/types/api';

type FilterTab = 'all' | 'open' | 'in_progress' | 'resolved' | 'ai_automated';

interface FilterTabConfig {
  id: FilterTab;
  label: string;
  count?: number;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const branding = getClientBranding();

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Apply filters and search when they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [tickets, activeFilter, searchQuery, selectedPriorities, selectedCategories]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/tickets');
      const data: ApiResponse<Ticket[]> = await response.json();

      if (data.success && data.data) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...tickets];

    // Apply status filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'ai_automated') {
        // Filter tickets that have AI suggestions
        filtered = filtered.filter((ticket) => ticket.aiSuggestion);
      } else {
        filtered = filtered.filter((ticket) => ticket.status === activeFilter);
      }
    }

    // Apply priority filter
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter((ticket) =>
        selectedPriorities.includes(ticket.priority)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((ticket) =>
        selectedCategories.includes(ticket.category)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.id.toLowerCase().includes(query) ||
          ticket.title.toLowerCase().includes(query) ||
          ticket.customerName.toLowerCase().includes(query) ||
          ticket.category.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(filtered);
  };

  const getFilterCount = (filter: FilterTab): number => {
    if (filter === 'all') return tickets.length;
    if (filter === 'ai_automated') {
      return tickets.filter((t) => t.aiSuggestion).length;
    }
    return tickets.filter((t) => t.status === filter).length;
  };

  const getUniqueCategories = (): string[] => {
    return Array.from(new Set(tickets.map(t => t.category))).sort();
  };

  const priorities = ['low', 'medium', 'high', 'urgent'];

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedPriorities([]);
    setSelectedCategories([]);
  };

  const hasActiveFilters = selectedPriorities.length > 0 || selectedCategories.length > 0;

  const filterTabs: FilterTabConfig[] = [
    { id: 'all', label: 'All Tickets' },
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'ai_automated', label: 'AI Automated' },
  ];

  const handleTicketClick = (ticket: Ticket) => {
    alert(`Ticket Details:\n\nID: ${ticket.id}\nTitle: ${ticket.title}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}\n\n(Full ticket detail view coming soon)`);
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tickets</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View, manage, and respond to customer support tickets in one place.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex gap-1 px-6" aria-label="Ticket filters">
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

        {/* Search and Actions */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ticket ID, title, customer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
              />
            </div>

            {/* Filter Button */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  hasActiveFilters
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                    {selectedPriorities.length + selectedCategories.length}
                  </span>
                )}
              </button>

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Priority Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Priority</h4>
                      <div className="space-y-2">
                        {priorities.map((priority) => (
                          <label key={priority} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPriorities.includes(priority)}
                              onChange={() => togglePriority(priority)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Category</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {getUniqueCategories().map((category) => (
                          <label key={category} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={() => alert('Export functionality coming soon')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleTicketClick(ticket)}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                        {ticket.id}
                      </span>
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {ticket.title}
                    </h3>

                    {/* Customer and Category */}
                    <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        <span className="font-medium">Customer:</span> {ticket.customerName}
                      </span>
                      <span>
                        <span className="font-medium">Category:</span> {ticket.category}
                      </span>
                      {ticket.assignedTo && (
                        <span>
                          <span className="font-medium">Assigned:</span> {ticket.assignedTo}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {ticket.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ticket.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Suggestion */}
                    {ticket.aiSuggestion && (
                      <div
                        className="flex items-start gap-2 p-3 rounded-lg mt-3"
                        style={{ backgroundColor: `${branding.primaryColor}10` }}
                      >
                        <Bot
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          style={{ color: branding.primaryColor }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            AI Suggestion
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ticket.aiSuggestion}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Sentiment Indicator */}
                  {ticket.sentiment && (
                    <div className="flex-shrink-0">
                      <div
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                          ${
                            ticket.sentiment === 'positive'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : ticket.sentiment === 'negative'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        {ticket.sentiment === 'negative' && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {ticket.sentiment.charAt(0).toUpperCase() + ticket.sentiment.slice(1)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title={searchQuery ? 'No Tickets Found' : 'No Tickets Yet'}
          description={
            searchQuery
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Tickets will appear here once they are created or imported into the system.'
          }
        />
      )}
    </div>
  );
}
