import {NextConfig} from 'next';

function createNextIntlPlugin(
  i18nPath?: string
): (config?: NextConfig) => NextConfig;

export = createNextIntlPlugin;
