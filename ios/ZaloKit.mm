#import "ZaloKit.h"
#import "ZaloSDK/ZaloSDK.h"
#import "PKCE.h"
#import <React/RCTUtils.h>

static NSString *const ZaloKitTokenDataKey = @"__RN_ZALO_KIT__";
static NSString *errorDetail = @"See here for more details: https://developers.zalo.me/docs/sdk/android-sdk/references/ma-loi";

@implementation ZaloKit
RCT_EXPORT_MODULE()

- (nonnull NSString *)getApplicationHashKey {
    return @"";
}

- (void)getUserProfile:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
    NSDictionary *tokenData = [self getTokenFromCache];
    if (!tokenData) {
        NSInteger errorCode = 401;
        NSError *error = [NSError errorWithDomain:@"Authentication error"
                                             code:errorCode
                                         userInfo:@{NSLocalizedDescriptionKey: @"Unauthenticated"}];
        reject([@(errorCode) stringValue], @"Unauthenticated", error);
        return;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] getZaloUserProfileWithAccessToken:tokenData[@"accessToken"]
                                                           callback:^(ZOGraphResponseObject * _Nullable response) {
            if (response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(response.data);
            } else {
                NSInteger errorCode = response.errorCode ?: 422;
                
                NSString *errMsg = response.errorMessage ?: @"";
                NSError *error = [NSError errorWithDomain:@"OpenAPI error"
                                                     code:errorCode
                                                 userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"%@. %@", errMsg, errorDetail]}];
                reject([@(errorCode) stringValue], response.errorMessage, error);
            }
        }];
    });
}

- (void)isAuthenticated:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
    NSDictionary *tokenData = [self getTokenFromCache];
    if (!tokenData) {
        NSInteger errorCode = 401;
        NSError *error = [NSError errorWithDomain:@"Authentication error"
                                             code:errorCode
                                         userInfo:@{NSLocalizedDescriptionKey: @"Unauthenticated"}];
        reject([@(errorCode) stringValue], @"Unauthenticated", error);
        return;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] validateRefreshToken:tokenData[@"refreshToken"]
                                               extInfo:nil
                                     completionHandler:^(ZOOauthResponseObject * _Nullable response) {
            if (response.isSucess) {
                resolve(@YES);
            } else {
                NSInteger errorCode = response.errorCode ?: 401;
                NSString *errMsg = response.errorMessage ?: @"";
                NSError *error = [NSError errorWithDomain:@"Authentication error"
                                                     code:errorCode
                                                 userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"%@. %@", errMsg, errorDetail]}];
                reject([@(errorCode) stringValue], response.errorMessage, error);
            }
        }];
    });
}

- (void)login:(nonnull NSString *)authType resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
    ZAZaloSDKAuthenType type = ZAZAloSDKAuthenTypeViaZaloAppAndWebView;
    if ([authType isEqualToString:@"AUTH_VIA_WEB"]) {
        type = ZAZaloSDKAuthenTypeViaWebViewOnly;
    } else if ([authType isEqualToString:@"AUTH_VIA_APP"]) {
        type = ZAZaloSDKAuthenTypeViaZaloAppOnly;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *presentedViewController = RCTPresentedViewController();
        NSString *codeVerifier = generateCodeVerifier() ?: @"";
        NSString *codeChallenge = generateCodeChallenge(codeVerifier);
        
        [[ZaloSDK sharedInstance] authenticateZaloWithAuthenType:type
                                                parentController:presentedViewController
                                                   codeChallenge:codeChallenge
                                                         extInfo:nil
                                                         handler:^(ZOOauthResponseObject * _Nullable response) {
            if (response.isSucess) {
                NSString *oauthCode = response.oauthCode ?: @"";
                [self getAccessTokenWithOAuthCode:oauthCode codeVerifier:codeVerifier completion:^(ZOTokenResponseObject * _Nullable tokenResponse) {
                    if (tokenResponse.isSucess) {
                        NSDictionary *tokenData = @{
                            @"accessToken": tokenResponse.accessToken ?: @"",
                            @"refreshToken": tokenResponse.refreshToken ?: @""
                        };
                        
                        NSDictionary *result = @{
                            @"accessToken": tokenData[@"accessToken"],
                            @"refreshToken": tokenData[@"refreshToken"]
                        };
                        
                        [self saveTokenToCache:tokenData];
                        resolve(result);
                    } else {
                        NSInteger errorCode = tokenResponse.errorCode ?: 401;
                        NSString *errMsg = tokenResponse.errorMessage ?: @"";
                        NSError *error = [NSError errorWithDomain:@"Authentication error"
                                                             code:errorCode
                                                         userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"%@. %@", errMsg, errorDetail]}];
                        reject([@(errorCode) stringValue], tokenResponse.errorMessage, error);
                    }
                }];
            } else {
                NSInteger errorCode = response.errorCode ?: 401;
                NSString *errMsg = response.errorMessage ?: @"";
                NSError *error = [NSError errorWithDomain:@"Authentication error"
                                                     code:errorCode
                                                 userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"%@. %@", errMsg, errorDetail]}];
                reject([@(errorCode) stringValue], response.errorMessage, error);
            }
        }];
    });
}

- (void)logout {
    [[ZaloSDK sharedInstance] unauthenticate];
    [[NSUserDefaults standardUserDefaults] removeObjectForKey:ZaloKitTokenDataKey];
}

- (NSDictionary *)getTokenFromCache {
    NSData *savedData = [[NSUserDefaults standardUserDefaults] objectForKey:ZaloKitTokenDataKey];
    if (savedData) {
        NSError *error;
        NSDictionary *loadedData = [NSJSONSerialization JSONObjectWithData:savedData options:0 error:&error];
        if (!error && [loadedData isKindOfClass:[NSDictionary class]]) {
            return loadedData;
        }
    }
    return nil;
}

- (void)saveTokenToCache:(NSDictionary *)data {
    NSError *error;
    NSData *encoded = [NSJSONSerialization dataWithJSONObject:data options:0 error:&error];
    if (!error) {
        [[NSUserDefaults standardUserDefaults] setObject:encoded forKey:ZaloKitTokenDataKey];
    }
}

- (void)getAccessTokenWithOAuthCode:(NSString *)oauthCode codeVerifier:(NSString *)codeVerifier completion:(void (^)(ZOTokenResponseObject * _Nullable))completion {
    [[ZaloSDK sharedInstance] getAccessTokenWithOAuthCode:oauthCode codeVerifier:codeVerifier completionHandler:completion];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeZaloKitSpecJSI>(params);
}


@end
