import { ReactNode } from 'react';
import { useScalekitAuth } from '@scalekit/react-sdk';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, loginWithRedirect } = useScalekitAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Trigger login with current URL as return path
    loginWithRedirect({
      returnTo: location.pathname + location.search,
    });

    return (
      <div style={styles.container}>
        <p style={styles.text}>Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4F46E5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: '#666',
    fontSize: '16px',
  },
};

export default ProtectedRoute;
