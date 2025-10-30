import type {ExtractedMessage} from '../types.js';

type Catalog = {
  meta?: Record<string, string>;
  messages?: Array<ExtractedMessage>;
};

type State = 'entry' | 'meta';

type Entry = {
  msgctxt?: string;
  msgid?: string;
  msgstr?: string;
  references?: Array<{path: string}>;
  description?: string;
};

export default class POParser {
  private static readonly KEYWORDS = {
    MSGID: 'msgid',
    MSGSTR: 'msgstr',
    MSGCTXT: 'msgctxt',
    MSGID_PLURAL: 'msgid_plural'
  } as const;

  private static readonly COMMENTS = {
    REFERENCE: '#:',
    EXTRACTED: '#.',
    TRANSLATOR: '#',
    FLAG: '#,',
    PREVIOUS: '#|'
  } as const;

  private static readonly NAMESPACE_SEPARATOR = '.';
  private static readonly QUOTE = '"';
  private static readonly NEWLINE = '\\n';
  private static readonly FILE_COLUMN_SEPARATOR = ':';
  private static readonly META_SEPARATOR = ':';

  static parse(content: string): Catalog {
    const lines = POParser.splitLines(content);
    const messages: Array<ExtractedMessage> = [];
    const meta: Record<string, string> = {};

    let state: State = 'entry';
    let entry: Entry | undefined;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // An empty line indicates the end of an entry
      if (!line) {
        if (state === 'entry' && entry) {
          messages.push(POParser.finishEntry(entry));
          entry = undefined;
        }
        state = 'entry';
        continue;
      }

      if (state === 'meta') {
        if (line.startsWith(POParser.QUOTE)) {
          const metaLine = POParser.extractQuotedString(line, state);
          const cleaned = metaLine.endsWith(POParser.NEWLINE)
            ? metaLine.slice(0, -2)
            : metaLine;

          const separatorIndex = cleaned.indexOf(POParser.META_SEPARATOR);
          if (separatorIndex > 0) {
            const key = cleaned.substring(0, separatorIndex).trim();
            const value = cleaned.substring(separatorIndex + 1).trim();
            meta[key] = value;
          }
        } else {
          POParser.throwWithLine(
            'Encountered unexpected non-quoted metadata line',
            line
          );
        }
      } else {
        // Unsupported comment types
        if (POParser.lineStartsWithPrefix(line, POParser.COMMENTS.TRANSLATOR)) {
          POParser.throwWithLine(
            'Translator comments (#) are not supported, use inline descriptions instead',
            line
          );
        }
        if (POParser.lineStartsWithPrefix(line, POParser.COMMENTS.FLAG)) {
          POParser.throwWithLine('Flag comments (#,) are not supported', line);
        }
        if (POParser.lineStartsWithPrefix(line, POParser.COMMENTS.PREVIOUS)) {
          POParser.throwWithLine(
            'Previous string key comments (#|) are not supported',
            line
          );
        }

        // Reference comments
        if (POParser.lineStartsWithPrefix(line, POParser.COMMENTS.REFERENCE)) {
          entry = POParser.ensureEntry(entry);
          // Only use the path part, ignore line and column numbers
          const path = line
            .substring(POParser.COMMENTS.REFERENCE.length)
            .trim()
            .split(POParser.FILE_COLUMN_SEPARATOR)
            .at(0)!;
          entry.references ??= [];
          entry.references.push({path});
          continue;
        }

        // Extracted comments
        if (POParser.lineStartsWithPrefix(line, POParser.COMMENTS.EXTRACTED)) {
          entry = POParser.ensureEntry(entry);
          entry.description = line
            .substring(POParser.COMMENTS.EXTRACTED.length)
            .trim();
          continue;
        }

        // Check for unsupported features
        if (
          POParser.lineStartsWithPrefix(line, POParser.KEYWORDS.MSGID_PLURAL)
        ) {
          POParser.throwWithLine(
            'Plural forms (msgid_plural) are not supported, use ICU pluralization instead',
            line
          );
        }

        // msgctxt
        if (POParser.lineStartsWithPrefix(line, POParser.KEYWORDS.MSGCTXT)) {
          entry = POParser.ensureEntry(entry);
          entry.msgctxt = POParser.extractQuotedString(
            line.substring(POParser.KEYWORDS.MSGCTXT.length + 1),
            state
          );
          continue;
        }

        // msgid
        if (POParser.lineStartsWithPrefix(line, POParser.KEYWORDS.MSGID)) {
          entry = POParser.ensureEntry(entry);
          entry.msgid = POParser.extractQuotedString(
            line.substring(POParser.KEYWORDS.MSGID.length + 1),
            state
          );
          continue;
        }

        // msgstr
        if (POParser.lineStartsWithPrefix(line, POParser.KEYWORDS.MSGSTR)) {
          entry = POParser.ensureEntry(entry);
          entry.msgstr = POParser.extractQuotedString(
            line.substring(POParser.KEYWORDS.MSGSTR.length + 1),
            state
          );

          // Switch to meta mode if this is the first entry with empty msgid
          if (messages.length === 0 && entry.msgid === '') {
            state = 'meta';
            entry = undefined;
          }
          continue;
        }

        // Multi-line strings are not supported in entry mode
        if (line.startsWith(POParser.QUOTE)) {
          POParser.throwWithLine(
            'Multi-line strings are not supported, use single-line strings instead',
            line
          );
        }
      }
    }

