---
description: "Cài react-native-zalo-kit cho dự án React Native CLI hoặc Expo, và các phiên bản React Native, Expo, Zalo SDK được hỗ trợ."
---

# Cài đặt

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

Với dự án React Native CLI, cài thêm pod cho iOS:

```sh
cd ios && pod install
```

Với dự án Expo, thêm [config plugin](/vi/guide/expo) rồi build bằng `npx expo prebuild` hoặc EAS. Expo Go không dùng được vì Zalo SDK là code native, bạn cần dùng development build.

## Tương thích {#compatibility}

| | Phiên bản |
| --- | --- |
| React Native | New Architecture (đã test với 0.79) |
| Expo | SDK 52 trở lên, dùng development build |
| Zalo Android SDK | `me.zalo:sdk-*` 4.24.1101 ([đổi phiên bản](/vi/guide/android#sdk-version)) |
| Zalo iOS SDK | `ZaloSDK ~> 4.1` |

## Bước tiếp theo {#next-steps}

1. [Tạo ứng dụng Zalo](/vi/guide/zalo-app) để lấy Zalo App ID.
2. Cấu hình phần native: [Expo](/vi/guide/expo), hoặc [iOS](/vi/guide/ios) và [Android](/vi/guide/android) nếu dùng React Native CLI.
3. [Cho người dùng đăng nhập](/vi/guide/login).
