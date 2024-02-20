'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = require('./config');
const withZaloAndroid_1 = require('./withZaloAndroid');
const withZaloIOS_1 = require('./withZaloIOS');
const withProguardRules = require('./withProguardRules');

const config_plugins_1 = require('@expo/config-plugins');
const pkg = require('react-native-zalo-kit/package.json');
const withZalo = (config, props) => {
  const newProps = (0, config_1.getMergePropsWithConfig)(config, props);
  if (!newProps.appID) {
    throw new Error('missing appID in the plugin properties');
  }
  // Android
  config = (0, withProguardRules)(config, newProps);
  config = (0, withZaloAndroid_1.withZaloAppIdString)(config, newProps);
  config = (0, withZaloAndroid_1.withZaloManifest)(config, newProps);
  config = (0, withZaloAndroid_1.withAndroidPermissions)(config, newProps);
  config = (0, withZaloAndroid_1.withZaloWrapApplication)(config, newProps);
  config = (0, withZaloAndroid_1.withZaloMainActivity)(config, newProps);

  // // iOS
  config = (0, withZaloIOS_1.withZaloIOS)(config, newProps);
  config = (0, withZaloIOS_1.withZaloAppDelegate)(config, newProps);
  return config;
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(
  withZalo,
  pkg.name,
  pkg.version,
);
