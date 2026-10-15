---
description: "Zalo Kit wraps the official Zalo SDK for Android and iOS so React Native and Expo apps can sign users in with Zalo and read their profile."
---

# What is Zalo Kit?

Zalo Kit (`react-native-zalo-kit`) is a React Native wrapper around the official Zalo SDKs for Android and iOS. With it, your app can:

- sign users in with Zalo, through the Zalo app or the web ([Login](/guide/login));
- keep the session fresh, with access tokens refreshed for you ([Tokens and sessions](/guide/tokens));
- read the signed-in user's basic profile ([User profile](/guide/profile)).

## Supported APIs

| API | Android | iOS |
| --- | --- | --- |
| [`login`](/api/functions/login) | ✅ | ✅ |
| [`getAccessToken`](/api/functions/getAccessToken) / [`refreshAccessToken`](/api/functions/refreshAccessToken) | ✅ | ✅ |
| [`isAuthenticated`](/api/functions/isAuthenticated) | ✅ | ✅ |
| [`getUserProfile`](/api/functions/getUserProfile) | ✅ | ✅ |
| [`logout`](/api/functions/logout) | ✅ | ✅ |
| [`getApplicationHashKey`](/api/functions/getApplicationHashKey) | ✅ | ❌ |

Zalo's other social APIs (friends, messages, feed) are no longer available to third-party apps, so Zalo Kit focuses on login and the profile.

Zalo SDK references: [Android](https://developers.zalo.me/docs/sdk/android-sdk/tong-quan), [iOS](https://developers.zalo.me/docs/sdk/ios-sdk/tong-quan).

## How it works

1. `login()` opens the Zalo app, or Zalo's web login, with a PKCE challenge.
2. Zalo returns an OAuth code, which Zalo Kit exchanges for an access token and a refresh token.
3. The tokens are encrypted and stored on the device. `getAccessToken()` and `getUserProfile()` reuse them and refresh the access token when it expires.

If your backend needs to verify the user, send it the access token from [`getAccessToken()`](/api/functions/getAccessToken) and call Zalo's Graph API from the server.

## Next steps

- [Installation](/guide/installation)
- [Create a Zalo app](/guide/zalo-app)
- Setup for [Expo](/guide/expo), [iOS](/guide/ios) or [Android](/guide/android)
