#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// Token pair persisted by ZaloKit. `expiresAt` is a Unix timestamp in milliseconds, 0 when unknown.
@interface ZaloKitTokens : NSObject
@property (nonatomic, copy) NSString *accessToken;
@property (nonatomic, copy) NSString *refreshToken;
@property (nonatomic, assign) double expiresAt;
@end

/// Stores the Zalo token pair in the Keychain. Main thread only.
@interface ZaloKitTokenStore : NSObject
- (nullable ZaloKitTokens *)read;
/// Returns NO when the tokens could only be kept in memory.
- (BOOL)write:(ZaloKitTokens *)tokens;
- (void)clear;
@end

NS_ASSUME_NONNULL_END
