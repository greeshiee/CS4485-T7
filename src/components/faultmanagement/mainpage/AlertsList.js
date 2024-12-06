import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../services/api';
import useAxiosInterceptor from '../../../authInterceptor'; // Import the interceptor hook


function AlertsList({ selectedDatabase, removeAlert }) {
  const [alerts, setAlerts] = useState([]);
useAxiosInterceptor();
  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!selectedDatabase) return; // Don't fetch if no database is selected

    try {
      const response = await apiClient.get(`/fault_management/get_alerts?database=${selectedDatabase}`);
      setAlerts(response.data.alerts); // Update alerts with the fetched data
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [selectedDatabase]); // Depend on selectedDatabase

  // Fetch alerts when selectedDatabase changes
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]); // Depend on fetchAlerts

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Active Alerts</h2>
      <ul className="list-group">
        {alerts.map((alert) => (
          <li key={alert.id} className="list-group-item">
            <strong>{alert.alert_title}</strong>
            <p>{alert.alert_message}</p>
            <p>Field: {alert.field_name}</p>
            <p>Range: {alert.lower_bound} - {alert.higher_bound}</p>
            {/* Remove button */}
            <button
              className="btn btn-danger"
              onClick={() => removeAlert(alert.id)} // Trigger removeAlert from props
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlertsList;
