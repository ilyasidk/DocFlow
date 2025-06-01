'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if logged in, otherwise to login page
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [user, router]);

  // Return null since we're redirecting anyway
  return null;
}
