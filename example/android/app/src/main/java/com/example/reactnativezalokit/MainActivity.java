package com.example.reactnativezalokit;

import android.content.Intent;

import com.facebook.react.ReactActivity;
import com.zing.zalo.zalosdk.oauth.ZaloSDK;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "ZaloKitExample";
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    ZaloSDK.Instance.onActivityResult(this, requestCode, resultCode, data);
  }
}
