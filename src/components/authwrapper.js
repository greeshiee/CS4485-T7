import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Unauthenticated from '../components/unauthenticated';
import EmailVerification from './emailverification';

// Single Auth0 configuration
const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin + "/callback",
  }
};

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

  if (error) {
    const message = errorDescription;
    console.log(message);
    if(message.toLowerCase().includes('verify')) {
      return (
        <Auth0Provider {...auth0Config}>
          <EmailVerification/>
        </Auth0Provider>
      );
    }
  }
  else if (location.pathname === '/' || location.pathname.toLowerCase() === '/splash' || location.pathname.toLowerCase() === '/callback') {
    return (
      <Auth0Provider {...auth0Config}>
        {children}
      </Auth0Provider>
    );
  }
  else {
    return (
      <Auth0Provider {...auth0Config}>
        {isClient && (isAuthenticated || isLoading) ? (
          <>{children}</>
        ) : (
          <Unauthenticated/>
        )}
      </Auth0Provider>
    );
  }
}


