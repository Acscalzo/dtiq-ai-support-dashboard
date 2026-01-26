'use client';

import { Search, Bell, X } from 'lucide-react';
import { getClientBranding } from '@/config/branding-client';
import { useState, useEffect, useRef } from 'react';
import { SearchResults } from '@/components';
import { SearchResponse, ApiResponse } from '@/types/api';
import { UserMenu } from '@/components/auth/UserMenu';
import { authenticatedFetch } from '@/lib/api/client';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse>({
    tickets: [],
    documentation: [],
    totalResults: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const branding = getClientBranding();

  // Notifications hook
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ limitCount: 20 });

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults({
          tickets: [],
          documentation: [],
          totalResults: 0,
        });
        setShowResults(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    setShowResults(true);

    try {
      const response = await authenticatedFetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: ApiResponse<SearchResponse> = await response.json();

      if (data.success && data.data) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({
      tickets: [],
      documentation: [],
      totalResults: 0,
    });
    setShowResults(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo/Company Name - Multi-tenant branding */}
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-8 w-auto ml-4"
              />
            ) : (
              <div
                className="h-8 px-3 flex items-center justify-center rounded font-bold text-white"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {branding.logoText}
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {branding.companyName}
              </h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {branding.tagline}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setShowResults(true);
                  }
                }}
                placeholder="Search tickets, documentation..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{ '--tw-ring-color': branding.primaryColor } as React.CSSProperties}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && (
                <SearchResults
                  results={searchResults}
                  isLoading={isLoading}
                  query={searchQuery}
                  onClose={() => setShowResults(false)}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={handleNotificationClick}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <NotificationBadge count={unreadCount} />
              </button>

              {/* Notification Panel Dropdown */}
              {showNotifications && (
                <NotificationPanel
                  notifications={notifications}
                  loading={notificationsLoading}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
