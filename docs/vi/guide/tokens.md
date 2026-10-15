---
description: "Cách Zalo Kit lưu access token và refresh token của Zalo an toàn, tự làm mới token và kiểm tra phiên đăng nhập còn hạn hay không."
---

# Token và phiên đăng nhập

## Lấy access token {#get-an-access-token}

```ts
import { getAccessToken, refreshAccessToken } from 'react-native-zalo-kit';

// Token đã lưu, được làm mới trước nếu còn dưới 60 giây là hết hạn
const { accessToken } = await getAccessToken();

// Luôn xin Zalo token mới
const fresh = await refreshAccessToken(); // giống getAccessToken({ forceRefresh: true })
```

[`getAccessToken()`](/api/functions/getAccessToken) reject với `NOT_AUTHENTICATED` khi chưa có phiên đăng nhập. Nếu Zalo từ chối refresh token, promise sẽ reject với mã lỗi số của Zalo, lúc đó bạn cần gọi lại `login()`.

## Kiểm tra phiên đăng nhập {#check-the-session}

```ts
import { isAuthenticated } from 'react-native-zalo-kit';

const loggedIn = await isAuthenticated();
```

[`isAuthenticated()`](/api/functions/isAuthenticated) hỏi Zalo xem refresh token đang lưu còn dùng được không:

- `true`: phiên còn hạn;
- `false`: chưa có phiên, hoặc Zalo đã từ chối nó;
- reject khi lỗi mạng hoặc lỗi server, để mạng chập chờn không bị hiểu nhầm là người dùng đã đăng xuất.

## Làm mới token {#refresh}

- Access token của Zalo hết hạn khá nhanh (khoảng 1 tiếng). Refresh token có hạn dài hơn nhưng **chỉ dùng được một lần**: mỗi lần refresh, Zalo trả về một refresh token mới và Zalo Kit sẽ lưu lại giúp bạn.
- `getAccessToken()` và `getUserProfile()` tự làm mới token. Nhiều lệnh gọi cùng lúc sẽ dùng chung một request refresh, còn `isAuthenticated()` thì đợi lần refresh đang chạy xong thay vì kiểm tra một token sắp bị thay.
- Nếu backend của bạn cũng refresh bằng chính refresh token đó, hai bên sẽ làm hỏng token của nhau. Chỉ nên để một bên lo việc refresh.

## Lưu trữ {#storage}

- **Android**: mã hóa bằng khóa AES-GCM nằm trong Android Keystore, khóa không bao giờ rời khỏi Keystore. Nếu Keystore trên máy bị lỗi, token chỉ được giữ trong bộ nhớ cho tới khi tắt app.
- **iOS**: lưu trong Keychain với `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`. Phiên đăng nhập bị xóa khi cài lại app, giống Android.
- Token do bản 5.x lưu (trong SharedPreferences / NSUserDefaults) được chuyển sang ở lần dùng đầu tiên, và bị xóa khỏi chỗ cũ khi chuyển xong.
