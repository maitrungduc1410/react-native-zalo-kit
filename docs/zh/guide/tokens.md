---
description: "Zalo Kit 如何安全保存 Zalo 的 access token 和 refresh token、自动刷新 Token，以及检查会话是否仍然有效。"
---

# Token 与会话

## 获取 access token {#get-an-access-token}

```ts
import { getAccessToken, refreshAccessToken } from 'react-native-zalo-kit';

// 已保存的 Token；如果 60 秒内就要过期，会先刷新
const { accessToken } = await getAccessToken();

// 总是向 Zalo 请求新的 Token
const fresh = await refreshAccessToken(); // 等同于 getAccessToken({ forceRefresh: true })
```

没有会话时，[`getAccessToken()`](/api/functions/getAccessToken) 会以 `NOT_AUTHENTICATED` reject。如果 Zalo 拒绝了 refresh token，Promise 会以 Zalo 的数字错误码 reject，这时需要重新调用 `login()`。

## 检查会话 {#check-the-session}

```ts
import { isAuthenticated } from 'react-native-zalo-kit';

const loggedIn = await isAuthenticated();
```

[`isAuthenticated()`](/api/functions/isAuthenticated) 会向 Zalo 确认已保存的 refresh token 是否仍然有效：

- `true`：会话有效；
- `false`：没有会话，或会话已被 Zalo 拒绝；
- 遇到网络或服务端错误时 reject，避免网络不稳定被误判为已退出登录。

## 刷新 {#refresh}

- Zalo 的 access token 有效期很短（约 1 小时）。refresh token 有效期更长，但**只能使用一次**：每次刷新都会返回新的 refresh token，Zalo Kit 会替你保存。
- `getAccessToken()` 和 `getUserProfile()` 会自动刷新。并发调用共用同一个刷新请求；`isAuthenticated()` 会等待正在进行的刷新完成，而不是去检查一个马上就要被替换的 Token。
- 如果你的后端也用同一个 refresh token 刷新，双方会让对方的 Token 失效。请只让一方负责刷新。

## 存储 {#storage}

- **Android**：使用 Android Keystore 中的 AES-GCM 密钥加密，密钥不会离开 Keystore。如果设备上的 Keystore 不可用，Token 只保存在内存中，进程结束即失效。
- **iOS**：以 `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` 存入 Keychain。重新安装应用后会话会被清除，与 Android 行为一致。
- 5.x 保存的 Token（位于 SharedPreferences / NSUserDefaults）会在首次使用时迁移，迁移成功后删除旧数据。
