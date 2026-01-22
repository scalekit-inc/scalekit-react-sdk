import { createContext } from 'react';
import { UserManager } from 'oidc-client-ts';
import {
  ScalekitUser,
  LoginWithRedirectOptions,
  LoginWithPopupOptions,
  LogoutOptions,
  GetAccessTokenOptions,
} from './types';

/**
 * Methods available on the auth context
 */
export interface ScalekitAuthContextMethods {
  /**
   * Initiates login by redirecting to the authorization server
   */
  loginWithRedirect: (options?: LoginWithRedirectOptions) => Promise<void>;

  /**
   * Initiates login in a popup window
   */
  loginWithPopup: (options?: LoginWithPopupOptions) => Promise<ScalekitUser>;

  /**
   * Logs the user out
   */
  logout: (options?: LogoutOptions) => Promise<void>;

  /**
   * Gets the current access token, refreshing if necessary
   */
  getAccessToken: (options?: GetAccessTokenOptions) => Promise<string>;

  /**
   * Silently refreshes the access token
   */
  refreshToken: () => Promise<ScalekitUser | null>;

  /**
   * Handles the redirect callback (usually called automatically)
   */
  handleRedirectCallback: () => Promise<ScalekitUser>;
}

/**
 * Complete auth context value
 */
export interface ScalekitAuthContextValue extends ScalekitAuthContextMethods {
  /** Whether the SDK is still initializing */
  isLoading: boolean;

  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** The authenticated user, if any */
  user: ScalekitUser | null;

  /** Any error that occurred during authentication */
  error: Error | null;

  /**
   * The underlying UserManager instance (for advanced use cases)
   */
  userManager: UserManager | null;
}

/**
 * Default context value (throws if used outside provider)
 */
const defaultContextValue: ScalekitAuthContextValue = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  error: null,
  userManager: null,
  loginWithRedirect: () => {
    throw new Error('ScalekitAuthProvider not initialized');
  },
  loginWithPopup: () => {
    throw new Error('ScalekitAuthProvider not initialized');
  },
  logout: () => {
    throw new Error('ScalekitAuthProvider not initialized');
  },
  getAccessToken: () => {
    throw new Error('ScalekitAuthProvider not initialized');
  },
  refreshToken: () => {
    throw new Error('ScalekitAuthProvider not initialized');
  },
  handleRedirectCallback: () => {
    throw new Error('ScalekitAuthProvider not initialized');
  },
};

/**
 * React context for Scalekit authentication
 */
export const ScalekitAuthContext = createContext<ScalekitAuthContextValue>(defaultContextValue);

ScalekitAuthContext.displayName = 'ScalekitAuthContext';
