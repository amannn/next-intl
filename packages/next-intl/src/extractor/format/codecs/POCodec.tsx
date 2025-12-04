/* eslint-disable import/no-duplicates */
import POParser from 'po-parser';
import type {ExtractorMessage, Locale} from '../../types.js';
import {setNestedProperty} from '../../utils.js';
import type ExtractorCodec from '../ExtractorCodec.js';
import type {ExtractorCodecContext} from '../ExtractorCodec.js';
import {getSortedMessages} from '../utils.js';

export default class POCodec implements ExtractorCodec {
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

  // Metadata is stored so it can be retained when writing
  private metadataByLocale: Map<Locale, Record<string, string>> = new Map();

  public decode(
    content: string,
    context: ExtractorCodecContext
  ): Array<ExtractorMessage> {
    const catalog = POParser.parse(content);

    // Store metadata for this locale
    if (catalog.meta) {
      this.metadataByLocale.set(context.locale, catalog.meta);
    }

    return catalog.messages || [];
  }

  public encode(
    messages: Array<ExtractorMessage>,
    context: ExtractorCodecContext
  ): string {
    const meta = {
      Language: context.locale,
      ...POCodec.DEFAULT_METADATA,
      ...this.metadataByLocale.get(context.locale)
    };

    return POParser.serialize({
      meta,
      messages: getSortedMessages(messages)
    });
  }

  public toJSONString(source: string, context: ExtractorCodecContext) {
    const parsed = this.decode(source, context);

    const messagesObject: Record<string, string> = {};
    for (const message of parsed) {
      setNestedProperty(messagesObject, message.id, message.message);
    }

    return JSON.stringify(messagesObject, null, 2);
  }
}
