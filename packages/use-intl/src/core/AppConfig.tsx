export default interface AppConfig {
  // Locale
  // Formats (todo)
  // Messages (todo)
}

export type Locale = AppConfig extends {
  Locale: infer UserLocale;
}
  ? UserLocale
  : string;
