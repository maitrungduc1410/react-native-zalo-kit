package com.zalokit

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.zalokit.Util.convertJsonToMap
import com.zalokit.Util.generateCodeChallenge
import com.zalokit.Util.generateCodeVerifier
import com.zing.zalo.zalosdk.common.Constant
import com.zing.zalo.zalosdk.oauth.LoginVia
import com.zing.zalo.zalosdk.oauth.OAuthCompleteListener
import com.zing.zalo.zalosdk.oauth.OauthResponse
import com.zing.zalo.zalosdk.oauth.ZaloSDK
import com.zing.zalo.zalosdk.oauth.model.ErrorResponse
import org.json.JSONObject


@ReactModule(name = ZaloKitModule.NAME)
class ZaloKitModule(reactContext: ReactApplicationContext) :
  NativeZaloKitSpec(reactContext) {

  private val tokenStore = TokenStore(reactContext)
  private val mainHandler = Handler(Looper.getMainLooper())

  // Main thread only.
  private var loginSession: LoginSession? = null
  private var refreshWaiters: MutableList<(TokenResult) -> Unit>? = null

  private val activityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(
      activity: Activity,
      requestCode: Int,
      resultCode: Int,
      data: Intent?
    ) {
      if (requestCode != Constant.ZALO_AUTHENTICATE_REQUEST_CODE &&
        requestCode != Constant.BROWSER_AUTHENTICATE_REQUEST_CODE
      ) return
      if (!ZaloSdkCompat.isInitialized()) return
      ZaloSDK.Instance.onActivityResult(activity, requestCode, resultCode, data)
    }
  }

  init {
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName(): String {
    return NAME
  }

  override fun invalidate() {
    reactApplicationContext.removeActivityEventListener(activityEventListener)
    super.invalidate()
  }

  override fun login(authType: String, fallbackToWeb: Boolean, promise: Promise) {
    val loginVia = when (authType) {
      "AUTH_VIA_WEB" -> LoginVia.WEB
      "AUTH_VIA_APP" -> LoginVia.APP
      else -> LoginVia.APP_OR_WEB
    }
    UiThreadUtil.runOnUiThread { startLogin(loginVia, fallbackToWeb, promise) }
  }

  // Runs on the main thread so it is ordered after any login/refresh callback already queued there.
  override fun logout() {
    UiThreadUtil.runOnUiThread {
      loginSession?.let { rejectLogin(it, ERROR_LOGIN_SUPERSEDED, "logout() was called during login") }
      if (ZaloSdkCompat.isInitialized()) {
        ZaloSDK.Instance.unauthenticate()
      }
      tokenStore.clear()
    }
  }

  override fun isAuthenticated(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      // Validating the refresh token that an in-flight refresh is about to rotate would report a
      // false logout, so wait for that refresh instead.
      refreshWaiters?.let { waiters ->
        waiters.add { result -> resolveAuthState(promise, result) }
        return@runOnUiThread
      }
      val tokens = tokenStore.read()
      if (tokens == null) {
        promise.resolve(false)
        return@runOnUiThread
      }
      if (!ZaloSdkCompat.ensureInitialized(reactApplicationContext)) {
        promise.reject(ERROR_NOT_CONFIGURED, NOT_CONFIGURED_MESSAGE)
        return@runOnUiThread
      }
      ZaloSDK.Instance.isAuthenticate(tokens.refreshToken) { validated, errorCode, _ ->
        runOnMain {
          when {
            validated -> promise.resolve(true)
            errorCode in TRANSIENT_ERRORS -> promise.reject(
              errorCode.toString(),
              "Could not reach Zalo to validate the session (code $errorCode)"
            )
            else -> {
              // A refresh that started after this check may have rotated the token meanwhile.
              val current = tokenStore.read()
              promise.resolve(current != null && current.refreshToken != tokens.refreshToken)
            }
          }
        }
      }
    }
  }

  private fun resolveAuthState(promise: Promise, result: TokenResult) {
    when (result) {
      is TokenResult.Success -> promise.resolve(true)
      is TokenResult.Failure -> {
        val zaloCode = result.code.toIntOrNull()
        if (result.code == ERROR_NOT_AUTHENTICATED || (zaloCode != null && zaloCode !in TRANSIENT_ERRORS)) {
          promise.resolve(false)
        } else {
          promise.reject(result.code, result.message)
        }
      }
    }
  }

  override fun getAccessToken(forceRefresh: Boolean, promise: Promise) {
    UiThreadUtil.runOnUiThread {
      withValidTokens(forceRefresh) { result ->
        when (result) {
          is TokenResult.Success -> promise.resolve(result.toMap())
          is TokenResult.Failure -> promise.reject(result.code, result.message)
        }
      }
    }
  }

  override fun getUserProfile(promise: Promise) {
    UiThreadUtil.runOnUiThread {
      if (!ZaloSdkCompat.ensureInitialized(reactApplicationContext)) {
        promise.reject(ERROR_NOT_CONFIGURED, NOT_CONFIGURED_MESSAGE)
        return@runOnUiThread
      }
      fetchProfile(promise, allowRetry = true, forceRefresh = false)
    }
  }

  override fun getApplicationHashKey(): String {
    return Util.getApplicationHashKey(reactApplicationContext)
  }

  private fun startLogin(loginVia: LoginVia, fallbackToWeb: Boolean, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject(ERROR_NO_ACTIVITY, "There is no foreground activity to start Zalo login from")
      return
    }
    if (!ZaloSdkCompat.ensureInitialized(reactApplicationContext)) {
      promise.reject(ERROR_NOT_CONFIGURED, NOT_CONFIGURED_MESSAGE)
      return
    }

    loginSession?.let {
      rejectLogin(it, ERROR_LOGIN_SUPERSEDED, "A newer login() call replaced this one")
    }

    val codeVerifier = generateCodeVerifier()
    val session = LoginSession(
      promise,
      codeVerifier,
      generateCodeChallenge(codeVerifier),
      fallbackToWeb && loginVia != LoginVia.WEB
    )
    loginSession = session
    authenticate(activity, session, loginVia)
  }

  private fun authenticate(activity: Activity, session: LoginSession, loginVia: LoginVia) {
    ZaloSdkCompat.resetOutOfDateFlag()
    try {
      ZaloSDK.Instance.authenticateZaloWithAuthenType(
        activity,
        loginVia,
        session.codeChallenge,
        session.listener
      )
    } catch (e: Exception) {
      rejectLogin(session, ERROR_INVALID_RESPONSE, e.message ?: "Zalo SDK failed to start login")
    }
  }

  private fun isActive(session: LoginSession) = loginSession === session

  private fun rejectLogin(session: LoginSession, code: String, message: String) {
    if (!isActive(session)) return
    loginSession = null
    session.promise.reject(code, message)
  }

  private fun onAppUnavailable(session: LoginSession, code: String, message: String) {
    if (!isActive(session) || session.oauthReceived) return
    if (!session.fallbackToWeb || session.webFallbackUsed) {
      rejectLogin(session, code, message)
      return
    }
    session.webFallbackUsed = true
    mainHandler.post {
      if (!isActive(session)) return@post
      val activity = reactApplicationContext.currentActivity
      if (activity == null) {
        rejectLogin(session, ERROR_NO_ACTIVITY, "There is no foreground activity to start Zalo login from")
      } else {
        authenticate(activity, session, LoginVia.WEB)
      }
    }
  }

  private fun onAuthError(session: LoginSession, error: ErrorResponse) {
    // A duplicated activity result (e.g. the host app still forwards it manually) can report a
    // cancellation after the OAuth code was already received.
    if (!isActive(session) || session.oauthReceived) return
    val message = error.errorMsg.takeUnless { it.isNullOrBlank() }
      ?: if (error.errorCode == USER_BACK_ERROR) "Login was cancelled"
      else "Zalo login failed (code ${error.errorCode})"
    rejectLogin(session, error.errorCode.toString(), message)
  }

  private fun onOAuthCode(session: LoginSession, response: OauthResponse) {
    if (!isActive(session) || session.oauthReceived) return
    session.oauthReceived = true

    val oauthCode = response.oauthCode
    if (oauthCode.isNullOrEmpty()) {
      rejectLogin(session, ERROR_INVALID_RESPONSE, "Zalo returned an empty OAuth code")
      return
    }
    try {
      ZaloSDK.Instance.getAccessTokenByOAuthCode(
        reactApplicationContext,
        oauthCode,
        session.codeVerifier
      ) { data: JSONObject? ->
        runOnMain {
          if (!isActive(session)) return@runOnMain
          when (val result = parseTokenResponse(data, null)) {
            is TokenResult.Success -> {
              tokenStore.write(result.tokens)
              loginSession = null
              session.promise.resolve(result.toMap())
            }
            is TokenResult.Failure -> rejectLogin(session, result.code, result.message)
          }
        }
      }
    } catch (e: Exception) {
      rejectLogin(session, ERROR_INVALID_RESPONSE, e.message ?: "Could not exchange the OAuth code")
    }
  }

  private fun withValidTokens(forceRefresh: Boolean, callback: (TokenResult) -> Unit) {
    val tokens = tokenStore.read()
    if (tokens == null) {
      callback(TokenResult.Failure(ERROR_NOT_AUTHENTICATED, NOT_AUTHENTICATED_MESSAGE))
      return
    }
    if (!forceRefresh && tokens.accessToken.isNotEmpty() && !isExpired(tokens)) {
      callback(TokenResult.Success(tokens))
      return
    }
    refreshTokens(callback)
  }

  // Refresh tokens are single-use, so concurrent callers must share one request.
  private fun refreshTokens(callback: (TokenResult) -> Unit) {
    refreshWaiters?.let {
      it.add(callback)
      return
    }
    val tokens = tokenStore.read()
    if (tokens == null) {
      callback(TokenResult.Failure(ERROR_NOT_AUTHENTICATED, NOT_AUTHENTICATED_MESSAGE))
      return
    }
    if (!ZaloSdkCompat.ensureInitialized(reactApplicationContext)) {
      callback(TokenResult.Failure(ERROR_NOT_CONFIGURED, NOT_CONFIGURED_MESSAGE))
      return
    }

    val waiters = mutableListOf(callback)
    refreshWaiters = waiters
    val complete: (TokenResult) -> Unit = { result ->
      refreshWaiters = null
      waiters.forEach { it(result) }
    }

    try {
      ZaloSDK.Instance.getAccessTokenByRefreshToken(
        reactApplicationContext,
        tokens.refreshToken
      ) { data: JSONObject? ->
        runOnMain {
          val current = tokenStore.read()
          if (current?.refreshToken != tokens.refreshToken) {
            // logout() or a new login() happened while refreshing.
            complete(
              current?.let { TokenResult.Success(it) }
                ?: TokenResult.Failure(ERROR_NOT_AUTHENTICATED, NOT_AUTHENTICATED_MESSAGE)
            )
            return@runOnMain
          }
          val result = parseTokenResponse(data, tokens.refreshToken)
          if (result is TokenResult.Success) tokenStore.write(result.tokens)
          complete(result)
        }
      }
    } catch (e: Exception) {
      complete(
        TokenResult.Failure(ERROR_INVALID_RESPONSE, e.message ?: "Could not refresh the access token")
      )
    }
  }

  private fun fetchProfile(promise: Promise, allowRetry: Boolean, forceRefresh: Boolean) {
    withValidTokens(forceRefresh) { result ->
      when (result) {
        is TokenResult.Failure -> promise.reject(result.code, result.message)
        is TokenResult.Success -> ZaloSDK.Instance.getProfile(
          reactApplicationContext,
          result.tokens.accessToken,
          { response: JSONObject? ->
            runOnMain { handleProfileResponse(promise, response, allowRetry) }
          },
          PROFILE_FIELDS
        )
      }
    }
  }

  private fun handleProfileResponse(promise: Promise, response: JSONObject?, allowRetry: Boolean) {
    if (response == null) {
      promise.reject(ERROR_INVALID_RESPONSE, "Zalo returned an empty profile response")
      return
    }
    val error = response.optInt("error", 0)
    if (error == 0) {
      try {
        promise.resolve(convertJsonToMap(response))
      } catch (e: Exception) {
        promise.reject(ERROR_INVALID_RESPONSE, "Error when parsing user profile data")
      }
      return
    }
    if (allowRetry && error in ACCESS_TOKEN_ERRORS) {
      fetchProfile(promise, allowRetry = false, forceRefresh = true)
      return
    }
    val message = response.optString("message").ifEmpty { "Could not get user profile (code $error)" }
    promise.reject(error.toString(), message)
  }

  private fun parseTokenResponse(data: JSONObject?, previousRefreshToken: String?): TokenResult {
    if (data == null) {
      return TokenResult.Failure(ERROR_INVALID_RESPONSE, "Zalo returned an empty token response")
    }
    val error = data.optInt("error", 0)
    val accessToken = data.optString("access_token")
    if (error != 0 || accessToken.isEmpty()) {
      val message = listOf("error_description", "errorMsg", "message", "error_name")
        .map { data.optString(it) }
        .firstOrNull { it.isNotEmpty() }
        ?: "Could not get an access token from Zalo"
      return TokenResult.Failure(
        if (error != 0) error.toString() else ERROR_INVALID_RESPONSE,
        message
      )
    }
    val refreshToken = data.optString("refresh_token").ifEmpty { previousRefreshToken ?: "" }
    val expiresIn = data.optString("expires_in").toLongOrNull() ?: 0L
    val expiresAt = if (expiresIn > 0) System.currentTimeMillis() + expiresIn * 1000 else 0L
    return TokenResult.Success(StoredTokens(accessToken, refreshToken, expiresAt))
  }

  private fun isExpired(tokens: StoredTokens): Boolean =
    tokens.expiresAt > 0 && System.currentTimeMillis() >= tokens.expiresAt - EXPIRY_SKEW_MS

  private fun runOnMain(block: () -> Unit) {
    if (Looper.myLooper() == Looper.getMainLooper()) block() else mainHandler.post(block)
  }

  private sealed class TokenResult {
    class Success(val tokens: StoredTokens) : TokenResult() {
      fun toMap(): WritableMap {
        val expiresIn = if (tokens.expiresAt > 0) {
          maxOf(0L, (tokens.expiresAt - System.currentTimeMillis()) / 1000)
        } else 0L
        return Arguments.createMap().apply {
          putString("accessToken", tokens.accessToken)
          putString("refreshToken", tokens.refreshToken)
          putDouble("expiresIn", expiresIn.toDouble())
          putDouble("expiresAt", tokens.expiresAt.toDouble())
        }
      }
    }

    class Failure(val code: String, val message: String) : TokenResult()
  }

  // The SDK keeps its listener behind a WeakReference by default, so the session must hold the
  // only strong reference for as long as the login is in flight.
  private inner class LoginSession(
    val promise: Promise,
    val codeVerifier: String,
    val codeChallenge: String,
    val fallbackToWeb: Boolean
  ) {
    var oauthReceived = false
    var webFallbackUsed = false

    val listener = object : OAuthCompleteListener() {
      override fun onAuthenError(errorResponse: ErrorResponse) {
        runOnMain { onAuthError(this@LoginSession, errorResponse) }
      }

      override fun onGetOAuthComplete(response: OauthResponse) {
        runOnMain { onOAuthCode(this@LoginSession, response) }
      }

      override fun onZaloOutOfDate(context: Context) {
        runOnMain {
          onAppUnavailable(
            this@LoginSession,
            ERROR_ZALO_APP_INCOMPATIBLE,
            "The installed Zalo app could not handle the login request"
          )
        }
      }

      override fun onZaloNotInstalled(context: Context) {
        runOnMain {
          onAppUnavailable(this@LoginSession, ERROR_ZALO_NOT_INSTALLED, "Zalo app is not installed")
        }
      }
    }
  }

  companion object {
    const val NAME = "ZaloKit"

    private const val ERROR_ZALO_NOT_INSTALLED = "ZALO_NOT_INSTALLED"
    private const val ERROR_ZALO_APP_INCOMPATIBLE = "ZALO_APP_INCOMPATIBLE"
    private const val ERROR_NOT_AUTHENTICATED = "NOT_AUTHENTICATED"
    private const val ERROR_NO_ACTIVITY = "NO_ACTIVITY"
    private const val ERROR_LOGIN_SUPERSEDED = "LOGIN_SUPERSEDED"
    private const val ERROR_NOT_CONFIGURED = "NOT_CONFIGURED"
    private const val ERROR_INVALID_RESPONSE = "INVALID_RESPONSE"

    private const val NOT_AUTHENTICATED_MESSAGE = "No Zalo session. Call login() first"
    private const val NOT_CONFIGURED_MESSAGE =
      "Zalo SDK is not configured. Add <meta-data android:name=\"com.zing.zalo.zalosdk.appID\"> to AndroidManifest.xml"

    private const val USER_BACK_ERROR = -7008
    private const val EXPIRY_SKEW_MS = 60_000L
    private val PROFILE_FIELDS = arrayOf("id", "name", "picture")
    private val ACCESS_TOKEN_ERRORS = setOf(-124, -216, -220, -5004)
    private val TRANSIENT_ERRORS = setOf(-8000, -8001, -7024, -7025)
  }
}
