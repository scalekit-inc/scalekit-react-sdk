import React, { useEffect, useState } from 'react';
import { useScalekitAuth } from './useScalekitAuth';
import { hasAuthParams, hasAuthError, getAuthError } from './utils/auth-params';
import { CallbackError } from './types';

/**
 * Props for the ScalekitCallback component
 */
export interface ScalekitCallbackProps {
  /** Called when authentication succeeds */
  onSuccess?: () => void;

  /** Called when authentication fails */
  onError?: (error: Error) => void;

  /** Component to render while processing the callback */
  loadingComponent?: React.ReactNode;

  /** Component to render when an error occurs */
  errorComponent?: React.ReactNode | ((error: Error) => React.ReactNode);
}

/**
 * Default loading component
 */
const DefaultLoading = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <p>Processing authentication...</p>
  </div>
);

/**
 * Default error component
 */
const DefaultError = ({ error }: { error: Error }) => (
  <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
    <p>Authentication failed</p>
    <p style={{ fontSize: '0.875rem' }}>{error.message}</p>
  </div>
);

/**
 * Component to handle the OIDC redirect callback.
 *
 * Place this component at your callback route (e.g., /callback).
 * It will automatically process the authentication response and call
 * the appropriate callbacks.
 *
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="/callback" element={
 *   <ScalekitCallback
 *     onSuccess={() => navigate('/dashboard')}
 *     onError={(error) => {
 *       console.error(error);
 *       navigate('/login?error=auth_failed');
 *     }}
 *   />
 * } />
 * ```
 */
export function ScalekitCallback({
  onSuccess,
  onError,
  loadingComponent,
  errorComponent,
}: ScalekitCallbackProps) {
  const { handleRedirectCallback, isLoading } = useScalekitAuth();
  const [error, setError] = useState<Error | null>(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      // Skip if already processed or still loading provider
      if (processed || isLoading) {
        return;
      }

      // Check for auth error in URL
      if (hasAuthError()) {
        const authError = getAuthError();
        const error = new CallbackError(
          authError?.description || authError?.error || 'Authentication failed'
        );
        setError(error);
        setProcessed(true);
        onError?.(error);
        return;
      }

      // Check for auth params
      if (!hasAuthParams()) {
        const error = new CallbackError(
          'No authentication parameters found in URL. ' +
            'This page should only be accessed after authentication redirect.'
        );
        setError(error);
        setProcessed(true);
        onError?.(error);
        return;
      }

      try {
        await handleRedirectCallback();
        setProcessed(true);
        onSuccess?.();
      } catch (err) {
        const callbackError =
          err instanceof Error ? err : new CallbackError('Unknown error during callback');
        setError(callbackError);
        setProcessed(true);
        onError?.(callbackError);
      }
    };

    processCallback();
  }, [handleRedirectCallback, isLoading, processed, onSuccess, onError]);

  // Show error state
  if (error) {
    if (typeof errorComponent === 'function') {
      return <>{errorComponent(error)}</>;
    }
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    return <DefaultError error={error} />;
  }

  // Show loading state
  if (loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return <DefaultLoading />;
}
