import { describe, it, expect } from 'vitest';
import {
  ScalekitAuthError,
  LoginError,
  TokenRefreshError,
  LogoutError,
  ConfigurationError,
  CallbackError,
  NotInitializedError,
  NotAuthenticatedError,
} from '../src/types/errors';

describe('Error classes', () => {
  describe('ScalekitAuthError', () => {
    it('should create error with message and code', () => {
      const error = new ScalekitAuthError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('ScalekitAuthError');
    });

    it('should preserve cause error', () => {
      const cause = new Error('Original error');
      const error = new ScalekitAuthError('Wrapped error', 'WRAP_CODE', cause);
      expect(error.cause).toBe(cause);
    });
  });

  describe('LoginError', () => {
    it('should create login error', () => {
      const error = new LoginError('Login failed');
      expect(error.name).toBe('LoginError');
      expect(error.code).toBe('LOGIN_ERROR');
    });
  });

  describe('TokenRefreshError', () => {
    it('should create token refresh error', () => {
      const error = new TokenRefreshError('Token refresh failed');
      expect(error.name).toBe('TokenRefreshError');
      expect(error.code).toBe('TOKEN_REFRESH_ERROR');
    });
  });

  describe('LogoutError', () => {
    it('should create logout error', () => {
      const error = new LogoutError('Logout failed');
      expect(error.name).toBe('LogoutError');
      expect(error.code).toBe('LOGOUT_ERROR');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Invalid config');
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIGURATION_ERROR');
    });
  });

  describe('CallbackError', () => {
    it('should create callback error', () => {
      const error = new CallbackError('Callback failed');
      expect(error.name).toBe('CallbackError');
      expect(error.code).toBe('CALLBACK_ERROR');
    });
  });

  describe('NotInitializedError', () => {
    it('should create not initialized error with default message', () => {
      const error = new NotInitializedError();
      expect(error.name).toBe('NotInitializedError');
      expect(error.code).toBe('NOT_INITIALIZED_ERROR');
      expect(error.message).toContain('not initialized');
    });
  });

  describe('NotAuthenticatedError', () => {
    it('should create not authenticated error with default message', () => {
      const error = new NotAuthenticatedError();
      expect(error.name).toBe('NotAuthenticatedError');
      expect(error.code).toBe('NOT_AUTHENTICATED_ERROR');
      expect(error.message).toBe('User is not authenticated');
    });

    it('should accept custom message', () => {
      const error = new NotAuthenticatedError('Custom auth error');
      expect(error.message).toBe('Custom auth error');
    });
  });
});
