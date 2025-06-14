//
//  PKCE.h
//  ZaloKit
//
//  Created by Duc Trung Mai on 14/6/25.
//

#ifndef PKCE_h
#define PKCE_h

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

NSString *generateStateWithLength(int len);
NSString * _Nullable generateCodeVerifier(void);
NSString * _Nullable generateCodeChallenge(NSString * _Nullable codeVerifier);

NS_ASSUME_NONNULL_END


#endif /* PKCE_h */
