---
description: "Set up Zalo login on Android in a React Native CLI app: the app ID meta-data, BrowserLoginActivity, the Zalo Maven repository and the SDK version."
---

# Android (React Native CLI)

::: tip Using Expo?
The [config plugin](/guide/expo) does all of this for you.
:::

## App ID

Add the Zalo App ID to `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
  <string name="zalokit_app_id"><YOUR_ZALO_APP_ID></string>
</resources>
```

## Manifest

Add the meta-data and the browser login activity to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  ...

  <meta-data
    android:name="com.zing.zalo.zalosdk.appID"
    android:value="@string/zalokit_app_id" />

  <activity
    android:name="com.zing.zalo.zalosdk.oauth.BrowserLoginActivity"
    android:exported="true">
    <intent-filter>
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <!-- e.g. zalo-1234567890 -->
      <data android:scheme="zalo-<YOUR_ZALO_APP_ID>" />
    </intent-filter>
  </activity>
</application>
```

That's all. Zalo Kit:

- initializes the SDK at startup;
- forwards the login result from your activity to the SDK;
- ships the ProGuard / R8 keep rules for the SDK.

The `<queries>` entry for the Zalo app comes from the SDK's own manifest.

## Zalo Maven repository

Zalo publishes current Android SDK versions only to its own Maven repository, `https://gitlab.com/api/v4/projects/50747855/packages/maven` (Maven Central stops at 4.2.0724). Zalo Kit adds it to your Gradle projects automatically.

If your `settings.gradle` declares repositories in `dependencyResolutionManagement`, add it there yourself:

```groovy
dependencyResolutionManagement {
  repositories {
    maven {
      url "https://gitlab.com/api/v4/projects/50747855/packages/maven"
      content { includeGroup "me.zalo" }
    }
  }
}
```

## SDK version

To use another Zalo Android SDK version, set it in `android/build.gradle`:

```groovy
buildscript {
  ext {
    zaloSdkVersion = "4.24.1101"
  }
}
```
