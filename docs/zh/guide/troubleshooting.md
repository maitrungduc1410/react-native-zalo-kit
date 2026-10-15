---
description: "解决 React Native 中常见的 Zalo 登录问题：hash key 不匹配、应用未注册、iOS 登录后不返回结果、Gradle 找不到 Zalo SDK。"
---

# 故障排查

## `the parameter pkg_name and sign_key are required` / "The application is not approved" {#the-parameter-pkg-name-and-sign-key-are-required-the-application-is-not-approved}

Zalo Developer Portal 上登记的包名或 hash key 与当前运行的版本不一致。可以用 [`getApplicationHashKey()`](/zh/guide/zalo-app#from-the-running-app) 对比。从 Google Play 安装的版本由 Google 签名，见 [Play App Signing](/zh/guide/zalo-app#for-play-app-signing)。

## "Application is not registered for this request" {#application-is-not-registered-for-this-request}

在 Zalo Developer Portal 上申请应用需要的权限（见[创建 Zalo 应用](/zh/guide/zalo-app)）。

## iOS 上登录后一直没有结果 {#login-never-returns-on-ios}

确认 `AppDelegate` 在其他 handler **之前**把 `application(_:open:options:)` 转发给了 `ZDKApplicationDelegate`，并且已经添加了 `zalo-<appId>` URL type。见 [iOS 配置](/zh/guide/ios#forward-the-callback-url)。

## `NOT_CONFIGURED` {#not-configured}

缺少 Zalo App ID：Android 上是 meta-data `com.zing.zalo.zalosdk.appID`（[配置方法](/zh/guide/android#manifest)），iOS 上是 `Info.plist` 中的 `ZaloAppID`（[配置方法](/zh/guide/ios#info-plist)）。

## Gradle：`Could not find me.zalo:sdk-core` {#gradle-could-not-find-me-zalo-sdk-core}

你的构建忽略了库添加的仓库，通常是因为 `settings.gradle` 中设置了 `dependencyResolutionManagement`。把 [Zalo Maven 仓库](/zh/guide/android#zalo-maven-repository)加到那里即可。

## "Bản Zalo hiện tại không tương thích!" {#ban-zalo-hien-tai-khong-tuong-thich}

见 [Zalo 端已知问题](/zh/guide/known-issues#ban-zalo-hien-tai-khong-tuong-thich)。
