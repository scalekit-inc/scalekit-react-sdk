import { describe, it, expect } from 'vitest';
import { authReducer, initialAuthState } from '../src/types/auth-state';
import { ScalekitUser } from '../src/types/user';

const mockUser: ScalekitUser = {
  profile: {
    sub: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
  metadata: {},
  idToken: 'mock-id-token',
  accessToken: 'mock-access-token',
  scopes: ['openid', 'profile', 'email'],
};

describe('authReducer', () => {
  it('should return initial state', () => {
    expect(initialAuthState).toEqual({
      isLoading: true,
      isAuthenticated: false,
      user: null,
      error: null,
    });
  });

  it('should handle INITIALIZING action', () => {
    const state = authReducer(initialAuthState, { type: 'INITIALIZING' });
    expect(state).toEqual({
      isLoading: true,
      isAuthenticated: false,
      user: null,
      error: null,
    });
  });

  it('should handle INITIALIZED action with user', () => {
    const state = authReducer(initialAuthState, {
      type: 'INITIALIZED',
      user: mockUser,
    });
    expect(state).toEqual({
      isLoading: false,
      isAuthenticated: true,
      user: mockUser,
      error: null,
    });
  });

  it('should handle INITIALIZED action without user', () => {
    const state = authReducer(initialAuthState, {
      type: 'INITIALIZED',
      user: null,
    });
    expect(state).toEqual({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: null,
    });
  });

  it('should handle LOGIN_STARTED action', () => {
    const state = authReducer(initialAuthState, { type: 'LOGIN_STARTED' });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle LOGIN_COMPLETED action', () => {
    const state = authReducer(initialAuthState, {
      type: 'LOGIN_COMPLETED',
      user: mockUser,
    });
    expect(state).toEqual({
      isLoading: false,
      isAuthenticated: true,
      user: mockUser,
      error: null,
    });
  });

  it('should handle LOGOUT_COMPLETED action', () => {
    const authenticatedState = authReducer(initialAuthState, {
      type: 'LOGIN_COMPLETED',
      user: mockUser,
    });

    const state = authReducer(authenticatedState, { type: 'LOGOUT_COMPLETED' });
    expect(state).toEqual({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: null,
    });
  });

  it('should handle TOKEN_REFRESHED action', () => {
    const updatedUser = { ...mockUser, accessToken: 'new-token' };
    const state = authReducer(initialAuthState, {
      type: 'TOKEN_REFRESHED',
      user: updatedUser,
    });
    expect(state).toEqual({
      isLoading: false,
      isAuthenticated: true,
      user: updatedUser,
      error: null,
    });
  });

  it('should handle ERROR action', () => {
    const error = new Error('Test error');
    const state = authReducer(initialAuthState, { type: 'ERROR', error });
    expect(state).toEqual({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error,
    });
  });
});
