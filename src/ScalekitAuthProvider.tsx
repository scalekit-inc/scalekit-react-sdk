import React, {
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { User, UserManager } from 'oidc-client-ts';
import { ScalekitAuthContext, ScalekitAuthContextValue } from './ScalekitAuthContext';
import {
  ScalekitAuthProviderProps,
  ScalekitUser,
  LoginWithRedirectOptions,
  LoginWithPopupOptions,
  LogoutOptions,
  GetAccessTokenOptions,
  authReducer,
  initialAuthState,
  mapOidcUserToScalekitUser,
  LoginError,
  LogoutError,
  TokenRefreshError,
  CallbackError,
  NotAuthenticatedError,
} from './types';
import { createUserManager } from './utils/user-manager-factory';
import {
  hasAuthParams,
  cleanupAuthParams,
  buildScalekitParams,
} from './utils/auth-params';
import { DEFAULT_POPUP_CONFIG } from './constants';

/**
 * ScalekitAuthProvider component that wraps your application and provides
 * authentication context to all child components.
 */
export function ScalekitAuthProvider({
  children,
  onRedirectCallback,
  onError,
  autoHandleCallback = true,
  ...config
}: ScalekitAuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const userManagerRef = useRef<UserManager | null>(null);
  const initializingRef = useRef(false);

  // Create UserManager on mount
  useEffect(() => {
    if (!userManagerRef.current) {
      userManagerRef.current = createUserManager(config);
    }
  }, [config.environmentUrl, config.clientId, config.redirectUri]);

  // Handle redirect callback
  const handleRedirectCallback = useCallback(async (): Promise<ScalekitUser> => {
    const userManager = userManagerRef.current;
    if (!userManager) {
      throw new CallbackError('UserManager not initialized');
    }

    try {
      const oidcUser = await userManager.signinRedirectCallback();
      const scalekitUser = mapOidcUserToScalekitUser(oidcUser);

      dispatch({ type: 'LOGIN_COMPLETED', user: scalekitUser });
      cleanupAuthParams();

      return scalekitUser;
    } catch (error) {
      const callbackError = new CallbackError(
        'Failed to process authentication callback',
        error instanceof Error ? error : undefined
      );
      dispatch({ type: 'ERROR', error: callbackError });
      throw callbackError;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      if (initializingRef.current) {
        return;
      }
      initializingRef.current = true;

      const userManager = userManagerRef.current;
      if (!userManager) {
        return;
      }

      try {
        // Check if we're handling a redirect callback
        if (autoHandleCallback && hasAuthParams()) {
          const user = await handleRedirectCallback();
          onRedirectCallback?.({
            user,
            appState: undefined, // TODO: Extract from state parameter
          });
          return;
        }

        // Check for existing session
        const oidcUser = await userManager.getUser();
        if (oidcUser && !oidcUser.expired) {
          const scalekitUser = mapOidcUserToScalekitUser(oidcUser);
          dispatch({ type: 'INITIALIZED', user: scalekitUser });
        } else {
          dispatch({ type: 'INITIALIZED', user: null });
        }
      } catch (error) {
        const initError = error instanceof Error ? error : new Error('Initialization failed');
        dispatch({ type: 'ERROR', error: initError });
        onError?.(initError);
      }
    };

    initialize();
  }, [autoHandleCallback, handleRedirectCallback, onRedirectCallback, onError]);

  // Set up UserManager event listeners
  useEffect(() => {
    const userManager = userManagerRef.current;
    if (!userManager) {
      return;
    }

    const handleUserLoaded = (oidcUser: User) => {
      const scalekitUser = mapOidcUserToScalekitUser(oidcUser);
      dispatch({ type: 'TOKEN_REFRESHED', user: scalekitUser });
    };

    const handleUserUnloaded = () => {
      dispatch({ type: 'LOGOUT_COMPLETED' });
    };

    const handleSilentRenewError = (error: Error) => {
      const refreshError = new TokenRefreshError('Silent token renewal failed', error);
      dispatch({ type: 'ERROR', error: refreshError });
      onError?.(refreshError);
    };

    const handleAccessTokenExpiring = () => {
      // Token is about to expire, oidc-client-ts will automatically renew it
      // This is just a notification hook if needed
    };

    const handleAccessTokenExpired = () => {
      // Token has expired and could not be renewed
      dispatch({ type: 'LOGOUT_COMPLETED' });
    };

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addSilentRenewError(handleSilentRenewError);
    userManager.events.addAccessTokenExpiring(handleAccessTokenExpiring);
    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
      userManager.events.removeAccessTokenExpiring(handleAccessTokenExpiring);
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
    };
  }, [onError]);

  // Login with redirect
  const loginWithRedirect = useCallback(
    async (options: LoginWithRedirectOptions = {}): Promise<void> => {
      const userManager = userManagerRef.current;
      if (!userManager) {
        throw new LoginError('UserManager not initialized');
      }

      try {
        dispatch({ type: 'LOGIN_STARTED' });

        const extraQueryParams = buildScalekitParams(options);

        await userManager.signinRedirect({
          state: options.returnTo ? { returnTo: options.returnTo } : undefined,
          extraQueryParams:
            Object.keys(extraQueryParams).length > 0 ? extraQueryParams : undefined,
        });
      } catch (error) {
        const loginError = new LoginError(
          'Failed to initiate login',
          error instanceof Error ? error : undefined
        );
        dispatch({ type: 'ERROR', error: loginError });
        throw loginError;
      }
    },
    []
  );

  // Login with popup
  const loginWithPopup = useCallback(
    async (options: LoginWithPopupOptions = {}): Promise<ScalekitUser> => {
      const userManager = userManagerRef.current;
      if (!userManager) {
        throw new LoginError('UserManager not initialized');
      }

      try {
        dispatch({ type: 'LOGIN_STARTED' });

        const extraQueryParams = buildScalekitParams(options);
        const popupWidth = options.popupWidth ?? DEFAULT_POPUP_CONFIG.WIDTH;
        const popupHeight = options.popupHeight ?? DEFAULT_POPUP_CONFIG.HEIGHT;

        const oidcUser = await userManager.signinPopup({
          popupWindowFeatures: {
            width: popupWidth,
            height: popupHeight,
          },
          extraQueryParams:
            Object.keys(extraQueryParams).length > 0 ? extraQueryParams : undefined,
        });

        const scalekitUser = mapOidcUserToScalekitUser(oidcUser);
        dispatch({ type: 'LOGIN_COMPLETED', user: scalekitUser });

        return scalekitUser;
      } catch (error) {
        const loginError = new LoginError(
          'Popup login failed',
          error instanceof Error ? error : undefined
        );
        dispatch({ type: 'ERROR', error: loginError });
        throw loginError;
      }
    },
    []
  );

  // Logout
  const logout = useCallback(
    async (options: LogoutOptions = {}): Promise<void> => {
      const userManager = userManagerRef.current;
      if (!userManager) {
        throw new LogoutError('UserManager not initialized');
      }

      try {
        await userManager.signoutRedirect({
          post_logout_redirect_uri: options.postLogoutRedirectUri,
          state: options.state,
        });
      } catch (error) {
        const logoutError = new LogoutError(
          'Logout failed',
          error instanceof Error ? error : undefined
        );
        dispatch({ type: 'ERROR', error: logoutError });
        throw logoutError;
      }
    },
    []
  );

  // Get access token
  const getAccessToken = useCallback(
    async (options: GetAccessTokenOptions = {}): Promise<string> => {
      const userManager = userManagerRef.current;
      if (!userManager) {
        throw new NotAuthenticatedError('UserManager not initialized');
      }

      try {
        let oidcUser = await userManager.getUser();

        if (!oidcUser) {
          throw new NotAuthenticatedError();
        }

        // Force refresh if requested or if token is expired
        if (options.forceRefresh || oidcUser.expired) {
          oidcUser = await userManager.signinSilent();
          if (!oidcUser) {
            throw new TokenRefreshError('Silent refresh returned no user');
          }
        }

        return oidcUser.access_token;
      } catch (error) {
        if (error instanceof NotAuthenticatedError) {
          throw error;
        }
        throw new TokenRefreshError(
          'Failed to get access token',
          error instanceof Error ? error : undefined
        );
      }
    },
    []
  );

  // Refresh token
  const refreshToken = useCallback(async (): Promise<ScalekitUser | null> => {
    const userManager = userManagerRef.current;
    if (!userManager) {
      return null;
    }

    try {
      const oidcUser = await userManager.signinSilent();
      if (oidcUser) {
        const scalekitUser = mapOidcUserToScalekitUser(oidcUser);
        dispatch({ type: 'TOKEN_REFRESHED', user: scalekitUser });
        return scalekitUser;
      }
      return null;
    } catch (error) {
      const refreshError = new TokenRefreshError(
        'Token refresh failed',
        error instanceof Error ? error : undefined
      );
      dispatch({ type: 'ERROR', error: refreshError });
      throw refreshError;
    }
  }, []);

  // Memoize context value
  const contextValue = useMemo<ScalekitAuthContextValue>(
    () => ({
      ...state,
      userManager: userManagerRef.current,
      loginWithRedirect,
      loginWithPopup,
      logout,
      getAccessToken,
      refreshToken,
      handleRedirectCallback,
    }),
    [
      state,
      loginWithRedirect,
      loginWithPopup,
      logout,
      getAccessToken,
      refreshToken,
      handleRedirectCallback,
    ]
  );

  return (
    <ScalekitAuthContext.Provider value={contextValue}>
      {children}
    </ScalekitAuthContext.Provider>
  );
}
