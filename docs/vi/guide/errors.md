---
description: "Các mã lỗi mà react-native-zalo-kit và Zalo SDK trả về khi reject, và cách xử lý chúng trong React Native."
---

# Xử lý lỗi

Khi promise bị reject, lỗi trả về có trường `code`:

```ts
import { ErrorCodes, login } from 'react-native-zalo-kit';

try {
  await login();
} catch (e: any) {
  if (e.code === ErrorCodes.ZALO_NOT_INSTALLED) {
    // nhắc người dùng cài Zalo
  }
}
```

## Mã lỗi của Zalo Kit {#zalo-kit-codes}

[`ErrorCodes`](/api/variables/ErrorCodes):

| `code` | Ý nghĩa |
| --- | --- |
| `ZALO_NOT_INSTALLED` | Máy chưa cài app Zalo và `fallbackToWeb` đang tắt. |
| `ZALO_APP_INCOMPATIBLE` | Máy có app Zalo nhưng không mở được màn hình đăng nhập, và `fallbackToWeb` đang tắt. |
| `NOT_AUTHENTICATED` | Chưa có phiên đăng nhập nào được lưu. Hãy gọi `login()`. |
| `NO_ACTIVITY` | Không có activity / view controller nào đang hiển thị để bắt đầu đăng nhập. |
| `LOGIN_SUPERSEDED` | Một lệnh `login()` mới hơn, hoặc `logout()`, đã thay thế lần gọi này. |
| `NOT_CONFIGURED` | Project native chưa khai báo Zalo App ID. |
| `INVALID_RESPONSE` | Zalo trả về dữ liệu không đúng định dạng. |

## Mã lỗi của Zalo SDK {#zalo-sdk-codes}

Các lỗi còn lại giữ nguyên mã lỗi số của Zalo, ở dạng chuỗi. Một số mã hay gặp:

| `code` | Ý nghĩa |
| --- | --- |
| `"-7008"` (Android) / `"-7035"` (iOS) | Người dùng hủy. Trên Android, `-7008` cũng xuất hiện khi máy có app Zalo nhưng chưa đăng nhập. |
| `"-8001"` (Android) / `"-7024"`, `"-7025"` (iOS) | Lỗi mạng hoặc lỗi server, thử lại sau. |
| `"-124"`, `"-216"`, `"-220"`, `"-5004"` | Access token không hợp lệ hoặc đã hết hạn. `getUserProfile()` đã tự refresh và thử lại một lần. |

Danh sách đầy đủ: [Android](https://developers.zalo.me/docs/sdk/android-sdk/references/ma-loi), [iOS](https://developers.zalo.me/docs/sdk/ios-sdk/references/ma-loi).
