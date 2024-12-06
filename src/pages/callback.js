import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Loading from '../components/loading';
import EmailVerification from '../components/emailverification';

export default function Callback() {
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  useEffect(() => {
    const handleAuthentication = async () => {
      const searchParams = new URLSearchParams(location.search);
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error === 'access_denied' && errorDescription === 'Please verify your email before continuing.') {
        setShowEmailVerification(true);
        return;
      }

      if (user) {
        try {
          const accessToken = await getAccessTokenSilently({
            refreshToken: true,
          });
          console.log('Access token:', accessToken);
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error(error);
        }
      }
    };

    handleAuthentication();
  }, [user, getAccessTokenSilently, navigate, location.search]);

  if (showEmailVerification) {
    return <EmailVerification />;
  }

  return <Loading />;
}