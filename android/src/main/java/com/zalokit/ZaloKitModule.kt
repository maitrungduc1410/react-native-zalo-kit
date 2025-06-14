package com.zalokit

import androidx.core.content.edit
import androidx.preference.PreferenceManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.zalokit.Util.convertJsonToMap
import com.zalokit.Util.generateCodeChallenge
import com.zalokit.Util.generateCodeVerifier
import com.zalokit.Util.getApplicationHashKey
import com.zing.zalo.zalosdk.oauth.LoginVia
import com.zing.zalo.zalosdk.oauth.OAuthCompleteListener
import com.zing.zalo.zalosdk.oauth.OauthResponse
import com.zing.zalo.zalosdk.oauth.ZaloSDK
import com.zing.zalo.zalosdk.oauth.model.ErrorResponse
import org.json.JSONException
import org.json.JSONObject
import java.security.NoSuchAlgorithmException


internal class OAuthAccessTokenCompleteListener(val onSuccessCallback: (WritableMap) -> Unit) {
  fun onSuccess(map: WritableMap) {
    onSuccessCallback(map)
  }
}

internal class TokenData(var accessToken: String, var refreshToken: String)


@ReactModule(name = ZaloKitModule.NAME)
class ZaloKitModule(reactContext: ReactApplicationContext) :
  NativeZaloKitSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun login(authType: String?, promise: Promise?) {
    var type = LoginVia.APP_OR_WEB

    if (authType.equals("AUTH_VIA_WEB")) type = LoginVia.WEB
    else if (authType.equals("AUTH_VIA_APP")) type = LoginVia.APP

    val codeVerifier = generateCodeVerifier()
    var codeChallenge: String? = null
    try {
      codeChallenge = generateCodeChallenge(codeVerifier)
    } catch (e: NoSuchAlgorithmException) {
      e.printStackTrace()
    }
    ZaloSDK.Instance.authenticateZaloWithAuthenType(
      reactApplicationContext.currentActivity,
      type,
      codeChallenge,
      object : OAuthCompleteListener() {
        override fun onAuthenError(errorResponse: ErrorResponse) {
          promise?.reject(errorResponse.errorCode.toString() + "", errorResponse.errorMsg)
        }

        override fun onGetOAuthComplete(response: OauthResponse) {
          getAccessToken(
            response.oauthCode,
            codeVerifier,
            OAuthAccessTokenCompleteListener { map ->
              saveTokenToCache(
                map.getString("accessToken") ?: "",
                map.getString("refreshToken") ?: ""
              )

              promise?.resolve(map)
            })
        }
      })
  }

  override fun logout() {
    ZaloSDK.Instance.unauthenticate();
    clearTokenFromCache();
  }

  override fun isAuthenticated(promise: Promise?) {
    val tokenData = this.getTokenFromCache()
    ZaloSDK.Instance.isAuthenticate(
      tokenData.refreshToken
    ) { validated: Boolean, errorCode: Int, oauthResponse: OauthResponse? ->
      if (validated) {
        promise?.resolve(true)
      } else {
        promise?.reject("Error", "errorCode: $errorCode. See here for more details: https://developers.zalo.me/docs/sdk/android-sdk/references/ma-loi")
      }
    }
  }

  override fun getUserProfile(promise: Promise?) {
    val tokenData = this.getTokenFromCache()

    val fields = arrayOf("id", "birthday", "gender", "picture", "name", "phoneNumber")
    ZaloSDK.Instance.getProfile(
      reactApplicationContext.currentActivity, tokenData.accessToken,
      { response: JSONObject? ->
        try {
          val data = convertJsonToMap(response!!)
          if (data.hasKey("error") && data.getInt("error") != 0) {
            promise?.reject(data.getInt("error").toString(), data.getString("message"))
          } else promise?.resolve(data)
        } catch (e: JSONException) {
          promise?.reject("422", "Error when passing user profile data")
        }
      }, fields
    )
  }

  override fun getApplicationHashKey(): String {
    return getApplicationHashKey(reactApplicationContext)
  }

  private fun getAccessToken(
    oauthCode: String,
    codeVerifier: String,
    listener: OAuthAccessTokenCompleteListener
  ) {
    val thread = Thread {
      try {
        ZaloSDK.Instance.getAccessTokenByOAuthCode(
          reactApplicationContext.currentActivity, oauthCode, codeVerifier
        ) { data: JSONObject ->
          val err = data.optInt("error")
          if (err == 0) {
            val map = Arguments.createMap()
            map.putString("accessToken", data.optString("access_token"))
            map.putString("refreshToken", data.optString("refresh_token"))

            listener.onSuccess(map)
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
      }
    }

    thread.start()
  }

  private fun saveTokenToCache(accessToken: String, refreshToken: String) {
    val myPreferences =
      PreferenceManager.getDefaultSharedPreferences(reactApplicationContext)
    myPreferences.edit {
      putString(ACCESS_TOKEN_STORAGE_KEY, accessToken)
      putString(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
    }
  }

  private fun clearTokenFromCache() {
    val myPreferences =
      PreferenceManager.getDefaultSharedPreferences(reactApplicationContext)
    myPreferences.edit {
      remove(ACCESS_TOKEN_STORAGE_KEY)
      remove(REFRESH_TOKEN_STORAGE_KEY)
    }
  }

  private fun getTokenFromCache(): TokenData {
    val myPreferences =
      PreferenceManager.getDefaultSharedPreferences(reactApplicationContext)

    return TokenData(
      myPreferences.getString(ACCESS_TOKEN_STORAGE_KEY, "") ?: "",
      myPreferences.getString(REFRESH_TOKEN_STORAGE_KEY, "") ?: ""
    )
  }

  companion object {
    const val NAME = "ZaloKit"
    const val ACCESS_TOKEN_STORAGE_KEY = "__RN_ZALO_KIT_ACCESS_TOKEN__"
    const val REFRESH_TOKEN_STORAGE_KEY = "__RN_ZALO_KIT_REFRESH_TOKEN__"
  }
}
