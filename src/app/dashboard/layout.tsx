'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getClientBranding } from '@/config/branding';
import { Header, TabNavigation } from '@/components';
import { Menu, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function adjustColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    const adjusted = Math.round(value + (255 - value) * (percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };

  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    const adjusted = Math.round(value * (1 - percent / 100));
    return Math.max(0, Math.min(255, adjusted));
  };

  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const branding = getClientBranding();

  // Calculate color variants
  const primaryColorLight = adjustColor(branding.primaryColor, 90);
  const primaryColorDark = darkenColor(branding.primaryColor, 20);

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'overview';
    if (pathname.startsWith('/dashboard/tickets')) return 'tickets';
    if (pathname.startsWith('/dashboard/calls')) return 'calls';
    if (pathname.startsWith('/dashboard/documentation')) return 'documentation';
    if (pathname.startsWith('/dashboard/ai-insights')) return 'ai-insights';
    if (pathname.startsWith('/dashboard/analytics')) return 'analytics';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: string) => {
    setMobileMenuOpen(false);
    const routes: Record<string, string> = {
      overview: '/dashboard',
      tickets: '/dashboard/tickets',
      calls: '/dashboard/calls',
      documentation: '/dashboard/documentation',
      'ai-insights': '/dashboard/ai-insights',
      analytics: '/dashboard/analytics',
    };
    router.push(routes[tab]);
  };

  useEffect(() => {
    // Apply CSS variables to document root
    document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
    document.documentElement.style.setProperty('--primary-color-light', primaryColorLight);
    document.documentElement.style.setProperty('--primary-color-dark', primaryColorDark);
  }, [branding.primaryColor, primaryColorLight, primaryColorDark]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <Header />

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <>
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Close Menu</span>
            </>
          ) : (
            <>
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">Menu</span>
            </>
          )}
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 space-y-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tickets', label: 'Tickets' },
              { id: 'calls', label: 'Call Management' },
              { id: 'documentation', label: 'Documentation' },
              { id: 'ai-insights', label: 'AI Insights' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'font-medium text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={
                  activeTab === tab.id
                    ? { backgroundColor: branding.primaryColor }
                    : undefined
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      </div>
    </ProtectedRoute>
  );
}
