import type {ExtractorConfig} from './extractor/types.js';

export type PluginConfig = {
  requestConfig?: string;
  experimental?: {
    /** A path to the messages file that you'd like to create a declaration for. In case you want to consider multiple files, you can pass an array of paths. */
    createMessagesDeclaration?: string | Array<string>;

    extractor?: ExtractorConfig;
  };
};
