// Provider
export { ScalekitAuthProvider } from './ScalekitAuthProvider';

// Context (for advanced use cases)
export { ScalekitAuthContext } from './ScalekitAuthContext';
export type {
  ScalekitAuthContextValue,
  ScalekitAuthContextMethods,
} from './ScalekitAuthContext';

// Hooks
export { useScalekitAuth } from './useScalekitAuth';
export { useAccessToken } from './useAccessToken';
export type { UseAccessTokenResult } from './useAccessToken';

// Components
export { ScalekitCallback } from './ScalekitCallback';
export type { ScalekitCallbackProps } from './ScalekitCallback';
export { withAuthenticationRequired } from './withAuthenticationRequired';
export type { WithAuthenticationRequiredOptions } from './withAuthenticationRequired';

// Types - Config
export type {
  StorageType,
  ScalekitAuthConfig,
  ScalekitAuthProviderProps,
  LoginWithRedirectOptions,
  LoginWithPopupOptions,
  LogoutOptions,
  GetAccessTokenOptions,
  AppState,
  OnRedirectCallback,
} from './types';

// Types - User
export type {
  ScalekitUser,
  ScalekitUserProfile,
  ScalekitUserMetadata,
} from './types';

// Types - Auth State
export type {
  AuthState,
  InitializingState,
  UnauthenticatedState,
  AuthenticatedState,
  ErrorState,
} from './types';

// Error classes
export {
  ScalekitAuthError,
  LoginError,
  TokenRefreshError,
  LogoutError,
  ConfigurationError,
  CallbackError,
  NotInitializedError,
  NotAuthenticatedError,
} from './types';
