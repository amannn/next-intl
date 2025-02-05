export type PluginConfig = {
  requestConfig?: string;
  experimental?: {
    createMessagesDeclaration?: string | Array<string>;
  };
};
