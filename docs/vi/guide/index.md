---
description: "Zalo Kit bọc Zalo SDK chính thức cho Android và iOS, giúp app React Native và Expo đăng nhập bằng Zalo và lấy thông tin người dùng."
---

# Zalo Kit là gì?

Zalo Kit (`react-native-zalo-kit`) bọc Zalo SDK chính thức cho Android và iOS. Với nó, app React Native hoặc Expo của bạn có thể:

- cho người dùng đăng nhập bằng Zalo, qua app Zalo hoặc qua web ([Đăng nhập](/vi/guide/login));
- giữ phiên đăng nhập luôn còn hạn, access token được làm mới tự động ([Token và phiên đăng nhập](/vi/guide/tokens));
- lấy thông tin cơ bản của người đang đăng nhập ([Thông tin người dùng](/vi/guide/profile)).

## Các API được hỗ trợ {#supported-apis}

| API | Android | iOS |
| --- | --- | --- |
| [`login`](/api/functions/login) | ✅ | ✅ |
| [`getAccessToken`](/api/functions/getAccessToken) / [`refreshAccessToken`](/api/functions/refreshAccessToken) | ✅ | ✅ |
| [`isAuthenticated`](/api/functions/isAuthenticated) | ✅ | ✅ |
| [`getUserProfile`](/api/functions/getUserProfile) | ✅ | ✅ |
| [`logout`](/api/functions/logout) | ✅ | ✅ |
| [`getApplicationHashKey`](/api/functions/getApplicationHashKey) | ✅ | ❌ |

Các API mạng xã hội khác của Zalo (bạn bè, tin nhắn, bài đăng) không còn mở cho app bên thứ ba, nên Zalo Kit chỉ tập trung vào đăng nhập và thông tin người dùng.

Tài liệu Zalo SDK: [Android](https://developers.zalo.me/docs/sdk/android-sdk/tong-quan), [iOS](https://developers.zalo.me/docs/sdk/ios-sdk/tong-quan).

## Cách hoạt động {#how-it-works}

1. `login()` mở app Zalo, hoặc trang đăng nhập web của Zalo, kèm một PKCE challenge.
2. Zalo trả về OAuth code, Zalo Kit đổi code đó lấy access token và refresh token.
3. Token được mã hóa và lưu trên thiết bị. `getAccessToken()` và `getUserProfile()` dùng lại token này và tự làm mới access token khi hết hạn.

Nếu backend cần xác minh người dùng, hãy gửi access token lấy từ [`getAccessToken()`](/api/functions/getAccessToken) lên server rồi gọi Graph API của Zalo từ phía server.

## Bước tiếp theo {#next-steps}

- [Cài đặt](/vi/guide/installation)
- [Tạo ứng dụng Zalo](/vi/guide/zalo-app)
- Thiết lập cho [Expo](/vi/guide/expo), [iOS](/vi/guide/ios) hoặc [Android](/vi/guide/android)
