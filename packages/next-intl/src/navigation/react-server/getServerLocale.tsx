/**
 * This is only moved to a separate module for easier mocking in
 * `../createNavigation.test.tsx` in order to avoid suspending.
 */
export default async function getServerLocale() {
  // Avoid bundling `next-intl/config` when `createNavigation` is used
  // https://github.com/amannn/next-intl/issues/1669
  const getConfig = (await import('../../server/react-server/getConfig'))
    .default;

  const config = await getConfig();
  return config.locale;
}
