// AlertsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Container } from 'react-bootstrap';

function AlertsList() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch active alerts when component mounts
    const fetchAlerts = async () => {
      // const response = await axios.get('/alerts');
      // setAlerts(response.data);
    };
    fetchAlerts();
  }, []);

  const handleRemoveAlert = async (index) => {
    try {
      await axios.post('/remove_alert', { index });
      setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error removing alert:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Active Alerts</h2>
      {alerts.map((alert, index) => (
        <Card key={index} className="mb-3">
          <Card.Body>
            <Card.Title>{alert.alert_title}</Card.Title>
            <Card.Text>{alert.alert_message}</Card.Text>
            <Button variant="danger" onClick={() => handleRemoveAlert(index)}>
              Remove
            </Button>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default AlertsList;
