package com.reactnativezalokit;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.zing.zalo.zalosdk.oauth.LoginVia;
import com.zing.zalo.zalosdk.oauth.OAuthCompleteListener;
import com.zing.zalo.zalosdk.oauth.OauthResponse;
import com.zing.zalo.zalosdk.oauth.OpenAPIService;
import com.zing.zalo.zalosdk.oauth.ZaloSDK;
import com.zing.zalo.zalosdk.oauth.FeedData;

import org.json.JSONException;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@ReactModule(name = ZaloKitModule.NAME)
public class ZaloKitModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;
  public static final String NAME = "ZaloKit";
  private static final String AUTH_VIA_WEB = "web";
  private static final String AUTH_VIA_APP = "app";
  private static final String AUTH_VIA_APP_OR_WEB = "app_or_web";

  public ZaloKitModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
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
  public String getApplicationHashKey() {
    try {
      return Util.getApplicationHashKey(reactContext);
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  @ReactMethod
  public void login(String authType, final Promise promise) {
    LoginVia type = LoginVia.APP_OR_WEB;

    if (authType.equals(AUTH_VIA_WEB)) type = LoginVia.WEB;
    else if (authType.equals(AUTH_VIA_APP)) type = LoginVia.APP;

    ZaloSDK.Instance.authenticate(reactContext.getCurrentActivity(), type, new OAuthCompleteListener() {
      @Override
      public void onAuthenError(int errorCode, String message) {
        promise.reject(errorCode + "", message);
      }

      @Override
      public void onGetOAuthComplete(OauthResponse response) {
        final WritableMap data = Arguments.createMap();
        data.putString("oauthCode", response.getOauthCode());
        data.putDouble("userId", response.getuId());
        data.putString("socialId", response.getSocialId());

        promise.resolve(data);
      }
    });
  }

  @ReactMethod
  public void logout() {
    ZaloSDK.Instance.unauthenticate();
  }

  @ReactMethod
  public void isAuthenticated(final Promise promise) {
    ZaloSDK.Instance.isAuthenticate((validated, errorCode, userId, oauthCode) -> {
      if (validated) promise.resolve(true);
      else promise.reject("Error", "Have not login yet");
    });
  }

  @ReactMethod
  public void getUserProfile(final Promise promise) {
    final String[] fields = {"id", "birthday", "gender", "picture", "name"};
    ZaloSDK.Instance.getProfile(reactContext.getCurrentActivity(), response -> {
      try {
        final WritableMap data = Util.convertJsonToMap(response);
        if (data.hasKey("error")) {
          promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
        } else promise.resolve(data);
      } catch (JSONException e) {
        promise.reject("422", "Error when passing user profile data");
      }
    }, fields);
  }

  @ReactMethod
  public void getUserFriendList(int position, int count, final Promise promise) {
    final String[] fields = {"id", "birthday", "gender", "picture", "name"};
    ZaloSDK.Instance.getFriendListUsedApp(reactContext.getCurrentActivity(), position, count, response -> {
      try {
        final WritableMap data = Util.convertJsonToMap(response);
        if (data.hasKey("error")) {
          promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
        } else promise.resolve(data);
      } catch (JSONException e) {
        promise.reject("422", "Error when passing data for getFriendListUsedApp");
      }
    }, fields);
  }

  @ReactMethod
  public void getUserInvitableFriendList(int offset, int count, final Promise promise) {
    final String[] fields = {"id", "birthday", "gender", "picture", "name"};
    ZaloSDK.Instance.getFriendListInvitable(reactContext.getCurrentActivity(), offset, count, response -> {
      try {
        final WritableMap data = Util.convertJsonToMap(response);
        if (data.hasKey("error")) {
          promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
        } else promise.resolve(data);
      } catch (JSONException e) {
        promise.reject("422", "Error when passing data for getFriendListInvitable");
      }
    }, fields);
  }

  @ReactMethod
  public void postFeed(String message, String link, final Promise promise) {
    OpenAPIService.getInstance().postToWall(reactContext.getCurrentActivity(), link, message, response -> {
      try {
        final WritableMap data = Util.convertJsonToMap(response);
        if (data.hasKey("error")) {
          promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
        } else promise.resolve(data);
      } catch (JSONException e) {
        promise.reject("422", "Error when passing data for postFeed");
      }
    });
  }

  @ReactMethod
  public void postFeedByApp(ReadableMap feedData, final Promise promise) {
    ReadableArray thumbs = feedData.getArray("linkThumb");
    String[] thumbsParsed = new String[Objects.requireNonNull(thumbs).size()];

    for (int i = 0; i < thumbs.size(); i++) {
      thumbsParsed[i] = thumbs.getString(i);
    }

    Map<String, Object> others = Objects.requireNonNull(feedData.getMap("others")).toHashMap();
    Map<String, String> othersParsed = new HashMap();
    for (Map.Entry<String, Object> entry : others.entrySet()) {
      if (entry.getValue() instanceof String) {
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

    runOnUiThread(() -> OpenAPIService.getInstance().shareFeed(reactContext.getCurrentActivity(), feed, (success, send_action, message, result_data) -> {
      final WritableMap data = Arguments.createMap();
      data.putBoolean("success", success);
      data.putString("data", result_data);
      data.putString("message", message);
      data.putInt("sendAction", send_action);

      promise.resolve(data);
    }));
  }

  @ReactMethod
  public void sendMessage(String friendId, String message, String link, final Promise promise) {
    OpenAPIService.getInstance().sendMsgToFriend(reactContext.getCurrentActivity(), friendId, link, message, response -> {
      try {
        final WritableMap data = Util.convertJsonToMap(response);
        if (data.hasKey("error")) {
          promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
        } else promise.resolve(data);
      } catch (JSONException e) {
        promise.reject("422", "Error when passing data for sendMessageToFriend");
      }
    });
  }

  @ReactMethod
  public void sendMessageByApp(ReadableMap feedData, final Promise promise) {
    ReadableArray thumbs = feedData.getArray("linkThumb");
    String[] thumbsParsed = new String[Objects.requireNonNull(thumbs).size()];

    for (int i = 0; i < thumbs.size(); i++) {
      thumbsParsed[i] = thumbs.getString(i);
    }

    Map<String, Object> others = Objects.requireNonNull(feedData.getMap("others")).toHashMap();
    Map<String, String> othersParsed = new HashMap();
    for (Map.Entry<String, Object> entry : others.entrySet()) {
      if (entry.getValue() instanceof String) {
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

    runOnUiThread(() -> OpenAPIService.getInstance().shareMessage(reactContext.getCurrentActivity(), feed, (success, send_action, message, result_data) -> {
      final WritableMap data = Arguments.createMap();
      data.putBoolean("success", success);
      data.putString("data", result_data);
      data.putString("message", message);
      data.putInt("sendAction", send_action);

      promise.resolve(data);
    }));
  }

  @ReactMethod
  public void inviteFriendUseApp(ReadableArray friendIds, String message, final Promise promise) {
    String[] Ids = new String[friendIds.size()];

    for (int i = 0; i < friendIds.size(); i++) {
      Ids[i] = friendIds.getString(i);
    }

    ZaloSDK.Instance.inviteFriendUseApp(reactContext.getCurrentActivity(), Ids, message, response -> {
      try {
        final WritableMap data = Util.convertJsonToMap(response);
        if (data.hasKey("error")) {
          promise.reject(String.valueOf(data.getInt("error")), data.getString("message"));
        } else promise.resolve(data);
      } catch (JSONException e) {
        promise.reject("422", "Error when passing data for inviteFriendUseApp");
      }
    });
  }

  @ReactMethod
  public void register(final Promise promise) {
    ZaloSDK.Instance.registerZalo(reactContext.getCurrentActivity(), new OAuthCompleteListener() {
      @Override
      public void onAuthenError(int errorCode, String message) {
        promise.reject(errorCode + "", message);
      }

      @Override
      public void onGetOAuthComplete(OauthResponse response) {
        final WritableMap data = Arguments.createMap();
        data.putString("oauthCode", response.getOauthCode());
        data.putDouble("userId", response.getuId());
        data.putString("socialId", response.getSocialId());

        promise.resolve(data);
      }
    });
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
//    @ReactMethod
//    public void multiply(int a, int b, Promise promise) {
//        promise.resolve(a * b);
//    }
//
//    public static native int nativeMultiply(int a, int b);
}
