---
description: "Nâng cấp react-native-zalo-kit từ 5.x lên 6.0: thay đổi phần native, config plugin cho Expo, API token mới và các breaking change về mã lỗi."
---

# Nâng cấp từ 5.x

6.0 có breaking change.

## Phần native {#native-setup}

- **Android**: bỏ `ZaloSDK.Instance.onActivityResult(...)` khỏi `MainActivity` và `ZaloSDKApplication.wrap(this)` khỏi `MainApplication`. Lỡ còn sót thì app vẫn chạy bình thường, chỉ là không cần nữa. Rule ProGuard của SDK đã có sẵn, nên bạn có thể xóa chúng khỏi `proguard-rules.pro`.
- **iOS**: thêm `ZaloAppID` vào `Info.plist` (hoặc vẫn gọi `initializeWithAppId:` như cũ). Giữ nguyên đoạn chuyển `openURL`.
- **Expo**: thêm [config plugin](/vi/guide/expo) với `{ "appId": "..." }` và bỏ những chỗ bạn đã sửa tay sau khi chạy `expo prebuild`.

## Thay đổi API {#api-changes}

- `login()` trả về thêm `expiresIn` và `expiresAt` bên cạnh token. Khi máy không có app Zalo hoặc app Zalo bị lỗi, hàm reject với các mã ở trang [Xử lý lỗi](/vi/guide/errors) thay vì treo. `authType` giờ có kiểu [`LoginMethod`](/api/type-aliases/LoginMethod) thay vì `string`.
- `isAuthenticated()` trả về `false` khi chưa có phiên đăng nhập, trong khi 5.x reject với mã `401`. Hàm vẫn reject khi lỗi mạng.
- Mã `401` (chưa có phiên) và `422` (không đọc được profile) được thay bằng `NOT_AUTHENTICATED` và `INVALID_RESPONSE`.
- `logout()` reject lần `login()` đang chạy dở với `LOGIN_SUPERSEDED`.
- `getUserProfile()` không còn xin `phoneNumber`, `gender` hay `birthday`.

## Mới {#new}

- [`getAccessToken()`](/api/functions/getAccessToken) và [`refreshAccessToken()`](/api/functions/refreshAccessToken).
- [`ErrorCodes`](/api/variables/ErrorCodes).
- `login(type, { fallbackToWeb })`.
- Token được lưu mã hóa, token do 5.x lưu được chuyển sang tự động.
