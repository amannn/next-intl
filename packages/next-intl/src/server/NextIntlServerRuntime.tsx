import {NextIntlRuntimeConfig} from './NextIntlConfig';

const SEPARATOR = '&';

export default class NextIntlServerRuntime {
  public static serialize(config: NextIntlRuntimeConfig) {
    return [config.locale, config.now?.getTime(), config.timeZone].join(
      SEPARATOR
    );
  }

  public static deserialize(value: string) {
    const [locale, nowTimestampString, timeZone] = value.split(SEPARATOR);
    return {locale, now: new Date(parseInt(nowTimestampString)), timeZone};
  }
}
