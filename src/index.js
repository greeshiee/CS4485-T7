import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
//import './Usecase3/frontend/src/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Auth0Provider
    domain="dev-ek2dti7hmslc8nga.us.auth0.com"
    clientId="HYU43NklXA0xib7V5EsPlE3dT73RLQ3i"
    cacheLocation="localstorage"
    authorizationParams={{
      redirect_uri: 'http://localhost:3000/callback',
      audience: 'cs4485',
    }}
  >
    <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
  </Auth0Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
