import axios from 'axios';
// import { useAuth0 } from '/@auth0/auth0-react';


// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5001', // Base URL
  headers: {
    //'Content-Type': 'application/json', // Default content type -> caused errors with file upload
  },
});

// Add a request interceptor to include the Bearer token
// apiClient.interceptors.request.use(
//   (config) => {
    
//     const token = "your-token-here"; // Replace with your token logic
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default apiClient;
