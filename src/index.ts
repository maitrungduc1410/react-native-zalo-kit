import { NativeModules, Platform } from 'react-native'
import { Constants, IUserProfile } from './types'

const { ZaloKit } = NativeModules

const login = async (authType = Constants.AUTH_VIA_APP_OR_WEB): Promise<boolean> => {
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

// export default ZaloKit

export {
  login,
  logout,
  isAuthenticated,
  getUserProfile,
  getApplicationHashKey,
  Constants,
}

export default {
  login,
  logout,
  isAuthenticated,
  getUserProfile,
  getApplicationHashKey,
  Constants,
}
