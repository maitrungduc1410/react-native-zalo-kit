---
description: "Lấy ID, tên và ảnh đại diện của người dùng Zalo đang đăng nhập bằng getUserProfile, và lý do không lấy được số điện thoại, giới tính, ngày sinh."
---

# Thông tin người dùng

```ts
import { getUserProfile } from 'react-native-zalo-kit';

const profile = await getUserProfile();
/*
  {
    id: '1234567890',
    name: 'Tên người dùng',
    picture: { data: { url: 'https://...' } }
  }
*/
```

[`getUserProfile()`](/api/functions/getUserProfile) trả về một [`IUserProfile`](/api/interfaces/IUserProfile). Access token được làm mới tự động nếu đã hết hạn hoặc bị Zalo báo không hợp lệ.

## Số điện thoại, giới tính và ngày sinh {#phone-number-gender-and-birthday}

Zalo không còn trả về `phoneNumber`, `gender` hay `birthday` qua API này. Muốn lấy số điện thoại, bạn phải xin quyền số điện thoại riêng của Zalo và gọi từ phía server. Các trường này vẫn nằm trong type để tương thích với code cũ, giá trị luôn là `undefined`.
