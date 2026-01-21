'use client';

import { FileText, Ticket } from 'lucide-react';
import { SearchResult } from '@/types/api';
import { StatusBadge, PriorityBadge } from '@/components';

interface SearchResultsProps {
  results: {
    tickets: SearchResult[];
    documentation: SearchResult[];
    totalResults: number;
  };
  isLoading: boolean;
  query: string;
  onClose: () => void;
}

export function SearchResults({ results, isLoading, query, onClose }: SearchResultsProps) {
  const { tickets, documentation, totalResults } = results;

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Searching...</span>
        </div>
      </div>
    );
  }

  if (!query || query.trim().length === 0) {
    return null;
  }

  if (totalResults === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No results found for "{query}"</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Try a different search term</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* Tickets Section */}
      {tickets.length > 0 && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Ticket className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Tickets ({tickets.length})
            </span>
          </div>
          <div className="space-y-1">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => {
                  // In a real app, navigate to ticket detail page
                  console.log('Navigate to ticket:', ticket.id);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{ticket.id}</span>
                      {ticket.status && <StatusBadge status={ticket.status as any} />}
                      {ticket.priority && <PriorityBadge priority={ticket.priority as any} />}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {ticket.title}
                    </p>
                    {ticket.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                        {ticket.description}
                      </p>
                    )}
                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {ticket.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Documentation Section */}
      {documentation.length > 0 && (
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2 px-2">
            <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Documentation ({documentation.length})
            </span>
          </div>
          <div className="space-y-1">
            {documentation.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  // In a real app, navigate to documentation page
                  console.log('Navigate to doc:', doc.id);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{doc.id}</span>
                      {doc.category && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                          {doc.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {doc.title}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {doc.description}
                      </p>
                    )}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {doc.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
        </p>
      </div>
    </div>
  );
}
