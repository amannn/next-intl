declare module '@expo/metro-config/babel-transformer' {
  export function transform(input: {
    readonly src: string;
    readonly filename: string;
    readonly options: Record<string, unknown>;
  }): Promise<{
    readonly ast?: unknown;
    readonly code?: string;
    readonly map?: unknown;
  }>;
}
