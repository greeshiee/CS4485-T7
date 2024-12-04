import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react'; // Ensure this import is correct
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    domain="dev-qfm00zieya5sfr60.us.auth0.com"  // Your Auth0 domain
    clientId="Wl84NkSqwDmLAoVrpXAUHBoAsv3yuvPn"  // Your Auth0 client ID
    redirectUri={window.location.origin + "/callback"}  // This dynamically sets the redirect URI
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>
);

reportWebVitals();
