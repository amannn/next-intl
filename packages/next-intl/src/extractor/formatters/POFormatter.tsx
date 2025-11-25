import POParser from 'po-parser';
import type {ExtractedMessage, Locale} from '../types.js';
import {setNestedProperty} from '../utils.js';
import Formatter, {type FormatterContext} from './Formatter.js';
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
    context: FormatterContext
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
    context: FormatterContext
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

  public toJSONString(source: string, context: FormatterContext) {
    const parsed = this.parse(source, context);

    const messagesObject: Record<string, string> = {};
    for (const message of parsed) {
      setNestedProperty(messagesObject, message.id, message.message);
    }

    return JSON.stringify(messagesObject, null, 2);
  }
}
