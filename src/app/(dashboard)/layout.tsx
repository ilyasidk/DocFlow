'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Only run client-side
  useEffect(() => {
    setMounted(true);
    
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, router, pathname]);

  // Render a loading state on the server and during first client render
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-16 border-b border-gray-200"></div>
        <main className="flex-1 container py-6 px-4"></main>
      </div>
    );
  }

  // Only render the actual content client-side after mounted
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