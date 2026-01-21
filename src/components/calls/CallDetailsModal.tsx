'use client';

import { useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Clock,
  Calendar,
  User,
  MessageSquare,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import type { Call } from '@/types/call';
import { CallStatusBadge, HandledBadge } from './CallStatusBadge';
import {
  formatPhoneNumber,
  formatDuration,
  formatRelativeTime,
} from '@/lib/utils/callFormatters';

interface CallDetailsModalProps {
  call: Call;
  onClose: () => void;
  onToggleHandled: (callId: string) => void;
}

export function CallDetailsModal({
  call,
  onClose,
  onToggleHandled,
}: CallDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Call Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatRelativeTime(call.startTime)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Caller Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Caller Information
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Phone Number
                  </p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">
                    {formatPhoneNumber(call.phoneNumber)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Caller Name
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {call.callerName || 'Unknown Caller'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Metadata */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Call Metadata
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  <CallStatusBadge status={call.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Handled
                  </p>
                  <HandledBadge isHandled={call.isHandled} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Duration
                  </p>
                  <p className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatDuration(call.durationSeconds)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Date/Time
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatFullDateTime(call.startTime)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Intent
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {call.intent}
                  </span>
                  {call.isUrgent && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              AI Summary
            </h3>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {call.aiSummary}
              </p>
            </div>
          </div>

          {/* Transcript */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Full Transcript
            </h3>
            {call.transcript.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4 max-h-80 overflow-y-auto">
                {call.transcript.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      entry.speaker === 'AI' ? '' : 'flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.speaker === 'AI'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {entry.speaker === 'AI' ? 'AI' : 'C'}
                    </div>
                    <div
                      className={`flex-1 max-w-[85%] ${
                        entry.speaker === 'AI' ? '' : 'text-right'
                      }`}
                    >
                      <p
                        className={`text-xs font-medium mb-1 ${
                          entry.speaker === 'AI'
                            ? 'text-primary'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {entry.speaker === 'AI' ? 'DTIQ Assistant' : 'Caller'}
                      </p>
                      <div
                        className={`inline-block px-3 py-2 rounded-lg text-sm ${
                          entry.speaker === 'AI'
                            ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                            : 'bg-primary/10 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {entry.text}
                      </div>
                    </div>
                  </div>
                ))}
                {call.status === 'in_progress' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span
                        className="w-2 h-2 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <span
                        className="w-2 h-2 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                    Call in progress...
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-8 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No transcript available for this call
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          <button
            onClick={() => onToggleHandled(call.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              call.isHandled
                ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
            }`}
          >
            {call.isHandled ? 'Mark as Unhandled' : 'Mark as Handled'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
