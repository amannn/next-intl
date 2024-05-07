type RelativeTimeFormatOptions = {
  now?: number | Date;
  unit?: Intl.RelativeTimeFormatUnit;
  numberingSystem?: string;
  style?: Intl.RelativeTimeFormatStyle;
  // We don't support the `numeric` property by design (see https://github.com/amannn/next-intl/pull/765)
};

export default RelativeTimeFormatOptions;
