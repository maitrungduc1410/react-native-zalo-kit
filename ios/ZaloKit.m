#import "ZaloKit.h"
#import <ZaloSDK/ZaloSDK.h>
#import <React/RCTLog.h>

@implementation ZaloKit

NSString *const AUTH_VIA_WEB = @"web";
NSString *const AUTH_VIA_APP = @"app";
NSString *const AUTH_VIA_APP_OR_WEB = @"app_or_web";

RCT_EXPORT_MODULE()

RCT_REMAP_METHOD(login,
                authType: (nullable NSString *)authType
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        enum ZAZaloSDKAuthenType type = ZAZAloSDKAuthenTypeViaZaloAppAndWebView;
        
        if ([authType  isEqualToString: AUTH_VIA_WEB]) {
            type = ZAZaloSDKAuthenTypeViaWebViewOnly;
        } else if ([authType isEqualToString: AUTH_VIA_APP]) {
            type = ZAZaloSDKAuthenTypeViaZaloAppOnly;
        }
        
        UIViewController *presentedViewController = RCTPresentedViewController();
        [[ZaloSDK sharedInstance] authenticateZaloWithAuthenType:type
                                  parentController:presentedViewController
                                  handler:^(ZOOauthResponseObject *response) {
            if([response isSucess]) {
                resolve(response.oauthCode);
            } else if(response.errorCode != kZaloSDKErrorCodeUserCancel) {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"Authentication error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
    
    
}

RCT_EXPORT_METHOD(logout) {
    [[ZaloSDK sharedInstance] unauthenticate];
}

RCT_REMAP_METHOD(getUserProfile,
                resolverUserProfile:(RCTPromiseResolveBlock)resolve
                rejecterUserProfile:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] getZaloUserProfileWithCallback:
                                    ^(ZOGraphResponseObject *response) {
          
            if(response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(response.data);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"UserProfileError"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(isAuthenticated,
                resolverIsAuthenticated:(RCTPromiseResolveBlock)resolve
                rejecterIsAuthenticated:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] isAuthenticatedZaloWithCompletionHandler:
         ^(ZOOauthResponseObject *response) {
         
            if(response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(@YES);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"Authentication Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

- (NSDictionary *)constantsToExport
{
  return @{
      @"AUTH_VIA_WEB": AUTH_VIA_WEB,
      @"AUTH_VIA_APP": AUTH_VIA_APP,
      @"AUTH_VIA_APP_OR_WEB": AUTH_VIA_APP_OR_WEB,
  };
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
