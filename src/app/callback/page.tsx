'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth0 } from '@auth0/auth0-react';

export default function Callback() {
  const { isAuthenticated } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');  // Redirect to the dashboard after successful authentication
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-black dark:text-black ">Check Your Email!</h1>
        <p className="text-lg text-gray-700">
          Please check your email for a verification link.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          If you don't see it, be sure to check your spam or junk folder.
        </p>
      </div>
    </div>
  );  // You can customize the loading message or spinner
}
