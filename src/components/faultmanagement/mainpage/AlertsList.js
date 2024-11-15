import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function AlertsList({ alerts, removeAlert }) {
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
// AlertsList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div className="container mx-auto mt-4 px-4">
      <h2 className="text-2xl font-bold mb-4">Active Alerts</h2>
      {alerts.map((alert, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-3">
          <h3 className="text-xl text-background font-semibold mb-2">{alert.alert_title}</h3>
          <p className="mb-4 text-background">{alert.alert_message}</p>
          <button 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
            onClick={() => handleRemoveAlert(index)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default AlertsList;
