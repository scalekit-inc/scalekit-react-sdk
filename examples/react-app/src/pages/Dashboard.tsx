import { useScalekitAuth, useAccessToken } from '@scalekit-sdk/react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useScalekitAuth();
  const { accessToken, isLoading: tokenLoading, refresh } = useAccessToken();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h2 style={styles.logo}>Scalekit Demo</h2>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Log out
        </button>
      </nav>

      <main style={styles.main}>
        <h1 style={styles.title}>Dashboard</h1>

        <div style={styles.grid}>
          {/* User Profile Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>User Profile</h3>
            <div style={styles.profileInfo}>
              {user.profile.picture && (
                <img
                  src={user.profile.picture}
                  alt="Profile"
                  style={styles.avatar}
                />
              )}
              <div style={styles.profileDetails}>
                <p style={styles.name}>{user.profile.name || 'N/A'}</p>
                <p style={styles.email}>{user.profile.email}</p>
                {user.profile.email_verified && (
                  <span style={styles.verifiedBadge}>Email Verified</span>
                )}
              </div>
            </div>
          </div>

          {/* Organization Info Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Organization</h3>
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <span style={styles.label}>Organization ID:</span>
                <span style={styles.value}>
                  {user.metadata.organizationId || 'N/A'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.label}>Connection ID:</span>
                <span style={styles.value}>
                  {user.metadata.connectionId || 'N/A'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.label}>Identity Provider:</span>
                <span style={styles.value}>
                  {user.metadata.identityProvider || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Token Info Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Access Token</h3>
            <div style={styles.tokenSection}>
              {tokenLoading ? (
                <p>Loading token...</p>
              ) : (
                <>
                  <div style={styles.tokenPreview}>
                    <code style={styles.tokenCode}>
                      {accessToken
                        ? `${accessToken.substring(0, 30)}...`
                        : 'No token'}
                    </code>
                  </div>
                  <div style={styles.tokenMeta}>
                    {user.expiresAt && (
                      <p style={styles.expiresAt}>
                        Expires: {user.expiresAt.toLocaleString()}
                      </p>
                    )}
                    <button style={styles.refreshButton} onClick={refresh}>
                      Refresh Token
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scopes Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Granted Scopes</h3>
            <div style={styles.scopesList}>
              {user.scopes.map((scope) => (
                <span key={scope} style={styles.scopeBadge}>
                  {scope}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  logoutButton: {
    background: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#1a1a1a',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  email: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  verifiedBadge: {
    display: 'inline-block',
    background: '#DEF7EC',
    color: '#03543F',
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '14px',
    color: '#666',
  },
  value: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
    fontFamily: 'monospace',
  },
  tokenSection: {},
  tokenPreview: {
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  tokenCode: {
    fontSize: '12px',
    color: '#666',
    wordBreak: 'break-all',
  },
  tokenMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiresAt: {
    fontSize: '12px',
    color: '#666',
  },
  refreshButton: {
    background: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  scopesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  scopeBadge: {
    background: '#EEF2FF',
    color: '#4F46E5',
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '9999px',
  },
};

export default Dashboard;
