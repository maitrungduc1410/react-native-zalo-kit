---
description: "在 React Native 中用 getUserProfile 获取当前 Zalo 用户的 ID、昵称和头像，以及为什么拿不到手机号、性别和生日。"
---

# 用户资料

```ts
import { getUserProfile } from 'react-native-zalo-kit';

const profile = await getUserProfile();
/*
  {
    id: '1234567890',
    name: '用户昵称',
    picture: { data: { url: 'https://...' } }
  }
*/
```

[`getUserProfile()`](/api/functions/getUserProfile) 返回一个 [`IUserProfile`](/api/interfaces/IUserProfile)。如果 access token 已过期或被 Zalo 判定无效，会自动刷新。

## 手机号、性别和生日 {#phone-number-gender-and-birthday}

Zalo 已不再通过这个 API 返回 `phoneNumber`、`gender` 和 `birthday`。获取手机号需要单独申请 Zalo 的手机号权限，并从服务端调用。这些字段保留在类型中只是为了兼容，值始终为 `undefined`。
