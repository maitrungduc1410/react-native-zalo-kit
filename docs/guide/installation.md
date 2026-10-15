---
description: "Install react-native-zalo-kit in a React Native CLI or Expo project, and check the supported React Native, Expo and Zalo SDK versions."
---

# Installation

::: code-group

```sh [npm]
npm install react-native-zalo-kit
```

```sh [yarn]
yarn add react-native-zalo-kit
```

```sh [Expo]
npx expo install react-native-zalo-kit
```

:::

React Native CLI projects then install the iOS pod:

```sh
cd ios && pod install
```

Expo projects add the [config plugin](/guide/expo) and build with `npx expo prebuild` or EAS. Expo Go is not supported because the Zalo SDK is native code; use a development build.

## Compatibility

| | Version |
| --- | --- |
| React Native | New Architecture (tested with 0.79) |
| Expo | SDK 52+ with a development build |
| Zalo Android SDK | `me.zalo:sdk-*` 4.24.1101 ([override](/guide/android#sdk-version)) |
| Zalo iOS SDK | `ZaloSDK ~> 4.1` |

## Next steps

1. [Create a Zalo app](/guide/zalo-app) to get your Zalo App ID.
2. Configure the native projects: [Expo](/guide/expo), or [iOS](/guide/ios) and [Android](/guide/android) for React Native CLI.
3. [Sign the user in](/guide/login).
