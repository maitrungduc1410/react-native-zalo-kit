#import "ZaloKitTokenStore.h"
#import <Security/Security.h>
#import <UIKit/UIKit.h>

static NSString *const ZaloKitKeychainAccount = @"tokens";
static NSString *const ZaloKitLegacyDefaultsKey = @"__RN_ZALO_KIT__";
static NSString *const ZaloKitInstalledDefaultsKey = @"__RN_ZALO_KIT_INSTALLED__";

@implementation ZaloKitTokens
@end

@implementation ZaloKitTokenStore {
  ZaloKitTokens *_cached;
  BOOL _loaded;
}

- (nullable ZaloKitTokens *)read {
  if (!_loaded) {
    // Before the first unlock after a reboot neither the Keychain item nor NSUserDefaults can be
    // read reliably, so don't cache a miss or mistake it for a reinstall.
    if (![UIApplication sharedApplication].isProtectedDataAvailable) {
      return nil;
    }
    _loaded = YES;
    [self discardIfReinstalled];
    _cached = [self migrateLegacy] ?: [self load];
  }
  return _cached;
}

- (BOOL)write:(ZaloKitTokens *)tokens {
  _cached = tokens;
  _loaded = YES;
  NSDictionary *payload = @{
    @"accessToken": tokens.accessToken ?: @"",
    @"refreshToken": tokens.refreshToken ?: @"",
    @"expiresAt": @(tokens.expiresAt),
  };
  NSData *data = [NSJSONSerialization dataWithJSONObject:payload options:0 error:nil];
  if (!data) {
    return NO;
  }

  SecItemDelete((__bridge CFDictionaryRef)[self baseQuery]);
  NSMutableDictionary *attributes = [self baseQuery];
  attributes[(__bridge id)kSecValueData] = data;
  attributes[(__bridge id)kSecAttrAccessible] = (__bridge id)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly;
  OSStatus status = SecItemAdd((__bridge CFDictionaryRef)attributes, NULL);
  if (status != errSecSuccess) {
    NSLog(@"[ZaloKit] Could not persist Zalo tokens (OSStatus %d), keeping them in memory only", (int)status);
    return NO;
  }
  return YES;
}

- (void)clear {
  _cached = nil;
  _loaded = YES;
  SecItemDelete((__bridge CFDictionaryRef)[self baseQuery]);
  [[NSUserDefaults standardUserDefaults] removeObjectForKey:ZaloKitLegacyDefaultsKey];
}

#pragma mark - Private

- (NSMutableDictionary *)baseQuery {
  NSString *service = [NSString stringWithFormat:@"%@.zalokit", [[NSBundle mainBundle] bundleIdentifier] ?: @"app"];
  return [@{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService: service,
    (__bridge id)kSecAttrAccount: ZaloKitKeychainAccount,
  } mutableCopy];
}

- (nullable ZaloKitTokens *)load {
  NSMutableDictionary *query = [self baseQuery];
  query[(__bridge id)kSecReturnData] = @YES;
  query[(__bridge id)kSecMatchLimit] = (__bridge id)kSecMatchLimitOne;

  CFTypeRef result = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &result);
  if (status != errSecSuccess || result == NULL) {
    return nil;
  }
  NSData *data = (__bridge_transfer NSData *)result;
  return [self tokensFromData:data];
}

- (nullable ZaloKitTokens *)tokensFromData:(NSData *)data {
  id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  if (![json isKindOfClass:[NSDictionary class]]) {
    return nil;
  }
  NSString *refreshToken = json[@"refreshToken"];
  if (![refreshToken isKindOfClass:[NSString class]] || refreshToken.length == 0) {
    return nil;
  }
  ZaloKitTokens *tokens = [ZaloKitTokens new];
  id accessToken = json[@"accessToken"];
  tokens.accessToken = [accessToken isKindOfClass:[NSString class]] ? accessToken : @"";
  tokens.refreshToken = refreshToken;
  id expiresAt = json[@"expiresAt"];
  tokens.expiresAt = [expiresAt isKindOfClass:[NSNumber class]] ? [expiresAt doubleValue] : 0;
  return tokens;
}

// <= 5.x kept the tokens as JSON in NSUserDefaults.
- (nullable ZaloKitTokens *)migrateLegacy {
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  NSData *legacy = [defaults objectForKey:ZaloKitLegacyDefaultsKey];
  if (![legacy isKindOfClass:[NSData class]]) {
    return nil;
  }
  ZaloKitTokens *tokens = [self tokensFromData:legacy];
  if (!tokens || [self write:tokens]) {
    [defaults removeObjectForKey:ZaloKitLegacyDefaultsKey];
  }
  return tokens;
}

// Keychain items survive app deletion; NSUserDefaults does not.
- (void)discardIfReinstalled {
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  if ([defaults boolForKey:ZaloKitInstalledDefaultsKey]) {
    return;
  }
  [defaults setBool:YES forKey:ZaloKitInstalledDefaultsKey];
  if ([defaults objectForKey:ZaloKitLegacyDefaultsKey] == nil) {
    SecItemDelete((__bridge CFDictionaryRef)[self baseQuery]);
  }
}

@end
