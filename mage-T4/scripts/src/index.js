import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import ReactDOM from 'react-dom';
//import App from './App'; 

ReactDOM.render(
  <Auth0Provider
    domain="dev-yax3bjnzpibztv43.us.auth0.com"
    clientId="c5D3fiYpph9Gv1XujzmlbJVqsFHvhBFx"
    authorizationParams={{
      redirect_uri: window.location.origin, 
      audience: "cs4485",  
    }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);
