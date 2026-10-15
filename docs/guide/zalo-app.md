---
description: "Create a Zalo app on the Zalo Developer Portal, register the Android package name and hash key and the iOS bundle ID, and get the Zalo App ID."
---

# Create a Zalo app

1. Create an application on the [Zalo Developer Portal](https://developers.zalo.me/).
2. Open `Sản phẩm > Đăng nhập` (Products > Login) and configure Android and iOS:

<div class="portal-shots">
  <img src="../../images/login_android.png" alt="Android login settings on the Zalo Developer Portal" />
  <img src="../../images/login_ios.png" alt="iOS login settings on the Zalo Developer Portal" />
</div>

- **Android**: the package name and the hash key of your signing certificate. See [Hash key](#hash-key) below.
- **iOS**: the bundle ID.

3. Note the numeric **Zalo App ID**. Every setup step uses it.
4. Request the permissions your app needs, then switch the app to `Live Mode` to get full functionality.

<img src="../../images/permission.png" alt="Permission requests on the Zalo Developer Portal" />

## Hash key

The Android hash key is the Base64 SHA-1 of the certificate that signed the app. Each signing key has its own hash key, so register the one used by each build you ship.

### From the running app

[`getApplicationHashKey()`](/api/functions/getApplicationHashKey) returns the hash key of the build that is running, computed the same way the Zalo SDK does:

```ts
import { getApplicationHashKey } from 'react-native-zalo-kit';

console.log(getApplicationHashKey());
```

### For Play App Signing

With Play App Signing, Google re-signs your app, so the build installed from Google Play has a different hash key than your local or upload build. Get the **App signing key certificate** SHA-1 from Play Console (`Test and release > Setup > App signing`) and convert it:

```sh
echo "<SHA-1, e.g. AB:CD:...>" | tr -d ':' | xxd -r -p | base64
```

### From a keystore

```sh
keytool -exportcert -alias <alias> -keystore <keystore> | openssl sha1 -binary | openssl base64
```
