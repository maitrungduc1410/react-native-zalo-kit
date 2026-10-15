---
description: "Upgrade react-native-zalo-kit from 5.x to 6.0: native setup changes, Expo plugin, new token APIs and breaking changes in error codes."
---

# Migrating from 5.x

6.0 is a breaking release.

## Native setup

- **Android**: remove `ZaloSDK.Instance.onActivityResult(...)` from `MainActivity` and `ZaloSDKApplication.wrap(this)` from `MainApplication`. Leftover calls are tolerated but no longer needed. The SDK's ProGuard rules are included, so you can drop them from `proguard-rules.pro`.
- **iOS**: add `ZaloAppID` to `Info.plist` (or keep calling `initializeWithAppId:`). Keep the `openURL` forwarding.
- **Expo**: add the [config plugin](/guide/expo) with `{ "appId": "..." }` and drop the native edits you made after `expo prebuild`.

## API changes

- `login()` resolves with `expiresIn` and `expiresAt` in addition to the tokens, and rejects with the codes in [Error handling](/guide/errors) instead of hanging when the Zalo app is missing or broken. `authType` is typed as [`LoginMethod`](/api/type-aliases/LoginMethod) instead of `string`.
- `isAuthenticated()` resolves `false` when there is no session; 5.x rejected with code `401`. It still rejects on network errors.
- The `401` (no session) and `422` (unreadable profile) codes are replaced by `NOT_AUTHENTICATED` and `INVALID_RESPONSE`.
- `logout()` rejects a `login()` that is still in progress with `LOGIN_SUPERSEDED`.
- `getUserProfile()` no longer requests `phoneNumber`, `gender` or `birthday`.

## New

- [`getAccessToken()`](/api/functions/getAccessToken) and [`refreshAccessToken()`](/api/functions/refreshAccessToken).
- [`ErrorCodes`](/api/variables/ErrorCodes).
- `login(type, { fallbackToWeb })`.
- Encrypted token storage; tokens saved by 5.x are migrated automatically.
