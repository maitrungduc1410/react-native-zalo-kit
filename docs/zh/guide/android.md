---
description: "在 React Native CLI 应用中配置 Android 的 Zalo 登录：App ID meta-data、BrowserLoginActivity、Zalo Maven 仓库以及 SDK 版本。"
---

# Android（React Native CLI）

::: tip 使用 Expo？
[Config plugin](/zh/guide/expo) 会自动完成以下所有步骤。
:::

## App ID {#app-id}

在 `android/app/src/main/res/values/strings.xml` 中添加 Zalo App ID：

```xml
<resources>
  <string name="zalokit_app_id"><YOUR_ZALO_APP_ID></string>
</resources>
```

## Manifest {#manifest}

在 `android/app/src/main/AndroidManifest.xml` 中添加 meta-data 和浏览器登录 activity：

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
      <!-- 例如 zalo-1234567890 -->
      <data android:scheme="zalo-<YOUR_ZALO_APP_ID>" />
    </intent-filter>
  </activity>
</application>
```

这样就完成了。剩下的由 Zalo Kit 处理：

- 应用启动时初始化 SDK；
- 把 activity 收到的登录结果转交给 SDK；
- 自带 SDK 所需的 ProGuard / R8 keep 规则。

Zalo App 的 `<queries>` 声明已经包含在 SDK 自己的 manifest 里。

## Zalo Maven 仓库 {#zalo-maven-repository}

Zalo 只在自己的 Maven 仓库 `https://gitlab.com/api/v4/projects/50747855/packages/maven` 上发布新版 Android SDK（Maven Central 上最新只到 4.2.0724）。Zalo Kit 会自动把这个仓库加到你的 Gradle 项目中。

如果你的 `settings.gradle` 在 `dependencyResolutionManagement` 中声明仓库，需要自己把它加进去：

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

## SDK 版本 {#sdk-version}

如需使用其他版本的 Zalo Android SDK，在 `android/build.gradle` 中设置：

```groovy
buildscript {
  ext {
    zaloSdkVersion = "4.24.1101"
  }
}
```
