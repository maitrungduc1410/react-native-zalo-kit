import { withMainApplication } from '@expo/config-plugins';
import type { ExpoConfig } from '@expo/config-types';

const withMainApplicationDebug = (config: ExpoConfig) =>
  withMainApplication(config, (mainApplicationConfig) => {
    console.log(mainApplicationConfig.modResults.contents);
    return mainApplicationConfig;
  });

export default withMainApplicationDebug;
