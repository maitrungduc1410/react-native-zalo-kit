import type { ExpoConfig } from '@expo/config-types';
import {
  withAndroidManifest,
  withStringsXml,
  withPlugins,
  withMainActivity,
  withMainApplication,
} from '@expo/config-plugins';

const withZaloAndroidManifest = (config: ExpoConfig, appId: string) =>
  withAndroidManifest(config, (manifestConfig) => {
    const androidProject = manifestConfig.modResults;
    // add queries
    const queries = androidProject.manifest.queries;

    const exists = queries.find(
      (q) =>
        q.package &&
        q.package.find((p) => p.$['android:name'] === 'com.zing.zalo')
    );

    if (!exists) {
      queries.push({
        package: [
          {
            $: {
              'android:name': 'com.zing.zalo',
            },
          },
        ],
      });
    }

    const application = androidProject.manifest.application?.find(
      (item) => item.$['android:name'] === '.MainApplication'
    );

    if (!application) {
      return manifestConfig;
    }

    // add metadata
    const zaloMetaExists = application['meta-data']?.find(
      (item) => item.$['android:name'] === 'com.zing.zalo.zalosdk.appID'
    );

    if (!zaloMetaExists) {
      application['meta-data']!.push({
        $: {
          'android:name': 'com.zing.zalo.zalosdk.appID',
          'android:value': '@string/appID',
        },
      });
    }

    // add BrowserLoginActivity
    const browserLoginActivityExists = application.activity?.find(
      (item) =>
        item.$['android:name'] ===
        'com.zing.zalo.zalosdk.oauth.BrowserLoginActivity'
    );

    if (!browserLoginActivityExists) {
      application.activity!.push({
        '$': {
          'android:name': 'com.zing.zalo.zalosdk.oauth.BrowserLoginActivity',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.intent.action.VIEW',
                },
              },
            ],
            category: [
              {
                $: {
                  'android:name': 'android.intent.category.DEFAULT',
                },
              },
              {
                $: {
                  'android:name': 'android.intent.category.BROWSABLE',
                },
              },
            ],
            data: [
              {
                $: {
                  'android:scheme': `zalo-${appId}`,
                },
              },
            ],
          },
        ],
      });
    }

    return manifestConfig;
  });

const withZaloAndroidStrings = (config: ExpoConfig, appId: string) =>
  withStringsXml(config, (stringsConfig) => {
    let strings = stringsConfig.modResults.resources.string;

    if (!strings) {
      stringsConfig.modResults.resources.string = [];
      strings = stringsConfig.modResults.resources.string;
    }

    const exists = strings.find((item) => item.$.name === 'appID');

    if (!exists) {
      strings.push({
        $: {
          name: 'appID',
        },
        _: appId,
      });
    }

    return stringsConfig;
  });

const withZaloAndroidMainActivity = (config: ExpoConfig, content: string) =>
  withMainActivity(config, (mainActivityConfig) => {
    mainActivityConfig.modResults.contents = content;
    return mainActivityConfig;
  });

/**
 * @typedef {import("expo/config-plugins").ConfigPlugin} ConfigPlugin
 * @param {ConfigPlugin} config
 * * @param {String} content
 */
const withZaloAndroidMainApplication = (config: ExpoConfig, content: string) =>
  withMainApplication(config, (mainApplicationConfig) => {
    mainApplicationConfig.modResults.contents = content;
    return mainApplicationConfig;
  });

/**
 * @typedef {import("expo/config-plugins").ConfigPlugin} ConfigPlugin
 * @param {ConfigPlugin} config
 * @param {String} appId
 */
const withAndroid = (
  config: ExpoConfig,
  { appId, mainActivityContent, mainApplicationContent }: Record<string, string>
) =>
  withPlugins(config, [
    [withZaloAndroidManifest, appId],
    [withZaloAndroidStrings, appId],
    [withZaloAndroidMainActivity, mainActivityContent],
    [withZaloAndroidMainApplication, mainApplicationContent],
  ]);

export default withAndroid;
