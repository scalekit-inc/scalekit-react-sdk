# @scalekit/react-sdk

React SDK for Scalekit OIDC authentication. This SDK wraps `oidc-client-ts` to provide seamless OIDC/OAuth 2.0 authentication with Scalekit.

## Features

- PKCE-enabled OAuth 2.0 / OIDC authentication
- Automatic token refresh
- React hooks for easy state management
- TypeScript support with full type definitions
- SSR compatible
- Tree-shakeable ESM and CJS builds

## Installation

```bash
npm install @scalekit/react-sdk
# or
yarn add @scalekit/react-sdk
# or
pnpm add @scalekit/react-sdk
```

## Quick Start

### 1. Wrap your app with the provider

```tsx
import { ScalekitAuthProvider } from '@scalekit/react-sdk';

function App() {
  return (
    <ScalekitAuthProvider
      environmentUrl="https://your-tenant.scalekit.cloud"
      clientId="your-client-id"
      redirectUri="http://localhost:5173/callback"
      postLogoutRedirectUri="http://localhost:5173"
      onRedirectCallback={({ appState }) => {
        // Navigate to returnTo URL after login
        window.history.replaceState({}, '', appState?.returnTo || '/');
      }}
    >
      <YourApp />
    </ScalekitAuthProvider>
  );
}
```

### 2. Use the auth hook in your components

```tsx
import { useScalekitAuth } from '@scalekit/react-sdk';

function LoginButton() {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } = useScalekitAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <p>Hello, {user?.profile.name}!</p>
        <button onClick={() => logout()}>Log out</button>
      </div>
    );
  }

  return <button onClick={() => loginWithRedirect()}>Log in</button>;
}
```

### 3. Handle the callback

```tsx
import { ScalekitCallback } from '@scalekit/react-sdk';
import { useNavigate } from 'react-router-dom';

function CallbackPage() {
  const navigate = useNavigate();

  return (
    <ScalekitCallback
      onSuccess={() => navigate('/dashboard')}
      onError={(error) => {
        console.error(error);
        navigate('/login?error=auth_failed');
      }}
    />
  );
}
```

## API Reference

### ScalekitAuthProvider

The main provider component that wraps your application.

```tsx
<ScalekitAuthProvider
  environmentUrl="https://your-tenant.scalekit.cloud"  // Required: Your Scalekit environment URL
  clientId="your-client-id"                     // Required: Your OAuth client ID
  redirectUri="http://localhost:5173/callback"  // Required: Redirect URI after login
  scopes="openid profile email offline_access"  // Optional: OIDC scopes (default shown)
  postLogoutRedirectUri="http://localhost:5173" // Optional: Redirect URI after logout
  storage="sessionStorage"                       // Optional: sessionStorage | localStorage | memory
  autoHandleCallback={true}                      // Optional: Auto-process callback (default: true)
  automaticSilentRenew={true}                   // Optional: Auto-refresh tokens (default: true)
  onRedirectCallback={({ appState, user }) => {}}  // Optional: Callback after login
  onError={(error) => {}}                        // Optional: Error handler
>
  <App />
</ScalekitAuthProvider>
```

### useScalekitAuth

The primary hook for accessing auth state and methods.

```tsx
const {
  // State
  isLoading,           // boolean - SDK initializing
  isAuthenticated,     // boolean - User logged in
  user,                // ScalekitUser | null
  error,               // Error | null

  // Methods
  loginWithRedirect,   // (options?) => Promise<void>
  loginWithPopup,      // (options?) => Promise<ScalekitUser>
  logout,              // (options?) => Promise<void>
  getAccessToken,      // (options?) => Promise<string>
  refreshToken,        // () => Promise<ScalekitUser | null>
} = useScalekitAuth();
```

#### Login Options

```tsx
loginWithRedirect({
  returnTo: '/dashboard',           // URL to return to after login
  organizationId: 'org_123',        // Route to specific org's IdP
  connectionId: 'conn_456',         // Use specific IdP connection
  loginHint: 'user@example.com',    // Pre-fill email
  extraQueryParams: { custom: 'value' },
});
```

#### Logout Options

```tsx
logout({
  federated: true,                              // Logout from IdP as well
  postLogoutRedirectUri: 'http://localhost:5173',  // Override default redirect
});
```

