import { AndroidConfig } from '@expo/config-plugins';
import {
  addZaloOpenURLHandler,
  normalizeAppId,
  setZaloAndroidManifest,
  setZaloInfoPlist,
  setZaloStrings,
} from '../index';

const SWIFT_APP_DELEGATE = `import Expo
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }
}
`;

const OBJC_APP_DELEGATE = `#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

@end
`;

function emptyManifest(): AndroidConfig.Manifest.AndroidManifest {
  return {
    manifest: {
      $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
      queries: [],
      application: [
        {
          $: { 'android:name': '.MainApplication' },
          activity: [{ $: { 'android:name': '.MainActivity' } }],
        },
      ],
    },
  };
}

describe('normalizeAppId', () => {
  it('accepts numeric strings and numbers', () => {
    expect(normalizeAppId({ appId: ' 123 ' })).toBe('123');
    expect(normalizeAppId({ appId: 456 })).toBe('456');
  });

  it('rejects numbers that lost precision', () => {
    expect(() => normalizeAppId({ appId: 2451745039837416278 })).toThrow(
      /must be a string/
    );
  });

  it('rejects missing or non numeric ids', () => {
    expect(() => normalizeAppId(undefined)).toThrow(/appId/);
    expect(() => normalizeAppId({ appId: 'abc' })).toThrow(/appId/);
  });
});

describe('android', () => {
  it('adds the app id string resource', () => {
    const strings = setZaloStrings({ resources: {} }, '123');
    expect(strings.resources.string).toEqual([
      { $: { name: 'zalokit_app_id', translatable: 'false' }, _: '123' },
    ]);
  });

  it('adds meta-data and BrowserLoginActivity once', () => {
    let manifest = setZaloAndroidManifest(emptyManifest(), '123');
    manifest = setZaloAndroidManifest(manifest, '123');
    const app = manifest.manifest.application![0]!;

    expect(app['meta-data']).toEqual([
      {
        $: {
          'android:name': 'com.zing.zalo.zalosdk.appID',
          'android:value': '@string/zalokit_app_id',
        },
      },
    ]);
    const browserActivities = app.activity!.filter(
      (a) =>
        a.$['android:name'] ===
        'com.zing.zalo.zalosdk.oauth.BrowserLoginActivity'
    );
    expect(browserActivities).toHaveLength(1);
    expect(
      browserActivities[0]!['intent-filter']![0]!.data![0]!.$['android:scheme']
    ).toBe('zalo-123');
  });

  it('updates the callback scheme when the app id changes', () => {
    const manifest = setZaloAndroidManifest(
      setZaloAndroidManifest(emptyManifest(), '123'),
      '999'
    );
    const schemes = manifest.manifest
      .application![0]!.activity!.flatMap((a) => a['intent-filter'] ?? [])
      .flatMap((f) => f.data ?? [])
      .map((d) => d.$['android:scheme']);
    expect(schemes).toEqual(['zalo-999']);
  });
});

describe('ios Info.plist', () => {
  it('adds app id, query schemes and url type without touching other url types', () => {
    const plist = setZaloInfoPlist(
      {
        LSApplicationQueriesSchemes: ['fb'],
        CFBundleURLTypes: [{ CFBundleURLSchemes: ['myapp'] }],
      },
      '123'
    );
    expect(plist.ZaloAppID).toBe('123');
    expect(plist.LSApplicationQueriesSchemes).toEqual([
      'fb',
      'zalosdk',
      'zaloshareext',
    ]);
    expect(plist.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: ['myapp'] },
      { CFBundleURLName: 'zalo', CFBundleURLSchemes: ['zalo-123'] },
    ]);
  });

  it('is idempotent and replaces a stale zalo scheme', () => {
    const once = setZaloInfoPlist({}, '123');
    const twice = setZaloInfoPlist(once, '123');
    expect(twice.CFBundleURLTypes).toHaveLength(1);
    expect(twice.LSApplicationQueriesSchemes).toHaveLength(2);

    const changed = setZaloInfoPlist(twice, '999');
    expect(changed.CFBundleURLTypes).toEqual([
      { CFBundleURLName: 'zalo', CFBundleURLSchemes: ['zalo-999'] },
    ]);
  });
});

describe('ios AppDelegate', () => {
  it('forwards openURL in the Swift template', () => {
    const result = addZaloOpenURLHandler(SWIFT_APP_DELEGATE, 'swift');
    expect(result).toContain(
      'import ReactAppDependencyProvider\nimport ZaloSDK'
    );
    expect(result).toContain(
      ') -> Bool {\n    if ZDKApplicationDelegate.sharedInstance().application(app, open: url, options: options) {\n      return true\n    }\n    return super.application'
    );
    expect(addZaloOpenURLHandler(result, 'swift')).toBe(result);
  });

  it('forwards openURL in the Objective-C template', () => {
    const result = addZaloOpenURLHandler(OBJC_APP_DELEGATE, 'objcpp');
    expect(result).toContain(
      '#import <React/RCTLinkingManager.h>\n#import <ZaloSDK/ZaloSDK.h>'
    );
    expect(result).toContain(
      'options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {\n  if ([[ZDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {\n    return YES;\n  }\n  return [super'
    );
    expect(addZaloOpenURLHandler(result, 'objcpp')).toBe(result);
  });

  it('throws a helpful error when openURL is missing', () => {
    expect(() =>
      addZaloOpenURLHandler('import Expo\nclass AppDelegate {}', 'swift')
    ).toThrow(/application\(_:open:options:\)/);
  });
});
