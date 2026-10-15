---
description: "使用 react-native-zalo-kit 的 config plugin 为 Expo 应用配置 Zalo 登录：Android manifest、iOS Info.plist 以及 AppDelegate 中的 URL 处理。"
---

# Expo

Zalo Kit 自带 config plugin，Expo 项目不需要手动改任何原生代码。

## 添加插件 {#add-the-plugin}

```json [app.json]
{
  "expo": {
    "plugins": [["react-native-zalo-kit", { "appId": "<YOUR_ZALO_APP_ID>" }]]
  }
}
```

然后用 `npx expo prebuild` 生成原生项目，或者直接用 EAS 构建。Zalo SDK 是原生代码，所以不支持 Expo Go，请使用 [development build](https://docs.expo.dev/develop/development-builds/introduction/)。

## 选项 {#options}

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `appId` | `string` | **必填。** 你的 [Zalo App ID](/zh/guide/zalo-app)（纯数字）。 |

::: warning `appId` 请传字符串
Zalo App ID 有 19 位，超出了 JSON 数字能精确表示的范围：`2451745039837416278` 会变成 `2451745039837416400`。如果传入的数字已经丢失精度，插件会直接报错。
:::

## 插件会改动哪些地方 {#what-the-plugin-changes}

**Android**

- 添加 string 资源 `zalokit_app_id`；
- 在 `AndroidManifest.xml` 中添加 meta-data `com.zing.zalo.zalosdk.appID`；
- 添加带 `zalo-<appId>` scheme 的 `BrowserLoginActivity`。

**iOS**

- 在 `Info.plist` 中设置 `ZaloAppID`；
- 在 `LSApplicationQueriesSchemes` 中添加 `zalosdk` 和 `zaloshareext`；
- 添加 URL type `zalo-<appId>`；
- 修改 `AppDelegate` 中的 `application(_:open:options:)`，让 Zalo 的回调 URL 先交给 SDK 处理。同时支持 Swift 的 `ExpoAppDelegate`（SDK 53 及以上）和 Objective-C 的 `AppDelegate` 模板。

重复运行 prebuild 是安全的：不会重复添加任何内容，`appId` 改变时 scheme 也会随之更新。

::: tip 自定义的 AppDelegate
如果你的 `AppDelegate` 里没有 `application(_:open:options:)` 方法，prebuild 会报错，并附上 iOS 配置文档的链接。按照 [iOS 配置](/zh/guide/ios#forward-the-callback-url)添加这个方法并转发 URL，然后重新运行 prebuild。已经调用了 `ZDKApplicationDelegate` 的 `AppDelegate`，插件不会再改动。
:::
