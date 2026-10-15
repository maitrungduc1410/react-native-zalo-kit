---
description: "react-native-zalo-kit 和 Zalo SDK 的 reject 错误码，以及在 React Native 中如何处理。"
---

# 错误处理

Promise 被 reject 时，错误对象带有 `code` 字段：

```ts
import { ErrorCodes, login } from 'react-native-zalo-kit';

try {
  await login();
} catch (e: any) {
  if (e.code === ErrorCodes.ZALO_NOT_INSTALLED) {
    // 提示用户安装 Zalo
  }
}
```

## Zalo Kit 错误码 {#zalo-kit-codes}

[`ErrorCodes`](/api/variables/ErrorCodes)：

| `code` | 含义 |
| --- | --- |
| `ZALO_NOT_INSTALLED` | 未安装 Zalo App，且未启用网页登录回退（`fallbackToWeb`）。 |
| `ZALO_APP_INCOMPATIBLE` | 已安装 Zalo App，但无法打开登录界面，且未启用网页登录回退（`fallbackToWeb`）。 |
| `NOT_AUTHENTICATED` | 没有已保存的会话，请调用 `login()`。 |
| `NO_ACTIVITY` | 当前没有可用于发起登录的前台 activity / view controller。 |
| `LOGIN_SUPERSEDED` | 更新的一次 `login()` 调用或 `logout()` 取代了本次调用。 |
| `NOT_CONFIGURED` | 原生项目中缺少 Zalo App ID。 |
| `INVALID_RESPONSE` | Zalo 返回了不符合预期的数据。 |

## Zalo SDK 错误码 {#zalo-sdk-codes}

其他错误保留 Zalo 的数字错误码，以字符串形式返回。常见的有：

| `code` | 含义 |
| --- | --- |
| `"-7008"`（Android）/ `"-7035"`（iOS） | 用户取消。在 Android 上，已安装 Zalo 但未登录时也会返回 `-7008`。 |
| `"-8001"`（Android）/ `"-7024"`、`"-7025"`（iOS） | 网络或服务端错误，请稍后重试。 |
| `"-124"`、`"-216"`、`"-220"`、`"-5004"` | access token 无效或已过期。`getUserProfile()` 已经自动刷新并重试过一次。 |

完整列表：[Android](https://developers.zalo.me/docs/sdk/android-sdk/references/ma-loi)、[iOS](https://developers.zalo.me/docs/sdk/ios-sdk/references/ma-loi)。
