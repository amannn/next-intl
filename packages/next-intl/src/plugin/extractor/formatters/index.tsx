import type {MessagesFormat} from '../../types.js';
import type Formatter from './Formatter.js';

const formatters = {
  json: () => import('./JSONFormatter.js'),
  po: () => import('./POFormatter.js')
} satisfies Record<
  MessagesFormat,
  () => Promise<{default: new () => Formatter}>
>;

export default formatters;
