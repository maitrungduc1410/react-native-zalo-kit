---
description: "适用于 React Native 和 Expo 的 Zalo SDK：使用 Zalo 登录、保持会话有效，并在 iOS 和 Android 上获取用户资料。"
layout: home

hero:
  name: Zalo Kit
  text: React Native 版 Zalo SDK
  tagline: 使用 Zalo 登录、自动刷新 Token、获取用户资料。支持 React Native CLI 项目和 Expo development build。
  image:
    src: /logo.svg
    alt: Zalo Kit
  actions:
    - theme: brand
      text: 开始使用
      link: /zh/guide/installation
    - theme: alt
      text: 什么是 Zalo Kit？
      link: /zh/guide/
    - theme: alt
      text: API 参考
      link: /api/

features:
  - icon: 🔐
    title: 登录一定有结果
    details: 通过 Zalo App 或网页登录，必要时自动回退到网页登录。出错时总会返回明确的错误码，Promise 不会一直挂起。
    link: /zh/guide/login
    linkText: 登录
  - icon: 🔄
    title: Token 自动管理
    details: access token 会在过期前自动刷新。Zalo 的 refresh token 只能用一次，所以并发调用会共用同一次刷新。
    link: /zh/guide/tokens
    linkText: Token 与会话
  - icon: 🛡️
    title: 安全存储
    details: Android 上用 Keystore 加密，iOS 上存进 Keychain。旧版本保存的会话会自动迁移。
    link: /zh/guide/tokens#storage
    linkText: 存储
  - icon: 👤
    title: 用户资料
    details: 一次调用即可拿到当前登录用户的 ID、昵称和头像。
    link: /zh/guide/profile
    linkText: 用户资料
  - icon: ⚡
    title: Expo config plugin
    details: 在 app.json 里加一行，就能配置好 Android 和 iOS，包括 AppDelegate 中的 URL 处理。重复运行 prebuild 也没问题。
    link: /zh/guide/expo
    linkText: 配置 Expo
  - icon: 🧰
    title: 原生配置极少
    details: Android 上无需修改 MainActivity 或 MainApplication，自带 ProGuard 规则；iOS 从 Info.plist 读取 App ID。
    link: /zh/guide/android
    linkText: 配置 Android
---

<div class="home-section vp-doc">

## 安装 {#install}

::: code-group

```sh [npm]
npm install react-native-zalo-kit
cd ios && pod install
```

```sh [yarn]
yarn add react-native-zalo-kit
cd ios && pod install
```

```sh [Expo]
npx expo install react-native-zalo-kit
# 在 app.json 中添加插件，然后运行
npx expo prebuild
```

:::

接着[创建 Zalo 应用](/zh/guide/zalo-app)，再按照 [Expo](/zh/guide/expo)、[iOS](/zh/guide/ios) 或 [Android](/zh/guide/android) 的说明完成配置。

## 登录并获取用户资料 {#sign-in-and-read-the-profile}

```ts
import { getUserProfile, login } from 'react-native-zalo-kit';

await login();
const { id, name, picture } = await getUserProfile();
```

## 真机效果 {#see-it-on-a-device}

<div class="demo-shots">
  <figure>
    <img src="../../images/demo_android.gif" alt="示例 App 在 Android 上使用 Zalo 登录" loading="lazy" />
    <figcaption>Android</figcaption>
  </figure>
  <figure>
    <img src="../../images/demo_ios.gif" alt="示例 App 在 iOS 上使用 Zalo 登录" loading="lazy" />
    <figcaption>iOS</figcaption>
  </figure>
</div>

</div>
