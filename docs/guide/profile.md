---
description: "Read the signed-in Zalo user's ID, name and avatar from React Native with getUserProfile, and why phone number, gender and birthday are not available."
---

# User profile

```ts
import { getUserProfile } from 'react-native-zalo-kit';

const profile = await getUserProfile();
/*
  {
    id: '1234567890',
    name: 'User name',
    picture: { data: { url: 'https://...' } }
  }
*/
```

[`getUserProfile()`](/api/functions/getUserProfile) returns an [`IUserProfile`](/api/interfaces/IUserProfile). The access token is refreshed automatically when it has expired or Zalo reports it invalid.

## Phone number, gender and birthday

Zalo no longer returns `phoneNumber`, `gender` or `birthday` through this API. Getting a phone number requires Zalo's separate phone-number permission and a server-side call. The fields remain in the type only for compatibility and are `undefined`.
