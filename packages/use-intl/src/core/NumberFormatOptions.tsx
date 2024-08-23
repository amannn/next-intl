import type {Formats} from 'intl-messageformat';

// Use the already bundled version of `NumberFormat` from `@formatjs/ecma402-abstract`
// that comes with `intl-messageformat`
type NumberFormatOptions = Formats['number'][string];

export default NumberFormatOptions;
