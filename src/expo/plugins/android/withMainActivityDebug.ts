import type { ExpoConfig } from '@expo/config-types';
import { withMainActivity } from '@expo/config-plugins';

const withMainActivityDebug = (config: ExpoConfig) =>
  withMainActivity(config, (mainActivityConfig) => {
    console.log(mainActivityConfig.modResults.contents);
    return mainActivityConfig;
  });

export default withMainActivityDebug;
