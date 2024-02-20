'use strict';
Object.defineProperty(exports, '__esModule', { value: true });

exports.setZaloApplicationQuerySchemes =
  exports.withZaloAppDelegate =
  exports.setZaloAppId =
  exports.setZaloScheme =
  exports.setZaloConfig =
  exports.withZaloIOS =
    void 0;
const config_1 = require('./config');
const config_plugins_1 = require('@expo/config-plugins');
const { Scheme } = config_plugins_1.IOSConfig;
const { appendScheme } = Scheme;
const zaloSchemes = ['zalosdk', 'zaloshareext'];

const withZaloAppDelegate = (config, props) => {
  return (0, config_plugins_1.withAppDelegate)(config, modConfig => {
    const ZaloAppId = (0, config_1.getZaloAppId)(props);
    if (ZaloAppId) {
      const insertionCodeTop = '#import <ZaloSDK/ZaloSDK.h>';
      const insertionCodeBot = `[[ZaloSDK sharedInstance] initializeWithAppId:@"${ZaloAppId}"];\n`;
      const insertionCodeBot2 =
        '[[ZDKApplicationDelegate sharedInstance] application:application openURL:url options:options]';
      modConfig.modResults.contents = modConfig.modResults.contents.replace(
        '#import "AppDelegate.h"',
        '#import "AppDelegate.h"\n' + insertionCodeTop,
      );
      modConfig.modResults.contents = modConfig.modResults.contents.replace(
        'return [super application:application didFinishLaunchingWithOptions:launchOptions];',
        insertionCodeBot +
          ' return [super application:application didFinishLaunchingWithOptions:launchOptions];',
      );

      const oldCode =
        '[super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options]';
      modConfig.modResults.contents = modConfig.modResults.contents.replace(
        oldCode,
        'return ' + insertionCodeBot2 + ' || ' + oldCode,
      );
    }

    // console.log('modConfig', JSON.stringify(modConfig));
    return modConfig;
  });
};
exports.withZaloAppDelegate = withZaloAppDelegate;

const withZaloIOS = (config, props) => {
  return (0, config_plugins_1.withInfoPlist)(config, config => {
    config.modResults = setZaloConfig(props, config.modResults);
    return config;
  });
};
exports.withZaloIOS = withZaloIOS;
function setZaloConfig(config, infoPlist) {
  infoPlist = setZaloScheme(config, infoPlist);
  infoPlist = setZaloApplicationQuerySchemes(config, infoPlist);
  return infoPlist;
}
exports.setZaloConfig = setZaloConfig;
function setZaloScheme(config, infoPlist) {
  var _a;
  const ZaloScheme = (0, config_1.getZaloScheme)(config);
  if (!ZaloScheme) {
    return infoPlist;
  }
  if (
    (_a = infoPlist.CFBundleURLTypes) === null || _a === void 0
      ? void 0
      : _a.some(({ CFBundleURLSchemes }) =>
          CFBundleURLSchemes.includes(ZaloScheme),
        )
  ) {
    return infoPlist;
  }
  return appendScheme(ZaloScheme, infoPlist);
}
exports.setZaloScheme = setZaloScheme;

function setZaloApplicationQuerySchemes(config, infoPlist) {
  const ZaloAppId = (0, config_1.getZaloAppId)(config);
  const existingSchemes = infoPlist.LSApplicationQueriesSchemes || [];
  if (!ZaloAppId && !existingSchemes.length) {
    // already removed, no need to strip again
    const { LSApplicationQueriesSchemes, ...restInfoPlist } = infoPlist;
    if (
      LSApplicationQueriesSchemes === null ||
      LSApplicationQueriesSchemes === void 0
        ? void 0
        : LSApplicationQueriesSchemes.length
    ) {
      return infoPlist;
    } else {
      // Return without the empty LSApplicationQueriesSchemes array.
      return restInfoPlist;
    }
  }
  // Remove all schemes
  for (const scheme of zaloSchemes) {
    const index = existingSchemes.findIndex(s => s === scheme);
    if (index > -1) {
      existingSchemes.splice(index, 1);
    }
  }
  if (!ZaloAppId) {
    // Run again to ensure the LSApplicationQueriesSchemes array is stripped if needed.
    infoPlist.LSApplicationQueriesSchemes = existingSchemes;
    if (!infoPlist.LSApplicationQueriesSchemes.length) {
      delete infoPlist.LSApplicationQueriesSchemes;
    }
    return infoPlist;
  }
  // TODO: it's actually necessary to add more query schemes (specific to the
  // app) to support all of the features that the Zalo SDK provides, should
  // we sync those here too?
  const updatedSchemes = [...existingSchemes, ...zaloSchemes];
  return {
    ...infoPlist,
    LSApplicationQueriesSchemes: updatedSchemes,
  };
}
exports.setZaloApplicationQuerySchemes = setZaloApplicationQuerySchemes;