    // Finish any remaining entry
    if (state === 'entry' && entry) {
      messages.push(POParser.finishEntry(entry));
    }

    return {
      meta: Object.keys(meta).length > 0 ? meta : undefined,
      messages: messages.length > 0 ? messages : undefined
    };
  }

  static serialize(catalog: Catalog): string {
    const lines: Array<string> = [];

    // Metadata
    if (catalog.meta) {
      lines.push(
        `${POParser.KEYWORDS.MSGID} ${POParser.QUOTE}${POParser.QUOTE}`
      );
      lines.push(
        `${POParser.KEYWORDS.MSGSTR} ${POParser.QUOTE}${POParser.QUOTE}`
      );
      for (const [key, value] of Object.entries(catalog.meta)) {
        lines.push(
          `${POParser.QUOTE}${key}${POParser.META_SEPARATOR} ${value}${POParser.NEWLINE}${POParser.QUOTE}`
        );
      }
      lines.push('');
    }

    // Messages
    if (catalog.messages) {
      for (const message of catalog.messages) {
        if (message.references && message.references.length > 0) {
          for (const ref of message.references) {
            lines.push(`${POParser.COMMENTS.REFERENCE} ${ref.path}`);
          }
        }

        if (message.description) {
          lines.push(`${POParser.COMMENTS.EXTRACTED} ${message.description}`);
        }

        let msgctxt: string | undefined;
        let msgid: string;

        const lastDotIndex = message.id.lastIndexOf(
          POParser.NAMESPACE_SEPARATOR
        );
        if (lastDotIndex > 0) {
          msgctxt = message.id.substring(0, lastDotIndex);
          msgid = message.id.substring(lastDotIndex + 1);
        } else {
          msgid = message.id;
        }

        if (msgctxt) {
          lines.push(
            `${POParser.KEYWORDS.MSGCTXT} ${POParser.QUOTE}${msgctxt}${POParser.QUOTE}`
          );
        }

        lines.push(
          `${POParser.KEYWORDS.MSGID} ${POParser.QUOTE}${msgid}${POParser.QUOTE}`
        );
        lines.push(
          `${POParser.KEYWORDS.MSGSTR} ${POParser.QUOTE}${message.message}${POParser.QUOTE}`
        );
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private static lineStartsWithPrefix(line: string, prefix: string) {
    return line.startsWith(prefix + ' ');
  }

  private static throwWithLine(message: string, line: string): never {
    throw new Error(`${message}:\n> ${line}`);
  }

  private static splitLines(content: string): Array<string> {
    // Avoid overhead for Unix newlines only
    if (content.includes('\r')) {
      content = content.replace(/\r\n/g, '\n');
    }

    return content.split('\n');
  }

  private static ensureEntry(entry: Entry | undefined): Entry {
    return entry || {};
  }

  private static finishEntry(entry: Entry): ExtractedMessage {
    if (entry.msgid == null || entry.msgstr == null) {
      throw new Error(
        'Incomplete message entry: both msgid and msgstr are required'
      );
    }

    let fullId = entry.msgid;
    if (entry.msgctxt) {
      fullId = entry.msgctxt + POParser.NAMESPACE_SEPARATOR + entry.msgid;
    }

    return {
      id: fullId,
      message: entry.msgstr,
      description: entry.description,
      references: entry.references
    };
  }

  private static extractQuotedString(line: string, state?: State): string {
    const trimmed = line.trim();
    const endIndex = trimmed.indexOf(POParser.QUOTE, POParser.QUOTE.length);

    if (endIndex === -1) {
      if (state === 'meta') {
        return trimmed.substring(POParser.QUOTE.length);
      }
      POParser.throwWithLine('Incomplete quoted string', line);
    }

    return trimmed.substring(POParser.QUOTE.length, endIndex);
  }
}
