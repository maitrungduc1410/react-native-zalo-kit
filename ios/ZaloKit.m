#import "ZaloKit.h"
#import <ZaloSDK/ZaloSDK.h>
#import <React/RCTLog.h>

@implementation ZaloKit

NSString *const AUTH_VIA_WEB = @"web";
NSString *const AUTH_VIA_APP = @"app";
NSString *const AUTH_VIA_APP_OR_WEB = @"app_or_web";

RCT_EXPORT_MODULE()

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
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(getFriendListUsedApp,
                position: (NSUInteger *)position
                count: (NSUInteger *)count
                resolverGetFriendListUsedApp:(RCTPromiseResolveBlock)resolve
                rejecterGetFriendListUsedApp:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] getUserFriendListAtOffset:(NSUInteger)position count:(NSUInteger)count
         callback:^(ZOGraphResponseObject *response) {
         
            if(response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(response.data);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(getFriendListInvitable,
                position: (NSUInteger *)position
                count: (NSUInteger *)count
                resolverGetFriendListInvitable:(RCTPromiseResolveBlock)resolve
                rejecterGetFriendListInvitable:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] getUserInvitableFriendListAtOffset:(NSUInteger)position count:(NSUInteger)count
         callback:^(ZOGraphResponseObject *response) {
         
            if(response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(response.data);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(postToWall,
                link: (NSString *)link
                message: (NSString *)message
                resolverPostToWall:(RCTPromiseResolveBlock)resolve
                rejecterPostToWall:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] postFeedWithMessage:message link:link callback:^(ZOGraphResponseObject *response) {
         
            if(response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(response.data);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(sendMessageToFriend,
                friendId: (NSString *)friendId
                link: (NSString *)link
                message: (NSString *)message
                resolverSendMessageToFriend:(RCTPromiseResolveBlock)resolve
                rejecterSendMessageToFriend:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] sendMessageTo:friendId message:message link:link callback:^(ZOGraphResponseObject *response) {
         
            if(response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(response.data);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(inviteFriendUseApp,
                friendIds: (NSString *)friendIds
                message: (NSString *)message
                resolverInviteFriendUseApp:(RCTPromiseResolveBlock)resolve
                rejecterInviteFriendUseApp:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[ZaloSDK sharedInstance] sendAppRequestTo:friendIds  message:message callback:^(ZOGraphResponseObject *response) {
         
            if(response.errorCode == kZaloSDKErrorCodeNoneError) {
                resolve(response.data);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(sendMessageToFriendByApp,
                feedData: (NSDictionary *)feedData
                resolverSendMessageToFriendByApp:(RCTPromiseResolveBlock)resolve
                rejecterSendMessageToFriendByApp:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        ZOFeed *feed = [[ZOFeed alloc] init];
        
        feed = [feed initWithLink:feedData[@"link"] appName:feedData[@"appName"] message:feedData[@"message"] others: feedData[@"others"]];
        
        feed.linkTitle = feedData[@"linkTitle"];
        feed.linkSource = feedData[@"linkSource"];
        feed.linkThumb = feedData[@"linkThumb"];
        feed.linkDesc = feedData[@"linkDesc"];
        
        UIViewController *presentedViewController = RCTPresentedViewController();
        
        [[ZaloSDK sharedInstance] sendMessage: feed
         inController: presentedViewController
         callback: ^(ZOShareResponseObject *response)
        {
            if (response.success) {
                // in here we sync send_action value with Android (0: sent, 1: cancel)
                NSNumber *syncSendAction = response.send_action == 1 ? [NSNumber numberWithInt:0] : [NSNumber numberWithInt:1];
                
                NSDictionary *result = @{
                    @"success": @(response.success),
                    @"data": response.result_data,
                    @"message": response.message,
                    @"sendAction": syncSendAction
                };
                
                resolve(result);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

RCT_REMAP_METHOD(postToWallByApp,
                feedData: (NSDictionary *)feedData
                resolverPostToWallByApp:(RCTPromiseResolveBlock)resolve
                rejecterPostToWallByApp:(RCTPromiseRejectBlock)reject
)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        ZOFeed *feed = [[ZOFeed alloc] init];
        
        feed = [feed initWithLink:feedData[@"link"] appName:feedData[@"appName"] message:feedData[@"message"] others: feedData[@"others"]];
        
        feed.linkTitle = feedData[@"linkTitle"];
        feed.linkSource = feedData[@"linkSource"];
        feed.linkThumb = feedData[@"linkThumb"];
        feed.linkDesc = feedData[@"linkDesc"];
        
        UIViewController *presentedViewController = RCTPresentedViewController();
        
        [[ZaloSDK sharedInstance] shareFeed: feed
         inController: presentedViewController
         callback: ^(ZOShareResponseObject *response)
        {
            if (response.success) {
                // in here we sync send_action value with Android (0: sent, 1: cancel)
                NSNumber *syncSendAction = response.send_action == 1 ? [NSNumber numberWithInt:0] : [NSNumber numberWithInt:1];
                
                NSDictionary *result = @{
                    @"success": @(response.success),
                    @"data": response.result_data,
                    @"message": response.message ? response.message : @"Successfully posted",
                    @"sendAction": syncSendAction
                };
                
                resolve(result);
            } else {
                NSString * errorCode = [NSString stringWithFormat:@"%ld", (long)response.errorCode];
                NSString * message = response.errorMessage;
                NSError * error  = [
                                    NSError errorWithDomain:@"OpenAPI Error"
                                    code:response.errorCode
                                    userInfo:@{NSLocalizedDescriptionKey:message}
                                    ];
                reject(errorCode, message, error);
            }
        }];
    });
}

@end
