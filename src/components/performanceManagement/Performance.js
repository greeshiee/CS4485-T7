import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Performance.css';

function Performance() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  // If Auth0 is still loading, we can show a loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Performance">
      <header className="Performance-header">
        <h1>Welcome to the T9 Performance Management App!</h1>

        {/* Show login or user information based on authentication status */}
        {!isAuthenticated ? (
          <button onClick={() => loginWithRedirect()}>Login</button>
        ) : (
          <>
            <h2>Hello, {user.name}!</h2>

            {/* Redirect to Grafana when clicking the Dashboard button */}
            <button onClick={() => window.location.href = 'http://localhost:9090'}>Dashboard</button>

            {/* Logout functionality */}
            <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
          </>
        )}
      </header>
    </div>
  );
}

export default Performance;
