// AlertConfig.js
import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="container text-center" style={{ maxWidth: '400px', padding: '20px', margin: 'auto' }}>
      <h2 className="mb-4">Add an Alert</h2>
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Alert Title"
        value={alertTitle}
        onChange={(e) => setAlertTitle(e.target.value)}
      />
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Alert Message"
        value={alertMessage}
        onChange={(e) => setAlertMessage(e.target.value)}
      />
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Field Name"
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
      />
      <input
        type="number"
        className="form-control mb-3"
        placeholder="Lower Bound"
        value={lowerBound}
        onChange={(e) => setLowerBound(e.target.value)}
      />
      <input
        type="number"
        className="form-control mb-4"
        placeholder="Higher Bound"
        value={higherBound}
        onChange={(e) => setHigherBound(e.target.value)}
      />
      <button className="btn btn-primary w-100" onClick={handleAddAlert}>
        Add Alert
      </button>
    </div>
  );
}

export default AlertConfig;
