import {
  NativeModules,
  Platform,
} from 'react-native'
import {
  Constants,
  IUserProfile,
  IFriendList,
  IShareResponseObject,
} from './types'

const { ZaloKit } = NativeModules

const login = async (
  authType = Constants.AUTH_VIA_APP_OR_WEB,
): Promise<boolean> => {
  try {
    const oauthCode = await ZaloKit.login(authType)

    return oauthCode
  } catch (error) {
    throw error
  }
}

const logout: () => void = ZaloKit.logout

const isAuthenticated: () => Promise<boolean> = ZaloKit.isAuthenticated

const getUserProfile: () => Promise<IUserProfile> = ZaloKit.getUserProfile

const getApplicationHashKey = async (): Promise<string> => {
  try {
    if (Platform.OS === 'android') {
      const key = await ZaloKit.getApplicationHashKey()
      return key
    }

    return 'This function is only supported on Android'
  } catch (error) {
    throw error
  }
}

const getFriendListUsedApp: (
  position: number,
  count: number,
) => Promise<IFriendList> = ZaloKit.getFriendListUsedApp

const getFriendListInvitable: (
  position: number,
  count: number,
) => Promise<IFriendList> = ZaloKit.getFriendListInvitable

const postToWall: (
  link: string,
  message: string,
) => Promise<{ id: string }> = ZaloKit.postToWall

const sendMessageToFriend: (
  friendId: string,
  link: string,
  message: string,
) => Promise<{ to: string }> = ZaloKit.sendMessageToFriend

const inviteFriendUseApp = async (
  friendIds: string[],
  message: string,
): Promise<{ to: string[] }> => {
  try {
    let response
    if (Platform.OS === 'android') {
      response = await ZaloKit.inviteFriendUseApp(friendIds, message)
    } else {
      response = await ZaloKit.inviteFriendUseApp(friendIds.join(','), message)
    }

    return response
  } catch (error) {
    throw error
  }
}

const sendMessageToFriendByApp: (
  feedData: {
    appName: string,
    message: string,
    link: string,
    linkTitle: string,
    linkSource: string,
    linkDesc: string,
    linkThumb: string[],
    others: object,
  },
) => Promise<IShareResponseObject> = ZaloKit.sendMessageToFriendByApp

const postToWallByApp: (
  feedData: {
    appName: string,
    message: string,
    link: string,
    linkTitle: string,
    linkSource: string,
    linkDesc: string,
    linkThumb: string[],
    others: object,
  },
) => Promise<IShareResponseObject> = ZaloKit.postToWallByApp

export {
  login,
  logout,
  isAuthenticated,
  getUserProfile,
  getApplicationHashKey,
  Constants,
  getFriendListUsedApp,
  getFriendListInvitable,
  postToWall,
  sendMessageToFriend,
  inviteFriendUseApp,
  sendMessageToFriendByApp,
  postToWallByApp,
}

export default {
  login,
  logout,
  isAuthenticated,
  getUserProfile,
  getApplicationHashKey,
  Constants,
  getFriendListUsedApp,
  getFriendListInvitable,
  postToWall,
  sendMessageToFriend,
  inviteFriendUseApp,
  sendMessageToFriendByApp,
  postToWallByApp,
}
