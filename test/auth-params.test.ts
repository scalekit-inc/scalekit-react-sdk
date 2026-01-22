import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasAuthParams,
  hasAuthError,
  getAuthError,
  cleanupAuthParams,
  buildScalekitParams,
} from '../src/utils/auth-params';

describe('auth-params', () => {
  beforeEach(() => {
    // Reset window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:5173',
        search: '',
        pathname: '/',
      },
      writable: true,
    });

    // Mock history.replaceState
    window.history.replaceState = vi.fn();
  });

  describe('hasAuthParams', () => {
    it('should return true when code parameter is present', () => {
      expect(hasAuthParams('?code=abc123')).toBe(true);
    });

    it('should return true when error parameter is present', () => {
      expect(hasAuthParams('?error=access_denied')).toBe(true);
    });

    it('should return false when no auth parameters are present', () => {
      expect(hasAuthParams('?other=param')).toBe(false);
    });

    it('should return false for empty search string', () => {
      expect(hasAuthParams('')).toBe(false);
    });
  });

  describe('hasAuthError', () => {
    it('should return true when error parameter is present', () => {
      expect(hasAuthError('?error=access_denied')).toBe(true);
    });

    it('should return false when no error parameter', () => {
      expect(hasAuthError('?code=abc123')).toBe(false);
    });
  });

  describe('getAuthError', () => {
    it('should return error details when present', () => {
      const result = getAuthError(
        '?error=access_denied&error_description=User%20denied%20access'
      );
      expect(result).toEqual({
        error: 'access_denied',
        description: 'User denied access',
      });
    });

    it('should return null when no error', () => {
      expect(getAuthError('?code=abc123')).toBeNull();
    });

    it('should return error without description if not present', () => {
      const result = getAuthError('?error=server_error');
      expect(result).toEqual({
        error: 'server_error',
        description: undefined,
      });
    });
  });

  describe('buildScalekitParams', () => {
    it('should build params with organizationId', () => {
      const params = buildScalekitParams({ organizationId: 'org-123' });
      expect(params).toEqual({ organization_id: 'org-123' });
    });

    it('should build params with connectionId', () => {
      const params = buildScalekitParams({ connectionId: 'conn-123' });
      expect(params).toEqual({ connection_id: 'conn-123' });
    });

    it('should build params with loginHint', () => {
      const params = buildScalekitParams({ loginHint: 'user@example.com' });
      expect(params).toEqual({ login_hint: 'user@example.com' });
    });

    it('should merge extraQueryParams', () => {
      const params = buildScalekitParams({
        organizationId: 'org-123',
        extraQueryParams: { custom: 'value' },
      });
      expect(params).toEqual({
        organization_id: 'org-123',
        custom: 'value',
      });
    });

    it('should return empty object when no options', () => {
      const params = buildScalekitParams({});
      expect(params).toEqual({});
    });
  });

  describe('cleanupAuthParams', () => {
    it('should remove OIDC parameters from URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:5173/callback?code=abc123&state=xyz',
          search: '?code=abc123&state=xyz',
          pathname: '/callback',
        },
        writable: true,
      });

      cleanupAuthParams();

      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should not modify URL when no auth params present', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:5173/dashboard',
          search: '',
          pathname: '/dashboard',
        },
        writable: true,
      });

      cleanupAuthParams();

      expect(window.history.replaceState).not.toHaveBeenCalled();
    });
  });
});
