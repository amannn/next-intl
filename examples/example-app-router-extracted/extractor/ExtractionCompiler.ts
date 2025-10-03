import CatalogManager, {ExtractorConfig} from './catalog/CatalogManager';
import {ExtractedMessage} from './types';

export default class ExtractionCompiler {
  private manager: CatalogManager;
  private isDevelopment: boolean;
  private initialScanDone: boolean = false;

  constructor(config: ExtractorConfig) {
    this.manager = new CatalogManager(config);

    // We only want to emit messages continuously in development.
    // In production, we can do a single extraction pass.
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  async compile(resourcePath: string, source: string) {
    // Lazy init
    if (!this.initialScanDone) {
      // We can't rely on all files being compiled (e.g. due to persistent
      // caching), so loading the messages initially is necessary.
      await this.manager.loadMessages();

      await this.manager.save();
      this.initialScanDone = true;
    }

    // Get messages before extraction
    const beforeMessages = this.manager.getFileMessages(resourcePath);

    // Extract messages
    const result = await this.manager.extractFileMessages(
      resourcePath,
      source,
      this.isDevelopment ? 'both' : 'transform'
    );
    console.log(`   Extracted ${result.messages.length} message(s)`);

    // Get messages after extraction
    const afterMessages = this.manager.getFileMessages(resourcePath);

    const changed = this.haveMessagesChanged(beforeMessages, afterMessages);

    if (this.isDevelopment && changed) {
      console.log(`   Messages changed`);
      void this.manager.save();
    }

    return result.source;
  }

  haveMessagesChanged(
    messages1: Map<string, ExtractedMessage> | undefined,
    messages2: Map<string, ExtractedMessage> | undefined
  ): boolean {
    // If one exists and the other doesn't, there's a change
    if (!messages1 || !messages2) {
      return messages1 !== messages2;
    }

    // Different sizes means changes
    if (messages1.size !== messages2.size) {
      return true;
    }

    // Check differences in messages1 vs messages2
    for (const [id, msg1] of messages1) {
      const msg2 = messages2.get(id);
      if (!msg2 || msg1.message !== msg2.message) {
        return true; // Early exit on first difference
      }
    }

    return false;
  }
}
