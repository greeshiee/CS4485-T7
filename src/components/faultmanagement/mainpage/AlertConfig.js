import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AlertConfig({ refreshAlerts }) {
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [lowerBound, setLowerBound] = useState('');
  const [higherBound, setHigherBound] = useState('');
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch column names from the backend
    const fetchColumns = async () => {
      try {
        const response = await axios.get('http://localhost:8000/columns');
        setColumns(response.data.columns);  // Populate the dropdown with column names
      } catch (error) {
        console.error('Error fetching columns:', error);
        setErrorMessage('Error fetching column names. Please try again.');
      }
    };

    fetchColumns();
  }, []);

  const handleAddAlert = async () => {
    if (isNaN(lowerBound) || isNaN(higherBound)) {
      setErrorMessage('Lower and higher bounds must be valid numbers.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');  // Reset error message before request

      await axios.post('http://localhost:8000/add_alert', {
        alert_title: alertTitle,
        alert_message: alertMessage,
        field_name: fieldName,
        lower_bound: parseFloat(lowerBound),
        higher_bound: parseFloat(higherBound),
      });

      setSuccessMessage('Alert added successfully!');
      setAlertTitle('');
      setAlertMessage('');
      setFieldName('');
      setLowerBound('');
      setHigherBound('');

      // Call the refresh function to update the alerts list
      refreshAlerts();
    } catch (error) {
      console.error('Error adding alert:', error);
      setErrorMessage('Error adding alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center" style={{ maxWidth: '400px', padding: '20px', margin: 'auto' }}>
      <h2 className="mb-4">Add an Alert</h2>

      {/* Error and Success Messages */}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

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
      
      {/* Dropdown for column selection */}
      <select
        className="form-control mb-3"
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
      >
        <option value="">Select Field</option>
        {columns.map((column, index) => (
          <option key={index} value={column}>{column}</option>
        ))}
      </select>
      
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

      <button className="btn btn-primary w-100" onClick={handleAddAlert} disabled={loading}>
        {loading ? 'Adding Alert...' : 'Add Alert'}
      </button>
    </div>
  );
}

export default AlertConfig;