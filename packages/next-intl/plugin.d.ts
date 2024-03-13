import {NextConfig} from 'next';

function createNextIntlPlugin(
  i18nPath?: string
): (config?: NextConfig) => NextConfig;

// Currently only available via CJS
export = createNextIntlPlugin;
