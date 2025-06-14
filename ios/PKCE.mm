//
//  PKCE.m
//  ZaloKit
//
//  Created by Duc Trung Mai on 14/6/25.
//

#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonCrypto.h>
#import <Security/Security.h>

//NSString *generateStateWithLength(int len) {
//    NSString *letters = @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//    uint32_t length = (uint32_t)[letters length];
//    
//    NSMutableString *randomString = [NSMutableString stringWithCapacity:len];
//    for (int i = 0; i < len; i++) {
//        uint32_t rand = arc4random_uniform(length);
//        unichar letter = [letters characterAtIndex:rand];
//        [randomString appendString:[NSString stringWithCharacters:&letter length:1]];
//    }
//    return randomString;
//}

NSString *generateCodeVerifier() {
    NSMutableData *buffer = [NSMutableData dataWithLength:32];
    if (SecRandomCopyBytes(kSecRandomDefault, 32, [buffer mutableBytes]) != errSecSuccess) {
        return nil;
    }
    
    NSString *base64String = [buffer base64EncodedStringWithOptions:0];
    NSString *replacedPlus = [base64String stringByReplacingOccurrencesOfString:@"+" withString:@"-"];
    NSString *replacedSlash = [replacedPlus stringByReplacingOccurrencesOfString:@"/" withString:@"_"];
    NSString *replacedEquals = [replacedSlash stringByReplacingOccurrencesOfString:@"=" withString:@""];
    NSString *codeVerifier = [replacedEquals stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    
    return codeVerifier;
}

NSString *generateCodeChallenge(NSString *codeVerifier) {
    if (!codeVerifier) {
        return nil;
    }
    
    NSData *data = [codeVerifier dataUsingEncoding:NSUTF8StringEncoding];
    if (!data) {
        return nil;
    }
    
    uint8_t buffer[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256([data bytes], (CC_LONG)[data length], buffer);
    NSData *hash = [NSData dataWithBytes:buffer length:CC_SHA256_DIGEST_LENGTH];
    
    NSString *base64String = [hash base64EncodedStringWithOptions:0];
    NSString *replacedPlus = [base64String stringByReplacingOccurrencesOfString:@"+" withString:@"-"];
    NSString *replacedSlash = [replacedPlus stringByReplacingOccurrencesOfString:@"/" withString:@"_"];
    NSString *replacedEquals = [replacedSlash stringByReplacingOccurrencesOfString:@"=" withString:@""];
    NSString *challenge = [replacedEquals stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    
    return challenge;
}
