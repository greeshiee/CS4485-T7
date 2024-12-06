import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './faultmanagement-styles.css';
import AlertConfig from './AlertConfig';
import AlertsList from './AlertsList';
import { Container, Form, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../services/api';
import useAxiosInterceptor from '../../../authInterceptor'; // Import the interceptor hook

function FaultMainPage() {
  // Initialize the interceptor
  useAxiosInterceptor();  // Calling the custom hook to activate the interceptor
  
  const [alerts, setAlerts] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch databases
  useEffect(() => {
    const fetchDatabases = async () => {
      setLoadingDatabases(true);
      setErrorMessage('');
      try {
        const response = await apiClient.get('/fault_management/list_databases');
        setDatabases(response.data.databases);
      } catch (error) {
        console.error('Error fetching databases:', error);
        setErrorMessage('Error fetching databases. Please try again.');
      } finally {
        setLoadingDatabases(false);
      }
    };

    fetchDatabases();
  }, []);

  // Fetch alerts when selectedDatabase changes
  useEffect(() => {
    if (!selectedDatabase) {
      setAlerts([]); // Clear alerts if no database is selected
      return;
    }

    const fetchAlerts = async () => {
      setLoadingAlerts(true);
      setErrorMessage('');
      try {
        const response = await apiClient.get(`/fault_management/get_alerts?database=${selectedDatabase}`);
        setAlerts(response.data.alerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setErrorMessage('Error fetching alerts. Please try again.');
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchAlerts();
  }, [selectedDatabase]);

  // Detect faults on alerts change
  useEffect(() => {
    const detectFaults = async () => {
      if (selectedDatabase && alerts.length) {
        try {
          await apiClient.post('/fault_management/detect_faults', { database: selectedDatabase });
          console.log("Fault detection completed successfully.");
        } catch (error) {
          console.error("Error detecting faults:", error);
          setErrorMessage("Error detecting faults. Please try again.");
        }
      }
    };

    detectFaults();
  }, [alerts, selectedDatabase]);

  // Use useCallback to memoize refreshAlerts
  const refreshAlerts = useCallback(async () => {
    if (selectedDatabase) {
      setLoadingAlerts(true);
      setErrorMessage('');
      try {
        const response = await apiClient.get(`/fault_management/alerts?database=${selectedDatabase}`);
        setAlerts(response.data.alerts);
      } catch (error) {
        console.error('Error refreshing alerts:', error);
        setErrorMessage('Error refreshing alerts. Please try again.');
      } finally {
        setLoadingAlerts(false);
      }
    }
  }, [selectedDatabase]);

  // Remove an alert
  const removeAlert = async (alertId) => {
    try {
      await apiClient.post(`/fault_management/remove_alert?database=${selectedDatabase}`, {
        alert_id: alertId,
      });
      refreshAlerts(); // Refresh alerts after removal
    } catch (error) {
      console.error('Error removing alert:', error);
      setErrorMessage('Error removing alert. Please try again.');
    }
  };

  return (
    <Container className="mt-4">
      <header className="text-center mb-4">
        <h1>Fault Management System</h1>
      </header>

      {/* Loading and Error Messages */}
      {loadingDatabases && <Spinner animation="border" role="status" />}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Form.Group controlId="selectDatabase">
        <Form.Label>Select Database</Form.Label>
        <Form.Control
          as="select"
          value={selectedDatabase}
          onChange={(e) => setSelectedDatabase(e.target.value)} // Update the selected database
        >
          <option value="">-- Select Database --</option> {/* No database selected initially */}
          {databases.map((db, index) => (
            <option key={index} value={db}>{db}</option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Display AlertConfig and AlertsList components only when a database is selected */}
      {selectedDatabase && (
        <>
          <AlertConfig selectedDatabase={selectedDatabase} refreshAlerts={refreshAlerts} />
          {loadingAlerts ? (
            <Spinner animation="border" role="status" />
          ) : (
            <AlertsList selectedDatabase={selectedDatabase} alerts={alerts} removeAlert={removeAlert} />
          )}
        </>
      )}
    </Container>
  );
}

export default FaultMainPage;
