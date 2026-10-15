---
description: "Zalo SDK cho React Native và Expo: đăng nhập bằng Zalo, giữ phiên đăng nhập luôn còn hạn và lấy thông tin người dùng trên iOS và Android."
layout: home

hero:
  name: Zalo Kit
  text: Zalo SDK cho React Native
  tagline: Đăng nhập bằng Zalo, tự làm mới token và lấy thông tin người dùng. Dùng được cho app React Native CLI lẫn development build của Expo.
  image:
    src: /logo.svg
    alt: Zalo Kit
  actions:
    - theme: brand
      text: Bắt đầu
      link: /vi/guide/installation
    - theme: alt
      text: Zalo Kit là gì?
      link: /vi/guide/
    - theme: alt
      text: Tài liệu API
      link: /api/

features:
  - icon: 🔐
    title: Đăng nhập không bị treo
    details: Đăng nhập qua app Zalo hoặc web, tự chuyển sang web khi cần. Lỗi nào cũng trả về mã lỗi rõ ràng, promise không bao giờ treo mãi.
    link: /vi/guide/login
    linkText: Đăng nhập
  - icon: 🔄
    title: Không phải tự lo token
    details: Access token được làm mới trước khi hết hạn. Nhiều lệnh gọi cùng lúc chỉ dùng chung một lần refresh, vì refresh token của Zalo chỉ dùng được một lần.
    link: /vi/guide/tokens
    linkText: Token và phiên đăng nhập
  - icon: 🛡️
    title: Lưu trữ an toàn
    details: Token được mã hóa bằng Android Keystore và lưu trong iOS Keychain. Phiên đăng nhập từ bản cũ được chuyển sang tự động.
    link: /vi/guide/tokens#storage
    linkText: Lưu trữ
  - icon: 👤
    title: Thông tin người dùng
    details: Một lệnh gọi là có ID, tên và ảnh đại diện của người dùng đang đăng nhập.
    link: /vi/guide/profile
    linkText: Thông tin người dùng
  - icon: ⚡
    title: Config plugin cho Expo
    details: Thêm một dòng vào app.json là xong phần cấu hình Android và iOS, kể cả đoạn xử lý URL trong AppDelegate. Chạy prebuild lại bao nhiêu lần cũng được.
    link: /vi/guide/expo
    linkText: Thiết lập Expo
  - icon: 🧰
    title: Cấu hình native tối thiểu
    details: Không phải sửa MainActivity hay MainApplication trên Android, có sẵn rule ProGuard, còn iOS thì đọc App ID từ Info.plist.
    link: /vi/guide/android
    linkText: Thiết lập Android
---

<div class="home-section vp-doc">

## Cài đặt {#install}

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
# thêm plugin vào app.json, rồi chạy
npx expo prebuild
```

:::

Sau đó [tạo ứng dụng Zalo](/vi/guide/zalo-app) và làm theo hướng dẫn thiết lập cho [Expo](/vi/guide/expo), [iOS](/vi/guide/ios) hoặc [Android](/vi/guide/android).

## Đăng nhập và lấy thông tin người dùng {#sign-in-and-read-the-profile}

```ts
import { getUserProfile, login } from 'react-native-zalo-kit';

await login();
const { id, name, picture } = await getUserProfile();
```

## Chạy thử trên thiết bị {#see-it-on-a-device}

<div class="demo-shots">
  <figure>
    <img src="../../images/demo_android.gif" alt="Đăng nhập Zalo trong app ví dụ trên Android" loading="lazy" />
    <figcaption>Android</figcaption>
  </figure>
  <figure>
    <img src="../../images/demo_ios.gif" alt="Đăng nhập Zalo trong app ví dụ trên iOS" loading="lazy" />
    <figcaption>iOS</figcaption>
  </figure>
</div>

</div>
