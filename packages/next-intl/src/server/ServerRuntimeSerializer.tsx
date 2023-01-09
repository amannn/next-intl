import {NextIntlRuntimeConfig} from './NextIntlConfig';

const SEPARATOR = '&';

export default class ServerRuntimeSerializer {
  public static serialize(config: NextIntlRuntimeConfig) {
    return [config.locale, config.now?.getTime(), config.timeZone].join(
      SEPARATOR
    );
  }

  public static deserialize(value: string) {
    const [locale, nowTimestampString, timeZoneValue] = value.split(SEPARATOR);
    return {
      locale,
      // Can be an empty string
      now: nowTimestampString
        ? new Date(parseInt(nowTimestampString))
        : undefined,
      // Can be an empty string
      timeZone: timeZoneValue || undefined
    };
  }
}
