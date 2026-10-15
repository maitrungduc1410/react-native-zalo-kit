---
description: "Known issues caused by the Zalo SDK, the Zalo app or Zalo's policies, and how Zalo Kit reports them: incompatible Zalo app, QR-only web login, hash keys and profile fields."
---

# Known Zalo-side issues

These come from the Zalo SDK, the Zalo app or Zalo's own policies, so Zalo Kit cannot fix them. What it can do is report them with a proper error code.

## "Bản Zalo hiện tại không tương thích!" {#ban-zalo-hien-tai-khong-tuong-thich}

This Vietnamese message means "This version of Zalo is not compatible". On Android, the Zalo SDK shows it when Android cannot open Zalo's authorization screen. It has been seen with:

- outdated Zalo builds;
- Zalo disabled, or installed only in another profile (Dual App, Second Space, Secure Folder, work profile);
- ROMs that block apps from launching each other.

Zalo Kit suppresses the dialog and either [falls back to web login](/guide/login#web-fallback) or rejects with `ZALO_APP_INCOMPATIBLE`. It also resets an SDK flag that otherwise made every later app login in the same process silently hang.

To diagnose a device:

```sh
adb shell pm query-activities -a com.zing.zalo.intent.action.THIRD_PARTY_APP_AUTHORIZATION
adb shell dumpsys package com.zing.zalo | grep -E "versionName|enabled="
```

If `query-activities` lists no Zalo activity, Zalo is outdated or disabled on that device.

## Web login asks for a QR scan

Zalo's web login may require scanning a QR code with Zalo on another device instead of entering a password. This is Zalo's security policy. Prefer app login on devices that have Zalo.

## Hash key mismatch on Play builds

Google Play re-signs apps that use Play App Signing. See [Hash key for Play App Signing](/guide/zalo-app#for-play-app-signing).

## Profile fields

Zalo only returns `id`, `name` and `picture` to login apps. See [User profile](/guide/profile#phone-number-gender-and-birthday).

## iOS SDK on CocoaPods

The CocoaPods trunk only has `ZaloSDK 4.1.0120`. Newer builds are published on [GitHub](https://github.com/VNG-Zalo/ZaloSDK-iOS).
