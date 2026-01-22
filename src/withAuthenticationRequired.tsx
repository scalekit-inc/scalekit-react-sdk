import React, { useEffect, ComponentType } from 'react';
import { useScalekitAuth } from './useScalekitAuth';
import { LoginWithRedirectOptions } from './types';

/**
 * Options for the withAuthenticationRequired HOC
 */
export interface WithAuthenticationRequiredOptions {
  /** Component to show while checking authentication */
  loadingComponent?: React.ReactNode;

  /** URL to return to after authentication (defaults to current URL) */
  returnTo?: string;

  /** Scalekit organization ID */
  organizationId?: string;

  /** Specific IdP connection ID */
  connectionId?: string;

  /** Pre-fill email hint */
  loginHint?: string;

  /** Callback when redirecting to login */
  onRedirecting?: () => void;
}

/**
 * Default loading component
 */
const DefaultLoading = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <p>Loading...</p>
  </div>
);

/**
 * Higher-order component that requires authentication.
 *
 * Wrap any component with this HOC to ensure the user is authenticated
 * before rendering it. If the user is not authenticated, they will be
 * redirected to the login page.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const ProtectedDashboard = withAuthenticationRequired(Dashboard);
 *
 * // With options
 * const ProtectedSettings = withAuthenticationRequired(Settings, {
 *   loadingComponent: <CustomSpinner />,
 *   returnTo: '/settings',
 *   organizationId: 'org_123',
 * });
 *
 * // In router
 * <Route path="/dashboard" element={<ProtectedDashboard />} />
 * ```
 *
 * @param Component The component to protect
 * @param options Configuration options
 * @returns A wrapped component that requires authentication
 */
export function withAuthenticationRequired<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationRequiredOptions = {}
): ComponentType<P> {
  const {
    loadingComponent,
    returnTo,
    organizationId,
    connectionId,
    loginHint,
    onRedirecting,
  } = options;

  function WithAuthenticationRequired(props: P) {
    const { isLoading, isAuthenticated, loginWithRedirect } = useScalekitAuth();

    useEffect(() => {
      if (isLoading || isAuthenticated) {
        return;
      }

      const loginOptions: LoginWithRedirectOptions = {
        returnTo: returnTo ?? window.location.pathname + window.location.search,
        organizationId,
        connectionId,
        loginHint,
      };

      onRedirecting?.();
      loginWithRedirect(loginOptions);
    }, [isLoading, isAuthenticated, loginWithRedirect]);

    // Show loading while checking auth
    if (isLoading) {
      return loadingComponent ? <>{loadingComponent}</> : <DefaultLoading />;
    }

    // Show loading while redirecting
    if (!isAuthenticated) {
      return loadingComponent ? <>{loadingComponent}</> : <DefaultLoading />;
    }

    // User is authenticated, render the component
    return <Component {...props} />;
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithAuthenticationRequired.displayName = `WithAuthenticationRequired(${displayName})`;

  return WithAuthenticationRequired;
}
