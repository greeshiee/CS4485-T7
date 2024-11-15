import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './faultmanagement-styles.css'; // Import your custom CSS file
import AlertConfig from './mainpage/AlertConfig';
import AlertsList from './mainpage/AlertsList';
import { Container } from 'react-bootstrap'; // Import Bootstrap Container
import axios from 'axios';

function FaultMainPage() {
  const [alerts, setAlerts] = useState([]);

  // Fetch alerts when the page loads
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/alerts');
        setAlerts(response.data.alerts);  // Set the fetched alerts to state
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    };

    fetchAlerts();
  }, []);  // Empty dependency array ensures this runs once on mount

  // Function to refresh the alerts list
  const refreshAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/alerts');
      setAlerts(response.data.alerts);  // Re-fetch and update the alerts state
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Function to remove an alert
  const removeAlert = async (alertId) => {
    try {
      await axios.post('http://localhost:8000/remove_alert', { alert_id: alertId });

      // Remove the alert from the state immediately to reflect the UI change
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error removing alert:', error);
    }
  };

  return (
    <Container className="mt-4">
      <header className="text-center mb-4">
        <h1>Super Fault Management System</h1>
      </header>

      {/* Pass down refreshAlerts and removeAlert as props */}
      <AlertConfig refreshAlerts={refreshAlerts} />

      {/* Pass alerts and removeAlert as props to AlertsList */}
      <AlertsList alerts={alerts} removeAlert={removeAlert} />
    </Container>
  );
}

export default FaultMainPage;
