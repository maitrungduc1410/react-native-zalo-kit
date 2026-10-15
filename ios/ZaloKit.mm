#import "ZaloKit.h"
#import "ZaloSDK/ZaloSDK.h"
#import "PKCE.h"
#import "ZaloKitTokenStore.h"
#import <React/RCTUtils.h>

static NSString *const errorDetail = @"See here for more details: https://developers.zalo.me/docs/sdk/ios-sdk/references/ma-loi";

static NSString *const ZaloKitErrorZaloNotInstalled = @"ZALO_NOT_INSTALLED";
static NSString *const ZaloKitErrorZaloAppIncompatible = @"ZALO_APP_INCOMPATIBLE";
static NSString *const ZaloKitErrorNotAuthenticated = @"NOT_AUTHENTICATED";
static NSString *const ZaloKitErrorNoActivity = @"NO_ACTIVITY";
static NSString *const ZaloKitErrorLoginSuperseded = @"LOGIN_SUPERSEDED";
static NSString *const ZaloKitErrorNotConfigured = @"NOT_CONFIGURED";
static NSString *const ZaloKitErrorInvalidResponse = @"INVALID_RESPONSE";

static NSString *const ZaloKitNotAuthenticatedMessage = @"No Zalo session. Call login() first";
static NSString *const ZaloKitNotConfiguredMessage = @"Zalo SDK is not initialized. Add ZaloAppID to Info.plist or call [[ZaloSDK sharedInstance] initializeWithAppId:] in AppDelegate";

static const NSInteger ZaloKitUnsupportedVersionError = -7022;
static const NSInteger ZaloKitRequiredZaloInstalledError = -7023;
static const double ZaloKitExpirySkewMs = 60000;

typedef void (^ZaloKitTokenCallback)(ZaloKitTokens *_Nullable tokens, NSString *_Nullable errorCode, NSString *_Nullable errorMessage);

static NSError *ZaloKitError(NSString *code, NSString *message) {
  NSInteger zaloCode = [code integerValue];
  return [NSError errorWithDomain:@"ZaloKit"
                             code:zaloCode != 0 ? zaloCode : -1
                         userInfo:@{NSLocalizedDescriptionKey: [NSString stringWithFormat:@"%@. %@", message, errorDetail]}];
}

static BOOL ZaloKitIsAccessTokenError(NSInteger code) {
  return code == -124 || code == -216 || code == -220 || code == -5004;
}

static BOOL ZaloKitIsTransientError(NSInteger code) {
  return code == -7024 || code == -7025 || code == -8000 || code == -8001;
}

@interface ZaloKitLoginSession : NSObject
@property (nonatomic, copy) RCTPromiseResolveBlock resolve;
@property (nonatomic, copy) RCTPromiseRejectBlock reject;
@property (nonatomic, copy) NSString *codeVerifier;
@property (nonatomic, copy) NSString *codeChallenge;
@property (nonatomic, assign) BOOL fallbackToWeb;
@property (nonatomic, assign) BOOL webFallbackUsed;
@property (nonatomic, assign) BOOL oauthReceived;
@end

@implementation ZaloKitLoginSession
@end

// All state below is confined to the main queue (see -methodQueue).
@implementation ZaloKit {
  ZaloKitTokenStore *_tokenStore;
  ZaloKitLoginSession *_loginSession;
  NSMutableArray<ZaloKitTokenCallback> *_refreshWaiters;
}

RCT_EXPORT_MODULE()

