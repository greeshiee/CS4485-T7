// AlertConfig.js
import React, { useState } from 'react';
import axios from 'axios';

function AlertConfig() {
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [lowerBound, setLowerBound] = useState('');
  const [higherBound, setHigherBound] = useState('');

  const handleAddAlert = async () => {
    try {
      await axios.post('/add_alert', {
        alert_title: alertTitle,
        alert_message: alertMessage,
        field_name: fieldName,
        lower_bound: lowerBound,
        higher_bound: higherBound,
      });
      alert('Alert added successfully');
      // Reset fields after successful submission
      setAlertTitle('');
      setAlertMessage('');
      setFieldName('');
      setLowerBound('');
      setHigherBound('');
    } catch (error) {
      console.error("Error adding alert:", error);
    }
  };

  return (
  <div className="max-w-[400px] mx-auto p-5 text-center">
    <h2 className="mb-4 text-3xl font-bold">Add an Alert</h2>
    <input
      type="text"
      className="w-full px-3 py-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Alert Title"
      value={alertTitle}
      onChange={(e) => setAlertTitle(e.target.value)}
    />
    <input
      type="text"
      className="w-full px-3 py-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Alert Message"
      value={alertMessage}
      onChange={(e) => setAlertMessage(e.target.value)}
    />
    <input
      type="text"
      className="w-full px-3 py-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Field Name"
      value={fieldName}
      onChange={(e) => setFieldName(e.target.value)}
    />
    <input
      type="number"
      className="w-full px-3 py-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Lower Bound"
      value={lowerBound}
      onChange={(e) => setLowerBound(e.target.value)}
    />
    <input
      type="number"
      className="w-full px-3 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Higher Bound"
      value={higherBound}
      onChange={(e) => setHigherBound(e.target.value)}
    />
    <button 
      className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
      onClick={handleAddAlert}
    >
      Add Alert
    </button>
  </div>
  );
}

export default AlertConfig;