### useAccessToken

Hook for managing access tokens.

```tsx
const {
  accessToken,  // string | null
  isLoading,    // boolean
  error,        // Error | null
  refresh,      // () => Promise<void>
} = useAccessToken();

// Use in API calls
const response = await fetch('/api/data', {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### ScalekitCallback

Component to handle the OAuth callback.

```tsx
<ScalekitCallback
  onSuccess={() => navigate('/dashboard')}
  onError={(error) => console.error(error)}
  loadingComponent={<CustomSpinner />}
  errorComponent={(error) => <CustomError error={error} />}
/>
```

### withAuthenticationRequired

Higher-order component for protected routes.

```tsx
import { withAuthenticationRequired } from '@scalekit/react-sdk';

const ProtectedDashboard = withAuthenticationRequired(Dashboard, {
  loadingComponent: <Spinner />,
  returnTo: '/dashboard',
  organizationId: 'org_123',
  onRedirecting: () => console.log('Redirecting to login...'),
});

// Usage in router
<Route path="/dashboard" element={<ProtectedDashboard />} />
```

## User Object

The `user` object returned by `useScalekitAuth` has the following structure:

```typescript
interface ScalekitUser {
  profile: {
    sub: string;              // User ID
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    // ... additional OIDC claims
  };
  metadata: {
    organizationId?: string;  // Scalekit organization ID
    connectionId?: string;    // IdP connection ID
    identityProvider?: string;
    roles?: string[];
    groups?: string[];
  };
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
}
```

## Error Handling

The SDK exports typed error classes for specific error scenarios:

```tsx
import {
  ScalekitAuthError,     // Base error class
  LoginError,            // Login failed
  LogoutError,           // Logout failed
  TokenRefreshError,     // Token refresh failed
  CallbackError,         // Callback processing failed
  ConfigurationError,    // SDK misconfigured
  NotAuthenticatedError, // User not authenticated
} from '@scalekit/react-sdk';

try {
  await loginWithRedirect();
} catch (error) {
  if (error instanceof LoginError) {
    console.error('Login failed:', error.message);
  }
}
```

## Example Application

See the `examples/react-app` directory for a complete working example.

```bash
cd examples/react-app
npm install
npm run dev
```

The example app demonstrates:
- Provider setup with React Router
- Login/logout flow
- Protected routes
- Displaying user information
- Token management

## Framework Integration Guides

### Docusaurus

Docusaurus is a static site generator that supports React components. Since authentication requires client-side JavaScript, you'll need to use client-side only components.

#### 1. Install the SDK

```bash
npm install @scalekit/react-sdk
```

#### 2. Create an Auth Provider wrapper

Create `src/components/AuthProvider.tsx`:

```tsx
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { ScalekitAuthProvider } from '@scalekit/react-sdk';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        const baseUrl = window.location.origin;
        return (
          <ScalekitAuthProvider
            environmentUrl="https://your-tenant.scalekit.cloud"
            clientId="your-client-id"
            redirectUri={`${baseUrl}/callback`}
            postLogoutRedirectUri={baseUrl}
            onRedirectCallback={({ appState }) => {
              window.location.replace(appState?.returnTo || '/');
            }}
          >
            {children}
          </ScalekitAuthProvider>
        );
      }}
    </BrowserOnly>
  );
}
```

#### 3. Swizzle the Root component

```bash
npm run swizzle @docusaurus/theme-classic Root -- --wrap
```

Edit `src/theme/Root.tsx`:

```tsx
import React from 'react';
import AuthProvider from '@site/src/components/AuthProvider';

export default function Root({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
```

#### 4. Create a Login Button component

Create `src/components/LoginButton.tsx`:

```tsx
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

function LoginButtonInner() {
  const { useScalekitAuth } = require('@scalekit/react-sdk');
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } = useScalekitAuth();

  if (isLoading) {
    return <button disabled>Loading...</button>;
  }

  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>Hello, {user?.profile.name || user?.profile.email}</span>
        <button onClick={() => logout()}>Log out</button>
      </div>
    );
  }

  return (
    <button onClick={() => loginWithRedirect({ returnTo: window.location.pathname })}>
      Log in
    </button>
  );
}