- (instancetype)init {
  if (self = [super init]) {
    _tokenStore = [ZaloKitTokenStore new];
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (nonnull NSString *)getApplicationHashKey {
  return @"";
}

#pragma mark - Login

- (void)login:(nonnull NSString *)authType fallbackToWeb:(BOOL)fallbackToWeb resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  if (![self ensureInitialized]) {
    reject(ZaloKitErrorNotConfigured, ZaloKitNotConfiguredMessage, ZaloKitError(ZaloKitErrorNotConfigured, ZaloKitNotConfiguredMessage));
    return;
  }
  UIViewController *presentedViewController = RCTPresentedViewController();
  if (!presentedViewController) {
    NSString *message = @"There is no view controller to start Zalo login from";
    reject(ZaloKitErrorNoActivity, message, ZaloKitError(ZaloKitErrorNoActivity, message));
    return;
  }

  ZAZaloSDKAuthenType type = ZAZAloSDKAuthenTypeViaZaloAppAndWebView;
  if ([authType isEqualToString:@"AUTH_VIA_WEB"]) {
    type = ZAZaloSDKAuthenTypeViaWebViewOnly;
  } else if ([authType isEqualToString:@"AUTH_VIA_APP"]) {
    type = ZAZaloSDKAuthenTypeViaZaloAppOnly;
  }

  if (_loginSession) {
    [self rejectLogin:_loginSession code:ZaloKitErrorLoginSuperseded message:@"A newer login() call replaced this one"];
  }

  ZaloKitLoginSession *session = [ZaloKitLoginSession new];
  session.resolve = resolve;
  session.reject = reject;
  session.codeVerifier = generateCodeVerifier() ?: @"";
  session.codeChallenge = generateCodeChallenge(session.codeVerifier) ?: @"";
  session.fallbackToWeb = fallbackToWeb && type != ZAZaloSDKAuthenTypeViaWebViewOnly;
  _loginSession = session;

  [self authenticate:session type:type controller:presentedViewController];
}

- (void)authenticate:(ZaloKitLoginSession *)session type:(ZAZaloSDKAuthenType)type controller:(UIViewController *)controller {
  __weak __typeof(self) weakSelf = self;
  [[ZaloSDK sharedInstance] authenticateZaloWithAuthenType:type
                                          parentController:controller
                                             codeChallenge:session.codeChallenge
                                                   extInfo:nil
                                                   handler:^(ZOOauthResponseObject * _Nullable response) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [weakSelf handleAuthResponse:response session:session type:type];
    });
  }];
}

- (void)handleAuthResponse:(ZOOauthResponseObject *)response session:(ZaloKitLoginSession *)session type:(ZAZaloSDKAuthenType)type {
  if (_loginSession != session || session.oauthReceived) {
    return;
  }

  if (response.isSucess && response.oauthCode.length > 0) {
    session.oauthReceived = YES;
    [self exchangeOAuthCode:response.oauthCode session:session];
    return;
  }

  NSInteger errorCode = response.errorCode ?: -8000;
  BOOL appUnavailable = type != ZAZaloSDKAuthenTypeViaWebViewOnly &&
    (errorCode == ZaloKitRequiredZaloInstalledError || errorCode == ZaloKitUnsupportedVersionError);

  if (appUnavailable && session.fallbackToWeb && !session.webFallbackUsed) {
    UIViewController *controller = RCTPresentedViewController();
    if (!controller) {
      [self rejectLogin:session code:ZaloKitErrorNoActivity message:@"There is no view controller to start Zalo login from"];
      return;
    }
    session.webFallbackUsed = YES;
    [self authenticate:session type:ZAZaloSDKAuthenTypeViaWebViewOnly controller:controller];
    return;
  }

  if (appUnavailable) {
    BOOL notInstalled = errorCode == ZaloKitRequiredZaloInstalledError;
    [self rejectLogin:session
                 code:notInstalled ? ZaloKitErrorZaloNotInstalled : ZaloKitErrorZaloAppIncompatible
              message:notInstalled ? @"Zalo app is not installed" : @"The installed Zalo app could not handle the login request"];
    return;
  }

  NSString *message = response.errorMessage.length > 0 ? response.errorMessage : [NSString stringWithFormat:@"Zalo login failed (code %ld)", (long)errorCode];
  [self rejectLogin:session code:[@(errorCode) stringValue] message:message];
}

