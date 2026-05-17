import type {ExtractorConfigInput} from 'intl-extractor';

export interface PluginConfig {
  /**
   * Configuration for build-time message extraction and runtime catalog
   * loading. Mirrors `next-intl`'s `createNextIntlPlugin` shape so that
   * configs can be copied directly between Next.js and Expo projects.
   */
  experimental?: {
    /**
     * Relative path(s) to your source code files. Defaults to `./src`.
     * Pass an array to include workspace packages, e.g.
     * `['./src', '../shared-ui/src']`.
     */
    srcPath?: string | Array<string>;

    /** Configuration about your catalogs of messages. */
    messages?: ExtractorConfigInput['messages'] & {
      /**
       * When enabled, ICU messages are precompiled at build time, resulting
       * in smaller bundles and faster message formatting at runtime.
       */
      precompile?: boolean;
    };

    /**
     * Enables the usage of [`useExtracted`](https://next-intl.dev/docs/usage/extraction).
     */
    extract?: ExtractorConfigInput['extract'];
  };
}

/**
 * The subset of the Metro config that we read and mutate. We intentionally
 * type this loosely so users do not need to install `metro-config` types
 * just to consume `withExpoIntl`.
 */
export type MetroConfig = {
  transformer?: {
    babelTransformerPath?: string;
    [key: string]: unknown;
  };
  resolver?: {
    sourceExts?: Array<string>;
    nodeModulesPaths?: Array<string>;
    resolveRequest?: unknown;
    [key: string]: unknown;
  };
  watchFolders?: Array<string>;
  [key: string]: unknown;
};

/**
 * Serialized plugin state forwarded to Metro worker processes via env vars.
 * Workers cannot read closures from the host process, so the transformer
 * reconstitutes its config from this payload on first call.
 */
export interface SerializedTransformerOptions {
  readonly extract: boolean;
  readonly precompile: boolean;
  readonly format: string;
  readonly customFormat?: {
    readonly codec: string;
    readonly extension: string;
  };
  readonly messagesPaths: ReadonlyArray<string>;
  readonly extension: string;
  readonly projectRoot: string;
  readonly isDevelopment: boolean;
}
