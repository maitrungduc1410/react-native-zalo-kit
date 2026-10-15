<h1 align="center">
  <div>
    <img src="./images/react-native.png" height="150" />
    <img src="./images/zalo.svg" width="150" height="150" />
  </div>

  Zalo Kit for React Native
  <div>
  <img src="https://img.shields.io/npm/dw/react-native-zalo-kit" />

  <img src="https://img.shields.io/npm/v/react-native-zalo-kit" />

  <img src="https://img.shields.io/github/license/maitrungduc1410/react-native-zalo-kit" />

  <img src="https://img.shields.io/github/stars/maitrungduc1410/react-native-zalo-kit?style=social" />
  </div>
</h1>

<div align="center">
  <p>
    <strong>✅ iOS & Android</strong> •
    <strong>✅ New Architecture</strong> •
    <strong>✅ Expo development builds</strong>
  </p>

  <p>
    <a href="https://maitrungduc1410.github.io/react-native-zalo-kit/"><strong>📖 Documentation</strong></a> •
    <a href="https://maitrungduc1410.github.io/react-native-zalo-kit/guide/installation">Get started</a> •
    <a href="https://maitrungduc1410.github.io/react-native-zalo-kit/api/">API reference</a> •
    <a href="https://maitrungduc1410.github.io/react-native-zalo-kit/guide/migration">Migrating from 5.x</a> •
    <a href="https://maitrungduc1410.github.io/react-native-zalo-kit/vi/">Tiếng Việt</a> •
    <a href="https://maitrungduc1410.github.io/react-native-zalo-kit/zh/">简体中文</a>
  </p>

  <img src="./images/demo_android.gif" width="280" alt="Zalo login on Android" />
  <img src="./images/demo_ios.gif" width="280" alt="Zalo login on iOS" />
</div>

Zalo Kit is a React Native wrapper around the official Zalo SDKs for Android and iOS, for apps that want "Log in with Zalo" and the user's basic profile.

## Features

- Login through the Zalo app or the web, with automatic web fallback when the app is missing. Failures reject with an error code, so the promise never hangs.
- Access tokens are refreshed for you. Concurrent calls share one refresh, since Zalo refresh tokens are single-use.
- Tokens are encrypted with the Android Keystore and kept in the iOS Keychain. Sessions saved by 5.x are migrated.
- `getUserProfile()` returns the user's ID, name and avatar.
- An Expo config plugin sets up both platforms from one line in `app.json`.
- On Android there is nothing to add to `MainActivity` or `MainApplication`, and the ProGuard rules are included.

## Installation

```sh
npm install react-native-zalo-kit
# or
yarn add react-native-zalo-kit

# iOS (React Native CLI)
cd ios && pod install
```

Then [create a Zalo app](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/zalo-app) to get your Zalo App ID.

**Expo**: add the config plugin, then run `npx expo prebuild` or build with EAS. Expo Go is not supported; use a development build.

```json
{
  "expo": {
    "plugins": [["react-native-zalo-kit", { "appId": "<YOUR_ZALO_APP_ID>" }]]
  }
}
```

**React Native CLI**: follow the [iOS](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/ios) and [Android](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/android) setup.

## Quick start

```ts
import {
  ErrorCodes,
  getAccessToken,
  getUserProfile,
  login,
  logout,
} from 'react-native-zalo-kit';

try {
  await login(); // Zalo app if available, otherwise web login
} catch (e: any) {
  if (e.code === ErrorCodes.ZALO_NOT_INSTALLED) {
    // ...
  }
}

const { id, name, picture } = await getUserProfile();
const { accessToken } = await getAccessToken(); // refreshed automatically

logout();
```

## Documentation

Everything else lives on the documentation site: **https://maitrungduc1410.github.io/react-native-zalo-kit/**

- [Login](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/login) and web fallback
- [Tokens and sessions](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/tokens)
- [User profile](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/profile)
- [Error handling](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/errors)
- [Migrating from 5.x](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/migration)
- [Troubleshooting](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/troubleshooting) and [known Zalo-side issues](https://maitrungduc1410.github.io/react-native-zalo-kit/guide/known-issues)
- [API reference](https://maitrungduc1410.github.io/react-native-zalo-kit/api/)

A complete demo app is in [`example/`](./example/src/).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The docs site source is in [`docs/`](./docs/); run `yarn docs:dev` to work on it. [ARCHITECTURE.md](ARCHITECTURE.md) explains how the library works inside.

## License

MIT

If you like this project, encourage me by giving it a ⭐️. Happy hacking