- (void)exchangeOAuthCode:(NSString *)oauthCode session:(ZaloKitLoginSession *)session {
  __weak __typeof(self) weakSelf = self;
  [[ZaloSDK sharedInstance] getAccessTokenWithOAuthCode:oauthCode
                                           codeVerifier:session.codeVerifier
                                      completionHandler:^(ZOTokenResponseObject * _Nullable tokenResponse) {
    dispatch_async(dispatch_get_main_queue(), ^{
      __strong __typeof(weakSelf) strongSelf = weakSelf;
      if (!strongSelf || strongSelf->_loginSession != session) {
        return;
      }
      ZaloKitTokens *tokens = [strongSelf tokensFromResponse:tokenResponse previousRefreshToken:nil];
      if (!tokens) {
        [strongSelf rejectLogin:session code:[strongSelf errorCodeFromResponse:tokenResponse] message:[strongSelf errorMessageFromResponse:tokenResponse]];
        return;
      }
      [strongSelf->_tokenStore write:tokens];
      strongSelf->_loginSession = nil;
      session.resolve([strongSelf resultFromTokens:tokens]);
    });
  }];
}

- (void)rejectLogin:(ZaloKitLoginSession *)session code:(NSString *)code message:(NSString *)message {
  if (_loginSession != session) {
    return;
  }
  _loginSession = nil;
  session.reject(code, message, ZaloKitError(code, message));
}

#pragma mark - Session

- (void)logout {
  if (_loginSession) {
    [self rejectLogin:_loginSession code:ZaloKitErrorLoginSuperseded message:@"logout() was called during login"];
  }
  [[ZaloSDK sharedInstance] unauthenticate];
  [_tokenStore clear];
}

- (void)isAuthenticated:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  // Validating the refresh token that an in-flight refresh is about to rotate would report a
  // false logout, so wait for that refresh instead.
  if (_refreshWaiters) {
    [_refreshWaiters addObject:[^(ZaloKitTokens *tokens, NSString *errorCode, NSString *errorMessage) {
      NSInteger zaloCode = [errorCode integerValue];
      if (tokens) {
        resolve(@YES);
      } else if ([errorCode isEqualToString:ZaloKitErrorNotAuthenticated] || (zaloCode != 0 && !ZaloKitIsTransientError(zaloCode))) {
        resolve(@NO);
      } else {
        reject(errorCode, errorMessage, ZaloKitError(errorCode, errorMessage));
      }
    } copy]];
    return;
  }

  ZaloKitTokens *tokens = [_tokenStore read];
  if (!tokens) {
    resolve(@NO);
    return;
  }
  if (![self ensureInitialized]) {
    reject(ZaloKitErrorNotConfigured, ZaloKitNotConfiguredMessage, ZaloKitError(ZaloKitErrorNotConfigured, ZaloKitNotConfiguredMessage));
    return;
  }

  NSString *refreshToken = tokens.refreshToken;
  __weak __typeof(self) weakSelf = self;
  [[ZaloSDK sharedInstance] validateRefreshToken:refreshToken
                                         extInfo:nil
                               completionHandler:^(ZOOauthResponseObject * _Nullable response) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (response.isSucess) {
        resolve(@YES);
      } else if (ZaloKitIsTransientError(response.errorCode)) {
        NSString *code = [@(response.errorCode) stringValue];
        NSString *message = [NSString stringWithFormat:@"Could not reach Zalo to validate the session (code %@)", code];
        reject(code, message, ZaloKitError(code, message));
      } else {
        // A refresh that started after this check may have rotated the token meanwhile.
        __strong __typeof(weakSelf) strongSelf = weakSelf;
        ZaloKitTokens *current = strongSelf ? [strongSelf->_tokenStore read] : nil;
        resolve(@(current != nil && ![current.refreshToken isEqualToString:refreshToken]));
      }
    });
  }];
}

