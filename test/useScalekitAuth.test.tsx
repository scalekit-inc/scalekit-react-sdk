import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useScalekitAuth } from '../src/useScalekitAuth';
import { ScalekitAuthContext, ScalekitAuthContextValue } from '../src/ScalekitAuthContext';

describe('useScalekitAuth', () => {
  const mockContextValue: ScalekitAuthContextValue = {
    isLoading: false,
    isAuthenticated: true,
    user: {
      profile: { sub: 'user-123', email: 'test@example.com' },
      metadata: {},
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
      scopes: ['openid'],
    },
    error: null,
    userManager: null,
    loginWithRedirect: vi.fn(),
    loginWithPopup: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn(),
    refreshToken: vi.fn(),
    handleRedirectCallback: vi.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ScalekitAuthContext.Provider value={mockContextValue}>
      {children}
    </ScalekitAuthContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return context value when used within provider', () => {
    const { result } = renderHook(() => useScalekitAuth(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.profile.sub).toBe('user-123');
  });

  it('should provide auth methods', () => {
    const { result } = renderHook(() => useScalekitAuth(), { wrapper });

    expect(typeof result.current.loginWithRedirect).toBe('function');
    expect(typeof result.current.loginWithPopup).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.getAccessToken).toBe('function');
    expect(typeof result.current.refreshToken).toBe('function');
  });

  it('should return default context with throwing methods when used outside provider', () => {
    // When used outside provider, the default context is returned
    // The methods on the default context throw when called
    const { result } = renderHook(() => useScalekitAuth());

    // Default state values
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    // Methods should throw when called (synchronously)
    expect(() => result.current.loginWithRedirect()).toThrow(
      'ScalekitAuthProvider not initialized'
    );
  });
});
