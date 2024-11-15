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
    </div>
  );
}

export default AlertsList;
