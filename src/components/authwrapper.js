import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'react-router-dom';
import Unauthenticated from '../components/unauthenticated';
import EmailVerification from './emailverification';

export default function AuthWrapper({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');

  let content = null;

  if (error) {
    const message = errorDescription;
    if (message.toLowerCase().includes('verify')) {
      content = <EmailVerification />;
    }
    // TODO: show some other error message here
  } else if (isLoading) {
    content = <div>Loading...</div>;
  } else if (!isAuthenticated) {
    content = <Unauthenticated />;
  } else {
    content = children;
  }

  return <>{content}</>;
}


