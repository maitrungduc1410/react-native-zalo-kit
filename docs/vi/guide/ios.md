---
description: "Thiết lập đăng nhập Zalo trên iOS cho app React Native CLI: ZaloAppID, URL scheme, query scheme trong Info.plist và xử lý openURL trong AppDelegate."
---

# iOS (React Native CLI)

::: tip Dùng Expo?
[Config plugin](/vi/guide/expo) sẽ tự làm hết các bước dưới đây.
:::

## Info.plist {#info-plist}

Thêm Zalo App ID và các URL scheme vào `ios/<YourApp>/Info.plist`:

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

Nếu `Info.plist` đã có sẵn `LSApplicationQueriesSchemes` hoặc `CFBundleURLTypes`, hãy thêm vào mảng đang có. Trong Xcode, hai mục này nằm ở tab `Info` của target, tên là `Queried URL Schemes` và `URL Types`.

Zalo Kit khởi tạo SDK bằng `ZaloAppID` ở lần dùng đầu tiên. Nếu bạn vẫn tự gọi `[[ZaloSDK sharedInstance] initializeWithAppId:]` thì cũng không sao.

## Chuyển URL callback cho SDK {#forward-the-callback-url}

Sau khi đăng nhập, Zalo mở lại app của bạn bằng URL `zalo-<appId>`. Trong `AppDelegate`, hãy chuyển URL này cho SDK, trước mọi handler khác:

::: code-group

```swift [Swift]
import ZaloSDK

func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
  if ZDKApplicationDelegate.sharedInstance().application(app, open: url, options: options) {
    return true
  }
  // các handler khác, ví dụ RCTLinkingManager.application(app, open: url, options: options)
  return false
}
```

```objc [Objective-C]
#import <ZaloSDK/ZaloSDK.h>

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  if ([[ZDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
    return YES;
  }
  // các handler khác, ví dụ [RCTLinkingManager application:application openURL:url options:options]
  return NO;
}
```

:::

## Phiên bản pod {#pod-version}

Pod phụ thuộc vào `ZaloSDK ~> 4.1`. CocoaPods trunk chỉ có bản `4.1.0120`, các bản mới hơn được phát hành trên [GitHub](https://github.com/VNG-Zalo/ZaloSDK-iOS). Muốn dùng bản mới thì trỏ pod `ZaloSDK` tới đó trong `Podfile`.
