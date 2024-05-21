import useLocale from '../../react-client/useLocale';
import {LocalePrefix, ParametersExceptFirst} from '../../shared/types';
import basePermanentRedirect from '../shared/basePermanentRedirect';

export default function clientPermanentRedirect(
  params: {localePrefix?: LocalePrefix; pathname: string},
  ...args: ParametersExceptFirst<typeof basePermanentRedirect>
) {
  let locale;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Reading from context here is fine, since `redirect` should be called during render
    locale = useLocale();
  } catch (e) {
    throw new Error(
      process.env.NODE_ENV !== 'production'
        ? '`permanentRedirect()` can only be called during render. To redirect in an event handler or similar, you can use `useRouter()` instead.'
        : undefined
    );
  }

  return basePermanentRedirect({...params, locale}, ...args);
}
