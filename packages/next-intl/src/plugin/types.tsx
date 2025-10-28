export type MessagesFormat = 'json' | 'po';

export type PluginConfig = {
  requestConfig?: string;
  experimental?: {
    /** A path to the messages file that you'd like to create a declaration for. In case you want to consider multiple files, you can pass an array of paths. */
    createMessagesDeclaration?: string | Array<string>;

    /** Relative path(s) to your source files, to be used in combination with `extractor` and `messages`. */
    srcPath?: string | Array<string>;

    /** Configuration about your catalogs of messages, to be used in combination with `src` and `extractor`. */
    messages?: {
      /** Relative path to the directory containing your messages. */
      path: string;
      /** Defines the format for how your messages are stored. */
      format: MessagesFormat;
    };

    /** Enables the usage of `useExtracted`, to be used in combination with `src` and `messages`. */
    extract?: {
      sourceLocale: string;
    };
  };
};
