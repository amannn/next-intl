export type PluginConfig = {
  requestConfig?: string;
  experimental?: {
    createMessagesDeclarations?: Array<string>;
  };
};
