import type {compile} from 'icu-to-json/compiler';

type MessageFormat = Omit<
  ReturnType<typeof compile>,
  // TODO: Do we need the args?
  'args'
>;

export default MessageFormat;
