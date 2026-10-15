---
description: "How Zalo Kit stores Zalo access and refresh tokens securely, refreshes them automatically, and checks whether the session is still valid."
---

# Tokens and sessions

## Get an access token

```ts
import { getAccessToken, refreshAccessToken } from 'react-native-zalo-kit';

// Stored token, refreshed first if it expires within 60 seconds
const { accessToken } = await getAccessToken();

// Always ask Zalo for a new token
const fresh = await refreshAccessToken(); // same as getAccessToken({ forceRefresh: true })
```

[`getAccessToken()`](/api/functions/getAccessToken) rejects with `NOT_AUTHENTICATED` when there is no session. If Zalo rejects the refresh token, it rejects with the numeric Zalo error code; call `login()` again.

## Check the session

```ts
import { isAuthenticated } from 'react-native-zalo-kit';

const loggedIn = await isAuthenticated();
```

[`isAuthenticated()`](/api/functions/isAuthenticated) asks Zalo whether the stored refresh token is still valid:

- `true`: the session is valid;
- `false`: there is no session, or Zalo rejected it;
- rejects on network or server errors, so a flaky connection is not mistaken for a logout.

## Refresh

- Zalo access tokens are short-lived (about 1 hour). Refresh tokens last longer but are **single-use**: each refresh returns a new refresh token, which Zalo Kit stores for you.
- `getAccessToken()` and `getUserProfile()` refresh automatically. Concurrent calls share one refresh request, and `isAuthenticated()` waits for a refresh in progress instead of checking a token that is about to be replaced.
- If your backend also refreshes tokens with the same refresh token, the two invalidate each other. Pick one side to own refreshing.

## Storage

- **Android**: encrypted with an AES-GCM key that never leaves the Android Keystore. If the Keystore is unusable on a device, tokens are kept in memory for the lifetime of the process.
- **iOS**: stored in the Keychain with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`. The session is cleared after the app is reinstalled, matching Android.
- Tokens stored by 5.x (in SharedPreferences / NSUserDefaults) are migrated on first use, and removed once the migration succeeded.
