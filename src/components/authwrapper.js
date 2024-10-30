import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Unauthenticated from '../components/unauthenticated';
import EmailVerification from './emailverification';

export default function AuthWrapper({ children }) {
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');

  if (error){
    const message = errorDescription;
    console.log(message);
    if(message.toLowerCase().includes('verify')){
      return(
        <Auth0Provider
        domain="dev-ek2dti7hmslc8nga.us.auth0.com"
        clientId="HYU43NklXA0xib7V5EsPlE3dT73RLQ3i"
        authorizationParams={{
          redirect_uri: "http://localhost:3000/callback",  // Safe to use window here
          audience: 'cs4485',
        }}
        >
          <EmailVerification/>
        </Auth0Provider>
      );
    }
  }
  else if (location.pathname === '/' || location.pathname.toLowerCase() === '/splash' || location.pathname.toLowerCase() === '/callback') {
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


