"use client";

import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // get token from localstorage

    if (!token) {
      window.location.href = '/auth'; // redirect to login if no token
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setName(data.name); 
        } else {
          setError('Failed to fetch data');
        }
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return <h1>Welcome, {name}</h1>;
};

export default Dashboard;
