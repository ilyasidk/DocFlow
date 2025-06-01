'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, router, pathname]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6 px-4">
        {children}
      </main>
    </div>
  );
} 