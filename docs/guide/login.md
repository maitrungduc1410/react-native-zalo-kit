---
description: "Sign users in with Zalo from React Native: login methods, web fallback when the Zalo app is missing, the result and what can go wrong."
---

# Login

```ts
import { Constants, login } from 'react-native-zalo-kit';

const { accessToken, refreshToken, expiresIn, expiresAt } = await login(
  Constants.AUTH_VIA_APP_OR_WEB
);
```

[`login(authType?, options?)`](/api/functions/login) signs the user in and stores the tokens on the device. You usually don't need to keep the result: [`getAccessToken()`](/guide/tokens) and [`getUserProfile()`](/guide/profile) read the stored session.

## Login methods

| `authType` | Behavior |
| --- | --- |
| `AUTH_VIA_APP_OR_WEB` (default) | Zalo app if available, otherwise web login. |
| `AUTH_VIA_APP` | Zalo app only. |
| `AUTH_VIA_WEB` | Web login only. |

Prefer the app: Zalo's web login may ask the user to scan a QR code with Zalo on another device (see [Known Zalo-side issues](/guide/known-issues)).

## Web fallback

`options.fallbackToWeb` decides what happens when the Zalo app is missing or cannot open the login screen:

- `true`: continue with web login;
- `false`: reject with `ZALO_NOT_INSTALLED` or `ZALO_APP_INCOMPATIBLE`.

It defaults to `true` for `AUTH_VIA_APP_OR_WEB` and `false` for `AUTH_VIA_APP`.

```ts
// App only, but fall back to web if the Zalo app cannot be opened
await login(Constants.AUTH_VIA_APP, { fallbackToWeb: true });

// Never show web login; tell the user to install or update Zalo instead
await login(Constants.AUTH_VIA_APP_OR_WEB, { fallbackToWeb: false });
```

## Result

[`IZaloAuthResponse`](/api/interfaces/IZaloAuthResponse):

```ts
{
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until the access token expires, 0 if unknown
  expiresAt: number; // epoch milliseconds, 0 if unknown
}
```

## When login fails

The promise always settles. Common rejections:

| `code` | When |
| --- | --- |
| `"-7008"` (Android) / `"-7035"` (iOS) | The user cancelled. On Android, also when Zalo is installed but not logged in. |
| `ZALO_NOT_INSTALLED` / `ZALO_APP_INCOMPATIBLE` | The Zalo app cannot be used and web fallback is off. |
| `LOGIN_SUPERSEDED` | `login()` was called again, or `logout()` was called, before this login finished. |
| `NOT_CONFIGURED` | The Zalo App ID is missing from the native project. |

See [Error handling](/guide/errors) for the full list.

## Logout

```ts
import { logout } from 'react-native-zalo-kit';

logout();
```

[`logout()`](/api/functions/logout) ends the SDK session and deletes the stored tokens.
