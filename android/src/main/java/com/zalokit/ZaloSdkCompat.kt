package com.zalokit

import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import com.zing.zalo.zalosdk.oauth.Authenticator
import com.zing.zalo.zalosdk.oauth.ZaloSDK
import com.zing.zalo.zalosdk.oauth.ZaloSDKApplication

/** Workarounds for behaviour of the closed-source Zalo Android SDK (me.zalo:sdk-auth 4.24.x). */
internal object ZaloSdkCompat {
  private const val TAG = "ZaloKit"
  private const val APP_ID_META_DATA = "com.zing.zalo.zalosdk.appID"

  fun isInitialized(): Boolean =
    try {
      ZaloSDK.Instance.checkInitialize()
      true
    } catch (e: RuntimeException) {
      false
    }

  /**
   * Initializes the SDK the same way `ZaloSDKApplication.wrap()` does, unless the host app already
   * did it. Returns false when the app ID meta-data is missing, because the SDK would otherwise
   * initialize with an empty app ID and fail later in confusing ways.
   */
  @Synchronized
  fun ensureInitialized(context: Context): Boolean {
    if (isInitialized()) return true
    val app = context.applicationContext as? Application ?: return false
    if (readAppId(app).isNullOrEmpty()) {
      Log.w(TAG, "Missing <meta-data android:name=\"$APP_ID_META_DATA\"> in AndroidManifest.xml")
      return false
    }
    return try {
      ZaloSDKApplication.wrap(app)
      true
    } catch (e: Exception) {
      Log.e(TAG, "Zalo SDK initialization failed", e)
      false
    }
  }

  /**
   * The SDK sets `Authenticator.bIsZaloOutOfDate` once the Zalo app fails to open and never clears
   * it. From then on every app-to-app login result is silently dropped for the rest of the
   * process, so it has to be reset before each login attempt.
   */
  fun resetOutOfDateFlag() {
    try {
      val authenticator = ZaloSDK.Instance.authenticator ?: return
      Authenticator::class.java.getDeclaredField("bIsZaloOutOfDate").apply {
        isAccessible = true
        setBoolean(authenticator, false)
      }
    } catch (e: Exception) {
      Log.w(TAG, "Could not reset Zalo SDK out-of-date flag", e)
    }
  }

  @Suppress("DEPRECATION")
  private fun readAppId(app: Application): String? =
    try {
      val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        app.packageManager.getApplicationInfo(
          app.packageName,
          PackageManager.ApplicationInfoFlags.of(PackageManager.GET_META_DATA.toLong())
        )
      } else {
        app.packageManager.getApplicationInfo(app.packageName, PackageManager.GET_META_DATA)
      }
      info.metaData?.get(APP_ID_META_DATA)?.toString()
    } catch (e: Exception) {
      null
    }
}
