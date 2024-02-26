import {
  withPlugins,
  withInfoPlist,
  withAppDelegate,
} from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config-types';

const withZaloIOSPlist = (config: ExpoConfig, appId: string) =>
  withInfoPlist(config, (infoConfig) => {
    let queriesSchemes = infoConfig.modResults.LSApplicationQueriesSchemes;
    if (!queriesSchemes) {
      infoConfig.modResults.LSApplicationQueriesSchemes = [];
      queriesSchemes = infoConfig.modResults.LSApplicationQueriesSchemes;
    }

    if (!queriesSchemes.find((item) => item === 'zalosdk')) {
      queriesSchemes.push('zalosdk');
    }

    if (!queriesSchemes.find((item) => item === 'zaloshareext')) {
      queriesSchemes.push('zaloshareext');
    }

    let urlTypes = infoConfig.modResults.CFBundleURLTypes;
    if (!urlTypes) {
      infoConfig.modResults.CFBundleURLTypes = [];
      urlTypes = infoConfig.modResults.CFBundleURLTypes;
    }

    if (!urlTypes.find((item) => item.CFBundleURLName)) {
      urlTypes.push({
        CFBundleURLName: 'zalo',
        CFBundleURLSchemes: [`zalo-${appId}`],
      });
    }

    return infoConfig;
  });

const withZaloAppDelegate = (config: ExpoConfig, appDelegateContent: string) =>
  withAppDelegate(config, (appDelegateConfig) => {
    appDelegateConfig.modResults.contents = appDelegateContent;
    return appDelegateConfig;
  });

/**
 * @typedef {import("expo/config-plugins").ConfigPlugin} ConfigPlugin
 * @param {ConfigPlugin} config
 */
const withIOS = (
  config: ExpoConfig,
  { appId, appDelegateContent }: Record<string, string>
) =>
  withPlugins(config, [
    [withZaloIOSPlist, appId],
    [withZaloAppDelegate, appDelegateContent],
  ]);

export default withIOS;
