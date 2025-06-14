import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface IZaloAuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IUserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  gender: string;
  birthday: string;
  picture: {
    data: {
      url: string;
    };
  };
}

export interface Spec extends TurboModule {
  login(authType: string): Promise<IZaloAuthResponse>;
  logout(): void;
  isAuthenticated(): Promise<boolean>;
  getUserProfile(): Promise<IUserProfile>;
  getApplicationHashKey(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ZaloKit');
