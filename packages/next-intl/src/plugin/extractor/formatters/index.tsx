import type {MessagesFormat} from '../../types.js';

const formatters = {
  json: () => import('./JSONFormatter.js'),
  po: () => import('./POFormatter.js')
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
} satisfies Record<MessagesFormat, () => typeof import('./Formatter.js')>;

export default formatters;
