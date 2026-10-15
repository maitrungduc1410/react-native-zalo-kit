---
description: "Đăng nhập bằng Zalo trong React Native: các cách đăng nhập, tự chuyển sang web khi máy không có app Zalo, kết quả trả về và các lỗi thường gặp."
---

# Đăng nhập

```ts
import { Constants, login } from 'react-native-zalo-kit';

const { accessToken, refreshToken, expiresIn, expiresAt } = await login(
  Constants.AUTH_VIA_APP_OR_WEB
);
```

[`login(authType?, options?)`](/api/functions/login) cho người dùng đăng nhập và lưu token trên thiết bị. Thường bạn không cần giữ lại kết quả này, vì [`getAccessToken()`](/vi/guide/tokens) và [`getUserProfile()`](/vi/guide/profile) đọc thẳng từ phiên đã lưu.

## Cách đăng nhập {#login-methods}

| `authType` | Hoạt động |
| --- | --- |
| `AUTH_VIA_APP_OR_WEB` (mặc định) | Dùng app Zalo nếu có, không thì đăng nhập qua web. |
| `AUTH_VIA_APP` | Chỉ dùng app Zalo. |
| `AUTH_VIA_WEB` | Chỉ đăng nhập qua web. |

Nên ưu tiên app Zalo: đăng nhập web có thể bắt người dùng quét mã QR bằng Zalo trên một máy khác (xem [Lỗi đã biết từ phía Zalo](/vi/guide/known-issues)).

## Chuyển sang đăng nhập web {#web-fallback}

`options.fallbackToWeb` quyết định chuyện gì xảy ra khi máy không có app Zalo, hoặc app Zalo không mở được màn hình đăng nhập:

- `true`: chuyển sang đăng nhập web;
- `false`: reject với `ZALO_NOT_INSTALLED` hoặc `ZALO_APP_INCOMPATIBLE`.

Mặc định là `true` với `AUTH_VIA_APP_OR_WEB` và `false` với `AUTH_VIA_APP`.

```ts
// Chỉ dùng app, nhưng chuyển sang web nếu không mở được app Zalo
await login(Constants.AUTH_VIA_APP, { fallbackToWeb: true });

// Không bao giờ hiện đăng nhập web, thay vào đó nhắc người dùng cài hoặc cập nhật Zalo
await login(Constants.AUTH_VIA_APP_OR_WEB, { fallbackToWeb: false });
```

## Kết quả {#result}

[`IZaloAuthResponse`](/api/interfaces/IZaloAuthResponse):

```ts
{
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // số giây còn lại trước khi access token hết hạn, 0 nếu không rõ
  expiresAt: number; // thời điểm hết hạn tính bằng epoch milliseconds, 0 nếu không rõ
}
```

## Khi đăng nhập thất bại {#when-login-fails}

Promise lúc nào cũng resolve hoặc reject, không bao giờ treo. Các trường hợp reject hay gặp:

| `code` | Khi nào |
| --- | --- |
| `"-7008"` (Android) / `"-7035"` (iOS) | Người dùng hủy. Trên Android, mã này cũng xuất hiện khi máy có app Zalo nhưng chưa đăng nhập. |
| `ZALO_NOT_INSTALLED` / `ZALO_APP_INCOMPATIBLE` | Không dùng được app Zalo và `fallbackToWeb` đang tắt. |
| `LOGIN_SUPERSEDED` | `login()` được gọi lần nữa, hoặc `logout()` được gọi, trước khi lần đăng nhập này xong. |
| `NOT_CONFIGURED` | Project native chưa khai báo Zalo App ID. |

Danh sách đầy đủ ở trang [Xử lý lỗi](/vi/guide/errors).

## Đăng xuất {#logout}

```ts
import { logout } from 'react-native-zalo-kit';

logout();
```

[`logout()`](/api/functions/logout) kết thúc phiên của SDK và xóa token đã lưu.
