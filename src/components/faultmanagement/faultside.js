import React, { useState, useEffect, useCallback } from "react";
import { Container, Form, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../services/api';


const FaultSide = () => {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);  // To handle if there are more alerts to load
  const [noAlerts, setNoAlerts] = useState(false); // To handle case with no alerts

  // Function to fetch notifications.
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/get_notifications");
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(); // Fetch once when the component mounts
  
    const interval = setInterval(() => {
      fetchNotifications(); // Periodically fetch notifications
    }, 10000); // Fetch every 10 seconds
  
    return () => clearInterval(interval); // Clean up interval on unmount
  }, [fetchNotifications]);
  

  // // Fetch alerts when component mounts or when skip changes
  // useEffect(() => {
  //   fetchAlerts();
  // }, [fetchAlerts]);

  // // Function to handle scroll event and load more alerts
  // const handleScroll = useCallback(() => {
  //   if (
  //     window.innerHeight + document.documentElement.scrollTop ===
  //     document.documentElement.scrollHeight
  //   ) {
  //     setSkip((prevSkip) => prevSkip + 3); // Increase skip by 3 to fetch the next set of alerts
  //   }
  // }, []);

  // // Set up the scroll event listener
  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, [handleScroll]);

  // // Load more button click handler
  // const handleLoadMore = () => {
  //   if (hasMore && !loading) {
  //     setSkip((prevSkip) => prevSkip + 3);
  //   }
  // };

  return (
    <div className="faultside-container">
      <h2>Notifications</h2>

      {/* Show a spinner while loading */}
      {loading && <Spinner animation="border" />}

      {/* Show notifications */}
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <Alert
              key={notification.id} // Use a unique identifier
              variant={notification.alert_type || "info"} // Use alert_type from API for Bootstrap variant
              dismissible
              onClose={() => {
                handleRemoveNotification(notification.id); // Call the backend to remove the notification
                setNotifications((prev) => prev.filter((notif) => notif.id !== notification.id)); // Remove from state
              }}
            >
              <Alert.Heading>{notification.alert_title}</Alert.Heading>
              <p>{notification.alert_message}</p>
              <small>
                {notification.timestamp &&
                  new Date(notification.timestamp).toLocaleString()}
              </small>
            </Alert>
          ))
        ) : (
          !loading && <p>No notifications available.</p>
        )}
      </div>
    </div>
  );
};

const handleRemoveNotification = async (notificationId) => {
  try {
    await fetch("http://localhost:8000/remove_notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notificationId }),
    });
    console.log(`Notification with ID ${notificationId} removed successfully`);
  } catch (error) {
    console.error("Error removing notification:", error);
  }
};

export default FaultSide;