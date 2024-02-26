'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setZaloConfig =
  exports.withAndroidPermissions =
  exports.withZaloWrapApplication =
  exports.withZaloMainActivity =
  exports.withZaloManifest =
  exports.withZaloAppIdString =
    void 0;
const config_1 = require('./config');
const config_plugins_1 = require('@expo/config-plugins');
const Scheme_1 = require('@expo/config-plugins/build/android/Scheme');

const { buildResourceItem } = config_plugins_1.AndroidConfig.Resources;
const { removeStringItem, setStringItem } =
  config_plugins_1.AndroidConfig.Strings;
const {
  addMetaDataItemToMainApplication,
  getMainApplicationOrThrow,
  prefixAndroidKeys,
  removeMetaDataItemFromMainApplication,
} = config_plugins_1.AndroidConfig.Manifest;

const CUSTOM_TAB_ACTIVITY = 'com.zing.zalo.zalosdk.oauth.BrowserLoginActivity';
const STRING_Zalo_APP_ID = 'appID';
const META_APP_ID = 'com.zing.zalo.zalosdk.appID';

const withZaloWrapApplication = config => {
  return (0, config_plugins_1.withMainApplication)(config, modConfig => {
    const insertionCode = '    ZaloSDKApplication.wrap(this);';
    const insertionCode2 =
      'import com.zing.zalo.zalosdk.oauth.ZaloSDKApplication;';
    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      'ApplicationLifecycleDispatcher.onApplicationCreate(this);',
      'ApplicationLifecycleDispatcher.onApplicationCreate(this);\n' +
        insertionCode,
    );
    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      'import android.app.Application;',
      'import android.app.Application;\n' + insertionCode2,
    );
    return modConfig;
  });
};
exports.withZaloWrapApplication = withZaloWrapApplication;

const withZaloMainActivity = config => {
  return (0, config_plugins_1.withMainActivity)(config, modConfig => {
    // console.log(JSON.stringify(modConfig));

    const oldCode =
      "@Override\n  public void invokeDefaultOnBackPressed() {\n    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {\n      if (!moveTaskToBack(false)) {\n        // For non-root activities, use the default implementation to finish them.\n        super.invokeDefaultOnBackPressed();\n      }\n      return;\n    }\n\n    // Use the default back button implementation on Android S\n    // because it's doing more than {@link Activity#moveTaskToBack} in fact.\n    super.invokeDefaultOnBackPressed();\n  }";

    const insertionCode =
      'import com.zing.zalo.zalosdk.oauth.ZaloSDK;\nimport android.content.Intent;';

    const insertionCode2 = `// override method below (create it if not exist)
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
      super.onActivityResult(requestCode, resultCode, data);
      ZaloSDK.Instance.onActivityResult(this, requestCode, resultCode, data);
    }`;

    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      'import com.facebook.react.ReactActivity;',
      'import com.facebook.react.ReactActivity;\n' + insertionCode,
    );
    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      oldCode,
      oldCode + '\n' + insertionCode2,
    );
    return modConfig;
  });
};
exports.withZaloMainActivity = withZaloMainActivity;

const withZaloAppIdString = (config, props) => {
  return (0, config_plugins_1.withStringsXml)(config, config => {
    config.modResults = applyZaloAppIdString(props, config.modResults);
    return config;
  });
};
exports.withZaloAppIdString = withZaloAppIdString;
const withZaloManifest = (config, props) => {
  return (0, config_plugins_1.withAndroidManifest)(config, config => {
    config.modResults = setZaloConfig(props, config.modResults);
    return config;
  });
};
exports.withZaloManifest = withZaloManifest;
const withAndroidPermissions = config => {
  config = config_plugins_1.AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.INTERNET',
  ]);
  return config;
};
exports.withAndroidPermissions = withAndroidPermissions;
function buildXMLItem({ head, children }) {
  return {
    ...(children !== null && children !== void 0 ? children : {}),
    $: head,
  };
}
function buildAndroidItem(datum) {
  const item = typeof datum === 'string' ? { name: datum } : datum;
  const head = prefixAndroidKeys(item);
  return buildXMLItem({ head });
}
function getZaloSchemeActivity(appId) {
  /**
  <activity
      android:name="com.Zalo.CustomTabActivity"
      android:exported="true">
      <intent-filter>
          <action android:name="android.intent.action.VIEW" />
          <category android:name="android.intent.category.DEFAULT" />
          <category android:name="android.intent.category.BROWSABLE" />
          <data android:scheme="@string/fb_login_protocol_scheme" />
      </intent-filter>
  </activity>
     */
  return buildXMLItem({
    head: prefixAndroidKeys({
      name: CUSTOM_TAB_ACTIVITY,
      exported: 'true',
    }),
    children: {
      'intent-filter': [
        {
          action: [buildAndroidItem('android.intent.action.VIEW')],
          category: [
            buildAndroidItem('android.intent.category.DEFAULT'),
            buildAndroidItem('android.intent.category.BROWSABLE'),
          ],
          data: [buildAndroidItem({ scheme: `zalo-${appId}` })],
        },
      ],
    },
  });
}

function ensureZaloActivity({ mainApplication, appID }) {
  if (Array.isArray(mainApplication.activity)) {
    // Remove all Zalo CustomTabActivities first
    mainApplication.activity = mainApplication.activity.filter(activity => {
      var _a;
      return (
        ((_a = activity.$) === null || _a === void 0
          ? void 0
          : _a['android:name']) !== CUSTOM_TAB_ACTIVITY
      );
    });
  } else {
    mainApplication.activity = [];
  }
  // If a new scheme is defined, append it to the activity.
  if (appID) {
    mainApplication.activity.push(getZaloSchemeActivity(appID));
  }

  return mainApplication;
}

function applyZaloAppIdString(props, stringsJSON) {
  const appID = (0, config_1.getZaloAppId)(props);
  if (appID) {
    return setStringItem(
      [buildResourceItem({ name: STRING_Zalo_APP_ID, value: appID })],
      stringsJSON,
    );
  }
  return removeStringItem(STRING_Zalo_APP_ID, stringsJSON);
}

function setZaloConfig(props, androidManifest) {
  const scheme = (0, config_1.getZaloScheme)(props);
  const appID = (0, config_1.getZaloAppId)(props);

  let mainApplication = getMainApplicationOrThrow(androidManifest);
  if (scheme && !(0, Scheme_1.hasScheme)(scheme, androidManifest)) {
    androidManifest = (0, Scheme_1.appendScheme)(scheme, androidManifest);
  }
  mainApplication = ensureZaloActivity({ mainApplication, appID });
  if (appID) {
    mainApplication = addMetaDataItemToMainApplication(
      mainApplication,
      META_APP_ID,
      `@string/${STRING_Zalo_APP_ID}`,
    );
  } else {
    mainApplication = removeMetaDataItemFromMainApplication(
      mainApplication,
      META_APP_ID,
    );
  }

  androidManifest.manifest.queries = androidManifest.manifest.queries.filter(
    query => {
      const check = query.package?.find(item => {
        var _a;
        return (
          ((_a = item.$) === null || _a === void 0
            ? void 0
            : _a['android:name']) === 'com.zing.zalo'
        );
      });

      return !check;
    },
  );
  androidManifest.manifest.queries.push({
    package: [buildAndroidItem('com.zing.zalo')],
  });

  // console.log(JSON.stringify(androidManifest));

  return androidManifest;
}
exports.setZaloConfig = setZaloConfig;
