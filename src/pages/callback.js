import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Callback() {
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthentication = async () => {
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
  }, [user, getAccessTokenSilently, navigate]);

  return <div>Loading...</div>;
}