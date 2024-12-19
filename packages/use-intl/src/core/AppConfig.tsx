export default interface AppConfig {
  // Locale
  // Formats
  // Messages
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

export type Messages = AppConfig extends {
  Messages: infer AppMessages;
}
  ? AppMessages
  : Record<string, any>;
