import React, { useState, useEffect } from 'react';

import apiClient from '../../../services/api';
import useAxiosInterceptor from '../../../authInterceptor'; // Import the interceptor hook



function AlertConfig({ selectedDatabase, refreshAlerts }) {
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [lowerBound, setLowerBound] = useState('');
  const [higherBound, setHigherBound] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [columns, setDeviceColumns] = useState([]); // To store columns of the 'devices' table
 useAxiosInterceptor();
  useEffect(() => {
    // Fetch columns from the selected database
    const fetchColumns = async () => {
      if (!selectedDatabase) return; // Only fetch if a database is selected

      try {
        const response = await apiClient.get(`/fault_management/columns_from_db?database=${selectedDatabase}`);
        setDeviceColumns(response.data.columns); // Update deviceColumns with the fetched column names
      } catch (error) {
        console.error('Error fetching device columns:', error);
      }
    };

    fetchColumns();
  }, [selectedDatabase]); // This effect runs whenever the selectedDatabase changes

  const handleAddAlert = async () => {
    if (isNaN(lowerBound) || isNaN(higherBound)) {
      setErrorMessage('Lower and higher bounds must be valid numbers.');
      return;
    }
    if (parseFloat(lowerBound) >= parseFloat(higherBound)) {
      setErrorMessage('Lower bound must be less than higher bound.');
      return;
    }
  
    if (!alertTitle || !alertMessage || !fieldName) {
      setErrorMessage('Please fill all fields.');
      return;
    }
  
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
  
      // Update: Send 'database' in query string
      await apiClient.post(`/fault_management/add_alert?database=${selectedDatabase}`, {        alert_title: alertTitle,
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
  
      refreshAlerts(); // Refresh alerts in parent component
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

      {/* Alert Creation Form */}
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

      <select
        className="form-control mb-3"
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
      >
        <option value="">Select Field</option>
        {columns.length > 0 ? (
          columns.map((column, index) => (
            <option key={index} value={column}>{column}</option>
          ))
        ) : (
          <option value="">No columns available</option>
        )}
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
