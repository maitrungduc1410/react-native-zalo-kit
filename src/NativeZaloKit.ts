import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Token pair returned by {@link login}, {@link getAccessToken} and
 * {@link refreshAccessToken}. Zalo Kit also stores it on the device, so most
 * apps never need to keep it themselves.
 */
export interface IZaloAuthResponse {
  /** Token to call Zalo APIs with. Short-lived (about 1 hour). */
  accessToken: string;
  /**
   * Token used to get a new access token. Single-use: every refresh returns a
   * new one, which Zalo Kit stores for you.
   */
  refreshToken: string;
  /**
   * Seconds until the access token expires, measured when this result was
   * produced. `0` when Zalo did not report an expiry.
   */
  expiresIn: number;
  /**
   * Unix timestamp (milliseconds) when the access token expires. `0` when
   * unknown.
   */
  expiresAt: number;
}

/** Basic profile of the signed-in Zalo user, returned by {@link getUserProfile}. */
export interface IUserProfile {
  /** Zalo user ID, scoped to your Zalo app. */
  id: string;
  /** Display name. */
  name: string;
  /** Avatar. */
  picture: {
    data: {
      /** Avatar image URL. */
      url: string;
    };
  };
  /**
   * @deprecated Zalo no longer returns this field for third-party apps.
   */
  phoneNumber?: string;
  /**
   * @deprecated Zalo no longer returns this field for third-party apps.
   */
  gender?: string;
  /**
   * @deprecated Zalo no longer returns this field for third-party apps.
   */
  birthday?: string;
}

export interface Spec extends TurboModule {
  login(authType: string, fallbackToWeb: boolean): Promise<IZaloAuthResponse>;
  logout(): void;
  isAuthenticated(): Promise<boolean>;
  getAccessToken(forceRefresh: boolean): Promise<IZaloAuthResponse>;
  getUserProfile(): Promise<IUserProfile>;
  getApplicationHashKey(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ZaloKit');
