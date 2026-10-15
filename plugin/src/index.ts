import type {
  AndroidConfig as AndroidConfigNamespace,
  ConfigPlugin,
  InfoPlist,
} from '@expo/config-plugins';

type ConfigPluginsModule = typeof import('@expo/config-plugins');
type AndroidManifest = AndroidConfigNamespace.Manifest.AndroidManifest;
type ManifestActivity = AndroidConfigNamespace.Manifest.ManifestActivity;
type ResourceXML = AndroidConfigNamespace.Resources.ResourceXML;
type AppleLanguage = 'objc' | 'objcpp' | 'swift' | 'rb';

export type ZaloKitPluginProps = {
  /** Zalo App ID from https://developers.zalo.me. Pass it as a string. */
  appId: string | number;
};

const pkg = require('../../package.json') as { name: string; version: string };

export const APP_ID_META_DATA = 'com.zing.zalo.zalosdk.appID';
export const APP_ID_STRING_RESOURCE = 'zalokit_app_id';
export const BROWSER_LOGIN_ACTIVITY =
  'com.zing.zalo.zalosdk.oauth.BrowserLoginActivity';
export const IOS_QUERY_SCHEMES = ['zalosdk', 'zaloshareext'];

// Prefer the copy bundled with the app's `expo` package so mods run against the same version as the CLI.
function loadConfigPlugins(): ConfigPluginsModule {
  try {
    return require('expo/config-plugins');
  } catch {
    return require('@expo/config-plugins');
  }
}

export function normalizeAppId(props: ZaloKitPluginProps | undefined): string {
  const raw = props?.appId;
  // Zalo App IDs are 19 digits, beyond what a JSON number can hold exactly.
  if (typeof raw === 'number' && !Number.isSafeInteger(raw)) {
    throw new Error(
      `[${pkg.name}] "appId" must be a string, e.g. { "appId": "1234567890123456789" }. ` +
        `The number ${raw} has already lost precision.`
    );
  }
  const appId = String(raw ?? '').trim();
  if (!/^\d+$/.test(appId)) {
    throw new Error(
      `[${pkg.name}] The "appId" plugin option is required and must be your numeric Zalo App ID, ` +
        `e.g. ["${pkg.name}", { "appId": "1234567890" }]. Received: ${JSON.stringify(props?.appId)}`
    );
  }
  return appId;
}

export function urlScheme(appId: string): string {
  return `zalo-${appId}`;
}

// ---------- Android ----------

export function setZaloStrings(
  strings: ResourceXML,
  appId: string
): ResourceXML {
  const { AndroidConfig } = loadConfigPlugins();
  return AndroidConfig.Strings.setStringItem(
    [
      AndroidConfig.Resources.buildResourceItem({
        name: APP_ID_STRING_RESOURCE,
        value: appId,
        translatable: false,
      }),
    ],
    strings
  );
}

function browserLoginActivity(appId: string): ManifestActivity {
  return {
    '$': {
      'android:name': BROWSER_LOGIN_ACTIVITY,
      'android:exported': 'true',
    },
    'intent-filter': [
      {
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        data: [{ $: { 'android:scheme': urlScheme(appId) } }],
      },
    ],
  };
}

export function setZaloAndroidManifest(
  manifest: AndroidManifest,
  appId: string
): AndroidManifest {
  const { AndroidConfig } = loadConfigPlugins();
  const application =
    AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

  AndroidConfig.Manifest.addMetaDataItemToMainApplication(
    application,
    APP_ID_META_DATA,
    `@string/${APP_ID_STRING_RESOURCE}`
  );

  const activities = application.activity ?? [];
  const activity = browserLoginActivity(appId);
  const index = activities.findIndex(
    (item) => item.$['android:name'] === BROWSER_LOGIN_ACTIVITY
  );
  if (index >= 0) {
    activities[index] = activity;
  } else {
    activities.push(activity);
  }
  application.activity = activities;

  return manifest;
}

// ---------- iOS ----------

export function setZaloInfoPlist(plist: InfoPlist, appId: string): InfoPlist {
  plist.ZaloAppID = appId;

  const querySchemes = [...(plist.LSApplicationQueriesSchemes ?? [])];
  for (const scheme of IOS_QUERY_SCHEMES) {
    if (!querySchemes.includes(scheme)) {
      querySchemes.push(scheme);
    }
  }
  plist.LSApplicationQueriesSchemes = querySchemes;

  // Drop schemes left over from a previous appId so the SDK callback can't open with a stale ID.
  const scheme = urlScheme(appId);
  const urlTypes = (plist.CFBundleURLTypes ?? [])
    .map((type) => ({
      ...type,
      CFBundleURLSchemes: (type.CFBundleURLSchemes ?? []).filter(
        (s) => s === scheme || !/^zalo-\d+$/.test(s)
      ),
    }))
    .filter((type) => type.CFBundleURLSchemes.length > 0);
  if (!urlTypes.some((type) => type.CFBundleURLSchemes.includes(scheme))) {
    urlTypes.push({ CFBundleURLName: 'zalo', CFBundleURLSchemes: [scheme] });
  }
  plist.CFBundleURLTypes = urlTypes;

  return plist;
}

