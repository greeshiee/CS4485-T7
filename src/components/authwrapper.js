import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Unauthenticated from '../components/unauthenticated';

export default function AuthWrapper({ children }) {
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (location.pathname === '/' || location.pathname.toLowerCase() === '/splash' || location.pathname.toLowerCase() === '/callback') {
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
  else{
    return (
      <Auth0Provider
        domain="dev-ek2dti7hmslc8nga.us.auth0.com"
        clientId="HYU43NklXA0xib7V5EsPlE3dT73RLQ3i"
        authorizationParams={{
          redirect_uri: "http://localhost:3000/callback",  // Safe to use window here
          audience: 'cs4485',
        }}
      >
        {isClient && (isAuthenticated || isLoading) ? (
          <>{children}</>
        ) : (
          <Unauthenticated/>
        )}
      </Auth0Provider>
    );
  }
}


