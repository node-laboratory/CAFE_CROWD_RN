/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
// react-native-webview는 AIT(@granite-js/native)가 이미 native 측에 등록하므로,
// 직접 autolinking 되지 않도록 막는다. JS 측은 그대로 사용 가능.
module.exports = {
  reactNativePath: require('path').dirname(require.resolve('react-native/package.json')),
  dependencies: {
    'react-native-webview': {
      platforms: {
        ios: null,
        android: null,
      },
    },
  },
};
