'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect to dashboard if logged in, otherwise to login
      router.replace(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth and redirecting
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </main>
  );
}
