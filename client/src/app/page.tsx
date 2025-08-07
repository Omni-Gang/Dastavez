'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AuthButton from '@/components/AuthButton';

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white">
      <h1 className="text-5xl font-bold mb-6 text-gray-800">Welcome to Dastavez</h1>
      <p className="text-lg text-gray-600 mb-10">
        A real-time collaborative document editing platform.
      </p>

      <AuthButton />
    </main>
  );
}
