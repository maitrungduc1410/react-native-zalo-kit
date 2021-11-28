import ZaloSDK

@objc(ZaloKit)
class ZaloKit: NSObject {
    
    let AUTH_VIA_WEB = "web"
    let AUTH_VIA_APP = "app"
    let AUTH_VIA_APP_OR_WEB = "app_or_web"
    
    @objc(constantsToExport)
    func constantsToExport() -> NSDictionary {
        return [
            "AUTH_VIA_WEB": AUTH_VIA_WEB,
            "AUTH_VIA_APP": AUTH_VIA_APP,
            "AUTH_VIA_APP_OR_WEB": AUTH_VIA_APP_OR_WEB
        ]
    }
    
    @objc(login:withResolver:withRejecter:)
    func login(authType: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        var type = ZAZAloSDKAuthenTypeViaZaloAppAndWebView
        
        if (authType == AUTH_VIA_WEB) {
            type = ZAZaloSDKAuthenTypeViaWebViewOnly
        } else if (authType == AUTH_VIA_APP) {
            type = ZAZaloSDKAuthenTypeViaZaloAppOnly
        }
        
        DispatchQueue.main.async {
            let presentedViewController = RCTPresentedViewController()
            ZaloSDK.sharedInstance().authenticateZalo(with: type, parentController: presentedViewController, handler: {(response) in
                let errorCode = response?.errorCode ?? 401
                if (response != nil && response!.isSucess) {
                    let result: NSDictionary = [
                        "oauthCode": response?.oauthCode ?? "",
                        "userId": response?.userId ?? "",
                        "socialId": response?.socialId ?? ""
                    ]
                    resolve(result)
                } else if (errorCode != kZaloSDKErrorCodeUserCancel.rawValue) {
                    let error = NSError(domain: "Authentication error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(logout)
    func logout() -> Void {
        ZaloSDK.sharedInstance().unauthenticate()
    }
    
    @objc(isAuthenticated:withRejecter:)
    func isAuthenticated(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            ZaloSDK.sharedInstance().isAuthenticatedZalo(completionHandler: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    resolve(true)
                } else {
                    let errorCode = response?.errorCode ?? 401
                    let error = NSError(domain: "Authentication error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(getUserProfile:withRejecter:)
    func getUserProfile(resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            ZaloSDK.sharedInstance().getZaloUserProfile(callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    resolve(response!.data)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(getUserFriendList:withCount:withResolver:withRejecter:)
    func getUserFriendList(offset: Int, count: Int, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            ZaloSDK.sharedInstance().getUserFriendList(atOffset: UInt(offset), count: UInt(count), callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    resolve(response!.data)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(getUserInvitableFriendList:withCount:withResolver:withRejecter:)
    func getUserInvitableFriendList(offset: Int, count: Int, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            ZaloSDK.sharedInstance().getUserInvitableFriendList(atOffset: UInt(offset), count: UInt(count), callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    resolve(response!.data)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(postFeed:withLink:withResolver:withRejecter:)
    func postFeed(message: String, link: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            ZaloSDK.sharedInstance().postFeed(withMessage: message, link: link, callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    resolve(response!.data)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(postFeedByApp:withResolver:withRejecter:)
    func postFeedByApp(feedData: NSDictionary, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        let feed: ZOFeed = ZOFeed(
            link: feedData["link"] as? String,
            appName: feedData["appName"] as? String,
            message: feedData["message"] as? String,
            others: feedData["others"] as? [AnyHashable : Any]
        )
        feed.linkTitle = feedData["linkTitle"] as? String
        feed.linkSource = feedData["linkSource"] as? String
        feed.linkThumb = feedData["linkThumb"] as? [String]
        feed.linkDesc = feedData["linkDesc"] as? String
        
        DispatchQueue.main.async {
            let presentedViewController = RCTPresentedViewController()
            
            ZaloSDK.sharedInstance().shareFeedOrSendMessage(feed, in: presentedViewController, callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    let result: NSDictionary = [
                        "success": response?.isSucess ?? false,
                        "data": response?.result_data ?? "",
                        "message": response?.message ?? "",
                        "sendAction": response?.send_action ?? 0
                    ]
                    resolve(result)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(sendMessage:withMessage:withLink:withResolver:withRejecter:)
    func sendMessage(friendId: String, message: String, link: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            ZaloSDK.sharedInstance().sendMessage(to: friendId, message: message, link: link, callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    resolve(response!.data)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(sendMessageByApp:withResolver:withRejecter:)
    func sendMessageByApp(feedData: NSDictionary, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        let feed: ZOFeed = ZOFeed(
            link: feedData["link"] as? String,
            appName: feedData["appName"] as? String,
            message: feedData["message"] as? String,
            others: feedData["others"] as? [AnyHashable : Any]
        )
        feed.linkTitle = feedData["linkTitle"] as? String
        feed.linkSource = feedData["linkSource"] as? String
        feed.linkThumb = feedData["linkThumb"] as? [String]
        feed.linkDesc = feedData["linkDesc"] as? String
        DispatchQueue.main.async {
            let presentedViewController = RCTPresentedViewController()
            ZaloSDK.sharedInstance().sendMessage(feed, in: presentedViewController, callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    let result: NSDictionary = [
                        "success": response?.isSucess ?? false,
                        "data": response?.result_data ?? "",
                        "message": response?.message ?? "",
                        "sendAction": response?.send_action ?? 0
                    ]
                    resolve(result)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(inviteFriendUseApp:withMessage:withResolver:withRejecter:)
    func sendAppRequest(friendId: String, message: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            ZaloSDK.sharedInstance().sendAppRequest(to: friendId, message: message, callback: {(response) in
                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
                    resolve(response!.data)
                } else {
                    let errorCode = response?.errorCode ?? 422
                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    @objc(register:withRejecter:)
    func register(resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.main.async {
            let presentedViewController = RCTPresentedViewController()
            ZaloSDK.sharedInstance().registZaloAccount(withParentController: presentedViewController, handler: {(response) in
                let errorCode = response?.errorCode ?? 401
                if (response != nil && response!.isSucess) {
                    let result: NSDictionary = [
                        "oauthCode": response?.oauthCode ?? "",
                        "userId": response?.userId ?? "",
                        "socialId": response?.socialId ?? ""
                    ]
                    resolve(result)
                } else if (errorCode != kZaloSDKErrorCodeUserCancel.rawValue) {
                    let error = NSError(domain: "Authentication error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
                    reject(String(errorCode), response?.errorMessage, error)
                }
            })
        }
    }
    
    // ====== iOS only methods ======
    
    //    @objc(sendOfficialAccountMessage:withTemplateData:withMessage:withResolver:withRejecter:)
    //    func sendOfficialAccountMessage(templateId: String, templateData: NSDictionary, message: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
    //        DispatchQueue.main.async {
    //            ZaloSDK.sharedInstance().sendOfficalAccountMessage(with: templateId, templateData: templateData as? [AnyHashable : Any], callback: {(response) in
    //                if (response != nil && response!.errorCode == kZaloSDKErrorCodeNoneError.rawValue) {
    //                    resolve(response!.data)
    //                } else {
    //                    let errorCode = response?.errorCode ?? 422
    //                    let error = NSError(domain: "OpenAPI error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
    //                    reject(String(errorCode), response?.errorMessage, error)
    //                }
    //            })
    //        }
    //    }
    //
    //    @objc(loginWithFacebook:withRejecter:)
    //    func loginWithFacebook(resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) -> Void {
    //        DispatchQueue.main.async {
    //            let presentedViewController = RCTPresentedViewController()
    //            ZaloSDK.sharedInstance().authenticateFacebook(in: presentedViewController, withCompletionHandler: {(response) in
    //                let errorCode = response?.errorCode ?? 401
    //                if (response != nil && response!.isSucess) {
    //                    let result: NSDictionary = [
    //                        "oauthCode": response?.oauthCode ?? "",
    //                        "userId": response?.userId ?? "",
    //                        "socialId": response?.socialId ?? ""
    //                    ]
    //                    resolve(result)
    //                } else if (errorCode != kZaloSDKErrorCodeUserCancel.rawValue) {
    //                    let error = NSError(domain: "Authentication error", code: errorCode, userInfo: [NSLocalizedDescriptionKey: response?.errorMessage ?? ""])
    //                    reject(String(errorCode), response?.errorMessage, error)
    //                }
    //            })
    //        }
    //    }
}
