import { useState, useEffect, useCallback } from 'react';
import { useScalekitAuth } from './useScalekitAuth';

/**
 * Return type for the useAccessToken hook
 */
export interface UseAccessTokenResult {
  /** The current access token, or null if not available */
  accessToken: string | null;

  /** Whether the token is being fetched */
  isLoading: boolean;

  /** Any error that occurred while fetching the token */
  error: Error | null;

  /** Manually refresh the token */
  refresh: () => Promise<void>;
}

/**
 * Hook to get and manage the current access token.
 *
 * This hook automatically fetches the access token when the user is authenticated
 * and provides a method to manually refresh it.
 *
 * @example
 * ```tsx
 * function ApiComponent() {
 *   const { accessToken, isLoading, error, refresh } = useAccessToken();
 *
 *   const callApi = async () => {
 *     if (!accessToken) return;
 *
 *     const response = await fetch('/api/data', {
 *       headers: {
 *         Authorization: `Bearer ${accessToken}`,
 *       },
 *     });
 *     // Handle response...
 *   };
 *
 *   if (isLoading) return <div>Loading token...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <button onClick={callApi}>Call API</button>
 *       <button onClick={refresh}>Refresh Token</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns Object containing the token, loading state, error, and refresh function
 */
export function useAccessToken(): UseAccessTokenResult {
  const { isAuthenticated, user, getAccessToken, isLoading: authLoading } = useScalekitAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch the access token when authenticated
  useEffect(() => {
    let mounted = true;

    const fetchToken = async () => {
      if (!isAuthenticated || authLoading) {
        if (!authLoading) {
          setIsLoading(false);
          setAccessToken(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        if (mounted) {
          setAccessToken(token);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to get access token'));
          setAccessToken(null);
          setIsLoading(false);
        }
      }
    };

    fetchToken();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authLoading, getAccessToken, user]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAccessToken({ forceRefresh: true });
      setAccessToken(token);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh access token'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessToken]);

  return {
    accessToken,
    isLoading: authLoading || isLoading,
    error,
    refresh,
  };
}