- (void)getAccessToken:(BOOL)forceRefresh resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  __weak __typeof(self) weakSelf = self;
  [self withValidTokens:forceRefresh callback:^(ZaloKitTokens *tokens, NSString *errorCode, NSString *errorMessage) {
    if (tokens) {
      resolve([weakSelf resultFromTokens:tokens]);
    } else {
      reject(errorCode, errorMessage, ZaloKitError(errorCode, errorMessage));
    }
  }];
}

- (void)withValidTokens:(BOOL)forceRefresh callback:(ZaloKitTokenCallback)callback {
  ZaloKitTokens *tokens = [_tokenStore read];
  if (!tokens) {
    callback(nil, ZaloKitErrorNotAuthenticated, ZaloKitNotAuthenticatedMessage);
    return;
  }
  if (!forceRefresh && tokens.accessToken.length > 0 && ![self isExpired:tokens]) {
    callback(tokens, nil, nil);
    return;
  }
  [self refreshTokens:callback];
}

// Refresh tokens are single-use, so concurrent callers must share one request.
- (void)refreshTokens:(ZaloKitTokenCallback)callback {
  if (_refreshWaiters) {
    [_refreshWaiters addObject:[callback copy]];
    return;
  }
  ZaloKitTokens *tokens = [_tokenStore read];
  if (!tokens) {
    callback(nil, ZaloKitErrorNotAuthenticated, ZaloKitNotAuthenticatedMessage);
    return;
  }
  if (![self ensureInitialized]) {
    callback(nil, ZaloKitErrorNotConfigured, ZaloKitNotConfiguredMessage);
    return;
  }

  _refreshWaiters = [NSMutableArray arrayWithObject:[callback copy]];
  NSString *refreshToken = tokens.refreshToken;
  __weak __typeof(self) weakSelf = self;
  [[ZaloSDK sharedInstance] getAccessTokenWithRefreshToken:refreshToken
                                         completionHandler:^(ZOTokenResponseObject * _Nullable response) {
    dispatch_async(dispatch_get_main_queue(), ^{
      __strong __typeof(weakSelf) strongSelf = weakSelf;
      if (!strongSelf) {
        return;
      }
      NSArray<ZaloKitTokenCallback> *waiters = strongSelf->_refreshWaiters;
      strongSelf->_refreshWaiters = nil;

      ZaloKitTokens *current = [strongSelf->_tokenStore read];
      ZaloKitTokens *result = nil;
      NSString *errorCode = nil;
      NSString *errorMessage = nil;
      if (![current.refreshToken isEqualToString:refreshToken]) {
        // logout() or a new login() happened while refreshing.
        result = current;
        if (!result) {
          errorCode = ZaloKitErrorNotAuthenticated;
          errorMessage = ZaloKitNotAuthenticatedMessage;
        }
      } else {
        result = [strongSelf tokensFromResponse:response previousRefreshToken:refreshToken];
        if (result) {
          [strongSelf->_tokenStore write:result];
        } else {
          errorCode = [strongSelf errorCodeFromResponse:response];
          errorMessage = [strongSelf errorMessageFromResponse:response];
        }
      }
      for (ZaloKitTokenCallback waiter in waiters) {
        waiter(result, errorCode, errorMessage);
      }
    });
  }];
}

#pragma mark - Profile

- (void)getUserProfile:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject {
  if (![self ensureInitialized]) {
    reject(ZaloKitErrorNotConfigured, ZaloKitNotConfiguredMessage, ZaloKitError(ZaloKitErrorNotConfigured, ZaloKitNotConfiguredMessage));
    return;
  }
  [self fetchProfileWithResolve:resolve reject:reject allowRetry:YES forceRefresh:NO];
}

