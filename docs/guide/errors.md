---
description: "Error codes rejected by react-native-zalo-kit and the Zalo SDK, and how to handle them in React Native."
---

# Error handling

Rejected promises carry a `code`:

```ts
import { ErrorCodes, login } from 'react-native-zalo-kit';

try {
  await login();
} catch (e: any) {
  if (e.code === ErrorCodes.ZALO_NOT_INSTALLED) {
    // ask the user to install Zalo
  }
}
```

## Zalo Kit codes

[`ErrorCodes`](/api/variables/ErrorCodes):

| `code` | Meaning |
| --- | --- |
| `ZALO_NOT_INSTALLED` | Zalo app is not installed and web fallback is disabled. |
| `ZALO_APP_INCOMPATIBLE` | Zalo app is installed but could not open the login screen, and web fallback is disabled. |
| `NOT_AUTHENTICATED` | No stored session. Call `login()`. |
| `NO_ACTIVITY` | No foreground activity / view controller to start login from. |
| `LOGIN_SUPERSEDED` | A newer `login()` call, or `logout()`, replaced this one. |
| `NOT_CONFIGURED` | The Zalo App ID is missing from the native project. |
| `INVALID_RESPONSE` | Zalo answered with an unexpected payload. |

## Zalo SDK codes

Other errors keep the numeric Zalo error code, as a string. Common ones:

| `code` | Meaning |
| --- | --- |
| `"-7008"` (Android) / `"-7035"` (iOS) | The user cancelled. On Android, `-7008` is also returned when the Zalo app is installed but not logged in. |
| `"-8001"` (Android) / `"-7024"`, `"-7025"` (iOS) | Network or server error; retry later. |
| `"-124"`, `"-216"`, `"-220"`, `"-5004"` | The access token is invalid or expired. `getUserProfile()` already refreshes and retries once. |

Full lists: [Android](https://developers.zalo.me/docs/sdk/android-sdk/references/ma-loi), [iOS](https://developers.zalo.me/docs/sdk/ios-sdk/references/ma-loi).
