import type {compile} from 'icu-to-json/compiler';

type MessageFormat = ReturnType<typeof compile>;

export default MessageFormat;
