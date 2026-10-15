package com.zalokit

import android.content.Context
import android.util.Base64
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import com.zing.zalo.zalosdk.core.helper.AppInfo
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException
import java.security.SecureRandom


object Util {
  @Throws(JSONException::class)
  fun convertJsonToMap(jsonObject: JSONObject): WritableMap {
    val map: WritableMap = WritableNativeMap()

    val iterator = jsonObject.keys()
    while (iterator.hasNext()) {
      val key = iterator.next()
      val value = jsonObject[key]
      if (value == JSONObject.NULL) {
        map.putNull(key)
      } else if (value is JSONObject) {
        map.putMap(key, convertJsonToMap(value))
      } else if (value is JSONArray) {
        map.putArray(key, convertJsonToArray(value))
      } else if (value is Boolean) {
        map.putBoolean(key, value)
      } else if (value is Int) {
        map.putInt(key, value)
      } else if (value is Number) {
        map.putDouble(key, value.toDouble())
      } else if (value is String) {
        map.putString(key, value)
      } else {
        map.putString(key, value.toString())
      }
    }
    return map
  }

  @Throws(JSONException::class)
  fun convertJsonToArray(jsonArray: JSONArray): WritableArray {
    val array: WritableArray = WritableNativeArray()

    for (i in 0..<jsonArray.length()) {
      val value = jsonArray[i]
      if (value == JSONObject.NULL) {
        array.pushNull()
      } else if (value is JSONObject) {
        array.pushMap(convertJsonToMap(value))
      } else if (value is JSONArray) {
        array.pushArray(convertJsonToArray(value))
      } else if (value is Boolean) {
        array.pushBoolean(value)
      } else if (value is Int) {
        array.pushInt(value)
      } else if (value is Number) {
        array.pushDouble(value.toDouble())
      } else if (value is String) {
        array.pushString(value)
      } else {
        array.pushString(value.toString())
      }
    }
    return array
  }

  /** Must stay identical to the `sign_key` the Zalo SDK sends, so delegate to the SDK itself. */
  fun getApplicationHashKey(ctx: Context): String =
    AppInfo.getApplicationHashKey(ctx) ?: ""

  fun generateCodeVerifier(): String {
    val sr = SecureRandom()
    val code = ByteArray(32)
    sr.nextBytes(code)
    return Base64.encodeToString(code, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
  }

  @Throws(NoSuchAlgorithmException::class)
  fun generateCodeChallenge(codeVerifier: String): String {
    val bytes = codeVerifier.toByteArray()
    val md = MessageDigest.getInstance("SHA-256")
    md.update(bytes)
    val digest = md.digest()
    return Base64.encodeToString(digest, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
  }
}
