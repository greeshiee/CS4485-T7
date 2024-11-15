import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FaultSide = ({ alertTitle }) => {
    const [triggeredAlerts, setTriggeredAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [databases, setDatabases] = useState([]);  // State for databases
    const [dbLoading, setDbLoading] = useState(true); // State to track loading databases

    // Fetch triggered alerts from the backend
    useEffect(() => {
        const fetchTriggeredAlerts = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/triggered_alerts/${alertTitle}`);
                setTriggeredAlerts(response.data.triggered_alerts);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                // Check if the error is related to the response or the network
                if (err.response) {
                    setError(`Error: ${err.response.status} - ${err.response.data.detail || "Unable to fetch triggered alerts"}`);
                } else if (err.request) {
                    setError("Network error: No response from the server");
                } else {
                    setError(`Error: ${err.message}`);
                }
            }
        };

        fetchTriggeredAlerts();
    }, [alertTitle]);

    // Fetch the list of databases
    useEffect(() => {
        const fetchDatabases = async () => {
            try {
                const response = await axios.get('http://localhost:8000/list_databases');
                setDatabases(response.data.databases);
                setDbLoading(false);
            } catch (err) {
                setDbLoading(false);
                setError("Error fetching databases");
            }
        };

        fetchDatabases();
    }, []);

    if (loading) {
        return <div>Loading triggered alerts...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h3>Triggered Alerts for {alertTitle}</h3>
            {triggeredAlerts.length === 0 ? (
                <p>No triggered alerts found.</p>
            ) : (
                <ul>
                    {triggeredAlerts.map((alert, index) => (
                        <li key={index}>
                            <strong>Device ID:</strong> {alert.device_id} <br />
                            <strong>Alert Title:</strong> {alert.alert_title} <br />
                            <strong>Message:</strong> {alert.alert_message} <br />
                            <strong>Triggered Value:</strong> {alert.triggered_value} <br />
                            <strong>Field Name:</strong> {alert.field_name} <br />
                            <strong>Timestamp:</strong> {alert.timestamp}
                        </li>
                    ))}
                </ul>
            )}

            <h3>Alert Databases</h3>
            {dbLoading ? (
                <div>Loading databases...</div>
            ) : (
                <ul>
                    {databases.length === 0 ? (
                        <p>No alert databases found.</p>
                    ) : (
                        databases.map((db, index) => (
                            <li key={index}>{db}</li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default FaultSide;
