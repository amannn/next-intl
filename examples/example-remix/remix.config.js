/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
export default {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildDirectory: 'build',
  devServerPort: 8002,
  ignoredRouteFiles: ['.*'],
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true
  }
};
