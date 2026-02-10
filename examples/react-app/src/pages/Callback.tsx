import { useNavigate } from 'react-router-dom';
import { ScalekitCallback } from '@scalekit-sdk/react';

function Callback() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <ScalekitCallback
        onSuccess={() => {
          navigate('/dashboard');
        }}
        onError={(error) => {
          console.error('Callback error:', error);
          navigate('/?error=auth_failed');
        }}
        loadingComponent={
          <div style={styles.card}>
            <div style={styles.spinner}></div>
            <p style={styles.text}>Completing sign in...</p>
          </div>
        }
        errorComponent={(error) => (
          <div style={styles.card}>
            <div style={styles.errorIcon}>!</div>
            <p style={styles.errorTitle}>Authentication Failed</p>
            <p style={styles.errorMessage}>{error.message}</p>
            <button style={styles.button} onClick={() => navigate('/')}>
              Return Home
            </button>
          </div>
        )}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4F46E5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  text: {
    color: '#666',
    fontSize: '16px',
  },
  errorIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#FEE2E2',
    color: '#DC2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 auto 16px',
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: '8px',
  },
  errorMessage: {
    color: '#666',
    marginBottom: '24px',
  },
  button: {
    background: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default Callback;
