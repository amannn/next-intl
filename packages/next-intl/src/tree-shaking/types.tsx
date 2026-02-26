export type ManifestNamespaceMap = Record<string, true | Record<string, true>>;

export type ManifestNamespaces = true | ManifestNamespaceMap;
