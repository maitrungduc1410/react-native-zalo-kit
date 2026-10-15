---
description: "在 React Native CLI 或 Expo 项目中安装 react-native-zalo-kit，并查看支持的 React Native、Expo 和 Zalo SDK 版本。"
---

# 安装

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

React Native CLI 项目还需要安装 iOS 的 pod：

```sh
cd ios && pod install
```

Expo 项目需要添加 [config plugin](/zh/guide/expo)，然后用 `npx expo prebuild` 或 EAS 构建。Zalo SDK 是原生代码，所以不支持 Expo Go，请使用 development build。

## 兼容性 {#compatibility}

| | 版本 |
| --- | --- |
| React Native | New Architecture（已在 0.79 上测试） |
| Expo | SDK 52 及以上，需使用 development build |
| Zalo Android SDK | `me.zalo:sdk-*` 4.24.1101（[可更换版本](/zh/guide/android#sdk-version)） |
| Zalo iOS SDK | `ZaloSDK ~> 4.1` |

## 下一步 {#next-steps}

1. [创建 Zalo 应用](/zh/guide/zalo-app)，拿到 Zalo App ID。
2. 配置原生项目：使用 [Expo](/zh/guide/expo)，或者在 React Native CLI 项目中配置 [iOS](/zh/guide/ios) 和 [Android](/zh/guide/android)。
3. [让用户登录](/zh/guide/login)。
