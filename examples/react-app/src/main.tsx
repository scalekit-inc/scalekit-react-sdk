import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ScalekitAuthProvider } from '@scalekit-sdk/react';
import App from './App';

// Scalekit configuration
const scalekitConfig = {
  environmentUrl: 'https://scalekitdevrel-aflrypwzaabce.scalekit.cloud',
  clientId: 'prd_skc_96576974507475491',
  redirectUri: 'http://localhost:5173/callback',
  postLogoutRedirectUri: 'http://localhost:5173',
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
