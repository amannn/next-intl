import {cache} from 'react';

/**
 * This is only moved to a separate module for easier mocking in
 * `../createNavigation.test.tsx` in order to avoid suspending.
 */
async function getServerLocaleImpl() {
  // Avoid bundling `next-intl/config` when `createNavigation` is used
  // https://github.com/amannn/next-intl/issues/1669
  const getConfig = (await import('../../server/react-server/getConfig'))
    .default;

  const config = await getConfig();
  return config.locale;
}

const getServerLocale = cache(getServerLocaleImpl);
export default getServerLocale;
