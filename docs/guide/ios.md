---
description: "Set up Zalo login on iOS in a React Native CLI app: ZaloAppID, URL scheme and query schemes in Info.plist, and the AppDelegate openURL handler."
---

# iOS (React Native CLI)

::: tip Using Expo?
The [config plugin](/guide/expo) does all of this for you.
:::

## Info.plist

Add the Zalo App ID and URL schemes to `ios/<YourApp>/Info.plist`:

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

If `Info.plist` already has `LSApplicationQueriesSchemes` or `CFBundleURLTypes`, add the entries to the existing arrays. In Xcode they show up as `Queried URL Schemes` and `URL Types` under the target's `Info` tab.

Zalo Kit initializes the SDK with `ZaloAppID` on first use. Calling `[[ZaloSDK sharedInstance] initializeWithAppId:]` yourself still works.

## Forward the callback URL

After login, Zalo opens your app with the `zalo-<appId>` URL. Hand it to the SDK in `AppDelegate`, before any other handler:

::: code-group

```swift [Swift]
import ZaloSDK

func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
  if ZDKApplicationDelegate.sharedInstance().application(app, open: url, options: options) {
    return true
  }
  // other handlers, e.g. RCTLinkingManager.application(app, open: url, options: options)
  return false
}
```

```objc [Objective-C]
#import <ZaloSDK/ZaloSDK.h>

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  if ([[ZDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
    return YES;
  }
  // other handlers, e.g. [RCTLinkingManager application:application openURL:url options:options]
  return NO;
}
```

:::

## Pod version

The pod depends on `ZaloSDK ~> 4.1`. The CocoaPods trunk only has `4.1.0120`; newer builds are published on [GitHub](https://github.com/VNG-Zalo/ZaloSDK-iOS). To use one, point the `ZaloSDK` pod at it in your `Podfile`.
