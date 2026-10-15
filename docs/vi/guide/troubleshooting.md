---
description: "Sửa các lỗi đăng nhập Zalo thường gặp trong React Native: sai hash key, ứng dụng chưa được đăng ký, iOS không quay lại app sau khi đăng nhập, Gradle không tìm thấy Zalo SDK."
---

# Khắc phục sự cố

## `the parameter pkg_name and sign_key are required` / "The application is not approved" {#the-parameter-pkg-name-and-sign-key-are-required-the-application-is-not-approved}

Package name hoặc hash key khai báo trên Zalo Developer Portal không khớp với bản build đang chạy. Đối chiếu bằng [`getApplicationHashKey()`](/vi/guide/zalo-app#from-the-running-app). Bản cài từ Google Play được Google ký lại, xem phần [Play App Signing](/vi/guide/zalo-app#for-play-app-signing).

## "Application is not registered for this request" {#application-is-not-registered-for-this-request}

Xin các quyền mà app cần trên Zalo Developer Portal (xem [Tạo ứng dụng Zalo](/vi/guide/zalo-app)).

## Đăng nhập trên iOS không bao giờ trả kết quả {#login-never-returns-on-ios}

Kiểm tra `AppDelegate` đã chuyển `application(_:open:options:)` cho `ZDKApplicationDelegate` **trước** các handler khác chưa, và URL type `zalo-<appId>` đã có chưa. Xem [hướng dẫn iOS](/vi/guide/ios#forward-the-callback-url).

## `NOT_CONFIGURED` {#not-configured}

Thiếu Zalo App ID: meta-data `com.zing.zalo.zalosdk.appID` trên Android ([hướng dẫn](/vi/guide/android#manifest)), hoặc `ZaloAppID` trong `Info.plist` trên iOS ([hướng dẫn](/vi/guide/ios#info-plist)).

## Gradle: `Could not find me.zalo:sdk-core` {#gradle-could-not-find-me-zalo-sdk-core}

Bản build của bạn bỏ qua các repository mà thư viện thêm vào, thường là do `settings.gradle` có khai báo `dependencyResolutionManagement`. Hãy thêm [Maven repository của Zalo](/vi/guide/android#zalo-maven-repository) vào đó.

## "Bản Zalo hiện tại không tương thích!" {#ban-zalo-hien-tai-khong-tuong-thich}

Xem [Lỗi đã biết từ phía Zalo](/vi/guide/known-issues#ban-zalo-hien-tai-khong-tuong-thich).
