import { NativeModules } from 'react-native'

const { ZaloKit } = NativeModules

export enum Constants {
  AUTH_VIA_WEB = ZaloKit.AUTH_VIA_WEB,
  AUTH_VIA_APP = ZaloKit.AUTH_VIA_APP,
  AUTH_VIA_APP_OR_WEB = ZaloKit.AUTH_VIA_APP_OR_WEB,
}

export interface IUserProfile {
  id: string,
  name: string,
  phoneNumber: string,
  gender: string,
  birthday: string,
  picture: {
    data: {
      url: string,
    },
  }
}
