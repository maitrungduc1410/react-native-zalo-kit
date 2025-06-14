import ZaloKit from './NativeZaloKit';
import { Platform } from 'react-native';
import type { IUserProfile, IZaloAuthResponse } from './NativeZaloKit';

export const login = async (authType: string): Promise<IZaloAuthResponse> => {
  return ZaloKit.login(authType);
};

export const logout: () => void = ZaloKit.logout;

export const isAuthenticated: () => Promise<boolean> = ZaloKit.isAuthenticated;

export const getUserProfile: () => Promise<IUserProfile> = ZaloKit.getUserProfile;

export const getApplicationHashKey = (): string => {
  if (Platform.OS === 'android') {
    return ZaloKit.getApplicationHashKey();
  }

  throw new Error('This function is only supported on Android');
};
