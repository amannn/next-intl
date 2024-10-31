export default interface AppConfig {
  // Locale
  // Formats
  // Messages (todo)
}

export type Locale = AppConfig extends {
  Locale: infer AppLocale;
}
  ? AppLocale
  : string;

export type FormatNames = AppConfig extends {
  Formats: infer AppFormats;
}
  ? {
      dateTime: AppFormats extends {dateTime: infer AppDateTimeFormats}
        ? keyof AppDateTimeFormats
        : string;
      number: AppFormats extends {number: infer AppNumberFormats}
        ? keyof AppNumberFormats
        : string;
      list: AppFormats extends {list: infer AppListFormats}
        ? keyof AppListFormats
        : string;
    }
  : {
      dateTime: string;
      number: string;
      list: string;
    };
