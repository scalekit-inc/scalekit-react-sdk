import { vi } from 'vitest';

export const mockUser = {
  profile: {
    sub: 'user-123',
    email: 'user@example.com',
    email_verified: true,
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    org_id: 'org-123',
    connection_id: 'conn-123',
  },
  id_token: 'mock-id-token',
  access_token: 'mock-access-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh-token',
  scope: 'openid profile email offline_access',
  expired: false,
};

export const createMockUserManager = () => {
  const events = {
    addUserLoaded: vi.fn(),
    removeUserLoaded: vi.fn(),
    addUserUnloaded: vi.fn(),
    removeUserUnloaded: vi.fn(),
    addSilentRenewError: vi.fn(),
    removeSilentRenewError: vi.fn(),
    addAccessTokenExpiring: vi.fn(),
    removeAccessTokenExpiring: vi.fn(),
    addAccessTokenExpired: vi.fn(),
    removeAccessTokenExpired: vi.fn(),
  };

  return {
    getUser: vi.fn().mockResolvedValue(null),
    signinRedirect: vi.fn().mockResolvedValue(undefined),
    signinRedirectCallback: vi.fn().mockResolvedValue(mockUser),
    signinPopup: vi.fn().mockResolvedValue(mockUser),
    signinSilent: vi.fn().mockResolvedValue(mockUser),
    signoutRedirect: vi.fn().mockResolvedValue(undefined),
    removeUser: vi.fn().mockResolvedValue(undefined),
    events,
  };
};

export const mockUserManager = createMockUserManager();

export const UserManager = vi.fn(() => mockUserManager);
export const WebStorageStateStore = vi.fn();

vi.mock('oidc-client-ts', () => ({
  UserManager,
  WebStorageStateStore,
}));
