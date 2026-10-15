# react-native-zalo-kit

## 6.0.0

### Major Changes

- 1c3d1a6: Zalo Kit 6.0 fixes login hanging when the Zalo app is missing or broken, and adds token refresh, encrypted token storage and an Expo config plugin. See the [migration guide](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/migration).
  
  - `login()` no longer hangs when the Zalo app is missing or cannot open the login screen. It falls back to web login or rejects with `ZALO_NOT_INSTALLED` / `ZALO_APP_INCOMPATIBLE` (`login(type, { fallbackToWeb })`).
  - New `getAccessToken()` and `refreshAccessToken()`. Tokens include `expiresIn` / `expiresAt`, and `getUserProfile()` refreshes an expired token automatically.
  - Tokens are stored with the Android Keystore and the iOS Keychain; tokens saved by 5.x are migrated.
  - Android no longer needs changes to `MainActivity` or `MainApplication`, and ships its ProGuard rules. iOS reads the app ID from `ZaloAppID` in `Info.plist`.
  - Expo config plugin: `["react-native-zalo-kit", { "appId": "..." }]`.
  - Breaking: `isAuthenticated()` resolves `false` instead of rejecting with `401` when there is no session; the `401` / `422` codes are replaced by `NOT_AUTHENTICATED` / `INVALID_RESPONSE`; `getUserProfile()` no longer returns `phoneNumber`, `gender` or `birthday`.
