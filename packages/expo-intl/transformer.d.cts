declare const transformer: {
  transform(input: {
    src: string;
    filename: string;
    options: Record<string, unknown>;
  }): Promise<{
    ast?: unknown;
    code?: string;
    map?: unknown;
  }>;
};
export = transformer;
