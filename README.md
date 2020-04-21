<h1 align="center">
  <img src="./zalo.svg" width="150" height="150" /><br>
  Zalo SDK for React Native
</h1>

<div align="center">
  <img src="./demo_android.gif" style="margin-right: 30px;" />
  <img src="./demo_ios.gif" />
</div>

# Installation
With npm:
`$ npm install react-native-zalo-kit --save`

With yarn:
`$ yarn add react-native-zalo-kit`

# Setup
## Create Zalo Application
First of all you need to create Zalo application on [Zalo Developer Portal](https://developers.zalo.me/)

> Note: when setting up Android platform for your application, it'll ask you for a `Hash key`. We provide you a helper function to [get that key](#get-application-hash-key-android-only)

After that you'll get your Zalo App Key, and you'll need to use it for next sections

## iOS
Run the following command to setup for iOS:
```
cd ios && pod install
```

After that, open `ios/<your_app_name>/AppDelegate.m`, and add the following:
```objc
#import <ZaloSDK/ZaloSDK.h>

- (BOOL)application:(UIApplication *)application
 didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    ...

    [[ZaloSDK sharedInstance] initializeWithAppId:@"<YOUR_ZALO_APP_ID>"];
    return YES;
}

...  

- (BOOL)application:(UIApplication *)application openURL:(nonnull NSURL *)url options:(nonnull NSDictionary<NSString *,id> *)options {
  return [[ZDKApplicationDelegate sharedInstance] application:application openURL:url options:options];
}
```
## Android
1. Open `android/build.gradle`, and change the `minSdkVersion` to 18:
```
buildscript {
    ext {
      ...

      minSdkVersion = 18
    }

    ...
```
2. Open `android/app/src/main/java/<your_app_package>/MainActivity.java`, and add the following:
```java
import com.zing.zalo.zalosdk.oauth.ZaloSDK;

public class MainActivity extends ReactActivity {
  ...

  // override method below (create it if not exist)
  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    ZaloSDK.Instance.onActivityResult(this, requestCode, resultCode, data);
  }
}
```

3. After that, open `android/app/src/main/java/<your_app_package>/MainApplication.java`, and add the following:
```java
import com.zing.zalo.zalosdk.oauth.ZaloSDKApplication;

public class MainApplication extends Application implements ReactApplication {
  ...

  @Override
  public void onCreate() {
    ...

    ZaloSDKApplication.wrap(this);
  }
}
```

4. Add `appID` to `android/app/src/main/res/values/strings.xml`
```xml
<resources>
    <string name="app_name">App Name</string>
    <string name="appID"><YOUR_ZALO_APP_ID></string>
</res>
```

5. Add the following to:
```xml
<application>

  ...

  <meta-data
    android:name="com.zing.zalo.zalosdk.appID"
    android:value="@string/appID" />

  <activity
    android:name="com.zing.zalo.zalosdk.oauth.BrowserLoginActivity">
    <intent-filter>
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="zalo-<YOUR_ZALO_APP_ID>" />
      <!-- eg: <data android:scheme="zalo-1234567890" />-->
    </intent-filter>
  </activity>
</application>
```
# Usage
You can import the whole library like:
```js
import ZaloKit from 'react-native-zalo-kit'

// Usage:
ZaloKit.login()
...
```
Or you can just import the module you need like:
```js
import { login } from 'react-native-zalo-kit'

// Usage
login()
```
## Login
```js
import { login, Constants } from 'react-native-zalo-kit'

const login = async () => {
  try {
    const oauthCode = await login(Constants.AUTH_VIA_APP_OR_WEB)
    console.log(oauthCode)
  } catch (error) {
    console.log(error)
  }
}
```

`login` supports the following methods:
- `AUTH_VIA_APP_OR_WEB`: login via app or web. If user has Zalo app then login with app, otherwise using web
- `AUTH_VIA_APP`: login using Zalo app only,
- `AUTH_VIA_APP_OR_WEB`: login using Zalo web only
## Check if authenticated
```js
import { isAuthenticated } from 'react-native-zalo-kit'

const isAuthenticated = async () => {
  try {
    const isAuthenticated = await ZaloKit.isAuthenticated()
    console.log(isAuthenticated)
  } catch (error) {
    console.log(error)
  }
}
```
## Get User Profile
```js
import { getUserProfile } from 'react-native-zalo-kit'

const getUserProfile = async () => {
  try {
    const userProfile = await ZaloKit.getUserProfile()
    console.log(userProfile)
  } catch (error) {
    console.log(error)
  }
}
```
## Logout
```js
import { logout } from 'react-native-zalo-kit'

const logout = () => {
  logout()
}
```
## Get Application Hash Key (Android only)
This is a helper function which returns app Hash key for Android, help you on setting up your app on [Zalo Developer Portal](https://developers.zalo.me/)
```js
import { getApplicationHashKey } from 'react-native-zalo-kit'

const getApplicationHashKey = async () => {
  try {
    const key = await getApplicationHashKey()
    console.log(key)
  } catch (error) {
    console.log(error)
  }
}
```