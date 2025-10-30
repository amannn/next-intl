import type {ExtractedMessage, Locale} from '../types.js';
import POParser from '../utils/POParser.js';
import Formatter from './Formatter.js';

export default class POFormatter extends Formatter {
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
    // Sort messages by id for consistent output
    const sortedMessages = [...messages].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    return POParser.serialize({
      meta: this.metadataByLocale.get(context.locale),
      messages: sortedMessages
    });
  }
}
