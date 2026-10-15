---
description: "在 Zalo Developer Portal 上创建应用，登记 Android 包名和 hash key 以及 iOS bundle ID，并获取 Zalo App ID。"
---

# 创建 Zalo 应用

1. 在 [Zalo Developer Portal](https://developers.zalo.me/) 上创建应用。
2. 打开 `Sản phẩm > Đăng nhập`（产品 > 登录），分别配置 Android 和 iOS：

<div class="portal-shots">
  <img src="../../../images/login_android.png" alt="Zalo Developer Portal 上的 Android 登录配置" />
  <img src="../../../images/login_ios.png" alt="Zalo Developer Portal 上的 iOS 登录配置" />
</div>

- **Android**：包名，以及签名证书的 hash key。见下方 [Hash key](#hash-key)。
- **iOS**：bundle ID。

3. 记下纯数字的 **Zalo App ID**，后面每一步都会用到。
4. 申请应用需要的权限，然后把应用切换到 `Live Mode`，才能使用全部功能。

<img src="../../../images/permission.png" alt="在 Zalo Developer Portal 上申请权限" />

## Hash key {#hash-key}

Android 的 hash key 是应用签名证书 SHA-1 的 Base64 编码。每个签名密钥对应一个 hash key，所以你发布的每个构建版本用的是哪个密钥，就要登记哪个密钥的 hash key。

### 从运行中的应用获取 {#from-the-running-app}

[`getApplicationHashKey()`](/api/functions/getApplicationHashKey) 返回当前运行版本的 hash key，计算方式与 Zalo SDK 完全一致：

```ts
import { getApplicationHashKey } from 'react-native-zalo-kit';

console.log(getApplicationHashKey());
```

### 使用 Play App Signing 时 {#for-play-app-signing}

启用 Play App Signing 后，Google 会重新签名你的应用，因此从 Google Play 安装的版本与本地构建或上传的版本 hash key 不同。在 Play Console（`Test and release > Setup > App signing`）中找到 **App signing key certificate** 的 SHA-1，然后转换：

```sh
echo "<SHA-1，例如 AB:CD:...>" | tr -d ':' | xxd -r -p | base64
```

### 从 keystore 获取 {#from-a-keystore}

```sh
keytool -exportcert -alias <alias> -keystore <keystore> | openssl sha1 -binary | openssl base64
```
