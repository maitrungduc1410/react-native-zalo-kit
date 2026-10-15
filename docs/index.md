---
description: "Zalo SDK for React Native and Expo: sign users in with Zalo, keep their session fresh and read their profile on iOS and Android."
layout: home

hero:
  name: Zalo Kit
  text: Zalo SDK for React Native
  tagline: Sign users in with Zalo, keep their session fresh and read their profile. Works with React Native CLI apps and Expo development builds.
  image:
    src: /logo.svg
    alt: Zalo Kit
  actions:
    - theme: brand
      text: Get started
      link: /guide/installation
    - theme: alt
      text: What is it?
      link: /guide/
    - theme: alt
      text: API reference
      link: /api/

features:
  - icon: 🔐
    title: Login that never hangs
    details: App or web login with automatic web fallback. Failures reject with an error code you can switch on.
    link: /guide/login
    linkText: Login
  - icon: 🔄
    title: Automatic token refresh
    details: Access tokens are refreshed before they expire, and concurrent calls share one refresh because Zalo refresh tokens are single-use.
    link: /guide/tokens
    linkText: Tokens and sessions
  - icon: 🛡️
    title: Secure storage
    details: Tokens are encrypted with the Android Keystore and kept in the iOS Keychain. Sessions saved by older versions are migrated.
    link: /guide/tokens#storage
    linkText: Storage
  - icon: 👤
    title: User profile
    details: Read the signed-in user's ID, name and avatar with one call.
    link: /guide/profile
    linkText: User profile
  - icon: ⚡
    title: Expo config plugin
    details: One line in app.json configures Android and iOS, including the AppDelegate URL handler. Safe to rerun on every prebuild.
    link: /guide/expo
    linkText: Expo setup
  - icon: 🧰
    title: Minimal native setup
    details: No MainActivity or MainApplication changes on Android, ProGuard rules included, and the iOS app ID is read from Info.plist.
    link: /guide/android
    linkText: Android setup
---

<div class="home-section vp-doc">

## Install

::: code-group

```sh [npm]
npm install react-native-zalo-kit
cd ios && pod install
```

```sh [yarn]
yarn add react-native-zalo-kit
cd ios && pod install
```

```sh [Expo]
npx expo install react-native-zalo-kit
# add the plugin to app.json, then
npx expo prebuild
```

:::

Then [create a Zalo app](/guide/zalo-app) and follow the setup for [Expo](/guide/expo), [iOS](/guide/ios) or [Android](/guide/android).

## Sign in and read the profile

```ts
import { getUserProfile, login } from 'react-native-zalo-kit';

await login();
const { id, name, picture } = await getUserProfile();
```

## See it on a device

<div class="demo-shots">
  <figure>
    <img src="../images/demo_android.gif" alt="Zalo login in the example app on Android" loading="lazy" />
    <figcaption>Android</figcaption>
  </figure>
  <figure>
    <img src="../images/demo_ios.gif" alt="Zalo login in the example app on iOS" loading="lazy" />
    <figcaption>iOS</figcaption>
  </figure>
</div>

</div>
