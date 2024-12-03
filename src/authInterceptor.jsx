// src/hooks/useAxiosInterceptor.js
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import apiClient from "./services/api";

const useAxiosInterceptor = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const addTokenToRequest = async (config) => {
      try {
        if (isAuthenticated) {
          const token = await getAccessTokenSilently({
            audience: "YOUR_API_AUDIENCE", // Replace with your API audience
            scope: "read:messages", // Replace with your required scopes
          });
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      } catch (error) {
        return Promise.reject(error);
      }
    };

    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => addTokenToRequest(config),
      (error) => Promise.reject(error)
    );

    // Cleanup interceptor on unmount
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [getAccessTokenSilently, isAuthenticated]);
};

export default useAxiosInterceptor;
