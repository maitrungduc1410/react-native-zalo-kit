const {
  createRunOncePlugin,
  withAppBuildGradle,
} = require('@expo/config-plugins');
const pkg = require('react-native-zalo-kit/package.json');

const withProguardRules = expoConfig => {
  // return (0, config_plugins_1.withStringsXml)(config, config => {
  //   config.modResults = applyZaloAppIdString(props, config.modResults);
  //   return config;
  // });
  return withAppBuildGradle(expoConfig, config => {
    config.modResults.contents = addProguardRules(config.modResults.contents);
    return config;
  });
};

function addProguardRules(buildGradleContent) {
  const RE_EXISTS = /zalo-proguard-rules\.pro/g;
  if (RE_EXISTS.test(buildGradleContent)) {
    return buildGradleContent;
  }

  const RE_ENTRY =
    /proguardFiles getDefaultProguardFile\("proguard-android.txt"\),\s?"proguard-rules.pro"/;

  if (!RE_ENTRY.test(buildGradleContent)) {
    throw new Error(
      'Cannot add to maven gradle because the proguard regex could not find the entrypoint row',
    );
  }

  // console.log('run', buildGradleContent);

  return buildGradleContent.replace(
    RE_ENTRY,
    `proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            // Project-specific additions to proguard
            def myProguardRulesPath = new File(["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootDir).text.trim(), "../plugins/zaloSdk/zalo-proguard-rules.pro")
            proguardFile(myProguardRulesPath)
            
            `,
  );
}

module.exports = createRunOncePlugin(
  withProguardRules,
  `${pkg.name}-withProguardRules`,
  pkg.version,
);
