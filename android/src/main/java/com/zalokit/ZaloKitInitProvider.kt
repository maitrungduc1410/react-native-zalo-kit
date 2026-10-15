package com.zalokit

import android.content.ContentProvider
import android.content.ContentValues
import android.database.Cursor
import android.net.Uri

/**
 * Initializes the Zalo SDK at process start, before any activity is created. This replaces the
 * manual `ZaloSDKApplication.wrap(this)` call and also covers the case where Android restores the
 * process directly into `BrowserLoginActivity`, which needs the SDK to be ready.
 */
class ZaloKitInitProvider : ContentProvider() {
  override fun onCreate(): Boolean {
    context?.let { ZaloSdkCompat.ensureInitialized(it) }
    return true
  }

  override fun query(
    uri: Uri,
    projection: Array<out String>?,
    selection: String?,
    selectionArgs: Array<out String>?,
    sortOrder: String?
  ): Cursor? = null

  override fun getType(uri: Uri): String? = null

  override fun insert(uri: Uri, values: ContentValues?): Uri? = null

  override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int = 0

  override fun update(
    uri: Uri,
    values: ContentValues?,
    selection: String?,
    selectionArgs: Array<out String>?
  ): Int = 0
}
