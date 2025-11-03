import type {ExtractedMessage, Locale} from '../types.js';
import POParser from '../utils/POParser.js';
import Formatter from './Formatter.js';
import {getSortedMessages} from './utils.js';

export default class POFormatter extends Formatter {
  // See also https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html
  private static readonly DEFAULT_METADATA = {
    // Recommended by spec
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Transfer-Encoding': '8bit',

    // Otherwise other tools might set this
    'X-Generator': 'next-intl',

    // Crowdin defaults to using msgid as source key
    'X-Crowdin-SourceKey': 'msgstr'
  };

  public readonly EXTENSION = '.po';

  // Metadata is stored so it can be retained when writing
  private metadataByLocale: Map<Locale, Record<string, string>> = new Map();

  public parse(
    content: string,
    context: {locale: Locale}
  ): Array<ExtractedMessage> {
    const catalog = POParser.parse(content);

    // Store metadata for this locale
    if (catalog.meta) {
      this.metadataByLocale.set(context.locale, catalog.meta);
    }

    return catalog.messages || [];
  }

  public serialize(
    messages: Array<ExtractedMessage>,
    context: {locale: Locale}
  ): string {
    const meta = {
      Language: context.locale,
      ...POFormatter.DEFAULT_METADATA,
      ...this.metadataByLocale.get(context.locale)
    };

    return POParser.serialize({
      meta,
      messages: getSortedMessages(messages)
    });
  }
}
