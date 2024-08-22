import en from '../messages/en.json';
import de from '../messages/de.json';
import es from '../messages/es.json';
import ja from '../messages/ja.json';

const messagesByLocale: Record<string, any> = {en, de, es, ja};

const nextIntl = {
  defaultLocale: 'en',
  messagesByLocale
};

export default nextIntl;
