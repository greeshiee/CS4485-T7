import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';
import Unauthenticated from '../components/unauthenticated';

const anon_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiam9ieXNkeHpzY2N5bHZmZ3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4MjEyNzcsImV4cCI6MjA0NTM5NzI3N30.DQaHKLuEHg59DoBIw31_RkemvlVBAzx6SD1lNHhtCLE';
const supabase_url = 'https://tbjobysdxzsccylvfgrc.supabase.co'; 

const supabase = createClient(
    supabase_url,
    anon_key
);

export default function AuthWrapper({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
  
    useEffect(() => {
      const checkSession = async () => {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
        setIsLoading(false);
      };
  
      checkSession();
  
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        checkSession();
      });
  
      return () => {
        subscription.unsubscribe();
      };
    }, []);
  
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
  
    let content = null;
  
    if (error) {
      content = <div>Error: {errorDescription || 'An unknown error occurred.'}</div>;
    } else if (isLoading) {
      content = <div>Loading...</div>;
    } else if (!isAuthenticated) {
      content = <Unauthenticated />;
    } else {
      content = children;
    }
  
    return <>{content}</>;
  }