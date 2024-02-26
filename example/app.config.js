const {
  appDelegateContent,
  mainActivityContent,
  mainApplicationContent,
} = require('./zalokitStrings');

module.exports = {
  expo: {
    name: 'my-expo-app',
    slug: 'my-expo-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anonymous.myexpoapp',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.anonymous.myexpoapp',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            extraProguardRules: `
              -keep class com.zing.zalo.**{ *; }
              -keep enum com.zing.zalo.**{ *; }
              -keep interface com.zing.zalo.**{ *; }
            `,
          },
        },
      ],
      ['react-native-zalo-kit/expo/withAppDelegateDebug'],
      ['react-native-zalo-kit/expo/withMainActivityDebug'],
      ['react-native-zalo-kit/expo/withMainApplicationDebug'],
      // [
      //   "react-native-zalo-kit/expo",
      //   {
      //     appId: "2451745039837416278",
      //     appDelegateContent,
      //     mainActivityContent,
      //     mainApplicationContent,
      //   },
      // ],
    ],
  },
};
