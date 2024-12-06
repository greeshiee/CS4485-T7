import React, { useState, useEffect, useCallback } from "react";
import { Container, Form, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../services/api'; // Axios instance
import useAxiosInterceptor from '../../authInterceptor'; // Import the interceptor hook

const FaultSide = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noAlerts, setNoAlerts] = useState(false); // State to handle no alerts message

  // Activate the axios interceptor to automatically add the token to requests
  useAxiosInterceptor();  // Calling the custom hook to activate the interceptor

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setNoAlerts(false); // Reset the no alerts flag
    try {
      const response = await apiClient.get("/fault_management/get_notifications");
      if (response.data.notifications && response.data.notifications.length > 0) {
        setNotifications(response.data.notifications);
      } else {
        setNoAlerts(true); // Set the flag if no alerts are found
      }
    } catch (error) {
      console.error("Error fetching notifications: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications initially and set up interval for periodic updates
  useEffect(() => {
    fetchNotifications(); // Fetch once when the component mounts
  
    const interval = setInterval(() => {
      fetchNotifications(); // Periodically fetch notifications
    }, 10000); // Fetch every 10 seconds
  
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [fetchNotifications]);

  // Function to remove a notification
  const handleRemoveNotification = async (notificationId) => {
    try {
      await apiClient.post("/fault_management/remove_notification", { id: notificationId });
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId)); // Remove from state
      console.log(`Notification with ID ${notificationId} removed successfully`);
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  return (
    <div className="faultside-container">
      <h2>Notifications</h2>

      {/* Show a spinner while loading */}
      {loading && <Spinner animation="border" />}

      {/* Show notifications or a message if no notifications */}
      <div className="notifications-list">
        {noAlerts ? (
          <p>No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <Alert
              key={notification.id} // Use a unique identifier
              variant={notification.alert_type || "info"} // Use alert_type from API for Bootstrap variant
              dismissible
              onClose={() => handleRemoveNotification(notification.id)} // Remove notification on close
            >
              <Alert.Heading>{notification.alert_title}</Alert.Heading>
              <p>{notification.alert_message}</p>
              <small>
                {notification.timestamp &&
                  new Date(notification.timestamp).toLocaleString()}
              </small>
            </Alert>
          ))
        )}
      </div>
    </div>
  );
};

export default FaultSide;
