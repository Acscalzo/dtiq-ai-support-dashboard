'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { getClientBranding } from "@/config/branding";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const branding = getClientBranding();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    );
  }

  // Don't render if redirecting
  if (user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {branding.companyName}
        </h1>
        <p className="text-xl mb-8 text-center">
          AI-Powered Customer Support Platform
        </p>

        <div className="mb-8 text-center space-x-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors border-2"
            style={{
              borderColor: branding.primaryColor,
              color: branding.primaryColor,
            }}
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: branding.primaryColor,
              color: "#ffffff",
            }}
          >
            Get Started
          </Link>
        </div>

        <div className="mt-16 p-6 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Real-time ticket management and tracking</li>
            <li>AI-powered insights and analytics</li>
            <li>Intelligent search across tickets and documentation</li>
            <li>Customer support documentation hub</li>
            <li>Advanced analytics and trend analysis</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
