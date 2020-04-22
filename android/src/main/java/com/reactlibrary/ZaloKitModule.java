package com.reactlibrary;

import android.content.Context;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.zing.zalo.zalosdk.oauth.FeedData;
import com.zing.zalo.zalosdk.oauth.LoginVia;
import com.zing.zalo.zalosdk.oauth.OAuthCompleteListener;
import com.zing.zalo.zalosdk.oauth.OauthResponse;
import com.zing.zalo.zalosdk.oauth.OpenAPIService;
import com.zing.zalo.zalosdk.oauth.ValidateOAuthCodeCallback;
import com.zing.zalo.zalosdk.oauth.ZaloOpenAPICallback;
import com.zing.zalo.zalosdk.oauth.ZaloPluginCallback;
import com.zing.zalo.zalosdk.oauth.ZaloSDK;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;
import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class ZaloKitModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private static final String AUTH_VIA_WEB = "web";
    private static final String AUTH_VIA_APP = "app";
    private static final String AUTH_VIA_APP_OR_WEB = "app_or_web";
    private OpenAPIService openAPIService;

    public ZaloKitModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.openAPIService = new OpenAPIService();
    }

    @Override
    public String getName() {
        return "ZaloKit";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("AUTH_VIA_WEB", AUTH_VIA_WEB);
        constants.put("AUTH_VIA_APP", AUTH_VIA_APP);
        constants.put("AUTH_VIA_APP_OR_WEB", AUTH_VIA_APP_OR_WEB);
        return constants;
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

    @ReactMethod
    public void getUserProfile(final Promise promise) {
        final String[] fields = {"id", "birthday", "gender", "picture", "name"};
        ZaloSDK.Instance.getProfile(reactContext.getCurrentActivity(), new ZaloOpenAPICallback() {
            @Override
            public void onResult(JSONObject response) {
                try {
                    final WritableMap data = Util.convertJsonToMap(response);
                    if (data.hasKey("error")) {
                        promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
                    } else {
                        promise.resolve(data);
                    }
                } catch (JSONException e) {
                    promise.reject("422", "Error when passing user profile data");
                }
            }
        }, fields);
    }

    @ReactMethod
    public void getFriendListUsedApp(int position, int count, final Promise promise) {
        final String[] fields = {"id", "birthday", "gender", "picture", "name"};
        ZaloSDK.Instance.getFriendListUsedApp(reactContext.getCurrentActivity(), position, count, new ZaloOpenAPICallback() {
            @Override
            public void onResult(JSONObject response) {
                try {
                    final WritableMap data = Util.convertJsonToMap(response);
                    if (data.hasKey("error")) {
                        promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
                    } else {
                        promise.resolve(data);
                    }
                } catch (JSONException e) {
                    promise.reject("422", "Error when passing data for getFriendListUsedApp");
                }
            }
        }, fields);
    }

    @ReactMethod
    public void getFriendListInvitable(int position, int count, final Promise promise) {
        final String[] fields = {"id", "birthday", "gender", "picture", "name"};
        ZaloSDK.Instance.getFriendListInvitable(reactContext.getCurrentActivity(), position, count, new ZaloOpenAPICallback() {
            @Override
            public void onResult(JSONObject response) {
                try {
                    final WritableMap data = Util.convertJsonToMap(response);
                    if (data.hasKey("error")) {
                        promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
                    } else {
                        promise.resolve(data);
                    }
                } catch (JSONException e) {
                    promise.reject("422", "Error when passing data for getFriendListInvitable");
                }
            }
        }, fields);
    }

    @ReactMethod
    public void postToWall(String link, String message, final Promise promise) {
        openAPIService.postToWall(reactContext.getCurrentActivity(), link, message, new ZaloOpenAPICallback() {
            @Override
            public void onResult(JSONObject response) {
                try {
                    final WritableMap data = Util.convertJsonToMap(response);
                    if (data.hasKey("error")) {
                        promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
                    } else {
                        promise.resolve(data);
                    }
                } catch (JSONException e) {
                    promise.reject("422", "Error when passing data for postToWall");
                }
            }
        });
    }

    @ReactMethod
    public void sendMessageToFriend(String friendId, String link, String message, final Promise promise) {
        openAPIService.sendMsgToFriend(reactContext.getCurrentActivity(), friendId, link, message, new ZaloOpenAPICallback() {
            @Override
            public void onResult(JSONObject response) {
                try {
                    final WritableMap data = Util.convertJsonToMap(response);
                    if (data.hasKey("error")) {
                        promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
                    } else {
                        promise.resolve(data);
                    }
                } catch (JSONException e) {
                    promise.reject("422", "Error when passing data for sendMessageToFriend");
                }
            }
        });
    }

    @ReactMethod
    public void inviteFriendUseApp(ReadableArray friendIds, String message, final Promise promise) {
        String[] Ids = new String[friendIds.size()];

        for (int i = 0; i < friendIds.size(); i++) {
            Ids[i] = friendIds.getString(i);
        }

        ZaloSDK.Instance.inviteFriendUseApp(reactContext.getCurrentActivity(), Ids, message, new ZaloOpenAPICallback() {
            @Override
            public void onResult(JSONObject response) {
                try {
                    final WritableMap data = Util.convertJsonToMap(response);
                    if (data.hasKey("error")) {
                        promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
                    } else {
                        promise.resolve(data);
                    }
                } catch (JSONException e) {
                    promise.reject("422", "Error when passing data for inviteFriendUseApp");
                }
            }
        });
    }

    @ReactMethod
    public void sendMessageToFriendByApp(ReadableMap feedData, final Promise promise) {
        ReadableArray thumbs = feedData.getArray("linkThumb");
        String[] thumbsParsed = new String[thumbs.size()];

        for (int i = 0; i < thumbs.size(); i++) {
            thumbsParsed[i] = thumbs.getString(i);
        }

        Map<String, Object> others = feedData.getMap("others").toHashMap();
        Map<String,String> othersParsed =new HashMap<String,String>();
        for (Map.Entry<String, Object> entry : others.entrySet()) {
            if(entry.getValue() instanceof String){
                othersParsed.put(entry.getKey(), (String) entry.getValue());
            }
        }

        final FeedData feed = new FeedData();
        feed.setAppName(feedData.getString("appName"));
        feed.setMsg(feedData.getString("message"));
        feed.setLink(feedData.getString("link"));
        feed.setLinkTitle(feedData.getString("linkTitle"));
        feed.setLinkSource(feedData.getString("linkSource"));
        feed.setLinkDesc(feedData.getString("linkDesc"));
        feed.setLinkThumb(thumbsParsed);
        feed.setParams(othersParsed);

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                openAPIService.shareMessage(reactContext.getCurrentActivity(), feed, new ZaloPluginCallback() {
                    @Override
                    public void onResult(boolean success, int send_action, String message, String result_data) {
                        final WritableMap data = Arguments.createMap();
                        data.putBoolean("success", success);
                        data.putString("data", result_data);
                        data.putString("message", message);
                        data.putInt("sendAction", send_action);

                        promise.resolve(data);
                    }
                });

            }
        });


    }

    @ReactMethod
    public void postToWallByApp(ReadableMap feedData, final Promise promise) {
        ReadableArray thumbs = feedData.getArray("linkThumb");
        String[] thumbsParsed = new String[thumbs.size()];

        for (int i = 0; i < thumbs.size(); i++) {
            thumbsParsed[i] = thumbs.getString(i);
        }

        Map<String, Object> others = feedData.getMap("others").toHashMap();
        Map<String,String> othersParsed =new HashMap<String,String>();
        for (Map.Entry<String, Object> entry : others.entrySet()) {
            if(entry.getValue() instanceof String){
                othersParsed.put(entry.getKey(), (String) entry.getValue());
            }
        }

        final FeedData feed = new FeedData();
        feed.setAppName(feedData.getString("appName"));
        feed.setMsg(feedData.getString("message"));
        feed.setLink(feedData.getString("link"));
        feed.setLinkTitle(feedData.getString("linkTitle"));
        feed.setLinkSource(feedData.getString("linkSource"));
        feed.setLinkDesc(feedData.getString("linkDesc"));
        feed.setLinkThumb(thumbsParsed);
        feed.setParams(othersParsed);

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                openAPIService.shareFeed(reactContext.getCurrentActivity(), feed, new ZaloPluginCallback() {
                    @Override
                    public void onResult(boolean success, int send_action, String message, String result_data) {
                        final WritableMap data = Arguments.createMap();
                        data.putBoolean("success", success);
                        data.putString("data", result_data);
                        data.putString("message", message);
                        data.putInt("sendAction", send_action);

                        promise.resolve(data);
                    }
                });
            }
        });
    }
}
