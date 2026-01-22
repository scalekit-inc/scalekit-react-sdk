import { useContext } from 'react';
import { ScalekitAuthContext, ScalekitAuthContextValue } from './ScalekitAuthContext';

/**
 * Hook to access Scalekit authentication state and methods.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     isLoading,
 *     isAuthenticated,
 *     user,
 *     error,
 *     loginWithRedirect,
 *     logout,
 *   } = useScalekitAuth();
 *
 *   if (isLoading) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   if (error) {
 *     return <div>Error: {error.message}</div>;
 *   }
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => loginWithRedirect()}>Log in</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Hello, {user?.profile.name}</p>
 *       <button onClick={() => logout()}>Log out</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns The authentication context value containing state and methods
 */
export function useScalekitAuth(): ScalekitAuthContextValue {
  const context = useContext(ScalekitAuthContext);

  if (!context) {
    throw new Error(
      'useScalekitAuth must be used within a ScalekitAuthProvider. ' +
        'Wrap your application with <ScalekitAuthProvider> to use this hook.'
    );
  }

  return context;
}
