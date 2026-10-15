---
description: "在 React Native 中使用 Zalo 登录：登录方式、未安装 Zalo App 时自动回退到网页登录、返回结果以及可能出现的错误。"
---

# 登录

```ts
import { Constants, login } from 'react-native-zalo-kit';

const { accessToken, refreshToken, expiresIn, expiresAt } = await login(
  Constants.AUTH_VIA_APP_OR_WEB
);
```

[`login(authType?, options?)`](/api/functions/login) 完成用户登录，并把 Token 保存在设备上。一般不需要自己保存返回结果：[`getAccessToken()`](/zh/guide/tokens) 和 [`getUserProfile()`](/zh/guide/profile) 会直接读取已保存的会话。

## 登录方式 {#login-methods}

| `authType` | 行为 |
| --- | --- |
| `AUTH_VIA_APP_OR_WEB`（默认） | 有 Zalo App 就用 App，否则用网页登录。 |
| `AUTH_VIA_APP` | 只用 Zalo App。 |
| `AUTH_VIA_WEB` | 只用网页登录。 |

建议优先使用 App 登录：Zalo 的网页登录可能要求用户用另一台设备上的 Zalo 扫码（见 [Zalo 端已知问题](/zh/guide/known-issues)）。

## 回退到网页登录 {#web-fallback}

`options.fallbackToWeb` 决定在没有安装 Zalo App，或 Zalo App 无法打开登录界面时怎么处理：

- `true`：改用网页登录；
- `false`：以 `ZALO_NOT_INSTALLED` 或 `ZALO_APP_INCOMPATIBLE` reject。

`AUTH_VIA_APP_OR_WEB` 时默认为 `true`，`AUTH_VIA_APP` 时默认为 `false`。

```ts
// 只用 App，但打不开 Zalo App 时回退到网页登录
await login(Constants.AUTH_VIA_APP, { fallbackToWeb: true });

// 从不显示网页登录，而是提示用户安装或更新 Zalo
await login(Constants.AUTH_VIA_APP_OR_WEB, { fallbackToWeb: false });
```

## 返回结果 {#result}

[`IZaloAuthResponse`](/api/interfaces/IZaloAuthResponse)：

```ts
{
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // access token 还有多少秒过期，未知时为 0
  expiresAt: number; // 过期时间（epoch 毫秒），未知时为 0
}
```

## 登录失败时 {#when-login-fails}

Promise 一定会有结果，不会一直挂起。常见的 reject：

| `code` | 触发场景 |
| --- | --- |
| `"-7008"`（Android）/ `"-7035"`（iOS） | 用户取消。在 Android 上，已安装 Zalo 但未登录时也会返回这个错误码。 |
| `ZALO_NOT_INSTALLED` / `ZALO_APP_INCOMPATIBLE` | 无法使用 Zalo App，且未启用网页登录回退（`fallbackToWeb`）。 |
| `LOGIN_SUPERSEDED` | 本次登录完成前，又调用了 `login()` 或 `logout()`。 |
| `NOT_CONFIGURED` | 原生项目中缺少 Zalo App ID。 |

完整列表见[错误处理](/zh/guide/errors)。

## 退出登录 {#logout}

```ts
import { logout } from 'react-native-zalo-kit';

logout();
```

[`logout()`](/api/functions/logout) 会结束 SDK 会话并删除已保存的 Token。
