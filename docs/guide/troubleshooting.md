---
description: "Fix common Zalo login problems in React Native: hash key mismatch, application not registered, login not returning on iOS, and Gradle cannot find the Zalo SDK."
---

# Troubleshooting

## `the parameter pkg_name and sign_key are required` / "The application is not approved"

The package name or hash key registered on the Zalo Developer Portal does not match the running build. Compare them with [`getApplicationHashKey()`](/guide/zalo-app#from-the-running-app). Builds installed from Google Play are signed by Google: see [Play App Signing](/guide/zalo-app#for-play-app-signing).

## "Application is not registered for this request"

Request the permissions your app needs on the Zalo Developer Portal (see [Create a Zalo app](/guide/zalo-app)).

## Login never returns on iOS

Make sure `AppDelegate` forwards `application(_:open:options:)` to `ZDKApplicationDelegate` **before** other handlers, and that the `zalo-<appId>` URL type exists. See the [iOS setup](/guide/ios#forward-the-callback-url).

## `NOT_CONFIGURED`

The Zalo App ID is missing: the `com.zing.zalo.zalosdk.appID` meta-data on Android ([setup](/guide/android#manifest)), or `ZaloAppID` in `Info.plist` on iOS ([setup](/guide/ios#info-plist)).

## Gradle: `Could not find me.zalo:sdk-core`

Your build ignores the repositories added by libraries, usually because `settings.gradle` sets `dependencyResolutionManagement`. Add the [Zalo Maven repository](/guide/android#zalo-maven-repository) there.

## "Bản Zalo hiện tại không tương thích!" {#ban-zalo-hien-tai-khong-tuong-thich}

See [Known Zalo-side issues](/guide/known-issues#ban-zalo-hien-tai-khong-tuong-thich).
