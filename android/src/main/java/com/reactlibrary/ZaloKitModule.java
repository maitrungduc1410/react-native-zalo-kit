package com.reactlibrary;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.zing.zalo.zalosdk.oauth.LoginVia;
import com.zing.zalo.zalosdk.oauth.OAuthCompleteListener;
import com.zing.zalo.zalosdk.oauth.OauthResponse;
import com.zing.zalo.zalosdk.oauth.ValidateOAuthCodeCallback;
import com.zing.zalo.zalosdk.oauth.ZaloOpenAPICallback;
import com.zing.zalo.zalosdk.oauth.ZaloSDK;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;

public class ZaloKitModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private static final String AUTH_VIA_WEB = "web";
    private static final String AUTH_VIA_APP = "app";
    private static final String AUTH_VIA_APP_OR_WEB = "app_or_web";

    public ZaloKitModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ZaloKit";
    }

    @ReactMethod
    public void login(String authType, final Promise promise) {
        LoginVia type = LoginVia.APP_OR_WEB;

        if (authType.equals(AUTH_VIA_WEB)) {
            type = LoginVia.WEB;
        } else if (authType.equals(AUTH_VIA_APP)) {
            type = LoginVia.APP;
        }

        ZaloSDK.Instance.authenticate(reactContext.getCurrentActivity(), type, new OAuthCompleteListener() {
            @Override
            public void onAuthenError(int errorCode, String message) {
                final String code = errorCode + "";
                promise.reject(code, message);
            }

            @Override
            public void onGetOAuthComplete(OauthResponse response) {
                promise.resolve(response.getOauthCode());
            }
        });
    }

    @ReactMethod
    public void logout() {
        ZaloSDK.Instance.unauthenticate();
    }

    @ReactMethod
    public void getUserProfile(final Promise promise) {
        final String[] fields = {"id", "birthday", "gender", "picture", "name"};
        ZaloSDK.Instance.getProfile(reactContext.getCurrentActivity(), new ZaloOpenAPICallback() {
            @Override
            public void onResult(JSONObject data) {
                try {
                    final WritableMap user = Util.convertJsonToMap(data);
                    if (user.hasKey("error")) {
                        promise.reject(String.valueOf(user.getInt("error")), "Have not login yet");
                    } else {
                        promise.resolve(user);
                    }
                } catch (JSONException e) {
                    promise.reject("422", "Error when passing user profile data");
                }
            }
        }, fields);
    }

    @ReactMethod
    public void isAuthenticated(final Promise promise) {
        ZaloSDK.Instance.isAuthenticate(new ValidateOAuthCodeCallback() {
            @Override
            public void onValidateComplete(boolean validated, int errorCode, long userId, String oauthCode) {
                if(validated) {
                    promise.resolve(true);
                } else {
                    promise.reject("Error", "Have not login yet");
                }
            }
        });
    }

    @ReactMethod
    public void getApplicationHashKey(final Promise promise) {
        try {
            String key = Util.getApplicationHashKey(reactContext);
            promise.resolve(key);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("AUTH_VIA_WEB", AUTH_VIA_WEB);
        constants.put("AUTH_VIA_APP", AUTH_VIA_APP);
        constants.put("AUTH_VIA_APP_OR_WEB", AUTH_VIA_APP_OR_WEB);
        return constants;
    }
}
