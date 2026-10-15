import ZaloKit from './NativeZaloKit';
import { Platform } from 'react-native';
import type { IUserProfile, IZaloAuthResponse } from './NativeZaloKit';

export type { IUserProfile, IZaloAuthResponse };

/** Login methods accepted by {@link login}. */
export const Constants = {
  /** Zalo app when it is available, otherwise web login. */
  AUTH_VIA_APP_OR_WEB: 'AUTH_VIA_APP_OR_WEB',
  /** Zalo app only. */
  AUTH_VIA_APP: 'AUTH_VIA_APP',
  /** Web login only. */
  AUTH_VIA_WEB: 'AUTH_VIA_WEB',
} as const;

/** One of the {@link Constants} values. */
export type LoginMethod = (typeof Constants)[keyof typeof Constants];

/**
 * Error codes raised by Zalo Kit itself, found on the `code` property of a
 * rejected promise. Errors coming from the Zalo SDK keep the numeric Zalo
 * error code as a string, e.g. `"-7008"`.
 *
 * @example
 * ```ts
 * try {
 *   await login();
 * } catch (e: any) {
 *   if (e.code === ErrorCodes.ZALO_NOT_INSTALLED) {
 *     // ask the user to install Zalo
 *   }
 * }
 * ```
 */
export const ErrorCodes = {
  /** Zalo app is not installed and web fallback is disabled. */
  ZALO_NOT_INSTALLED: 'ZALO_NOT_INSTALLED',
  /** Zalo app is installed but could not handle the login request. */
  ZALO_APP_INCOMPATIBLE: 'ZALO_APP_INCOMPATIBLE',
  /** No stored session. Call `login()` first. */
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  /** No foreground activity / view controller to start the login from. */
  NO_ACTIVITY: 'NO_ACTIVITY',
  /** A newer `login()` call, or `logout()`, replaced this one. */
  LOGIN_SUPERSEDED: 'LOGIN_SUPERSEDED',
  /** The native project is missing the Zalo app ID configuration. */
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  /** Zalo answered with an unexpected payload. */
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;

/** One of the {@link ErrorCodes} values. */
export type ZaloKitErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/** Options for {@link login}. */
export interface LoginOptions {
  /**
   * When the Zalo app is missing or cannot handle the request, continue with
   * web login instead of rejecting.
   *
   * Defaults to `true` for `AUTH_VIA_APP_OR_WEB` and `false` for
   * `AUTH_VIA_APP`. Ignored for `AUTH_VIA_WEB`.
   */
  fallbackToWeb?: boolean;
}

/** Options for {@link getAccessToken}. */
export interface GetAccessTokenOptions {
  /**
   * Refresh even if the stored access token has not expired yet.
   *
   * @defaultValue `false`
   */
  forceRefresh?: boolean;
}

/**
 * Signs the user in with Zalo and stores the resulting tokens on the device.
 *
 * Calling `login()` again while a login is in progress rejects the earlier
 * call with `LOGIN_SUPERSEDED`.
 *
 * @param authType - How to sign in. Defaults to `AUTH_VIA_APP_OR_WEB`.
 * @param options - See {@link LoginOptions}.
 * @returns The token pair of the new session.
 * @throws `ZALO_NOT_INSTALLED`, `ZALO_APP_INCOMPATIBLE`, `NO_ACTIVITY`,
 * `NOT_CONFIGURED`, `LOGIN_SUPERSEDED`, `INVALID_RESPONSE`, or a numeric Zalo
 * code such as `"-7008"` when the user cancels.
 *
 * @example
 * ```ts
 * const { accessToken, expiresAt } = await login(Constants.AUTH_VIA_APP_OR_WEB);
 *
 * // App only, but fall back to web if the Zalo app cannot be opened
 * await login(Constants.AUTH_VIA_APP, { fallbackToWeb: true });
 * ```
 */
export const login = (
  authType: LoginMethod = Constants.AUTH_VIA_APP_OR_WEB,
  options: LoginOptions = {}
): Promise<IZaloAuthResponse> => {
  const fallbackToWeb =
    options.fallbackToWeb ?? authType === Constants.AUTH_VIA_APP_OR_WEB;
  return ZaloKit.login(authType, fallbackToWeb);
};

/**
 * Ends the Zalo session and deletes the stored tokens. A `login()` that is
 * still in progress is rejected with `LOGIN_SUPERSEDED`.
 */
export const logout = (): void => ZaloKit.logout();

/**
 * Asks Zalo whether the stored session is still valid.
 *
 * @returns `true` when the stored refresh token is still valid, `false` when
 * there is no session or Zalo rejected it.
 * @throws A numeric Zalo code on network or server errors, so a flaky
 * connection is not mistaken for a logout. `NOT_CONFIGURED` when the Zalo App
 * ID is missing, or `INVALID_RESPONSE` when a refresh it waited for failed.
 */
export const isAuthenticated = (): Promise<boolean> =>
  ZaloKit.isAuthenticated();

/**
 * Returns a usable access token, refreshing it first when it expires within
 * 60 seconds.
 *
 * Zalo refresh tokens are single-use: the stored pair is replaced on refresh,
 * and concurrent calls share one refresh request.
 *
 * @param options - See {@link GetAccessTokenOptions}.
 * @throws `NOT_AUTHENTICATED` when there is no session, the numeric Zalo code
 * when the refresh fails (call `login()` again), `INVALID_RESPONSE` when Zalo
 * answers with an unexpected payload, or `NOT_CONFIGURED` when the Zalo App ID
 * is missing.
 *
 * @example
 * ```ts
 * const { accessToken } = await getAccessToken();
 * await fetch(`https://example.com/auth/zalo?token=${accessToken}`);
 * ```
 */
export const getAccessToken = (
  options: GetAccessTokenOptions = {}
): Promise<IZaloAuthResponse> =>
  ZaloKit.getAccessToken(options.forceRefresh ?? false);

/**
 * Always gets a new token pair from Zalo. Same as
 * `getAccessToken({ forceRefresh: true })`.
 */
export const refreshAccessToken = (): Promise<IZaloAuthResponse> =>
  ZaloKit.getAccessToken(true);

/**
 * Reads the profile of the signed-in user. The access token is refreshed
 * automatically when it has expired or Zalo reports it invalid.
 *
 * @throws `NOT_AUTHENTICATED` when there is no session, a numeric Zalo code,
 * `INVALID_RESPONSE` when the profile cannot be read, or `NOT_CONFIGURED` when
 * the Zalo App ID is missing.
 *
 * @example
 * ```ts
 * const { id, name, picture } = await getUserProfile();
 * ```
 */
export const getUserProfile = (): Promise<IUserProfile> =>
  ZaloKit.getUserProfile();

/**
 * Returns the hash key of the certificate that signed the running build,
 * computed the same way the Zalo SDK does. Register it on the Zalo Developer
 * Portal.
 *
 * Android only.
 *
 * @throws On iOS.
 */
export const getApplicationHashKey = (): string => {
  if (Platform.OS === 'android') {
    return ZaloKit.getApplicationHashKey();
  }

  throw new Error('This function is only supported on Android');
};
