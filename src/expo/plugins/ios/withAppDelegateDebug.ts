import { withAppDelegate } from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config-types';

const withZaloAppDelegateDebug = (config: ExpoConfig) =>
  withAppDelegate(config, (appDelegateConfig) => {
    console.log(appDelegateConfig.modResults.contents);
    return appDelegateConfig;
  });

export default withZaloAppDelegateDebug;
