import {NextConfig} from 'next';

function withNextIntl(i18nPath?: string): (config?: NextConfig) => NextConfig;

// Currently only available via CJS
export = withNextIntl;
