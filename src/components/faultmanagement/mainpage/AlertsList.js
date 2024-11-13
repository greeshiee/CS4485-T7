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
    <div className="container mx-auto mt-4">
      <h2 className="text-2xl font-bold mb-4">Active Alerts</h2>
      {alerts.map((alert, index) => (
        <div key={index} className="bg-white shadow-md rounded px-8 py-6 mb-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{alert.alert_title}</h3>
            <button
              className="text-red-500 hover:text-red-700 focus:outline-none"
              onClick={() => handleRemoveAlert(index)}
            >
              Remove
            </button>
          </div>
          <p className="mt-2">{alert.alert_message}</p>
        </div>
      ))}
    </div>
  );
}

export default AlertsList;
