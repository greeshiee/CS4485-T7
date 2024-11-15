import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/loading';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Directly navigate to the dashboard for demo purposes
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return <Loading />;
}