- (void)fetchProfileWithResolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject allowRetry:(BOOL)allowRetry forceRefresh:(BOOL)forceRefresh {
  __weak __typeof(self) weakSelf = self;
  [self withValidTokens:forceRefresh callback:^(ZaloKitTokens *tokens, NSString *errorCode, NSString *errorMessage) {
    if (!tokens) {
      reject(errorCode, errorMessage, ZaloKitError(errorCode, errorMessage));
      return;
    }
    [[ZaloSDK sharedInstance] getZaloUserProfileWithAccessToken:tokens.accessToken
                                                       callback:^(ZOGraphResponseObject * _Nullable response) {
      dispatch_async(dispatch_get_main_queue(), ^{
        if (response.errorCode == kZaloSDKErrorCodeNoneError && response.data) {
          resolve(response.data);
          return;
        }
        if (allowRetry && ZaloKitIsAccessTokenError(response.errorCode)) {
          [weakSelf fetchProfileWithResolve:resolve reject:reject allowRetry:NO forceRefresh:YES];
          return;
        }
        NSInteger code = response.errorCode ?: -8000;
        NSString *codeString = [@(code) stringValue];
        NSString *message = response.errorMessage.length > 0 ? response.errorMessage : [NSString stringWithFormat:@"Could not get user profile (code %@)", codeString];
        reject(codeString, message, ZaloKitError(codeString, message));
      });
    }];
  }];
}

#pragma mark - Helpers

- (BOOL)ensureInitialized {
  if ([[ZaloSDK sharedInstance] appId].length > 0) {
    return YES;
  }
  id appId = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"ZaloAppID"];
  if ([appId isKindOfClass:[NSNumber class]]) {
    appId = [appId stringValue];
  }
  if (![appId isKindOfClass:[NSString class]] || [appId length] == 0) {
    return NO;
  }
  [[ZaloSDK sharedInstance] initializeWithAppId:appId];
  return YES;
}

- (BOOL)isExpired:(ZaloKitTokens *)tokens {
  if (tokens.expiresAt <= 0) {
    return NO;
  }
  return [self nowMs] >= tokens.expiresAt - ZaloKitExpirySkewMs;
}

- (double)nowMs {
  return [[NSDate date] timeIntervalSince1970] * 1000.0;
}

- (nullable ZaloKitTokens *)tokensFromResponse:(ZOTokenResponseObject *)response previousRefreshToken:(nullable NSString *)previousRefreshToken {
  if (!response.isSucess || response.accessToken.length == 0) {
    return nil;
  }
  ZaloKitTokens *tokens = [ZaloKitTokens new];
  tokens.accessToken = response.accessToken;
  tokens.refreshToken = response.refreshToken.length > 0 ? response.refreshToken : (previousRefreshToken ?: @"");
  tokens.expiresAt = [self expiresAtFromSDKValue:response.expriedTime];
  return tokens;
}

// The SDK documents `expriedTime` only as "when the access token expires", without saying whether
// it is a duration or a timestamp, so accept both.
- (double)expiresAtFromSDKValue:(NSTimeInterval)value {
  if (value <= 0) {
    return 0;
  }
  if (value > 1e12) {
    return value;
  }
  if (value > 1e9) {
    return value * 1000.0;
  }
  return [self nowMs] + value * 1000.0;
}

- (NSString *)errorCodeFromResponse:(ZOResponseObject *)response {
  return response && response.errorCode != 0 ? [@(response.errorCode) stringValue] : ZaloKitErrorInvalidResponse;
}

- (NSString *)errorMessageFromResponse:(ZOResponseObject *)response {
  return response.errorMessage.length > 0 ? response.errorMessage : @"Could not get an access token from Zalo";
}

- (NSDictionary *)resultFromTokens:(ZaloKitTokens *)tokens {
  double expiresIn = tokens.expiresAt > 0 ? MAX(0, floor((tokens.expiresAt - [self nowMs]) / 1000.0)) : 0;
  return @{
    @"accessToken": tokens.accessToken ?: @"",
    @"refreshToken": tokens.refreshToken ?: @"",
    @"expiresIn": @(expiresIn),
    @"expiresAt": @(tokens.expiresAt),
  };
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeZaloKitSpecJSI>(params);
}

@end
