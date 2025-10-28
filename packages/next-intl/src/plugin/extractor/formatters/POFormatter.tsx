import type {ExtractedMessage, Locale} from '../types.js';
import POParser from '../utils/POParser.js';
import BaseFormatter from './BaseFormatter.js';

export default class POFormatter extends BaseFormatter {
  public readonly EXTENSION = '.po';

  // Metadata is stored so it can be retained when writing
  private metadataByLocale: Map<Locale, Record<string, string>> = new Map();

  public async read(targetLocale: Locale): Promise<Array<ExtractedMessage>> {
    const content = await this.readCatalogFile(targetLocale);
    const catalog = POParser.parse(content);

    // Store metadata for this locale
    if (catalog.meta) {
      this.metadataByLocale.set(targetLocale, catalog.meta);
    }

    return catalog.messages || [];
  }

  public async write(
    locale: Locale,
    messages: Array<ExtractedMessage>
  ): Promise<void> {
    // Sort messages by id for consistent output
    const sortedMessages = [...messages].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    const content = POParser.serialize({
      meta: this.metadataByLocale.get(locale),
      messages: sortedMessages
    });
    await this.writeCatalogFile(locale, content);
  }
}