export default function LoginButton() {
  return (
    <BrowserOnly fallback={<button disabled>Loading...</button>}>
      {() => <LoginButtonInner />}
    </BrowserOnly>
  );
}
```

#### 5. Create a Callback page

Create `src/pages/callback.tsx`:

```tsx
import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';

function CallbackInner() {
  const { ScalekitCallback } = require('@scalekit/react-sdk');

  return (
    <ScalekitCallback
      onSuccess={() => {
        window.location.replace('/');
      }}
      onError={(error) => {
        console.error('Auth error:', error);
        window.location.replace('/?error=auth_failed');
      }}
    />
  );
}

export default function CallbackPage() {
  return (
    <Layout title="Authenticating...">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <BrowserOnly fallback={<div>Processing authentication...</div>}>
          {() => <CallbackInner />}
        </BrowserOnly>
      </div>
    </Layout>
  );
}
```

#### 6. Add Login Button to Navbar

Edit `docusaurus.config.js`:

```js
module.exports = {
  themeConfig: {
    navbar: {
      items: [
        // ... other items
        {
          type: 'custom-loginButton',
          position: 'right',
        },
      ],
    },
  },
};
```

Create `src/theme/NavbarItem/LoginButtonNavbarItem.tsx`:

```tsx
import React from 'react';
import LoginButton from '@site/src/components/LoginButton';

export default function LoginButtonNavbarItem() {
  return <LoginButton />;
}
```

Register the custom navbar item in `src/theme/NavbarItem/ComponentTypes.tsx`:

```tsx
import LoginButtonNavbarItem from './LoginButtonNavbarItem';

export default {
  'custom-loginButton': LoginButtonNavbarItem,
};
```

---

### Astro

Astro supports React components through the `@astrojs/react` integration. Since authentication is client-side, you'll use React islands with the `client:only` directive.

#### 1. Set up React integration

```bash
npx astro add react
npm install @scalekit/react-sdk
```

#### 2. Create the Auth Provider

Create `src/components/AuthProvider.tsx`:

```tsx
import React, { type ReactNode } from 'react';
import { ScalekitAuthProvider } from '@scalekit/react-sdk';

interface AuthProviderProps {
  children: ReactNode;
  redirectUri: string;
  postLogoutRedirectUri: string;
}

export default function AuthProvider({
  children,
  redirectUri,
  postLogoutRedirectUri
}: AuthProviderProps) {
  return (
    <ScalekitAuthProvider
      environmentUrl="https://your-tenant.scalekit.cloud"
      clientId="your-client-id"
      redirectUri={redirectUri}
      postLogoutRedirectUri={postLogoutRedirectUri}
      onRedirectCallback={({ appState }) => {
        window.location.replace(appState?.returnTo || '/');
      }}
    >
      {children}
    </ScalekitAuthProvider>
  );
}
```

#### 3. Create Auth Components

Create `src/components/LoginButton.tsx`:

```tsx
import React from 'react';
import { useScalekitAuth } from '@scalekit/react-sdk';

export default function LoginButton() {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } = useScalekitAuth();

  if (isLoading) {
    return <button disabled>Loading...</button>;
  }

  if (isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>Hello, {user?.profile.name || user?.profile.email}</span>
        <button onClick={() => logout()}>Log out</button>
      </div>
    );
  }

  return (
    <button onClick={() => loginWithRedirect({ returnTo: window.location.pathname })}>
      Log in
    </button>
  );
}
```

Create `src/components/AuthenticatedApp.tsx` (wraps components needing auth):

```tsx
import React from 'react';
import AuthProvider from './AuthProvider';
import LoginButton from './LoginButton';

interface Props {
  redirectUri: string;
  postLogoutRedirectUri: string;
}

export function NavbarAuth({ redirectUri, postLogoutRedirectUri }: Props) {
  return (
    <AuthProvider redirectUri={redirectUri} postLogoutRedirectUri={postLogoutRedirectUri}>
      <LoginButton />
    </AuthProvider>
  );
}
```

Create `src/components/CallbackHandler.tsx`:

```tsx
import React from 'react';
import { ScalekitAuthProvider, ScalekitCallback } from '@scalekit/react-sdk';

