'use strict';
Object.defineProperty(exports, '__esModule', { value: true });

exports.getZaloAppId =
  exports.getZaloScheme =
  exports.getMergePropsWithConfig =
    void 0;
function getMergePropsWithConfig(config, props) {
  const { ZaloAppId, ZaloScheme } = config;
  const {
    appID = ZaloAppId,
    scheme = ZaloScheme !== null && ZaloScheme !== void 0
      ? ZaloScheme
      : appID
      ? `zalo-${appID}`
      : undefined,
  } = props !== null && props !== void 0 ? props : {};
  return {
    appID,
    scheme,
  };
}
exports.getMergePropsWithConfig = getMergePropsWithConfig;

function getZaloAppId(config) {
  var _a;
  return (_a = config.appID) !== null && _a !== void 0 ? _a : null;
}
exports.getZaloAppId = getZaloAppId;

function getZaloScheme(config) {
  var _a;
  return (_a = config.scheme) !== null && _a !== void 0 ? _a : null;
}
exports.getZaloScheme = getZaloScheme;
