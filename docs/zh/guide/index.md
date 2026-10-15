---
description: "Zalo Kit 封装了 Android 和 iOS 官方 Zalo SDK，让 React Native 和 Expo 应用可以使用 Zalo 登录并获取用户资料。"
---

# 什么是 Zalo Kit？

Zalo Kit（`react-native-zalo-kit`）封装了 Android 和 iOS 的官方 Zalo SDK。用它，你的 React Native 或 Expo 应用可以：

- 让用户通过 Zalo App 或网页使用 Zalo 登录（[登录](/zh/guide/login)）；
- 保持会话有效，access token 会自动刷新（[Token 与会话](/zh/guide/tokens)）；
- 获取当前登录用户的基本资料（[用户资料](/zh/guide/profile)）。

## 支持的 API {#supported-apis}

| API | Android | iOS |
| --- | --- | --- |
| [`login`](/api/functions/login) | ✅ | ✅ |
| [`getAccessToken`](/api/functions/getAccessToken) / [`refreshAccessToken`](/api/functions/refreshAccessToken) | ✅ | ✅ |
| [`isAuthenticated`](/api/functions/isAuthenticated) | ✅ | ✅ |
| [`getUserProfile`](/api/functions/getUserProfile) | ✅ | ✅ |
| [`logout`](/api/functions/logout) | ✅ | ✅ |
| [`getApplicationHashKey`](/api/functions/getApplicationHashKey) | ✅ | ❌ |

Zalo 的其他社交 API（好友、消息、动态）已不再向第三方应用开放，所以 Zalo Kit 只专注于登录和用户资料。

Zalo SDK 文档：[Android](https://developers.zalo.me/docs/sdk/android-sdk/tong-quan)、[iOS](https://developers.zalo.me/docs/sdk/ios-sdk/tong-quan)。

## 工作原理 {#how-it-works}

1. `login()` 打开 Zalo App 或 Zalo 的网页登录，并带上 PKCE challenge。
2. Zalo 返回 OAuth code，Zalo Kit 用它换取 access token 和 refresh token。
3. Token 加密后保存在设备上。`getAccessToken()` 和 `getUserProfile()` 会复用这些 Token，并在 access token 过期时自动刷新。

如果后端需要验证用户身份，把 [`getAccessToken()`](/api/functions/getAccessToken) 拿到的 access token 发给服务端，再由服务端调用 Zalo 的 Graph API。

## 下一步 {#next-steps}

- [安装](/zh/guide/installation)
- [创建 Zalo 应用](/zh/guide/zalo-app)
- 配置 [Expo](/zh/guide/expo)、[iOS](/zh/guide/ios) 或 [Android](/zh/guide/android)