const SWIFT_OPEN_URL =
  /func\s+application\(\s*_\s+(\w+)\s*:\s*UIApplication\s*,\s*open\s+(\w+)\s*:\s*URL\s*,\s*options(?:\s+(\w+))?\s*:[^{]*?->\s*Bool\s*\{/;
const OBJC_OPEN_URL =
  /-\s*\(BOOL\)\s*application\s*:\s*\(\s*UIApplication\s*\*\s*\)\s*(\w+)\s+openURL\s*:\s*\(\s*NSURL\s*\*\s*\)\s*(\w+)\s+options\s*:\s*\([^)]*\)\s*(\w+)\s*\{/;

function addImport(contents: string, importLine: string, isSwift: boolean) {
  if (contents.includes(importLine)) {
    return contents;
  }
  const importPattern = isSwift ? /^import\s+\S+.*$/gm : /^#import\s+.+$/gm;
  let lastImportEnd = -1;
  for (const match of contents.matchAll(importPattern)) {
    lastImportEnd = (match.index ?? 0) + match[0].length;
  }
  if (lastImportEnd < 0) {
    return `${importLine}\n${contents}`;
  }
  return `${contents.slice(0, lastImportEnd)}\n${importLine}${contents.slice(lastImportEnd)}`;
}

/**
 * Makes the AppDelegate hand Zalo's login callback URL to the SDK before anything else sees it.
 * Returns the contents unchanged when the AppDelegate already calls ZDKApplicationDelegate.
 */
export function addZaloOpenURLHandler(
  contents: string,
  language: AppleLanguage
): string {
  if (contents.includes('ZDKApplicationDelegate')) {
    return contents;
  }

  const isSwift = language === 'swift';
  if (!isSwift && language !== 'objc' && language !== 'objcpp') {
    throw new Error(
      `[${pkg.name}] Unsupported AppDelegate language "${language}".`
    );
  }

  const pattern = isSwift ? SWIFT_OPEN_URL : OBJC_OPEN_URL;
  const match = contents.match(pattern);
  if (!match || match.index === undefined) {
    throw new Error(
      `[${pkg.name}] Could not find "application(_:open:options:)" in AppDelegate. ` +
        'Add that method and forward the URL to ZDKApplicationDelegate as described in ' +
        'https://maitrungduc1410.github.io/react-native-zalo-kit/guide/ios#forward-the-callback-url'
    );
  }

  const [header, app, url, options = 'options'] = match;
  const indent = isSwift ? '    ' : '  ';
  const handler = isSwift
    ? `\n${indent}if ZDKApplicationDelegate.sharedInstance().application(${app}, open: ${url}, options: ${options}) {\n${indent}  return true\n${indent}}`
    : `\n${indent}if ([[ZDKApplicationDelegate sharedInstance] application:${app} openURL:${url} options:${options}]) {\n${indent}  return YES;\n${indent}}`;

  const insertAt = match.index + header.length;
  const withHandler =
    contents.slice(0, insertAt) + handler + contents.slice(insertAt);

  return addImport(
    withHandler,
    isSwift ? 'import ZaloSDK' : '#import <ZaloSDK/ZaloSDK.h>',
    isSwift
  );
}

// ---------- Plugin ----------

const withZaloKit: ConfigPlugin<ZaloKitPluginProps> = (config, props) => {
  const appId = normalizeAppId(props);
  const {
    withStringsXml,
    withAndroidManifest,
    withInfoPlist,
    withAppDelegate,
  } = loadConfigPlugins();

  config = withStringsXml(config, (mod) => {
    mod.modResults = setZaloStrings(mod.modResults, appId);
    return mod;
  });
  config = withAndroidManifest(config, (mod) => {
    mod.modResults = setZaloAndroidManifest(mod.modResults, appId);
    return mod;
  });
  config = withInfoPlist(config, (mod) => {
    mod.modResults = setZaloInfoPlist(mod.modResults, appId);
    return mod;
  });
  config = withAppDelegate(config, (mod) => {
    mod.modResults.contents = addZaloOpenURLHandler(
      mod.modResults.contents,
      mod.modResults.language
    );
    return mod;
  });

  return config;
};

export default loadConfigPlugins().createRunOncePlugin(
  withZaloKit,
  pkg.name,
  pkg.version
);
