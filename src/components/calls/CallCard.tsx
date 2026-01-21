'use client';

import { Phone, Clock, AlertTriangle, Eye } from 'lucide-react';
import type { Call } from '@/data/mockCalls';
import { CallStatusBadge, HandledBadge } from './CallStatusBadge';
import {
  formatPhoneNumber,
  formatDuration,
  formatRelativeTime,
} from '@/lib/utils/callFormatters';

interface CallCardProps {
  call: Call;
  onViewDetails: (call: Call) => void;
  onToggleHandled: (callId: string) => void;
}

export function CallCard({ call, onViewDetails, onToggleHandled }: CallCardProps) {
  const truncatedSummary =
    call.aiSummary.length > 150
      ? `${call.aiSummary.substring(0, 150)}...`
      : call.aiSummary;

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-lg p-5 hover:shadow-md transition-shadow ${
        call.isUrgent
          ? 'border-red-300 dark:border-red-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="font-mono font-semibold text-gray-900 dark:text-white">
              {formatPhoneNumber(call.phoneNumber)}
            </span>
          </div>
          {call.isUrgent && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              Urgent
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CallStatusBadge status={call.status} />
          <HandledBadge isHandled={call.isHandled} />
        </div>
      </div>

      {/* Caller Name & Time */}
      <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-white">
          {call.callerName || 'Unknown Caller'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatRelativeTime(call.startTime)}
        </span>
        {call.durationSeconds > 0 && (
          <span>Duration: {formatDuration(call.durationSeconds)}</span>
        )}
      </div>

      {/* AI Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {truncatedSummary}
        </p>
      </div>

      {/* Intent Tag */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {call.intent}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onToggleHandled(call.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            call.isHandled
              ? 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
          }`}
        >
          {call.isHandled ? 'Mark as Unhandled' : 'Mark as Handled'}
        </button>
        <button
          onClick={() => onViewDetails(call)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
}
