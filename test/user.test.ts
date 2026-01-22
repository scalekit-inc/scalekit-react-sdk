import { describe, it, expect } from 'vitest';
import { mapOidcUserToScalekitUser } from '../src/types/user';

describe('mapOidcUserToScalekitUser', () => {
  it('should map basic OIDC user to Scalekit user', () => {
    const oidcUser = {
      profile: {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
      id_token: 'mock-id-token',
      access_token: 'mock-access-token',
      expires_at: 1700000000,
      refresh_token: 'mock-refresh-token',
      scope: 'openid profile email',
    };

    const result = mapOidcUserToScalekitUser(oidcUser);

    expect(result.profile.sub).toBe('user-123');
    expect(result.profile.email).toBe('test@example.com');
    expect(result.profile.name).toBe('Test User');
    expect(result.idToken).toBe('mock-id-token');
    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(result.scopes).toEqual(['openid', 'profile', 'email']);
  });

  it('should extract Scalekit metadata from claims', () => {
    const oidcUser = {
      profile: {
        sub: 'user-123',
        org_id: 'org-456',
        connection_id: 'conn-789',
        idp: 'okta',
        roles: ['admin', 'user'],
        groups: ['engineering'],
      },
      access_token: 'mock-access-token',
      scope: 'openid',
    };

    const result = mapOidcUserToScalekitUser(oidcUser);

    expect(result.metadata.organizationId).toBe('org-456');
    expect(result.metadata.connectionId).toBe('conn-789');
    expect(result.metadata.identityProvider).toBe('okta');
    expect(result.metadata.roles).toEqual(['admin', 'user']);
    expect(result.metadata.groups).toEqual(['engineering']);
  });

  it('should handle missing optional fields', () => {
    const oidcUser = {
      profile: {
        sub: 'user-123',
      },
      access_token: 'mock-access-token',
    };

    const result = mapOidcUserToScalekitUser(oidcUser);

    expect(result.idToken).toBe('');
    expect(result.refreshToken).toBeUndefined();
    expect(result.expiresAt).toBeUndefined();
    expect(result.scopes).toEqual([]);
  });

  it('should convert expires_at to Date', () => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const oidcUser = {
      profile: { sub: 'user-123' },
      access_token: 'mock-access-token',
      expires_at: expiresAt,
    };

    const result = mapOidcUserToScalekitUser(oidcUser);

    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.expiresAt?.getTime()).toBe(expiresAt * 1000);
  });
});
