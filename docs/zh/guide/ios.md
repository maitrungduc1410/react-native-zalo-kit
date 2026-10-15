---
description: "在 React Native CLI 应用中配置 iOS 的 Zalo 登录：Info.plist 中的 ZaloAppID、URL scheme 和 query scheme，以及 AppDelegate 中的 openURL 处理。"
---

# iOS（React Native CLI）

::: tip 使用 Expo？
[Config plugin](/zh/guide/expo) 会自动完成以下所有步骤。
:::

## Info.plist {#info-plist}

在 `ios/<YourApp>/Info.plist` 中添加 Zalo App ID 和 URL scheme：

```xml
<key>ZaloAppID</key>
<string><YOUR_ZALO_APP_ID></string>
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>zalosdk</string>
  <string>zaloshareext</string>
</array>
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>zalo</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>zalo-<YOUR_ZALO_APP_ID></string>
    </array>
  </dict>
</array>
```

如果 `Info.plist` 中已经有 `LSApplicationQueriesSchemes` 或 `CFBundleURLTypes`，把这些条目加到现有数组里即可。在 Xcode 中，它们位于 target 的 `Info` 标签页，名为 `Queried URL Schemes` 和 `URL Types`。

Zalo Kit 会在第一次使用时用 `ZaloAppID` 初始化 SDK。如果你仍然自己调用 `[[ZaloSDK sharedInstance] initializeWithAppId:]`，也没有问题。

## 转发回调 URL {#forward-the-callback-url}

登录完成后，Zalo 会用 `zalo-<appId>` URL 重新打开你的应用。在 `AppDelegate` 中把这个 URL 交给 SDK，并且要放在其他 handler 之前：

::: code-group

```swift [Swift]
import ZaloSDK

func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
  if ZDKApplicationDelegate.sharedInstance().application(app, open: url, options: options) {
    return true
  }
  // 其他 handler，例如 RCTLinkingManager.application(app, open: url, options: options)
  return false
}
```

```objc [Objective-C]
#import <ZaloSDK/ZaloSDK.h>

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  if ([[ZDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
    return YES;
  }
  // 其他 handler，例如 [RCTLinkingManager application:application openURL:url options:options]
  return NO;
}
```

:::

## Pod 版本 {#pod-version}

这个 pod 依赖 `ZaloSDK ~> 4.1`。CocoaPods trunk 上只有 `4.1.0120`，更新的版本发布在 [GitHub](https://github.com/VNG-Zalo/ZaloSDK-iOS) 上。如需使用新版本，在 `Podfile` 中把 `ZaloSDK` pod 指向那里即可。