interface Props {
  redirectUri: string;
  postLogoutRedirectUri: string;
}

export default function CallbackHandler({ redirectUri, postLogoutRedirectUri }: Props) {
  return (
    <ScalekitAuthProvider
      environmentUrl="https://your-tenant.scalekit.cloud"
      clientId="your-client-id"
      redirectUri={redirectUri}
      postLogoutRedirectUri={postLogoutRedirectUri}
    >
      <ScalekitCallback
        onSuccess={() => {
          window.location.replace('/');
        }}
        onError={(error) => {
          console.error('Auth error:', error);
          window.location.replace('/?error=auth_failed');
        }}
        loadingComponent={
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Completing sign in...</p>
          </div>
        }
      />
    </ScalekitAuthProvider>
  );
}
```

#### 4. Use in Astro pages

In your layout or page (`src/layouts/Layout.astro`):

```astro
---
import { NavbarAuth } from '../components/AuthenticatedApp';

const baseUrl = Astro.url.origin;
const redirectUri = `${baseUrl}/callback`;
const postLogoutRedirectUri = baseUrl;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My Astro Site</title>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/dashboard">Dashboard</a>
      <!-- client:only ensures this only runs in the browser -->
      <NavbarAuth
        client:only="react"
        redirectUri={redirectUri}
        postLogoutRedirectUri={postLogoutRedirectUri}
      />
    </nav>
    <main>
      <slot />
    </main>
  </body>
</html>
```

#### 5. Create the Callback page

Create `src/pages/callback.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import CallbackHandler from '../components/CallbackHandler';

const baseUrl = Astro.url.origin;
const redirectUri = `${baseUrl}/callback`;
const postLogoutRedirectUri = baseUrl;
---

<Layout title="Authenticating...">
  <div style="display: flex; justify-content: center; align-items: center; min-height: 50vh;">
    <CallbackHandler
      client:only="react"
      redirectUri={redirectUri}
      postLogoutRedirectUri={postLogoutRedirectUri}
    />
  </div>
</Layout>
```

#### 6. Create a Protected Page

Create `src/components/ProtectedContent.tsx`:

```tsx
import React from 'react';
import { ScalekitAuthProvider, useScalekitAuth } from '@scalekit/react-sdk';

interface Props {
  redirectUri: string;
  postLogoutRedirectUri: string;
  children: React.ReactNode;
}

function ProtectedContentInner({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, loginWithRedirect } = useScalekitAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login
    loginWithRedirect({ returnTo: window.location.pathname });
    return <div>Redirecting to login...</div>;
  }

  return <>{children}</>;
}

export default function ProtectedContent({ redirectUri, postLogoutRedirectUri, children }: Props) {
  return (
    <ScalekitAuthProvider
      environmentUrl="https://your-tenant.scalekit.cloud"
      clientId="your-client-id"
      redirectUri={redirectUri}
      postLogoutRedirectUri={postLogoutRedirectUri}
    >
      <ProtectedContentInner>{children}</ProtectedContentInner>
    </ScalekitAuthProvider>
  );
}
```

Use in a protected page (`src/pages/dashboard.astro`):

```astro
---
import Layout from '../layouts/Layout.astro';
import ProtectedContent from '../components/ProtectedContent';
import Dashboard from '../components/Dashboard';

const baseUrl = Astro.url.origin;
---

<Layout title="Dashboard">
  <ProtectedContent
    client:only="react"
    redirectUri={`${baseUrl}/callback`}
    postLogoutRedirectUri={baseUrl}
  >
    <Dashboard client:only="react" />
  </ProtectedContent>
</Layout>
```

#### Important Notes for Astro

- Always use `client:only="react"` for auth components (not `client:load` or `client:visible`) since they require browser APIs
- Pass URLs as props since `Astro.url` is only available at build time on the server
- Each React island needs its own provider wrapper, or use a shared state solution

---

## Configuration in Scalekit Dashboard

1. Register your redirect URI (`http://localhost:5173/callback` for development)
2. Register your post-logout redirect URI (`http://localhost:5173` for development)
3. Note your Client ID and Environment URL (e.g., `https://your-tenant.scalekit.cloud`)

## Browser Support

This SDK supports all modern browsers that support the Web Crypto API (required for PKCE).

## License

MIT
