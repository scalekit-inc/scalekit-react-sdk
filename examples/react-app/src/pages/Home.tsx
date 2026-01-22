import { useScalekitAuth } from '@scalekit/react-sdk';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } = useScalekitAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    loginWithRedirect({
      returnTo: '/dashboard',
    });
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Scalekit React SDK</h1>
        <p style={styles.subtitle}>Example Application</p>

        {isAuthenticated && user ? (
          <div style={styles.userInfo}>
            <p style={styles.greeting}>Welcome, {user.profile.name || user.profile.email}!</p>
            <div style={styles.buttonGroup}>
              <button style={styles.button} onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
              <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.loginSection}>
            <p style={styles.description}>
              Click the button below to sign in with Scalekit.
            </p>
            <button style={styles.button} onClick={handleLogin}>
              Sign in with Scalekit
            </button>
          </div>
        )}
      </div>
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
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '32px',
  },
  description: {
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
    width: '100%',
    marginBottom: '12px',
  },
  secondaryButton: {
    background: 'white',
    color: '#4F46E5',
    border: '2px solid #4F46E5',
  },
  userInfo: {
    textAlign: 'center',
  },
  greeting: {
    fontSize: '18px',
    marginBottom: '24px',
    color: '#333',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  loginSection: {},
};

export default Home;
