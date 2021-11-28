#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ZaloKit, NSObject)

+ (BOOL) requiresMainQueueSetup {
    return YES;
}

RCT_EXTERN_METHOD(constantsToExport)

RCT_EXTERN_METHOD(login: (NSString *)authType
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(logout)

RCT_EXTERN_METHOD(isAuthenticated: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)


RCT_EXTERN_METHOD(getUserProfile: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getUserFriendList: (NSUInteger)offset
                  withCount: (NSUInteger)count
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getUserInvitableFriendList: (NSUInteger)offset
                  withCount: (NSUInteger)count
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(postFeed: (NSString *)message
                  withLink: (NSString *)link
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(postFeedByApp: (NSDictionary *)feedData
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendMessage: (NSString *)friendId
                  withMessage: (NSString *)message
                  withLink: (NSString *)link
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendMessageByApp: (NSDictionary *)feedData
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(inviteFriendUseApp: (NSString *)friendId
                  withMessage: (NSString *)message
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(register: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// ====== iOS only methods ======
//RCT_EXTERN_METHOD(sendOfficialAccountMessage: (NSString *)templateId
//                 withTemplateData: (NSDictionary *)templateData
//                 withResolver:(RCTPromiseResolveBlock)resolve
//                 withRejecter:(RCTPromiseRejectBlock)reject)
//
//RCT_EXTERN_METHOD(loginWithFacebook: (RCTPromiseResolveBlock)resolve
//                 withRejecter:(RCTPromiseRejectBlock)reject)
@end
