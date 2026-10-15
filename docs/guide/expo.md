---
description: "Configure Zalo login in an Expo app with the react-native-zalo-kit config plugin: Android manifest, iOS Info.plist and AppDelegate URL handling."
---

# Expo

Zalo Kit ships a config plugin, so Expo projects need no manual native edits.

## Add the plugin

```json [app.json]
{
  "expo": {
    "plugins": [["react-native-zalo-kit", { "appId": "<YOUR_ZALO_APP_ID>" }]]
  }
}
```

Then generate the native projects with `npx expo prebuild`, or build with EAS. Expo Go is not supported because the Zalo SDK is native code; use a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

## Options

| Option | Type | Description |
| --- | --- | --- |
| `appId` | `string` | **Required.** Your numeric [Zalo App ID](/guide/zalo-app). |

::: warning Pass `appId` as a string
Zalo App IDs have 19 digits, more than a JSON number can hold exactly: `2451745039837416278` becomes `2451745039837416400`. The plugin rejects numbers that lost precision.
:::

## What the plugin changes

**Android**

- adds the `zalokit_app_id` string resource;
- adds the `com.zing.zalo.zalosdk.appID` meta-data to `AndroidManifest.xml`;
- adds `BrowserLoginActivity` with the `zalo-<appId>` scheme.

**iOS**

- sets `ZaloAppID` in `Info.plist`;
- adds `zalosdk` and `zaloshareext` to `LSApplicationQueriesSchemes`;
- adds the `zalo-<appId>` URL type;
- makes `application(_:open:options:)` in `AppDelegate` hand Zalo's callback URL to the SDK first. Both the Swift `ExpoAppDelegate` (SDK 53+) and the Objective-C `AppDelegate` templates are supported.

Running prebuild again is safe: nothing is duplicated, and the scheme is updated if `appId` changes.

::: tip Custom AppDelegate
If your `AppDelegate` has no `application(_:open:options:)` method, prebuild fails with an error that points to the iOS setup. Add the method and forward the URL as shown in the [iOS setup](/guide/ios#forward-the-callback-url), then run prebuild again; the plugin leaves an `AppDelegate` that already calls `ZDKApplicationDelegate` untouched.
:::
