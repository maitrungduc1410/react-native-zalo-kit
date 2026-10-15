---
description: "Các lỗi đã biết đến từ Zalo SDK, app Zalo hoặc chính sách của Zalo, và cách Zalo Kit báo lại: app Zalo không tương thích, đăng nhập web bắt quét QR, hash key và các trường profile."
---

# Lỗi đã biết từ phía Zalo

Các lỗi dưới đây đến từ Zalo SDK, app Zalo hoặc chính sách của Zalo, nên Zalo Kit không sửa được. Việc thư viện làm được là trả về mã lỗi đúng để bạn xử lý.

## "Bản Zalo hiện tại không tương thích!" {#ban-zalo-hien-tai-khong-tuong-thich}

Trên Android, Zalo SDK hiện thông báo này khi Android không mở được màn hình cấp quyền của Zalo. Đã gặp trong các trường hợp:

- app Zalo quá cũ;
- Zalo bị vô hiệu hóa, hoặc chỉ được cài trong một profile khác (Dual App, Second Space, Secure Folder, work profile);
- ROM chặn các app mở lẫn nhau.

Zalo Kit sẽ ẩn hộp thoại này đi và [chuyển sang đăng nhập web](/vi/guide/login#web-fallback), hoặc reject với `ZALO_APP_INCOMPATIBLE`. Thư viện cũng reset một cờ bên trong SDK, vì nếu không thì mọi lần đăng nhập bằng app sau đó trong cùng process sẽ âm thầm bị treo.

Để kiểm tra một thiết bị:

```sh
adb shell pm query-activities -a com.zing.zalo.intent.action.THIRD_PARTY_APP_AUTHORIZATION
adb shell dumpsys package com.zing.zalo | grep -E "versionName|enabled="
```

Nếu `query-activities` không liệt kê activity nào của Zalo thì Zalo trên máy đó đã quá cũ hoặc đang bị vô hiệu hóa.

## Đăng nhập web bắt quét mã QR {#web-login-asks-for-a-qr-scan}

Đăng nhập web của Zalo có thể yêu cầu quét mã QR bằng Zalo trên một máy khác thay vì nhập mật khẩu. Đây là chính sách bảo mật của Zalo. Trên máy có cài Zalo, nên ưu tiên đăng nhập bằng app.

## Sai hash key trên bản phát hành qua Google Play {#hash-key-mismatch-on-play-builds}

Google Play ký lại các app dùng Play App Signing. Xem [Hash key khi dùng Play App Signing](/vi/guide/zalo-app#for-play-app-signing).

## Các trường profile {#profile-fields}

Zalo chỉ trả về `id`, `name` và `picture` cho app đăng nhập. Xem [Thông tin người dùng](/vi/guide/profile#phone-number-gender-and-birthday).

## iOS SDK trên CocoaPods {#ios-sdk-on-cocoapods}

CocoaPods trunk chỉ có `ZaloSDK 4.1.0120`. Các bản mới hơn được phát hành trên [GitHub](https://github.com/VNG-Zalo/ZaloSDK-iOS).
