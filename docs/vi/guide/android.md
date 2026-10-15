---
description: "Thiết lập đăng nhập Zalo trên Android cho app React Native CLI: meta-data App ID, BrowserLoginActivity, Maven repository của Zalo và phiên bản SDK."
---

# Android (React Native CLI)

::: tip Dùng Expo?
[Config plugin](/vi/guide/expo) sẽ tự làm hết các bước dưới đây.
:::

## App ID {#app-id}

Thêm Zalo App ID vào `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
  <string name="zalokit_app_id"><YOUR_ZALO_APP_ID></string>
</resources>
```

## Manifest {#manifest}

Thêm meta-data và activity đăng nhập qua trình duyệt vào `android/app/src/main/AndroidManifest.xml`:

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
      <!-- ví dụ zalo-1234567890 -->
      <data android:scheme="zalo-<YOUR_ZALO_APP_ID>" />
    </intent-filter>
  </activity>
</application>
```

Vậy là xong. Phần còn lại Zalo Kit tự lo:

- khởi tạo SDK khi app chạy;
- chuyển kết quả đăng nhập từ activity của bạn cho SDK;
- kèm sẵn rule ProGuard / R8 cho SDK.

Khai báo `<queries>` cho app Zalo đã có sẵn trong manifest của SDK.

## Maven repository của Zalo {#zalo-maven-repository}

Zalo chỉ phát hành các bản Android SDK mới trên Maven repository riêng của họ, `https://gitlab.com/api/v4/projects/50747855/packages/maven` (Maven Central dừng ở 4.2.0724). Zalo Kit tự thêm repository này vào các project Gradle của bạn.

Nếu `settings.gradle` của bạn khai báo repository trong `dependencyResolutionManagement`, bạn cần tự thêm vào đó:

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

## Phiên bản SDK {#sdk-version}

Muốn dùng phiên bản Zalo Android SDK khác thì khai báo trong `android/build.gradle`:

```groovy
buildscript {
  ext {
    zaloSdkVersion = "4.24.1101"
  }
}
```
