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

  return <div>Loading...</div>;  // You can customize the loading message or spinner
}
