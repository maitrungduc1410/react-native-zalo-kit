---
description: "来自 Zalo SDK、Zalo App 或 Zalo 政策的已知问题，以及 Zalo Kit 如何报告它们：Zalo App 不兼容、网页登录要求扫码、hash key 和资料字段。"
---

# Zalo 端已知问题

以下问题来自 Zalo SDK、Zalo App 或 Zalo 自身的政策，Zalo Kit 无法修复，能做的是返回准确的错误码，方便你处理。

## "Bản Zalo hiện tại không tương thích!" {#ban-zalo-hien-tai-khong-tuong-thich}

这句越南语提示的意思是“当前的 Zalo 版本不兼容”。在 Android 上，当系统无法打开 Zalo 的授权界面时，Zalo SDK 会显示它。已知出现在以下情况：

- Zalo 版本过旧；
- Zalo 被停用，或只安装在另一个用户空间中（Dual App、Second Space、Secure Folder、工作资料）；
- ROM 禁止应用之间互相启动。

Zalo Kit 会拦下这个对话框，然后[回退到网页登录](/zh/guide/login#web-fallback)，或以 `ZALO_APP_INCOMPATIBLE` reject。它还会重置 SDK 内部的一个标志位，否则同一进程中之后的每次 App 登录都会悄无声息地卡住。

排查某台设备：

```sh
adb shell pm query-activities -a com.zing.zalo.intent.action.THIRD_PARTY_APP_AUTHORIZATION
adb shell dumpsys package com.zing.zalo | grep -E "versionName|enabled="
```

如果 `query-activities` 没有列出任何 Zalo 的 activity，说明这台设备上的 Zalo 版本过旧或已被停用。

## 网页登录要求扫码 {#web-login-asks-for-a-qr-scan}

Zalo 的网页登录可能要求用另一台设备上的 Zalo 扫描二维码，而不是输入密码。这是 Zalo 的安全策略。在装有 Zalo 的设备上，建议优先使用 App 登录。

## Google Play 版本的 hash key 不匹配 {#hash-key-mismatch-on-play-builds}

使用 Play App Signing 的应用会被 Google Play 重新签名。见[使用 Play App Signing 时的 hash key](/zh/guide/zalo-app#for-play-app-signing)。

## 资料字段 {#profile-fields}

Zalo 只向登录类应用返回 `id`、`name` 和 `picture`。见[用户资料](/zh/guide/profile#phone-number-gender-and-birthday)。

## CocoaPods 上的 iOS SDK {#ios-sdk-on-cocoapods}

CocoaPods trunk 上只有 `ZaloSDK 4.1.0120`。更新的版本发布在 [GitHub](https://github.com/VNG-Zalo/ZaloSDK-iOS) 上。
