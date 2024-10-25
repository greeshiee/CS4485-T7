'use client';  // This forces the component to run on the client side

import { Auth0Provider } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

export default function AuthWrapper({ children }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the component is running client-side
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return null or loading UI while waiting for client-side execution
    return null;
  }

  return (
    <Auth0Provider
      domain="dev-ek2dti7hmslc8nga.us.auth0.com"
      clientId="HYU43NklXA0xib7V5EsPlE3dT73RLQ3i"
      authorizationParams={{
        redirect_uri: "http://localhost:3000/callback",  // Safe to use window here
        audience: 'cs4485',
      }}
    >
      {children}
    </Auth0Provider>
  );
}

