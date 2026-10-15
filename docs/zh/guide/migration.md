---
description: "将 react-native-zalo-kit 从 5.x 升级到 6.0：原生配置变化、Expo config plugin、新的 Token API，以及错误码方面的破坏性变更。"
---

# 从 5.x 升级

6.0 包含破坏性变更。

## 原生配置 {#native-setup}

- **Android**：从 `MainActivity` 中删除 `ZaloSDK.Instance.onActivityResult(...)`，从 `MainApplication` 中删除 `ZaloSDKApplication.wrap(this)`。留着也不会出错，只是已经不需要了。SDK 的 ProGuard 规则已经内置，可以从 `proguard-rules.pro` 中删掉。
- **iOS**：在 `Info.plist` 中添加 `ZaloAppID`（或继续调用 `initializeWithAppId:`）。`openURL` 的转发保持不变。
- **Expo**：添加 [config plugin](/zh/guide/expo)，参数为 `{ "appId": "..." }`，并撤掉你在 `expo prebuild` 之后手动做的原生修改。

## API 变化 {#api-changes}

- `login()` 除了 Token 之外还会返回 `expiresIn` 和 `expiresAt`。在没有 Zalo App 或 Zalo App 出问题时，会以[错误处理](/zh/guide/errors)中的错误码 reject，而不是一直挂起。`authType` 的类型从 `string` 改为 [`LoginMethod`](/api/type-aliases/LoginMethod)。
- 没有会话时，`isAuthenticated()` 返回 `false`；5.x 会以 `401` reject。网络错误时仍然会 reject。
- `401`（没有会话）和 `422`（无法读取资料）分别被 `NOT_AUTHENTICATED` 和 `INVALID_RESPONSE` 取代。
- `logout()` 会以 `LOGIN_SUPERSEDED` reject 尚未完成的 `login()`。
- `getUserProfile()` 不再请求 `phoneNumber`、`gender` 和 `birthday`。

## 新增 {#new}

- [`getAccessToken()`](/api/functions/getAccessToken) 和 [`refreshAccessToken()`](/api/functions/refreshAccessToken)。
- [`ErrorCodes`](/api/variables/ErrorCodes)。
- `login(type, { fallbackToWeb })`。
- Token 加密存储；5.x 保存的 Token 会自动迁移。
