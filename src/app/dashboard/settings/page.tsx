'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Monitor,
  Link,
  Building2,
  Shield,
  Info,
  Key,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { SettingsSection, SettingsRow, Toggle } from '@/components/settings/SettingsSection';
import { EditNameModal } from '@/components/settings/EditNameModal';
import { PhotoUpload } from '@/components/settings/PhotoUpload';
import { getClientBranding } from '@/config/branding-client';
import { DateFormat } from '@/types/settings';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

// Common timezones
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

const DATE_FORMATS: { value: DateFormat; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '01/21/2026' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '21/01/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-01-21' },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { preferences, loading: prefsLoading, updateNotifications, updateDisplay } = useUserPreferences();

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingDisplay, setSavingDisplay] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  const [displaySaved, setDisplaySaved] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const branding = getClientBranding();
  const isAdmin = user?.role === 'admin';

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      setPasswordResetLoading(true);
      setPasswordResetError(null);
      await sendPasswordResetEmail(auth, user.email);
      setPasswordResetSent(true);
    } catch (err) {
      console.error('Error sending password reset:', err);
      setPasswordResetError('Failed to send password reset email. Please try again.');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = async (key: keyof typeof preferences.notifications, value: boolean) => {
    try {
      await updateNotifications({ [key]: value });
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };

  // Handle save notifications
  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      // Preferences are already saved on toggle, this just shows feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotificationsSaved(true);
      setTimeout(() => setNotificationsSaved(false), 3000);
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleTimezoneChange = async (timezone: string) => {
    try {
      await updateDisplay({ timezone });
    } catch (err) {
      console.error('Error saving timezone:', err);
    }
  };

  const handleDateFormatChange = async (dateFormat: DateFormat) => {
    try {
      await updateDisplay({ dateFormat });
    } catch (err) {
      console.error('Error saving date format:', err);
    }
  };

  // Handle save display preferences
  const handleSaveDisplay = async () => {
    setSavingDisplay(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDisplaySaved(true);
      setTimeout(() => setDisplaySaved(false), 3000);
    } finally {
      setSavingDisplay(false);
    }
  };

  // Handle test connection
  const handleTestConnection = async (service: string) => {
    setTestingConnection(service);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setTestingConnection(null);
    }
  };

  // Handle data export
  const handleExportData = () => {
    // Create a JSON blob of user data
    const userData = {
      profile: {
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        role: user?.role,
        createdAt: user?.createdAt,
      },
      preferences: preferences,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Profile Section */}
      <SettingsSection
        title="User Profile"
        description="Manage your personal information"
        icon={User}
      >
        {/* Photo Upload */}
        <div className="pb-4 border-b border-gray-100 dark:border-gray-700">
          <PhotoUpload
            currentPhotoURL={user.photoURL}
            displayName={user.displayName}
            onSuccess={refreshUser}
          />
        </div>

        {/* Name */}
        <SettingsRow
          label="Display Name"
          description="Your name as it appears across the dashboard"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-900 dark:text-white font-medium">
              {user.displayName || 'Not set'}
            </span>
            <button
              onClick={() => setEditNameOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              Edit
            </button>
          </div>
        </SettingsRow>

        {/* Email */}
        <SettingsRow
          label="Email Address"
          description="Your email used for sign in and notifications"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </span>
        </SettingsRow>

        {/* Password */}
        <SettingsRow
          label="Password"
          description="Change your account password"
        >
          {passwordResetSent ? (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Reset email sent!
            </div>
          ) : (
            <button
              onClick={handlePasswordReset}
              disabled={passwordResetLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
            >
              {passwordResetLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              Send Reset Email
            </button>
          )}
        </SettingsRow>
        {passwordResetError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{passwordResetError}</p>
        )}

        {/* Role */}
        <SettingsRow
          label="Role"
          description="Your permission level in the dashboard"
        >
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
              : user.role === 'manager'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          }`}>
            <Shield className="w-3 h-3" />
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </SettingsRow>
      </SettingsSection>

      {/* Notification Preferences */}
      <SettingsSection
        title="Notification Preferences"
        description="Control how and when you receive notifications"
        icon={Bell}
      >
        <SettingsRow
          label="Email notifications for new tickets"
          description="Receive an email when new support tickets are created"
        >
          <Toggle
            enabled={preferences.notifications.emailNewTickets}
            onChange={(value) => handleNotificationToggle('emailNewTickets', value)}
            disabled={prefsLoading}
          />
        </SettingsRow>

        <SettingsRow
          label="Email notifications for assigned tickets"
          description="Receive an email when a ticket is assigned to you"
        >
          <Toggle
            enabled={preferences.notifications.emailAssignedTickets}
            onChange={(value) => handleNotificationToggle('emailAssignedTickets', value)}
            disabled={prefsLoading}
          />
        </SettingsRow>

        <SettingsRow
          label="Email notifications for AI insights"
          description="Receive weekly AI-powered insights and recommendations"
        >
          <Toggle
            enabled={preferences.notifications.emailAiInsights}
            onChange={(value) => handleNotificationToggle('emailAiInsights', value)}
            disabled={prefsLoading}
          />
        </SettingsRow>

        <SettingsRow
          label="Browser push notifications"
          description="Receive real-time notifications in your browser"
        >
          <Toggle
            enabled={preferences.notifications.browserPushNotifications}
            onChange={(value) => handleNotificationToggle('browserPushNotifications', value)}
            disabled={prefsLoading}
          />
        </SettingsRow>

        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleSaveNotifications}
            disabled={savingNotifications || prefsLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingNotifications ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : notificationsSaved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : null}
            {notificationsSaved ? 'Saved!' : savingNotifications ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </SettingsSection>

      {/* Display Preferences */}
      <SettingsSection
        title="Display Preferences"
        description="Customize your dashboard appearance"
        icon={Monitor}
      >
        <SettingsRow
          label="Dark Mode"
          description="Switch between light and dark theme"
        >
          <Toggle
            enabled={theme === 'dark'}
            onChange={toggleTheme}
          />
        </SettingsRow>

        <SettingsRow
          label="Timezone"
          description="Your local timezone for dates and times"
        >
          <select
            value={preferences.display.timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            disabled={prefsLoading}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </SettingsRow>

        <SettingsRow
          label="Date Format"
          description="How dates are displayed throughout the app"
        >
          <select
            value={preferences.display.dateFormat}
            onChange={(e) => handleDateFormatChange(e.target.value as DateFormat)}
            disabled={prefsLoading}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {DATE_FORMATS.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label} ({format.example})
              </option>
            ))}
          </select>
        </SettingsRow>

        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleSaveDisplay}
            disabled={savingDisplay || prefsLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {savingDisplay ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : displaySaved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : null}
            {displaySaved ? 'Saved!' : savingDisplay ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </SettingsSection>

      {/* Integration Settings (Admin only) */}
      {isAdmin && (
        <SettingsSection
          title="Integration Settings"
          description="Manage external service connections"
          icon={Link}
        >
          {/* Zendesk */}
          <SettingsRow
            label="Zendesk"
            description="Customer support ticketing integration"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <button
                onClick={() => handleTestConnection('zendesk')}
                disabled={testingConnection === 'zendesk'}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {testingConnection === 'zendesk' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Test
              </button>
            </div>
          </SettingsRow>

          {/* Claude API */}
          <SettingsRow
            label="Claude API"
            description="AI-powered support assistance"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Configured
                </span>
              </div>
              <button
                onClick={() => handleTestConnection('claude')}
                disabled={testingConnection === 'claude'}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {testingConnection === 'claude' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Test
              </button>
            </div>
          </SettingsRow>

          <div className="pt-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            Integration connections are configured via environment variables. Contact your system administrator to modify these settings.
          </div>
        </SettingsSection>
      )}

      {/* Company Branding (Admin only) */}
      {isAdmin && (
        <SettingsSection
          title="Company Branding"
          description="Current branding configuration"
          icon={Building2}
        >
          <SettingsRow label="Company Name">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {branding.companyName}
            </span>
          </SettingsRow>

          <SettingsRow label="Company Slug">
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
              {branding.companySlug}
            </span>
          </SettingsRow>

          <SettingsRow label="Primary Color">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {branding.primaryColor}
              </span>
            </div>
          </SettingsRow>

          {branding.logoUrl && (
            <SettingsRow label="Logo URL">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                {branding.logoUrl}
              </span>
            </SettingsRow>
          )}

          <div className="pt-4 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              To change branding settings, update the environment variables in your <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">.env</code> file and redeploy the application.
            </p>
          </div>
        </SettingsSection>
      )}

      {/* Data & Privacy */}
      <SettingsSection
        title="Data & Privacy"
        description="Manage your data and account"
        icon={Shield}
      >
        <SettingsRow
          label="Export My Data"
          description="Download a copy of your personal data"
        >
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </SettingsRow>

        <SettingsRow
          label="Delete Account"
          description="Permanently delete your account and all data"
        >
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </SettingsRow>
      </SettingsSection>

      {/* Delete Account Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Account
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In a real app, this would call an API to delete the account
                  alert('Account deletion would be processed here. Contact support for assistance.');
                  setDeleteConfirmOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      <SettingsSection
        title="About"
        description="Application information"
        icon={Info}
      >
        <SettingsRow label="Template Version">
          <span className="text-sm text-gray-600 dark:text-gray-400">1.0.0</span>
        </SettingsRow>

        <SettingsRow label="Last Updated">
          <span className="text-sm text-gray-600 dark:text-gray-400">January 2026</span>
        </SettingsRow>

        <SettingsRow label="Support Contact">
          <a
            href="mailto:support@example.com"
            className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
          >
            support@example.com
            <ExternalLink className="w-3 h-3" />
          </a>
        </SettingsRow>

        <SettingsRow label="Documentation">
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
          >
            View Documentation
            <ExternalLink className="w-3 h-3" />
          </a>
        </SettingsRow>
      </SettingsSection>

      {/* Edit Name Modal */}
      <EditNameModal
        isOpen={editNameOpen}
        onClose={() => setEditNameOpen(false)}
        currentName={user.displayName || ''}
        onSuccess={refreshUser}
      />
    </div>
  );
}
