import type {LoaderContext} from 'webpack';
import type {MessagesFormat} from '../extractor/types.js';

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
      /** Either automatically infer the locales based on catalog files in `path` or explicitly define them. */
      locales: 'infer' | Array<string>;
    };

    /** Enables the usage of `useExtracted`, to be used in combination with `src` and `messages`. */
    extract?: {
      sourceLocale: string;
    };
  };
};

// Only a subset of the LoaderContext is available in Turbopack
export type TurbopackLoaderContext<Options> = Pick<
  LoaderContext<Options>,
  | 'rootContext'
  | 'sourceMap'
  | 'getOptions'
  | 'getResolve'
  | 'emitWarning'
  | 'emitError'
  | 'getLogger'
  | 'context'
  | 'loaderIndex'
  | 'loaders'
  | 'resourcePath'
  | 'resourceQuery'
  | 'resourceFragment'
  | 'async'
  | 'callback'
  | 'cacheable'
  | 'addDependency'
  | 'dependency'
  | 'addContextDependency'
  | 'addMissingDependency'
  | 'getDependencies'
  | 'getContextDependencies'
  | 'getMissingDependencies'
  | 'clearDependencies'
  | 'resource'
  | 'request'
  | 'remainingRequest'
  | 'currentRequest'
  | 'previousRequest'
  | 'query'
  | 'data'
>;
