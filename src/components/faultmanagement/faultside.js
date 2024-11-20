// import React, { useState, useEffect, useCallback } from "react";

// const FaultSide = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [skip, setSkip] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);  // To handle if there are more alerts to load
//   const [noAlerts, setNoAlerts] = useState(false); // To handle case with no alerts

//   // Function to fetch alerts with pagination
//   const fetchAlerts = useCallback(async () => {
//     if (loading || !hasMore) return; // Avoid fetching if already loading or no more alerts to load
    
//     setLoading(true);
//     setNoAlerts(false); // Reset no alerts flag before fetching
//     try {
//       const response = await fetch(`/check_device_alerts?skip=${skip}&limit=3`);  // Fetch from /check_device_alerts
//       const data = await response.json();
  
//       if (data.triggered_alerts.length === 0 && skip === 0) {
//         setNoAlerts(true);  // No alerts triggered
//       } else {
//         setAlerts((prevAlerts) => [...prevAlerts, ...data.triggered_alerts]);
  
//         // Check if there are more alerts to load
//         if (data.triggered_alerts.length < 3) {
//           setHasMore(false);  // No more alerts to load
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching alerts:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [skip, loading, hasMore]);
  

//   // Fetch alerts when component mounts or when skip changes
//   useEffect(() => {
//     fetchAlerts();
//   }, [fetchAlerts]);

//   // Function to handle scroll event and load more alerts
//   const handleScroll = useCallback(() => {
//     if (
//       window.innerHeight + document.documentElement.scrollTop ===
//       document.documentElement.scrollHeight
//     ) {
//       setSkip((prevSkip) => prevSkip + 3); // Increase skip by 3 to fetch the next set of alerts
//     }
//   }, []);

//   // Set up the scroll event listener
//   useEffect(() => {
//     window.addEventListener("scroll", handleScroll);
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, [handleScroll]);

//   // Load more button click handler
//   const handleLoadMore = () => {
//     if (hasMore && !loading) {
//       setSkip((prevSkip) => prevSkip + 3);
//     }
//   };

//   return (
//     <div className="faultside-container">
//       <h2>Fault Alerts</h2>

//       {/* No alerts available message */}
//       {noAlerts && <p>No alerts available.</p>}

//       <div className="alerts-list">
//         {/* Render alerts */}
//         {alerts.length > 0 ? (
//           alerts.map((alert, index) => (
//             <div key={index} className="alert-item">
//               <h3>{alert.alert_title}</h3>
//               <p>{alert.alert_message}</p>
//               <small>Field: {alert.field_name}</small>
//               <br />
//               <small>
//                 Range: {alert.lower_bound} - {alert.higher_bound}
//               </small>
//             </div>
//           ))
//         ) : (
//           !noAlerts && <p>Loading...</p>  // Show loading text while fetching if no alerts are found
//         )}
//       </div>

//       {/* Show Load More button if there are more alerts to load */}
//       {hasMore && !loading && (
//         <div className="load-more">
//           <button onClick={handleLoadMore}>Load More</button>
//         </div>
//       )}

//       {/* Show no more alerts message */}
//       {!hasMore && !loading && <p>No more alerts to load.</p>}
//     </div>
//   );
// };

// export default FaultSide;

import React from 'react';

const FaultSide = () => {
  return (
    <div className="faultside-container">
      <h2>Fault Side Panel Alerts</h2>
    </div>
  );
};

export default FaultSide;

