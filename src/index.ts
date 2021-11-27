import { NativeModules, Platform } from 'react-native';
import {
  Constants,
  IUserProfile,
  IFriendList,
  IShareResponseObject,
  IZaloAuthResponse,
} from './types';

const LINKING_ERROR =
  `The package 'react-native-zalo-kit' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const ZaloKit = NativeModules.ZaloKit
  ? NativeModules.ZaloKit
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const login = async (
  authType = Constants.AUTH_VIA_APP_OR_WEB
): Promise<IZaloAuthResponse> => {
  const AUTH_TYPES = [
    Constants.AUTH_VIA_APP,
    Constants.AUTH_VIA_APP_OR_WEB,
    Constants.AUTH_VIA_WEB,
  ];
  const AUTH_TYPE_KEYS = AUTH_TYPES.map((key) => {
    return Constants[key];
  });
  if (!AUTH_TYPES.includes(authType)) {
    throw new Error(`"authType" must be one of [${AUTH_TYPE_KEYS.join(', ')}]`);
  }

  return ZaloKit.login(authType);
};

const register: () => Promise<IZaloAuthResponse> = ZaloKit.register;

const logout: () => void = ZaloKit.logout;

const isAuthenticated: () => Promise<boolean> = ZaloKit.isAuthenticated;

const getUserProfile: () => Promise<IUserProfile> = ZaloKit.getUserProfile;

const getApplicationHashKey = (): string => {
  if (Platform.OS === 'android') {
    return ZaloKit.getApplicationHashKey();
  }

  throw new Error('This function is only supported on Android');
};

const getUserFriendList = async (
  offset: number,
  count: number
): Promise<IFriendList> => ZaloKit.getUserFriendList(offset, count);

const getUserInvitableFriendList = async (
  offset: number,
  count: number
): Promise<IFriendList> => ZaloKit.getUserInvitableFriendList(offset, count);

const postFeed = async (
  message: string,
  link: string
): Promise<{ id: string }> => ZaloKit.postFeed(message, link);

const sendMessage = async (
  friendId: string,
  link: string,
  message: string
): Promise<{ to: string }> => ZaloKit.sendMessage(friendId, message, link);

const inviteFriendUseApp = async (
  friendIds: string[],
  message: string
): Promise<{ to: string[] }> => {
  if (Platform.OS === 'android') {
    return ZaloKit.inviteFriendUseApp(friendIds, message);
  }
  return ZaloKit.inviteFriendUseApp(friendIds.join(','), message);
};

const sendMessageByApp = async (feedData: {
  appName: string;
  message: string;
  link: string;
  linkTitle: string;
  linkSource: string;
  linkDesc: string;
  linkThumb: string[];
  others: object;
}): Promise<IShareResponseObject> => ZaloKit.sendMessageByApp(feedData);

const postFeedByApp = async (feedData: {
  appName: string;
  message: string;
  link: string;
  linkTitle: string;
  linkSource: string;
  linkDesc: string;
  linkThumb: string[];
  others: object;
}): Promise<IShareResponseObject> => ZaloKit.postFeedByApp(feedData);

export {
  Constants,
  getApplicationHashKey,
  login,
  logout,
  isAuthenticated,
  getUserProfile,
  getUserFriendList,
  getUserInvitableFriendList,
  postFeed,
  postFeedByApp,
  sendMessage,
  sendMessageByApp,
  inviteFriendUseApp,
  register,
};

export default {
  Constants,
  getApplicationHashKey,
  login,
  logout,
  isAuthenticated,
  getUserProfile,
  getUserFriendList,
  getUserInvitableFriendList,
  postFeed,
  postFeedByApp,
  sendMessage,
  sendMessageByApp,
  inviteFriendUseApp,
  register,
};
