'use client';

import { useAuth0 } from '@auth0/auth0-react';

export default function Dashboard() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => loginWithRedirect()}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <button
        onClick={() =>
          logout({
            logoutParams: { returnTo: window.location.origin },
          })
        }
      >
        Logout
      </button>
    </div>
  );
}
