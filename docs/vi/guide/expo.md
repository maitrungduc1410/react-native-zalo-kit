---
description: "Cấu hình đăng nhập Zalo cho app Expo bằng config plugin của react-native-zalo-kit: AndroidManifest, Info.plist và xử lý URL trong AppDelegate."
---

# Expo

Zalo Kit có sẵn config plugin, nên dự án Expo không phải sửa tay phần native nào.

## Thêm plugin {#add-the-plugin}

```json [app.json]
{
  "expo": {
    "plugins": [["react-native-zalo-kit", { "appId": "<YOUR_ZALO_APP_ID>" }]]
  }
}
```

Sau đó sinh project native bằng `npx expo prebuild`, hoặc build bằng EAS. Expo Go không dùng được vì Zalo SDK là code native, bạn cần dùng [development build](https://docs.expo.dev/develop/development-builds/introduction/).

## Tùy chọn {#options}

| Tùy chọn | Kiểu | Mô tả |
| --- | --- | --- |
| `appId` | `string` | **Bắt buộc.** [Zalo App ID](/vi/guide/zalo-app) của bạn (dạng số). |

::: warning Truyền `appId` dưới dạng chuỗi
Zalo App ID dài 19 chữ số, vượt quá độ chính xác của số trong JSON: `2451745039837416278` sẽ bị đọc thành `2451745039837416400`. Plugin sẽ báo lỗi nếu nhận một số đã bị mất chính xác như vậy.
:::

## Plugin thay đổi những gì {#what-the-plugin-changes}

**Android**

- thêm string resource `zalokit_app_id`;
- thêm meta-data `com.zing.zalo.zalosdk.appID` vào `AndroidManifest.xml`;
- thêm `BrowserLoginActivity` với scheme `zalo-<appId>`.

**iOS**

- đặt `ZaloAppID` trong `Info.plist`;
- thêm `zalosdk` và `zaloshareext` vào `LSApplicationQueriesSchemes`;
- thêm URL type `zalo-<appId>`;
- sửa `application(_:open:options:)` trong `AppDelegate` để chuyển URL callback của Zalo cho SDK xử lý trước. Hỗ trợ cả template Swift `ExpoAppDelegate` (SDK 53 trở lên) lẫn template `AppDelegate` Objective-C.

Chạy prebuild lại bao nhiêu lần cũng không sao: không có gì bị thêm trùng, và scheme được cập nhật nếu bạn đổi `appId`.

::: tip AppDelegate tự viết
Nếu `AppDelegate` của bạn không có method `application(_:open:options:)`, prebuild sẽ báo lỗi kèm link tới phần thiết lập iOS. Hãy thêm method đó và chuyển URL cho SDK như trong [hướng dẫn iOS](/vi/guide/ios#forward-the-callback-url), rồi chạy lại prebuild. Plugin sẽ không đụng vào `AppDelegate` nào đã gọi `ZDKApplicationDelegate`.
:::
