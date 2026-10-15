package com.zalokit

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import org.json.JSONException
import org.json.JSONObject
import java.security.KeyStore
import javax.crypto.AEADBadTagException
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

internal data class StoredTokens(
  val accessToken: String,
  val refreshToken: String,
  val expiresAt: Long
)

/**
 * Persists the Zalo token pair encrypted with an AES key that never leaves the
 * Android Keystore. If the Keystore is unusable on a device, tokens are kept in
 * memory only for the lifetime of the process.
 */
internal class TokenStore(context: Context) {
  private val appContext = context.applicationContext
  private val prefs = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  private var cached: StoredTokens? = null
  private var loaded = false

  @Synchronized
  fun read(): StoredTokens? {
    if (!loaded) {
      cached = migrateLegacy() ?: load()
    }
    return cached
  }

  /** Returns false when the tokens could only be kept in memory. */
  // commit() rather than apply(): refresh tokens are single-use, so losing the rotated pair to a
  // process kill would log the user out.
  @Synchronized
  fun write(tokens: StoredTokens): Boolean {
    cached = tokens
    loaded = true
    return try {
      val json = JSONObject()
        .put("accessToken", tokens.accessToken)
        .put("refreshToken", tokens.refreshToken)
        .put("expiresAt", tokens.expiresAt)
        .toString()
      prefs.edit().putString(KEY_TOKENS, encrypt(json)).commit()
    } catch (e: Exception) {
      Log.w(TAG, "Could not persist Zalo tokens, keeping them in memory only", e)
      prefs.edit().remove(KEY_TOKENS).commit()
      false
    }
  }

  @Synchronized
  fun clear() {
    cached = null
    loaded = true
    prefs.edit().remove(KEY_TOKENS).commit()
    legacyPrefs().edit()
      .remove(LEGACY_ACCESS_TOKEN_KEY)
      .remove(LEGACY_REFRESH_TOKEN_KEY)
      .commit()
  }

  private fun load(): StoredTokens? {
    val blob = prefs.getString(KEY_TOKENS, null)
    if (blob == null) {
      loaded = true
      return null
    }
    return try {
      val key = existingKey()
      val tokens = key?.let { parse(decrypt(blob, it)) }
      if (tokens == null) {
        // Typically a backup restored on another device: the Keystore key is gone.
        discard("Stored Zalo tokens can no longer be decrypted, discarding them", null)
      }
      loaded = true
      tokens
    } catch (e: Exception) {
      if (e is AEADBadTagException || e is JSONException ||
        e is IllegalArgumentException || e is IndexOutOfBoundsException
      ) {
        discard("Stored Zalo tokens are corrupted, discarding them", e)
        loaded = true
        return null
      }
      // The Keystore can be briefly unavailable (e.g. right after boot on some devices); keep the
      // blob and retry on the next read instead of logging the user out.
      Log.w(TAG, "Could not read stored Zalo tokens, will retry", e)
      null
    }
  }

  private fun parse(json: String): StoredTokens {
    val obj = JSONObject(json)
    return StoredTokens(
      obj.getString("accessToken"),
      obj.getString("refreshToken"),
      obj.optLong("expiresAt", 0L)
    )
  }

  private fun discard(message: String, e: Exception?) {
    Log.w(TAG, message, e)
    prefs.edit().remove(KEY_TOKENS).commit()
  }

  private fun migrateLegacy(): StoredTokens? {
    val legacy = legacyPrefs()
    val refreshToken = legacy.getString(LEGACY_REFRESH_TOKEN_KEY, null)
    if (refreshToken.isNullOrEmpty()) return null

    val tokens = StoredTokens(
      legacy.getString(LEGACY_ACCESS_TOKEN_KEY, null) ?: "",
      refreshToken,
      0L
    )
    if (write(tokens)) {
      legacy.edit()
        .remove(LEGACY_ACCESS_TOKEN_KEY)
        .remove(LEGACY_REFRESH_TOKEN_KEY)
        .commit()
    }
    return tokens
  }

  // Same file as androidx PreferenceManager.getDefaultSharedPreferences(), used by <= 5.x.
  private fun legacyPrefs() =
    appContext.getSharedPreferences("${appContext.packageName}_preferences", Context.MODE_PRIVATE)

  private fun encrypt(plain: String): String {
    val cipher = Cipher.getInstance(TRANSFORMATION)
    cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())
    val iv = cipher.iv
    val encrypted = cipher.doFinal(plain.toByteArray(Charsets.UTF_8))
    return Base64.encodeToString(iv + encrypted, Base64.NO_WRAP)
  }

  private fun decrypt(blob: String, key: SecretKey): String {
    val bytes = Base64.decode(blob, Base64.NO_WRAP)
    val iv = bytes.copyOfRange(0, GCM_IV_LENGTH)
    val encrypted = bytes.copyOfRange(GCM_IV_LENGTH, bytes.size)
    val cipher = Cipher.getInstance(TRANSFORMATION)
    cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv))
    return String(cipher.doFinal(encrypted), Charsets.UTF_8)
  }

  private fun existingKey(): SecretKey? {
    val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
    return (keyStore.getEntry(KEY_ALIAS, null) as? KeyStore.SecretKeyEntry)?.secretKey
  }

  private fun getOrCreateKey(): SecretKey {
    existingKey()?.let { return it }
    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
    generator.init(
      KeyGenParameterSpec.Builder(
        KEY_ALIAS,
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
      )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .build()
    )
    return generator.generateKey()
  }

  companion object {
    private const val TAG = "ZaloKit"
    private const val PREFS_NAME = "com.zalokit.tokens"
    private const val KEY_TOKENS = "tokens"
    private const val KEY_ALIAS = "com.zalokit.tokens"
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val GCM_IV_LENGTH = 12
    private const val GCM_TAG_LENGTH_BITS = 128
    private const val LEGACY_ACCESS_TOKEN_KEY = "__RN_ZALO_KIT_ACCESS_TOKEN__"
    private const val LEGACY_REFRESH_TOKEN_KEY = "__RN_ZALO_KIT_REFRESH_TOKEN__"
  }
}
