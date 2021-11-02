type NumberFormatOptions = Intl.NumberFormatOptions & {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
};

export default NumberFormatOptions;
