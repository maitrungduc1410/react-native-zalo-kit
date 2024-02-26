import { withPlugins } from '@expo/config-plugins';
import withAndroid from './android/withAndroid';
import withIOS from './ios/withIOS';
import type { ExpoConfig } from '@expo/config-types';

const withZaloKit = (
  config: ExpoConfig,
  {
    appId,
    appDelegateContent,
    mainActivityContent,
    mainApplicationContent,
  }: Record<string, string>
) =>
  withPlugins(config, [
    [
      withAndroid,
      {
        appId,
        mainActivityContent,
        mainApplicationContent,
      },
    ],
    [
      withIOS,
      {
        appId,
        appDelegateContent,
      },
    ],
  ]);

export default withZaloKit;
