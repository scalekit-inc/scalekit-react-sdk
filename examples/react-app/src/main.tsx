import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ScalekitAuthProvider } from '@scalekit/react-sdk';
import App from './App';

// Scalekit configuration from environment variables
const scalekitConfig = {
  environmentUrl: import.meta.env.VITE_SCALEKIT_ENVIRONMENT_URL,
  clientId: import.meta.env.VITE_SCALEKIT_CLIENT_ID,
  redirectUri: import.meta.env.VITE_SCALEKIT_REDIRECT_URI,
  postLogoutRedirectUri: import.meta.env.VITE_SCALEKIT_POST_LOGOUT_REDIRECT_URI,
  scopes: 'openid profile email offline_access',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScalekitAuthProvider
        {...scalekitConfig}
        onRedirectCallback={({ appState }) => {
          // Navigate to the return URL after login
          const returnTo = appState?.returnTo || '/dashboard';
          window.history.replaceState({}, document.title, returnTo);
        }}
        onError={(error) => {
          console.error('Auth error:', error);
        }}
      >
        <App />
      </ScalekitAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
